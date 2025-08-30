const express = require('express');
const prisma = require('../database/prisma');
const { auth } = require('../middleware/auth');
const { dynamicRateLimit } = require('../middleware/rateLimit');
const { validate, validateParams, validateQuery } = require('../middleware/validation');
const Joi = require('joi');

const router = express.Router();

// @route   GET /api/analytics/overview
// @desc    Get dashboard overview statistics
// @access  Private
router.get('/overview', auth, dynamicRateLimit, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total QR codes
    const totalQRCodes = await prisma.qRCode.count({
      where: { userId }
    });

    // Get active QR codes
    const activeQRCodes = await prisma.qRCode.count({
      where: { 
        userId,
        isActive: true
      }
    });

    // Get total scans
    const totalScans = await prisma.scan.count({
      where: {
        qrCode: {
          userId
        }
      }
    });

    // Get unique users (based on IP addresses)
    const uniqueUsers = await prisma.scan.groupBy({
      by: ['ipAddress'],
      where: {
        qrCode: {
          userId
        },
        ipAddress: {
          not: null
        }
      }
    });

    // Get today's scans
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayScans = await prisma.scan.count({
      where: {
        qrCode: {
          userId
        },
        scannedAt: {
          gte: today
        }
      }
    });

    // Get this week's scans
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekScans = await prisma.scan.count({
      where: {
        qrCode: {
          userId
        },
        scannedAt: {
          gte: weekAgo
        }
      }
    });

    // Get this month's scans
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const monthScans = await prisma.scan.count({
      where: {
        qrCode: {
          userId
        },
        scannedAt: {
          gte: monthAgo
        }
      }
    });

    // Calculate growth percentages
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 14);
    const previousWeekScans = await prisma.scan.count({
      where: {
        qrCode: {
          userId
        },
        scannedAt: {
          gte: lastWeek,
          lt: weekAgo
        }
      }
    });

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 2);
    const previousMonthScans = await prisma.scan.count({
      where: {
        qrCode: {
          userId
        },
        scannedAt: {
          gte: lastMonth,
          lt: monthAgo
        }
      }
    });

    const weekGrowth = previousWeekScans > 0 
      ? ((weekScans - previousWeekScans) / previousWeekScans * 100).toFixed(1)
      : 0;

    const monthGrowth = previousMonthScans > 0
      ? ((monthScans - previousMonthScans) / previousMonthScans * 100).toFixed(1)
      : 0;

    // Get top performing QR code
    const topQRCode = await prisma.qRCode.findFirst({
      where: { userId },
      include: {
        _count: {
          select: {
            scans: true
          }
        }
      },
      orderBy: {
        scans: {
          _count: 'desc'
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalQRCodes,
        activeQRCodes,
        totalScans,
        uniqueUsers: uniqueUsers.length,
        todayScans,
        weekScans,
        monthScans,
        weekGrowth: parseFloat(weekGrowth),
        monthGrowth: parseFloat(monthGrowth),
        topQRCode: topQRCode ? {
          id: topQRCode.id,
          name: topQRCode.name,
          scanCount: topQRCode._count.scans
        } : null,
        averageConversionRate: totalQRCodes > 0 ? (totalScans / totalQRCodes).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({
      error: 'Server error while fetching analytics overview'
    });
  }
});

// @route   GET /api/analytics/qr/:id/stats
// @desc    Get statistics for a specific QR code
// @access  Private
router.get('/qr/:id/stats', auth, validateParams(Joi.object({ id: Joi.string().required() })), validateQuery(Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  groupBy: Joi.string().valid('day', 'week', 'month').default('day')
})), async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, groupBy } = req.query;

    // Verify QR code belongs to user
    const qrCode = await prisma.qRCode.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!qrCode) {
      return res.status(404).json({
        error: 'QR code not found'
      });
    }

    // Build date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Get scan statistics
    const totalScans = await prisma.scan.count({
      where: {
        qrId: id,
        ...(Object.keys(dateFilter).length > 0 && { scannedAt: dateFilter })
      }
    });

    // Get unique users
    const uniqueUsers = await prisma.scan.groupBy({
      by: ['ipAddress'],
      where: {
        qrId: id,
        ipAddress: {
          not: null
        },
        ...(Object.keys(dateFilter).length > 0 && { scannedAt: dateFilter })
      }
    });

    // Get device breakdown
    const deviceBreakdown = await prisma.scan.groupBy({
      by: ['deviceType'],
      where: {
        qrId: id,
        deviceType: {
          not: null
        },
        ...(Object.keys(dateFilter).length > 0 && { scannedAt: dateFilter })
      },
      _count: {
        deviceType: true
      }
    });

    // Get browser breakdown
    const browserBreakdown = await prisma.scan.groupBy({
      by: ['browser'],
      where: {
        qrId: id,
        browser: {
          not: null
        },
        ...(Object.keys(dateFilter).length > 0 && { scannedAt: dateFilter })
      },
      _count: {
        browser: true
      }
    });

    // Get geographic breakdown
    const geographicBreakdown = await prisma.scan.groupBy({
      by: ['country'],
      where: {
        qrId: id,
        country: {
          not: null
        },
        ...(Object.keys(dateFilter).length > 0 && { scannedAt: dateFilter })
      },
      _count: {
        country: true
      }
    });

    // Get time series data
    const timeSeriesData = await prisma.scan.groupBy({
      by: ['scannedAt'],
      where: {
        qrId: id,
        ...(Object.keys(dateFilter).length > 0 && { scannedAt: dateFilter })
      },
      _count: {
        scannedAt: true
      },
      orderBy: {
        scannedAt: 'asc'
      }
    });

    // Format time series data
    const formattedTimeSeries = timeSeriesData.map(item => ({
      date: item.scannedAt.toISOString().split('T')[0],
      scans: item._count.scannedAt
    }));

    res.json({
      success: true,
      data: {
        qrCode: {
          id: qrCode.id,
          name: qrCode.name,
          type: qrCode.type,
          shortCode: qrCode.shortCode
        },
        statistics: {
          totalScans,
          uniqueUsers: uniqueUsers.length,
          averageScansPerUser: uniqueUsers.length > 0 ? (totalScans / uniqueUsers.length).toFixed(2) : 0
        },
        deviceBreakdown: deviceBreakdown.map(item => ({
          device: item.deviceType,
          scans: item._count.deviceType,
          percentage: ((item._count.deviceType / totalScans) * 100).toFixed(1)
        })),
        browserBreakdown: browserBreakdown.map(item => ({
          browser: item.browser,
          scans: item._count.browser,
          percentage: ((item._count.browser / totalScans) * 100).toFixed(1)
        })),
        geographicBreakdown: geographicBreakdown.map(item => ({
          country: item.country,
          scans: item._count.country,
          percentage: ((item._count.country / totalScans) * 100).toFixed(1)
        })),
        timeSeries: formattedTimeSeries
      }
    });
  } catch (error) {
    console.error('QR stats error:', error);
    res.status(500).json({
      error: 'Server error while fetching QR code statistics'
    });
  }
});

// @route   GET /api/analytics/timeline
// @desc    Get timeline data for all QR codes
// @access  Private
router.get('/timeline', auth, validateQuery(Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  groupBy: Joi.string().valid('day', 'week', 'month').default('day')
})), async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;
    const userId = req.user.id;

    // Build date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Get timeline data
    const timelineData = await prisma.scan.groupBy({
      by: ['scannedAt'],
      where: {
        qrCode: {
          userId
        },
        ...(Object.keys(dateFilter).length > 0 && { scannedAt: dateFilter })
      },
      _count: {
        scannedAt: true
      },
      orderBy: {
        scannedAt: 'asc'
      }
    });

    // Format timeline data
    const formattedTimeline = timelineData.map(item => ({
      date: item.scannedAt.toISOString().split('T')[0],
      scans: item._count.scannedAt
    }));

    res.json({
      success: true,
      data: {
        timeline: formattedTimeline,
        totalScans: formattedTimeline.reduce((sum, item) => sum + item.scans, 0),
        averageDailyScans: formattedTimeline.length > 0 
          ? (formattedTimeline.reduce((sum, item) => sum + item.scans, 0) / formattedTimeline.length).toFixed(2)
          : 0
      }
    });
  } catch (error) {
    console.error('Timeline error:', error);
    res.status(500).json({
      error: 'Server error while fetching timeline data'
    });
  }
});

// @route   GET /api/analytics/devices
// @desc    Get device breakdown statistics
// @access  Private
router.get('/devices', auth, dynamicRateLimit, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get device breakdown
    const deviceBreakdown = await prisma.scan.groupBy({
      by: ['deviceType'],
      where: {
        qrCode: {
          userId
        },
        deviceType: {
          not: null
        }
      },
      _count: {
        deviceType: true
      },
      orderBy: {
        _count: {
          deviceType: 'desc'
        }
      }
    });

    const totalScans = deviceBreakdown.reduce((sum, item) => sum + item._count.deviceType, 0);

    const formattedDevices = deviceBreakdown.map(item => ({
      device: item.deviceType,
      scans: item._count.deviceType,
      percentage: ((item._count.deviceType / totalScans) * 100).toFixed(1)
    }));

    res.json({
      success: true,
      data: {
        devices: formattedDevices,
        totalScans
      }
    });
  } catch (error) {
    console.error('Device analytics error:', error);
    res.status(500).json({
      error: 'Server error while fetching device analytics'
    });
  }
});

// @route   GET /api/analytics/geographic
// @desc    Get geographic breakdown statistics
// @access  Private
router.get('/geographic', auth, dynamicRateLimit, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get geographic breakdown
    const geographicBreakdown = await prisma.scan.groupBy({
      by: ['country'],
      where: {
        qrCode: {
          userId
        },
        country: {
          not: null
        }
      },
      _count: {
        country: true
      },
      orderBy: {
        _count: {
          country: 'desc'
        }
      }
    });

    const totalScans = geographicBreakdown.reduce((sum, item) => sum + item._count.country, 0);

    const formattedGeographic = geographicBreakdown.map(item => ({
      country: item.country,
      scans: item._count.country,
      percentage: ((item._count.country / totalScans) * 100).toFixed(1)
    }));

    res.json({
      success: true,
      data: {
        geographic: formattedGeographic,
        totalScans
      }
    });
  } catch (error) {
    console.error('Geographic analytics error:', error);
    res.status(500).json({
      error: 'Server error while fetching geographic analytics'
    });
  }
});

module.exports = router;

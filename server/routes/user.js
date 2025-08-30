const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../database/prisma');
const { auth } = require('../middleware/auth');
const { dynamicRateLimit } = require('../middleware/rateLimit');
const { validate } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, dynamicRateLimit, async (req, res) => {
  try {
    const user = req.user;

    // Get additional user statistics
    const qrCodeCount = await prisma.qRCode.count({
      where: { userId: user.id }
    });

    const totalScans = await prisma.scan.count({
      where: {
        qrCode: {
          userId: user.id
        }
      }
    });

    const recentQRCodes = await prisma.qRCode.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: {
            scans: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    const recentScans = await prisma.scan.findMany({
      where: {
        qrCode: {
          userId: user.id
        }
      },
      include: {
        qrCode: {
          select: {
            name: true,
            shortCode: true
          }
        }
      },
      orderBy: {
        scannedAt: 'desc'
      },
      take: 10
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
          qrLimit: user.qrLimit,
          isActive: user.isActive,
          createdAt: user.createdAt
        },
        statistics: {
          qrCodeCount,
          totalScans,
          qrCodesRemaining: user.qrLimit - qrCodeCount
        },
        recentQRCodes: recentQRCodes.map(qr => ({
          id: qr.id,
          name: qr.name,
          type: qr.type,
          shortCode: qr.shortCode,
          scanCount: qr._count.scans,
          createdAt: qr.createdAt
        })),
        recentScans: recentScans.map(scan => ({
          id: scan.id,
          qrCodeName: scan.qrCode.name,
          qrCodeShortCode: scan.qrCode.shortCode,
          deviceType: scan.deviceType,
          country: scan.country,
          scannedAt: scan.scannedAt
        }))
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Server error while fetching profile'
    });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, dynamicRateLimit, validate('updateProfile'), async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    // Check if email is already taken by another user
    if (email && email !== req.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (existingUser) {
        return res.status(400).json({
          error: 'Email is already taken by another user'
        });
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email: email.toLowerCase() })
      },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        qrLimit: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Server error while updating profile'
    });
  }
});

// @route   PUT /api/user/password
// @desc    Change user password
// @access  Private
router.put('/password', auth, dynamicRateLimit, validate('changePassword'), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Server error while changing password'
    });
  }
});

// @route   GET /api/user/usage
// @desc    Get user usage statistics
// @access  Private
router.get('/usage', auth, dynamicRateLimit, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current usage
    const qrCodeCount = await prisma.qRCode.count({
      where: { userId }
    });

    // Get scans in different time periods
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const [todayScans, weekScans, monthScans, totalScans] = await Promise.all([
      prisma.scan.count({
        where: {
          qrCode: { userId },
          scannedAt: { gte: today }
        }
      }),
      prisma.scan.count({
        where: {
          qrCode: { userId },
          scannedAt: { gte: weekAgo }
        }
      }),
      prisma.scan.count({
        where: {
          qrCode: { userId },
          scannedAt: { gte: monthAgo }
        }
      }),
      prisma.scan.count({
        where: {
          qrCode: { userId }
        }
      })
    ]);

    // Get QR codes by type
    const qrCodesByType = await prisma.qRCode.groupBy({
      by: ['type'],
      where: { userId },
      _count: {
        type: true
      }
    });

    // Get recent activity
    const recentActivity = await prisma.scan.findMany({
      where: {
        qrCode: { userId }
      },
      include: {
        qrCode: {
          select: {
            name: true,
            type: true
          }
        }
      },
      orderBy: {
        scannedAt: 'desc'
      },
      take: 20
    });

    res.json({
      success: true,
      data: {
        limits: {
          qrLimit: req.user.qrLimit,
          qrUsed: qrCodeCount,
          qrRemaining: req.user.qrLimit - qrCodeCount
        },
        scans: {
          today: todayScans,
          week: weekScans,
          month: monthScans,
          total: totalScans
        },
        qrCodesByType: qrCodesByType.map(item => ({
          type: item.type,
          count: item._count.type
        })),
        recentActivity: recentActivity.map(scan => ({
          id: scan.id,
          qrCodeName: scan.qrCode.name,
          qrCodeType: scan.qrCode.type,
          deviceType: scan.deviceType,
          country: scan.country,
          scannedAt: scan.scannedAt
        }))
      }
    });
  } catch (error) {
    console.error('Get usage error:', error);
    res.status(500).json({
      error: 'Server error while fetching usage statistics'
    });
  }
});

// @route   GET /api/user/plan
// @desc    Get user plan information
// @access  Private
router.get('/plan', auth, dynamicRateLimit, async (req, res) => {
  try {
    const user = req.user;

    // Define plan features
    const planFeatures = {
      free: {
        name: 'Free',
        qrLimit: 10,
        features: [
          'Up to 10 QR codes',
          'Basic analytics',
          'Standard support'
        ],
        price: 0
      },
      pro: {
        name: 'Pro',
        qrLimit: 100,
        features: [
          'Up to 100 QR codes',
          'Advanced analytics',
          'Priority support',
          'Custom branding',
          'API access'
        ],
        price: 9.99
      },
      enterprise: {
        name: 'Enterprise',
        qrLimit: 1000,
        features: [
          'Up to 1000 QR codes',
          'Full analytics suite',
          '24/7 support',
          'Custom branding',
          'API access',
          'White-label options',
          'Dedicated account manager'
        ],
        price: 29.99
      }
    };

    const currentPlan = planFeatures[user.plan] || planFeatures.free;

    res.json({
      success: true,
      data: {
        currentPlan: {
          name: currentPlan.name,
          qrLimit: currentPlan.qrLimit,
          features: currentPlan.features,
          price: currentPlan.price
        },
        allPlans: planFeatures,
        usage: {
          qrCodesUsed: await prisma.qRCode.count({
            where: { userId: user.id }
          }),
          qrCodesRemaining: currentPlan.qrLimit - await prisma.qRCode.count({
            where: { userId: user.id }
          })
        }
      }
    });
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({
      error: 'Server error while fetching plan information'
    });
  }
});

// @route   DELETE /api/user/account
// @desc    Delete user account
// @access  Private
router.delete('/account', auth, dynamicRateLimit, async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete user (QR codes and scans will be deleted automatically due to cascade)
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      error: 'Server error while deleting account'
    });
  }
});

module.exports = router;

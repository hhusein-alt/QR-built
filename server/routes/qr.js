const express = require('express');
const QRCode = require('qrcode');
const { nanoid } = require('nanoid');
const prisma = require('../database/prisma');
const { auth, optionalAuth } = require('../middleware/auth');
const { qrGenerationRateLimit, dynamicRateLimit } = require('../middleware/rateLimit');
const { validate, validateParams } = require('../middleware/validation');
const Joi = require('joi');

const router = express.Router();

// @route   POST /api/qr/generate
// @desc    Generate a new QR code
// @access  Private (optional for demo)
router.post('/generate', optionalAuth, qrGenerationRateLimit, validate('generateQR'), async (req, res) => {
  try {
    const { name, data, type, styleConfig } = req.body;
    const userId = req.user?.id;

    // Check QR code limit for authenticated users
    if (userId) {
      const userQrCount = await prisma.qRCode.count({
        where: { userId }
      });

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { qrLimit: true }
      });

      if (userQrCount >= user.qrLimit) {
        return res.status(403).json({
          error: `QR code limit reached. You can create up to ${user.qrLimit} QR codes with your current plan.`
        });
      }
    }

    // Generate short code
    const shortCode = nanoid(8);

    // Create QR code record
    const qrCode = await prisma.qRCode.create({
      data: {
        userId: userId || null,
        name,
        data,
        type,
        shortCode,
        styleConfig: JSON.stringify(styleConfig || {})
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    // Generate QR code image
    const qrCodeOptions = {
      errorCorrectionLevel: styleConfig?.errorCorrectionLevel || 'M',
      type: 'image/png',
      quality: 0.92,
      margin: styleConfig?.margin || 2,
      color: {
        dark: styleConfig?.foreground || '#000000',
        light: styleConfig?.background || '#FFFFFF'
      },
      width: styleConfig?.size || 256
    };

    const qrCodeDataURL = await QRCode.toDataURL(data, qrCodeOptions);

    res.status(201).json({
      success: true,
      message: 'QR code generated successfully',
      data: {
        qrCode: {
          id: qrCode.id,
          name: qrCode.name,
          data: qrCode.data,
          type: qrCode.type,
          shortCode: qrCode.shortCode,
          styleConfig: JSON.parse(qrCode.styleConfig),
          isActive: qrCode.isActive,
          createdAt: qrCode.createdAt,
          user: qrCode.user
        },
        qrCodeImage: qrCodeDataURL,
        shortUrl: `${req.protocol}://${req.get('host')}/api/track/${shortCode}`
      }
    });
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({
      error: 'Server error while generating QR code'
    });
  }
});

// @route   GET /api/qr/list
// @desc    Get user's QR codes
// @access  Private
router.get('/list', auth, dynamicRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, isActive } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {
      userId: req.user.id
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { data: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (type) {
      where.type = type;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Get QR codes with scan count
    const qrCodes = await prisma.qRCode.findMany({
      where,
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
      skip,
      take: parseInt(limit)
    });

    // Get total count for pagination
    const total = await prisma.qRCode.count({ where });

    // Format response
    const formattedQrCodes = qrCodes.map(qr => ({
      id: qr.id,
      name: qr.name,
      data: qr.data,
      type: qr.type,
      shortCode: qr.shortCode,
      styleConfig: JSON.parse(qr.styleConfig),
      isActive: qr.isActive,
      createdAt: qr.createdAt,
      updatedAt: qr.updatedAt,
      scanCount: qr._count.scans,
      shortUrl: `${req.protocol}://${req.get('host')}/api/track/${qr.shortCode}`
    }));

    res.json({
      success: true,
      data: {
        qrCodes: formattedQrCodes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('QR list error:', error);
    res.status(500).json({
      error: 'Server error while fetching QR codes'
    });
  }
});

// @route   GET /api/qr/:id
// @desc    Get specific QR code details
// @access  Private
router.get('/:id', auth, validateParams(Joi.object({ id: Joi.string().required() })), async (req, res) => {
  try {
    const { id } = req.params;

    const qrCode = await prisma.qRCode.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: {
        _count: {
          select: {
            scans: true
          }
        }
      }
    });

    if (!qrCode) {
      return res.status(404).json({
        error: 'QR code not found'
      });
    }

    // Generate QR code image
    const styleConfig = JSON.parse(qrCode.styleConfig);
    const qrCodeOptions = {
      errorCorrectionLevel: styleConfig?.errorCorrectionLevel || 'M',
      type: 'image/png',
      quality: 0.92,
      margin: styleConfig?.margin || 2,
      color: {
        dark: styleConfig?.foreground || '#000000',
        light: styleConfig?.background || '#FFFFFF'
      },
      width: styleConfig?.size || 256
    };

    const qrCodeDataURL = await QRCode.toDataURL(qrCode.data, qrCodeOptions);

    res.json({
      success: true,
      data: {
        qrCode: {
          id: qrCode.id,
          name: qrCode.name,
          data: qrCode.data,
          type: qrCode.type,
          shortCode: qrCode.shortCode,
          styleConfig: styleConfig,
          isActive: qrCode.isActive,
          createdAt: qrCode.createdAt,
          updatedAt: qrCode.updatedAt,
          scanCount: qrCode._count.scans
        },
        qrCodeImage: qrCodeDataURL,
        shortUrl: `${req.protocol}://${req.get('host')}/api/track/${qrCode.shortCode}`
      }
    });
  } catch (error) {
    console.error('QR details error:', error);
    res.status(500).json({
      error: 'Server error while fetching QR code details'
    });
  }
});

// @route   PUT /api/qr/:id
// @desc    Update QR code
// @access  Private
router.put('/:id', auth, validateParams(Joi.object({ id: Joi.string().required() })), validate('updateQR'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Convert styleConfig to JSON string if provided
    if (updateData.styleConfig) {
      updateData.styleConfig = JSON.stringify(updateData.styleConfig);
    }

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

    const updatedQrCode = await prisma.qRCode.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            scans: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'QR code updated successfully',
      data: {
        qrCode: {
          id: updatedQrCode.id,
          name: updatedQrCode.name,
          data: updatedQrCode.data,
          type: updatedQrCode.type,
          shortCode: updatedQrCode.shortCode,
          styleConfig: JSON.parse(updatedQrCode.styleConfig),
          isActive: updatedQrCode.isActive,
          createdAt: updatedQrCode.createdAt,
          updatedAt: updatedQrCode.updatedAt,
          scanCount: updatedQrCode._count.scans
        }
      }
    });
  } catch (error) {
    console.error('QR update error:', error);
    res.status(500).json({
      error: 'Server error while updating QR code'
    });
  }
});

// @route   DELETE /api/qr/:id
// @desc    Delete QR code
// @access  Private
router.delete('/:id', auth, validateParams(Joi.object({ id: Joi.string().required() })), async (req, res) => {
  try {
    const { id } = req.params;

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

    // Delete QR code (scans will be deleted automatically due to cascade)
    await prisma.qRCode.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'QR code deleted successfully'
    });
  } catch (error) {
    console.error('QR delete error:', error);
    res.status(500).json({
      error: 'Server error while deleting QR code'
    });
  }
});

// @route   GET /api/qr/:id/download
// @desc    Download QR code as PNG
// @access  Private
router.get('/:id/download', auth, validateParams(Joi.object({ id: Joi.string().required() })), async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'png' } = req.query;

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

    const styleConfig = JSON.parse(qrCode.styleConfig);
    const qrCodeOptions = {
      errorCorrectionLevel: styleConfig?.errorCorrectionLevel || 'M',
      type: format === 'svg' ? 'svg' : 'image/png',
      quality: 0.92,
      margin: styleConfig?.margin || 2,
      color: {
        dark: styleConfig?.foreground || '#000000',
        light: styleConfig?.background || '#FFFFFF'
      },
      width: styleConfig?.size || 256
    };

    if (format === 'svg') {
      const svgString = await QRCode.toString(qrCode.data, qrCodeOptions);
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Content-Disposition', `attachment; filename="${qrCode.name}.svg"`);
      res.send(svgString);
    } else {
      const pngBuffer = await QRCode.toBuffer(qrCode.data, qrCodeOptions);
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="${qrCode.name}.png"`);
      res.send(pngBuffer);
    }
  } catch (error) {
    console.error('QR download error:', error);
    res.status(500).json({
      error: 'Server error while downloading QR code'
    });
  }
});

module.exports = router;

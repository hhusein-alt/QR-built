const express = require('express');
const geoip = require('geoip-lite');
const UserAgent = require('user-agents');
const prisma = require('../database/prisma');
const { scanTrackingRateLimit } = require('../middleware/rateLimit');
const { validate, validateParams } = require('../middleware/validation');
const Joi = require('joi');

const router = express.Router();

// Helper function to detect device type
const detectDeviceType = (userAgent) => {
  try {
    const ua = new UserAgent(userAgent);
    if (ua.device.type === 'mobile') return 'mobile';
    if (ua.device.type === 'tablet') return 'tablet';
    return 'desktop';
  } catch (error) {
    // Fallback detection
    const uaString = userAgent || '';
    if (uaString.includes('Mobile') || uaString.includes('Android') || uaString.includes('iPhone')) {
      return 'mobile';
    }
    if (uaString.includes('Tablet') || uaString.includes('iPad')) {
      return 'tablet';
    }
    return 'desktop';
  }
};

// Helper function to get browser info
const getBrowserInfo = (userAgent) => {
  try {
    const ua = new UserAgent(userAgent);
    return ua.browser.name || 'Unknown';
  } catch (error) {
    // Fallback detection
    const uaString = userAgent || '';
    if (uaString.includes('Chrome')) return 'Chrome';
    if (uaString.includes('Firefox')) return 'Firefox';
    if (uaString.includes('Safari')) return 'Safari';
    if (uaString.includes('Edge')) return 'Edge';
    return 'Unknown';
  }
};

// Helper function to get OS info
const getOSInfo = (userAgent) => {
  try {
    const ua = new UserAgent(userAgent);
    return ua.os.name || 'Unknown';
  } catch (error) {
    // Fallback detection
    const uaString = userAgent || '';
    if (uaString.includes('Windows')) return 'Windows';
    if (uaString.includes('Mac')) return 'macOS';
    if (uaString.includes('Linux')) return 'Linux';
    if (uaString.includes('Android')) return 'Android';
    if (uaString.includes('iOS')) return 'iOS';
    return 'Unknown';
  }
};

// @route   GET /api/track/:shortCode
// @desc    Track QR code scan and redirect
// @access  Public
router.get('/:shortCode', scanTrackingRateLimit, validateParams(Joi.object({ 
  shortCode: Joi.string().required() 
})), async (req, res) => {
  try {
    const { shortCode } = req.params;
    const userAgent = req.get('User-Agent');
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const referrer = req.get('Referrer');

    // Find QR code by short code
    const qrCode = await prisma.qRCode.findUnique({
      where: { shortCode },
      include: {
        user: {
          select: {
            id: true,
            plan: true
          }
        }
      }
    });

    if (!qrCode) {
      return res.status(404).json({
        error: 'QR code not found'
      });
    }

    if (!qrCode.isActive) {
      return res.status(410).json({
        error: 'QR code is inactive'
      });
    }

    // Get location data from IP
    let locationData = {};
    try {
      if (ipAddress && ipAddress !== '::1' && ipAddress !== '127.0.0.1') {
        const geo = geoip.lookup(ipAddress);
        if (geo) {
          locationData = {
            country: geo.country,
            city: geo.city,
            region: geo.region
          };
        }
      }
    } catch (error) {
      console.error('GeoIP lookup error:', error);
    }

    // Detect device and browser information
    const deviceType = detectDeviceType(userAgent);
    const browser = getBrowserInfo(userAgent);
    const os = getOSInfo(userAgent);

    // Record scan
    await prisma.scan.create({
      data: {
        qrId: qrCode.id,
        ipAddress: ipAddress,
        userAgent: userAgent,
        referrer: referrer,
        deviceType: deviceType,
        browser: browser,
        os: os,
        country: locationData.country,
        city: locationData.city,
        userId: qrCode.userId // Link to QR code owner for analytics
      }
    });

    // Handle different QR code types
    let redirectUrl;
    let contentType = 'text/html';

    switch (qrCode.type) {
      case 'url':
        redirectUrl = qrCode.data;
        break;
      
      case 'text':
        // For text QR codes, show the text content
        return res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>QR Code Content</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { 
                font-family: Arial, sans-serif; 
                max-width: 600px; 
                margin: 50px auto; 
                padding: 20px;
                text-align: center;
              }
              .content { 
                background: #f5f5f5; 
                padding: 30px; 
                border-radius: 10px; 
                margin: 20px 0;
                white-space: pre-wrap;
                word-wrap: break-word;
              }
            </style>
          </head>
          <body>
            <h1>QR Code Content</h1>
            <div class="content">${qrCode.data}</div>
            <p><small>Scanned at ${new Date().toLocaleString()}</small></p>
          </body>
          </html>
        `);
      
      case 'wifi':
        // For WiFi QR codes, show connection details
        const wifiData = JSON.parse(qrCode.data);
        return res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>WiFi Connection</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { 
                font-family: Arial, sans-serif; 
                max-width: 500px; 
                margin: 50px auto; 
                padding: 20px;
                text-align: center;
              }
              .wifi-info { 
                background: #f5f5f5; 
                padding: 30px; 
                border-radius: 10px; 
                margin: 20px 0;
              }
              .field { margin: 10px 0; }
              .label { font-weight: bold; color: #666; }
              .value { font-size: 1.2em; }
            </style>
          </head>
          <body>
            <h1>WiFi Network</h1>
            <div class="wifi-info">
              <div class="field">
                <div class="label">Network Name:</div>
                <div class="value">${wifiData.ssid || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="label">Security:</div>
                <div class="value">${wifiData.security || 'Open'}</div>
              </div>
              ${wifiData.password ? `
              <div class="field">
                <div class="label">Password:</div>
                <div class="value">${wifiData.password}</div>
              </div>
              ` : ''}
            </div>
            <p><small>Scanned at ${new Date().toLocaleString()}</small></p>
          </body>
          </html>
        `);
      
      case 'contact':
        // For contact QR codes, show contact information
        const contactData = JSON.parse(qrCode.data);
        return res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Contact Information</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { 
                font-family: Arial, sans-serif; 
                max-width: 500px; 
                margin: 50px auto; 
                padding: 20px;
                text-align: center;
              }
              .contact-info { 
                background: #f5f5f5; 
                padding: 30px; 
                border-radius: 10px; 
                margin: 20px 0;
              }
              .field { margin: 15px 0; }
              .label { font-weight: bold; color: #666; }
              .value { font-size: 1.1em; }
            </style>
          </head>
          <body>
            <h1>Contact Information</h1>
            <div class="contact-info">
              ${contactData.name ? `
              <div class="field">
                <div class="label">Name:</div>
                <div class="value">${contactData.name}</div>
              </div>
              ` : ''}
              ${contactData.email ? `
              <div class="field">
                <div class="label">Email:</div>
                <div class="value"><a href="mailto:${contactData.email}">${contactData.email}</a></div>
              </div>
              ` : ''}
              ${contactData.phone ? `
              <div class="field">
                <div class="label">Phone:</div>
                <div class="value"><a href="tel:${contactData.phone}">${contactData.phone}</a></div>
              </div>
              ` : ''}
              ${contactData.company ? `
              <div class="field">
                <div class="label">Company:</div>
                <div class="value">${contactData.company}</div>
              </div>
              ` : ''}
            </div>
            <p><small>Scanned at ${new Date().toLocaleString()}</small></p>
          </body>
          </html>
        `);
      
      default:
        redirectUrl = qrCode.data;
    }

    // Redirect to URL
    if (redirectUrl) {
      res.redirect(redirectUrl);
    } else {
      res.status(400).json({
        error: 'Invalid QR code type'
      });
    }
  } catch (error) {
    console.error('Track scan error:', error);
    res.status(500).json({
      error: 'Server error while processing scan'
    });
  }
});

// @route   POST /api/track/scan
// @desc    Record a scan event (for API tracking)
// @access  Public
router.post('/scan', scanTrackingRateLimit, validate('trackScan'), async (req, res) => {
  try {
    const { qrId, referrer, userAgent } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

    // Find QR code
    const qrCode = await prisma.qRCode.findUnique({
      where: { id: qrId },
      include: {
        user: {
          select: {
            id: true,
            plan: true
          }
        }
      }
    });

    if (!qrCode) {
      return res.status(404).json({
        error: 'QR code not found'
      });
    }

    if (!qrCode.isActive) {
      return res.status(410).json({
        error: 'QR code is inactive'
      });
    }

    // Get location data from IP
    let locationData = {};
    try {
      if (ipAddress && ipAddress !== '::1' && ipAddress !== '127.0.0.1') {
        const geo = geoip.lookup(ipAddress);
        if (geo) {
          locationData = {
            country: geo.country,
            city: geo.city,
            region: geo.region
          };
        }
      }
    } catch (error) {
      console.error('GeoIP lookup error:', error);
    }

    // Detect device and browser information
    const deviceType = detectDeviceType(userAgent || req.get('User-Agent'));
    const browser = getBrowserInfo(userAgent || req.get('User-Agent'));
    const os = getOSInfo(userAgent || req.get('User-Agent'));

    // Record scan
    const scan = await prisma.scan.create({
      data: {
        qrId: qrCode.id,
        ipAddress: ipAddress,
        userAgent: userAgent || req.get('User-Agent'),
        referrer: referrer,
        deviceType: deviceType,
        browser: browser,
        os: os,
        country: locationData.country,
        city: locationData.city,
        userId: qrCode.userId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Scan recorded successfully',
      data: {
        scanId: scan.id,
        qrCode: {
          id: qrCode.id,
          name: qrCode.name,
          type: qrCode.type,
          data: qrCode.data
        },
        scanInfo: {
          deviceType,
          browser,
          os,
          country: locationData.country,
          city: locationData.city,
          scannedAt: scan.scannedAt
        }
      }
    });
  } catch (error) {
    console.error('Record scan error:', error);
    res.status(500).json({
      error: 'Server error while recording scan'
    });
  }
});

// @route   GET /api/track/:shortCode/info
// @desc    Get QR code information without tracking
// @access  Public
router.get('/:shortCode/info', async (req, res) => {
  try {
    const { shortCode } = req.params;

    const qrCode = await prisma.qRCode.findUnique({
      where: { shortCode },
      include: {
        user: {
          select: {
            name: true
          }
        },
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

    res.json({
      success: true,
      data: {
        id: qrCode.id,
        name: qrCode.name,
        type: qrCode.type,
        isActive: qrCode.isActive,
        createdAt: qrCode.createdAt,
        scanCount: qrCode._count.scans,
        createdBy: qrCode.user?.name || 'Anonymous'
      }
    });
  } catch (error) {
    console.error('Get QR info error:', error);
    res.status(500).json({
      error: 'Server error while fetching QR code information'
    });
  }
});

module.exports = router;

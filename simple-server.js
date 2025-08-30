const express = require('express');
const app = express();
const PORT = 3000;

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'QR Code Platform Server is running!',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api: '/api',
      qrGenerator: '/qr-generator',
      analytics: '/analytics'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    server: 'QR Code Platform Frontend'
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'QR Code Platform API',
    backend: 'http://localhost:5000',
    endpoints: {
      auth: 'http://localhost:5000/api/auth',
      qr: 'http://localhost:5000/api/qr',
      analytics: 'http://localhost:5000/api/analytics',
      track: 'http://localhost:5000/api/track'
    }
  });
});

// QR Generator endpoint
app.get('/qr-generator', (req, res) => {
  res.json({
    message: 'QR Code Generator',
    features: [
      'URL QR Codes',
      'Text QR Codes', 
      'WiFi QR Codes',
      'Contact QR Codes',
      'Custom styling',
      'Logo overlay',
      'Download options'
    ]
  });
});

// Analytics endpoint
app.get('/analytics', (req, res) => {
  res.json({
    message: 'Analytics Dashboard',
    features: [
      'Real-time scan tracking',
      'Device breakdown',
      'Geographic data',
      'Timeline charts',
      'Performance metrics',
      'Export functionality'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 QR Code Platform Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API info: http://localhost:${PORT}/api`);
  console.log(`📱 Ready for ngrok tunnel!`);
});

module.exports = app;

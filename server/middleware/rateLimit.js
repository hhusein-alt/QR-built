const rateLimit = require('express-rate-limit');
const prisma = require('../database/prisma');

// Rate limit configuration based on user plan
const getRateLimitConfig = (plan = 'free') => {
  const limits = {
    free: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 100, // 100 requests per hour
      message: {
        error: 'Rate limit exceeded. Free users are limited to 100 requests per hour. Upgrade to Pro for higher limits.'
      }
    },
    pro: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 1000, // 1000 requests per hour
      message: {
        error: 'Rate limit exceeded. Pro users are limited to 1000 requests per hour.'
      }
    },
    enterprise: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10000, // 10000 requests per hour
      message: {
        error: 'Rate limit exceeded. Enterprise users are limited to 10000 requests per hour.'
      }
    }
  };

  return limits[plan] || limits.free;
};

// Dynamic rate limiter that checks user plan
const dynamicRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: async (req) => {
    // Default to free plan limits
    if (!req.user) return 100;
    
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { plan: true }
      });
      
      const config = getRateLimitConfig(user?.plan);
      return config.max;
    } catch (error) {
      console.error('Error fetching user plan for rate limiting:', error);
      return 100; // Default to free plan
    }
  },
  message: (req) => {
    if (!req.user) {
      return { error: 'Rate limit exceeded. Please log in or upgrade your plan.' };
    }
    
    const config = getRateLimitConfig(req.user.plan);
    return config.message;
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise use IP
    return req.user ? req.user.id : req.ip;
  }
});

// Specific rate limiters for different endpoints
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: {
    error: 'Too many authentication attempts. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const qrGenerationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: async (req) => {
    if (!req.user) return 5; // 5 QR codes per hour for unauthenticated users
    
    const limits = {
      free: 10,
      pro: 100,
      enterprise: 1000
    };
    
    return limits[req.user.plan] || limits.free;
  },
  message: (req) => {
    if (!req.user) {
      return { error: 'QR generation limit exceeded. Please log in to create more QR codes.' };
    }
    
    const limits = {
      free: 10,
      pro: 100,
      enterprise: 1000
    };
    
    const limit = limits[req.user.plan] || limits.free;
    return { 
      error: `QR generation limit exceeded. You can create ${limit} QR codes per hour with your current plan.` 
    };
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user ? req.user.id : req.ip,
});

const scanTrackingRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 scan tracking requests per minute
  message: {
    error: 'Too many scan tracking requests. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  dynamicRateLimit,
  authRateLimit,
  qrGenerationRateLimit,
  scanTrackingRateLimit
};

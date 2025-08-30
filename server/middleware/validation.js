const Joi = require('joi');

// Validation schemas
const schemas = {
  // Auth validation
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    }),
    name: Joi.string().min(2).max(50).optional().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters'
    })
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  }),

  // QR Code validation
  generateQR: Joi.object({
    name: Joi.string().min(1).max(100).required().messages({
      'string.min': 'QR code name is required',
      'string.max': 'QR code name cannot exceed 100 characters',
      'any.required': 'QR code name is required'
    }),
    data: Joi.string().min(1).max(2000).required().messages({
      'string.min': 'QR code data is required',
      'string.max': 'QR code data cannot exceed 2000 characters',
      'any.required': 'QR code data is required'
    }),
    type: Joi.string().valid('url', 'text', 'wifi', 'contact').required().messages({
      'any.only': 'Type must be one of: url, text, wifi, contact',
      'any.required': 'QR code type is required'
    }),
    styleConfig: Joi.object({
      size: Joi.number().min(128).max(512).default(256),
      foreground: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#000000'),
      background: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#FFFFFF'),
      errorCorrectionLevel: Joi.string().valid('L', 'M', 'Q', 'H').default('M'),
      logo: Joi.string().uri().optional()
    }).optional()
  }),

  updateQR: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    data: Joi.string().min(1).max(2000).optional(),
    type: Joi.string().valid('url', 'text', 'wifi', 'contact').optional(),
    styleConfig: Joi.object({
      size: Joi.number().min(128).max(512),
      foreground: Joi.string().pattern(/^#[0-9A-F]{6}$/i),
      background: Joi.string().pattern(/^#[0-9A-F]{6}$/i),
      errorCorrectionLevel: Joi.string().valid('L', 'M', 'Q', 'H'),
      logo: Joi.string().uri().optional()
    }).optional(),
    isActive: Joi.boolean().optional()
  }),

  // User profile validation
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    email: Joi.string().email().optional()
  }),

  // Analytics validation
  getStats: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    groupBy: Joi.string().valid('day', 'week', 'month').default('day')
  }),

  // Scan tracking validation
  trackScan: Joi.object({
    qrId: Joi.string().required(),
    referrer: Joi.string().uri().optional(),
    userAgent: Joi.string().optional()
  }),

  // Password change validation
  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Current password is required'
    }),
    newPassword: Joi.string().min(6).required().messages({
      'string.min': 'New password must be at least 6 characters long',
      'any.required': 'New password is required'
    })
  })
};

// Validation middleware factory
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return res.status(500).json({ error: 'Validation schema not found' });
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details: errorMessages
      });
    }

    // Replace request body with validated and sanitized data
    req.body = value;
    next();
  };
};

// URL parameter validation
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Invalid parameters',
        details: errorMessages
      });
    }

    req.params = value;
    next();
  };
};

// Query parameter validation
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Invalid query parameters',
        details: errorMessages
      });
    }

    req.query = value;
    next();
  };
};

module.exports = {
  validate,
  validateParams,
  validateQuery,
  schemas
};

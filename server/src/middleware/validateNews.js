const { body, validationResult } = require('express-validator');

/**
 * Validation middleware for news articles
 */
const validateNews = [
  // Validate and sanitize title
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters')
    .escape()
    .withMessage('Title contains invalid characters'),

  // Validate and sanitize content
  body('content')
    .trim()
    .isLength({ min: 20, max: 5000 })
    .withMessage('Content must be between 20 and 5,000 characters')
    .escape()
    .withMessage('Content contains invalid characters'),

  // Validate category
  body('category')
    .trim()
    .isIn(['academic', 'events', 'announcements', 'student-life', 'research', 'sports', 'technology', 'general'])
    .withMessage('Invalid category. Must be one of: academic, events, announcements, student-life, research, sports, technology, general'),

  // Validate priority (optional)
  body('priority')
    .optional()
    .trim()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority. Must be one of: low, normal, high, urgent'),

  // Validate status (optional)
  body('status')
    .optional()
    .trim()
    .isIn(['draft', 'published', 'archived', 'featured'])
    .withMessage('Invalid status. Must be one of: draft, published, archived, featured'),

  // Validate tags (optional)
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Each tag must be between 1 and 20 characters')
    .isAlphanumeric('en-US', { ignore: ' -_' })
    .withMessage('Tags can only contain letters, numbers, spaces, hyphens, and underscores'),

  // Validate featured image (optional)
  body('featuredImage.url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Featured image URL must be a valid URL')
    .isLength({ max: 500 })
    .withMessage('Featured image URL cannot exceed 500 characters'),

  body('featuredImage.alt')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Featured image alt text cannot exceed 100 characters')
    .escape(),

  body('featuredImage.caption')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Featured image caption cannot exceed 200 characters')
    .escape(),

  // Validate attachments (optional)
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array'),

  body('attachments.*.fileName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Attachment file name must be between 1 and 255 characters'),

  body('attachments.*.fileUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Attachment file URL must be a valid URL'),

  body('attachments.*.fileType')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Attachment file type must be between 1 and 50 characters'),

  body('attachments.*.fileSize')
    .optional()
    .isInt({ min: 1, max: 104857600 }) // 100MB max
    .withMessage('Attachment file size must be between 1 byte and 100MB'),

  // Validate scheduled date (optional)
  body('scheduledFor')
    .optional()
    .isISO8601()
    .withMessage('Scheduled date must be a valid ISO 8601 date')
    .custom((value) => {
      const scheduledDate = new Date(value);
      const now = new Date();
      if (scheduledDate <= now) {
        throw new Error('Scheduled date must be in the future');
      }
      return true;
    }),

  // Validate expiry date (optional)
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid ISO 8601 date')
    .custom((value) => {
      const expiryDate = new Date(value);
      const now = new Date();
      if (expiryDate <= now) {
        throw new Error('Expiry date must be in the future');
      }
      return true;
    }),

  // Validate boolean fields
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean value'),

  body('requiresAuth')
    .optional()
    .isBoolean()
    .withMessage('requiresAuth must be a boolean value'),

  // Validate allowed roles (optional)
  body('allowedRoles')
    .optional()
    .isArray()
    .withMessage('Allowed roles must be an array'),

  body('allowedRoles.*')
    .optional()
    .trim()
    .isIn(['user', 'admin', 'moderator'])
    .withMessage('Invalid role. Must be one of: user, admin, moderator'),

  // Validate meta fields (optional)
  body('metaTitle')
    .optional()
    .trim()
    .isLength({ max: 60 })
    .withMessage('Meta title cannot exceed 60 characters')
    .escape(),

  body('metaDescription')
    .optional()
    .trim()
    .isLength({ max: 160 })
    .withMessage('Meta description cannot exceed 160 characters')
    .escape(),

  // Check for validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        error: 'Validation failed',
        details: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value
        }))
      });
    }
    next();
  }
];

/**
 * Validation middleware for news updates (less strict)
 */
const validateNewsUpdate = [
  // Validate and sanitize title (optional for updates)
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters')
    .escape()
    .withMessage('Title contains invalid characters'),

  // Validate and sanitize content (optional for updates)
  body('content')
    .optional()
    .trim()
    .isLength({ min: 20, max: 5000 })
    .withMessage('Content must be between 20 and 5,000 characters')
    .escape()
    .withMessage('Content contains invalid characters'),

  // Validate category (optional for updates)
  body('category')
    .optional()
    .trim()
    .isIn(['academic', 'events', 'announcements', 'student-life', 'research', 'sports', 'technology', 'general'])
    .withMessage('Invalid category. Must be one of: academic, events, announcements, student-life, research, sports, technology, general'),

  // Validate priority (optional)
  body('priority')
    .optional()
    .trim()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority. Must be one of: low, normal, high, urgent'),

  // Validate status (optional)
  body('status')
    .optional()
    .trim()
    .isIn(['draft', 'published', 'archived', 'featured'])
    .withMessage('Invalid status. Must be one of: draft, published, archived, featured'),

  // Check for validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        error: 'Validation failed',
        details: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value
        }))
      });
    }
    next();
  }
];

module.exports = {
  validateNews,
  validateNewsUpdate
}; 
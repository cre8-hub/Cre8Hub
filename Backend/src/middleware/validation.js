const { body, validationResult } = require('express-validator');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value
        }))
      }
    });
  }
  next();
};

// User registration validation
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Full name can only contain letters and spaces'),
  body('userRole')
    .optional()
    .isIn(['content-creator', 'entrepreneur', 'social-media-manager'])
    .withMessage('Invalid user role'),
  handleValidationErrors
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Profile update validation
const validateProfileUpdate = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Full name can only contain letters and spaces'),
  body('userRole')
    .optional()
    .isIn(['content-creator', 'entrepreneur', 'social-media-manager'])
    .withMessage('Invalid user role'),
  handleValidationErrors
];

// Content creator profile validation
const validateContentCreatorProfile = [
  body('contentGenre')
    .isIn(['educational', 'entertainment', 'gaming', 'lifestyle', 'music', 'tech', 'travel', 'other'])
    .withMessage('Invalid content genre'),
  handleValidationErrors
];

// Entrepreneur profile validation
const validateEntrepreneurProfile = [
  body('businessCategory')
    .isIn(['ecommerce', 'saas', 'consulting', 'agency', 'retail', 'manufacturing', 'other'])
    .withMessage('Invalid business category'),
  body('businessDescription')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Business description must be between 10 and 500 characters'),
  handleValidationErrors
];

// Social media manager profile validation
const validateSocialMediaManagerProfile = [
  body('clientType')
    .isIn(['influencers', 'small-businesses', 'corporate', 'individuals', 'mixed'])
    .withMessage('Invalid client type'),
  body('businessSize')
    .isIn(['solo', 'small-team', 'medium', 'large'])
    .withMessage('Invalid business size'),
  body('socialMediaNiche')
    .isIn(['content-creation', 'community-management', 'marketing-campaigns', 'analytics', 'full-service'])
    .withMessage('Invalid social media niche'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validateContentCreatorProfile,
  validateEntrepreneurProfile,
  validateSocialMediaManagerProfile
}; 
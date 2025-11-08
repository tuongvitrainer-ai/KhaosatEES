const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * Validation rules for login
 */
const validateLogin = [
  body('employee_id')
    .trim()
    .notEmpty()
    .withMessage('Employee ID is required')
    .isLength({ min: 3 })
    .withMessage('Employee ID must be at least 3 characters'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

/**
 * Validation rules for password change
 */
const validatePasswordChange = [
  body('old_password').notEmpty().withMessage('Old password is required'),
  body('new_password')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
  handleValidationErrors,
];

/**
 * Validation rules for response submission
 */
const validateResponse = [
  body('survey_id').isInt({ min: 1 }).withMessage('Valid survey ID is required'),
  body('question_id').isInt({ min: 1 }).withMessage('Valid question ID is required'),
  body('score')
    .optional()
    .isInt({ min: 1, max: 7 })
    .withMessage('Score must be between 1 and 7'),
  body('text_response').optional().trim(),
  handleValidationErrors,
];

/**
 * Validation rules for user creation
 */
const validateUserCreate = [
  body('employee_id')
    .trim()
    .notEmpty()
    .withMessage('Employee ID is required')
    .isLength({ min: 3 })
    .withMessage('Employee ID must be at least 3 characters'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('email').optional().trim().isEmail().withMessage('Invalid email address'),
  body('department').optional().trim(),
  body('position').optional().trim(),
  handleValidationErrors,
];

/**
 * Validation rules for survey creation
 */
const validateSurveyCreate = [
  body('title').trim().notEmpty().withMessage('Survey title is required'),
  body('description').optional().trim(),
  body('instructions').optional().trim(),
  body('likert_scale')
    .optional()
    .isInt({ min: 3, max: 7 })
    .withMessage('Likert scale must be between 3 and 7'),
  body('start_date').optional().isISO8601().withMessage('Invalid start date'),
  body('end_date').optional().isISO8601().withMessage('Invalid end date'),
  handleValidationErrors,
];

/**
 * Validation rules for question creation
 */
const validateQuestionCreate = [
  body('survey_id').isInt({ min: 1 }).withMessage('Valid survey ID is required'),
  body('category_id').optional().isInt({ min: 1 }).withMessage('Invalid category ID'),
  body('question_text').trim().notEmpty().withMessage('Question text is required'),
  body('question_type')
    .optional()
    .isIn(['likert', 'text', 'multiple_choice'])
    .withMessage('Invalid question type'),
  body('is_required').optional().isBoolean().withMessage('Invalid is_required value'),
  body('display_order').optional().isInt({ min: 0 }).withMessage('Invalid display order'),
  handleValidationErrors,
];

module.exports = {
  validateLogin,
  validatePasswordChange,
  validateResponse,
  validateUserCreate,
  validateSurveyCreate,
  validateQuestionCreate,
  handleValidationErrors,
};

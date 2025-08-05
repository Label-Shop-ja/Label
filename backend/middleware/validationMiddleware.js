// Enhanced input validation middleware
import { body, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Common validation rules
export const validateEmail = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email address');

export const validatePassword = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters long')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number');

export const validateName = body('name')
  .trim()
  .isLength({ min: 2, max: 50 })
  .withMessage('Name must be between 2 and 50 characters')
  .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
  .withMessage('Name can only contain letters and spaces');

// Product validation
export const validateProduct = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Product name must be between 1 and 100 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('sku')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('SKU must be less than 50 characters')
];

// User registration validation
export const validateRegistration = [
  validateName,
  validateEmail,
  validatePassword,
  handleValidationErrors
];

// User login validation
export const validateLogin = [
  validateEmail,
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Exchange rate validation
export const validateExchangeRate = [
  body('conversions')
    .isArray({ min: 1 })
    .withMessage('At least one conversion is required'),
  body('conversions.*.fromCurrency')
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency code must be 3 characters'),
  body('conversions.*.toCurrency')
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency code must be 3 characters'),
  body('conversions.*.rate')
    .isFloat({ min: 0.0001 })
    .withMessage('Exchange rate must be a positive number'),
  body('defaultProfitPercentage')
    .isFloat({ min: 0, max: 500 })
    .withMessage('Profit percentage must be between 0 and 500'),
  handleValidationErrors
];
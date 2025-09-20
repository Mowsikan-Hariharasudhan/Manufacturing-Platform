const express = require('express');
const { body } = require('express-validator');
const { 
  register, 
  login, 
  forgotPassword, 
  resetPassword, 
  verifyToken 
} = require('../controllers/authController');
const { validationMiddleware } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be 3-50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name required')
    .isLength({ max: 50 })
    .withMessage('First name must be less than 50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name required')
    .isLength({ max: 50 })
    .withMessage('Last name must be less than 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number required'),
  body('role')
    .optional()
    .isIn(['admin', 'manufacturing_manager', 'operator', 'inventory_manager'])
    .withMessage('Invalid role specified')
];

const loginValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username or email required'),
  body('password')
    .notEmpty()
    .withMessage('Password required')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email required')
];

const resetPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email required'),
  body('resetToken')
    .isLength({ min: 6, max: 6 })
    .withMessage('Reset token must be 6 digits'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

// Routes
router.post('/register', registerValidation, validationMiddleware, register);
router.post('/login', loginValidation, validationMiddleware, login);
router.post('/forgot-password', forgotPasswordValidation, validationMiddleware, forgotPassword);
router.post('/reset-password', resetPasswordValidation, validationMiddleware, resetPassword);
router.get('/verify', authenticateToken, verifyToken);

module.exports = router;

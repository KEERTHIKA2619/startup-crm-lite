import express from 'express';
import { body } from 'express-validator';

import {
  register,
  login,
  getProfile,
  updateProfile,
  logout
} from '../controllers/authController.js';
import protect from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = express.Router();

/**
 * PRODUCTION NOTE:
 * This is where you should integrate 'express-rate-limit' to protect authentication endpoints
 * against brute-force and credential-stuffing attacks.
 * 
 * Example setup:
 * import rateLimit from 'express-rate-limit';
 * const authLimiter = rateLimit({
 *   windowMs: 15 * 60 * 1000, // 15 minutes
 *   max: 100, // Limit each IP to 100 requests per windowMs
 *   message: 'Too many requests from this IP, please try again after 15 minutes'
 * });
 * 
 * Apply it to the routes:
 * router.post('/register', authLimiter, registerValidations, register);
 * router.post('/login', authLimiter, loginValidations, login);
 */

// 1. Validation Rules definitions
const registerValidations = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters long'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const loginValidations = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be a valid email address')
    .normalizeEmail(),   // Must match the normalisation applied at registration
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidations = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters long'),
  body('newPassword')
    .optional()
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  body('oldPassword')
    .optional()
    .custom((value, { req }) => {
      if (req.body.newPassword && !value) {
        throw new Error('Current password is required to set a new password');
      }
      return true;
    })
];

// 2. Authentication Route Mappings

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user inside the system
 * @access  Public
 */
router.post('/register', validate(registerValidations), register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate credentials and issue JSON Web Token
 * @access  Public
 */
router.post('/login', validate(loginValidations), login);

/**
 * @route   GET /api/auth/profile
 * @desc    Retrieve details of current authenticated user
 * @access  Private
 */
router.get('/profile', protect, getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update profile details (name/password) for authenticated user
 * @access  Private
 */
router.put('/profile', protect, validate(updateProfileValidations), updateProfile);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout the user (clear session cache or client cookies)
 * @access  Private
 */
router.post('/logout', protect, logout);

export default router;

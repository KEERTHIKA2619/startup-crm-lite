import { Router } from 'express';
import { body } from 'express-validator';

import { protect }       from '../middleware/auth.js';
import { validate }      from '../middleware/validate.js';
import {
  register,
  login,
  getProfile,
  updateProfile,
} from '../controllers/authController.js';

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION RULES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * registerRules — Validates name, email, and password on registration.
 */
const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters')
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

/**
 * loginRules — Validates email and password on login.
 */
const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES
//
// PRODUCTION NOTE on rate limiting:
//   In production, use express-rate-limit on the /register and /login endpoints
//   to prevent credential stuffing and brute-force attacks. Example:
//     import rateLimit from 'express-rate-limit';
//     const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
//     router.post('/login', authLimiter, validate(loginRules), login);
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Route 1: POST /api/auth/register
 * Register a new user account.
 */
router.post('/register', validate(registerRules), register);

/**
 * Route 2: POST /api/auth/login
 * Authenticate with email + password and receive a JWT.
 */
router.post('/login', validate(loginRules), login);

/**
 * Route 3: GET /api/auth/me
 * Retrieve the authenticated user's own profile.
 */
router.get('/me', protect, getProfile);

/**
 * Route 4: GET /api/auth/profile
 * Alias for /me — retrieve the authenticated user's profile.
 */
router.get('/profile', protect, getProfile);

/**
 * Route 5: PUT /api/auth/profile
 * Update name and/or password of the authenticated user.
 */
router.put('/profile', protect, updateProfile);

export default router;

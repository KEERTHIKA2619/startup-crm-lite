import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Generate JWT token helper
 * @param {string} userId - User ID to sign
 * @returns {string} Signed JWT token
 */
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'Email already exists', 400);
    }

    // Create a new User document
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate JWT token
    const token = generateToken(user._id);

    // Convert to object and strip password field explicitly
    const userResponse = user.toObject();
    delete userResponse.password;

    return successResponse(
      res,
      { token, user: userResponse },
      'Registration successful',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Login existing user
 * POST /api/auth/login
 * 
 * PRODUCTION SECURITY NOTE:
 * In production environments, express-rate-limit should be integrated before this
 * route handler to mitigate brute-force and credential stuffing attacks.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find the user by email and explicitly include password field for comparison
    const user = await User.findOne({ email }).select('+password');
    
    // Check if user exists and password is correct (security: use generic "Invalid credentials" error)
    if (!user || !(await user.comparePassword(password))) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Check if user account is deactivated
    if (!user.isActive) {
      return errorResponse(res, 'Account is deactivated', 403);
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Convert to object and strip password field explicitly
    const userResponse = user.toObject();
    delete userResponse.password;

    return successResponse(
      res,
      { token, user: userResponse },
      'Login successful',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get authenticated user profile
 * GET /api/auth/profile or GET /api/auth/me
 */
export const getProfile = async (req, res, next) => {
  try {
    // req.user has already been populated by protect middleware (excluding password)
    return successResponse(res, req.user, 'Profile retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Update authenticated user profile
 * PUT /api/auth/profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    // Re-fetch the user to handle password updates
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const { name, oldPassword, newPassword } = req.body;

    // Allow updating the name field only
    if (name) {
      user.name = name;
    }

    // If new password is provided, validate current password first
    if (newPassword) {
      if (!oldPassword) {
        return errorResponse(res, 'Old password is required to update password', 400);
      }
      
      const isMatch = await user.comparePassword(oldPassword);
      if (!isMatch) {
        return errorResponse(res, 'Incorrect old password', 401);
      }

      user.password = newPassword;
    }

    // Save user changes (pre-save middleware handles automatic hashing if password changed)
    await user.save();

    // Convert to object and strip password field explicitly
    const userResponse = user.toObject();
    delete userResponse.password;

    return successResponse(res, userResponse, 'Profile updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

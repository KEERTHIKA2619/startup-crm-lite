import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Helper function to generate a JWT token for a given user ID.
 * 
 * @param {string|mongoose.Types.ObjectId} userId - The ID of the authenticated user.
 * @returns {string} Signed JWT.
 */
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Registers a new user inside the CRM system.
 * 
 * @async
 * @function register
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware.
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'Email already exists', 409);
    }

    // Create a new User document. Note: Password will be hashed in the schema pre-save hook.
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate JWT for the user
    const token = generateToken(user._id);

    // Return created status, Mongoose toJSON() will strip out the password automatically
    return successResponse(
      res,
      { token, user },
      'User registered successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticates user credentials and issues a JWT token.
 * 
 * @async
 * @function login
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find the user and explicitly select password since select: false is set on the model
    const user = await User.findOne({ email }).select('+password');
    
    // For security reasons, do not specify if the email or password is the invalid parameter
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Validate the plain text password against the hashed password using model instance method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Check if the user account is active
    if (!user.isActive) {
      return errorResponse(res, 'Account is deactivated', 403);
    }

    // Generate token
    const token = generateToken(user._id);

    // Remove password before response serialization
    user.password = undefined;

    return successResponse(
      res,
      { token, user },
      'Login successful'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves the currently authenticated user's profile.
 * 
 * @function getProfile
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware.
 */
export const getProfile = async (req, res, next) => {
  try {
    // req.user is already populated by the protect middleware without the password field
    return successResponse(res, req.user, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Updates the profile details (name and/or password) of the authenticated user.
 * 
 * @async
 * @function updateProfile
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware.
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, oldPassword, newPassword } = req.body;

    // If password change is requested
    if (newPassword) {
      if (!oldPassword) {
        return errorResponse(
          res,
          'Please provide your current password to set a new password',
          400
        );
      }

      // Load user with password field to verify the old password
      const userWithPassword = await User.findById(req.user._id).select('+password');
      if (!userWithPassword) {
        return errorResponse(res, 'User no longer exists', 404);
      }

      // Verify the old password matches the DB record
      const isMatch = await userWithPassword.comparePassword(oldPassword);
      if (!isMatch) {
        return errorResponse(res, 'Invalid current password', 401);
      }

      // Update password (pre-save middleware hashes this automatically)
      userWithPassword.password = newPassword;

      if (name) {
        userWithPassword.name = name;
      }

      await userWithPassword.save();

      // Retrieve clean updated user document
      const updatedUser = await User.findById(req.user._id);
      return successResponse(
        res,
        updatedUser,
        'Profile and password updated successfully'
      );
    }

    // If only updating the name
    if (name) {
      req.user.name = name;
      await req.user.save();
    }

    return successResponse(
      res,
      req.user,
      'Profile updated successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Ends the authenticated session (placeholder logout implementation).
 * 
 * @async
 * @function logout
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware.
 */
export const logout = async (req, res, next) => {
  try {
    return successResponse(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Protect Middleware
 * Ensures the incoming request contains a valid JWT in the Authorization header.
 * Attaches the authenticated user to the request object (req.user).
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Extract token from Authorization header: 'Bearer <token>'
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 2. Check if token is missing
    if (!token) {
      return errorResponse(res, 'No token provided, access denied', 401);
    }

    try {
      // 3. Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("TOKEN:", token);
      console.log("DECODED:", decoded);
      console.log("JWT_SECRET:", process.env.JWT_SECRET);

      // 4. Find the user in database, excluding the password field
      const user = await User.findById(decoded.id).select('-password');

      // 5. Check if user still exists in the database
      if (!user) {
        return errorResponse(res, 'User belonging to this token no longer exists', 401);
      }

      // 6. Attach authenticated user to the request object
      req.user = user;
      next();
    } catch (jwtError) {
      // Handle expired token case
      if (jwtError.name === 'TokenExpiredError') {
        return errorResponse(res, 'Token has expired, please login again', 401);
      }
      // Handle invalid token case (malformed signature, bad key, etc.)
      return errorResponse(res, 'Token is invalid', 401);
    }
  } catch (error) {
    // Forward any unexpected errors to the global error handler
    next(error);
  }
};

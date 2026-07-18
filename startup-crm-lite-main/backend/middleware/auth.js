import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Authentication protector middleware.
 * Verifies the incoming JSON Web Token (JWT) from the Authorization header,
 * checks if the user exists and is active, and attaches the user document to req.user.
 * 
 * @async
 * @function protect
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware reference.
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Extract token from Authorization header (Bearer <token>)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. Return error if token is completely missing
  if (!token) {
    return errorResponse(res, 'No token provided, access denied', 401);
  }

  try {
    // 3. Verify JWT signature using the configured secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Find the user in the database, excluding the password field
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return errorResponse(res, 'User belonging to this token no longer exists', 401);
    }

    // 5. Attach the user object to the request for downstream routes
    req.user = user;
    next();
  } catch (error) {
    // 6. Handle specific JWT expiration errors
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token has expired, please login again', 401);
    }
    
    // 7. Handle other general JWT validation errors
    return errorResponse(res, 'Token is invalid', 401);
  }
};

export default protect;

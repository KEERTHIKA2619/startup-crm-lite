import { errorResponse } from '../utils/apiResponse.js';

/**
 * Global Express error handling middleware.
 * Intercepts all unhandled errors thrown in route handlers and formats them.
 * 
 * @param {Object} err - Error object.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware reference.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server error';
  let errors = null;

  // Log error to console for server-side visibility (optional but good practice)
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  // 1. Mongoose Validation Error (ValidationError)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = {};
    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message;
    });
  }

  // 2. Mongoose Cast Error (e.g. invalid MongoDB ObjectId format)
  else if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // 3. MongoDB Duplicate Key Error (Code 11000)
  else if (err.code === 11000) {
    statusCode = 409;
    message = 'Email already exists';
  }

  // 4. JWT Signatures or Verification Failure (JsonWebTokenError)
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please authenticate.';
  }

  // 5. JWT Expiration Failure (TokenExpiredError)
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired. Please log in again.';
  }

  // In development mode, append the stack trace to make debugging straightforward
  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      stack: err.stack
    });
  }

  // In production mode, never send stack traces to the client
  return errorResponse(res, message, statusCode, errors);
};

export default errorHandler;

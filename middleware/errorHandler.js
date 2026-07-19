import { errorResponse } from '../utils/apiResponse.js';

/**
 * Global Express Error Handler Middleware
 * Handles database, authentication, validation, and general application errors.
 */
export const errorHandler = (err, req, res, next) => {
  // Log the complete error stack in console for development debugging
  console.error('Error encountered:', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server error';
  let errors = null;

  // 1. Mongoose ValidationError -> 400 Bad Request
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = {};
    // Extract field-by-field error messages
    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message;
    });
  }

  // 2. Mongoose CastError (Invalid MongoDB ObjectId) -> 404 Not Found
  else if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // 3. MongoDB Duplicate Key Error (code 11000) -> 409 Conflict
  else if (err.code === 11000) {
    statusCode = 409;
    message = 'Email already exists';
  }

  // 4. JSON Web Token Errors -> 401 Unauthorized
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your token has expired. Please log in again.';
  }

  // If in development mode, include the stack trace in the response
  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      stack: err.stack,
    });
  }

  // In production mode, omit the stack trace using standard helper
  return errorResponse(res, message, statusCode, errors);
};

import { errorResponse } from '../utils/apiResponse.js';

export const errorHandler = (err, req, res, next) => {
  console.error('Error encountered:', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server error';
  let errors = null;

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = {};
    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message;
    });
  }

  else if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  else if (err.code === 11000) {
    statusCode = 409;
    message = 'Email already exists';
  }

  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your token has expired. Please log in again.';
  }

  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      stack: err.stack,
    });
  }

  return errorResponse(res, message, statusCode, errors);
};

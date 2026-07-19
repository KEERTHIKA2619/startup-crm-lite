import { validationResult } from 'express-validator';

/**
 * Validation Middleware Creator
 * Runs validation checks, formats errors, and handles responses.
 * @param {Array} validations - Array of express-validator checks
 * @returns {Function} Express middleware function
 */
export const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validation rules sequentially
    for (const validation of validations) {
      await validation.run(req);
    }

    // Gather errors from the validation runner
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Map error formats: return `{ success: false, errors: [{ field, message }] }`
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      errors: formattedErrors,
    });
  };
};

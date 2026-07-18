import { validationResult } from 'express-validator';

/**
 * Express middleware runner for express-validator array validation chains.
 * Resolves each verification constraint and intercepts request execution if errors are found.
 * 
 * @function validate
 * @param {Array<Object>} validations - Array of validation rules (e.g. body(), param() chains).
 * @returns {Function} Express route handler middleware.
 */
export const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations asynchronously
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Map errors into the requested format: { success: false, errors: [{ field, message }] }
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param, // Handles express-validator v7 field mapping
      message: err.msg
    }));

    return res.status(400).json({
      success: false,
      errors: formattedErrors
    });
  };
};

export default validate;

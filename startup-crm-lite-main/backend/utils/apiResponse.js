/**
 * Utility functions for formatting consistent JSON API responses.
 * Provides unified interfaces for success, error, and paginated outputs.
 */

/**
 * Formats and sends a success JSON response.
 * 
 * @param {Object} res - Express response object.
 * @param {*} data - Payload data to include in the response.
 * @param {string} message - Descriptive message indicating the outcome of the request.
 * @param {number} [statusCode=200] - HTTP status code to return.
 */
export const successResponse = (res, data, message, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Formats and sends an error JSON response.
 * 
 * @param {Object} res - Express response object.
 * @param {string} message - Error message indicating what went wrong.
 * @param {number} [statusCode=500] - HTTP status code to return.
 * @param {*} [errors=null] - Detailed error mapping, validation issues, or error arrays.
 */
export const errorResponse = (res, message, statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

/**
 * Formats and sends a paginated list JSON response.
 * 
 * @param {Object} res - Express response object.
 * @param {Array} data - Paginated list array of records.
 * @param {number} total - Total count of matching records in the DB.
 * @param {number} page - The current page index of the request.
 * @param {number} limit - The max count of items requested per page.
 */
export const paginatedResponse = (res, data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      pages:   totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
};

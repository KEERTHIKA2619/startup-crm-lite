/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {any} data - Data to send in the response
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export const successResponse = (res, data, message, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {any} errors - Detailed errors object/array (default: null)
 */
export const errorResponse = (res, message, statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

/**
 * Send a paginated success response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of data records
 * @param {number} total - Total number of records
 * @param {number} page - Current page number
 * @param {number} limit - Records per page limit
 */
export const paginatedResponse = (res, data, total, page, limit) => {
  const pages = Math.ceil(total / limit) || 0;
  const hasNext = page < pages;
  const hasPrev = page > 1;
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      pages,
      hasNext,
      hasPrev,
    },
  });
};

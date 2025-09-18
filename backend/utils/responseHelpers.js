/**
 * Higher-order function to wrap async route handlers with error handling
 * @param {Function} fn - The async route handler function
 * @returns {Function} - Wrapped function with error handling
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    console.error('Error in route handler:', error);
    res.status(500).json({ error: error.message });
  });
};

/**
 * Standard error response helper
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 * @param {number} statusCode - HTTP status code (default: 500)
 */
export const sendErrorResponse = (res, error, statusCode = 500) => {
  console.error('Error:', error);
  res.status(statusCode).json({ error: error.message });
};

/**
 * Standard success response helper
 * @param {Object} res - Express response object
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export const sendSuccessResponse = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    message,
    data,
    timestamp: new Date().toISOString()
  });
};
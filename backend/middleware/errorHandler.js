const logger = require('../src/utils/logger');
const { errorResponse } = require('../src/utils/response');

// Global error handler middleware
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  logger.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Default error status and message
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Don't expose internal errors in production
  const errorMessage = statusCode === 500 && process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : message;

  // Use standardized error response
  const errors = process.env.NODE_ENV === 'development' && err.stack 
    ? [{ stack: err.stack }] 
    : null;

  return errorResponse(res, errorMessage, statusCode, errors);
};

// 404 handler
// eslint-disable-next-line no-unused-vars
const notFoundHandler = (req, res, next) => {
  return errorResponse(res, `Route ${req.originalUrl} not found`, 404);
};

module.exports = { errorHandler, notFoundHandler };

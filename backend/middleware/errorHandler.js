// Global error handler middleware
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Log error for debugging (in production, use proper logging service)
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Default error status and message
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Don't expose internal errors in production
  const response = {
    message: statusCode === 500 && process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : message,
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

// 404 handler
// eslint-disable-next-line no-unused-vars
const notFoundHandler = (req, res, next) => {
  res.status(404).json({ 
    message: `Route ${req.originalUrl} not found` 
  });
};

module.exports = { errorHandler, notFoundHandler };

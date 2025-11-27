const logger = require('../utils/logger');

/**
 * Performance monitoring middleware
 * Tracks request duration and logs slow requests
 */
const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();

  // Store original end function
  const originalEnd = res.end;

  // Override end function to calculate duration
  res.end = function(...args) {
    const duration = Date.now() - startTime;
    
    // Add performance header BEFORE ending response
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${duration}ms`);
    }
    
    // Call original end function
    originalEnd.apply(res, args);
    
    // Log request details AFTER response is sent
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    };

    // Log slow requests (> 1000ms) as warnings
    if (duration > 1000) {
      logger.warn('Slow request detected', logData);
    } else if (duration > 500) {
      logger.info('Request completed', logData);
    }
  };

  next();
};

module.exports = performanceMonitor;

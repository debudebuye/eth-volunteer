/**
 * Upload Middleware - Hybrid Approach
 * Uses local storage in development, Cloudinary in production
 */

const { createUploadMiddleware } = require('../src/config/cloudinary');

// Create upload middleware based on environment
const upload = createUploadMiddleware();

module.exports = upload;

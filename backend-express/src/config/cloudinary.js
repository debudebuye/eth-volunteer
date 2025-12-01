/**
 * Cloudinary Configuration
 * Hybrid approach: Use local storage in development, Cloudinary in production
 */

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

// Cloudinary storage configuration
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'eth-volunteer/events', // Folder in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1200, height: 800, crop: 'limit' }, // Limit max size
      { quality: 'auto' }, // Automatic quality optimization
      { fetch_format: 'auto' }, // Automatic format selection
    ],
  },
});

// Local storage configuration (for development)
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

// File filter for both storages
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
  }
};

// Create multer upload middleware based on environment
const createUploadMiddleware = () => {
  const useCloudinary = isCloudinaryConfigured() && process.env.NODE_ENV === 'production';
  
  console.log(`📸 Image storage: ${useCloudinary ? 'Cloudinary (Production)' : 'Local File System (Development)'}`);
  
  return multer({
    storage: useCloudinary ? cloudinaryStorage : localStorage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  });
};

// Helper function to get image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL (Cloudinary), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a local path, return the path (will be served by Express static)
  return imagePath;
};

// Helper function to delete image
const deleteImage = async (imagePath) => {
  if (!imagePath) return;
  
  try {
    // If it's a Cloudinary URL, extract public_id and delete from Cloudinary
    if (imagePath.includes('cloudinary.com')) {
      const publicId = imagePath.split('/').slice(-2).join('/').split('.')[0];
      await cloudinary.uploader.destroy(`eth-volunteer/events/${publicId}`);
      console.log('✅ Image deleted from Cloudinary:', publicId);
    } else {
      // If it's a local file, delete from file system
      const filePath = path.join(__dirname, '../../', imagePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('✅ Image deleted from local storage:', imagePath);
      }
    }
  } catch (error) {
    console.error('❌ Error deleting image:', error.message);
  }
};

module.exports = {
  cloudinary,
  createUploadMiddleware,
  getImageUrl,
  deleteImage,
  isCloudinaryConfigured,
};

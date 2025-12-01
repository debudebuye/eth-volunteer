# Cloudinary Integration - Hybrid Approach

## Overview

This app uses a **hybrid approach** for image storage:
- **Development:** Local file system (`backend-express/uploads/`)
- **Production:** Cloudinary (cloud storage with CDN)

The system automatically switches based on environment variables.

## How It Works

### Development Mode
- Images saved to `backend-express/uploads/` folder
- Fast and free
- No external dependencies
- Perfect for local development

### Production Mode
- Images uploaded to Cloudinary
- Automatic CDN delivery
- Image optimization
- Scalable and reliable
- Requires Cloudinary account (free tier available)

## Setup Instructions

### For Development (Current Setup)
✅ **Already configured!** No action needed.

Images are automatically saved to local file system.

### For Production Deployment

#### Step 1: Create Cloudinary Account
1. Go to https://cloudinary.com/users/register/free
2. Sign up for a free account (no credit card required)
3. Verify your email

#### Step 2: Get Your Credentials
1. Log in to Cloudinary Dashboard
2. Go to Dashboard → Settings → Access Keys
3. Copy these values:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

#### Step 3: Configure Environment Variables
Add these to your production `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here

# Set environment to production
NODE_ENV=production
```

#### Step 4: Deploy
Deploy your app with the new environment variables. The system will automatically use Cloudinary!

## Features

### Automatic Switching
```javascript
// The system checks:
// 1. Are Cloudinary credentials configured?
// 2. Is NODE_ENV set to 'production'?
// If YES to both → Use Cloudinary
// If NO → Use local storage
```

### Image Optimization
Cloudinary automatically:
- ✅ Optimizes image quality
- ✅ Converts to best format (WebP, etc.)
- ✅ Resizes to max 1200x800px
- ✅ Serves via CDN for fast loading

### File Size Limits
- Maximum file size: 5MB
- Allowed formats: JPEG, PNG, GIF, WebP

## Cloudinary Free Tier

Perfect for your volunteer app:
- ✅ 25 GB storage
- ✅ 25 GB bandwidth/month
- ✅ 25,000 transformations/month
- ✅ Built-in CDN
- ✅ No credit card required

**Capacity:** ~25,000 event images (at 1MB each)

## Testing

### Test Local Storage (Development)
```bash
# Make sure these are NOT set in .env
# CLOUDINARY_CLOUD_NAME=
# CLOUDINARY_API_KEY=
# CLOUDINARY_API_SECRET=

npm start
# Upload an image → Check backend-express/uploads/
```

### Test Cloudinary (Production)
```bash
# Set Cloudinary credentials in .env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NODE_ENV=production

npm start
# Upload an image → Check Cloudinary Dashboard
```

## Troubleshooting

### Images not uploading
1. Check console logs for error messages
2. Verify Cloudinary credentials are correct
3. Check file size (must be < 5MB)
4. Check file format (JPEG, PNG, GIF, WebP only)

### Images not displaying
1. Check if image URL is correct in database
2. For local: Check if file exists in `uploads/` folder
3. For Cloudinary: Check Cloudinary Dashboard
4. Check Content Security Policy allows the image source

### Switching between local and Cloudinary
1. **To use local:** Remove Cloudinary env vars or set `NODE_ENV=development`
2. **To use Cloudinary:** Add Cloudinary env vars and set `NODE_ENV=production`
3. Restart the server after changing env vars

## Migration Guide

### Moving from Local to Cloudinary
If you have existing images in local storage and want to move to Cloudinary:

1. Keep existing images in `uploads/` folder
2. Configure Cloudinary for new uploads
3. Old images will still work (served by Express static)
4. New images will go to Cloudinary
5. Optionally: Migrate old images using Cloudinary's upload API

## File Structure

```
backend-express/
├── src/
│   └── config/
│       └── cloudinary.js          # Cloudinary configuration
├── middleware/
│   └── upload.js                  # Upload middleware (hybrid)
├── uploads/                       # Local storage (development)
└── .env                          # Environment variables
```

## API Response

### Image URL Format

**Development (Local):**
```json
{
  "image": "/uploads/1764530966353.jpg"
}
```

**Production (Cloudinary):**
```json
{
  "image": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/eth-volunteer/events/abc123.jpg"
}
```

Both formats work seamlessly in the frontend!

## Security

### Local Storage
- Files stored in `uploads/` folder
- Served by Express static middleware
- Protected by server-side validation

### Cloudinary
- Files stored in Cloudinary cloud
- Served via secure CDN
- API keys kept in environment variables
- Never exposed to frontend

## Cost Considerations

### Development
- **Cost:** $0 (free)
- **Storage:** Limited by disk space

### Production (Cloudinary Free Tier)
- **Cost:** $0 for up to 25GB
- **After free tier:** ~$0.10/GB/month
- **Very affordable** for most apps

## Support

For issues or questions:
1. Check this documentation
2. Check Cloudinary docs: https://cloudinary.com/documentation
3. Check console logs for error messages
4. Review the code in `src/config/cloudinary.js`

## Summary

✅ **Development:** Use local storage (automatic)
✅ **Production:** Use Cloudinary (configure env vars)
✅ **Automatic switching:** Based on environment
✅ **Free tier:** 25GB storage, perfect for your app
✅ **Easy setup:** Just add 3 environment variables

Your app is now production-ready for image storage! 🎉

# Quick Start Guide

Get your Ethiopian Volunteer Platform backend up and running in 5 minutes!

## Prerequisites

- Node.js 16+ installed
- MongoDB database (local or Atlas)
- Gmail account for email notifications

## Step 1: Install Dependencies (1 min)

```bash
npm install
```

## Step 2: Configure Environment (2 min)

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and update these critical values:

```env
# Your MongoDB connection string
MONGO_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/volunteer-db

# Generate a strong secret (run this command):
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=paste-generated-secret-here

# Your Gmail for notifications
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Frontend URL (update when you deploy)
FRONTEND_URL=http://localhost:3000
```

### Getting Gmail App Password

1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Go to Security → App Passwords
4. Generate password for "Mail"
5. Copy and paste into `EMAIL_PASS`

## Step 3: Start the Server (1 min)

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

You should see:
```
✅ MongoDB Connected
Server running on port 5000
Environment: development
```

## Step 4: Test the API (1 min)

### Check Health
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-21T10:00:00.000Z",
  "environment": "development"
}
```

### Register a Test User
```bash
curl -X POST http://localhost:5000/api/auth/register/volunteer \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123",
    "location": "Addis Ababa"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Volunteer registered successfully",
  "data": {
    "message": "Volunteer registered successfully",
    "userId": "..."
  }
}
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

You'll get a token in the response. Copy it for the next step.

### Test Protected Route
```bash
curl -X GET http://localhost:5000/api/events/pending \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🎉 Success!

Your API is now running! Here's what you can do next:

### Explore the API

- **Health Check**: `GET /health`
- **API Info**: `GET /`
- **Register Volunteer**: `POST /api/auth/register/volunteer`
- **Register NGO**: `POST /api/auth/register/ngo`
- **Login**: `POST /api/auth/login`
- **Get Events**: `GET /api/events/approved`

### View Documentation

- **API Docs**: See [README.md](./README.md)
- **Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Security**: See [SECURITY_NOTES.md](./SECURITY_NOTES.md) in the docs folder

### Run Tests

```bash
npm test
```

### Check Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## Common Issues

### Issue: "Cannot connect to MongoDB"
**Solution**: Check your `MONGO_URI` in `.env`

### Issue: "JWT_SECRET is not defined"
**Solution**: Make sure `JWT_SECRET` is set in `.env`

### Issue: "Port 5000 already in use"
**Solution**: Change `PORT` in `.env` or kill the process using port 5000

### Issue: "Email sending failed"
**Solution**: 
1. Make sure you're using an App-Specific Password, not your regular Gmail password
2. Check that 2FA is enabled on your Google account

## Next Steps

1. **Connect Frontend**: Update your frontend to use `http://localhost:5000`
2. **Create Admin**: Register an admin account
3. **Test Workflows**: Try creating events, approving them, etc.
4. **Read Docs**: Check out the comprehensive documentation
5. **Deploy**: When ready, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## Development Workflow

```bash
# Start development server with auto-reload
npm run dev

# In another terminal, run tests in watch mode
npm run test:watch

# Check code quality
npm run lint
npm run format
```

## Project Structure Overview

```
eth-volunteer-backend/
├── src/
│   ├── controllers/    # Handle HTTP requests
│   ├── services/       # Business logic
│   ├── repositories/   # Database operations
│   ├── routes/         # API routes
│   └── utils/          # Helpers
├── models/             # Database schemas
├── middleware/         # Express middleware
├── tests/              # Test files
└── server.js           # Entry point
```

## Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests
npm run test:watch # Run tests in watch mode
npm run lint       # Check code quality
npm run lint:fix   # Fix linting issues
npm run format     # Format code with Prettier
```

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGO_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | Secret for JWT signing | Yes | - |
| `NODE_ENV` | Environment | No | development |
| `PORT` | Server port | No | 5000 |
| `FRONTEND_URL` | Frontend URL for CORS | Yes | - |
| `BACKEND_BASEURL` | Backend URL | Yes | - |
| `EMAIL_USER` | Email username | Yes | - |
| `EMAIL_PASS` | Email password | Yes | - |
| `LOG_LEVEL` | Logging level | No | info |

## Support

- **Documentation**: Check the docs folder
- **Issues**: Create an issue on GitHub
- **Questions**: See [README.md](./README.md)

## Tips

1. **Use Postman**: Import the API endpoints for easier testing
2. **Check Logs**: Look in `logs/` folder for detailed logs
3. **Monitor Health**: Regularly check `/health` endpoint
4. **Read Code**: The code is well-documented, explore it!
5. **Write Tests**: Add tests as you add features

---

**Ready to build something amazing!** 🚀

For detailed information, see:
- [README.md](./README.md) - Full documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture details
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Migration from v1.0
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment instructions

# 🚀 Quick Start Guide

Get the NestJS backend running in 5 minutes!

## Step 1: Install Dependencies

```bash
cd backend-nestjs
npm install
```

## Step 2: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` and update these **required** variables:

```env
# Your MongoDB connection string
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/volunteer-db

# Generate strong secrets (run these commands):
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=<your-generated-secret>
JWT_REFRESH_SECRET=<your-generated-secret>

# Your Gmail credentials for email notifications
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# Your frontend URL
FRONTEND_URL=http://localhost:3000
```

### Generate Strong Secrets

Run this command twice to generate two different secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output for `JWT_SECRET` and `JWT_REFRESH_SECRET`.

## Step 3: Start the Server

```bash
# Development mode with hot reload
npm run start:dev
```

You should see:
```
🚀 Server running on http://localhost:5000
📚 API Documentation: http://localhost:5000/api/docs
🌍 Environment: development
```

## Step 4: Test the API

### Option 1: Use Swagger UI (Recommended)

1. Open http://localhost:5000/api/docs
2. Try the endpoints interactively
3. No additional tools needed!

### Option 2: Use cURL

```bash
# Health check
curl http://localhost:5000/health

# Register a user
curl -X POST http://localhost:5000/api/v1/auth/register/user \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123!",
    "location": "Addis Ababa"
  }'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login/user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

### Option 3: Use Postman

Import this collection: http://localhost:5000/api/docs-json

## 🎉 You're Done!

The API is now running and ready to use.

## 📚 Next Steps

1. **Read the API docs**: http://localhost:5000/api/docs
2. **Check the README**: See `README.md` for full documentation
3. **Review security**: See `MIGRATION_FROM_EXPRESS.md` for improvements

## 🐛 Troubleshooting

### MongoDB Connection Error

```
Error: MongooseError: The `uri` parameter to `openUri()` must be a string
```

**Solution**: Make sure `MONGO_URI` is set in your `.env` file.

### JWT Secret Error

```
Error: JWT_SECRET is not defined
```

**Solution**: Generate and set `JWT_SECRET` in your `.env` file.

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution**: Change `PORT` in `.env` or stop the other process using port 5000.

### Email Error

```
Error: Invalid login
```

**Solution**: 
1. Use a Gmail App Password, not your regular password
2. Enable 2FA on your Google account
3. Generate an App Password: https://myaccount.google.com/apppasswords

## 📞 Need Help?

- Check the logs in the terminal
- Review the `.env.example` file
- Read the full `README.md`
- Check the Swagger docs at http://localhost:5000/api/docs

---

**Happy coding! 🎉**

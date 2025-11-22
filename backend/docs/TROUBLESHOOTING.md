# Troubleshooting Guide

## ❌ MongoDB Connection Failed

### Error Message
```
❌ MongoDB Connection Failed: querySrv ENOTFOUND _mongodb._tcp.cluster0.lprmy.mongodb.net
```

### Cause
This error occurs when:
1. MongoDB Atlas cluster is not accessible
2. DNS resolution fails
3. Network/firewall issues
4. Incorrect connection string

### Solutions

#### Solution 1: Check MongoDB Atlas Cluster
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Log in to your account
3. Check if your cluster is running
4. Verify the cluster name matches your connection string

#### Solution 2: Update Connection String
Example connection string format:
```
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

**Option A: Add Database Name**
```env
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/volunteer-db?retryWrites=true&w=majority&appName=Cluster0
```

**Option B: Use Standard Connection (not SRV)**
```env
MONGO_URI=mongodb://USERNAME:PASSWORD@cluster0-shard-00-00.xxxxx.mongodb.net:27017,cluster0-shard-00-01.xxxxx.mongodb.net:27017,cluster0-shard-00-02.xxxxx.mongodb.net:27017/volunteer-db?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
```

Replace `USERNAME` and `PASSWORD` with your actual MongoDB credentials.

#### Solution 3: Whitelist Your IP Address
1. Go to MongoDB Atlas Dashboard
2. Click "Network Access" in the left sidebar
3. Click "Add IP Address"
4. Choose "Add Current IP Address" or "Allow Access from Anywhere" (0.0.0.0/0)
5. Click "Confirm"
6. Wait 1-2 minutes for changes to propagate

#### Solution 4: Check Database User
1. Go to MongoDB Atlas Dashboard
2. Click "Database Access" in the left sidebar
3. Verify user "duplex" exists
4. Check password is correct
5. Ensure user has "Read and write to any database" permission

#### Solution 5: Use Local MongoDB (Development)
If you want to use local MongoDB for development:

1. **Install MongoDB locally**
   - Windows: Download from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Mac: `brew install mongodb-community`
   - Linux: `sudo apt-get install mongodb`

2. **Start MongoDB**
   ```bash
   # Windows
   mongod

   # Mac/Linux
   brew services start mongodb-community
   # or
   sudo systemctl start mongod
   ```

3. **Update .env**
   ```env
   MONGO_URI=mongodb://localhost:27017/volunteer-db
   ```

#### Solution 6: Test Connection
Create a test script to verify connection:

```javascript
// test-db.js
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Failed:', err.message);
    process.exit(1);
  });
```

Run it:
```bash
node test-db.js
```

### Quick Fix for Development

If you need to get started quickly, use MongoDB Atlas free tier:

1. **Create New Cluster** (if needed)
   - Go to [MongoDB Atlas](https://cloud.mongodb.com/)
   - Click "Build a Database"
   - Choose "Free" tier (M0)
   - Select a region close to you
   - Click "Create"

2. **Create Database User**
   - Click "Database Access"
   - Click "Add New Database User"
   - Username: `volunteer-admin`
   - Password: Generate a strong password
   - Database User Privileges: "Atlas admin"
   - Click "Add User"

3. **Whitelist IP**
   - Click "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

4. **Get Connection String**
   - Click "Database" in left sidebar
   - Click "Connect" on your cluster
   - Click "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Add database name: `/volunteer-db`

5. **Update .env**
   ```env
   MONGO_URI=mongodb+srv://volunteer-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/volunteer-db?retryWrites=true&w=majority
   ```

## Other Common Issues

### Issue: Port 5000 Already in Use
**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

Or change port in `.env`:
```env
PORT=5001
```

### Issue: JWT_SECRET Not Defined
**Error**: `JWT_SECRET is not defined in environment variables`

**Solution**:
Generate a strong secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Add to `.env`:
```env
JWT_SECRET=your_generated_secret_here
```

### Issue: Email Sending Failed
**Error**: `Invalid login: 535-5.7.8 Username and Password not accepted`

**Cause**: Gmail requires App-Specific Password, not your regular password.

**Solution** (5 minutes):

1. **Enable 2-Factor Authentication**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Click "2-Step Verification"
   - Follow the setup process

2. **Generate App-Specific Password**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Click "2-Step Verification"
   - Scroll down to "App passwords"
   - Click "App passwords"
   - Select "Mail" and "Other (Custom name)"
   - Enter "Ethiopian Volunteer API"
   - Click "Generate"
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

3. **Update .env**
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=abcdefghijklmnop
   ```
   (Remove spaces from the password)

4. **Restart Server**
   ```bash
   npm run dev
   ```

**Alternative**: Use a different email service (SendGrid, Mailgun, etc.)

**For Development**: You can skip email setup. The API will work without it, but event approval emails won't be sent.

### Issue: CORS Errors
**Error**: `Access to fetch at 'http://localhost:5000' from origin 'http://localhost:3000' has been blocked by CORS`

**Solution**:
Update `FRONTEND_URL` in `.env`:
```env
FRONTEND_URL=http://localhost:3000
```

### Issue: Module Not Found
**Error**: `Cannot find module 'express'`

**Solution**:
```bash
npm install
```

### Issue: Validation Errors
**Error**: `Validation failed`

**Solution**:
Check request body matches validation rules:
- Email must be valid format
- Password must be at least 8 characters
- Password must contain uppercase, lowercase, and number
- All required fields must be present

## 🔍 Debugging Tips

### 1. Check Environment Variables
```bash
# Windows
echo %MONGO_URI%

# Mac/Linux
echo $MONGO_URI
```

### 2. Enable Debug Logging
Add to `.env`:
```env
LOG_LEVEL=debug
```

### 3. Check Server Logs
Look in `logs/` folder for detailed error logs.

### 4. Test Individual Components
```bash
# Test database connection
node test-db.js

# Test server startup
npm start

# Run tests
npm test
```

### 5. Verify Dependencies
```bash
npm list
```

## 📞 Still Having Issues?

1. **Check the logs**: Look in `logs/combined.log` and `logs/error.log`
2. **Enable debug mode**: Set `LOG_LEVEL=debug` in `.env`
3. **Test connection**: Use the test script above
4. **Check MongoDB Atlas**: Verify cluster is running
5. **Review documentation**: See [docs/README.md](./docs/README.md)

## 🆘 Emergency Fallback

If nothing works, use this minimal configuration for testing:

1. **Install MongoDB locally** (see Solution 5 above)
2. **Use local connection**:
   ```env
   MONGO_URI=mongodb://localhost:27017/volunteer-db
   ```
3. **Restart server**: `npm run dev`

This will get you running locally while you troubleshoot the Atlas connection.

---

**Need more help?** Check the [documentation](./docs/README.md) or create an issue.

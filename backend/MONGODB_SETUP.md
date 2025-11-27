# MongoDB Setup Guide

## Current Issue
Your MongoDB Atlas cluster `debiancluster.iozuad6.mongodb.net` is not responding. This usually means:
- The cluster was deleted or paused
- The cluster hostname changed
- Network connectivity issues

## Solution Options

### Option 1: Fix MongoDB Atlas (Recommended for Production)

1. **Login to MongoDB Atlas**
   - Go to: https://cloud.mongodb.com
   - Login with your credentials

2. **Check Cluster Status**
   - Look for your cluster in the dashboard
   - If it says "Paused" → Click "Resume"
   - If it doesn't exist → Create a new cluster

3. **Create New Free Cluster (if needed)**
   - Click "Build a Database"
   - Choose "M0 Free" tier
   - Select a cloud provider and region (closest to you)
   - Name it (e.g., "volunteer-cluster")
   - Click "Create"

4. **Setup Database Access**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Username: `volunteer_user`
   - Password: Generate a secure password (save it!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

5. **Setup Network Access**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

6. **Get Connection String**
   - Go back to "Database" (Clusters)
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/`

7. **Update .env File**
   ```env
   MONGO_URI=mongodb+srv://volunteer_user:YOUR_PASSWORD@cluster.xxxxx.mongodb.net/volunteer-db?retryWrites=true&w=majority
   ```
   Replace:
   - `YOUR_PASSWORD` with the password you created
   - `cluster.xxxxx.mongodb.net` with your actual cluster hostname

### Option 2: Install MongoDB Locally (For Development)

#### Windows Installation

1. **Download MongoDB Community Server**
   - Go to: https://www.mongodb.com/try/download/community
   - Select: Windows, MSI package
   - Click "Download"

2. **Install MongoDB**
   - Run the downloaded .msi file
   - Choose "Complete" installation
   - Install as a Windows Service (recommended)
   - Install MongoDB Compass (GUI tool)

3. **Verify Installation**
   ```powershell
   mongod --version
   ```

4. **Start MongoDB Service**
   ```powershell
   net start MongoDB
   ```

5. **Update .env File**
   ```env
   MONGO_URI=mongodb://localhost:27017/volunteer-db
   ```

#### Alternative: MongoDB with Docker

If you have Docker installed:

```bash
# Pull MongoDB image
docker pull mongo:latest

# Run MongoDB container
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Update .env
MONGO_URI=mongodb://localhost:27017/volunteer-db
```

### Option 3: Use MongoDB Atlas Free Tier (Easiest)

If you don't want to install anything locally:

1. **Create New MongoDB Atlas Account** (if needed)
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Sign up for free

2. **Follow Option 1 steps above**

## Testing Connection

After updating your `.env` file, test the connection:

```bash
# In backend directory
npm start
```

You should see:
```
✅ MongoDB Connected
```

Instead of:
```
❌ MongoDB Connection Failed
```

## Troubleshooting

### Error: "Authentication failed"
- Check username and password in connection string
- Make sure user has correct permissions in Atlas

### Error: "Network timeout"
- Check IP whitelist in Atlas (should be 0.0.0.0/0)
- Check your internet connection
- Try a different network

### Error: "Server selection timeout"
- Cluster might be paused in Atlas
- Check cluster status in Atlas dashboard

### Local MongoDB not starting
```powershell
# Check if service is running
Get-Service MongoDB

# Start service
net start MongoDB

# If service doesn't exist, start manually
mongod --dbpath C:\data\db
```

## Current Configuration

Your `.env` is currently set to:
```env
MONGO_URI=mongodb://localhost:27017/volunteer-db
```

This expects MongoDB running locally on port 27017.

## Recommended Setup

For development: **Local MongoDB** (faster, no internet needed)
For production: **MongoDB Atlas** (managed, scalable, backups)

## Need Help?

1. Check MongoDB Atlas dashboard for cluster status
2. Verify connection string format
3. Test with MongoDB Compass (GUI tool)
4. Check firewall/antivirus settings

---

**Quick Start:**
1. Go to https://cloud.mongodb.com
2. Resume or create cluster
3. Get connection string
4. Update `.env` file
5. Restart backend server

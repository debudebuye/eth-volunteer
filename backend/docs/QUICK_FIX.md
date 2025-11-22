# 🚨 Quick Fix: MongoDB Connection Error

## The Problem
```
❌ MongoDB Connection Failed: querySrv ENOTFOUND _mongodb._tcp.cluster0.lprmy.mongodb.net
```

## ⚡ Quick Solutions (Try in Order)

### 1. Test Connection (30 seconds)
```bash
node test-db.js
```

This will tell you exactly what's wrong.

### 2. Add Database Name (1 minute)
Your `.env` has been updated. Restart the server:
```bash
npm run dev
```

### 3. Whitelist Your IP (2 minutes)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click "Network Access"
3. Click "Add IP Address"
4. Click "Allow Access from Anywhere" (0.0.0.0/0)
5. Click "Confirm"
6. Wait 1 minute, then restart server

### 4. Check Cluster Status (1 minute)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Check if your cluster is running (green status)
3. If paused, click "Resume"

### 5. Use Local MongoDB (5 minutes)
**For Development Only**

Update `.env`:
```env
MONGO_URI=mongodb://localhost:27017/volunteer-db
```

Install MongoDB:
- **Windows**: Download from [mongodb.com](https://www.mongodb.com/try/download/community)
- **Mac**: `brew install mongodb-community && brew services start mongodb-community`
- **Linux**: `sudo apt-get install mongodb && sudo systemctl start mongod`

Restart server:
```bash
npm run dev
```

## ✅ Success Indicators

When it works, you'll see:
```
✅ MongoDB Connected
Server running on port 5000
Environment: development
```

## 🆘 Still Not Working?

1. **Check credentials**: Verify username/password in MongoDB Atlas
2. **Check cluster name**: Ensure `cluster0.lprmy` is correct
3. **Read full guide**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## 📞 Common Fixes

### Wrong Password
Get new connection string from MongoDB Atlas:
1. Click "Database" → "Connect"
2. Choose "Connect your application"
3. Copy the connection string
4. Update `.env` with new string

### Cluster Paused
MongoDB Atlas free tier pauses after inactivity:
1. Go to your cluster
2. Click "Resume"
3. Wait 1-2 minutes
4. Restart server

### Network Issues
Try using your phone's hotspot to test if it's a network/firewall issue.

---

**Most Common Solution**: Whitelist your IP address in MongoDB Atlas (Solution #3)

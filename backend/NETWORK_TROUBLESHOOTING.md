# MongoDB Atlas Network Troubleshooting

## Current Issue
Your MongoDB Atlas cluster is **working fine** (visible in Atlas dashboard), but your local machine **cannot connect** due to DNS resolution failure.

**Error:** `queryTxt ETIMEOUT debiancluster.iozuad6.mongodb.net`

This means your network is blocking DNS SRV record lookups required by `mongodb+srv://` connections.

---

## Quick Fixes (Try in Order)

### 1. Change DNS to Google DNS (Recommended)

**Windows:**
1. Open Control Panel > Network and Internet > Network Connections
2. Right-click your network adapter > Properties
3. Select "Internet Protocol Version 4 (TCP/IPv4)" > Properties
4. Select "Use the following DNS server addresses"
5. Preferred DNS: `8.8.8.8`
6. Alternate DNS: `8.8.4.4`
7. Click OK and restart your network adapter

**Test:**
```powershell
ipconfig /flushdns
node backend/test-mongodb.js
```

### 2. Try Different Network

- Switch to mobile hotspot
- Try different WiFi network
- Disable VPN if using one
- Try with VPN if not using one

### 3. Use Standard MongoDB Connection (Not SRV)

Get the standard connection string from Atlas:

1. Go to MongoDB Atlas: https://cloud.mongodb.com
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. **Important:** Select driver version "4.2 or later" (not 4.1 or earlier)
5. Copy the connection string that starts with `mongodb://` (not `mongodb+srv://`)
6. It will look like:
   ```
   mongodb://debiancluster-shard-00-00.iozuad6.mongodb.net:27017,debiancluster-shard-00-01.iozuad6.mongodb.net:27017,debiancluster-shard-00-02.iozuad6.mongodb.net:27017/?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin
   ```
7. Add your credentials and database name:
   ```
   mongodb://debadeba015_db_user:a1B43K7MD3w983a0@debiancluster-shard-00-00.iozuad6.mongodb.net:27017,debiancluster-shard-00-01.iozuad6.mongodb.net:27017,debiancluster-shard-00-02.iozuad6.mongodb.net:27017/volunteer-db?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
   ```
8. Update `backend/.env` with this connection string

### 4. Check Firewall/Antivirus

- Temporarily disable firewall
- Temporarily disable antivirus
- Check if corporate network is blocking MongoDB ports (27017)

### 5. Flush DNS and Reset Network

```powershell
# Flush DNS
ipconfig /flushdns

# Reset Winsock
netsh winsock reset

# Reset TCP/IP
netsh int ip reset

# Restart computer
```

---

## Alternative: Use Local MongoDB for Development

If network issues persist, install MongoDB locally:

### Install MongoDB Community Server

1. Download: https://www.mongodb.com/try/download/community
2. Install as Windows Service
3. Update `.env`:
   ```env
   MONGO_URI=mongodb://localhost:27017/volunteer-db
   ```

### Or Use Docker

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

---

## Testing Connection

After trying any fix:

```bash
cd backend
node test-mongodb.js
```

**Success looks like:**
```
✅ MongoDB Connected Successfully!
Database: volunteer-db
```

**Failure looks like:**
```
❌ MongoDB Connection Failed:
Error: queryTxt ETIMEOUT debiancluster.iozuad6.mongodb.net
```

---

## Why This Happens

### DNS SRV Records
MongoDB Atlas uses `mongodb+srv://` which requires DNS SRV record lookups. Some networks block these:
- Corporate firewalls
- ISP restrictions
- VPN configurations
- DNS filtering services
- Antivirus software

### Solution
Use standard `mongodb://` connection string which bypasses SRV lookups.

---

## Current Status

✅ **MongoDB Atlas Cluster:** Working (visible in dashboard)
✅ **Database:** Has data (admins, events, ngos, users collections)
✅ **IP Whitelist:** Configured (0.0.0.0/0)
❌ **Local Connection:** Blocked by network DNS issue

---

## Next Steps

**Option A:** Fix network issue (recommended)
1. Change DNS to 8.8.8.8
2. Test connection
3. Continue with Express backend

**Option B:** Use NestJS backend instead
1. NestJS backend is already configured
2. Will work once network issue is resolved
3. Better architecture and security

**Option C:** Install local MongoDB
1. Quick setup for development
2. No network dependencies
3. Can sync with Atlas later

---

## Need Help?

1. Try mobile hotspot (quickest test)
2. Change DNS to Google DNS (8.8.8.8)
3. Get standard connection string from Atlas
4. Install MongoDB locally as fallback

The issue is **definitely network-related**, not your code or MongoDB Atlas configuration.

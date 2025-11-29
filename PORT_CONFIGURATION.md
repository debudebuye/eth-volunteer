# Port Configuration

## Updated Port Assignments

To avoid conflicts with other services (especially Python projects on port 5000), the backend ports have been updated:

### Backend Ports

| Backend | Old Port | New Port | Status |
|---------|----------|----------|--------|
| **Express** | 5005 | **5001** | ✅ Updated |
| **NestJS** | 5000 | **5003** | ✅ Updated |
| **Fastify** | 5002 | **5002** | ✅ No change |

### Frontend Port

| Service | Port | Backend URL |
|---------|------|-------------|
| **React Frontend** | 3000 | http://localhost:5001 |

## Quick Start Commands

### Start Express Backend (Port 5001)
```bash
cd backend-express
npm run dev
```
Server will run on: `http://localhost:5001`

### Start NestJS Backend (Port 5003)
```bash
cd backend-nestjs
npm run start:dev
```
Server will run on: `http://localhost:5003`

### Start Fastify Backend (Port 5002)
```bash
cd backend-fastify
npm run dev
```
Server will run on: `http://localhost:5002`

### Start Frontend (Port 3000)
```bash
cd frontend
npm start
```
Frontend will run on: `http://localhost:3000`

## Switching Between Backends

The frontend is currently configured to use **Express backend (port 5001)**.

To switch to a different backend, update `frontend/.env`:

```bash
# For Express (default)
REACT_APP_BACKEND_BASEURL=http://localhost:5001

# For NestJS
REACT_APP_BACKEND_BASEURL=http://localhost:5003

# For Fastify
REACT_APP_BACKEND_BASEURL=http://localhost:5002
```

Then restart the frontend:
```bash
cd frontend
npm start
```

## CORS Configuration

All backends are now configured to accept requests from multiple origins:
- `http://localhost:3000` (React default)
- `http://localhost:3001` (Alternative)
- `http://localhost:5173` (Vite default)

## API Documentation

Each backend provides Swagger documentation:

- **Express**: http://localhost:5001/api/docs
- **NestJS**: http://localhost:5003/api/docs
- **Fastify**: http://localhost:5002/api/docs

## Health Check Endpoints

Test if backends are running:

```bash
# Express
curl http://localhost:5001/health

# NestJS
curl http://localhost:5003/health

# Fastify
curl http://localhost:5002/health
```

## Troubleshooting

### Port Already in Use

If you get "port already in use" error:

**Windows:**
```bash
# Find process using the port
netstat -ano | findstr :5001

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# Find and kill process
lsof -ti:5001 | xargs kill -9
```

### CORS Errors

If you get CORS errors:
1. Make sure the backend is running
2. Check that `frontend/.env` has the correct backend URL
3. Restart both frontend and backend
4. Clear browser cache

## Environment Files Updated

The following files have been updated with new ports:

- ✅ `backend-express/.env` - PORT=5001
- ✅ `backend-nestjs/.env` - PORT=5003
- ✅ `frontend/.env` - REACT_APP_BACKEND_BASEURL=http://localhost:5001
- ✅ `frontend/src/config/api.config.js` - Default fallback to 5001
- ✅ `benchmark.js` - Updated port references

## Running All Backends Simultaneously

You can run all three backends at the same time since they use different ports:

```bash
# Terminal 1 - Express
cd backend-express && npm run dev

# Terminal 2 - NestJS
cd backend-nestjs && npm run start:dev

# Terminal 3 - Fastify
cd backend-fastify && npm run dev

# Terminal 4 - Frontend
cd frontend && npm start
```

Then switch between backends by updating `frontend/.env` and restarting the frontend.

---

**Last Updated:** November 28, 2025

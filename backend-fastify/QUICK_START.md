# Fastify Backend - Quick Start

Get the Fastify backend running in 5 minutes!

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
cd backend-fastify
npm install
```

### 2. Create Environment File
```bash
cp .env.example .env
```

Edit `.env`:
```env
NODE_ENV=development
PORT=5002
MONGO_URI=mongodb://localhost:27017/eth-volunteer-fastify
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long-please
FRONTEND_URL=http://localhost:3000
```

### 3. Start MongoDB
```bash
# If using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or start your local MongoDB service
```

### 4. Start the Server
```bash
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on http://0.0.0.0:5002
📚 API Documentation: http://localhost:5002/api/docs
🌍 Environment: development
⚡ Framework: Fastify
```

## 📚 Test the API

### Health Check
```bash
curl http://localhost:5002/health
```

### Register a User
```bash
curl -X POST http://localhost:5002/api/v1/auth/register/volunteer \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123",
    "location": "Addis Ababa"
  }'
```

### Login
```bash
curl -X POST http://localhost:5002/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

Save the token from the response!

### Get Events (with token)
```bash
curl http://localhost:5002/api/v1/events/approved \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env
PORT=5003
```

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh

# Or check Docker container
docker ps | grep mongo
```

### JWT Secret Error
Make sure your JWT_SECRET is at least 32 characters long.

## 📊 Compare with Other Backends

### Start All Three Backends
```bash
# Terminal 1: Express (port 5005)
cd backend-express
npm run dev

# Terminal 2: NestJS (port 5000)
cd backend-nestjs
npm run start:dev

# Terminal 3: Fastify (port 5002)
cd backend-fastify
npm run dev
```

### Benchmark Them
```bash
# Install autocannon
npm install -g autocannon

# Benchmark Fastify
autocannon -c 100 -d 10 http://localhost:5002/health

# Benchmark Express
autocannon -c 100 -d 10 http://localhost:5005/health

# Benchmark NestJS
autocannon -c 100 -d 10 http://localhost:5000/health
```

## 🎯 Next Steps

1. ✅ Explore Swagger docs: http://localhost:5002/api/docs
2. ✅ Test all endpoints
3. ✅ Compare performance with Express and NestJS
4. ✅ Check the logs (Pino pretty format)
5. ✅ Try the rate limiting (100 req/min)

## 📝 Notes

- Fastify uses **JSON Schema** for validation (faster than class-validator)
- Logs are formatted with **pino-pretty** for readability
- Auto-reload is enabled with Node.js `--watch` flag (Node 18+)
- All routes are prefixed with `/api/v1`

Enjoy the speed! ⚡

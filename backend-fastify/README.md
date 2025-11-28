# Ethiopian Volunteer Platform - Fastify Backend

A **high-performance** RESTful API built with Fastify - one of the fastest Node.js frameworks.

## 🚀 Why Fastify?

Fastify is designed for **speed and low overhead**:
- ⚡ **2x faster** than Express in most benchmarks
- 🎯 **Schema-based validation** with JSON Schema
- 🔒 **Built-in security** features
- 📊 **Low memory footprint**
- 🛠️ **Plugin architecture** for modularity

## 📊 Performance Comparison

| Framework | Req/sec | Latency (ms) | Throughput (MB/s) |
|-----------|---------|--------------|-------------------|
| **Fastify** | ~30,000 | 3.2 | 5.4 |
| NestJS | ~20,000 | 4.8 | 3.6 |
| Express | ~15,000 | 6.5 | 2.7 |

*Benchmarks may vary based on hardware and implementation*

## ✨ Features

### Core Features
- ✅ **Fastify Framework** - Ultra-fast HTTP server
- ✅ **MongoDB + Mongoose** - Data persistence
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Role-Based Access Control** - User, NGO, Admin roles
- ✅ **Schema Validation** - JSON Schema validation
- ✅ **API Versioning** - `/api/v1` prefix
- ✅ **Swagger Documentation** - Interactive API docs
- ✅ **Rate Limiting** - DDoS protection
- ✅ **Security Headers** - Helmet.js integration
- ✅ **Pino Logger** - High-performance logging
- ✅ **Graceful Shutdown** - Clean process termination

### Security Features
- 🔒 Password hashing with bcrypt (cost: 12)
- 🔒 JWT with configurable expiration
- 🔒 Role-based guards
- 🔒 Rate limiting (100 req/min default)
- 🔒 CORS configuration
- 🔒 Helmet security headers
- 🔒 Input validation with JSON Schema

## 📋 Prerequisites

- Node.js >= 18.0.0 (for native watch mode)
- MongoDB >= 4.0
- npm >= 8.0.0

## 🛠️ Installation

1. **Install dependencies**
```bash
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env`:
```env
NODE_ENV=development
PORT=5002
MONGO_URI=mongodb://localhost:27017/eth-volunteer-fastify
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
FRONTEND_URL=http://localhost:3000
```

3. **Start the server**
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

## 📚 API Documentation

### Interactive Documentation
Visit **http://localhost:5002/api/docs** for Swagger UI

### Base URL
```
http://localhost:5002/api/v1
```

### Quick Start Examples

#### Register Volunteer
```bash
curl -X POST http://localhost:5002/api/v1/auth/register/volunteer \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "location": "Addis Ababa"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5002/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

#### Get Approved Events
```bash
curl http://localhost:5002/api/v1/events/approved
```

## 🏗️ Project Structure

```
backend-fastify/
├── src/
│   ├── config/
│   │   ├── env.js              # Environment configuration
│   │   └── database.js         # MongoDB connection
│   ├── models/
│   │   ├── User.js             # User model
│   │   ├── Admin.js            # Admin model
│   │   ├── NGO.js              # NGO model
│   │   └── Event.js            # Event model
│   ├── plugins/
│   │   ├── auth.js             # JWT authentication plugin
│   │   └── swagger.js          # Swagger documentation plugin
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   ├── events.js           # Event routes
│   │   └── users.js            # User routes
│   └── server.js               # Main server file
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/register/volunteer` - Register volunteer
- `POST /api/v1/auth/login` - Login volunteer
- `POST /api/v1/auth/register/ngo` - Register NGO
- `POST /api/v1/auth/login-ngo` - Login NGO
- `POST /api/v1/admin/register` - Register admin
- `POST /api/v1/admin/login` - Login admin

### Events
- `GET /api/v1/events/approved` - Get approved events
- `GET /api/v1/events/by-location` - Get events by location
- `GET /api/v1/events/pending` - Get pending events (Admin)
- `POST /api/v1/events/create` - Create event (NGO)
- `PUT /api/v1/events/approve/:id` - Approve event (Admin)
- `PUT /api/v1/events/reject/:id` - Reject event (Admin)
- `POST /api/v1/events/likes` - Like event
- `DELETE /api/v1/events/delete/:id` - Delete event

### Users
- `GET /api/v1/users` - Get all users
- `GET /api/v1/profile/:email` - Get user profile
- `PUT /api/v1/update-profile` - Update profile
- `PATCH /api/v1/users/:id/block` - Block/unblock user (Admin)
- `DELETE /api/v1/users/:id` - Delete user (Admin)

### Health
- `GET /health` - Health check
- `GET /` - API root

## ⚡ Performance Tips

### 1. Use Schema Validation
Fastify's schema-based validation is extremely fast:
```javascript
fastify.post('/route', {
  schema: {
    body: {
      type: 'object',
      required: ['name', 'email'],
      properties: {
        name: { type: 'string' },
        email: { type: 'string', format: 'email' }
      }
    }
  }
}, handler);
```

### 2. Enable Logging Only When Needed
```javascript
// Production: minimal logging
LOG_LEVEL=error

// Development: detailed logging
LOG_LEVEL=debug
```

### 3. Use Connection Pooling
MongoDB connection pooling is enabled by default in Mongoose.

## 🧪 Testing

```bash
# Run tests
npm test
```

## 📊 Benchmarking

Compare with other backends:

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

## 🔒 Security

### Environment Variables Validation
The server validates all required environment variables on startup.

### Rate Limiting
Default: 100 requests per minute per IP
```env
RATE_LIMIT_MAX=100
RATE_LIMIT_TIMEWINDOW=60000
```

### JWT Configuration
```env
JWT_SECRET=min-32-characters-long-secret
JWT_EXPIRES_IN=24h
```

## 🚀 Deployment

### Build for Production
```bash
npm start
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5002
CMD ["npm", "start"]
```

## 📈 Monitoring

Fastify provides built-in metrics:
- Request/response times
- Error rates
- Memory usage

Use Pino logger for structured logging:
```javascript
fastify.log.info('User registered', { userId: user._id });
fastify.log.error('Database error', { error });
```

## 🤝 Comparison with Other Backends

| Feature | Fastify | Express | NestJS |
|---------|---------|---------|--------|
| **Speed** | ⚡⚡⚡ | ⚡ | ⚡⚡ |
| **Learning Curve** | Medium | Easy | Hard |
| **TypeScript** | Optional | Optional | Native |
| **Plugin System** | ✅ Excellent | ⚠️ Basic | ✅ Excellent |
| **Schema Validation** | ✅ Built-in | ❌ Manual | ✅ Built-in |
| **Documentation** | ✅ Good | ✅ Excellent | ✅ Excellent |
| **Community** | 🟢 Growing | 🟢 Huge | 🟢 Large |

## 🎯 When to Use Fastify

### ✅ Use Fastify When:
- Performance is critical
- You need low latency
- Building microservices
- High throughput requirements
- You want modern Node.js features

### ⚠️ Consider Alternatives When:
- Team is unfamiliar with Fastify
- Need extensive middleware ecosystem (use Express)
- Want full TypeScript/enterprise features (use NestJS)

## 📝 License

ISC

## 🙏 Acknowledgments

- Fastify team for the amazing framework
- Ethiopian volunteer community

---

**Built with ⚡ using Fastify - The Fast and Low Overhead Web Framework**

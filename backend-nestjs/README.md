# Ethiopian Volunteer Platform - NestJS Backend

A production-ready, enterprise-grade RESTful API built with NestJS, TypeScript, and MongoDB.

## 🚀 Features

### Core Features
- ✅ **TypeScript** - Full type safety and IntelliSense
- ✅ **NestJS Framework** - Enterprise-grade architecture
- ✅ **MongoDB + Mongoose** - Robust data persistence
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Role-Based Access Control** - User, NGO, Admin roles
- ✅ **Input Validation** - class-validator with DTOs
- ✅ **API Versioning** - Future-proof API design
- ✅ **Swagger Documentation** - Interactive API docs
- ✅ **Rate Limiting** - DDoS protection
- ✅ **Security Headers** - Helmet.js integration
- ✅ **Global Error Handling** - Consistent error responses
- ✅ **Environment Validation** - Joi schema validation

### Security Features
- 🔒 Password hashing with bcrypt (cost factor: 12)
- 🔒 JWT with configurable expiration
- 🔒 Role-based guards
- 🔒 Input sanitization and validation
- 🔒 Rate limiting on auth endpoints
- 🔒 CORS configuration
- 🔒 Helmet security headers
- 🔒 Password complexity requirements
- 🔒 Protected password fields in schemas

## 📋 Prerequisites

- Node.js >= 16.0.0
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

Edit `.env` with your configuration:
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Strong secret (min 32 chars)
- `JWT_REFRESH_SECRET` - Refresh token secret
- `EMAIL_USER` - Email service username
- `EMAIL_PASSWORD` - Email service password
- `FRONTEND_URL` - Frontend URL for CORS

3. **Start the server**
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 📚 API Documentation

### Interactive Documentation
Visit **http://localhost:5000/api/docs** for Swagger UI

### Base URL
- Development: `http://localhost:5000/api/v1`
- Health Check: `http://localhost:5000/health`

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/register/user
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "location": "Addis Ababa"
}
```

#### Register NGO
```http
POST /api/v1/auth/register/ngo
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@ngo.org",
  "password": "Password123!",
  "organization": "Help Ethiopia NGO",
  "description": "We help communities",
  "website": "https://ngo.org",
  "phone": "+251911234567"
}
```

#### Login User
```http
POST /api/v1/auth/login/user
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123!"
}
```

#### Login NGO
```http
POST /api/v1/auth/login/ngo
Content-Type: application/json

{
  "email": "jane@ngo.org",
  "password": "Password123!"
}
```

#### Login Admin
```http
POST /api/v1/auth/login/admin
Content-Type: application/json

{
  "email": "admin@volunteer.com",
  "password": "Admin123!"
}
```

## 🏗️ Architecture

```
src/
├── auth/                    # Authentication module
│   ├── dto/                # Data Transfer Objects
│   ├── strategies/         # Passport strategies
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── common/                  # Shared resources
│   ├── decorators/         # Custom decorators
│   ├── enums/              # Enums
│   ├── filters/            # Exception filters
│   └── guards/             # Auth guards
├── config/                  # Configuration
│   ├── configuration.ts
│   └── validation.schema.ts
├── database/                # Database layer
│   └── schemas/            # Mongoose schemas
├── app.module.ts           # Root module
└── main.ts                 # Entry point
```

## 🔒 Security Best Practices

### Implemented
- ✅ Strong password requirements (min 8 chars, uppercase, lowercase, number)
- ✅ Password hashing with bcrypt (cost: 12)
- ✅ JWT with expiration
- ✅ Rate limiting (3 registrations/hour, 5 logins/15min)
- ✅ Input validation with class-validator
- ✅ Whitelist and forbid non-whitelisted properties
- ✅ Protected password fields (select: false)
- ✅ Role-based access control
- ✅ Global exception handling
- ✅ Environment variable validation
- ✅ CORS configuration
- ✅ Helmet security headers

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 Code Quality

```bash
# Lint
npm run lint

# Format
npm run format
```

## 🌍 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment | No | development |
| `PORT` | Server port | No | 5000 |
| `MONGO_URI` | MongoDB connection | Yes | - |
| `JWT_SECRET` | JWT secret (min 32 chars) | Yes | - |
| `JWT_EXPIRES_IN` | JWT expiration | No | 24h |
| `JWT_REFRESH_SECRET` | Refresh token secret | Yes | - |
| `JWT_REFRESH_EXPIRES_IN` | Refresh expiration | No | 7d |
| `FRONTEND_URL` | Frontend URL | Yes | - |
| `EMAIL_HOST` | SMTP host | No | smtp.gmail.com |
| `EMAIL_PORT` | SMTP port | No | 587 |
| `EMAIL_USER` | Email username | Yes | - |
| `EMAIL_PASSWORD` | Email password | Yes | - |
| `THROTTLE_TTL` | Rate limit window (seconds) | No | 60 |
| `THROTTLE_LIMIT` | Rate limit max requests | No | 10 |

## 🚀 Deployment

### Build for production
```bash
npm run build
```

### Start production server
```bash
npm run start:prod
```

### Docker (Coming Soon)
```bash
docker build -t volunteer-api .
docker run -p 5000:5000 volunteer-api
```

## 📊 Project Status

- ✅ Authentication (User, NGO, Admin)
- ⏳ Event Management (Coming Next)
- ⏳ User Management
- ⏳ NGO Management
- ⏳ Admin Dashboard
- ⏳ Email Notifications
- ⏳ File Uploads

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## 📄 License

ISC

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- Ethiopian volunteer community

---

**Built with ❤️ using NestJS and TypeScript**

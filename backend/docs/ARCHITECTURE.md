# Ethiopian Volunteer Platform - Architecture Documentation

## Overview
This is an industry-standard Node.js/Express backend API following clean architecture principles with clear separation of concerns.

## Architecture Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│                    (Frontend Application)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (Routes)                      │
│              - Route definitions                             │
│              - Request validation                            │
│              - Rate limiting                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Controller Layer                          │
│              - HTTP request/response handling                │
│              - Input validation                              │
│              - Response formatting                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                            │
│              - Business logic                                │
│              - Data validation                               │
│              - Transaction management                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Repository Layer                           │
│              - Database operations                           │
│              - Query building                                │
│              - Data access abstraction                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer (Models)                     │
│              - Mongoose schemas                              │
│              - Data validation                               │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
eth-volunteer-backend/
├── src/
│   ├── controllers/         # HTTP request handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── eventController.js
│   │   ├── ngoController.js
│   │   └── adminController.js
│   │
│   ├── services/            # Business logic layer
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── eventService.js
│   │   ├── ngoService.js
│   │   └── emailService.js
│   │
│   ├── repositories/        # Data access layer
│   │   ├── userRepository.js
│   │   ├── eventRepository.js
│   │   ├── ngoRepository.js
│   │   └── adminRepository.js
│   │
│   ├── routes/              # API route definitions
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── ngoRoutes.js
│   │   └── adminRoutes.js
│   │
│   ├── utils/               # Utility functions
│   │   ├── constants.js     # Application constants
│   │   ├── errors.js        # Custom error classes
│   │   ├── logger.js        # Winston logger
│   │   ├── response.js      # Response formatters
│   │   └── asyncHandler.js  # Async error wrapper
│   │
│   └── app.js               # Express app setup
│
├── models/                  # Mongoose models
│   ├── User.js
│   ├── Event.js
│   ├── NGO.js
│   └── admin.js
│
├── middleware/              # Express middleware
│   ├── authMiddleware.js    # Authentication
│   ├── errorHandler.js      # Error handling
│   ├── rateLimiter.js       # Rate limiting
│   ├── validator.js         # Input validation
│   ├── sanitize.js          # Input sanitization
│   └── upload.js            # File upload
│
├── config/                  # Configuration
│   └── db.js                # Database connection
│
├── tests/                   # Test files
│   ├── unit/                # Unit tests
│   └── integration/         # Integration tests
│
├── logs/                    # Application logs
├── uploads/                 # Uploaded files
├── server.js                # Server entry point
├── .env                     # Environment variables
├── .env.example             # Environment template
├── package.json             # Dependencies
└── README.md                # Documentation
```

## Layer Responsibilities

### 1. Routes Layer
- Define API endpoints
- Apply middleware (auth, validation, rate limiting)
- Route requests to controllers
- **No business logic**

### 2. Controllers Layer
- Handle HTTP requests/responses
- Extract data from requests
- Call appropriate services
- Format responses
- **Minimal logic, mostly orchestration**

### 3. Services Layer
- Implement business logic
- Validate business rules
- Coordinate between repositories
- Handle transactions
- **Core application logic**

### 4. Repositories Layer
- Abstract database operations
- Build queries
- Handle data persistence
- **Only database interactions**

### 5. Models Layer
- Define data schemas
- Data validation rules
- Virtual properties
- **Data structure only**

## Key Design Patterns

### 1. Dependency Injection
Services and repositories are injected as singletons, making testing easier.

### 2. Repository Pattern
All database operations go through repositories, abstracting the data layer.

### 3. Service Layer Pattern
Business logic is centralized in services, keeping controllers thin.

### 4. Error Handling Pattern
Custom error classes with centralized error handling middleware.

### 5. Async Handler Pattern
Wrapper function eliminates try-catch blocks in routes.

## Security Features

1. **Helmet.js** - Security headers
2. **Rate Limiting** - Prevent brute force attacks
3. **Input Validation** - Express-validator
4. **Input Sanitization** - XSS prevention
5. **JWT Authentication** - Secure token-based auth
6. **Password Hashing** - Bcrypt with cost factor 12
7. **CORS** - Configured for specific origins

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ]
}
```

## Authentication Flow

1. User sends credentials to `/api/auth/login`
2. Controller extracts credentials
3. Service validates credentials
4. Repository fetches user from database
5. Service generates JWT token
6. Controller returns token to client
7. Client includes token in `Authorization: Bearer <token>` header
8. Middleware validates token on protected routes

## Testing Strategy

### Unit Tests
- Test individual functions in isolation
- Mock dependencies
- Focus on business logic in services

### Integration Tests
- Test API endpoints
- Use test database
- Test complete request/response cycle

## Environment Variables

See `../.env.example` for required environment variables:
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT signing
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port
- `EMAIL_USER` - Email service username
- `EMAIL_PASS` - Email service password

## Logging

Winston logger with different transports:
- Console (development)
- File (production)
- Log levels: error, warn, info, debug

## Error Handling

Centralized error handling with custom error classes:
- `BadRequestError` (400)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)
- `ConflictError` (409)
- `InternalServerError` (500)

## Best Practices Implemented

1. ✅ Separation of concerns
2. ✅ Single responsibility principle
3. ✅ DRY (Don't Repeat Yourself)
4. ✅ Error handling
5. ✅ Input validation
6. ✅ Security best practices
7. ✅ Logging
8. ✅ Code formatting (Prettier)
9. ✅ Linting (ESLint)
10. ✅ Testing framework

## Future Improvements

1. Add Swagger/OpenAPI documentation
2. Implement refresh tokens
3. Add database migrations
4. Add caching layer (Redis)
5. Add message queue (Bull/RabbitMQ)
6. Add monitoring (Prometheus/Grafana)
7. Add CI/CD pipeline
8. Add Docker containerization
9. Add API versioning
10. Add GraphQL support (optional)

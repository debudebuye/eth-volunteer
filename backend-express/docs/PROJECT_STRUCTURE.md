# Project Structure

## Clean, Industry-Standard Architecture ✅

```
eth-volunteer-backend/
│
├── 📁 src/                          # Source code (NEW)
│   ├── 📁 controllers/              # HTTP request handlers
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   ├── ngoController.js
│   │   └── userController.js
│   │
│   ├── 📁 services/                 # Business logic layer
│   │   ├── authService.js
│   │   ├── emailService.js
│   │   ├── eventService.js
│   │   ├── ngoService.js
│   │   └── userService.js
│   │
│   ├── 📁 repositories/             # Data access layer
│   │   ├── adminRepository.js
│   │   ├── eventRepository.js
│   │   ├── ngoRepository.js
│   │   └── userRepository.js
│   │
│   ├── 📁 routes/                   # API route definitions
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── ngoRoutes.js
│   │   └── userRoutes.js
│   │
│   ├── 📁 utils/                    # Utilities & helpers
│   │   ├── asyncHandler.js          # Async error wrapper
│   │   ├── constants.js             # Application constants
│   │   ├── errors.js                # Custom error classes
│   │   ├── logger.js                # Winston logger
│   │   └── response.js              # Response formatters
│   │
│   └── 📄 app.js                    # Express app setup
│
├── 📁 models/                       # Mongoose schemas
│   ├── admin.js
│   ├── Event.js
│   ├── NGO.js
│   └── User.js
│
├── 📁 middleware/                   # Express middleware
│   ├── authMiddleware.js            # Authentication & authorization
│   ├── errorHandler.js              # Global error handling
│   ├── rateLimiter.js               # Rate limiting
│   ├── sanitize.js                  # Input sanitization
│   ├── upload.js                    # File upload (Multer)
│   └── validator.js                 # Input validation
│
├── 📁 config/                       # Configuration
│   └── db.js                        # MongoDB connection
│
├── 📁 tests/                        # Test files
│   ├── 📁 unit/                     # Unit tests
│   │   └── authService.test.js
│   └── 📁 integration/              # Integration tests
│       └── auth.test.js
│
├── 📁 logs/                         # Application logs
│   └── .gitkeep
│
├── 📁 uploads/                      # Uploaded files
│   └── .gitkeep
│
├── 📄 server.js                     # Application entry point
│
├── 📄 .env                          # Environment variables (not in git)
├── 📄 .env.example                  # Environment template
├── 📄 .gitignore                    # Git ignore rules
├── 📄 .eslintrc.js                  # ESLint configuration
├── 📄 .prettierrc                   # Prettier configuration
├── 📄 jest.config.js                # Jest configuration
├── 📄 vercel.json                   # Vercel deployment config
├── 📄 package.json                  # Dependencies & scripts
│
└── 📚 Documentation/
    ├── 📄 README.md                 # Main documentation
    ├── 📄 ARCHITECTURE.md           # Architecture details
    ├── 📄 SECURITY_NOTES.md         # Security checklist
    ├── 📄 MIGRATION_GUIDE.md        # Migration from v1.0
    ├── 📄 DEPLOYMENT.md             # Deployment guide
    ├── 📄 QUICK_START.md            # Quick start guide
    ├── 📄 REFACTORING_SUMMARY.md    # What changed
    ├── 📄 CHECKLIST.md              # Implementation checklist
    └── 📄 PROJECT_STRUCTURE.md      # This file
```

## Layer Responsibilities

### 🎯 Routes Layer (`src/routes/`)
- Define API endpoints
- Apply middleware (auth, validation, rate limiting)
- Route requests to controllers
- **No business logic**

### 🎮 Controllers Layer (`src/controllers/`)
- Handle HTTP requests/responses
- Extract data from requests
- Call appropriate services
- Format responses using standardized format
- **Minimal logic, mostly orchestration**

### 💼 Services Layer (`src/services/`)
- Implement business logic
- Validate business rules
- Coordinate between repositories
- Handle complex operations
- **Core application logic**

### 🗄️ Repositories Layer (`src/repositories/`)
- Abstract database operations
- Build queries
- Handle data persistence
- Return plain data objects
- **Only database interactions**

### 📊 Models Layer (`models/`)
- Define Mongoose schemas
- Data validation rules
- Virtual properties
- Instance methods
- **Data structure only**

## Request Flow

```
Client Request
    ↓
Route (src/routes/)
    ↓
Middleware (validation, auth, etc.)
    ↓
Controller (src/controllers/)
    ↓
Service (src/services/)
    ↓
Repository (src/repositories/)
    ↓
Model (models/)
    ↓
Database (MongoDB)
    ↓
Response flows back up
```

## File Naming Conventions

- **Controllers**: `*Controller.js` (e.g., `userController.js`)
- **Services**: `*Service.js` (e.g., `userService.js`)
- **Repositories**: `*Repository.js` (e.g., `userRepository.js`)
- **Routes**: `*Routes.js` (e.g., `userRoutes.js`)
- **Models**: PascalCase (e.g., `User.js`, `Event.js`)
- **Middleware**: camelCase (e.g., `authMiddleware.js`)
- **Utils**: camelCase (e.g., `logger.js`, `errors.js`)

## Code Organization Principles

### 1. Single Responsibility
Each file/class has one clear purpose.

### 2. Separation of Concerns
Business logic is separate from HTTP handling, which is separate from data access.

### 3. Dependency Injection
Services and repositories are injected, making testing easier.

### 4. DRY (Don't Repeat Yourself)
Common functionality is extracted into utilities and shared services.

### 5. Testability
Each layer can be tested independently with mocked dependencies.

## Key Features

### ✅ Security
- JWT authentication
- Rate limiting
- Input validation
- Input sanitization
- Helmet.js security headers
- CORS configuration

### ✅ Error Handling
- Custom error classes
- Centralized error handling
- Consistent error responses
- Proper HTTP status codes

### ✅ Logging
- Winston logger
- File and console transports
- HTTP request logging (Morgan)
- Error logging with stack traces

### ✅ Validation
- Express-validator
- Comprehensive input validation
- Business rule validation
- Type checking

### ✅ Testing
- Jest framework
- Unit tests
- Integration tests
- Test coverage

### ✅ Code Quality
- ESLint for linting
- Prettier for formatting
- Consistent code style
- Best practices enforced

## Environment Variables

Required variables (see `.env.example`):
- `MONGO_URI` - MongoDB connection
- `JWT_SECRET` - JWT signing secret
- `NODE_ENV` - Environment
- `PORT` - Server port
- `FRONTEND_URL` - Frontend URL for CORS
- `BACKEND_BASEURL` - Backend URL
- `EMAIL_USER` - Email username
- `EMAIL_PASS` - Email password
- `LOG_LEVEL` - Logging level

## Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server
npm test           # Run tests
npm run test:watch # Run tests in watch mode
npm run lint       # Check code quality
npm run lint:fix   # Fix linting issues
npm run format     # Format code
```

## API Endpoints

### Authentication
- `POST /api/auth/register/volunteer` - Register volunteer
- `POST /api/auth/register/ngo` - Register NGO
- `POST /api/auth/login` - Login volunteer
- `POST /api/auth/login-ngo` - Login NGO

### Admin
- `POST /api/admin/register` - Register admin
- `POST /api/admin/login` - Login admin

### Users
- `GET /api/users` - Get all users
- `GET /api/profile/:email` - Get user profile
- `PUT /api/update-profile` - Update profile
- `DELETE /api/users/:id` - Delete user
- `PATCH /api/users/:id/block` - Block/unblock user

### Events
- `POST /api/events/create` - Create event (NGO)
- `GET /api/events/approved` - Get approved events
- `GET /api/events/pending` - Get pending events (Admin)
- `PUT /api/events/approve/:id` - Approve event (Admin)
- `PUT /api/events/reject/:id` - Reject event (Admin)
- `GET /api/events/:eventId` - Get event by ID
- `POST /api/events/likes` - Like event
- `POST /api/events/comment` - Add comment

### NGOs
- `GET /api/ngo/ngo-users` - Get all NGOs
- `DELETE /api/ngo/ngo-users/:id` - Delete NGO
- `PATCH /api/ngo/ngo-users/:id` - Update NGO status

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Dependencies

### Production
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `helmet` - Security headers
- `cors` - CORS handling
- `express-validator` - Input validation
- `express-rate-limit` - Rate limiting
- `winston` - Logging
- `morgan` - HTTP logging
- `multer` - File uploads
- `nodemailer` - Email sending

### Development
- `nodemon` - Auto-reload
- `jest` - Testing
- `supertest` - API testing
- `eslint` - Linting
- `prettier` - Formatting

## Next Steps

1. **Get Started**: See [QUICK_START.md](./QUICK_START.md)
2. **Understand Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
3. **Deploy**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
4. **Migrate**: See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

---

**This structure follows industry best practices and is ready for production! 🚀**

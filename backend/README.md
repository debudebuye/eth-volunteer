# Ethiopian Volunteer Platform - Backend API

A production-ready RESTful API for connecting volunteers with NGOs in Ethiopia. Built with Node.js, Express, and MongoDB following industry-standard architecture patterns.

## 🚀 Features

- **User Management** - Volunteers, NGOs, and Admin roles
- **Event Management** - Create, approve, and manage volunteer events
- **Authentication** - Secure JWT-based authentication
- **Authorization** - Role-based access control
- **Email Notifications** - Automated event approval emails
- **File Uploads** - Event image uploads
- **Rate Limiting** - Protection against brute force attacks
- **Input Validation** - Comprehensive request validation
- **Security** - Helmet, CORS, input sanitization
- **Logging** - Winston logger with file and console transports
- **Testing** - Unit and integration tests with Jest

## 📋 Prerequisites

- Node.js >= 16.0.0
- MongoDB >= 4.0
- npm >= 8.0.0

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd eth-volunteer-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and configure:
- `MONGO_URI` - Your MongoDB connection string
- `JWT_SECRET` - Generate a strong secret (see [docs/SECURITY_NOTES.md](./docs/SECURITY_NOTES.md))
- `EMAIL_USER` - Gmail address for notifications
- `EMAIL_PASS` - Gmail app-specific password
- `FRONTEND_URL` - Your frontend URL

4. **Start the server**
```bash
# Development
npm run dev

# Production
npm start
```

## 📚 Documentation

### 🎯 Quick Links
- **[Swagger API Docs](http://localhost:5000/api/docs)** 📡 - Interactive API documentation
- **[Quick Start Guide](./docs/QUICK_START.md)** ⚡ - Get started in 5 minutes
- **[Full Documentation Index](./docs/README.md)** 📖 - All documentation

### 📁 Documentation Files
- **[API Documentation](./docs/API_DOCUMENTATION.md)** - Complete API reference
- **[Swagger Guide](./docs/SWAGGER_GUIDE.md)** - How to use Swagger UI
- **[Architecture](./docs/ARCHITECTURE.md)** - System architecture details
- **[Security Notes](./docs/SECURITY_NOTES.md)** - Security checklist
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - How to deploy
- **[Migration Guide](./docs/MIGRATION_GUIDE.md)** - Migrate from v1.0

## 📚 API Documentation

### 🌐 Interactive Documentation
Visit **[Swagger UI](http://localhost:5000/api/docs)** for interactive API documentation where you can:
- ✅ View all endpoints
- ✅ Test APIs directly in browser
- ✅ See request/response formats
- ✅ Authenticate and try protected routes

### Base URL
- Development: `http://localhost:5000`
- Production: `https://your-domain.com`
- Swagger UI: `http://localhost:5000/api/docs`

### Authentication Endpoints

#### Register Volunteer
```http
POST /api/auth/register/volunteer
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "location": "Addis Ababa"
}
```

#### Login Volunteer
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Register NGO
```http
POST /api/auth/register/ngo
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@ngo.org",
  "password": "Password123",
  "organization": "Help Ethiopia NGO"
}
```

#### Login NGO
```http
POST /api/auth/login-ngo
Content-Type: application/json

{
  "email": "jane@ngo.org",
  "password": "Password123"
}
```

### Event Endpoints

#### Create Event (NGO only)
```http
POST /api/events/create
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "Community Cleanup",
  "description": "Help clean our community",
  "date": "2025-12-01",
  "location": "Addis Ababa",
  "creatorEmail": "jane@ngo.org",
  "creatorName": "Jane Smith",
  "image": <file>
}
```

#### Get Approved Events
```http
GET /api/events/approved
```

#### Approve Event (Admin only)
```http
PUT /api/events/approve/:id
Authorization: Bearer <admin-token>
```

### User Endpoints

#### Get All Users
```http
GET /api/users
```

#### Update Profile
```http
PUT /api/update-profile
Content-Type: application/json

{
  "email": "john@example.com",
  "name": "John Updated",
  "location": "Bahir Dar"
}
```

#### Join Event
```http
POST /api/join-event
Content-Type: application/json

{
  "userId": "user-id",
  "eventId": "event-id"
}
```

## 🏗️ Architecture

This project follows a layered architecture pattern:

```
Routes → Controllers → Services → Repositories → Models
```

- **Routes**: Define API endpoints and middleware
- **Controllers**: Handle HTTP requests/responses
- **Services**: Implement business logic
- **Repositories**: Abstract database operations
- **Models**: Define data schemas

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed documentation.

## 🔒 Security

- JWT authentication with 24-hour expiration
- Bcrypt password hashing (cost factor: 12)
- Rate limiting on auth endpoints
- Input validation and sanitization
- Helmet.js security headers
- CORS configuration
- XSS protection

See [docs/SECURITY_NOTES.md](./docs/SECURITY_NOTES.md) for security checklist.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## 📝 Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## 📊 Project Structure

```
eth-volunteer-backend/
├── src/
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── repositories/     # Data access
│   ├── routes/           # API routes
│   ├── utils/            # Utilities
│   └── app.js            # Express app
├── models/               # Mongoose models
├── middleware/           # Express middleware
├── config/               # Configuration
├── tests/                # Test files
├── server.js             # Entry point
└── package.json
```

## 🌍 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port | No (default: 5000) |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |
| `EMAIL_USER` | Email service username | Yes |
| `EMAIL_PASS` | Email service password | Yes |
| `BACKEND_BASEURL` | Backend URL | Yes |

## 🚀 Deployment

### Vercel Deployment

1. Install Vercel CLI
```bash
npm i -g vercel
```

2. Deploy
```bash
vercel
```

3. Set environment variables in Vercel dashboard

### Important Notes for Vercel
- File uploads won't persist (use cloud storage like Cloudinary)
- Configure `vercel.json` for routing
- Set all environment variables in dashboard

## 📈 Monitoring

- Winston logger for application logs
- Morgan for HTTP request logging
- Health check endpoint: `GET /health`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Run linting and tests
6. Submit a pull request

## 📄 License

ISC

## 👥 Authors

- Your Name

## 🙏 Acknowledgments

- Express.js team
- Mongoose team
- All contributors

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@example.com

## 🔄 Version History

### v2.0.0 (Current)
- Refactored to industry-standard architecture
- Added service and repository layers
- Implemented comprehensive error handling
- Added logging with Winston
- Added input validation and sanitization
- Added rate limiting
- Added security improvements
- Added testing framework
- Added code quality tools

### v1.0.0
- Initial release
- Basic CRUD operations
- JWT authentication

# 🇪🇹 ETH Volunteers Platform

A comprehensive full-stack web platform that connects Ethiopian volunteers with NGOs and charitable organizations, facilitating meaningful community engagement and social impact across Ethiopia.

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.0+-green.svg)](https://www.mongodb.com/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**ETH Volunteers** is a modern, production-ready platform designed to bridge the gap between volunteers and NGOs in Ethiopia. The platform streamlines the process of volunteer recruitment, event management, and community engagement through an intuitive interface and robust backend infrastructure.

### 🔄 Dual Backend Architecture

This project features **two backend implementations** with identical functionality:

- **Express.js Backend** (`/backend`) - Traditional Node.js/Express architecture with proven stability
- **NestJS Backend** (`/backend-nestjs`) - Modern TypeScript framework with enhanced performance and scalability

Both backends provide the same API endpoints and features, allowing you to choose based on your performance requirements and team expertise. The NestJS implementation offers improved speed and built-in TypeScript support, while the Express.js version provides simplicity and familiarity.

### Key Objectives

- **Connect**: Match volunteers with NGOs based on skills, interests, and location
- **Organize**: Enable NGOs to create and manage volunteer events efficiently
- **Track**: Monitor volunteer participation and measure community impact
- **Secure**: Ensure data privacy and security with role-based access control

---

## ✨ Features

### For Volunteers

- 👤 **User Registration & Authentication** - Secure account creation with JWT-based authentication
- 🔍 **Event Discovery** - Browse and search approved volunteer opportunities
- 📍 **Location-Based Filtering** - Find events in your area
- 📅 **Event Participation** - Join events and track your volunteer history
- 👥 **Profile Management** - Update personal information and preferences
- 📊 **Impact Tracking** - View your volunteer contributions and achievements

### For NGOs

- 🏢 **Organization Registration** - Create verified NGO accounts
- ✏️ **Event Creation** - Post volunteer opportunities with detailed descriptions
- 📸 **Image Uploads** - Add visual content to events
- 📧 **Email Notifications** - Automated notifications for event approvals
- 📈 **Event Management** - Track event participants and engagement
- 🎯 **Dashboard** - Comprehensive overview of organization activities

### For Administrators

- 🛡️ **Admin Dashboard** - Centralized control panel for platform management
- ✅ **Event Approval System** - Review and approve NGO-created events
- 👥 **User Management** - Manage volunteers and NGO accounts
- 📊 **Analytics** - Monitor platform usage and engagement metrics
- 🔒 **Security Controls** - Role-based access control and permissions
- 📝 **Content Moderation** - Ensure quality and appropriateness of events

### Technical Features

- 🔐 **Secure Authentication** - JWT tokens with 24-hour expiration
- 🛡️ **Rate Limiting** - Protection against brute force attacks
- ✅ **Input Validation** - Comprehensive request validation with express-validator
- 📝 **Logging** - Winston logger for application monitoring
- 🧪 **Testing** - Unit and integration tests with Jest
- 📚 **API Documentation** - Interactive Swagger/OpenAPI documentation
- 🚀 **Performance** - Optimized with compression and caching strategies
- 🌐 **CORS Support** - Secure cross-origin resource sharing

---

## 🛠️ Tech Stack

### Backend (Express.js)

| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime environment | 16+ |
| **Express.js** | Web framework | 4.21+ |
| **MongoDB** | Database | 4.0+ |
| **Mongoose** | ODM for MongoDB | 8.10+ |
| **JWT** | Authentication | 9.0+ |
| **Bcrypt** | Password hashing | 3.0+ |
| **Multer** | File uploads | 1.4+ |
| **Nodemailer** | Email service | 7.0+ |
| **Winston** | Logging | 3.11+ |
| **Helmet** | Security headers | 7.1+ |
| **Express Rate Limit** | Rate limiting | 7.1+ |
| **Swagger** | API documentation | 6.2+ |
| **Jest** | Testing framework | 29.7+ |

### Backend (NestJS) - Alternative Implementation

| Technology | Purpose | Version |
|------------|---------|---------|
| **NestJS** | TypeScript framework | 11.0+ |
| **TypeScript** | Type-safe JavaScript | 5.7+ |
| **MongoDB** | Database | 4.0+ |
| **Mongoose** | ODM for MongoDB | 8.20+ |
| **Passport JWT** | Authentication | 4.0+ |
| **Bcrypt** | Password hashing | 6.0+ |
| **Class Validator** | DTO validation | 0.14+ |
| **Helmet** | Security headers | 8.1+ |
| **Throttler** | Rate limiting | 6.4+ |
| **Swagger** | API documentation | 11.2+ |
| **Jest** | Testing framework | 30.0+ |

### Frontend

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI library | 19.0 |
| **React Router** | Routing | 7.2+ |
| **Zustand** | State management | 5.0+ |
| **Axios** | HTTP client | 1.8+ |
| **TailwindCSS** | Styling | 3.4+ |
| **React Icons** | Icon library | 5.5+ |
| **React Testing Library** | Testing | 16.2+ |

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Development server
- **Git** - Version control
- **Vercel** - Deployment platform

---

## 🏗️ Architecture

### Backend Options

The project provides **two backend implementations** with identical functionality:

#### Express.js Backend (`/backend`)
- **Pros**: Mature ecosystem, simple setup, widely adopted
- **Cons**: Less structured, manual TypeScript setup
- **Best for**: Teams familiar with Express, rapid prototyping

#### NestJS Backend (`/backend-nestjs`)
- **Pros**: Built-in TypeScript, dependency injection, better performance, modular architecture
- **Cons**: Steeper learning curve, more boilerplate
- **Best for**: Large-scale applications, teams preferring TypeScript, performance-critical scenarios

> **Note**: Both backends connect to the same MongoDB database and provide identical API endpoints. Choose based on your team's expertise and performance requirements.

---

The platform follows a **layered architecture** pattern with clear separation of concerns:

### Backend Architecture

```
┌─────────────────────────────────────────────────┐
│                   Client Layer                   │
│            (Frontend React App)                  │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│                  API Gateway                     │
│         (Express Routes + Middleware)            │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│               Controller Layer                   │
│          (Request/Response Handling)             │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│                Service Layer                     │
│             (Business Logic)                     │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│              Repository Layer                    │
│           (Data Access Logic)                    │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│                  Model Layer                     │
│          (Mongoose Schemas/Models)               │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│                MongoDB Database                  │
└─────────────────────────────────────────────────┘
```

### Key Design Patterns

- **MVC Pattern** - Model-View-Controller separation
- **Repository Pattern** - Abstract data access layer
- **Service Layer Pattern** - Business logic encapsulation
- **Middleware Pattern** - Request processing pipeline
- **Singleton Pattern** - Database connection management

### Data Models

- **User** - Volunteer accounts with profile information
- **NGO** - Organization accounts with credentials
- **Event** - Volunteer opportunities with details
- **Admin** - Administrative accounts with elevated permissions

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- **MongoDB** >= 4.0 (local or Atlas)
- **Git**

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/debudebuye/eth-volunteer.git
cd eth-volunteer
```

#### 2. Backend Setup

**Choose one of the two backend implementations:**

##### Option A: Express.js Backend (Recommended for beginners)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# Required variables:
# - MONGO_URI (MongoDB connection string)
# - JWT_SECRET (Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
# - EMAIL_USER (Gmail address)
# - EMAIL_PASS (Gmail app-specific password)
# - FRONTEND_URL (http://localhost:3000)
# - BACKEND_BASEURL (http://localhost:5000)

# Start development server
npm run dev
```

The Express.js backend server will start on `http://localhost:5000`

##### Option B: NestJS Backend (Recommended for performance)

```bash
# Navigate to NestJS backend directory
cd backend-nestjs

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration (same as Express backend)

# Start development server
npm run start:dev
```

The NestJS backend server will start on `http://localhost:5000`

> **Important**: Only run ONE backend at a time. Both use the same port (5000) and database.

#### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env .env.local

# Edit .env.local with:
# REACT_APP_API_URL=http://localhost:5000

# Start development server
npm start
```

The frontend will start on `http://localhost:3000`

### Quick Start Commands

```bash
# Backend
cd backend
npm run dev          # Start development server
npm test             # Run tests
npm run lint         # Lint code
npm run format       # Format code

# Frontend
cd frontend
npm start            # Start development server
npm test             # Run tests
npm run build        # Build for production
```

---

## 📁 Project Structure

```
eth-volunteer/
│
├── backend/                    # Backend API (Express.js)
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── services/           # Business logic
│   │   ├── repositories/       # Data access layer
│   │   ├── routes/             # API routes
│   │   ├── utils/              # Utility functions
│   │   └── app.js              # Express app configuration
│   ├── models/                 # Mongoose models
│   ├── middleware/             # Custom middleware
│   │   ├── authMiddleware.js   # JWT authentication
│   │   ├── errorHandler.js     # Error handling
│   │   └── validators.js       # Input validation
│   ├── config/                 # Configuration files
│   ├── tests/                  # Test files
│   ├── docs/                   # Documentation
│   ├── server.js               # Entry point
│   └── package.json
│
├── backend-nestjs/             # Backend API (NestJS - Alternative)
│   ├── src/
│   │   ├── modules/            # Feature modules
│   │   ├── common/             # Shared utilities
│   │   ├── config/             # Configuration
│   │   └── main.ts             # Entry point
│   ├── test/                   # E2E tests
│   ├── dist/                   # Compiled output
│   └── package.json
│
├── frontend/                   # Frontend React App
│   ├── public/                 # Static files
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   │   ├── admin/          # Admin pages
│   │   │   ├── ngo/            # NGO pages
│   │   │   └── users/          # Volunteer pages
│   │   ├── services/           # API services
│   │   ├── store/              # Zustand state management
│   │   ├── hooks/              # Custom React hooks
│   │   ├── App.js              # Main app component
│   │   └── index.js            # Entry point
│   └── package.json
│
├── .github/                    # GitHub workflows
├── README.md                   # This file
└── .gitignore
```

---

## 📚 API Documentation

### Interactive Documentation

Visit **[Swagger UI](http://localhost:5000/api/docs)** when the backend is running to access interactive API documentation.

### Base URLs

- **Development**: `http://localhost:5000`
- **Production**: `https://your-domain.com`

### Authentication Flow

1. **Register** as Volunteer or NGO
2. **Login** to receive JWT token
3. **Include token** in Authorization header: `Bearer <token>`
4. **Access protected routes** with valid token

### Key Endpoints

#### Authentication
- `POST /api/auth/register/volunteer` - Register volunteer
- `POST /api/auth/register/ngo` - Register NGO
- `POST /api/auth/login` - Login volunteer
- `POST /api/auth/login-ngo` - Login NGO
- `POST /api/auth/login-admin` - Login admin

#### Events
- `GET /api/events/approved` - Get approved events
- `POST /api/events/create` - Create event (NGO only)
- `PUT /api/events/approve/:id` - Approve event (Admin only)
- `DELETE /api/events/:id` - Delete event

#### Users
- `GET /api/users` - Get all users
- `PUT /api/update-profile` - Update user profile
- `POST /api/join-event` - Join an event

#### Admin
- `GET /api/admin/users` - Get all users (Admin only)
- `GET /api/admin/events` - Get all events (Admin only)
- `DELETE /api/admin/users/:id` - Delete user (Admin only)

For complete API documentation, see [`backend/docs/API_DOCUMENTATION.md`](./backend/docs/API_DOCUMENTATION.md)

---

## 🚀 Deployment

### Backend Deployment (Vercel)

```bash
cd backend
vercel
```

**Environment Variables to Set:**
- `MONGO_URI`
- `JWT_SECRET`
- `NODE_ENV=production`
- `FRONTEND_URL`
- `EMAIL_USER`
- `EMAIL_PASS`
- `BACKEND_BASEURL`

### Frontend Deployment (Vercel)

```bash
cd frontend
npm run build
vercel
```

**Environment Variables to Set:**
- `REACT_APP_API_URL` (your backend URL)

### Important Notes

- Configure CORS to allow your frontend domain
- Use cloud storage (Cloudinary, AWS S3) for file uploads in production
- Enable MongoDB Atlas IP whitelist for your deployment platform
- Set up SSL certificates for HTTPS
- Configure rate limiting based on expected traffic

---

## 🔒 Security

### Implemented Security Measures

- ✅ **JWT Authentication** - Secure token-based authentication with 24-hour expiration
- ✅ **Password Hashing** - Bcrypt with cost factor 12
- ✅ **Rate Limiting** - Protection against brute force attacks
- ✅ **Input Validation** - Express-validator for all inputs
- ✅ **XSS Protection** - Helmet.js security headers
- ✅ **CORS Configuration** - Controlled cross-origin access
- ✅ **SQL Injection Prevention** - Mongoose parameterized queries
- ✅ **Environment Variables** - Sensitive data in .env files
- ✅ **Role-Based Access Control** - Admin, NGO, and Volunteer roles

### Security Best Practices

1. **Never commit** `.env` files to version control
2. **Use strong JWT secrets** (64+ characters)
3. **Enable HTTPS** in production
4. **Keep dependencies updated** regularly
5. **Monitor logs** for suspicious activity
6. **Implement backup strategies** for database

For detailed security guidelines, see [`backend/docs/SECURITY_NOTES.md`](./backend/docs/SECURITY_NOTES.md)

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm test -- --coverage      # Coverage report
```

### Frontend Tests

```bash
cd frontend
npm test                    # Run all tests
npm test -- --coverage      # Coverage report
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Write tests for new features
- Update documentation as needed
- Run linting and tests before submitting PR
- Keep commits atomic and well-described

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 👥 Authors

- **Development Team** - [debudebuye](https://github.com/debudebuye)

---

## 🙏 Acknowledgments

- Ethiopian NGO community for inspiration and feedback
- Open source community for amazing tools and libraries
- All contributors who have helped improve this platform

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/debudebuye/eth-volunteer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/debudebuye/eth-volunteer/discussions)
- **Email**: support@ethvolunteers.org

---

## 🗺️ Roadmap

### Upcoming Features

- [ ] Mobile application (React Native)
- [ ] Real-time notifications (WebSocket)
- [ ] Advanced search and filtering
- [ ] Volunteer skill matching algorithm
- [ ] Impact analytics dashboard
- [ ] Multi-language support (Amharic, Oromo, Tigrinya)
- [ ] Social media integration
- [ ] Volunteer certification system
- [ ] NGO verification system
- [ ] Payment integration for donations

---

## 📊 Version History

### v2.0.0 (Current)
- ✨ Refactored to industry-standard architecture
- ✨ Added service and repository layers
- ✨ Implemented comprehensive error handling
- ✨ Added Winston logging
- ✨ Enhanced security measures
- ✨ Added testing framework
- ✨ Improved documentation

### v1.0.0
- 🎉 Initial release
- 🎉 Basic CRUD operations
- 🎉 JWT authentication
- 🎉 Event management

---

<div align="center">

**Made with ❤️ for the Ethiopian community**

[⬆ Back to Top](#-eth-volunteers-platform)

</div>

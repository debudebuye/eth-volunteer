# Getting Started

Welcome to the Ethiopian Volunteer Platform Backend! 🎉

## 🚀 Quick Links

- **[Main README](./README.md)** - Project overview and API documentation
- **[Documentation Index](./docs/README.md)** - All documentation in one place
- **[Quick Start Guide](./docs/QUICK_START.md)** - Get running in 5 minutes ⭐

## 📁 Project Structure

```
eth-volunteer-backend/
│
├── 📁 src/                    # Source code
│   ├── controllers/           # HTTP request handlers
│   ├── services/              # Business logic
│   ├── repositories/          # Database operations
│   ├── routes/                # API routes
│   └── utils/                 # Helpers
│
├── 📁 docs/                   # 📚 All Documentation
│   ├── README.md              # Documentation index
│   ├── QUICK_START.md         # Quick start guide
│   ├── ARCHITECTURE.md        # Architecture details
│   ├── SECURITY_NOTES.md      # Security checklist
│   ├── DEPLOYMENT.md          # Deployment guide
│   ├── MIGRATION_GUIDE.md     # Migration from v1.0
│   ├── PROJECT_STRUCTURE.md   # File structure
│   ├── REFACTORING_SUMMARY.md # What changed
│   └── CHECKLIST.md           # Implementation checklist
│
├── 📁 models/                 # Database schemas
├── 📁 middleware/             # Express middleware
├── 📁 config/                 # Configuration
├── 📁 tests/                  # Test files
│
├── 📄 README.md               # Main documentation
├── 📄 server.js               # Entry point
└── 📄 package.json            # Dependencies

```

## 🎯 What Should I Read First?

### If you're new to the project:
1. **[Quick Start Guide](./docs/QUICK_START.md)** - Get up and running
2. **[Project Structure](./docs/PROJECT_STRUCTURE.md)** - Understand the layout
3. **[Architecture](./docs/ARCHITECTURE.md)** - Learn the design

### If you're migrating from v1.0:
1. **[Refactoring Summary](./docs/REFACTORING_SUMMARY.md)** - See what changed
2. **[Migration Guide](./docs/MIGRATION_GUIDE.md)** - Step-by-step migration
3. **[Checklist](./docs/CHECKLIST.md)** - Track your progress

### If you're deploying:
1. **[Security Notes](./docs/SECURITY_NOTES.md)** - Security checklist
2. **[Deployment Guide](./docs/DEPLOYMENT.md)** - Deploy instructions
3. **[Checklist](./docs/CHECKLIST.md)** - Pre-deployment checks

## ⚡ Quick Start (30 seconds)

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env with your credentials
# (MongoDB URI, JWT Secret, Email credentials)

# 4. Start the server
npm run dev
```

That's it! Your API is running at `http://localhost:5000`

## 📚 Documentation Overview

| Document | Purpose | When to Read |
|----------|---------|--------------|
| [Quick Start](./docs/QUICK_START.md) | Get started fast | First time setup |
| [Architecture](./docs/ARCHITECTURE.md) | Understand design | Learning the codebase |
| [Security Notes](./docs/SECURITY_NOTES.md) | Security checklist | Before deployment |
| [Deployment](./docs/DEPLOYMENT.md) | Deploy guide | Going to production |
| [Migration Guide](./docs/MIGRATION_GUIDE.md) | Migrate from v1.0 | Upgrading |
| [Project Structure](./docs/PROJECT_STRUCTURE.md) | File organization | Understanding layout |
| [Refactoring Summary](./docs/REFACTORING_SUMMARY.md) | What changed | Seeing improvements |
| [Checklist](./docs/CHECKLIST.md) | Track progress | Throughout development |

## 🔑 Key Features

✅ **Industry-Standard Architecture** - Layered design (Routes → Controllers → Services → Repositories)
✅ **Security** - JWT auth, rate limiting, input validation, XSS protection
✅ **Testing** - Jest framework with unit and integration tests
✅ **Logging** - Winston logger with file and console output
✅ **Code Quality** - ESLint + Prettier for consistent code
✅ **Documentation** - Comprehensive docs for everything
✅ **Production Ready** - Deployment configs included

## 🛠️ Available Commands

```bash
npm start          # Start production server
npm run dev        # Start development server (auto-reload)
npm test           # Run tests
npm run test:watch # Run tests in watch mode
npm run lint       # Check code quality
npm run lint:fix   # Fix linting issues
npm run format     # Format code with Prettier
```

## 🌐 API Endpoints

### Health Check
```bash
GET /health
```

### Authentication
```bash
POST /api/auth/register/volunteer  # Register volunteer
POST /api/auth/register/ngo        # Register NGO
POST /api/auth/login               # Login volunteer
POST /api/auth/login-ngo           # Login NGO
```

### Events
```bash
GET  /api/events/approved          # Get approved events
POST /api/events/create            # Create event (NGO)
PUT  /api/events/approve/:id       # Approve event (Admin)
```

See [README.md](./README.md) for complete API documentation.

## 🆘 Need Help?

### MongoDB Connection Issues?
See [QUICK_FIX.md](./QUICK_FIX.md) for immediate solutions!

1. **Check the docs** - Start with [docs/README.md](./docs/README.md)
2. **Troubleshooting** - See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
3. **Check logs** - Look in `logs/` folder
4. **Create an issue** - On GitHub

## 🎓 Learning Path

### Day 1: Setup
- [ ] Read [Quick Start Guide](./docs/QUICK_START.md)
- [ ] Install and configure
- [ ] Test basic endpoints

### Day 2: Understanding
- [ ] Read [Architecture](./docs/ARCHITECTURE.md)
- [ ] Read [Project Structure](./docs/PROJECT_STRUCTURE.md)
- [ ] Explore the code

### Day 3: Development
- [ ] Make a small change
- [ ] Write a test
- [ ] Run linting and formatting

### Day 4: Deployment
- [ ] Read [Security Notes](./docs/SECURITY_NOTES.md)
- [ ] Read [Deployment Guide](./docs/DEPLOYMENT.md)
- [ ] Deploy to staging

## 🎯 Next Steps

1. **Install**: Run `npm install`
2. **Configure**: Copy and edit `.env`
3. **Start**: Run `npm run dev`
4. **Learn**: Read [docs/QUICK_START.md](./docs/QUICK_START.md)
5. **Build**: Start coding!

## 📞 Support

- **Documentation**: [docs/README.md](./docs/README.md)
- **Issues**: Create a GitHub issue
- **Email**: support@example.com

---

**Ready to build something amazing? Let's go! 🚀**

For detailed information, visit the [Documentation Index](./docs/README.md)

# API Documentation

## 📚 Swagger/OpenAPI Documentation

The Ethiopian Volunteer Platform API is fully documented using Swagger/OpenAPI 3.0 specification.

### Access Swagger UI

Once the server is running, access the interactive API documentation at:

**Development**: `http://localhost:5000/api-docs`
**Production**: `https://your-domain.com/api-docs`

### Features

- ✅ Interactive API testing
- ✅ Request/response examples
- ✅ Schema definitions
- ✅ Authentication testing
- ✅ Try it out functionality

## 🔐 Authentication

Most endpoints require JWT authentication. To use protected endpoints:

1. Register or login to get a JWT token
2. Click "Authorize" button in Swagger UI
3. Enter: `Bearer YOUR_TOKEN_HERE`
4. Click "Authorize"
5. Now you can test protected endpoints

## 📋 API Endpoints Overview

### Authentication Endpoints

#### POST /api/auth/register/volunteer
Register a new volunteer account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "location": "Addis Ababa"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Volunteer registered successfully",
  "data": {
    "userId": "..."
  }
}
```

#### POST /api/auth/register/ngo
Register a new NGO account.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@ngo.org",
  "password": "Password123",
  "organization": "Help Ethiopia NGO"
}
```

#### POST /api/auth/login
Login as a volunteer.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "volunteer"
    }
  }
}
```

#### POST /api/auth/login-ngo
Login as an NGO.

### Admin Endpoints

#### POST /api/admin/register
Register a new admin account.

#### POST /api/admin/login
Login as an admin.

### User Endpoints

#### GET /api/users
Get all users.

**Response (200):**
```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": {
    "users": [...]
  }
}
```

#### GET /api/profile/:email
Get user profile by email.

#### PUT /api/update-profile
Update user profile.

**Request Body:**
```json
{
  "email": "john@example.com",
  "name": "John Updated",
  "location": "Bahir Dar"
}
```

#### DELETE /api/users/:id
Delete a user (requires authentication).

#### PATCH /api/users/:id/block
Block or unblock a user (requires authentication).

**Request Body:**
```json
{
  "isBlocked": true
}
```

#### POST /api/join-event
Join an event.

**Request Body:**
```json
{
  "userId": "user-id",
  "eventId": "event-id"
}
```

#### POST /api/unjoin-event
Leave an event.

#### GET /api/joined-events?userId=:userId
Get events joined by a user.

### Event Endpoints

#### POST /api/events/create
Create a new event (NGO only, requires authentication).

**Request:** `multipart/form-data`
```
name: Community Cleanup
description: Help clean our community
date: 2025-12-01
location: Addis Ababa
creatorEmail: jane@ngo.org
creatorName: Jane Smith
image: [file]
```

**Response (201):**
```json
{
  "success": true,
  "message": "Event created successfully! Pending admin approval.",
  "data": {
    "event": {...}
  }
}
```

#### GET /api/events/approved
Get all approved events (public).

#### GET /api/events/pending
Get all pending events (Admin only).

#### GET /api/events/rejected
Get all rejected events (Admin only).

#### GET /api/events/:eventId
Get event by ID.

#### GET /api/events/by-location?location=:location
Get events by location.

#### GET /api/events/following?userId=:userId
Get events followed by a user.

#### PUT /api/events/approve/:id
Approve an event (Admin only).

#### PUT /api/events/reject/:id
Reject an event (Admin only).

#### PUT /api/events/disapprove/:id
Move approved event back to pending (Admin only).

#### PUT /api/events/unreject/:id
Move rejected event back to pending (Admin only).

#### PUT /api/events/update/:eventId
Update an event (NGO only, must be event creator).

**Request Body:**
```json
{
  "name": "Updated Event Name",
  "description": "Updated description",
  "date": "2025-12-15",
  "location": "Updated Location"
}
```

#### DELETE /api/events/delete/:eventId
Delete an event (NGO only, must be event creator).

#### POST /api/events/likes
Like an event.

**Request Body:**
```json
{
  "eventId": "event-id",
  "userId": "user-id"
}
```

#### POST /api/events/unlike
Unlike an event.

#### POST /api/events/follow
Follow an event.

**Request Body:**
```json
{
  "eventId": "event-id",
  "userId": "user-id"
}
```

#### POST /api/events/comment
Add a comment to an event.

**Request Body:**
```json
{
  "eventId": "event-id",
  "userId": "user-id",
  "text": "Great event!"
}
```

#### GET /api/events/:eventId/comments
Get comments for an event.

#### POST /api/events/:eventId/comments/:commentId/reply
Reply to a comment (NGO only).

**Request Body:**
```json
{
  "text": "Thank you for your interest!"
}
```

#### GET /api/events/events
Get events created by logged-in NGO.

#### GET /api/events/track
Get events with detailed tracking info (NGO only).

### NGO Endpoints

#### GET /api/ngo/ngo-users
Get all NGOs.

#### DELETE /api/ngo/ngo-users/:id
Delete an NGO (requires authentication).

#### PATCH /api/ngo/ngo-users/:id
Update NGO status (block/unblock).

**Request Body:**
```json
{
  "status": "blocked"
}
```

### Health Endpoints

#### GET /health
Health check endpoint.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-21T10:00:00.000Z",
  "environment": "development"
}
```

#### GET /
API root endpoint with information.

## 📊 Response Format

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

## 🔒 Authentication

### JWT Token Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration
- Access tokens expire after 24 hours
- Refresh tokens (if implemented) expire after 7 days

## 📝 Data Models

### User Schema
```json
{
  "_id": "string",
  "name": "string",
  "email": "string (email format)",
  "location": "string",
  "role": "volunteer | ngo | admin",
  "isBlocked": "boolean",
  "joinedEvents": ["event-id"],
  "createdAt": "date-time"
}
```

### NGO Schema
```json
{
  "_id": "string",
  "name": "string",
  "email": "string (email format)",
  "organization": "string",
  "role": "ngo",
  "status": "active | blocked",
  "createdAt": "date-time"
}
```

### Event Schema
```json
{
  "_id": "string",
  "name": "string",
  "description": "string",
  "date": "date-time",
  "location": "string",
  "image": "string (URL)",
  "status": "pending | approved | rejected",
  "likes": "number",
  "likedBy": ["user-id"],
  "followers": ["user-id"],
  "participants": ["user-id"],
  "comments": [
    {
      "userId": "user-id",
      "text": "string",
      "replies": [...]
    }
  ],
  "createdBy": "ngo-id",
  "creatorEmail": "string",
  "creatorName": "string"
}
```

## 🚦 HTTP Status Codes

- `200` - OK (Success)
- `201` - Created (Resource created successfully)
- `400` - Bad Request (Validation error)
- `401` - Unauthorized (Authentication required)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found (Resource not found)
- `409` - Conflict (Resource already exists)
- `500` - Internal Server Error

## 🔄 Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Auth endpoints**: 5 requests per 15 minutes
- **Registration**: 3 requests per hour

## 📦 Pagination

Currently not implemented. All list endpoints return all results.

**Planned for future:**
```
GET /api/events/approved?page=1&limit=10
```

## 🔍 Filtering & Sorting

### Location Filter
```
GET /api/events/by-location?location=Addis Ababa
```

### Status Filter (Admin)
```
GET /api/events/pending
GET /api/events/approved
GET /api/events/rejected
```

## 🧪 Testing with Swagger

1. **Start the server**: `npm run dev`
2. **Open Swagger UI**: `http://localhost:5000/api-docs`
3. **Register a user**: Use `/api/auth/register/volunteer`
4. **Login**: Use `/api/auth/login` to get a token
5. **Authorize**: Click "Authorize" and enter `Bearer YOUR_TOKEN`
6. **Test endpoints**: Try any protected endpoint

## 📱 Example API Calls

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register/volunteer \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "location": "Addis Ababa"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

**Get Events (with auth):**
```bash
curl -X GET http://localhost:5000/api/events/approved \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using JavaScript (Fetch)

```javascript
// Register
const response = await fetch('http://localhost:5000/api/auth/register/volunteer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'Password123',
    location: 'Addis Ababa',
  }),
});

const result = await response.json();
console.log(result);

// Login and get token
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'Password123',
  }),
});

const loginResult = await loginResponse.json();
const token = loginResult.data.token;

// Use token for protected endpoints
const eventsResponse = await fetch('http://localhost:5000/api/events/pending', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const events = await eventsResponse.json();
```

## 🆘 Common Issues

### 401 Unauthorized
- Make sure you're sending the token in the Authorization header
- Check that the token hasn't expired
- Verify the token format: `Bearer YOUR_TOKEN`

### 403 Forbidden
- You don't have permission for this endpoint
- Check your user role (volunteer/ngo/admin)

### 400 Bad Request
- Check the request body format
- Verify all required fields are present
- Check field validation rules

### 429 Too Many Requests
- You've hit the rate limit
- Wait 15 minutes and try again

## 📚 Additional Resources

- **Swagger UI**: `/api-docs`
- **OpenAPI Spec**: Available in code at `src/config/swagger.js`
- **Postman Collection**: Can be generated from Swagger
- **Main Documentation**: [README.md](../README.md)

## 🔄 API Versioning

Current version: **v2.0.0**

Future versions will be accessible via:
- `/api/v2/...` (current)
- `/api/v3/...` (future)

---

**For more information, visit the interactive Swagger documentation at `/api-docs`**

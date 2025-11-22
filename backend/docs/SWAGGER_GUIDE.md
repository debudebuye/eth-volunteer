# Swagger API Documentation Guide

## 🚀 Quick Access

### Local Development
```
http://localhost:5000/api/docs
```

### Production
```
https://your-domain.com/api/docs
```

## 📖 What is Swagger?

Swagger provides **interactive API documentation** where you can:
- ✅ View all API endpoints
- ✅ See request/response formats
- ✅ Test endpoints directly in the browser
- ✅ Authenticate and try protected routes
- ✅ Download API specifications

## 🎯 How to Use Swagger UI

### Step 1: Start the Server
```bash
npm run dev
```

### Step 2: Open Swagger UI
Navigate to: `http://localhost:5000/api/docs`

### Step 3: Explore Endpoints
- Click on any endpoint to expand it
- View request parameters
- See response schemas
- Check status codes

### Step 4: Test Endpoints

#### For Public Endpoints (No Auth Required)
1. Click on the endpoint (e.g., `GET /api/events/approved`)
2. Click **"Try it out"**
3. Click **"Execute"**
4. View the response

#### For Protected Endpoints (Auth Required)
1. **Get a Token First**:
   - Go to `POST /api/auth/login`
   - Click "Try it out"
   - Enter credentials
   - Click "Execute"
   - Copy the token from response

2. **Authorize**:
   - Click the **"Authorize"** button (🔒 icon at top)
   - Enter: `Bearer YOUR_TOKEN_HERE`
   - Click "Authorize"
   - Click "Close"

3. **Test Protected Endpoint**:
   - Now you can test any protected endpoint
   - Click "Try it out"
   - Fill in parameters
   - Click "Execute"

## 🔐 Authentication Flow in Swagger

### Example: Testing Event Creation (NGO Only)

1. **Register NGO**
```
POST /api/auth/register/ngo
{
  "name": "Test NGO",
  "email": "test@ngo.org",
  "password": "Password123",
  "organization": "Test Organization"
}
```

2. **Login**
```
POST /api/auth/login-ngo
{
  "email": "test@ngo.org",
  "password": "Password123"
}
```
Copy the token from response.

3. **Authorize**
- Click "Authorize" button
- Enter: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Click "Authorize"

4. **Create Event**
```
POST /api/events/create
- Upload image
- Fill in event details
- Execute
```

## 📋 Swagger UI Features

### 1. Endpoint Groups (Tags)
- **Authentication** - Login/Register endpoints
- **Admin** - Admin management
- **Users** - User operations
- **Events** - Event management
- **NGOs** - NGO operations
- **Health** - Health checks

### 2. Request Details
- HTTP Method (GET, POST, PUT, DELETE)
- Endpoint path
- Parameters (path, query, body)
- Request body schema
- Content types

### 3. Response Details
- Status codes
- Response schema
- Example responses
- Error formats

### 4. Models/Schemas
- Click "Schemas" at bottom
- View all data models
- See field types and requirements

## 🎨 Swagger UI Tips

### Tip 1: Use the Search
- Press `Ctrl+F` (or `Cmd+F` on Mac)
- Search for endpoint names

### Tip 2: Collapse/Expand All
- Click tag names to collapse/expand sections
- Focus on what you need

### Tip 3: Download Specification
- Click "Download" at top
- Get OpenAPI JSON/YAML spec
- Import into Postman or other tools

### Tip 4: Try Different Servers
- Switch between development and production
- Test against different environments

### Tip 5: Check Examples
- Look at example values
- Use them as templates
- Modify for your needs

## 🔧 Common Tasks

### Task 1: Test User Registration
1. Go to `POST /api/auth/register/volunteer`
2. Click "Try it out"
3. Modify the example JSON:
```json
{
  "name": "Your Name",
  "email": "your@email.com",
  "password": "YourPassword123",
  "location": "Your City"
}
```
4. Click "Execute"
5. Check response

### Task 2: Get All Events
1. Go to `GET /api/events/approved`
2. Click "Try it out"
3. Click "Execute"
4. View list of events

### Task 3: Create Event (NGO)
1. Login as NGO (get token)
2. Authorize with token
3. Go to `POST /api/events/create`
4. Click "Try it out"
5. Fill in form fields
6. Upload image (optional)
7. Click "Execute"

### Task 4: Approve Event (Admin)
1. Login as Admin (get token)
2. Authorize with token
3. Go to `PUT /api/events/approve/{id}`
4. Enter event ID
5. Click "Execute"

## 📊 Understanding Responses

### Success Response (200/201)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Your data here
  }
}
```

### Error Response (400/401/403/404)
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

## 🐛 Troubleshooting

### Issue: "Failed to fetch"
**Solution**: Make sure the server is running
```bash
npm run dev
```

### Issue: "401 Unauthorized"
**Solution**: 
1. Check if you're authorized
2. Check if token is valid
3. Re-login if token expired

### Issue: "403 Forbidden"
**Solution**:
1. Check if you have the right role
2. NGO endpoints need NGO role
3. Admin endpoints need Admin role

### Issue: "Network Error"
**Solution**:
1. Check server is running
2. Check correct port (5000)
3. Check firewall settings

### Issue: Can't upload file
**Solution**:
1. Make sure endpoint accepts multipart/form-data
2. File size should be reasonable
3. Check file type is allowed

## 🎓 Learning Resources

### Swagger/OpenAPI
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)

### API Testing
- [REST API Best Practices](https://restfulapi.net/)
- [HTTP Status Codes](https://httpstatuses.com/)

## 💡 Pro Tips

1. **Save Your Tokens**: Copy tokens to a text file for reuse
2. **Use Postman**: Export Swagger spec to Postman for advanced testing
3. **Check Examples**: Always check example values before testing
4. **Read Descriptions**: Endpoint descriptions explain requirements
5. **Test Incrementally**: Start with simple endpoints, then complex ones

## 🔄 Workflow Example

### Complete Testing Workflow

1. **Health Check**
   - `GET /health` - Verify server is running

2. **Register**
   - `POST /api/auth/register/volunteer` - Create account

3. **Login**
   - `POST /api/auth/login` - Get token

4. **Authorize**
   - Click "Authorize" - Add token

5. **Test Protected Routes**
   - `GET /api/events/pending` - Test with auth

6. **Create Resources**
   - `POST /api/events/create` - Create event (if NGO)

7. **Verify**
   - `GET /api/events/approved` - Check created event

## 📞 Support

- **Swagger Issues**: Check server logs
- **API Issues**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **General Help**: See [README.md](./README.md)

---

**Happy Testing! 🚀**

For more details, visit: http://localhost:5000/api/docs

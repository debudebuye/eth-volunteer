# Migration Guide: v1.0 → v2.0

This guide helps you migrate from the old architecture to the new industry-standard architecture.

## Overview of Changes

### Architecture Changes
- **Old**: Routes directly calling models
- **New**: Routes → Controllers → Services → Repositories → Models

### File Structure Changes
```
Old Structure:
├── api/index.js
├── routes/
├── models/
├── middleware/
└── config/

New Structure:
├── server.js (entry point)
├── src/
│   ├── app.js
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── routes/
│   └── utils/
├── models/
├── middleware/
├── config/
└── tests/
```

## Step-by-Step Migration

### 1. Install New Dependencies

```bash
npm install winston morgan
npm install --save-dev eslint prettier jest supertest nodemon
```

### 2. Update Environment Variables

Add to your `.env`:
```env
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=info
```

### 3. Update Entry Point

**Old**: `api/index.js` was the entry point
**New**: `server.js` is the entry point

No changes needed if you're using `npm start` - package.json already updated.

### 4. Update Import Paths (if you have custom code)

**Old**:
```javascript
const Event = require('../models/Event');
```

**New** (from controllers/services):
```javascript
const eventService = require('../services/eventService');
```

### 5. API Response Format Changed

**Old**:
```json
{
  "message": "Success",
  "event": { ... }
}
```

**New**:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "event": { ... }
  }
}
```

### 6. Error Response Format Changed

**Old**:
```json
{
  "message": "Error message"
}
```

**New**:
```json
{
  "success": false,
  "message": "Error message"
}
```

## Frontend Changes Required

### 1. Update API Response Handling

**Old**:
```javascript
const response = await fetch('/api/events/approved');
const events = await response.json();
// events is array
```

**New**:
```javascript
const response = await fetch('/api/events/approved');
const result = await response.json();
const events = result.data.events;
// Access via result.data
```

### 2. Update Error Handling

**Old**:
```javascript
if (response.message) {
  // Handle error
}
```

**New**:
```javascript
if (!response.success) {
  // Handle error
  console.error(response.message);
}
```

### 3. Check Success Status

**New approach**:
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify(credentials)
});

const result = await response.json();

if (result.success) {
  // Success
  const token = result.data.token;
} else {
  // Error
  console.error(result.message);
}
```

## Breaking Changes

### 1. Response Structure
All API responses now follow a consistent format with `success`, `message`, and `data` fields.

### 2. Error Codes
Error responses now use proper HTTP status codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 500: Internal Server Error

### 3. Validation Errors
Validation errors now return an array of errors:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 4. Authentication Header
No change, but now properly validated:
```
Authorization: Bearer <token>
```

## Testing Your Migration

### 1. Test Authentication
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register/volunteer \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"Password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'
```

### 2. Test Protected Routes
```bash
curl -X GET http://localhost:5000/api/events/pending \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Check Health
```bash
curl http://localhost:5000/health
```

## Rollback Plan

If you need to rollback:

1. Keep the old code in a separate branch
2. The database schema hasn't changed, so data is compatible
3. Switch back to the old branch and redeploy

## Common Issues

### Issue 1: "Cannot find module"
**Solution**: Make sure all dependencies are installed:
```bash
npm install
```

### Issue 2: Frontend getting undefined data
**Solution**: Update frontend to access `result.data` instead of direct response

### Issue 3: Validation errors
**Solution**: Check that request body matches new validation rules (see middleware/validator.js)

### Issue 4: CORS errors
**Solution**: Make sure `FRONTEND_URL` is set correctly in `.env`

## Performance Improvements

The new architecture provides:
- ✅ Better error handling (fewer crashes)
- ✅ Consistent response format
- ✅ Better logging (easier debugging)
- ✅ Rate limiting (better security)
- ✅ Input validation (fewer bad requests)
- ✅ Testable code (easier maintenance)

## Need Help?

1. Check the logs in `logs/` directory
2. Review ARCHITECTURE.md for understanding the new structure
3. Check SECURITY_NOTES.md for security improvements
4. Run tests: `npm test`

## Verification Checklist

After migration, verify:
- [ ] Server starts without errors
- [ ] Health check endpoint works
- [ ] User registration works
- [ ] User login works
- [ ] Protected routes require authentication
- [ ] Events can be created
- [ ] Events can be approved
- [ ] Email notifications work
- [ ] File uploads work
- [ ] Frontend can communicate with backend
- [ ] All tests pass

## Timeline

Recommended migration timeline:
1. **Day 1**: Set up new structure, install dependencies
2. **Day 2**: Update frontend to handle new response format
3. **Day 3**: Test all endpoints
4. **Day 4**: Deploy to staging
5. **Day 5**: Monitor and fix issues
6. **Day 6**: Deploy to production

## Support

For migration support:
- Review the code examples in `src/`
- Check test files in `tests/` for usage examples
- Refer to README.md for API documentation

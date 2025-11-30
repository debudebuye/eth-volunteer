# Cookie Authentication Debugging Guide

## Issue
"No token found. Please log in." error when creating events

## Root Cause
The app now uses HttpOnly cookies for authentication instead of localStorage tokens. If cookies aren't being sent or set properly, authentication will fail.

## How to Debug

### 1. Check if Cookies are Set After Login

**In Browser DevTools:**
1. Open DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click on **Cookies** → `http://localhost:5001`
4. Look for these cookies:
   - `token` - The access token
   - `refreshToken` - The refresh token

**Expected Values:**
```
Name: token
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Domain: localhost
Path: /
HttpOnly: ✓
Secure: (empty in development)
SameSite: Lax
```

### 2. Check if Cookies are Being Sent

**In Network Tab:**
1. Open DevTools → **Network** tab
2. Try to create an event
3. Click on the `/events/create` request
4. Go to **Headers** section
5. Scroll to **Request Headers**
6. Look for `Cookie:` header

**Expected:**
```
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; refreshToken=...
```

### 3. Common Issues

#### Issue 1: Cookies Not Set After Login
**Symptom:** No cookies in Application tab after logging in

**Possible Causes:**
- Backend not setting cookies in response
- CORS not configured to allow credentials
- SameSite policy blocking cookies

**Solution:**
Check backend login controller sets cookies:
```javascript
res.cookie('token', accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 1000 // 1 hour
});
```

#### Issue 2: Cookies Not Sent with Requests
**Symptom:** Cookies exist but not in request headers

**Possible Causes:**
- Missing `credentials: 'include'` in fetch
- CORS not allowing credentials
- Different domain/port

**Solution:**
Ensure all fetch requests include:
```javascript
fetch(url, {
  credentials: 'include',
  // ... other options
})
```

And backend CORS allows credentials:
```javascript
cors({
  origin: 'http://localhost:3000',
  credentials: true
})
```

#### Issue 3: Token Expired
**Symptom:** "Token expired" error

**Solution:**
- Log out and log in again
- Implement refresh token logic

### 4. Manual Test

**Test Cookie Setting:**
```bash
# Login and check response headers
curl -X POST http://localhost:5001/api/v1/auth/login-ngo \
  -H "Content-Type: application/json" \
  -d '{"email":"gps@gmail.com","password":"your_password"}' \
  -v
```

Look for `Set-Cookie:` in response headers.

**Test Cookie Sending:**
```bash
# Use the cookie from above
curl -X POST http://localhost:5001/api/v1/events/create \
  -H "Cookie: token=YOUR_TOKEN_HERE" \
  -F "name=Test Event" \
  -F "description=Test" \
  -F "date=2025-12-01" \
  -F "location=Addis Ababa" \
  -F "creatorEmail=test@test.com" \
  -F "creatorName=Test NGO"
```

### 5. Quick Fix

If cookies still don't work, temporarily add fallback to Authorization header:

**Frontend (CreateEvent.jsx):**
```javascript
const response = await fetch(url, {
  method: "POST",
  body: eventData,
  credentials: 'include',
  headers: {
    // Fallback for debugging
    'Authorization': `Bearer ${user?.token || ''}`
  }
});
```

But this defeats the purpose of HttpOnly cookies (less secure).

## Recommended Solution

1. **Clear all cookies** in browser
2. **Log out** completely
3. **Log in again** as NGO
4. **Check cookies** are set in Application tab
5. **Try creating event** again

If still failing, check backend logs for the actual error.

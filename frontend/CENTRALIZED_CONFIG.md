# Centralized API Configuration

## ✅ Refactoring Complete

All hardcoded API URLs have been replaced with a centralized configuration file.

## What Changed

### Before (Hardcoded URLs)
```javascript
// ❌ Hardcoded in every file
fetch(`${process.env.REACT_APP_BACKEND_BASEURL || "http://localhost:5000"}/api/v1/auth/login`)
```

### After (Centralized Config)
```javascript
// ✅ Import from config
import { API_URL } from "../../config/api.config";

fetch(`${API_URL}/auth/login`)
```

## Configuration File

**Location:** `frontend/src/config/api.config.js`

```javascript
export const API_BASE_URL = process.env.REACT_APP_BACKEND_BASEURL || 'http://localhost:5000';
export const API_VERSION = 'v1';
export const API_URL = `${API_BASE_URL}/api/${API_VERSION}`;
```

## Benefits

### 1. Single Source of Truth
Change the API URL in ONE place instead of 50+ files.

### 2. Easy Environment Switching
```bash
# Development
REACT_APP_BACKEND_BASEURL=http://localhost:5000

# Production
REACT_APP_BACKEND_BASEURL=https://api.yourapp.com
```

### 3. Version Management
Want to switch to v2? Just update the config:
```javascript
export const API_VERSION = 'v2';
```

### 4. Cleaner Code
```javascript
// Before: 80+ characters
fetch(`${process.env.REACT_APP_BACKEND_BASEURL || "http://localhost:5000"}/api/v1/events`)

// After: Clean and readable
fetch(`${API_URL}/events`)
```

## Usage Examples

### API Calls
```javascript
import { API_URL } from "../../config/api.config";

// Auth
fetch(`${API_URL}/auth/login`)
fetch(`${API_URL}/auth/register/volunteer`)

// Events
fetch(`${API_URL}/events/approved`)
fetch(`${API_URL}/events/create`)

// Admin
fetch(`${API_URL}/admin/login`)
fetch(`${API_URL}/users`)
```

### Image URLs
```javascript
import { API_BASE_URL } from "../../config/api.config";

// For static files (images, uploads)
<img src={`${API_BASE_URL}${event.image}`} />
```

## Files Updated (22 total)

### Config
- ✅ `src/config/api.config.js` (NEW)
- ✅ `src/services/api.js`

### User Pages (6)
- ✅ `pages/users/VolunteerDashboard.jsx`
- ✅ `pages/users/RegisterVolunteer.jsx`
- ✅ `pages/users/Profile.jsx`
- ✅ `pages/users/EventDetailsPage.jsx`
- ✅ `pages/users/EventCard.jsx`

### NGO Pages (5)
- ✅ `pages/ngo/CreateEvent.jsx`
- ✅ `pages/ngo/LoginPage.jsx`
- ✅ `pages/ngo/ManageEvents.jsx`
- ✅ `pages/ngo/RegisterNGO.jsx`
- ✅ `pages/ngo/TrackEvents.jsx`

### Admin Pages (7)
- ✅ `pages/admin/AdminLogin.jsx`
- ✅ `pages/admin/AdminRegister.jsx`
- ✅ `pages/admin/ApproveEvents.jsx`
- ✅ `pages/admin/ApprovedEvents.jsx`
- ✅ `pages/admin/ManageNGO.jsx`
- ✅ `pages/admin/ManageVolunteer.jsx`
- ✅ `pages/admin/RejectedEvents.jsx`

### Components (2)
- ✅ `components/CreateEvent.jsx`
- ✅ `components/Notifications.jsx`

## Environment Variables

### Development (.env.local)
```bash
REACT_APP_BACKEND_BASEURL=http://localhost:5000
```

### Production (.env.production)
```bash
REACT_APP_BACKEND_BASEURL=https://eth-volunteer-backend.vercel.app
```

### Staging (.env.staging)
```bash
REACT_APP_BACKEND_BASEURL=https://staging-api.yourapp.com
```

## Migration Path

If you need to change the API version in the future:

### Step 1: Update Config
```javascript
// frontend/src/config/api.config.js
export const API_VERSION = 'v2'; // Changed from 'v1'
```

### Step 2: Done!
All 50+ API calls automatically use v2. No need to update individual files.

## Best Practices

### ✅ DO
```javascript
import { API_URL } from "../../config/api.config";
fetch(`${API_URL}/events`)
```

### ❌ DON'T
```javascript
// Don't hardcode URLs anymore
fetch("http://localhost:5000/api/v1/events")
fetch(`${process.env.REACT_APP_BACKEND_BASEURL}/api/v1/events`)
```

## Testing

After deployment, verify:
1. All API calls work in development
2. All API calls work in production
3. Image URLs load correctly
4. No console errors about failed requests

## Troubleshooting

### Issue: API calls failing
**Check:** Is `REACT_APP_BACKEND_BASEURL` set in your `.env` file?

### Issue: Images not loading
**Check:** Are you using `API_BASE_URL` (not `API_URL`) for static files?

### Issue: Wrong API version
**Check:** `api.config.js` has the correct `API_VERSION`

---

**Refactoring Date:** November 27, 2025
**Commit:** b8b67a5

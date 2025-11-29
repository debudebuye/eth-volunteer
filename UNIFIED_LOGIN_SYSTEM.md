# Unified Login System

## Overview

The login system has been updated to use a **single unified login page** for all user types (Volunteers, NGOs, and Admins). The system automatically detects the user type and navigates to the appropriate dashboard based on their role.

## How It Works

### 1. **Automatic User Type Detection**

When a user enters their credentials and clicks login, the system:

1. **Tries Volunteer Login** first
2. If that fails, **tries NGO Login**
3. If that fails, **tries Admin Login**
4. Returns the first successful match

This means users don't need to select their account type - the system figures it out automatically!

### 2. **Role-Based Navigation**

After successful login, users are automatically redirected based on their role:

| Role | Dashboard Route | User Type |
|------|----------------|-----------|
| `volunteer` | `/volunteerdashboard` | Volunteers |
| `user` | `/volunteerdashboard` | Volunteers (legacy) |
| `ngo` | `/ngo-dashboard` | NGO Organizations |
| `admin` | `/admin-dashboard` | Administrators |

### 3. **Account Status Check**

Before navigation, the system checks if the account is blocked:
- If `user.isBlocked === true` or `user.status === 'blocked'`
- Shows error toast
- Redirects to `/user/UserBlocked` page

## Features

### ✅ **Single Login Page**
- One login form for all user types
- No need to select account type
- Cleaner, simpler user experience

### ✅ **Smart Detection**
- Automatically tries all user types
- Returns first successful match
- Shows appropriate error if all fail

### ✅ **Personalized Welcome**
- Shows user's name for Volunteers
- Shows organization name for NGOs
- Shows admin name for Admins

### ✅ **Modern UI**
- Toast notifications instead of alerts
- Loading spinner during authentication
- Show/hide password toggle
- Responsive design

### ✅ **Quick Registration Links**
- Direct links to Volunteer registration
- Direct links to NGO registration
- Color-coded buttons with icons

## User Experience Flow

### **Login Flow:**

```
User enters email & password
        ↓
Click "Login" button
        ↓
System tries Volunteer login
        ↓
   Success? → Navigate to dashboard
        ↓ No
System tries NGO login
        ↓
   Success? → Navigate to dashboard
        ↓ No
System tries Admin login
        ↓
   Success? → Navigate to dashboard
        ↓ No
Show error: "Invalid email or password"
```

### **Navigation Flow:**

```
Login Successful
        ↓
Check if blocked
        ↓
   Blocked? → Show error → Redirect to blocked page
        ↓ No
Check user role
        ↓
Volunteer → /volunteerdashboard
NGO → /ngo-dashboard
Admin → /admin-dashboard
Unknown → Show error
```

## Code Structure

### **Main Components:**

1. **Login Component** (`frontend/src/pages/users/Login.jsx`)
   - Unified login form
   - Automatic user type detection
   - Role-based navigation

2. **useAuth Hook** (`frontend/src/hooks/useAuth.js`)
   - Handles authentication logic
   - Supports multiple user types
   - Returns standardized response

3. **API Service** (`frontend/src/services/api.js`)
   - Separate endpoints for each user type
   - Axios interceptors for auth
   - Error handling

### **Key Functions:**

```javascript
// Unified login handler
const handleLogin = async (e) => {
  // Try volunteer → NGO → Admin
  let result = await login(credentials, 'volunteer');
  if (!result.success) result = await login(credentials, 'ngo');
  if (!result.success) result = await login(credentials, 'admin');
  
  if (result.success) {
    navigateByRole(result.user);
  }
};

// Role-based navigation
const navigateByRole = (user) => {
  const routes = {
    'volunteer': '/volunteerdashboard',
    'ngo': '/ngo-dashboard',
    'admin': '/admin-dashboard',
  };
  navigate(routes[user.role]);
};
```

## API Endpoints

The system uses these backend endpoints:

| User Type | Login Endpoint | Register Endpoint |
|-----------|---------------|-------------------|
| Volunteer | `POST /api/v1/auth/login` | `POST /api/v1/auth/register/volunteer` |
| NGO | `POST /api/v1/auth/login-ngo` | `POST /api/v1/auth/register/ngo` |
| Admin | `POST /api/v1/admin/login` | `POST /api/v1/admin/register` |

## Benefits

### **For Users:**
- ✅ Simpler login process
- ✅ No need to remember account type
- ✅ Faster login experience
- ✅ Clear error messages
- ✅ Modern, professional UI

### **For Developers:**
- ✅ Single login component to maintain
- ✅ Consistent authentication flow
- ✅ Easy to add new user types
- ✅ Better error handling
- ✅ Cleaner codebase

## Migration Notes

### **Old System:**
- Separate login pages: `/login`, `/login-ngo`, `/admin-login`
- Users had to know their account type
- Multiple components to maintain

### **New System:**
- Single login page: `/login`
- Automatic user type detection
- One component for all users

### **Backward Compatibility:**
The old login routes can still redirect to the new unified login:
```javascript
// In your router
<Route path="/login-ngo" element={<Navigate to="/login" />} />
<Route path="/admin-login" element={<Navigate to="/login" />} />
```

## Security Considerations

### ✅ **Implemented:**
- Password hashing on backend
- JWT token authentication
- Rate limiting on login attempts
- Account blocking functionality
- Secure password input fields

### ⚠️ **Recommendations:**
- Add CAPTCHA after failed attempts
- Implement 2FA for admin accounts
- Add login attempt logging
- Email notifications for new logins
- Session timeout handling

## Testing

### **Test Cases:**

1. **Volunteer Login**
   - Email: `volunteer@example.com`
   - Should navigate to `/volunteerdashboard`

2. **NGO Login**
   - Email: `ngo@example.com`
   - Should navigate to `/ngo-dashboard`

3. **Admin Login**
   - Email: `admin@example.com`
   - Should navigate to `/admin-dashboard`

4. **Blocked Account**
   - Any blocked user
   - Should show error and redirect to blocked page

5. **Invalid Credentials**
   - Wrong email/password
   - Should show error toast

## Future Enhancements

Potential improvements:
- [ ] Remember me functionality
- [ ] Social login (Google, Facebook)
- [ ] Biometric authentication
- [ ] Login history tracking
- [ ] Multi-device session management
- [ ] Password reset flow
- [ ] Email verification
- [ ] Two-factor authentication

## Troubleshooting

### **Issue: Login fails for all user types**
- Check backend is running
- Verify API endpoints are correct
- Check network tab for errors
- Verify credentials are correct

### **Issue: Wrong dashboard after login**
- Check user role in database
- Verify role mapping in `navigateByRole`
- Check route configuration

### **Issue: Blocked user can still login**
- Verify `isBlocked` field in database
- Check blocking logic in `navigateByRole`
- Ensure backend returns status

---

**Last Updated:** November 28, 2025
**Status:** ✅ Complete and Production Ready

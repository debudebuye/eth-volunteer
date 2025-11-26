# Frontend Refactoring Guide

## Overview
This guide explains the refactored frontend architecture following industry best practices.

---

## 🎯 What Changed

### 1. **State Management with Zustand**
- ✅ Replaced localStorage direct access with Zustand store
- ✅ Centralized auth state management
- ✅ Persistent storage with automatic sync
- ✅ Type-safe state access

**Location:** `src/store/authStore.js`

**Usage:**
```javascript
import useAuthStore from '../store/authStore';

function MyComponent() {
  const { user, token, isAuthenticated, logout } = useAuthStore();
  
  // Access user data
  console.log(user.name);
  
  // Logout
  const handleLogout = () => {
    logout();
  };
}
```

---

### 2. **Centralized API Service**
- ✅ All API calls in one place (`services/api.js`)
- ✅ Axios interceptors for automatic token injection
- ✅ Global error handling
- ✅ Automatic 401 redirect to login
- ✅ Organized by domain (auth, events, users, ngo, admin)

**Location:** `src/services/api.js`

**Usage:**
```javascript
import { eventsAPI, authAPI, userAPI } from '../services/api';

// Login
const response = await authAPI.login({ email, password });

// Get events
const events = await eventsAPI.getAll();

// Like event
await eventsAPI.like(eventId, userId);
```

---

### 3. **Custom Hooks**

#### **useAuth Hook**
**Location:** `src/hooks/useAuth.js`

Handles all authentication logic:
```javascript
import useAuth from '../hooks/useAuth';

function LoginComponent() {
  const { login, logout, user, isAuthenticated } = useAuth();
  
  const handleLogin = async () => {
    const result = await login({ email, password }, 'volunteer');
    if (result.success) {
      navigate('/dashboard');
    } else {
      alert(result.error);
    }
  };
}
```

#### **useFetch Hook**
**Location:** `src/hooks/useFetch.js`

Generic data fetching with loading/error states:
```javascript
import useFetch from '../hooks/useFetch';
import { eventsAPI } from '../services/api';

function EventsList() {
  const { data, loading, error, refetch } = useFetch(
    eventsAPI.getAll,
    null,
    []
  );
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{data.map(event => ...)}</div>;
}
```

#### **useEvents Hook**
**Location:** `src/hooks/useEvents.js`

Event-specific operations:
```javascript
import useEvents from '../hooks/useEvents';

function EventCard({ eventId }) {
  const { likeEvent, joinEvent, addComment, loading, error } = useEvents();
  
  const handleLike = async () => {
    const result = await likeEvent(eventId);
    if (result.success) {
      // Update UI
    }
  };
}
```

---

### 4. **Error Boundary**
**Location:** `src/components/ErrorBoundary.jsx`

Catches React errors and displays user-friendly message:
```javascript
// Already wrapped in App.js
<ErrorBoundary>
  <Router>
    <Routes>...</Routes>
  </Router>
</ErrorBoundary>
```

---

### 5. **Protected Routes**
Updated to use Zustand instead of localStorage:

**Locations:**
- `src/components/Protected/PrivateRoute.jsx`
- `src/components/Protected/ngoRoute.jsx`
- `src/components/Protected/adminRoute.jsx`

**Usage:**
```javascript
<Route 
  path="/dashboard" 
  element={
    <PrivateRoute role="volunteer">
      <Dashboard />
    </PrivateRoute>
  } 
/>
```

---

## 🔄 Migration Guide

### Migrating Components from Old to New Pattern

#### **Before (Old Pattern):**
```javascript
const MyComponent = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  
  const fetchData = async () => {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_BASEURL}/api/events`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
  };
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };
};
```

#### **After (New Pattern):**
```javascript
import useAuth from '../hooks/useAuth';
import { eventsAPI } from '../services/api';

const MyComponent = () => {
  const { user, logout } = useAuth();
  const { data, loading, error } = useFetch(eventsAPI.getAll, null, []);
  
  const handleLogout = () => {
    logout(); // Automatically clears state and redirects
  };
};
```

---

## 📋 Checklist for Updating Components

For each component that needs updating:

- [ ] Replace `localStorage.getItem('user')` with `useAuthStore()` or `useAuth()`
- [ ] Replace `localStorage.getItem('token')` with Zustand store
- [ ] Replace fetch calls with API service functions
- [ ] Remove manual Authorization headers (handled by interceptor)
- [ ] Use custom hooks for common operations
- [ ] Add loading and error states
- [ ] Remove try-catch blocks (handled by hooks)

---

## 🔐 Security Improvements

1. **No Direct localStorage Access**
   - All auth data managed through Zustand
   - Centralized logout clears all state

2. **Automatic Token Injection**
   - Axios interceptor adds token to all requests
   - No manual header management

3. **Global Error Handling**
   - 401 errors automatically logout user
   - Consistent error messages

4. **Error Boundaries**
   - Catches runtime errors
   - Prevents white screen of death

---

## 🚀 Next Steps

### Recommended Improvements:

1. **Add TypeScript**
   ```bash
   npm install --save-dev typescript @types/react @types/react-dom
   ```

2. **Add React Query** (for better data fetching)
   ```bash
   npm install @tanstack/react-query
   ```

3. **Add Toast Notifications** (instead of alerts)
   ```bash
   npm install react-hot-toast
   ```

4. **Add Form Validation**
   ```bash
   npm install react-hook-form zod
   ```

5. **Migrate to Vite** (from Create React App)
   - Better performance
   - Faster builds
   - Active maintenance

---

## 📚 Examples

### Complete Login Component Example
```javascript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login({ email, password }, 'volunteer');

    if (result.success) {
      navigate("/dashboard");
    } else {
      alert(result.error);
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleLogin}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};
```

### Complete Dashboard Component Example
```javascript
import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import useEvents from "../../hooks/useEvents";
import { eventsAPI } from "../../services/api";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { likeEvent, joinEvent } = useEvents();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventsAPI.getByLocation(user.location);
      setEvents(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (eventId) => {
    const result = await likeEvent(eventId);
    if (result.success) {
      fetchEvents(); // Refresh
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <button onClick={logout}>Logout</button>
      {events.map(event => (
        <div key={event._id}>
          <h3>{event.name}</h3>
          <button onClick={() => handleLike(event._id)}>Like</button>
        </div>
      ))}
    </div>
  );
};
```

---

## 🐛 Troubleshooting

### Issue: "Cannot read property 'user' of null"
**Solution:** Check if user is authenticated before accessing:
```javascript
const { user, isAuthenticated } = useAuth();

if (!isAuthenticated || !user) {
  return <Navigate to="/login" />;
}
```

### Issue: "Token not being sent with requests"
**Solution:** Ensure you're using the API service, not fetch:
```javascript
// ❌ Wrong
fetch('/api/events', { headers: { Authorization: token }})

// ✅ Correct
eventsAPI.getAll() // Token added automatically
```

### Issue: "State not persisting after refresh"
**Solution:** Zustand persist middleware is configured. Check browser localStorage for 'auth-storage' key.

---

## 📞 Support

For questions or issues with the refactored code, refer to:
- Zustand docs: https://zustand-demo.pmnd.rs/
- Axios docs: https://axios-http.com/
- React Router docs: https://reactrouter.com/

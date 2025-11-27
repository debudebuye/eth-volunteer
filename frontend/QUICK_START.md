# Quick Start Guide

Get up to speed with the refactored frontend in 5 minutes.

---

## 🚀 What You Need to Know

### 1. Authentication (useAuth)

```javascript
import useAuth from '../hooks/useAuth';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  // Login
  const handleLogin = async () => {
    const result = await login({ email, password }, 'volunteer');
    if (result.success) {
      navigate('/dashboard');
    }
  };
  
  // Logout
  const handleLogout = () => {
    logout(); // That's it!
  };
  
  // Access user data
  console.log(user.name, user.email, user.role);
}
```

---

### 2. API Calls

```javascript
import { eventsAPI, userAPI, ngoAPI } from '../services/api';

// Get all events
const response = await eventsAPI.getAll();
const events = response.data;

// Like an event
await eventsAPI.like(eventId, userId);

// Get user profile
const profile = await userAPI.getProfile(userId);
```

**No need to add Authorization headers - it's automatic!**

---

### 3. Event Operations (useEvents)

```javascript
import useEvents from '../hooks/useEvents';

function EventCard({ eventId }) {
  const { likeEvent, joinEvent, addComment } = useEvents();
  
  const handleLike = async () => {
    const result = await likeEvent(eventId);
    if (result.success) {
      // Update UI
    }
  };
}
```

---

### 4. Data Fetching (useFetch)

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
  
  return (
    <div>
      {data.map(event => <EventCard key={event._id} event={event} />)}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

---

## 📋 Common Patterns

### Pattern 1: Login Page
```javascript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
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
    <form onSubmit={handleSubmit}>
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
      <button disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};
```

---

### Pattern 2: Dashboard with Events
```javascript
import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import { eventsAPI } from "../../services/api";

const Dashboard = () => {
  const { user, logout } = useAuth();
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

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <button onClick={logout}>Logout</button>
      {events.map(event => (
        <EventCard key={event._id} event={event} />
      ))}
    </div>
  );
};
```

---

### Pattern 3: Event Actions
```javascript
import useEvents from "../../hooks/useEvents";

const EventCard = ({ event }) => {
  const { likeEvent, joinEvent } = useEvents();
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    const result = await likeEvent(event._id);
    if (result.success) {
      setLiked(!liked);
    }
  };

  const handleJoin = async () => {
    const result = await joinEvent(event._id);
    if (result.success) {
      alert("Joined successfully!");
    }
  };

  return (
    <div>
      <h3>{event.name}</h3>
      <button onClick={handleLike}>
        {liked ? "Unlike" : "Like"}
      </button>
      <button onClick={handleJoin}>Join</button>
    </div>
  );
};
```

---

## 🔑 Key Rules

### ✅ DO
- Use `useAuth()` for authentication
- Use API service functions (eventsAPI, userAPI, etc.)
- Use custom hooks (useEvents, useFetch)
- Add loading states
- Handle errors gracefully

### ❌ DON'T
- Don't use `localStorage.getItem()` or `localStorage.setItem()`
- Don't use `fetch()` - use API service
- Don't manually add Authorization headers
- Don't forget to handle loading/error states

---

## 🎯 Migration Checklist

When updating a component:

1. [ ] Replace `localStorage` with `useAuth()` or `useAuthStore()`
2. [ ] Replace `fetch()` with API service functions
3. [ ] Remove manual Authorization headers
4. [ ] Add loading states
5. [ ] Add error handling
6. [ ] Test login/logout
7. [ ] Test API calls
8. [ ] Test error scenarios

---

## 📚 Full Documentation

- **REFACTORING_GUIDE.md** - Complete guide with examples
- **API_REFERENCE.md** - All API functions documented
- **MIGRATION_CHECKLIST.md** - Component-by-component checklist
- **REFACTORING_SUMMARY.md** - What changed and why

---

## 🆘 Quick Troubleshooting

### "User is null"
```javascript
const { user, isAuthenticated } = useAuth();

if (!isAuthenticated || !user) {
  return <Navigate to="/login" />;
}
```

### "Token not sent"
Make sure you're using the API service, not fetch:
```javascript
// ❌ Wrong
fetch('/api/events')

// ✅ Correct
eventsAPI.getAll()
```

### "State not persisting"
Zustand automatically persists. Check browser localStorage for 'auth-storage' key.

---

## 🎉 You're Ready!

Start migrating components using the patterns above. Refer to the full documentation when needed.

**Example to follow:** `src/pages/users/Login.jsx`

Good luck! 🚀

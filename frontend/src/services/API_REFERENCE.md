# API Service Reference

Quick reference for all available API functions.

## Import
```javascript
import { authAPI, eventsAPI, userAPI, ngoAPI, adminAPI } from './services/api';
```

---

## 🔐 Auth API

### `authAPI.register(data)`
Register a new volunteer
```javascript
const result = await authAPI.register({
  name: "John Doe",
  email: "john@example.com",
  password: "password123",
  location: "New York"
});
```

### `authAPI.login(data)`
Login as volunteer
```javascript
const result = await authAPI.login({
  email: "john@example.com",
  password: "password123"
});
```

### `authAPI.registerNGO(data)`
Register a new NGO

### `authAPI.loginNGO(data)`
Login as NGO

### `authAPI.registerAdmin(data)`
Register a new admin

### `authAPI.loginAdmin(data)`
Login as admin

---

## 📅 Events API

### `eventsAPI.getAll()`
Get all events
```javascript
const response = await eventsAPI.getAll();
const events = response.data;
```

### `eventsAPI.getById(id)`
Get single event by ID
```javascript
const response = await eventsAPI.getById('event123');
const event = response.data;
```

### `eventsAPI.getByLocation(location)`
Get events by location
```javascript
const response = await eventsAPI.getByLocation('New York');
```

### `eventsAPI.create(data)`
Create new event
```javascript
const response = await eventsAPI.create({
  name: "Beach Cleanup",
  description: "Clean the beach",
  location: "Miami Beach",
  date: "2024-12-25"
});
```

### `eventsAPI.update(id, data)`
Update event
```javascript
await eventsAPI.update('event123', { name: "Updated Name" });
```

### `eventsAPI.delete(id)`
Delete event
```javascript
await eventsAPI.delete('event123');
```

### `eventsAPI.like(eventId, userId)`
Like an event
```javascript
await eventsAPI.like('event123', 'user456');
```

### `eventsAPI.unlike(eventId, userId)`
Unlike an event
```javascript
await eventsAPI.unlike('event123', 'user456');
```

### `eventsAPI.join(userId, eventId)`
Join an event
```javascript
await eventsAPI.join('user456', 'event123');
```

### `eventsAPI.unjoin(userId, eventId)`
Unjoin an event
```javascript
await eventsAPI.unjoin('user456', 'event123');
```

### `eventsAPI.comment(eventId, userId, text)`
Add comment to event
```javascript
await eventsAPI.comment('event123', 'user456', 'Great event!');
```

### `eventsAPI.approve(id)`
Approve event (admin only)
```javascript
await eventsAPI.approve('event123');
```

### `eventsAPI.reject(id)`
Reject event (admin only)
```javascript
await eventsAPI.reject('event123');
```

### `eventsAPI.getApproved()`
Get all approved events

### `eventsAPI.getRejected()`
Get all rejected events

### `eventsAPI.getPending()`
Get all pending events

---

## 👤 User API

### `userAPI.getProfile(userId)`
Get user profile
```javascript
const response = await userAPI.getProfile('user123');
const profile = response.data;
```

### `userAPI.updateProfile(userId, data)`
Update user profile
```javascript
await userAPI.updateProfile('user123', {
  name: "New Name",
  location: "Boston"
});
```

### `userAPI.getJoinedEvents(userId)`
Get events user has joined
```javascript
const response = await userAPI.getJoinedEvents('user123');
const events = response.data;
```

### `userAPI.blockUser(userId)`
Block a user (admin only)
```javascript
await userAPI.blockUser('user123');
```

### `userAPI.unblockUser(userId)`
Unblock a user (admin only)
```javascript
await userAPI.unblockUser('user123');
```

### `userAPI.getAllVolunteers()`
Get all volunteers (admin only)
```javascript
const response = await userAPI.getAllVolunteers();
```

---

## 🏢 NGO API

### `ngoAPI.getAll()`
Get all NGOs
```javascript
const response = await ngoAPI.getAll();
```

### `ngoAPI.getById(id)`
Get NGO by ID
```javascript
const response = await ngoAPI.getById('ngo123');
```

### `ngoAPI.update(id, data)`
Update NGO
```javascript
await ngoAPI.update('ngo123', { name: "New NGO Name" });
```

### `ngoAPI.block(id)`
Block NGO (admin only)
```javascript
await ngoAPI.block('ngo123');
```

### `ngoAPI.unblock(id)`
Unblock NGO (admin only)
```javascript
await ngoAPI.unblock('ngo123');
```

### `ngoAPI.getEvents(ngoId)`
Get events created by NGO
```javascript
const response = await ngoAPI.getEvents('ngo123');
```

---

## 👨‍💼 Admin API

### `adminAPI.getDashboardStats()`
Get dashboard statistics
```javascript
const response = await adminAPI.getDashboardStats();
const stats = response.data;
```

### `adminAPI.getAllUsers()`
Get all users
```javascript
const response = await adminAPI.getAllUsers();
```

### `adminAPI.getAllNGOs()`
Get all NGOs
```javascript
const response = await adminAPI.getAllNGOs();
```

### `adminAPI.getAllEvents()`
Get all events
```javascript
const response = await adminAPI.getAllEvents();
```

---

## 🔧 Error Handling

All API calls return promises. Handle errors with try-catch:

```javascript
try {
  const response = await eventsAPI.getAll();
  console.log(response.data);
} catch (error) {
  if (error.response) {
    // Server responded with error
    console.error(error.response.data.message);
  } else if (error.request) {
    // No response received
    console.error('Network error');
  } else {
    // Other errors
    console.error(error.message);
  }
}
```

Or use the custom hooks which handle errors automatically:

```javascript
import useEvents from '../hooks/useEvents';

const { likeEvent, error } = useEvents();

const handleLike = async (eventId) => {
  const result = await likeEvent(eventId);
  if (!result.success) {
    alert(result.error); // Error already captured
  }
};
```

---

## 🔑 Authentication

All API calls automatically include the authentication token from Zustand store.

No need to manually add Authorization headers!

```javascript
// ❌ Don't do this
fetch('/api/events', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// ✅ Do this instead
eventsAPI.getAll(); // Token added automatically
```

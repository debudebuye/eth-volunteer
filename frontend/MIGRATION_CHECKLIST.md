# Component Migration Checklist

This checklist helps you migrate existing components to use the new architecture.

## ✅ Completed Components

- [x] `src/App.js` - Added ErrorBoundary wrapper
- [x] `src/components/Protected/PrivateRoute.jsx` - Using Zustand
- [x] `src/components/Protected/ngoRoute.jsx` - Using Zustand
- [x] `src/components/Protected/adminRoute.jsx` - Using Zustand
- [x] `src/pages/users/Login.jsx` - Using useAuth hook

---

## 🔄 Components to Migrate

### High Priority (User-facing)

- [ ] `src/pages/users/VolunteerDashboard.jsx`
  - Replace localStorage with useAuthStore
  - Replace fetch with eventsAPI
  - Use useEvents hook for like/join/comment
  - Add proper error handling

- [ ] `src/pages/users/RegisterVolunteer.jsx`
  - Use useAuth hook for registration
  - Remove manual localStorage
  - Add loading states

- [ ] `src/pages/users/Profile.jsx`
  - Use useAuthStore for user data
  - Use userAPI for updates
  - Add loading/error states

- [ ] `src/pages/users/EventDetailsPage.jsx`
  - Use eventsAPI
  - Use useEvents hook
  - Add error boundary

### NGO Components

- [ ] `src/pages/ngo/LoginPage.jsx`
  - Use useAuth hook with 'ngo' type
  - Remove localStorage
  - Add loading states

- [ ] `src/pages/ngo/RegisterNGO.jsx`
  - Use useAuth hook
  - Remove manual API calls

- [ ] `src/pages/ngo/NGODashboard.jsx`
  - Use useAuthStore
  - Use ngoAPI
  - Add error handling

- [ ] `src/pages/ngo/CreateEvent.jsx`
  - Use eventsAPI.create
  - Use useEvents hook
  - Add validation

- [ ] `src/pages/ngo/EditEvent.jsx`
  - Use eventsAPI.update
  - Add loading states

- [ ] `src/pages/ngo/ManageEvents.jsx`
  - Use ngoAPI.getEvents
  - Use eventsAPI for actions

- [ ] `src/pages/ngo/TrackEvents.jsx`
  - Use eventsAPI
  - Add real-time updates

### Admin Components

- [ ] `src/pages/admin/AdminLogin.jsx`
  - Use useAuth hook with 'admin' type
  - Remove localStorage

- [ ] `src/pages/admin/AdminRegister.jsx`
  - Use useAuth hook
  - Add validation

- [ ] `src/pages/admin/AdminDashboard.jsx`
  - Use adminAPI.getDashboardStats
  - Add loading states

- [ ] `src/pages/admin/ApproveEvents.jsx`
  - Use eventsAPI.getPending
  - Use eventsAPI.approve/reject

- [ ] `src/pages/admin/ApprovedEvents.jsx`
  - Use eventsAPI.getApproved

- [ ] `src/pages/admin/RejectedEvents.jsx`
  - Use eventsAPI.getRejected

- [ ] `src/pages/admin/ManageNGO.jsx`
  - Use ngoAPI.getAll
  - Use ngoAPI.block/unblock

- [ ] `src/pages/admin/ManageVolunteer.jsx`
  - Use userAPI.getAllVolunteers
  - Use userAPI.block/unblock

### Shared Components

- [ ] `src/pages/Navbar.jsx`
  - Use useAuth for logout
  - Use useAuthStore for user data

- [ ] `src/pages/users/Navbar.jsx`
  - Same as above

- [ ] `src/components/EventCard.js`
  - Use useEvents hook
  - Add optimistic updates

- [ ] `src/components/CreateEvent.jsx`
  - Use eventsAPI.create
  - Add validation

---

## 📝 Migration Steps for Each Component

### Step 1: Import New Dependencies
```javascript
// Add these imports
import useAuth from '../../hooks/useAuth';
import useAuthStore from '../../store/authStore';
import { eventsAPI, userAPI, ngoAPI } from '../../services/api';
import useEvents from '../../hooks/useEvents';
```

### Step 2: Replace localStorage Access
```javascript
// ❌ Remove this
const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

// ✅ Replace with this
const { user, token } = useAuthStore();
// or
const { user } = useAuth();
```

### Step 3: Replace fetch Calls
```javascript
// ❌ Remove this
const response = await fetch(`${process.env.REACT_APP_BACKEND_BASEURL}/api/events`, {
  headers: { Authorization: `Bearer ${token}` }
});
const data = await response.json();

// ✅ Replace with this
const response = await eventsAPI.getAll();
const data = response.data;
```

### Step 4: Use Custom Hooks
```javascript
// ❌ Remove manual implementations
const handleLike = async (eventId) => {
  const response = await fetch(...);
  // manual error handling
};

// ✅ Replace with hook
const { likeEvent } = useEvents();
const handleLike = async (eventId) => {
  const result = await likeEvent(eventId);
  if (result.success) {
    // success
  }
};
```

### Step 5: Add Loading States
```javascript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    // API call
  } finally {
    setLoading(false);
  }
};

// In JSX
<button disabled={loading}>
  {loading ? 'Loading...' : 'Submit'}
</button>
```

### Step 6: Replace Logout
```javascript
// ❌ Remove this
const handleLogout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  navigate('/login');
};

// ✅ Replace with this
const { logout } = useAuth();
const handleLogout = () => {
  logout(); // Handles everything
};
```

---

## 🧪 Testing After Migration

For each migrated component, test:

1. **Authentication**
   - [ ] Login works
   - [ ] Logout works
   - [ ] Protected routes redirect correctly
   - [ ] Token persists after refresh

2. **Data Fetching**
   - [ ] Data loads correctly
   - [ ] Loading states show
   - [ ] Errors display properly
   - [ ] Refetch works

3. **User Actions**
   - [ ] Like/unlike works
   - [ ] Join/unjoin works
   - [ ] Comments work
   - [ ] Create/update/delete works

4. **Error Handling**
   - [ ] Network errors handled
   - [ ] 401 redirects to login
   - [ ] User-friendly error messages
   - [ ] Error boundary catches crashes

---

## 🎯 Quick Wins (Start Here)

Easiest components to migrate first:

1. **Login pages** (already done for volunteer)
   - Simple logic
   - Clear before/after

2. **Navbar components**
   - Just need logout and user display
   - Quick to update

3. **Protected routes** (already done)
   - Simple auth checks

4. **Event cards**
   - Reusable component
   - High impact

---

## 🚨 Common Pitfalls

### 1. Forgetting to Remove localStorage
```javascript
// ❌ Don't mix old and new
const { user } = useAuth();
localStorage.setItem('user', JSON.stringify(user)); // Remove this!
```

### 2. Not Handling Async Properly
```javascript
// ❌ Wrong
const result = likeEvent(eventId); // Missing await
if (result.success) { ... }

// ✅ Correct
const result = await likeEvent(eventId);
if (result.success) { ... }
```

### 3. Accessing Response Incorrectly
```javascript
// ❌ Wrong
const events = await eventsAPI.getAll();
console.log(events); // This is the axios response

// ✅ Correct
const response = await eventsAPI.getAll();
console.log(response.data); // This is the actual data
```

### 4. Not Using Error States
```javascript
// ❌ Missing error handling
const { data, loading } = useFetch(eventsAPI.getAll);

// ✅ Complete
const { data, loading, error } = useFetch(eventsAPI.getAll);
if (error) return <div>Error: {error}</div>;
```

---

## 📊 Progress Tracking

Total Components: 30
- ✅ Completed: 5
- 🔄 In Progress: 0
- ⏳ Remaining: 25

Update this as you migrate components!

---

## 🎉 Benefits After Migration

Once all components are migrated, you'll have:

- ✅ Centralized state management
- ✅ Automatic token handling
- ✅ Global error handling
- ✅ Consistent API calls
- ✅ Better code organization
- ✅ Easier testing
- ✅ Better developer experience
- ✅ Industry-standard architecture

---

## 💡 Tips

1. **Migrate one component at a time** - Don't try to do everything at once
2. **Test thoroughly** - Make sure each component works before moving on
3. **Keep the old code** - Comment it out instead of deleting (for reference)
4. **Use the examples** - Refer to Login.jsx as a template
5. **Ask for help** - Check the REFACTORING_GUIDE.md for detailed examples

---

## 📞 Need Help?

If you get stuck:
1. Check `REFACTORING_GUIDE.md` for detailed examples
2. Check `API_REFERENCE.md` for API usage
3. Look at the migrated `Login.jsx` component
4. Review the custom hooks in `src/hooks/`

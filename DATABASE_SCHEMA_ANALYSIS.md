# Database Schema Analysis & Optimization Report

## Current Schema Overview

### Collections
1. **Users** - Volunteer users
2. **NGOs** - Organizations creating events
3. **Admins** - System administrators
4. **Events** - Event documents with embedded comments

---

## Current Relationships

### 1. User ↔ Event Relationships

**Current Implementation:**
- **User.joinedEvents** → Array of Event IDs (references)
- **Event.participants** → Array of User IDs (references)
- **Event.likedBy** → Array of User IDs (references)
- **Event.followers** → Array of User IDs (references)

**Status:** ✅ **OPTIMIZED** - Bidirectional relationship
- Both sides maintain references for efficient queries
- Can query "events joined by user" OR "users in event" efficiently

### 2. NGO ↔ Event Relationship

**Current Implementation:**
- **Event.createdBy** → NGO ID (reference)
- **Event.creatorEmail** → Denormalized (duplicated data)
- **Event.creatorName** → Denormalized (duplicated data)

**Status:** ⚠️ **PARTIALLY OPTIMIZED**
- Good: Denormalized creator info avoids joins when displaying events
- Issue: No reverse reference on NGO model (can't efficiently query "all events by NGO")

### 3. Comments & Replies

**Current Implementation:**
- **Event.comments** → Embedded subdocuments
- **Event.comments.replies** → Nested embedded subdocuments
- **Event.comments.userId** → User ID reference
- **Event.comments.likedBy** → Array of User IDs

**Status:** ✅ **OPTIMIZED** for small-medium scale
- Embedded documents = single query to get event with all comments
- Good for: < 100 comments per event
- Potential issue: Document size limit (16MB) if comments grow large

---

## Optimization Assessment

### ✅ What's Working Well

1. **Indexes are well-designed:**
   - Compound indexes for common queries (status + location + date)
   - Single field indexes for filtering and sorting
   - Proper use of unique indexes

2. **Bidirectional User-Event relationship:**
   - Efficient queries in both directions
   - Prevents N+1 query problems

3. **Denormalized creator info:**
   - Avoids joins when displaying event lists
   - Acceptable data duplication for read performance

4. **Embedded comments:**
   - Single query to fetch event with all comments
   - Good for typical use cases

### ⚠️ Potential Issues & Recommendations

#### 1. **Missing NGO → Events Reference**

**Problem:**
```javascript
// Current: Need to query Events collection
const ngoEvents = await Event.find({ createdBy: ngoId });
```

**Recommendation:** Add to NGO model
```javascript
const ngoSchema = new mongoose.Schema({
  // ... existing fields
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  eventCount: { type: Number, default: 0 } // Denormalized count for quick access
});
```

**Benefit:** Faster queries for NGO dashboard

---

#### 2. **Comment Scalability**

**Current Limitation:**
- MongoDB document size limit: 16MB
- If an event gets 1000+ comments, could hit limits

**Recommendation for High-Scale:**
```javascript
// Option A: Separate Comments Collection (if expecting 100+ comments per event)
const CommentSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: String,
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now }
});

CommentSchema.index({ eventId: 1, createdAt: -1 }); // For pagination
```

**When to migrate:**
- If events regularly get 100+ comments
- If you need comment pagination
- If you need advanced comment features (editing history, moderation)

**Current Status:** Keep embedded for now, monitor growth

---

#### 3. **Array Field Performance**

**Current Arrays:**
- `Event.participants` - Could grow to 100s or 1000s
- `Event.likedBy` - Could grow large
- `Event.followers` - Could grow large

**Potential Issues:**
- Large arrays slow down document updates
- Querying "is user in array" becomes slower with large arrays

**Recommendation for High-Scale:**
```javascript
// Option: Separate junction collections for many-to-many relationships
const EventParticipantSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  joinedAt: { type: Date, default: Date.now }
});

EventParticipantSchema.index({ eventId: 1, userId: 1 }, { unique: true });
EventParticipantSchema.index({ userId: 1, joinedAt: -1 });
```

**When to migrate:**
- If events regularly have 500+ participants
- If you need participant analytics (join date, activity tracking)

**Current Status:** Keep arrays for now, they're fine for typical events

---

#### 4. **Missing Timestamps**

**Issue:** Some models lack `createdAt` and `updatedAt`

**Recommendation:**
```javascript
// Add to all schemas
{ timestamps: true }
```

**Already has timestamps:**
- ✅ Admin model
- ✅ Event.comments (has createdAt)

**Missing timestamps:**
- ❌ User model (has createdAt but not updatedAt)
- ❌ NGO model (has createdAt but not updatedAt)
- ❌ Event model (no timestamps at all)

---

## Performance Optimization Checklist

### Immediate Actions (Do Now)
- [ ] Add `updatedAt` to User and NGO models
- [ ] Add `timestamps: true` to Event model
- [ ] Add `events` array to NGO model for reverse lookup
- [ ] Add index on `Event.participants` for faster lookups

### Monitor & Plan (Do When Needed)
- [ ] Monitor comment count per event (migrate to separate collection if > 100)
- [ ] Monitor participant count per event (migrate to junction table if > 500)
- [ ] Add pagination to comments if needed
- [ ] Consider caching for frequently accessed events

### Advanced Optimizations (Future)
- [ ] Implement Redis caching for popular events
- [ ] Add read replicas for heavy read operations
- [ ] Implement event aggregation for analytics
- [ ] Add full-text search indexes for event search

---

## Recommended Schema Updates

### 1. Update Event Model
```javascript
const EventSchema = new mongoose.Schema({
  // ... existing fields
}, { 
  timestamps: true // Add this
});

// Add index for participants lookup
EventSchema.index({ participants: 1 });
```

### 2. Update NGO Model
```javascript
const ngoSchema = new mongoose.Schema({
  // ... existing fields
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  eventCount: { type: Number, default: 0 }
}, { 
  timestamps: true // Change from manual createdAt
});
```

### 3. Update User Model
```javascript
const userSchema = new mongoose.Schema({
  // ... existing fields
}, { 
  timestamps: true // Change from manual createdAt
});
```

---

## Conclusion

### Overall Assessment: **GOOD** ✅

Your current schema is well-designed for a small to medium-scale application:
- ✅ Proper indexes
- ✅ Efficient bidirectional relationships
- ✅ Good use of denormalization
- ✅ Embedded documents for related data

### Scale Readiness: **Medium** ⚠️

Current design will work well up to:
- ~10,000 users
- ~1,000 events
- ~50 comments per event
- ~200 participants per event

### Next Steps:
1. Implement immediate actions (timestamps, NGO events reference)
2. Monitor growth metrics
3. Plan migration to separate collections when limits are approached
4. Consider caching layer for popular content

---

## Query Performance Examples

### Current Efficient Queries ✅
```javascript
// Get user's joined events (single query with index)
User.findById(userId).populate('joinedEvents')

// Get events by location (uses compound index)
Event.find({ status: 'approved', location: 'Addis Ababa' }).sort({ date: 1 })

// Get event with comments (single query, embedded)
Event.findById(eventId).populate('comments.userId')
```

### Queries That Could Be Improved ⚠️
```javascript
// Get all events by NGO (no reverse reference)
Event.find({ createdBy: ngoId }) // Works but could be faster with NGO.events

// Check if user is participant (array scan)
Event.findOne({ _id: eventId, participants: userId }) // Slow with large arrays
```

---

**Generated:** December 1, 2025
**Status:** Current schema is production-ready for MVP and early growth phase

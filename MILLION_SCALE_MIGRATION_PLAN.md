# Million-Scale Migration Plan

## Executive Summary

**Current Capacity:** ~10,000 users  
**Target Scale:** 1,000,000+ users  
**Migration Required:** YES - Major architectural changes needed

---

## Critical Issues at Million-Scale

### 1. **Array Fields Will Break** 🔴 CRITICAL

**Problem:**
```javascript
// Current design
Event.participants: [userId1, userId2, ..., userId50000] // 50K participants!
Event.likedBy: [userId1, userId2, ..., userId100000] // 100K likes!
```

**Why it breaks:**
- MongoDB document size limit: 16MB
- 1M ObjectIds × 12 bytes = 12MB just for one array!
- Updating arrays becomes O(n) operation
- Index size explodes
- Memory consumption per query skyrockets

**Impact:** App will crash or become unusable

---

### 2. **Embedded Comments Will Break** 🔴 CRITICAL

**Problem:**
```javascript
// Popular event with 10,000 comments
Event.comments: [
  { text: "...", replies: [...], likes: 500 },
  // ... 9,999 more comments
]
```

**Why it breaks:**
- Document size limit (16MB)
- Can't paginate comments efficiently
- Every comment query loads ALL comments
- Update conflicts when multiple users comment simultaneously

**Impact:** Popular events become inaccessible

---

### 3. **Query Performance Degradation** 🟡 HIGH PRIORITY

**Current queries that will fail:**
```javascript
// Find if user joined event - scans entire participants array
Event.findOne({ _id: eventId, participants: userId })

// Get user's joined events - needs to populate huge arrays
User.findById(userId).populate('joinedEvents')

// Location-based search with 100K events
Event.find({ location: 'Addis Ababa', status: 'approved' })
```

**Impact:** Response times go from 50ms → 5+ seconds

---

## Required Schema Redesign

### Phase 1: Separate Junction Collections (MUST DO)

#### 1.1 Event Participants → Separate Collection

**Before:**
```javascript
// Event model
participants: [userId1, userId2, ...] // ❌ Breaks at scale
```

**After:**
```javascript
// New EventParticipant collection
const EventParticipantSchema = new mongoose.Schema({
  eventId: { type: ObjectId, ref: 'Event', required: true },
  userId: { type: ObjectId, ref: 'User', required: true },
  joinedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['joined', 'cancelled'], default: 'joined' },
  notificationsEnabled: { type: Boolean, default: true }
}, { timestamps: true });

// Compound indexes for efficient queries
EventParticipantSchema.index({ eventId: 1, userId: 1 }, { unique: true });
EventParticipantSchema.index({ userId: 1, joinedAt: -1 });
EventParticipantSchema.index({ eventId: 1, status: 1 });
```

**Benefits:**
- ✅ No document size limits
- ✅ Efficient pagination
- ✅ Can add metadata (join date, status)
- ✅ Parallel updates (no document locking)

**Queries:**
```javascript
// Check if user joined event - O(1) with index
EventParticipant.findOne({ eventId, userId })

// Get event participants with pagination
EventParticipant.find({ eventId })
  .populate('userId', 'name email')
  .skip(page * limit)
  .limit(limit)

// Get user's joined events
EventParticipant.find({ userId })
  .populate('eventId')
  .sort({ joinedAt: -1 })
```

---

#### 1.2 Event Likes → Separate Collection

**Before:**
```javascript
// Event model
likes: Number,
likedBy: [userId1, userId2, ...] // ❌ Breaks at scale
```

**After:**
```javascript
// New EventLike collection
const EventLikeSchema = new mongoose.Schema({
  eventId: { type: ObjectId, ref: 'Event', required: true },
  userId: { type: ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

EventLikeSchema.index({ eventId: 1, userId: 1 }, { unique: true });
EventLikeSchema.index({ userId: 1, createdAt: -1 });
EventLikeSchema.index({ eventId: 1 });

// Keep denormalized count on Event for performance
Event.likesCount: { type: Number, default: 0 }
```

**Benefits:**
- ✅ Unlimited likes
- ✅ Can track like history
- ✅ Efficient "has user liked" checks

---

#### 1.3 Comments → Separate Collection

**Before:**
```javascript
// Event model
comments: [{ text, userId, replies: [...] }] // ❌ Breaks at scale
```

**After:**
```javascript
// New Comment collection
const CommentSchema = new mongoose.Schema({
  eventId: { type: ObjectId, ref: 'Event', required: true },
  userId: { type: ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, maxlength: 2000 },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: ObjectId, ref: 'User' }], // Keep small array for now
  replyCount: { type: Number, default: 0 },
  isEdited: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

CommentSchema.index({ eventId: 1, createdAt: -1 });
CommentSchema.index({ userId: 1, createdAt: -1 });
CommentSchema.index({ eventId: 1, likes: -1 }); // For "top comments"

// New Reply collection
const ReplySchema = new mongoose.Schema({
  commentId: { type: ObjectId, ref: 'Comment', required: true },
  userId: { type: ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, maxlength: 1000 },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

ReplySchema.index({ commentId: 1, createdAt: 1 });
ReplySchema.index({ userId: 1, createdAt: -1 });

// Keep denormalized count on Event
Event.commentCount: { type: Number, default: 0 }
```

**Benefits:**
- ✅ Unlimited comments
- ✅ Efficient pagination
- ✅ Can implement comment moderation
- ✅ Separate reply management

---

### Phase 2: Denormalization & Caching (MUST DO)

#### 2.1 Denormalize Counts

**Add to Event model:**
```javascript
const EventSchema = new mongoose.Schema({
  // ... existing fields
  
  // Denormalized counts (updated via transactions)
  participantCount: { type: Number, default: 0 },
  likesCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  
  // Cache popular data
  topComments: [{ type: ObjectId, ref: 'Comment' }], // Top 3 comments
  recentParticipants: [{ type: ObjectId, ref: 'User' }], // Last 10 participants
});
```

**Why:**
- Avoid counting queries (COUNT is slow on large collections)
- Display counts without additional queries
- Update counts in background jobs

---

#### 2.2 Implement Redis Caching

**Cache Strategy:**
```javascript
// Cache hot data in Redis
const cacheKeys = {
  event: (id) => `event:${id}`,
  eventParticipants: (id) => `event:${id}:participants`,
  eventComments: (id, page) => `event:${id}:comments:${page}`,
  userJoinedEvents: (id) => `user:${id}:joined`,
  popularEvents: (location) => `popular:${location}`
};

// Cache TTL
const TTL = {
  event: 300, // 5 minutes
  participants: 60, // 1 minute
  comments: 120, // 2 minutes
  popularEvents: 600 // 10 minutes
};
```

**Implementation:**
```javascript
// Example: Get event with caching
async function getEvent(eventId) {
  // Try cache first
  const cached = await redis.get(cacheKeys.event(eventId));
  if (cached) return JSON.parse(cached);
  
  // Cache miss - query database
  const event = await Event.findById(eventId);
  
  // Store in cache
  await redis.setex(
    cacheKeys.event(eventId),
    TTL.event,
    JSON.stringify(event)
  );
  
  return event;
}
```

---

### Phase 3: Database Sharding (OPTIONAL - 10M+ users)

**When to shard:** 10M+ users, 1M+ events

**Shard Key Options:**

1. **Shard by Location** (Recommended)
```javascript
// Events sharded by location
sh.shardCollection("volunteer.events", { location: 1, _id: 1 })

// Benefits:
// - Most queries filter by location
// - Natural data distribution
// - Geographically distributed
```

2. **Shard by Date Range**
```javascript
// Events sharded by date
sh.shardCollection("volunteer.events", { date: 1, _id: 1 })

// Benefits:
// - Old events can be archived
// - Recent events on fast storage
```

---

## Migration Timeline

### Immediate (Before 50K users)
- ✅ Add timestamps to all models
- ✅ Add NGO events reference
- ✅ Implement basic monitoring

### Phase 1 (50K - 200K users) - 2-3 months
- 🔄 Migrate participants to junction table
- 🔄 Migrate likes to separate collection
- 🔄 Add denormalized counts
- 🔄 Implement Redis caching layer

### Phase 2 (200K - 500K users) - 3-4 months
- 🔄 Migrate comments to separate collection
- 🔄 Implement comment pagination
- 🔄 Add read replicas
- 🔄 Optimize indexes

### Phase 3 (500K - 1M users) - 4-6 months
- 🔄 Implement full caching strategy
- 🔄 Add CDN for images
- 🔄 Implement background job processing
- 🔄 Add database monitoring & alerts

### Phase 4 (1M+ users) - 6+ months
- 🔄 Consider database sharding
- 🔄 Implement microservices architecture
- 🔄 Add message queue (RabbitMQ/Kafka)
- 🔄 Implement event sourcing for analytics

---

## Migration Code Examples

### Example 1: Migrate Participants

```javascript
// Migration script
async function migrateParticipants() {
  const events = await Event.find({});
  
  for (const event of events) {
    if (event.participants && event.participants.length > 0) {
      // Create junction records
      const participants = event.participants.map(userId => ({
        eventId: event._id,
        userId: userId,
        joinedAt: new Date(), // Use event creation date if available
        status: 'joined'
      }));
      
      await EventParticipant.insertMany(participants, { ordered: false });
      
      // Update denormalized count
      event.participantCount = participants.length;
      
      // Remove array (keep for rollback initially)
      // event.participants = undefined;
      
      await event.save();
    }
  }
  
  console.log('Migration complete');
}
```

### Example 2: Update Queries

**Before:**
```javascript
// Old query - scans array
const event = await Event.findOne({ 
  _id: eventId, 
  participants: userId 
});
```

**After:**
```javascript
// New query - uses index
const participation = await EventParticipant.findOne({ 
  eventId, 
  userId,
  status: 'joined'
});
```

---

## Infrastructure Requirements at Million-Scale

### Database
- **MongoDB Atlas M40+** or equivalent
  - 16GB RAM minimum
  - 3-node replica set
  - Auto-scaling enabled
  - Backup every 6 hours

### Caching
- **Redis Cluster**
  - 8GB RAM minimum
  - 3-node cluster
  - Persistence enabled

### Application Servers
- **Load Balanced Node.js**
  - 4+ instances
  - Auto-scaling (2-10 instances)
  - Health checks
  - Rolling deployments

### CDN
- **Cloudflare/CloudFront**
  - Image optimization
  - Static asset caching
  - DDoS protection

### Monitoring
- **Application Performance Monitoring (APM)**
  - New Relic / DataDog
  - Error tracking (Sentry)
  - Log aggregation (ELK Stack)

### Estimated Monthly Cost
- Database: $500-1000
- Redis: $100-200
- App Servers: $300-500
- CDN: $50-100
- Monitoring: $100-200
- **Total: $1,050 - $2,000/month**

---

## Performance Targets at Million-Scale

### Response Times
- Event list: < 200ms (p95)
- Event details: < 300ms (p95)
- Join event: < 500ms (p95)
- Comment post: < 400ms (p95)

### Throughput
- 1,000 requests/second
- 10,000 concurrent users
- 99.9% uptime

### Database
- Query time: < 50ms (p95)
- Write time: < 100ms (p95)
- Index size: < 50% of RAM

---

## Rollback Strategy

### Keep Old Schema Initially
```javascript
// Keep both old and new for 1 month
Event: {
  participants: [...], // Old - deprecated
  participantCount: 0, // New - active
}

// Dual-write during transition
async function joinEvent(userId, eventId) {
  // Write to new collection
  await EventParticipant.create({ userId, eventId });
  
  // Also update old array (for rollback)
  await Event.updateOne(
    { _id: eventId },
    { 
      $addToSet: { participants: userId },
      $inc: { participantCount: 1 }
    }
  );
}
```

### Validation
```javascript
// Verify data consistency
async function validateMigration() {
  const events = await Event.find({});
  
  for (const event of events) {
    const oldCount = event.participants?.length || 0;
    const newCount = await EventParticipant.countDocuments({ 
      eventId: event._id 
    });
    
    if (oldCount !== newCount) {
      console.error(`Mismatch for event ${event._id}`);
    }
  }
}
```

---

## Conclusion

### Answer: YES, Major Redesign Required ✅

**At 1 million users, you MUST:**
1. ✅ Separate all array fields into junction collections
2. ✅ Move comments to separate collection
3. ✅ Implement Redis caching
4. ✅ Add denormalized counts
5. ✅ Scale infrastructure (replicas, load balancers)

**Timeline:** 6-12 months of gradual migration

**Cost:** $1,000-2,000/month infrastructure

**Risk:** High if not planned - app will break

**Recommendation:** Start planning migration at 50K users, execute at 200K users

---

**Generated:** December 1, 2025  
**Status:** Strategic planning document for future scale

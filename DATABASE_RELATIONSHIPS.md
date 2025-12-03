# Database Relationships - Visual Guide

## Collections Overview

You have **4 main collections:**

```
┌─────────────┐
│   ADMINS    │  (System administrators)
└─────────────┘

┌─────────────┐
│    NGOs     │  (Organizations creating events)
└─────────────┘

┌─────────────┐
│   EVENTS    │  (Volunteer events)
└─────────────┘

┌─────────────┐
│    USERS    │  (Volunteers)
└─────────────┘
```

---

## Relationship Diagram

```
                    ┌──────────────┐
                    │    ADMIN     │
                    │              │
                    │ - name       │
                    │ - email      │
                    │ - password   │
                    └──────────────┘
                           │
                           │ approves/rejects
                           ▼
    ┌──────────────┐  creates   ┌──────────────────────────┐
    │     NGO      │────────────▶│         EVENT            │
    │              │             │                          │
    │ - name       │             │ - name                   │
    │ - email      │             │ - description            │
    │ - password   │             │ - date, location         │
    │ - organization│            │ - status (pending/       │
    │              │             │   approved/rejected)     │
    │ - events[]   │◀────────────│ - createdBy (NGO ID)     │
    │   (reverse   │   references│ - creatorName            │
    │    lookup)   │             │ - creatorEmail           │
    │              │             │                          │
    │ - eventCount │             │ Arrays:                  │
    │   (denorm)   │             │ - participants[] (Users) │
    └──────────────┘             │ - likedBy[] (Users)      │
                                 │ - followers[] (Users)    │
                                 │                          │
                                 │ Embedded:                │
                                 │ - comments[]             │
                                 │   - userId (User)        │
                                 │   - text                 │
                                 │   - likes                │
                                 │   - likedBy[]            │
                                 │   - replies[]            │
                                 │                          │
                                 │ Counts (denormalized):   │
                                 │ - participantCount       │
                                 │ - commentCount           │
                                 │ - likesCount             │
                                 │ - followerCount          │
                                 └──────────────────────────┘
                                            ▲
                                            │
                                            │ joins/likes/follows
                                            │
                                 ┌──────────────────────┐
                                 │        USER          │
                                 │                      │
                                 │ - name               │
                                 │ - email              │
                                 │ - password           │
                                 │ - location           │
                                 │                      │
                                 │ - joinedEvents[]     │
                                 │   (Event IDs)        │
                                 │                      │
                                 │ - joinedEventsCount  │
                                 │   (denormalized)     │
                                 └──────────────────────┘
```

---

## Detailed Relationships

### 1. NGO → Event (One-to-Many)

**Type:** One NGO creates many Events

```javascript
// NGO Model
{
  _id: "ngo123",
  name: "GPS Ethiopia",
  events: ["event1", "event2", "event3"], // ✅ Reverse reference
  eventCount: 3 // ✅ Denormalized count
}

// Event Model
{
  _id: "event1",
  name: "Tree Planting",
  createdBy: "ngo123", // ✅ Reference to NGO
  creatorName: "GPS Ethiopia", // ✅ Denormalized for performance
  creatorEmail: "gps@gmail.com" // ✅ Denormalized
}
```

**Queries:**
```javascript
// Get all events by NGO (fast - uses index)
Event.find({ createdBy: ngoId })

// Get NGO's events (fast - direct array)
NGO.findById(ngoId).populate('events')
```

---

### 2. User ↔ Event (Many-to-Many) - BIDIRECTIONAL

**Type:** Users join many Events, Events have many Users

```javascript
// User Model
{
  _id: "user123",
  name: "John Doe",
  joinedEvents: ["event1", "event2"], // ✅ Events user joined
  joinedEventsCount: 2 // ✅ Denormalized count
}

// Event Model
{
  _id: "event1",
  name: "Tree Planting",
  participants: ["user123", "user456"], // ✅ Users who joined
  participantCount: 2 // ✅ Denormalized count
}
```

**Why Bidirectional?**
- Query "events user joined" → Use `User.joinedEvents`
- Query "users in event" → Use `Event.participants`
- Both queries are fast!

**Queries:**
```javascript
// Get user's joined events
User.findById(userId).populate('joinedEvents')

// Get event participants
Event.findById(eventId).populate('participants')

// Check if user joined event (fast - uses index)
Event.exists({ _id: eventId, participants: userId })
```

---

### 3. User → Event Likes (Many-to-Many)

**Type:** Users like many Events, Events liked by many Users

```javascript
// Event Model
{
  _id: "event1",
  name: "Tree Planting",
  likedBy: ["user123", "user789"], // ✅ Users who liked
  likesCount: 2 // ✅ Denormalized count
}

// User Model - NO likedEvents array
// (One-way relationship for simplicity)
```

**Queries:**
```javascript
// Check if user liked event
Event.exists({ _id: eventId, likedBy: userId })

// Get users who liked event
Event.findById(eventId).populate('likedBy')
```

---

### 4. User → Event Comments (One-to-Many, Embedded)

**Type:** Users write many Comments on Events

```javascript
// Event Model
{
  _id: "event1",
  name: "Tree Planting",
  comments: [ // ✅ EMBEDDED subdocuments
    {
      _id: "comment1",
      userId: "user123", // ✅ Reference to User
      text: "Great event!",
      likes: 5,
      likedBy: ["user456", "user789"],
      createdAt: "2025-12-01T10:00:00Z",
      replies: [ // ✅ Nested embedded
        {
          _id: "reply1",
          userId: "user456",
          text: "Thanks!",
          createdAt: "2025-12-01T11:00:00Z"
        }
      ]
    }
  ],
  commentCount: 1 // ✅ Denormalized count
}
```

**Why Embedded?**
- Single query to get event + all comments
- Comments always accessed with event
- Good for < 1000 comments per event

**Queries:**
```javascript
// Get event with comments
Event.findById(eventId)
  .populate('comments.userId', 'name profileImage')
```

---

### 5. Admin → Event (Approval System)

**Type:** Admin approves/rejects Events

```javascript
// Event Model
{
  _id: "event1",
  name: "Tree Planting",
  status: "pending", // or "approved" or "rejected"
  createdBy: "ngo123"
}

// Admin Model - NO direct relationship
// (Admins manage all events, not specific ones)
```

**Queries:**
```javascript
// Get pending events (for admin)
Event.find({ status: 'pending' })

// Approve event
Event.updateOne({ _id: eventId }, { status: 'approved' })
```

---

## Relationship Types Summary

| Relationship | Type | Implementation | Bidirectional? |
|--------------|------|----------------|----------------|
| NGO → Event | One-to-Many | Reference + Reverse Array | ✅ Yes |
| User ↔ Event (Join) | Many-to-Many | Arrays on both sides | ✅ Yes |
| User → Event (Like) | Many-to-Many | Array on Event only | ❌ No |
| User → Event (Follow) | Many-to-Many | Array on Event only | ❌ No |
| User → Comment | One-to-Many | Embedded in Event | ❌ No |
| Admin → Event | One-to-Many | Status field only | ❌ No |

---

## Data Flow Examples

### Example 1: User Joins Event

```javascript
// Step 1: Update Event
Event.updateOne(
  { _id: eventId },
  { 
    $addToSet: { participants: userId },
    $inc: { participantCount: 1 }
  }
)

// Step 2: Update User
User.updateOne(
  { _id: userId },
  { 
    $addToSet: { joinedEvents: eventId },
    $inc: { joinedEventsCount: 1 }
  }
)

// Result: Both sides updated ✅
```

### Example 2: NGO Creates Event

```javascript
// Step 1: Create Event
const event = await Event.create({
  name: "Tree Planting",
  createdBy: ngoId,
  creatorName: ngo.name, // Denormalized
  creatorEmail: ngo.email, // Denormalized
  status: "pending"
})

// Step 2: Update NGO
NGO.updateOne(
  { _id: ngoId },
  { 
    $push: { events: event._id },
    $inc: { eventCount: 1 }
  }
)

// Result: NGO can quickly list their events ✅
```

### Example 3: User Comments on Event

```javascript
// Single update - comment embedded in event
Event.updateOne(
  { _id: eventId },
  { 
    $push: { 
      comments: {
        userId: userId,
        text: "Great event!",
        createdAt: new Date()
      }
    },
    $inc: { commentCount: 1 }
  }
)

// Result: Comment stored with event ✅
```

---

## Key Design Decisions

### ✅ What We Did Right

1. **Bidirectional User-Event Join**
   - Can query from both directions efficiently
   - Prevents N+1 query problems

2. **Denormalized Counts**
   - No need to count array lengths
   - Instant access to counts

3. **Denormalized Creator Info**
   - Don't need to join NGO when displaying events
   - Acceptable data duplication

4. **Embedded Comments**
   - Single query for event + comments
   - Good for typical use case

5. **Proper Indexes**
   - All queries use indexes
   - Fast lookups

### ⚠️ Trade-offs We Made

1. **Arrays for Relationships**
   - ✅ Simple and fast for small-medium scale
   - ❌ Will need migration at 500K+ users

2. **Embedded Comments**
   - ✅ Fast for < 1000 comments
   - ❌ Document size limit at 10K+ comments

3. **One-way Likes**
   - ✅ Simpler schema
   - ❌ Can't easily query "events user liked"

---

## Real-World Example

Let's say user "John" joins event "Tree Planting":

### Before:
```javascript
// User John
{
  _id: "john123",
  joinedEvents: [],
  joinedEventsCount: 0
}

// Event Tree Planting
{
  _id: "event456",
  participants: [],
  participantCount: 0
}
```

### After Join:
```javascript
// User John
{
  _id: "john123",
  joinedEvents: ["event456"], // ✅ Added
  joinedEventsCount: 1 // ✅ Incremented
}

// Event Tree Planting
{
  _id: "event456",
  participants: ["john123"], // ✅ Added
  participantCount: 1 // ✅ Incremented
}
```

### Now We Can Query:
```javascript
// Get John's events (fast)
User.findById("john123").populate('joinedEvents')

// Get event participants (fast)
Event.findById("event456").populate('participants')

// Check if John joined (fast - uses index)
Event.exists({ _id: "event456", participants: "john123" })
```

---

## Summary

Your database uses a **hybrid approach**:

1. **References** - For main relationships (NGO → Event, User ↔ Event)
2. **Embedded** - For tightly coupled data (Comments in Events)
3. **Denormalization** - For performance (counts, creator info)
4. **Bidirectional** - For efficient queries both ways (User ↔ Event)

This design is:
- ✅ Simple to understand
- ✅ Fast to query
- ✅ Easy to maintain
- ✅ Scalable to 150K users

**It's a well-balanced, production-ready design!** 🎯

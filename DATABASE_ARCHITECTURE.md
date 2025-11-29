# Database Architecture & Schema Design

## Overview

Your project **DOES use an ODM** - specifically **Mongoose**, which is an Object Data Modeling library for MongoDB.

### **What is Mongoose?**

**Mongoose = ODM (Object Data Modeling)**
- ODM is like ORM but for **document databases** (MongoDB)
- ORM is for **relational databases** (PostgreSQL, MySQL)

Think of it this way:
- **ORM** (Prisma, TypeORM) → SQL Databases → Tables & Rows
- **ODM** (Mongoose) → MongoDB → Collections & Documents

## Database Technology Stack

```
Application Layer (Express/NestJS/Fastify)
            ↓
    Mongoose (ODM Layer)
            ↓
    MongoDB Driver
            ↓
    MongoDB Database
```

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Database** | MongoDB | NoSQL document database |
| **ODM** | Mongoose 8.10.2 | Schema modeling & validation |
| **Driver** | mongodb 4.17.2 | Low-level database connection |

## Database Schema Design

### **Collections (Tables in SQL)**

Your database has **4 main collections**:

1. **users** - Volunteer accounts
2. **ngos** - NGO organization accounts
3. **events** - Volunteer events
4. **admins** - Administrator accounts

### **1. User Schema (Volunteers)**

```javascript
// Collection: users
{
  _id: ObjectId,                    // Auto-generated unique ID
  name: String (required),          // User's full name
  email: String (required, unique), // Email address
  password: String (required),      // Hashed password
  location: String (default: "defaultLocation"),
  isBlocked: Boolean (default: false),
  role: String (default: "user"),
  createdAt: Date (default: Date.now),
  joinedEvents: [ObjectId]          // Array of Event IDs (Reference)
}

// Indexes for Performance:
- email: unique index (automatic)
- isBlocked: 1
- createdAt: -1
- location: 1
```

**Relationships:**
- **One-to-Many** with Events: User can join multiple events
- Uses `joinedEvents` array to store Event ObjectIds

### **2. NGO Schema (Organizations)**

```javascript
// Collection: ngos
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required),
  organization: String (required),  // Organization name
  createdAt: Date (default: Date.now),
  role: String (enum: ['ngo'], required),
  status: String (enum: ["active", "blocked"], default: "active")
}

// Indexes:
- email: unique index
- status: 1
- organization: 1
- createdAt: -1
```

**Relationships:**
- **One-to-Many** with Events: NGO can create multiple events

### **3. Event Schema**

```javascript
// Collection: events
{
  _id: ObjectId,
  name: String (required),
  description: String (required),
  date: Date (required),
  location: String (required),
  image: String (optional),         // Image URL
  status: String (enum: ["pending", "approved", "rejected"], default: "pending"),
  likes: Number (default: 0),
  
  // References (Relationships)
  likedBy: [ObjectId],              // References to User._id
  createdBy: ObjectId (required),   // Reference to NGO._id
  followers: [ObjectId],            // References to User._id
  participants: [ObjectId],         // References to User._id
  
  // Denormalized fields (for performance)
  creatorEmail: String (required),
  creatorName: String (required),
  
  // Embedded documents (nested)
  comments: [
    {
      userId: ObjectId,             // Reference to User._id
      text: String,
      replies: [
        {
          userId: ObjectId,         // Reference to User._id (NGO)
          text: String,
          createdAt: Date
        }
      ]
    }
  ]
}

// Indexes:
- status: 1
- date: 1
- location: 1
- createdBy: 1
- likes: -1
- Compound: (status: 1, date: 1)
```

**Relationships:**
- **Many-to-One** with NGO: Event belongs to one NGO (createdBy)
- **Many-to-Many** with Users: Event can have many participants/followers/likers
- **Embedded**: Comments are nested inside Event document

### **4. Admin Schema**

```javascript
// Collection: admins
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required),
  role: String (default: "admin"),
  createdAt: Date (timestamps: true),
  updatedAt: Date (timestamps: true)
}

// Indexes:
- email: unique index
```

## Relationship Patterns

### **1. Reference Pattern (Foreign Keys)**

Used for **One-to-Many** and **Many-to-Many** relationships:

```javascript
// User has many joined events (Reference)
joinedEvents: [
  ObjectId("event1_id"),
  ObjectId("event2_id")
]

// Event has many participants (Reference)
participants: [
  ObjectId("user1_id"),
  ObjectId("user2_id")
]
```

**How to Query:**
```javascript
// Populate (JOIN in SQL)
const user = await User.findById(userId)
  .populate('joinedEvents'); // Fetches full event documents

// Result:
{
  _id: "user123",
  name: "John",
  joinedEvents: [
    { _id: "event1", name: "Community Cleanup", ... },
    { _id: "event2", name: "Food Drive", ... }
  ]
}
```

### **2. Embedded Pattern (Nested Documents)**

Used for **tightly coupled data** that's always accessed together:

```javascript
// Comments are embedded in Event
comments: [
  {
    userId: ObjectId("user1"),
    text: "Great event!",
    replies: [
      {
        userId: ObjectId("ngo1"),
        text: "Thank you!",
        createdAt: Date
      }
    ]
  }
]
```

**Advantages:**
- ✅ Single query to get event with comments
- ✅ Atomic updates
- ✅ Better performance

**Disadvantages:**
- ❌ Document size limit (16MB in MongoDB)
- ❌ Harder to query comments independently

### **3. Denormalization Pattern**

Storing duplicate data for **performance**:

```javascript
// Event stores creator info (denormalized)
{
  createdBy: ObjectId("ngo123"),    // Reference
  creatorEmail: "ngo@example.com",  // Denormalized
  creatorName: "Help Ethiopia NGO"  // Denormalized
}
```

**Why?**
- ✅ Avoid JOIN (populate) on every query
- ✅ Faster reads
- ❌ Need to update in multiple places if NGO changes name

## Database Relationships Diagram

```
┌─────────────┐
│    User     │
│  (Volunteer)│
└──────┬──────┘
       │
       │ joinedEvents []
       │ (One-to-Many)
       ↓
┌─────────────┐         ┌─────────────┐
│    Event    │←────────│     NGO     │
│             │ createdBy│             │
└──────┬──────┘ (Many-to-One) └─────────────┘
       │
       │ participants []
       │ followers []
       │ likedBy []
       │ (Many-to-Many)
       ↓
┌─────────────┐
│    User     │
│  (Multiple) │
└─────────────┘

┌─────────────┐
│    Admin    │
│ (Separate)  │
└─────────────┘
```

## How Mongoose Handles Schema

### **1. Schema Definition**

```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  // ... more fields
});
```

**What Mongoose Does:**
- ✅ Validates data types
- ✅ Enforces required fields
- ✅ Creates indexes
- ✅ Provides default values
- ✅ Casts types automatically

### **2. Model Creation**

```javascript
const User = mongoose.model("User", userSchema);
```

**What This Creates:**
- Collection name: `users` (lowercase, pluralized)
- Model class with methods: `find()`, `create()`, `update()`, etc.

### **3. CRUD Operations**

```javascript
// CREATE
const user = await User.create({
  name: "John",
  email: "john@example.com",
  password: "hashed_password"
});

// READ
const users = await User.find({ isBlocked: false });
const user = await User.findById(userId);

// UPDATE
await User.findByIdAndUpdate(userId, { name: "John Updated" });

// DELETE
await User.findByIdAndDelete(userId);

// POPULATE (JOIN)
const user = await User.findById(userId)
  .populate('joinedEvents');
```

## Performance Optimizations

### **1. Indexes**

All models have strategic indexes:

```javascript
// User indexes
userSchema.index({ isBlocked: 1 });      // Filter blocked users
userSchema.index({ createdAt: -1 });     // Sort by date
userSchema.index({ location: 1 });       // Location queries

// Event indexes
EventSchema.index({ status: 1 });        // Filter by status
EventSchema.index({ date: 1 });          // Sort by date
EventSchema.index({ status: 1, date: 1 }); // Compound index
```

**Impact:**
- ✅ Faster queries
- ✅ Efficient sorting
- ✅ Quick lookups

### **2. Denormalization**

```javascript
// Instead of always populating NGO:
createdBy: ObjectId("ngo123")

// Store frequently accessed data:
creatorEmail: "ngo@example.com",
creatorName: "Help Ethiopia NGO"
```

### **3. Embedded Documents**

```javascript
// Comments embedded in Event
// Single query gets event + all comments
comments: [{ userId, text, replies: [...] }]
```

## Comparison: MongoDB vs SQL

| Aspect | MongoDB (Your Project) | SQL (PostgreSQL) |
|--------|----------------------|------------------|
| **Structure** | Collections & Documents | Tables & Rows |
| **Schema** | Flexible (can change) | Rigid (migrations needed) |
| **Relationships** | References + Embedding | Foreign Keys |
| **Joins** | populate() | JOIN |
| **Scaling** | Horizontal (sharding) | Vertical (bigger server) |
| **Transactions** | Supported (v4.0+) | Native |
| **Best For** | Flexible data, rapid changes | Complex relationships |

## Why Mongoose (ODM) is Used

### **Without Mongoose (Raw MongoDB):**
```javascript
// No validation, no schema
db.collection('users').insertOne({
  name: "John",
  email: "invalid-email", // No validation!
  age: "twenty" // Wrong type, no error!
});
```

### **With Mongoose (ODM):**
```javascript
// Schema validation
const user = await User.create({
  name: "John",
  email: "invalid-email", // ❌ Validation error!
  age: "twenty" // ❌ Type error!
});
```

**Benefits:**
- ✅ Schema validation
- ✅ Type casting
- ✅ Middleware (hooks)
- ✅ Query building
- ✅ Relationships (populate)
- ✅ Indexes management
- ✅ Better developer experience

## Summary

**You ARE using an ODM (Mongoose)!**

- **Database:** MongoDB (NoSQL document database)
- **ODM:** Mongoose (like ORM but for MongoDB)
- **Collections:** 4 (users, ngos, events, admins)
- **Relationships:** References (ObjectId) + Embedding
- **Schema:** Defined in `/models` folder
- **Validation:** Handled by Mongoose schemas
- **Performance:** Optimized with indexes

Mongoose handles all the schema definition, validation, relationships, and database operations for you!

---

**Last Updated:** November 28, 2025

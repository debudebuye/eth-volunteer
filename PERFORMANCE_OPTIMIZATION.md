# Performance Optimization - Event Location Query

## Problem
The `/events/by-location` endpoint was slow (1483ms), triggering performance warnings.

## Root Causes Identified

1. **Inefficient RegEx Query**
   - Used case-insensitive regex: `new RegExp(location, 'i')`
   - MongoDB indexes don't work efficiently with regex, especially case-insensitive ones
   - Full collection scan was happening

2. **No Pagination**
   - Returned all matching events without limit
   - Large datasets caused memory and network overhead

3. **No Status Filter**
   - Returned events regardless of approval status
   - Included pending/rejected events unnecessarily

4. **Missing Compound Index**
   - Had single-field indexes but no compound index for common query patterns
   - Query used both `status` and `location` filters

## Solutions Implemented

### 1. Optimized Query Pattern
```javascript
// Before
location: new RegExp(location, 'i')

// After
status: 'approved',
location: { $regex: `^${location}`, $options: 'i' } // Starts-with pattern
```
- Changed to "starts with" pattern which uses index better
- Added status filter to reduce result set

### 2. Added Pagination
```javascript
{
  page: 1,
  limit: 20,
  status: 'approved'
}
```
- Default 20 events per page
- Reduces memory usage and network transfer
- Faster response times

### 3. Added Compound Index
```javascript
EventSchema.index({ status: 1, location: 1, date: 1 });
```
- Optimized for queries filtering by status + location + sorting by date
- MongoDB can use this index for the entire query

### 4. Used `.lean()` for Better Performance
```javascript
Event.find(query).lean()
```
- Returns plain JavaScript objects instead of Mongoose documents
- ~5x faster for read-only operations
- Reduces memory overhead

### 5. Parallel Queries
```javascript
const [events, total] = await Promise.all([
  Event.find(query)...,
  Event.countDocuments(query)
]);
```
- Fetches events and count simultaneously
- Reduces total query time

## Performance Improvements

### Before
- Query time: ~1483ms
- No pagination
- Full collection scan
- Returns all events

### After (Expected)
- Query time: <100ms (with proper indexes)
- Paginated results (20 per page)
- Index-optimized query
- Only approved events

## How to Apply

1. **Rebuild Indexes**
   ```bash
   cd backend-express
   node scripts/rebuild-indexes.js
   ```

2. **Restart Backend Server**
   ```bash
   npm start
   ```

3. **Test the Endpoint**
   ```bash
   curl "http://localhost:5001/api/v1/events/by-location?location=Addis&page=1&limit=20"
   ```

## API Changes

### Request
```
GET /api/v1/events/by-location?location=Addis&page=1&limit=20&status=approved
```

### Response
```json
{
  "success": true,
  "message": "Events fetched successfully",
  "data": {
    "events": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

## Monitoring

Watch for the slow request warning in logs:
```
[warn]: Slow request detected {"method":"GET","path":"/by-location","duration":"XXXms"}
```

Target: Keep duration under 500ms (ideally <100ms)

## Future Optimizations

1. **Text Search Index** - For full-text location search
2. **Caching** - Redis cache for popular locations
3. **Database Sharding** - If dataset grows very large
4. **CDN** - Cache responses at edge locations

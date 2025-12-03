/**
 * Simple in-memory cache implementation
 * For production with multiple servers, use Redis instead
 */

class Cache {
  constructor() {
    this.cache = new Map();
    this.ttls = new Map();
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Set a value in cache with TTL (in seconds)
   */
  set(key, value, ttl = 300) {
    this.cache.set(key, value);
    this.ttls.set(key, Date.now() + (ttl * 1000));
  }

  /**
   * Get a value from cache
   */
  get(key) {
    const ttl = this.ttls.get(key);
    
    // Check if expired
    if (ttl && Date.now() > ttl) {
      this.delete(key);
      return null;
    }
    
    return this.cache.get(key);
  }

  /**
   * Check if key exists and is not expired
   */
  has(key) {
    const ttl = this.ttls.get(key);
    
    if (ttl && Date.now() > ttl) {
      this.delete(key);
      return false;
    }
    
    return this.cache.has(key);
  }

  /**
   * Delete a key from cache
   */
  delete(key) {
    this.cache.delete(key);
    this.ttls.delete(key);
  }

  /**
   * Delete multiple keys matching a pattern
   */
  deletePattern(pattern) {
    const regex = new RegExp(pattern);
    const keysToDelete = [];
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.delete(key));
    return keysToDelete.length;
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    this.ttls.clear();
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now();
    const expiredKeys = [];
    
    for (const [key, ttl] of this.ttls.entries()) {
      if (now > ttl) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => this.delete(key));
    
    if (expiredKeys.length > 0) {
      console.log(`🧹 Cache cleanup: removed ${expiredKeys.length} expired entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Singleton instance
const cache = new Cache();

// Cache key generators
const cacheKeys = {
  event: (id) => `event:${id}`,
  eventList: (location, page, status) => `events:${location}:${page}:${status}`,
  eventParticipants: (id) => `event:${id}:participants`,
  userJoinedEvents: (id) => `user:${id}:joined`,
  participation: (userId, eventId) => `participation:${userId}:${eventId}`,
  popularEvents: (location) => `popular:${location}`,
};

// Cache TTL (in seconds)
const cacheTTL = {
  event: 300, // 5 minutes
  eventList: 120, // 2 minutes
  participation: 60, // 1 minute
  popularEvents: 600, // 10 minutes
};

module.exports = {
  cache,
  cacheKeys,
  cacheTTL
};

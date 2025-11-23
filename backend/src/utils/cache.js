/**
 * Simple in-memory cache utility
 * For production, consider using Redis
 */
class Cache {
  constructor() {
    this.cache = new Map();
    this.ttlTimers = new Map();
  }

  /**
   * Set a value in cache with optional TTL (time to live)
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (default: 300 = 5 minutes)
   */
  set(key, value, ttl = 300) {
    // Clear existing timer if any
    if (this.ttlTimers.has(key)) {
      clearTimeout(this.ttlTimers.get(key));
    }

    // Set value
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });

    // Set TTL timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl * 1000);

    this.ttlTimers.set(key, timer);
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {any} Cached value or null if not found
   */
  get(key) {
    const item = this.cache.get(key);
    return item ? item.value : null;
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Delete a key from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    // Clear timer
    if (this.ttlTimers.has(key)) {
      clearTimeout(this.ttlTimers.get(key));
      this.ttlTimers.delete(key);
    }

    // Delete from cache
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    // Clear all timers
    this.ttlTimers.forEach(timer => clearTimeout(timer));
    this.ttlTimers.clear();

    // Clear cache
    this.cache.clear();
  }

  /**
   * Get cache size
   * @returns {number}
   */
  size() {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   * @returns {object}
   */
  stats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
module.exports = new Cache();

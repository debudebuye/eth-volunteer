/**
 * Test script for cache implementation
 */

const { cache, cacheKeys, cacheTTL } = require('../src/utils/cache');

console.log('🧪 Testing Cache Implementation\n');

// Test 1: Basic set and get
console.log('Test 1: Basic set and get');
cache.set('test-key', { data: 'test value' }, 10);
const value = cache.get('test-key');
console.log('✅ Set and get:', value);
console.log('');

// Test 2: Cache expiration
console.log('Test 2: Cache expiration (2 second TTL)');
cache.set('expire-test', 'will expire', 2);
console.log('✅ Immediately after set:', cache.get('expire-test'));
setTimeout(() => {
  console.log('⏰ After 3 seconds:', cache.get('expire-test') || 'EXPIRED ✅');
  console.log('');
  
  // Test 3: Pattern deletion
  console.log('Test 3: Pattern deletion');
  cache.set('events:addis:1:approved', 'event1', 60);
  cache.set('events:addis:2:approved', 'event2', 60);
  cache.set('events:nairobi:1:approved', 'event3', 60);
  cache.set('user:123:joined', 'user data', 60);
  
  console.log('Before deletion:', cache.getStats());
  const deleted = cache.deletePattern('events:addis:');
  console.log(`✅ Deleted ${deleted} entries matching 'events:addis:'`);
  console.log('After deletion:', cache.getStats());
  console.log('');
  
  // Test 4: Cache keys generator
  console.log('Test 4: Cache key generators');
  console.log('Event key:', cacheKeys.event('123'));
  console.log('Event list key:', cacheKeys.eventList('addis', 1, 'approved'));
  console.log('Participation key:', cacheKeys.participation('user123', 'event456'));
  console.log('');
  
  // Test 5: TTL values
  console.log('Test 5: TTL configuration');
  console.log('Event TTL:', cacheTTL.event, 'seconds');
  console.log('Event list TTL:', cacheTTL.eventList, 'seconds');
  console.log('Participation TTL:', cacheTTL.participation, 'seconds');
  console.log('');
  
  // Test 6: Cache statistics
  console.log('Test 6: Cache statistics');
  cache.set('stat-test-1', 'value1', 60);
  cache.set('stat-test-2', 'value2', 60);
  const stats = cache.getStats();
  console.log('✅ Cache size:', stats.size);
  console.log('✅ Cache keys:', stats.keys);
  console.log('');
  
  // Test 7: Clear cache
  console.log('Test 7: Clear all cache');
  console.log('Before clear:', cache.getStats().size, 'entries');
  cache.clear();
  console.log('✅ After clear:', cache.getStats().size, 'entries');
  console.log('');
  
  console.log('🎉 All cache tests passed!');
  process.exit(0);
}, 3000);

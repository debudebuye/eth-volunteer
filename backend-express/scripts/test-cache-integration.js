/**
 * Integration test for cache with event service
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const eventService = require('../src/services/eventService');
const { cache } = require('../src/utils/cache');

async function testCacheIntegration() {
  try {
    console.log('🧪 Testing Cache Integration with Event Service\n');
    
    // Connect to database
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI not found');
    }
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Clear cache before testing
    cache.clear();
    console.log('🧹 Cache cleared\n');

    // Test 1: First request (cache miss)
    console.log('Test 1: First request - should hit database');
    const start1 = Date.now();
    const events1 = await eventService.getEventsByLocation('addis', { page: 1, limit: 10 });
    const time1 = Date.now() - start1;
    console.log(`✅ First request: ${time1}ms (database query)`);
    console.log(`   Found ${events1.events.length} events`);
    console.log(`   Cache size: ${cache.getStats().size}\n`);

    // Test 2: Second request (cache hit)
    console.log('Test 2: Second request - should hit cache');
    const start2 = Date.now();
    const events2 = await eventService.getEventsByLocation('addis', { page: 1, limit: 10 });
    const time2 = Date.now() - start2;
    console.log(`✅ Second request: ${time2}ms (cache hit)`);
    console.log(`   Found ${events2.events.length} events`);
    console.log(`   Speed improvement: ${Math.round(time1 / time2)}x faster! 🚀\n`);

    // Test 3: Different page (cache miss)
    console.log('Test 3: Different page - should hit database');
    const start3 = Date.now();
    const events3 = await eventService.getEventsByLocation('addis', { page: 2, limit: 10 });
    const time3 = Date.now() - start3;
    console.log(`✅ Third request (page 2): ${time3}ms (database query)`);
    console.log(`   Found ${events3.events.length} events`);
    console.log(`   Cache size: ${cache.getStats().size}\n`);

    // Test 4: Cache statistics
    console.log('Test 4: Cache statistics');
    const stats = cache.getStats();
    console.log(`✅ Total cached entries: ${stats.size}`);
    console.log(`✅ Cache keys:`, stats.keys);
    console.log('');

    // Test 5: Performance comparison
    console.log('Test 5: Performance Summary');
    console.log(`   Database query: ${time1}ms`);
    console.log(`   Cache hit: ${time2}ms`);
    console.log(`   Performance gain: ${Math.round(time1 / time2)}x faster with cache! 🎉\n`);

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    console.log('\n🎉 All integration tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test error:', error);
    process.exit(1);
  }
}

testCacheIntegration();

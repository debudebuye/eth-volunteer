/**
 * Script to rebuild MongoDB indexes for Event collection
 * Run this after updating the Event model indexes
 * 
 * Usage: node scripts/rebuild-indexes.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Event = require('../models/Event');

async function rebuildIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\nDropping old indexes...');
    await Event.collection.dropIndexes();
    console.log('✅ Old indexes dropped');

    console.log('\nCreating new indexes...');
    await Event.createIndexes();
    console.log('✅ New indexes created');

    console.log('\nListing all indexes:');
    const indexes = await Event.collection.getIndexes();
    console.log(JSON.stringify(indexes, null, 2));

    console.log('\n✅ Index rebuild completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error rebuilding indexes:', error);
    process.exit(1);
  }
}

rebuildIndexes();

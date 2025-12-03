/**
 * Migration script to add denormalized count fields
 * Run this once to populate counts for existing data
 */

const mongoose = require('mongoose');
const path = require('path');
const Event = require('../models/Event');
const User = require('../models/User');
const NGO = require('../models/NGO');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function migrateCounts() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI not found in environment variables');
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Migrate Event counts
    console.log('📊 Migrating Event counts...');
    const events = await Event.find({});
    let eventCount = 0;
    
    for (const event of events) {
      const updates = {
        participantCount: event.participants?.length || 0,
        commentCount: event.comments?.length || 0,
        followerCount: event.followers?.length || 0,
        likesCount: event.likedBy?.length || 0
      };
      
      await Event.updateOne({ _id: event._id }, { $set: updates });
      eventCount++;
      
      if (eventCount % 100 === 0) {
        console.log(`  Processed ${eventCount} events...`);
      }
    }
    console.log(`✅ Updated ${eventCount} events\n`);

    // Migrate User counts
    console.log('👥 Migrating User counts...');
    const users = await User.find({});
    let userCount = 0;
    
    for (const user of users) {
      const joinedEventsCount = user.joinedEvents?.length || 0;
      
      await User.updateOne(
        { _id: user._id },
        { $set: { joinedEventsCount } }
      );
      userCount++;
      
      if (userCount % 100 === 0) {
        console.log(`  Processed ${userCount} users...`);
      }
    }
    console.log(`✅ Updated ${userCount} users\n`);

    // Migrate NGO counts and reverse references
    console.log('🏢 Migrating NGO counts...');
    const ngos = await NGO.find({});
    let ngoCount = 0;
    
    for (const ngo of ngos) {
      const ngoEvents = await Event.find({ createdBy: ngo._id }).select('_id');
      const eventIds = ngoEvents.map(e => e._id);
      
      await NGO.updateOne(
        { _id: ngo._id },
        { 
          $set: { 
            events: eventIds,
            eventCount: eventIds.length
          }
        }
      );
      ngoCount++;
    }
    console.log(`✅ Updated ${ngoCount} NGOs\n`);

    console.log('=== Migration Complete ===');
    console.log(`Events: ${eventCount}`);
    console.log(`Users: ${userCount}`);
    console.log(`NGOs: ${ngoCount}`);

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrateCounts();

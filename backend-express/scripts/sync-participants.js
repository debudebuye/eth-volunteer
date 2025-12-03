/**
 * Script to sync event participants with user joinedEvents
 * This fixes data inconsistency where users have joined events but events don't have them in participants
 */

const mongoose = require('mongoose');
const path = require('path');
const User = require('../models/User');
const Event = require('../models/Event');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const syncParticipants = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI not found in environment variables');
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get all users with their joined events
    const users = await User.find({ joinedEvents: { $exists: true, $ne: [] } });
    console.log(`Found ${users.length} users with joined events`);

    let updatedEvents = 0;
    let updatedParticipants = 0;

    // For each user, update their joined events' participants array
    for (const user of users) {
      console.log(`\nProcessing user: ${user.name} (${user._id})`);
      console.log(`Joined events: ${user.joinedEvents.length}`);

      for (const eventId of user.joinedEvents) {
        const event = await Event.findById(eventId);
        
        if (!event) {
          console.log(`  - Event ${eventId} not found, skipping`);
          continue;
        }

        // Check if user is already in participants
        const isParticipant = event.participants?.some(
          (p) => p.toString() === user._id.toString()
        );

        if (!isParticipant) {
          // Add user to participants
          await Event.findByIdAndUpdate(eventId, {
            $addToSet: { participants: user._id },
          });
          console.log(`  ✓ Added user to event "${event.name}" participants`);
          updatedParticipants++;
        } else {
          console.log(`  - User already in event "${event.name}" participants`);
        }
      }
      updatedEvents++;
    }

    console.log('\n=== Sync Complete ===');
    console.log(`Processed ${updatedEvents} users`);
    console.log(`Updated ${updatedParticipants} event participants`);

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error syncing participants:', error);
    process.exit(1);
  }
};

// Run the script
syncParticipants();

/**
 * Script to add createdAt timestamps to existing comments
 */

const mongoose = require('mongoose');
const path = require('path');
const Event = require('../models/Event');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const addCommentTimestamps = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI not found in environment variables');
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get all events with comments
    const events = await Event.find({ 'comments.0': { $exists: true } });
    console.log(`Found ${events.length} events with comments`);

    let updatedComments = 0;

    for (const event of events) {
      let eventModified = false;

      for (const comment of event.comments) {
        // Add createdAt if it doesn't exist
        if (!comment.createdAt) {
          comment.createdAt = new Date();
          eventModified = true;
          updatedComments++;
          console.log(`  ✓ Added timestamp to comment in event "${event.name}"`);
        }

        // Add likes and likedBy if they don't exist
        if (comment.likes === undefined) {
          comment.likes = 0;
        }
        if (!comment.likedBy) {
          comment.likedBy = [];
        }

        // Add createdAt to replies if they don't have it
        if (comment.replies) {
          for (const reply of comment.replies) {
            if (!reply.createdAt) {
              reply.createdAt = new Date();
              eventModified = true;
            }
          }
        }
      }

      if (eventModified) {
        await event.save();
      }
    }

    console.log('\n=== Migration Complete ===');
    console.log(`Updated ${updatedComments} comments with timestamps`);

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error adding timestamps:', error);
    process.exit(1);
  }
};

// Run the script
addCommentTimestamps();

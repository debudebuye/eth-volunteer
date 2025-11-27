const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  image: { type: String, required: false }, // Store image URL
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }, // New status field
  likes: { type: Number, default: 0 }, // Track the number of likes
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Track which users liked the event
  comments: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User who commented
      text: String, // Comment text
      replies: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User (NGO) who replied
          text: String, // Reply text
          createdAt: { type: Date, default: Date.now }, // Timestamp of the reply
        },
      ],
    }, 
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "NGO", required: true },
  creatorEmail: { type: String, required: true }, // Add this field
  creatorName: { type: String, required: true }, // Add this field
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Add followers field
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

// Indexes for performance optimization
EventSchema.index({ status: 1 }); // For filtering by status (pending, approved, rejected)
EventSchema.index({ date: 1 }); // For sorting/filtering by date
EventSchema.index({ location: 1 }); // For location-based queries
EventSchema.index({ createdBy: 1 }); // For NGO's events queries
EventSchema.index({ likes: -1 }); // For sorting by popularity
EventSchema.index({ status: 1, date: 1 }); // Compound index for approved events by date

module.exports = mongoose.model("Event", EventSchema); 
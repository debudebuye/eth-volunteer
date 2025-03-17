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

module.exports = mongoose.model("Event", EventSchema); 
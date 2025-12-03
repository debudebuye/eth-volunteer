const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  location: { type: String, default: "defaultLocation" },
  isBlocked: { type: Boolean, default: false },
  role: { type: String, default: "user" },
  joinedEvents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
  ],
  
  // Denormalized count for performance
  joinedEventsCount: { type: Number, default: 0 },
}, { timestamps: true }); // Add timestamps (replaces manual createdAt)

// Indexes for performance optimization
// Note: email already has unique index, no need to add explicit index
userSchema.index({ isBlocked: 1 }); // For filtering blocked users
userSchema.index({ createdAt: -1 }); // For sorting by registration date
userSchema.index({ location: 1 }); // For location-based queries

module.exports = mongoose.model("User", userSchema);
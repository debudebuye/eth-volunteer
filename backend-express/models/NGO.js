const mongoose = require("mongoose");

const ngoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  organization: { type: String, required: true },
  role: { type: String, enum: ['ngo'], required: true },
  status: { type: String, enum: ["active", "blocked"], default: "active" },
  
  // Reverse reference for efficient queries
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  eventCount: { type: Number, default: 0 },
}, { timestamps: true }); // Add timestamps (replaces manual createdAt)

// Indexes for performance optimization
// Note: email already has unique index, no need to add explicit index
ngoSchema.index({ status: 1 }); // For filtering active/blocked NGOs
ngoSchema.index({ organization: 1 }); // For searching by organization
ngoSchema.index({ createdAt: -1 }); // For sorting by registration date

const NGO = mongoose.model("NGO", ngoSchema);

module.exports = NGO; 


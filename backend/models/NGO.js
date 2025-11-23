const mongoose = require("mongoose");

const ngoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  organization: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  role: { type: String, enum: ['ngo'], required: true },
  status: { type: String, enum: ["active", "blocked"], default: "active" },

});

// Indexes for performance optimization
// Note: email already has unique index, no need to add explicit index
ngoSchema.index({ status: 1 }); // For filtering active/blocked NGOs
ngoSchema.index({ organization: 1 }); // For searching by organization
ngoSchema.index({ createdAt: -1 }); // For sorting by registration date

const NGO = mongoose.model("NGO", ngoSchema);

module.exports = NGO; 


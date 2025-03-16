const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  location: { type: String, default: "defaultLocation" }, // Add this line
  isBlocked: { type: Boolean, default: false }, // To track if the user is blocked
  role: { type: String, default: "user" }, // Optional: Add roles like "admin", "user", etc.
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
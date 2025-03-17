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

const NGO = mongoose.model("NGO", ngoSchema);

module.exports = NGO; 


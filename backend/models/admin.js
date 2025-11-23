const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true, // Normalize email to lowercase
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "admin",
    },
}, { timestamps: true });

// Indexes for performance optimization
// Note: email already has unique index, no need to add explicit index

module.exports = mongoose.model("Admin", adminSchema);
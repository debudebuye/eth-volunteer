const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");
const NGO = require("../models/NGO");

const secretKey = process.env.JWT_SECRET || "your_secret_key"; // Use environment variable for security

/**
 * General Token Verification Middleware
 */
const verifyToken = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Access Denied: No token provided" });
  }

  try {
    // Extract token from "Bearer <token>" format
    const tokenValue = token.startsWith("Bearer ") ? token.split(" ")[1] : token;
    const decoded = jwt.verify(tokenValue, secretKey);

    // Store user data in request object
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

/**
 * Verify Admin Middleware
 */
const verifyAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.user.id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    req.user = admin; // Attach admin data to request object
    next();
  } catch (error) {
    console.error("Admin verification error:", error);
    res.status(500).json({ message: "Server error during admin verification" });
  }
};

/**
 * Verify NGO Middleware
 */
const verifyNGO = async (req, res, next) => {
  try {
    const ngo = await NGO.findById(req.user.id);

    if (!ngo) {
      return res.status(404).json({ message: "NGO not found" });
    }

    req.user = ngo; // Attach NGO data to request object
    next();
  } catch (error) {
    console.error("NGO verification error:", error);
    res.status(500).json({ message: "Server error during NGO verification" });
  }
};

/**
 * Role-Based Middleware for Admins
 */
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Only admins are allowed." });
  }
  next();
};

/**
 * Role-Based Middleware for NGOs
 */
const isNGO = (req, res, next) => {
  if (!req.user || req.user.role !== "ngo") {
    return res.status(403).json({ message: "Access denied. Only NGOs are allowed." });
  }
  next();
};

module.exports = { verifyToken, verifyAdmin, verifyNGO, isAdmin, isNGO };

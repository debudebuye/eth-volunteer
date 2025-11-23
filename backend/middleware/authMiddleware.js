const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");
const NGO = require("../models/NGO");
const logger = require("../src/utils/logger");

const secretKey = process.env.JWT_SECRET;

if (!secretKey) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

/**
 * Verify Token Middleware
 * Validates JWT token and attaches decoded user info to request
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "Access Denied: No token provided" });
  }

  try {
    // Extract token from "Bearer <token>" format
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    
    if (!token) {
      return res.status(401).json({ message: "Access Denied: Invalid token format" });
    }

    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // Attach decoded payload to req.user
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(401).json({ message: "Token verification failed" });
  }
};

/**
 * Verify Admin Middleware
 * Ensures the authenticated user is an admin
 */
const verifyAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const admin = await Admin.findById(req.user.id).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    req.user = admin; // Attach admin data to request object
    next();
  } catch (error) {
    logger.error("Admin verification error:", error);
    res.status(500).json({ message: "Server error during admin verification" });
  }
};

/**
 * Verify NGO Middleware
 * Ensures the authenticated user is an NGO
 */
const verifyNGO = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const ngo = await NGO.findById(req.user.id).select("-password");
    
    if (!ngo) {
      return res.status(404).json({ message: "NGO not found" });
    }

    if (ngo.status === "blocked") {
      return res.status(403).json({ message: "Your account has been blocked" });
    }

    req.user.ngo = ngo; // Attach NGO data to req.user
    next();
  } catch (error) {
    logger.error("NGO verification error:", error);
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

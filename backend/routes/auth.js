const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const NGO = require("../models/NGO");
const multer = require("multer");
const Event = require("../models/Event");
const { verifyToken, verifyNGO } = require("../middleware/authMiddleware");


const router = express.Router();

router.post("/register/volunteer", async (req, res) => {
    const { name, email, password, location } = req.body; // Add location to destructuring
  
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new user with the location field
      const user = new User({
        name,
        email,
        password: hashedPassword,
        location, // Include the location field
        role: "volunteer",
      });
  
      // Save the user to the database
      await user.save();
  
      // Respond with success message
      res.status(201).json({ message: "Volunteer registered successfully!" });
    } catch (error) {
      console.error("Error registering volunteer:", error);
  
      // Handle duplicate email error
      if (error.code === 11000) {
        return res.status(400).json({ message: "Email already exists." });
      }
  
      // Handle other errors
      res.status(500).json({ message: "Internal server error" });
    }
  });

// Register NGO

// Register NGO
router.post("/register/ngo", async (req, res) => {
    const { name, email, password, organization } = req.body;

    try {
        // Check if email already exists
        const existingNGO = await NGO.findOne({ email });
        if (existingNGO) {
            return res.status(400).json({ message: "NGO with this email already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new NGO
        const newNGO = new NGO({
            name,
            email,
            password: hashedPassword,
            organization,
            role: "ngo",
        });

        await newNGO.save();
        res.status(201).json({ message: "NGO registered successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Validate password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        const userData = {
            token,
            _id: user._id,
            name: user.name,
            email: user.email,
            location: user.location,
            role: user.role,
            isBlocked: user.isBlocked,
            createdAt: user.createdAt,
          };
      
          res.status(200).json(userData);
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
});


router.post("/login-ngo", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if NGO with the given email exists
        const ngo = await NGO.findOne({ email });
        if (!ngo) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, ngo.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Create a JWT token
        const token = jwt.sign(
            { id: ngo._id, email: ngo.email, role: ngo.role }, // Payload
            process.env.JWT_SECRET, // Use environment variable for secret key
            { expiresIn: "1h" } // Token expiration time
        );

        // Return the token and role in the response
        res.status(200).json({
            message: "Login successful",
            token,
            role: ngo.role, // Send the user role (NGO) to the frontend
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Images will be stored in an 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});
const upload = multer({ storage });

// @route  POST /api/events/create
// @desc   NGO creates an event (default approved: false)
// @access NGO (protected)
router.post("/events/create", verifyToken, verifyNGO, upload.single("image"), async (req, res) => {
    try {
        const { name, description, date, location } = req.body;
        const imagePath = req.file ? `/uploads/${req.file.filename}` : null; // Store image path

        const newEvent = new Event({
            name,
            description,
            date,
            location,
            image: imagePath,
            approved: false, // Default to false
            createdBy: req.user.id, // Assign to the NGO creating it
        });

        await newEvent.save();
        res.status(201).json({ message: "Event created successfully! Pending admin approval." });
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});

// @route  GET /api/events
// @desc   Get all events (only approved ones)
// @access Public
router.get("/", async (req, res) => {
    try {
        const events = await Event.find({ approved: true });
        res.status(200).json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// @route  GET /api/events/pending
// @desc   Get all pending events (for admin approval)
// @access Admin only
router.get("/pending", verifyToken, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const pendingEvents = await Event.find({ approved: false });
        res.status(200).json(pendingEvents);
    } catch (error) {
        console.error("Error fetching pending events:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// @route  PUT /api/events/approve/:id
// @desc   Admin approves an event
// @access Admin only
router.put("/approve/:id", verifyToken, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        event.approved = true;
        await event.save();

        res.status(200).json({ message: "Event approved successfully!" });
    } catch (error) {
        console.error("Error approving event:", error);
        res.status(500).json({ message: "Server error" });
    }
});





module.exports = router;

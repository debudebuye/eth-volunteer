const express = require("express");
const multer = require("multer");
const Event = require("../models/Event");
const { verifyToken, verifyNGO, isNGO, verifyAdmin, isAdmin } = require("../middleware/authMiddleware");



const router = express.Router();

// Function to sanitize file names (replace spaces with underscores)
const sanitizeFilename = (filename) => {
  return filename.replace(/\s+/g, "_"); // Replace spaces with underscores
};

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Images will be stored in an 'uploads' folder
  },
  filename: (req, file, cb) => {
    const sanitizedFilename = sanitizeFilename(file.originalname); // Sanitize the file name
    cb(null, Date.now() + "-" + sanitizedFilename); // Save with sanitized name
  },
});
const upload = multer({ storage });

// Dynamically determine the base URL for images
const getBaseImageUrl = () => {
  if (process.env.NODE_ENV === "production") {
    return process.env.BACKEND_BASEURL || "https://eth-volunteer-backend.vercel.app"; // Production URL
  }
  return "http://localhost:5000"; // Development URL
};

/**
 * @route   POST /api/events/create
 * @desc    NGO creates an event (default approved: false)
 * @access  NGO only (protected)
 */
router.post("/create", verifyToken, verifyNGO, isNGO, upload.single("image"), async (req, res) => {
  try {
    const { name, description, date, location } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null; // Store image path

    const newEvent = new Event({
      name,
      description,
      date,
      location,
      image: imagePath,
      status: "pending", // Set status instead of approved: false
      createdBy: req.user.id, // Assign to the NGO creating it
    });

    await newEvent.save();
    res.status(201).json({ message: "Event created successfully! Pending admin approval." });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

/**
 * @route   GET /api/events
 * @desc    Get all approved events (public)
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const events = await Event.find({ approved: true });
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   GET /api/events/pending
 * @desc    Get all pending events (for admin approval)
 * @access  Admin only
 */
router.get("/pending", verifyToken, verifyAdmin, isAdmin, async (req, res) => {
  try {
    const pendingEvents = await Event.find({ status: "pending" });
    res.status(200).json(pendingEvents);
  } catch (error) {
    console.error("Error fetching pending events:", error);
    res.status(500).json({ message: "Server error" });
  }
});


/**
 * @route   PUT /api/events/approve/:id
 * @desc    Admin approves an event
 * @access  Admin only
 */
router.put("/approve/:id", verifyToken, verifyAdmin, isAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.status = "approved"; // ✅ Use status instead of approved: true
    await event.save();

    res.status(200).json({ message: "Event approved successfully!", event });
  } catch (error) {
    console.error("Error approving event:", error);
    res.status(500).json({ message: "Server error" });
  }
});



// Fetch approved events
router.get("/approved", async (req, res) => {
  try {
    const events = await Event.find({ status: "approved" }); // Fetch approved events
    const eventsWithFullImageUrl = events.map((event) => ({
      ...event._doc,
      image: `http://localhost:5000${event.image}`, // Prepend base URL to image path
    }));
    res.status(200).json(eventsWithFullImageUrl);
  } catch (error) {
    console.error("Error fetching approved events:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:eventId", async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId); // Find event by ID
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Prepend the base URL to the image path
    const eventWithFullImageUrl = {
      ...event._doc,
      image: `http://localhost:5000${event.image}`,
    };

    console.log("Event details:", eventWithFullImageUrl); // Log the event details
    res.status(200).json(eventWithFullImageUrl); // Return the event details
  } catch (error) {
    console.error("Error fetching event details:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/rejected", async (req, res) => {
  try {
    const events = await Event.find({ status: "rejected" });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Error fetching rejected events" });
  }
});

// Disapprove event
router.put("/disapprove/:id", async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { status: "pending" },  // Change the status to 'pending'
      { new: true }
    );
    if (!updatedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error("Error disapproving event:", error);
    res.status(500).json({ error: "Failed to disapprove event" });
  }
});


router.put("/unreject/:id", async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { status: "pending" },
      { new: true }
    );
    if (!updatedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error("Error unrejecting event:", error);
    res.status(500).json({ error: "Failed to unreject event" });
  }
});






// // Approve event
// router.put("/approve/:id", async (req, res) => {
//   try {
//     const updatedEvent = await Event.findByIdAndUpdate(
//       req.params.id,
//       { status: "approved" },
//       { new: true }
//     );
//     if (!updatedEvent) {
//       return res.status(404).json({ error: "Event not found" });
//     }
//     res.json(updatedEvent);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to approve event" });
//   }
// });

// Reject event
router.put("/reject/:id", async (req, res) => {
  try {
    // Fetch the event by its ID
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Update the status to 'rejected'
    event.status = "rejected";  // Make sure you're using the correct field
    await event.save();

    // Return the updated event
    res.status(200).json({ message: "Event rejected successfully!", event });
  } catch (error) {
    console.error("Error rejecting event:", error);  // Log the error for debugging
    res.status(500).json({ error: "Failed to reject event" });
  }
});

// DELETE: Delete an event by ID
router.delete("/delete/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;

    // Find and delete the event
    const deletedEvent = await Event.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

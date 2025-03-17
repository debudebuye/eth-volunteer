const express = require("express");
const multer = require("multer");
const Event = require("../models/Event");
const { verifyToken, verifyNGO, isNGO, verifyAdmin, isAdmin } = require("../middleware/authMiddleware");
const nodemailer = require('nodemailer')
const mongoose = require("mongoose"); // Import mongoose


const router = express.Router();

// Function to sanitize file names (replace spaces with underscores)
const sanitizeFilename = (filename) => {
  return filename.replace(/\s+/g, "_"); // Replace spaces with underscores
};

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../uploads/"); // Images will be stored in an 'uploads' folder
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
    const { name, description, date, location, creatorEmail, creatorName } = req.body;

    // Validate required fields
    if (!name || !description || !date || !location || !creatorEmail || !creatorName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(creatorEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const imagePath = req.file ? `../uploads/${req.file.filename}` : null; // Store image path

    const newEvent = new Event({
      name,
      description,
      date,
      location,
      image: imagePath,
      status: "pending", // Set status instead of approved: false
      createdBy: req.user.id, // Assign to the NGO creating it
      creatorEmail, // Add creator email
      creatorName,  // Add creator name
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

    // Send email notification
    const emailResponse = await fetch(`${process.env.BACKEND_BASEURL || "http://localhost:5000"}/api/events/send-email/${event._id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${req.headers.authorization.split(" ")[1]}`,
      },
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(errorData.message || "Failed to send email notification");
    }

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


// Fetch events created by the logged-in NGO
router.get("/events", verifyToken, verifyNGO, isNGO, async (req, res) => {
  try {
      console.log("Logged-in NGO ID:", req.user.id); // Debugging: Log the NGO ID
      const events = await Event.find({ createdBy: req.user.id });
      console.log("Fetched Events:", events); // Debugging: Log the fetched events
      res.status(200).json({ events });
  } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Server error" });
  }
});

router.get("/track", verifyToken, verifyNGO, isNGO, async (req, res) => {
  try {
      console.log("Logged-in NGO ID:", req.user.id); // Debugging: Log the NGO ID

      // Fetch events and populate likedBy and followers with user details
      const events = await Event.find({ createdBy: req.user.id })
          .populate("likedBy", "name email") // Populate likedBy with user name and email
          .populate("followers", "name email") // Populate followers with user name and email
          .populate("comments.userId", "name email"); // Populate comments.userId with user name and email

      console.log("Fetched Events:", events); // Debugging: Log the fetched events
      res.status(200).json({ events });
  } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Server error" });
  }
});


// Add a reply to a comment
router.post("/:eventId/comments/:commentId/reply", verifyToken, verifyNGO, isNGO, async (req, res) => {
  try {
    const { eventId, commentId } = req.params;
    const { text } = req.body;

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Find the comment
    const comment = event.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Add the reply
    comment.replies.push({
      userId: req.user.id, // NGO's ID
      text,
    });

    await event.save();

    res.status(201).json({ message: "Reply added successfully", event });
  } catch (error) {
    console.error("Error adding reply:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Update an event
router.put("/update/:eventId", verifyToken, verifyNGO, isNGO, async (req, res) => {
  try {
      const { eventId } = req.params;
      const { name, description, date, location } = req.body;

      // Validate required fields
      if (!name || !description || !date || !location) {
          return res.status(400).json({ message: "All fields are required" });
      }

      // Find the event by ID
      const event = await Event.findById(eventId);
      if (!event) {
          return res.status(404).json({ message: "Event not found" });
      }

      // Check if the NGO is the creator of the event
      if (event.createdBy.toString() !== req.user.id) {
          return res.status(403).json({ message: "You are not authorized to update this event" });
      }

      // Update the event
      event.name = name;
      event.description = description;
      event.date = date;
      event.location = location;

      await event.save();

      res.status(200).json({ message: "Event updated successfully", event });
  } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Server error" });
  }
});


// Delete an event
router.delete("/delete/:eventId", verifyToken, verifyNGO, isNGO, async (req, res) => {
  try {
      const { eventId } = req.params;

      // Find the event by ID
      const event = await Event.findById(eventId);
      if (!event) {
          return res.status(404).json({ message: "Event not found" });
      }

      // Check if the NGO is the creator of the event
      if (event.createdBy.toString() !== req.user.id) {
          return res.status(403).json({ message: "You are not authorized to delete this event" });
      }

      // Delete the event
      await Event.findByIdAndDelete(eventId);

      res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Server error" });
  }
});

// GET /api/events/by-location?location=<location>
router.get("/by-location", async (req, res) => {
  try {
    const { location } = req.query; // Get the location from the query parameter

    if (!location) {
      return res.status(400).json({ message: "Location query parameter is required" });
    }

    // Fetch events that match the location (case-insensitive search)
    const events = await Event.find({ location: new RegExp(location, "i") });

    // Return the events
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events by location:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post('/send-email/:eventId', async (req, res) => {
  const { eventId } = req.params;

  try {
    // Find the event by ID
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    console.log("Event data:", event); // Log the event data

    // Validate required fields
    if (!event.creatorEmail || !event.creatorName) {
      return res.status(400).json({ message: 'Event creator email or name is missing' });
    }

    // Configure the email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify transporter configuration
    transporter.verify((error) => {
      if (error) {
        console.error('Error verifying transporter:', error);
        throw new Error('Failed to configure email transporter');
      } else {
        console.log('Transporter is ready to send emails');
      }
    });

    // Define email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: event.creatorEmail,
      subject: 'Your Event Has Been Approved',
      text: `Dear ${event.creatorName},\n\nYour event "${event.name}" has been approved.\n\nThank you!`,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);

    // Provide detailed error response
    if (error.code === 'EAUTH') {
      res.status(500).json({ message: 'Authentication failed. Check email credentials.', error: error.message });
    } else if (error.code === 'EENVELOPE') {
      res.status(500).json({ message: 'Invalid email address.', error: error.message });
    } else {
      res.status(500).json({ message: 'Failed to send email', error: error.message });
    }
  }
});

// GET /api/events/:eventId (Fetch event by ID)
router.get("/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;

    // Validate eventId (must be a valid ObjectId)
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await Event.findById(eventId); // Find event by ID
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event); // Return the event details
  } catch (error) {
    console.error("Error fetching event details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/events/follow (Follow an event)
router.post("/follow", async (req, res) => {
  try {
    const { eventId, userId } = req.body;

    // Validate eventId and userId
    if (!mongoose.Types.ObjectId.isValid(eventId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid event ID or user ID" });
    }

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Initialize followers array if it doesn't exist
    if (!event.followers) {
      event.followers = [];
    }

    // Add the user to the event's followers list (if not already following)
    if (!event.followers.includes(userId)) {
      event.followers.push(userId);
      await event.save();
    }

    res.status(200).json({ message: "Followed successfully!", event });
  } catch (error) {
    console.error("Error following event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/events/following (Fetch events followed by a user)
router.get("/following", async (req, res) => {
  const { userId } = req.query; // Expect userId as a query parameter

  console.log("Received userId:", userId); // Debugging

  // Validate userId
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    console.error("Invalid user ID:", userId); // Debugging
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    // Find events where the followers array contains the userId
    const events = await Event.find({ followers: { $in: [userId] } });
    console.log("Fetched events:", events); // Debugging
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events for following:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

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


// Endpoint to join an event
router.post('/join-event', async (req, res) => {
  const { userId, eventId } = req.body;

  try {
    // Find the user and update their joinedEvents array
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the event is already joined
    if (user.joinedEvents.includes(eventId)) {
      return res.status(400).json({ message: 'Event already joined' });
    }

    // Add the event ID to the joinedEvents array
    user.joinedEvents.push(eventId);
    await user.save();

    res.status(200).json({ message: 'Event joined successfully', user });
  } catch (error) {
    console.error('Error joining event:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post("/likes", async (req, res) => {
  const { eventId, userId } = req.body;

  try {
    // Validate input
    if (!eventId || !userId) {
      return res.status(400).json({ message: "eventId and userId are required" });
    }

    // Check if eventId and userId are valid MongoDB ObjectIds
    if (!mongoose.Types.ObjectId.isValid(eventId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid eventId or userId" });
    }

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if the user has already liked the event
    if (event.likedBy.includes(userId)) {
      return res.status(400).json({ message: "User has already liked this event" });
    }

    // Increment the likes count and add the user to the likedBy array
    event.likes += 1; // Ensure this is a number
    event.likedBy.push(userId); // Add the user to the likedBy array
    await event.save();

    res.status(200).json({ message: "Event liked successfully", event });
  } catch (error) {
    console.error("Error liking event:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});


router.post("/unlike", async (req, res) => {
  const { eventId, userId } = req.body;

  try {
    // Validate input
    if (!eventId || !userId) {
      return res.status(400).json({ message: "eventId and userId are required" });
    }

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if the user has already liked the event
    if (!event.likedBy.includes(userId)) {
      return res.status(400).json({ message: "User has not liked this event" });
    }

    // Decrement the likes count and remove the user from the likedBy array
    event.likes -= 1;
    event.likedBy = event.likedBy.filter((id) => id.toString() !== userId);
    await event.save();

    res.status(200).json({ message: "Event unliked successfully", event });
  } catch (error) {
    console.error("Error unliking event:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

router.post("/comment", async (req, res) => {
  const { eventId, userId, text } = req.body;

  try {
    // Find the event by ID
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Add the new comment to the comments array
    event.comments.push({ userId, text });

    // Save the updated event
    await event.save();

    res.status(201).json({ message: "Comment added successfully", comment: { userId, text } });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Failed to add comment" });
  }
});

// Fetch comments for an event
router.get("/:eventId/comments", async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId).populate("comments.userId", "name profileImage"); // Populate user details

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ comments: event.comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

/**
 * @route   DELETE /api/events/delete/:eventId
 * @desc    Delete an event by ID
 * @access  NGO only (protected)
 */
router.delete("/delete/:eventId", verifyToken, verifyNGO, isNGO, async (req, res) => {
  try {
    const { eventId } = req.params;

    // Find the event by ID
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if the NGO is the creator of the event
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to delete this event" });
    }

    // Delete the event
    await Event.findByIdAndDelete(eventId);

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.put("/update/:eventId", verifyToken, verifyNGO, isNGO, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { name, description, date, location } = req.body;

    // Validate required fields
    if (!name || !description || !date || !location) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find the event by ID
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if the NGO is the creator of the event
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to update this event" });
    }

    // Update the event
    event.name = name;
    event.description = description;
    event.date = date;
    event.location = location;

    await event.save();

    res.status(200).json({ message: "Event updated successfully", event });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
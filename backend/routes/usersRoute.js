const express = require("express");
const User = require("../models/User"); // Import the User model
const router = express.Router();

// Fetch all users (excluding passwords)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude password field
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a user
router.delete("/users/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Block/Unblock a user
router.patch("/users/:id/block", async (req, res) => {
    try {
      const { isBlocked } = req.body; // Expect { isBlocked: true/false } in the request body
  
      // Validate the request body
      if (typeof isBlocked !== "boolean") {
        return res.status(400).json({ message: "Invalid request body. 'isBlocked' must be a boolean." });
      }
  
      // Find the user and update the isBlocked field
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isBlocked }, // Update isBlocked field
        { new: true } // Return the updated user
      );
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Send success response
      res.status(200).json({
        message: `User ${isBlocked ? "blocked" : "unblocked"} successfully`,
        user,
      });
    } catch (error) {
      console.error("Error blocking/unblocking user:", error);
      res.status(500).json({ message: "Server error" });
    }
  });


// Fetch user profile by email
router.get("/profile/:email", async (req, res) => {
  try {
    const { email } = req.params;
    console.log("Fetching user profile for email:", email); // Debugging

    if (!email) {
      return res.status(400).json({ message: "Email parameter is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found in database"); // Debugging
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found:", user); // Debugging
    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile
router.put("/update-profile", async (req, res) => {
  const { email, name, location } = req.body;

  try {
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { name, location },
      { new: true }
    );

    if (!updatedUser) {
      console.log("User not found for email:", email); // Debugging
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Updated user:", updatedUser); // Debugging
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

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

// Backend endpoint to fetch joined events
router.get("/joined-events", async (req, res) => {
  const { userId } = req.query;

  try {
    const user = await User.findById(userId).populate("joinedEvents");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.joinedEvents);
  } catch (error) {
    console.error("Error fetching joined events:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});  

// Endpoint to unjoin an event
router.post("/unjoin-event", async (req, res) => {
  const { userId, eventId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the event ID from the joinedEvents array
    user.joinedEvents = user.joinedEvents.filter((id) => id.toString() !== eventId);
    await user.save();

    res.status(200).json({ message: "Unjoined successfully", user });
  } catch (error) {
    console.error("Error unjoining event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
 

module.exports = router;
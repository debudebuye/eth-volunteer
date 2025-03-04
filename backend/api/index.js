require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path"); // Import the path module
const connectDB = require("../config/db");

const app = express();
connectDB();

// Enable CORS
app.use(cors());


// Optionally restrict CORS to specific origins in production
if (process.env.NODE_ENV === "production") {
  app.use(
    cors({
      origin: "https://eth-volunteer.vercel.app", // Replace with your frontend domain
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
  );
}

// Middleware for parsing JSON bodies
app.use(express.json());

// Routes
const eventsRoute = require("../routes/eventRoutes");
const adminRoute = require("../routes/adminRoutes");
const authRoutes = require("../routes/auth");
const ngoRoutes = require("../routes/ngoRoutes");
const userRoutes = require("../routes/usersRoute");

// Mount routes
app.use("/api/events", eventsRoute);
app.use("/api/admin", adminRoute);
app.use("/api/auth", authRoutes);
app.use("/api/ngo", ngoRoutes);
app.use("/api", userRoutes);

// Dynamically determine the backend URL
const backendUrl = process.env.NODE_ENV === "production"
  ? process.env.BACKEND_BASEURL || "https://eth-volunteer-backend.vercel.app"
  : "http://localhost:5000";

// Serve static files from the "uploads" directory
// Resolve the path relative to the root of the project
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Middleware to rewrite image URLs for approved events
app.get("/api/events/approved", async (req, res) => {
  try {
    const events = await Event.find({ status: "approved" }); // Assuming you're using Mongoose

    // Rewrite image URLs dynamically
    const eventsWithFullImageUrl = events.map((event) => ({
      ...event._doc,
      image: event.image
        ? `${backendUrl}/uploads/${path.basename(event.image)}`
        : null, // Handle missing images gracefully
    }));

    res.json(eventsWithFullImageUrl);
  } catch (error) {
    console.error("Error fetching approved events:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Root route for testing
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
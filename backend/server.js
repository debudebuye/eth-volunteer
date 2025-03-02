require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path"); // Import the path module
const connectDB = require("./config/db");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

const eventsRoute = require("./routes/eventRoutes"); // Adjust the path if needed
const adminRoute = require("./routes/adminRoutes");

app.use("/api/events", eventsRoute); // Mount the event routes under '/events'
app.use("/api/admin", adminRoute);

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes); // Handle API routes

const ngoRoutes = require("./routes/ngoRoutes");
app.use("/api/ngo", ngoRoutes);

const userRoutes = require("./routes/usersRoute");
app.use("/api", userRoutes);

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Start the server
app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.listen(5000, () => console.log("Server running on port 5000"));
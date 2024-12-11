const express = require("express");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const itemsRoutes = require("./routes/items");  // Import the new items routes

dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);  // Authentication routes
app.use("/api/items", itemsRoutes);  // Items and reviews routes



module.exports = app;
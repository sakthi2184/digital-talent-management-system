const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// MongoDB Connection
mongoose.connect("mongodb://admin:admin123@ac-u8lkhhe-shard-00-00.e0fgzng.mongodb.net:27017,ac-u8lkhhe-shard-00-01.e0fgzng.mongodb.net:27017,ac-u8lkhhe-shard-00-02.e0fgzng.mongodb.net:27017/?ssl=true&replicaSet=atlas-uaw7ad-shard-0&authSource=admin&appName=Cluster0")
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));

// Protected Route
app.get("/api/protected", (req, res) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({ message: "No token" });
    }

    const token = authHeader.split(" ")[1];

    const verified = jwt.verify(token, "secretkey");

    res.json({
      message: "Protected data accessed",
      user: verified,
    });

  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});

// Server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
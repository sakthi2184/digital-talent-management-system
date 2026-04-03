import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// MIDDLEWARE — verify token
export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// MIDDLEWARE — admin only
export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin access required" });
  next();
};

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: "User already exists" });
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ name, email: email.toLowerCase(), password: hashed });
    res.json({ message: "Registered successfully" });
  } catch {
    res.status(500).json({ message: "Registration error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch {
    res.status(500).json({ message: "Login error" });
  }
});

// GET ALL USERS
router.get("/users", protect, async (req, res) => {
  try {
    const users = await User.find().select("name email role");
    res.json(users);
  } catch {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// GET MY PROFILE
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch {
    res.status(500).json({ message: "Error fetching profile" });
  }
});

// UPDATE MY PROFILE
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, password } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (password) updates.password = await bcrypt.hash(password, 10);
    const updated = await User.findByIdAndUpdate(
      req.user.id, updates, { new: true }
    ).select("-password");
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Error updating profile" });
  }
});

// ADMIN — get all users with full info
router.get("/admin/users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// ADMIN — change user role
router.put("/admin/users/:id/role", protect, adminOnly, async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    ).select("-password");
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Error updating role" });
  }
});

// GET USER PERFORMANCE — tasks per user
router.get("/admin/performance", protect, adminOnly, async (req, res) => {
  try {
    const Task = (await import("../models/Task.js")).default;
    const users = await User.find().select("name email role");
    const tasks = await Task.find().populate("assignedTo", "name");

    const performance = users.map(u => {
      const userTasks = tasks.filter(t => t.assignedTo?._id.toString() === u._id.toString());
      return {
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        total: userTasks.length,
        completed: userTasks.filter(t => t.status === "Completed").length,
        inProgress: userTasks.filter(t => t.status === "In Progress").length,
        pending: userTasks.filter(t => t.status === "Pending").length,
      };
    });

    res.json(performance);
  } catch (err) {
    res.status(500).json({ message: "Error fetching performance" });
  }
});

export default router;
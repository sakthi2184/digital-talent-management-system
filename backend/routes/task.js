import express from "express";
import Task from "../models/Task.js";
import { protect, adminOnly } from "./auth.js";

const router = express.Router();

// GET ALL TASKS — all logged in users
router.get("/all", protect, async (req, res) => {
  try {
    const tasks = await Task.find().populate("assignedTo", "name email");
    res.json(tasks);
  } catch {
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// CREATE TASK — admin only
router.post("/add", protect, adminOnly, async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.json(task);
  } catch {
    res.status(500).json({ message: "Error creating task" });
  }
});

// UPDATE TASK — admin only
router.put("/update/:id", protect, adminOnly, async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    );
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Error updating task" });
  }
});

// DELETE TASK — admin only
router.delete("/delete/:id", protect, adminOnly, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch {
    res.status(500).json({ message: "Error deleting task" });
  }
});

export default router;
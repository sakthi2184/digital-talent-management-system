import express from "express";
import Task from "../models/Task.js";
import { protect, adminOnly } from "./auth.js";

const router = express.Router();

// GET ALL TASKS — all logged in users
router.get("/all", protect, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name email")
      .populate("submittedBy", "name email");
    res.json(tasks);
  } catch {
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// GET MY TASKS — tasks assigned to logged in user
router.get("/my", protect, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id })
      .populate("assignedTo", "name email")
      .populate("submittedBy", "name email");
    res.json(tasks);
  } catch {
    res.status(500).json({ message: "Error fetching my tasks" });
  }
});

// GET PENDING APPROVAL TASKS — admin only
router.get("/pending-approval", protect, adminOnly, async (req, res) => {
  try {
    const tasks = await Task.find({ approvalStatus: "Pending Approval" })
      .populate("assignedTo", "name email")
      .populate("submittedBy", "name email");
    res.json(tasks);
  } catch {
    res.status(500).json({ message: "Error fetching pending tasks" });
  }
});

// CREATE TASK — admin only
router.post("/add", protect, adminOnly, async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      approvalStatus: "Approved"
    });
    res.json(task);
  } catch {
    res.status(500).json({ message: "Error creating task" });
  }
});

// USER SUBMIT TASK — any logged in user
router.post("/submit", protect, async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      submittedBy: req.user.id,
      approvalStatus: "Pending Approval",
      status: "Pending"
    });
    res.json(task);
  } catch {
    res.status(500).json({ message: "Error submitting task" });
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

// USER UPDATE STATUS — user can update status on their assigned task
router.put("/update-status/:id", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.assignedTo?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your task" });
    }

    task.status = req.body.status;
    await task.save();
    res.json(task);
  } catch {
    res.status(500).json({ message: "Error updating status" });
  }
});

// ADMIN APPROVE / REJECT TASK
router.put("/approve/:id", protect, adminOnly, async (req, res) => {
  try {
    const { approvalStatus } = req.body;
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { approvalStatus },
      { new: true }
    ).populate("submittedBy", "name email");
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Error updating approval" });
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
import express from "express";
import Task from "../models/Task.js";
import { protect, adminOnly } from "./auth.js";

const router = express.Router();

// GET ALL TASKS
router.get("/all", protect, async (req, res) => {
  try {
    const { search, sort, priority, status } = req.query;
    let query = {};

    if (search) query.title = { $regex: search, $options: "i" };
    if (priority && priority !== "All") query.priority = priority;
    if (status && status !== "All") query.status = status;

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "priority") sortOption = { priority: -1 };
    if (sort === "deadline") sortOption = { deadline: 1 };
    if (sort === "progress") sortOption = { progressPercent: -1 };

    const tasks = await Task.find(query)
      .sort(sortOption)
      .populate("assignedTo", "name email")
      .populate("submittedBy", "name email");
    res.json(tasks);
  } catch {
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// GET MY TASKS
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

// GET PENDING APPROVAL
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
      approvalStatus: "Approved",
      activityLog: [{ action: "Task created", by: req.body.createdByName || "Admin" }]
    });
    res.json(task);
  } catch {
    res.status(500).json({ message: "Error creating task" });
  }
});

// USER SUBMIT TASK
router.post("/submit", protect, async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      submittedBy: req.user.id,
      approvalStatus: "Pending Approval",
      status: "Pending",
      activityLog: [{ action: "Task submitted for approval", by: req.body.submittedByName || "User" }]
    });
    res.json(task);
  } catch {
    res.status(500).json({ message: "Error submitting task" });
  }
});

// UPDATE TASK — admin only
router.put("/update/:id", protect, adminOnly, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const logEntries = [];
    if (req.body.status && req.body.status !== task.status) {
      logEntries.push({ action: `Status changed to ${req.body.status}`, by: "Admin" });
      if (req.body.status === "Completed") req.body.progressPercent = 100;
      if (req.body.status === "In Progress" && task.progressPercent === 0) req.body.progressPercent = 25;
    }
    if (req.body.progressPercent !== undefined && req.body.progressPercent !== task.progressPercent) {
      logEntries.push({ action: `Progress updated to ${req.body.progressPercent}%`, by: "Admin" });
    }

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        $push: { activityLog: { $each: logEntries } }
      },
      { new: true }
    ).populate("assignedTo", "name email").populate("submittedBy", "name email");

    res.json(updated);
  } catch {
    res.status(500).json({ message: "Error updating task" });
  }
});

// USER UPDATE STATUS
router.put("/update-status/:id", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.assignedTo?.toString() !== req.user.id)
      return res.status(403).json({ message: "Not your task" });

    const logEntry = { action: `Status changed to ${req.body.status}`, by: "User" };
    let progressUpdate = {};
    if (req.body.status === "Completed") progressUpdate.progressPercent = 100;
    if (req.body.status === "In Progress" && task.progressPercent === 0) progressUpdate.progressPercent = 50;
    if (req.body.status === "Pending") progressUpdate.progressPercent = 0;

    task.status = req.body.status;
    Object.assign(task, progressUpdate);
    task.activityLog.push(logEntry);
    await task.save();
    res.json(task);
  } catch {
    res.status(500).json({ message: "Error updating status" });
  }
});

// ADMIN APPROVE / REJECT
router.put("/approve/:id", protect, adminOnly, async (req, res) => {
  try {
    const { approvalStatus } = req.body;
    const logEntry = { action: `Task ${approvalStatus}`, by: "Admin" };
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { approvalStatus, $push: { activityLog: logEntry } },
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
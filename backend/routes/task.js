import express from "express";
import Task from "../models/Task.js";

const router = express.Router();

// GET ALL TASKS
router.get("/all", async (req, res) => {
  try {
    const tasks = await Task.find().populate("assignedTo", "name email");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// CREATE TASK
router.post("/add", async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Error creating task" });
  }
});

// UPDATE TASK
router.put("/update/:id", async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating task" });
  }
});

// DELETE TASK
router.delete("/delete/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting task" });
  }
});

export default router;
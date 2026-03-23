import express from "express";
import Task from "../models/Task.js";

const router = express.Router();

// CREATE
router.post("/add", async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Error creating task" });
  }
});

// GET ALL
router.get("/all", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch {
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// UPDATE
router.put("/update/:id", async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Error updating task" });
  }
});

// DELETE
router.delete("/delete/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch {
    res.status(500).json({ message: "Error deleting task" });
  }
});

export default router;
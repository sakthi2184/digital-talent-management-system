import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  action: { type: String },
  by: { type: String },
  at: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "Pending"
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium"
  },
  approvalStatus: {
    type: String,
    enum: ["Approved", "Pending Approval", "Rejected"],
    default: "Approved"
  },
  progressPercent: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  activityLog: [activitySchema],
  deadline: { type: Date }
}, { timestamps: true });

export default mongoose.model("Task", taskSchema);
import mongoose from "mongoose";

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
  deadline: { type: Date }
}, { timestamps: true });

export default mongoose.model("Task", taskSchema);
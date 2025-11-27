import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  status: { type: String, enum: ["pending", "completed"], default: "pending" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);

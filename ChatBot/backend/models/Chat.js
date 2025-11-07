import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: String,       
      required: true
    },
    message: {
      type: String,
      required: true
    },
    mood: {
      type: String,       
      default: "neutral"
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);

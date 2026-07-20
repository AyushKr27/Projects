import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true
    },

    // 🔐 OWNER OF THIS MESSAGE
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    role: {
      type: String,
      enum: ["user", "bot", "system"],
      required: true
    },

    text: {
      type: String,
      required: true
    },

    corrected: String,

    mood: {
      type: String,
      default: "neutral"
    },

    moodScore: {
      type: Number,
      default: 0
    },

    intent: {
      type: String,
      default: "unknown"
    },

    intentScore: {
      type: Number,
      default: 0
    },

    autocorrectEdits: {
      type: [Object],
      default: []
    },

    grammarMatches: {
      type: [Object],
      default: []
    },

    entities: {
      type: [Object],
      default: []
    },

    meta: {
      type: Object,
      default: {}
    },

    summary: {
      type: String,
      default: ""
    },

    latest: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

/**
 * 🔥 INDEXES FOR PRIVACY + PERFORMANCE
 */
chatSchema.index({ user: 1, sessionId: 1, createdAt: -1 });
chatSchema.index({ sessionId: 1, createdAt: 1 });

/**
 * Mark only one message as latest per session
 */
chatSchema.post("save", async function (doc) {
  try {
    await mongoose.model("Chat").updateMany(
      {
        sessionId: doc.sessionId,
        user: doc.user,
        _id: { $ne: doc._id }
      },
      { $set: { latest: false } }
    );
  } catch (e) {
    console.warn("Error marking latest message:", e.message);
  }
});

/**
 * Auto summary
 */
chatSchema.pre("save", function (next) {
  if (!this.summary && this.text) {
    this.summary = this.text.slice(0, 120);
  }
  next();
});

export default mongoose.model("Chat", chatSchema);

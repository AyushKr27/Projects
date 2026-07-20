// src/routes/conversationRoutes.js
import express from "express";
import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET all conversations for logged-in user
 */
router.get("/", protect, async (req, res) => {
  try {
    const limit = Math.max(
      1,
      Math.min(200, parseInt(req.query.limit || "50", 10))
    );

    // ✅ CORRECT USER ID
    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    const pipeline = [
      { $match: { user: userObjectId } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$sessionId",
          lastMessage: { $first: "$text" },
          lastCreatedAt: { $first: "$createdAt" },
          messageCount: { $sum: 1 },
        },
      },
      { $sort: { lastCreatedAt: -1 } },
      { $limit: limit },
      {
        $project: {
          id: "$_id",
          sessionId: "$_id",
          title: "$lastMessage",
          lastMessage: 1,
          lastCreatedAt: 1,
          messageCount: 1,
        },
      },
    ];

    const rows = await Chat.aggregate(pipeline);
    res.json(rows);
  } catch (err) {
    console.error("conversations list error", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET messages of a conversation
 */
router.get("/:id", protect, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    const messages = await Chat.find({
      sessionId,
      user: userObjectId,
    })
      .sort({ createdAt: 1 })
      .lean();

    if (!messages.length) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    res.json({ sessionId, messages });
  } catch (err) {
    console.error("conversation fetch error", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET mood of a conversation
 */
router.get("/:id/mood", protect, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    const rows = await Chat.find({
      sessionId,
      user: userObjectId,
    })
      .select("mood moodScore")
      .lean();

    if (!rows.length) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const counts = {};
    let scoreSum = 0;

    for (const r of rows) {
      const mood = r.mood || "neutral";
      counts[mood] = (counts[mood] || 0) + 1;
      scoreSum += r.moodScore || 0;
    }

    const topMood = Object.keys(counts).sort(
      (a, b) => counts[b] - counts[a]
    )[0];

    res.json({
      mood: topMood,
      score: scoreSum / rows.length,
      totalMessages: rows.length,
    });
  } catch (err) {
    console.error("conversation mood error", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;

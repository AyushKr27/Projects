import express from "express";
import Chat from "../models/Chat.js";
import { analyzeText } from "../services/nluService.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * POST /api/chat
 * Save user message (PRIVATE)
 */
router.post("/", protect, async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "message required"
      });
    }

    const analysis = await analyzeText(message);

    const chat = await Chat.create({
      sessionId: sessionId || null,
      user: req.userId, // 🔐 from JWT
      role: "user",
      text: analysis.original,
      corrected: analysis.corrected,
      mood: analysis.emotion.label,
      moodScore: analysis.emotion.score,
      intent: analysis.intent.label,
      intentScore: analysis.intent.score,
      autocorrectEdits: analysis.autocorrectEdits,
      grammarMatches: analysis.grammarMatches,
      entities: analysis.entities,
      meta: { nlu: analysis }
    });

    res.status(201).json({
      success: true,
      chat,
      analysis
    });
  } catch (err) {
    console.error("POST /api/chat error", err);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

/**
 * ✅ POST /api/chat/grammar
 * Apply grammar + spell correction ONLY (NO DB SAVE)
 */
router.post("/grammar", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: "text required"
      });
    }

    const analysis = await analyzeText(text);

    res.json({
      success: true,
      corrected: analysis.corrected,
      autocorrectEdits: analysis.autocorrectEdits,
      grammarMatches: analysis.grammarMatches
    });
  } catch (err) {
    console.error("POST /api/chat/grammar error", err);
    res.status(500).json({
      success: false,
      error: "Grammar check failed"
    });
  }
});

/**
 * GET /api/chat
 * Fetch ONLY logged-in user's messages (DEBUG / ADMIN)
 */
router.get("/", protect, async (req, res) => {
  try {
    const limit = Math.min(200, Number(req.query.limit) || 100);

    const chats = await Chat.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      chats
    });
  } catch (err) {
    console.error("GET /api/chat error", err);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

export default router;

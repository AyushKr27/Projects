import express from 'express';
import Chat from '../models/Chat.js';
import { analyzeText } from '../services/nluService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { user = 'anon', message } = req.body;
    if (!message) return res.status(400).json({ success: false, error: 'message required' });

    const analysis = await analyzeText(message);

    const chat = await Chat.create({
      sessionId: req.body.sessionId || null,
      user,
      role: 'user',
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

    res.status(201).json({ success: true, chat, analysis });
  } catch (err) {
    console.error('POST /api/chat error', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const limit = Math.min(200, Number(req.query.limit) || 100);
    const chats = await Chat.find().sort({ createdAt: -1 }).limit(limit).lean();
    res.json({ success: true, chats });
  } catch (err) {
    console.error('GET /api/chat error', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

import express from 'express';
import Chat from '../models/Chat.js';
const router = express.Router();

router.get('/sessions', async (req, res) => {
  try {
    const sessions = await Chat.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$sessionId',
          createdAt: { $first: '$createdAt' },
          latestText: { $first: '$text' }
        }
      },
      { $project: { id: '$_id', _id: 0, createdAt: 1, latestText: 1 } },
      { $sort: { createdAt: -1 } },
      { $limit: 200 }
    ]);
    res.json({ sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/sessions/:id/messages', async (req, res) => {
  try {
    const sid = req.params.id;
    const messages = await Chat.find({ sessionId: sid }).sort({ createdAt: 1 }).lean();
    res.json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/sessions', async (req, res) => {
  try {
    const sessionId = req.body.id || `sess-${Date.now()}`;
    await Chat.create({
      sessionId,
      user: req.body.userId || 'system',
      role: 'system',
      text: 'Conversation started',
      createdAt: new Date()
    });
    res.status(201).json({ session: { id: sessionId, createdAt: new Date() } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/sessions/:id', async (req, res) => {
  try {
    const sid = req.params.id;
    await Chat.deleteMany({ sessionId: sid });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

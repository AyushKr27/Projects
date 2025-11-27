import express from 'express';
import Chat from '../models/Chat.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const limit = Math.max(1, Math.min(200, parseInt(req.query.limit || '50', 10)));
    const userFilter = req.query.user ? String(req.query.user).trim() : null;

    const matchStage = {};
    if (userFilter) matchStage.user = userFilter;

    const pipeline = [];

    if (Object.keys(matchStage).length) pipeline.push({ $match: matchStage });

    pipeline.push(
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$sessionId',
          lastMessage: { $first: '$text' },
          lastRole: { $first: '$role' },
          lastCreatedAt: { $first: '$createdAt' },
          user: { $first: '$user' },
          messageCount: { $sum: 1 },
          lastUserMessage: { $first: { $cond: [{ $eq: ['$role', 'user'] }, '$text', null] } }
        }
      },
      ...(q ? [{ $match: { lastMessage: { $regex: q, $options: 'i' } } }] : []),
      { $sort: { lastCreatedAt: -1 } },
      { $limit: limit },
      {
        $project: {
          id: '$_id',
          sessionId: '$_id',
          title: '$lastMessage',
          lastMessage: 1,
          lastRole: 1,
          lastCreatedAt: 1,
          user: 1,
          messageCount: 1,
          lastUserMessage: 1
        }
      }
    );

    const rows = await Chat.aggregate(pipeline).exec();
    res.json(rows);
  } catch (err) {
    console.error('conversations list error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const sid = req.params.id;
    const skip = Math.max(0, parseInt(req.query.skip || '0', 10));
    const limit = Math.max(1, Math.min(1000, parseInt(req.query.limit || '1000', 10)));

    const rows = await Chat.find({ sessionId: sid })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Conversation not found' });

    res.json({ sessionId: sid, messages: rows });
  } catch (err) {
    console.error('conversation fetch error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id/mood', async (req, res) => {
  try {
    const sid = req.params.id;
    const rows = await Chat.find({ sessionId: sid }).select('mood moodScore').lean().exec();
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Conversation not found' });

    const counts = {};
    let scoreSum = 0;
    for (const r of rows) {
      const m = r.mood || 'neutral';
      counts[m] = (counts[m] || 0) + 1;
      scoreSum += (r.moodScore || 0);
    }

    let topMood = 'neutral';
    let topCount = 0;
    for (const k of Object.keys(counts)) {
      if (counts[k] > topCount) {
        topMood = k;
        topCount = counts[k];
      }
    }

    const avgScore = rows.length ? scoreSum / rows.length : 0;
    res.json({ mood: topMood, score: avgScore, totalMessages: rows.length });
  } catch (err) {
    console.error('conversation mood error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

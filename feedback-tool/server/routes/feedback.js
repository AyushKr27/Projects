import express from 'express';
import Feedback from '../models/Feedback.js';
import { verifyToken } from '../middleware/verifyToken.js';

export default (io) => {
  const router = express.Router();

  router.post('/', async (req, res) => {
    try {
      const { name, email, feedback, rating } = req.body;
      if (!name || !email || !feedback || !rating) {
        return res.status(400).json({ message: 'All fields are required.' });
      }

      const fb = new Feedback({ name, email, feedback, rating });
      await fb.save();
      io.emit('new-feedback', fb);
      res.status(201).json(fb);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/', verifyToken, async (req, res) => {
    try {
      const { sortBy, filterRating } = req.query;
      let query = {};
      if (filterRating) query.rating = filterRating;

      let feedbacks = await Feedback.find(query);

      if (sortBy === 'rating') {
        feedbacks.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === 'date') {
        feedbacks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      res.json(feedbacks);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/stats', verifyToken, async (req, res) => {
    try {
      const feedbacks = await Feedback.find();
      const total = feedbacks.length;
      const average =
        total > 0 ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / total).toFixed(2) : 0;

      res.json({ total, average });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


  router.delete('/', verifyToken, async (req, res) => {
    try {
      await Feedback.deleteMany({});
      io.emit('feedback-cleared'); 
      res.status(200).json({ message: 'All feedbacks deleted successfully.' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};

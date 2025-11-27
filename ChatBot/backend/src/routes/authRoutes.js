import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

const router = express.Router();

const createToken = (user) => {
  const secret = process.env.JWT_SECRET || 'supersecretkey';
  return jwt.sign(
    { id: String(user._id), email: user.email },
    secret,
    { expiresIn: '7d' }
  );
};

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ message: 'User already exists' });

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password
    });

    const token = createToken(user);
    const safeUser = { id: user._id, name: user.name, email: user.email };

    res.status(201).json({ token, user: safeUser });
  } catch (err) {
    console.error('signup error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select('+password').exec();
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = typeof user.matchPassword === 'function'
      ? await user.matchPassword(password)
      : await bcrypt.compare(password, user.password || '');

    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = createToken(user);
    const safeUser = { id: user._id, name: user.name, email: user.email };

    res.status(200).json({ token, user: safeUser });
  } catch (err) {
    console.error('login error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

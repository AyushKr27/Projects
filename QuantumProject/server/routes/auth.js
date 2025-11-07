const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

const genToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

router.post('/register', asyncHandler(async (req, res) => {
  const { name, dob, email, password } = req.body;
  if (!name || !dob || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, date of birth, email and password');
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    dob,
    email: email.toLowerCase(),
    password: hashed
  });

  if (user) {
    const token = genToken(user._id);
    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        dob: user.dob,
        email: user.email
      },
      token
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const token = genToken(user._id);
  res.json({
    user: {
      id: user._id,
      name: user.name,
      dob: user.dob,
      email: user.email
    },
    token
  });
}));

router.get('/me', auth, asyncHandler(async (req, res) => {
  res.json({ user: req.user });
}));

module.exports = router;

import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "1d" });

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "Email already registered" });
  const user = await User.create({ name, email, password, role });
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id)
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.comparePassword(password))) {
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  }
  res.status(401).json({ message: "Invalid credentials" });
};

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json(user);
};

import express from "express";
import Seller from "../models/Seller.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = express.Router();

// Register seller
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, shopName } = req.body;
    const exists = await Seller.findOne({ email });
    if (exists) return res.status(400).json({ message: "Seller already exists" });

    const seller = await Seller.create({ name, email, password, shopName });
    const token = seller.getSignedToken();
    res.json({ success: true, token, seller });
  } catch (err) {
    res.status(500).json({ message: "Error registering seller", error: err.message });
  }
});

// Login seller
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const seller = await Seller.findOne({ email });
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    const isMatch = await seller.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = seller.getSignedToken();
    res.json({ success: true, token, seller });
  } catch (err) {
    res.status(500).json({ message: "Error logging in seller" });
  }
});

export default router;

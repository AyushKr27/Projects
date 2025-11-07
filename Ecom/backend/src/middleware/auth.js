import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Seller from "../models/Seller.js";

// 🧠 Protect middleware (works for both users & sellers)
export const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  try {
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 1️⃣ Try normal user
    const user = await User.findById(decoded.id).select("-password");
    if (user) {
      req.user = user;
      if (user.role === "seller") req.seller = user; // in case sellers are stored in User too
      return next();
    }

    // 2️⃣ Try seller (separate collection)
    const seller = await Seller.findById(decoded.id).select("-password");
    if (seller) {
      req.seller = seller;
      return next();
    }

    return res.status(401).json({ message: "User or Seller not found" });
  } catch (err) {
    console.error("❌ Auth error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// 👑 Admin only
export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  return res.status(403).json({ message: "Admin only" });
};

// 🏪 Seller only
export const seller = (req, res, next) => {
  if (req.seller || (req.user && ["seller", "admin"].includes(req.user.role))) {
    return next();
  }
  return res.status(403).json({ message: "Seller only" });
};

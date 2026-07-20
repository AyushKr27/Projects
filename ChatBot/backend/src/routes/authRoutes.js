import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import RefreshToken from "../models/RefreshToken.js";
import User from "../models/User.js";

const router = express.Router();

const ACCESS_SECRET =
  process.env.ACCESS_TOKEN_SECRET ||
  process.env.JWT_SECRET ||
  "verysecret_access";

const REFRESH_SECRET =
  process.env.REFRESH_TOKEN_SECRET ||
  "verysecret_refresh";

const ACCESS_EXP = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_EXP = process.env.REFRESH_TOKEN_EXPIRY || "7d";
const REFRESH_COOKIE_NAME = "refresh_token";

/* ================= HELPERS ================= */

function signAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXP });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXP });
}

function msFromExpiry(exp) {
  if (!exp) return 7 * 24 * 60 * 60 * 1000;
  const unit = exp.slice(-1);
  const val = parseInt(exp.slice(0, -1), 10);
  if (Number.isNaN(val)) return parseInt(exp) || 7 * 24 * 60 * 60 * 1000;
  if (unit === "m") return val * 60 * 1000;
  if (unit === "h") return val * 60 * 60 * 1000;
  if (unit === "d") return val * 24 * 60 * 60 * 1000;
  return val;
}

function cookieOptions(isProd = false) {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/api/auth/refresh",
    maxAge: msFromExpiry(REFRESH_EXP)
  };
}

/* ================= SIGNUP ================= */

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ message: "User already exists" });

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password
    });

    const userId = user._id.toString();

    const accessToken = signAccessToken({ id: userId });
    const refreshToken = signRefreshToken({ id: userId });

    await RefreshToken.create({
      token: refreshToken,
      userId,
      expiresAt: new Date(Date.now() + msFromExpiry(REFRESH_EXP))
    });

    res.cookie(
      REFRESH_COOKIE_NAME,
      refreshToken,
      cookieOptions(process.env.NODE_ENV === "production")
    );

    return res.status(201).json({
      accessToken,
      user: { id: userId, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("signup error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/* ================= LOGIN ================= */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail })
      .select("+password");

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = user.matchPassword
      ? await user.matchPassword(password)
      : await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const userId = user._id.toString();

    const accessToken = signAccessToken({ id: userId });
    const refreshToken = signRefreshToken({ id: userId });

    await RefreshToken.create({
      token: refreshToken,
      userId,
      expiresAt: new Date(Date.now() + msFromExpiry(REFRESH_EXP))
    });

    res.cookie(
      REFRESH_COOKIE_NAME,
      refreshToken,
      cookieOptions(process.env.NODE_ENV === "production")
    );

    return res.json({
      accessToken,
      user: { id: userId, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("login error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/* ================= REFRESH ================= */

router.post("/refresh", async (req, res) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!token) return res.status(401).json({ error: "no refresh token" });

    const stored = await RefreshToken.findOne({ token });
    if (!stored) {
      res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth/refresh" });
      return res.status(401).json({ error: "invalid refresh token" });
    }

    const payload = jwt.verify(token, REFRESH_SECRET);
    const userId = payload.id;

    await RefreshToken.deleteOne({ token });

    const newRefresh = signRefreshToken({ id: userId });
    await RefreshToken.create({
      token: newRefresh,
      userId,
      expiresAt: new Date(Date.now() + msFromExpiry(REFRESH_EXP))
    });

    const newAccess = signAccessToken({ id: userId });

    res.cookie(
      REFRESH_COOKIE_NAME,
      newRefresh,
      cookieOptions(process.env.NODE_ENV === "production")
    );

    return res.json({ accessToken: newAccess });
  } catch (err) {
    console.error("refresh error", err);
    return res.status(401).json({ error: "invalid or expired refresh token" });
  }
});

/* ================= LOGOUT ================= */

router.post("/logout", async (req, res) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (token) await RefreshToken.deleteOne({ token });
    res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth/refresh" });
    return res.json({ ok: true });
  } catch (err) {
    console.error("logout error", err);
    return res.status(500).json({ error: "internal error" });
  }
});

/* ================= ME ================= */

router.get("/me", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "no token" });
    }

    const token = auth.split(" ")[1];
    const payload = jwt.verify(token, ACCESS_SECRET);
    const user = await User.findById(payload.id)
      .select("_id name email")
      .lean();

    if (!user) return res.status(404).json({ error: "user not found" });

    return res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email
    });
  } catch (err) {
    return res.status(401).json({ error: "invalid or expired token" });
  }
});

export default router;

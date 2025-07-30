// server.js

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { createServer } from "http";

// Import custom modules
import socketSetup from "./socket/socket.js";
import authRoutes from "./routes/auth.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import DocumentRoutes from "./routes/documents.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import pollRoutes from "./routes/poll.routes.js";
import summaryRoutes from "./routes/summary.routes.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// CORS Configuration
app.use(cors({
  origin: [
    process.env.CLIENT_URL, // Make sure this is set correctly in .env
    "https://mentra-r0yielge3-ayushkr27s-projects.vercel.app" // No trailing slash!
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => res.send("Server is running! :)"));

// Debug route (optional)
app.get("/cors-test", (req, res) => {
  res.json({ origin: req.headers.origin });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/docs", DocumentRoutes);
app.use("/api/poll", pollRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// WebSocket setup
socketSetup(server);

// MongoDB + Server Initialization
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    const PORT = process.env.PORT || 10000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log("🔌 WebSocket initialized");
    });
  })
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err);
  });

// src/index.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import config from "./config/config.js";
import socketHandler from "./sockets/socketHandler.js";
import logger from "./utils/logger.js";

import chatRoutes from "./routes/Chatroutes.js";
import authRoutes from "./routes/authRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import chatSessionsRoutes from "./routes/chatSessionsRoutes.js";

import { protect, socketAuth } from "./middleware/authMiddleware.js";

const app = express();

/* ------------------ SECURITY ------------------ */
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

const allowedOrigin =
  process.env.CORS_ORIGIN ||
  config.corsOrigin ||
  "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

app.use(morgan(process.env.MORGAN_FORMAT || "dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

/* ------------------ HEALTH ------------------ */
app.get("/health", (req, res) =>
  res.json({ ok: true, status: "Server running 🚀" })
);

/* ------------------ ROUTES ------------------ */
app.use("/api/auth", authRoutes);
app.use("/api/chat", protect, chatRoutes);
app.use("/api/conversations", protect, conversationRoutes);
app.use("/api/chat-sessions", protect, chatSessionsRoutes);

/* ------------------ SERVER ------------------ */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    credentials: true,
  },
});

/* 🔐 APPLY SOCKET AUTH (THIS WAS MISSING) */
socketAuth(io);

/* ------------------ DB ------------------ */
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/chatbot";

export async function start() {
  console.log("🚀 Starting backend server...");

  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected successfully.");

    io.on("connection", (socket) => {
      logger.info("Socket connected", {
        id: socket.id,
        userId: socket.userId, // 🔥 now always present
      });

      socketHandler(io, socket);
    });

    server.listen(config.port, () => {
      console.log(`✅ Server ready at http://localhost:${config.port}`);
      console.log(`🌐 CORS Origin: ${allowedOrigin}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);

    server.listen(config.port, () => {
      console.log(
        `⚠️ Server running without Mongo at http://localhost:${config.port}`
      );
    });
  }
}

/* ------------------ SHUTDOWN ------------------ */
export async function shutdown(signal) {
  try {
    console.log(`\n🧹 Shutting down due to ${signal}...`);

    if (io) io.close();
    if (server) server.close();

    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log("✅ MongoDB disconnected.");
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Error during shutdown:", err.message);
    process.exit(1);
  }
}

process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
  shutdown("uncaughtException");
});

process.on("unhandledRejection", (reason) => {
  console.error("💥 Unhandled Rejection:", reason);
  shutdown("unhandledRejection");
});

if (process.env.NODE_ENV !== "test") {
  console.log("🟢 NODE_ENV =", process.env.NODE_ENV);
  start();
}

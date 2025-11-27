import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";

import config from "./config/config.js";
import socketHandler from "./sockets/socketHandler.js";
import logger from "./utils/logger.js";
import chatRoutes from "./routes/chatRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import chatSessionsRoutes from "./routes/chatSessionsRoutes.js";

const app = express();

app.use(
    helmet({
        crossOriginResourcePolicy: false,
    })
);

const allowedOrigin =
    process.env.CORS_ORIGIN || config.corsOrigin || "http://localhost:5173";

app.use(
    cors({
        origin: allowedOrigin,
        credentials: true,
    })
);

app.use(morgan(process.env.MORGAN_FORMAT || "dev"));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.get("/health", (req, res) => res.json({ ok: true, status: "Server running 🚀" }));

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/chat-sessions", chatSessionsRoutes);

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: allowedOrigin,
        credentials: true,
    },
});

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/chatbot";

export async function start() {
    console.log("🚀 Starting backend server...");

    try {
        mongoose.set("strictQuery", false);
        await mongoose.connect(MONGO_URI);
        console.log("✅ MongoDB connected successfully.");

        io.on("connection", (socket) => {
            logger.info("Socket connected", { id: socket.id });
            socketHandler(io, socket);
        });

        server.listen(config.port, () => {
            console.log(`✅ Server ready at http://localhost:${config.port}`);
            console.log(`🌐 CORS Origin: ${allowedOrigin}`);
        });
    } catch (err) {
        console.error("❌ MongoDB connection error:", err.message);

        console.warn("⚠️ Starting server without MongoDB connection...");
        io.on("connection", (socket) => {
            logger.info("Socket connected (no Mongo)", { id: socket.id });
            socketHandler(io, socket);
        });

        server.listen(config.port, () => {
            console.log(
                `⚠️ Server running without Mongo at http://localhost:${config.port}`
            );
        });
    }
}

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

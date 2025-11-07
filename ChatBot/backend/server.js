import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import Chat from "./models/Chat.js";
import { detectMood } from "./utils/moodDetector.js";
import router from "./routes/Chatroutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "DELETE"],
  },
});

app.use(cors());
app.use(express.json());

app.use("/api/chat", router);

app.get("/", (req, res) => {
  res.send("Chatbot backend is running 🚀");
});

app.delete("/api/chat/clear", async (req, res) => {
  try {
    await Chat.deleteMany({});
    io.emit("clear_chat");
    res.status(200).json({ message: "Chat cleared successfully" });
  } catch (err) {
    console.error("❌ Error clearing chat:", err.message);
    res.status(500).json({ message: "Failed to clear chat" });
  }
});

io.on("connection", async (socket) => {
  console.log(new Date().toISOString(), "✅ User connected:", socket.id);

  try {
    const recentChats = await Chat.find().sort({ createdAt: -1 }).limit(50);
    socket.emit("chat_history", recentChats.reverse());
  } catch (err) {
    console.error("❌ Error fetching chat history:", err.message);
  }

  socket.on("send_message", async (data) => {
    try {
      if (!data.message || typeof data.message !== "string") return;

      const userMood = await detectMood(data.message);

      const userChat = new Chat({
        user: data.user || "User",
        message: data.message,
        mood: userMood,
      });
      await userChat.save();

      io.emit("receive_message", {
        ...data,
        mood: userMood,
        createdAt: userChat.createdAt,
        _id: userChat._id,
      });

      console.log(`💬 User message saved: ${data.message} | Mood: ${userMood}`);

      let botReply = "I'm here to chat!";
      let botMood = "neutral";

      const msgLower = data.message.toLowerCase();
      if (msgLower.includes("happy") || msgLower.includes("promotion") || msgLower.includes("good")) {
        botReply = "That's wonderful! 🎉";
        botMood = "happy";
      } else if (msgLower.includes("sad") || msgLower.includes("unhappy") || msgLower.includes("bad")) {
        botReply = "I'm sorry to hear that 😢";
        botMood = "sad";
      } else if (msgLower.includes("hate") || msgLower.includes("angry")) {
        botReply = "Let's try to stay calm 😠";
        botMood = "angry";
      } else if (msgLower.includes("surprise") || msgLower.includes("wow") || msgLower.includes("amazing")) {
        botReply = "Wow! That's exciting 😲";
        botMood = "surprise";
      }

      const botChat = new Chat({
        user: "Bot",
        message: botReply,
        mood: botMood,
      });
      await botChat.save();

      io.emit("receive_message", {
        user: "Bot",
        message: botReply,
        mood: botMood,
        createdAt: botChat.createdAt,
        _id: botChat._id,
      });

      console.log(`🤖 Bot replied: ${botReply} | Mood: ${botMood}`);
    } catch (err) {
      console.error("❌ Error processing message:", err.message);
    }
  });

  socket.on("typing", async (data) => {
    try {
      if (!data.text || typeof data.text !== "string") return;

      const mood = await detectMood(data.text);
      socket.broadcast.emit("user_typing", { user: data.user || "User", mood });
    } catch (err) {
      console.error("❌ Error in typing event:", err.message);
    }
  });

  socket.on("disconnect", () =>
    console.log(new Date().toISOString(), "❎ User disconnected:", socket.id)
  );
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    server.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

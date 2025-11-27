import Chat from "../../models/Chat.js";
import { analyzeText } from "../services/nluService.js";
import { generateBotReply } from "../utils/botReply.js";

export const saveMessage = async (req, res) => {
  try {
    const { user, message } = req.body;
    if (!message || !user) {
      return res.status(400).json({ success: false, error: "Missing user or message" });
    }

    const analysis = await analyzeText(message);
    const botReply = generateBotReply ? generateBotReply(analysis) : null;

    const chat = new Chat({
      user,
      message: analysis.original,
      corrected: analysis.corrected,
      mood: analysis.emotion.label,
      moodScore: analysis.emotion.score,
      intent: analysis.intent.label,
      intentScore: analysis.intent.score,
      autocorrectEdits: analysis.autocorrectEdits,
      grammarMatches: analysis.grammarMatches,
      entities: analysis.entities,
      botReply
    });

    await chat.save();

    res.status(201).json({
      success: true,
      chat,
      analysis,
      botReply
    });
  } catch (error) {
    console.error("Error saving chat message:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const chats = await Chat.find().sort({ createdAt: 1 });
    res.status(200).json({ success: true, chats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

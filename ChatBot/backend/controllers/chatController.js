import Chat from "../models/Chat.js";
import { detectMood } from "../utils/moodDetector.js";

export const saveMessage = async (req, res) => {
  try {
    const { user, message } = req.body;
    const mood = await detectMood(message);

    const chat = new Chat({ user, message, mood });
    await chat.save();

    res.status(201).json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const chats = await Chat.find().sort({ createdAt: 1 });
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

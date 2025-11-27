import { grammarCheck } from "../utils/grammarCheck.js";
import { detectEmotion } from "../utils/emotionDetect.js";
import { summarizeText } from "../utils/summarizer.js";
import axios from "axios";

export const handleChat = async (req, res) => {
  try {
    const { message } = req.body;

    // Generate AI response (using Hugging Face Inference API or Cohere)
    const aiResponse = await axios.post(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
      { inputs: message },
      { headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` } }
    );

    const botText =
      aiResponse.data?.generated_text ||
      "I'm sorry, I couldn’t generate a response right now.";

    // Process NLP tasks
    const grammar = await grammarCheck(message);
    const emotion = detectEmotion(message);
    const summary = await summarizeText(message);

    res.json({
      response: botText,
      grammar,
      emotion,
      summary,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

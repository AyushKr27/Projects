import axios from "axios";

export async function summarizeText(text) {
  if (text.split(" ").length < 20) return "Too short for summarization.";

  try {
    const res = await axios.post(
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      { inputs: text },
      { headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` } }
    );
    return res.data[0].summary_text || "No summary available.";
  } catch (err) {
    return "⚠️ Summarization failed.";
  }
}

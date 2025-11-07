import axios from "axios";

const moodCache = new Map();

export async function detectMood(text) {
  if (!text || text.trim() === "") return "neutral";

  if (moodCache.has(text)) return moodCache.get(text);

  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base",
      { inputs: text },
      { headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` } }
    );

    const data = response.data;

    if (!data) return "neutral";

    let predictions = [];
    if (Array.isArray(data)) {
      if (data[0].label) predictions = data;
      else if (Array.isArray(data[0])) predictions = data[0];
    } else if (data.label) predictions = [data];

    if (!predictions.length) return "neutral";

    const top = predictions.reduce((prev, curr) =>
      curr.score > prev.score ? curr : prev
    );

    const labelRaw = top?.label || "neutral";
    const score = top?.score || 0;
    let label = labelRaw.toLowerCase();

    if (label.includes("joy") || label.includes("happiness") || label.includes("excite"))
      label = "excited";
    else if (label.includes("love") || label.includes("affection"))
      label = "love";
    else if (label.includes("sad") || label.includes("sorrow"))
      label = "sad";
    else if (label.includes("anger") || label.includes("annoy") || label.includes("hate"))
      label = "angry";
    else if (label.includes("fear") || label.includes("scared") || label.includes("nervous"))
      label = "nervous";
    else if (label.includes("surprise") || label.includes("shock"))
      label = "surprise";
    else if (label.includes("bored") || label.includes("indifferent"))
      label = "bored";
    else if (label.includes("tired") || label.includes("sleep"))
      label = "tired";
    else if (label.includes("confident") || label.includes("pride"))
      label = "confident";
    else if (label.includes("disgust") || label.includes("repuls"))
      label = "disgusted";
    else if (label.includes("hope") || label.includes("optimism"))
      label = "hopeful";
    else if (label.includes("relax") || label.includes("calm"))
      label = "relaxed";
    else
      label = "neutral";

    const mood = label;

    moodCache.set(text, mood);

    return mood;
  } catch (err) {
    console.error("Mood detection failed:", err.message);
    return "neutral";
  }
}

// src/services/translateService.js
import fetch from "node-fetch";
import logger from "../utils/logger.js";

export async function translateToEnglish(text) {
  if (!text) return { detectedLang: "en", translatedText: text };

  try {
    const res = await fetch("https://libretranslate.com/detect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text }),
    });

    const detections = await res.json();
    const detectedLang = detections?.[0]?.language || "en";

    if (detectedLang === "en") {
      return { detectedLang: "en", translatedText: text };
    }

    const trRes = await fetch("https://libretranslate.com/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: detectedLang,
        target: "en",
      }),
    });

    const trData = await trRes.json();
    const translatedText = trData?.translatedText || text;

    return { detectedLang, translatedText };
  } catch (err) {
    logger.warn("Translation detection failed", { err: err.message });
    return { detectedLang: "en", translatedText: text };
  }
}

export async function translateFromEnglish(text, targetLang = "en") {
  if (!text || targetLang === "en") return text;
  try {
    const res = await fetch("https://libretranslate.com/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: "en",
        target: targetLang,
      }),
    });
    const data = await res.json();
    return data?.translatedText || text;
  } catch (err) {
    logger.warn("Back translation failed", { err: err.message });
    return text;
  }
}

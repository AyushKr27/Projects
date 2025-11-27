export function detectEmotion(text) {
  const emotions = {
    happy: ["great", "awesome", "good", "fantastic", "love"],
    sad: ["sad", "bad", "unhappy", "terrible", "upset"],
    angry: ["angry", "mad", "furious", "annoyed"],
    neutral: []
  };

  let detected = "neutral";
  const lower = text.toLowerCase();

  for (const [emotion, words] of Object.entries(emotions)) {
    if (words.some((word) => lower.includes(word))) {
      detected = emotion;
      break;
    }
  }
  return detected;
}

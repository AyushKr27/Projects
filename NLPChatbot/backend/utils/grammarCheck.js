import axios from "axios";

export async function grammarCheck(text) {
  try {
    const res = await axios.post("https://api.languagetool.org/v2/check", {
      text,
      language: "en-US",
    });
    if (!res.data.matches.length)
      return "✅ No grammar issues found!";
    return "📝 Suggestion: " + res.data.matches[0].message;
  } catch (err) {
    return "⚠️ Grammar check failed.";
  }
}

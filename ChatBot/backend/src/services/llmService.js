import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateLLMResponse(prompt, context = []) {
  const messages = [
    {
      role: "system",
      content:
        "You are Nova, an empathetic, intelligent chatbot. You respond naturally, clearly, and with emotion awareness. Keep replies concise but conversational.",
    },
    ...context.map(turn => ({
      role: turn.role === "bot" ? "assistant" : "user",
      content: turn.text,
    })),
    { role: "user", content: prompt },
  ];

  const completion = await client.chat.completions.create({
    model: process.env.LLM_MODEL || "gpt-4o-mini",
    messages,
    temperature: 0.8,
    max_tokens: 300,
  });

  return completion.choices[0].message.content;
}

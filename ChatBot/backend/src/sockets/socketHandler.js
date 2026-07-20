import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import { pushTurn, getContext, clearContext } from "../store/contextStore.js";
import logger from "../utils/logger.js";
import { analyzeText } from "../services/nluService.js";
import { detectIntentFuzzy, getIntentDefinition } from "../services/intentService.js";
import { extractSlots, slotQuestionFor } from "../services/slotService.js";
import { generateResponse } from "../services/responseService.js";
import { generateLLMResponse } from "../services/llmService.js";
import {
  translateToEnglish,
  translateFromEnglish
} from "../services/translateService.js";

export default function socketHandler(io, socket) {
  /* ================= AUTH ================= */

  const userId = socket.data.userId;

  if (!userId) {
    logger.error("Socket missing authenticated user");
    socket.disconnect(true);
    return;
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);

  logger.info("Socket authenticated", {
    socketId: socket.id,
    userId
  });

  /* ================= START SESSION ================= */

  socket.on("start_session", async () => {
    try {
      const sessionId = uuidv4();
      socket.data.sessionId = sessionId;

      // ✅ CREATE SYSTEM MESSAGE (SESSION ANCHOR)
      await Chat.create({
        sessionId,
        user: userObjectId,
        role: "system",
        text: "Session started"
      });

      socket.emit("session_started", { sessionId });
    } catch (err) {
      logger.error("start_session error", { err: err.message });
    }
  });

  /* ================= RESUME SESSION ================= */

  socket.on("resume_session", ({ sessionId }) => {
    if (!sessionId) return;
    socket.data.sessionId = sessionId;
    socket.emit("session_resumed", { sessionId });
  });

  /* ================= USER MESSAGE ================= */

  socket.on("user_message", async ({ sessionId, text }) => {
    const sid = sessionId || socket.data.sessionId;
    if (!sid || !text) {
      return socket.emit("error", { message: "Invalid session or message" });
    }

    const rawText = String(text);

    await pushTurn(sid, { role: "user", text: rawText, ts: Date.now() });

    let detectedLang = "en";
    let translatedInput = rawText;

    try {
      const res = await translateToEnglish(rawText);
      if (res?.translatedText) {
        translatedInput = res.translatedText;
        detectedLang = res.detectedLang || "en";
      }
    } catch {}

    let analysis;
    try {
      analysis = await analyzeText(translatedInput);
    } catch {
      analysis = {
        original: translatedInput,
        corrected: translatedInput,
        intent: { label: "unknown", score: 0 },
        emotion: { label: "neutral", score: 0 },
        entities: []
      };
    }

    const intentGuess = detectIntentFuzzy(
      analysis.corrected || analysis.original
    );
    analysis.intent = intentGuess;

    const slots = extractSlots(analysis.corrected || analysis.original);
    const ctx = await getContext(sid, 6);
    const def = getIntentDefinition(intentGuess.label);

    let botReply = "";

    try {
      if (def?.requiredSlots?.length) {
        const missing = def.requiredSlots.filter(s => !slots[s]);
        if (missing.length) {
          botReply =
            generateResponse({
              intent: analysis.intent,
              emotion: analysis.emotion,
              slots
            }) +
            " " +
            slotQuestionFor(missing[0]);
        } else {
          botReply = await generateLLMResponse(
            `User: ${analysis.corrected}\nContext:\n${ctx.map(c => c.text).join("\n")}`,
            ctx
          );
        }
      } else {
        botReply = await generateLLMResponse(
          `User: ${analysis.corrected}\nContext:\n${ctx.map(c => c.text).join("\n")}`,
          ctx
        );
      }
    } catch {
      botReply = generateResponse({
        intent: analysis.intent,
        emotion: analysis.emotion,
        slots
      });
    }

    let localizedReply = botReply;
    if (detectedLang !== "en") {
      try {
        const res = await translateFromEnglish(botReply, detectedLang);
        localizedReply = res?.translatedText || botReply;
      } catch {}
    }

    await pushTurn(sid, {
      role: "bot",
      text: localizedReply,
      ts: Date.now()
    });

    // ✅ SAVE WITH ObjectId
    await Chat.insertMany([
      {
        sessionId: sid,
        user: userObjectId,
        role: "user",
        text: rawText
      },
      {
        sessionId: sid,
        user: userObjectId,
        role: "bot",
        text: localizedReply
      }
    ]);

socket.emit("bot_message", {
  text: localizedReply,
  analysis: {
    ...analysis,
    detectedLang
  }
});

  });

  /* ================= CONTEXT ================= */

  socket.on("get_context", async ({ n = 8 }) => {
    socket.emit("context", await getContext(socket.data.sessionId, n));
  });

  socket.on("clear_context", async () => {
    await clearContext(socket.data.sessionId);
    socket.emit("context_cleared", {
      sessionId: socket.data.sessionId
    });
  });

  socket.on("disconnect", () => {
    logger.info("socket disconnected", { socketId: socket.id });
  });
}

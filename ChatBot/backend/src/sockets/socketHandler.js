import { v4 as uuidv4 } from 'uuid';
import Chat from '../models/Chat.js';
import { pushTurn, getContext, clearContext } from '../store/contextStore.js';
import db from '../store/db.js';
import logger from '../utils/logger.js';
import { analyzeText } from '../services/nluService.js';
import { detectIntentFuzzy, getIntentDefinition } from '../services/intentService.js';
import { extractSlots, slotQuestionFor } from '../services/slotService.js';
import { generateResponse } from '../services/responseService.js';
import { generateLLMResponse } from '../services/llmService.js';
import { translateToEnglish, translateFromEnglish } from '../services/translateService.js';

export default function socketHandler(io, socket) {
  socket.on('start_session', async ({ userId } = {}) => {
    const sessionId = uuidv4();
    socket.data.sessionId = sessionId;
    socket.data.userId = userId || 'anon';
    socket.data.pending = null;

    try {
      db.prepare('INSERT OR IGNORE INTO conversations (id, user_id, created_at, messages) VALUES (?, ?, ?, ?)')
        .run(sessionId, socket.data.userId, new Date().toISOString(), JSON.stringify([]));
    } catch (err) {
      logger.warn('DB insert session failed', { err: err?.message });
    }

    socket.emit('session_started', { sessionId });
  });

  socket.on('resume_session', async ({ sessionId } = {}) => {
    if (!sessionId) return socket.emit('error', { message: 'sessionId required to resume' });
    socket.data.sessionId = sessionId;
    socket.emit('session_resumed', { sessionId });
    logger.info('session resumed on socket', { id: socket.id, sessionId });
  });

  socket.on('user_message', async ({ sessionId, text } = {}) => {
    const sid = sessionId || socket.data.sessionId;
    if (!sid || !text) return socket.emit('error', { message: 'sessionId and text required' });

    const rawText = String(text || '');

    const userTurn = { role: 'user', text: rawText, ts: Date.now() };
    await pushTurn(sid, userTurn).catch(e => logger.warn('pushTurn fail', { e: e.message }));

    let detectedLang = 'en';
    let translatedInput = rawText;
    try {
      const res = await translateToEnglish(rawText);
      if (typeof res === 'string') {
        translatedInput = res;
      } else if (res && typeof res.translatedText === 'string') {
        translatedInput = res.translatedText;
        if (res.detectedLang) detectedLang = res.detectedLang;
      }
      if (!translatedInput) translatedInput = rawText;
    } catch (err) {
      logger.warn('Translation (to EN) failed — using raw text', { err: err?.message });
      translatedInput = rawText;
      detectedLang = 'en';
    }

    let analysis;
    try {
      analysis = await analyzeText(translatedInput);
    } catch (err) {
      logger.warn('NLU error', { err: err?.message });
      analysis = {
        original: translatedInput,
        corrected: translatedInput,
        autocorrectEdits: [],
        grammarMatches: [],
        intent: { label: 'unknown', score: 0 },
        emotion: { label: 'neutral', score: 0 },
        entities: []
      };
    }

    const intentGuess = detectIntentFuzzy(analysis.corrected || analysis.original);
    analysis.intent = { label: intentGuess.label, score: intentGuess.score };

    const slots = extractSlots(analysis.corrected || analysis.original);
    const intentLabel = analysis.intent.label;
    const def = getIntentDefinition(intentLabel);
    const pending = socket.data.pending || null;

    let botReply = '';
    const ctx = await getContext(sid, 6);

    try {
      if (pending && pending.intent === intentLabel) {
        pending.collected = { ...pending.collected, ...slots };
        const missing = pending.requiredSlots.filter(s => !pending.collected[s]);
        if (missing.length === 0) {
          botReply = generateResponse({
            intent: { label: pending.intent },
            emotion: analysis.emotion,
            slots: pending.collected,
            context: ctx
          });
          socket.data.pending = null;
        } else {
          const nextSlot = missing[0];
          botReply = slotQuestionFor(nextSlot);
          socket.data.pending = pending;
        }
      } else {
        const confidence = analysis.intent.score || 0;
        if (confidence < 0.5) {
          botReply = "I’m not fully sure what you meant — could you clarify?";
        } else if (def && def.requiredSlots?.length) {
          const missing = def.requiredSlots.filter(s => !slots[s]);
          if (missing.length > 0) {
            const nextSlot = missing[0];
            botReply = generateResponse({ intent: analysis.intent, emotion: analysis.emotion, slots });
            botReply += ' ' + slotQuestionFor(nextSlot);
            socket.data.pending = { intent: intentLabel, requiredSlots: def.requiredSlots, collected: slots };
          } else {
            const mood = analysis.emotion?.label || 'neutral';
            const slotSummary = Object.entries(slots).map(([k, v]) => `${k}: ${v}`).join(', ') || 'none';
            const prompt = `
User said (translated): "${analysis.corrected || translatedInput}".
Detected intent: ${intentLabel}.
Mood: ${mood}.
Language: ${detectedLang}.
Extracted info: ${slotSummary}.
Context:
${ctx.map(c => `[${c.role}] ${c.text}`).join('\n')}
Reply naturally, friendly, and in English.
`;
            try {
              botReply = await generateLLMResponse(prompt, ctx);
            } catch (e) {
              logger.warn('LLM error — falling back to template response', { e: e?.message });
              botReply = generateResponse({ intent: analysis.intent, emotion: analysis.emotion, slots, context: ctx });
            }
          }
        } else {
          const mood = analysis.emotion?.label || 'neutral';
          const prompt = `
User said (translated): "${analysis.corrected || translatedInput}".
Intent: ${intentLabel}.
Mood: ${mood}.
Language: ${detectedLang}.
Context:
${ctx.map(c => `[${c.role}] ${c.text}`).join('\n')}
Respond in English conversationally and helpfully.
`;
          try {
            botReply = await generateLLMResponse(prompt, ctx);
          } catch (e) {
            logger.warn('LLM error — fallback response', { e: e?.message });
            botReply = generateResponse({ intent: analysis.intent, emotion: analysis.emotion, slots, context: ctx });
          }
        }
      }
    } catch (err) {
      logger.error('Response generation failed', { err: err?.message ?? String(err) });
      botReply = "Sorry, I had trouble understanding that.";
    }

    let localizedReply = botReply;
    try {
      if (detectedLang && detectedLang !== 'en') {
        const res = await translateFromEnglish(botReply, detectedLang);
        if (typeof res === 'string') localizedReply = res;
        else if (res && typeof res.translatedText === 'string') localizedReply = res.translatedText;
        if (!localizedReply) localizedReply = botReply;
      }
    } catch (err) {
      logger.warn('Back translation failed — using English reply', { err: err?.message });
      localizedReply = botReply;
    }

    const botTurn = { role: 'bot', text: localizedReply, ts: Date.now(), meta: { analysis, slots, detectedLang } };

    try {
      socket.emit('typing', { status: true });
      const delay = 500 + Math.min(2500, localizedReply.length * 10);
      await new Promise(r => setTimeout(r, delay));
      socket.emit('typing', { status: false });
    } catch (e) {
      logger.warn('typing emit failed', { e: e?.message });
    }

    await pushTurn(sid, botTurn).catch(e => logger.warn('pushTurn bot fail', { e: e.message }));

    try {
      const userDoc = {
        sessionId: sid,
        user: socket.data.userId || 'anon',
        role: 'user',
        text: rawText,
        corrected: analysis.corrected || translatedInput,
        mood: analysis.emotion.label,
        moodScore: analysis.emotion.score,
        intent: analysis.intent.label,
        intentScore: analysis.intent.score,
        meta: { nlu: analysis, slots, detectedLang, translatedText: translatedInput, rawText }
      };

      const botDoc = {
        sessionId: sid,
        user: 'bot',
        role: 'bot',
        text: localizedReply,
        corrected: '',
        mood: analysis.emotion.label,
        moodScore: analysis.emotion.score,
        intent: analysis.intent.label,
        intentScore: analysis.intent.score,
        meta: { generatedFrom: 'LLM', slots, detectedLang, englishText: botReply }
      };

      await Chat.insertMany([userDoc, botDoc]);
    } catch (err) {
      logger.warn('Mongo save failed', { err: err?.message });
    }

    try {
      const row = db.prepare('SELECT messages FROM conversations WHERE id = ?').get(sid);
      const messages = row && row.messages ? JSON.parse(row.messages) : [];
      messages.push(userTurn, botTurn);
      db.prepare('UPDATE conversations SET messages = ? WHERE id = ?').run(JSON.stringify(messages), sid);
    } catch (e) {
      logger.warn('SQLite write failed', { err: e?.message });
    }

    socket.emit('bot_message', {
      text: localizedReply,
      analysis: { ...analysis, detectedLang, translatedInput, rawText },
    });
  });

  socket.on('get_context', async ({ n = 8 } = {}) => {
    const sid = socket.data.sessionId;
    socket.emit('context', await getContext(sid, n));
  });

  socket.on('clear_context', async () => {
    const sid = socket.data.sessionId;
    await clearContext(sid).catch(err => logger.warn('clearContext fail', { err: err?.message }));
    socket.data.pending = null;
    socket.emit('context_cleared', { sessionId: sid });
  });

  socket.on('disconnect', () => {
    logger.info('socket disconnected', { id: socket.id });
  });
}

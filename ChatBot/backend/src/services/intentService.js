import stringSimilarity from 'string-similarity';

export const INTENT_DEFINITIONS = [
  { label: 'greet', examples: ['hi', 'hello', 'hey', 'good morning', 'good evening'], requiredSlots: [] },
  { label: 'goodbye', examples: ['bye', 'goodbye', 'see you', 'take care'], requiredSlots: [] },
  { label: 'billing', examples: ['invoice', 'bill', 'payment', 'charge', 'refund'], requiredSlots: ['issue_type','invoice_number'] },
  { label: 'support', examples: ['help', 'support', 'issue', 'problem', 'error', 'not working'], requiredSlots: ['problem_description'] },
  { label: 'feedback', examples: ['feedback', 'suggestion', 'complaint'], requiredSlots: ['feedback_text'] },
  { label: 'rsvp', examples: ['i will attend', "i'll be there", 'i am going', 'i am not coming'], requiredSlots: ['attendance'] },
  { label: 'small_talk', examples: ['how are you', "what's up", 'how is it going'], requiredSlots: [] }
];

export function detectIntentFuzzy(text) {
  const t = String(text || '').toLowerCase().trim();
  if (!t) return { label: 'unknown', score: 0 };

  let best = { label: 'unknown', score: 0, example: null };
  for (const intent of INTENT_DEFINITIONS) {
    for (const ex of intent.examples) {
      const score = stringSimilarity.compareTwoStrings(t, ex);
      if (score > best.score) best = { label: intent.label, score, example: ex };
    }
  }

  const tokens = t.split(/\s+/);
  for (const intent of INTENT_DEFINITIONS) {
    for (const ex of intent.examples) {
      const exTokens = ex.split(/\s+/);
      const overlap = exTokens.filter(tok => tokens.includes(tok)).length;
      if (overlap > 0) {
        const boost = Math.min(0.45, overlap / exTokens.length * 0.6);
        const newScore = Math.max(best.score, boost);
        if (newScore > best.score) best = { label: intent.label, score: newScore, example: ex };
      }
    }
  }

  const confidence = Number(best.score.toFixed(2));
  return { label: best.label || 'unknown', score: confidence };
}

export function getIntentDefinition(label) {
  return INTENT_DEFINITIONS.find(i => i.label === label);
}

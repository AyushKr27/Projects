export async function detectMoodFromNLU(nluResult) {
  if (nluResult && nluResult.emotion) return nluResult.emotion;
  return { label: 'neutral', score: 0 };
}

export async function detectMood(text) {
  const t = (text || '').toLowerCase();
  if (!t) return { label: 'neutral', score: 0 };
  if (t.includes('happy') || t.includes('glad') || t.includes('awesome')) return { label: 'joy', score: 0.8 };
  if (t.includes('sad') || t.includes('depressed') || t.includes('unhappy')) return { label: 'sad', score: 0.9 };
  if (t.includes('angry') || t.includes('hate') || t.includes('furious')) return { label: 'anger', score: 0.95 };
  return { label: 'neutral', score: 0 };
}

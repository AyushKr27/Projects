import Sentiment from 'sentiment';
import nlp from 'compromise';
import nspell from 'nspell';
import dict from 'dictionary-en';
import fetch from 'node-fetch';
import config from '../config/config.js';

let spell = null;
async function loadSpell() {
  if (spell) return spell;
  return new Promise((resolve, reject) => {
    dict((err, dictionary) => {
      if (err) return reject(err);
      spell = nspell(dictionary);
      resolve(spell);
    });
  });
}

const sentiment = new Sentiment();

const INTENT_KEYWORDS = [
  { label: 'greet', words: ['\\bhi\\b', '\\bhello\\b', '\\bhey\\b', '\\bhiya\\b', '\\bgood\\s+morning\\b', '\\bgood\\s+evening\\b'] },
  { label: 'goodbye', words: ['\\bbye\\b', '\\bgoodbye\\b', '\\bsee\\s+you\\b', '\\btake\\s+care\\b'] },
  { label: 'billing', words: ['\\bbill\\b', '\\binvoice\\b', '\\bpayment\\b', '\\bcharge\\b', '\\bpricing\\b', '\\brefund\\b'] },
  { label: 'support', words: ['\\bhelp\\b', '\\bsupport\\b', '\\bissue\\b', '\\bproblem\\b', '\\berror\\b', '\\bbug\\b'] },
  { label: 'feedback', words: ['\\bfeedback\\b', '\\bsuggestion\\b', '\\bcomplaint\\b'] },
  { label: 'small_talk', words: ['\\bhow\\s+are\\s+you\\b', "\\bwhat's\\s+up\\b", '\\bhow\\s+is\\s+it\\s+going\\b'] }
];

function detectIntent(text) {
  const lowered = String(text || '').toLowerCase().trim();

  if (!lowered) return { label: 'unknown', score: 0.0 };

  for (const kg of INTENT_KEYWORDS) {
    for (const pattern of kg.words) {
      try {
        const re = new RegExp(pattern, 'i');
        if (re.test(lowered)) {
          const base = 0.6;
          const bonus = Math.min(0.35, pattern.replace(/\\b/g, '').length / 60);
          const score = Math.min(0.99, base + bonus);
          return { label: kg.label, score: Number(score.toFixed(2)) };
        }
      } catch (err) {
        const plain = pattern.replace(/\\b/g, '').trim();
        if (plain && lowered.includes(plain)) {
          return { label: kg.label, score: 0.6 };
        }
      }
    }
  }

  const tokens = lowered.split(/\s+/).map(t => t.replace(/[^\w']/g, ''));
  for (const kg of INTENT_KEYWORDS) {
    for (const wordPattern of kg.words) {
      const plain = wordPattern.replace(/\\b/g, '').trim().split('\\s+').join(' ');
      const plainTokens = plain.split(/\s+/).filter(Boolean);
      if (plainTokens.length === 1 && tokens.includes(plainTokens[0])) {
        return { label: kg.label, score: 0.55 };
      }
    }
  }

  return { label: 'unknown', score: 0.35 };
}

function extractEntities(text) {
  const raw = String(text || '');
  let people = [], places = [], orgs = [], nouns = [];
  try {
    const doc = nlp(raw || '');

    if (doc && typeof doc.people === 'function') {
      try { people = doc.people().out('array') || []; } catch (e) { people = []; }
    }
    if (doc && typeof doc.places === 'function') {
      try { places = doc.places().out('array') || []; } catch (e) { places = []; }
    }
    if (doc && typeof doc.organizations === 'function') {
      try { orgs = doc.organizations().out('array') || []; } catch (e) { orgs = []; }
    }
    if (doc && typeof doc.nouns === 'function') {
      try { nouns = doc.nouns().out('array').slice(0, 12) || []; } catch (e) { nouns = []; }
    }
  } catch (err) {
    people = []; places = []; orgs = []; nouns = [];
  }

  const dateRegex = /\b(?:\d{1,2}[\/\-\.\s]\d{1,2}[\/\-\.\s]\d{2,4}|\d{4}-\d{2}-\d{2}|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(?:,\s*\d{4})?)\b/ig;
  const moneyRegex = /(\$\s?\d+(?:[.,]\d{2})?|\d+(?:[.,]\d{2})?\s?(?:usd|inr|rs|eur|£|£))/ig;

  const dates = [];
  const monies = [];
  let m;
  while ((m = dateRegex.exec(raw)) !== null) {
    dates.push(m[0]);
  }
  while ((m = moneyRegex.exec(raw)) !== null) {
    monies.push(m[0]);
  }

  const entities = [];
  const addIfNew = (type, text) => {
    if (!text) return;
    if (!entities.find(e => e.type === type && e.text === text)) entities.push({ type, text });
  };

  people.forEach(w => addIfNew('PERSON', w));
  places.forEach(w => addIfNew('PLACE', w));
  orgs.forEach(w => addIfNew('ORG', w));
  dates.forEach(w => addIfNew('DATE', w));
  monies.forEach(w => addIfNew('MONEY', w));
  nouns.forEach(w => addIfNew('NOUN', w));

  return entities;
}

export async function autocorrectText(input) {
  if (!input || typeof input !== 'string') return { corrected: input, edits: [] };
  await loadSpell();
  const tokens = input.split(/(\s+|[.,!?;:()"'""])/);
  const edits = [];
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (!tok || !/^[A-Za-z']+$/.test(tok)) continue;
    if (!spell.correct(tok)) {
      const suggestions = spell.suggest(tok).slice(0, 5);
      const suggestion = suggestions.length ? suggestions[0] : tok;
      edits.push({ original: tok, suggestion, suggestions });
      tokens[i] = suggestion;
    }
  }
  return { corrected: tokens.join(''), edits };
}

export async function grammarCheck(text, language = config.languageTool.language) {
  if (!text) return { matches: [] };
  try {
    const url = config.languageTool.url;
    const params = new URLSearchParams();
    params.append('text', text);
    params.append('language', language);

    const res = await fetch(url, { method: 'POST', body: params });
    if (!res.ok) {
      return { matches: [], error: `LanguageTool ${res.status}` };
    }
    const json = await res.json();
    const matches = (json.matches || []).map(m => ({
      message: m.message,
      shortMessage: m.shortMessage,
      replacements: (m.replacements || []).map(r => r.value).slice(0, 5),
      offset: m.offset,
      length: m.length,
      ruleId: m.rule ? m.rule.id : null,
      context: m.context ? m.context.text : null
    }));
    return { matches };
  } catch (err) {
    return { matches: [], error: err.message };
  }
}

export async function analyzeText(text) {
  const original = (text || '').trim();
  if (!original) {
    return {
      original: '',
      corrected: '',
      autocorrectEdits: [],
      grammarMatches: [],
      intent: { label: 'unknown', score: 0 },
      emotion: { label: 'neutral', score: 0 },
      entities: []
    };
  }

  let auto = { corrected: original, edits: [] };
  try { auto = await autocorrectText(original); } catch (e) { auto = { corrected: original, edits: [], error: e.message }; }

  const corrected = auto.corrected;
  let grammar = { matches: [] };
  try { grammar = await grammarCheck(corrected); } catch (e) { grammar = { matches: [], error: e.message }; }

  const intent = detectIntent(corrected);
  const sent = sentiment.analyze(corrected);
  const emotionScore = sent.score;
  let emotionLabel = 'neutral';
  let intensity = Math.min(1, Math.abs(emotionScore) / 10);
  if (emotionScore >= 2) emotionLabel = 'joy';
  else if (emotionScore >= 1) emotionLabel = 'positive';
  else if (emotionScore <= -3) emotionLabel = 'anger';
  else if (emotionScore < 0) emotionLabel = 'sadness';

  const entities = extractEntities(corrected);

  return {
    original,
    corrected,
    autocorrectEdits: auto.edits,
    grammarMatches: grammar.matches,
    grammarError: grammar.error,
    intent,
    emotion: { label: emotionLabel, score: intensity, rawScore: emotionScore },
    entities
  };
}

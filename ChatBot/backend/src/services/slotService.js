// src/services/slotService.js

let chrono = null;
try {
  chrono = await (async () => {
    try {
      const mod = await import('chrono-node');
      return mod.default || mod;
    } catch (err) {
      return null;
    }
  })();
} catch (e) {
  chrono = null;
}

const invoiceRegex = /\b(inv(?:oice)?[-\s]?\d{1,12}|\b\d{6,12}\b)/i;
const amountRegex = /(?:(USD|INR|EUR|GBP|Rs|₹|\$|£)?\s?)(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?)/i;
const dateRegexSimple = /\b(?:\d{1,2}[\/\-\.\s]\d{1,2}[\/\-\.\s]\d{2,4}|\d{4}-\d{2}-\d{2}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(?:,\s*\d{4})?)\b/i;
const yesRegex = /\b(yes|yeah|yep|sure|i will|i'll|count me in|going to attend|attend|will attend)\b/i;
const noRegex = /\b(no|not|won't|will not|cannot|can not|cant|won't)\b/i;

function normalizeAmount(match) {
  if (!match) return null;
  const raw = match[0] || String(match);
  const re = /(?:(USD|INR|EUR|GBP|Rs|₹|\$|£)\s?)?([\d.,]+)/i;
  const m = raw.match(re);
  if (!m) return { raw: raw.trim() };
  let currency = m[1] || '';
  let num = m[2] || '';
  num = num.replace(/,/g, '');
  const value = parseFloat(num);
  if (currency === 'Rs') currency = 'INR';
  if (currency === '₹') currency = 'INR';
  if (currency === '$') currency = 'USD';
  if (currency === '£') currency = 'GBP';
  return { raw: raw.trim(), value: Number.isFinite(value) ? value : null, currency: currency || null };
}

function parseDateToISO(text) {
  const raw = String(text || '').trim();
  if (!raw) return null;

  if (chrono) {
    try {
      const parsed = chrono.parseDate(raw);
      if (parsed instanceof Date && !Number.isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
    } catch (e) {
    }
  }

  const isoMatch = raw.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  const dmyMatch = raw.match(/\b(\d{1,2})[\/\-\.\s](\d{1,2})[\/\-\.\s](\d{2,4})\b/);
  if (dmyMatch) {
    let dd = dmyMatch[1].padStart(2, '0');
    let mm = dmyMatch[2].padStart(2, '0');
    let yyyy = dmyMatch[3];
    if (yyyy.length === 2) {
      yyyy = Number(yyyy) < 50 ? `20${yyyy}` : `19${yyyy}`;
    }
    return `${yyyy}-${mm}-${dd}`;
  }

  const monthNameMatch = raw.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+(\d{1,2})(?:,\s*(\d{4}))?\b/i);
  if (monthNameMatch) {
    const monthNames = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };
    const mm = monthNames[monthNameMatch[1].substring(0,3).toLowerCase()] || '01';
    let dd = monthNameMatch[2].padStart(2, '0');
    let yyyy = monthNameMatch[3] || (new Date().getFullYear());
    return `${yyyy}-${mm}-${dd}`;
  }

  return null;
}

export function extractSlots(text) {
  const t = String(text || '');
  const slots = {};

  const inv = t.match(invoiceRegex);
  if (inv) slots.invoice_number = inv[0].trim();

  const amtMatch = t.match(amountRegex);
  if (amtMatch) {
    const normalized = normalizeAmount(amtMatch);
    if (normalized) slots.amount = normalized;
  }

  const dateIso = parseDateToISO(t);
  if (dateIso) slots.date = dateIso;

  if (yesRegex.test(t)) slots.attendance = 'yes';
  else if (noRegex.test(t)) slots.attendance = 'no';

  if (/\b(problem|issue|not working|cannot|can't|error|bug)\b/i.test(t)) {
    slots.problem_description = t.trim();
  }
  if (/\b(feedback|suggestion|complaint)\b/i.test(t)) {
    slots.feedback_text = t.trim();
  }

  if (!slots.invoice_number) {
    const maybeInv = t.match(/\b(inv\d{3,10})\b/i);
    if (maybeInv) slots.invoice_number = maybeInv[1];
  }

  return slots;
}

export function slotQuestionFor(slot) {
  const questions = {
    invoice_number: "Could you share the invoice number (e.g., INV-12345 or the 6-12 digit ID)?",
    amount: "What's the amount (e.g., $12.50)?",
    date: "Which date do you mean (e.g., 2025-12-01 or Dec 1)?",
    attendance: "Will you attend the event (yes/no)?",
    problem_description: "Can you describe the issue in a sentence or two?",
    feedback_text: "Please tell me a bit more about your feedback."
  };
  return questions[slot] || `Could you provide ${slot}?`;
}

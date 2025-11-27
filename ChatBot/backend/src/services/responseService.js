import { getIntentDefinition } from './intentService.js';

function fillTemplate(template, slots = {}) {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = slots[key];
    if (!value) return `{${key}}`;
    if (key === 'attendance') {
      return value === 'yes' ? 'attending' : (value === 'no' ? 'not attending' : value);
    }
    return String(value);
  });
}

const EMOTIONAL_TONE = {
  joy: [
    "That's wonderful!",
    "Awesome to hear!",
    "Glad you're feeling good!",
    "😊 That sounds great!"
  ],
  sadness: [
    "I'm sorry you're feeling that way.",
    "That must be tough.",
    "I'm here if you'd like to talk more about it.",
    "😔 I understand — would you like some encouragement?"
  ],
  anger: [
    "I can understand how frustrating that must be.",
    "That sounds annoying — let's see how we can fix it.",
    "😤 I get that you're upset. Let's sort it out."
  ],
  neutral: [
    "Got it!",
    "Okay, I understand.",
    "Alright, let's continue."
  ]
};

const TEMPLATES = {
  greet: [
    "Hello! 😊 How can I help you today?",
    "Hi there! What brings you here today?",
    "Hey! How's your day going so far?",
    "Hi 👋 How can I assist you?"
  ],
  goodbye: [
    "Goodbye! 👋 Hope to chat with you soon.",
    "Take care! If you need anything else, I'll be here.",
    "Bye-bye! Have a great day ahead!"
  ],
  billing: [
    "I can help with billing or payment-related queries. Could you share your invoice number or payment reference?",
    "Sure! Is this about a charge, refund, or an invoice issue?",
    "No worries, I'll check that for you. Please provide the invoice number if available."
  ],
  support: [
    "I'm sorry you're facing an issue. Could you tell me what exactly isn't working?",
    "Let's fix this together. What problem are you encountering?",
    "Alright, please describe the issue so I can assist better."
  ],
  feedback: [
    "Thanks for the feedback! Would you like to share more about your experience?",
    "I appreciate your input — what would you like to improve?",
    "Thanks for letting me know. Could you explain that a bit more?"
  ],
  rsvp: [
    "Thanks! Noted that you'll be {attendance}. Would you like me to send you an event reminder?",
    "Got it — you've indicated you're {attendance}. Do you want directions to the event?",
    "Cool! So you're {attendance}. Anything else you'd like to know about it?"
  ],
  small_talk: [
    "I'm doing great, thanks for asking! How about you?",
    "Haha, I'm just a chatbot, but I'm having a good time chatting with you!",
    "All good here! What's new with you?"
  ],
  unknown: [
    "Hmm, I'm not sure I understood that. Could you rephrase?",
    "Sorry, I didn't quite get that. Can you say it another way?",
    "Could you explain that a bit more?"
  ]
};

function pickTemplate(intent) {
  const arr = TEMPLATES[intent] || TEMPLATES.unknown;
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateResponse({ intent, emotion, slots = {}, context = [] }) {
  const def = getIntentDefinition(intent?.label || intent) || getIntentDefinition('unknown');
  const intentLabel = def?.label || 'unknown';
  const baseTemplate = pickTemplate(intentLabel);
  const base = fillTemplate(baseTemplate, slots);

  const mood = emotion?.label || 'neutral';
  const moodPhrases = EMOTIONAL_TONE[mood] || EMOTIONAL_TONE.neutral;
  const empathyPrefix = moodPhrases[Math.floor(Math.random() * moodPhrases.length)];

  const missing = [];
  if (def && def.requiredSlots?.length) {
    for (const s of def.requiredSlots) {
      if (!slots[s]) missing.push(s);
    }
  }

  if (missing.length > 0) {
    const slotQuestions = {
      invoice_number: "Could you share the invoice number (e.g., INV-123)?",
      problem_description: "Could you describe the issue in more detail?",
      feedback_text: "Please tell me more about your feedback or suggestion.",
      attendance: "Will you attend the event (yes/no)?"
    };
    const ask = missing.map(m => slotQuestions[m] || `Could you provide ${m}?`).join(' ');
    return `${empathyPrefix} ${base} ${ask}`;
  }

  if (intentLabel === 'rsvp' && slots.attendance) {
    return `${empathyPrefix} ${fillTemplate(base, slots)}`;
  }

  if (intentLabel === 'billing' && slots.invoice_number) {
    return `${empathyPrefix} Thanks! I found invoice ${slots.invoice_number}. Would you like me to check the payment status or start a refund process?`;
  }

  if (intentLabel === 'feedback') {
    return `${empathyPrefix} Thank you so much for sharing feedback. It really helps me improve!`;
  }

  if (intentLabel === 'support') {
    return `${empathyPrefix} ${base} Once I have more details, I'll try to assist with steps to fix it.`;
  }

  if (intent?.score < 0.5) {
    return `I'm not completely sure I understood that. Did you mean billing, support, or something else?`;
  }

  return adaptTone(`${empathyPrefix} ${base}`, emotion);
}

function adaptTone(text, emotion) {
  const mood = emotion?.label || 'neutral';
  if (mood === 'joy' || mood === 'positive') return `😄 ${text}`;
  if (mood === 'sadness') return `😔 ${text}`;
  if (mood === 'anger') return `😤 ${text}`;
  return text;
}

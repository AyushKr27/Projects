import React, { useEffect, useRef, useState } from 'react';
import Message from './Message';

export default function ChatWindow({
  socket,
  sessionId,
  onStartSession,
  initialMessages = null
}) {
  const [messages, setMessages] = useState(() => (Array.isArray(initialMessages) ? initialMessages : []));
  const [input, setInput] = useState('');
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const [connected, setConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [detectedLang, setDetectedLang] = useState('en');
  const [dark, setDark] = useState(false);
  const chatRef = useRef();
  const sendingRef = useRef(false);
  const lastInitialHash = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('chat-dark');
      if (saved !== null) setDark(saved === 'true');
      else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDark(prefersDark);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark', dark);
    try { localStorage.setItem('chat-dark', dark ? 'true' : 'false'); } catch (e) {}
  }, [dark]);

  useEffect(() => {
    if (!Array.isArray(initialMessages) || initialMessages.length === 0) {
      if (sessionId) setMessages([]);
      return;
    }

    const first = initialMessages[0];
    const last = initialMessages[initialMessages.length - 1];
    const hash = `${initialMessages.length}-${first?._id||first?.id||''}-${last?._id||last?.id||''}`;

    if (hash === lastInitialHash.current) return;

    lastInitialHash.current = hash;

    const normalized = initialMessages.map((m, i) => ({
      id: m.id || `${m.role}-${m._id || i}-${new Date(m.createdAt || m.ts || Date.now()).getTime()}`,
      role: m.role,
      text: m.text,
      meta: m.meta || {},
      ts: m.createdAt ? new Date(m.createdAt).getTime() : (m.ts || Date.now())
    }));

    setMessages(normalized);
    requestAnimationFrame(() => scrollToBottom(true));
  }, [initialMessages, sessionId]);

  useEffect(() => {
    if (!socket) {
      setConnected(false);
      return;
    }

    setConnected(Boolean(socket.connected));

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onBotMessage = (payload) => {
      const ts = payload?.meta?.nlu?.ts || payload?.ts || Date.now();
      const id = payload?.id || `bot-${ts}-${Math.floor(Math.random() * 9999)}`;
      const botMsg = {
        id,
        role: 'bot',
        text: payload.text,
        meta: payload.analysis ?? payload.meta ?? null,
        quickReplies: payload.quickReplies || [],
        ts
      };

      setMessages((m) => [...m, botMsg]);
      setLastAnalysis(payload.analysis ?? null);
      if (payload.analysis?.detectedLang) setDetectedLang(payload.analysis.detectedLang);
      setTyping(false);

      if (voiceEnabled) speakReply(payload.text, payload.analysis?.detectedLang || detectedLang, payload.analysis?.emotion?.label);

      requestAnimationFrame(() => scrollToBottom(false));
      sendingRef.current = false;
    };

    const onTyping = (data) => setTyping(Boolean(data?.status));

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('bot_message', onBotMessage);
    socket.on('typing', onTyping);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('bot_message', onBotMessage);
      socket.off('typing', onTyping);
    };
  }, [socket, voiceEnabled, detectedLang]);

  useEffect(() => {
    if (!socket || !sessionId) return;
    try {
      socket.emit('resume_session', { sessionId });
      socket.emit('get_context', { n: 50 });
    } catch (e) {
      console.warn('resume_session failed', e);
    }
  }, [socket, sessionId]);

  function normalizeMessageForUI({ role, text, meta = null, ts = null }) {
    const stamp = ts || Date.now();
    const id = `${role}-${stamp}-${Math.floor(Math.random() * 9999)}`;
    return { id, role, text, meta, ts: stamp };
  }

  function addUserMessageLocal(text) {
    const msg = normalizeMessageForUI({ role: 'user', text });
    setMessages((m) => [...m, msg]);
    requestAnimationFrame(() => scrollToBottom(false));
    return msg;
  }

  async function handleSend(customText) {
    const t = (customText || input || '').trim();
    if (!t) return;
    if (!socket) return alert('Connecting to backend...');
    if (sendingRef.current) return;
    sendingRef.current = true;

    if (!sessionId && typeof onStartSession === 'function') {
      onStartSession();
      await new Promise((r) => setTimeout(r, 250));
    }

    addUserMessageLocal(t);
    setInput('');

    try {
      socket.emit('user_message', { sessionId, text: t });
    } catch (err) {
      setMessages((m) => [...m, normalizeMessageForUI({ role: 'system', text: 'Failed to send message.' })]);
      sendingRef.current = false;
    }
  }

  function handleQuickReplyClick(reply) {
    const text = typeof reply === 'string' ? reply : reply.payload || reply.title;
    handleSend(text);
  }

  function handleAcceptCorrection() {
    if (!lastAnalysis || !lastAnalysis.corrected) return;
    setInput(lastAnalysis.corrected);
    document.getElementById('chat-input')?.focus();
  }

  function handleClearContext() {
    if (!socket) return;
    socket.emit('clear_context', { sessionId });
    setMessages((m) => [...m, normalizeMessageForUI({ role: 'system', text: '🧹 Context cleared' })]);
  }

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Speech recognition not supported in this browser.');
    const recognition = new SpeechRecognition();
    recognition.lang = detectedLang === 'hi' ? 'hi-IN' : (detectedLang === 'en' ? 'en-US' : `${detectedLang}-${detectedLang.toUpperCase()}`);
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = (e) => { console.error('Speech error:', e); setListening(false); };
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      handleSend(transcript);
    };
    recognition.start();
  }

  function getBestVoice(lang) {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    const prefix = (lang || 'en').split('-')[0].toLowerCase();
    return voices.find(v => v.lang.toLowerCase().startsWith(prefix))
      || voices.find(v => v.lang.toLowerCase().includes(prefix))
      || voices.find(v => v.lang.startsWith('en'))
      || voices[0];
  }

  function speakReply(text, lang = 'en', emotion = 'neutral') {
    if (!window.speechSynthesis) return;
    const speakNow = () => {
      const utter = new SpeechSynthesisUtterance(text);
      try {
        utter.lang = lang.includes('-') ? lang : `${lang}-${lang.toUpperCase()}`;
      } catch (e) { utter.lang = 'en-US'; }
      utter.voice = getBestVoice(lang);
      utter.rate = 1;
      utter.pitch = 1;
      switch ((emotion || '').toLowerCase()) {
        case 'joy': case 'happy': utter.rate = 1.15; utter.pitch = 1.2; break;
        case 'sadness': case 'sad': utter.rate = 0.85; utter.pitch = 0.9; break;
        case 'anger': case 'angry': utter.rate = 1.05; utter.pitch = 1.2; break;
        default: break;
      }
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = speakNow;
    } else {
      speakNow();
    }
  }

  function scrollToBottom(immediate = false) {
    const el = chatRef.current;
    if (!el) return;
    if (immediate) el.scrollTop = el.scrollHeight;
    else el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }

  useEffect(() => {
    scrollToBottom(false);
  }, [messages, typing]);

  return (
    <div className="chat-container" role="region" aria-label="Chat window">
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="logo">N</div>
          <div className="header-meta">
            <div style={{ fontWeight: 700 }}>Realtime Chatbot</div>
            <div className="small">Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="small" style={{ marginRight: 12 }}>🌍 {detectedLang.toUpperCase()}</div>

          <button
            className="controls toggle-voice"
            onClick={() => setVoiceEnabled(v => !v)}
            title={voiceEnabled ? 'Disable voice' : 'Enable voice'}
            aria-pressed={voiceEnabled}
            style={{ marginRight: 8 }}
          >
            {voiceEnabled ? '🔈' : '🔇'}
          </button>

          <button
            className="controls toggle-theme"
            onClick={() => setDark(d => !d)}
            aria-pressed={dark}
            title={dark ? 'Switch to light' : 'Switch to dark'}
          >
            {dark ? '🌙' : '☀️'}
          </button>
        </div>
      </div>

      <div ref={chatRef} className="chat-window" aria-live="polite">
        {messages.map((m) => (
          <div key={m.id} className={`msg ${m.role}`}>
            <Message role={m.role} text={m.text} meta={{ ...m.meta, ts: m.ts }} />
            {m.role === 'bot' && m.quickReplies?.length > 0 && (
              <div className="quick-replies" role="list">
                {m.quickReplies.map((q, i) => (
                  <button key={i} className="quick-btn" onClick={() => handleQuickReplyClick(q)} role="listitem" aria-label={`Quick reply ${i + 1}`}>
                    {typeof q === 'string' ? q : q.title || q.payload}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {typing && (
          <div className="msg bot typing" aria-hidden>
            <div className="typing-indicator"><span></span><span></span><span></span></div>
          </div>
        )}
      </div>

      <div className="controls">
        <input
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={connected ? "Write or speak..." : "Connecting..."}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          aria-label="Type your message"
          disabled={!connected}
        />
        <button onClick={() => handleSend()} className="apply" disabled={!connected || sendingRef.current}>Send</button>
        <button onClick={handleAcceptCorrection} className="secondary">Apply Correction</button>
        <button onClick={handleClearContext} className="clear">Clear</button>
        <button onClick={startListening} className="voice" aria-pressed={listening}>
          {listening ? '🛑 Stop' : '🎤 Speak'}
        </button>
      </div>

      <div className="suggestions-panel" aria-live="polite">
        {lastAnalysis && (
          <div>
            <strong>Last analysis</strong>
            <div className="small">Original: {lastAnalysis.original}</div>
            <div className="small">Corrected: {lastAnalysis.corrected}</div>
            <div className="small">Language: {detectedLang.toUpperCase()}</div>
            {lastAnalysis.autocorrectEdits?.length > 0 && (
              <div className="small">Spelling: {lastAnalysis.autocorrectEdits.map(e => `${e.original} → ${e.suggestion}`).join(', ')}</div>
            )}
            {lastAnalysis.grammarMatches?.length > 0 && (
              <div className="small">Grammar: {lastAnalysis.grammarMatches.map(m => m.message).slice(0, 3).join(' | ')}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

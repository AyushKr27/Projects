import React, { useEffect, useState, useCallback, useRef } from 'react';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

export default function Sidebar({ socket, sessionId, onStartSession, onSelectConversation }) {
  const [conversations, setConversations] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const refreshTimeout = useRef(null);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND.replace(/\/$/, '')}/api/conversations`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error('Failed to load conversations');
      const data = await res.json();
      setConversations(data || []);
    } catch (err) {
      console.warn('loadConversations error', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const scheduleRefresh = useCallback(() => {
    if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
    refreshTimeout.current = setTimeout(() => {
      loadConversations();
    }, 500);
  }, [loadConversations]);

  useEffect(() => {
    loadConversations();

    if (!socket) return;

    const events = ['bot_message', 'user_message', 'session_started', 'connect'];

    for (const evt of events) socket.on(evt, scheduleRefresh);

    return () => {
      for (const evt of events) socket.off(evt, scheduleRefresh);
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
    };
  }, [socket, scheduleRefresh, loadConversations]);

  const filtered = useCallback(() => {
    if (!query) return conversations;
    const q = query.toLowerCase();
    return conversations.filter((c) =>
      (c.title || c.lastMessage || '').toLowerCase().includes(q)
    );
  }, [query, conversations]);

  async function createNewChat() {
    if (!onStartSession) return;
    onStartSession();
    setTimeout(() => {
      scheduleRefresh();
    }, 700);
  }

  function openConversation(conv) {
    setSelectedId(conv.id);
    if (onSelectConversation) onSelectConversation(conv);
  }

  async function detectMood(convId) {
    try {
      const res = await fetch(`${BACKEND.replace(/\/$/, '')}/api/conversations/${convId}/mood`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error('Failed to detect mood');
      const data = await res.json();
      alert(`Detected mood: ${data.mood} (${(data.score ?? 0).toFixed(2)})`);
    } catch (err) {
      console.warn('detectMood error', err);
      alert('Mood detection failed — check server logs.');
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <button className="new-chat" onClick={createNewChat}>
          ＋ New chat
        </button>
        <input
          className="search"
          placeholder="Search conversations..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="sidebar-list">
        {loading && <div className="muted">Loading…</div>}
        {!loading && filtered().length === 0 && (
          <div className="muted">No conversations</div>
        )}
        {filtered().map((c) => (
          <div
            key={c.id}
            className={`conv-row ${selectedId === c.id ? 'selected' : ''}`}
            onClick={() => openConversation(c)}
          >
            <div className="conv-title">{c.title || `Chat ${c.id.slice(0, 6)}`}</div>
            <div className="conv-meta">
              <small className="muted">
                {c.lastMessage ? c.lastMessage.slice(0, 40) : '—'}
              </small>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  className="tiny"
                  onClick={(e) => {
                    e.stopPropagation();
                    detectMood(c.id);
                  }}
                >
                  Detect mood
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <small className="muted">Conversation history saved</small>
        <button className="refresh" onClick={loadConversations}>
          Refresh
        </button>
      </div>
    </aside>
  );
}

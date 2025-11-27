// src/pages/ChatPage.jsx
import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

const API_BASE = import.meta.env.VITE_BACKEND_URL || '';

export default function ChatPage({ socket, user, token }) {
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const socketRef = useRef(socket);

  useEffect(() => { socketRef.current = socket; }, [socket]);

  async function handleNewChat() {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('start_session', { userId: user?.id || user?.email || 'guest' });
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/chat/sessions`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ userId: user?.id }) });
      if (!res.ok) throw new Error('create session failed');
      const json = await res.json();
      setSessionId(json.session.id);
      setSelectedSession(json.session);
    } catch (err) { console.error(err); }
  }

  async function handleSelectSession(sess) {
    setSelectedSession(sess);
    setSessionId(sess.id);
    try {
      const res = await fetch(`${API_BASE}/api/chat/sessions/${sess.id}/messages`);
      if (!res.ok) throw new Error('failed');
      const json = await res.json();
      localStorage.setItem('initialMessages', JSON.stringify(json.messages || []));
      if (socketRef.current) socketRef.current.emit('get_context', { n: 50 });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="page chat-page">
      <Sidebar
        apiBase={API_BASE}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        selectedSessionId={selectedSession?.id}
      />

      <div className="main-column">
        <ChatWindow socket={socket} sessionId={sessionId} onStartSession={() => {
          if (socketRef.current) socketRef.current.emit('start_session', { userId: user?.id || user?.email || 'guest' });
        }} initialMessages={JSON.parse(localStorage.getItem('initialMessages') || '[]')} />
      </div>
    </div>
  );
}

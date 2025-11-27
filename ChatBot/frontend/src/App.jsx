import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import ChatWindow from './components/ChatWindow';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Signup from './components/Signup';
import './styles.css';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function AppShell() {
  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem('user');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [sessionId, setSessionId] = useState(null);
  const [socketReady, setSocketReady] = useState(false);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [initialMessages, setInitialMessages] = useState([]);

  function createSocket(currentToken) {
    if (socketRef.current) {
      try { socketRef.current.disconnect(); } catch (e) {}
      socketRef.current = null;
      setSocketReady(false);
      setSocket(null);
    }

    const opts = { transports: ['websocket'], auth: currentToken ? { token: currentToken } : {} };
    const s = io(BACKEND, opts);

    s.on('connect', () => {
      console.log('socket connected', s.id);
      setSocketReady(true);
    });

    s.on('disconnect', (reason) => {
      console.log('socket disconnected', reason);
      setSocketReady(false);
    });

    s.on('session_started', (data) => {
      if (data?.sessionId) {
        setSessionId(data.sessionId);
        setSelectedConv(null);
        setInitialMessages([]);
        setTimeout(() => loadConversations(), 300);
      }
    });

    s.on('conversations_updated', () => loadConversations());

    socketRef.current = s;
    setSocket(s);
    return s;
  }

  useEffect(() => {
    if (token) createSocket(token);

    return () => {
      if (socketRef.current) {
        try { socketRef.current.disconnect(); } catch (e) {}
        socketRef.current = null;
      }
      setSocket(null);
    };
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      if (!token) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setSocketReady(false);
        setSessionId(null);
        return;
      }
      createSocket(token);
    } else if (token) {
      createSocket(token);
    }
  }, [token]);

  function handleAuthSuccess(userObj, tokenString) {
    const tk = tokenString || localStorage.getItem('token');
    if (tk) {
      localStorage.setItem('token', tk);
      setToken(tk);
    }
    if (userObj) {
      localStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);
    }
    if (!socketRef.current && (tk || token)) createSocket(tk || token);
    navigate('/', { replace: true });
    setTimeout(() => loadConversations(), 300);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setSessionId(null);
    setSelectedConv(null);
    setInitialMessages([]);
    if (socketRef.current) {
      try { socketRef.current.disconnect(); } catch (e) {}
      socketRef.current = null;
    }
    setSocket(null);
    navigate('/login', { replace: true });
  }

  function startSession() {
    if (!socket) return alert('Socket not ready');
    const userId = user?.id || user?._id || user?.email || `guest-${Date.now()}`;
    socket.emit('start_session', { userId });
  }

  async function loadConversations() {
    try {
      const res = await fetch(`${BACKEND.replace(/\/$/, '')}/api/conversations`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      if (!res.ok) {
        console.warn('Failed loading conversations', res.status);
        setConversations([]);
        return;
      }
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('loadConversations error', err);
      setConversations([]);
    }
  }

  async function fetchConversationMessages(convId) {
    try {
      const res = await fetch(`${BACKEND.replace(/\/$/, '')}/api/conversations/${convId}/messages`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      if (!res.ok) {
        console.warn('Failed to fetch messages for', convId, res.status);
        return [];
      }
      const msgs = await res.json();
      return (Array.isArray(msgs) ? msgs : []).map(m => ({
        id: m._id || `${m.role}-${Date.now()}`,
        role: m.role,
        text: m.text,
        meta: m.meta || {},
        createdAt: m.createdAt || m.ts
      }));
    } catch (err) {
      console.warn('fetchConversationMessages error', err);
      return [];
    }
  }

  async function handleSelectConversation(conv) {
    if (!conv || !conv.id) return;
    setSelectedConv(conv);
    setSessionId(conv.id);
    const msgs = await fetchConversationMessages(conv.id);
    setInitialMessages(msgs);
  }

  async function handleNewChat() {
    startSession();
    setTimeout(() => loadConversations(), 500);
  }

  useEffect(() => {
    loadConversations();
    const id = setInterval(() => loadConversations(), 8000);
    if (socket) {
      socket.on('bot_message', loadConversations);
      socket.on('connect', loadConversations);
    }

    return () => {
      clearInterval(id);
      if (socket) {
        socket.off('bot_message', loadConversations);
        socket.off('connect', loadConversations);
      }
    };
  }, [socket, token]);

  return (
    <div className="app" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0 }}>Realtime Chatbot — Grammar + Mood</h1>
          <p className="subtitle" style={{ margin: '6px 0 0' }}>
            {user ? `Signed in as ${user.name || user.email}` : 'Please login'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ fontSize: 13, color: '#6b7280' }}>{socketReady ? '🟢 Connected' : '🔴 Disconnected'}</div>
          {user && <button onClick={() => startSession()} style={{ padding: '8px 10px', borderRadius: 8, cursor: 'pointer' }}>Start Session</button>}
          {user ? <button onClick={() => logout()} style={{ padding: '8px 10px', borderRadius: 8, cursor: 'pointer', background: '#ef4444', color: '#fff', border: 'none' }}>Logout</button> : null}
        </div>
      </header>

      <main style={{ display: 'flex', gap: 18, padding: '18px' }}>
        <div style={{ width: 300 }}>
          <Sidebar
            socket={socket}
            sessionId={sessionId}
            onStartSession={handleNewChat}
            onSelectConversation={handleSelectConversation}
          />
        </div>

        <div style={{ flex: 1 }}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ChatWindow
                    socket={socket}
                    sessionId={sessionId}
                    onStartSession={() => startSession()}
                    initialMessages={initialMessages}
                  />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login onAuthSuccess={handleAuthSuccess} />} />
            <Route path="/signup" element={<Signup onAuthSuccess={handleAuthSuccess} />} />
          </Routes>
        </div>
      </main>

      <footer className="app-footer" style={{ textAlign: 'center', padding: 12 }}>
        <small>Backend: {BACKEND}</small>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

// src/App.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import io from "socket.io-client";

import ChatWindow from "./components/ChatWindow";
import Sidebar from "./components/Sidebar";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ProtectedRoute from "./components/ProtectedRoute";

import "./styles.css";

const BACKEND =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

function AppShell() {
  const navigate = useNavigate();

  /* ================= THEME ================= */

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  /* ================= AUTH ================= */

  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem("user");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() =>
    localStorage.getItem("token")
  );

  const [sessionId, setSessionId] = useState(null);
  const [initialMessages, setInitialMessages] = useState([]);

  /* ================= SOCKET ================= */

  const socketRef = useRef(null);
  const autoSessionStarted = useRef(false); // 🔥 prevents duplicates

  const [socket, setSocket] = useState(null);
  const [socketReady, setSocketReady] = useState(false);

  function createSocket(authToken) {
    if (!authToken) return;

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const s = io(BACKEND, {
      transports: ["websocket"],
      auth: { token: authToken },
    });

    s.on("connect", () => {
      console.log("✅ Socket connected");
      setSocketReady(true);
    });

    s.on("disconnect", (reason) => {
      console.warn("❌ Socket disconnected:", reason);
      setSocketReady(false);
    });

    s.on("connect_error", (err) => {
      console.error("❌ Socket error:", err.message);
      setSocketReady(false);
    });

    s.on("session_started", ({ sessionId }) => {
      setSessionId(sessionId);
      setInitialMessages([]);
    });

    socketRef.current = s;
    setSocket(s);
  }

  useEffect(() => {
    if (!token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
      setSocketReady(false);
      autoSessionStarted.current = false;
      return;
    }

    createSocket(token);

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /* ================= AUTO SESSION (🔥 NEW) ================= */

  useEffect(() => {
    if (!socket || !socketReady) return;

    // prevent duplicate auto sessions
    if (autoSessionStarted.current) return;

    socket.emit("start_session");
    autoSessionStarted.current = true;

    console.log("🚀 Auto session started");
  }, [socket, socketReady]);

  /* ================= AUTH ACTIONS ================= */

  function handleAuthSuccess(userObj, tokenString) {
    localStorage.clear();
    localStorage.setItem("token", tokenString);
    localStorage.setItem("user", JSON.stringify(userObj));
    localStorage.setItem("theme", theme);

    setUser(userObj);
    setToken(tokenString);

    navigate("/", { replace: true });
  }

  function logout() {
    const savedTheme = localStorage.getItem("theme");

    localStorage.clear();
    if (savedTheme) localStorage.setItem("theme", savedTheme);

    setUser(null);
    setToken(null);
    setSessionId(null);
    setInitialMessages([]);

    socketRef.current?.disconnect();
    socketRef.current = null;
    setSocket(null);
    setSocketReady(false);
    autoSessionStarted.current = false;

    navigate("/login", { replace: true });
  }

  /* ================= CHAT ================= */

  function startSession() {
    if (!socket || !socketReady) return;
    socket.emit("start_session");
  }

  /* ================= UI ================= */

  return (
    <div
      className="app"
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      {/* HEADER */}
      <header className="app-header">
        <div>
          <h1>Realtime Chatbot — Grammar + Mood</h1>
          <p className="subtitle">
            {user
              ? `Signed in as ${user.name || user.email}`
              : "Please login"}
          </p>
        </div>

        <div className="header-actions">
          {/* 🌗 THEME TOGGLE */}
          <button
            className="theme-toggle"
            onClick={() =>
              setTheme(theme === "dark" ? "light" : "dark")
            }
            title="Toggle theme"
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>

          {user && (
            <>
              <span className="connection-status">
                <span
                  className={socketReady ? "dot green" : "dot red"}
                />
                {socketReady ? "Connected" : "Disconnected"}
              </span>

              <button
                className="header-btn start"
                onClick={startSession}
                disabled={!socketReady}
              >
                ▶ Start Session
              </button>

              <button
                className="header-btn logout"
                onClick={logout}
              >
                ⏻ Logout
              </button>
            </>
          )}
        </div>
      </header>

      {/* ROUTES */}
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div style={{ display: "flex", padding: 18, gap: 18 }}>
                <Sidebar
                  socket={socket}
                  sessionId={sessionId}
                  onStartSession={startSession}
                  onSelectConversation={(conv) =>
                    setSessionId(conv.id)
                  }
                />

                <ChatWindow
                  socket={socket}
                  sessionId={sessionId}
                  onStartSession={startSession}
                  initialMessages={initialMessages}
                />
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/login"
          element={<Login onAuthSuccess={handleAuthSuccess} />}
        />
        <Route
          path="/signup"
          element={<Signup onAuthSuccess={handleAuthSuccess} />}
        />
      </Routes>

      <footer className="app-footer">
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

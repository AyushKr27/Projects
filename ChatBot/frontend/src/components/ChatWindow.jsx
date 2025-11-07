import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import debounce from "lodash.debounce";

const socket = io("http://localhost:5000");

const moodStyles = {
  excited: { color: "#FFB300", emoji: "🤩" },
  love: { color: "#FF69B4", emoji: "❤️" },
  sad: { color: "#1E90FF", emoji: "😢" },
  angry: { color: "#FF4500", emoji: "😡" },
  nervous: { color: "#9370DB", emoji: "😰" },
  surprise: { color: "#FFD700", emoji: "😲" },
  bored: { color: "#A9A9A9", emoji: "🥱" },
  tired: { color: "#708090", emoji: "😴" },
  confident: { color: "#00CED1", emoji: "😎" },
  disgusted: { color: "#556B2F", emoji: "🤢" },
  hopeful: { color: "#32CD32", emoji: "🤞" },
  relaxed: { color: "#20B2AA", emoji: "😌" },
  neutral: { color: "#C0C0C0", emoji: "😐" },
};

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const [typingMood, setTypingMood] = useState("neutral");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/chat/history")
      .then((res) => setMessages(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    socket.on("receive_message", (msg) =>
      setMessages((prev) => [...prev, msg])
    );

    socket.on("user_typing", ({ user, mood }) => {
      setTypingUser(user);
      setTypingMood(mood);
      setTimeout(() => setTypingUser(null), 2000);
    });

    socket.on("clear_chat", () => setMessages([]));

    return () => {
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("clear_chat");
    };
  }, []);

  const sendMessage = () => {
    if (!text.trim()) return;
    const newMessage = { user: "User", message: text };
    socket.emit("send_message", newMessage);
    setText("");
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    detectMoodDebounced(e.target.value);
  };

  const detectMoodDebounced = useRef(
    debounce(async (msg) => {
      if (!msg.trim()) return;
      try {
        const res = await axios.post("http://localhost:5000/api/mood", { text: msg });
        const mood = res.data.mood || "neutral";
        socket.emit("typing", { user: "User", text: msg, mood });
      } catch (err) {
        console.error(err);
      }
    }, 500)
  ).current;

  const clearChat = async () => {
    try {
      await axios.delete("http://localhost:5000/api/chat/clear");
      setMessages([]);
    } catch (err) {
      console.error("❌ Failed to clear chat:", err);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span role="img" aria-label="Bot" style={{ fontSize: "2rem" }}>
          🤖
        </span>
        <span>Real-Time Mood Chat</span>
        <button onClick={clearChat} style={styles.clearButton}>
          Clear Chat
        </button>
      </div>

      <div style={styles.chatBox}>
        {messages.map((msg, i) => {
          const mood = msg.mood || "neutral";
          const { color, emoji } = moodStyles[mood] || moodStyles.neutral;
          return (
            <div
              key={msg._id || i}
              style={{
                ...styles.messageRow,
                flexDirection: msg.user === "User" ? "row-reverse" : "row",
              }}
            >
              <div
                style={{
                  ...styles.avatar,
                  background: msg.user === "User" ? "#498afb" : "#6347f5",
                }}
              >
                {msg.user === "User" ? "U" : "B"}
              </div>
              <div
                style={{
                  ...(msg.user === "User"
                    ? styles.bubbleUser
                    : styles.bubbleBot),
                  border: `2px solid ${color}`,
                }}
              >
                <strong>{msg.user}:</strong> {msg.message}{" "}
                <span style={{ color }}>{emoji} ({mood})</span>
              </div>
            </div>
          );
        })}

        {typingUser && (
          <div style={{ marginTop: "10px", fontStyle: "italic", color: "#b0afbb" }}>
            {typingUser} is typing... {moodStyles[typingMood]?.emoji || "😐"} ({typingMood})
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div style={styles.inputBox}>
        <input
          type="text"
          placeholder="Type your message..."
          value={text}
          onChange={handleTyping}
          style={styles.input}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} style={styles.button}>
          Send
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: "100%",
    maxWidth: "450px",
    margin: "40px auto",
    boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
    borderRadius: "20px",
    background: "#1f2128",
    color: "#fff",
    overflow: "hidden",
    fontFamily: "'Inter', Helvetica, Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    background: "linear-gradient(90deg, #6347f5, #498afb)",
    padding: "16px 20px",
    fontSize: "1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    fontWeight: "600",
    color: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
  clearButton: {
    padding: "6px 12px",
    background: "#ff4d4f",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  chatBox: {
    padding: "20px 16px",
    height: "380px",
    overflowY: "auto",
    background: "#1f2128",
    scrollbarWidth: "thin",
    scrollbarColor: "#6347f5 #1f2128",
  },
  messageRow: {
    display: "flex",
    alignItems: "flex-end",
    marginBottom: "14px",
  },
  avatar: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "10px",
    fontWeight: "bold",
    fontSize: "1rem",
    flexShrink: 0,
    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
  },
  bubbleUser: {
    background: "linear-gradient(135deg, #498afb, #2c6dfb)",
    color: "#fff",
    borderRadius: "16px 16px 4px 16px",
    padding: "12px 18px",
    maxWidth: "75%",
    marginLeft: "auto",
  },
  bubbleBot: {
    background: "linear-gradient(135deg, #383c57, #4b5075)",
    color: "#fff",
    borderRadius: "16px 16px 16px 4px",
    padding: "12px 18px",
    maxWidth: "75%",
  },
  inputBox: {
    display: "flex",
    gap: "12px",
    padding: "16px",
    background: "#292d34",
    borderTop: "1px solid #3a3f4c",
  },
  input: {
    flex: 1,
    borderRadius: "20px",
    padding: "12px 16px",
    border: "none",
    outline: "none",
    background: "#23272f",
    color: "#fff",
    fontSize: "1rem",
  },
  button: {
    padding: "12px 22px",
    background: "#6347f5",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "1rem",
    boxShadow: "0 4px 12px rgba(99,71,245,0.3)",
  },
};

export default ChatWindow;

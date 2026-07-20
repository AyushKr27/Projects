import React, { useState, useEffect } from "react";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export default function AuthForm({
  mode = "login",
  onAuthSuccess,
  onSwitch,
  persistOnSuccess = true,
}) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setError("");
    setFieldError({});
    setForm({ name: "", email: "", password: "" });
    setShowPassword(false);
  }, [mode]);

  function validate() {
    const errs = {};
    if (mode === "signup" && !form.name.trim()) errs.name = "Name is required";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email";
    if (!form.password || form.password.length < 6)
      errs.password = "Password must be at least 6 characters";

    setFieldError(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);

    const payload = {
      name: form.name?.trim(),
      email: form.email?.trim().toLowerCase(),
      password: form.password,
    };

    const endpoint = `${BACKEND.replace(/\/$/, "")}/api/auth/${
      mode === "login" ? "login" : "signup"
    }`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || data?.error || "Authentication failed");
      }

      // 🔥 FIX: accept accessToken from backend
      const token = data.accessToken || data.token;
      const user = data.user;

      if (!token || !user) {
        throw new Error("Invalid server response: missing token or user");
      }

      // optional persistence (Login.jsx already handles this, but keeping safe)
      if (persistOnSuccess) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      }

      if (typeof onAuthSuccess === "function") {
        onAuthSuccess(user, token);
      }
    } catch (err) {
      setError(err?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card" role="form" aria-busy={loading}>
      <h2 className="auth-title">
        {mode === "login" ? "Welcome Back 👋" : "Create Account ✨"}
      </h2>

      <form onSubmit={handleSubmit} noValidate>
        {mode === "signup" && (
          <div className="form-group">
            <label>Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            {fieldError.name && <div className="field-error">{fieldError.name}</div>}
          </div>
        )}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          {fieldError.email && <div className="field-error">{fieldError.email}</div>}
        </div>

        <div className="form-group" style={{ position: "relative" }}>
          <label>Password</label>
          <input
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            style={{
              position: "absolute",
              right: 10,
              top: 32,
              background: "transparent",
              border: "none",
              color: "#2563eb",
              cursor: "pointer",
            }}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
          {fieldError.password && (
            <div className="field-error">{fieldError.password}</div>
          )}
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button type="submit" disabled={loading} className="auth-btn">
          {loading ? "⏳ Please wait..." : mode === "login" ? "Login" : "Sign Up"}
        </button>
      </form>

      <p className="auth-footer">
        {mode === "login" ? "Don't have an account? " : "Already have an account? "}
        <button
          type="button"
          onClick={() => onSwitch?.(mode === "login" ? "signup" : "login")}
          style={{ background: "none", border: "none", color: "#2563eb" }}
        >
          {mode === "login" ? "Sign Up" : "Login"}
        </button>
      </p>
    </div>
  );
}

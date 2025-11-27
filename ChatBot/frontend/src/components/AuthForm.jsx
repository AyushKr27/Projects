import React, { useState, useEffect } from 'react';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

export default function AuthForm({
  mode = 'login',
  onAuthSuccess,
  onSwitch,
  persistOnSuccess = true,
}) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setError('');
    setFieldError({});
    setForm({ name: '', email: '', password: '' });
    setShowPassword(false);
  }, [mode]);

  function validate() {
    const errs = {};
    if (mode === 'signup' && !form.name.trim()) errs.name = 'Name is required';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setFieldError(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);

    const payload = {
      name: form.name?.trim(),
      email: form.email?.trim().toLowerCase(),
      password: form.password
    };

    const endpoint = `${BACKEND.replace(/\/$/, '')}/api/auth/${mode === 'login' ? 'login' : 'signup'}`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const txt = await res.text();
      let data = {};
      if (txt) {
        try {
          data = JSON.parse(txt);
        } catch (e) {
          throw new Error(`Server error: ${txt}`);
        }
      }

      if (!res.ok) {
        const msg = data?.message || data?.error || `Request failed (status ${res.status})`;
        throw new Error(msg);
      }

      if (!data?.token || !data?.user) {
        if (mode === 'signup') {
          if (typeof onAuthSuccess === 'function') onAuthSuccess(data?.user || null, data?.token || null);
          setLoading(false);
          return;
        }
        throw new Error('Invalid server response: missing token or user');
      }

      if (persistOnSuccess) {
        try {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        } catch (e) {
          console.warn('Failed to persist auth data', e);
        }
      }

      if (typeof onAuthSuccess === 'function') onAuthSuccess(data.user, data.token);
    } catch (err) {
      setError(err?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-card" role="form" aria-labelledby="auth-title" aria-busy={loading}>
      <h2 id="auth-title" className="auth-title">
        {mode === 'login' ? 'Welcome Back 👋' : 'Create Account ✨'}
      </h2>

      <form onSubmit={handleSubmit} noValidate>
        {mode === 'signup' && (
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter your name"
              aria-invalid={Boolean(fieldError.name)}
              aria-describedby={fieldError.name ? 'err-name' : undefined}
              required
            />
            {fieldError.name && <div id="err-name" className="field-error">{fieldError.name}</div>}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            aria-invalid={Boolean(fieldError.email)}
            aria-describedby={fieldError.email ? 'err-email' : undefined}
            required
          />
          {fieldError.email && <div id="err-email" className="field-error">{fieldError.email}</div>}
        </div>

        <div className="form-group" style={{ position: 'relative' }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            aria-invalid={Boolean(fieldError.password)}
            aria-describedby={fieldError.password ? 'err-password' : undefined}
            required
          />
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((s) => !s)}
            style={{
              position: 'absolute',
              right: 10,
              top: 34,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#2563eb',
              fontSize: 14
            }}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>

          {fieldError.password && <div id="err-password" className="field-error">{fieldError.password}</div>}
        </div>

        {error && <div role="alert" className="auth-error" style={{ marginBottom: 12 }}>{error}</div>}

        <button
          type="submit"
          className="auth-btn"
          disabled={loading}
          aria-disabled={loading}
        >
          {loading ? '⏳ Please wait...' : mode === 'login' ? 'Login' : 'Sign Up'}
        </button>
      </form>

      <p className="auth-footer" style={{ marginTop: 14 }}>
        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
        <button
          type="button"
          className="auth-switch"
          onClick={() => {
            if (typeof onSwitch === 'function') onSwitch(mode === 'login' ? 'signup' : 'login');
            else window.location.reload();
          }}
          style={{ background: 'transparent', border: 'none', color: '#2563eb', cursor: 'pointer' }}
        >
          {mode === 'login' ? 'Sign Up' : 'Login'}
        </button>
      </p>
    </div>
  );
}

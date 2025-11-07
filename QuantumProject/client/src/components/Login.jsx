import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setLoading(false);
      navigate('/dashboard');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="card form-card">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
        </label>
        <div className="form-actions">
          <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
        </div>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}

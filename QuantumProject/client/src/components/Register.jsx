import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function Register() {
  const [form, setForm] = useState({ name: '', dob: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {

      const payload = { ...form, dob: form.dob };
      const { data } = await api.post('/register', payload);
      
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
      <h2>Create account</h2>
      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          Date of birth
          <input name="dob" type="date" value={form.dob} onChange={handleChange} required />
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} />
        </label>

        <div className="form-actions">
          <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Register'}</button>
        </div>

        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}

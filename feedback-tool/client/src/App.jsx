import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import FeedbackForm from './pages/FeedbackForm';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import './styles.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  return (
    <>
      <header style={{ padding: '10px', textAlign: 'right' }}>
        <button className='darkmode' onClick={toggleDarkMode}>
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </header>

      <Routes>
        <Route path="/" element={<FeedbackForm />} />
        <Route path="/admin/login" element={<AdminLogin onLogin={handleLogin} />} />
        <Route
          path="/admin/dashboard"
          element={isLoggedIn ? <AdminDashboard /> : <Navigate to="/admin/login" replace />}
        />
      </Routes>
    </>
  );
};

export default App;

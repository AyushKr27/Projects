import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <div className="app-root">
      <nav className="top-nav">
        <Link to="/">Home</Link>
        <Link to="/register">Register</Link>
        <Link to="/login">Login</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>
      <main className="container">
        <Routes>
          <Route path="/" element={<div style={{padding:20}}><h2>Welcome</h2><p>Use the links to register or login.</p></div>} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

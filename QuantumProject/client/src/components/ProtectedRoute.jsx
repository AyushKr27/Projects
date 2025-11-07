import React, { useEffect, useState } from 'react';
import { Navigate, useInRouterContext } from 'react-router-dom';
import api from '../api';


export default function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const insideRouter = useInRouterContext();

  useEffect(() => {
    const check = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setAllowed(false);
        setChecking(false);
        return;
      }
      try {
        await api.get('/me');
        setAllowed(true);
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAllowed(false);
      } finally {
        setChecking(false);
      }
    };
    check();
  }, []);
  if (!insideRouter) {
    return <div style={{ padding: 20 }}>Router not initialized yet...</div>;
  }
  if (checking) return <div style={{ padding: 20 }}>Checking authentication...</div>;
  if (!allowed) return <Navigate to="/login" replace />;

  return children;
}

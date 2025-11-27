import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

export default function Signup() {
  const navigate = useNavigate();

  function handleAuthSuccess(user) {
    navigate('/login', { replace: true });
  }

  return (
    <div className="auth-page-wrapper">
      <main className="auth-main">
        <div className="auth-column">
          <AuthForm
            mode="signup"
            persistOnSuccess={false}
            onAuthSuccess={handleAuthSuccess}
            onSwitch={(next) => { if (next === 'login') navigate('/login'); }}
          />

          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <small>
              Already have an account? <Link to="/login">Login</Link>
            </small>
          </div>
        </div>
      </main>
    </div>
  );
}

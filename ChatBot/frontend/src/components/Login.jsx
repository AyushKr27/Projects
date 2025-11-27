import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

export default function Login() {
  const navigate = useNavigate();

  function handleAuthSuccess(user, token) {
    navigate('/', { replace: true });
  }

  return (
    <div className="auth-page-wrapper">
      <main className="auth-main">
        <div className="auth-column">
          <AuthForm
            mode="login"
            onAuthSuccess={handleAuthSuccess}
            onSwitch={(next) => {
              if (next === 'signup') navigate('/signup');
            }}
          />
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <small>
              New here? <Link to="/signup">Create account</Link>
            </small>
          </div>
        </div>
      </main>
    </div>
  );
}

import React, { useState } from 'react';

import { BASE_URL } from '../utils/network';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed. Please check your credentials.');
      }

      const data = await response.json();
      
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      onLogin(data.user || data);
    } catch (err) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-visual-pane">
        <div className="login-visual-content">
          <div className="logo-icon-box" style={{ width: 64, height: 64, borderRadius: 16, marginBottom: 32 }}>
            <span className="material-icons" style={{ fontSize: 32 }}>
              route
            </span>
          </div>
          <h1 className="login-headline">
            The next generation of <br />
            <span style={{ color: '#60a5fa' }}>fleet intelligence.</span>
          </h1>
          <p className="login-subheadline">
            Optimize routes, manage dispatch, and track performance in real-time with Trackify's premium ecosystem.
          </p>

          {/* Decorative stats card */}
          <div className="login-floating-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="icon-box green">
                  <span className="material-icons" style={{ fontSize: 20 }}>
                    trending_up
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>FLEET EFFICIENCY</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)' }}>+24.8%</div>
                </div>
              </div>
            </div>
            <div className="progress-track" style={{ marginTop: 16 }}>
              <div className="progress-fill" style={{ width: '85%', background: 'var(--success)' }}></div>
            </div>
          </div>
        </div>
        <div className="login-visual-bg"></div>
      </div>

      <div className="login-form-pane">
        <div className="login-form-container">
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>
              Welcome back
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
              Please enter your details to access your dashboard.
            </p>
          </div>

          {error && (
            <div style={{ marginBottom: 24, padding: '12px 16px', background: 'var(--error-light)', color: 'var(--error)', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <span className="material-icons input-icon">mail</span>
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  placeholder="admin@trackify.inc"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="password">Password</label>
                <a href="#" className="forgot-password">Forgot password?</a>
              </div>
              <div className="input-wrapper">
                <span className="material-icons input-icon">lock</span>
                <input
                  type="password"
                  id="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className={`login-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
              {isLoading ? (
                <span className="spinner"></span>
              ) : (
                'Sign in to your account'
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 32, fontSize: 13, color: 'var(--text-muted)' }}>
            Don't have an account? <a href="#" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Request access</a>
          </p>
        </div>
      </div>
    </div>
  );
}

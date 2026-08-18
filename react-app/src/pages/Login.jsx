import React, { useState } from 'react';

import { BASE_URL } from '../utils/network';
import TrackifyLoader from '../components/TrackifyLoader';

export default function Login({ onLogin, logoUrl }) {
  const [view, setView] = useState('login'); // 'login' | 'forgot'
  const [resetStatus, setResetStatus] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
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

  const handleQuickLogin = (quickEmail, quickPassword) => {
    setIsLoading(true);
    setError(null);


    fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': '*/*'
      },
      body: JSON.stringify({ email: quickEmail, password: quickPassword }),
    })
      .then(r => {
        if (!r.ok) throw new Error('Login failed. Please check your credentials.');
        return r.json();
      })
      .then(data => {
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        onLogin(data.user || data);
      })
      .catch(err => {
        setError(err.message || 'An error occurred during login.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResetStatus('');
    try {
      const response = await fetch(`${BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok || data.status === false || data.status === "false") throw new Error(data.message || 'Failed to send OTP.');
      setResetStatus('OTP has been sent to your email.');
      setView('verify');
    } catch (err) {
      setResetStatus(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResetStatus('');
    try {
      const response = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (!response.ok || data.status === false || data.status === "false") throw new Error(data.message || 'Invalid OTP.');
      setResetStatus('OTP verified successfully. Please enter a new password.');
      setView('reset');
    } catch (err) {
      setResetStatus(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResetStatus('');
    try {
      const response = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password: newPassword }),
      });
      const data = await response.json();
      if (!response.ok || data.status === false || data.status === "false") throw new Error(data.message || 'Failed to reset password.');
      setResetStatus('Password reset successful. You can now login.');
      setView('login');
      setOtp('');
      setNewPassword('');
    } catch (err) {
      setResetStatus(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-visual-pane">
        <div className="login-visual-content">
          <div style={{ height: '80px', marginBottom: '32px', display: 'flex', alignItems: 'center' }}>
            <img src={logoUrl || "https://trackifybackend.inurum.com/uploads/1783601815708.png"} alt="Logo" style={{ maxHeight: '80px', maxWidth: '240px', objectFit: 'contain' }} />
          </div>
          <h1 className="login-headline">
            The next generation of <br />
            <span style={{ color: '#60a5fa' }}>fleet intelligence.</span>
          </h1>
          <p className="login-subheadline">
            Optimize routes, manage dispatch, and track performance in real-time with Trackify's premium ecosystem.
          </p>

        </div>
        <div className="login-visual-bg"></div>
      </div>

      <div className="login-form-pane">
        <div className="login-form-container" style={{ position: 'relative' }}>
          {isLoading && (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-main)', zIndex: 1000, borderRadius: '12px' }}>
              <TrackifyLoader size={200} animated={true} message="Authenticating..." showPercentage={true} />
            </div>
          )}
          {view === 'login' ? (
            <>
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
                    <a href="#" className="forgot-password" onClick={(e) => { e.preventDefault(); setView('forgot'); setResetStatus(''); }}>Forgot password?</a>
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

              {/* Quick Login Section */}
              <div style={{ marginTop: 32, padding: 16, background: 'var(--bg-elevated)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 12 }}>Quick Login (Demo)</h4>
                <div
                  onClick={() => handleQuickLogin('mahi@gmail.com', '123456')}
                  style={{ padding: '12px 16px', background: 'var(--primary-light)', borderRadius: 8, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', border: '1px solid transparent' }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>Admin User</div>
                    <div style={{ fontSize: 11, color: 'var(--primary)', opacity: 0.8 }}>mahi@gmail.com</div>
                  </div>
                  <span className="material-icons" style={{ color: 'var(--primary)', fontSize: 20 }}>login</span>
                </div>
              </div>
            </>
          ) : view === 'forgot' ? (
            <>
              <div style={{ marginBottom: 40 }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>
                  Reset Password
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
                  Enter your email address and we'll send you an OTP to reset your password.
                </p>
              </div>

              {resetStatus && (
                <div style={{ marginBottom: 24, padding: '12px 16px', background: resetStatus.includes('sent') || resetStatus.includes('successful') ? 'var(--success-light)' : 'var(--error-light)', color: resetStatus.includes('sent') || resetStatus.includes('successful') ? 'var(--success)' : 'var(--error)', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                  {resetStatus}
                </div>
              )}

              <form onSubmit={handleSendOtp} className="login-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="reset-email">Email Address</label>
                  <div className="input-wrapper">
                    <span className="material-icons input-icon">mail</span>
                    <input
                      type="email"
                      id="reset-email"
                      className="form-input"
                      placeholder="admin@trackify.inc"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className={`login-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
                  {isLoading ? <span className="spinner"></span> : 'Send OTP'}
                </button>
              </form>

              <p style={{ textAlign: 'center', marginTop: 32, fontSize: 14 }}>
                <a href="#" onClick={(e) => { e.preventDefault(); setView('login'); setResetStatus(''); }} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <span className="material-icons" style={{ fontSize: 18 }}>arrow_back</span>
                  Back to login
                </a>
              </p>
            </>
          ) : view === 'verify' ? (
            <>
              <div style={{ marginBottom: 40 }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>
                  Verify OTP
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
                  Please enter the 6-digit OTP sent to {email}.
                </p>
              </div>

              {resetStatus && (
                <div style={{ marginBottom: 24, padding: '12px 16px', background: resetStatus.includes('sent') || resetStatus.includes('successful') ? 'var(--success-light)' : 'var(--error-light)', color: resetStatus.includes('sent') || resetStatus.includes('successful') ? 'var(--success)' : 'var(--error)', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                  {resetStatus}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="login-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="otp">Enter OTP</label>
                  <div className="input-wrapper">
                    <span className="material-icons input-icon">password</span>
                    <input
                      type="text"
                      id="otp"
                      className="form-input"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className={`login-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
                  {isLoading ? <span className="spinner"></span> : 'Verify OTP'}
                </button>
              </form>
              <p style={{ textAlign: 'center', marginTop: 32, fontSize: 14 }}>
                <a href="#" onClick={(e) => { e.preventDefault(); setView('login'); setResetStatus(''); }} style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <span className="material-icons" style={{ fontSize: 18 }}>arrow_back</span>
                  Cancel
                </a>
              </p>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 40 }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>
                  Set New Password
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
                  Enter a strong new password for your account.
                </p>
              </div>

              {resetStatus && (
                <div style={{ marginBottom: 24, padding: '12px 16px', background: resetStatus.includes('sent') || resetStatus.includes('successful') ? 'var(--success-light)' : 'var(--error-light)', color: resetStatus.includes('sent') || resetStatus.includes('successful') ? 'var(--success)' : 'var(--error)', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                  {resetStatus}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="login-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="new-password">New Password</label>
                  <div className="input-wrapper">
                    <span className="material-icons input-icon">lock</span>
                    <input
                      type="password"
                      id="new-password"
                      className="form-input"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className={`login-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
                  {isLoading ? <span className="spinner"></span> : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

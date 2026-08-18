import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../utils/network';

export default function Header({ onLogout, onMenuClick, title, subtitle, theme, toggleTheme }) {
  const [user, setUser] = useState(null);
  const userId = user?.id || user?._id || localStorage.getItem('userId');
  useEffect(() => {
    if (!userId) return;

    fetch(`${BASE_URL}/user/userList/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.data?.length > 0) {
          setUser(data.data[0]);
        }
      })
      .catch((err) => console.error('API Error:', err));
  }, [userId]);
  return (
    <header className="glass">
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
        <button
          onClick={onMenuClick}
          className="menu-toggle-btn"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-main)',
            cursor: 'pointer',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 8
          }}
        >
          <span className="material-icons">menu</span>
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
          <h2 className="text-gradient" style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: '800', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.5px' }}>
            {title || 'Dashboard'}
          </h2>
          {subtitle && (
            <p className="hide-on-mobile-small" style={{ margin: 0, fontSize: 'clamp(11px, 2.5vw, 13px)', color: 'var(--text-muted)', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="header-center">
      </div>

      <div className="header-right" style={{ display: 'flex', gap: 'clamp(8px, 2vw, 24px)', alignItems: 'center', flexShrink: 0 }}>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-main)', color: 'var(--text-main)',
            border: '1px solid var(--border)', borderRadius: '12px',
            width: 40, height: 40, cursor: 'pointer', transition: 'all 0.2s',
          }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <span className="material-icons" style={{ fontSize: 20 }}>
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="hide-on-mobile" style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>
              {user?.name || 'Loading...'}
            </p>

            <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, margin: 0 }}>
              {(user?.role || '').toLowerCase() === 'superadmin' ? 'Superadmin' : (user?.role || '').toLowerCase() === 'admin' ? 'Admin' : 'Customer'}
            </p>

            {/* Optional location */}
            {/* <p style={{ fontSize: 10, color: '#cbd5f5' }}>
              {user?.city}, {user?.state}
            </p> */}
          </div>
          <img
            src={
              user?.userProfile
                ? (user.userProfile.startsWith('http') ? user.userProfile : `${BASE_URL}/${user.userProfile}`)
                : 'https://trackifybackend.inurum.com//uploads/1775477571309.png'
            }
            alt={user?.name}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #e2e8f0'
            }}
          />
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--error-light)',
            color: 'var(--error)',
            border: 'none',
            borderRadius: '12px',
            width: 44,
            height: 44,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          title="Logout"
          onMouseEnter={(e) => (e.currentTarget.style.background = '#fecaca')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--error-light)')}
        >
          <span className="material-icons" style={{ fontSize: 20 }}>logout</span>
        </button>
      </div>
    </header>
  );
}

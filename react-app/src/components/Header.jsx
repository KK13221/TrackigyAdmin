import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../utils/network';

export default function Header({ onLogout, onMenuClick  }) {
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
    <header>
      <div className="header-left" style={{ width: 140 }}>
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
      </div>

      <div className="header-center">
        <div className="search-pill">
          <span className="material-icons" style={{ fontSize: 20, color: '#94a3b8' }}>
            search
          </span>
          <input type="text" placeholder="Search fleet, drivers, or orders..." />
        </div>

        <ul className="nav-tabs">
          <li className="tab-item active">Workspaces</li>
          <li className="tab-item">Analytics</li>
        </ul>
      </div>

      <div className="header-right" style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <span className="material-icons" style={{ color: '#64748b', cursor: 'pointer' }}>
          notifications_none
        </span>
        <span className="material-icons" style={{ color: '#64748b', cursor: 'pointer' }}>
          apps
        </span>

        <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 14, fontWeight: 700 }}>
              {user?.name || 'Loading...'}
            </p>

            <p style={{ fontSize: 11, color: '#94a3b8' }}>
              {user?.role || ''}
            </p>

            {/* Optional location */}
            {/* <p style={{ fontSize: 10, color: '#cbd5f5' }}>
              {user?.city}, {user?.state}
            </p> */}
          </div>
      <img
            src={
              user?.userProfile ||
              'https://i.pravatar.cc/150'
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

import React from 'react';

const navItems = [
  { icon: 'grid_view', label: 'Dashboard', view: 'dashboard' },
  { icon: 'explore', label: 'Live Tracking', view: 'live-tracking' },
  { icon: 'local_shipping', label: 'Vehicles', view: 'fleet' },
  { icon: 'people_alt', label: 'Drivers', view: 'drivers' },
  { icon: 'shopping_cart', label: 'Orders', view: 'orders' },
  { icon: 'route', label: 'Trips', view: 'trips' },
  { icon: 'event_note', label: 'Dispatch Board', view: 'dispatch' },
  { icon: 'bar_chart', label: 'Reports', view: 'reports' },
];

const footerItems = [
  { icon: 'settings', label: 'Settings', view: 'settings' },
  { icon: 'help_outline', label: 'Support', view: 'support' },
];

export default function Sidebar({ activeView, onNavigate, isOpen }) {
  return (
    <aside id="sidebar" className={isOpen ? 'open' : ''}>
      <div className="logo-container">
        <div className="logo-icon-box">
          <span className="material-icons">local_shipping</span>
        </div>
        <div className="logo-text-group">
          <span className="logo-text">Trackify</span>
          <span className="logo-subtitle">Fleet Intelligence</span>
        </div>
      </div>

      <nav id="nav-links">
        {navItems.map((item) => (
          <button
            key={item.view}
            className={`nav-link ${activeView === item.view ? 'active' : ''}`}
            onClick={() => onNavigate(item.view)}
          >
            <span className="material-icons">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer" style={{ padding: 16, marginTop: 'auto' }}>
        <button
          className="quick-dispatch-btn"
          style={{
            width: '100%',
            borderRadius: 12,
            height: 52,
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(36, 99, 235, 0.3)',
            fontFamily: "'Inter', sans-serif",
          }}
          onClick={() => onNavigate('dispatch')}
        >
          Quick Dispatch
        </button>

        <nav style={{ marginTop: 24 }}>
          {footerItems.map((item) => (
            <button
              key={item.view}
              className={`nav-link ${activeView === item.view ? 'active' : ''}`}
              onClick={() => onNavigate(item.view)}
            >
              <span className="material-icons">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}

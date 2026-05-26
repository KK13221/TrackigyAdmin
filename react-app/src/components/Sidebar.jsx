import React from 'react';

const navItems = [
  { icon: 'grid_view', label: 'Dashboard', view: 'dashboard', adminOnly: true },
  { icon: 'explore', label: 'Live Tracking', view: 'live-tracking' },
  { icon: 'local_shipping', label: 'Vehicles', view: 'fleet' },
  { icon: 'settings_remote', label: 'Vehicle Control', view: 'vehicle-control' },
  { icon: 'payments', label: 'Data Plans', view: 'data-plans' },
  { icon: 'speed', label: 'Speed Limit Alerts', view: 'overspeed', customerOnly: true },
  { icon: 'insert_chart', label: 'Statistics', view: 'statistics' },
  { icon: 'route', label: 'Trips', view: 'trips' },
  { icon: 'description', label: 'Documents', view: 'documents' },
  { icon: 'verified', label: 'Warranties', view: 'warranties' },
  // { icon: 'code', label: 'API Docs', view: 'api-docs', adminOnly: true },
];

const footerItems = [
  { icon: 'play_circle_filled', label: 'Video Tutorials', view: 'video-tutorials', adminOnly: true },
  { icon: 'campaign', label: 'Promo Videos', view: 'promo-videos', adminOnly: true },
  { icon: 'settings', label: 'Settings', view: 'settings' },
  { icon: 'help_outline', label: 'Support', view: 'support' },
];

export default function Sidebar({ activeView, onNavigate, isOpen, user, logoUrl }) {
  const isUserAdmin = (user?.role || '').toLowerCase() === 'admin';

  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly && !isUserAdmin) return false;
    if (item.customerOnly && isUserAdmin) return false;
    return true;
  });
  const filteredFooterItems = footerItems.filter(item => {
    if (item.adminOnly && !isUserAdmin) return false;
    if (item.customerOnly && isUserAdmin) return false;
    return true;
  });

  return (
    <aside id="sidebar" className={isOpen ? 'open' : ''}>
      <div className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '0 24px', marginBottom: '32px' }}>
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" style={{ height: '48px', width: 'auto', maxWidth: '100px', objectFit: 'contain', flexShrink: 0 }} />
        ) : (
          <div className="logo-icon-box" style={{ width: '36px', height: '36px', background: 'var(--primary)', borderRadius: '8px', display: 'grid', placeItems: 'center', color: 'white', flexShrink: 0 }}>
            <span className="material-icons" style={{ color: 'white', fontSize: '20px' }}>local_shipping</span>
          </div>
        )}
        <div className="logo-text-group" style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="logo-text" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>Trackify</span>
          <span className="logo-subtitle" style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>Fleet Intelligence</span>
        </div>
      </div>
      <nav id="nav-links">
        {filteredNavItems.map((item) => (
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
        {isUserAdmin && (
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
        )}
        <nav style={{ marginTop: isUserAdmin ? 24 : 0 }}>
          {filteredFooterItems.map((item) => (
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

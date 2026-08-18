import React from 'react';

const navItems = [
  { icon: 'grid_view', label: 'Dashboard', view: 'dashboard', adminOnly: true },
  { icon: 'history', label: 'Play Back', view: 'play-back' },
  { icon: 'share_location', label: 'Live Tracking', view: 'live-tracking' },
  // { icon: 'map', label: 'Devices Map', view: 'map', superadminOnly: true },
  {
    icon: 'local_shipping',
    label: 'Vehicles',
    view: 'fleet-menu',
    superadminOnly: true,
    subItems: [
      { label: 'All Vehicles', view: 'fleet' },
      { label: 'Brand List', view: 'brand-list' },
      { label: 'Model List', view: 'model-list' },
      { label: 'Vehicle Type', view: 'vehicle-Type' },
      { label: 'Expired Vehicle', view: 'expired-vehicle' },
      { label: 'Inactive Devices', view: 'inactive-devices' },

    ]
  },
  { icon: 'inventory_2', label: 'Inventory', view: 'inventory', superadminOnly: true },
  { icon: 'assignment_ind', label: 'Admin Management', view: 'assign-to-admin', superadminOnly: true },
  { icon: 'settings_remote', label: 'Vehicle Control', view: 'vehicle-control', strictAdminOnly: true, },
  // { icon: 'terminal', label: 'Command Center', view: 'command-center', superadminOnly: true },
  { icon: 'payments', label: 'Data Plans', view: 'data-plans' },
  { icon: 'speed', label: 'Speed Limit Alerts', view: 'overspeed', customerOnly: true, strictAdminOnly: true },
  { icon: 'insert_chart', label: 'Statistics', view: 'statistics' },
  { icon: 'route', label: 'Trips', view: 'trips' },
  { icon: 'description', label: 'Documents', view: 'documents', strictAdminOnly: true },
  // { icon: 'verified', label: 'Warranties', view: 'warranties' },
  { icon: 'devices', label: 'My Devices', view: 'admin-devices', strictAdminOnly: true },
  { icon: 'person_add', label: 'User', view: 'user', superadminOnly: true },
  { icon: 'storefront', label: 'Vendors', view: 'create-vendor', strictAdminOnly: true },
  { icon: 'download', label: 'Dummy Data', view: 'dummy-data', superadminOnly: true },
  // { icon: 'code', label: 'API Docs', view: 'api-docs', adminOnly: true },
];

const footerItems = [
  { icon: 'play_circle_filled', label: 'Video Tutorials', view: 'video-tutorials', superadminOnly: true },
  { icon: 'category', label: 'Tutorial Categories', view: 'video-tutorial-categories', superadminOnly: true },
  { icon: 'campaign', label: 'Promo Videos', view: 'promo-videos', superadminOnly: true },
  { icon: 'ondemand_video', label: 'Local Videos', view: 'local-videos', superadminOnly: true },
  { icon: 'burst_mode', label: 'Banners', view: 'banners', superadminOnly: true },
  { icon: 'play_circle_filled', label: 'Global Videos', view: 'global-videos', strictAdminOnly: true },
  // { icon: 'palette', label: 'Theme Config', view: 'theme-settings', strictAdminOnly: true },
  { icon: 'tune', label: 'General Settings', view: 'general-settings', superadminOnly: true },
  { icon: 'settings', label: 'Settings', view: 'settings' },
  { icon: 'help_outline', label: 'Support', view: 'support' },

];

export default function Sidebar({ activeView, onNavigate, isOpen, user, logoUrl }) {
  const [expandedMenus, setExpandedMenus] = React.useState({ 'fleet-menu': false });
  const isUserAdmin = ['admin', 'superadmin'].includes((user?.role || '').toLowerCase());
  const isSuperadmin = (user?.role || '').toLowerCase() === 'superadmin';

  const filteredNavItems = navItems.filter(item => {
    if (item.superadminOnly && !isSuperadmin) return false;
    if (item.strictAdminOnly && (user?.role || '').toLowerCase() !== 'admin') return false;

    if (item.adminOnly && item.customerOnly) {
      // Allowed for both
    } else {
      if (item.adminOnly && !isUserAdmin) return false;
      if (item.customerOnly && isUserAdmin) return false;
    }
    return true;
  });

  const filteredFooterItems = footerItems.filter(item => {
    if (item.superadminOnly && !isSuperadmin) return false;
    if (item.strictAdminOnly && (user?.role || '').toLowerCase() !== 'admin') return false;

    if (item.adminOnly && item.customerOnly) {
      // Allowed for both
    } else {
      if (item.adminOnly && !isUserAdmin) return false;
      if (item.customerOnly && isUserAdmin) return false;
    }
    return true;
  });

  return (
    <aside id="sidebar" className={isOpen ? 'open' : ''}>
      <div className="logo-container" style={{ display: 'flex', alignItems: '', justifyContent: '', padding: '0 24px', marginBottom: '2px', marginTop: '2px' }}>
        <img src="https://trackifybackend.inurum.com/uploads/1783601815708.png" alt="Logo" style={{ height: '70px', width: 'auto', maxWidth: '180px', objectFit: 'contain', flexShrink: 0 }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <nav id="nav-links" style={{}}>
          {filteredNavItems.map((item) => (
            <React.Fragment key={item.view}>
              <button
                className={`nav-link ${(activeView === item.view || (item.subItems && item.subItems.some(s => s.view === activeView))) ? 'active' : ''}`}
                onClick={() => {
                  if (item.subItems) {
                    setExpandedMenus(prev => ({ ...prev, [item.view]: !prev[item.view] }));
                  } else {
                    onNavigate(item.view);
                  }
                }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="material-icons">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.subItems && (
                  <span className="material-icons" style={{ fontSize: 18, color: 'var(--text-muted)' }}>
                    {expandedMenus[item.view] ? 'expand_less' : 'expand_more'}
                  </span>
                )}
              </button>
              {item.subItems && expandedMenus[item.view] && (
                <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '44px', gap: '4px', marginBottom: '8px' }}>
                  {item.subItems.map(sub => (
                    <button
                      key={sub.view}
                      className={`nav-link ${activeView === sub.view ? 'active' : ''}`}
                      onClick={() => onNavigate(sub.view)}
                      style={{
                        padding: '8px 12px',
                        minHeight: '36px',
                        fontSize: '13px',
                        background: activeView === sub.view ? 'var(--primary-light)' : 'transparent',
                        color: activeView === sub.view ? 'var(--primary)' : 'var(--text-muted)'
                      }}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </React.Fragment>
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
      </div>
    </aside>
  );
}

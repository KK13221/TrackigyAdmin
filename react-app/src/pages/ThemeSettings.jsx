import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/network';

const initialTheme = {
  theme_version: 4,
  light_theme: {
    font_family: "Roboto",
    colors: {
      primary: "#16A34A",
      primary_variant: "#DCFCE7",
      on_primary: "#FFFFFF",
      secondary: "#4ADE80",
      on_secondary: "#14532D",
      background: "#F0FDF4",
      surface: "#FFFFFF",
      on_surface: "#14532D",
      card: "#FFFFFF",
      text_primary: "#14532D",
      text_secondary: "#4B5563",
      text_tertiary: "#6EE7B7",
      border: "#86EFAC",
      divider: "#D1FAE5",
      error: "#E11D48",
      on_error: "#FFFFFF",
      shadow: "#BBF7D0"
    },
    app_bar: { background: "#15803D", text_color: "#DCFCE7" },
    button: { background: "#16A34A", text_color: "#FFFFFF", border_radius: 12, padding_horizontal: 24, padding_vertical: 12 },
    input: { fill_color: "#F0FDF4", border_color: "#BBF7D0", focused_border_color: "#16A34A", border_radius: 12 },
    card: { color: "#FFFFFF", elevation: 2, border_radius: 12 }
  },
  dark_theme: {
    font_family: "Roboto",
    colors: {
      primary: "#39FF14",
      primary_variant: "#0A1A05",
      on_primary: "#000000",
      secondary: "#00FFEA",
      on_secondary: "#000000",
      background: "#0A0A0A",
      surface: "#141414",
      on_surface: "#E5E7EB",
      card: "#1C1C1C",
      text_primary: "#F3F4F6",
      text_secondary: "#9CA3AF",
      text_tertiary: "#6B7280",
      border: "#2E2E2E",
      divider: "#1F1F1F",
      error: "#FF4560",
      on_error: "#000000"
    },
    app_bar: { background: "#050505", text_color: "#39FF14" },
    button: { background: "#39FF14", text_color: "#000000", border_radius: 8, padding_horizontal: 24, padding_vertical: 12 },
    input: { fill_color: "#111111", border_color: "#2E2E2E", focused_border_color: "#00FFEA", border_radius: 8 },
    card: { color: "#1C1C1C", elevation: 6, border_radius: 16 }
  },
  common_colors: {
    success: "#10B981",
    success_dark: "#34D399",
    warning: "#F59E0B",
    warning_dark: "#FBBF24",
    info: "#3B82F6",
    info_dark: "#60A5FA",
    active_marker: "#39FF14",
    inactive_marker: "#444444",
    user_location: "#DC2626",
    user_background: "#000000"
  }
};

export default function ThemeSettings({ user }) {
  const [userId, setUserId] = useState(user?._id || user?.id || '');
  const [themeData, setThemeData] = useState(initialTheme);
  const [activeTab, setActiveTab] = useState('light'); // light, dark, common
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (userId) {
      const fetchTheme = async () => {
        try {
          const res = await fetch(`${BASE_URL}/api/theme/${userId}`);
          if (res.ok) {
            const data = await res.json();
            if (data && Object.keys(data).length > 0) {
              // Ensure we merge with initialTheme so we don't break the UI if some keys are missing
              setThemeData(prev => ({
                ...prev,
                ...data,
                light_theme: { ...prev.light_theme, ...data.light_theme },
                dark_theme: { ...prev.dark_theme, ...data.dark_theme },
                common_colors: { ...prev.common_colors, ...data.common_colors }
              }));
            }
          }
        } catch (error) {
          console.error("Could not fetch existing theme", error);
        }
      };
      fetchTheme();
    }
  }, [userId]);

  const handleChange = (tab, section, key, value, isNumber = false) => {
    setThemeData(prev => {
      const updated = { ...prev };
      const val = isNumber ? Number(value) : value;

      if (tab === 'common') {
        updated.common_colors[key] = val;
      } else {
        const themeKey = tab === 'light' ? 'light_theme' : 'dark_theme';
        if (section) {
          updated[themeKey][section][key] = val;
        } else {
          updated[themeKey][key] = val;
        }
      }
      return updated;
    });
  };

  const handleSave = async () => {
    if (!userId) {
      setMessage('Please enter a User ID');
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const payload = { ...themeData, _id: userId };
      
      const response = await fetch(`${BASE_URL}/api/theme/update/${userId}`, {
        method: 'PUT',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setMessage('Theme updated successfully!');
        setIsSuccess(true);
      } else {
        const errData = await response.json();
        setMessage(`Error: ${errData.error || response.statusText}`);
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('An error occurred while updating.');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const renderInputs = (obj, tab, section) => {
    return Object.entries(obj).map(([key, value]) => {
      const isColor = typeof value === 'string' && value.startsWith('#');
      const isNumber = typeof value === 'number';

      return (
        <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
            {key.replace(/_/g, ' ')}
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isColor && (
              <input
                type="color"
                value={value}
                onChange={(e) => handleChange(tab, section, key, e.target.value)}
                style={{ width: 36, height: 36, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer' }}
              />
            )}
            <input
              type={isNumber ? 'number' : 'text'}
              value={value}
              onChange={(e) => handleChange(tab, section, key, e.target.value, isNumber)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'var(--bg-main)',
                color: 'var(--text-main)',
                fontSize: '14px'
              }}
            />
          </div>
        </div>
      );
    });
  };

  const currentThemeObj = activeTab === 'light' ? themeData.light_theme : themeData.dark_theme;

  return (
    <div className="page-container" style={{ padding: '24px', width: '100%' }}>
      <div className="card" style={{ padding: '24px', width: '100%' }}>
        <h2 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: 600, color: 'var(--text-main)' }}>Edit User Theme</h2>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Target User ID (Auto-assigned to your account)</label>
          <input
            type="text"
            value={userId}
            readOnly
            disabled
            placeholder="No User ID found"
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-muted)',
              fontSize: '14px',
              cursor: 'not-allowed'
            }}
          />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
          {['light', 'dark', 'common'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: activeTab === tab ? 'var(--primary)' : 'transparent',
                color: activeTab === tab ? 'white' : 'var(--text-main)',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {tab} Theme
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {activeTab === 'common' ? (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Common Colors</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {renderInputs(themeData.common_colors, 'common', null)}
              </div>
            </div>
          ) : (
            <>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>General</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Font Family</label>
                    <input
                      type="text"
                      value={currentThemeObj.font_family}
                      onChange={(e) => handleChange(activeTab, null, 'font_family', e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', marginTop: 16 }}>Colors</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                  {renderInputs(currentThemeObj.colors, activeTab, 'colors')}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginTop: 16 }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>App Bar</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {renderInputs(currentThemeObj.app_bar, activeTab, 'app_bar')}
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Button</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {renderInputs(currentThemeObj.button, activeTab, 'button')}
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Input</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {renderInputs(currentThemeObj.input, activeTab, 'input')}
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Card</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {renderInputs(currentThemeObj.card, activeTab, 'card')}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            {message && (
              <span style={{
                padding: '8px 12px',
                borderRadius: '6px',
                background: isSuccess ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: isSuccess ? '#10B981' : '#EF4444',
                fontWeight: 500
              }}>
                {message}
              </span>
            )}
          </div>
          <button 
            onClick={handleSave}
            disabled={loading}
            style={{
              padding: '12px 32px',
              borderRadius: '8px',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              fontWeight: 600,
              fontSize: '15px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {loading ? <span className="material-icons" style={{ animation: 'spin 1s linear infinite' }}>refresh</span> : <span className="material-icons">save</span>}
            Save Theme
          </button>
        </div>
      </div>
    </div>
  );
}

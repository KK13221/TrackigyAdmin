import React from 'react';

export default function MetricCard({ label, value, trend, colorClass, icon, onClick }) {
  const trendColor = trend?.startsWith('+')
    ? 'var(--success)'
    : trend?.startsWith('-')
      ? 'var(--error)'
      : 'var(--primary)';

  const trendBg = trend?.startsWith('+')
    ? 'var(--success-light)'
    : trend?.startsWith('-')
      ? 'var(--error-light)'
      : 'var(--primary-light)';

  const accentColorMap = {
    blue: '#2463eb',
    green: '#10b981',
    red: '#ef4444',
    orange: '#f59e0b',
    purple: '#a855f7',
    teal: '#14b8a6',
    pink: '#ec4899',
  };

  const accentColor = accentColorMap[colorClass] || 'var(--primary)';

  return (
    <div
      className={`card hover-lift ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        padding: 10,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '70px',
        border: `1px solid ${accentColor}66`,
        background: `linear-gradient(135deg, var(--bg-sidebar) 40%, ${accentColor}1A 100%)`
      }}
    >
      {/* Background Watermark Icon */}
      <span
        className="material-icons"
        style={{
          position: 'absolute',
          right: -10,
          bottom: -10,
          fontSize: 80,
          opacity: 0.15,
          color: accentColor,
          transform: 'rotate(-10deg)',
          pointerEvents: 'none'
        }}
      >
        {icon}
      </span>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 8,
          position: 'relative',
          zIndex: 2
        }}
      >
        <div
          className={`icon-box ${colorClass}`}
          style={{
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            borderRadius: '10px',
            width: '32px',
            height: '32px'
          }}
        >
          <span className="material-icons" style={{ fontSize: 18 }}>
            {icon}
          </span>
        </div>

        {trend && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: trendColor,
              background: trendBg,
              padding: '3px 10px',
              borderRadius: 20,
              boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
            }}
          >
            {trend}
          </span>
        )}
      </div>

      <div style={{ position: 'relative', zIndex: 2 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          {value}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'block'
            }}
          >
            {label}
          </span>
          {onClick && (
            <span className="material-icons" style={{ fontSize: 14, color: 'var(--text-muted)' }}>arrow_forward</span>
          )}
        </div>
      </div>
    </div>
  );
}

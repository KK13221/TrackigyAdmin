import React from 'react';

export default function MetricCard({ label, value, trend, colorClass, icon }) {
  const trendColor = trend.startsWith('+')
    ? 'var(--success)'
    : trend.startsWith('-')
    ? 'var(--error)'
    : 'var(--primary)';

  const trendBg = trend.startsWith('+')
    ? 'var(--success-light)'
    : trend.startsWith('-')
    ? 'var(--error-light)'
    : 'var(--primary-light)';

  return (
    <div className="card" style={{ padding: 20 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 16,
        }}
      >
        <div className={`icon-box ${colorClass}`}>
          <span className="material-icons" style={{ fontSize: 20 }}>
            {icon}
          </span>
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: trendColor,
            background: trendBg,
            padding: '2px 8px',
            borderRadius: 4,
          }}
        >
          {trend}
        </span>
      </div>
      <div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </span>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 4, color: 'var(--text-main)' }}>
          {value}
        </h2>
      </div>
    </div>
  );
}

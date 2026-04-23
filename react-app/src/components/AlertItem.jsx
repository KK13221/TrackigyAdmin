import React from 'react';

export default function AlertItem({ title, text, type, tag }) {
  return (
    <div className={`alert-item ${type}`}>
      <div className={`icon-box ${type === 'urgent' ? 'red' : 'orange'}`}>
        <span className="material-icons" style={{ fontSize: 18 }}>
          {type === 'urgent' ? 'error' : 'warning'}
        </span>
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 2,
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)' }}>{title}</p>
        </div>
        <p
          style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            lineHeight: 1.4,
            marginBottom: 8,
          }}
        >
          {text}
        </p>
        <span className={`tag ${type === 'urgent' ? 'red' : 'orange'}`}>{tag}</span>
      </div>
    </div>
  );
}

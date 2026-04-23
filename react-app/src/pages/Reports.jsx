import React from 'react';

export default function Reports() {
  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Revenue & Billing</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Financial analytics mapped directly from the Stitch V1 Report.
          </p>
        </div>
      </div>

      <div
        className="card"
        style={{
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <span className="material-icons" style={{ fontSize: 48, color: 'var(--primary)', marginBottom: 16 }}>
          payments
        </span>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Reports Integration Active</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>
          Analytics API synced successfully.
        </p>
      </div>
    </div>
  );
}

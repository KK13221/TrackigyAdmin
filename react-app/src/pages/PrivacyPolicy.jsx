import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="page-content" style={{ padding: '24px', background: 'var(--bg-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <div className="card" style={{ flex: 1, padding: 0, borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--bg-card)', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
        
        <iframe
            src="/privacy_policy.html"
            style={{ width: '100%', height: '100%', border: 'none', flex: 1, minHeight: '80vh' }}
            title="Privacy Policy"
        ></iframe>

      </div>
    </div>
  );
}

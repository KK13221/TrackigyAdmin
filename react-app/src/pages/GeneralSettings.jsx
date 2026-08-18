import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/network';
import Swal from 'sweetalert2';

export default function GeneralSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [settingId, setSettingId] = useState(null);

  // Helper for input styling
  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none', fontSize: '13px' };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`${BASE_URL}/api/general-settings`);
      if (!res.ok) {
        throw new Error(`Server returned status: ${res.status}`);
      }
      const json = await res.json();
      if (json && json.data) {
        setSettingId(json.data._id || null);
        setCompanyName(json.data.companyName || '');
        setEmail(json.data.email || '');
        setMobileNumber(json.data.mobileNumber || '');
      }
    } catch (err) {
      console.error('Error fetching general settings:', err);
      setError(err.message || 'Error connecting to the service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch(`${BASE_URL}/api/general-settings`, {
        method: settingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          companyName,
          email,
          mobileNumber
        })
      });

      if (!res.ok) {
        throw new Error(`Failed to save settings: Server returned status ${res.status}`);
      }

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: settingId ? 'General Settings updated successfully.' : 'General Settings created successfully.',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });

      if (!settingId) {
        fetchSettings(); // Refresh to get the new ID
      }
    } catch (err) {
      console.error('Error updating general settings:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to save: ${err.message}`
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-content fade-in" style={{ padding: '30px', maxWidth: '100%', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>General Settings</h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Manage the core business details such as company name and contact info.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', gap: '16px' }}>
          <div className="spinner-mini" style={{ width: '36px', height: '36px', border: '3px solid rgba(36,99,235,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Fetching data...</span>
        </div>
      ) : (
        <div className="card" style={{ padding: '30px', background: 'var(--bg-sidebar)', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          {error && (
            <div style={{ padding: '16px', background: 'var(--error-light)', color: 'var(--error)', borderRadius: '8px', marginBottom: '20px', fontWeight: 600 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSaveChanges} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mobile Number</label>
              <input
                type="text"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary"
              style={{
                marginTop: '12px',
                height: '46px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'var(--primary)',
                border: 'none',
                color: 'white',
                fontWeight: 700,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(36,99,235,0.2)'
              }}
            >
              <span className="material-icons" style={{ fontSize: '18px' }}>{settingId ? 'save' : 'add'}</span>
              {isSaving ? (settingId ? 'Updating...' : 'Adding...') : (settingId ? 'Update Settings' : 'Add Settings')}
            </button>
          </form>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

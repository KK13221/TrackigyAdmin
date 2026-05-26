import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/network';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  // Input states for active profile editing matching the backend PUT schema
  const [name, setName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const userId = localStorage.getItem('userId') || '69d3a343bcc2861ea8d8d023';

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`${BASE_URL}/user/userList/${userId}`);
      if (!res.ok) {
        throw new Error(`Server returned status: ${res.status}`);
      }
      const json = await res.json();
      if (json && json.data && json.data.length > 0) {
        const userData = json.data[0];
        setUser(userData);
        setName(userData.name || '');
        setMiddleName(userData.middleName || '');
        setLastName(userData.lastName || '');
        setEmail(userData.email || '');
        setMobile(userData.mobile_number || userData.mobile || userData.phone || '8876567899');
        setDateOfBirth(userData.dateOfBirth ? userData.dateOfBirth.substring(0, 10) : '');
        setCountry(userData.country || '');
        setCity(userData.city || '');
        setState(userData.state || '');
        setAddress(userData.address || '');
        setRole((userData.role || '').toLowerCase() === 'admin' ? 'Admin' : 'Customer');
      } else {
        setError('No user profile data found.');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err.message || 'Error connecting to the user profile service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    try {
      const targetId = user?._id || user?.id || userId;
      // Map exactly to endpoint: /api/auth/user-detail/:userId
      const res = await fetch(`${BASE_URL}/api/auth/user-detail/${targetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          middleName,
          lastName,
          mobile_number: mobile,
          email,
          dateOfBirth,
          country,
          state,
          city,
          address
        })
      });

      if (!res.ok) {
        throw new Error(`Failed to update profile: Server returned status ${res.status}`);
      }

      const responseJson = await res.json();
      setSaveMessage('');

      // Update local UI user state model
      setUser(prev => ({
        ...prev,
        name,
        middleName,
        lastName,
        mobile_number: mobile,
        email,
        dateOfBirth,
        country,
        state,
        city,
        address
      }));
    } catch (err) {
      console.error('Error updating user details:', err);
      setError(`Failed to save: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-content fade-in" style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>System Settings</h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Manage your account credentials, security preferences, and telemetry dashboard parameters.
          </p>
        </div>
        <button
          onClick={fetchUserProfile}
          style={{
            background: 'white',
            border: '1px solid var(--border)',
            color: 'var(--text-main)',
            fontWeight: 700,
            padding: '10px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
        >
          <span className="material-icons" style={{ fontSize: '18px' }}>refresh</span>
          Reload Profile
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
          <div className="spinner-mini" style={{ width: '36px', height: '36px', border: '3px solid rgba(36,99,235,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Fetching User Profile from backend...</span>
        </div>
      ) : error ? (
        <div style={{ padding: '24px', background: 'var(--error-light)', color: 'var(--error)', borderRadius: '12px', border: '1px solid #fee2e2', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '8px' }}>
            <span className="material-icons">error_outline</span>
            Failed to Load User Profile
          </div>
          <p style={{ margin: 0, fontSize: '14px' }}>{error}</p>
          <button
            onClick={fetchUserProfile}
            className="btn-primary"
            style={{ marginTop: '16px', background: 'var(--error)', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', color: 'white', fontWeight: 600 }}
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '30px' }}>

          {/* Left Column: Premium User Avatar Card & Quick Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card" style={{ padding: '24px', textAlign: 'center', background: 'white', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 16px auto' }}>
                <img
                  src={
                    user?.userProfile
                      ? (user.userProfile.startsWith('http') ? user.userProfile : `${BASE_URL}/${user.userProfile}`)
                      : 'http://139.59.1.109:5000/uploads/1775477571309.png'
                  }
                  alt={user?.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '4px solid #f1f5f9',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#10b981',
                  border: '3px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }} title={(user?.role || '').toLowerCase() === 'admin' ? 'Active System Administrator' : 'Active Customer'} />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>{user?.name}</h2>
              <span className="tag" style={{
                background: (user?.role || '').toLowerCase() === 'admin' ? 'var(--primary-light)' : 'rgba(16, 185, 129, 0.1)',
                color: (user?.role || '').toLowerCase() === 'admin' ? 'var(--primary)' : '#10b981',
                fontSize: '11px',
                fontWeight: 700,
                padding: '4px 12px',
                textTransform: 'uppercase'
              }}>
                {(user?.role || '').toLowerCase() === 'admin' ? 'Admin' : 'Customer'}
              </span>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Location</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{user?.city ? `${user.city}, ${user.state || ''}` : 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Account ID</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)', fontFamily: 'monospace' }}>{user?._id?.substring(0, 8)}...</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Member Since</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'May 2026'}</span>
                </div>
              </div>
            </div>

            {/* Quick tab switcher */}
            <div className="card" style={{ padding: '12px', background: 'white', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button
                  onClick={() => setActiveTab('profile')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    background: activeTab === 'profile' ? 'var(--primary-light)' : 'transparent',
                    color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-main)',
                    textAlign: 'left',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <span className="material-icons" style={{ fontSize: '18px' }}>account_circle</span>
                  Account Profile
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Form Panel based on Active Tab */}
          <div className="card" style={{ padding: '30px', background: 'white', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>

            {activeTab === 'profile' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>Account Profile Information</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '24px' }}>
                  This information is synced from the primary user database profile API. Change details below to update your session details.
                </p>

                <form onSubmit={handleSaveChanges} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>First Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', fontSize: '13px' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Middle Name</label>
                      <input
                        type="text"
                        value={middleName}
                        onChange={(e) => setMiddleName(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mobile Phone</label>
                      <input
                        type="text"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', fontSize: '13px' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>System Role</label>
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', fontSize: '13px', background: '#f8fafc', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                        disabled
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date of Birth</label>
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Country</label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>State / Region</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Full Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', fontSize: '13px' }}
                      placeholder="e.g. Vijay Nagar, Indore"
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
                      background: 'var(--primary)',
                      border: 'none',
                      color: 'white',
                      fontWeight: 700,
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(36,99,235,0.2)'
                    }}
                  >
                    {isSaving ? 'Saving Changes...' : 'Update Settings Profile'}
                  </button>

                  {saveMessage && (
                    <div style={{
                      padding: '12px 16px',
                      background: 'var(--success-light)',
                      color: 'var(--success)',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '8px'
                    }}>
                      <span className="material-icons">check_circle</span>
                      {saveMessage}
                    </div>
                  )}
                </form>
              </div>
            )}



          </div>

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

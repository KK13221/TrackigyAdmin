import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/network';

export default function OverspeedAlerts({ user }) {
  const [alerts, setAlerts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    imei: '',
    speedLimit: 80,
    notificationType: 'push' // push, SMS, email
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const savedUser = user || JSON.parse(localStorage.getItem('user') || '{}');
      const isUserAdmin = (savedUser.role || '').toLowerCase() === 'admin';
      const userId = savedUser.id || savedUser._id || localStorage.getItem('userId');

      // 1. Fetch fleet vehicles or all assigned devices
      const targetUrl = isUserAdmin 
        ? `${BASE_URL}/api/device/device-list`
        : `${BASE_URL}/api/vehicle/get-vehicles?userId=${userId}`;

      const resVehicles = await fetch(targetUrl);
      if (resVehicles.ok) {
        const data = await resVehicles.json();
        let fetchedVehicles = [];

        if (isUserAdmin) {
          if (data && Array.isArray(data.data)) {
            fetchedVehicles = data.data.map(d => ({
              _id: d.id || d.imei,
              imei: d.imei,
              vehicleNumber: d.imei,
              vehicleMaker: d.user_name || 'Fleet',
              vehicleModel: 'Device'
            }));
          }
        } else {
          if (data && Array.isArray(data.vehicles)) {
            fetchedVehicles = data.vehicles;
          }
        }

        setVehicles(fetchedVehicles);

        // 2. Fetch overspeed configurations for each vehicle to build active list
        const alertsList = [];
        for (const vehicle of fetchedVehicles) {
          if (!vehicle.imei) continue;
          try {
            const resAlert = await fetch(`${BASE_URL}/api/overspeed/get-overspeed/${vehicle.imei}`);
            if (resAlert.ok) {
              const alertData = await resAlert.json();
              if (alertData && alertData.result) {
                alertsList.push({
                  vehicle,
                  speedLimit: alertData.result.speedLimit || alertData.result.maxSpeed || 80,
                  _id: alertData.result._id
                });
              } else {
                alertsList.push({
                  vehicle,
                  speedLimit: null,
                  _id: null
                });
              }
            } else {
              alertsList.push({
                vehicle,
                speedLimit: null,
                _id: null
              });
            }
          } catch (e) {
            alertsList.push({
              vehicle,
              speedLimit: null,
              _id: null
            });
          }
        }
        setAlerts(alertsList);
      }
    } catch (err) {
      console.error('Error fetching overspeed alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveAlert = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        imei: formData.imei,
        speedLimit: Number(formData.speedLimit),
        notificationType: formData.notificationType
      };

      const res = await fetch(`${BASE_URL}/api/overspeed/create-alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Overspeed limit configuration updated successfully!');
        setIsModalOpen(false);
        setFormData({
          imei: '',
          speedLimit: 80,
          notificationType: 'push'
        });
        loadData();
      } else {
        alert('Failed to transmit safety threshold specifications.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating overspeed limit threshold.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredAlerts = Array.isArray(alerts) ? alerts.filter(a => {
    const query = searchTerm.toLowerCase();
    return (
      a.vehicle?.vehicleMaker?.toLowerCase().includes(query) ||
      a.vehicle?.vehicleModel?.toLowerCase().includes(query) ||
      a.vehicle?.vehicleNumber?.toLowerCase().includes(query) ||
      a.vehicle?.imei?.toLowerCase().includes(query)
    );
  }) : [];

  return (
    <div className="fade-in" style={{ padding: '0 4px', minHeight: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header block */}
      <div className="page-header" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Velocity & Overspeed Safeguard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Control safety speed margins, configure push notifications and trigger dispatch flags whenever fleet assets exceed road boundaries.
          </p>
        </div>
        <button 
          onClick={() => {
            setIsModalOpen(true);
            setFormData({
              imei: '',
              speedLimit: 80,
              notificationType: 'push'
            });
          }}
          className="btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: 8, height: 42 }}
        >
          <span className="material-icons">speed</span>
          Configure Limit
        </button>
      </div>

      {/* Main card grid */}
      <div className="card" style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Actions header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ position: 'relative', width: 300 }}>
            <span className="material-icons" style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)', fontSize: 20 }}>search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by vehicle name, plate or imei..."
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                fontSize: 13,
                outline: 'none'
              }}
            />
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>
            Monitored Assets: {filteredAlerts.length} vehicles
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)', margin: 'auto' }}>
            <div className="spinner" style={{ margin: '0 auto 16px auto' }}></div>
            <span>Fetching overspeed parameters...</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Fleet Vehicle</th>
                  <th style={{ padding: '12px 16px' }}>Device IMEI</th>
                  <th style={{ padding: '12px 16px' }}>Velocity Ceiling</th>
                  <th style={{ padding: '12px 16px' }}>Safeguard Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.length > 0 ? (
                  filteredAlerts.map((a) => {
                    const hasLimit = a.speedLimit !== null;
                    return (
                      <tr key={a.vehicle?.imei} style={{ borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div 
                              style={{ 
                                width: 36, 
                                height: 36, 
                                borderRadius: 8, 
                                background: hasLimit ? '#e0f2fe' : '#f1f5f9', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: hasLimit ? 'var(--primary)' : 'var(--text-muted)'
                              }}
                            >
                              <span className="material-icons">speed</span>
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                                {a.vehicle?.vehicleMaker} {a.vehicle?.vehicleModel}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                Plate: {a.vehicle?.vehicleNumber || 'Unassigned'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 600 }}>
                          {a.vehicle?.imei}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          {hasLimit ? (
                            <strong style={{ fontSize: 15, color: '#ef4444' }}>{a.speedLimit} km/h</strong>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>No Limit Configured</span>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span 
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              color: hasLimit ? '#10b981' : '#64748b',
                              background: hasLimit ? '#10b98115' : '#64748b15',
                              padding: '4px 8px',
                              borderRadius: 6
                            }}
                          >
                            {hasLimit ? 'Guarded' : 'Idle'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <button
                            onClick={() => {
                              setFormData({
                                imei: a.vehicle?.imei,
                                speedLimit: a.speedLimit || 80,
                                notificationType: 'push'
                              });
                              setIsModalOpen(true);
                            }}
                            className="btn-secondary"
                            style={{ padding: '6px 12px', fontSize: 12, borderRadius: 8 }}
                          >
                            Configure
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                      No fleet vehicles detected to configure overspeed controls.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CONFIGURE LIMIT MODAL */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="card" style={{ width: 420, padding: '24px', position: 'relative', borderRadius: 20, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: 16, right: 16, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <span className="material-icons">close</span>
            </button>

            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-icons" style={{ color: 'var(--primary)' }}>speed</span>
              Speed Safeguard Limits
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 20 }}>
              Establish a velocity boundary limit. Fleet drivers exceeding this ceiling will trigger automatic notifications.
            </p>

            <form onSubmit={handleSaveAlert} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Fleet Vehicle IMEI <strong style={{ color: 'red' }}>*</strong>
                </label>
                <select
                  value={formData.imei}
                  required
                  onChange={(e) => setFormData(prev => ({ ...prev, imei: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'white' }}
                >
                  <option value="">-- Select fleet vehicle --</option>
                  {vehicles.map(v => {
                    const label = v.vehicleModel === 'Device'
                      ? `${v.vehicleMaker || 'Fleet'} - IMEI: ${v.imei}`
                      : `${v.vehicleMaker} ${v.vehicleModel} - ${v.vehicleNumber} (${v.imei})`;
                    return (
                      <option key={v._id} value={v.imei}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Speed Threshold (km/h) <strong style={{ color: 'red' }}>*</strong>
                </label>
                <input
                  type="number"
                  required
                  value={formData.speedLimit}
                  onChange={(e) => setFormData(prev => ({ ...prev, speedLimit: e.target.value }))}
                  placeholder="e.g. 80"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'white', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Notification Dispatch Channel
                </label>
                <select
                  value={formData.notificationType}
                  onChange={(e) => setFormData(prev => ({ ...prev, notificationType: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'white' }}
                >
                  <option value="push">⚡ Push Notification (App)</option>
                  <option value="sms">📱 SMS Text Dispatch</option>
                  <option value="email">📧 Email Alert Dispatch</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary" 
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  className="btn-primary" 
                  style={{ flex: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  {actionLoading ? 'Updating Limit...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

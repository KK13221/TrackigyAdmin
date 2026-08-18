import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/network';
import TrackifyLoader from '../components/TrackifyLoader';
import Swal from 'sweetalert2';

export default function OverspeedAlerts({ user }) {
  const [alerts, setAlerts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    _id: '',
    imei: '',
    alert_title: '',
    speed_limit: 80,
    duration: 10,
    notificationType: 'push'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const savedUser = user || JSON.parse(localStorage.getItem('user') || '{}');
      const isUserAdmin = ['superadmin'].includes((savedUser.role || '').toLowerCase());
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
              if (alertData && alertData.data && alertData.data.length > 0) {
                const latestAlert = alertData.data[0];
                alertsList.push({
                  vehicle,
                  speedLimit: latestAlert.speed_limit || latestAlert.speedLimit || latestAlert.maxSpeed || 80,
                  _id: latestAlert._id
                });
              } else if (alertData && alertData.result) {
                alertsList.push({
                  vehicle,
                  speedLimit: alertData.result.speedLimit || alertData.result.maxSpeed || 80,
                  _id: alertData.result._id
                });
              }
            }
          } catch (e) {
            console.error(e);
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
        alert_title: formData.alert_title,
        speed_limit: Number(formData.speed_limit),
        duration: Number(formData.duration),
        notificationType: formData.notificationType
      };

      const isEdit = !!formData._id;
      const apiUrl = isEdit 
        ? `${BASE_URL}/api/overspeed/update-alert/${formData._id}`
        : `${BASE_URL}/api/overspeed/create-alert`;

      const res = await fetch(apiUrl, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        body: JSON.stringify(payload)
      });

      const resData = await res.json().catch(() => ({}));

      if (res.ok && resData.status !== false) {
        Swal.fire(`Overspeed alert ${isEdit ? 'updated' : 'configured'} successfully!`);
        setIsModalOpen(false);
        setFormData({ _id: '', imei: '', alert_title: '', speed_limit: 80, duration: 10, notificationType: 'push' });
        loadData();
      } else {
        Swal.fire(resData.message || `Failed to ${isEdit ? 'update' : 'save'} overspeed alert.`);
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error saving overspeed alert.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAlert = async (alertId) => {
    if (!alertId) {
      Swal.fire('No overspeed alert limit is currently set for this vehicle.');
      return;
    }
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to remove this overspeed alert limit?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, proceed!'
    });
    if (!result.isConfirmed) return;
    
    try {
      const res = await fetch(`${BASE_URL}/api/overspeed/delete-alert/${alertId}`, {
        method: 'DELETE'
      });
      const data = await res.json().catch(() => ({}));
      
      if (res.ok || data.status) {
        Swal.fire('Overspeed limit removed successfully!');
        loadData();
      } else {
        Swal.fire(data.message || 'Failed to remove overspeed limit.');
      }
    } catch (err) {
      console.error('Error deleting overspeed alert:', err);
      Swal.fire('Error occurred while removing limit.');
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
      <div className="page-header" style={{ marginTop: 8, marginBottom: 20, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setFormData({ _id: '', imei: '', alert_title: '', speed_limit: 80, duration: 10, notificationType: 'push' });
          }}
          className="btn-primary"
          style={{ display: 'inline-flex', flex: 'none', alignItems: 'center', gap: 6, height: 36, padding: '0 16px', fontSize: 13 }}
        >
          <span className="material-icons" style={{ fontSize: 18 }}>speed</span>
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
          <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
            <TrackifyLoader size={200} animated={true} message="Fetching overspeed parameters..." showPercentage={true} />
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
                              color: hasLimit ? '#10b981' : 'var(--text-muted)',
                              background: hasLimit ? '#10b98115' : '#64748b15',
                              padding: '4px 8px',
                              borderRadius: 6
                            }}
                          >
                            {hasLimit ? 'Guarded' : 'Idle'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button
                              onClick={() => handleDeleteAlert(a._id)}
                              className="btn-danger"
                              style={{
                                background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px',
                                fontSize: 12, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                              }}
                            >
                              <span className="material-icons" style={{ fontSize: 14 }}>delete</span>
                              Remove
                            </button>
                            <button
                              onClick={() => {
                                setFormData({
                                  _id: a._id,
                                  imei: a.vehicle?.imei,
                                  alert_title: 'Overspeed Alert',
                                  speed_limit: a.speedLimit || 80,
                                  duration: 10,
                                  notificationType: 'push'
                                });
                                setIsModalOpen(true);
                              }}
                              className="btn-secondary"
                              style={{ padding: '6px 12px', fontSize: 12, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              <span className="material-icons" style={{ fontSize: 14 }}>edit</span>
                              Edit
                            </button>
                          </div>
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
              {/* IMEI */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Fleet Vehicle IMEI <strong style={{ color: 'red' }}>*</strong>
                </label>
                <select
                  value={formData.imei}
                  required
                  onChange={(e) => setFormData(prev => ({ ...prev, imei: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'var(--bg-sidebar)' }}
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

              {/* Alert Title */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Alert Title <strong style={{ color: 'red' }}>*</strong>
                </label>
                <input
                  type="text"
                  required
                  value={formData.alert_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, alert_title: e.target.value }))}
                  placeholder="e.g. Highway Speed Alert"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'var(--bg-sidebar)', outline: 'none' }}
                />
              </div>

              {/* Speed Limit + Duration in a row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                    Speed Limit (km/h) <strong style={{ color: 'red' }}>*</strong>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.speed_limit}
                    onChange={(e) => setFormData(prev => ({ ...prev, speed_limit: e.target.value }))}
                    placeholder="e.g. 80"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'var(--bg-sidebar)', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                    Duration (seconds) <strong style={{ color: 'red' }}>*</strong>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g. 10"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'var(--bg-sidebar)', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Notification Channel */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Notification Channel
                </label>
                <select
                  value={formData.notificationType}
                  onChange={(e) => setFormData(prev => ({ ...prev, notificationType: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'var(--bg-sidebar)' }}
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

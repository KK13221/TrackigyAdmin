import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/network';

export default function GeoFence() {
  const [geofences, setGeofences] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    imei: '',
    geofencName: '',
    lat: 22.7533,
    lng: 75.8937,
    radius: 100 // Radius in meters
  });

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all geofences
      const resGeofences = await fetch(`${BASE_URL}/api/geoFance/geofence_all_Data`);
      if (resGeofences.ok) {
        const data = await resGeofences.json();
        if (data && Array.isArray(data.result)) {
          setGeofences(data.result);
        } else if (Array.isArray(data)) {
          setGeofences(data);
        }
      }

      // 2. Fetch fleet vehicles
      const userId = localStorage.getItem('userId');
      const resVehicles = await fetch(`${BASE_URL}/api/vehicle/get-vehicles?userId=${userId}`);
      if (resVehicles.ok) {
        const data = await resVehicles.json();
        if (data && Array.isArray(data.vehicles)) {
          setVehicles(data.vehicles);
        }
      }
    } catch (err) {
      console.error('Error fetching geofences:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        imei: formData.imei,
        geofencName: formData.geofencName,
        geofencingCoordinates: [
          {
            lat: Number(formData.lat),
            lng: Number(formData.lng)
          }
        ]
      };

      const res = await fetch(`${BASE_URL}/api/geoFance/update_geofence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Geofence boundary saved successfully!');
        setIsModalOpen(false);
        setFormData({
          imei: '',
          geofencName: '',
          lat: 22.7533,
          lng: 75.8937,
          radius: 100
        });
        loadData();
      } else {
        alert('Failed to update geofence boundary.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating geofence boundary.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteGeofence = async (imei) => {
    if (!confirm('Are you sure you want to delete geofence for this vehicle?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/geoFance/geofence/${imei}`, {
        method: 'DELETE',
        headers: {
          'accept': '*/*'
        }
      });
      if (res.ok) {
        alert('Geofence deleted successfully.');
        loadData();
      } else {
        alert('Failed to delete geofence.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredGeofences = Array.isArray(geofences) ? geofences.filter(g => {
    const query = searchTerm.toLowerCase();
    const veh = Array.isArray(vehicles) ? (vehicles.find(v => v.imei === g.imei) || {}) : {};
    return (
      g.geofencName?.toLowerCase().includes(query) ||
      g.imei?.toLowerCase().includes(query) ||
      veh.vehicleNumber?.toLowerCase().includes(query)
    );
  }) : [];

  return (
    <div className="fade-in" style={{ padding: '0 4px', minHeight: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header section */}
      <div className="page-header" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Geofence Boundaries Guard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Configure permitted operational territory limits, bind vehicles to coordinate hubs, and receive boundary breaching telemetry alerts.
          </p>
        </div>
        <button 
          onClick={() => {
            setIsModalOpen(true);
            setFormData({
              imei: '',
              geofencName: '',
              lat: 22.7533,
              lng: 75.8937,
              radius: 100
            });
          }}
          className="btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: 8, height: 42 }}
        >
          <span className="material-icons">add_location_alt</span>
          Add Geofence
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
              placeholder="Search by zone name, imei, plate..."
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
            Active Zones: {filteredGeofences.length} boundaries
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)', margin: 'auto' }}>
            <div className="spinner" style={{ margin: '0 auto 16px auto' }}></div>
            <span>Fetching operational boundaries...</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Zone / Safety Hub Name</th>
                  <th style={{ padding: '12px 16px' }}>Fleet Vehicle Binding</th>
                  <th style={{ padding: '12px 16px' }}>Center Coordinates</th>
                  <th style={{ padding: '12px 16px' }}>Configured Radius</th>
                  <th style={{ padding: '12px 16px' }}>Created Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGeofences.length > 0 ? (
                  filteredGeofences.map((g) => {
                    const matchedVeh = vehicles.find(v => v.imei === g.imei) || {};
                    const coord = (g.geofencingCoordinates && g.geofencingCoordinates[0]) || { lat: 22.7533, lng: 75.8937 };
                    return (
                      <tr key={g._id || g.imei} style={{ borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span className="material-icons" style={{ color: 'var(--primary)', fontSize: 20 }}>share_location</span>
                            <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{g.geofencName || 'Safety Hub'}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 600 }}>{matchedVeh.vehicleMaker || 'Asset'} {matchedVeh.vehicleModel || ''}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{matchedVeh.vehicleNumber || 'Unbound'} • IMEI: {g.imei}</div>
                        </td>
                        <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: '#475569' }}>
                          Lat: {Number(coord.lat).toFixed(5)}, Lng: {Number(coord.lng).toFixed(5)}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ padding: '4px 8px', borderRadius: 6, background: '#eff6ff', color: 'var(--primary)', fontSize: 11, fontWeight: 700 }}>
                            {g.radius || 100} meters
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                          {g.createdAt ? new Date(g.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleDeleteGeofence(g.imei)}
                            className="btn-secondary"
                            style={{ padding: '6px 10px', fontSize: 12, borderRadius: 8, color: '#ef4444', border: '1px solid #ef444430' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                      No active operational zones created yet. Click "Add Geofence" to set borders.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE GEOFENCE MODAL */}
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
          <div className="card" style={{ width: 440, padding: '24px', position: 'relative', borderRadius: 20, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: 16, right: 16, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <span className="material-icons">close</span>
            </button>

            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-icons" style={{ color: 'var(--primary)' }}>add_location_alt</span>
              Add Geofence Boundary
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 20 }}>
              Specify the center point latitude, longitude, radius and vehicle anchor mapping.
            </p>

            <form onSubmit={handleCreateOrUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Anchor Fleet Vehicle <strong style={{ color: 'red' }}>*</strong>
                </label>
                <select
                  value={formData.imei}
                  required
                  onChange={(e) => setFormData(prev => ({ ...prev, imei: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'white' }}
                >
                  <option value="">-- Select matching fleet asset --</option>
                  {vehicles.map(v => (
                    <option key={v._id} value={v.imei}>
                      {v.vehicleMaker} {v.vehicleModel} - {v.vehicleNumber} ({v.imei})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Boundary Location Name <strong style={{ color: 'red' }}>*</strong>
                </label>
                <input
                  type="text"
                  required
                  value={formData.geofencName}
                  onChange={(e) => setFormData(prev => ({ ...prev, geofencName: e.target.value }))}
                  placeholder="e.g. Headquarters Office, Loading Dock 4"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'white', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                    Latitude <strong style={{ color: 'red' }}>*</strong>
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={formData.lat}
                    onChange={(e) => setFormData(prev => ({ ...prev, lat: e.target.value }))}
                    placeholder="e.g. 22.7533"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'white', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                    Longitude <strong style={{ color: 'red' }}>*</strong>
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={formData.lng}
                    onChange={(e) => setFormData(prev => ({ ...prev, lng: e.target.value }))}
                    placeholder="e.g. 75.8937"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'white', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Boundary Perimeter Radius (Meters)
                </label>
                <input
                  type="number"
                  value={formData.radius}
                  onChange={(e) => setFormData(prev => ({ ...prev, radius: e.target.value }))}
                  placeholder="e.g. 100"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'white', outline: 'none' }}
                />
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
                  {actionLoading ? 'Saving Boundary...' : 'Save Boundary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

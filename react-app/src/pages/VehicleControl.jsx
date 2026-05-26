import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/network';

export default function VehicleControl() {
  const [controls, setControls] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Creation modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingImei, setEditingImei] = useState(null); // If editing a profile
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [formData, setFormData] = useState({
    imei: '',
    tankCapacity: 60,
    vehicleMileage: 12.5,
    vehicleLock: 'false',
    vehicleIcon: 'car',
    vehicleColor: '#2463eb'
  });

  // Action loading overlay state
  const [actionLoading, setActionLoading] = useState(false);

  // IMEI clickable detail modal states
  const [selectedImeiDetails, setSelectedImeiDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch active configured controls list
      const resControls = await fetch(`${BASE_URL}/api/vehicle-control/list`);
      if (resControls.ok) {
        const data = await resControls.json();
        if (Array.isArray(data)) {
          setControls(data);
        } else if (data && Array.isArray(data.result)) {
          setControls(data.result);
        } else if (data && Array.isArray(data.data)) {
          setControls(data.data);
        } else {
          setControls([]);
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
      console.error('Error fetching controls database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Inject custom animation styles for live glowing pulse rings
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      @keyframes pulse-red {
        0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
        70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
        100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
      }
      @keyframes pulse-green {
        0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
        70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
        100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
      }
      .pulse-indicator-red {
        animation: pulse-red 2s infinite;
      }
      .pulse-indicator-green {
        animation: pulse-green 2s infinite;
      }
      .row-hover:hover {
        background-color: #f8fafc !important;
        transform: translateY(-1px);
        transition: all 0.2s ease;
      }
    `;
    document.head.appendChild(styleEl);
    
    // Load initial channels telemetry list
    loadData();

    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  // Engine lock toggle switch with optimistic UI updates
  const handleToggleLock = async (imei, currentLockState) => {
    setActionLoading(true);
    
    // Optimistic state updates for smooth premium feel
    const updatedState = currentLockState === 'true' ? 'false' : 'true';
    setControls(prev => prev.map(c => c.imei === imei ? { ...c, vehicleLock: updatedState } : c));

    try {
      const res = await fetch(`${BASE_URL}/api/vehicle-control/lock-unlock/${imei}`, {
        method: 'PUT',
        headers: {
          'accept': 'application/json'
        }
      });
      
      if (!res.ok) {
        // Revert on failure
        setControls(prev => prev.map(c => c.imei === imei ? { ...c, vehicleLock: currentLockState } : c));
        alert('Failed to transmit toggle command to engine immobilizer relay.');
      }
    } catch (err) {
      console.error(err);
      // Revert on failure
      setControls(prev => prev.map(c => c.imei === imei ? { ...c, vehicleLock: currentLockState } : c));
      alert('Network timeout connecting to vehicle relay gateway.');
    } finally {
      setActionLoading(false);
    }
  };

  // Profile creation & image upload / update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const dataPayload = new FormData();
      dataPayload.append('imei', formData.imei);
      dataPayload.append('tankCapacity', Number(formData.tankCapacity));
      dataPayload.append('vehicleMileage', Number(formData.vehicleMileage));
      dataPayload.append('vehicleLock', formData.vehicleLock);
      dataPayload.append('vehicleIcon', formData.vehicleIcon);
      dataPayload.append('vehicleColor', formData.vehicleColor);
      
      if (selectedFile) {
        dataPayload.append('vehicleImage', selectedFile);
      }

      const url = editingImei 
        ? `${BASE_URL}/api/vehicle-control/update/${editingImei}`
        : `${BASE_URL}/api/vehicle-control/create`;
      
      const method = editingImei ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        body: dataPayload
      });

      if (res.ok) {
        alert(editingImei ? 'Vehicle Control specifications updated successfully!' : 'Vehicle Control specifications saved successfully!');
        setIsModalOpen(false);
        setFormData({
          imei: '',
          tankCapacity: 60,
          vehicleMileage: 12.5,
          vehicleLock: 'false',
          vehicleIcon: 'car',
          vehicleColor: '#2463eb'
        });
        setSelectedFile(null);
        setEditingImei(null);
        loadData();
      } else {
        const errJson = await res.json();
        alert(`Failed: ${errJson.message || 'Error occurred'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Connection error saving specifications.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingImei(null);
    setSelectedFile(null);
  };

  const handleEditClick = async (controlItem) => {
    setEditingImei(controlItem.imei);
    setIsModalOpen(true);
    setActionLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/vehicle-control/${controlItem.imei}`);
      if (res.ok) {
        const data = await res.json();
        const details = data.data || data.result || data || {};
        setFormData({
          imei: details.imei || controlItem.imei,
          tankCapacity: details.tankCapacity !== undefined ? details.tankCapacity : (controlItem.tankCapacity || 60),
          vehicleMileage: details.vehicleMileage !== undefined ? details.vehicleMileage : (controlItem.vehicleMileage || 12.5),
          vehicleLock: details.vehicleLock !== undefined ? String(details.vehicleLock) : String(controlItem.vehicleLock),
          vehicleIcon: details.vehicleIcon || controlItem.vehicleIcon || 'car',
          vehicleColor: details.vehicleColor || controlItem.vehicleColor || '#2463eb'
        });
      } else {
        // Fallback
        setFormData({
          imei: controlItem.imei,
          tankCapacity: controlItem.tankCapacity,
          vehicleMileage: controlItem.vehicleMileage,
          vehicleLock: String(controlItem.vehicleLock),
          vehicleIcon: controlItem.vehicleIcon || 'car',
          vehicleColor: controlItem.vehicleColor || '#2463eb'
        });
      }
    } catch (err) {
      console.error(err);
      // Fallback
      setFormData({
        imei: controlItem.imei,
        tankCapacity: controlItem.tankCapacity,
        vehicleMileage: controlItem.vehicleMileage,
        vehicleLock: String(controlItem.vehicleLock),
        vehicleIcon: controlItem.vehicleIcon || 'car',
        vehicleColor: controlItem.vehicleColor || '#2463eb'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleShowImeiDetails = async (imei) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/vehicle-control/${imei}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.data) {
          setSelectedImeiDetails(data.data);
          setIsDetailsModalOpen(true);
        } else if (data) {
          setSelectedImeiDetails(data);
          setIsDetailsModalOpen(true);
        }
      } else {
        alert('Failed to retrieve device parameters.');
      }
    } catch (err) {
      console.error(err);
      alert('Connection error retrieving specifications.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete control profile
  const handleDeleteProfile = async (imei) => {
    if (!confirm('Are you sure you want to reset and delete this vehicle control profile?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/vehicle-control/delete/${imei}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert('Profile deleted successfully.');
        loadData();
      } else {
        alert('Failed to delete profile.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'suv': return 'directions_car';
      case 'truck': return 'local_shipping';
      case 'motorcycle': return 'two_wheeler';
      default: return 'directions_car';
    }
  };

  const filteredControls = Array.isArray(controls) ? controls.filter(c => {
    const query = searchTerm.toLowerCase();
    const veh = c.vehicleDetails || (Array.isArray(vehicles) ? (vehicles.find(v => v.imei === c.imei) || {}) : {});
    return (
      c.imei?.toLowerCase().includes(query) ||
      veh.vehicleNumber?.toLowerCase().includes(query) ||
      veh.vehicleMaker?.toLowerCase().includes(query) ||
      veh.vehicleModel?.toLowerCase().includes(query)
    );
  }) : [];

  const totalControllers = controls.length;
  const lockedControllers = controls.filter(c => c.vehicleLock === 'true' || c.vehicleLock === true).length;
  const activeControllers = totalControllers - lockedControllers;
  const totalFuelCapacity = controls.reduce((acc, curr) => acc + (Number(curr.tankCapacity) || 0), 0);

  return (
    <div className="fade-in" style={{ padding: '0 4px', minHeight: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header bar */}
      <div className="page-header" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Vehicle Immobilization Control</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Monitor tank capacity, configure active fuel parameters, upload cover graphics and transmit live immobilizer engine lock relays.
          </p>
        </div>
        <button 
          onClick={() => {
            setEditingImei(null);
            setIsModalOpen(true);
            setFormData({
              imei: '',
              tankCapacity: 60,
              vehicleMileage: 12.5,
              vehicleLock: 'false',
              vehicleIcon: 'car',
              vehicleColor: '#2463eb'
            });
            setSelectedFile(null);
          }}
          className="btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: 8, height: 42 }}
        >
          <span className="material-icons">add_circle</span>
          Configure Specs
        </button>
      </div>

      {/* Dynamic Telemetry Stats Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
        {/* Card 1: Registered Systems */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid #bfdbfe', borderRadius: 16 }}>
          <div style={{ background: 'var(--primary)', color: 'white', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-icons" style={{ fontSize: 24 }}>settings_remote</span>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#1e3a8a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Controllers</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#1e3a8a', marginTop: 2 }}>{totalControllers}</div>
          </div>
        </div>

        {/* Card 2: Active / Running Engines */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid #a7f3d0', borderRadius: 16 }}>
          <div style={{ background: '#10b981', color: 'white', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-icons" style={{ fontSize: 24 }}>power</span>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#064e3b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Active & Running</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#064e3b', marginTop: 2 }}>{activeControllers}</div>
          </div>
        </div>

        {/* Card 3: Immobilized Relays */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', border: '1px solid #fca5a5', borderRadius: 16 }}>
          <div style={{ background: '#ef4444', color: 'white', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-icons" style={{ fontSize: 24 }}>lock</span>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#7f1d1d', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Killed / Locked</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#7f1d1d', marginTop: 2 }}>{lockedControllers}</div>
          </div>
        </div>

        {/* Card 4: Managed Fuel volume */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', background: 'linear-gradient(135deg, #fdf8f2 0%, #fef3c7 100%)', border: '1px solid #fde68a', borderRadius: 16 }}>
          <div style={{ background: '#f59e0b', color: 'white', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-icons" style={{ fontSize: 24 }}>local_gas_station</span>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#78350f', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Capacity Managed</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#78350f', marginTop: 2 }}>{totalFuelCapacity} <span style={{ fontSize: 16 }}>L</span></div>
          </div>
        </div>
      </div>

      {/* Main card panel */}
      <div className="card" style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Search bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ position: 'relative', width: 300 }}>
            <span className="material-icons" style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)', fontSize: 20 }}>search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by IMEI, Vehicle No..."
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
            Showing {filteredControls.length} of {controls.length} controller systems
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)', margin: 'auto' }}>
            <div className="spinner" style={{ margin: '0 auto 16px auto' }}></div>
            <span>Fetching relay channels list...</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Vehicle Details</th>
                  <th style={{ padding: '12px 16px' }}>Device IMEI</th>
                  <th style={{ padding: '12px 16px' }}>Specs Configuration</th>
                  <th style={{ padding: '12px 16px' }}>Mileage Rating</th>
                  <th style={{ padding: '12px 16px' }}>Engine Lock State</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredControls.length > 0 ? (
                  filteredControls.map((control) => {
                    const matchedVeh = control.vehicleDetails || (Array.isArray(vehicles) ? (vehicles.find(v => v.imei === control.imei) || {}) : {});
                    const isLocked = control.vehicleLock === 'true' || control.vehicleLock === true;
                    return (
                      <tr key={control._id || control.imei} className="row-hover" style={{ borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {/* Avatar Display picture */}
                            {control.vehicleImage ? (
                              <img 
                                src={control.vehicleImage} 
                                alt="Vehicle"
                                style={{ 
                                  width: 44, 
                                  height: 44, 
                                  borderRadius: 12, 
                                  objectFit: 'cover',
                                  flexShrink: 0
                                }}
                              />
                            ) : (
                              <div 
                                style={{ 
                                  width: 44, 
                                  height: 44, 
                                  borderRadius: 12, 
                                  background: control.vehicleColor || 'var(--primary)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  flexShrink: 0
                                }}
                              >
                                <span className="material-icons">{getIcon(control.vehicleIcon)}</span>
                              </div>
                            )}
                            <div>
                              <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                                {matchedVeh.vehicleMaker || 'Custom'} {matchedVeh.vehicleModel || 'Asset'}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                {matchedVeh.vehicleNumber || 'No Plate'} • {matchedVeh.vehicleType || 'Unknown'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 600, color: '#334155' }}>
                          {control.imei}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="material-icons" style={{ fontSize: 16, color: 'var(--text-muted)' }}>local_gas_station</span>
                            <span>Fuel Tank: <strong>{control.tankCapacity} Litres</strong></span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-main)' }}>
                          {control.vehicleMileage} km/L
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {/* Live Lock Badge */}
                            <span 
                              className={isLocked ? "pulse-indicator-red" : "pulse-indicator-green"}
                              style={{
                                fontSize: 10,
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                color: isLocked ? '#ef4444' : '#10b981',
                                background: isLocked ? '#ef444415' : '#10b98115',
                                padding: '4px 10px',
                                borderRadius: 6,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                            >
                              <span className="material-icons" style={{ fontSize: 12 }}>{isLocked ? 'lock' : 'lock_open'}</span>
                              {isLocked ? 'Immobilized' : 'Active'}
                            </span>

                            {/* Toggle switch control button */}
                            <button
                              onClick={() => handleToggleLock(control.imei, control.vehicleLock)}
                              disabled={actionLoading}
                              style={{
                                border: 'none',
                                background: isLocked ? '#ef4444' : '#10b981',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: 6,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: 11,
                                fontWeight: 700,
                                outline: 'none'
                              }}
                            >
                              {isLocked ? 'Unlock Engine' : 'Kill Engine'}
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 8 }}>
                            <button
                              onClick={() => handleShowImeiDetails(control.imei)}
                              className="btn-secondary"
                              style={{ padding: '6px 10px', fontSize: 12, borderRadius: 8, color: 'var(--primary)', border: '1px solid var(--primary-light)' }}
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleEditClick(control)}
                              className="btn-secondary"
                              style={{ padding: '6px 10px', fontSize: 12, borderRadius: 8 }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProfile(control.imei)}
                              className="btn-secondary"
                              style={{ padding: '6px 10px', fontSize: 12, borderRadius: 8, color: '#ef4444', border: '1px solid #ef444430' }}
                            >
                              Reset
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                      No configured vehicle relays matching current search filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CONFIGURERelay / EDIT SPECS MODAL */}
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
          <div className="card" style={{ width: 460, padding: '24px', position: 'relative', borderRadius: 20, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <button 
              onClick={handleCloseModal}
              style={{ position: 'absolute', top: 16, right: 16, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <span className="material-icons">close</span>
            </button>

            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-icons" style={{ color: 'var(--primary)' }}>settings_remote</span>
              {editingImei ? 'Edit Specs Configuration' : 'Configure Relay Specifications'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 20 }}>
              Bind fuel tank capacity metrics and select display colors for active GPS vehicle markers.
            </p>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* IMEI dropdown list */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Device IMEI <strong style={{ color: 'red' }}>*</strong>
                </label>
                {editingImei ? (
                  <input
                    type="text"
                    disabled
                    value={formData.imei}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: '#f1f5f9', cursor: 'not-allowed', color: 'var(--text-muted)' }}
                  />
                ) : (
                  <select
                    value={formData.imei}
                    required
                    onChange={(e) => setFormData(prev => ({ ...prev, imei: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'white', outline: 'none' }}
                  >
                    <option value="">-- Choose fleet vehicle imei --</option>
                    {vehicles.map(v => (
                      <option key={v._id} value={v.imei}>
                        {v.vehicleMaker} {v.vehicleModel} - {v.vehicleNumber} ({v.imei})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Tank capacity and mileage grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                    Fuel Tank Capacity (L) <strong style={{ color: 'red' }}>*</strong>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.tankCapacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, tankCapacity: e.target.value }))}
                    placeholder="e.g. 60"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'white', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                    Mileage Rating (km/L) <strong style={{ color: 'red' }}>*</strong>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.vehicleMileage}
                    onChange={(e) => setFormData(prev => ({ ...prev, vehicleMileage: e.target.value }))}
                    placeholder="e.g. 12.5"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'white', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Avatar Icon and color grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                    GPS Marker Avatar Icon <strong style={{ color: 'red' }}>*</strong>
                  </label>
                  <select
                    value={formData.vehicleIcon}
                    required
                    onChange={(e) => setFormData(prev => ({ ...prev, vehicleIcon: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'white', outline: 'none' }}
                  >
                    <option value="car">🚗 Sedan / Car</option>
                    <option value="suv">🚙 SUV / Utility</option>
                    <option value="truck">🚚 Truck / Carrier</option>
                    <option value="motorcycle">🏍️ Motorcycle</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                    Display Color <strong style={{ color: 'red' }}>*</strong>
                  </label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="color"
                      value={formData.vehicleColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, vehicleColor: e.target.value }))}
                      style={{ width: 44, height: 38, padding: 0, border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', background: 'transparent' }}
                    />
                    <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 'bold' }}>{formData.vehicleColor}</span>
                  </div>
                </div>
              </div>

              {/* Asset cover picture image upload */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Vehicle Graphic Picture (Cover Display)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  style={{ width: '100%', fontSize: 12 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button 
                  type="button" 
                  onClick={handleCloseModal}
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
                  {actionLoading ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMEI DETAILS DIALOG MODAL */}
      {isDetailsModalOpen && selectedImeiDetails && (
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
          <div className="card" style={{ width: 480, padding: '24px', position: 'relative', borderRadius: 20, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <button 
              onClick={() => {
                setIsDetailsModalOpen(false);
                setSelectedImeiDetails(null);
              }}
              style={{ position: 'absolute', top: 16, right: 16, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <span className="material-icons">close</span>
            </button>

            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-icons" style={{ color: 'var(--primary)' }}>info</span>
              Device Profile Summary
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Graphic if any */}
              {selectedImeiDetails.vehicleImage && (
                <img 
                  src={selectedImeiDetails.vehicleImage} 
                  alt="Vehicle Cover" 
                  style={{ width: '100%', height: 160, borderRadius: 12, objectFit: 'cover' }}
                />
              )}

              {/* Data Table List Grid */}
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Device IMEI:</span>
                  <strong style={{ fontFamily: 'monospace' }}>{selectedImeiDetails.imei}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tank Capacity:</span>
                  <strong>{selectedImeiDetails.tankCapacity} Litres</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Mileage Rating:</span>
                  <strong>{selectedImeiDetails.vehicleMileage} km/L</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Marker Icon:</span>
                  <strong>{selectedImeiDetails.vehicleIcon || 'car'} ({selectedImeiDetails.vehicleColor || 'Primary'})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Engine Relay Lock:</span>
                  <span style={{ color: selectedImeiDetails.vehicleLock === true || selectedImeiDetails.vehicleLock === 'true' ? '#ef4444' : '#10b981', fontWeight: 800 }}>
                    {selectedImeiDetails.vehicleLock === true || selectedImeiDetails.vehicleLock === 'true' ? 'Immobilized' : 'Active'}
                  </span>
                </div>
              </div>

              {/* Nested vehicle details */}
              {selectedImeiDetails.vehicleDetails && (
                <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8, textTransform: 'uppercase' }}>Fleet Metadata</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Maker / Model:</span>
                      <strong>{selectedImeiDetails.vehicleDetails.vehicleMaker || 'Custom'} {selectedImeiDetails.vehicleDetails.vehicleModel || 'Asset'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Plate Number:</span>
                      <strong>{selectedImeiDetails.vehicleDetails.vehicleNumber || 'N/A'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Type:</span>
                      <strong>{selectedImeiDetails.vehicleDetails.vehicleType || 'Unknown'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block' }}>Fuel Type:</span>
                      <strong>{selectedImeiDetails.vehicleDetails.fuelType || 'petrol'}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setSelectedImeiDetails(null);
                }}
                className="btn-primary" 
                style={{ minWidth: 100, height: 38 }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

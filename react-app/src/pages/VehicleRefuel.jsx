import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/network';

export default function VehicleRefuel() {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    imei: '',
    fuelAmount: 40, // Amount of liters refueled
    pricePerLiter: 102.50,
    totalCost: 4100,
    currentOdometer: 12000
  });

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch refuel list
      const resLogs = await fetch(`${BASE_URL}/api/vehicle-refuel/list`);
      if (resLogs.ok) {
        const data = await resLogs.json();
        if (data && Array.isArray(data.result)) {
          setLogs(data.result);
        } else if (Array.isArray(data)) {
          setLogs(data);
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
      console.error('Error fetching refuel data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync price per liter and fuel amount to calculate totalCost automatically
  useEffect(() => {
    const calculated = Number(formData.fuelAmount) * Number(formData.pricePerLiter);
    setFormData(prev => ({
      ...prev,
      totalCost: isNaN(calculated) ? 0 : Number(calculated.toFixed(2))
    }));
  }, [formData.fuelAmount, formData.pricePerLiter]);

  const handleCreateLog = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        imei: formData.imei,
        fuelAmount: Number(formData.fuelAmount),
        pricePerLiter: Number(formData.pricePerLiter),
        totalCost: Number(formData.totalCost),
        currentOdometer: Number(formData.currentOdometer)
      };

      const res = await fetch(`${BASE_URL}/api/vehicle-refuel/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Refuel log entry recorded successfully!');
        setIsModalOpen(false);
        setFormData({
          imei: '',
          fuelAmount: 40,
          pricePerLiter: 102.50,
          totalCost: 4100,
          currentOdometer: 12000
        });
        loadData();
      } else {
        alert('Failed to save refuel log entry.');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving refuel log entry.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredLogs = Array.isArray(logs) ? logs.filter(l => {
    const query = searchTerm.toLowerCase();
    const veh = Array.isArray(vehicles) ? (vehicles.find(v => v.imei === l.imei) || {}) : {};
    return (
      l.imei?.toLowerCase().includes(query) ||
      veh.vehicleNumber?.toLowerCase().includes(query) ||
      veh.vehicleMaker?.toLowerCase().includes(query)
    );
  }) : [];

  return (
    <div className="fade-in" style={{ padding: '0 4px', minHeight: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header section */}
      <div className="page-header" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Fuel Refuel Logging Console</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Monitor and record vehicle gas recharges, evaluate expenses, and assess general mileage efficiency across active transit units.
          </p>
        </div>
        <button 
          onClick={() => {
            setIsModalOpen(true);
            setFormData({
              imei: '',
              fuelAmount: 40,
              pricePerLiter: 102.50,
              totalCost: 4100,
              currentOdometer: 12000
            });
          }}
          className="btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: 8, height: 42 }}
        >
          <span className="material-icons">local_gas_station</span>
          Record Refuel
        </button>
      </div>

      {/* Main card grid */}
      <div className="card" style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Search header row */}
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
            Logs Logged: {filteredLogs.length} transactions
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)', margin: 'auto' }}>
            <div className="spinner" style={{ margin: '0 auto 16px auto' }}></div>
            <span>Fetching fuel consumption charts...</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Vehicle Refueled</th>
                  <th style={{ padding: '12px 16px' }}>Odometer Mark</th>
                  <th style={{ padding: '12px 16px' }}>Fuel Refueled</th>
                  <th style={{ padding: '12px 16px' }}>Cost Metrics</th>
                  <th style={{ padding: '12px 16px' }}>Total Expense</th>
                  <th style={{ padding: '12px 16px' }}>Logged Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => {
                    const matchedVeh = vehicles.find(v => v.imei === log.imei) || {};
                    return (
                      <tr key={log._id || log.createdAt} style={{ borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                              <span className="material-icons" style={{ fontSize: 18 }}>local_gas_station</span>
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                                {matchedVeh.vehicleMaker || 'Asset'} {matchedVeh.vehicleModel || ''}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                IMEI: {log.imei}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                          {log.currentOdometer || 'N/A'} km
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <strong>{log.fuelAmount} Litres</strong>
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                          ₹{log.pricePerLiter}/L
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: '#10b981' }}>
                            ₹{log.totalCost}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                      No refuel logs created. Click "Record Refuel" to document an entry.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECORD REFUEL MODAL */}
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
              <span className="material-icons" style={{ color: 'var(--primary)' }}>local_gas_station</span>
              Record Refuel Log
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 20 }}>
              Bind refuel details directly to a vehicle profile.
            </p>

            <form onSubmit={handleCreateLog} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Vehicle IMEI <strong style={{ color: 'red' }}>*</strong>
                </label>
                <select
                  value={formData.imei}
                  required
                  onChange={(e) => setFormData(prev => ({ ...prev, imei: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'white' }}
                >
                  <option value="">-- Choose matching vehicle --</option>
                  {vehicles.map(v => (
                    <option key={v._id} value={v.imei}>
                      {v.vehicleMaker} {v.vehicleModel} - {v.vehicleNumber} ({v.imei})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                    Fuel Amount (Litres) <strong style={{ color: 'red' }}>*</strong>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.fuelAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, fuelAmount: e.target.value }))}
                    placeholder="e.g. 40"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'white', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                    Price Per Liter (₹) <strong style={{ color: 'red' }}>*</strong>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.pricePerLiter}
                    onChange={(e) => setFormData(prev => ({ ...prev, pricePerLiter: e.target.value }))}
                    placeholder="e.g. 102.50"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'white', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                    Current Odometer (km) <strong style={{ color: 'red' }}>*</strong>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.currentOdometer}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentOdometer: e.target.value }))}
                    placeholder="e.g. 12000"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'white', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                    Total Cost Calculated (₹)
                  </label>
                  <input
                    type="number"
                    disabled
                    value={formData.totalCost}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: '#f1f5f9', cursor: 'not-allowed', fontWeight: 'bold' }}
                  />
                </div>
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
                  {actionLoading ? 'Saving Log...' : 'Record Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

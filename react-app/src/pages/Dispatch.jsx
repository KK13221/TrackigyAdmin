import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/network';

const STATUS_COLORS = {
  active: { bg: 'var(--success-light)', text: 'var(--success)', dot: 'var(--success)' },
  inactive: { bg: 'var(--warning-light)', text: 'var(--warning)', dot: 'var(--warning)' },
  idle: { bg: 'var(--primary-light)', text: 'var(--primary)', dot: 'var(--primary)' },
};

function VehicleCard({ v, selected, onSelect }) {
  const status = (v.status || 'active').toLowerCase();
  const sc = STATUS_COLORS[status] || STATUS_COLORS.active;
  const initials = ((v.vehicleMaker || 'V')[0] + (v.vehicleModel || 'D')[0]).toUpperCase();

  return (
    <div
      onClick={() => onSelect(v)}
      style={{
        padding: '14px 16px',
        borderRadius: 12,
        border: selected ? '2px solid var(--primary)' : '2px solid transparent',
        background: selected ? 'var(--primary-light)' : 'var(--bg-main)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: selected ? '0 0 0 3px var(--primary-light)' : '0 1px 4px rgba(0,0,0,0.07)',
        marginBottom: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: selected ? 'var(--primary)' : 'var(--bg-sidebar)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 14,
          color: selected ? 'white' : 'var(--text-muted)',
          flexShrink: 0,
        }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {v.vehicleMaker} {v.vehicleModel}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{v.vehicleNumber || v.imei || 'N/A'}</div>
        </div>
        <span style={{
          background: sc.bg, color: sc.text,
          padding: '3px 8px', borderRadius: 20,
          fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
          whiteSpace: 'nowrap', flexShrink: 0,
        }}>{status}</span>
      </div>
      {v.imei && (
        <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 12 }}>
          <span><span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>IMEI:</span> {v.imei}</span>
          {v.fuelType && <span><span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Fuel:</span> {v.fuelType}</span>}
        </div>
      )}
    </div>
  );
}

function StatBadge({ icon, label, value, color }) {
  return (
    <div style={{
      background: 'var(--bg-sidebar)', borderRadius: 14, padding: '16px 20px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
      display: 'flex', alignItems: 'center', gap: 14, flex: 1,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 10,
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="material-icons" style={{ color, fontSize: 22 }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-main)', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

export default function Dispatch({ user }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [search, setSearch] = useState('');
  const [dispatchLogs, setDispatchLogs] = useState([]);

  // Dispatch form state
  const [form, setForm] = useState({
    destination: '',
    driverName: '',
    priority: 'standard',
    note: '',
    scheduledAt: new Date().toISOString().slice(0, 16),
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const isAdmin = ['superadmin'].includes((user?.role || '').toLowerCase());
        const userId = user?.id || user?._id || localStorage.getItem('userId');
        const url = isAdmin
          ? `${BASE_URL}/api/vehicle/get-vehicles-list`
          : `${BASE_URL}/api/vehicle/get-vehicles?userId=${userId}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const list = data.vehicles || data.data || (Array.isArray(data) ? data : []);
          setVehicles(list);
          if (list.length > 0) setSelectedVehicle(list[0]);
        }
      } catch (e) {
        console.error('Dispatch vehicle fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, [user]);

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!selectedVehicle) { setErrorMsg('Please select a vehicle first.'); return; }
    if (!form.destination.trim()) { setErrorMsg('Destination is required.'); return; }
    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    // Simulate dispatch log (replace with real API when available)
    await new Promise(r => setTimeout(r, 800));

    const log = {
      id: Date.now(),
      vehicle: `${selectedVehicle.vehicleMaker || ''} ${selectedVehicle.vehicleModel || ''}`.trim() || selectedVehicle.imei,
      imei: selectedVehicle.imei,
      vehicleNumber: selectedVehicle.vehicleNumber,
      destination: form.destination,
      driverName: form.driverName || 'Unassigned',
      priority: form.priority,
      note: form.note,
      scheduledAt: form.scheduledAt,
      dispatchedAt: new Date().toLocaleString(),
    };
    setDispatchLogs(prev => [log, ...prev]);
    setSuccessMsg(`✅ Dispatch order created for ${log.vehicle} → ${log.destination}`);
    setForm({ destination: '', driverName: '', priority: 'standard', note: '', scheduledAt: new Date().toISOString().slice(0, 16) });
    setSubmitting(false);
  };

  const filtered = vehicles.filter(v => {
    const q = search.toLowerCase();
    return (
      (v.vehicleMaker || '').toLowerCase().includes(q) ||
      (v.vehicleModel || '').toLowerCase().includes(q) ||
      (v.vehicleNumber || '').toLowerCase().includes(q) ||
      (v.imei || '').toLowerCase().includes(q)
    );
  });

  const totalVehicles = vehicles.length;
  const activeCount = vehicles.filter(v => (v.status || 'active').toLowerCase() === 'active').length;
  const dispatchedCount = dispatchLogs.length;

  const priorityColors = {
    critical: { bg: 'var(--error-light)', text: 'var(--error)', border: 'var(--error)' },
    express: { bg: 'var(--primary-light)', text: 'var(--primary)', border: 'var(--primary)' },
    standard: { bg: 'var(--bg-main)', text: 'var(--text-muted)', border: 'var(--border)' },
  };

  return (
    <div className="fade-in" style={{ padding: '0 4px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #2463eb, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(36,99,235,0.35)',
          }}>
            <span className="material-icons" style={{ color: 'white', fontSize: 22 }}>local_shipping</span>
          </div>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>Quick Dispatch Center</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, marginTop: 2 }}>
              Select a vehicle, assign a destination, and create dispatch orders instantly
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <StatBadge icon="directions_car" label="Total Fleet" value={loading ? '…' : totalVehicles} color="#2463eb" />
        <StatBadge icon="check_circle" label="Active Vehicles" value={loading ? '…' : activeCount} color="#10b981" />
        <StatBadge icon="assignment_turned_in" label="Orders Today" value={dispatchedCount} color="#f59e0b" />
      </div>

      {/* Main Layout */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Left: Vehicle List */}
        <div style={{ width: 320, flexShrink: 0 }}>
          <div style={{
            background: 'var(--bg-sidebar)', borderRadius: 16, padding: 20,
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-main)', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Fleet Vehicles</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{filtered.length} vehicles</span>
            </div>
            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <span className="material-icons" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'var(--text-muted)' }}>search</span>
              <input
                type="text"
                placeholder="Search vehicle, plate, IMEI…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '9px 9px 9px 34px', borderRadius: 10,
                  border: '1.5px solid var(--border)', fontSize: 12, color: 'var(--text-main)', background: 'var(--bg-main)',
                  outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif',
                }}
              />
            </div>
            <div style={{ maxHeight: 420, overflowY: 'auto', paddingRight: 2 }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                  <span className="material-icons" style={{ fontSize: 32, marginBottom: 8, display: 'block' }}>sync</span>
                  Loading vehicles…
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>No vehicles found</div>
              ) : (
                filtered.map(v => (
                  <VehicleCard
                    key={v._id || v.imei}
                    v={v}
                    selected={(() => {
                      const selKey = selectedVehicle?._id || selectedVehicle?.imei;
                      const vKey = v._id || v.imei;
                      return !!selKey && !!vKey && selKey === vKey;
                    })()}
                    onSelect={setSelectedVehicle}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Dispatch Form + Logs */}
        <div style={{ flex: 1, minWidth: 300 }}>
          {/* Dispatch Form */}
          <div style={{
            background: 'var(--bg-sidebar)', borderRadius: 16, padding: 24,
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span className="material-icons" style={{ color: 'var(--primary)', fontSize: 20 }}>send</span>
              <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-main)' }}>Create Dispatch Order</div>
            </div>

            {/* Selected vehicle preview */}
            {selectedVehicle ? (
              <div style={{
                background: 'var(--primary-light)', borderRadius: 10, padding: '10px 14px',
                marginBottom: 20, border: '1.5px solid var(--primary)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <span className="material-icons" style={{ color: 'var(--primary)', fontSize: 20 }}>directions_car</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-main)' }}>
                    {selectedVehicle.vehicleMaker} {selectedVehicle.vehicleModel}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {selectedVehicle.vehicleNumber || selectedVehicle.imei}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                background: 'var(--warning-light)', borderRadius: 10, padding: '10px 14px',
                marginBottom: 20, border: '1.5px solid var(--warning)', fontSize: 12, color: 'var(--warning)',
              }}>
                ← Select a vehicle from the list to dispatch
              </div>
            )}

            {successMsg && (
              <div style={{ background: 'var(--success-light)', border: '1px solid var(--success)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div style={{ background: 'var(--error-light)', border: '1px solid var(--error)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--error)', fontWeight: 600 }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleDispatch}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                    Destination *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Indore Main Warehouse"
                    value={form.destination}
                    onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 10,
                      border: '1.5px solid var(--border)', fontSize: 13, color: 'var(--text-main)', background: 'var(--bg-main)',
                      outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                    Driver Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={form.driverName}
                    onChange={e => setForm(f => ({ ...f, driverName: e.target.value }))}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 10,
                      border: '1.5px solid var(--border)', fontSize: 13, color: 'var(--text-main)', background: 'var(--bg-main)',
                      outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 10,
                      border: '1.5px solid var(--border)', fontSize: 13, color: 'var(--text-main)', background: 'var(--bg-main)',
                      outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif',
                      background: 'var(--bg-sidebar)', cursor: 'pointer',
                    }}
                  >
                    <option value="standard">Standard</option>
                    <option value="express">Express</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                    Scheduled At
                  </label>
                  <input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 10,
                      border: '1.5px solid var(--border)', fontSize: 13, color: 'var(--text-main)', background: 'var(--bg-main)',
                      outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
                  Note / Instructions
                </label>
                <textarea
                  placeholder="Any special instructions for this dispatch…"
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  rows={3}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10,
                    border: '1.5px solid var(--border)', fontSize: 13, color: 'var(--text-main)', background: 'var(--bg-main)',
                    outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif',
                    resize: 'vertical',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: submitting ? 'var(--text-muted)' : 'linear-gradient(135deg, #2463eb, #3b82f6)',
                  color: 'white', border: 'none', borderRadius: 10,
                  padding: '12px 28px', fontSize: 14, fontWeight: 800,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(36,99,235,0.3)',
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
                }}
              >
                <span className="material-icons" style={{ fontSize: 18 }}>
                  {submitting ? 'sync' : 'send'}
                </span>
                {submitting ? 'Creating Order…' : 'Create Dispatch Order'}
              </button>
            </form>
          </div>

          {/* Dispatch Log */}
          {dispatchLogs.length > 0 && (
            <div style={{
              background: 'var(--bg-sidebar)', borderRadius: 16, padding: 24,
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
            }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-main)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="material-icons" style={{ color: 'var(--success)', fontSize: 18 }}>history</span>
                Today's Dispatch Log
                <span style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 800 }}>
                  {dispatchLogs.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {dispatchLogs.map(log => {
                  const pc = priorityColors[log.priority] || priorityColors.standard;
                  return (
                    <div key={log.id} style={{
                      border: `1.5px solid ${pc.border}`, borderRadius: 12,
                      padding: '12px 16px', background: pc.bg,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-main)' }}>
                          {log.vehicle}
                          <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>
                            {log.vehicleNumber || log.imei}
                          </span>
                        </div>
                        <span style={{ background: 'var(--bg-sidebar)', color: pc.text, border: `1px solid ${pc.border}`, padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>
                          {log.priority}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span><span className="material-icons" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 3 }}>location_on</span>{log.destination}</span>
                        <span><span className="material-icons" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 3 }}>person</span>{log.driverName}</span>
                        <span><span className="material-icons" style={{ fontSize: 13, verticalAlign: 'middle', marginRight: 3 }}>schedule</span>{log.dispatchedAt}</span>
                      </div>
                      {log.note && (
                        <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>"{log.note}"</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/network';

const StatCard = ({ icon, iconColor, iconBg, label, value, subValue, comparison, comparisonPositive }) => (
  <div className="card" style={{ borderRadius: 16, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16, border: '1px solid #f1f5f9' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ background: iconBg, borderRadius: 12, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="material-icons" style={{ color: iconColor, fontSize: 22 }}>{icon}</span>
      </div>
      {comparison && (
        <span style={{
          fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 20,
          background: comparisonPositive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          color: comparisonPositive ? '#10b981' : '#ef4444', letterSpacing: '0.3px'
        }}>
          {comparison}
        </span>
      )}
    </div>
    <div>
      <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', lineHeight: 1.1 }}>{value}</div>
      {subValue && <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginTop: 3 }}>{subValue}</div>}
      <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</div>
    </div>
  </div>
);

export default function Statistics({ user }) {
  const [vehicles, setVehicles] = useState([]);
  const [selectedImei, setSelectedImei] = useState('860710085959719');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch device list or user's vehicles list
  useEffect(() => {
    const savedUser = user || JSON.parse(localStorage.getItem('user') || '{}');
    const isUserAdmin = (savedUser.role || '').toLowerCase() === 'admin';
    const userId = savedUser.id || savedUser._id || localStorage.getItem('userId');

    const targetUrl = isUserAdmin
      ? `${BASE_URL}/api/device/device-list`
      : `${BASE_URL}/api/vehicle/get-vehicles?userId=${userId}`;

    fetch(targetUrl)
      .then(r => r.json())
      .then(data => {
        if (isUserAdmin) {
          const list = data?.data || (Array.isArray(data) ? data : []);
          setVehicles(list);
          const hasPreferred = list.some(v => v.imei === '860710085959719');
          if (hasPreferred) {
            setSelectedImei('860710085959719');
          } else if (list.length > 0) {
            setSelectedImei(list[0].imei || '');
          }
        } else {
          const list = data?.vehicles || [];
          setVehicles(list);
          const hasPreferred = list.some(v => v.imei === '860710085959719');
          if (hasPreferred) {
            setSelectedImei('860710085959719');
          } else if (list.length > 0) {
            setSelectedImei(list[0].imei || '');
          }
        }
      })
      .catch(() => { });
  }, [user]);

  const fetchStats = async (imei, date) => {
    if (!imei) return;
    setLoading(true);
    setError('');
    setStats(null);
    try {
      const res = await fetch(`${BASE_URL}/api/statistics/${imei}?date=${date}`);
      const data = await res.json();
      if (data.success && data.data) {
        setStats(data.data);
      } else {
        setError(data.message || 'No statistics available for this date.');
      }
    } catch {
      setError('Failed to fetch statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedImei) fetchStats(selectedImei, selectedDate);
  }, [selectedImei, selectedDate]);

  const goToPrevDate = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const goToNextDate = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const today = new Date().toISOString().split('T')[0];
  const isCompPositive = (text) => text && (text.startsWith('+') || text.includes('100+'));

  const scoreColor = (s) => s >= 80 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';
  const scoreLabel = (s) => s >= 80 ? 'Excellent' : s >= 50 ? 'Good' : 'Needs Improvement';

  return (
    <div className="fade-in" style={{ padding: '4px 0', fontFamily: "'Inter', sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6 }}>Vehicle Analytics</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', margin: 0 }}>Statistics</h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 4, margin: 0 }}>Daily riding behaviour, journey, speed and fuel metrics.</p>
        </div>
      </div>

      {/* ── Controls Bar ── */}
      <div className="card" style={{ padding: '14px 18px', borderRadius: 14, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', border: '1px solid #f1f5f9' }}>

        {/* Device Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 200px', background: '#f8fafc', borderRadius: 10, padding: '6px 12px', border: '1px solid #e2e8f0' }}>
          <span className="material-icons" style={{ fontSize: 18, color: 'var(--primary)' }}>sim_card</span>
          {vehicles.length > 0 ? (
            <select
              value={selectedImei}
              onChange={e => setSelectedImei(e.target.value)}
              style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 700, outline: 'none', color: '#1e293b' }}
            >
              {vehicles.map(v => {
                const label = v.vehicleModel
                  ? `${v.vehicleMaker} ${v.vehicleModel} — ${v.imei}`
                  : (v.device_name ? `${v.device_name} — ${v.imei}` : v.imei);
                return (
                  <option key={v._id || v.imei} value={v.imei}>
                    {label}
                  </option>
                );
              })}
            </select>
          ) : (
            <input
              type="text"
              placeholder="Enter IMEI..."
              value={selectedImei}
              onChange={e => setSelectedImei(e.target.value)}
              style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 700, outline: 'none' }}
            />
          )}
        </div>

        {/* Date Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={goToPrevDate}
            style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <span className="material-icons" style={{ fontSize: 16, color: '#475569' }}>chevron_left</span>
          </button>
          <input
            type="date"
            value={selectedDate}
            max={today}
            onChange={e => setSelectedDate(e.target.value)}
            style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontWeight: 700, outline: 'none', color: '#1e293b', background: '#f8fafc' }}
          />
          <button
            onClick={goToNextDate}
            disabled={selectedDate >= today}
            style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, width: 34, height: 34, cursor: selectedDate >= today ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: selectedDate >= today ? 0.35 : 1 }}
          >
            <span className="material-icons" style={{ fontSize: 16, color: '#475569' }}>chevron_right</span>
          </button>
        </div>

        {/* Refresh */}
        <button
          onClick={() => fetchStats(selectedImei, selectedDate)}
          disabled={!selectedImei || loading}
          style={{
            background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 10, padding: '8px 16px',
            fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: '0 2px 8px rgba(37,99,235,0.2)', opacity: !selectedImei ? 0.5 : 1, whiteSpace: 'nowrap'
          }}
        >
          <span className="material-icons" style={{ fontSize: 16 }}>{loading ? 'hourglass_empty' : 'refresh'}</span>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <span className="material-icons" style={{ fontSize: 40, color: 'var(--primary)', animation: 'spin 1s linear infinite', display: 'block' }}>sync</span>
          <div style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: '#64748b' }}>Fetching statistics...</div>
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div style={{ textAlign: 'center', padding: '56px 0', background: 'white', borderRadius: 16, border: '2px dashed #fecaca' }}>
          <span className="material-icons" style={{ fontSize: 44, color: '#fca5a5', display: 'block', marginBottom: 10 }}>signal_wifi_off</span>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#334155', margin: '0 0 4px' }}>{error}</h3>
          <p style={{ color: '#94a3b8', fontSize: 12, margin: 0 }}>Try a different date or device.</p>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !error && !stats && !selectedImei && (
        <div style={{ textAlign: 'center', padding: '80px 0', background: 'white', borderRadius: 16, border: '2px dashed #e2e8f0' }}>
          <span className="material-icons" style={{ fontSize: 44, color: '#cbd5e1', display: 'block', marginBottom: 10 }}>insert_chart</span>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#334155', margin: '0 0 4px' }}>Select a Device</h3>
          <p style={{ color: '#94a3b8', fontSize: 12, margin: 0 }}>Choose a device IMEI and date above to view statistics.</p>
        </div>
      )}

      {/* ── Stats Content ── */}
      {!loading && !error && stats && (() => {
        const score = stats.ridingBehaviour?.score || 0;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Vehicle Info Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
              borderRadius: 18, padding: '18px 24px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 12px', display: 'flex' }}>
                  <span className="material-icons" style={{ color: 'white', fontSize: 24 }}>two_wheeler</span>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '1.2px' }}>Selected Device</div>
                  <div style={{ fontSize: 17, fontWeight: 900, color: 'white', marginTop: 2 }}>
                    {stats.vehicle?.displayName || stats.vehicle?.vehicleName || selectedImei}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                    IMEI {stats.vehicle?.imei} &nbsp;·&nbsp; {stats.vehicle?.vehicleNumber}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '1.2px' }}>Report Date</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: 'white', marginTop: 2 }}>
                  {stats.selectedDate?.displayText || stats.selectedDate?.date}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{stats.selectedDate?.date}</div>
              </div>
            </div>

            {/* Riding Behaviour + 4 Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, alignItems: 'stretch' }}>

              {/* Behaviour Score */}
              <div className="card" style={{ borderRadius: 16, padding: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, border: '1px solid #f1f5f9', textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1.3px' }}>Riding Behaviour</div>
                <div style={{ position: 'relative', width: 110, height: 110 }}>
                  <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: 110, height: 110 }}>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none"
                      stroke={scoreColor(score)} strokeWidth="3"
                      strokeDasharray={`${score} 100`} strokeLinecap="round" />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: scoreColor(score) }}>{score}</div>
                    <div style={{ fontSize: 8, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>/ 100</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a' }}>{stats.ridingBehaviour?.statusText || scoreLabel(score)}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginTop: 4 }}>{stats.ridingBehaviour?.comparisonText}</div>
                </div>
              </div>

              {/* 4 metric cards in 2×2 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <StatCard
                  icon="route" iconColor="#2563eb" iconBg="rgba(37,99,235,0.1)"
                  label="Distance Travelled"
                  value={stats.journey?.distanceTravelledText}
                  subValue={`${stats.journey?.distanceTravelled?.toFixed(2)} km total`}
                  comparison={stats.journey?.distanceComparisonText}
                  comparisonPositive={isCompPositive(stats.journey?.distanceComparisonText)}
                />
                <StatCard
                  icon="schedule" iconColor="#7c3aed" iconBg="rgba(124,58,237,0.1)"
                  label="Time on Road"
                  value={stats.journey?.timeDurationText}
                  subValue={`${stats.journey?.timeDurationMinutes} min`}
                  comparison={stats.journey?.durationComparisonText}
                  comparisonPositive={isCompPositive(stats.journey?.durationComparisonText)}
                />
                <StatCard
                  icon="speed" iconColor="#f59e0b" iconBg="rgba(245,158,11,0.1)"
                  label="Avg / Top Speed"
                  value={stats.speed?.averageSpeedText}
                  subValue={`Top: ${stats.speed?.topSpeedText}`}
                  comparison={stats.speed?.averageSpeedComparisonText}
                  comparisonPositive={isCompPositive(stats.speed?.averageSpeedComparisonText)}
                />
                <StatCard
                  icon="local_gas_station" iconColor="#ef4444" iconBg="rgba(239,68,68,0.1)"
                  label="Fuel Consumed"
                  value={stats.fuel?.fuelConsumedText}
                  subValue={`Cost: ${stats.fuel?.fuelCostText}`}
                  comparison={stats.fuel?.fuelConsumedComparisonText}
                  comparisonPositive={isCompPositive(stats.fuel?.fuelConsumedComparisonText)}
                />
              </div>
            </div>

            {/* Speed + Fuel Detail Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

              {/* Speed Detail */}
              <div className="card" style={{ borderRadius: 16, padding: 22, border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                  <span className="material-icons" style={{ color: '#f59e0b', fontSize: 18 }}>speed</span>
                  <span style={{ fontSize: 12, fontWeight: 900, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '1px' }}>Speed Breakdown</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {[
                    { label: 'Average Speed', val: stats.speed?.averageSpeedText, raw: stats.speed?.averageSpeed, max: 80, color: '#2563eb' },
                    { label: 'Top Speed', val: stats.speed?.topSpeedText, raw: stats.speed?.topSpeed, max: 120, color: '#f59e0b' },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>{item.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 900, color: '#1e293b' }}>{item.val}</span>
                      </div>
                      <div style={{ background: '#f1f5f9', borderRadius: 6, height: 7, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 6,
                          background: `linear-gradient(90deg, ${item.color}, ${item.color}99)`,
                          width: `${Math.min(((item.raw || 0) / item.max) * 100, 100)}%`,
                          transition: 'width 1.2s ease'
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fuel Detail */}
              <div className="card" style={{ borderRadius: 16, padding: 22, border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                  <span className="material-icons" style={{ color: '#ef4444', fontSize: 18 }}>local_gas_station</span>
                  <span style={{ fontSize: 12, fontWeight: 900, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '1px' }}>Fuel Summary</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { label: 'Fuel Consumed', val: stats.fuel?.fuelConsumedText, icon: 'opacity', color: '#ef4444' },
                    { label: 'Estimated Cost', val: stats.fuel?.fuelCostText, icon: 'currency_rupee', color: '#10b981' },
                    { label: 'vs Previous Period', val: stats.fuel?.fuelCostComparisonText, icon: 'trending_up', color: '#7c3aed' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ background: `${item.color}15`, borderRadius: 10, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span className="material-icons" style={{ color: item.color, fontSize: 18 }}>{item.icon}</span>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{item.label}</div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: '#1e293b', marginTop: 1 }}>{item.val || '—'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

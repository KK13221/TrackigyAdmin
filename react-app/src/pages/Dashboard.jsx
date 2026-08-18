import React, { useEffect } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import MetricCard from '../components/MetricCard';
import TrackifyLoader from '../components/TrackifyLoader';
import { BASE_URL } from '../utils/network';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

// Fix for default leaflet icons not showing up sometimes
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createClusterCustomIcon = function (cluster) {
  return L.divIcon({
    html: `<span>${cluster.getChildCount()}</span>`,
    className: 'custom-marker-cluster',
    iconSize: L.point(44, 44, true),
  });
};

function MapBounds({ markers }) {
  const map = useMap();
  React.useEffect(() => {
    if (markers && markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [20, 20], maxZoom: 14 });
    }
  }, [markers, map]);
  return null;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Dashboard({ user, onNavigate }) {
  const [recentAlerts, setRecentAlerts] = React.useState([
    { id: 1, type: 'overspeed', vehicle: 'MH 12 AB 1234', message: 'Overspeeding 80 km/h', time: new Date(Date.now() - 15 * 60000).toISOString() },
    { id: 2, type: 'geofence', vehicle: 'GJ 05 CD 5678', message: 'Exited Geofence (Office)', time: new Date(Date.now() - 45 * 60000).toISOString() },
    { id: 3, type: 'battery', vehicle: 'MP 09 EF 9012', message: 'Low Battery (10%)', time: new Date(Date.now() - 120 * 60000).toISOString() },
  ]);

  const [dashboardData, setDashboardData] = React.useState({
    cards: [],
    summary: { totalDevices: 0, totalCustomers: 0, totalActive: 0, totalDeactive: 0 },
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [liveMapData, setLiveMapData] = React.useState([]);

  useEffect(() => {
    const userId = user?.id || user?._id || localStorage.getItem('userId');
    if (!userId) return;
    const isUserAdmin = user && ['superadmin'].includes((user.role || '').toLowerCase());
    const targetUrl = isUserAdmin
      ? `${BASE_URL}/api/device/all-last-locations`
      : `${BASE_URL}/api/vehicle/get-vehicles?userId=${userId}`;

    fetch(targetUrl, { headers: { 'accept': 'application/json' } })
      .then(r => r.json())
      .then(data => {
        let list = [];
        if (isUserAdmin) {
          list = data.result || data.data || [];
        } else {
          list = data.vehicles || data.data || [];
        }
        const mapped = list.map(d => ({
          id: d.imei || d._id,
          name: d.vehicleNumber || d.user_name || d.imei || 'Device',
          lat: parseFloat(d.lat || d.latitude || d.lt || d.currentLocation?.lat),
          lng: parseFloat(d.long || d.lng || d.longitude || d.lg || d.currentLocation?.lng),
          speed: d.speed || 0,
        })).filter(d => !isNaN(d.lat) && !isNaN(d.lng));
        setLiveMapData(mapped);
      })
      .catch(e => console.error("Map data fetch error:", e));
  }, [user]);
  const [isTrendLoading, setIsTrendLoading] = React.useState(true);
  const [timeFilter, setTimeFilter] = React.useState('all');
  const [trendData, setTrendData] = React.useState({
    labels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'],
    dataCount: [5000, 8000, 6000, 12000, 9500, 15000],
    alertsCount: [20, 45, 30, 60, 40, 75]
  });

  useEffect(() => {
    setIsLoading(true);
    fetch(`${BASE_URL}/api/count/dashboard?userId=${user?._id || user?.id || ''}`, { headers: { accept: 'application/json' } })
      .then(r => r.json())
      .then(data => { if (data.success && data.data) setDashboardData(data.data); })
      .catch(err => console.error('Dashboard fetch error:', err))
      .finally(() => setIsLoading(false));
  }, [user]);

  useEffect(() => {
    setIsTrendLoading(true);
    fetch(`${BASE_URL}/api/count/trend?filter=${timeFilter}&userId=${user?._id || user?.id || ''}`, { headers: { accept: 'application/json' } })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data) setTrendData(data.data);
      })
      .catch(err => console.error('Trend fetch error:', err))
      .finally(() => setIsTrendLoading(false));
  }, [timeFilter, user]);

  const chartData = {
    labels: trendData.labels || [],
    datasets: [
      {
        label: 'Data Count',
        data: trendData.dataCount || [],
        backgroundColor: '#2463eb',
        borderRadius: 8,
        barThickness: 26
      },
      {
        label: 'Alerts',
        data: trendData.alertsCount || [],
        backgroundColor: '#ef4444',
        borderRadius: 8,
        barThickness: 26,
        yAxisID: 'y1'
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        grid: { color: 'rgba(150, 150, 150, 0.1)' },
        ticks: { color: '#94a3b8', font: { size: 11, weight: '600' } }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        grid: { drawOnChartArea: false },
        ticks: { color: '#ef4444', font: { size: 11, weight: '600' } }
      },
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11, weight: '600' } } },
    },
  };

  const cardsToRender = isLoading
    ? [
      { key: 'total_company', title: 'TOTAL COMPANY', value: '0', icon: 'company' },
      { key: 'active_company', title: 'ACTIVE COMPANY', value: '0', badgeText: 'Active', icon: 'active_company' },
      { key: 'deactive_company', title: 'DEACTIVE COMPANY', value: '0', icon: 'deactive_company' },
      { key: 'active_device', title: 'ACTIVE DEVICE', value: '0', badgeText: 'Active', icon: 'active_device' },
      { key: 'deactive_device', title: 'DEACTIVE DEVICE', value: '0', icon: 'deactive_device' },
      { key: 'inventory', title: 'INVENTORY', value: '0', icon: 'inventory' },
    ]
    : dashboardData.cards?.length > 0
      ? dashboardData.cards
      : [
        { key: 'total_company', title: 'TOTAL COMPANY', value: dashboardData.summary?.totalCompany ?? 0, icon: 'company' },
        { key: 'active_company', title: 'ACTIVE COMPANY', value: dashboardData.summary?.totalActiveCompany ?? 0, badgeText: 'Active', icon: 'active_company' },
        { key: 'deactive_company', title: 'DEACTIVE COMPANY', value: dashboardData.summary?.totalDeactiveCompany ?? 0, icon: 'deactive_company' },
        { key: 'active_device', title: 'ACTIVE DEVICE', value: dashboardData.summary?.totalActiveDevices ?? 0, badgeText: 'Active', icon: 'active_device' },
        { key: 'deactive_device', title: 'DEACTIVE DEVICE', value: dashboardData.summary?.totalDeactiveDevices ?? 0, icon: 'deactive_device' },
        { key: 'inventory', title: 'INVENTORY', value: dashboardData.summary?.inventoryCount ?? 0, icon: 'inventory' },
      ];

  const keyIconMap = { total_company: 'business', active_company: 'domain_verification', deactive_company: 'domain_disabled', active_device: 'gps_fixed', deactive_device: 'gps_off', inventory: 'inventory_2' };
  const keyColorMap = { total_company: 'blue', active_company: 'green', deactive_company: 'orange', active_device: 'teal', deactive_device: 'red', inventory: 'purple' };
  const iconMap = { company: 'business', active_company: 'domain_verification', deactive_company: 'domain_disabled', active_device: 'gps_fixed', deactive_device: 'gps_off', inventory: 'inventory_2' };
  const colorMap = { company: 'blue', active_company: 'green', deactive_company: 'orange', active_device: 'teal', deactive_device: 'red', inventory: 'purple' };

  return (
    <div style={{ position: 'relative', height: 'calc(100vh - 140px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .dashboard-metric-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
          margin-bottom: 8px;
        }
        @media (max-width: 1200px) {
          .dashboard-metric-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 768px) {
          .dashboard-metric-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 480px) {
          .dashboard-metric-grid {
            grid-template-columns: 1fr;
          }
        }
        .dashboard-main-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 12px;
          margin-bottom: 8px;
        }
        @media (max-width: 1024px) {
          .dashboard-main-grid {
            grid-template-columns: 1fr;
          }
        }
        .dashboard-secondary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
          margin-bottom: 0px;
          flex: none;
        }
        @media (max-width: 1024px) {
          .dashboard-secondary-grid {
            grid-template-columns: 1fr;
          }
        }
        .custom-marker-cluster {
          background-color: #10b981;
          color: white;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: 900;
          font-size: 16px;
          border: 6px solid rgba(16, 185, 129, 0.3);
          background-clip: padding-box;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
      `}</style>
      {(isLoading || isTrendLoading) && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(var(--bg-main-rgb), 0.5)', zIndex: 50,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          backdropFilter: 'blur(2px)'
        }}>
          <TrackifyLoader size={120} animated={true} message="Loading dashboard..." showPercentage={true} />
        </div>
      )}
      <div className="fade-in" style={{ marginTop: 4, opacity: (isLoading || isTrendLoading) ? 0.4 : 1, transition: 'opacity 0.3s ease', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* ── Metric Cards ── */}
        <div className="dashboard-metric-grid" style={{ flex: 'none' }}>
          {cardsToRender.map(card => (
            <div key={card.key} style={{ opacity: isLoading ? 0.6 : 1, transition: 'opacity 0.3s ease' }}>
              <MetricCard
                label={card.title}
                value={card.value}
                trend={card.growthText || card.badgeText || ''}
                colorClass={keyColorMap[card.key] || colorMap[card.icon] || 'blue'}
                icon={keyIconMap[card.key] || iconMap[card.icon] || 'analytics'}
                onClick={(() => {
                  const role = (user?.role || '').toLowerCase();
                  let targetRoute = null;

                  if (card.key?.includes('company')) {
                    if (role === 'superadmin') targetRoute = 'user';
                    else if (role === 'admin') targetRoute = 'create-vendor';
                  } else if (card.key?.includes('device')) {
                    if (role === 'superadmin') targetRoute = 'fleet';
                    else if (role === 'admin') targetRoute = 'admin-devices';
                  } else if (card.key === 'inventory') {
                    if (role === 'superadmin') targetRoute = 'inventory';
                  }

                  if (!targetRoute) {
                    return () => console.log("Click ignored. User role:", role, "Card key:", card.key);
                  }

                  return () => {
                    console.log("Navigating to:", targetRoute, "Role:", role);
                    if (onNavigate) {
                      onNavigate(targetRoute);
                    } else {
                      console.error("onNavigate is not defined!");
                    }
                  };
                })()}
              />
            </div>
          ))}
        </div>

        {/* ── Chart + Alerts ── */}
        <div className="dashboard-main-grid" style={{ flex: '1', minHeight: 0 }}>

          {/* Data & Alerts Trend Chart */}
          <div className="card hover-lift" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: '8px', flex: 'none' }}>
              <div>
                <h3 className="card-title" style={{ margin: 0, fontSize: '15px' }}>Data & Alerts Trend</h3>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>System wide processed data records vs alerts by timeframe</p>
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '12px', fontWeight: 600 }}
                >
                  <option value="all">View All Timeframes</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: '#2463eb' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Data Count</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: '#ef4444' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Alerts</span>
                </div>
              </div>
            </div>
            <div style={{ flex: 1, minHeight: 0, width: '100%', position: 'relative', opacity: isTrendLoading ? 0.5 : 1, transition: 'opacity 0.3s ease' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Device Status Donut Chart */}
          <div className="card hover-lift" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: '8px' }}>
              <h3 className="card-title" style={{ margin: 0, fontSize: '15px' }}>Real-Time Device Status</h3>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', background: 'rgba(36, 99, 235, 0.1)', padding: '6px 12px', borderRadius: 8 }}>
                Live
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0, width: '100%', position: 'relative', opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.3s ease' }}>
              <Pie
                data={{
                  labels: ['Online/Moving', 'Idle', 'Offline', 'Inventory'],
                  datasets: [
                    {
                      data: isLoading ? [30, 10, 5, 20] : [
                        (dashboardData.summary?.totalActiveDevices || 0) * 0.6, // Dummy split for demo
                        (dashboardData.summary?.totalActiveDevices || 0) * 0.2,
                        (dashboardData.summary?.totalDeactiveDevices || 0),
                        dashboardData.summary?.inventoryCount || 0,
                      ],
                      backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#a855f7'],
                      borderWidth: 0,
                      hoverOffset: 4
                    },
                  ],
                }}
                options={{
                  maintainAspectRatio: false,
                  cutout: '70%',
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: { size: 12, weight: '600' }
                      }
                    }
                  }
                }}
              />
              <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)' }}>{dashboardData.summary?.totalActiveDevices || 0}</div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active</div>
              </div>
            </div>
          </div>

        </div>

        {/* ── Secondary Grid (Map, Feed, Actions) ── */}
        <div className="dashboard-secondary-grid">

          {/* Live Map Widget */}
          <div className="card hover-lift" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)' }}>
              <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
                <span className="material-icons" style={{ color: '#2463eb', fontSize: '18px' }}>map</span>
                Fleet Overview
              </h3>
              <button onClick={() => onNavigate('play-back')} style={{ background: 'transparent', border: 'none', color: '#2463eb', fontWeight: '700', fontSize: '11px', cursor: 'pointer' }}>VIEW ALL</button>
            </div>
            <div style={{ flex: 1, minHeight: '200px', width: '100%', display: 'flex', flexDirection: 'column' }}>
              <MapContainer center={[22.7196, 75.8577]} zoom={5} style={{ width: '100%', height: '100%', zIndex: 1 }} zoomControl={false} attributionControl={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                <MapBounds markers={liveMapData} />
                <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIcon}>
                  {liveMapData.map(v => (
                    <Marker key={v.id} position={[v.lat, v.lng]}>
                      <Popup>
                        <div style={{ fontSize: '13px', fontWeight: '700' }}>{v.name}</div>
                        <div style={{ fontSize: '11px', color: '#666' }}>Speed: {v.speed} km/h</div>
                      </Popup>
                    </Marker>
                  ))}
                </MarkerClusterGroup>
              </MapContainer>
            </div>
          </div>

          {/* Recent Alerts Feed */}
          <div className="card hover-lift" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
                <span className="material-icons" style={{ color: '#ef4444', fontSize: '18px' }}>notifications_active</span>
                Recent Alerts
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
              {recentAlerts.map(alert => (
                <div key={alert.id} style={{ display: 'flex', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: alert.type === 'overspeed' ? '#fee2e2' : alert.type === 'geofence' ? '#fef3c7' : '#e0e7ff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <span className="material-icons" style={{ fontSize: '18px', color: alert.type === 'overspeed' ? '#ef4444' : alert.type === 'geofence' ? '#d97706' : '#4f46e5' }}>
                      {alert.type === 'overspeed' ? 'speed' : alert.type === 'geofence' ? 'fence' : 'battery_alert'}
                    </span>
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>{alert.vehicle}</h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>{alert.message}</p>
                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', marginTop: '4px', display: 'block' }}>{timeAgo(alert.time)}</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => onNavigate('notifications')} style={{ width: '100%', padding: '8px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--primary)', fontWeight: '700', fontSize: '11px', cursor: 'pointer', marginTop: '12px' }}>
              VIEW ALL
            </button>
          </div>

          {/* Quick Actions Panel */}
          <div className="card hover-lift" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 className="card-title" style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', flex: 'none' }}>
              <span className="material-icons" style={{ color: '#10b981', fontSize: '18px' }}>bolt</span>
              Quick Actions
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button onClick={() => onNavigate('assign-to-admin')} style={{ padding: '10px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s' }}>
                <span className="material-icons" style={{ color: '#2463eb', fontSize: '20px' }}>devices</span>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-main)' }}>Assign Device</span>
              </button>
              <button onClick={() => onNavigate('user')} style={{ padding: '10px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s' }}>
                <span className="material-icons" style={{ color: '#10b981', fontSize: '20px' }}>person_add</span>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-main)' }}>Add User</span>
              </button>
              <button onClick={() => onNavigate('play-back')} style={{ padding: '10px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s' }}>
                <span className="material-icons" style={{ color: '#f59e0b', fontSize: '20px' }}>history</span>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-main)' }}>Play Back</span>
              </button>
              <button onClick={() => onNavigate('reports')} style={{ padding: '10px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s' }}>
                <span className="material-icons" style={{ color: '#8b5cf6', fontSize: '20px' }}>assessment</span>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-main)' }}>Reports</span>
              </button>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
              <div style={{ padding: '12px', background: 'linear-gradient(135deg, rgba(36,99,235,0.1), rgba(16,185,129,0.1))', borderRadius: '10px', border: '1px solid rgba(36,99,235,0.2)' }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: '800', color: '#1e293b' }}>Need Support?</h4>
                <p style={{ margin: '0 0 8px 0', fontSize: '10px', color: '#475569' }}>Our tech team is available 24/7</p>
                <button onClick={() => onNavigate('support')} style={{ width: '100%', padding: '6px', background: '#2463eb', border: 'none', borderRadius: '6px', color: 'white', fontWeight: '700', fontSize: '11px', cursor: 'pointer' }}>CONTACT SUPPORT</button>
              </div>
            </div>
          </div>
        </div>

        {user?.email === 'mahi@gmail.com' && (
          <div
            style={{
              position: 'fixed',
              bottom: '30px',
              right: '30px',
              zIndex: 1000,
              cursor: 'pointer',
              backgroundColor: '#25D366',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s',
            }}
            onClick={() => window.open('https://api.whatsapp.com/send?phone=9111324883', '_blank')}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            title="Open WhatsApp"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="currentColor" viewBox="0 0 16 16" style={{ color: 'white' }}>
              <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

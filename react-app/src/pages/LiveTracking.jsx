import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Replaced static array with dynamic defaults inside the component

const currentIcon = L.divIcon({
  className: 'custom-div-icon',
  html: '<div style="width: 16px; height: 16px; background: white; border: 4px solid #2463eb; border-radius: 50%; box-shadow: 0 0 10px rgba(36,99,235,0.5);"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Component to dynamically re-center map when coordinates change
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

import { BASE_URL } from '../utils/network';

export default function LiveTracking({ user }) {
  const [vehicles, setVehicles] = React.useState([]);
  const [device, setDevice] = React.useState(null);
  const [historyData, setHistoryData] = React.useState([]);
  const [playbackIndex, setPlaybackIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1);
  const [dateFilter, setDateFilter] = React.useState('today');

  const activeData = historyData.slice(0, playbackIndex + 1);
  const routeCoords = activeData.map(pt => [parseFloat(pt.lt), parseFloat(pt.lg)]);
  const latestPoint = activeData.length > 0 ? activeData[activeData.length - 1] : null;
  const currentPos = latestPoint && latestPoint.lt && latestPoint.lg ? [parseFloat(latestPoint.lt), parseFloat(latestPoint.lg)] : [22.7484804921113, 75.8946311624446];
  const currentSpeed = latestPoint?.sp || 0;
  const currentTimestamp = latestPoint?.createdAt ? new Date(latestPoint.createdAt).toLocaleString() : '--';

  useEffect(() => {
    // Dynamically get user ID from session context or use default
    const userId = user?.id || user?._id || localStorage.getItem('userId');

    const fetchVehicles = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/vehicle/get-vehicles?userId=${userId}`, {
          method: 'GET',
          headers: { 'accept': 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.vehicles && data.vehicles.length > 0) {
            setVehicles(data.vehicles);
            const firstValid = data.vehicles.find(v => v.imei) || data.vehicles[0];
            setDevice(firstValid);
          }
        }
      } catch (error) {
        console.error("Vehicles API error:", error);
      }
    };

    fetchVehicles();
  }, [user]);

  // Fetch coordinates based on the selected device's IMEI and Date filter
  useEffect(() => {
    if (device && device.imei) {
      const getDates = () => {
        const start = new Date();
        const end = new Date();

        if (dateFilter === 'today') {
          start.setHours(0, 0, 0, 0);
        } else if (dateFilter === 'yesterday') {
          start.setDate(start.getDate() - 1);
          start.setHours(0, 0, 0, 0);
          end.setDate(end.getDate() - 1);
          end.setHours(23, 59, 59, 999);
        } else if (dateFilter === 'this week') {
          const day = start.getDay();
          const diff = start.getDate() - day + (day === 0 ? -6 : 1);
          start.setDate(diff);
          start.setHours(0, 0, 0, 0);
        } else if (dateFilter === 'this month') {
          start.setDate(1);
          start.setHours(0, 0, 0, 0);
        } else if (dateFilter === 'last month') {
          start.setMonth(start.getMonth() - 1);
          start.setDate(1);
          start.setHours(0, 0, 0, 0);
          end.setDate(0);
          end.setHours(23, 59, 59, 999);
        }

        const format = (d) => {
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${d.getFullYear()}-${month}-${day}`;
        };
        return { startDate: format(start), endDate: format(end) };
      };

      const fetchLiveCoords = async () => {
        const { startDate, endDate } = getDates();

        try {
          const response = await fetch(`${BASE_URL}/api/device/check-deviceList_byDate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'accept': '*/*' },
            body: JSON.stringify({
              imei: device.imei,
              start_date: startDate,
              end_date: endDate
            })
          });

          const result = await response.json();
          if (result && result.status && result.data && result.data.length > 0) {
            const sortedData = result.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            setHistoryData(sortedData);
            // If not currently playing, jump to the latest point
            setPlaybackIndex(prev => {
                if (prev === 0 || prev >= sortedData.length - 2) return sortedData.length - 1;
                return prev;
            });
          } else {
            setHistoryData([]);
            setPlaybackIndex(0);
          }
        } catch (error) {
          console.error("Failed to fetch coordinate history", error);
          setHistoryData([]);
          setPlaybackIndex(0);
        }
      };

      // Clear existing coordinates immediately when device or date filter changes
      setHistoryData([]);
      setPlaybackIndex(0);
      setIsPlaying(false);
      fetchLiveCoords();
      // Poll coordinates every 10 seconds to keep live tracking updated
      const intervalId = setInterval(fetchLiveCoords, 10000);

      return () => clearInterval(intervalId);
    }
  }, [device, dateFilter]);



  useEffect(() => {
    let interval;
    if (isPlaying && historyData.length > 0) {
      interval = setInterval(() => {
        setPlaybackIndex(prev => {
          if (prev >= historyData.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, historyData.length, playbackSpeed]);

  const vehicleName = device ? `${device.vehicleMaker} ${device.vehicleModel}` : "Freightliner Cascadia";
  const vehicleDetails = device ? `Number: ${device.vehicleNumber} • IMEI: ${device.imei || 'Not Assigned'}` : "VIN: 1FUJAGAK9HL • Fleet #402";

  return (
    <div className="tracking-wrapper">
      <div className="map-pane">
        <MapContainer
          center={[22.7484804921113, 75.8946311624446]}
          zoom={10}
          zoomControl={false}
          attributionControl={false}
          style={{ width: '100%', height: '100%', background: '#0f172a' }}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
          />
          <ChangeView center={currentPos} zoom={18} />
          {/* Render polylines and markers only if coordinates exist */}
          {routeCoords.length > 0 && (
            <>
              {/* Background glow */}
              <Polyline positions={routeCoords} pathOptions={{ color: '#bfdbfe', weight: 8, opacity: 0.3 }} />
              {/* Core path */}
              <Polyline positions={routeCoords} pathOptions={{ color: '#2463eb', weight: 4, opacity: 1 }} />
            </>
          )}
          {/* Current location */}
          <Marker position={currentPos} icon={currentIcon} />
        </MapContainer>

        {/* Playback Control */}
        <div className="playback-control">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div 
              className="icon-box blue" 
              style={{ width: 32, height: 32, cursor: 'pointer' }}
              onClick={() => {
                if (playbackIndex >= historyData.length - 1) {
                  setPlaybackIndex(0);
                }
                setIsPlaying(!isPlaying);
              }}
            >
              <span className="material-icons" style={{ fontSize: 16 }}>
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>Route Playback</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{currentTimestamp}</p>
            </div>
          </div>
          <div style={{ flex: 1, height: 4, background: '#e2e8f0', borderRadius: 2, position: 'relative', width: 200, display: 'flex', alignItems: 'center' }}>
            <div style={{ position: 'absolute', left: 0, width: `${historyData.length > 0 ? (playbackIndex / (historyData.length - 1)) * 100 : 0}%`, height: '100%', background: 'var(--primary)', borderRadius: 2, pointerEvents: 'none' }} />
            <div 
              style={{ 
                position: 'absolute', 
                left: `${historyData.length > 0 ? (playbackIndex / (historyData.length - 1)) * 100 : 0}%`, 
                width: 12, height: 12, background: 'white', border: '2px solid var(--primary)', borderRadius: '50%',
                transform: 'translateX(-50%)', pointerEvents: 'none'
              }} 
            />
            <input 
              type="range" 
              min="0" 
              max={historyData.length > 0 ? historyData.length - 1 : 0} 
              value={playbackIndex} 
              onChange={(e) => setPlaybackIndex(Number(e.target.value))}
              style={{ 
                position: 'absolute',
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
                margin: 0,
                zIndex: 10
              }} 
            />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--bg-main)', padding: '4px 8px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <span 
              className="material-icons" 
              style={{ fontSize: 16, color: playbackSpeed > 1 ? 'var(--primary)' : 'var(--text-muted)', cursor: playbackSpeed > 1 ? 'pointer' : 'default' }} 
              onClick={() => setPlaybackSpeed(s => Math.max(1, s - 1))}
            >
              remove
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-main)', width: '24px', textAlign: 'center' }}>{playbackSpeed}x</span>
            <span 
              className="material-icons" 
              style={{ fontSize: 16, color: playbackSpeed < 10 ? 'var(--primary)' : 'var(--text-muted)', cursor: playbackSpeed < 10 ? 'pointer' : 'default' }} 
              onClick={() => setPlaybackSpeed(s => Math.min(10, s + 1))}
            >
              add
            </span>
          </div>
        </div>
      </div>

      {/* Details Panel */}
      <div className="details-pane">
        <div className="pane-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <span className="tag" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>ON MISSION</span>
            <span className="material-icons" style={{ fontSize: 18, color: 'var(--text-muted)' }}>more_horiz</span>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>{vehicleName}</h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{vehicleDetails}</p>

          {/* Filter Controls */}
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: 8, display: 'inline-block', width: 80 }}>
                Vehicle:
              </label>
              <select
                value={device?._id || ''}
                onChange={(e) => {
                  const sel = vehicles.find(v => v._id === e.target.value);
                  if (sel) setDevice(sel);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  outline: 'none',
                  minWidth: '220px'
                }}
              >
                {vehicles.map(v => (
                  <option key={v._id} value={v._id}>
                    {v.vehicleNumber} {v.imei ? `(IMEI: ${v.imei})` : '(No IMEI)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: 8, display: 'inline-block', width: 80 }}>
                Time Range:
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this week">This Week</option>
                <option value="this month">This Month</option>
                <option value="last month">Last Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Gauges */}
        <div className="pane-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
              <span className="material-icons" style={{ fontSize: 14, color: 'var(--primary)' }}>local_gas_station</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Fuel Level</span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)' }}>78<span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 2 }}>%</span></h3>
            <div className="progress-track"><div className="progress-fill" style={{ width: '78%' }} /></div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--warning)', textTransform: 'uppercase' }}>Battery/Engine</span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)' }}>92<span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 2 }}>%</span></h3>
            <div className="progress-track"><div className="progress-fill" style={{ width: '92%', background: 'var(--success)' }} /></div>
          </div>
        </div>

        {/* Speed */}
        <div className="pane-section" style={{ background: 'var(--primary-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="material-icons" style={{ fontSize: 14, color: 'var(--primary)' }}>speed</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Current Velocity</span>
            </div>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>LIMIT: 70 MPH</span>
          </div>
          <h3 style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)' }}>{currentSpeed}<span style={{ fontSize: 14, marginLeft: 4 }}>MPH</span></h3>
        </div>

        {/* Vehicle / Driver Configuration */}
        <div className="pane-section">
          <div className="driver-profile-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <img src={`https://ui-avatars.com/api/?name=${device?.vehicleMaker || 'Vehicle'}&background=2463eb&color=fff`} alt="Maker" style={{ width: 40, height: 40, borderRadius: 8 }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)' }}>
                  {device ? `${device.vehicleMaker} Config` : "Vehicle Details"}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)' }}>
                  <span className="material-icons" style={{ fontSize: 12 }}>verified</span>
                  <span style={{ fontSize: 11, fontWeight: 700 }}>
                    Active Status
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>Vehicle Type</span>
                <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{device?.vehicleType?.replace('_', ' ') || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>Fuel Type</span>
                <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{device?.fuelType || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Registered</span>
                <span style={{ fontWeight: 700 }}>{device?.createdAt ? new Date(device.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="pane-section" style={{ borderBottom: 'none', paddingBottom: 40 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Route Activity</span>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-dot active" />
              <div>
                <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 700 }}>08:42 AM • CURRENT</span>
                <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>Passed Checkpoint Alpha</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>I-80 East, Sacramento District</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot" />
              <div>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>06:15 AM</span>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginTop: 2 }}>Refuel Stop Complete</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Shell Station #492 • +120 Gallons</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot" />
              <div>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>05:00 AM</span>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginTop: 2 }}>Departure</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>San Francisco Logistics Hub</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

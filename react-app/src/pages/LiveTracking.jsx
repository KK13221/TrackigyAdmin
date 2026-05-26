import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Polygon, Marker, Popup, Tooltip, Circle, CircleMarker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Replaced static array with dynamic defaults inside the component

const currentIcon = L.divIcon({
  className: 'custom-div-icon',
  html: '<div style="width: 16px; height: 16px; background: white; border: 4px solid #2463eb; border-radius: 50%; box-shadow: 0 0 10px rgba(36,99,235,0.5);"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const routePointIcon = L.divIcon({
  className: 'route-point-div-icon',
  html: '<div style="width: 10px; height: 10px; background: #3b82f6; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 6px rgba(59,130,246,0.8); cursor: pointer;"></div>',
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

const otherVehicleIcon = L.divIcon({
  className: 'custom-div-icon-other',
  html: '<div style="width: 12px; height: 12px; background: white; border: 3px solid #64748b; border-radius: 50%; box-shadow: 0 0 6px rgba(100,116,139,0.4);"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

// Component to dynamically re-center map when coordinates change
function ChangeView({ center, zoom, deviceImei, dateFilter }) {
  const map = useMap();
  const prevKeyRef = React.useRef("");
  const hasCenteredRef = React.useRef(false);

  React.useEffect(() => {
    if (!center) return;
    
    const isDefault = center[0] === 22.7484804921113 && center[1] === 75.8946311624446;
    
    // Reset centering flag when device or date filter changes
    const currentKey = `${deviceImei || ''}-${dateFilter || ''}`;
    if (currentKey !== prevKeyRef.current) {
      prevKeyRef.current = currentKey;
      hasCenteredRef.current = false;
    }
    
    // Center map if it hasn't centered yet for this device/filter, especially once real coordinates are loaded
    if (!hasCenteredRef.current) {
      map.setView(center, zoom || 18);
      if (!isDefault) {
        hasCenteredRef.current = true;
      }
    }
  }, [center, zoom, deviceImei, dateFilter, map]);

  return null;
}

// Component to handle map clicks during geofence editing
function MapEvents({ onClick }) {
  useMapEvents({
    click(e) {
      if (onClick) {
        onClick(e.latlng);
      }
    },
  });
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
  const [geofences, setGeofences] = React.useState([]);
  const [geoSaving, setGeoSaving] = React.useState(false);
  const [geoError, setGeoError] = React.useState('');
  const [geoSuccess, setGeoSuccess] = React.useState('');
  const [mapCenter, setMapCenter] = React.useState(null);

  const activeData = historyData.slice(0, playbackIndex + 1);
  const routeCoords = activeData
    .map(pt => {
      const lat = parseFloat(pt.lt);
      const lg = parseFloat(pt.lg);
      return (isNaN(lat) || isNaN(lg)) ? null : [lat, lg];
    })
    .filter(coord => coord !== null);

  const latestPoint = activeData.length > 0 
    ? (playbackIndex === 0 && historyData.length > 1 && !isPlaying 
        ? historyData[historyData.length - 1] 
        : activeData[activeData.length - 1])
    : null;

  const currentPos = (() => {
    if (latestPoint && latestPoint.lt && latestPoint.lg) {
      const lat = parseFloat(latestPoint.lt);
      const lg = parseFloat(latestPoint.lg);
      if (!isNaN(lat) && !isNaN(lg)) return [lat, lg];
    }
    if (device?.currentLocation?.lat && device?.currentLocation?.lng) {
      const lat = parseFloat(device.currentLocation.lat);
      const lg = parseFloat(device.currentLocation.lng);
      if (!isNaN(lat) && !isNaN(lg)) return [lat, lg];
    }
    return [22.7484804921113, 75.8946311624446];
  })();
  const currentSpeed = latestPoint?.sp || 0;
  const currentTimestamp = latestPoint?.createdAt ? new Date(latestPoint.createdAt).toLocaleString() : '--';

  useEffect(() => {
    // Dynamically get user ID from session context or use default
    const userId = user?.id || user?._id || localStorage.getItem('userId');

    const fetchVehicles = async () => {
      try {
        const isUserAdmin = user && (user.role || '').toLowerCase() === 'admin';
        
        // Fetch full vehicle records first to get specifications (maker, model, fuel, type, registration)
        let allVehicles = [];
        try {
          const vUrl = isUserAdmin
            ? `${BASE_URL}/api/vehicle/get-vehicles-list`
            : `${BASE_URL}/api/vehicle/get-vehicles?userId=${userId}`;
          const vRes = await fetch(vUrl);
          if (vRes.ok) {
            const vData = await vRes.json();
            allVehicles = vData.vehicles || vData.data || (Array.isArray(vData) ? vData : []);
          }
        } catch (e) {
          console.error("Failed to load vehicle specs:", e);
        }

        const targetUrl = isUserAdmin
          ? `${BASE_URL}/api/device/device-list`
          : `${BASE_URL}/api/vehicle/get-vehicles?userId=${userId}`;

        const response = await fetch(targetUrl, {
          method: 'GET',
          headers: { 'accept': 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();
          if (isUserAdmin) {
            if (data && data.data && data.data.length > 0) {
              const mapped = data.data.map(d => {
                const match = allVehicles.find(v => String(v.imei) === String(d.imei));
                return {
                  _id: d.id || d.imei,
                  imei: d.imei,
                  vehicleNumber: match?.vehicleNumber || d.imei,
                  vehicleMaker: match?.vehicleMaker || d.user_name || 'Fleet',
                  vehicleModel: match?.vehicleModel || 'Device',
                  vehicleType: match?.vehicleType || 'vehicle',
                  fuelType: match?.fuelType || 'N/A',
                  createdAt: match?.createdAt || d.createdAt || null,
                  currentLocation: null
                };
              });
              setVehicles(mapped);
              const preferred = mapped.find(v => v.imei === '860710085959719');
              if (preferred) {
                setDevice(preferred);
              } else {
                setDevice(mapped[0]);
              }
            }
          } else {
            if (data && data.vehicles && data.vehicles.length > 0) {
              setVehicles(data.vehicles);
              const preferred = data.vehicles.find(v => v.imei === '860710085959719');
              if (preferred) {
                setDevice(preferred);
              } else {
                const firstValid = data.vehicles.find(v => v.imei) || data.vehicles[0];
                setDevice(firstValid);
              }
            }
          }
        }
      } catch (error) {
        console.error("Vehicles API error:", error);
      }
    };

    fetchVehicles();
  }, [user]);

  const fetchGeofences = async (imei) => {
    if (!imei) return;
    try {
      const response = await fetch(`${BASE_URL}/api/geoFance/geofenceData/${imei}`);
      if (response.ok) {
        const result = await response.json();
        if (result && result.status && result.result) {
          setGeofences(result.result);
        } else {
          setGeofences([]);
        }
      } else {
        setGeofences([]);
      }
    } catch (err) {
      console.error("Error fetching geofences:", err);
      setGeofences([]);
    }
  };

  useEffect(() => {
    if (device && device.imei) {
      fetchGeofences(device.imei);
    } else {
      setGeofences([]);
    }
    setGeoSuccess('');
    setGeoError('');
    setMapCenter(null);
  }, [device]);

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
      setMapCenter(null);
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

  const vehicleName = device
    ? (device.device_name || (device.vehicleMaker ? `${device.vehicleMaker} ${device.vehicleModel}` : `Device ${device.imei}`))
    : "Freightliner Cascadia";

  const vehicleDetails = device
    ? (device.vehicleNumber
      ? `Number: ${device.vehicleNumber} • IMEI: ${device.imei || 'Not Assigned'}`
      : `IMEI: ${device.imei} • Last Seen: ${device.lastSeen ? new Date(device.lastSeen).toLocaleString() : 'N/A'}`
    )
    : "VIN: 1FUJAGAK9HL • Fleet #402";

  return (
    <div className="tracking-wrapper">
      <div className="map-pane">
        <MapContainer
          center={[22.7484804921113, 75.8946311624446]}
          zoom={10}
          zoomControl={true}
          scrollWheelZoom={true}
          attributionControl={false}
          style={{ width: '100%', height: '100%', background: '#0f172a' }}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
          />
          <ChangeView center={mapCenter || currentPos} zoom={18} deviceImei={device?.imei} dateFilter={dateFilter} />
          {/* Render polylines and markers only if coordinates exist */}
          {routeCoords.length > 0 && (
            <>
              {/* Background glow */}
              <Polyline positions={routeCoords} pathOptions={{ color: '#bfdbfe', weight: 8, opacity: 0.3 }} />
              {/* Core path */}
              <Polyline positions={routeCoords} pathOptions={{ color: '#2463eb', weight: 4, opacity: 1 }} />
            </>
          )}
          {/* Other vehicles current locations */}
          {vehicles && vehicles.map(v => {
            if (v._id !== device?._id && v.currentLocation && v.currentLocation.lat && v.currentLocation.lng) {
              const lat = parseFloat(v.currentLocation.lat);
              const lng = parseFloat(v.currentLocation.lng);
              if (isNaN(lat) || isNaN(lng)) return null;
              return (
                <Marker
                  key={v._id}
                  position={[lat, lng]}
                  icon={otherVehicleIcon}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={0.8}>
                    <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{v.imei || v.vehicleNumber || v.device_name}</span>
                  </Tooltip>
                </Marker>
              );
            }
            return null;
          })}

          {/* Current selected location */}
          <Marker position={currentPos} icon={currentIcon}>
            <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
              <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{device?.imei || 'Selected'}</span>
            </Tooltip>
            <Popup>
              <div style={{ padding: '6px', fontSize: '12px', lineHeight: '1.6' }}>
                <strong style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#3b82f6', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
                  {device?.device_name || (device?.vehicleMaker ? `${device.vehicleMaker} ${device.vehicleModel}` : 'Vehicle / Device')}
                </strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div><strong>IMEI:</strong> <span style={{ fontFamily: 'monospace' }}>{device?.imei || 'N/A'}</span></div>
                  <div><strong>Latitude:</strong> <span>{currentPos[0]}</span></div>
                  <div><strong>Longitude:</strong> <span>{currentPos[1]}</span></div>
                  <div><strong>Created At:</strong> <span style={{ fontFamily: 'monospace' }}>{latestPoint?.createdAt || 'N/A'}</span></div>
                  {latestPoint?.sp !== undefined && (
                    <div><strong>Speed:</strong> <span>{latestPoint.sp} MPH</span></div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>

          {/* Active Geofences from database */}
          {geofences && geofences.map((geo, index) => {
            const coords = geo.geofencingCoordinates || [];
            if (coords.length === 1) {
              const lat = parseFloat(coords[0].lat || coords[0].latitude);
              const lng = parseFloat(coords[0].lng || coords[0].longitude);
              if (isNaN(lat) || isNaN(lng)) return null;
              const radius = parseFloat(geo.radius) || 200; // default radius: 200m
              return (
                <React.Fragment key={geo._id || index}>
                  <Circle
                    center={[lat, lng]}
                    radius={radius}
                    pathOptions={{
                      color: '#10b981',
                      fillColor: '#10b981',
                      fillOpacity: 0.15,
                      weight: 2,
                      dashArray: '5, 10'
                    }}
                  />
                  <Marker
                    position={[lat, lng]}
                    icon={L.divIcon({
                      className: 'custom-div-icon',
                      html: '<div style="width: 12px; height: 12px; background: white; border: 3px solid #10b981; border-radius: 50%; box-shadow: 0 0 8px rgba(16,185,129,0.6);"></div>',
                      iconSize: [12, 12],
                      iconAnchor: [6, 6]
                    })}
                  >
                    <Tooltip direction="top" offset={[0, -6]} permanent>
                      <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{geo.geofencName || 'Geofence'}</span>
                    </Tooltip>
                    <Popup>
                      <div style={{ padding: '6px', fontSize: '12px', lineHeight: '1.6' }}>
                        <strong style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#10b981', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
                          Geofence Guard
                        </strong>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div><strong>Name:</strong> <span>{geo.geofencName || 'Unnamed Geofence'}</span></div>
                          <div><strong>Radius:</strong> <span>{radius} meters</span></div>
                          <div><strong>Latitude:</strong> <span>{lat}</span></div>
                          <div><strong>Longitude:</strong> <span>{lng}</span></div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              );
            } else if (coords.length > 1) {
              // Polygon geofence
              const positions = coords.map(c => [parseFloat(c.lat || c.latitude), parseFloat(c.lng || c.longitude)]);
              const center = positions[0];
              return (
                <React.Fragment key={geo._id || index}>
                  <Polygon
                    positions={positions}
                    pathOptions={{
                      color: '#10b981',
                      fillColor: '#10b981',
                      fillOpacity: 0.15,
                      weight: 2,
                      dashArray: '5, 10'
                    }}
                  />
                  <Marker
                    position={center}
                    icon={L.divIcon({
                      className: 'custom-div-icon',
                      html: '<div style="width: 12px; height: 12px; background: white; border: 3px solid #10b981; border-radius: 50%; box-shadow: 0 0 8px rgba(16,185,129,0.6);"></div>',
                      iconSize: [12, 12],
                      iconAnchor: [6, 6]
                    })}
                  >
                    <Tooltip direction="top" offset={[0, -6]} permanent>
                      <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{geo.geofencName || 'Geofence'}</span>
                    </Tooltip>
                    <Popup>
                      <div style={{ padding: '6px', fontSize: '12px', lineHeight: '1.6' }}>
                        <strong style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#10b981', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}>
                          Geofence Guard
                        </strong>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div><strong>Name:</strong> <span>{geo.geofencName || 'Unnamed Geofence'}</span></div>
                          <div><strong>Type:</strong> <span>Polygon Geofence</span></div>
                          <div><strong>Vertices:</strong> <span>{coords.length} points</span></div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              );
            }
            return null;
          })}
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
                {vehicles.map(v => {
                  const label = v.vehicleMaker && v.vehicleMaker !== 'Fleet'
                    ? `${v.vehicleMaker} - ${v.vehicleNumber}`
                    : v.vehicleNumber;
                  return (
                    <option key={v._id} value={v._id}>
                      {label} {v.imei && v.imei !== v.vehicleNumber ? `(IMEI: ${v.imei})` : ''}
                    </option>
                  );
                })}
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

        {/* GeoFence Guard */}
        <div className="pane-section" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="material-icons" style={{ fontSize: 18, color: geofences.length > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                {geofences.length > 0 ? 'security' : 'shield'}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase' }}>GeoFence Guard</span>
            </div>
            {geofences.length > 0 ? (
              <span className="tag" style={{ background: 'var(--success-light)', color: 'var(--success)', fontSize: '10px', padding: '2px 8px' }}>{geofences.length} ACTIVE</span>
            ) : (
              <span className="tag" style={{ background: 'var(--border)', color: 'var(--text-muted)', fontSize: '10px', padding: '2px 8px' }}>INACTIVE</span>
            )}
          </div>

          {/* Messages */}
          {geoSuccess && <div style={{ fontSize: '11px', color: 'var(--success)', background: 'var(--success-light)', padding: '6px 10px', borderRadius: '6px', marginBottom: 10 }}>{geoSuccess}</div>}
          {geoError && <div style={{ fontSize: '11px', color: 'var(--error)', background: '#fee2e2', padding: '6px 10px', borderRadius: '6px', marginBottom: 10 }}>{geoError}</div>}

          <div>
            {geofences.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {geofences.map((geo, idx) => {
                  const coords = geo.geofencingCoordinates || [];
                  const coordStr = coords[0]
                    ? `${parseFloat(coords[0].lat || coords[0].latitude).toFixed(4)}, ${parseFloat(coords[0].lng || coords[0].longitude).toFixed(4)}`
                    : 'N/A';
                  return (
                    <div
                      key={geo._id || idx}
                      onClick={() => {
                        if (coords[0]) {
                          const lat = parseFloat(coords[0].lat || coords[0].latitude);
                          const lng = parseFloat(coords[0].lng || coords[0].longitude);
                          if (!isNaN(lat) && !isNaN(lng)) {
                            setMapCenter([lat, lng]);
                          }
                        }
                      }}
                      style={{
                        background: 'white',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        fontSize: '11px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: 2 }}>{geo.geofencName || 'Geofence'}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Coords: {coordStr}</div>
                      </div>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation(); // Avoid triggering map centering on click
                          if (!geo._id) return;
                          setGeoSaving(true);
                          setGeoError('');
                          setGeoSuccess('');
                          try {
                            const response = await fetch(`${BASE_URL}/api/geoFance/geofenceById/${geo._id}`, {
                              method: 'DELETE'
                            });
                            if (response.ok) {
                              setGeoSuccess('Geofence removed successfully!');
                              fetchGeofences(device.imei);
                              setMapCenter(null);
                            } else {
                              setGeoError('Failed to remove geofence.');
                            }
                          } catch (err) {
                            setGeoError('Error deleting geofence.');
                          } finally {
                            setGeoSaving(false);
                          }
                        }}
                        disabled={geoSaving}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        title="Remove Geofence"
                      >
                        <span className="material-icons" style={{ fontSize: 16 }}>delete</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 0 }}>No geofences are active for this device.</p>
              </div>
            )}
          </div>
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

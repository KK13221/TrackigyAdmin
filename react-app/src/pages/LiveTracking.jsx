import React, { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Popup, useMap, Polyline } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BASE_URL } from '../utils/network';
import TrackifyLoader from '../components/TrackifyLoader';

// Icons
const mapIcon = L.divIcon({
  className: 'custom-div-icon',
  html: '<div style="width: 16px; height: 16px; background: white; border: 4px solid #10b981; border-radius: 50%; box-shadow: 0 0 10px rgba(16,185,129,0.5);"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const selectedIcon = L.divIcon({
  className: 'custom-div-icon-selected',
  html: '<div style="width: 20px; height: 20px; background: white; border: 5px solid #3b82f6; border-radius: 50%; box-shadow: 0 0 15px rgba(59,130,246,0.8); animation: pulse 1.5s infinite;"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Component to dynamically pan to the selected device
function CenterOnSelected({ lat, lng, isSelected }) {
  const map = useMap();
  useEffect(() => {
    if (isSelected && lat && lng) {
      if (map.getZoom() < 16) {
        map.flyTo([lat, lng], 17, { animate: true, duration: 1.5 });
      } else {
        map.panTo([lat, lng], { animate: true, duration: 0.5 });
      }
    }
  }, [lat, lng, isSelected, map]);
  return null;
}

export default function LiveTracking({ user }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImei, setSelectedImei] = useState(null);
  const [tailCoords, setTailCoords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all current locations
  const fetchLocations = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/device/all-last-locations`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.status && data.result) {
          setLocations(data.result);
        }
      }
    } catch (error) {
      console.error('Error fetching all device locations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Poll for live locations every 10 seconds
  useEffect(() => {
    fetchLocations();
    const interval = setInterval(fetchLocations, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch recent history for the tail when a device is selected
  useEffect(() => {
    if (!selectedImei) {
      setTailCoords([]);
      return;
    }

    const fetchHistory = async () => {
      try {
        const start = new Date();
        start.setHours(0, 0, 0, 0); // Today's start
        const end = new Date(); // Now

        const format = (d) => {
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${d.getFullYear()}-${month}-${day}`;
        };

        const response = await fetch(`${BASE_URL}/api/device/check-deviceList_byDate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'accept': '*/*' },
          body: JSON.stringify({
            imei: selectedImei,
            start_date: format(start),
            end_date: format(end)
          })
        });

        const result = await response.json();
        if (result && result.status && result.data && result.data.length > 0) {
          const sortedData = result.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          // Take the last 10 valid coordinates
          const validCoords = sortedData
            .map(d => [parseFloat(d.lat || d.latitude || d.lt), parseFloat(d.long || d.lng || d.longitude || d.lg)])
            .filter(c => !isNaN(c[0]) && !isNaN(c[1]));

          setTailCoords(validCoords.slice(-5));
        } else {
          setTailCoords([]);
        }
      } catch (error) {
        console.error("Failed to fetch tail history", error);
        setTailCoords([]);
      }
    };

    fetchHistory();
  }, [selectedImei]);

  // Append new live position to tail dynamically
  useEffect(() => {
    if (selectedImei && locations.length > 0) {
      const selectedDevice = locations.find(loc => loc.imei === selectedImei);
      if (selectedDevice) {
        const lat = parseFloat(selectedDevice.lat);
        const lng = parseFloat(selectedDevice.long || selectedDevice.lng);
        if (!isNaN(lat) && !isNaN(lng)) {
          setTailCoords(prev => {
            const newPoint = [lat, lng];
            if (prev.length === 0) return [newPoint];
            const lastPoint = prev[prev.length - 1];
            // If the position changed, push to tail
            if (lastPoint[0] !== lat || lastPoint[1] !== lng) {
              const updated = [...prev, newPoint];
              return updated.slice(-5); // keep only last 5
            }
            return prev;
          });
        }
      }
    }
  }, [locations, selectedImei]);

  const filteredLocations = useMemo(() => {
    if (!searchQuery) return locations;
    return locations.filter(loc =>
      (loc.imei && String(loc.imei).toLowerCase().includes(searchQuery.toLowerCase())) ||
      (loc.user_name && loc.user_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [locations, searchQuery]);
  const createClusterCustomIcon = function (cluster) {
    const count = cluster.getChildCount();
    let bgColor = 'rgba(16, 185, 129, 0.9)'; // emerald
    let size = 40;

    if (count > 10) {
      bgColor = 'rgba(245, 158, 11, 0.9)'; // amber
      size = 45;
    }
    if (count > 50) {
      bgColor = 'rgba(239, 68, 68, 0.9)'; // red
      size = 50;
    }

    return L.divIcon({
      html: `<div style="background-color: ${bgColor}; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; border-radius: 50%; color: white; font-weight: bold; font-size: 14px; box-shadow: 0 0 15px ${bgColor}; border: 3px solid rgba(255,255,255,0.8); transition: all 0.3s ease;">
              <span>${count}</span>
             </div>`,
      className: `custom-cluster-icon`,
      iconSize: L.point(size, size, true),
    });
  };

  return (
    <div className="tracking-wrapper" style={{ display: 'flex', background: 'var(--bg-main)', height: 'calc(100vh - 70px)', overflow: 'hidden', width: '100%' }}>

      {/* Sidebar for Device Selection */}
      <div style={{ width: '320px', background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 16px 0', color: 'var(--text-main)' }}>Live Tracking</h2>
          <div style={{ position: 'relative' }}>
            <span className="material-icons" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '18px' }}>search</span>
            <input
              type="text"
              placeholder="Search IMEI or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '13px' }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {filteredLocations.map(loc => {
            const isSelected = selectedImei === loc.imei;
            return (
              <div
                key={loc.imei}
                onClick={() => setSelectedImei(loc.imei)}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                  background: isSelected ? 'var(--primary-light)' : 'var(--bg-main)',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 4px 12px rgba(59,130,246,0.15)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>
                    {loc.user_name || 'Fleet Device'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: loc.speed > 0 ? '#dcfce7' : '#f1f5f9', color: loc.speed > 0 ? '#16a34a' : '#64748b', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                    {loc.speed || 0} km/h
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  IMEI: {loc.imei}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="material-icons" style={{ fontSize: '12px' }}>schedule</span>
                  {loc.lastUpdate ? new Date(loc.lastUpdate).toLocaleString() : 'Just now'}
                </div>
              </div>
            );
          })}
          {filteredLocations.length === 0 && !loading && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px', fontSize: '13px' }}>
              No devices found.
            </div>
          )}
        </div>
      </div>

      {/* Map Area */}
      <div className="map-pane" style={{ flex: 1, position: 'relative', height: 'calc(100vh - 70px)' }}>
        {loading && locations.length === 0 ? (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(255,255,255,0.9)', zIndex: 1000 }}>
            <TrackifyLoader size={200} animated={true} message="Initializing live map..." showPercentage={true} />
          </div>
        ) : null}

        <MapContainer
          center={[22.7484804921113, 75.8946311624446]}
          zoom={5}
          zoomControl={true}
          style={{ width: '100%', height: '100%', zIndex: 1 }}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
          />

          {selectedImei && tailCoords.length > 1 && (
            <Polyline
              positions={tailCoords}
              pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.8 }}
            />
          )}

          <MarkerClusterGroup chunkedLoading maxClusterRadius={50} iconCreateFunction={createClusterCustomIcon}>
            {locations.map((loc, idx) => {
              const lat = parseFloat(loc.lat);
              const lng = parseFloat(loc.long || loc.lng);
              const isSelected = loc.imei === selectedImei;
              const showLabel = !selectedImei || isSelected;

              if (isNaN(lat) || isNaN(lng)) return null;

              return (
                <Marker
                  key={loc.imei || idx}
                  position={[lat, lng]}
                  icon={isSelected ? selectedIcon : mapIcon}
                  zIndexOffset={isSelected ? 1000 : 0}
                  eventHandlers={{
                    click: () => setSelectedImei(loc.imei),
                  }}
                >
                  {isSelected && <CenterOnSelected lat={lat} lng={lng} isSelected={true} />}
                  <Tooltip key={`tooltip-${showLabel}`} direction="top" offset={[0, -10]} opacity={1} permanent={showLabel}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{loc.user_name || loc.imei}</span>
                  </Tooltip>
                  <Popup>
                    <div style={{ padding: '6px', fontSize: '12px', lineHeight: '1.6', minWidth: '180px' }}>
                      <strong style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#3b82f6', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                        📍 Live Details
                      </strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', color: 'var(--text-main)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong style={{ color: 'var(--text-muted)' }}>IMEI:</strong>
                          <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>{loc.imei}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong style={{ color: 'var(--text-muted)' }}>Speed:</strong>
                          <span style={{ fontWeight: 700, color: loc.speed > 0 ? '#10b981' : 'var(--text-muted)' }}>{loc.speed || 0} km/h</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong style={{ color: 'var(--text-muted)' }}>Last Seen:</strong>
                          <span style={{ fontSize: '10px' }}>{loc.lastUpdate ? new Date(loc.lastUpdate).toLocaleString() : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  );
}

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BASE_URL } from '../utils/network';
import TrackifyLoader from '../components/TrackifyLoader';

// Custom icons
const mapIcon = L.divIcon({
  className: 'custom-div-icon',
  html: '<div style="width: 16px; height: 16px; background: white; border: 4px solid #10b981; border-radius: 50%; box-shadow: 0 0 10px rgba(16,185,129,0.5);"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Component to fit bounds to all vehicles initially
function FitBounds({ locations }) {
  const map = useMap();
  const hasFitBoundsRef = useRef(false);

  useEffect(() => {
    if (locations && locations.length > 0 && !hasFitBoundsRef.current) {
      const bounds = L.latLngBounds();
      let hasValidPoints = false;
      locations.forEach(loc => {
        const lat = parseFloat(loc.lat);
        const lng = parseFloat(loc.long || loc.lng);
        if (!isNaN(lat) && !isNaN(lng)) {
          bounds.extend([lat, lng]);
          hasValidPoints = true;
        }
      });
      if (hasValidPoints) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        hasFitBoundsRef.current = true;
      }
    }
  }, [locations, map]);

  return null;
}

export default function MapPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchLocations();
    // Poll every 10 seconds for real-time updates
    const interval = setInterval(fetchLocations, 10000);
    return () => clearInterval(interval);
  }, []);

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
    <div className="page-content" style={{ padding: '2px', background: 'var(--bg-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div>
          {/* <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>All Devices Map</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>Live location of all connected devices across the fleet.</p> */}
        </div>
        <div style={{ background: 'var(--bg-sidebar)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', animation: 'pulse 2s infinite' }}></div>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>{locations.length} Devices Online</span>
        </div>
      </div>

      <div style={{ background: 'var(--bg-sidebar)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden', height: 'calc(100vh - 140px)', minHeight: '500px', position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        {loading && locations.length === 0 ? (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(255,255,255,0.9)', zIndex: 1000 }}>
            <TrackifyLoader size={200} animated={true} message="Loading map data..." showPercentage={true} />
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
            attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
          />
          <FitBounds locations={locations} />

          <MarkerClusterGroup 
            chunkedLoading 
            maxClusterRadius={50}
            iconCreateFunction={createClusterCustomIcon}
          >
            {locations.map((loc, idx) => {
              const lat = parseFloat(loc.lat);
              const lng = parseFloat(loc.long || loc.lng);

              if (isNaN(lat) || isNaN(lng)) return null;

              return (
                <Marker
                  key={loc.imei || idx}
                  position={[lat, lng]}
                  icon={mapIcon}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{loc.imei}</span>
                  </Tooltip>
                  <Popup>
                    <div style={{ padding: '6px', fontSize: '12px', lineHeight: '1.6', minWidth: '200px' }}>
                      <strong style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#10b981', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                        📍 Device Details
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
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong style={{ color: 'var(--text-muted)' }}>Coords:</strong>
                          <span style={{ color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'monospace' }}>{lat.toFixed(4)}, {lng.toFixed(4)}</span>
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

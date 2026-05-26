import React, { useState, useEffect, useRef } from 'react';
import { BASE_URL } from '../utils/network';
import { MapContainer, TileLayer, Polyline, Marker, Popup, Tooltip, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Decode Google polyline with outlier filtering
const decodePolyline = (str, precision = 5) => {
  if (!str) return [];
  // Remove any whitespace or hidden characters that might break decoding
  str = str.replace(/[ \n\r\t]/g, '');

  let index = 0, lat = 0, lng = 0, coordinates = [], factor = Math.pow(10, precision);
  while (index < str.length) {
    let byte, shift = 0, result = 0;
    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    const finalLat = lat / factor;
    const finalLng = lng / factor;

    // Filter out obvious noise/outliers (e.g. coordinates near 0,0)
    // Most vehicles won't be at exactly 0,0 unless there is a GPS error
    if (Math.abs(finalLat) > 1 && Math.abs(finalLng) > 1) {
      coordinates.push([finalLat, finalLng]);
    }
  }
  return coordinates;
};

// Component to dynamically re-center map when coordinates change
function ChangeView({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      try {
        map.fitBounds(bounds, { padding: [50, 50] });
      } catch (e) {
        console.error("Error fitting bounds:", e);
      }
    } else {
      // Fallback to Indore center if no data
      map.setView([22.7484804921113, 75.8946311624446], 18);
    }
  }, [bounds, map]);
  return null;
}

// Sleek start and end markers for Trip History map
const startIcon = L.divIcon({
  className: 'custom-start-icon',
  html: '<div style="width: 20px; height: 20px; background: white; border: 4px solid #10b981; border-radius: 50%; box-shadow: 0 0 10px rgba(16,185,129,0.6); display: flex; align-items: center; justify-content: center;"><div style="width: 6px; height: 6px; background: #10b981; border-radius: 50%;"></div></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const endIcon = L.divIcon({
  className: 'custom-end-icon',
  html: '<div style="width: 20px; height: 20px; background: white; border: 4px solid #ef4444; border-radius: 50%; box-shadow: 0 0 10px rgba(239,68,68,0.6); display: flex; align-items: center; justify-content: center;"><div style="width: 6px; height: 6px; background: #ef4444; border-radius: 50%;"></div></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export default function TripHistory({ user }) {
  const [vehicles, setVehicles] = useState([]);
  const [selectedImei, setSelectedImei] = useState('860710085959719');
  const [tripData, setTripData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDateTrip, setSelectedDateTrip] = useState(null);
  const [mapType, setMapType] = useState('light');

  useEffect(() => {
    const userId = user?.id || user?._id || localStorage.getItem('userId');
    const fetchVehicles = async () => {
      try {
        const isUserAdmin = user && (user.role || '').toLowerCase() === 'admin';
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
            if (data && Array.isArray(data.data)) {
              const mapped = data.data.map(d => ({
                _id: d._id || d.imei,
                imei: d.imei,
                vehicleNumber: d.device_name || d.imei,
                vehicleMaker: d.device_name || 'Fleet',
                vehicleModel: 'Device'
              }));
              setVehicles(mapped);
              const hasPreferred = mapped.some(v => v.imei === '860710085959719');
              if (hasPreferred) {
                setSelectedImei('860710085959719');
              } else {
                const firstValid = mapped.find(v => v.imei);
                if (firstValid) setSelectedImei(firstValid.imei);
              }
            }
          } else {
            if (data && data.vehicles) {
              setVehicles(data.vehicles);
              const hasPreferred = data.vehicles.some(v => v.imei === '860710085959719');
              if (hasPreferred) {
                setSelectedImei('860710085959719');
              } else {
                const firstValid = data.vehicles.find(v => v.imei);
                if (firstValid) setSelectedImei(firstValid.imei);
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

  useEffect(() => {
    if (!selectedImei) return;
    const fetchTrips = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/api/journey/ride-history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imei: selectedImei })
        });
        const result = await response.json();
        if (result.status && result.data) {
          // Sort daily trips descending by date (newest/current date first at the top)
          const sortedTrips = [...result.data].sort((a, b) => new Date(b.date) - new Date(a.date));
          setTripData(sortedTrips);
          if (sortedTrips.length > 0) {
            setSelectedDateTrip(sortedTrips[0]);
          } else {
            setSelectedDateTrip(null);
          }
        } else {
          setTripData([]);
          setSelectedDateTrip(null);
        }
      } catch (error) {
        console.error("Ride history API error:", error);
        setTripData([]);
        setSelectedDateTrip(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [selectedImei]);

  const routePoints = selectedDateTrip && Array.isArray(selectedDateTrip.routeData)
    ? selectedDateTrip.routeData.filter(pt => {
      const lat = parseFloat(pt.latitude);
      const lng = parseFloat(pt.longitude);
      return !isNaN(lat) && !isNaN(lng) && Math.abs(lat) > 1 && Math.abs(lng) > 1;
    })
    : [];

  const mapCoords = routePoints.map(pt => [parseFloat(pt.latitude), parseFloat(pt.longitude)]);

  const endMarkerRef = useRef(null);

  useEffect(() => {
    if (mapCoords.length > 0) {
      const timer = setTimeout(() => {
        if (endMarkerRef.current) {
          try {
            endMarkerRef.current.openPopup();
          } catch (e) {
            console.error("Error opening popup:", e);
          }
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [mapCoords]);

  return (
    <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <style>{`
        /* Premium custom Leaflet dark popup theme */
        .leaflet-popup-content-wrapper {
          background: #0f172a !important;
          color: #f8fafc !important;
          border: 1px solid #334155 !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.5) !important;
        }
        .leaflet-popup-tip {
          background: #0f172a !important;
          border: 1px solid #334155 !important;
        }
        .leaflet-popup-close-button {
          color: #94a3b8 !important;
        }
        .leaflet-popup-close-button:hover {
          color: #f8fafc !important;
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>Trip History</h1>
          <p style={{ color: 'var(--text-muted)' }}>Analyze vehicle trips and performance over time.</p>
        </div>
        <div>
          <select
            value={selectedImei}
            onChange={(e) => setSelectedImei(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              background: 'white',
              border: '1px solid var(--border)',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text-main)',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '250px'
            }}
          >
            <option value="" disabled>Select Vehicle</option>
            {vehicles.map(v => {
              if (!v.imei) return null;
              const label = v.vehicleModel === 'Device'
                ? `${v.vehicleMaker || 'Fleet'} - IMEI: ${v.imei}`
                : `${v.vehicleNumber} (IMEI: ${v.imei})`;
              return (
                <option key={v._id} value={v.imei}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px', flex: 1, minHeight: 0 }}>
        {/* Sidebar: Date List */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-main)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>Date Wise Data</h3>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {loading ? (
              <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Loading trips...</p>
            ) : tripData.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No trip data available.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tripData.map((trip, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedDateTrip(trip)}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: `1px solid ${selectedDateTrip === trip ? 'var(--primary)' : 'var(--border)'}`,
                      background: selectedDateTrip === trip ? 'var(--primary-light)' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{trip.date}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{trip.summary?.totalDistanceKm?.toFixed(2)} km</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <div>Duration: {trip.summary?.durationHours?.toFixed(2)} hrs</div>
                      <div>Top Spd: {trip.summary?.topSpeed?.toFixed(1)} km/h</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Area: Map & Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minHeight: 0 }}>
          {/* Summary Cards */}
          {selectedDateTrip && selectedDateTrip.summary ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Total Distance</p>
                <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>
                  {selectedDateTrip.summary.totalDistanceKm?.toFixed(2)} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>km</span>
                </h3>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Duration</p>
                <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>
                  {selectedDateTrip.summary.durationHours?.toFixed(2)} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>hrs</span>
                </h3>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Avg Speed</p>
                <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>
                  {selectedDateTrip.summary.avgSpeed?.toFixed(1)} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>km/h</span>
                </h3>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Top Speed</p>
                <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>
                  {selectedDateTrip.summary.topSpeed?.toFixed(1)} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>km/h</span>
                </h3>
              </div>
            </div>
          ) : (
            <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)' }}>
              Select a date to view trip summary.
            </div>
          )}

          {/* Map */}
          <div style={{ flex: 1, background: 'white', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden', position: 'relative' }}>
             {/* Map Type Selector Dropdown */}
             <select
               value={mapType}
               onChange={(e) => setMapType(e.target.value)}
               style={{
                 position: 'absolute',
                 top: '12px',
                 right: '12px',
                 zIndex: 1000,
                 background: 'white',
                 border: '1px solid var(--border)',
                 borderRadius: '8px',
                 padding: '8px 12px',
                 color: 'var(--text-main)',
                 fontSize: '13px',
                 fontWeight: 600,
                 cursor: 'pointer',
                 boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                 outline: 'none'
               }}
             >
               <option value="light">🗺️ Clean Light Map</option>
               <option value="voyager">📍 Colored Street Map</option>
               <option value="dark">🌑 Sleek Dark Map</option>
               <option value="satellite">🛰️ Satellite Map</option>
             </select>

             <MapContainer
               center={mapCoords.length > 0 ? mapCoords[0] : [22.7484804921113, 75.8946311624446]}
               zoom={mapCoords.length > 0 ? 13 : 10}
               style={{ width: '100%', height: '100%' }}
             >
               {mapType === 'satellite' && (
                 <TileLayer
                   url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                   maxZoom={19}
                 />
               )}
               {mapType === 'light' && (
                 <TileLayer
                   url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                   attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                   maxZoom={19}
                 />
               )}
               {mapType === 'voyager' && (
                 <TileLayer
                   url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                   attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                   maxZoom={19}
                 />
               )}
               {mapType === 'dark' && (
                 <TileLayer
                   url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                   attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                   maxZoom={19}
                 />
               )}
               <ChangeView bounds={mapCoords} />
              {mapCoords.length > 0 && (
                <>
                  <Polyline positions={mapCoords} pathOptions={{ color: '#2463eb', weight: 4, opacity: 1 }} />

                  {/* Start Marker with Popup InfoWindow */}
                  {routePoints.length > 0 && (
                    <Marker position={mapCoords[0]} icon={startIcon}>
                      <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#10b981' }}>Trip Start</span>
                      </Tooltip>
                      <Popup>
                        <div style={{ padding: '8px', fontSize: '13px', lineHeight: '1.6', color: '#ffffff', minWidth: '180px' }}>
                          <strong style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#34d399', borderBottom: '1px solid #334155', paddingBottom: '4px' }}>
                            Start Point
                          </strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div><strong style={{ color: '#94a3b8' }}>Time:</strong> <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#f8fafc' }}>{routePoints[0].time || 'N/A'}</span></div>
                            {routePoints[0].speed !== undefined && (
                              <div><strong style={{ color: '#94a3b8' }}>Speed:</strong> <span style={{ color: '#f8fafc' }}>{routePoints[0].speed} km/h</span></div>
                            )}
                            <div><strong style={{ color: '#94a3b8' }}>Latitude:</strong> <span style={{ color: '#f8fafc' }}>{mapCoords[0][0].toFixed(6)}</span></div>
                            <div><strong style={{ color: '#94a3b8' }}>Longitude:</strong> <span style={{ color: '#f8fafc' }}>{mapCoords[0][1].toFixed(6)}</span></div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Render every individual lat-long coordinate point as a lightweight CircleMarker with interactive info */}
                  {routePoints.map((pt, idx) => {
                    // Skip start and end points to avoid overlap
                    if (idx === 0 || idx === routePoints.length - 1) return null;
                    const ptLat = parseFloat(pt.latitude);
                    const ptLng = parseFloat(pt.longitude);
                    const ptTime = pt.time || 'N/A';
                    const ptSpeed = pt.speed !== undefined ? pt.speed : 0;
                    return (
                      <CircleMarker
                        key={`route-pt-${idx}`}
                        center={[ptLat, ptLng]}
                        radius={4}
                        pathOptions={{
                          color: '#2463eb',
                          fillColor: '#3b82f6',
                          fillOpacity: 0.85,
                          weight: 1.5
                        }}
                      >
                        <Popup>
                          <div style={{ padding: '6px', fontSize: '12px', lineHeight: '1.5', minWidth: '160px', color: '#ffffff' }}>
                            <strong style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: '#38bdf8', borderBottom: '1px solid #334155', paddingBottom: '4px' }}>
                              Route Point #{idx + 1}
                            </strong>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <div><strong style={{ color: '#94a3b8' }}>Time:</strong> <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#f8fafc' }}>{ptTime}</span></div>
                              <div><strong style={{ color: '#94a3b8' }}>Speed:</strong> <span style={{ color: '#f8fafc' }}>{ptSpeed} km/h</span></div>
                              <div><strong style={{ color: '#94a3b8' }}>Latitude:</strong> <span style={{ color: '#f8fafc' }}>{ptLat.toFixed(6)}</span></div>
                              <div><strong style={{ color: '#94a3b8' }}>Longitude:</strong> <span style={{ color: '#f8fafc' }}>{ptLng.toFixed(6)}</span></div>
                            </div>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })}

                  {/* End Marker with Trip Summary InfoWindow */}
                  {routePoints.length > 1 && (
                    <Marker position={mapCoords[mapCoords.length - 1]} icon={endIcon} ref={endMarkerRef}>
                      <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#ef4444' }}>Trip End</span>
                      </Tooltip>
                      <Popup>
                        <div style={{ padding: '12px', fontSize: '13px', lineHeight: '1.6', color: '#ffffff', minWidth: '240px' }}>
                          <strong style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#f87171', borderBottom: '1px solid #334155', paddingBottom: '6px' }}>
                            Trip Summary & End
                          </strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#94a3b8' }}>Date:</span>
                              <span style={{ fontWeight: 700, color: '#f8fafc' }}>{selectedDateTrip?.date}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: '#94a3b8' }}>End Time:</span>
                              <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '11px', color: '#f8fafc' }}>
                                {routePoints[routePoints.length - 1].time || 'N/A'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#94a3b8' }}>Total Distance:</span>
                              <span style={{ fontWeight: 700, color: '#38bdf8' }}>
                                {selectedDateTrip?.summary?.totalDistanceKm?.toFixed(2)} km
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#94a3b8' }}>Duration:</span>
                              <span style={{ fontWeight: 700, color: '#f8fafc' }}>
                                {selectedDateTrip?.summary?.durationHours?.toFixed(2)} hrs
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#94a3b8' }}>Avg Speed:</span>
                              <span style={{ fontWeight: 700, color: '#f8fafc' }}>
                                {selectedDateTrip?.summary?.avgSpeed?.toFixed(1)} km/h
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#94a3b8' }}>Top Speed:</span>
                              <span style={{ fontWeight: 700, color: '#f8fafc' }}>
                                {selectedDateTrip?.summary?.topSpeed?.toFixed(1)} km/h
                              </span>
                            </div>
                            <div style={{ borderTop: '1px solid #334155', paddingTop: '6px', marginTop: '2px', fontSize: '11px', color: '#64748b' }}>
                              <strong style={{ color: '#94a3b8' }}>End Coords:</strong> <span style={{ color: '#cbd5e1' }}>{mapCoords[mapCoords.length - 1][0].toFixed(6)}, {mapCoords[mapCoords.length - 1][1].toFixed(6)}</span>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </>
              )}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

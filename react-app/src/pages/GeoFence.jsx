import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/network';
import Swal from 'sweetalert2';
import { MapContainer, TileLayer, Polygon, Circle, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapClickRecorder({ setPolygonPoints }) {
  useMapEvents({
    click(e) {
      setPolygonPoints(prev => [...prev, { lat: e.latlng.lat, lng: e.latlng.lng }]);
    }
  });
  return null;
}

function GeofenceMapCenterer({ focusedGeofence }) {
  const map = useMap();
  useEffect(() => {
    if (focusedGeofence && focusedGeofence.geofencingCoordinates && focusedGeofence.geofencingCoordinates.length > 0) {
      const coords = focusedGeofence.geofencingCoordinates;
      if (coords.length === 1) {
        map.flyTo([coords[0].lat, coords[0].lng], 16, { duration: 1.5 });
      } else {
        const bounds = L.latLngBounds(coords.map(c => [c.lat, c.lng]));
        map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
      }
    }
  }, [focusedGeofence, map]);
  return null;
}

export default function GeoFence() {
  const [geofences, setGeofences] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedGeofence, setFocusedGeofence] = useState(null);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    imei: '',
    geofencName: '',
    radius: 100 // Fallback for single point
  });
  const [polygonPoints, setPolygonPoints] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const resGeofences = await fetch(`${BASE_URL}/api/geoFance/geofence_all_Data`);
      if (resGeofences.ok) {
        const data = await resGeofences.json();
        const results = data.result || (Array.isArray(data) ? data : []);
        setGeofences(results);
      }

      const userId = localStorage.getItem('userId');
      const resVehicles = await fetch(`${BASE_URL}/api/vehicle/get-vehicles?userId=${userId}`);
      if (resVehicles.ok) {
        const data = await resVehicles.json();
        if (data && Array.isArray(data.vehicles)) {
          setVehicles(data.vehicles);
        }
      }
    } catch (err) {
      console.error('Error fetching geofences:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (polygonPoints.length > 0 && polygonPoints.length < 3) {
      Swal.fire('A polygon must have at least 3 points. Draw more or clear to use single point.');
      return;
    }
    
    setActionLoading(true);
    try {
      // Default center if nothing drawn
      let coordsToSave = polygonPoints;
      if (coordsToSave.length === 0) {
         coordsToSave = [{ lat: 22.7533, lng: 75.8937 }];
      }

      const payload = {
        imei: formData.imei,
        geofencName: formData.geofencName,
        geofencingCoordinates: coordsToSave,
        radius: formData.radius || 100
      };

      const res = await fetch(`${BASE_URL}/api/geoFance/update_geofence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'accept': '*/*' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        Swal.fire('Geofence boundary saved successfully!');
        setIsModalOpen(false);
        setFormData({ imei: '', geofencName: '', radius: 100 });
        setPolygonPoints([]);
        loadData();
      } else {
        Swal.fire('Failed to update geofence boundary.');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error updating geofence boundary.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteGeofence = async (imei) => {
    if (!confirm('Are you sure you want to delete geofence for this vehicle?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/geoFance/geofence/${imei}`, {
        method: 'DELETE',
        headers: { 'accept': '*/*' }
      });
      if (res.ok) {
        Swal.fire('Geofence deleted successfully.');
        if (focusedGeofence?.imei === imei) setFocusedGeofence(null);
        loadData();
      } else {
        Swal.fire('Failed to delete geofence.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredGeofences = Array.isArray(geofences) ? geofences.filter(g => {
    const query = searchTerm.toLowerCase();
    const veh = Array.isArray(vehicles) ? (vehicles.find(v => v.imei === g.imei) || {}) : {};
    return (
      g.geofencName?.toLowerCase().includes(query) ||
      g.imei?.toLowerCase().includes(query) ||
      veh.vehicleNumber?.toLowerCase().includes(query)
    );
  }) : [];

  return (
    <div className="fade-in" style={{ position: 'relative', height: 'calc(100vh - 60px)', width: '100%', overflow: 'hidden' }}>
      
      {/* BACKGROUND MAP */}
      <MapContainer center={[22.7533, 75.8937]} zoom={10} style={{ width: '100%', height: '100%', zIndex: 1 }} zoomControl={false}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        <GeofenceMapCenterer focusedGeofence={focusedGeofence} />
        
        {geofences.map(g => {
          const coords = g.geofencingCoordinates || [];
          if (coords.length > 2) {
            return (
              <Polygon 
                key={g._id || g.imei} 
                positions={coords.map(c => [c.lat, c.lng])} 
                color={focusedGeofence?._id === g._id ? "#ef4444" : "#10b981"} 
                fillOpacity={focusedGeofence?._id === g._id ? 0.6 : 0.3}
                weight={3}
              />
            );
          } else if (coords.length === 1) {
            return (
              <Circle 
                key={g._id || g.imei} 
                center={[coords[0].lat, coords[0].lng]} 
                radius={g.radius || 100} 
                color={focusedGeofence?._id === g._id ? "#ef4444" : "#3b82f6"} 
                fillOpacity={focusedGeofence?._id === g._id ? 0.4 : 0.2}
                weight={3}
              />
            );
          }
          return null;
        })}
      </MapContainer>

      {/* FLOATING GEOFENCE PANEL */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 10,
        width: 360,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 16,
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100% - 40px)',
        border: '1px solid rgba(0,0,0,0.05)'
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
             <span className="material-icons" style={{ color: '#10b981', fontSize: 22 }}>security</span>
             <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#0f172a', letterSpacing: '0.5px' }}>GEOFENCE GUARD</h3>
          </div>
          <button 
             onClick={() => setIsModalOpen(true)} 
             className="btn-primary" 
             style={{ padding: '6px 12px', fontSize: 12, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 800, background: '#3b82f6' }}
          >
             <span className="material-icons" style={{ fontSize: 16 }}>add_circle</span> CREATE
          </button>
        </div>

        {/* Stats & Search */}
        <div style={{ padding: '12px 20px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
           <input 
             type="text" 
             placeholder="Search zone..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)} 
             style={{ width: '65%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }} 
           />
           <span style={{ fontSize: 12, fontWeight: 800, color: '#10b981' }}>{filteredGeofences.length} ACTIVE</span>
        </div>

        {/* List */}
        <div style={{ overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#64748b', fontSize: 13 }}>Loading...</div>
          ) : filteredGeofences.length > 0 ? (
            filteredGeofences.map(g => {
              const isActive = focusedGeofence?._id === g._id;
              const coords = g.geofencingCoordinates || [];
              const isPolygon = coords.length > 2;
              return (
                <div 
                  key={g._id || g.imei} 
                  onClick={() => setFocusedGeofence(g)}
                  style={{ 
                    padding: 16, 
                    border: isActive ? '2px solid #3b82f6' : '1px solid #e2e8f0', 
                    borderRadius: 12, 
                    cursor: 'pointer', 
                    background: isActive ? '#eff6ff' : 'white',
                    transition: 'all 0.2s',
                    boxShadow: isActive ? '0 4px 12px rgba(59, 130, 246, 0.1)' : '0 2px 4px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                       <span className="material-icons" style={{ color: isActive ? '#3b82f6' : '#94a3b8', fontSize: 18 }}>
                         {isPolygon ? 'polyline' : 'radio_button_unchecked'}
                       </span>
                       <strong style={{ fontSize: 15, color: '#0f172a' }}>{g.geofencName || 'Unnamed'}</strong>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteGeofence(g.imei); }} 
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
                    >
                       <span className="material-icons" style={{ color: '#ef4444', fontSize: 18 }}>delete</span>
                    </button>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span>Coords: {coords[0]?.lat?.toFixed(4) || 0}, {coords[0]?.lng?.toFixed(4) || 0}</span>
                    <span style={{ fontWeight: 600 }}>{isPolygon ? `Polygon (${coords.length} points)` : `Radius: ${g.radius || 100}m`}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#64748b', fontSize: 13 }}>No active zones found.</div>
          )}
        </div>
      </div>

      {/* CREATE GEOFENCE MODAL */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="card" style={{ width: 850, padding: '24px', position: 'relative', borderRadius: 20, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: 16, right: 16, border: 'none', background: '#f1f5f9', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <span className="material-icons" style={{ fontSize: 18 }}>close</span>
            </button>

            <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-main)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-icons" style={{ color: 'var(--primary)' }}>draw</span>
              Draw Geofence Boundary
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
              Click on the map to draw a polygon boundary, or just click once for a circular boundary.
            </p>

            <form onSubmit={handleCreateOrUpdate} style={{ display: 'flex', gap: 20 }}>
              {/* Form Fields Side */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Anchor Fleet Vehicle <strong style={{ color: 'red' }}>*</strong>
                  </label>
                  <select
                    value={formData.imei}
                    required
                    onChange={(e) => setFormData(prev => ({ ...prev, imei: e.target.value }))}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 13, outline: 'none' }}
                  >
                    <option value="">-- Select matching fleet asset --</option>
                    {vehicles.map(v => (
                      <option key={v._id} value={v.imei}>
                        {v.vehicleMaker} {v.vehicleModel} - {v.vehicleNumber}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Boundary Location Name <strong style={{ color: 'red' }}>*</strong>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.geofencName}
                    onChange={(e) => setFormData(prev => ({ ...prev, geofencName: e.target.value }))}
                    placeholder="e.g. Headquarters Office"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 13, outline: 'none' }}
                  />
                </div>
                
                {polygonPoints.length < 3 && (
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                      Circular Radius (Meters)
                    </label>
                    <input
                      type="number"
                      value={formData.radius}
                      onChange={(e) => setFormData(prev => ({ ...prev, radius: e.target.value }))}
                      placeholder="e.g. 100"
                      style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 13, outline: 'none' }}
                    />
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Radius is ignored if you draw a Polygon (3+ points).</div>
                  </div>
                )}

                <div style={{ marginTop: 'auto', background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#334155' }}>Points Placed:</span>
                    <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--primary)' }}>{polygonPoints.length}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setPolygonPoints([])}
                    style={{ width: '100%', padding: '10px', fontSize: 12, fontWeight: 800, color: '#ef4444', background: '#fee2e2', border: 'none', borderRadius: 8, cursor: 'pointer' }}
                  >
                    CLEAR DRAWING
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ flex: 1, padding: 12, borderRadius: 10 }}>Cancel</button>
                  <button type="submit" disabled={actionLoading} className="btn-primary" style={{ flex: 1.5, padding: 12, borderRadius: 10, fontWeight: 800 }}>
                    {actionLoading ? 'Saving...' : 'Save Boundary'}
                  </button>
                </div>
              </div>

              {/* Map side */}
              <div style={{ flex: 1.5, height: '440px', borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }}>
                <MapContainer center={[22.7533, 75.8937]} zoom={12} style={{ width: '100%', height: '100%', cursor: 'crosshair', zIndex: 1 }}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                  <MapClickRecorder setPolygonPoints={setPolygonPoints} />
                  
                  {polygonPoints.length > 2 && (
                    <Polygon positions={polygonPoints.map(p => [p.lat, p.lng])} color="#10b981" fillColor="#10b981" fillOpacity={0.4} />
                  )}
                  {polygonPoints.length === 1 && (
                    <Circle center={[polygonPoints[0].lat, polygonPoints[0].lng]} radius={formData.radius || 100} color="#3b82f6" fillColor="#3b82f6" fillOpacity={0.3} />
                  )}
                  {polygonPoints.map((p, idx) => (
                    <Marker key={idx} position={[p.lat, p.lng]} />
                  ))}
                </MapContainer>
                {polygonPoints.length === 0 && (
                  <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '8px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, zIndex: 10, pointerEvents: 'none' }}>
                    Click anywhere on the map to start drawing
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

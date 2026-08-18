import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Polygon, Marker, Popup, Tooltip, Circle, CircleMarker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import TrackifyLoader from '../components/TrackifyLoader';

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
function ChangeView({ center, zoom, deviceImei, dateFilter, isPlaying, playbackIndex }) {
  const map = useMap();
  const prevKeyRef = React.useRef("");
  const prevPlaybackIndexRef = React.useRef(0);
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

    let shouldCenter = !hasCenteredRef.current;

    // Always center if playing or if playback index changed
    if (isPlaying || prevPlaybackIndexRef.current !== playbackIndex) {
      shouldCenter = true;
    }

    prevPlaybackIndexRef.current = playbackIndex;

    if (shouldCenter) {
      // Use flyTo for smoother panning if it's playing and the center is not default, otherwise setView
      if (isPlaying && hasCenteredRef.current) {
        map.panTo(center, { animate: true, duration: 0.5 });
      } else {
        map.setView(center, zoom || 20);
      }

      if (!isDefault) {
        hasCenteredRef.current = true;
      }
    }
  }, [center, zoom, deviceImei, dateFilter, map, isPlaying, playbackIndex]);

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
import Swal from 'sweetalert2';

const getBatteryInfo = (voltage, engineOn) => {
  if (voltage == null) return { displayVolt: '0V', text: 'No Data', status: 'Unknown', color: 'var(--text-muted)', percent: 0, icon: 'battery_unknown' };

  const v = parseFloat(voltage);
  if (isNaN(v)) return { displayVolt: '0V', text: 'Invalid Data', status: 'Unknown', color: 'var(--text-muted)', percent: 0, icon: 'battery_unknown' };

  // L57 Level Mapping (0-6)
  if (Number.isInteger(v) && v >= 0 && v <= 6) {
    if (v === 0) return { displayVolt: 'Level 0', text: 'Disconnected', status: 'Power disconnected', color: '#8B0000', percent: 0, icon: 'battery_unknown' };
    if (v === 1) return { displayVolt: 'Level 1', text: 'Critical', status: 'Critical battery', color: '#8B0000', percent: 5, icon: 'battery_alert' };
    if (v === 2) return { displayVolt: 'Level 2', text: 'Very low', status: 'Very low battery', color: '#FF4D4D', percent: 15, icon: 'battery_1_bar' };
    if (v === 3) return { displayVolt: 'Level 3', text: 'Low', status: 'Low battery', color: '#FF8C00', percent: 30, icon: 'battery_3_bar' };
    if (v === 4) return { displayVolt: 'Level 4', text: 'Medium', status: 'Medium battery', color: '#9ACD32', percent: 60, icon: 'battery_4_bar' };
    if (v === 5) return { displayVolt: 'Level 5', text: 'Normal', status: 'Normal battery', color: '#32CD32', percent: 85, icon: 'battery_5_bar' };
    if (v === 6) return { displayVolt: 'Level 6', text: 'Normal', status: 'Normal battery', color: '#32CD32', percent: 100, icon: 'battery_full' };
  }

  if (v < 5) return { displayVolt: `${v.toFixed(2)}V`, text: 'Disconnected', status: 'External power disconnected', color: 'var(--error)', percent: 0, icon: 'battery_alert' };

  if (engineOn) {
    if (v < 13.0) return { displayVolt: `${v.toFixed(2)}V`, text: 'Warning', status: 'Alternator/charging warning', color: 'var(--error)', percent: 20 };
    if (v <= 14.8) return { displayVolt: `${v.toFixed(2)}V`, text: 'Charging', status: 'Battery charging, normal', color: 'var(--success)', percent: 100 };
    if (v <= 15.2) return { displayVolt: `${v.toFixed(2)}V`, text: 'High Volt', status: 'High charging voltage', color: 'var(--warning)', percent: 100 };
    return { displayVolt: `${v.toFixed(2)}V`, text: 'Warning', status: 'Charging system warning', color: 'var(--error)', percent: 100 };
  } else {
    if (v >= 12.60) return { displayVolt: `${v.toFixed(2)}V`, text: '90-100%', status: 'Normal', color: 'var(--success)', percent: 95 };
    if (v >= 12.40) return { displayVolt: `${v.toFixed(2)}V`, text: '70-89%', status: 'Normal', color: 'var(--success)', percent: 80 };
    if (v >= 12.20) return { displayVolt: `${v.toFixed(2)}V`, text: '45-69%', status: 'Medium', color: 'var(--warning)', percent: 55 };
    if (v >= 12.00) return { displayVolt: `${v.toFixed(2)}V`, text: '20-44%', status: 'Low', color: 'var(--error)', percent: 30 };
    if (v >= 11.80) return { displayVolt: `${v.toFixed(2)}V`, text: '5-19%', status: 'Very Low', color: 'var(--error)', percent: 10 };
    return { displayVolt: `${v.toFixed(2)}V`, text: '0-5%', status: 'Critical', color: 'var(--error)', percent: 5 };
  }
};

export default function PlayBack({ user }) {
  const [vehicles, setVehicles] = React.useState([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = React.useState(true);
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
  const [deviceStatus, setDeviceStatus] = React.useState(null);
  const [showGeoModal, setShowGeoModal] = React.useState(false);
  const [geoNameInput, setGeoNameInput] = React.useState('');
  const [isDrawingGeo, setIsDrawingGeo] = React.useState(false);
  const [draftGeoCoords, setDraftGeoCoords] = React.useState([]);
  const [draftGeoRadius, setDraftGeoRadius] = React.useState(200);
  const [draftGeoCenter, setDraftGeoCenter] = React.useState(null);
  const [vehicleSearch, setVehicleSearch] = React.useState('');
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  // Close dropdown on click outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.custom-vehicle-select')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    if (device?.lat && device?.lng) {
      const lat = parseFloat(device.lat);
      const lg = parseFloat(device.lng);
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
  const currentTimestamp = latestPoint?.createdAt
    ? new Date(latestPoint.createdAt).toLocaleString()
    : (device?.lastUpdate ? new Date(device.lastUpdate).toLocaleString() : '--');

  useEffect(() => {
    // Dynamically get user ID from session context or use default
    const userId = user?.id || user?._id || localStorage.getItem('userId');

    const fetchVehicles = async () => {
      setIsLoadingVehicles(true);
      try {
        const isUserAdmin = user && ['superadmin'].includes((user.role || '').toLowerCase());

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
          ? `${BASE_URL}/api/device/all-last-locations`
          : `${BASE_URL}/api/vehicle/get-vehicles?userId=${userId}`;

        const response = await fetch(targetUrl, {
          method: 'GET',
          headers: { 'accept': 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();
          if (isUserAdmin) {
            const list = data.result || data.data || [];
            if (list.length > 0) {
              const mapped = list.map(d => {
                const match = allVehicles.find(v => String(v.imei) === String(d.imei));
                return {
                  _id: d.id || d.imei,
                  imei: d.imei,
                  vehicleNumber: match?.vehicleNumber || d.imei,
                  vehicleMaker: match?.vehicleMaker || d.user_name || 'Fleet',
                  vehicleModel: match?.vehicleModel || 'Device',
                  vehicleType: match?.vehicleType || 'vehicle',
                  fuelType: match?.fuelType || 'N/A',
                  createdAt: match?.createdAt || d.lastUpdate || d.createdAt || null,
                  lastUpdate: d.lastUpdate || d.updatedAt || d.createdAt || match?.lastUpdate || match?.updatedAt || null,
                  lat: d.lat || d.latitude || d.lt || match?.lat || match?.latitude || match?.lt || match?.currentLocation?.lat,
                  lng: d.long || d.lng || d.longitude || d.lg || match?.lng || match?.longitude || match?.lg || match?.currentLocation?.lng,
                  currentLocation: d.currentLocation || match?.currentLocation || null,
                  speed: d.speed || match?.speed || 0
                };
              });
              setVehicles(mapped);
              const preferred = mapped.find(v => v.imei === '0864662074417207') || mapped.find(v => v.imei === '860710085959719');
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
      } finally {
        setIsLoadingVehicles(false);
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
    if (device && device.imei) {
      const fetchDeviceStatus = async () => {
        try {
          const response = await fetch(`${BASE_URL}/api/device/deviceStatus/${device.imei}`);
          const result = await response.json();
          if (result && result.success && result.data) {
            setDeviceStatus(result.data);
          } else {
            setDeviceStatus(null);
          }
        } catch (error) {
          console.error("Failed to fetch device status", error);
          setDeviceStatus(null);
        }
      };

      fetchDeviceStatus();
      const intervalId = setInterval(fetchDeviceStatus, 10000);
      return () => clearInterval(intervalId);
    }
  }, [device]);

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

  useEffect(() => {
    if (isDrawingGeo && draftGeoCenter) {
      const points = [];
      const dLat = draftGeoRadius / 111320;
      const dLng = draftGeoRadius / (111320 * Math.cos(draftGeoCenter[0] * Math.PI / 180));

      for (let i = 0; i < 6; i++) {
        const angle = (i * 60) * Math.PI / 180;
        points.push([
          draftGeoCenter[0] + (dLat * Math.sin(angle)),
          draftGeoCenter[1] + (dLng * Math.cos(angle))
        ]);
      }
      setDraftGeoCoords(points);
    }
  }, [draftGeoRadius, draftGeoCenter, isDrawingGeo]);

  const handleCreateGeofence = async () => {
    if (!device?.imei || draftGeoCoords.length < 3 || !geoNameInput) {
      setGeoError('Please draw a valid area with at least 3 points and provide a name.');
      return;
    }
    setGeoSaving(true);
    setGeoError('');
    setGeoSuccess('');

    try {
      const response = await fetch(`${BASE_URL}/api/geoFance/update_geofence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imei: device.imei,
          geofencingCoordinates: draftGeoCoords.map(c => ({ lat: c[0], lng: c[1] })),
          geofencName: geoNameInput
        })
      });

      if (response.ok) {
        setGeoSuccess('Geofence created successfully!');
        fetchGeofences(device.imei);
        setShowGeoModal(false);
        setGeoNameInput('');
        setIsDrawingGeo(false);
        setDraftGeoCoords([]);
        setDraftGeoCenter(null);
        setDraftGeoRadius(200);
      } else {
        setGeoError('Failed to create geofence.');
      }
    } catch (err) {
      setGeoError('Error creating geofence.');
    } finally {
      setGeoSaving(false);
    }
  };

  const batteryVal = deviceStatus?.battery != null ? deviceStatus.battery : deviceStatus?.internalBatteryLevel;
  const batteryInfo = getBatteryInfo(batteryVal, deviceStatus?.acc);

  const vehicleName = device
    ? (device.device_name || (device.vehicleModel && device.vehicleModel !== 'Device' ? device.vehicleModel : (device.vehicleMaker ? `${device.vehicleMaker} ${device.vehicleModel}` : `Device ${device.imei}`)))
    : "Freightliner Cascadia";

  const vehicleDetails = device
    ? (device.vehicleNumber
      ? `Number: ${device.vehicleNumber} • IMEI: ${device.imei || 'Not Assigned'}`
      : `IMEI: ${device.imei} • Last Seen: ${device.lastUpdate ? new Date(device.lastUpdate).toLocaleString() : 'N/A'}`
    )
    : "VIN: 1FUJAGAK9HL • Fleet #402";

  const getStatusColor = (statusText) => {
    if (!statusText) return 'var(--text-muted)';
    const s = statusText.toLowerCase();
    if (['running', 'moving'].includes(s)) return 'var(--success)'; // Green
    if (s === 'idle') return 'var(--error)'; // Red
    if (['parking', 'parked'].includes(s)) return 'var(--primary)'; // Blue
    return 'var(--text-muted)'; // Grey for Offline, Expired, etc.
  };

  return (
    <div className="tracking-wrapper" style={{ position: 'relative' }}>
      {isLoadingVehicles && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(255, 255, 255, 0.4)', zIndex: 9999,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          flexDirection: 'column', backdropFilter: 'blur(2px)'
        }}>
          <TrackifyLoader animated={true} message="Loading Live Tracking Data..." />
        </div>
      )}
      <div className="map-pane" style={{ position: 'relative' }}>
        {/* Map Drawing Tools Overlay */}
        {isDrawingGeo && (
          <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'rgba(255, 255, 255, 0.95)', padding: '12px 20px', borderRadius: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
              {draftGeoCoords.length === 0 ? "📍 Click on the map to place a Geofence area" : "👉 Drag points or adjust radius"}
            </span>
            {draftGeoCoords.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>{draftGeoRadius}m</span>
                <input
                  type="range"
                  min={/(bike|scooter|2|two)/i.test(device?.vehicleType || '') ? "10" : "30"}
                  max={/(bike|scooter|2|two)/i.test(device?.vehicleType || '') ? "100" : "5000"}
                  step="10"
                  value={draftGeoRadius}
                  onChange={(e) => setDraftGeoRadius(Number(e.target.value))}
                  style={{ width: '100px', cursor: 'pointer' }}
                />
              </div>
            )}
            <button
              onClick={() => {
                setIsDrawingGeo(false);
                setDraftGeoCoords([]);
                setDraftGeoCenter(null);
                setDraftGeoRadius(200);
              }}
              style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '16px', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}>
              Cancel
            </button>
            <button
              onClick={() => {
                if (draftGeoCoords.length < 3) {
                  Swal.fire('Please add at least 3 points to create a geofence area.');
                  return;
                }
                setShowGeoModal(true);
              }}
              style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '16px', fontWeight: 700, cursor: draftGeoCoords.length >= 3 ? 'pointer' : 'not-allowed', fontSize: '12px', opacity: draftGeoCoords.length >= 3 ? 1 : 0.6 }}>
              Save
            </button>
          </div>
        )}
        <MapContainer
          center={[22.7484804921113, 75.8946311624446]}
          zoom={18}
          zoomControl={true}
          scrollWheelZoom={true}
          attributionControl={false}
          style={{ width: '100%', height: '100%', background: 'var(--text-main)' }}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={22}
            maxNativeZoom={19}
          />
          <ChangeView center={mapCenter || currentPos} zoom={20} deviceImei={device?.imei} dateFilter={dateFilter} isPlaying={isPlaying} playbackIndex={playbackIndex} />

          <MapEvents onClick={(latlng) => {
            if (isDrawingGeo && draftGeoCoords.length === 0) {
              setDraftGeoCenter([latlng.lat, latlng.lng]);
            }
          }} />

          {/* Draft Polygon */}
          {draftGeoCoords.length > 0 && (
            <>
              {draftGeoCoords.length >= 3 ? (
                <Polygon positions={draftGeoCoords} pathOptions={{ color: '#f59e0b', weight: 3, fillColor: '#f59e0b', fillOpacity: 0.2, dashArray: '5, 5' }} />
              ) : (
                <Polyline positions={draftGeoCoords} pathOptions={{ color: '#f59e0b', weight: 3, dashArray: '5, 5' }} />
              )}
              {draftGeoCoords.map((pos, idx) => (
                <Marker
                  key={idx}
                  position={pos}
                  draggable={true}
                  eventHandlers={{
                    dragend: (e) => {
                      const position = e.target.getLatLng();
                      setDraftGeoCoords(prev => {
                        const newCoords = [...prev];
                        newCoords[idx] = [position.lat, position.lng];
                        return newCoords;
                      });
                    }
                  }}
                  icon={L.divIcon({
                    className: 'custom-div-icon',
                    html: '<div style="width: 12px; height: 12px; background: white; border: 3px solid #f59e0b; border-radius: 50%; box-shadow: 0 0 6px rgba(245,158,11,0.6); cursor: grab;"></div>',
                    iconSize: [12, 12],
                    iconAnchor: [6, 6]
                  })}
                />
              ))}
            </>
          )}

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
            if (v._id === device?._id) return null;

            // Extract lat/lng from multiple potential keys
            let lat = v.lat || v.latitude || v.lt || v.currentLocation?.lat;
            let lng = v.lng || v.longitude || v.lg || v.currentLocation?.lng;

            if (lat && lng) {
              lat = parseFloat(lat);
              lng = parseFloat(lng);
              if (isNaN(lat) || isNaN(lng)) return null;

              return (
                <Marker
                  key={v._id}
                  position={[lat, lng]}
                  icon={otherVehicleIcon}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={0.8} interactive>
                    <a href={`/${v.imei}`} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <span style={{ fontSize: '10px', fontWeight: 'bold' }}>
                        {v.vehicleNumber || v.imei || 'Vehicle'}
                      </span>
                      <span className="material-icons" style={{ fontSize: '10px' }}>open_in_new</span>
                    </a>
                  </Tooltip>
                </Marker>
              );
            }
            return null;
          })}

          {/* Current selected location */}
          <Marker position={currentPos} icon={currentIcon}>
            <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent interactive>
              <a href={`/${device?.imei}`} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <span style={{ fontSize: '10px', fontWeight: 'bold' }}>
                  {device?.vehicleNumber || device?.imei || 'Selected'}
                </span>
                <span className="material-icons" style={{ fontSize: '10px' }}>open_in_new</span>
              </a>
            </Tooltip>
            <Popup>
              <div style={{ padding: '12px', fontSize: '13px', lineHeight: '1.6', color: 'var(--text-main)', minWidth: '240px' }}>
                <strong style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#2463eb', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                  🚗 {device?.device_name || (device?.vehicleMaker && device.vehicleMaker !== 'Fleet' ? `${device.vehicleMaker} ${device.vehicleModel}` : (device?.vehicleNumber || 'Vehicle / Device'))}
                </strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {device?.vehicleNumber && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Reg No:</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-main)' }}>{device.vehicleNumber}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>IMEI:</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 700, color: 'var(--text-main)' }}>{device?.imei || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                    <span style={{ fontWeight: 700, color: getStatusColor(deviceStatus?.status) }}>
                      {['running', 'moving'].includes(deviceStatus?.status?.toLowerCase()) ? 'Vehicle is Moving' : (deviceStatus?.status?.toLowerCase() === 'idle' ? 'Vehicle is Idle' : (['parking', 'parked'].includes(deviceStatus?.status?.toLowerCase()) ? 'Vehicle is Parked' : (deviceStatus?.status?.toLowerCase() === 'offline' ? 'Device Offline' : (deviceStatus?.status || 'Unknown'))))}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Engine:</span>
                    <span style={{ fontWeight: 700, color: deviceStatus?.acc ? 'var(--success)' : 'var(--error)' }}>
                      {deviceStatus?.acc ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Battery:</span>
                    <span style={{ fontWeight: 700, color: batteryInfo?.color || 'var(--text-main)' }}>
                      {batteryInfo?.displayVolt?.includes('Level')
                        ? `${batteryInfo.text.toLowerCase()}${deviceStatus?.externalVoltage != null ? `(${deviceStatus.externalVoltage})` : ''}`
                        : `${batteryInfo?.displayVolt || 'N/A'} ${deviceStatus?.externalVoltage != null ? `(Ext ${deviceStatus.externalVoltage}V)` : ''}`}
                    </span>
                  </div>
                  {latestPoint?.sp !== undefined && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Speed:</span>
                      <span style={{ fontWeight: 700, color: latestPoint.sp > 0 ? '#10b981' : 'var(--text-muted)' }}>{latestPoint.sp} km/h</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Latitude:</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{typeof currentPos[0] === 'number' ? currentPos[0].toFixed(6) : currentPos[0]}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Longitude:</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{typeof currentPos[1] === 'number' ? currentPos[1].toFixed(6) : currentPos[1]}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Last Update:</span>
                    <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-main)' }}>
                      {latestPoint?.createdAt
                        ? new Date(latestPoint.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).replace('am', 'AM').replace('pm', 'PM')
                        : (device?.lastUpdate ? new Date(device.lastUpdate).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).replace('am', 'AM').replace('pm', 'PM') : 'N/A')}
                    </span>
                  </div>
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
          <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, position: 'relative', width: 200, display: 'flex', alignItems: 'center' }}>
            <div style={{ position: 'absolute', left: 0, width: `${historyData.length > 0 ? (playbackIndex / (historyData.length - 1)) * 100 : 0}%`, height: '100%', background: 'var(--primary)', borderRadius: 2, pointerEvents: 'none' }} />
            <div
              style={{
                position: 'absolute',
                left: `${historyData.length > 0 ? (playbackIndex / (historyData.length - 1)) * 100 : 0}%`,
                width: 12, height: 12, background: 'var(--bg-sidebar)', border: '2px solid var(--primary)', borderRadius: '50%',
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>{vehicleName}</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{vehicleDetails}</p>
            </div>

          </div>

          {/* Filter Controls */}
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="custom-vehicle-select" style={{ position: 'relative' }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: 8, display: 'inline-block', width: 80 }}>
                Vehicle:
              </label>
              <div
                onClick={() => !vehicles.length ? null : setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  display: 'inline-flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  cursor: vehicles.length === 0 ? 'not-allowed' : 'pointer',
                  minWidth: '220px',
                  width: 'calc(100% - 88px)'
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {device ? (device.vehicleModel && device.vehicleModel !== 'Device' ? device.vehicleModel : device.vehicleNumber) + (device.imei ? ` (IMEI: ${device.imei})` : '') : 'Select a Vehicle'}
                </span>
                <span className="material-icons" style={{ fontSize: '16px' }}>expand_more</span>
              </div>

              {isDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  width: 'calc(100% - 88px)',
                  marginTop: '4px',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  zIndex: 9999,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <input
                    type="text"
                    placeholder="Search Vehicle by Name or IMEI..."
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      margin: '8px',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-main)',
                      color: 'var(--text-main)',
                      fontSize: '12px',
                      outline: 'none'
                    }}
                    autoFocus
                  />
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {vehicles.length === 0 ? (
                      <div style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--text-muted)' }}>No Vehicles Available</div>
                    ) : (
                      vehicles
                        .filter(v => {
                          if (!vehicleSearch) return true;
                          const label = v.vehicleModel && v.vehicleModel !== 'Device' ? v.vehicleModel : v.vehicleNumber;
                          const searchStr = vehicleSearch.toLowerCase();
                          return label?.toLowerCase().includes(searchStr) || v.imei?.toLowerCase().includes(searchStr);
                        })
                        .map(v => {
                          const label = v.vehicleModel && v.vehicleModel !== 'Device' ? v.vehicleModel : v.vehicleNumber;
                          return (
                            <div
                              key={v._id}
                              onClick={() => {
                                setDevice(v);
                                setIsDropdownOpen(false);
                                setVehicleSearch('');
                              }}
                              style={{
                                padding: '8px 12px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                borderBottom: '1px solid var(--border)',
                                color: 'var(--text-main)'
                              }}
                              onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                              onMouseLeave={(e) => e.target.style.opacity = '1'}
                            >
                              {label} {v.imei ? `(IMEI: ${v.imei})` : ''}
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              )}
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
              <span className="material-icons" style={{ fontSize: 14, color: deviceStatus?.acc ? 'var(--success)' : 'var(--error)' }}>power_settings_new</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: deviceStatus?.acc ? 'var(--success)' : 'var(--error)', textTransform: 'uppercase' }}>Engine Status</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: deviceStatus?.acc ? 'var(--success)' : 'var(--error)', margin: 0 }}>
                  {deviceStatus?.acc ? 'ON' : 'OFF'}
                </h3>
              </div>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: '100%', background: deviceStatus?.acc ? 'var(--success)' : 'var(--error)' }}
              />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: batteryInfo.color, textTransform: 'uppercase' }}>Battery Status</span>

              <div style={{
                width: '32px',
                height: '14px',
                border: `1.5px solid ${batteryInfo.color}`,
                borderRadius: '3px',
                padding: '1.5px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                opacity: batteryInfo.percent === 0 ? 0.5 : 1
              }}>
                <div style={{
                  height: '100%',
                  width: `${batteryInfo.percent}%`,
                  background: batteryInfo.color,
                  borderRadius: '1.5px',
                  transition: 'width 0.3s ease'
                }} />
                <div style={{
                  position: 'absolute',
                  right: '-4px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '2.5px',
                  height: '6px',
                  background: batteryInfo.color,
                  borderRadius: '0 2px 2px 0'
                }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)', margin: 0, textTransform: 'lowercase' }}>
                  {batteryInfo.displayVolt.includes('Level')
                    ? `${batteryInfo.text}${deviceStatus?.externalVoltage != null ? `(${deviceStatus.externalVoltage})` : ''}`
                    : batteryInfo.displayVolt}
                </h3>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 6, fontWeight: 600 }}>
                  ({batteryInfo.status})
                </span>
                {!batteryInfo.displayVolt.includes('Level') && deviceStatus?.externalVoltage != null && (
                  <span style={{ fontSize: 12, color: 'var(--primary)', marginLeft: 8, fontWeight: 700 }}>
                    Ext: {deviceStatus.externalVoltage}V
                  </span>
                )}
              </div>
            </div>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => {
                  setIsDrawingGeo(true);
                  setDraftGeoCoords([]);
                  setDraftGeoCenter(null);
                  setDraftGeoRadius(/(bike|scooter|2|two)/i.test(device?.vehicleType || '') ? 50 : 200);
                  setGeoNameInput(`Geo_${device?.vehicleNumber || device?.imei || ''}_${new Date().getHours()}${new Date().getMinutes()}`);
                  setGeoSuccess('');
                  setGeoError('');
                }}
                disabled={isDrawingGeo || geoSaving || !device?.imei}
                style={{
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '10px',
                  fontWeight: 700,
                  cursor: (geoSaving || !device?.imei || !currentPos) ? 'not-allowed' : 'pointer',
                  opacity: (geoSaving || !device?.imei || !currentPos) ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
                title="Create Geofence at current location"
              >
                <span style={{ fontSize: 14, fontWeight: 'bold' }}>+</span> CREATE
              </button>
              {geofences.length > 0 ? (
                <span className="tag" style={{ background: 'var(--success-light)', color: 'var(--success)', fontSize: '10px', padding: '2px 8px' }}>{geofences.length} ACTIVE</span>
              ) : (
                <span className="tag" style={{ background: 'var(--border)', color: 'var(--text-muted)', fontSize: '10px', padding: '2px 8px' }}>INACTIVE</span>
              )}
            </div>
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
                        background: 'var(--bg-sidebar)',
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

                          const result = await Swal.fire({
                            title: 'Are you sure?',
                            text: 'Are you sure you want to delete this Geofence?',
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#d33',
                            cancelButtonColor: '#3085d6',
                            confirmButtonText: 'Yes, proceed!'
                          });
                          if (!result.isConfirmed) {
                            return;
                          }

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
                <span style={{ fontWeight: 700 }}>{device?.createdAt ? new Date(device.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="pane-section" style={{ borderBottom: 'none', paddingBottom: 40 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Route Activity</span>
          <div className="timeline">
            {deviceStatus ? (
              <div className="timeline-item">
                <div
                  className={`timeline-dot ${['running', 'moving'].includes(deviceStatus.status?.toLowerCase()) ? 'active' : ''}`}
                  style={{ borderColor: getStatusColor(deviceStatus.status), background: getStatusColor(deviceStatus.status) }}
                />
                <div>
                  <span style={{ fontSize: 12, color: getStatusColor(deviceStatus.status), fontWeight: 700 }}>
                    {deviceStatus.gps_time ? new Date(deviceStatus.gps_time).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).replace('am', 'AM').replace('pm', 'PM') : 'N/A'} • {deviceStatus.status?.toUpperCase()}
                  </span>
                  <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
                    {['running', 'moving'].includes(deviceStatus.status?.toLowerCase()) ? 'Vehicle is Moving' : (deviceStatus.status?.toLowerCase() === 'idle' ? 'Vehicle is Idle' : (['parking', 'parked'].includes(deviceStatus.status?.toLowerCase()) ? 'Vehicle is Parked' : (deviceStatus.status?.toLowerCase() === 'offline' ? 'Device Offline' : deviceStatus.status)))}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    Speed: {deviceStatus.speed} km/h &bull; Updated {((minutes) => {
                      const d = Math.floor(minutes / 1440);
                      const h = Math.floor((minutes % 1440) / 60);
                      const m = minutes % 60;
                      return `${d > 0 ? d + 'd ' : ''}${h > 0 ? h + 'h ' : ''}${m}m`;
                    })(deviceStatus.minutes_diff)} ago
                  </p>
                </div>
              </div>
            ) : (
              <div className="timeline-item">
                <div className="timeline-dot" />
                <div>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>N/A</span>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginTop: 2 }}>Status Loading...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showGeoModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'var(--bg-main)', padding: '24px', borderRadius: '12px', width: '300px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', color: 'var(--text-main)' }}>Create Geofence</h3>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Geofence Name</label>
              <input
                type="text"
                value={geoNameInput}
                onChange={(e) => setGeoNameInput(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-sidebar)', color: 'var(--text-main)', outline: 'none' }}
                placeholder="E.g. Office, Home"
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setShowGeoModal(false)}
                style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGeofence}
                disabled={geoSaving || !geoNameInput}
                style={{ background: 'var(--primary)', border: 'none', color: 'white', padding: '6px 16px', borderRadius: '6px', cursor: (geoSaving || !geoNameInput) ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 700, opacity: (geoSaving || !geoNameInput) ? 0.7 : 1 }}
              >
                {geoSaving ? 'Saving...' : 'Save Geofence'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import MetricCard from '../components/MetricCard';
import { BASE_URL } from '../utils/network';
import AddVehicleModal from '../components/AddVehicleModal';
import TrackifyLoader from '../components/TrackifyLoader';
import Swal from 'sweetalert2';


function VehicleRow({ v, sno, onDelete, onOpenRefuelLogs, onToggleStatus, isSelected, onToggleSelect }) {
  const [showMenu, setShowMenu] = useState(false);

  const isToday = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const addedToday = isToday(v.createdAt);
  const rowBackground = addedToday ? 'rgba(16, 185, 129, 0.08)' : 'transparent';
  const rowHoverBackground = addedToday ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-main)';

  return (
    <tr
      style={{ transition: 'all 0.2s ease', background: rowBackground }}
      onMouseEnter={(e) => e.currentTarget.style.background = rowHoverBackground}
      onMouseLeave={(e) => e.currentTarget.style.background = rowBackground}
    >
      <td style={{ padding: '16px 8px 16px 16px', width: 40 }}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(v._id)}
          style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--primary)' }}
        />
      </td>
      <td>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>{sno}</span>

      </td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src={v.imgSrc} alt={v.name} className="vehicle-thumbnail" style={{ borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)', marginBottom: 2 }}>
              {v.name}
            </p>
            <span className="vehicle-plate" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.5px' }}>{v.plate}</span>
          </div>
        </div>
      </td>
      <td>
        <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-main)', background: 'var(--bg-main)', padding: '4px 8px', borderRadius: 6 }}>
          {v.imei || 'N/A'}
        </span>
      </td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
          <span className="material-icons" style={{ fontSize: 16 }}>{v.fuelIcon}</span>
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>{v.fuelType}</span>
        </div>
      </td>
      <td>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: !v.imei ? 'var(--warning)' : (v.warrantyDaysLeft > 0 ? 'var(--success)' : 'var(--error)') }}>
            {!v.imei ? 'Device Not Assigned' : (v.warrantyDaysLeft > 0 ? `${v.warrantyDaysLeft} Days` : 'Expired')}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Warranty</span>
        </div>
      </td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
            {v.assignedUser !== 'Unassigned' ? v.assignedUser.charAt(0).toUpperCase() : '?'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>{v.assignedUser}</span>
            {v.assignedUserEmail && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.assignedUserEmail}</span>}
          </div>
        </div>
      </td>

      <td>
        <span
          style={{
            background: `${v.statusColor}15`,
            color: v.statusColor,
            padding: '6px 12px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: `0 0 0 1px ${v.statusColor}15`
          }}
        >
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: v.statusColor,
            display: 'inline-block'
          }} />
          {v.statusText}
        </span>
      </td>
      <td style={{ position: 'relative' }}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            border: 'none',
            background: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 6,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-main)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <span className="material-icons" style={{ fontSize: 20 }}>more_vert</span>
        </button>

        {showMenu && (
          <div
            style={{
              position: 'absolute',
              right: 24,
              top: '80%',
              background: 'var(--bg-sidebar)',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
              borderRadius: 12,
              zIndex: 99,
              padding: '6px',
              minWidth: 160,
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid var(--border)'
            }}
            onMouseLeave={() => setShowMenu(false)}
          >
            <button
              style={{
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: v.imei ? 'pointer' : 'not-allowed',
                fontSize: 13,
                fontWeight: 700,
                color: v.imei ? 'var(--primary)' : 'var(--text-muted)',
                background: 'none',
                border: 'none',
                width: '100%',
                borderRadius: 8,
                textAlign: 'left',
                transition: 'background 0.2s',
                opacity: v.imei ? 1 : 0.5
              }}
              onClick={() => {
                if (v.imei) {
                  setShowMenu(false);
                  window.location.href = `/${v.imei}`;
                }
              }}
              onMouseEnter={(e) => { if (v.imei) e.currentTarget.style.background = 'var(--primary-light)'; }}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span className="material-icons" style={{ fontSize: 16 }}>terminal</span> Command Center
            </button>
            <button
              style={{
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--text-main)',
                background: 'none',
                border: 'none',
                width: '100%',
                borderRadius: 8,
                textAlign: 'left',
                transition: 'background 0.2s'
              }}
              onClick={() => { setShowMenu(false); onOpenRefuelLogs(v); }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-light)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span className="material-icons" style={{ fontSize: 16, color: '#3b82f6' }}>local_gas_station</span> Refuel Logs
            </button>
            <button
              style={{
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 700,
                color: v.statusText === 'Active' ? '#f59e0b' : '#10b981',
                background: 'none',
                border: 'none',
                width: '100%',
                borderRadius: 8,
                textAlign: 'left',
                transition: 'background 0.2s'
              }}
              onClick={() => { setShowMenu(false); onToggleStatus(v._id, v.statusText); }}
              onMouseEnter={(e) => e.currentTarget.style.background = v.statusText === 'Active' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span className="material-icons" style={{ fontSize: 16 }}>{v.statusText === 'Active' ? 'power_settings_new' : 'play_circle_filled'}</span>
              {v.statusText === 'Active' ? 'Deactivate' : 'Activate'}
            </button>



            <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
            <button
              style={{
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--error)',
                background: 'none',
                border: 'none',
                width: '100%',
                borderRadius: 8,
                textAlign: 'left',
                transition: 'background 0.2s'
              }}
              onClick={() => { setShowMenu(false); onDelete(v._id); }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--error-light)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span className="material-icons" style={{ fontSize: 16, color: 'var(--error)' }}>delete_outline</span>Delete Vehicle
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

export default function Vehicles({ user }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [selectedVehicles, setSelectedVehicles] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Telemetry Refuel logs state
  const [selectedVehicleForRefuel, setSelectedVehicleForRefuel] = useState(null);
  const [refuelLogs, setRefuelLogs] = useState([]);
  const [refuelLoading, setRefuelLoading] = useState(false);
  const [isRefuelModalOpen, setIsRefuelModalOpen] = useState(false);
  const [isRecordFormOpen, setIsRecordFormOpen] = useState(false);
  const [refuelFormData, setRefuelFormData] = useState({
    refuelDate: new Date().toISOString().split('T')[0],
    refuelTime: new Date().toTimeString().slice(0, 5),
    totalFuelFilled: 40,
    pricePerLiter: 1.5,
    totalAmount: 60,
    currentOdometer: 12000,
    tankStatus: 1,
    fuelBeforeRefuel: 10
  });

  const fetchRefuelLogs = async (imei) => {
    setRefuelLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/vehicle-refuel/list`);
      if (res.ok) {
        const data = await res.json();
        let rawLogs = [];
        if (Array.isArray(data)) rawLogs = data;
        else if (data && Array.isArray(data.data)) rawLogs = data.data;
        else if (data && Array.isArray(data.result)) rawLogs = data.result;

        const filtered = rawLogs.filter(log => String(log.imei) === String(imei));
        setRefuelLogs(filtered);
      }
    } catch (err) {
      console.error('Error fetching refuel data:', err);
    } finally {
      setRefuelLoading(false);
    }
  };

  const handleOpenRefuelLogs = (v) => {
    setSelectedVehicleForRefuel(v);
    setIsRefuelModalOpen(true);
    setIsRecordFormOpen(false);
    setRefuelFormData({
      refuelDate: new Date().toISOString().split('T')[0],
      refuelTime: new Date().toTimeString().slice(0, 5),
      totalFuelFilled: 40,
      pricePerLiter: 1.5,
      totalAmount: 60,
      currentOdometer: 12000,
      tankStatus: 1,
      fuelBeforeRefuel: 10
    });
    // Trigger loading telemetry logs
    fetchRefuelLogs(v.imei);
  };

  const handleSaveRefuel = async (e) => {
    e.preventDefault();
    if (!selectedVehicleForRefuel?.imei) {
      Swal.fire("This vehicle does not have a linked device IMEI.");
      return;
    }
    setRefuelLoading(true);
    try {
      const payload = {
        imei: selectedVehicleForRefuel.imei,
        refuelDate: refuelFormData.refuelDate,
        refuelTime: refuelFormData.refuelTime,
        totalFuelFilled: Number(refuelFormData.totalFuelFilled),
        pricePerLiter: Number(refuelFormData.pricePerLiter),
        totalAmount: Number(refuelFormData.totalAmount),
        currentOdometer: Number(refuelFormData.currentOdometer),
        tankStatus: Number(refuelFormData.tankStatus),
        fuelBeforeRefuel: Number(refuelFormData.fuelBeforeRefuel)
      };

      const res = await fetch(`${BASE_URL}/api/vehicle-refuel/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        Swal.fire("Refuel log created successfully!");
        setIsRecordFormOpen(false);
        fetchRefuelLogs(selectedVehicleForRefuel.imei);
      } else {
        Swal.fire("Failed to submit refuel log. Please review fields.");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Telemetry connection failed.");
    } finally {
      setRefuelLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = user || JSON.parse(localStorage.getItem('user') || '{}');
    const isUserAdmin = ['superadmin'].includes((savedUser.role || '').toLowerCase());
    const userId = savedUser.id || savedUser._id || localStorage.getItem('userId');

    const fetchVehicles = async () => {
      try {
        const targetUrl = isUserAdmin
          ? `${BASE_URL}/api/vehicle/get-vehicles-list`
          : `${BASE_URL}/api/vehicle/get-vehicles?userId=${userId}`;

        const response = await fetch(targetUrl, {
          method: 'GET',
          headers: { 'accept': '*/*' }
        });
        if (response.ok) {
          const data = await response.json();
          if (data) {
            const list = data.vehicles || data.data || (Array.isArray(data) ? data : []);
            const sortedList = [...list].sort((a, b) => {
              const hasImeiA = !!a.imei;
              const hasImeiB = !!b.imei;
              if (hasImeiA && !hasImeiB) return -1;
              if (!hasImeiA && hasImeiB) return 1;
              const dateA = new Date(a.createdAt || 0).getTime();
              const dateB = new Date(b.createdAt || 0).getTime();
              return dateB - dateA; // Descending order (latest first)
            });
            setVehicles(sortedList);
          }
        }
      } catch (error) {
        console.error("Failed to fetch vehicles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, [user, refreshCount]);

  const [searchTerm, setSearchTerm] = useState('');
  const [modelFilter, setModelFilter] = useState('All');
  const [fuelFilter, setFuelFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Extract unique models & fuel types dynamically from loaded DB results
  const uniqueModels = ['All', ...new Set(vehicles.map(v => v.vehicleMaker).filter(Boolean))];
  const uniqueFuelTypes = ['All', ...new Set(vehicles.map(v => v.fuelType).filter(Boolean))];
  const uniqueStatuses = ['All', 'Active', 'Inactive'];

  // Map API vehicle data into display format
  const displayVehicles = vehicles.length > 0 ? vehicles.map(v => {
    const statusVal = v.status === 1 ? 'Inactive' : 'Active';
    const statusColor = statusVal === 'Active' ? 'var(--success)' : '#f59e0b';
    return {
      _id: v._id,
      imgSrc: `https://ui-avatars.com/api/?name=${v.vehicleMaker}&background=0f172a&color=fff`,
      name: `${v.vehicleMaker} ${v.vehicleModel}`,
      plate: v.vehicleNumber,
      imei: v.imei,
      drvName: v.imei,
      fuelIcon: v.fuelType === 'electric' ? 'electric_bolt' : 'local_gas_station',
      fuelType: v.fuelType,
      healthText: 'GOOD',
      statusColor: statusColor,
      statusText: statusVal,
      assignedUser: v.userId ? (v.userId.name || v.userId.firstName || v.userId.email || 'Unknown User') : 'Unassigned',
      assignedUserEmail: v.userId?.email || '',
      warrantyDaysLeft: v.warrantyDaysLeft || 0,
      createdAt: v.createdAt || null
    };
  }) : [];

  const filteredVehicles = displayVehicles.filter(v => {
    const q = searchTerm.toLowerCase();

    // 1. Search Query Match
    const matchesSearch = (
      v.name?.toLowerCase().includes(q) ||
      v.plate?.toLowerCase().includes(q) ||
      (v.imei && String(v.imei).toLowerCase().includes(q)) ||
      v.assignedUser?.toLowerCase().includes(q) ||
      v.assignedUserEmail?.toLowerCase().includes(q)
    );

    // 2. Model Match
    const matchesModel = modelFilter === 'All' || v.name?.toLowerCase().includes(modelFilter.toLowerCase());

    // 3. Fuel Match
    const matchesFuel = fuelFilter === 'All' || v.fuelType?.toLowerCase() === fuelFilter.toLowerCase();

    // 4. Status Match
    const matchesStatus = statusFilter === 'All' || v.statusText?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesModel && matchesFuel && matchesStatus;
  });

  const totalItems = filteredVehicles.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentVehicles = filteredVehicles.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (pageNo) => {
    if (pageNo >= 1 && pageNo <= totalPages) {
      setCurrentPage(pageNo);
      setSelectedVehicles([]); // Clear selection when page changes
    }
  };

  const toggleSelectAll = () => {
    if (selectedVehicles.length === currentVehicles.length) {
      setSelectedVehicles([]);
    } else {
      setSelectedVehicles(currentVehicles.map(v => v._id));
    }
  };

  const handleBulkExport = async () => {
    const dataToExport = selectedVehicles.length > 0
      ? filteredVehicles.filter(v => selectedVehicles.includes(v._id))
      : filteredVehicles;

    if (dataToExport.length === 0) {
      Swal.fire("No vehicles to export.");
      return;
    }

    const imeis = dataToExport.map(v => v.imei).filter(Boolean);

    if (imeis.length === 0) {
      Swal.fire("No valid IMEIs found to export.");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/vehicle/bulk-vehicle-info-export?export=excel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'accept': '*/*' },
        body: JSON.stringify({ imeis })
      });
      if (!res.ok) throw new Error("Network response was not ok");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Vehicles_Bulk_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download bulk export:", err);
      Swal.fire("Failed to download Excel sheet");
    }
  };

  const handleToggleStatus = async (vehicleId, currentStatusText) => {
    const newStatus = currentStatusText === 'Active' ? 1 : 0;
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Are you sure you want to ${newStatus === 0 ? 'activate' : 'deactivate'} this vehicle?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, proceed!'
    });
    if (!result.isConfirmed) return;
    try {
      const response = await fetch(`${BASE_URL}/api/vehicle/update-status/${vehicleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'accept': '*/*' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setRefreshCount(prev => prev + 1);
      } else {
        Swal.fire("Failed to update status.");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error updating status");
    }
  };

  const handleDelete = async (vehicleId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Are you sure you want to delete this vehicle?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, proceed!'
    });
    if (!result.isConfirmed) return;
    try {
      const response = await fetch(`${BASE_URL}/api/vehicle/vehicle/${vehicleId}`, {
        method: 'DELETE',
        headers: { 'accept': '*/*' }
      });
      if (response.ok) {
        setRefreshCount(prev => prev + 1);
      } else {
        Swal.fire("Failed to delete vehicle. Endpoint might be slightly different.");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error deleting vehicle");
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '60vh' }}>
        <TrackifyLoader size={200} animated={true} message="Loading vehicles..." showPercentage={true} />
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ marginTop: 8 }}>
      {/* Header */}

      {/* Filters & Search */}
      <div className="filter-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20, background: 'var(--bg-sidebar)', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)' }}>
        <div style={{ position: 'relative', flex: '1 1 auto', minWidth: 200, maxWidth: 320 }}>
          <span className="material-icons" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 20 }}>search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by model, plate, IMEI, name, or email..."
            style={{
              width: '100%',
              padding: '10px 16px 10px 40px',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontSize: 13,
              background: 'var(--bg-main)',
              outline: 'none',
              transition: 'all 0.2s ease',
              fontFamily: "'Inter', sans-serif"
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>

          {/* Model Filter */}
          <div className="filter-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="filter-label" style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-muted)' }}>Model</span>
            <select
              className="filter-select"
              value={modelFilter}
              onChange={(e) => { setModelFilter(e.target.value); setCurrentPage(1); }}
              style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 13, minWidth: 120, outline: 'none' }}
            >
              {uniqueModels.map(model => (
                <option key={model} value={model}>{model === 'All' ? 'All Models' : model}</option>
              ))}
            </select>
          </div>

          {/* Fuel Type Filter */}
          <div className="filter-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="filter-label" style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-muted)' }}>Fuel Type</span>
            <select
              className="filter-select"
              value={fuelFilter}
              onChange={(e) => { setFuelFilter(e.target.value); setCurrentPage(1); }}
              style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 13, minWidth: 120, outline: 'none' }}
            >
              {uniqueFuelTypes.map(fuel => (
                <option key={fuel} value={fuel}>{fuel === 'All' ? 'All Fuel Types' : fuel.charAt(0).toUpperCase() + fuel.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="filter-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="filter-label" style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-muted)' }}>Status</span>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 13, minWidth: 120, outline: 'none' }}
            >
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status === 'All' ? 'All Statuses' : status}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleBulkExport}
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
            onMouseLeave={e => e.currentTarget.style.opacity = 1}
          >
            <span className="material-icons" style={{ fontSize: 18 }}>download</span>
            Export CSV
          </button>

        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, marginBottom: 24, overflowX: 'auto' }}>
        <table className="vehicle-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              <th style={{ padding: '16px 8px 16px 16px', width: 40 }}>
                <input
                  type="checkbox"
                  checked={currentVehicles.length > 0 && selectedVehicles.length === currentVehicles.length}
                  onChange={toggleSelectAll}
                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
              </th>
              <th>S.No</th>
              <th>Vehicle Details</th>
              <th>IMEI</th>
              <th>Fuel Type</th>
              <th>Warranty</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentVehicles.length > 0 ? (
              currentVehicles.map((v, idx) => (
                <VehicleRow
                  key={v._id || v.plate}
                  v={v}
                  sno={startIndex + idx + 1}
                  onDelete={handleDelete}
                  onOpenRefuelLogs={handleOpenRefuelLogs}
                  onToggleStatus={handleToggleStatus}
                  isSelected={selectedVehicles.includes(v._id)}
                  onToggleSelect={(id) => setSelectedVehicles(prev => prev.includes(id) ? prev.filter(vid => vid !== id) : [...prev, id])}
                />
              ))
            ) : (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '24px' }}>No vehicles found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, padding: '0 8px' }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
          Showing <strong>{totalItems > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + itemsPerPage, totalItems)}</strong> of {totalItems} vehicles
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="pagination-btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} style={{ opacity: currentPage === 1 ? 0.5 : 1, border: 'none', background: 'var(--bg-main)', borderRadius: '4px', cursor: 'pointer', padding: '4px' }}>
            <span className="material-icons" style={{ fontSize: 16 }}>chevron_left</span>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2)).map(page => (
            <button
              key={page}
              className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
              style={{ border: 'none', background: currentPage === page ? 'var(--primary)' : 'var(--bg-main)', color: currentPage === page ? 'white' : 'var(--text-main)', borderRadius: '4px', cursor: 'pointer', padding: '4px 10px', fontSize: 13, fontWeight: 700 }}
            >
              {page}
            </button>
          ))}

          <button className="pagination-btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} style={{ opacity: currentPage === totalPages ? 0.5 : 1, border: 'none', background: 'var(--bg-main)', borderRadius: '4px', cursor: 'pointer', padding: '4px' }}>
            <span className="material-icons" style={{ fontSize: 16 }}>chevron_right</span>
          </button>
        </div>
      </div>


      {/* Dynamic Telemetry Refuel Logs Overlay */}
      {isRefuelModalOpen && selectedVehicleForRefuel && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20
          }}
        >
          <div
            style={{
              background: 'var(--bg-sidebar)',
              borderRadius: 16,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              width: '100%',
              maxWidth: 700,
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-main)',
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16
              }}
            >
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
                  Fuel Telemetry Logs
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  IMEI: <strong>{selectedVehicleForRefuel.imei || 'N/A'}</strong> • Plate: {selectedVehicleForRefuel.plate}
                </p>
              </div>
              <button
                onClick={() => setIsRefuelModalOpen(false)}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 4,
                  borderRadius: '50%'
                }}
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', flex: 1 }}>
              {/* Telemetry STATS Cards inside modal */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 12,
                  marginBottom: 24
                }}
              >
                <div style={{ padding: 12, borderRadius: 8, background: 'var(--primary-light)', border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase' }}>Logs Recorded</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--primary)', marginTop: 4 }}>{refuelLogs.length}</div>
                </div>
                <div style={{ padding: 12, borderRadius: 8, background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                  <div style={{ fontSize: 10, color: 'var(--success)', fontWeight: 800, textTransform: 'uppercase' }}>Total Refueled</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--success)', marginTop: 4 }}>
                    {refuelLogs.reduce((acc, log) => acc + (Number(log.totalFuelFilled) || Number(log.fuelQuantity) || 0), 0).toFixed(1)} L
                  </div>
                </div>
                <div style={{ padding: 12, borderRadius: 8, background: '#fef3c7', border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: 10, color: 'var(--warning)', fontWeight: 800, textTransform: 'uppercase' }}>Total Spend</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--warning)', marginTop: 4 }}>
                    ${refuelLogs.reduce((acc, log) => acc + (Number(log.totalAmount) || Number(log.totalCost) || 0), 0).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Record a Refuel switch option */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontWeight: 800, color: '#334155', fontSize: 14 }}>Refuel Telemetry History</span>
                <button
                  onClick={() => setIsRecordFormOpen(!isRecordFormOpen)}
                  style={{
                    background: isRecordFormOpen ? '#f1f5f9' : 'var(--primary)',
                    color: isRecordFormOpen ? 'var(--text-main)' : 'white',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <span className="material-icons" style={{ fontSize: 14 }}>{isRecordFormOpen ? 'remove' : 'add'}</span>
                  {isRecordFormOpen ? 'Cancel Form' : 'Record Refuel'}
                </button>
              </div>

              {/* Record Refuel Form Block */}
              {isRecordFormOpen && (
                <form
                  onSubmit={handleSaveRefuel}
                  style={{
                    background: 'var(--bg-main)',
                    padding: 16,
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    marginBottom: 20,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 12
                  }}
                >
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Date</label>
                    <input
                      type="date"
                      required
                      value={refuelFormData.refuelDate}
                      onChange={(e) => setRefuelFormData(prev => ({ ...prev, refuelDate: e.target.value }))}
                      style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Time</label>
                    <input
                      type="time"
                      required
                      value={refuelFormData.refuelTime}
                      onChange={(e) => setRefuelFormData(prev => ({ ...prev, refuelTime: e.target.value }))}
                      style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Liters Refueled (L)</label>
                    <input
                      type="number"
                      required
                      step="any"
                      value={refuelFormData.totalFuelFilled}
                      onChange={(e) => setRefuelFormData(prev => {
                        const qty = Number(e.target.value);
                        return { ...prev, totalFuelFilled: qty, totalAmount: Number((qty * prev.pricePerLiter).toFixed(2)) };
                      })}
                      style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Price per Liter ($)</label>
                    <input
                      type="number"
                      required
                      step="any"
                      value={refuelFormData.pricePerLiter}
                      onChange={(e) => setRefuelFormData(prev => {
                        const price = Number(e.target.value);
                        return { ...prev, pricePerLiter: price, totalAmount: Number((prev.totalFuelFilled * price).toFixed(2)) };
                      })}
                      style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Total Amount ($)</label>
                    <input
                      type="number"
                      required
                      step="any"
                      value={refuelFormData.totalAmount}
                      onChange={(e) => setRefuelFormData(prev => ({ ...prev, totalAmount: Number(e.target.value) }))}
                      style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Current Odometer (km)</label>
                    <input
                      type="number"
                      required
                      step="any"
                      value={refuelFormData.currentOdometer}
                      onChange={(e) => setRefuelFormData(prev => ({ ...prev, currentOdometer: Number(e.target.value) }))}
                      style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13, outline: 'none' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Tank Status</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => setRefuelFormData(prev => ({ ...prev, tankStatus: 1 }))}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: 8,
                          border: refuelFormData.tankStatus === 1 ? '2px solid #059669' : '1px solid #cbd5e1',
                          background: refuelFormData.tankStatus === 1 ? '#ecfdf5' : 'white',
                          color: refuelFormData.tankStatus === 1 ? '#047857' : 'var(--text-muted)',
                          fontWeight: 800,
                          fontSize: 12,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span className="material-icons" style={{ fontSize: 16 }}>local_gas_station</span>
                        Full Tank
                      </button>
                      <button
                        type="button"
                        onClick={() => setRefuelFormData(prev => ({ ...prev, tankStatus: 2 }))}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: 8,
                          border: refuelFormData.tankStatus === 2 ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          background: refuelFormData.tankStatus === 2 ? 'var(--primary-light)' : 'white',
                          color: refuelFormData.tankStatus === 2 ? 'var(--primary)' : 'var(--text-muted)',
                          fontWeight: 800,
                          fontSize: 12,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span className="material-icons" style={{ fontSize: 16 }}>ev_station</span>
                        Partial Tank
                      </button>
                    </div>
                  </div>
                  {Number(refuelFormData.tankStatus) === 2 && (
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Fuel Level Before Refuel (Litres) *</label>
                      <input
                        type="number"
                        required
                        step="any"
                        value={refuelFormData.fuelBeforeRefuel}
                        onChange={(e) => setRefuelFormData(prev => ({ ...prev, fuelBeforeRefuel: Number(e.target.value) }))}
                        style={{ width: '100%', padding: 8, border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13, outline: 'none' }}
                        placeholder="Required for partial tank, e.g. 10"
                      />
                    </div>
                  )}
                  <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <button
                      type="submit"
                      disabled={refuelLoading}
                      style={{
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        padding: '8px 16px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {refuelLoading ? 'Submitting telemetry...' : 'Submit Log Entry'}
                    </button>
                  </div>
                </form>
              )}

              {/* Refuel Logs Historical Output Table */}
              {refuelLoading && refuelLogs.length === 0 ? (
                <div style={{ padding: '24px 0', textTransform: 'uppercase', textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', fontWeight: 800 }}>
                  Syncing logs with vehicle profile...
                </div>
              ) : refuelLogs.length > 0 ? (
                <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid #e2e8f0', color: 'var(--text-muted)', fontWeight: 800, textAlign: 'left' }}>
                        <th style={{ padding: '10px 12px' }}>Timestamp</th>
                        <th style={{ padding: '10px 12px' }}>Fuel Added</th>
                        <th style={{ padding: '10px 12px' }}>Price / Litre</th>
                        <th style={{ padding: '10px 12px' }}>Total Spend</th>
                        <th style={{ padding: '10px 12px' }}>Odometer</th>
                        <th style={{ padding: '10px 12px' }}>Tank Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {refuelLogs.map((log) => (
                        <tr key={log._id || log.createdAt} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                            {log.refuelDate} • <span style={{ color: 'var(--text-muted)' }}>{log.refuelTime}</span>
                          </td>
                          <td style={{ padding: '10px 12px', fontWeight: 700, color: '#059669' }}>
                            +{log.totalFuelFilled || log.fuelQuantity || 0} L
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            ${log.pricePerLiter || log.fuelPricePerLiter || 0}
                          </td>
                          <td style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--text-main)' }}>
                            ${log.totalAmount || log.totalCost || 0}
                          </td>
                          <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                            {log.currentOdometer || log.fuelBeforeRefuel || 0} km
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{
                              background: Number(log.tankStatus) === 2 ? 'var(--primary-light)' : '#ecfdf5',
                              color: Number(log.tankStatus) === 2 ? '#1d4ed8' : '#047857',
                              padding: '2px 8px',
                              borderRadius: 12,
                              fontSize: 10,
                              fontWeight: 700
                            }}>
                              {Number(log.tankStatus) === 2 ? 'Partial Tank' : 'Full Tank'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '30px 0', textAlign: 'center', border: '2px dashed #e2e8f0', borderRadius: 12, color: 'var(--text-muted)' }}>
                  <span className="material-icons" style={{ fontSize: 32, marginBottom: 8, color: '#cbd5e1' }}>local_gas_station</span>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>No Refuel Logs Registered</div>
                  <div style={{ fontSize: 11, marginTop: 4 }}>Add your first log by clicking "Record Refuel" above.</div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'flex-end',
                background: 'var(--bg-main)',
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16
              }}
            >
              <button
                onClick={() => setIsRefuelModalOpen(false)}
                style={{
                  background: 'var(--bg-sidebar)',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  padding: '8px 16px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <AddVehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
        onVehicleAdded={() => setRefreshCount(prev => prev + 1)}
      />
    </div>
  );
}

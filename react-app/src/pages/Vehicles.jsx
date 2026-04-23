import React, { useState, useEffect } from 'react';
import MetricCard from '../components/MetricCard';
import { BASE_URL } from '../utils/network';
import AddVehicleModal from '../components/AddVehicleModal';


function VehicleRow({ v, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src={v.imgSrc} alt={v.name} className="vehicle-thumbnail" />
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)', marginBottom: 2 }}>
              {v.name}
            </p>
            <span className="vehicle-plate">{v.plate}</span>
          </div>
        </div>
      </td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#e2e8f0',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            {v.drvInitials}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
            {v.drvName}
          </span>
        </div>
      </td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
          <span className="material-icons" style={{ fontSize: 16 }}>{v.fuelIcon}</span>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{v.fuelType}</span>
        </div>
      </td>
      <td>
        <div style={{ width: 140 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)' }}>{v.healthPct}%</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {v.healthText}
            </span>
          </div>
          <div className="progress-track" style={{ marginTop: 0 }}>
            <div className="progress-fill" style={{ width: `${v.healthPct}%`, background: v.statusColor }} />
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
            gap: 4,
          }}
        >
          {v.statusText.includes('Alert') ? (
            <span className="material-icons" style={{ fontSize: 12 }}>error</span>
          ) : (
            '•'
          )}{' '}
          {v.statusText}
        </span>
      </td>
      <td style={{ position: 'relative' }}>
        <span
          className="material-icons"
          style={{ color: 'var(--text-muted)', cursor: 'pointer' }}
          onClick={() => setShowMenu(!showMenu)}
        >
          more_vert
        </span>

        {showMenu && (
          <div
            style={{
              position: 'absolute',
              right: 40,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              borderRadius: 8,
              zIndex: 10,
              padding: '8px 0',
              minWidth: 120,
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid var(--border)'
            }}
            onMouseLeave={() => setShowMenu(false)}
          >
            <div
              style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}
              onClick={() => { setShowMenu(false); }}
              onMouseEnter={(e) => e.target.style.background = '#f1f5f9'}
              onMouseLeave={(e) => e.target.style.background = 'white'}
            >
              <span className="material-icons" style={{ fontSize: 16 }}>edit</span> Edit
            </div>
            <div
              style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#ef4444' }}
              onClick={() => { setShowMenu(false); onDelete(v._id); }}
              onMouseEnter={(e) => e.target.style.background = '#f1f5f9'}
              onMouseLeave={(e) => e.target.style.background = 'white'}
            >
              <span className="material-icons" style={{ fontSize: 16 }}>delete</span> Delete
            </div>
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const userId = user?.id || user?._id || localStorage.getItem('userId');
    const fetchVehicles = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/vehicle/get-vehicles?userId=${userId}`, {
          method: 'GET',
          headers: { 'accept': '*/*' }
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.vehicles) {
            setVehicles(data.vehicles);
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

  // Map API vehicle data into display format
  const displayVehicles = vehicles.length > 0 ? vehicles.map(v => ({
    _id: v._id,
    imgSrc: `https://ui-avatars.com/api/?name=${v.vehicleMaker}&background=0f172a&color=fff`,
    name: `${v.vehicleMaker} ${v.vehicleModel}`,
    plate: v.vehicleNumber,
    drvInitials: '--',
    drvName: 'Unassigned',
    fuelIcon: v.fuelType === 'electric' ? 'electric_bolt' : 'local_gas_station',
    fuelType: v.fuelType,
    healthPct: 100,
    healthText: 'GOOD',
    statusColor: '#10b981',
    statusText: 'Active',
  })) : [];

  const totalItems = displayVehicles.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentVehicles = displayVehicles.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (pageNo) => {
    if (pageNo >= 1 && pageNo <= totalPages) {
      setCurrentPage(pageNo);
    }
  };

  const handleDelete = async (vehicleId) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      const response = await fetch(`${BASE_URL}/api/vehicle/${vehicleId}`, {
        method: 'DELETE',
        headers: { 'accept': '*/*' }
      });
      if (response.ok) {
        setRefreshCount(prev => prev + 1);
      } else {
        alert("Failed to delete vehicle. Endpoint might be slightly different.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting vehicle");
    }
  };

  return (
    <div className="fade-in">
      {/* Header */}
    <div className="page-header">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Vehicle Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Manage and monitor your {vehicles.length} active fleet assets
          </p>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <button
            style={{
              background: '#f1f5f9',
              border: 'none',
              color: 'var(--text-main)',
              fontWeight: 700,
              padding: '12px 20px',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <span className="material-icons" style={{ fontSize: 18 }}>tune</span> Advanced Filters
          </button>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-icons" style={{ fontSize: 18 }}>add</span> Add Vehicle
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        {['Vehicle Model', 'Fleet Group', 'Fuel Type', 'Status'].map((label) => (
          <div className="filter-group" key={label}>
            <span className="filter-label">{label}</span>
            <select className="filter-select">
              <option>All {label.split(' ').pop()}s</option>
            </select>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, marginBottom: 24 }}>
        <table className="vehicle-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              <th>Vehicle Details</th>
              <th>Driver</th>
              <th>Fuel Type</th>
              <th>Health Score</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>Loading vehicles...</td></tr>
            ) : currentVehicles.length > 0 ? (
              currentVehicles.map((v) => (
                <VehicleRow key={v._id || v.plate} v={v} onDelete={handleDelete} />
              ))
            ) : (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>No vehicles found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
          Showing <strong>{totalItems > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + itemsPerPage, totalItems)}</strong> of {totalItems} vehicles
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="pagination-btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} style={{ opacity: currentPage === 1 ? 0.5 : 1 }}>
            <span className="material-icons" style={{ fontSize: 16 }}>chevron_left</span>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}

          <button className="pagination-btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}>
            <span className="material-icons" style={{ fontSize: 16 }}>chevron_right</span>
          </button>
        </div>
      </div>

      {/* Bottom Metrics */}
      <div className="metric-grid">
        <MetricCard label="Avg Fuel Efficiency" value="14.2 MPG" trend="+12.4%" colorClass="blue" icon="speed" />
        <MetricCard label="Routine Maintenance" value="12 Units" trend="3 Overdue" colorClass="orange" icon="build" />
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #2463eb 0%, #1d4ed8 100%)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              background: 'rgba(255,255,255,0.2)',
              padding: '4px 8px',
              borderRadius: 4,
              alignSelf: 'flex-start',
            }}
          >
            Smart Dispatch Insight
          </span>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 16, lineHeight: 1.4 }}>
            3 vehicles can be re-routed to save 12% in fuel.
          </h3>
        </div>
      </div>
      <AddVehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
        onVehicleAdded={() => setRefreshCount(prev => prev + 1)}
      />
    </div>
  );
}

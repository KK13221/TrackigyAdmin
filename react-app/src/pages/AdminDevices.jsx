import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/network';
import MetricCard from '../components/MetricCard';

export default function AdminDevices({ user }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deviceCount, setDeviceCount] = useState({ total: 0, active: 0, inactive: 0 });
  const [countLoading, setCountLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Add Device Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addCount, setAddCount] = useState(1);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  // Edit Device Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editDevice, setEditDevice] = useState(null);
  const [editSimNumber, setEditSimNumber] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchAdminDevices = async () => {
    const userId = user?.id || user?._id || localStorage.getItem('userId');
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/inventory/admin-devices/${userId}`);
      if (response.ok) {
        const result = await response.json();
        if (result && result.success && Array.isArray(result.data)) {
          setDevices(result.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch admin devices:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeviceCount = async () => {
    try {
      const userId = user?.id || user?._id || localStorage.getItem('userId');
      let url = `${BASE_URL}/api/inventory/admin-device-count`;
      if (userId) {
        url += `?userId=${userId}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.data) {
        setDeviceCount(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch device count', err);
    } finally {
      setCountLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminDevices();
    fetchDeviceCount();

    // Fetch vendors for the Add Devices modal
    const fetchVendors = async () => {
      const userId = user?.id || user?._id || localStorage.getItem('userId');
      if (!userId) return;

      try {
        const res = await fetch(`${BASE_URL}/api/vendor/admin/${userId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setVendors(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch vendors", err);
      }
    };
    fetchVendors();
  }, [user]);

  // Apply Filters
  const filteredDevices = devices.filter(item => {
    const matchesSearch = item.imei?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.simNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === 'Assigned') matchesStatus = item.status === 1;
    if (statusFilter === 'Unassigned') matchesStatus = item.status === 0;

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    // Optional: Sort unassigned to top like Inventory, or just leave it
    if (a.status !== b.status) return a.status - b.status;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  const totalItems = filteredDevices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredDevices.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (pageNo) => {
    if (pageNo >= 1 && pageNo <= totalPages) {
      setCurrentPage(pageNo);
    }
  };

  return (
    <div className="fade-in" style={{ padding: '0 4px', minHeight: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '28px', marginTop: '8px' }}>
        <MetricCard
          label="Total Devices"
          value={countLoading ? '—' : deviceCount.total}
          colorClass="blue"
          icon="devices"
        />
        <MetricCard
          label="Assigned Devices"
          value={countLoading ? '—' : deviceCount.active}
          colorClass="green"
          icon="check_circle"
        />
        <MetricCard
          label="Available Devices"
          value={countLoading ? '—' : deviceCount.inactive}
          colorClass="orange"
          icon="pending"
        />
        <MetricCard
          label={deviceCount.inactive < 20 ? "Out of Stock Devices" : "In Stock Devices"}
          value={countLoading ? '—' : deviceCount.inactive}
          colorClass={deviceCount.inactive < 20 ? "red" : "purple"}
          icon={deviceCount.inactive < 20 ? "warning" : "storefront"}
        />
      </div>

      {/* Header Panel */}
      <div style={{ marginTop: 0, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>

        {/* Filter Bar */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flex: 1 }}>
          <div style={{ position: 'relative', width: 320 }}>
            <span className="material-icons" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 20 }}>search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search by IMEI or SIM..."
              style={{ width: '100%', padding: '10px 16px 10px 40px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, background: 'var(--bg-main)', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', cursor: 'pointer' }}
            >
              <option value="All">All Devices</option>
              <option value="Assigned">Assigned</option>
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => {
            setAddError('');
            setAddSuccess('');
            setAddCount(1);
            setSelectedVendor('');
            setIsAddModalOpen(true);
          }}
          style={{
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(36, 99, 235, 0.2)',
            transition: 'all 0.2s'
          }}
        >
          <span className="material-icons" style={{ fontSize: '18px' }}>add</span>
          Add Devices
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, marginBottom: 24, overflowX: 'auto' }}>
        <table className="vehicle-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              <th style={{ width: 56 }}>S.N</th>
              <th>IMEI</th>
              <th>SIM Number</th>
              <th>Assigned Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>Loading devices...</td></tr>
            ) : currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <tr key={item._id} className="row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 700 }}>
                    {startIndex + index + 1}
                  </td>
                  <td>
                    <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-main)', background: 'var(--bg-sidebar)', padding: '4px 8px', borderRadius: 6 }}>
                      {item.imei}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 600, color: item.simNumber ? 'var(--text-main)' : 'var(--text-muted)' }}>
                      {item.simNumber || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 12,
                      background: item.status === 1 ? 'var(--success-light)' : 'var(--bg-sidebar)',
                      color: item.status === 1 ? 'var(--success)' : 'var(--text-main)',
                      border: `1px solid ${item.status === 1 ? 'var(--success)' : 'var(--border)'}`
                    }}>
                      {item.status === 1 ? 'Assigned' : 'Unassigned'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        setEditDevice(item);
                        setEditSimNumber(item.simNumber || '');
                        setEditError('');
                        setEditSuccess('');
                        setIsEditModalOpen(true);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        padding: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '6px',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-main)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      title="Edit Device"
                    >
                      <span className="material-icons" style={{ fontSize: '18px' }}>edit</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>No devices assigned to your account</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
            Showing <strong>{startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)}</strong> of {totalItems} devices
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
                style={{ border: 'none', background: currentPage === page ? 'var(--primary)' : 'var(--bg-main)', color: currentPage === page ? 'white' : 'inherit', borderRadius: '4px', cursor: 'pointer', padding: '4px 10px', fontSize: 13, fontWeight: 700 }}
              >
                {page}
              </button>
            ))}

            <button className="pagination-btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} style={{ opacity: currentPage === totalPages ? 0.5 : 1, border: 'none', background: 'var(--bg-main)', borderRadius: '4px', cursor: 'pointer', padding: '4px' }}>
              <span className="material-icons" style={{ fontSize: 16 }}>chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Devices Modal */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--bg-sidebar)', borderRadius: '20px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ padding: '24px 30px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Assign to Vendor</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0 0' }}>Assign bulk devices to a vendor.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'var(--bg-main)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <span className="material-icons" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            <div style={{ padding: '30px' }}>
              {addSuccess && (
                <div style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-icons" style={{ fontSize: '18px' }}>check_circle</span>
                  {addSuccess}
                </div>
              )}
              {addError && (
                <div style={{ background: 'var(--error-light)', color: 'var(--error)', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-icons" style={{ fontSize: '18px' }}>error</span>
                  {addError}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Select Vendor</label>
                  <select
                    value={selectedVendor}
                    onChange={(e) => setSelectedVendor(e.target.value)}
                    style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-main)' }}
                  >
                    <option value="">-- Choose a vendor --</option>
                    {vendors.map(v => (
                      <option key={v._id} value={v._id}>{v.name} ({v.email})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Number of Devices</label>
                  <input
                    type="number"
                    min="1"
                    value={addCount}
                    onChange={(e) => setAddCount(e.target.value)}
                    style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-main)' }}
                  />
                </div>

                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'var(--bg-sidebar)', color: 'var(--text-main)', border: '1px solid var(--border)', padding: '12px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button
                    disabled={addLoading}
                    onClick={async () => {
                      if (!selectedVendor) {
                        setAddError('Please select a vendor first.');
                        return;
                      }
                      setAddLoading(true);
                      setAddError('');
                      setAddSuccess('');
                      try {
                        const response = await fetch(`${BASE_URL}/api/inventory/assign-vendor-bulk`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ vendorId: selectedVendor, count: Number(addCount) })
                        });
                        const data = await response.json();
                        if (data.success) {
                          setAddSuccess(`Successfully assigned ${data.assignedCount} devices to vendor!`);
                          setAddCount(1);
                          setSelectedVendor('');
                          fetchAdminDevices(); // Optional: you can fetch this if needed, or maybe it doesn't change admin devices
                        } else {
                          setAddError(data.message || 'Failed to assign devices.');
                        }
                      } catch (err) {
                        setAddError(err.message || 'Error occurred.');
                      } finally {
                        setAddLoading(false);
                      }
                    }}
                    style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: addLoading ? 'not-allowed' : 'pointer', opacity: addLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(36, 99, 235, 0.2)' }}
                  >
                    {addLoading ? 'Assigning...' : 'Assign Devices'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Device Modal */}
      {isEditModalOpen && editDevice && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--bg-sidebar)', borderRadius: '20px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ padding: '24px 30px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Edit Device</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0 0' }}>Update device details (IMEI: {editDevice.imei})</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'var(--bg-main)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <span className="material-icons" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            <div style={{ padding: '30px' }}>
              {editSuccess && (
                <div style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-icons" style={{ fontSize: '18px' }}>check_circle</span>
                  {editSuccess}
                </div>
              )}
              {editError && (
                <div style={{ background: 'var(--error-light)', color: 'var(--error)', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-icons" style={{ fontSize: '18px' }}>error</span>
                  {editError}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>SIM Number</label>
                  <input
                    type="text"
                    maxLength="10"
                    placeholder="Enter 10-digit SIM Number"
                    value={editSimNumber}
                    onChange={(e) => setEditSimNumber(e.target.value.replace(/\D/g, ''))}
                    style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-main)' }}
                  />
                </div>

                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'var(--bg-sidebar)', color: 'var(--text-main)', border: '1px solid var(--border)', padding: '12px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button
                    disabled={editLoading}
                    onClick={async () => {
                      if (!editSimNumber) {
                        setEditError('Please enter a SIM Number.');
                        return;
                      }
                      if (editSimNumber.length !== 10) {
                        setEditError('SIM Number must be exactly 10 digits.');
                        return;
                      }
                      setEditLoading(true);
                      setEditError('');
                      setEditSuccess('');
                      try {
                        const userId = user?.id || user?._id || localStorage.getItem('userId');
                        const response = await fetch(`${BASE_URL}/api/device/add-sim`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ userId, imei: editDevice.imei, simNumber: editSimNumber })
                        });
                        const data = await response.json();
                        if (data.success || response.ok) {
                          setEditSuccess('Successfully updated SIM number!');
                          fetchAdminDevices();
                          setTimeout(() => setIsEditModalOpen(false), 2000);
                        } else {
                          setEditError(data.message || 'Failed to update SIM number.');
                        }
                      } catch (err) {
                        setEditError(err.message || 'Error occurred.');
                      } finally {
                        setEditLoading(false);
                      }
                    }}
                    style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: editLoading ? 'not-allowed' : 'pointer', opacity: editLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(36, 99, 235, 0.2)' }}
                  >
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

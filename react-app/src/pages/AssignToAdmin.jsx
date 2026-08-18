import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/network';
import MetricCard from '../components/MetricCard';
import Swal from 'sweetalert2';

export default function AssignToAdmin({ user }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Admin Pagination
  const [adminCurrentPage, setAdminCurrentPage] = useState(1);
  const adminsPerPage = 10;

  // Assign Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [userList, setUserList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [vendorList, setVendorList] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [assignForm, setAssignForm] = useState({ adminId: '', count: 10, model_no: '' });
  const [assigning, setAssigning] = useState(false);
  const [inventoryStats, setInventoryStats] = useState(null);

  const [viewMode, setViewMode] = useState('admins'); // 'admins' | 'devices' | 'vendors' | 'vendor-devices'
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorDevices, setVendorDevices] = useState([]);
  const [loadingVendorDevices, setLoadingVendorDevices] = useState(false);

  const handleViewVendorDevices = async (vendor) => {
    setSelectedVendor(vendor);
    setViewMode('vendor-devices');
    setLoadingVendorDevices(true);
    try {
      const res = await fetch(`${BASE_URL}/api/vendor/${vendor._id}/devices`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setVendorDevices(json.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVendorDevices(false);
    }
  };

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/inventory/list`);
        if (response.ok) {
          const result = await response.json();
          if (result && result.success && Array.isArray(result.data)) {
            setInventory(result.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch inventory:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/inventory/inventory-count`);
        if (response.ok) {
          const result = await response.json();
          if (result && result.success) {
            setInventoryStats(result.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch inventory stats:", error);
      }
    };

    fetchInventory();
    fetchStats();
    fetchUsers();
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoadingVendors(true);
    try {
      const res = await fetch(`${BASE_URL}/api/vendor/list`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setVendorList(json.data);
        }
      }
    } catch (err) {
      console.error("Error fetching vendors:", err);
    } finally {
      setLoadingVendors(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`${BASE_URL}/user/admin-list`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setUserList(json.data);
        }
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleOpenAssignModal = () => {
    setShowAssignModal(true);
    if (userList.length === 0) fetchUsers();
  };

  const handleAssignBulk = async (e) => {
    e.preventDefault();
    if (!assignForm.adminId || !assignForm.count) return;

    setAssigning(true);
    try {
      const res = await fetch(`${BASE_URL}/api/inventory/assign-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminId: assignForm.adminId,
          count: Number(assignForm.count),
          ...(assignForm.model_no ? { model_no: assignForm.model_no } : {})
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        Swal.fire(`Successfully assigned ${data.data?.assignedCount || assignForm.count} devices!`);
        setShowAssignModal(false);
        // Refresh inventory
        setLoading(true);
        const response = await fetch(`${BASE_URL}/api/inventory/list`);
        if (response.ok) {
          const result = await response.json();
          if (result && result.success && Array.isArray(result.data)) {
            setInventory(result.data);
          }
        }
        setLoading(false);
      } else {
        Swal.fire(`Failed to assign: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Error assigning devices:", err);
      Swal.fire('Error connecting to assignment service.');
    } finally {
      setAssigning(false);
    }
  };

  const filteredInventory = inventory.filter(item => {
    if (viewMode === 'devices' && selectedAdmin) {
      const isAssignedToSelected = item.assignedTo && (item.assignedTo._id === selectedAdmin._id || item.assignedTo === selectedAdmin._id);
      if (!isAssignedToSelected) return false;
    }

    const matchesStatus =
      statusFilter === 'all' ? true :
        statusFilter === 'assigned' ? item.status === 1 :
          statusFilter === 'unassigned' ? item.status === 0 : true;

    const matchesSearch =
      searchQuery === '' ? true :
        (() => {
          const query = searchQuery.toLowerCase();
          const modelMatch = (item.model_no || '').toLowerCase().includes(query);

          let assignedMatch = false;
          if (item.assignedTo) {
            if (typeof item.assignedTo === 'object') {
              assignedMatch =
                (item.assignedTo.name || '').toLowerCase().includes(query) ||
                (item.assignedTo.email || '').toLowerCase().includes(query) ||
                (item.assignedTo._id || '').toLowerCase().includes(query);
            } else {
              assignedMatch = String(item.assignedTo).toLowerCase().includes(query);
            }
          }
          return modelMatch || assignedMatch;
        })();

    return matchesStatus && matchesSearch;
  });

  const totalItems = filteredInventory.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredInventory.slice(startIndex, startIndex + itemsPerPage);

  const filteredAdmins = userList.filter(u => 
    (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.mobile_number || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAdmins = filteredAdmins.length;
  const activeAdminsCount = filteredAdmins.filter(u => u.inOnline).length;
  const inactiveAdminsCount = filteredAdmins.filter(u => !u.inOnline).length;

  const adminTotalPages = Math.ceil(totalAdmins / adminsPerPage) || 1;
  const adminStartIndex = (adminCurrentPage - 1) * adminsPerPage;
  const currentAdmins = filteredAdmins.slice(adminStartIndex, adminStartIndex + adminsPerPage);

  const adminSpecificDevices = selectedAdmin ? inventory.filter(item => item.assignedTo && (item.assignedTo._id === selectedAdmin._id || item.assignedTo === selectedAdmin._id)) : [];
  const adminTotalDevicesCount = adminSpecificDevices.length;
  const adminAvailableDevicesCount = adminSpecificDevices.filter(item => item.status === 0).length;
  const adminAssignedDevicesCount = adminSpecificDevices.filter(item => item.status === 1).length;

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    if (adminCurrentPage > adminTotalPages && adminTotalPages > 0) {
      setAdminCurrentPage(1);
    }
  }, [adminTotalPages, adminCurrentPage]);

  const handlePageChange = (pageNo) => {
    if (pageNo >= 1 && pageNo <= totalPages) {
      setCurrentPage(pageNo);
    }
  };

  const handleAdminPageChange = (pageNo) => {
    if (pageNo >= 1 && pageNo <= adminTotalPages) {
      setAdminCurrentPage(pageNo);
    }
  };

  return (
    <div className="fade-in" style={{ padding: '0 4px', minHeight: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>

      {/* Admin Stats Cards */}
      {viewMode === 'admins' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px', marginTop: '8px' }}>
          <MetricCard
            label="Total Admins"
            value={totalAdmins}
            colorClass="blue"
            icon="admin_panel_settings"
          />
          <MetricCard
            label="Active"
            value={activeAdminsCount}
            colorClass="green"
            icon="check_circle"
          />
          <MetricCard
            label="Inactive"
            value={inactiveAdminsCount}
            colorClass="orange"
            icon="cancel"
          />
        </div>
      )}

      {/* Inventory Stats Cards */}
      {viewMode === 'devices' && selectedAdmin && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px', marginTop: '8px' }}>
          <MetricCard
            label="Total Device"
            value={adminTotalDevicesCount}
            colorClass="blue"
            icon="inventory_2"
          />
          <MetricCard
            label="Available Devices"
            value={adminAvailableDevicesCount}
            colorClass="orange"
            icon="pending"
          />
          <MetricCard
            label="Out Of Stock Devices"
            value={adminAssignedDevicesCount}
            colorClass="green"
            icon="check_circle"
          />
        </div>
      )}

      {/* Header Panel */}
      <div style={{ marginTop: 8, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        {viewMode === 'devices' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setViewMode('admins')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', color: 'var(--text-main)', fontWeight: 600 }}>
              <span className="material-icons" style={{ fontSize: 18 }}>arrow_back</span>
              Back to User List
            </button>
            <h2 style={{ fontSize: 18, margin: 0, fontWeight: 800 }}>Devices for {selectedAdmin?.name || selectedAdmin?.email}</h2>
          </div>
        ) : viewMode === 'vendors' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setViewMode('admins')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', color: 'var(--text-main)', fontWeight: 600 }}>
              <span className="material-icons" style={{ fontSize: 18 }}>arrow_back</span>
              Back to User List
            </button>
            <h2 style={{ fontSize: 18, margin: 0, fontWeight: 800 }}>Vendors for {selectedAdmin?.name || selectedAdmin?.email}</h2>
          </div>
        ) : viewMode === 'vendor-devices' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setViewMode('vendors')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', color: 'var(--text-main)', fontWeight: 600 }}>
              <span className="material-icons" style={{ fontSize: 18 }}>arrow_back</span>
              Back to Vendor List
            </button>
          </div>
        ) : null}

        {/* Filters and Bulk Assign */}
        {viewMode !== 'vendors' && (
          <>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: 260 }}>
                <span className="material-icons" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 18 }}>search</span>
                <input
                  type="text"
                  placeholder={viewMode === 'admins' ? "Search Admin by Name, Email or Mobile..." : "Search Model No. or Assigned To..."}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                    setAdminCurrentPage(1);
                  }}
                  style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: 13, outline: 'none', transition: 'all 0.2s' }}
                />
              </div>


            </div>

            {viewMode !== 'vendor-devices' && (
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={handleOpenAssignModal}
                  style={{
                    width: 'fit-content',
                    whiteSpace: 'nowrap',
                    padding: '0 16px',
                    height: 36,
                    fontSize: 13,
                    display: 'inline-flex',
                    flex: 'none',
                    alignItems: 'center',
                    gap: 6,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: 'white',
                    fontWeight: 700,
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                    cursor: 'pointer'
                  }}
                >
                  <span className="material-icons" style={{ fontSize: 18 }}>assignment_ind</span>
                  Bulk Assign
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Content */}
      {viewMode === 'admins' ? (
        <>

          <div className="card" style={{ padding: 0, marginBottom: 24, overflowX: 'auto' }}>
            <table className="vehicle-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead>
                <tr style={{ textAlign: 'left' }}>
                  <th>S.No</th>
                  <th>Admin Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Assigned Devices</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>Loading admins...</td></tr>
                ) : currentAdmins.length > 0 ? (
                  currentAdmins.map((admin, idx) => (
                    <tr key={admin._id} style={{ transition: 'all 0.2s ease', background: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-main)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ color: 'var(--text-muted)', fontWeight: 600, width: 60 }}>{adminStartIndex + idx + 1}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{admin.name || 'N/A'}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{admin.email || 'N/A'}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{admin.mobile_number ? `${admin.countryCode || ''} ${admin.mobile_number}`.trim() : 'N/A'}</td>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        <span style={{ padding: '4px 10px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '20px', fontSize: 12, display: 'inline-block' }}>
                          {inventory.filter(item => item.assignedTo && (item.assignedTo._id === admin._id || item.assignedTo === admin._id)).length} Devices
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => { setSelectedAdmin(admin); setViewMode('devices'); setCurrentPage(1); }} className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12, borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <span className="material-icons" style={{ fontSize: 16 }}>visibility</span> View Devices
                          </button>
                          <button onClick={() => { setSelectedAdmin(admin); setViewMode('vendors'); }} className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12, borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--primary-light)', color: 'var(--primary)', border: 'none' }}>
                            <span className="material-icons" style={{ fontSize: 16 }}>group</span> View Vendors
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>No admins found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Admin Pagination */}
          {totalAdmins > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                Showing <strong>{adminStartIndex + 1} - {Math.min(adminStartIndex + adminsPerPage, totalAdmins)}</strong> of {totalAdmins} admins
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="pagination-btn" onClick={() => handleAdminPageChange(adminCurrentPage - 1)} disabled={adminCurrentPage === 1} style={{ opacity: adminCurrentPage === 1 ? 0.5 : 1, border: 'none', background: 'var(--bg-main)', borderRadius: '4px', cursor: 'pointer', padding: '4px' }}>
                  <span className="material-icons" style={{ fontSize: 16 }}>chevron_left</span>
                </button>

                {Array.from({ length: adminTotalPages }, (_, i) => i + 1).slice(Math.max(0, adminCurrentPage - 3), Math.min(adminTotalPages, adminCurrentPage + 2)).map(page => (
                  <button
                    key={page}
                    className={`pagination-btn ${adminCurrentPage === page ? 'active' : ''}`}
                    onClick={() => handleAdminPageChange(page)}
                    style={{ border: 'none', background: adminCurrentPage === page ? 'var(--primary)' : 'var(--bg-main)', color: adminCurrentPage === page ? 'white' : 'var(--text-main)', borderRadius: '4px', cursor: 'pointer', padding: '4px 10px', fontSize: 13, fontWeight: 700 }}
                  >
                    {page}
                  </button>
                ))}

                <button className="pagination-btn" onClick={() => handleAdminPageChange(adminCurrentPage + 1)} disabled={adminCurrentPage === adminTotalPages} style={{ opacity: adminCurrentPage === adminTotalPages ? 0.5 : 1, border: 'none', background: 'var(--bg-main)', borderRadius: '4px', cursor: 'pointer', padding: '4px' }}>
                  <span className="material-icons" style={{ fontSize: 16 }}>chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </>
      ) : viewMode === 'devices' ? (
        <>
          <div className="card" style={{ padding: 0, marginBottom: 24, overflowX: 'auto' }}>
            <table className="vehicle-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead>
                <tr style={{ textAlign: 'left' }}>
                  <th>S.No</th>
                  <th>IMEI</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Created At</th>
                  <th>Updated At</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>Loading inventory...</td></tr>
                ) : currentItems.length > 0 ? (
                  currentItems.map((item, idx) => (
                    <tr key={item._id} style={{ transition: 'all 0.2s ease', background: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-main)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ color: 'var(--text-muted)', fontWeight: 600, width: 60 }}>{startIndex + idx + 1}</td>
                      <td>
                        <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-main)', background: 'var(--bg-main)', padding: '4px 8px', borderRadius: 6 }}>
                          {item.imei}
                        </span>
                      </td>
                      <td>
                        {item.status === 0 ? (
                          <span style={{ background: 'var(--warning-light)', color: 'var(--warning)', padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 0 0 1px var(--warning)' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--warning)', display: 'inline-block' }} /> Unassigned
                          </span>
                        ) : (
                          <span style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 0 0 1px var(--success)' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} /> Assigned
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
                          {item.assignedTo
                            ? (typeof item.assignedTo === 'object'
                              ? (item.assignedTo.name || item.assignedTo.email || item.assignedTo._id)
                              : item.assignedTo)
                            : 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                          {new Date(item.updatedAt).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>No inventory devices found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
              Showing <strong>{totalItems > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + itemsPerPage, totalItems)}</strong> of {totalItems} devices
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
        </>
      ) : viewMode === 'vendor-devices' ? (
        <>
          <div className="card" style={{ padding: 0, marginBottom: 24, overflowX: 'auto' }}>
            <table className="vehicle-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead>
                <tr style={{ textAlign: 'left' }}>
                  <th>S.No</th>
                  <th>IMEI</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {loadingVendorDevices ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>Loading vendor devices...</td></tr>
                ) : vendorDevices.length > 0 ? (
                  vendorDevices.map((item, idx) => (
                    <tr key={item._id} style={{ transition: 'all 0.2s ease', background: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-main)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ color: 'var(--text-muted)', fontWeight: 600, width: 60 }}>{idx + 1}</td>
                      <td>
                        <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-main)', background: 'var(--bg-main)', padding: '4px 8px', borderRadius: 6 }}>
                          {item.imei}
                        </span>
                      </td>
                      <td>
                        {item.status === 0 ? (
                          <span style={{ background: 'var(--warning-light)', color: 'var(--warning)', padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 0 0 1px var(--warning)' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--warning)', display: 'inline-block' }} /> Inactive
                          </span>
                        ) : (
                          <span style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 0 0 1px var(--success)' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} /> Active
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
                          {selectedVendor?.name}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>No devices assigned to this vendor</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : viewMode === 'vendors' ? (
        <>
          <div className="card" style={{ padding: 0, marginBottom: 24, overflowX: 'auto' }}>
            <table className="vehicle-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead>
                <tr style={{ textAlign: 'left' }}>
                  <th>S.No</th>
                  <th>Vendor Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Role</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingVendors ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>Loading vendors...</td></tr>
                ) : vendorList.filter(v => v.adminId === selectedAdmin?._id).length > 0 ? (
                  vendorList.filter(v => v.adminId === selectedAdmin?._id).map((vendor, idx) => (
                    <tr key={vendor._id} style={{ transition: 'all 0.2s ease', background: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-main)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ color: 'var(--text-muted)', fontWeight: 600, width: 60 }}>{idx + 1}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{vendor.name || 'N/A'}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{vendor.email || 'N/A'}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{vendor.mobile_number ? `${vendor.countryCode || ''} ${vendor.mobile_number}`.trim() : 'N/A'}</td>
                      <td style={{ color: 'var(--text-muted)' }}><span style={{ padding: '4px 8px', background: 'var(--bg-main)', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{vendor.role}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{new Date(vendor.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => handleViewVendorDevices(vendor)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12, borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <span className="material-icons" style={{ fontSize: 16 }}>visibility</span> View Devices
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>No vendors assigned to this admin</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      {/* Bulk Assign Modal */}
      {showAssignModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="card" style={{ width: 420, padding: 24, borderRadius: 16, background: 'var(--bg-sidebar)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Bulk Assign Inventory</h3>
              <button onClick={() => setShowAssignModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <span className="material-icons">close</span>
              </button>
            </div>

            <form onSubmit={handleAssignBulk}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Select User/Admin</label>
                {loadingUsers ? (
                  <div style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-muted)', background: 'var(--bg-main)', borderRadius: 8, border: '1px solid var(--border)' }}>Loading users...</div>
                ) : (
                  <select
                    value={assignForm.adminId}
                    onChange={(e) => setAssignForm({ ...assignForm, adminId: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, outline: 'none', background: 'var(--bg-sidebar)', color: 'var(--text-main)' }}
                    required
                  >
                    <option value="">-- Choose User --</option>
                    {userList.map(u => (
                      <option key={u._id} value={u._id}>{u.name} ({u.email || u.mobile_number})</option>
                    ))}
                  </select>
                )}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Model Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. TRK-900"
                  value={assignForm.model_no}
                  onChange={(e) => setAssignForm({ ...assignForm, model_no: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, outline: 'none', background: 'var(--bg-sidebar)', color: 'var(--text-main)' }}
                />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Leave blank to assign any available model.</div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Number of Devices</label>
                <input
                  type="number"
                  min="1"
                  value={assignForm.count}
                  onChange={(e) => setAssignForm({ ...assignForm, count: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, outline: 'none', background: 'var(--bg-sidebar)', color: 'var(--text-main)' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setShowAssignModal(false)} className="btn-secondary" style={{ flex: 1, padding: '12px', borderRadius: 8 }}>Cancel</button>
                <button type="submit" disabled={assigning} className="btn-primary" style={{ flex: 1, padding: '12px', borderRadius: 8, background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 700, cursor: assigning ? 'not-allowed' : 'pointer' }}>
                  {assigning ? 'Assigning...' : 'Assign Devices'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

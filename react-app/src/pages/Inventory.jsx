import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/network';
import MetricCard from '../components/MetricCard';
import Swal from 'sweetalert2';

export default function Inventory({ user }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inventoryStats, setInventoryStats] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);


  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editItemId, setEditItemId] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editModelNo, setEditModelNo] = useState("");

  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) return;
    setDeletingId(selectedIds);
    setPasswordInput('');
    setDeleteError('');
    setDeleteConfirmModal(true);
  };
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      Swal.fire("Please select a file first.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch(`${BASE_URL}/api/inventory/upload-bulk`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        Swal.fire(`Successfully uploaded ${data.data?.length || 0} IMEIs! (Ignored ${data.duplicatesIgnored || 0} duplicates)`);
        setLoading(true);
        const response = await fetch(`${BASE_URL}/api/inventory/list`);
        if (response.ok) {
          const result = await response.json();
          if (result && result.success && Array.isArray(result.data)) {
            const sortedList = [...result.data].sort((a, b) => {
              if (a.status === 1 && b.status !== 1) return -1;
              if (a.status !== 1 && b.status === 1) return 1;
              const dateA = new Date(a.createdAt || 0).getTime();
              const dateB = new Date(b.createdAt || 0).getTime();
              return dateB - dateA;
            });
            setInventory(sortedList);
          }
        }
        setLoading(false);
      } else {
        Swal.fire(`Failed to upload: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      Swal.fire('Error connecting to upload service.');
    } finally {
      setUploading(false);
      setShowUploadModal(false);
      setSelectedFile(null);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this inventory item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, proceed!'
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${BASE_URL}/api/inventory/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setInventory(prev => prev.filter(item => item._id !== id));
      } else {
        Swal.fire(data.message || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error deleting item');
    }
  };




  const fetchInventory = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/inventory/list`);
      if (response.ok) {
        const result = await response.json();
        if (result && result.success && Array.isArray(result.data)) {
          const sortedList = [...result.data].sort((a, b) => {
            if (a.status === 1 && b.status !== 1) return -1;
            if (a.status !== 1 && b.status === 1) return 1;
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          });
          setInventory(sortedList);
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

  useEffect(() => {
    fetchInventory();
    fetchStats();
  }, []);

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setPasswordInput('');
    setDeleteError('');
    setDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async (e) => {
    e.preventDefault();
    if (!passwordInput) {
      setDeleteError("Password is required");
      return;
    }

    setIsVerifying(true);
    setDeleteError('');

    try {
      const email = user?.email;
      if (!email) {
        setDeleteError("User email not found. Please re-login.");
        setIsVerifying(false);
        return;
      }

      const authRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: passwordInput })
      });
      const authJson = await authRes.json();

      if (authJson.status !== "true" && authJson.status !== true) {
        setDeleteError("Incorrect password");
        setIsVerifying(false);
        return;
      }

      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Password verified successfully.\n\nAre you sure you want to permanently delete ${Array.isArray(deletingId) ? 'these devices' : 'this device'}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, proceed!'
      });
      if (!result.isConfirmed) {
        setDeleteConfirmModal(false);
        setIsVerifying(false);
        return;
      }

      let res, json;
      if (Array.isArray(deletingId)) {
        res = await fetch(`${BASE_URL}/api/inventory/bulk-delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: deletingId })
        });
        json = await res.json();
      } else {
        res = await fetch(`${BASE_URL}/api/inventory/${deletingId}`, { method: 'DELETE' });
        json = await res.json();
      }

      if (json.success) {
        setDeleteConfirmModal(false);
        setSelectedIds([]);
        fetchInventory();
        fetchStats();
      } else {
        setDeleteError(json.message);
      }
    } catch (err) {
      console.error(err);
      setDeleteError("Failed to delete");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleEditClick = (item) => {
    setEditItem(item);
    setEditModelNo(item.model_no || "");
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/api/inventory/${editItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_no: editModelNo })
      });
      const json = await res.json();
      if (json.success) {
        setShowEditModal(false);
        fetchInventory();
      } else {
        Swal.fire(json.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesStatus =
      statusFilter === 'all' ? true :
        statusFilter === 'assigned' ? item.status === 1 :
          statusFilter === 'unassigned' ? item.status === 0 : true;

    const matchesSearch =
      searchQuery === '' ? true :
        (() => {
          const query = searchQuery.toLowerCase();
          const imeiMatch = (item.imei || '').toLowerCase().includes(query);
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
          return imeiMatch || modelMatch || assignedMatch;
        })();

    return matchesStatus && matchesSearch;
  }).sort((a, b) => {
    if (a.status !== b.status) {
      return b.status - a.status; // 1 (Assigned) comes before 0 (Unassigned)
    }
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  const totalItems = filteredInventory.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredInventory.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const handlePageChange = (pageNo) => {
    if (pageNo >= 1 && pageNo <= totalPages) {
      setCurrentPage(pageNo);
    }
  };

  return (
    <div className="fade-in" style={{ padding: '0 4px', minHeight: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>

      {/* Header Panel */}
      <div style={{ marginTop: 8, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 260 }}>
            <span className="material-icons" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 18 }}>search</span>
            <input
              type="text"
              placeholder="Search IMEI, Model No. or Assigned To..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: 13, outline: 'none', transition: 'all 0.2s' }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '10px 32px 10px 16px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: 13, outline: 'none', cursor: 'pointer', appearance: 'none', minWidth: 140 }}
            >
              <option value="all">All Status</option>
              <option value="assigned">Assigned</option>
              <option value="unassigned">Unassigned</option>
            </select>
            <span className="material-icons" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 16, pointerEvents: 'none' }}>expand_more</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDeleteClick}
              style={{
                width: 'fit-content',
                padding: '0 16px',
                height: 36,
                fontSize: 13,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                fontWeight: 700,
                border: 'none',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                cursor: 'pointer'
              }}
            >
              <span className="material-icons" style={{ fontSize: 18 }}>delete</span>
              Delete ({selectedIds.length})
            </button>
          )}
          <button
            onClick={() => setShowUploadModal(true)}
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
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              fontWeight: 700,
              border: 'none',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              cursor: 'pointer'
            }}
          >
            <span className="material-icons" style={{ fontSize: 18 }}>upload_file</span>
            Upload Bulk IMEIs
          </button>
        </div>
      </div>

      {/* Inventory Stats Cards */}
      {inventoryStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <MetricCard
            label="Total Devices"
            value={inventoryStats.total}
            colorClass="blue"
            icon="inventory_2"
          />
          <MetricCard
            label="Unavailable / Assigned Devices"
            value={inventoryStats.active}
            colorClass="green"
            icon="check_circle"
          />
          <MetricCard
            label="Available / Unassigned Devices"
            value={inventoryStats.inactive}
            colorClass="orange"
            icon="pending"
          />
          <MetricCard
            label={inventoryStats.inactive < 20 ? "Out of Stock Devices" : "In Stock Devices"}
            value={inventoryStats.inactive}
            colorClass={inventoryStats.inactive < 20 ? "red" : "purple"}
            icon={inventoryStats.inactive < 20 ? "warning" : "storefront"}
          />
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0, marginBottom: 24, overflowX: 'auto' }}>
        <table className="vehicle-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              <th style={{ width: 40, paddingLeft: 16 }}>
                <input
                  type="checkbox"
                  checked={currentItems.length > 0 && currentItems.every(item => selectedIds.includes(item._id))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const newIds = [...selectedIds];
                      currentItems.forEach(item => {
                        if (!newIds.includes(item._id)) newIds.push(item._id);
                      });
                      setSelectedIds(newIds);
                    } else {
                      const currentIds = currentItems.map(item => item._id);
                      setSelectedIds(selectedIds.filter(id => !currentIds.includes(id)));
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                />
              </th>
              <th>S.No</th>
              <th>IMEI</th>
              <th>Model No.</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Created At</th>
              <th>Updated At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '24px' }}>Loading inventory...</td></tr>
            ) : currentItems.length > 0 ? (
              currentItems.map((item, idx) => (
                <tr key={item._id} style={{ transition: 'all 0.2s ease', background: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-main)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ paddingLeft: 16 }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(prev => [...prev, item._id]);
                        } else {
                          setSelectedIds(prev => prev.filter(id => id !== item._id));
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 600, width: 60 }}>{startIndex + idx + 1}</td>
                  <td>
                    <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-main)', background: 'var(--bg-main)', padding: '4px 8px', borderRadius: 6 }}>
                      {item.imei}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
                      {item.model_no || 'N/A'}
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
                      {new Date(item.createdAt).toLocaleString() === new Date(item.updatedAt).toLocaleString() 
                        ? "-" 
                        : new Date(item.updatedAt).toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button onClick={() => handleEditClick(item)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer' }} title="Edit"><span className="material-icons" style={{ fontSize: 20 }}>edit</span></button>
                      <button onClick={() => handleDeleteClick(item._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Delete"><span className="material-icons" style={{ fontSize: 20 }}>delete</span></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '24px' }}>No inventory devices found</td></tr>
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="card" style={{ width: 420, padding: 24, borderRadius: 16, background: 'var(--bg-sidebar)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Upload Bulk IMEIs</h3>
              <button onClick={() => setShowUploadModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <span className="material-icons">close</span>
              </button>
            </div>

            <form onSubmit={handleUploadSubmit}>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Select File (.txt, .csv)</label>
                <div style={{ padding: '16px', border: '2px dashed var(--border)', borderRadius: '12px', textAlign: 'center', background: 'var(--bg-main)' }}>
                  <input
                    type="file"
                    accept=".txt,.csv"
                    onChange={handleFileChange}
                    style={{ width: '100%', cursor: 'pointer', fontSize: 14 }}
                    required
                  />
                  {selectedFile && <div style={{ marginTop: 12, fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>Selected: {selectedFile.name}</div>}
                </div>
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Format: CSV with IMEI and Model No.</span>
                  <a 
                    href="data:text/csv;charset=utf-8,IMEI,Model%20No.%0A123456789012345,TRK-900" 
                    download="sample_imei_list.csv"
                    style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <span className="material-icons" style={{ fontSize: 14 }}>download</span> Download Sample
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setShowUploadModal(false)} className="btn-secondary" style={{ flex: 1, padding: '12px', borderRadius: 8 }}>Cancel</button>
                <button type="submit" disabled={uploading} className="btn-primary" style={{ flex: 1, padding: '12px', borderRadius: 8, background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
                  {uploading ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {showEditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="card" style={{ width: 420, padding: 24, borderRadius: 16, background: 'var(--bg-sidebar)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Edit Inventory Device</h3>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <span className="material-icons">close</span>
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>IMEI</label>
                <input
                  type="text"
                  value={editItem?.imei || ""}
                  disabled
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-muted)', fontSize: 14 }}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Model Number</label>
                <input
                  type="text"
                  placeholder="e.g. TRK-900"
                  value={editModelNo}
                  onChange={(e) => setEditModelNo(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: 14 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary" style={{ flex: 1, padding: '12px', borderRadius: 8 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px', borderRadius: 8, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteConfirmModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="card" style={{ width: 420, padding: 24, borderRadius: 16, background: 'var(--bg-sidebar)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#ef4444' }}>Verify Password</h3>
              <button onClick={() => setDeleteConfirmModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <span className="material-icons">close</span>
              </button>
            </div>

            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
              Security Check: Please verify your login password before proceeding to delete this device.
            </p>

            <form onSubmit={handleConfirmDelete}>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Your Password</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: 14 }}
                  required
                />
                {deleteError && (
                  <div style={{ color: '#ef4444', fontSize: 13, marginTop: 8, fontWeight: 600 }}>{deleteError}</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setDeleteConfirmModal(false)} className="btn-secondary" style={{ flex: 1, padding: '12px', borderRadius: 8 }}>Cancel</button>
                <button type="submit" disabled={isVerifying} className="btn-primary" style={{ flex: 1, padding: '12px', borderRadius: 8, background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', border: 'none', fontWeight: 700, cursor: isVerifying ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>
                  {isVerifying ? 'Verifying...' : 'Verify & Proceed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Model Modal */}
      {isEditModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="card" style={{ width: 400, padding: 24, borderRadius: 16, background: 'var(--bg-sidebar)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Edit Model Number</h3>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <span className="material-icons">close</span>
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Model Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TRK-900"
                  value={editModelNo}
                  onChange={(e) => setEditModelNo(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: 14 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-secondary" style={{ flex: 1, padding: '12px', borderRadius: 8 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px', borderRadius: 8, border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

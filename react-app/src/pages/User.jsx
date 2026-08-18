import React, { useState } from 'react';
import { BASE_URL } from '../utils/network';
import MetricCard from '../components/MetricCard';
import Swal from 'sweetalert2';

export default function User({ user }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'admin'
  });

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  // Search and Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewUserData, setViewUserData] = useState(null);
  const [loadingView, setLoadingView] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [updateProfileImage, setUpdateProfileImage] = useState(null);
  const [updateFormData, setUpdateFormData] = useState({
    name: '',
    middleName: '',
    lastName: '',
    countryCode: '',
    mobile_number: '',
    email: '',
    dateOfBirth: '',
    country: '',
    state: '',
    city: '',
    address: '',
    role: 'admin'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch(`${BASE_URL}/user/all-users`);
      const data = await res.json();
      if (data && data.data) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateChange = (e) => {
    setUpdateFormData({ ...updateFormData, [e.target.name]: e.target.value });
  };

  const openUpdateModal = (u) => {
    setSelectedUser(u);
    setUpdateFormData({
      name: u.name || '',
      middleName: u.middleName || '',
      lastName: u.lastName || '',
      countryCode: u.countryCode || '',
      mobile_number: u.mobile_number || '',
      email: u.email || '',
      dateOfBirth: u.dateOfBirth ? new Date(u.dateOfBirth).toISOString().split('T')[0] : '',
      country: u.country || '',
      state: u.state || '',
      city: u.city || '',
      address: u.address || '',
      role: u.role || 'admin'
    });
    setUpdateProfileImage(null);
    setIsUpdateModalOpen(true);
  };

  const handleViewClick = async (id) => {
    try {
      setLoadingView(true);
      const res = await fetch(`${BASE_URL}/user/userList/${id}`);
      const data = await res.json();
      if (data && data.data && data.data.length > 0) {
        setViewUserData(data.data[0]);
        setIsViewModalOpen(true);
      } else {
        Swal.fire('Error', 'User details not found', 'error');
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      Swal.fire('Error', 'Failed to fetch user details', 'error');
    } finally {
      setLoadingView(false);
    }
  };

  const handleDeleteClick = async (id, name) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Are you sure you want to delete ${name || 'this user'}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, proceed!'
    });
    if (!result.isConfirmed) return;
    setLoadingUsers(true);
    setError('');
    try {
      const response = await fetch(`${BASE_URL}/user/delete/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete user');
      }
      setMessage(`Successfully deleted ${name || 'user'}`);
      fetchUsers();
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'User deleted successfully.'
      });
    } catch (err) {
      setError(err.message);
      Swal.fire(err.message);
      setLoadingUsers(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const formDataToSend = new FormData();
      Object.keys(updateFormData).forEach(key => {
        if (updateFormData[key] !== undefined && updateFormData[key] !== '') {
          formDataToSend.append(key, updateFormData[key]);
        }
      });

      if (updateProfileImage) {
        formDataToSend.append('userProfile', updateProfileImage);
      }

      const response = await fetch(`${BASE_URL}/api/auth/user-detail/${selectedUser._id}`, {
        method: 'PUT',
        body: formDataToSend,
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update user');
      }

      setMessage(`Successfully updated ${updateFormData.name}`);
      setIsUpdateModalOpen(false);
      fetchUsers();
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'User updated successfully.'
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();
      if (!response.ok || !data.status) {
        throw new Error(data.message || 'Failed to create user');
      }

      setMessage(`Successfully created ${formData.role}: ${formData.name}`);
      setFormData({ name: '', email: '', password: '', confirm_password: '', role: 'admin' });
      setIsModalOpen(false);
      fetchUsers();
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'User added successfully.'
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Pagination Logic
  const filteredUsers = users.filter(u => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (u.name || '').toLowerCase().includes(searchLower) ||
      (u.email || '').toLowerCase().includes(searchLower);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalItems = filteredUsers.length;
  const totalAdmins = filteredUsers.filter(u => u.role === 'admin' || u.role === 'superadmin').length;
  const totalCustomers = filteredUsers.filter(u => u.role === 'customer').length;

  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (pageNo) => {
    if (pageNo >= 1 && pageNo <= totalPages) {
      setCurrentPage(pageNo);
    }
  };

  return (
    <div className="page-content" style={{ padding: '30px', background: 'var(--bg-main)', minHeight: '100vh', position: 'relative' }}>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <MetricCard
          label="Total Users"
          value={totalItems}
          colorClass="blue"
          icon="groups"
        />
        <MetricCard
          label="Admins"
          value={totalAdmins}
          colorClass="green"
          icon="admin_panel_settings"
        />
        <MetricCard
          label="Customers"
          value={totalCustomers}
          colorClass="orange"
          icon="person"
        />
      </div>

      {/* Top Banner */}
      <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1 }}>
          <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
            <span className="material-icons" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '20px' }}>search</span>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-sidebar)', color: 'var(--text-main)', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-sidebar)', color: 'var(--text-main)', fontSize: '14px', cursor: 'pointer', outline: 'none' }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="customer">Customer</option>
          </select>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
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
            transition: 'transform 0.1s'
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span className="material-icons">person_add</span>
          Create Admin
        </button>
      </div>

      {message && (
        <div style={{ padding: '12px 16px', background: 'var(--success-light)', color: 'var(--success)', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '100%' }}>
          <span className="material-icons" style={{ fontSize: '18px' }}>check_circle</span>
          {message}
          <span style={{ flex: 1 }}></span>
          <span className="material-icons" style={{ cursor: 'pointer', fontSize: '18px' }} onClick={() => setMessage('')}>close</span>
        </div>
      )}

      {/* User List Section */}
      <div className="card" style={{ background: 'var(--bg-sidebar)', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
        {loadingUsers ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <span className="material-icons" style={{ animation: 'spin 1s linear infinite', fontSize: '32px', color: 'var(--primary)' }}>sync</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', width: '60px' }}>S.N</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Devices</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>No accounts found.</td>
                  </tr>
                ) : (
                  currentItems.map((u, i) => (
                    <tr key={u._id || i} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s', ':hover': { background: 'var(--bg-main)' } }}>
                      <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>
                        {startIndex + i + 1}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {u.userProfile ? (
                            <img 
                              src={u.userProfile} 
                              alt="" 
                              onClick={() => setFullscreenImage(u.userProfile)}
                              title="Click to view full image"
                              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }} 
                            />
                          ) : (
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                              {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                            </div>
                          )}
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.name || 'Unnamed'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>{u.email}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background: u.role === 'admin' ? 'var(--primary-light)' : u.role === 'superadmin' ? 'rgba(139, 92, 246, 0.1)' : 'var(--success-light)',
                          color: u.role === 'admin' ? 'var(--primary)' : u.role === 'superadmin' ? '#7c3aed' : 'var(--success)'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>
                        {u.assignedDeviceCount || 0}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: u.inOnline ? 'var(--success)' : 'var(--text-muted)' }}></span>
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{u.inOnline ? 'Online' : 'Offline'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleViewClick(u._id)}
                            disabled={loadingView}
                            style={{
                              background: 'var(--bg-sidebar)',
                              color: 'var(--success)',
                              border: '1px solid var(--border)',
                              padding: '6px 14px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: loadingView ? 'not-allowed' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.2s',
                              opacity: loadingView ? 0.6 : 1
                            }}
                            title="View Details"
                          >
                            <span className="material-icons" style={{ fontSize: '16px' }}>visibility</span>
                          </button>

                          <button
                            onClick={() => openUpdateModal(u)}
                            style={{
                              background: 'var(--bg-sidebar)',
                              color: 'var(--primary)',
                              border: '1px solid var(--border)',
                              padding: '6px 14px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.2s',
                            }}
                          >
                            <span className="material-icons" style={{ fontSize: '16px' }}>edit</span>
                          </button>

                          <button
                            onClick={() => handleDeleteClick(u._id, u.name)}
                            style={{
                              background: 'var(--error-light)',
                              color: 'var(--error)',
                              border: 'none',
                              padding: '6px 14px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.2s',
                            }}
                          >
                            <span className="material-icons" style={{ fontSize: '16px' }}>delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {!loadingUsers && users.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
            Showing <strong>{totalItems > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + itemsPerPage, totalItems)}</strong> of {totalItems} users
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

      {/* Create Modal Overlay */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-sidebar)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '600px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh'
          }}>
            <div style={{ padding: '24px 30px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Create Administrator</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0 0' }}>Register a new account with elevated privileges.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'var(--bg-main)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <span className="material-icons" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            <div style={{ padding: '30px', overflowY: 'auto' }}>
              {error && (
                <div style={{ padding: '12px 16px', background: 'var(--error-light)', color: 'var(--error)', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-icons" style={{ fontSize: '18px' }}>error_outline</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. John Doe" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-main)', transition: 'all 0.2s' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="admin@example.com" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-main)', transition: 'all 0.2s' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-main)', transition: 'all 0.2s' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Confirm Password</label>
                    <input type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} required placeholder="••••••••" style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-main)', transition: 'all 0.2s' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Account Role</label>
                  <select name="role" value={formData.role} onChange={handleChange} style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-main)', cursor: 'pointer', appearance: 'none' }}>
                    <option value="admin">Admin</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>
                <div style={{ marginTop: '10px', borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'var(--bg-sidebar)', color: 'var(--text-main)', border: '1px solid var(--border)', padding: '12px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(36, 99, 235, 0.2)' }}>
                    {loading ? <><span className="material-icons" style={{ animation: 'spin 1s linear infinite' }}>sync</span> Creating...</> : <><span className="material-icons">person_add</span> Create Account</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal Overlay */}
      {isUpdateModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-sidebar)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '700px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh'
          }}>
            <div style={{ padding: '24px 30px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Update Administrator</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0 0' }}>Modify the details of {selectedUser?.name}.</p>
              </div>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                style={{ background: 'var(--bg-main)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <span className="material-icons" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            <div style={{ padding: '30px', overflowY: 'auto' }}>
              <form onSubmit={handleUpdateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Profile Image (Optional)</label>
                  <input type="file" accept="image/*" onChange={(e) => setUpdateProfileImage(e.target.files[0])} style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-main)', cursor: 'pointer' }} />
                  {selectedUser?.userProfile && (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Current: {selectedUser.userProfile}</span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>First Name</label>
                    <input type="text" name="name" value={updateFormData.name} onChange={handleUpdateChange} required style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-main)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Middle Name</label>
                    <input type="text" name="middleName" value={updateFormData.middleName} onChange={handleUpdateChange} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-main)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Last Name</label>
                    <input type="text" name="lastName" value={updateFormData.lastName} onChange={handleUpdateChange} required style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-main)' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 2fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Email Address</label>
                    <input type="email" name="email" value={updateFormData.email} onChange={handleUpdateChange} required style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-main)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Country Code</label>
                    <input type="text" name="countryCode" value={updateFormData.countryCode} onChange={handleUpdateChange} placeholder="+1" style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-main)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Mobile Number</label>
                    <input type="text" name="mobile_number" value={updateFormData.mobile_number} onChange={handleUpdateChange} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-main)' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Date of Birth</label>
                    <input type="date" name="dateOfBirth" value={updateFormData.dateOfBirth} onChange={handleUpdateChange} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-main)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Account Role</label>
                    <select name="role" value={updateFormData.role} onChange={handleUpdateChange} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-main)', cursor: 'pointer', appearance: 'none' }}>
                      <option value="admin">Admin</option>
                      <option value="customer">Customer</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Country</label>
                    <input type="text" name="country" value={updateFormData.country} onChange={handleUpdateChange} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-main)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>State</label>
                    <input type="text" name="state" value={updateFormData.state} onChange={handleUpdateChange} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-main)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>City</label>
                    <input type="text" name="city" value={updateFormData.city} onChange={handleUpdateChange} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-main)' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Address</label>
                  <input type="text" name="address" value={updateFormData.address} onChange={handleUpdateChange} style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-main)' }} />
                </div>

                <div style={{ marginTop: '10px', borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" onClick={() => setIsUpdateModalOpen(false)} style={{ background: 'var(--bg-sidebar)', color: 'var(--text-main)', border: '1px solid var(--border)', padding: '12px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(36, 99, 235, 0.2)' }}>
                    {loading ? <><span className="material-icons" style={{ animation: 'spin 1s linear infinite' }}>sync</span> Saving...</> : <><span className="material-icons">save</span> Save Changes</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* View Modal Overlay */}
      {isViewModalOpen && viewUserData && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-sidebar)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh'
          }}>
            <div style={{ padding: '24px 30px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>User Details</h2>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                style={{ background: 'var(--bg-main)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <span className="material-icons" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            <div style={{ padding: '30px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  {viewUserData.userProfile ? (
                    <img 
                      src={viewUserData.userProfile} 
                      alt="" 
                      onClick={() => setFullscreenImage(viewUserData.userProfile)}
                      title="Click to view full image"
                      style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-light)', cursor: 'pointer' }} 
                    />
                  ) : (
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '32px', border: '3px solid var(--primary-light)' }}>
                      {viewUserData.name ? viewUserData.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                  <div>
                    <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-main)', fontWeight: 800 }}>{[viewUserData.name, viewUserData.middleName, viewUserData.lastName].filter(Boolean).join(' ')}</h3>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>{viewUserData.email}</p>
                    <span style={{
                      display: 'inline-block',
                      marginTop: '10px',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      background: viewUserData.role === 'admin' ? 'var(--primary-light)' : viewUserData.role === 'superadmin' ? 'rgba(139, 92, 246, 0.1)' : 'var(--success-light)',
                      color: viewUserData.role === 'admin' ? 'var(--primary)' : viewUserData.role === 'superadmin' ? '#7c3aed' : 'var(--success)'
                    }}>
                      {viewUserData.role}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Mobile Number</span>
                    <div style={{ fontSize: '14px', color: 'var(--text-main)', marginTop: '6px', fontWeight: 600 }}>{viewUserData.mobile_number || 'N/A'}</div>
                  </div>
                  <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Date of Birth</span>
                    <div style={{ fontSize: '14px', color: 'var(--text-main)', marginTop: '6px', fontWeight: 600 }}>{viewUserData.dateOfBirth ? new Date(viewUserData.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
                  </div>
                  <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Location</span>
                    <div style={{ fontSize: '14px', color: 'var(--text-main)', marginTop: '6px', fontWeight: 600 }}>{[viewUserData.city, viewUserData.state, viewUserData.country].filter(Boolean).join(', ') || 'N/A'}</div>
                  </div>
                  <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Status</span>
                    <div style={{ fontSize: '14px', color: 'var(--text-main)', marginTop: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: viewUserData.inOnline ? 'var(--success)' : 'var(--text-muted)' }}></span>
                      {viewUserData.inOnline ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </div>
                
                {viewUserData.address && (
                  <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Address</span>
                    <div style={{ fontSize: '14px', color: 'var(--text-main)', marginTop: '6px', fontWeight: 600 }}>{viewUserData.address}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Viewer Modal */}
      {fullscreenImage && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            cursor: 'pointer'
          }}
          onClick={() => setFullscreenImage(null)}
        >
          <div style={{ position: 'relative', display: 'flex' }}>
            <img 
              src={fullscreenImage} 
              alt="Fullscreen profile" 
              style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
            />
            <span className="material-icons" style={{ position: 'absolute', top: '12px', right: '12px', color: 'white', fontSize: '24px', background: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: '6px', transition: 'background 0.2s' }}>close</span>
          </div>
        </div>
      )}
    </div>
  );
}

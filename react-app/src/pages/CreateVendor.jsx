import React, { useState } from 'react';
import { BASE_URL } from '../utils/network';
import Swal from 'sweetalert2';

export default function CreateVendor({ user }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'vendor'
  });

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Assign Devices State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignCount, setAssignCount] = useState(1);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');

  // View Devices State
  const [isViewDevicesModalOpen, setIsViewDevicesModalOpen] = useState(false);
  const [vendorDevices, setVendorDevices] = useState([]);
  const [viewDevicesLoading, setViewDevicesLoading] = useState(false);
  const [viewDevicesError, setViewDevicesError] = useState('');

  const [updateFormData, setUpdateFormData] = useState({
    name: '',
    middleName: '',
    lastName: '',
    mobile_number: '',
    email: '',
    dateOfBirth: '',
    country: '',
    state: '',
    city: '',
    address: '',
    role: 'vendor'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const isSuperadmin = ['superadmin'].includes((savedUser.role || '').toLowerCase());
      
      let url = `${BASE_URL}/api/vendor/list`;
      if (!isSuperadmin) {
        const userId = localStorage.getItem('userId');
        if (userId) {
          url = `${BASE_URL}/api/vendor/admin/${userId}`;
        }
      }

      const res = await fetch(url);
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
      mobile_number: u.mobile_number || '',
      email: u.email || '',
      dateOfBirth: u.dateOfBirth ? new Date(u.dateOfBirth).toISOString().split('T')[0] : '',
      country: u.country || '',
      state: u.state || '',
      city: u.city || '',
      address: u.address || '',
      role: 'vendor'
    });
    setIsUpdateModalOpen(true);
  };

  const openAssignModal = (u) => {
    setSelectedUser(u);
    setAssignCount(1);
    setAssignError('');
    setAssignSuccess('');
    setIsAssignModalOpen(true);
  };

  const openViewDevicesModal = async (u) => {
    setSelectedUser(u);
    setIsViewDevicesModalOpen(true);
    setViewDevicesLoading(true);
    setViewDevicesError('');
    setVendorDevices([]);
    try {
      const response = await fetch(`${BASE_URL}/api/vendor/${u._id}/devices`);
      const data = await response.json();
      if (data.success) {
        setVendorDevices(data.data);
      } else {
        setViewDevicesError(data.message || 'Failed to fetch devices');
      }
    } catch (err) {
      setViewDevicesError(err.message || 'Error occurred');
    } finally {
      setViewDevicesLoading(false);
    }
  };

  const handleDeleteClick = async (id, name) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Are you sure you want to delete ${name || 'this vendor'}?`,
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
      const response = await fetch(`${BASE_URL}/api/vendor/delete/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete vendor');
      }
      setMessage(`Successfully deleted ${name || 'vendor'}`);
      fetchUsers();
    } catch (err) {
      setError(err.message);
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
      Object.entries(updateFormData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      const response = await fetch(`${BASE_URL}/api/vendor/update/${selectedUser._id}`, {
        method: 'PUT',
        body: formDataToSend,
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update vendor');
      }

      setMessage(`Successfully updated ${updateFormData.name}`);
      setIsUpdateModalOpen(false);
      fetchUsers();
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
      
      if (user && user._id) {
        formDataToSend.append('adminId', user._id);
      }

      const response = await fetch(`${BASE_URL}/api/vendor/register`, {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create vendor');
      }

      setMessage(`Successfully created vendor: ${formData.name}`);
      setFormData({ name: '', email: '', password: '', confirm_password: '', role: 'vendor' });
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content" style={{ padding: '30px', background: 'var(--bg-main)', minHeight: '100vh', position: 'relative' }}>

      {/* Top Banner */}
      <div className="page-header" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>Registered Vendors</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0, fontWeight: 500 }}>
            Manage system vendors.
          </p>
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
            transition: 'all 0.2s'
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span className="material-icons" style={{ fontSize: '18px' }}>add</span>
          Create Vendor
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
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mobile</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                  <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>No accounts found.</td>
                  </tr>
                ) : (
                  users.map((u, i) => (
                    <tr key={u._id || i} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s', ':hover': { background: 'var(--bg-main)' } }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {u.userProfile ? (
                            <img src={u.userProfile} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                              {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                            </div>
                          )}
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.name || 'Unnamed'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>{u.email}</td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>{u.mobile_number || 'N/A'}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background: 'var(--primary-light)',
                          color: 'var(--primary)'
                        }}>
                          {u.role || 'vendor'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => openViewDevicesModal(u)}
                            title="View Assigned Devices"
                            style={{
                              background: 'var(--primary-light)',
                              color: 'var(--primary)',
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
                            <span className="material-icons" style={{ fontSize: '16px' }}>visibility</span>
                          </button>

                          <button
                            onClick={() => openAssignModal(u)}
                            title="Assign Bulk Devices"
                            style={{
                              background: 'var(--success-light)',
                              color: 'var(--success)',
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
                            <span className="material-icons" style={{ fontSize: '16px' }}>inventory_2</span>
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
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Create Vendor</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0 0' }}>Register a new vendor account.</p>
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
                  <select name="role" value={formData.role} disabled style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-main)', cursor: 'not-allowed', appearance: 'none', opacity: 0.7 }}>
                    <option value="vendor">Vendor</option>
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
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Update Vendor</h2>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Email Address</label>
                    <input type="email" name="email" value={updateFormData.email} onChange={handleUpdateChange} required style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-main)' }} />
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
                    <select name="role" value="vendor" disabled style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-main)', cursor: 'not-allowed', appearance: 'none', opacity: 0.7 }}>
                      <option value="vendor">Vendor</option>
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

      {/* Assign Devices Modal */}
      {isAssignModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--bg-sidebar)', borderRadius: '20px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ padding: '24px 30px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Assign Devices</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0 0' }}>Assign random devices to {selectedUser?.name}.</p>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                style={{ background: 'var(--bg-main)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <span className="material-icons" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            <div style={{ padding: '30px' }}>
              {assignSuccess && (
                <div style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-icons" style={{ fontSize: '18px' }}>check_circle</span>
                  {assignSuccess}
                </div>
              )}
              {assignError && (
                <div style={{ background: 'var(--error-light)', color: 'var(--error)', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-icons" style={{ fontSize: '18px' }}>error</span>
                  {assignError}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>Number of Devices</label>
                  <input
                    type="number"
                    min="1"
                    value={assignCount}
                    onChange={(e) => setAssignCount(e.target.value)}
                    style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-main)' }}
                  />
                </div>

                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button onClick={() => setIsAssignModalOpen(false)} style={{ background: 'var(--bg-sidebar)', color: 'var(--text-main)', border: '1px solid var(--border)', padding: '12px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button
                    disabled={assignLoading}
                    onClick={async () => {
                      setAssignLoading(true);
                      setAssignError('');
                      setAssignSuccess('');
                      try {
                        const response = await fetch(`${BASE_URL}/api/inventory/assign-vendor-bulk`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ vendorId: selectedUser._id, count: Number(assignCount) })
                        });
                        const data = await response.json();
                        if (data.success) {
                          setAssignSuccess(`Successfully assigned ${data.assignedCount} devices!`);
                          setAssignCount(1);
                        } else {
                          setAssignError(data.message || 'Failed to assign devices.');
                        }
                      } catch (err) {
                        setAssignError(err.message || 'Error occurred.');
                      } finally {
                        setAssignLoading(false);
                      }
                    }}
                    style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: assignLoading ? 'not-allowed' : 'pointer', opacity: assignLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(36, 99, 235, 0.2)' }}
                  >
                    {assignLoading ? 'Assigning...' : 'Assign Devices'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Devices Modal */}
      {isViewDevicesModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--bg-sidebar)', borderRadius: '20px', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '24px 30px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Vendor Devices</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0 0' }}>Devices assigned to {selectedUser?.name}.</p>
              </div>
              <button
                onClick={() => setIsViewDevicesModalOpen(false)}
                style={{ background: 'var(--bg-main)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <span className="material-icons" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            <div style={{ padding: '30px', overflowY: 'auto' }}>
              {viewDevicesLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                  <span className="material-icons" style={{ animation: 'spin 1s linear infinite', fontSize: '28px', color: 'var(--primary)' }}>sync</span>
                </div>
              ) : viewDevicesError ? (
                <div style={{ background: 'var(--error-light)', color: 'var(--error)', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-icons" style={{ fontSize: '18px' }}>error</span>
                  {viewDevicesError}
                </div>
              ) : vendorDevices.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px', fontWeight: 500 }}>
                  No devices assigned to this vendor.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Total Devices: {vendorDevices.length}
                  </div>
                  {vendorDevices.map((device, idx) => (
                    <div key={device._id || idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-main)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                      <span className="material-icons" style={{ color: 'var(--primary)', fontSize: '20px' }}>memory</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '14px' }}>{device.imei}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Assigned: {new Date(device.createdAt).toLocaleDateString()}</div>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '6px', background: device.status === 1 ? 'var(--success-light)' : 'var(--error-light)', color: device.status === 1 ? 'var(--success)' : 'var(--error)' }}>
                        {device.status === 1 ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

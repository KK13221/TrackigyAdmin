import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/network';
import Swal from 'sweetalert2';

export default function BrandList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({ id: '', name: '', vehicleTypes: [] });
  const [vehicleTypesList, setVehicleTypesList] = useState([]);

  const fetchData = () => {
    setLoading(true);
    fetch(`${BASE_URL}/api/vehicle/brands`)
      .then(res => res.json())
      .then(json => {
        setData(json.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const fetchVehicleTypes = () => {
    fetch(`${BASE_URL}/api/vehicle/types`)
      .then(res => res.json())
      .then(json => setVehicleTypesList(json.data || []))
      .catch(console.error);
  };

  useEffect(() => {
    fetchData();
    fetchVehicleTypes();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this brand?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, proceed!'
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${BASE_URL}/api/vehicle/brand/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.status) fetchData();
      else Swal.fire(json.message);
    } catch (err) { console.error(err); }
  };

  const handleOpenModal = (mode, item = null) => {
    setModalMode(mode);
    if (mode === 'edit' && item) {
      setFormData({ id: item._id, name: item.name || '', vehicleTypes: item.vehicleTypes || [] });
    } else {
      setFormData({ id: '', name: '', vehicleTypes: [] });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate saving
    if (modalMode === 'add') {
      const isDuplicate = data.some(b => b.name.toLowerCase() === formData.name.trim().toLowerCase());
      if (isDuplicate) {
        Swal.fire('This Brand Name already exists!');
        return;
      }
    } else if (modalMode === 'edit') {
      const isDuplicate = data.some(b => b.name.toLowerCase() === formData.name.trim().toLowerCase() && b._id !== formData.id);
      if (isDuplicate) {
        Swal.fire('This Brand Name already exists!');
        return;
      }
    }

    if (formData.vehicleTypes.length === 0) {
      Swal.fire('Please select at least one vehicle type.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      vehicleTypes: formData.vehicleTypes
    };

    const url = modalMode === 'add' ? `${BASE_URL}/api/vehicle/brand` : `${BASE_URL}/api/vehicle/brand/${formData.id}`;
    const method = modalMode === 'add' ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.status) {
        setIsModalOpen(false);
        fetchData();
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `Brand ${modalMode === 'add' ? 'added' : 'updated'} successfully.`
        });
      } else {
        Swal.fire(json.message || 'Failed to save');
      }
    } catch (err) { console.error(err); }
  };

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="fade-in" style={{ padding: 0, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: 'var(--text-main)' }}></h2>
        <button onClick={() => handleOpenModal('add')} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-icons" style={{ fontSize: 18 }}>add</span> Add Brand
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="vehicle-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              <th>S.No</th>
              <th>Brand Name</th>
              <th>Vehicle Types</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>Loading...</td></tr>
            ) : currentData.length > 0 ? (
              currentData.map((item, idx) => (
                <tr key={item._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600 }}>{startIndex + idx + 1}</td>
                  <td style={{ padding: '16px 24px', fontWeight: 800, color: 'var(--text-main)' }}>{item.name}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {(item.vehicleTypes || []).map(vt => (
                        <span key={vt} style={{ padding: '4px 8px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                          {vt}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button onClick={() => handleOpenModal('edit', item)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer' }} title="Edit"><span className="material-icons" style={{ fontSize: 20 }}>edit</span></button>
                      <button onClick={() => handleDelete(item._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Delete"><span className="material-icons" style={{ fontSize: 20 }}>delete</span></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>No brands found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, data.length)} of {data.length} brands
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              style={{ padding: '6px 12px', border: '1px solid var(--border)', background: currentPage === 1 ? 'var(--bg-hover)' : 'var(--bg-main)', color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-main)', borderRadius: 6, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 13 }}
            >
              Previous
            </button>
            <span style={{ padding: '6px 12px', background: 'var(--primary)', color: '#fff', borderRadius: 6, fontWeight: 700, fontSize: 13 }}>
              {currentPage}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              style={{ padding: '6px 12px', border: '1px solid var(--border)', background: currentPage === totalPages ? 'var(--bg-hover)' : 'var(--bg-main)', color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-main)', borderRadius: 6, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 13 }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: 400, padding: 32, position: 'relative' }}>
            <h3 style={{ margin: '0 0 24px 0' }}>{modalMode === 'add' ? 'Add Brand' : 'Edit Brand'}</h3>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: 24, right: 24, background: 'none', border: 'none', cursor: 'pointer' }}><span className="material-icons">close</span></button>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Brand Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }} placeholder="e.g. Toyota" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Select Vehicle Types</label>
                <div style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                  {vehicleTypesList.map(vt => (
                    <label key={vt._id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-main)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.vehicleTypes.includes(vt.type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, vehicleTypes: [...formData.vehicleTypes, vt.type] });
                          } else {
                            setFormData({ ...formData, vehicleTypes: formData.vehicleTypes.filter(t => t !== vt.type) });
                          }
                        }}
                        style={{ accentColor: 'var(--primary)', width: 16, height: 16, cursor: 'pointer' }}
                      />
                      <span style={{ textTransform: 'capitalize' }}>{vt.type}</span>
                    </label>
                  ))}
                  {vehicleTypesList.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No vehicle types available.</span>}
                </div>
              </div>
              <button type="submit" style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '12px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
                {modalMode === 'add' ? 'Create Brand' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

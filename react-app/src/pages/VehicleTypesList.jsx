import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/network';
import Swal from 'sweetalert2';

export default function VehicleTypesList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({ id: '', type: '', supportedFuelTypes: '' });
  const [isFuelDropdownOpen, setIsFuelDropdownOpen] = useState(false);

  const toggleFuelType = (fuel) => {
    const current = formData.supportedFuelTypes ? formData.supportedFuelTypes.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (current.includes(fuel)) {
      setFormData({ ...formData, supportedFuelTypes: current.filter(f => f !== fuel).join(', ') });
    } else {
      setFormData({ ...formData, supportedFuelTypes: [...current, fuel].join(', ') });
    }
  };

  const fetchData = () => {
    setLoading(true);
    fetch(`${BASE_URL}/api/vehicle/types`)
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

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this vehicle type?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, proceed!'
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${BASE_URL}/api/vehicle/type/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.status) fetchData();
      else Swal.fire(json.message);
    } catch (err) { console.error(err); }
  };

  const handleOpenModal = (mode, item = null) => {
    setModalMode(mode);
    if (mode === 'edit' && item) {
      setFormData({ id: item._id, type: item.type || '', supportedFuelTypes: (item.supportedFuelTypes || []).join(', ') });
    } else {
      setFormData({ id: '', type: '', supportedFuelTypes: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      type: formData.type,
      supportedFuelTypes: formData.supportedFuelTypes.split(',').map(s => s.trim()).filter(Boolean)
    };

    const url = modalMode === 'add' ? `${BASE_URL}/api/vehicle/type` : `${BASE_URL}/api/vehicle/type/${formData.id}`;
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
          text: `Vehicle Type ${modalMode === 'add' ? 'added' : 'updated'} successfully.`
        });
      } else {
        Swal.fire(json.message || 'Failed to save');
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="fade-in" style={{ padding: 0, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: 'var(--text-main)' }}></h2>
        <button onClick={() => handleOpenModal('add')} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-icons" style={{ fontSize: 18 }}>add</span> Add Type
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="vehicle-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              <th>S.No</th>
              <th>Vehicle Type</th>
              <th>Supported Fuel Types</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>Loading...</td></tr>
            ) : data.length > 0 ? (
              data.map((item, idx) => (
                <tr key={item._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600 }}>{idx + 1}</td>
                  <td style={{ padding: '16px 24px', fontWeight: 800, color: 'var(--text-main)', textTransform: 'capitalize' }}>{item.type}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {(item.supportedFuelTypes || []).map(ft => (
                        <span key={ft} style={{ padding: '4px 8px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>
                          {ft}
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
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>No vehicle types found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: 400, padding: 32, position: 'relative' }}>
            <h3 style={{ margin: '0 0 24px 0' }}>{modalMode === 'add' ? 'Add Vehicle Type' : 'Edit Vehicle Type'}</h3>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: 24, right: 24, background: 'none', border: 'none', cursor: 'pointer' }}><span className="material-icons">close</span></button>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Vehicle Type Name</label>
                <input required type="text" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }} placeholder="e.g. Car" />
              </div>
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Supported Fuel Types</label>
                <div
                  onClick={() => setIsFuelDropdownOpen(!isFuelDropdownOpen)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: formData.supportedFuelTypes ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    {formData.supportedFuelTypes || 'Select Fuel Types'}
                  </span>
                  <span className="material-icons" style={{ fontSize: 14 }}>expand_more</span>
                </div>
                {isFuelDropdownOpen && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: 150, overflowY: 'auto' }}>
                    {['Petrol', 'Diesel', 'CNG', 'EV', 'Hybrid', 'LPG'].map(fuel => {
                      const isSelected = formData.supportedFuelTypes.split(',').map(s => s.trim()).filter(Boolean).includes(fuel);
                      return (
                        <div
                          key={fuel}
                          onClick={() => toggleFuelType(fuel)}
                          style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', borderBottom: '1px solid var(--border)', background: isSelected ? 'var(--primary-light)' : 'transparent' }}
                        >
                          <input type="checkbox" checked={isSelected} readOnly style={{ cursor: 'pointer' }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>{fuel}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <button type="submit" style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '12px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
                {modalMode === 'add' ? 'Create Type' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

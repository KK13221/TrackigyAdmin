import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/network';
import Swal from 'sweetalert2';

export default function ModelList() {
  const [data, setData] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({ id: '', brandId: '', modelName: '', vehicleType: '', fuelType: [], mileage: '', tankCapacity: '' });
  const [vehicleTypesList, setVehicleTypesList] = useState([]);

  const fetchData = () => {
    setLoading(true);
    fetch(`${BASE_URL}/api/vehicle/models`)
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

  const fetchBrands = () => {
    fetch(`${BASE_URL}/api/vehicle/brands`)
      .then(res => res.json())
      .then(json => setBrands(json.data || []))
      .catch(console.error);
  };

  const fetchVehicleTypes = () => {
    fetch(`${BASE_URL}/api/vehicle/types`)
      .then(res => res.json())
      .then(json => setVehicleTypesList(json.data || []))
      .catch(console.error);
  };

  useEffect(() => {
    fetchData();
    fetchBrands();
    fetchVehicleTypes();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this model?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, proceed!'
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${BASE_URL}/api/vehicle/model/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.status) fetchData();
      else Swal.fire(json.message);
    } catch (err) { console.error(err); }
  };

  const handleOpenModal = (mode, item = null) => {
    setModalMode(mode);
    if (mode === 'edit' && item) {
      setFormData({
        id: item._id,
        brandId: item.brandId?._id || item.brandId || '',
        modelName: item.modelName || '',
        vehicleType: item.vehicleType || '',
        fuelType: item.fuelType || [],
        mileage: item.mileage || '',
        tankCapacity: item.tankCapacity || ''
      });
    } else {
      setFormData({ id: '', brandId: '', modelName: '', vehicleType: '', fuelType: [], mileage: '', tankCapacity: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (modalMode === 'add') {
      const isDuplicate = data.some(m =>
        m.modelName.toLowerCase() === formData.modelName.trim().toLowerCase() &&
        (m.brandId?._id === formData.brandId || m.brandId === formData.brandId)
      );
      if (isDuplicate) {
        Swal.fire('This Model Name already exists for the selected brand!');
        return;
      }
    } else if (modalMode === 'edit') {
      const isDuplicate = data.some(m =>
        m.modelName.toLowerCase() === formData.modelName.trim().toLowerCase() &&
        (m.brandId?._id === formData.brandId || m.brandId === formData.brandId) &&
        m._id !== formData.id
      );
      if (isDuplicate) {
        Swal.fire('This Model Name already exists for the selected brand!');
        return;
      }
    }

    if (formData.fuelType.length === 0) {
      Swal.fire('Please select at least one fuel type.');
      return;
    }

    const payload = {
      brandId: formData.brandId,
      modelName: formData.modelName.trim(),
      vehicleType: formData.vehicleType,
      fuelType: formData.fuelType,
      mileage: formData.mileage,
      tankCapacity: formData.tankCapacity
    };

    const url = modalMode === 'add' ? `${BASE_URL}/api/vehicle/model` : `${BASE_URL}/api/vehicle/model/${formData.id}`;
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
          text: `Model ${modalMode === 'add' ? 'added' : 'updated'} successfully.`
        });
      } else {
        Swal.fire(json.message || 'Failed to save');
      }
    } catch (err) { console.error(err); }
  };

  // Compute available fuel types based on selected vehicle type
  const availableFuelTypes = React.useMemo(() => {
    if (!formData.vehicleType) return [];
    const vt = vehicleTypesList.find(v => v.type === formData.vehicleType);
    return vt ? vt.supportedFuelTypes || [] : [];
  }, [formData.vehicleType, vehicleTypesList]);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="fade-in" style={{ padding: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: 'var(--text-main)' }}></h2>
        <h2 style={{ margin: 0, color: 'var(--text-main)' }}></h2>
        <button onClick={() => handleOpenModal('add')} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-icons" style={{ fontSize: 18 }}>add</span> Add Model
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="vehicle-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              <th>S.No</th>
              <th>Model Name</th>
              <th>Brand</th>
              <th>Vehicle Type</th>
              <th>Fuel Types</th>
              <th>Mileage</th>
              <th>Tank</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '24px' }}>Loading...</td></tr>
            ) : currentData.length > 0 ? (
              currentData.map((item, idx) => (
                <tr key={item._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-main)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600 }}>{startIndex + idx + 1}</td>
                  <td style={{ padding: '16px 24px', fontWeight: 800, color: 'var(--text-main)' }}>{item.modelName}</td>
                  <td style={{ padding: '16px 24px', fontWeight: 600 }}>{item.brandId?.name || 'N/A'}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ padding: '4px 8px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                      {item.vehicleType}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {(item.fuelType || []).map(ft => (
                        <span key={ft} style={{ padding: '4px 8px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>
                          {ft}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: 600 }}>{item.mileage || 'N/A'}</td>
                  <td style={{ padding: '16px 24px', fontWeight: 600 }}>{item.tankCapacity || 'N/A'}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button onClick={() => handleOpenModal('edit', item)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer' }} title="Edit"><span className="material-icons" style={{ fontSize: 20 }}>edit</span></button>
                      <button onClick={() => handleDelete(item._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Delete"><span className="material-icons" style={{ fontSize: 20 }}>delete</span></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '24px' }}>No models found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, data.length)} of {data.length} models
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
          <div className="card" style={{ width: 500, padding: 32, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 24px 0' }}>{modalMode === 'add' ? 'Add Model' : 'Edit Model'}</h3>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: 24, right: 24, background: 'none', border: 'none', cursor: 'pointer' }}><span className="material-icons">close</span></button>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Brand</label>
                <select required value={formData.brandId} onChange={e => setFormData({ ...formData, brandId: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
                  <option value="">Select a brand</option>
                  {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Model Name</label>
                <input required type="text" value={formData.modelName} onChange={e => setFormData({ ...formData, modelName: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }} placeholder="e.g. Corolla" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Vehicle Type</label>
                <select required value={formData.vehicleType} onChange={e => {
                  setFormData({ ...formData, vehicleType: e.target.value, fuelType: [] }); // Reset fuel type on change
                }} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
                  <option value="">Select a Vehicle Type</option>
                  {vehicleTypesList.map(vt => <option key={vt._id} value={vt.type}>{vt.type}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Fuel Types</label>
                <div style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-main)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {availableFuelTypes.length > 0 ? availableFuelTypes.map(ft => (
                    <label key={ft} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-main)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.fuelType.includes(ft)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, fuelType: [...formData.fuelType, ft] });
                          } else {
                            setFormData({ ...formData, fuelType: formData.fuelType.filter(t => t !== ft) });
                          }
                        }}
                        style={{ accentColor: 'var(--primary)', width: 16, height: 16, cursor: 'pointer' }}
                      />
                      <span style={{ textTransform: 'capitalize' }}>{ft}</span>
                    </label>
                  )) : (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Select a vehicle type first</span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Mileage</label>
                  <input type="text" value={formData.mileage} onChange={e => setFormData({ ...formData, mileage: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }} placeholder="e.g. 15 km/l" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Tank Capacity</label>
                  <input type="text" value={formData.tankCapacity} onChange={e => setFormData({ ...formData, tankCapacity: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }} placeholder="e.g. 50L" />
                </div>
              </div>

              <button type="submit" style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '12px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
                {modalMode === 'add' ? 'Create Model' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

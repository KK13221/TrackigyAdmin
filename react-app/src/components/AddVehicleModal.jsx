import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/network';

export default function AddVehicleModal({ isOpen, onClose, user, onVehicleAdded }) {
  const [configData, setConfigData] = useState([]);
  const [makers, setMakers] = useState([]);
  const [models, setModels] = useState([]);
  const [formData, setFormData] = useState({
    vehicleType: '2_wheeler',
    fuelType: 'petrol',
    brandId: '',
    modelId: '',
    vehicleNumber: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const fetchConfig = async () => {
        try {
          const response = await fetch(`${BASE_URL}/api/vehicle/vehicle-config`);
          if (response.ok) {
            const result = await response.json();
            if (result && result.data && result.data.length > 0) {
              setConfigData(result.data);
              const initialType = result.data[0];
              setFormData(prev => ({
                ...prev,
                vehicleType: initialType.type,
                fuelType: initialType.supportedFuelTypes[0] || 'petrol'
              }));
            }
          }
        } catch (err) {
          console.error("Failed to load vehicle config", err);
        }
      };
      fetchConfig();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && formData.vehicleType && formData.fuelType) {
      const fetchMakers = async () => {
        try {
          const response = await fetch(`${BASE_URL}/vehicle/makers?vehicleType=${formData.vehicleType}&fuelType=${formData.fuelType}`);
          if (response.ok) {
            const result = await response.json();
            if (result && result.data) {
              setMakers(result.data);
              setFormData(prev => ({ 
                ...prev, 
                brandId: result.data.length > 0 ? result.data[0]._id : '' 
              }));
            }
          }
        } catch (err) {
          console.error("Failed to load vehicle makers", err);
        }
      };
      fetchMakers();
    }
  }, [isOpen, formData.vehicleType, formData.fuelType]);

  useEffect(() => {
    if (isOpen && formData.vehicleType && formData.fuelType && formData.brandId) {
      const fetchModels = async () => {
        try {
          const response = await fetch(`${BASE_URL}/vehicle/models?vehicleType=${formData.vehicleType}&fuelType=${formData.fuelType}&brandId=${formData.brandId}`);
          if (response.ok) {
            const result = await response.json();
            if (result && result.data) {
              setModels(result.data);
              setFormData(prev => ({
                ...prev,
                modelId: result.data.length > 0 ? result.data[0]._id : ''
              }));
            }
          }
        } catch (err) {
          console.error("Failed to load vehicle models", err);
        }
      };
      fetchModels();
    }
  }, [isOpen, formData.vehicleType, formData.fuelType, formData.brandId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'vehicleType') {
      const cfg = configData.find(c => c.type === value);
      const firstFuel = cfg && cfg.supportedFuelTypes.length > 0 ? cfg.supportedFuelTypes[0] : '';
      setFormData(prev => ({ ...prev, vehicleType: value, fuelType: firstFuel }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const userId = user?._id || user?.userId || user?.user_id || '69d4edbd81a3afcb12e63140';

    try {
      const response = await fetch(`${BASE_URL}/vehicle/vehicle`, {
        method: 'POST',
        headers: { 'accept': '*/*', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...formData
        })
      });

      if (response.ok) {
        onVehicleAdded();
        onClose();
        setFormData({ vehicleType: '2_wheeler', fuelType: 'petrol', brandId: '', modelId: '', vehicleNumber: ''});
      } else {
        const err = await response.json();
        setError(err.message || 'Failed to add vehicle');
      }
    } catch (err) {
      console.error(err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ ...overlayStyle }}>
      <div className="modal-content card" style={{ ...modalStyle }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Add New Vehicle</h2>
        {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          <div>
            <label style={labelStyle}>Vehicle Type</label>
            <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} style={inputStyle}>
              {configData.length > 0 ? (
                configData.map(c => (
                  <option key={c._id} value={c.type} style={{ textTransform: 'capitalize' }}>
                    {c.type.replace('_', ' ')}
                  </option>
                ))
              ) : (
                <option value="2_wheeler">2 wheeler (Fallback)</option>
              )}
            </select>
          </div>
          
          <div>
            <label style={labelStyle}>Fuel Type</label>
            <select name="fuelType" value={formData.fuelType} onChange={handleChange} style={inputStyle}>
              {configData.length > 0 ? (
                (configData.find(c => c.type === formData.vehicleType)?.supportedFuelTypes || []).map(fType => (
                  <option key={fType} value={fType} style={{ textTransform: 'capitalize' }}>
                    {fType}
                  </option>
                ))
              ) : (
                <option value="petrol">Petrol (Fallback)</option>
              )}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Vehicle Maker (Brand)</label>
            <select name="brandId" value={formData.brandId} onChange={handleChange} style={inputStyle} required>
              {makers.length > 0 ? (
                makers.map(m => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))
              ) : (
                <option value="">No makers found</option>
              )}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Vehicle Model</label>
            <select name="modelId" value={formData.modelId} onChange={handleChange} style={inputStyle} required>
              {models.length > 0 ? (
                models.map(m => (
                  <option key={m._id} value={m._id}>{m.modelName}</option>
                ))
              ) : (
                <option value="">No models found</option>
              )}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Vehicle Number / Plate</label>
            <input type="text" name="vehicleNumber" placeholder="e.g. MP09HH34MAHdI" value={formData.vehicleNumber} onChange={handleChange} style={inputStyle} required />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 16px', background: '#e2e8f0', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, color: 'var(--text-main)' }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '10px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              {loading ? 'Adding...' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(15, 23, 42, 0.6)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000
};

const modalStyle = {
  width: '100%',
  maxWidth: 450,
  padding: 32,
  background: 'white',
  borderRadius: 16,
  boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
};

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  color: 'var(--text-muted)',
  marginBottom: 6,
  textTransform: 'uppercase'
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid var(--border)',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box'
};

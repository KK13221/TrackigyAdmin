import React, { useState, useEffect, useRef } from 'react';
import { BASE_URL } from '../utils/network';

export default function DummyDataDownload() {
  const [imei, setImei] = useState('');
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Custom dropdown state
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/vehicle/get-vehicles-list`);
        if (response.ok) {
          const data = await response.json();
          const list = data.vehicles || data.data || (Array.isArray(data) ? data : []);
          setDevices(list.filter(d => d.imei));
        }
      } catch (error) {
        console.error("Error fetching devices:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownload = () => {
    if (!imei.trim()) {
      alert("Please select an IMEI number.");
      return;
    }
    const downloadUrl = `${BASE_URL}/api/dummy/download?imei=${imei}`;
    window.open(downloadUrl, '_blank');
  };

  const filteredDevices = devices.filter(device => {
    const label = `${device.vehicleNo || ''} ${device.imei || ''}`.toLowerCase();
    return label.includes(searchQuery.toLowerCase());
  });

  const handleSelect = (selectedImei) => {
    setImei(selectedImei);
    setIsOpen(false);
    setSearchQuery('');
  };

  const getDisplayLabel = () => {
    if (loading) return 'Loading vehicles...';
    if (!imei) return 'Select an IMEI...';
    const selected = devices.find(d => d.imei === imei);
    if (selected) {
      return selected.vehicleNo ? `${selected.vehicleNo} - ${selected.imei}` : selected.imei;
    }
    return imei;
  };

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <h2 style={{ marginBottom: '16px', color: 'var(--text)' }}>Download Dummy Data</h2>
      <p style={{ marginBottom: '24px', color: 'var(--text-muted)' }}>
        Search or select an IMEI number from the dropdown to download its dummy data log.
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--surface)', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontWeight: 600, color: 'var(--text)' }}>IMEI Number</label>
          
          <div ref={dropdownRef} style={{ position: 'relative', zIndex: isOpen ? 9999 : 1 }}>
            <div 
              onClick={() => !loading && setIsOpen(!isOpen)}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--background)',
                color: 'var(--text)',
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {getDisplayLabel()}
              </span>
              <span className="material-icons" style={{ color: 'var(--text-muted)' }}>
                {isOpen ? 'expand_less' : 'expand_more'}
              </span>
            </div>

            {isOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '300px'
              }}>
                <div style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>
                  <input 
                    type="text" 
                    placeholder="Search vehicle or IMEI..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid var(--border)',
                      background: 'var(--background)',
                      color: 'var(--text)',
                      outline: 'none',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ overflowY: 'auto' }}>
                  {filteredDevices.length > 0 ? (
                    filteredDevices.map((device, index) => (
                      <div 
                        key={index}
                        onClick={() => handleSelect(device.imei)}
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          background: imei === device.imei ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                          color: 'var(--text)',
                          fontSize: '14px'
                        }}
                        onMouseEnter={(e) => {
                          if (imei !== device.imei) e.target.style.background = 'rgba(0,0,0,0.02)';
                        }}
                        onMouseLeave={(e) => {
                          if (imei !== device.imei) e.target.style.background = 'transparent';
                        }}
                      >
                        {device.vehicleNo ? `${device.vehicleNo} - ${device.imei}` : device.imei}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '14px' }}>
                      No devices found.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
        </div>
        <button 
          onClick={handleDownload}
          disabled={!imei}
          style={{
            padding: '12px 24px',
            background: imei ? 'var(--primary)' : 'var(--border)',
            color: imei ? 'white' : 'var(--text-muted)',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: imei ? 'pointer' : 'not-allowed',
            marginTop: '8px',
            transition: 'background 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <span className="material-icons">download</span> Download .txt
        </button>
      </div>
    </div>
  );
}

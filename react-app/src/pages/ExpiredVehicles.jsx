import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/network';

export default function ExpiredVehicles() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = () => {
    setLoading(true);
    fetch(`${BASE_URL}/api/warranty/expired-devices`)
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

  useEffect(() => {
    fetchData();
  }, []);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="fade-in" style={{ padding: 24, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: 'var(--text-main)' }}>Expired Vehicles</h2>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="vehicle-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              <th>S.No</th>
              <th>IMEI</th>
              <th>Vehicle Number</th>
              <th>Vehicle Model</th>
              <th>Expiry Date</th>
              <th>Days Expired</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>Loading...</td></tr>
            ) : currentData.length > 0 ? (
              currentData.map((item, idx) => {
                const expiryDate = new Date(item.warrantyExpiryDate).toLocaleDateString();
                return (
                  <tr key={item._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600 }}>{startIndex + idx + 1}</td>
                    <td style={{ padding: '16px 24px', fontWeight: 800, color: 'var(--text-main)' }}>{item.imei}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-main)' }}>{item.vehicleNumber}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-main)' }}>{item.vehicleModel}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-main)' }}>{expiryDate}</td>
                    <td style={{ padding: '16px 24px', color: '#ef4444', fontWeight: 800 }}>{item.daysExpired} days</td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>No expired vehicles found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, data.length)} of {data.length} vehicles
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
    </div>
  );
}

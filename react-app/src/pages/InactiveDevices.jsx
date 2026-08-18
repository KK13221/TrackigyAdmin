import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/network';

export default function InactiveDevices() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = () => {
    setLoading(true);
    setError(null);
    fetch(`${BASE_URL}/api/device/inactive-devices`)
      .then(res => res.json())
      .then(json => {
        if (json.status && json.data) {
          setData(json.data);
        } else {
          setData([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to fetch inactive devices.');
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
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-main)' }}>Inactive Devices</h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: 13 }}>Devices with active warranty that haven't sent data for 5+ days.</p>
        </div>
        <button
          onClick={fetchData}
          style={{
            padding: '8px 16px',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span className="material-icons" style={{ fontSize: '18px' }}>refresh</span>
          Refresh
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="vehicle-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              <th>S.No</th>
              <th>IMEI</th>
              <th>User Name</th>
              <th>Mobile Number</th>
              <th>Vehicle Number</th>
              <th>Last Seen</th>
              <th>Days Inactive</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#ef4444' }}>{error}</td></tr>
            ) : currentData.length > 0 ? (
              currentData.map((item, idx) => {
                const lastSeenDate = item.lastSeen ? new Date(item.lastSeen).toLocaleString() : 'N/A';
                return (
                  <tr key={item.imei} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600 }}>{startIndex + idx + 1}</td>
                    <td style={{ padding: '16px 24px', fontWeight: 800, color: 'var(--text-main)' }}>{item.imei}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-main)' }}>
                      <div style={{ fontWeight: 600 }}>{item.userName || 'N/A'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.userEmail}</div>
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-main)' }}>{item.userMobile || 'N/A'}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-main)' }}>{item.vehicleNumber || 'N/A'}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-main)' }}>{lastSeenDate}</td>
                    <td style={{ padding: '16px 24px', color: '#ef4444', fontWeight: 800 }}>{item.daysInactive} days</td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>No inactive devices found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, data.length)} of {data.length} devices
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

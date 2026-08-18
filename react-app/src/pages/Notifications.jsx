import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/network';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getNotifStyle(title = '') {
  const t = title.toLowerCase();
  const isGeo = t.includes('geofence') || t.includes('breach');
  const isService = t.includes('service');
  const isVehicle = t.includes('vehicle');
  const dotColor = isGeo ? '#ef4444' : isService ? '#f59e0b' : '#2463eb';
  const bgColor = isGeo ? '#fef2f2' : isService ? '#fffbeb' : '#eff6ff';
  const borderColor = isGeo ? '#fecaca' : isService ? '#fde68a' : '#bfdbfe';
  const iconName = isGeo ? 'gps_off' : isService ? 'build_circle' : isVehicle ? 'directions_car' : 'notifications_active';
  const label = isGeo ? 'Geofence' : isService ? 'Service' : isVehicle ? 'Vehicle' : 'Alert';
  return { dotColor, bgColor, borderColor, iconName, label };
}

export default function Notifications({ onNavigate }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  const fetchNotifications = (pg) => {
    setLoading(true);
    fetch(`${BASE_URL}/api/notification?limit=${LIMIT}&page=${pg}`, {
      headers: { 'accept': 'application/json' }
    })
      .then(r => r.json())
      .then(data => {
        if (data.status && data.data) {
          setNotifications(data.data);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 1);
        }
      })
      .catch(err => console.error('Notifications fetch error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications(page);
  }, [page]);

  return (
    <div className="fade-in">

      {/* Summary strip */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, flex: '0 0 auto' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-icons" style={{ fontSize: 18, color: '#2463eb' }}>notifications</span>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Alerts</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)' }}>{total}</div>
          </div>
        </div>
        <div className="card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, flex: '0 0 auto' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-icons" style={{ fontSize: 18, color: '#f59e0b' }}>build_circle</span>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Service Alerts</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)' }}>
              {notifications.filter(n => n.title?.toLowerCase().includes('service')).length}
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, flex: '0 0 auto' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-icons" style={{ fontSize: 18, color: '#10b981' }}>directions_car</span>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vehicle Alerts</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)' }}>
              {notifications.filter(n => n.title?.toLowerCase().includes('vehicle')).length}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications list */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Card header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>All Notifications</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Page {page} of {totalPages} · {total} total</p>
          </div>
          <span className="tag red" style={{ padding: '4px 12px' }}>{total} Alerts</span>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <span className="material-icons" style={{ fontSize: 36, color: '#2463eb', animation: 'spin 1s linear infinite', display: 'block' }}>sync</span>
            <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Loading notifications…</div>
          </div>
        )}

        {/* Empty */}
        {!loading && notifications.length === 0 && (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <span className="material-icons" style={{ fontSize: 48, color: 'var(--border)', display: 'block', marginBottom: 12 }}>notifications_off</span>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-muted)' }}>No notifications found</div>
          </div>
        )}

        {/* Rows */}
        {!loading && notifications.map((notif, idx) => {
          const { dotColor, bgColor, borderColor, iconName, label } = getNotifStyle(notif.title);
          return (
            <div
              key={notif._id || idx}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 14,
                padding: '14px 24px',
                borderBottom: idx < notifications.length - 1 ? '1px solid #f8fafc' : 'none',
                background: idx % 2 === 0 ? 'var(--bg-sidebar)' : 'var(--bg-main)',
                transition: 'background 0.15s',
                cursor: 'default',
              }}
              onMouseEnter={e => e.currentTarget.style.background = bgColor}
              onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'var(--bg-sidebar)' : 'var(--bg-main)'}
            >
              {/* Icon */}
              <div style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: `${dotColor}18`, border: `1px solid ${borderColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="material-icons" style={{ fontSize: 17, color: dotColor }}>{iconName}</span>
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>{notif.title || 'Notification'}</span>
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 4,
                      background: `${dotColor}18`, color: dotColor, textTransform: 'uppercase', letterSpacing: '0.04em'
                    }}>{label}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0, fontWeight: 600 }}>
                    {notif.createdAt ? timeAgo(notif.createdAt) : ''}
                  </span>
                </div>

                {notif.description && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.5 }}>
                    {notif.description}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 16, marginTop: 4, flexWrap: 'wrap' }}>
                  {notif.vehicleId?.vehicleNumber && (
                    <span style={{ fontSize: 11, color: dotColor, fontWeight: 700 }}>
                      🚗 {notif.vehicleId.vehicleMaker} {notif.vehicleId.vehicleModel} · {notif.vehicleId.vehicleNumber}
                    </span>
                  )}
                  {notif.userId?.name && (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      👤 {notif.userId.name}
                      {notif.userId.email && <span style={{ color: 'var(--text-muted)' }}> · {notif.userId.email}</span>}
                    </span>
                  )}
                  {notif.createdAt && (
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      🕐 {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24 }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
              background: page === 1 ? 'var(--bg-main)' : 'white', color: page === 1 ? 'var(--text-muted)' : 'var(--text-main)',
              fontWeight: 600, fontSize: 13, cursor: page === 1 ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            ← Prev
          </button>

          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            let pg;
            if (totalPages <= 7) {
              pg = i + 1;
            } else if (page <= 4) {
              pg = i + 1;
            } else if (page >= totalPages - 3) {
              pg = totalPages - 6 + i;
            } else {
              pg = page - 3 + i;
            }
            return (
              <button
                key={pg}
                onClick={() => setPage(pg)}
                style={{
                  width: 36, height: 36, borderRadius: 8, border: '1px solid',
                  borderColor: pg === page ? '#2463eb' : 'var(--border)',
                  background: pg === page ? '#2463eb' : 'white',
                  color: pg === page ? 'white' : 'var(--text-muted)',
                  fontWeight: pg === page ? 700 : 500,
                  fontSize: 13, cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.15s',
                }}
              >
                {pg}
              </button>
            );
          })}

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
              background: page === totalPages ? 'var(--bg-main)' : 'white',
              color: page === totalPages ? 'var(--text-muted)' : 'var(--text-main)',
              fontWeight: 600, fontSize: 13,
              cursor: page === totalPages ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

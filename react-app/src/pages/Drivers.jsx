import React from 'react';
import MetricCard from '../components/MetricCard';

const driversData = [
  { name: 'Marcus Sterling', rating: '4.9 (2.4k trips)', statusColor: '#10b981', assignment: 'Freightliner FL80', statusText: '• On Active Route', license: 'Class A CDL', img: 'https://i.pravatar.cc/150?u=m' },
  { name: 'Elena Rodriguez', rating: '4.8 (1.2k trips)', statusColor: '#f59e0b', assignment: 'Unassigned', statusText: '• Mandatory Break', license: 'Class B CDL', img: 'https://i.pravatar.cc/150?u=e' },
  { name: 'Jordan Vane', rating: '5.0 (540 trips)', statusColor: '#10b981', assignment: 'Ford Transit HD', statusText: '• Loading Cargo', license: 'Specialized Haul', img: 'https://i.pravatar.cc/150?u=j' },
  { name: 'Thomas Wright', rating: '4.7 (3.1k trips)', statusColor: '#cbd5e1', assignment: 'On Leave', statusText: '• Offline', license: 'Class A CDL', img: 'https://i.pravatar.cc/150?u=t' },
  { name: 'Sarah Jenkins', rating: '4.9 (890 trips)', statusColor: '#10b981', assignment: 'Peterbilt 579', statusText: '• In Transit', license: 'HazMat Certified', img: 'https://i.pravatar.cc/150?u=s' },
];

function DriverCard({ d }) {
  const isUnassigned = d.assignment === 'Unassigned' || d.assignment === 'On Leave';
  return (
    <div className="driver-grid-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <img src={d.img} alt={d.name} style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: -4, right: -4, width: 14, height: 14, background: d.statusColor, border: '2px solid white', borderRadius: '50%' }} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)' }}>{d.name}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--warning)', marginTop: 4 }}>
              <span className="material-icons" style={{ fontSize: 14 }}>star</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>{d.rating}</span>
            </div>
          </div>
        </div>
        <span className="material-icons" style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>more_vert</span>
      </div>

      <div className="driver-detail-row">
        <span style={{ color: 'var(--text-muted)' }}>Assignment</span>
        <span style={{
          fontWeight: 700,
          color: isUnassigned ? 'var(--text-muted)' : 'var(--primary)',
          background: isUnassigned ? '#f1f5f9' : 'var(--primary-light)',
          padding: '4px 12px',
          borderRadius: 4,
        }}>
          {d.assignment}
        </span>
      </div>
      <div className="driver-detail-row">
        <span style={{ color: 'var(--text-muted)' }}>Status</span>
        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{d.statusText}</span>
      </div>
      <div className="driver-detail-row" style={{ marginBottom: 20 }}>
        <span style={{ color: 'var(--text-muted)' }}>License Type</span>
        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{d.license}</span>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn-secondary">View Logs</button>
        <button className="btn-primary">{isUnassigned ? 'Assign Vehicle' : 'Message'}</button>
      </div>
    </div>
  );
}

export default function Drivers() {
  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Fleet &gt; <span style={{ color: 'var(--primary)' }}>Drivers</span>
          </span>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginTop: 8, marginBottom: 4 }}>Driver Directory</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Manage 124 active personnel and real-time availability across 3 regions.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px' }}>
            <span className="material-icons" style={{ fontSize: 18 }}>calendar_today</span> Date Filters
          </button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px' }}>
            <span className="material-icons" style={{ fontSize: 18 }}>add</span> Quick Add
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="metric-grid">
        <MetricCard label="Total Personnel" value="124" trend="+4%" colorClass="blue" icon="people" />
        <MetricCard label="On Duty" value="98" trend="Stable" colorClass="green" icon="check_circle" />
        <MetricCard label="Resting" value="14" trend="-2h" colorClass="orange" icon="timer" />
        <MetricCard label="Offline" value="12" trend="Alert" colorClass="red" icon="event_busy" />
      </div>

      {/* Driver Grid */}
      <div className="driver-grid">
        {driversData.map((d) => (
          <DriverCard key={d.name} d={d} />
        ))}

        {/* Add New Driver Card */}
        <div style={{
          background: '#f8fafc',
          border: '2px dashed #cbd5e1',
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          textAlign: 'center',
        }}>
          <div style={{
            width: 48,
            height: 48,
            background: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            marginBottom: 16,
          }}>
            <span className="material-icons" style={{ color: 'var(--primary)' }}>person_add</span>
          </div>
          <button className="btn-primary" style={{ width: '100%' }}>+ Quick Dispatch</button>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
            Onboard a new operator to your workspace
          </p>
        </div>
      </div>
    </div>
  );
}

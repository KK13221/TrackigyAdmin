import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const ordersData = [
  { tagText: 'CRITICAL PRIORITY', orderId: '#ORD-8821', title: 'Cold Chain Medical Delivery', route: 'St. Jude Medical Center → Downtown Hub', actionText: 'Assign Now', typeClass: 'critical', timeStr: '14 mins' },
  { tagText: 'STANDARD', orderId: '#ORD-9012', title: 'Retail Electronics Restock', route: 'Global Logistics Park → North Mall', actionText: 'Draft Route', typeClass: 'standard', timeStr: 'Due in 2h 45m' },
  { tagText: 'EXPRESS DELIVERY', orderId: '#ORD-7742', title: 'On-Demand Grocery (Bulk)', route: 'Eastside Warehouse → Resident Zone B', actionText: 'Assign Now', typeClass: 'express', timeStr: 'Waiting 18 mins' },
  { tagText: 'SCHEDULED', orderId: '#ORD-6651', title: 'Industrial Parts Transfer', route: 'Fabrication Plant 4 → Assembly Hall', actionText: 'Review', typeClass: 'standard', timeStr: 'Due tomorrow' },
];

const availableDrivers = [
  { name: 'Marcus L.', status: 'IDLE', statusColor: '#10b981', vehicle: 'Truck #12', fuel: '88%', img: 'https://i.pravatar.cc/150?u=m', showWarning: false },
  { name: 'Sarah J.', status: 'IDLE', statusColor: '#10b981', vehicle: 'Van #84', fuel: '42%', img: 'https://i.pravatar.cc/150?u=s', showWarning: true },
  { name: 'James T.', status: 'RESTING', statusColor: '#3b82f6', vehicle: 'EV 001', fuel: '95%', img: 'https://i.pravatar.cc/150?u=j', showWarning: false },
  { name: 'David W.', status: 'IDLE', statusColor: '#10b981', vehicle: 'Truck #09', fuel: '65%', img: 'https://i.pravatar.cc/150?u=d', showWarning: false },
];

function OrderCard({ order }) {
  let tagColor = '#cbd5e1';
  let tagBg = '#f1f5f9';
  let btnClass = 'btn-secondary';

  if (order.typeClass === 'critical') { tagColor = 'var(--primary-light)'; tagBg = '#eff6ff'; btnClass = 'btn-primary'; }
  else if (order.typeClass === 'express') { tagColor = 'var(--primary)'; tagBg = '#eff6ff'; btnClass = 'btn-primary'; }

  return (
    <div className={`order-card ${order.typeClass}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ background: tagBg, color: tagColor, padding: '4px 8px', borderRadius: 4, fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {order.tagText}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>{order.orderId}</span>
      </div>
      <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>{order.title}</h4>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', marginBottom: 24 }}>
        <span className="material-icons" style={{ fontSize: 14, color: 'var(--primary)' }}>location_on</span>
        <span style={{ fontSize: 12 }}>{order.route}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{order.timeStr}</span>
        <button className={btnClass} style={{ width: 'auto', padding: '8px 16px' }}>{order.actionText}</button>
      </div>
    </div>
  );
}

function AvailableDriverCard({ d }) {
  return (
    <div className="available-driver-card">
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <img src={d.img} alt={d.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)', marginBottom: 2 }}>{d.name}</h4>
          <span style={{ fontSize: 9, fontWeight: 800, color: d.statusColor, textTransform: 'uppercase' }}>{d.status}</span>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 8 }}>
        <span style={{ color: 'var(--text-muted)' }}>Vehicle:</span>
        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{d.vehicle}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
        <span style={{ color: 'var(--text-muted)' }}>Fuel:</span>
        <span style={{ fontWeight: 700, color: d.showWarning ? '#ef4444' : '#10b981' }}>{d.fuel}</span>
      </div>
    </div>
  );
}

const driverIcon1 = L.divIcon({
  className: 'custom-driver-marker',
  html: '<div style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; background-image: url(https://i.pravatar.cc/150?u=e); background-size: cover; box-shadow: 0 4px 12px rgba(0,0,0,0.2);"></div>',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const driverIcon2 = L.divIcon({
  className: 'custom-driver-marker',
  html: '<div style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; background-image: url(https://i.pravatar.cc/150?u=m); background-size: cover; box-shadow: 0 4px 12px rgba(0,0,0,0.2);"></div>',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

export default function Dispatch() {
  return (
    <div className="fade-in">
      <div className="dispatch-layout">
        {/* Left Panel - Orders */}
        <div className="dispatch-left">
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Pending Orders</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>14 active requests requiring assignment</p>
              <a href="#" style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>View All</a>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
            <button className="filter-pill active">All (14)</button>
            <button className="filter-pill">High Priority (4)</button>
            <button className="filter-pill">Express (2)</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: 8 }}>
            {ordersData.map((order) => (
              <OrderCard key={order.orderId} order={order} />
            ))}
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="dispatch-right">
          <MapContainer
            center={[40.7128, -74.006]}
            zoom={13}
            zoomControl={false}
            attributionControl={false}
            style={{ flex: 1, minHeight: 400, borderRadius: 16 }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              maxZoom={19}
            />
            <Marker position={[40.7228, -73.996]} icon={driverIcon1} />
            <Marker position={[40.6978, -74.011]} icon={driverIcon2} />
          </MapContainer>

          {/* Fleet Coverage Overlay */}
          <div className="map-card-overlay">
            <div style={{ width: 32, height: 32, background: '#f1f5f9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-icons" style={{ color: 'var(--primary)', fontSize: 18 }}>satellite_alt</span>
            </div>
            <div>
              <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fleet Coverage</span>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)' }}>92% Optimal Density</div>
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="ai-recommendation-card">
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <img src="https://i.pravatar.cc/150?u=e" alt="Elena" style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <div style={{ position: 'absolute', bottom: 0, right: -8, background: 'white', borderRadius: 4, padding: '2px 4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <span className="material-icons" style={{ fontSize: 12, color: 'var(--primary)' }}>local_shipping</span>
                </div>
              </div>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, display: 'block' }}>AI Recommendation</span>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>Elena R. + Transit #004</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Closest to <strong>#ORD-8821</strong> (4 mins away)</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Route Efficiency</span>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#10b981' }}>98% Efficient</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Saves 12km fuel</div>
              </div>
              <button className="btn-primary" style={{ padding: '12px 24px', width: 'unset' }}>Apply Auto-Routing</button>
            </div>
          </div>
        </div>
      </div>

      {/* Available Drivers */}
      <div style={{ marginTop: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)' }}>Available Drivers</h3>
          <span style={{ background: '#10b98120', color: '#10b981', padding: '4px 8px', borderRadius: 4, fontSize: 10, fontWeight: 800 }}>6 ONLINE</span>
        </div>
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
          {availableDrivers.map((d) => (
            <AvailableDriverCard key={d.name} d={d} />
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import MetricCard from '../components/MetricCard';
import AlertItem from '../components/AlertItem';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function Heatmap() {
  const cells = useMemo(() => {
    return Array.from({ length: 96 }, (_, i) => {
      const level = Math.floor(Math.random() * 5);
      return <div key={i} className={`heatmap-cell ${level > 0 ? `level-${level}` : ''}`} />;
    });
  }, []);

  return (
    <div className="heatmap-container">
      <div className="heatmap-grid">{cells}</div>
    </div>
  );
}

import { BASE_URL } from '../utils/network';

export default function Dashboard({ user }) {
  const [dashboardData, setDashboardData] = React.useState({
    cards: [],
    summary: {
      totalDevices: 0,
      totalCustomers: 0,
      totalActive: 0,
      totalDeactive: 0
    }
  });
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${BASE_URL}/api/count/dashboard`, {
      method: 'GET',
      headers: { 'accept': 'application/json' }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setDashboardData(data.data);
        }
      })
      .catch(err => console.error("Error fetching dashboard data:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const chartData = {
    labels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'],
    datasets: [
      {
        label: 'Actual',
        data: [25, 45, 60, 55, 75, 85],
        backgroundColor: '#2463eb',
        borderRadius: 6,
        barThickness: 24,
      },
      {
        label: 'Projected',
        data: [40, 65, 85, 75, 95, 110],
        backgroundColor: '#bfdbfe',
        borderRadius: 6,
        barThickness: 24,
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9', drawBorder: false },
        ticks: { color: '#94a3b8', font: { size: 10, weight: '600' } },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 10, weight: '600' } },
      },
    },
  };

  const cardsToRender = isLoading
    ? [
        { key: 'total_devices', title: 'Total Devices', value: '...', growthText: '+12.4%', icon: 'device' },
        { key: 'total_customers', title: 'Total Customers', value: '...', growthText: '+5.8%', icon: 'customer' },
        { key: 'total_active', title: 'Total Active', value: '...', badgeText: 'Active', icon: 'active_device' },
        { key: 'total_deactive', title: 'Total Deactive', value: '...', growthText: '-2.1%', icon: 'deactive_device' }
      ]
    : (dashboardData.cards && dashboardData.cards.length > 0
        ? dashboardData.cards
        : [
            { key: 'total_devices', title: 'Total Devices', value: dashboardData.summary?.totalDevices || 0, growthText: '+12.4%', icon: 'device' },
            { key: 'total_customers', title: 'Total Customers', value: dashboardData.summary?.totalCustomers || 0, growthText: '+5.8%', icon: 'customer' },
            { key: 'total_active', title: 'Total Active', value: dashboardData.summary?.totalActive || 0, badgeText: 'Active', icon: 'active_device' },
            { key: 'total_deactive', title: 'Total Deactive', value: dashboardData.summary?.totalDeactive || 0, growthText: '-2.1%', icon: 'deactive_device' }
          ]
      );

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>
          Fleet Intelligence Overview
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Real-time performance metrics and operational capacity.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="metric-grid">
        {cardsToRender.map((card) => {
          let colorClass = 'blue';
          let iconName = 'analytics';

          if (card.key === 'total_devices') {
            colorClass = 'blue';
            iconName = 'analytics';
          } else if (card.key === 'total_customers') {
            colorClass = 'orange';
            iconName = 'eco';
          } else if (card.key === 'total_active') {
            colorClass = 'green';
            iconName = 'local_shipping';
          } else if (card.key === 'total_deactive') {
            colorClass = 'red';
            iconName = 'schedule';
          } else {
            // Fallback icon and styling mappings for future additions
            if (card.icon === 'device') {
              iconName = 'analytics';
              colorClass = 'blue';
            } else if (card.icon === 'customer') {
              iconName = 'eco';
              colorClass = 'orange';
            } else if (card.icon === 'active_device') {
              iconName = 'local_shipping';
              colorClass = 'green';
            } else if (card.icon === 'deactive_device') {
              iconName = 'schedule';
              colorClass = 'red';
            }
          }

          return (
            <MetricCard
              key={card.key}
              label={card.title}
              value={card.value}
              trend={card.growthText || card.badgeText || ''}
              colorClass={colorClass}
              icon={iconName}
            />
          );
        })}
      </div>

      {/* Chart + Alerts */}
      <div className="dashboard-main-grid">
        <div className="card">
          <h3 className="card-title">Revenue Growth & Projections</h3>
          <div style={{ height: 380 }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--primary)' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Actual</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: '#bfdbfe' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Projected</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <h3 className="card-title" style={{ margin: 0 }}>Critical Alerts</h3>
            <span className="tag red">3 Urgent</span>
          </div>
          <AlertItem
            title="Engine Overheat: TX-221"
            text="Route: North-South Corridor. Immediate stop advised."
            type="urgent"
            tag="HIGH PRIORITY"
          />
          <AlertItem
            title="Delayed Shipment: #ORD-44"
            text="Estimated delay: 45 mins due to traffic in Zone B."
            type="priority"
            tag="MODERATE PRIORITY"
          />
          <AlertItem
            title="Geofence Breach: VA-901"
            text="Vehicle exited permitted operational zone."
            type="priority"
            tag="HIGH PRIORITY"
          />
          <a
            href="#"
            style={{
              display: 'block',
              textAlign: 'center',
              color: 'var(--primary)',
              fontSize: 12,
              fontWeight: 700,
              textDecoration: 'none',
              marginTop: 16,
            }}
          >
            View All Incidents
          </a>
        </div>
      </div>

      {/* Heatmap */}
      {/* <div className="card">
        <h3 className="card-title">Fleet Utilization Heatmap</h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>
          Deployment density across active operational zones.
        </p>
        <Heatmap />
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 12,
            marginTop: 24,
          }}
        >
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Low</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {['#bfdbfe', '#60a5fa', '#3b82f6', '#1d4ed8'].map((c) => (
              <div
                key={c}
                style={{ width: 16, height: 16, borderRadius: 2, background: c }}
              />
            ))}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>High</span>
        </div>
      </div> */}
    </div>
  );
}

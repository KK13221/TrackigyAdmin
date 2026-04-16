/* app.js - Total Data Parity Restoration (Phase 10) */

document.addEventListener('DOMContentLoaded', () => {
    const viewport = document.getElementById('viewport');
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = link.getAttribute('data-view');
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            loadView(view);
        });
    });

    function loadView(viewName) {
        viewport.classList.remove('fade-in');
        void viewport.offsetWidth;
        viewport.classList.add('fade-in');

        // Handle edge-to-edge layout adjustments
        if (viewName === 'live-tracking') {
            viewport.style.padding = '0';
            viewport.style.overflow = 'hidden';
            viewport.style.display = 'flex';
        } else {
            viewport.style.padding = '0 40px 40px 40px';
            viewport.style.overflow = 'auto';
            viewport.style.display = 'block';
        }

        switch(viewName) {
            case 'dashboard': renderDashboard(); break;
            case 'live-tracking': renderLiveTracking(); break;
            case 'fleet': renderVehicles(); break;
            case 'vehicles': renderVehicles(); break;
            case 'drivers': renderDrivers(); break;
            case 'orders': renderOrders(); break;
            case 'trips': renderTrips(); break;
            case 'dispatch': renderDispatch(); break;
            case 'reports': renderReports(); break;
            default: renderDashboard();
        }
    }

    /* --- LIVE TRACKING VIEW --- */
    function renderLiveTracking() {
        viewport.innerHTML = `
            <div class="tracking-wrapper">
                <div class="map-pane">
                    <div id="tracking-map" class="map-container"></div>
                    <div class="playback-control">
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <div class="icon-box blue" style="width: 32px; height: 32px;"><span class="material-icons" style="font-size: 16px;">pause</span></div>
                            <div>
                                <p style="font-size: 12px; font-weight: 700; color: var(--text-main);">Route Playback</p>
                                <p style="font-size: 10px; color: var(--text-muted);">October 24, 2023 • 08:42:13 AM</p>
                            </div>
                        </div>
                        <div style="flex: 1; height: 4px; background: #e2e8f0; border-radius: 2px; position: relative; width: 200px;">
                            <div style="position: absolute; left: 0; width: 45%; height: 100%; background: var(--primary); border-radius: 2px;"></div>
                            <div style="position: absolute; left: 45%; top: -4px; width: 12px; height: 12px; background: white; border: 2px solid var(--primary); border-radius: 50%;"></div>
                        </div>
                        <div style="display: flex; gap: 12px; align-items: center;">
                            <span style="font-size: 11px; font-weight: 700; color: var(--primary);">1.5x Speed</span>
                            <span class="material-icons" style="font-size: 16px; color: var(--text-muted);">settings</span>
                        </div>
                    </div>
                </div>
                <div class="details-pane">
                    <div class="pane-header">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                            <span class="tag green" style="background: var(--success-light); color: var(--success);">ON MISSION</span>
                            <span class="material-icons" style="font-size: 18px; color: var(--text-muted);">more_horiz</span>
                        </div>
                        <h2 style="font-size: 20px; font-weight: 800; color: var(--text-main); margin-bottom: 4px;">Freightliner Cascadia</h2>
                        <p style="font-size: 12px; color: var(--text-muted); font-weight: 600;">VIN: 1FUJAGAK9HL • Fleet #402</p>
                    </div>

                    <div class="pane-section" style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                        <div>
                            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 8px;">
                                <span class="material-icons" style="font-size: 14px; color: var(--primary);">local_gas_station</span>
                                <span style="font-size: 10px; font-weight: 700; color: var(--primary); text-transform: uppercase;">Fuel Level</span>
                            </div>
                            <h3 style="font-size: 20px; font-weight: 800; color: var(--text-main);">78<span style="font-size: 12px; color: var(--text-muted); margin-left: 2px;">%</span></h3>
                            <div class="progress-track"><div class="progress-fill" style="width: 78%;"></div></div>
                        </div>
                        <div>
                            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 8px;">
                                <span style="font-size: 10px; font-weight: 700; color: var(--warning); text-transform: uppercase;">Battery/Engine</span>
                            </div>
                            <h3 style="font-size: 20px; font-weight: 800; color: var(--text-main);">92<span style="font-size: 12px; color: var(--text-muted); margin-left: 2px;">%</span></h3>
                            <div class="progress-track"><div class="progress-fill" style="width: 92%; background: var(--success);"></div></div>
                        </div>
                    </div>

                    <div class="pane-section" style="background: var(--primary-light);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <div style="display: flex; align-items: center; gap: 4px;">
                                <span class="material-icons" style="font-size: 14px; color: var(--primary);">speed</span>
                                <span style="font-size: 10px; font-weight: 700; color: var(--primary); text-transform: uppercase;">Current Velocity</span>
                            </div>
                            <span style="font-size: 10px; color: var(--text-muted); font-weight: 600;">LIMIT: 70 MPH</span>
                        </div>
                        <h3 style="font-size: 28px; font-weight: 800; color: var(--primary);">64<span style="font-size: 14px; margin-left: 4px;">MPH</span></h3>
                    </div>

                    <div class="pane-section">
                        <div class="driver-profile-card">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                                <img src="https://i.pravatar.cc/150?u=marcus" style="width: 40px; height: 40px; border-radius: 8px;">
                                <div>
                                    <p style="font-size: 13px; font-weight: 800; color: var(--text-main);">Marcus Sterling</p>
                                    <div style="display: flex; align-items: center; gap: 4px; color: var(--warning);">
                                        <span class="material-icons" style="font-size: 12px;">star</span>
                                        <span style="font-size: 11px; font-weight: 700;">4.9 Safety Rating</span>
                                    </div>
                                </div>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 12px;">
                                <div style="display: flex; justify-content: space-between; font-size: 12px;">
                                    <span style="color: var(--text-muted);">Harsh Braking</span>
                                    <span style="font-weight: 700;">0 today</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; font-size: 12px;">
                                    <span style="color: var(--text-muted);">Idle Time</span>
                                    <span style="font-weight: 700;">12m / 8h</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; font-size: 12px; align-items: center;">
                                    <span style="color: var(--text-muted);">Fatigue Risk</span>
                                    <span class="tag blue" style="background: var(--primary-light); color: var(--primary);">LOW</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="pane-section" style="border-bottom: none; padding-bottom: 40px;">
                        <span style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Route Activity</span>
                        <div class="timeline">
                            <div class="timeline-item">
                                <div class="timeline-dot active"></div>
                                <div>
                                    <span style="font-size: 10px; color: var(--primary); font-weight: 700;">08:42 AM • CURRENT</span>
                                    <p style="font-size: 13px; font-weight: 800; color: var(--text-main); margin-top: 2px;">Passed Checkpoint Alpha</p>
                                    <p style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">I-80 East, Sacramento District</p>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-dot"></div>
                                <div>
                                    <span style="font-size: 10px; color: var(--text-muted); font-weight: 600;">06:15 AM</span>
                                    <p style="font-size: 13px; font-weight: 700; color: var(--text-main); margin-top: 2px;">Refuel Stop Complete</p>
                                    <p style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Shell Station #492 • +120 Gallons</p>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-dot"></div>
                                <div>
                                    <span style="font-size: 10px; color: var(--text-muted); font-weight: 600;">05:00 AM</span>
                                    <p style="font-size: 13px; font-weight: 700; color: var(--text-main); margin-top: 2px;">Departure</p>
                                    <p style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">San Francisco Logistics Hub</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        initTrackingMap();
    }

    /* --- DASHBOARD VIEW --- */
    function renderDashboard() {
        viewport.innerHTML = `
            <div style="margin-bottom: 32px;">
                <h1 style="font-size: 24px; font-weight: 700; color: var(--text-main); margin-bottom: 4px;">Fleet Intelligence Overview</h1>
                <p style="color: var(--text-muted); font-size: 14px;">Real-time performance metrics and operational capacity.</p>
            </div>

            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 32px;">
                ${renderMetricCard('Total Revenue', '$2.48M', '+12.4%', 'blue', 'analytics')}
                ${renderMetricCard('Active Fleet', '1,204 / 1,450', 'Active', 'green', 'local_shipping')}
                ${renderMetricCard('Avg. Delivery Time', '32.5 min', '-2.1%', 'red', 'schedule')}
                ${renderMetricCard('Fuel Efficiency', '18.2 km/L', '+5.8%', 'orange', 'eco')}
            </div>

            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 32px;">
                <div class="card">
                    <h3 class="card-title">Revenue Growth & Projections</h3>
                    <div style="height: 380px;">
                        <canvas id="revenueChart"></canvas>
                    </div>
                    <div style="display: flex; gap: 24px; margin-top: 24px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 12px; height: 12px; border-radius: 3px; background: var(--primary);"></div>
                            <span style="font-size: 12px; font-weight: 600; color: var(--text-muted);">Actual</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 12px; height: 12px; border-radius: 3px; background: #bfdbfe;"></div>
                            <span style="font-size: 12px; font-weight: 600; color: var(--text-muted);">Projected</span>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                        <h3 class="card-title" style="margin: 0;">Critical Alerts</h3>
                        <span class="tag red">3 Urgent</span>
                    </div>
                    ${renderAlert('Engine Overheat: TX-221', 'Route: North-South Corridor. Immediate stop advised.', 'urgent', 'HIGH PRIORITY')}
                    ${renderAlert('Delayed Shipment: #ORD-44', 'Estimated delay: 45 mins due to traffic in Zone B.', 'priority', 'MODERATE PRIORITY')}
                    ${renderAlert('Geofence Breach: VA-901', 'Vehicle exited permitted operational zone.', 'priority', 'HIGH PRIORITY')}
                    
                    <a href="#" style="display: block; text-align: center; color: var(--primary); font-size: 12px; font-weight: 700; text-decoration: none; margin-top: 16px;">View All Incidents</a>
                </div>
            </div>

            <div class="card">
                <h3 class="card-title">Fleet Utilization Heatmap</h3>
                <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 24px;">Deployment density across active operational zones.</p>
                ${renderHeatmap()}
                <div style="display: flex; justify-content: flex-end; align-items: center; gap: 12px; margin-top: 24px;">
                    <span style="font-size: 11px; color: var(--text-muted); font-weight: 600;">Low</span>
                    <div style="display: flex; gap: 4px;">
                        <div style="width: 16px; height: 16px; border-radius: 2px; background: #bfdbfe;"></div>
                        <div style="width: 16px; height: 16px; border-radius: 2px; background: #60a5fa;"></div>
                        <div style="width: 16px; height: 16px; border-radius: 2px; background: #3b82f6;"></div>
                        <div style="width: 16px; height: 16px; border-radius: 2px; background: #1d4ed8;"></div>
                    </div>
                    <span style="font-size: 11px; color: var(--text-muted); font-weight: 600;">High</span>
                </div>
            </div>
        `;
        initDashboardCharts();
    }

    /* --- VEHICLES VIEW (V1) --- */
    function renderVehicles() {
        viewport.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px;">
                <div>
                    <h1 style="font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">Vehicle Management</h1>
                    <p style="color: var(--text-muted); font-size: 14px;">Manage and monitor your 124 active fleet assets</p>
                </div>
                <div style="display: flex; gap: 16px;">
                    <button style="background: #f1f5f9; border: none; color: var(--text-main); font-weight: 700; padding: 12px 20px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                        <span class="material-icons" style="font-size: 18px;">tune</span> Advanced Filters
                    </button>
                    <button style="background: var(--primary); border: none; color: white; font-weight: 700; padding: 12px 24px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                        <span class="material-icons" style="font-size: 18px;">add</span> Add Vehicle
                    </button>
                </div>
            </div>

            <div class="filter-bar">
                <div class="filter-group">
                    <span class="filter-label">Vehicle Model</span>
                    <select class="filter-select">
                        <option>All Models</option>
                    </select>
                </div>
                <div class="filter-group">
                    <span class="filter-label">Fleet Group</span>
                    <select class="filter-select">
                        <option>All Groups</option>
                    </select>
                </div>
                <div class="filter-group">
                    <span class="filter-label">Fuel Type</span>
                    <select class="filter-select">
                        <option>All Types</option>
                    </select>
                </div>
                <div class="filter-group">
                    <span class="filter-label">Status</span>
                    <select class="filter-select">
                        <option>Any Status</option>
                    </select>
                </div>
            </div>

            <div class="card" style="padding: 0; overflow: hidden; margin-bottom: 24px;">
                <table class="vehicle-table" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="text-align: left;">
                            <th>Vehicle Details</th>
                            <th>Driver</th>
                            <th>Fuel Type</th>
                            <th>Health Score</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${renderVehicleV1Row('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=150', 'Mercedes Sprinter X', 'NY-774-B2', 'AM', 'Alex Murphy', 'local_gas_station', 'Diesel', 94, 'EXCELLENT', '#10b981', 'In Transit')}
                        ${renderVehicleV1Row('https://images.unsplash.com/photo-1626668893632-6eacd0b42fdv?w=150', 'Volvo VNL 880', 'TX-221-V9', 'SL', 'Sarah Lopez', 'electric_bolt', 'Electric', 42, 'WARNING', '#3b82f6', 'Maintenance')}
                        ${renderVehicleV1Row('https://images.unsplash.com/photo-1559416523-140b2f0a1ea7?w=150', 'Ford F-150 Raptor', 'CA-102-L4', '--', 'Unassigned', 'local_gas_station', 'Diesel', 82, 'GOOD', '#3b82f6', 'Available')}
                        ${renderVehicleV1Row('https://images.unsplash.com/photo-1517524285303-d6fc683dddf8?w=150', 'Freightliner M2', 'IL-882-C5', 'JD', 'James Dalton', 'local_gas_station', 'Diesel', 18, 'CRITICAL', '#ef4444', 'Engine Alert')}
                    </tbody>
                </table>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
                <span style="font-size: 13px; color: var(--text-muted); font-weight: 600;">Showing <strong>1 - 25</strong> of 124 vehicles</span>
                <div style="display: flex; gap: 8px;">
                    <button class="pagination-btn"><span class="material-icons" style="font-size: 16px;">chevron_left</span></button>
                    <button class="pagination-btn active">1</button>
                    <button class="pagination-btn">2</button>
                    <button class="pagination-btn">3</button>
                    <button class="pagination-btn"><span class="material-icons" style="font-size: 16px;">chevron_right</span></button>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
                ${renderMetricCard('Avg Fuel Efficiency', '14.2 MPG', '+12.4%', 'blue', 'speed')}
                ${renderMetricCard('Routine Maintenance', '12 Units', '3 Overdue', 'orange', 'build')}
                <div class="insight-card">
                    <span style="font-size: 12px; font-weight: 700; background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px;">Smart Dispatch Insight</span>
                    <h3 style="font-size: 18px; font-weight: 800; margin-top: 16px; line-height: 1.4;">3 vehicles can be re-routed to save 12% in fuel.</h3>
                </div>
            </div>
        `;
    }


    /* --- DRIVERS VIEW (V1) --- */
    function renderDrivers() {
        viewport.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px;">
                <div>
                    <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Fleet &gt; <span style="color: var(--primary);">Drivers</span></span>
                    <h1 style="font-size: 28px; font-weight: 800; color: #0f172a; margin-top: 8px; margin-bottom: 4px;">Driver Directory</h1>
                    <p style="color: var(--text-muted); font-size: 14px;">Manage 124 active personnel and real-time availability across 3 regions.</p>
                </div>
                <div style="display: flex; gap: 16px;">
                    <button style="background: white; border: 1px solid var(--border); color: var(--text-main); font-weight: 700; padding: 12px 20px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                        <span class="material-icons" style="font-size: 18px;">calendar_today</span> Date Filters
                    </button>
                    <button style="background: var(--primary); border: none; color: white; font-weight: 700; padding: 12px 24px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                        <span class="material-icons" style="font-size: 18px;">add</span> Quick Add
                    </button>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 32px;">
                ${renderMetricCard('Total Personnel', '124', '+4%', 'blue', 'people')}
                ${renderMetricCard('On Duty', '98', 'Stable', 'green', 'check_circle')}
                ${renderMetricCard('Resting', '14', '-2h', 'orange', 'timer')}
                ${renderMetricCard('Offline', '12', 'Alert', 'red', 'event_busy')}
            </div>

            <div class="driver-grid">
                ${renderGridDriverCard('Marcus Sterling', '4.9 (2.4k trips)', '#10b981', 'Freightliner FL80', '• On Active Route', 'Class A CDL', 'https://i.pravatar.cc/150?u=m')}
                ${renderGridDriverCard('Elena Rodriguez', '4.8 (1.2k trips)', '#f59e0b', 'Unassigned', '• Mandatory Break', 'Class B CDL', 'https://i.pravatar.cc/150?u=e')}
                ${renderGridDriverCard('Jordan Vane', '5.0 (540 trips)', '#10b981', 'Ford Transit HD', '• Loading Cargo', 'Specialized Haul', 'https://i.pravatar.cc/150?u=j')}
                ${renderGridDriverCard('Thomas Wright', '4.7 (3.1k trips)', '#cbd5e1', 'On Leave', '• Offline', 'Class A CDL', 'https://i.pravatar.cc/150?u=t')}
                ${renderGridDriverCard('Sarah Jenkins', '4.9 (890 trips)', '#10b981', 'Peterbilt 579', '• In Transit', 'HazMat Certified', 'https://i.pravatar.cc/150?u=s')}
                <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px; text-align: center;">
                    <div style="width: 48px; height: 48px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-bottom: 16px;">
                        <span class="material-icons" style="color: var(--primary);">person_add</span>
                    </div>
                    <button class="btn-primary" style="width: 100%;">+ Quick Dispatch</button>
                    <p style="font-size: 11px; color: var(--text-muted); margin-top: 12px;">Onboard a new operator to your workspace</p>
                </div>
            </div>
        `;
    }


    /* --- HELPERS --- */
    function renderMetricCard(label, value, trend, colorClass, icon) {
        return `
            <div class="card" style="padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                    <div class="icon-box ${colorClass}">
                        <span class="material-icons" style="font-size: 20px;">${icon}</span>
                    </div>
                    <span style="font-size: 12px; font-weight: 700; color: ${trend.startsWith('+') ? 'var(--success)' : (trend.startsWith('-') ? 'var(--error)' : 'var(--primary)')}; background: ${trend.startsWith('+') ? 'var(--success-light)' : (trend.startsWith('-') ? 'var(--error-light)' : 'var(--primary-light)')}; padding: 2px 8px; border-radius: 4px;">
                        ${trend}
                    </span>
                </div>
                <div>
                    <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">${label}</span>
                    <h2 style="font-size: 22px; font-weight: 800; margin-top: 4px; color: var(--text-main);">${value}</h2>
                </div>
            </div>
        `;
    }

    function renderVehicleV1Row(imgSrc, name, plate, drvInitials, drvName, fuelIcon, fuelType, healthPct, healthText, statusColor, statusText) {
        return `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <img src="${imgSrc}" class="vehicle-thumbnail">
                        <div>
                            <p style="font-size: 13px; font-weight: 800; color: var(--text-main); margin-bottom: 2px;">${name}</p>
                            <span class="vehicle-plate">${plate}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 32px; height: 32px; border-radius: 50%; background: #e2e8f0; color: var(--text-muted); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800;">${drvInitials}</div>
                        <span style="font-size: 13px; font-weight: 600; color: var(--text-main);">${drvName}</span>
                    </div>
                </td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px; color: var(--text-muted);">
                        <span class="material-icons" style="font-size: 16px;">${fuelIcon}</span>
                        <span style="font-size: 12px; font-weight: 600;">${fuelType}</span>
                    </div>
                </td>
                <td>
                    <div style="width: 140px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                            <span style="font-size: 11px; font-weight: 800; color: var(--primary);">${healthPct}%</span>
                            <span style="font-size: 9px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">${healthText}</span>
                        </div>
                        <div class="progress-track" style="margin-top: 0;"><div class="progress-fill" style="width: ${healthPct}%; background: ${statusColor};"></div></div>
                    </div>
                </td>
                <td>
                    <span style="background: ${statusColor}15; color: ${statusColor}; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                        ${statusText.includes('Alert') ? '<span class="material-icons" style="font-size: 12px;">error</span>' : '•'} ${statusText}
                    </span>
                </td>
                <td>
                    <span class="material-icons" style="color: var(--text-muted); cursor: pointer;">more_vert</span>
                </td>
            </tr>
        `;
    }

    function renderGridDriverCard(name, rating, statusColor, assignment, statusText, license, img) {
        return `
            <div class="driver-grid-card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                    <div style="display: flex; gap: 16px; align-items: center;">
                        <div style="position: relative;">
                            <img src="${img}" style="width: 56px; height: 56px; border-radius: 12px; object-fit: cover;">
                            <div style="position: absolute; bottom: -4px; right: -4px; width: 14px; height: 14px; background: ${statusColor}; border: 2px solid white; border-radius: 50%;"></div>
                        </div>
                        <div>
                            <h3 style="font-size: 16px; font-weight: 800; color: var(--text-main);">${name}</h3>
                            <div style="display: flex; align-items: center; gap: 4px; color: var(--warning); margin-top: 4px;">
                                <span class="material-icons" style="font-size: 14px;">star</span>
                                <span style="font-size: 12px; font-weight: 700; color: var(--text-muted);">${rating}</span>
                            </div>
                        </div>
                    </div>
                    <span class="material-icons" style="color: var(--text-muted); cursor: pointer;">more_vert</span>
                </div>
                
                <div class="driver-detail-row">
                    <span style="color: var(--text-muted);">Assignment</span>
                    <span style="font-weight: 700; color: ${assignment === 'Unassigned' ? 'var(--text-muted)' : 'var(--primary)'}; background: ${assignment === 'Unassigned' ? '#f1f5f9' : 'var(--primary-light)'}; padding: 4px 12px; border-radius: 4px;">${assignment}</span>
                </div>
                <div class="driver-detail-row">
                    <span style="color: var(--text-muted);">Status</span>
                    <span style="font-weight: 700; color: var(--text-main);">${statusText}</span>
                </div>
                <div class="driver-detail-row" style="margin-bottom: 20px;">
                    <span style="color: var(--text-muted);">License Type</span>
                    <span style="font-weight: 700; color: var(--text-main);">${license}</span>
                </div>
                
                <div style="display: flex; gap: 12px;">
                    <button class="btn-secondary">View Logs</button>
                    <button class="btn-primary">${assignment === 'Unassigned' ? 'Assign Vehicle' : 'Message'}</button>
                </div>
            </div>
        `;
    }


    function renderAlert(title, text, type, tag) {
        return `
            <div class="alert-item ${type}">
                <div class="icon-box ${type === 'urgent' ? 'red' : 'orange'}">
                    <span class="material-icons" style="font-size: 18px;">${type === 'urgent' ? 'error' : 'warning'}</span>
                </div>
                <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px;">
                        <p style="font-size: 13px; font-weight: 800; color: var(--text-main);">${title}</p>
                    </div>
                    <p style="font-size: 12px; color: var(--text-muted); line-height: 1.4; margin-bottom: 8px;">${text}</p>
                    <span class="tag ${type === 'urgent' ? 'red' : 'orange'}">${tag}</span>
                </div>
            </div>
        `;
    }

    function renderHeatmap() {
        let cells = '';
        for (let i = 0; i < 96; i++) {
            const level = Math.floor(Math.random() * 5);
            cells += `<div class="heatmap-cell ${level > 0 ? 'level-' + level : ''}"></div>`;
        }
        return `
            <div style="display: grid; grid-template-columns: repeat(24, 1fr); gap: 4px;">
                ${cells}
            </div>
        `;
    }

    function initDashboardCharts() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'],
                datasets: [
                    { label: 'Actual', data: [25, 45, 60, 55, 75, 85], backgroundColor: '#2463eb', borderRadius: 6, barThickness: 24 },
                    { label: 'Projected', data: [40, 65, 85, 75, 95, 110], backgroundColor: '#bfdbfe', borderRadius: 6, barThickness: 24 }
                ]
            },
            options: { 
                maintainAspectRatio: false, 
                plugins: { legend: { display: false } }, 
                scales: { 
                    y: { 
                        beginAtZero: true,
                        grid: { color: '#f1f5f9', drawBorder: false },
                        ticks: { color: '#94a3b8', font: { size: 10, weight: '600' } }
                    }, 
                    x: { 
                        grid: { display: false },
                        ticks: { color: '#94a3b8', font: { size: 10, weight: '600' } }
                    } 
                } 
            }
        });
    }

    function initTrackingMap() {
        const mapEl = document.getElementById('tracking-map');
        if (!mapEl) return;
        
        const map = L.map('tracking-map', {
            zoomControl: false,
            attributionControl: false
        }).setView([38.5816, -121.4944], 11);

        // ESRI World Imagery (Dark Satellite Match)
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19
        }).addTo(map);

        // Simulate Route glowing line
        const latlngs = [
            [37.7749, -122.4194],
            [38.0, -122.1],
            [38.3, -121.8],
            [38.5816, -121.4944],
            [38.8, -121.2]
        ];

        // Background glow
        L.polyline(latlngs, {
            color: '#bfdbfe',
            weight: 8,
            opacity: 0.3
        }).addTo(map);

        // Core path
        L.polyline(latlngs, {
            color: '#2463eb',
            weight: 4,
            opacity: 1
        }).addTo(map);

        // Current Location Marker
        const markerHtml = `<div style="width: 16px; height: 16px; background: white; border: 4px solid #2463eb; border-radius: 50%; box-shadow: 0 0 10px rgba(36,99,235,0.5);"></div>`;
        const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: markerHtml,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
        });

        L.marker([38.5816, -121.4944], {icon: customIcon}).addTo(map);
    }

    function renderDispatch() {
        viewport.innerHTML = `
            <div class="dispatch-layout">
                <div class="dispatch-left">
                    <div style="margin-bottom: 24px;">
                        <h2 style="font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">Pending Orders</h2>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <p style="color: var(--text-muted); font-size: 14px;">14 active requests requiring assignment</p>
                            <a href="#" style="color: var(--primary); font-size: 13px; font-weight: 700; text-decoration: none;">View All</a>
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px; margin-bottom: 24px; overflow-x: auto; padding-bottom: 4px;">
                        <span class="filter-pill active">All (14)</span>
                        <span class="filter-pill">High Priority (4)</span>
                        <span class="filter-pill">Express (2)</span>
                    </div>

                    <div style="flex: 1; overflow-y: auto; padding-right: 8px;">
                        ${renderOrderCard('CRITICAL PRIORITY', '#ORD-8821', 'Cold Chain Medical Delivery', 'St. Jude Medical Center &rarr; Downtown Hub', 'Assign Now', 'critical', '14 mins')}
                        ${renderOrderCard('STANDARD', '#ORD-9012', 'Retail Electronics Restock', 'Global Logistics Park &rarr; North Mall', 'Draft Route', 'standard', 'Due in 2h 45m')}
                        ${renderOrderCard('EXPRESS DELIVERY', '#ORD-7742', 'On-Demand Grocery (Bulk)', 'Eastside Warehouse &rarr; Resident Zone B', 'Assign Now', 'express', 'Waiting 18 mins')}
                        ${renderOrderCard('SCHEDULED', '#ORD-6651', 'Industrial Parts Transfer', 'Fabrication Plant 4 &rarr; Assembly Hall', 'Review', 'standard', 'Due tomorrow')}
                    </div>
                </div>

                <div class="dispatch-right">
                    <div id="dispatch-map" style="flex: 1; min-height: 400px; background: #e2e8f0; border-radius: 16px;"></div>
                    <div class="map-card-overlay">
                        <div style="width: 32px; height: 32px; background: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                            <span class="material-icons" style="color: var(--primary); font-size: 18px;">satellite_alt</span>
                        </div>
                        <div>
                            <span style="font-size: 9px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Fleet Coverage</span>
                            <div style="font-size: 14px; font-weight: 800; color: var(--text-main);">92% Optimal Density</div>
                        </div>
                    </div>

                    <div class="ai-recommendation-card">
                        <div style="display: flex; gap: 16px; align-items: center;">
                            <div style="position: relative;">
                                <img src="https://i.pravatar.cc/150?u=e" style="width: 48px; height: 48px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                                <div style="position: absolute; bottom: 0; right: -8px; background: white; border-radius: 4px; padding: 2px 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    <span class="material-icons" style="font-size: 12px; color: var(--primary);">local_shipping</span>
                                </div>
                            </div>
                            <div>
                                <span style="font-size: 10px; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; display: block;">AI Recommendation</span>
                                <div style="font-size: 14px; font-weight: 700; color: var(--text-main);">Elena R. + Transit #004</div>
                                <div style="font-size: 12px; color: var(--text-muted);">Closest to <strong>#ORD-8821</strong> (4 mins away)</div>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 24px;">
                            <div style="text-align: right;">
                                <span style="font-size: 10px; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Route Efficiency</span>
                                <div style="font-size: 14px; font-weight: 800; color: #10b981;">98% Efficient</div>
                                <div style="font-size: 11px; color: var(--text-muted);">Saves 12km fuel</div>
                            </div>
                            <button class="btn-primary" style="padding: 12px 24px; width: unset;">Apply Auto-Routing</button>
                        </div>
                    </div>
                </div>
            </div>

            <div style="margin-top: 32px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                    <h3 style="font-size: 18px; font-weight: 800; color: var(--text-main);">Available Drivers</h3>
                    <span style="background: #10b98120; color: #10b981; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 800;">6 ONLINE</span>
                </div>
                <div style="display: flex; gap: 16px; overflow-x: auto; padding-bottom: 8px;">
                    ${renderAvailableDriver('Marcus L.', 'IDLE', '#10b981', 'Truck #12', '88%', 'https://i.pravatar.cc/150?u=m')}
                    ${renderAvailableDriver('Sarah J.', 'IDLE', '#10b981', 'Van #84', '42%', 'https://i.pravatar.cc/150?u=s', true)}
                    ${renderAvailableDriver('James T.', 'RESTING', '#3b82f6', 'EV 001', '95%', 'https://i.pravatar.cc/150?u=j')}
                    ${renderAvailableDriver('David W.', 'IDLE', '#10b981', 'Truck #09', '65%', 'https://i.pravatar.cc/150?u=d')}
                </div>
            </div>
        `;

        // Initialize Light Map for Dispatch
        setTimeout(() => {
            const mapContainer = document.getElementById('dispatch-map');
            if (mapContainer && typeof L !== 'undefined') {
                if (mapContainer._leaflet_id) {
                    mapContainer._leaflet_id = null;
                }
                const map = L.map('dispatch-map', {
                    zoomControl: false,
                    attributionControl: false
                }).setView([40.7128, -74.0060], 13);
                
                L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                    maxZoom: 19
                }).addTo(map);

                const customIcon = L.divIcon({
                    className: 'custom-driver-marker',
                    html: '<div style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; background-image: url(https://i.pravatar.cc/150?u=e); background-size: cover; box-shadow: 0 4px 12px rgba(0,0,0,0.2);"></div>',
                    iconSize: [36, 36],
                    iconAnchor: [18, 18]
                });
                L.marker([40.7228, -73.9960], {icon: customIcon}).addTo(map);
                
                const customIcon2 = L.divIcon({
                    className: 'custom-driver-marker',
                    html: '<div style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; background-image: url(https://i.pravatar.cc/150?u=m); background-size: cover; box-shadow: 0 4px 12px rgba(0,0,0,0.2);"></div>',
                    iconSize: [36, 36],
                    iconAnchor: [18, 18]
                });
                L.marker([40.6978, -74.0110], {icon: customIcon2}).addTo(map);
            }
        }, 100);
    }

    function renderOrderCard(tagText, orderId, title, route, actionText, typeClass, timeStr) {
        let tagColor = '#cbd5e1';
        let tagBg = '#f1f5f9';
        let btnClass = 'btn-secondary';
        
        if(typeClass === 'critical') { tagColor = 'var(--primary-light)'; tagBg = '#eff6ff'; btnClass = 'btn-primary'; }
        else if(typeClass === 'express') { tagColor = 'var(--primary)'; tagBg = '#eff6ff'; btnClass = 'btn-primary'; }

        return `
            <div class="order-card ${typeClass}">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <span style="background: ${tagBg}; color: ${tagColor}; padding: 4px 8px; border-radius: 4px; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">${tagText}</span>
                    <span style="font-size: 13px; font-weight: 700; color: var(--text-muted);">${orderId}</span>
                </div>
                <h4 style="font-size: 15px; font-weight: 800; color: var(--text-main); margin-bottom: 8px;">${title}</h4>
                <div style="display: flex; align-items: center; gap: 6px; color: var(--text-muted); margin-bottom: 24px;">
                    <span class="material-icons" style="font-size: 14px; color: var(--primary);">location_on</span>
                    <span style="font-size: 12px;">${route}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 12px; font-weight: 600; color: var(--text-muted);">${timeStr}</span>
                    <button class="${btnClass}" style="width: auto; padding: 8px 16px;">${actionText}</button>
                </div>
            </div>
        `;
    }

    function renderAvailableDriver(name, status, statusColor, vehicle, fuelStr, img, showWarning = false) {
        return `
            <div class="available-driver-card">
                <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 16px;">
                    <img src="${img}" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover;">
                    <div>
                        <h4 style="font-size: 14px; font-weight: 800; color: var(--text-main); margin-bottom: 2px;">${name}</h4>
                        <span style="font-size: 9px; font-weight: 800; color: ${statusColor}; text-transform: uppercase;">${status}</span>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 8px;">
                    <span style="color: var(--text-muted);">Vehicle:</span>
                    <span style="font-weight: 700; color: var(--text-main);">${vehicle}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 11px;">
                    <span style="color: var(--text-muted);">Fuel:</span>
                    <span style="font-weight: 700; color: ${showWarning ? '#ef4444' : '#10b981'};">${fuelStr}</span>
                </div>
            </div>
        `;
    }

    function renderReports() {
        viewport.innerHTML = \`
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px;">
                <div>
                    <h1 style="font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">Revenue & Billing</h1>
                    <p style="color: var(--text-muted); font-size: 14px;">Financial analytics mapped directly from the Stitch V1 Report.</p>
                </div>
            </div>
            
            <div class="card" style="min-height: 400px; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                <span class="material-icons" style="font-size: 48px; color: var(--primary); margin-bottom: 16px;">payments</span>
                <h3 style="font-size: 18px; font-weight: 800; color: #0f172a;">Reports Integration Active</h3>
                <p style="color: var(--text-muted); font-size: 14px; margin-top: 8px;">Analytics API synced successfully.</p>
            </div>
        \`;
    }
    
    function renderOrders() {
        renderDispatch();
    }
    
    function renderTrips() {
        renderVehicles();
    }

    loadView('dashboard');
});

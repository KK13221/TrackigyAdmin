import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/network';

const API_GROUPS = [
  {
    id: 'vehicle-control',
    name: 'Vehicle Control',
    icon: 'settings_remote',
    description: 'Manage tank capacities, fuel economy, immobilized lock relays, and upload vehicle display pictures.',
    endpoints: [
      {
        path: '/api/vehicle-control/list',
        method: 'GET',
        summary: 'List Configured Asset Controls',
        fields: []
      },
      {
        path: '/api/vehicle-control/:imei',
        method: 'GET',
        summary: 'Get Specs by Device IMEI',
        fields: [
          { name: 'imei', type: 'text', required: true, placeholder: 'Enter 15-digit IMEI number' }
        ]
      },
      {
        path: '/api/vehicle-control/create',
        method: 'POST_FORM',
        summary: 'Configure New Control Profile',
        fields: [
          { name: 'imei', type: 'text', required: true, placeholder: 'Device IMEI (e.g. 860710085959719)' },
          { name: 'tankCapacity', type: 'number', required: true, placeholder: 'Fuel Tank capacity in Liters (e.g. 60)' },
          { name: 'vehicleMileage', type: 'number', required: true, placeholder: 'Mileage economy in km/L (e.g. 14.5)' },
          { name: 'vehicleLock', type: 'select', required: true, options: ['false', 'true'], placeholder: 'Initial Immobilized Lock State' },
          { name: 'vehicleIcon', type: 'select', required: true, options: ['car', 'suv', 'truck', 'motorcycle'] },
          { name: 'vehicleColor', type: 'color', required: true, defaultValue: '#2463eb' },
          { name: 'vehicleImage', type: 'file', required: false, placeholder: 'Asset cover image file' }
        ]
      },
      {
        path: '/api/vehicle-control/lock-unlock/:imei',
        method: 'PUT',
        summary: 'Toggle Engine Immobilizer',
        fields: [
          { name: 'imei', type: 'text', required: true, placeholder: 'Device IMEI to target' }
        ]
      },
      {
        path: '/api/vehicle-control/delete/:imei',
        method: 'DELETE',
        summary: 'Reset Configuration Profile',
        fields: [
          { name: 'imei', type: 'text', required: true, placeholder: 'Device IMEI to delete' }
        ]
      }
    ]
  },
  {
    id: 'geofence',
    name: 'GeoFence Guard',
    icon: 'shield',
    description: 'Inspect active zones, query geofence coordinates list, and delete custom safety zones.',
    endpoints: [
      {
        path: '/api/geoFance/geofenceData/:imei',
        method: 'GET',
        summary: 'Fetch Geofence by IMEI',
        fields: [
          { name: 'imei', type: 'text', required: true, placeholder: 'Device IMEI to query' }
        ]
      },
      {
        path: '/api/geoFance/update_geofence',
        method: 'POST_JSON',
        summary: 'Update Geofence Coordinates',
        fields: [
          { name: 'imei', type: 'text', required: true, placeholder: 'Device IMEI' },
          { name: 'geofencName', type: 'text', required: true, placeholder: 'Geofence Name (e.g. Headquarters)' },
          { name: 'radius', type: 'number', required: true, placeholder: 'Radius in meters (e.g. 300)' },
          { name: 'latitude', type: 'number', required: true, placeholder: 'Center point Latitude (e.g. 22.7533)' },
          { name: 'longitude', type: 'number', required: true, placeholder: 'Center point Longitude (e.g. 75.8937)' }
        ]
      },
      {
        path: '/api/geoFance/geofenceById/:id',
        method: 'DELETE',
        summary: 'Delete Geofence by Database ID',
        fields: [
          { name: 'id', type: 'text', required: true, placeholder: 'Enter MongoDB _id of geofence' }
        ]
      }
    ]
  },
  {
    id: 'overspeed-alerts',
    name: 'Overspeed Alerts',
    icon: 'speed',
    description: 'Configure and monitor speed limits. Generates instant alerts and trigger notifications.',
    endpoints: [
      {
        path: '/api/overspeed/get-overspeed/:imei',
        method: 'GET',
        summary: 'Get Overspeed Alerts by IMEI',
        fields: [
          { name: 'imei', type: 'text', required: true, placeholder: 'Device IMEI to query' }
        ]
      },
      {
        path: '/api/overspeed/create-alert',
        method: 'POST_JSON',
        summary: 'Create Overspeed Limit',
        fields: [
          { name: 'imei', type: 'text', required: true, placeholder: 'Device IMEI' },
          { name: 'alert_title', type: 'text', required: true, placeholder: 'Alert Title (e.g. Highway Speed Alert)' },
          { name: 'speed_limit', type: 'number', required: true, placeholder: 'Speed limit in km/h (e.g. 120)' },
          { name: 'duration', type: 'number', required: true, placeholder: 'Grace duration in seconds (e.g. 5)' }
        ]
      },
      {
        path: '/api/overspeed/check-overspeed',
        method: 'POST_JSON',
        summary: 'Check Live Vehicle Speed Alert',
        fields: [
          { name: 'imei', type: 'text', required: true, placeholder: 'Device IMEI' },
          { name: 'speed', type: 'number', required: true, placeholder: 'Current speed to evaluate in km/h' }
        ]
      }
    ]
  },
  {
    id: 'vehicle-refuel',
    name: 'Fuel Refuel logs',
    icon: 'local_gas_station',
    description: 'Track vehicle gasoline refilling logs, calculate fuel expenditures, odometer history and spending stats.',
    endpoints: [
      {
        path: '/api/vehicle-refuel/list',
        method: 'GET',
        summary: 'List All Refueling logs',
        fields: []
      },
      {
        path: '/api/vehicle-refuel/:imei',
        method: 'GET',
        summary: 'Get Refuels by Device IMEI',
        fields: [
          { name: 'imei', type: 'text', required: true, placeholder: 'Device IMEI' }
        ]
      },
      {
        path: '/api/vehicle-refuel/fuel-log-details/:imei',
        method: 'GET',
        summary: 'Get Weekly/Monthly Fuel economy & metrics',
        fields: [
          { name: 'imei', type: 'text', required: true, placeholder: 'Device IMEI' }
        ]
      },
      {
        path: '/api/vehicle-refuel/refuel-history/:imei',
        method: 'GET_QUERY',
        summary: 'Get Refueling logs with Time Filters',
        fields: [
          { name: 'imei', type: 'text', required: true, placeholder: 'Device IMEI' },
          { name: 'filter', type: 'select', required: true, options: ['week', 'month', 'year'], defaultValue: 'year' },
          { name: 'sort', type: 'select', required: true, options: ['newest', 'oldest'], defaultValue: 'newest' }
        ]
      },
      {
        path: '/api/vehicle-refuel/create',
        method: 'POST_JSON',
        summary: 'Add New Gasoline Log',
        fields: [
          { name: 'imei', type: 'text', required: true, placeholder: 'Device IMEI' },
          { name: 'refuelDate', type: 'text', required: true, placeholder: 'Refuel Date (YYYY-MM-DD)' },
          { name: 'refuelTime', type: 'text', required: true, placeholder: 'Refuel Time (HH:MM)' },
          { name: 'currentOdometer', type: 'number', required: true, placeholder: 'Odometer reading at gas station' },
          { name: 'totalAmount', type: 'number', required: true, placeholder: 'Total price paid for fuel' },
          { name: 'pricePerLiter', type: 'number', required: true, placeholder: 'Price per Litre' },
          { name: 'tankStatus', type: 'select', required: true, options: ['1', '2'], placeholder: 'Fill Status (1=Full, 2=Partial)' },
          { name: 'fuelBeforeRefuel', type: 'number', required: false, placeholder: 'Fuel before refuel (Required for partial tank)' }
        ]
      }
    ]
  },
  {
    id: 'documents',
    name: 'Asset Documents',
    icon: 'folder_shared',
    description: 'Keep track of driving licenses, registration cards, road permits and auto insurance documents.',
    endpoints: [
      {
        path: '/api/documents/document',
        method: 'POST_FORM',
        summary: 'Upload License/Insurance Document',
        fields: [
          { name: 'imei', type: 'text', required: true, placeholder: 'Device IMEI' },
          { name: 'type', type: 'select', required: true, options: ['personal', 'vehicle', 'bills'] },
          { name: 'subtype', type: 'select', required: true, options: ['driving_license', 'insurance', 'vehicle_rc', 'accessory_bill'] },
          { name: 'title', type: 'text', required: true, placeholder: 'Title (e.g. HDFC ERGO Auto Insurance)' },
          { name: 'expiryDate', type: 'text', required: false, placeholder: 'Expiry Date (YYYY-MM-DD)' },
          { name: 'billingDate', type: 'text', required: false, placeholder: 'Billing Date (YYYY-MM-DD)' },
          { name: 'billingAmount', type: 'number', required: false, placeholder: 'Billing/Purchase Amount' },
          { name: 'shopName', type: 'text', required: false, placeholder: 'Shop or provider name' },
          { name: 'shopContact', type: 'text', required: false, placeholder: 'Provider phone/contact' },
          { name: 'warrantyExpiry', type: 'text', required: false, placeholder: 'Warranty Expiry Date (YYYY-MM-DD)' },
          { name: 'frontImage', type: 'file', required: true, placeholder: 'Front Side image' },
          { name: 'backImage', type: 'file', required: false, placeholder: 'Back Side image (Optional)' }
        ]
      }
    ]
  },
  {
    id: 'data-plans',
    name: 'Data Connection Plans',
    icon: 'wifi',
    description: 'Configure available telemetry subscription plans and view network operator choices.',
    endpoints: [
      {
        path: '/api/data-plan/list',
        method: 'GET',
        summary: 'List All Connection Plans',
        fields: []
      },
      {
        path: '/api/data-plan/create',
        method: 'POST_JSON',
        summary: 'Register New Telemetry Plan',
        fields: [
          { name: 'planName', type: 'text', required: true, placeholder: 'Name (e.g. Fleet Pro Plan)' },
          { name: 'price', type: 'number', required: true, placeholder: 'Plan Cost in USD' },
          { name: 'durationDays', type: 'number', required: true, placeholder: 'Validity period in days (e.g. 30)' },
          { name: 'dataLimitGB', type: 'number', required: true, placeholder: 'Data cap limit in Gigabytes (GB)' }
        ]
      }
    ]
  },
  {
    id: 'app-updates',
    name: 'App Update Releases',
    icon: 'system_update',
    description: 'Review updates log, check latest device firmware version, and dispatch release details.',
    endpoints: [
      {
        path: '/api/app-updates',
        method: 'GET',
        summary: 'Check Latest Software Releases',
        fields: []
      },
      {
        path: '/api/app-updates',
        method: 'POST_JSON',
        summary: 'Deploy Software Release Details',
        fields: [
          { name: 'versionCode', type: 'text', required: true, placeholder: 'Release version code (e.g. 2.1.4)' },
          { name: 'updateTitle', type: 'text', required: true, placeholder: 'Update Title (e.g. Bugfixes & Performance)' },
          { name: 'updateDescription', type: 'text', required: true, placeholder: 'Release notes narrative details' },
          { name: 'platform', type: 'select', required: true, options: ['android', 'ios', 'firmware'] }
        ]
      }
    ]
  },
  {
    id: 'video-tutorials',
    name: 'Video Help Center',
    icon: 'play_circle_filled',
    description: 'Manage administrator educational video catalogs, category tags, and tutorials list.',
    endpoints: [
      {
        path: '/api/video-tutorials-list',
        method: 'GET',
        summary: 'List Available Help Videos',
        fields: []
      },
      {
        path: '/add-video-tutorial',
        method: 'POST_FORM',
        summary: 'Publish New Tutorial Video',
        fields: [
          { name: 'title', type: 'text', required: true, placeholder: 'Tutorial Title' },
          { name: 'description', type: 'text', required: true, placeholder: 'Detailed instructional description' },
          { name: 'videoUrl', type: 'text', required: true, placeholder: 'YouTube/Vimeo Embed link' },
          { name: 'category', type: 'text', required: true, placeholder: 'Category name (e.g. Setup)' }
        ]
      }
    ]
  },
  {
    id: 'user-profiles',
    name: 'User Profiles',
    icon: 'person',
    description: 'Retrieve detailed information for user accounts, credentials, and profile settings by user ID.',
    endpoints: [
      {
        path: '/user/userList/:userId',
        method: 'GET',
        summary: 'Get User Profile by ID',
        fields: [
          { name: 'userId', type: 'text', required: true, placeholder: 'Enter MongoDB user _id (e.g. 69d3a343bcc2861ea8d8d023)' }
        ]
      },
      {
        path: '/api/auth/user-detail/:userDetailId',
        method: 'PUT',
        summary: 'Update User Profile Details',
        fields: [
          { name: 'userDetailId', type: 'text', required: true, placeholder: 'Enter User Detail ID (e.g. 69d3a0a2ee09adeb830d48e0)' },
          { name: 'name', type: 'text', required: true, placeholder: 'First Name (e.g. Sreyansh)' },
          { name: 'middleName', type: 'text', required: false, placeholder: 'Middle Name (e.g. Kumar)' },
          { name: 'lastName', type: 'text', required: false, placeholder: 'Last Name (e.g. Sharma)' },
          { name: 'mobile_number', type: 'text', required: true, placeholder: 'Mobile Number (e.g. 9876543210)' },
          { name: 'email', type: 'text', required: true, placeholder: 'Email Address (e.g. sreyansh12@gmail.com)' },
          { name: 'dateOfBirth', type: 'text', required: false, placeholder: 'Date of Birth (e.g. 1998-05-20)' },
          { name: 'country', type: 'text', required: false, placeholder: 'Country (e.g. India)' },
          { name: 'state', type: 'text', required: false, placeholder: 'State (e.g. Madhya Pradesh)' },
          { name: 'city', type: 'text', required: false, placeholder: 'City (e.g. Indore)' },
          { name: 'address', type: 'text', required: false, placeholder: 'Full Address (e.g. Vijay Nagar, Indore)' }
        ]
      }
    ]
  },
  {
    id: 'help-support',
    name: 'Help & Support',
    icon: 'support',
    description: 'Endpoints for managing call slots, booking calls, reporting vehicle issues, and suggestion management.',
    endpoints: [
      {
        path: '/api/help/call-slots',
        method: 'GET',
        summary: 'Get Available Call Slots'
      },
      {
        path: '/api/help/call-slots',
        method: 'POST',
        summary: 'Create Call Slot (Admin Only)',
        fields: [
          { name: 'slotDate', type: 'text', required: true, placeholder: 'Slot Date (YYYY-MM-DD)' },
          { name: 'startTime', type: 'text', required: true, placeholder: 'Start Time (e.g. 10:00)' },
          { name: 'endTime', type: 'text', required: true, placeholder: 'End Time (e.g. 11:00)' },
          { name: 'displayTime', type: 'text', required: true, placeholder: 'Display Label (e.g. 10:00 AM - 11:00 AM)' },
          { name: 'sortOrder', type: 'text', required: true, placeholder: 'Sort Order (e.g. 1)' },
          { name: 'isAvailable', type: 'text', required: true, placeholder: 'Availability (true/false)' }
        ]
      },
      {
        path: '/api/help/book-call-slot',
        method: 'POST',
        summary: 'Book Call Slot / File Support Issue',
        fields: [
          { name: 'userId', type: 'text', required: true, placeholder: 'User MongoDB ObjectId (e.g. 69d4edbd81a3afcb12e63140)' },
          { name: 'imei', type: 'text', required: true, placeholder: 'Vehicle IMEI number (e.g. 860710085959719)' },
          { name: 'issueType', type: 'text', required: true, placeholder: 'Type: report_issue / suggestion' },
          { name: 'issueRelatedTo', type: 'text', required: true, placeholder: 'Issue Category (e.g. GPS Tracking Issue)' },
          { name: 'description', type: 'text', required: true, placeholder: 'Max 200 char description' },
          { name: 'callSlotId', type: 'text', required: true, placeholder: 'CallSlot MongoDB ObjectId (e.g. 69da237aed0e5121f459bfbd)' }
        ]
      },
      {
        path: '/api/help/my-issues/:userId',
        method: 'GET',
        summary: 'Get Support Issues for a User',
        fields: [
          { name: 'userId', type: 'text', required: true, placeholder: 'User MongoDB ObjectId' }
        ]
      },
      {
        path: '/api/help/suggestions',
        method: 'POST',
        summary: 'Submit Suggestion / Feedback',
        fields: [
          { name: 'userId', type: 'text', required: true, placeholder: 'User MongoDB ObjectId (e.g. 69d4edbd81a3afcb12e63140)' },
          { name: 'suggestionType', type: 'text', required: true, placeholder: 'Suggestion Type (e.g. app_feature)' },
          { name: 'subject', type: 'text', required: true, placeholder: 'Subject (e.g. Dark Mode option)' },
          { name: 'description', type: 'text', required: true, placeholder: 'Details of suggestion (max 200 chars)' }
        ]
      }
    ]
  }
];


export default function ApiDocs() {
  const [selectedGroup, setSelectedGroup] = useState(API_GROUPS[0]);
  const [selectedEndpoint, setSelectedEndpoint] = useState(API_GROUPS[0].endpoints[0]);
  
  // Input fields binding state
  const [inputValues, setInputValues] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedBackFile, setSelectedBackFile] = useState(null);

  // Response panel states
  const [executing, setExecuting] = useState(false);
  const [responseStatus, setResponseStatus] = useState(null);
  const [responseHeaders, setResponseHeaders] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [executedUrl, setExecutedUrl] = useState('');

  // Active IMEIs list loaded from vehicle API to prefill inputs
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    // Sync first endpoint when active group changes
    setSelectedEndpoint(selectedGroup.endpoints[0]);
    setInputValues({});
    setSelectedFile(null);
    setSelectedBackFile(null);
    setResponseData(null);
    setResponseStatus(null);
    setExecutedUrl('');
  }, [selectedGroup]);

  useEffect(() => {
    // Fetch registered vehicles list to helper context on load
    const loadVehicles = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const response = await fetch(`${BASE_URL}/api/vehicle/get-vehicles?userId=${userId}`);
        if (response.ok) {
          const json = await response.json();
          if (json && Array.isArray(json.vehicles)) {
            setVehicles(json.vehicles);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadVehicles();
  }, []);

  const handleFieldChange = (name, value) => {
    setInputValues(prev => ({ ...prev, [name]: value }));
  };

  // Perform backend call mimicking Swagger Interactive Command Center
  const executeCommand = async (e) => {
    e.preventDefault();
    setExecuting(true);
    setResponseStatus(null);
    setResponseHeaders(null);
    setResponseData(null);

    let finalPath = selectedEndpoint.path;
    let queryParams = new URLSearchParams();
    
    // Replace URL parameters like :imei or :id with their bound state inputs
    selectedEndpoint.fields.forEach(field => {
      if (selectedEndpoint.path.includes(`:${field.name}`)) {
        finalPath = finalPath.replace(`:${field.name}`, encodeURIComponent(inputValues[field.name] || ''));
      } else if (selectedEndpoint.method === 'GET_QUERY') {
        if (inputValues[field.name] !== undefined) {
          queryParams.append(field.name, inputValues[field.name]);
        }
      }
    });

    let targetUrl = `${BASE_URL}${finalPath}`;
    if (selectedEndpoint.method === 'GET_QUERY' && queryParams.toString()) {
      targetUrl += `?${queryParams.toString()}`;
    }
    setExecutedUrl(targetUrl);

    try {
      let options = {
        method: selectedEndpoint.method.replace('_JSON', '').replace('_FORM', '').replace('_QUERY', ''),
        headers: {
          'accept': 'application/json'
        }
      };

      // Handle raw JSON POST bodies
      if (selectedEndpoint.method === 'POST_JSON') {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(inputValues);
      } 
      // Handle Multipart Form Post requests (e.g. file uploads, RC cards, covers)
      else if (selectedEndpoint.method === 'POST_FORM') {
        const formData = new FormData();
        selectedEndpoint.fields.forEach(field => {
          if (field.type === 'file') {
            if (field.name === 'frontImage') {
              if (selectedFile) formData.append('frontImage', selectedFile);
            } else if (field.name === 'backImage') {
              if (selectedBackFile) formData.append('backImage', selectedBackFile);
            } else {
              if (selectedFile) formData.append(field.name, selectedFile);
            }
          } else {
            if (inputValues[field.name] !== undefined) {
              formData.append(field.name, inputValues[field.name]);
            }
          }
        });
        options.body = formData;
      }

      const res = await fetch(targetUrl, options);
      setResponseStatus(res.status);
      
      const headersMap = {};
      res.headers.forEach((val, key) => {
        headersMap[key] = val;
      });
      setResponseHeaders(headersMap);

      const text = await res.text();
      try {
        const json = JSON.parse(text);
        setResponseData(json);
      } catch (jsonErr) {
        setResponseData(text || 'Empty response content');
      }
    } catch (err) {
      console.error(err);
      setResponseStatus('CONNECTION_FAILED');
      setResponseData({ error: 'Network error or connection refused connecting to Trackigy Swagger Backend server.' });
    } finally {
      setExecuting(false);
    }
  };

  const getMethodColor = (method) => {
    const raw = method.replace('_JSON', '').replace('_FORM', '').replace('_QUERY', '');
    switch (raw) {
      case 'GET': return '#10b981'; // Green
      case 'POST': return '#2563eb'; // Blue
      case 'PUT': return '#f59e0b'; // Orange
      case 'DELETE': return '#ef4444'; // Red
      default: return '#6b7280';
    }
  };

  return (
    <div className="fade-in" style={{ padding: '0 4px', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Trackify Swagger API JSDoc Command Center</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Direct interactive API client wired to your Swagger routes. Select any controller, input parameters, and run live server commands.
          </p>
        </div>
      </div>

      {/* Main Panel Layout */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr 1fr', gap: 20, overflow: 'hidden' }}>
        
        {/* Left Panel: API Modules List */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '16px', overflowY: 'auto' }}>
          <h4 style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>
            Swagger JSDoc Modules
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {API_GROUPS.map(group => {
              const isActive = selectedGroup.id === group.id;
              return (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: 'none',
                    background: isActive ? 'var(--primary)' : 'transparent',
                    color: isActive ? 'white' : 'var(--text-main)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontWeight: 700,
                    fontSize: 13,
                    fontFamily: "'Inter', sans-serif"
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = '#f1f5f9';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span className="material-icons" style={{ fontSize: 18, color: isActive ? 'white' : 'var(--text-muted)' }}>
                    {group.icon}
                  </span>
                  <span style={{ flex: 1 }}>{group.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Middle Panel: Selected Module Details & Dynamic Input Form */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '20px', overflowY: 'auto' }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-icons" style={{ color: 'var(--primary)', fontSize: 20 }}>{selectedGroup.icon}</span>
              {selectedGroup.name}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 4, lineHeight: 1.5 }}>
              {selectedGroup.description}
            </p>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0 0 20px 0' }} />

          {/* Endpoint Selector Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Select Active Route Path:
            </span>
            {selectedGroup.endpoints.map((ep, idx) => {
              const isSelected = selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;
              const color = getMethodColor(ep.method);
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedEndpoint(ep)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: isSelected ? `2px solid ${color}` : '1px solid var(--border)',
                    background: isSelected ? `${color}06` : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <span 
                    style={{ 
                      fontSize: 9, 
                      fontWeight: 800, 
                      color: 'white', 
                      background: color, 
                      padding: '3px 8px', 
                      borderRadius: 4,
                      width: 58,
                      textAlign: 'center'
                    }}
                  >
                    {ep.method.replace('_JSON', '').replace('_FORM', '').replace('_QUERY', '')}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ep.summary}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ep.path}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Render Active Dynamic Form */}
          <form onSubmit={executeCommand} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Request Parameters Configuration:
            </span>

            {selectedEndpoint.fields.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {selectedEndpoint.fields.map((field) => {
                  const val = inputValues[field.name] || '';
                  
                  // Premium helper context helper: If the input name is 'imei' and we have standard vehicles loaded, offer a helper selection dropdown!
                  if (field.name === 'imei' && vehicles.length > 0) {
                    return (
                      <div key={field.name}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'capitalize' }}>
                          {field.name} {field.required && <strong style={{ color: 'red' }}>*</strong>}
                        </label>
                        <select
                          value={val}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          required={field.required}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'white', outline: 'none' }}
                        >
                          <option value="">-- Select Active Fleet IMEI --</option>
                          {vehicles.map(v => (
                            <option key={v._id} value={v.imei}>
                              {v.vehicleMaker} {v.vehicleModel} - {v.vehicleNumber} ({v.imei})
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  if (field.type === 'select') {
                    return (
                      <div key={field.name}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'capitalize' }}>
                          {field.name} {field.required && <strong style={{ color: 'red' }}>*</strong>}
                        </label>
                        <select
                          value={val}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          required={field.required}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'white', outline: 'none' }}
                        >
                          <option value="">-- Choose option --</option>
                          {field.options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  if (field.type === 'file') {
                    const isFront = field.name === 'frontImage';
                    return (
                      <div key={field.name}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'capitalize' }}>
                          {field.name} {field.required && <strong style={{ color: 'red' }}>*</strong>}
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (isFront) {
                              setSelectedFile(e.target.files[0]);
                            } else {
                              setSelectedBackFile(e.target.files[0]);
                            }
                          }}
                          required={field.required}
                          style={{ width: '100%', fontSize: 12 }}
                        />
                      </div>
                    );
                  }

                  return (
                    <div key={field.name}>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'capitalize' }}>
                        {field.name} {field.required && <strong style={{ color: 'red' }}>*</strong>}
                      </label>
                      <input
                        type={field.type}
                        value={val}
                        placeholder={field.placeholder}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        required={field.required}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'white', outline: 'none' }}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '16px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                💡 This query has no required body parameters. Simply hit Execute below to fetch results directly from your Swagger servers.
              </div>
            )}

            {/* Execute Switch controller */}
            <button
              type="submit"
              className="btn-primary"
              disabled={executing}
              style={{
                marginTop: 'auto',
                height: 46,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: getMethodColor(selectedEndpoint.method),
                border: 'none',
                boxShadow: 'none'
              }}
            >
              {executing ? (
                <>
                  <div className="spinner-mini" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Running Swagger Request...
                </>
              ) : (
                <>
                  <span className="material-icons" style={{ fontSize: 18 }}>send</span>
                  Execute Swagger API Command
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Panel: Live Swagger Response Console */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '20px', overflow: 'hidden' }}>
          <h4 style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
            Interactive Console Response
          </h4>

          {/* Request url banner */}
          {executedUrl && (
            <div style={{ padding: '8px 12px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11, fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: 12 }}>
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>REQUEST URL:</span> {executedUrl}
            </div>
          )}

          {/* Output console */}
          <div 
            style={{ 
              flex: 1, 
              background: '#0f172a', 
              borderRadius: 12, 
              padding: 16, 
              color: '#38bdf8', 
              fontFamily: 'Consolas, Monaco, monospace', 
              fontSize: 12, 
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {executing ? (
              <div style={{ margin: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div className="spinner-mini" style={{ width: 24, height: 24, border: '2px solid rgba(56,189,248,0.2)', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ color: '#94a3b8' }}>Awaiting Swagger Server Response...</span>
              </div>
            ) : responseStatus !== null ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* HTTP Status block */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: 10 }}>
                  <span style={{ color: '#94a3b8' }}>HTTP STATUS STATUS:</span>
                  <span 
                    style={{ 
                      fontWeight: 'bold', 
                      color: responseStatus === 200 || responseStatus === 201 ? '#10b981' : '#ef4444' 
                    }}
                  >
                    {responseStatus}
                  </span>
                </div>

                {/* HTTP Headers block */}
                {responseHeaders && (
                  <div>
                    <span style={{ color: '#94a3b8', fontSize: 10, display: 'block', marginBottom: 4 }}>HEADERS:</span>
                    <pre style={{ margin: 0, padding: 8, background: '#1e293b', borderRadius: 6, color: '#f1f5f9', fontSize: 10, overflowX: 'auto' }}>
                      {JSON.stringify(responseHeaders, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Core JSON content */}
                <div>
                  <span style={{ color: '#94a3b8', fontSize: 10, display: 'block', marginBottom: 4 }}>RESPONSE BODY:</span>
                  <pre style={{ margin: 0, padding: 8, background: '#1e293b', borderRadius: 6, color: '#4ade80', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(responseData, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div style={{ margin: 'auto', textAlign: 'center', color: '#64748b' }}>
                <span className="material-icons" style={{ fontSize: 36, marginBottom: 8, color: '#334155' }}>terminal</span>
                <p>Swagger Command Console is idle.</p>
                <p style={{ fontSize: 10, marginTop: 4 }}>Select a controller path, bind variables, and press Execute to output raw results.</p>
              </div>
            )}
          </div>
        </div>

      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/network';
import TrackifyLoader from '../components/TrackifyLoader';
import Swal from 'sweetalert2';

export default function DataPlans({ user }) {
  const [activeTab, setActiveTab] = useState('catalog');
  const [plans, setPlans] = useState([])
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Creation form state
  const [formData, setFormData] = useState({
    _id: '',
    planName: '',
    durationMonths: 1,
    price: 199,
    originalPrice: 299,
    gstApplicable: true,
    isSuperCombo: false,
    tagText: 'Recommended',
    savingText: 'Save 30%',
    popularText: 'Popular',
    featuresText: 'Real-time Tracking\nGeofence Alerts\nPlayback History (30 days)',
    sortOrder: 1
  });

  // Assign plan state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignData, setAssignData] = useState({
    imei: '',
    planId: '',
    paymentStatus: 'paid',
    amountPaid: ''
  });

  // Selected plan summary state
  const [summaryData, setSummaryData] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Active subscriptions logs state
  const [subscriptions, setSubscriptions] = useState([]);
  const [currentSubsPage, setCurrentSubsPage] = useState(1);
  const subsPerPage = 10;

  // Customer Plus Membership states
  const [membershipStatus, setMembershipStatus] = useState(null);
  const [plusPlan, setPlusPlan] = useState(null);
  const [loadingMembership, setLoadingMembership] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);

  // Selected plan in catalog
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  // Fetch initial plans & vehicle fleet list
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch catalog plans
      const resPlans = await fetch(`${BASE_URL}/api/data-plans/recharge-plans`);
      if (resPlans.ok) {
        const data = await resPlans.json();
        if (Array.isArray(data)) {
          setPlans(data);
        } else if (data && Array.isArray(data.data)) {
          setPlans(data.data);
        } else if (data && data.success && Array.isArray(data.data)) {
          setPlans(data.data);
        } else if (data && Array.isArray(data.result)) {
          setPlans(data.result);
        } else {
          setPlans([]);
        }
      }

      // 2. Fetch fleet vehicles
      const savedUser = user || JSON.parse(localStorage.getItem('user') || '{}');
      const isUserAdmin = ['superadmin'].includes((savedUser.role || '').toLowerCase());
      const userId = savedUser.id || savedUser._id || localStorage.getItem('userId');

      const targetVehiclesUrl = isUserAdmin
        ? `${BASE_URL}/api/vehicle/get-vehicles-list`
        : `${BASE_URL}/api/vehicle/get-vehicles?userId=${userId}`;

      const resVehicles = await fetch(targetVehiclesUrl);
      if (resVehicles.ok) {
        const data = await resVehicles.json();
        const list = data && (data.vehicles || data.data || (Array.isArray(data) ? data : []));
        if (Array.isArray(list)) {
          setVehicles(list);

          // Prefill active subscription plans for vehicles
          const subsList = [];
          for (const vehicle of list) {
            if (!vehicle.imei) {
              subsList.push({
                vehicle,
                plan: null
              });
              continue;
            }
            const resSub = await fetch(`${BASE_URL}/api/data-plans/current-data-plan/${vehicle.imei}`);
            if (resSub.ok) {
              const subJson = await resSub.json();
              if (subJson && subJson.success && subJson.data && subJson.data.currentPlan) {
                subsList.push({
                  vehicle,
                  plan: subJson.data.currentPlan
                });
              } else {
                subsList.push({
                  vehicle,
                  plan: null
                });
              }
            } else {
              subsList.push({
                vehicle,
                plan: null
              });
            }
          }
          setSubscriptions(subsList);
        }
      }

      // 3. Plus membership status for customers
      if (!isUserAdmin && userId) {
        try {
          const resStatus = await fetch(`${BASE_URL}/api/plus-membership/plus-membership/status/${userId}`);
          if (resStatus.ok) {
            const statusJson = await resStatus.json();
            if (statusJson && statusJson.success) {
              setMembershipStatus(statusJson.data);
            }
          }

          const resPlan = await fetch(`${BASE_URL}/api/plus-membership/plus-plan?userId=${userId}`);
          if (resPlan.ok) {
            const planJson = await resPlan.json();
            if (planJson && planJson.success && planJson.data) {
              setPlusPlan(planJson.data);
            }
          }
        } catch (err) {
          console.error("Error loading plus membership details:", err);
        }
      }
    } catch (err) {
      console.error('Error fetching data plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentSubsPage(1);
  }, [searchTerm]);

  // Handle Customer Plus Membership Activation
  const handleActivatePlus = async () => {
    const savedUser = user || JSON.parse(localStorage.getItem('user') || '{}');
    const userId = savedUser.id || savedUser._id || localStorage.getItem('userId');
    if (!userId) {
      Swal.fire("User not logged in!");
      return;
    }

    const planId = plusPlan?.plan?._id;
    if (!planId) {
      Swal.fire("Plus membership plan configuration not found on server.");
      return;
    }

    setLoadingMembership(true);
    try {
      const res = await fetch(`${BASE_URL}/api/plus-membership/plus-membership/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          planId,
          amountPaid: plusPlan?.plan?.price || 499,
          transactionId: `TXN_${Date.now()}`,
          paymentStatus: 'paid'
        })
      });

      if (res.ok) {
        Swal.fire("Congratulations! Your Ajjas Plus Membership is now active!");
        setShowMembershipModal(false);
        loadData();
      } else {
        const errJson = await res.json();
        Swal.fire(`Failed to activate: ${errJson.message || 'Error occurred'}`);
      }
    } catch (err) {
      console.error("Error activating plus membership:", err);
      Swal.fire("Network error activating membership.");
    } finally {
      setLoadingMembership(false);
    }
  };

  // Handle plan creation form submit
  const handleCreatePlan = async (e) => {
    e.preventDefault();

    if (Number(formData.price) <= 0) {
      Swal.fire('Error', 'Price must be greater than 0', 'error');
      return;
    }

    setLoading(true);
    try {
      const featuresArray = formData.featuresText
        .split('\n')
        .map(f => f.trim())
        .filter(f => f.length > 0);

      const payload = {
        planName: formData.planName,
        durationMonths: Number(formData.durationMonths),
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        gstApplicable: formData.gstApplicable,
        isSuperCombo: formData.isSuperCombo,
        tagText: formData.tagText,
        savingText: formData.savingText,
        popularText: formData.popularText,
        features: featuresArray,
        sortOrder: Number(formData.sortOrder)
      };

      const isEdit = !!formData._id;
      const apiUrl = isEdit
        ? `${BASE_URL}/api/data-plans/recharge-plans/${formData._id}`
        : `${BASE_URL}/api/data-plans/recharge-plans`;

      const res = await fetch(apiUrl, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        Swal.fire(`Data recharge plan ${isEdit ? 'updated' : 'created'} successfully!`);
        // Reset form
        setFormData({
          _id: '',
          planName: '',
          durationMonths: 1,
          price: 199,
          originalPrice: 299,
          gstApplicable: true,
          isSuperCombo: false,
          tagText: 'Recommended',
          savingText: 'Save 30%',
          popularText: 'Popular',
          featuresText: 'Real-time Tracking\nGeofence Alerts\nPlayback History (30 days)',
          sortOrder: 1
        });
        setActiveTab('catalog');
        loadData();
      } else {
        const errJson = await res.json();
        Swal.fire(`Failed: ${errJson.message || 'Error occurred'}`);
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Network error creating recharge plan.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/data-plans/recharge-plans/${id}`, {
          method: 'DELETE'
        });
        
        if (res.ok) {
          Swal.fire('Deleted!', 'Data plan has been deleted.', 'success');
          loadData();
        } else {
          const errJson = await res.json();
          Swal.fire(`Failed: ${errJson.message || 'Error occurred'}`);
        }
      } catch (err) {
        console.error(err);
        Swal.fire('Network error deleting recharge plan.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Fetch plan checkout billing summary when select changing in modal
  const fetchCheckoutSummary = async (planId) => {
    if (!planId) {
      setSummaryData(null);
      return;
    }
    setLoadingSummary(true);
    try {
      const res = await fetch(`${BASE_URL}/api/data-plans/recharge-plan-summary/${planId}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success) {
          setSummaryData(data.data);
          // Auto fill payable amount
          setAssignData(prev => ({
            ...prev,
            amountPaid: data.data.billSummary?.payableAmount || ''
          }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSummary(false);
    }
  };

  // Assign selected plan to a vehicle
  const handleAssignPlan = async (e) => {
    e.preventDefault();
    if (!assignData.imei || !assignData.planId) {
      Swal.fire('Please fill out all required fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/data-plans/vehicle-data-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imei: assignData.imei,
          planId: assignData.planId,
          paymentStatus: assignData.paymentStatus,
          amountPaid: Number(assignData.amountPaid || 0)
        })
      });

      if (res.ok) {
        Swal.fire('Plan subscribed and assigned successfully!');
        setIsAssignModalOpen(false);
        setSelectedPlanId(null);
        setAssignData({ imei: '', planId: '', paymentStatus: 'paid', amountPaid: '' });
        setSummaryData(null);
        loadData();
      } else {
        const errJson = await res.json();
        Swal.fire(`Failed to assign: ${errJson.message || 'Error occurred'}`);
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Network error assigning subscription.');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(item => {
    const query = searchTerm.toLowerCase();
    return (
      item.vehicle.vehicleNumber?.toLowerCase().includes(query) ||
      item.vehicle.imei?.toLowerCase().includes(query) ||
      item.vehicle.vehicleMaker?.toLowerCase().includes(query) ||
      item.vehicle.vehicleModel?.toLowerCase().includes(query) ||
      (item.plan?.planName?.toLowerCase().includes(query) || '')
    );
  });

  const totalSubsPages = Math.ceil(filteredSubscriptions.length / subsPerPage) || 1;
  const startSubsIndex = (currentSubsPage - 1) * subsPerPage;
  const paginatedSubscriptions = filteredSubscriptions.slice(startSubsIndex, startSubsIndex + subsPerPage);

  const handleSubsPageChange = (pageNo) => {
    if (pageNo >= 1 && pageNo <= totalSubsPages) {
      setCurrentSubsPage(pageNo);
    }
  };

  const savedUser = user || JSON.parse(localStorage.getItem('user') || '{}');
  const isUserAdmin = ['superadmin'].includes((savedUser.role || '').toLowerCase());

  return (
    <div className="fade-in" style={{ padding: '0 4px', minHeight: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>

      {/* Header bar */}
      <div className="page-header" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>Fleet Connection Data Plans</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Monitor cellular connections, view pricing catalog, configure recharges, and manage billing accounts.
          </p>
        </div> */}

      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
        {[
          { id: 'catalog', label: 'Pricing Catalog', icon: 'local_offer' },
          { id: 'subscriptions', label: 'Active Fleet Recharges', icon: 'supervised_user_circle' },
          isUserAdmin && { id: 'create', label: 'Configure Custom Plan', icon: 'playlist_add' }
        ].filter(Boolean).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              border: 'none',
              background: activeTab === tab.id ? 'var(--primary-light)' : 'transparent',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              borderRadius: 10,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 13,
              fontFamily: "'Inter', sans-serif",
              transition: 'all 0.2s'
            }}
          >
            <span className="material-icons" style={{ fontSize: 18 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
          <TrackifyLoader animated={true} message="Loading telemetry plans database..." size={220} />
        </div>
      )}

      {!loading && (
        <>


          {/* CATALOG TAB */}
          {activeTab === 'catalog' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24, paddingBottom: 40 }}>
              {plans.length > 0 ? (
                plans.map(plan => {
                  const isCombo = plan.isSuperCombo;
                  return (
                    <div
                      key={plan._id}
                      onClick={() => setSelectedPlanId(plan._id)}
                      className="card"
                      style={{
                        position: 'relative',
                        padding: '24px',
                        border: selectedPlanId === plan._id ? '2px solid var(--primary)' : (isCombo ? '2px solid rgba(36, 99, 235, 0.5)' : '1px solid var(--border)'),
                        background: 'var(--bg-sidebar)',
                        borderRadius: 20,
                        boxShadow: selectedPlanId === plan._id ? '0 0 0 4px rgba(36, 99, 235, 0.15), 0 10px 25px -5px rgba(36, 99, 235, 0.15)' : (isCombo ? '0 10px 25px -5px rgba(36, 99, 235, 0.15)' : '0 4px 6px -1px rgba(0,0,0,0.05)'),
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                    >
                      {/* Popular Indicator Ribbons */}
                      {plan.popularText && (
                        <span
                          style={{
                            position: 'absolute',
                            top: 14,
                            right: 14,
                            background: 'var(--warning)',
                            color: 'white',
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '4px 8px',
                            borderRadius: 6,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                          }}
                        >
                          🔥 {plan.popularText}
                        </span>
                      )}

                      {/* Header */}
                      <div style={{ marginBottom: 16 }}>
                        {plan.tagText && (
                          <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>
                            {plan.tagText}
                          </span>
                        )}
                        <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)' }}>{plan.planName}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
                          Validity: <strong>{plan.validityText || `${plan.durationMonths} Months`}</strong>
                        </p>
                      </div>

                      {/* Price Section */}
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 20 }}>
                        <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-main)' }}>₹{plan.price}</span>
                        {Boolean(plan.originalPrice) && (
                          <span style={{ fontSize: 14, textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{plan.originalPrice}</span>
                        )}
                        {plan.savingText && (
                          <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'var(--success-light)' }}>
                            {plan.savingText}
                          </span>
                        )}
                      </div>

                      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0 0 20px 0' }} />

                      {/* Features */}
                      <div style={{ flex: 1, marginBottom: 24 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 12 }}>
                          Included Features:
                        </span>
                        <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {plan.features?.map((feat, idx) => (
                            <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text-main)' }}>
                              <span className="material-icons" style={{ fontSize: 16, color: 'var(--success)' }}>check_circle</span>
                              {feat}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Actions */}
                      {isUserAdmin ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setFormData({
                                  _id: plan._id,
                                  planName: plan.planName,
                                  durationMonths: plan.durationMonths,
                                  price: plan.price,
                                  originalPrice: plan.originalPrice,
                                  gstApplicable: plan.gstApplicable,
                                  isSuperCombo: plan.isSuperCombo,
                                  tagText: plan.tagText || '',
                                  savingText: plan.savingText || '',
                                  popularText: plan.popularText || '',
                                  featuresText: (plan.features || []).join('\n'),
                                  sortOrder: plan.sortOrder || 1
                                });
                                setActiveTab('create');
                              }}
                              style={{ flex: 1, height: 36, borderRadius: 8, background: 'var(--bg-main)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}
                            >
                              <span className="material-icons" style={{ fontSize: 14 }}>edit</span> Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePlan(plan._id);
                              }}
                              style={{ flex: 1, height: 36, borderRadius: 8, background: '#fee2e2', border: '1px solid #fca5a5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#dc2626' }}
                            >
                              <span className="material-icons" style={{ fontSize: 14 }}>delete</span> Delete
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          textAlign: 'center',
                          padding: '10px 0',
                          borderRadius: 12,
                          background: 'var(--bg-main)',
                          border: '1px dashed var(--border)',
                          color: 'var(--text-muted)',
                          fontSize: 12,
                          fontWeight: 700
                        }}>
                          🔒 Available in Dashboard
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                  <span className="material-icons" style={{ fontSize: 48, color: 'var(--border)', marginBottom: 12 }}>rss_feed</span>
                  <p>No connections recharge plans are configured yet.</p>
                  <button onClick={() => setActiveTab('create')} className="btn-primary" style={{ marginTop: 12 }}>Create One Now</button>
                </div>
              )}
            </div>
          )}

          {/* ACTIVE RECHARGES TAB */}
          {activeTab === 'subscriptions' && (
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ position: 'relative', width: 300 }}>
                  <span className="material-icons" style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)', fontSize: 20 }}>search</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by Vehicle Number, IMEI..."
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 40px',
                      borderRadius: 10,
                      border: '1px solid var(--border)',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  />
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>
                  Showing {filteredSubscriptions.length > 0 ? startSubsIndex + 1 : 0} - {Math.min(startSubsIndex + subsPerPage, filteredSubscriptions.length)} of {filteredSubscriptions.length} active fleet devices
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 16px' }}>Vehicle Specs</th>
                      <th style={{ padding: '12px 16px' }}>IMEI Number</th>
                      <th style={{ padding: '12px 16px' }}>Current Data Plan</th>
                      <th style={{ padding: '12px 16px' }}>Assigned Validity</th>
                      <th style={{ padding: '12px 16px' }}>Days Left</th>
                      <th style={{ padding: '12px 16px' }}>Payment Status</th>
                      {isUserAdmin && <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSubscriptions.length > 0 ? (
                      paginatedSubscriptions.map((item, idx) => {
                        const { vehicle, plan } = item;
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                                {vehicle.vehicleMaker} {vehicle.vehicleModel}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                {vehicle.vehicleNumber} ({vehicle.vehicleType})
                              </div>
                            </td>
                            <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-main)' }}>
                              {vehicle.imei}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              {plan ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span className="material-icons" style={{ fontSize: 16, color: 'var(--primary)' }}>wifi_tethering</span>
                                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{plan.planName}</span>
                                </div>
                              ) : (
                                <span style={{ color: 'var(--error)', fontWeight: 700, fontSize: 11, background: 'var(--error-light)', padding: '3px 8px', borderRadius: 6 }}>
                                  🚫 Expired / No Plan
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              {plan ? (
                                <div>
                                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{plan.expiryDateText || 'N/A'}</div>
                                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                                    Started: {plan.startDate ? new Date(plan.startDate).toLocaleDateString() : 'N/A'}
                                  </div>
                                </div>
                              ) : '--'}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              {plan ? (
                                <span
                                  style={{
                                    fontWeight: 800,
                                    color: plan.daysLeft > 30 ? 'var(--success)' : plan.daysLeft > 0 ? 'var(--warning)' : 'var(--error)',
                                    fontSize: 12
                                  }}
                                >
                                  {plan.daysLeft} Days
                                </span>
                              ) : '--'}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              {plan ? (
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    color: plan.paymentStatus === 'paid' ? 'var(--success)' : plan.paymentStatus === 'pending' ? 'var(--warning)' : 'var(--error)',
                                    background: plan.paymentStatus === 'paid' ? 'var(--success-light)' : plan.paymentStatus === 'pending' ? 'var(--warning-light)' : 'var(--error-light)',
                                    padding: '4px 10px',
                                    borderRadius: 6
                                  }}
                                >
                                  {plan.paymentStatus}
                                </span>
                              ) : '--'}
                            </td>
                            {isUserAdmin && (
                              <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                <button
                                  onClick={() => {
                                    setIsAssignModalOpen(true);
                                    setAssignData({ imei: vehicle.imei, planId: '', paymentStatus: 'paid', amountPaid: '' });
                                    setSummaryData(null);
                                  }}
                                  className="btn-secondary"
                                  style={{ padding: '6px 12px', fontSize: 12, borderRadius: 8 }}
                                >
                                  Recharge
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                          No fleet recharges matched search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredSubscriptions.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, padding: '0 8px' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                    Page {currentSubsPage} of {totalSubsPages}
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="pagination-btn" onClick={() => handleSubsPageChange(currentSubsPage - 1)} disabled={currentSubsPage === 1} style={{ opacity: currentSubsPage === 1 ? 0.5 : 1, border: 'none', background: 'var(--bg-main)', borderRadius: '4px', cursor: 'pointer', padding: '4px' }}>
                      <span className="material-icons" style={{ fontSize: 16 }}>chevron_left</span>
                    </button>

                    {Array.from({ length: totalSubsPages }, (_, i) => i + 1).slice(Math.max(0, currentSubsPage - 3), Math.min(totalSubsPages, currentSubsPage + 2)).map(page => (
                      <button
                        key={page}
                        className={`pagination-btn ${currentSubsPage === page ? 'active' : ''}`}
                        onClick={() => handleSubsPageChange(page)}
                        style={{ border: 'none', background: currentSubsPage === page ? 'var(--primary)' : 'var(--bg-main)', color: currentSubsPage === page ? 'white' : 'inherit', borderRadius: '4px', cursor: 'pointer', padding: '4px 10px', fontSize: 13, fontWeight: 700 }}
                      >
                        {page}
                      </button>
                    ))}

                    <button className="pagination-btn" onClick={() => handleSubsPageChange(currentSubsPage + 1)} disabled={currentSubsPage === totalSubsPages} style={{ opacity: currentSubsPage === totalSubsPages ? 0.5 : 1, border: 'none', background: 'var(--bg-main)', borderRadius: '4px', cursor: 'pointer', padding: '4px' }}>
                      <span className="material-icons" style={{ fontSize: 16 }}>chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CONFIGURE CUSTOM PLAN TAB */}
          {activeTab === 'create' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'start', paddingBottom: 40 }}>
              {/* Creator Form */}
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>Configure Plan Details</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 20 }}>
                  Enter marketing badges, values and list included features to publish to the billing database.
                </p>

                <form onSubmit={handleCreatePlan} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                        Plan Name <strong style={{ color: 'red' }}>*</strong>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.planName}
                        onChange={(e) => setFormData(prev => ({ ...prev, planName: e.target.value }))}
                        placeholder="e.g. Annual Unlimited Tracker"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'var(--bg-sidebar)', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                        Duration (Months) <strong style={{ color: 'red' }}>*</strong>
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.durationMonths}
                        onChange={(e) => setFormData(prev => ({ ...prev, durationMonths: e.target.value }))}
                        placeholder="e.g. 12"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'var(--bg-sidebar)', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                        Selling Price (₹) <strong style={{ color: 'red' }}>*</strong>
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="e.g. 1200"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'var(--bg-sidebar)', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                        Original Strike Price (₹)
                      </label>
                      <input
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                        placeholder="e.g. 1500"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'var(--bg-sidebar)', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                        Tag Badge Text
                      </label>
                      <input
                        type="text"
                        value={formData.tagText}
                        onChange={(e) => setFormData(prev => ({ ...prev, tagText: e.target.value }))}
                        placeholder="e.g. Best Value"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'var(--bg-sidebar)', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                        Savings Text Badge
                      </label>
                      <input
                        type="text"
                        value={formData.savingText}
                        onChange={(e) => setFormData(prev => ({ ...prev, savingText: e.target.value }))}
                        placeholder="e.g. Save ₹300"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'var(--bg-sidebar)', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                        Popular Text
                      </label>
                      <input
                        type="text"
                        value={formData.popularText}
                        onChange={(e) => setFormData(prev => ({ ...prev, popularText: e.target.value }))}
                        placeholder="e.g. Popular"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'var(--bg-sidebar)', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                      Features List (One feature per line)
                    </label>
                    <textarea
                      value={formData.featuresText}
                      onChange={(e) => setFormData(prev => ({ ...prev, featuresText: e.target.value }))}
                      rows="4"
                      placeholder="Real-time Tracking&#10;Geofence Alerts&#10;Playback History"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'var(--bg-sidebar)', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 20 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.gstApplicable}
                        onChange={(e) => setFormData(prev => ({ ...prev, gstApplicable: e.target.checked }))}
                        style={{ width: 16, height: 16 }}
                      />
                      Apply tax/GST calculations
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.isSuperCombo}
                        onChange={(e) => setFormData(prev => ({ ...prev, isSuperCombo: e.target.checked }))}
                        style={{ width: 16, height: 16 }}
                      />
                      Mark as Combo/Special Package
                    </label>
                  </div>

                  <button type="submit" className="btn-primary" style={{ height: 46, marginTop: 10 }}>
                    Publish New Recharge Plan
                  </button>
                </form>
              </div>

              {/* Dynamic Preview card */}
              <div style={{ position: 'sticky', top: 20 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 10 }}>
                  Realtime Catalog Preview:
                </span>
                <div
                  className="card"
                  style={{
                    position: 'relative',
                    padding: '24px',
                    border: formData.isSuperCombo ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: 'var(--bg-sidebar)',
                    borderRadius: 20,
                    boxShadow: formData.isSuperCombo ? '0 10px 25px -5px rgba(36, 99, 235, 0.15)' : '0 4px 6px -1px rgba(0,0,0,0.05)',
                  }}
                >
                  {formData.popularText && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 14,
                        right: 14,
                        background: 'var(--warning)',
                        color: 'white',
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '4px 8px',
                        borderRadius: 6,
                        textTransform: 'uppercase'
                      }}
                    >
                      🔥 {formData.popularText}
                    </span>
                  )}

                  <div style={{ marginBottom: 16 }}>
                    {formData.tagText && (
                      <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>
                        {formData.tagText}
                      </span>
                    )}
                    <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)' }}>{formData.planName || 'Annual Unlimited Tracker'}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
                      Validity: <strong>{formData.durationMonths} Months</strong>
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 20 }}>
                    <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-main)' }}>₹{formData.price}</span>
                    {formData.originalPrice && (
                      <span style={{ fontSize: 14, textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{formData.originalPrice}</span>
                    )}
                    {formData.savingText && (
                      <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'var(--success-light)' }}>
                        {formData.savingText}
                      </span>
                    )}
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0 0 20px 0' }} />

                  <div style={{ marginBottom: 24 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 12 }}>
                      Included Features:
                    </span>
                    <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {formData.featuresText.split('\n').filter(f => f.trim().length > 0).map((feat, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text-main)' }}>
                          <span className="material-icons" style={{ fontSize: 16, color: 'var(--success)' }}>check_circle</span>
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button className="btn-primary" disabled style={{ width: '100%', height: 44, borderRadius: 12 }}>
                    Recharge Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ASSIGN / CHECKOUT RECHARGE MODAL */}
      {isAssignModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="card" style={{ width: 480, padding: '24px', position: 'relative', borderRadius: 20, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <button
              onClick={() => { setIsAssignModalOpen(false); setSelectedPlanId(null); }}
              style={{ position: 'absolute', top: 16, right: 16, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <span className="material-icons">close</span>
            </button>

            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-icons" style={{ color: 'var(--primary)' }}>shopping_basket</span>
              Recharge Connection Subscription
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 20 }}>
              Renew or update a selected vehicles cellular link with pre-calculated taxes.
            </p>

            <form onSubmit={handleAssignPlan} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Select IMEI dropdown */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Target Vehicle <strong style={{ color: 'red' }}>*</strong>
                </label>
                <select
                  value={assignData.imei}
                  required
                  onChange={(e) => setAssignData(prev => ({ ...prev, imei: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'var(--bg-sidebar)', outline: 'none' }}
                >
                  <option value="">-- Choose active fleet vehicle --</option>
                  {vehicles.map(v => (
                    <option key={v._id} value={v.imei || ''} disabled={!v.imei}>
                      {v.vehicleMaker} {v.vehicleModel} - {v.vehicleNumber} {v.imei ? `(${v.imei})` : ' [No IMEI Assigned]'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Choose recharge plan */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Recharge Plan Options <strong style={{ color: 'red' }}>*</strong>
                </label>
                <select
                  value={assignData.planId}
                  required
                  onChange={(e) => {
                    setAssignData(prev => ({ ...prev, planId: e.target.value }));
                    fetchCheckoutSummary(e.target.value);
                  }}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'var(--bg-sidebar)', outline: 'none' }}
                >
                  <option value="">-- Select Pricing Plan --</option>
                  {plans.map(p => (
                    <option key={p._id} value={p._id}>{p.planName} (₹{p.price})</option>
                  ))}
                </select>
              </div>

              {/* Plan checkout calculations */}
              {loadingSummary && (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <div className="spinner-mini" style={{ margin: '0 auto 8px auto' }} />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Calculating GST invoice...</span>
                </div>
              )}

              {!loadingSummary && summaryData && (
                <div style={{ padding: 12, background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                    Billing GST Statement:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-main)' }}>
                      <span>Basic Plan Rate:</span>
                      <span>₹{summaryData.billSummary?.planPrice}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-main)' }}>
                      <span>GST Tax ({summaryData.billSummary?.gstPercentage || 18}%):</span>
                      <span>+ ₹{summaryData.billSummary?.gstAmount}</span>
                    </div>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: 'var(--primary)' }}>
                      <span>Final Net Payable:</span>
                      <span>₹{summaryData.billSummary?.payableAmount}</span>
                    </div>
                  </div>
                </div>
              )}

              {isUserAdmin ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                      Custom Paid Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={assignData.amountPaid}
                      onChange={(e) => setAssignData(prev => ({ ...prev, amountPaid: e.target.value }))}
                      placeholder="e.g. 1416"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'var(--bg-sidebar)', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                      Payment Status <strong style={{ color: 'red' }}>*</strong>
                    </label>
                    <select
                      value={assignData.paymentStatus}
                      required
                      onChange={(e) => setAssignData(prev => ({ ...prev, paymentStatus: e.target.value }))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'var(--bg-sidebar)', outline: 'none' }}
                    >
                      <option value="paid">Paid successfully</option>
                      <option value="pending">Pending manual transfer</option>
                      <option value="failed">Failed / Cancelled</option>
                    </select>
                  </div>
                </div>
              ) : (
                /* For Customers, show a clean, read-only premium invoice activation card */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 14px', background: 'var(--success-light)', border: '1px solid var(--success)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: 'var(--success)' }}>
                    <span className="material-icons" style={{ fontSize: 18 }}>verified_user</span>
                    Instant Telematics Activation
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--success)', lineHeight: 1.4 }}>
                    Your vehicle subscription will be updated instantly in our telematics system upon processing.
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => { setIsAssignModalOpen(false); setSelectedPlanId(null); }}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <span className="material-icons">payment</span>
                  {summaryData ? `Pay ₹${assignData.amountPaid || summaryData.billSummary?.payableAmount}` : 'Confirm Recharge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PLUS MEMBERSHIP CHECKOUT MODAL */}
      {showMembershipModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="card" style={{ width: 440, padding: '24px', position: 'relative', borderRadius: 20, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <button
              onClick={() => setShowMembershipModal(false)}
              style={{ position: 'absolute', top: 16, right: 16, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <span className="material-icons">close</span>
            </button>

            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-icons" style={{ color: '#6366f1' }}>stars</span>
              Activate Ajjas Plus Membership
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 20 }}>
              Verify your billing statement below to complete subscription activation.
            </p>

            <div style={{ padding: 16, background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
                Invoice Statement Summary:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-main)' }}>
                  <span>Subscription Option:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{plusPlan?.plan?.planName || 'Ajjas Plus Membership'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-main)' }}>
                  <span>Validity Duration:</span>
                  <span>{plusPlan?.plan?.durationMonths || 12} Months</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-main)' }}>
                  <span>Base Premium Price:</span>
                  <span>₹{plusPlan?.plan?.price || 499}</span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#6366f1' }}>
                  <span>Total Amount Paid:</span>
                  <span>₹{plusPlan?.plan?.price || 499}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => setShowMembershipModal(false)}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleActivatePlus}
                disabled={loadingMembership}
                className="btn-primary"
                style={{
                  flex: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  border: 'none',
                  color: 'white',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
                }}
              >
                {loadingMembership ? (
                  <>
                    <span className="material-icons" style={{ animation: 'spin 1s linear infinite' }}>sync</span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="material-icons">check_circle</span>
                    Pay & Activate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

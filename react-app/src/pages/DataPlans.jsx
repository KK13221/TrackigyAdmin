import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/network';

export default function DataPlans({ user }) {
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog', 'subscriptions', 'create'
  const [plans, setPlans] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Creation form state
  const [formData, setFormData] = useState({
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

  // Customer Plus Membership states
  const [membershipStatus, setMembershipStatus] = useState(null);
  const [plusPlan, setPlusPlan] = useState(null);
  const [loadingMembership, setLoadingMembership] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);

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
      const isUserAdmin = (savedUser.role || '').toLowerCase() === 'admin';
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

  // Handle Customer Plus Membership Activation
  const handleActivatePlus = async () => {
    const savedUser = user || JSON.parse(localStorage.getItem('user') || '{}');
    const userId = savedUser.id || savedUser._id || localStorage.getItem('userId');
    if (!userId) {
      alert("User not logged in!");
      return;
    }

    const planId = plusPlan?.plan?._id;
    if (!planId) {
      alert("Plus membership plan configuration not found on server.");
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
        alert("Congratulations! Your Ajjas Plus Membership is now active!");
        setShowMembershipModal(false);
        loadData();
      } else {
        const errJson = await res.json();
        alert(`Failed to activate: ${errJson.message || 'Error occurred'}`);
      }
    } catch (err) {
      console.error("Error activating plus membership:", err);
      alert("Network error activating membership.");
    } finally {
      setLoadingMembership(false);
    }
  };

  // Handle plan creation form submit
  const handleCreatePlan = async (e) => {
    e.preventDefault();
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

      const res = await fetch(`${BASE_URL}/api/data-plans/recharge-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Data recharge plan created successfully!');
        // Reset form
        setFormData({
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
        alert(`Failed: ${errJson.message || 'Error occurred'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error creating recharge plan.');
    } finally {
      setLoading(false);
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
      alert('Please fill out all required fields');
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
        alert('Plan subscribed and assigned successfully!');
        setIsAssignModalOpen(false);
        setAssignData({ imei: '', planId: '', paymentStatus: 'paid', amountPaid: '' });
        setSummaryData(null);
        loadData();
      } else {
        const errJson = await res.json();
        alert(`Failed to assign: ${errJson.message || 'Error occurred'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Network error assigning subscription.');
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

  const savedUser = user || JSON.parse(localStorage.getItem('user') || '{}');
  const isUserAdmin = (savedUser.role || '').toLowerCase() === 'admin';

  return (
    <div className="fade-in" style={{ padding: '0 4px', minHeight: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header bar */}
      <div className="page-header" style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Fleet Connection Data Plans</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Monitor cellular connections, view pricing catalog, configure recharges, and manage billing accounts.
          </p>
        </div>
        {isUserAdmin && (
          <button 
            onClick={() => {
              setIsAssignModalOpen(true);
              setAssignData({ imei: '', planId: '', paymentStatus: 'paid', amountPaid: '' });
              setSummaryData(null);
            }}
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: 8, height: 42, width: 'auto', maxWidth: '240px', flexShrink: 0, whiteSpace: 'nowrap', padding: '0 20px', borderRadius: 12 }}
          >
            <span className="material-icons">add_shopping_cart</span>
            Recharge Vehicle
          </button>
        )}
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
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
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ margin: '0 auto 16px auto' }}></div>
          <span>Loading telemetry plans database...</span>
        </div>
      )}

      {!loading && (
        <>
          {/* Plus Membership for customers */}
          {!isUserAdmin && activeTab === 'catalog' && (
            <div style={{ marginBottom: 28 }}>
              {membershipStatus?.isPlusMember ? (
                // ACTIVE MEMBER CARD
                <div className="card" style={{
                  background: 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)',
                  borderRadius: 24,
                  padding: '28px 32px',
                  color: 'white',
                  boxShadow: '0 12px 30px rgba(49, 16, 66, 0.25)',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid rgba(253, 224, 71, 0.2)'
                }}>
                  {/* Subtle golden background glow effect */}
                  <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, background: 'radial-gradient(circle, rgba(234, 179, 8, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 20, position: 'relative', zIndex: 1 }}>
                    <div style={{ flex: '1 1 500px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span style={{
                          background: 'linear-gradient(135deg, #eab308, #ca8a04)',
                          color: '#1e1b4b',
                          fontSize: 10,
                          fontWeight: 900,
                          padding: '4px 10px',
                          borderRadius: 20,
                          textTransform: 'uppercase',
                          letterSpacing: 1
                        }}>
                          Active Premium
                        </span>
                        <span style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.7)' }}>Subscription ID: {membershipStatus.membership?._id}</span>
                      </div>
                      <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fef08a', margin: '0 0 10px 0', letterSpacing: -0.5 }}>
                        👑 Ajjas Plus Membership
                      </h2>
                      <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 13, lineHeight: '1.5', maxWidth: 680, margin: '0 0 18px 0' }}>
                        Your premium fleet support package is active. Enjoy exclusive benefits including ultra-precise live telemetry tracking, roadside coverage, and instant safety warnings.
                      </p>
                      
                      {/* Sub benefits grid */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 28px', fontSize: 12, color: 'rgba(255, 255, 255, 0.9)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="material-icons" style={{ color: '#10b981', fontSize: 18 }}>check_circle</span>
                          Unlimited GPS Updates
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="material-icons" style={{ color: '#10b981', fontSize: 18 }}>check_circle</span>
                          Instant Safety Alerts
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="material-icons" style={{ color: '#10b981', fontSize: 18 }}>check_circle</span>
                          Priority support line
                        </div>
                      </div>
                    </div>
                    
                    {/* Expiry / Days left details */}
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 20,
                      padding: '20px 24px',
                      textAlign: 'center',
                      minWidth: 200,
                      flex: '1 1 200px'
                    }}>
                      <span style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Remaining Validity</span>
                      <div style={{ fontSize: 36, fontWeight: 900, color: '#fef08a', margin: '4px 0' }}>
                        {membershipStatus.membership?.daysLeft} <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Days</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.7)', marginTop: 6 }}>
                        Expires: <strong>{membershipStatus.membership?.expiryDate ? new Date(membershipStatus.membership.expiryDate).toLocaleDateString() : 'N/A'}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // UPGRADE CALL-TO-ACTION CARD
                <div className="card" style={{
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  borderRadius: 24,
                  padding: '30px 32px',
                  color: 'white',
                  boxShadow: '0 10px 25px rgba(15, 23, 42, 0.15)',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  {/* Subtle golden background glow effect */}
                  <div style={{ position: 'absolute', top: -80, right: -80, width: 260, height: 260, background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 24, position: 'relative', zIndex: 1 }}>
                    <div style={{ flex: '1 1 500px' }}>
                      <span style={{
                        color: '#a5b4fc',
                        fontSize: 10,
                        fontWeight: 900,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: 'rgba(165, 180, 252, 0.1)',
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        display: 'inline-block',
                        marginBottom: 10
                      }}>
                        ⭐ Exclusive Ajjas Upgrade
                      </span>
                      <h2 style={{ fontSize: 24, fontWeight: 900, color: 'white', margin: '0 0 8px 0', letterSpacing: -0.5 }}>
                        Upgrade to Ajjas Plus Membership
                      </h2>
                      <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: '1.6', maxWidth: 680, margin: '0 0 16px 0' }}>
                        Unlock state-of-the-art telematics diagnostic analytics, instant safety warnings, 30-day detailed playback, and priority customer care. Empower your fleet monitoring with Ajjas Premium.
                      </p>
                      
                      {/* Premium Benefits List */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 24px', fontSize: 12, color: '#cbd5e1' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="material-icons" style={{ color: '#818cf8', fontSize: 16 }}>bolt</span>
                          Advanced Geo-fence Alerts
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="material-icons" style={{ color: '#818cf8', fontSize: 16 }}>restore</span>
                          30-Day Playback Logs
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="material-icons" style={{ color: '#818cf8', fontSize: 16 }}>support_agent</span>
                          24/7 Priority Emergency Support
                        </div>
                      </div>
                    </div>
                    
                    {/* Price and Upgrade Action */}
                    <div style={{
                      textAlign: 'center',
                      minWidth: 200,
                      flex: '1 1 200px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 12
                    }}>
                      <div style={{ marginBottom: 12 }}>
                        <span style={{ fontSize: 12, color: '#94a3b8', display: 'block' }}>All-Inclusive Pricing</span>
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
                          <span style={{ fontSize: 32, fontWeight: 900, color: 'white' }}>₹{plusPlan?.plan?.price || 499}</span>
                          <span style={{ fontSize: 13, color: '#94a3b8' }}>/ Year</span>
                        </div>
                        {plusPlan?.plan?.originalPrice && (
                          <span style={{ fontSize: 12, textDecoration: 'line-through', color: '#64748b' }}>₹{plusPlan.plan.originalPrice}</span>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => setShowMembershipModal(true)}
                        className="btn-primary" 
                        style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                          border: 'none',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: 13,
                          height: 42,
                          borderRadius: 12,
                          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                      >
                        🚀 {plusPlan?.plan?.buttonText || 'Upgrade to Ajjas Plus'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CATALOG TAB */}
          {activeTab === 'catalog' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24, paddingBottom: 40 }}>
              {plans.length > 0 ? (
                plans.map(plan => {
                  const isCombo = plan.isSuperCombo;
                  return (
                    <div 
                      key={plan._id}
                      className="card"
                      style={{
                        position: 'relative',
                        padding: '24px',
                        border: isCombo ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: 'white',
                        borderRadius: 20,
                        boxShadow: isCombo ? '0 10px 25px -5px rgba(36, 99, 235, 0.15)' : '0 4px 6px -1px rgba(0,0,0,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s',
                        cursor: 'default'
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
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
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
                        <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{plan.planName}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
                          Validity: <strong>{plan.validityText || `${plan.durationMonths} Months`}</strong>
                        </p>
                      </div>

                      {/* Price Section */}
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 20 }}>
                        <span style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>₹{plan.price}</span>
                        {plan.originalPrice && (
                          <span style={{ fontSize: 14, textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{plan.originalPrice}</span>
                        )}
                        {plan.savingText && (
                          <span style={{ fontSize: 11, color: '#10b981', fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#10b98110' }}>
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
                              <span className="material-icons" style={{ fontSize: 16, color: '#10b981' }}>check_circle</span>
                              {feat}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Actions */}
                      {isUserAdmin ? (
                        <button 
                          onClick={() => {
                            setIsAssignModalOpen(true);
                            setAssignData({ imei: '', planId: plan._id, paymentStatus: 'paid', amountPaid: '' });
                            fetchCheckoutSummary(plan._id);
                          }}
                          className={isCombo ? "btn-primary" : "btn-secondary"} 
                          style={{ width: '100%', height: 44, borderRadius: 12, fontWeight: 700 }}
                        >
                          Select this Plan
                        </button>
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
                  Showing {filteredSubscriptions.length} of {subscriptions.length} active fleet devices
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
                    {filteredSubscriptions.length > 0 ? (
                      filteredSubscriptions.map((item, idx) => {
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
                            <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 600, color: '#334155' }}>
                              {vehicle.imei}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              {plan ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span className="material-icons" style={{ fontSize: 16, color: 'var(--primary)' }}>wifi_tethering</span>
                                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{plan.planName}</span>
                                </div>
                              ) : (
                                <span style={{ color: '#ef4444', fontWeight: 700, fontSize: 11, background: '#ef444410', padding: '3px 8px', borderRadius: 6 }}>
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
                                    color: plan.daysLeft > 30 ? '#10b981' : plan.daysLeft > 0 ? '#f59e0b' : '#ef4444',
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
                                    color: plan.paymentStatus === 'paid' ? '#10b981' : plan.paymentStatus === 'pending' ? '#f59e0b' : '#ef4444',
                                    background: plan.paymentStatus === 'paid' ? '#10b98115' : plan.paymentStatus === 'pending' ? '#f59e0b15' : '#ef444415',
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
            </div>
          )}

          {/* CONFIGURE CUSTOM PLAN TAB */}
          {activeTab === 'create' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, alignItems: 'start', paddingBottom: 40 }}>
              {/* Creator Form */}
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>Configure Plan Details</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 20 }}>
                  Enter marketing badges, values and list included features to publish to the billing database.
                </p>

                <form onSubmit={handleCreatePlan} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'white', outline: 'none' }}
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
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'white', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                        Selling Price (₹) <strong style={{ color: 'red' }}>*</strong>
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="e.g. 1200"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'white', outline: 'none' }}
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
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'white', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                        Tag Badge Text
                      </label>
                      <input
                        type="text"
                        value={formData.tagText}
                        onChange={(e) => setFormData(prev => ({ ...prev, tagText: e.target.value }))}
                        placeholder="e.g. Best Value"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'white', outline: 'none' }}
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
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'white', outline: 'none' }}
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
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'white', outline: 'none' }}
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
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'white', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
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
                    background: 'white',
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
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
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
                    <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{formData.planName || 'Annual Unlimited Tracker'}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
                      Validity: <strong>{formData.durationMonths} Months</strong>
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 20 }}>
                    <span style={{ fontSize: 28, fontWeight: 900, color: '#0f172a' }}>₹{formData.price}</span>
                    {formData.originalPrice && (
                      <span style={{ fontSize: 14, textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{formData.originalPrice}</span>
                    )}
                    {formData.savingText && (
                      <span style={{ fontSize: 11, color: '#10b981', fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#10b98110' }}>
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
                          <span className="material-icons" style={{ fontSize: 16, color: '#10b981' }}>check_circle</span>
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
              onClick={() => setIsAssignModalOpen(false)}
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
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'white', outline: 'none' }}
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
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'white', outline: 'none' }}
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                      Custom Paid Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={assignData.amountPaid}
                      onChange={(e) => setAssignData(prev => ({ ...prev, amountPaid: e.target.value }))}
                      placeholder="e.g. 1416"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'white', outline: 'none' }}
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
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, background: 'white', outline: 'none' }}
                    >
                      <option value="paid">Paid successfully</option>
                      <option value="pending">Pending manual transfer</option>
                      <option value="failed">Failed / Cancelled</option>
                    </select>
                  </div>
                </div>
              ) : (
                /* For Customers, show a clean, read-only premium invoice activation card */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 14px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#047857' }}>
                    <span className="material-icons" style={{ fontSize: 18 }}>verified_user</span>
                    Instant Telematics Activation
                  </div>
                  <span style={{ fontSize: 11, color: '#065f46', lineHeight: 1.4 }}>
                    Your vehicle subscription will be updated instantly in our telematics system upon processing.
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button 
                  type="button" 
                  onClick={() => setIsAssignModalOpen(false)}
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

            <div style={{ padding: 16, background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 20 }}>
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

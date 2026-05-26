import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/network';

export default function Warranties({ user }) {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [warrantyData, setWarrantyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingOffer, setLoadingOffer] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Checkout Modal State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutSummary, setCheckoutSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [extending, setExtending] = useState(false);
  const [successBanner, setSuccessBanner] = useState(false);

  let savedUser = user || {};
  if (!user) {
    try {
      const rawUser = localStorage.getItem('user');
      if (rawUser && rawUser !== 'undefined') {
        savedUser = JSON.parse(rawUser);
      }
    } catch (e) {
      console.error("Error parsing user in Warranties page:", e);
    }
  }
  const isUserAdmin = (savedUser.role || '').toLowerCase() === 'admin';
  const userId = savedUser.id || savedUser._id || localStorage.getItem('userId');

  // Load all fleet vehicles on mount
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const targetUrl = isUserAdmin
          ? `${BASE_URL}/api/vehicle/get-vehicles-list`
          : `${BASE_URL}/api/vehicle/get-vehicles?userId=${userId}`;

        const response = await fetch(targetUrl);
        if (response.ok) {
          const data = await response.json();
          const list = data && (data.vehicles || data.data || (Array.isArray(data) ? data : []));
          if (Array.isArray(list) && list.length > 0) {
            setVehicles(list);
            // Default select the first vehicle with an IMEI if possible
            const defaultVehicle = list.find(v => v.imei) || list[0];
            setSelectedVehicle(defaultVehicle);
          }
        }
      } catch (err) {
        console.error('Error fetching fleet vehicles in Warranties:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, [user]);

  // Load active warranty details & offers when selected vehicle changes
  useEffect(() => {
    if (!selectedVehicle) return;
    
    // Clear previous details
    setWarrantyData(null);
    setErrorMsg('');
    
    if (!selectedVehicle.imei) {
      setErrorMsg('This vehicle does not have a cellular telemetry device (IMEI) linked.');
      return;
    }

    loadWarrantyData(selectedVehicle.imei);
  }, [selectedVehicle]);

  const loadWarrantyData = async (imei) => {
    setLoadingOffer(true);
    try {
      const res = await fetch(`${BASE_URL}/api/warranty/device-warranty/${imei}`);
      
      if (res.ok) {
        const json = await res.json();
        if (json && json.success) {
          setWarrantyData(json.data);
        }
      } else {
        // If 404 (Warranty plan not found), seed a default package automatically
        if (res.status === 404) {
          console.log('No active plan found, auto-seeding a default package...');
          await autoSeedDefaultPlan();
          // Retry loading warranty details
          const retryRes = await fetch(`${BASE_URL}/api/warranty/device-warranty/${imei}`);
          if (retryRes.ok) {
            const retryJson = await retryRes.json();
            if (retryJson && retryJson.success) {
              setWarrantyData(retryJson.data);
              return;
            }
          }
        }
        setErrorMsg('No active warranty or extension package is available on the server.');
      }
    } catch (err) {
      console.error('Error loading device warranty:', err);
      setErrorMsg('Unable to retrieve warranty configurations from backend.');
    } finally {
      setLoadingOffer(false);
    }
  };

  // Seeding default plan automatically in backend if DB is clean
  const autoSeedDefaultPlan = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/warranty/warranty-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planName: '1 Year Extended Warranty',
          durationMonths: 12,
          originalPrice: 1999,
          offerPrice: 999,
          discountText: 'Special Booster 50% OFF',
          title: 'Extend your Ajjas Protection Plan by 1 Year',
          subtitle: 'Accidental damage & full replacement coverage',
          productName: 'Ajjas Secure Tracker',
          benefits: [
            '100% Free Hardware Device Replacement',
            'Water-Resistance & Physical Liquid Damage Protection',
            'Accidental Short-Circuit & Theft Security Coverage',
            'Priority Fast-Track Tech Support Assistance',
            'Completely Free Installation & Courier Handling'
          ]
        })
      });
      if (res.ok) {
        console.log('Default warranty package successfully seeded!');
      }
    } catch (err) {
      console.error('Failed to auto-seed plan:', err);
    }
  };

  // Launch checkout modal & fetch breakdown
  const handleOpenCheckout = async () => {
    if (!warrantyData?.offer?.planId || !selectedVehicle?.imei) return;
    
    setShowCheckoutModal(true);
    setLoadingSummary(true);
    try {
      const res = await fetch(`${BASE_URL}/api/warranty/warranty-payment-summary/${selectedVehicle.imei}/${warrantyData.offer.planId}`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.success) {
          setCheckoutSummary(json.data);
        }
      }
    } catch (err) {
      console.error('Error fetching warranty summary:', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  // Complete subscription assignment
  const handleConfirmExtension = async () => {
    if (!selectedVehicle?.imei || !warrantyData?.offer?.planId) return;

    setExtending(true);
    try {
      const res = await fetch(`${BASE_URL}/api/warranty/extend-warranty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imei: selectedVehicle.imei,
          planId: warrantyData.offer.planId,
          paymentStatus: 'paid',
          amountPaid: checkoutSummary?.paymentSummary?.payableAmount || warrantyData.offer.offerPrice
        })
      });

      if (res.ok) {
        setSuccessBanner(true);
        setShowCheckoutModal(false);
        setCheckoutSummary(null);
        // Refresh status
        loadWarrantyData(selectedVehicle.imei);
        setTimeout(() => setSuccessBanner(false), 5000);
      } else {
        alert('Could not complete warranty activation. Please contact support.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error validating subscription payment.');
    } finally {
      setExtending(false);
    }
  };

  return (
    <div className="fade-in" style={{ padding: '0 4px', minHeight: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header Panel */}
      <div className="page-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>👑 Device Security & Warranties</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Monitor active hardware protections, view replacement coverage, and secure extended warranty subscriptions.
          </p>
        </div>
      </div>

      {successBanner && (
        <div style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white',
          borderRadius: 16,
          marginBottom: 20,
          boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          animation: 'slideDown 0.3s ease'
        }}>
          <span className="material-icons" style={{ fontSize: 24 }}>verified</span>
          <div>
            <strong style={{ display: 'block', fontSize: 15 }}>Warranty Extended Successfully!</strong>
            <span style={{ fontSize: 12, opacity: 0.9 }}>Your vehicle protection plan has been registered in the telematics core database.</span>
          </div>
        </div>
      )}

      {/* Select Vehicle Dropdown bar */}
      <div className="card" style={{ padding: 18, marginBottom: 24, borderRadius: 16, background: 'white', border: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyItem: 'center', justifyContent: 'center' }}>
            <span className="material-icons" style={{ color: 'var(--primary)', fontSize: 22 }}>shield</span>
          </div>
          <div>
            <strong style={{ fontSize: 14, color: 'var(--text-main)', display: 'block' }}>Choose Insured Vehicle</strong>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Check coverage status of your device</span>
          </div>
        </div>

        <div style={{ minWidth: 280 }}>
          <select
            value={selectedVehicle ? selectedVehicle._id : ''}
            onChange={(e) => {
              const matched = vehicles.find(v => v._id === e.target.value);
              if (matched) setSelectedVehicle(matched);
            }}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', fontSize: 13, background: 'white', fontWeight: 700, outline: 'none' }}
          >
            {vehicles.length === 0 ? (
              <option>No vehicles in fleet...</option>
            ) : (
              vehicles.map(v => {
                if (!v) return null;
                return (
                  <option key={v._id} value={v._id}>
                    {v.vehicleMaker || ''} {v.vehicleModel || ''} - {v.vehicleNumber || ''} {v.imei ? `(${v.imei})` : ' [No Device]'}
                  </option>
                );
              })
            )}
          </select>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ margin: '0 auto 16px auto' }} />
          <p style={{ color: 'var(--text-muted)' }}>Retrieving fleet telemetry data...</p>
        </div>
      )}

      {!loading && errorMsg && (
        <div className="card" style={{ padding: 40, textAlign: 'center', borderRadius: 16 }}>
          <span className="material-icons" style={{ fontSize: 48, color: '#f59e0b', marginBottom: 12 }}>warning_amber</span>
          <h3 style={{ fontSize: 18, color: '#0f172a', fontWeight: 700 }}>Telemetry Notice</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, maxWidth: 440, margin: '8px auto 0 auto' }}>{errorMsg}</p>
        </div>
      )}

      {/* Main Details View */}
      {!loading && !errorMsg && warrantyData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24, paddingBottom: 40 }}>
          
          {/* Active Protection Details Card */}
          <div className="card" style={{ padding: 24, borderRadius: 20, background: 'white', border: '1px solid var(--border)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 10, fontWeight: 900, color: '#10b981', padding: '4px 10px', background: '#10b98115', borderRadius: 8, alignSelf: 'flex-start', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 20 }}>
              🛡️ Active Coverage
            </span>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24 }}>
              <div style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px -4px rgba(16, 185, 129, 0.3)'
              }}>
                <span className="material-icons" style={{ fontSize: 32, color: 'white' }}>verified_user</span>
              </div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Ajjas Hardware Secure</h3>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Device IMEI: {selectedVehicle?.imei}</span>
              </div>
            </div>

            {/* Coverage Timeline List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Days Remaining</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: warrantyData.warranty?.daysLeft > 30 ? '#10b981' : '#f59e0b' }}>
                  {warrantyData.warranty?.daysLeft} Days left
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Insured Expiry Date</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#1e293b' }}>{warrantyData.warranty?.expiryDateText || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Claim Processing</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#3b82f6', background: '#3b82f615', padding: '2px 8px', borderRadius: 6 }}>100% Cashless</span>
              </div>
            </div>

            <div style={{ marginTop: 24, padding: 12, background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
              <strong>🔒 Standard Insurance Notice:</strong> Standard warranty covers manufacturing faults, board hardware short circuits, and telemetry software errors. High impact physical damage requires extended warranty upgrade.
            </div>
          </div>

          {/* Extended Booster Offer Card */}
          {warrantyData.offer && (
            <div className="card" style={{
              padding: 24, 
              borderRadius: 20, 
              background: 'linear-gradient(135deg, #1e1b4b, #311042)', 
              color: 'white',
              position: 'relative', 
              boxShadow: '0 10px 25px -5px rgba(49, 16, 66, 0.3)',
              display: 'flex', 
              flexDirection: 'column'
            }}>
              {/* Special Ribbon */}
              <div style={{
                position: 'absolute',
                top: 14,
                right: 14,
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                fontSize: 10,
                fontWeight: 900,
                padding: '4px 10px',
                borderRadius: 6,
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}>
                🔥 Limited Offer
              </div>

              <span style={{ fontSize: 10, fontWeight: 900, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 12 }}>
                🚀 Booster Extended Protection
              </span>

              <h2 style={{ fontSize: 22, fontWeight: 900, color: 'white', margin: '0 0 4px 0', letterSpacing: -0.5 }}>
                {warrantyData.offer.planName}
              </h2>
              <p style={{ fontSize: 12, color: '#cbd5e1', margin: '0 0 16px 0' }}>
                {warrantyData.offer.title}
              </p>

              {/* Pricing section */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20 }}>
                <span style={{ fontSize: 32, fontWeight: 900, color: 'white' }}>₹{warrantyData.offer.offerPrice}</span>
                <span style={{ fontSize: 16, textDecoration: 'line-through', color: '#94a3b8' }}>₹{warrantyData.offer.originalPrice}</span>
                <span style={{ fontSize: 11, color: '#34d399', fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: 'rgba(52, 211, 153, 0.15)' }}>
                  Save 50%
                </span>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.1)', margin: '0 0 20px 0' }} />

              {/* Benefits Checklist */}
              <div style={{ flex: 1, marginBottom: 24 }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
                  Guaranteed Benefits Included:
                </span>
                <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {warrantyData.offer.benefits?.map((benefit, idx) => {
                    if (!benefit) return null;
                    const benefitText = typeof benefit === 'object'
                      ? `${benefit.title || benefit.text || benefit.name || ''}${benefit.subtitle ? ` - ${benefit.subtitle}` : ''}`
                      : String(benefit);
                    return (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12, color: '#e2e8f0' }}>
                        <span className="material-icons" style={{ fontSize: 16, color: '#34d399', marginTop: 1 }}>check_circle</span>
                        <span>{benefitText}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Extend Trigger button */}
              {isUserAdmin && (
                <button
                  onClick={handleOpenCheckout}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    height: 48,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: 'white',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: 13,
                    boxShadow: '0 6px 14px rgba(245, 158, 11, 0.3)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <span className="material-icons">verified</span>
                  Extend Warranty
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* WARRANTY BILLING CHECKOUT MODAL */}
      {showCheckoutModal && (
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
              onClick={() => setShowCheckoutModal(false)}
              style={{ position: 'absolute', top: 16, right: 16, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <span className="material-icons">close</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyItem: 'center', justifyContent: 'center' }}>
                <span className="material-icons" style={{ color: '#d97706', fontSize: 22 }}>payments</span>
              </div>
              <div>
                <strong style={{ fontSize: 16, color: 'var(--text-main)', display: 'block' }}>Warranty Checkout Invoice</strong>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Confirm payment to secure extended protection</span>
              </div>
            </div>

            {loadingSummary && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div className="spinner-mini" style={{ margin: '0 auto 12px auto' }} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Retrieving secured billing parameters...</span>
              </div>
            )}

            {!loadingSummary && checkoutSummary && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* Device Reference Box */}
                <div style={{ padding: 12, background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>Protected Device:</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-main)' }}>{checkoutSummary.selectedPlan?.productName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>Vehicle Plate:</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-main)' }}>{checkoutSummary.selectedPlan?.vehicleNumber}</span>
                  </div>
                </div>

                {/* Price Statement */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-main)' }}>
                    <span>Standard Coverage Fee:</span>
                    <span>₹{checkoutSummary.paymentSummary?.originalPrice}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 700 }}>
                    <span>{checkoutSummary.paymentSummary?.discountText}:</span>
                    <span>- ₹{checkoutSummary.paymentSummary?.discountAmount}</span>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px dashed var(--border)', margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: 'var(--primary)', fontSize: 15 }}>
                    <span>Final Price (GST Included):</span>
                    <span>₹{checkoutSummary.paymentSummary?.payableAmount}</span>
                  </div>
                </div>

                {/* Activation Alert */}
                <div style={{ display: 'flex', gap: 8, padding: 10, background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, fontSize: 11, color: '#065f46' }}>
                  <span className="material-icons" style={{ fontSize: 16, color: '#10b981' }}>verified_user</span>
                  <span>Extends cellular, motherboard and processing warranty immediately.</span>
                </div>

                {/* Checkout Trigger Actions */}
                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                  <button 
                    type="button" 
                    onClick={() => setShowCheckoutModal(false)}
                    className="btn-secondary" 
                    style={{ flex: 1, height: 44, borderRadius: 10 }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmExtension}
                    disabled={extending}
                    className="btn-primary" 
                    style={{
                      flex: 1.5,
                      height: 44,
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      border: 'none',
                      color: 'white',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    {extending ? (
                      <>
                        <div className="spinner-mini" style={{ borderTopColor: 'white' }} />
                        <span>Activating...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-icons" style={{ fontSize: 18 }}>payment</span>
                        <span>Pay ₹{checkoutSummary.paymentSummary?.payableAmount}</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

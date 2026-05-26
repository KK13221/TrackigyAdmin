import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/network';

export default function Support({ user }) {
  const activeUserId = user?.id || user?._id || localStorage.getItem('userId') || '69d4edbd81a3afcb12e63140';
  const isUserAdmin = (user?.role || '').toLowerCase() === 'admin';

  const [slotData, setSlotData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vehicles list for customer dropdown
  const [vehicles, setVehicles] = useState([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

  const [myIssues, setMyIssues] = useState([]);
  const [isLoadingIssues, setIsLoadingIssues] = useState(false);

  // Suggestions state (Admin side)
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState(null);
  const [adminTab, setAdminTab] = useState('tickets'); // 'tickets' or 'suggestions'

  // Form state for creating a new slot (Admin)
  const [slotDate, setSlotDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [displayTime, setDisplayTime] = useState('');
  const [sortOrder, setSortOrder] = useState(1);
  const [isAvailable, setIsAvailable] = useState(true);
  
  // Form state for booking a slot (Customer)
  const [selectedImei, setSelectedImei] = useState('');
  const [issueType, setIssueType] = useState('report_issue');
  const [issueRelatedTo, setIssueRelatedTo] = useState('GPS Tracking Issue');
  const [description, setDescription] = useState('');
  const [selectedCallSlotId, setSelectedCallSlotId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    fetchSlots();
    if (!isUserAdmin) {
      fetchUserVehicles();
      fetchUserIssues();
    } else {
      // If admin, fetch all support tickets and suggestions
      fetchUserIssues('all');
      fetchSuggestions();
    }
  }, [isUserAdmin, activeUserId]);

  const fetchSuggestions = async () => {
    try {
      setIsLoadingSuggestions(true);
      setSuggestionsError(null);
      const res = await fetch(`${BASE_URL}/api/help/all-suggestions`);
      const json = await res.json();
      if (json.success && json.data) {
        setSuggestions(json.data);
      } else {
        setSuggestionsError(json.message || 'Failed to fetch suggestions');
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setSuggestionsError(err.message || 'Error connecting to server');
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSyncIncidents = () => {
    if (isUserAdmin) {
      fetchUserIssues('all');
      fetchSuggestions();
    } else {
      fetchUserIssues();
    }
  };

  const fetchSlots = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`${BASE_URL}/api/help/call-slots`);
      const json = await res.json();
      if (json.success !== false) {
        setSlotData(json.data || json);
      } else {
        setError(json.message || 'Failed to fetch slots');
      }
    } catch (err) {
      setError(err.message || 'Error connecting to server');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserVehicles = async () => {
    try {
      setIsLoadingVehicles(true);
      const res = await fetch(`${BASE_URL}/api/vehicle/get-vehicles?userId=${activeUserId}`);
      const json = await res.json();
      if (json.status !== false && json.vehicles) {
        setVehicles(json.vehicles);
        if (json.vehicles.length > 0) {
          setSelectedImei(json.vehicles[0].imei || '');
        }
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  const fetchUserIssues = async (mode = 'user') => {
    try {
      setIsLoadingIssues(true);
      const targetUrl = mode === 'all' 
        ? `${BASE_URL}/api/help/my-issues/${activeUserId}` // Fetch active session issues
        : `${BASE_URL}/api/help/my-issues/${activeUserId}`;
      const res = await fetch(targetUrl);
      const json = await res.json();
      if (json.success && json.data) {
        setMyIssues(json.data);
      }
    } catch (err) {
      console.error('Error fetching user issues:', err);
    } finally {
      setIsLoadingIssues(false);
    }
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const res = await fetch(`${BASE_URL}/api/help/call-slots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slotDate,
          startTime,
          endTime,
          displayTime,
          sortOrder: Number(sortOrder),
          isAvailable
        }),
      });
      const json = await res.json();
      if (res.ok && json.success !== false) {
        setSubmitMessage('Call Slot created successfully!');
        setSlotDate('');
        setStartTime('');
        setEndTime('');
        setDisplayTime('');
        setSortOrder(1);
        setIsAvailable(true);
        fetchSlots(); // Refresh the list
      } else {
        setSubmitMessage(`Error: ${json.message || 'Failed to create slot'}`);
      }
    } catch (err) {
      setSubmitMessage(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookCallSlot = async (e) => {
    e.preventDefault();
    if (!selectedCallSlotId) {
      setSubmitMessage('Error: Please select a call slot from the active listings.');
      return;
    }
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const res = await fetch(`${BASE_URL}/api/help/book-call-slot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: activeUserId,
          imei: selectedImei,
          issueType,
          issueRelatedTo,
          description,
          callSlotId: selectedCallSlotId
        }),
      });
      const json = await res.json();
      if (res.ok && json.success !== false) {
        setSubmitMessage('Your support call has been booked successfully! Our technician will reach out shortly.');
        setDescription('');
        setSelectedCallSlotId('');
        fetchSlots(); // Refresh availability
        fetchUserIssues(); // Sync tickets
      } else {
        setSubmitMessage(`Error: ${json.message || 'Failed to book slot'}`);
      }
    } catch (err) {
      setSubmitMessage(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-content" style={{ padding: '30px', background: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Top Banner */}
      <div className="page-header" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="material-icons" style={{ color: 'var(--primary)', fontSize: '32px' }}>support_agent</span>
            {slotData?.screenTitle || 'Help & Support'}
          </h1>
          <p className="page-subtitle" style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '14px' }}>
            {isUserAdmin 
              ? 'Administrator dashboard panel to schedule slot configurations and view support incidents.'
              : 'Direct communication portal. File support incidents and book premium diagnostics calls.'}
          </p>
        </div>
        <span className="tag" style={{
          background: isUserAdmin ? 'var(--primary-light)' : 'rgba(16, 185, 129, 0.1)',
          color: isUserAdmin ? 'var(--primary)' : '#10b981',
          fontSize: '11px',
          fontWeight: 700,
          padding: '6px 14px',
          borderRadius: '20px',
          textTransform: 'uppercase'
        }}>
          {isUserAdmin ? 'Admin Control' : 'Customer Console'}
        </span>
      </div>

      {slotData?.importantDescription && (
        <div style={{
          background: 'white',
          borderLeft: '5px solid #eab308',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '30px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <span className="material-icons" style={{ color: '#eab308', fontSize: '36px' }}>warning</span>
          <div>
            <h4 style={{ margin: '0 0 4px 0', color: '#854d0e', fontWeight: 800, fontSize: '15px' }}>
              {slotData.importantTitle || 'Important Notice'}
            </h4>
            <p style={{ margin: 0, color: '#a16207', fontSize: '13px', lineHeight: '1.5' }}>
              {slotData.importantDescription}
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
        
        {/* Left Column: Context Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {!isUserAdmin ? (
            /* CUSTOMER VIEW: Book Call Slot Form */
            <div className="card" style={{ padding: '30px', background: 'white', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-icons" style={{ color: 'var(--primary)' }}>bookmark_add</span>
                File a Support Request & Book Call
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Select your vehicle, choose the issue type, click an available slot from the right panel, and submit your request.
              </p>

              <form onSubmit={handleBookCallSlot} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Select Vehicle</label>
                    {isLoadingVehicles ? (
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading vehicles...</div>
                    ) : (
                      <select
                        value={selectedImei}
                        onChange={(e) => setSelectedImei(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', fontSize: '13px', outline: 'none' }}
                        required
                      >
                        {vehicles.length === 0 ? (
                          <option value="">No Active Vehicles Found</option>
                        ) : (
                          vehicles.map(v => (
                            <option key={v._id || v.imei} value={v.imei}>
                              {v.vehicleMaker ? `${v.vehicleMaker} ${v.vehicleModel || ''}` : (v.vehicleName || v.displayName || 'Vehicle')} ({v.vehicleNumber || v.imei})
                            </option>
                          ))
                        )}
                      </select>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Vehicle IMEI</label>
                    <input
                      type="text"
                      placeholder="e.g. 860710086022855"
                      value={selectedImei}
                      onChange={(e) => setSelectedImei(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', outline: 'none', background: '#f8fafc' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Request Type</label>
                    <select
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', fontSize: '13px', outline: 'none' }}
                    >
                      <option value="report_issue">Report Issue / Bug</option>
                      <option value="suggestion">Suggestion / Feedback</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Issue Category</label>
                  <select
                    value={issueRelatedTo}
                    onChange={(e) => setIssueRelatedTo(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', fontSize: '13px', outline: 'none' }}
                  >
                    <option value="GPS Tracking Issue">GPS Tracking Issue (Location not updating)</option>
                    <option value="Engine Immobilizer Control">Engine Immobilizer Control (Lock/Unlock problems)</option>
                    <option value="Overspeed limit configuration">Overspeed alerts configuration</option>
                    <option value="Billing & Data Plans">Billing & Data Plans combo renewal</option>
                    <option value="Device Hardware Malfunction">Device Hardware & Power supply</option>
                    <option value="General Support">Other General Support</option>
                  </select>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Detailed Description</label>
                    <span style={{ fontSize: '11px', color: description.length > 200 ? 'var(--error)' : 'var(--text-muted)' }}>{description.length}/200 chars</span>
                  </div>
                  <textarea
                    placeholder="Provide a brief explanation of the issue (e.g. tracking indicator showing offline since yesterday)..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value.substring(0, 200))}
                    rows={4}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Selected Call Slot</label>
                  {selectedCallSlotId ? (
                    <div style={{ padding: '12px 16px', background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-icons">check_circle</span>
                        <span style={{ fontWeight: 700, fontSize: '13px' }}>Slot Selected Successfully</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setSelectedCallSlotId('')} 
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}
                      >
                        Clear Selection
                      </button>
                    </div>
                  ) : (
                    <div style={{ padding: '12px 16px', background: '#f1f5f9', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '8px', fontSize: '13px', textAlign: 'center' }}>
                      Please tap one of the available slot times from the right panel to link a call slot to this request.
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{
                    height: '46px',
                    borderRadius: '8px',
                    background: 'var(--primary)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '14px',
                    border: 'none',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span className="material-icons">send</span>
                  {isSubmitting ? 'Submitting request...' : 'Book Slot & File Request'}
                </button>

                {submitMessage && (
                  <div style={{
                    padding: '14px',
                    borderRadius: '8px',
                    background: submitMessage.includes('Error') ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                    color: submitMessage.includes('Error') ? 'var(--error)' : 'var(--success)',
                    border: submitMessage.includes('Error') ? '1px solid rgba(239, 68, 68, 0.15)' : '1px solid rgba(16, 185, 129, 0.15)',
                    fontSize: '13px',
                    fontWeight: 600,
                    lineHeight: '1.4'
                  }}>
                    {submitMessage}
                  </div>
                )}
              </form>
            </div>
          ) : (
            /* ADMIN VIEW: Create Call Slot Form */
            <div className="card" style={{ padding: '30px', background: 'white', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-icons" style={{ color: 'var(--primary)' }}>add_alarm</span>
                Add New Call Slot (Admin Only)
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Configure a new support call availability block for users.
              </p>

              <form onSubmit={handleCreateSlot} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Slot Date</label>
                  <input
                    type="date"
                    value={slotDate}
                    onChange={(e) => setSlotDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', outline: 'none' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Start Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 10:00"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', outline: 'none' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>End Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 11:00"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', outline: 'none' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Display Time Label</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM - 11:00 AM"
                    value={displayTime}
                    onChange={(e) => setDisplayTime(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', outline: 'none' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sort Order</label>
                    <input
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', outline: 'none' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Availability Status</label>
                    <select
                      value={isAvailable ? 'true' : 'false'}
                      onChange={(e) => setIsAvailable(e.target.value === 'true')}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', fontSize: '13px', outline: 'none' }}
                    >
                      <option value="true">Available</option>
                      <option value="false">Unavailable / Booked</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{
                    height: '46px',
                    borderRadius: '8px',
                    background: 'var(--primary)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '14px',
                    border: 'none',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                >
                  {isSubmitting ? 'Creating Slot...' : 'Create Call Slot'}
                </button>

                {submitMessage && (
                  <div style={{
                    padding: '14px',
                    borderRadius: '8px',
                    background: submitMessage.includes('Error') ? 'var(--error-light)' : 'var(--success-light)',
                    color: submitMessage.includes('Error') ? 'var(--error)' : 'var(--success)',
                    fontSize: '13px',
                    fontWeight: 600
                  }}>
                    {submitMessage}
                  </div>
                )}
              </form>
            </div>
          )}

          {/* List of User's Filed Support Issues */}
          <div className="card" style={{ padding: '30px', background: 'white', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-icons" style={{ color: 'var(--primary)' }}>history</span>
                {isUserAdmin 
                  ? (adminTab === 'tickets' ? 'Filed Support Incidents overview' : 'All User Suggestions & Feedbacks')
                  : 'Your Filed Support Tickets'}
              </h2>
              <button 
                onClick={handleSyncIncidents} 
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700 }}
              >
                <span className="material-icons" style={{ fontSize: '16px' }}>refresh</span>
                Sync List
              </button>
            </div>

            {/* Admin Tabs */}
            {isUserAdmin && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                <button
                  type="button"
                  onClick={() => setAdminTab('tickets')}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    background: adminTab === 'tickets' ? 'var(--primary-light)' : 'transparent',
                    color: adminTab === 'tickets' ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '13px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                >
                  <span className="material-icons" style={{ fontSize: '16px' }}>assignment_late</span>
                  Support Incidents
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTab('suggestions')}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    background: adminTab === 'suggestions' ? 'var(--primary-light)' : 'transparent',
                    color: adminTab === 'suggestions' ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '13px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                >
                  <span className="material-icons" style={{ fontSize: '16px' }}>tips_and_updates</span>
                  User Suggestions
                </button>
              </div>
            )}

            {!isUserAdmin || adminTab === 'tickets' ? (
              // SUPPORT TICKETS VIEW
              isLoadingIssues ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Refreshing tickets...
                </div>
              ) : myIssues.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '12px', fontSize: '13px' }}>
                  No filed support incidents found.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {myIssues.map((issue) => (
                    <div 
                      key={issue._id} 
                      style={{ 
                        padding: '20px', 
                        border: '1px solid var(--border)', 
                        borderRadius: '12px', 
                        background: '#f8fafc',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        cursor: 'default'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <span className="tag" style={{ background: '#e2e8f0', color: 'var(--text-main)', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', marginRight: '8px' }}>
                            {issue.issueType === 'report_issue' ? 'Report Issue' : 'Suggestion'}
                          </span>
                          <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>{issue.issueRelatedTo}</strong>
                        </div>
                        <span className="tag" style={{
                          background: issue.issueStatus === 'resolved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: issue.issueStatus === 'resolved' ? 'var(--success)' : '#d97706',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          textTransform: 'uppercase'
                        }}>
                          {issue.issueStatus || 'scheduled'}
                        </span>
                      </div>

                      <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                        "{issue.description}"
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', borderTop: '1px solid var(--border)', paddingTop: '12px', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="material-icons" style={{ fontSize: '14px' }}>qr_code</span>
                          IMEI: <strong>{issue.imei || (issue.vehicle && issue.vehicle.imei) || 'N/A'}</strong>
                        </span>
                        {issue.callSlot && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: 600 }}>
                            <span className="material-icons" style={{ fontSize: '14px' }}>alarm</span>
                            Call: {issue.callSlot.dateText} @ {issue.callSlot.displayTime}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              // ADMIN SUGGESTIONS VIEW
              isLoadingSuggestions ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Refreshing suggestions...
                </div>
              ) : suggestionsError ? (
                <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--error)', borderRadius: '8px', fontSize: '13px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                  {suggestionsError}
                </div>
              ) : suggestions.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '12px', fontSize: '13px' }}>
                  No user suggestions or feedbacks found.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {suggestions.map((sugg) => {
                    const suggType = (sugg.suggestionType || 'general').toLowerCase();
                    const badgeColor = suggType === 'design' ? '#3b82f6' : suggType === 'feature' ? '#10b981' : '#8b5cf6';
                    const statusColor = (sugg.issueStatus || 'pending').toLowerCase() === 'resolved' ? 'var(--success)' : '#d97706';
                    const statusBg = (sugg.issueStatus || 'pending').toLowerCase() === 'resolved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)';

                    return (
                      <div 
                        key={sugg._id} 
                        style={{ 
                          padding: '20px', 
                          border: '1px solid var(--border)', 
                          borderLeft: `4px solid ${badgeColor}`,
                          borderRadius: '12px', 
                          background: '#f8fafc',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          cursor: 'default'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.04)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div>
                            <span className="tag" style={{ background: `${badgeColor}1A`, color: badgeColor, fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', marginRight: '8px' }}>
                              {sugg.suggestionType || 'Suggestion'}
                            </span>
                            <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>{sugg.subject || 'No Subject'}</strong>
                          </div>
                          <span className="tag" style={{
                            background: statusBg,
                            color: statusColor,
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            textTransform: 'uppercase'
                          }}>
                            {sugg.issueStatus || 'pending'}
                          </span>
                        </div>

                        <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                          "{sugg.description}"
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', borderTop: '1px solid var(--border)', paddingTop: '12px', color: 'var(--text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span className="material-icons" style={{ fontSize: '14px' }}>person</span>
                            User: <strong>{sugg.userId || 'N/A'}</strong>
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span className="material-icons" style={{ fontSize: '14px' }}>calendar_today</span>
                            Submitted: {sugg.createdAt ? new Date(sugg.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>

        </div>

        {/* Right Column: Active Call Slots Grid & Details */}
        <div className="card" style={{ padding: '30px', background: 'white', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', alignSelf: 'start' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-icons" style={{ color: 'var(--primary)' }}>calendar_month</span>
              Available Call Slots
            </h2>
            <button
              onClick={fetchSlots}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700 }}
            >
              <span className="material-icons" style={{ fontSize: '16px' }}>refresh</span>
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              Loading slots...
            </div>
          ) : error ? (
            <div style={{ padding: '20px', background: 'var(--error-light)', color: 'var(--error)', borderRadius: '8px', fontSize: '13px' }}>
              {error}
            </div>
          ) : !slotData?.days || slotData.days.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '12px', fontSize: '13px' }}>
              No call slots defined for today.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {slotData.days.map((dayGroup, dIdx) => (
                <div key={dIdx}>
                  <h3 style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: '8px',
                    marginBottom: '12px',
                    color: 'var(--text-main)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    <span>{dayGroup.dayText}, {dayGroup.monthText} {dayGroup.dayNumber}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{dayGroup.date}</span>
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {dayGroup.slots.map((slot, sIdx) => {
                      const isSelected = selectedCallSlotId === slot._id;
                      const isSlotBookable = slot.isAvailable && !isUserAdmin;
                      
                      return (
                        <div
                          key={sIdx}
                          onClick={() => {
                            if (isSlotBookable) {
                              setSelectedCallSlotId(slot._id);
                            }
                          }}
                          style={{
                            padding: '14px 16px',
                            background: isSelected 
                              ? 'var(--primary-light)' 
                              : (slot.isAvailable ? '#f8fafc' : '#f1f5f9'),
                            borderRadius: '10px',
                            border: isSelected 
                              ? '2px solid var(--primary)' 
                              : (slot.isAvailable ? '1px solid var(--border)' : '1px solid #e2e8f0'),
                            fontSize: '13px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: isSlotBookable ? 'pointer' : 'not-allowed',
                            transition: 'all 0.2s',
                            opacity: slot.isAvailable ? 1 : 0.6
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, color: isSelected ? 'var(--primary)' : 'var(--text-main)', marginBottom: '3px' }}>
                              {slot.displayTime}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              Time range: {slot.startTime} - {slot.endTime}
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              color: slot.isAvailable ? 'var(--success)' : 'var(--error)',
                              fontWeight: 800,
                              fontSize: '11px',
                              textTransform: 'uppercase'
                            }}>
                              {slot.isAvailable ? 'Available' : 'Booked'}
                            </span>
                            {isSlotBookable && (
                              <span className="material-icons" style={{ fontSize: '16px', color: isSelected ? 'var(--primary)' : '#94a3b8' }}>
                                {isSelected ? 'radio_button_checked' : 'radio_button_unchecked'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

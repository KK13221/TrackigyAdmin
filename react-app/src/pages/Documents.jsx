import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BASE_URL } from '../utils/network';
import Swal from 'sweetalert2';

export default function Documents({ user }) {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewerModal, setShowViewerModal] = useState(null); // stores active doc object for viewing
  const [isEditMode, setIsEditMode] = useState(false);
  const [editDocId, setEditDocId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    type: 'vehicle',
    subtype: 'insurance',
    title: '',
    expiryDate: '',
    billingDate: '',
    billingAmount: '',
    shopName: '',
    shopContact: '',
    warrantyExpiry: '',
  });
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const savedUser = user || JSON.parse(localStorage.getItem('user') || '{}');
    const isUserAdmin = ['superadmin'].includes((savedUser.role || '').toLowerCase());
    const userId = savedUser.id || savedUser._id || localStorage.getItem('userId');

    const fetchVehicles = async () => {
      try {
        const targetUrl = isUserAdmin
          ? `${BASE_URL}/api/vehicle/get-vehicles-list`
          : `${BASE_URL}/api/vehicle/get-vehicles?userId=${userId}`;

        const response = await fetch(targetUrl, {
          method: 'GET',
          headers: { 'accept': '*/*' }
        });
        if (response.ok) {
          const data = await response.json();
          const list = data.vehicles || data.data || (Array.isArray(data) ? data : []);
          setVehicles(list);
          if (list.length > 0) {
            setSelectedVehicle(list[0]);
          }
        }
      } catch (error) {
        console.error("Failed to load vehicles:", error);
      } finally {
        setLoadingVehicles(false);
      }
    };
    fetchVehicles();
  }, [user]);

  // Load documents whenever selectedVehicle changes
  const fetchDocuments = async (vehicleId) => {
    if (!vehicleId) {
      setDocuments([]);
      return;
    }
    setLoadingDocs(true);
    try {
      const response = await fetch(`${BASE_URL}/api/documents/document?vehicleId=${vehicleId}`, {
        method: 'GET',
        headers: {
          'accept': '*/*'
        }
      });
      if (response.ok) {
        const resJson = await response.json();
        setDocuments(resJson.data || []);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error("Failed to load documents:", error);
      setDocuments([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (selectedVehicle) {
      fetchDocuments(selectedVehicle._id);
    }
  }, [selectedVehicle]);

  const handleDeleteDocument = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this document?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, proceed!'
    });
    if (!result.isConfirmed) return;
    try {
      const response = await fetch(`${BASE_URL}/api/documents/document/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        Swal.fire("Document deleted successfully!");
        fetchDocuments(selectedVehicle._id);
      } else {
        Swal.fire("Failed to delete document.");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error deleting document.");
    }
  };

  const handleEditClick = (doc) => {
    setIsEditMode(true);
    setEditDocId(doc._id);
    setFormData({
      type: doc.type || 'vehicle',
      subtype: doc.subtype || 'insurance',
      title: doc.title || '',
      expiryDate: doc.expiryDate ? new Date(doc.expiryDate).toISOString().split('T')[0] : '',
      billingDate: doc.billingDate ? new Date(doc.billingDate).toISOString().split('T')[0] : '',
      billingAmount: doc.billingAmount || '',
      shopName: doc.shopName || '',
      shopContact: doc.shopContact || '',
      warrantyExpiry: doc.warrantyExpiry ? new Date(doc.warrantyExpiry).toISOString().split('T')[0] : '',
    });
    setFrontFile(null);
    setBackFile(null);
    setShowUploadModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'type') {
        if (value === 'vehicle') updated.subtype = 'insurance';
        else if (value === 'personal') updated.subtype = 'driving_license';
        else if (value === 'bills') updated.subtype = 'Accessory_bills';
      }
      return updated;
    });
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVehicle) {
      Swal.fire("Please select a vehicle first.");
      return;
    }
    if (!isEditMode && !frontFile) {
      Swal.fire("Front side image of the document is required.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('vehicleId', selectedVehicle._id);
      payload.append('type', formData.type);
      payload.append('subtype', formData.subtype);
      payload.append('title', formData.title);
      if (formData.expiryDate) payload.append('expiryDate', formData.expiryDate);
      if (formData.billingDate) payload.append('billingDate', formData.billingDate);
      if (formData.billingAmount) payload.append('billingAmount', formData.billingAmount);
      if (formData.shopName) payload.append('shopName', formData.shopName);
      if (formData.shopContact) payload.append('shopContact', formData.shopContact);
      if (formData.warrantyExpiry) payload.append('warrantyExpiry', formData.warrantyExpiry);

      if (frontFile) payload.append('frontImage', frontFile);
      if (backFile) {
        payload.append('backImage', backFile);
      }

      const url = isEditMode 
        ? `${BASE_URL}/api/documents/document/${editDocId}`
        : `${BASE_URL}/api/documents/document`;
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'accept': 'application/json'
        },
        body: payload,
      });

      if (response.ok) {
        Swal.fire(`Document ${isEditMode ? 'updated' : 'added'} successfully!`);
        setShowUploadModal(false);
        setIsEditMode(false);
        setEditDocId(null);
        setFormData({
          type: 'vehicle',
          subtype: 'insurance',
          title: '',
          expiryDate: '',
          billingDate: '',
          billingAmount: '',
          shopName: '',
          shopContact: '',
          warrantyExpiry: '',
        });
        setFrontFile(null);
        setBackFile(null);
        fetchDocuments(selectedVehicle._id);
      } else {
        const errorData = await response.json();
        Swal.fire(errorData.message || "Failed to add document.");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error uploading document.");
    } finally {
      setSubmitting(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${BASE_URL}/${path}`;
  };

  const getExpiryDaysStatus = (expiryDateStr) => {
    if (!expiryDateStr) return null;
    const expiry = new Date(expiryDateStr);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      return { text: 'Expired', color: 'var(--error)', bg: 'var(--error-light)' };
    } else if (diffDays <= 30) {
      return { text: `Expires in ${diffDays}d`, color: 'var(--warning)', bg: 'var(--warning-light)' };
    }
    return { text: `Active (${diffDays}d left)`, color: 'var(--success)', bg: 'var(--success-light)' };
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header */}
      <div className="page-header" style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <button
          className="btn-primary"
          onClick={() => {
            setIsEditMode(false);
            setEditDocId(null);
            setFormData({
              type: 'vehicle', subtype: 'insurance', title: '', expiryDate: '', billingDate: '', billingAmount: '', shopName: '', shopContact: '', warrantyExpiry: ''
            });
            setFrontFile(null);
            setBackFile(null);
            setShowUploadModal(true);
          }}
          style={{ display: 'inline-flex', flex: 'none', alignItems: 'center', gap: 6, height: 36, padding: '0 16px', fontSize: 13, borderRadius: 12, border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          <span className="material-icons" style={{ fontSize: 18 }}>cloud_upload</span> Upload Document
        </button>
      </div>

      {/* Main Grid split: selector & document gallery */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>

        {/* Left Side: Vehicle List Panel */}
        <div className="card" style={{ padding: 20, position: 'sticky', maxHeight: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', marginBottom: 16, flexShrink: 0 }}>Select Vehicle</h3>
          {loadingVehicles ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading fleet list...</p>
          ) : vehicles.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', flex: 1, paddingRight: 6 }}>
              {vehicles.map((v) => {
                const isSelected = selectedVehicle?._id === v._id;
                return (
                  <button
                    key={v._id || v.imei}
                    onClick={() => setSelectedVehicle(v)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      padding: '12px 16px',
                      background: isSelected ? 'var(--primary-light)' : 'transparent',
                      border: 'none',
                      borderRadius: 12,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => !isSelected && (e.currentTarget.style.background = 'var(--bg-main)')}
                    onMouseLeave={(e) => !isSelected && (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: isSelected ? 'var(--primary)' : 'var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isSelected ? 'white' : 'var(--text-muted)',
                      flexShrink: 0
                    }}>
                      <span className="material-icons">local_shipping</span>
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: isSelected ? 'var(--primary)' : 'var(--text-main)', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {v.vehicleMaker} {v.vehicleModel}
                      </p>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {v.vehicleNumber}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No vehicles found.</p>
          )}
        </div>

        {/* Right Side: Documents Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {selectedVehicle && (
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Currently Active Asset</span>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 0 0' }}>
                  {selectedVehicle.vehicleMaker} {selectedVehicle.vehicleModel} ({selectedVehicle.vehicleNumber})
                </h2>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>IMEI: <strong style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>{selectedVehicle.imei}</strong></span>
              </div>
            </div>
          )}

          {loadingDocs ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <span className="material-icons" style={{ fontSize: 40, color: 'var(--primary)', animation: 'spin 1.5s linear infinite' }}>sync</span>
              <p style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: 14 }}>Loading dynamic documents...</p>
            </div>
          ) : documents.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
              {documents.map((doc) => {
                const expiryStatus = getExpiryDaysStatus(doc.expiryDate);
                return (
                  <div key={doc._id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: 20, transition: 'transform 0.2s', border: '1px solid var(--border)' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <span style={{
                          background: doc.type === 'personal' ? 'var(--primary-light)' : doc.type === 'bills' ? 'var(--success-light)' : 'var(--warning-light)',
                          color: doc.type === 'personal' ? 'var(--primary)' : doc.type === 'bills' ? 'var(--success)' : 'var(--warning)',
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}>
                          {doc.type} • {doc.subtype?.replace('_', ' ')}
                        </span>
                        <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)', marginTop: 8, marginBottom: 4 }}>
                          {doc.title || `${doc.subtype?.toUpperCase().replace('_', ' ')} Document`}
                        </h4>
                      </div>
                      {expiryStatus && (
                        <span style={{
                          background: expiryStatus.bg,
                          color: expiryStatus.color,
                          padding: '4px 8px',
                          borderRadius: 6,
                          fontSize: 10,
                          fontWeight: 800,
                        }}>
                          {expiryStatus.text}
                        </span>
                      )}
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '12px 0', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                      {doc.expiryDate && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Expiry Date:</span>
                          <strong style={{ color: 'var(--text-main)' }}>{new Date(doc.expiryDate).toLocaleDateString()}</strong>
                        </div>
                      )}
                      {doc.billingDate && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Billing Date:</span>
                          <strong style={{ color: 'var(--text-main)' }}>{new Date(doc.billingDate).toLocaleDateString()}</strong>
                        </div>
                      )}
                      {doc.billingAmount && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Amount Paid:</span>
                          <strong style={{ color: 'var(--success)' }}>${Number(doc.billingAmount).toFixed(2)}</strong>
                        </div>
                      )}
                      {doc.shopName && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Vendor:</span>
                          <strong style={{ color: 'var(--text-main)' }}>{doc.shopName}</strong>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: 12 }}>
                      <button
                        className="btn-secondary"
                        onClick={() => setShowViewerModal(doc)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          fontWeight: 700,
                          fontSize: 11,
                          border: '1px solid var(--border)',
                          borderRadius: 6,
                          background: 'var(--bg-main)',
                          cursor: 'pointer',
                        }}
                      >
                        <span className="material-icons" style={{ fontSize: 14 }}>visibility</span> View
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => handleEditClick(doc)}
                        style={{
                          padding: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          fontWeight: 700,
                          fontSize: 11,
                          border: '1px solid var(--border)',
                          borderRadius: 6,
                          background: 'var(--bg-main)',
                          cursor: 'pointer',
                        }}
                      >
                        <span className="material-icons" style={{ fontSize: 14, color: 'var(--primary)' }}>edit</span> Edit
                      </button>
                      <button
                        className="btn-secondary"
                        onClick={() => handleDeleteDocument(doc._id)}
                        style={{
                          padding: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          fontWeight: 700,
                          fontSize: 11,
                          border: '1px solid var(--error-light)',
                          borderRadius: 6,
                          background: 'var(--error-light)',
                          cursor: 'pointer',
                        }}
                      >
                        <span className="material-icons" style={{ fontSize: 14, color: 'var(--error)' }}>delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card" style={{ padding: '60px 24px', textAlign: 'center', background: 'var(--bg-sidebar)' }}>
              <span className="material-icons" style={{ fontSize: 56, color: 'var(--text-muted)', marginBottom: 16 }}>assignment_late</span>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>No Documents Uploaded</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, maxWidth: 380, margin: '0 auto 20px auto' }}>
                Keep your documents organized. Upload insurance papers, driving licenses, bills, or warranty receipts to stay compliant.
              </p>
              <button
                className="btn-primary"
                onClick={() => {
                  setIsEditMode(false);
                  setEditDocId(null);
                  setFormData({
                    type: 'vehicle', subtype: 'insurance', title: '', expiryDate: '', billingDate: '', billingAmount: '', shopName: '', shopContact: '', warrantyExpiry: ''
                  });
                  setFrontFile(null);
                  setBackFile(null);
                  setShowUploadModal(true);
                }}
                style={{ padding: '10px 20px', borderRadius: 8, border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer' }}
              >
                Upload Your First Document
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999, padding: 20 }}>
          <div style={{ background: 'var(--bg-sidebar)', borderRadius: 20, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>

            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-main)', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>{isEditMode ? 'Edit Document' : 'Upload Document'}</h3>
                {selectedVehicle && <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Linking to vehicle: <strong>{selectedVehicle.vehicleMaker} {selectedVehicle.vehicleModel}</strong></p>}
              </div>
              <button onClick={() => setShowUploadModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <span className="material-icons">close</span>
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleUploadSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Document Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, outline: 'none', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                  >
                    <option value="vehicle">Vehicle Document</option>
                    <option value="personal">Personal Document</option>
                    <option value="bills">Billing / Invoice</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Sub-category</label>
                  <select
                    name="subtype"
                    value={formData.subtype}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, outline: 'none', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                  >
                    {formData.type === 'vehicle' && (
                      <>
                        <option value="insurance">Insurance</option>
                        <option value="rc">Vehicle RC</option>
                        <option value="pollution_cert">Pollution Certificate</option>
                        <option value="other_document">Other Spec Doc</option>
                      </>
                    )}
                    {formData.type === 'personal' && (
                      <>
                        <option value="driving_license">Driving License</option>
                        <option value="rc">Vehicle RC</option>
                        <option value="insurance">Insurance Details</option>
                        <option value="other_document">Other Personal ID</option>
                      </>
                    )}
                    {formData.type === 'bills' && (
                      <>
                        <option value="Accessory_bills">Accessory Purchase Bill</option>
                        <option value="maintenance_invoice">Maintenance Invoice</option>
                        <option value="fuel_bill">Fuel Purchase Bill</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Document Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. HDFC ERGO Commercial Auto Insurance"
                  value={formData.title}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, outline: 'none', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, outline: 'none', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Billing Date</label>
                  <input
                    type="date"
                    name="billingDate"
                    value={formData.billingDate}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, outline: 'none', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              {formData.type === 'bills' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Billing Amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="billingAmount"
                      placeholder="350.00"
                      value={formData.billingAmount}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, outline: 'none', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Shop Name</label>
                    <input
                      type="text"
                      name="shopName"
                      placeholder="Autozone Store"
                      value={formData.shopName}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, outline: 'none', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Shop Contact</label>
                    <input
                      type="text"
                      name="shopContact"
                      placeholder="+12345678"
                      value={formData.shopContact}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, outline: 'none', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                    />
                  </div>
                </div>
              )}

              {/* File Uploads */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Front Image Side *</label>
                  <div style={{ position: 'relative', border: '2px dashed var(--border)', borderRadius: 12, padding: '16px 8px', textAlign: 'center', background: 'var(--bg-main)', cursor: 'pointer' }}>
                    <span className="material-icons" style={{ fontSize: 24, color: 'var(--text-muted)' }}>photo</span>
                    <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'var(--text-main)' }}>
                      {frontFile ? frontFile.name : 'Select Front File'}
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={(e) => setFrontFile(e.target.files[0])}
                      style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>Back Image Side (Optional)</label>
                  <div style={{ position: 'relative', border: '2px dashed var(--border)', borderRadius: 12, padding: '16px 8px', textAlign: 'center', background: 'var(--bg-main)', cursor: 'pointer' }}>
                    <span className="material-icons" style={{ fontSize: 24, color: 'var(--text-muted)' }}>photo</span>
                    <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'var(--text-main)' }}>
                      {backFile ? backFile.name : 'Select Back File'}
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setBackFile(e.target.files[0])}
                      style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  style={{ padding: '10px 20px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-sidebar)', color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                  style={{ padding: '10px 24px', border: 'none', borderRadius: 8, color: 'white', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  {submitting ? 'Uploading...' : 'Save & Link'}
                </button>
              </div>

            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Fullscreen Document Viewer Modal */}
      {showViewerModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999, padding: 20 }}>
          <div style={{ background: 'var(--bg-sidebar)', borderRadius: 24, width: '100%', maxWidth: 900, maxHeight: '95vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column' }}>

            {/* Modal Header */}
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-main)', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
                  {showViewerModal.type} • {showViewerModal.subtype?.replace('_', ' ')}
                </span>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-main)', margin: '4px 0 0 0' }}>
                  {showViewerModal.title}
                </h3>
              </div>
              <button
                onClick={() => setShowViewerModal(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'grid', placeItems: 'center', padding: 8, borderRadius: '50%', transition: 'background 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--border)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span className="material-icons" style={{ fontSize: 24 }}>close</span>
              </button>
            </div>

            {/* Modal Body: Two-pane Image Viewer */}
            <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: showViewerModal.backImage ? '1fr 1fr' : '1fr', gap: 24 }}>

                {/* Front Side */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Front Side View</span>
                  <div style={{ border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', background: 'var(--bg-main)', height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src={getImageUrl(showViewerModal.frontImage)}
                      alt="Front view"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=Image+Not+Found'; }}
                    />
                  </div>
                </div>

                {/* Back Side */}
                {showViewerModal.backImage && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Back Side View</span>
                    <div style={{ border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', background: 'var(--bg-main)', height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={getImageUrl(showViewerModal.backImage)}
                        alt="Back view"
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=Back+Image+Not+Found'; }}
                      />
                    </div>
                  </div>
                )}

              </div>

              {/* Detailed Specs Drawer Inside Viewer */}
              <div style={{ background: 'var(--bg-main)', padding: 24, borderRadius: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, fontSize: 13 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Linked IMEI Number</span>
                  <strong style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>{showViewerModal.imei}</strong>
                </div>
                {showViewerModal.expiryDate && (
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Document Expiry</span>
                    <strong style={{ color: 'var(--text-main)' }}>{new Date(showViewerModal.expiryDate).toLocaleDateString()}</strong>
                  </div>
                )}
                {showViewerModal.billingAmount && (
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Total Cost</span>
                    <strong style={{ color: 'var(--success)' }}>${Number(showViewerModal.billingAmount).toFixed(2)}</strong>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}

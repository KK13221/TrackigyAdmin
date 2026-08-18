import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/network';
import Swal from 'sweetalert2';

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Publish form
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    show_date: '', 
    show_time: '12:00', 
    expiry_date: '', 
    expiry_time: '12:00' 
  });
  const [bannerFile, setBannerFile] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/banner/all`);
      if (res.ok) {
        const data = await res.json();
        if (data && (data.success || data.status) && Array.isArray(data.data)) {
          setBanners(data.data);
        } else if (Array.isArray(data)) {
          setBanners(data);
        } else if (data && Array.isArray(data.result)) {
          setBanners(data.result);
        } else {
          setBanners([]);
        }
      } else {
        setBanners([]);
      }
    } catch (err) {
      console.error('Error fetching banners:', err);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!editingId && !bannerFile) {
      Swal.fire("Please select a banner image.");
      return;
    }
    setFormLoading(true);
    try {
      const body = new FormData();
      body.append('title', formData.title);
      body.append('show_date', formData.show_date);
      body.append('show_time', formData.show_time);
      body.append('expiry_date', formData.expiry_date);
      body.append('expiry_time', formData.expiry_time);
      if (bannerFile) {
        body.append('banner_image', bannerFile);
      }

      const url = editingId ? `${BASE_URL}/api/banner/${editingId}` : `${BASE_URL}/api/banner`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body,
      });

      const resData = await res.json();
      if (res.ok || resData.success || resData.status) {
        Swal.fire(`Banner ${editingId ? 'updated' : 'published'} successfully!`);
        setIsPublishModalOpen(false);
        setFormData({ title: '', show_date: '', show_time: '12:00', expiry_date: '', expiry_time: '12:00' });
        setBannerFile(null);
        setEditingId(null);
        fetchBanners();
      } else {
        Swal.fire(resData.message || 'Failed to publish banner.');
      }
    } catch (err) {
      console.error('Error publishing banner:', err);
      Swal.fire('Error occurred while publishing.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Are you sure you want to delete this banner?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, proceed!'
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${BASE_URL}/api/banner/${id}`, { method: 'DELETE' });
      if (res.ok) {
        Swal.fire("Banner deleted successfully.");
        fetchBanners();
      }
    } catch (error) {
      console.error("Error deleting banner:", error);
    }
  };

  const getBannerUrl = (thumb) => {
    if (!thumb) return 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=400&q=80';
    if (thumb.startsWith('http')) return thumb;
    return `${BASE_URL}/${thumb}`;
  };

  const formatTimeAMPM = (timeStr) => {
    if (!timeStr) return '';
    const [hourStr, minStr] = timeStr.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minStr} ${ampm}`;
  };

  const filtered = banners.filter(b =>
    (b.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const TimePicker = ({ label, value, onChange }) => {
    const val = value || "12:00";
    const [hourStr, minStr] = val.split(":");
    let h = parseInt(hourStr, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;

    const handleTimeChange = (newH, newMin, newAmPm) => {
      let finalH = parseInt(newH, 10);
      if (newAmPm === "PM" && finalH < 12) finalH += 12;
      if (newAmPm === "AM" && finalH === 12) finalH = 0;
      onChange(`${finalH.toString().padStart(2, "0")}:${newMin.padStart(2, "0")}`);
    };

    return (
      <div>
        <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>{label}</label>
        <div style={{ display: 'flex', gap: 4 }}>
          <select 
            value={h} 
            onChange={e => handleTimeChange(e.target.value, minStr, ampm)}
            style={{ padding: '8px 4px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, outline: 'none', background: 'var(--bg-sidebar)', color: 'var(--text-main)', flex: 1, cursor: 'pointer' }}
          >
            {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
          </select>
          <select 
            value={minStr} 
            onChange={e => handleTimeChange(h, e.target.value, ampm)}
            style={{ padding: '8px 4px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, outline: 'none', background: 'var(--bg-sidebar)', color: 'var(--text-main)', flex: 1, cursor: 'pointer' }}
          >
            {[...Array(60)].map((_, i) => {
              const m = i.toString().padStart(2, '0');
              return <option key={m} value={m}>{m}</option>;
            })}
          </select>
          <select 
            value={ampm} 
            onChange={e => handleTimeChange(h, minStr, e.target.value)}
            style={{ padding: '8px 4px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, outline: 'none', background: 'var(--bg-sidebar)', color: 'var(--text-main)', flex: 1, cursor: 'pointer' }}
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
      </div>
    );
  };

  return (
    <div className="fade-in" style={{ padding: '4px 0', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
        </div>
        <button
          onClick={() => {
            setFormData({ title: '', show_date: '', show_time: '12:00', expiry_date: '', expiry_time: '12:00' });
            setBannerFile(null);
            setEditingId(null);
            setIsPublishModalOpen(true);
          }}
          style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 12,
            padding: '10px 20px',
            fontSize: 13,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 10px 25px -5px rgba(37,99,235,0.4)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >
          <span className="material-icons" style={{ fontSize: 18 }}>add_photo_alternate</span>
          Add New Banner
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ background: 'var(--bg-sidebar)', borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        
        {/* Controls Bar */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', width: 300 }}>
              <span className="material-icons" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 18 }}>search</span>
              <input
                type="text"
                placeholder="Search banners by title..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 10px 10px 38px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  fontSize: 13,
                  outline: 'none',
                  background: 'var(--bg-sidebar)',
                  color: 'var(--text-main)',
                  transition: 'all 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
            Total Banners: <span style={{ color: 'var(--text-main)', fontWeight: 800 }}>{filtered.length}</span>
          </div>
        </div>

        {/* Banners Grid */}
        <div style={{ padding: 24, minHeight: 400 }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-muted)' }}>
              <span className="material-icons" style={{ fontSize: 40, animation: 'spin 1s linear infinite' }}>autorenew</span>
              <p style={{ marginTop: 12, fontSize: 13, fontWeight: 600 }}>Loading banners...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {filtered.map(banner => (
                <div 
                  key={banner._id || banner.id} 
                  style={{ 
                    background: 'var(--bg-main)', 
                    borderRadius: 16, 
                    overflow: 'hidden', 
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                >
                  {/* Thumbnail / Map representation */}
                  <div style={{ position: 'relative', height: 160, background: 'var(--border)', width: '100%' }}>
                    <img
                      src={getBannerUrl(banner.banner_url)}
                      alt={banner.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    {banner.isActive && (
                       <span style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(16,185,129,0.9)', color: 'white', padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                         Active
                       </span>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.4, marginBottom: 12 }}>{banner.title}</h4>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span className="material-icons" style={{ fontSize: 14 }}>event</span> Start: {new Date(banner.show_date).toLocaleDateString()} {formatTimeAMPM(banner.show_time)}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}><span className="material-icons" style={{ fontSize: 14 }}>event_busy</span> End: {new Date(banner.expiry_date).toLocaleDateString()} {formatTimeAMPM(banner.expiry_time)}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>🖼️ App Banner</span>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <span
                          onClick={() => {
                            setFormData({
                              title: banner.title || '',
                              show_date: banner.show_date ? new Date(banner.show_date).toISOString().split('T')[0] : '',
                              show_time: banner.show_time || '12:00',
                              expiry_date: banner.expiry_date ? new Date(banner.expiry_date).toISOString().split('T')[0] : '',
                              expiry_time: banner.expiry_time || '12:00'
                            });
                            setEditingId(banner._id || banner.id);
                            setBannerFile(null);
                            setIsPublishModalOpen(true);
                          }}
                          style={{ cursor: 'pointer', color: '#3b82f6', display: 'flex', alignItems: 'center', padding: 4 }}
                          title="Edit"
                        >
                          <span className="material-icons" style={{ fontSize: 18 }}>edit</span>
                        </span>
                        <span
                          onClick={() => handleDelete(banner._id || banner.id)}
                          style={{ cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', padding: 4 }}
                          title="Delete"
                        >
                          <span className="material-icons" style={{ fontSize: 18 }}>delete</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-muted)' }}>
              <span className="material-icons" style={{ fontSize: 48, color: '#cbd5e1', marginBottom: 16 }}>photo_size_select_actual</span>
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>No banners found</h4>
              <p style={{ margin: '4px 0 0', fontSize: 13 }}>Click "Add New Banner" to create one.</p>
            </div>
          )}
        </div>
      </div>

      {/* Publish Modal */}
      {isPublishModalOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}
          onClick={() => setIsPublishModalOpen(false)}
        >
          <div
            style={{ width: '90%', maxWidth: 480, background: 'var(--bg-sidebar)', borderRadius: 20, padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="material-icons" style={{ color: 'var(--primary)' }}>{editingId ? 'edit' : 'add_photo_alternate'}</span>
                {editingId ? 'Edit Banner' : 'Add New Banner'}
              </h3>
              <button onClick={() => setIsPublishModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <span className="material-icons">close</span>
              </button>
            </div>

            <form onSubmit={handlePublish} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Banner Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diwali Offer Banner"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, outline: 'none', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Show Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.show_date}
                    onChange={e => setFormData(prev => ({ ...prev, show_date: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, outline: 'none', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                  />
                </div>
                <TimePicker 
                  label="Show Time *" 
                  value={formData.show_time} 
                  onChange={val => setFormData(prev => ({ ...prev, show_time: val }))} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.expiry_date}
                    onChange={e => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, outline: 'none', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                  />
                </div>
                <TimePicker 
                  label="Expiry Time *" 
                  value={formData.expiry_time} 
                  onChange={val => setFormData(prev => ({ ...prev, expiry_time: val }))} 
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Banner Image {editingId ? '(Optional)' : '*'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  required={!editingId}
                  onChange={e => setBannerFile(e.target.files[0])}
                  style={{ width: '100%', fontSize: 12, padding: '4px 0', color: 'var(--text-main)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  style={{ background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 15px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 10px rgba(37,99,235,0.2)' }}
                >
                  {formLoading ? 'Saving...' : (editingId ? 'Update Banner' : 'Publish Banner')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

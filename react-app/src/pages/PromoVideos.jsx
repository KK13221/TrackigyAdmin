import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/network';
import Swal from 'sweetalert2';

export default function PromoVideos() {
  const [promoVideos, setPromoVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activePlayVideo, setActivePlayVideo] = useState(null);

  // Publish form
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', video_url: '' });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Update form
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({ _id: '', title: '', video_url: '' });
  const [updateThumbnailFile, setUpdateThumbnailFile] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const fetchPromoVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/promo/all`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.data)) {
          setPromoVideos(data.data);
        } else if (Array.isArray(data)) {
          setPromoVideos(data);
        } else if (data && Array.isArray(data.result)) {
          setPromoVideos(data.result);
        } else {
          setPromoVideos([]);
        }
      } else {
        setPromoVideos([]);
      }
    } catch (err) {
      console.error('Error fetching promo videos:', err);
      setPromoVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoVideos();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const body = new FormData();
      body.append('title', updateFormData.title);
      body.append('video_url', updateFormData.video_url);
      if (updateThumbnailFile) {
        body.append('thumbnail_url', updateThumbnailFile);
      }

      const res = await fetch(`${BASE_URL}/api/promo/update/${updateFormData._id}`, {
        method: 'PUT',
        body
      });
      const resData = await res.json();
      if (res.ok || resData.success) {
        Swal.fire('Promo video updated successfully!');
        setIsUpdateModalOpen(false);
        setUpdateFormData({ _id: '', title: '', video_url: '' });
        setUpdateThumbnailFile(null);
        fetchPromoVideos();
      } else {
        Swal.fire(resData.message || 'Failed to update promo video.');
      }
    } catch (err) {
      console.error('Error updating promo video:', err);
      Swal.fire('Error occurred while updating.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this promo video?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, proceed!'
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${BASE_URL}/api/promo/delete/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok || data.success) {
        Swal.fire('Promo video deleted successfully!');
        fetchPromoVideos();
      } else {
        Swal.fire(data.message || 'Failed to delete promo video.');
      }
    } catch (err) {
      console.error('Error deleting promo video:', err);
      Swal.fire('Error occurred while deleting.');
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const body = new FormData();
      body.append('title', formData.title);
      body.append('video_url', formData.video_url);
      if (thumbnailFile) {
        body.append('thumbnail_url', thumbnailFile);
      }

      const res = await fetch(`${BASE_URL}/api/promo/create`, {
        method: 'POST',
        body
      });
      const resData = await res.json();
      if (res.ok || resData.success) {
        Swal.fire('Promo video published successfully!');
        setIsPublishModalOpen(false);
        setFormData({ title: '', video_url: '' });
        setThumbnailFile(null);
        fetchPromoVideos();
      } else {
        Swal.fire(resData.message || 'Failed to publish promo video.');
      }
    } catch (err) {
      console.error('Error publishing promo video:', err);
      Swal.fire('Error occurred while publishing.');
    } finally {
      setFormLoading(false);
    }
  };

  const getThumbnailUrl = (thumb) => {
    if (!thumb) return 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=400&q=80';
    if (thumb.startsWith('http')) return thumb;
    return `${BASE_URL}/${thumb}`;
  };

  // Returns true if url is a direct video file (mp4, webm, etc.)
  const isDirectVideo = (url) => {
    if (!url) return false;
    return /\.(mp4|webm|ogg|mov)$/i.test(url.split('?')[0]);
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/embed/') || url.includes('player.vimeo.com')) return url;
    if (url.includes('youtube.com/watch?v=')) {
      const parts = url.split('v=');
      if (parts[1]) return `https://www.youtube.com/embed/${parts[1].split('&')[0]}`;
    }
    if (url.includes('youtu.be/')) {
      const parts = url.split('youtu.be/');
      if (parts[1]) return `https://www.youtube.com/embed/${parts[1].split('?')[0]}`;
    }
    return url;
  };

  const filtered = promoVideos.filter(v =>
    (v.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fade-in" style={{ padding: '4px 0', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          {/* <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 6 }}>
            Marketing & Promotions
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Promo Videos</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
            Manage promotional video content displayed to app users for features and campaigns.
          </p> */}
        </div>
        <button
          onClick={() => {
            setFormData({ title: '', video_url: '' });
            setThumbnailFile(null);
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
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
            transition: 'all 0.2s ease'
          }}
        >
          <span className="material-icons" style={{ fontSize: 18 }}>add_to_queue</span>
          Add Promo Video
        </button>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: 16, borderRadius: 16, marginBottom: 28, display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ position: 'relative', width: 300 }}>
          <span className="material-icons" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: 'var(--text-muted)' }}>search</span>
          <input
            type="text"
            placeholder="Search promo videos..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12, fontWeight: 600, outline: 'none' }}
          />
        </div>
      </div>

      {/* Video Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <span className="material-icons" style={{ fontSize: 40, color: 'var(--primary)', animation: 'spin 1s linear infinite' }}>sync</span>
          <div style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>Loading promo videos...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', background: 'var(--bg-sidebar)', borderRadius: 16, border: '2px dashed #e2e8f0' }}>
          <span className="material-icons" style={{ fontSize: 48, color: '#cbd5e1', marginBottom: 12 }}>videocam_off</span>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#334155' }}>No Promo Videos Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>Add your first promo video to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          {filtered.map((video, idx) => (
            <div
              key={video.id || video._id || idx}
              className="card"
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onClick={() => setActivePlayVideo(video)}
            >
              {/* Thumbnail */}
              <div style={{ aspectRatio: '16/9', background: 'var(--text-main)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.7) 100%)', zIndex: 2 }} />
                <div style={{
                  position: 'absolute', top: 10, left: 10,
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  color: 'white', padding: '2px 10px', borderRadius: 12, fontSize: 10, fontWeight: 800, zIndex: 3
                }}>
                  PROMO
                </div>
                <div style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.95)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.25)'
                }}>
                  <span className="material-icons" style={{ color: 'var(--text-main)', fontSize: 30, marginLeft: 3 }}>play_arrow</span>
                </div>
                <img
                  src={getThumbnailUrl(video.thumbnail_url)}
                  alt={video.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Content */}
              <div style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.4, marginBottom: 12 }}>{video.title}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>🎬 Promotional</span>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(video._id || video.id);
                      }}
                      style={{ fontSize: 11, color: '#ef4444', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                    >
                      Delete
                      <span className="material-icons" style={{ fontSize: 14 }}>delete</span>
                    </span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setUpdateFormData({ _id: video._id || video.id, title: video.title, video_url: video.video_url });
                        setUpdateThumbnailFile(null);
                        setIsUpdateModalOpen(true);
                      }}
                      style={{ fontSize: 11, color: '#f59e0b', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                    >
                      Edit
                      <span className="material-icons" style={{ fontSize: 14 }}>edit</span>
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                      Watch
                      <span className="material-icons" style={{ fontSize: 14 }}>play_circle</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      {activePlayVideo && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.88)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
          onClick={() => setActivePlayVideo(null)}
        >
          <div
            style={{ width: '90%', maxWidth: 800, background: 'var(--text-main)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: 'black' }}>
              {isDirectVideo(activePlayVideo.video_url) ? (
                <video
                  src={activePlayVideo.video_url}
                  controls
                  autoPlay
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                />
              ) : (
                <iframe
                  title={activePlayVideo.title}
                  src={getEmbedUrl(activePlayVideo.video_url)}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                />
              )}
            </div>
            <div style={{ padding: 24, background: 'var(--text-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa', padding: '2px 10px', borderRadius: 12, fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>Promo Video</span>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: 'white', marginTop: 8 }}>{activePlayVideo.title}</h3>
              </div>
              <button
                onClick={() => setActivePlayVideo(null)}
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <span className="material-icons">close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {isUpdateModalOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}
          onClick={() => setIsUpdateModalOpen(false)}
        >
          <div
            style={{ width: '90%', maxWidth: 480, background: 'var(--bg-sidebar)', borderRadius: 20, padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="material-icons" style={{ color: '#f59e0b' }}>edit</span>
                Update Promo Video
              </h3>
              <button onClick={() => setIsUpdateModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <span className="material-icons">close</span>
              </button>
            </div>

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Video Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Trackify Premium Features 2026"
                  value={updateFormData.title}
                  onChange={e => setUpdateFormData(prev => ({ ...prev, title: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>YouTube / Vimeo URL *</label>
                <input
                  type="url"
                  required
                  placeholder="e.g. https://youtu.be/Wury_w-XpXk"
                  value={updateFormData.video_url}
                  onChange={e => setUpdateFormData(prev => ({ ...prev, video_url: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Thumbnail Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setUpdateThumbnailFile(e.target.files[0])}
                  style={{ width: '100%', fontSize: 12, padding: '4px 0' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  style={{ background: '#f1f5f9', color: 'var(--text-muted)', border: 'none', borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  style={{ background: '#f59e0b', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 10px rgba(245,158,11,0.2)' }}
                >
                  {updateLoading ? 'Updating...' : 'Update Promo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                <span className="material-icons" style={{ color: 'var(--primary)' }}>add_to_queue</span>
                Add Promo Video
              </h3>
              <button onClick={() => setIsPublishModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <span className="material-icons">close</span>
              </button>
            </div>

            <form onSubmit={handlePublish} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Video Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Trackify Premium Features 2026"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>YouTube / Vimeo URL *</label>
                <input
                  type="url"
                  required
                  placeholder="e.g. https://youtu.be/Wury_w-XpXk"
                  value={formData.video_url}
                  onChange={e => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Thumbnail Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setThumbnailFile(e.target.files[0])}
                  style={{ width: '100%', fontSize: 12, padding: '4px 0' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  style={{ background: '#f1f5f9', color: 'var(--text-muted)', border: 'none', borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 10px rgba(37,99,235,0.2)' }}
                >
                  {formLoading ? 'Publishing...' : 'Publish Promo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

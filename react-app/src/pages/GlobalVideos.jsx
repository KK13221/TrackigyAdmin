import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/network';
import Swal from 'sweetalert2';

export default function GlobalVideos({ user }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activePlayVideo, setActivePlayVideo] = useState(null);

  // Publish Form States
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    video_title: '',
    video_url: ''
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const adminId = user?.id || user?._id || 'undefined';

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/global-video/${adminId}`);
      if (res.ok) {
        const result = await res.json();
        if (result.status) {
          setVideos(result.data || []);
        }
      }
    } catch (error) {
      console.error("Error fetching global videos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [adminId]);

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!formData.video_title || !formData.video_url) {
      Swal.fire("Please fill out all required fields.");
      return;
    }
    setFormLoading(true);
    try {
      const bodyData = new FormData();
      bodyData.append('userid', adminId);
      bodyData.append('video_title', formData.video_title);
      bodyData.append('video_url', formData.video_url);
      bodyData.append('adminId', adminId);
      
      if (thumbnailFile) {
        bodyData.append('video_thumbnail', thumbnailFile);
      }

      const res = await fetch(`${BASE_URL}/api/global-video`, {
        method: 'POST',
        body: bodyData
      });

      const resData = await res.json();
      if (res.ok || resData.status) {
        Swal.fire("Video assigned successfully!");
        setIsPublishModalOpen(false);
        setFormData({
          video_title: '',
          video_url: ''
        });
        setThumbnailFile(null);
        fetchVideos();
      } else {
        Swal.fire(resData.message || "Failed to assign video.");
      }
    } catch (err) {
      console.error("Error adding global video:", err);
      Swal.fire("Error occurred while assigning video.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Are you sure you want to delete this video?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, proceed!'
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${BASE_URL}/api/global-video/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchVideos();
      } else {
        Swal.fire("Failed to delete video.");
      }
    } catch (err) {
      console.error("Error deleting video:", err);
    }
  };

  // Helper to ensure full URL for thumbnail images
  const getThumbnailUrl = (thumb) => {
    if (!thumb) return 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=400&q=80';
    if (thumb.startsWith('http')) return thumb;
    return `${BASE_URL}/${thumb}`;
  };

  // Parse embeddable URL for iframe players
  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/embed/') || url.includes('player.vimeo.com')) {
      return url;
    }
    if (url.includes('youtube.com/watch?v=')) {
      const parts = url.split('v=');
      if (parts[1]) return `https://www.youtube.com/embed/${parts[1].split('&')[0]}`;
    }
    if (url.includes('youtu.be/')) {
      const parts = url.split('youtu.be/');
      if (parts[1]) {
        const videoId = parts[1].split('?')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    if (url.includes('youtube.com/shorts/')) {
      const parts = url.split('youtube.com/shorts/');
      if (parts[1]) {
        const videoId = parts[1].split('?')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    return url;
  };

  const filteredVideos = videos.filter(v => {
    const title = v.video_title || '';
    const userid = v.userid || '';
    const term = searchTerm.toLowerCase();
    return title.toLowerCase().includes(term) || userid.toLowerCase().includes(term);
  });

  return (
    <div className="fade-in" style={{ padding: '4px 0', fontFamily: "'Inter', sans-serif" }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
        </div>
        <button
          onClick={() => {
            setFormData({
              video_title: '',
              video_url: ''
            });
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
          Assign Video
        </button>
      </div>

      {/* Filter Navigation Panel */}
      <div
        className="card"
        style={{
          padding: 16,
          borderRadius: 16,
          marginBottom: 32,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            All Assigned Videos
          </button>
        </div>
        <div style={{ position: 'relative', width: 280 }}>
          <span className="material-icons" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: 'var(--text-muted)' }}>
            search
          </span>
          <input
            type="text"
            placeholder="Search by Title or User ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontSize: 12,
              fontWeight: 600,
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
          />
        </div>
      </div>

      {/* Main Listing Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <span className="material-icons" style={{ fontSize: 40, color: 'var(--primary)', animation: 'spin 1s linear infinite' }}>sync</span>
          <div style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>Fetching videos...</div>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', background: 'var(--bg-sidebar)', borderRadius: 16, border: '2px dashed #e2e8f0' }}>
          <span className="material-icons" style={{ fontSize: 48, color: '#cbd5e1', marginBottom: 12 }}>video_library</span>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#334155' }}>No Videos Assigned</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>You haven't assigned any global videos to users yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {filteredVideos.map((video) => (
            <div
              key={video._id}
              className="card"
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer'
              }}
              onClick={() => setActivePlayVideo(video)}
            >
              {/* Thumbnail Container */}
              <div style={{ aspectRatio: '16/9', background: 'var(--text-main)', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.7) 100%)',
                  zIndex: 2
                }} />
                {video.userid && (
                  <div style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 800,
                    zIndex: 3,
                    fontFamily: 'monospace'
                  }}>
                    User ID: {video.userid}
                  </div>
                )}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.95)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 3,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                }}>
                  <span className="material-icons" style={{ color: 'var(--text-main)', fontSize: 28, marginLeft: 3 }}>play_arrow</span>
                </div>
                <img
                  src={getThumbnailUrl(video.video_thumbnail)}
                  alt={video.video_title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Text Description Box */}
              <div style={{ padding: 18, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.4, marginBottom: 8 }}>
                  {video.video_title}
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                    📂 Assigned Video
                  </span>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span
                      onClick={(e) => {
                         e.stopPropagation();
                         handleDelete(video._id);
                      }}
                      style={{ fontSize: 11, color: '#ef4444', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                    >
                      Remove
                      <span className="material-icons" style={{ fontSize: 14 }}>delete</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Streaming Player Modal */}
      {activePlayVideo && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={() => setActivePlayVideo(null)}
        >
          <div
            style={{
              width: '90%',
              maxWidth: 800,
              background: 'var(--text-main)',
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Embed player iframe */}
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: 'black' }}>
              <iframe
                title={activePlayVideo.video_title}
                src={getEmbedUrl(activePlayVideo.video_url)}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              />
            </div>

            {/* Title description footer */}
            <div style={{ padding: 24, background: 'var(--text-main)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <span style={{
                    background: 'rgba(37,99,235,0.2)',
                    color: '#60a5fa',
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: 'uppercase'
                  }}>
                    User ID: {activePlayVideo.userid}
                  </span>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: 'white', marginTop: 8 }}>
                    {activePlayVideo.video_title}
                  </h3>
                </div>
                <button
                  onClick={() => setActivePlayVideo(null)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    padding: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <span className="material-icons">close</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publish Video Form Modal */}
      {isPublishModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999
          }}
          onClick={() => setIsPublishModalOpen(false)}
        >
          <div
            style={{
              width: '90%',
              maxWidth: 500,
              background: 'var(--bg-sidebar)',
              borderRadius: 20,
              padding: 24,
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
              animation: 'scaleUp 0.2s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="material-icons" style={{ color: 'var(--primary)' }}>publish</span>
                Assign New Video
              </h3>
              <button
                onClick={() => setIsPublishModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            <form onSubmit={handlePublish} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Video Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engine Maintenance Guide"
                  value={formData.video_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, video_title: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Video URL (YouTube/Vimeo) *</label>
                <input
                  type="url"
                  required
                  placeholder="e.g. https://youtu.be/..."
                  value={formData.video_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Thumbnail Image File (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnailFile(e.target.files[0])}
                  style={{ width: '100%', fontSize: 12, padding: '4px 0' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  style={{
                    background: '#f1f5f9',
                    color: 'var(--text-muted)',
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 16px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 20px',
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)'
                  }}
                >
                  {formLoading ? 'Assigning...' : 'Assign Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

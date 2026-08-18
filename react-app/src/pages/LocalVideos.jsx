import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BASE_URL } from '../utils/network';
import Swal from 'sweetalert2';

// Fix for default leaflet marker icon not showing correctly in some bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const MapEvents = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

export default function LocalVideos() {
  const [localVideos, setLocalVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activePlayVideo, setActivePlayVideo] = useState(null);

  // Publish form
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', video_url: '', latitude: '', longitude: '', radius: '' });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Map Picker Modal
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapTargetForm, setMapTargetForm] = useState(null); // 'publish' or 'update'
  const [tempLocation, setTempLocation] = useState({ lat: 22.7196, lng: 75.8577, radius: 5 });

  // Update form
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({ _id: '', title: '', video_url: '', latitude: '', longitude: '', radius: '' });
  const [updateThumbnailFile, setUpdateThumbnailFile] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const fetchLocalVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/local-video/all`);
      if (res.ok) {
        const data = await res.json();
        if (data && (data.success || data.status) && Array.isArray(data.data)) {
          setLocalVideos(data.data);
        } else if (Array.isArray(data)) {
          setLocalVideos(data);
        } else if (data && Array.isArray(data.result)) {
          setLocalVideos(data.result);
        } else {
          setLocalVideos([]);
        }
      } else {
        setLocalVideos([]);
      }
    } catch (err) {
      console.error('Error fetching local videos:', err);
      setLocalVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocalVideos();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const body = new FormData();
      body.append('video_title', updateFormData.title);
      body.append('video_url', updateFormData.video_url);
      body.append('latitude', updateFormData.latitude);
      body.append('longitude', updateFormData.longitude);
      body.append('radius', updateFormData.radius);
      if (updateThumbnailFile) {
        body.append('thumbnail_url', updateThumbnailFile);
      }

      const res = await fetch(`${BASE_URL}/api/local-video/update/${updateFormData._id}`, {
        method: 'PUT',
        body
      });
      const resData = await res.json();
      if (res.ok || resData.success) {
        Swal.fire('Local video updated successfully!');
        setIsUpdateModalOpen(false);
        setUpdateFormData({ _id: '', title: '', video_url: '', latitude: '', longitude: '', radius: '' });
        setUpdateThumbnailFile(null);
        fetchLocalVideos();
      } else {
        Swal.fire(resData.message || 'Failed to update local video.');
      }
    } catch (err) {
      console.error('Error updating local video:', err);
      Swal.fire('Error occurred while updating.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this local video?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, proceed!'
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${BASE_URL}/api/local-video/delete/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok || data.success) {
        Swal.fire('Local video deleted successfully!');
        fetchLocalVideos();
      } else {
        Swal.fire(data.message || 'Failed to delete local video.');
      }
    } catch (err) {
      console.error('Error deleting local video:', err);
      Swal.fire('Error occurred while deleting.');
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const body = new FormData();
      body.append('video_title', formData.title);
      body.append('video_url', formData.video_url);
      body.append('latitude', formData.latitude);
      body.append('longitude', formData.longitude);
      body.append('radius', formData.radius);
      if (thumbnailFile) {
        body.append('thumbnail_url', thumbnailFile);
      }

      const res = await fetch(`${BASE_URL}/api/local-video/create`, {
        method: 'POST',
        body
      });
      const resData = await res.json();
      if (res.ok || resData.success) {
        Swal.fire('Local video published successfully!');
        setIsPublishModalOpen(false);
        setFormData({ title: '', video_url: '', latitude: '', longitude: '', radius: '' });
        setThumbnailFile(null);
        fetchLocalVideos();
      } else {
        Swal.fire(resData.message || 'Failed to publish local video.');
      }
    } catch (err) {
      console.error('Error publishing local video:', err);
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
    if (url.includes('youtube.com/shorts/')) {
      const parts = url.split('youtube.com/shorts/');
      if (parts[1]) return `https://www.youtube.com/embed/${parts[1].split('?')[0]}`;
    }
    return url;
  };

  const filtered = localVideos.filter(v =>
    (v.video_title || v.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openMapModal = (target) => {
    setMapTargetForm(target);
    const targetData = target === 'publish' ? formData : updateFormData;
    setTempLocation({
      lat: targetData.latitude ? parseFloat(targetData.latitude) : 22.7196, // default Indore
      lng: targetData.longitude ? parseFloat(targetData.longitude) : 75.8577,
      radius: targetData.radius ? parseFloat(targetData.radius) : 5
    });
    setIsMapModalOpen(true);
  };

  const saveMapLocation = () => {
    if (mapTargetForm === 'publish') {
      setFormData(prev => ({
        ...prev,
        latitude: tempLocation.lat.toFixed(6),
        longitude: tempLocation.lng.toFixed(6),
        radius: tempLocation.radius.toString()
      }));
    } else {
      setUpdateFormData(prev => ({
        ...prev,
        latitude: tempLocation.lat.toFixed(6),
        longitude: tempLocation.lng.toFixed(6),
        radius: tempLocation.radius.toString()
      }));
    }
    setIsMapModalOpen(false);
  };

  return (
    <div className="fade-in" style={{ padding: '4px 0', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
        </div>
        <button
          onClick={() => {
            setFormData({ title: '', video_url: '', latitude: '', longitude: '', radius: '' });
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
          Add Local Video
        </button>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: 16, borderRadius: 16, marginBottom: 28, display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ position: 'relative', width: 300 }}>
          <span className="material-icons" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: 'var(--text-muted)' }}>search</span>
          <input
            type="text"
            placeholder="Search local videos..."
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
          <div style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>Loading local videos...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', background: 'var(--bg-sidebar)', borderRadius: 16, border: '2px dashed #e2e8f0' }}>
          <span className="material-icons" style={{ fontSize: 48, color: '#cbd5e1', marginBottom: 12 }}>videocam_off</span>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#334155' }}>No Local Videos Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>Add your first local video to get started.</p>
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
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white', padding: '2px 10px', borderRadius: 12, fontSize: 10, fontWeight: 800, zIndex: 3
                }}>
                  LOCAL
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
                <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.4, marginBottom: 12 }}>{video.video_title || video.title}</h4>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span className="material-icons" style={{ fontSize: 14 }}>location_on</span> Lat: {video.latitude}, Lng: {video.longitude}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}><span className="material-icons" style={{ fontSize: 14 }}>radar</span> Radius: {video.radius} km</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>🎬 Local Media</span>
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
                        setUpdateFormData({ _id: video._id || video.id, title: video.video_title || video.title, video_url: video.video_url, latitude: video.latitude, longitude: video.longitude, radius: video.radius });
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
                <span style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', padding: '2px 10px', borderRadius: 12, fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>Local Video</span>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: 'white', marginTop: 8 }}>{activePlayVideo.video_title || activePlayVideo.title}</h3>
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
                Update Local Video
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
                  placeholder="e.g. My Local Video"
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
                  placeholder="e.g. https://youtu.be/..."
                  value={updateFormData.video_url}
                  onChange={e => setUpdateFormData(prev => ({ ...prev, video_url: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6, marginTop: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)' }}>Location & Geofence *</label>
                <button
                  type="button"
                  onClick={() => openMapModal('update')}
                  style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <span className="material-icons" style={{ fontSize: 14 }}>map</span> Open Map
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Latitude *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 22.7533"
                    value={updateFormData.latitude}
                    onChange={e => setUpdateFormData(prev => ({ ...prev, latitude: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Longitude *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 75.8937"
                    value={updateFormData.longitude}
                    onChange={e => setUpdateFormData(prev => ({ ...prev, longitude: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Radius (in km) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 5"
                  value={updateFormData.radius}
                  onChange={e => setUpdateFormData(prev => ({ ...prev, radius: e.target.value }))}
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
                  {updateLoading ? 'Updating...' : 'Update Local Video'}
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
                Add Local Video
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
                  placeholder="e.g. My Local Video"
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
                  placeholder="e.g. https://youtu.be/..."
                  value={formData.video_url}
                  onChange={e => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6, marginTop: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)' }}>Location & Geofence *</label>
                <button
                  type="button"
                  onClick={() => openMapModal('publish')}
                  style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <span className="material-icons" style={{ fontSize: 14 }}>map</span> Open Map
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Latitude *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 22.7533"
                    value={formData.latitude}
                    onChange={e => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Longitude *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 75.8937"
                    value={formData.longitude}
                    onChange={e => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Radius (in km) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 5"
                  value={formData.radius}
                  onChange={e => setFormData(prev => ({ ...prev, radius: e.target.value }))}
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
                  {formLoading ? 'Publishing...' : 'Publish Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Map Picker Modal */}
      {isMapModalOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}
          onClick={() => setIsMapModalOpen(false)}
        >
          <div
            style={{ width: '90%', maxWidth: 800, background: 'var(--bg-sidebar)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="material-icons" style={{ color: 'var(--primary)' }}>satellite_alt</span>
                Select Geofence Location
              </h3>
              <button onClick={() => setIsMapModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <span className="material-icons">close</span>
              </button>
            </div>

            <div style={{ display: 'flex', padding: 16, gap: 16, background: '#f8fafc' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Selected Latitude</label>
                <input
                  type="text"
                  readOnly
                  value={tempLocation.lat.toFixed(6)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, background: '#f1f5f9' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Selected Longitude</label>
                <input
                  type="text"
                  readOnly
                  value={tempLocation.lng.toFixed(6)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, background: '#f1f5f9' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Radius (km)</label>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  value={tempLocation.radius}
                  onChange={e => setTempLocation(prev => ({ ...prev, radius: parseFloat(e.target.value) || 0 }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ height: 400, width: '100%', background: '#e2e8f0', position: 'relative' }}>
              <MapContainer 
                center={[tempLocation.lat, tempLocation.lng]} 
                zoom={12} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[tempLocation.lat, tempLocation.lng]} />
                {tempLocation.radius > 0 && (
                  <Circle 
                    center={[tempLocation.lat, tempLocation.lng]} 
                    radius={tempLocation.radius * 1000} 
                    pathOptions={{ color: 'var(--primary)', fillColor: 'var(--primary)', fillOpacity: 0.2 }}
                  />
                )}
                <MapEvents onLocationSelect={(lat, lng) => setTempLocation(prev => ({ ...prev, lat, lng }))} />
              </MapContainer>
              <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, background: 'rgba(255,255,255,0.9)', padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                Click anywhere on the map to set location
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                type="button"
                onClick={() => setIsMapModalOpen(false)}
                style={{ background: '#f1f5f9', color: 'var(--text-muted)', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveMapLocation}
                style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 10px rgba(37,99,235,0.2)' }}
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

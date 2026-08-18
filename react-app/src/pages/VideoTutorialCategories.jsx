import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/network';
import Swal from 'sweetalert2';

export default function VideoTutorialCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Publish form
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ category_name: '' });
  const [formLoading, setFormLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/video-tutorials-category`);
      if (res.ok) {
        const data = await res.json();
        if (data && (data.success || data.status) && Array.isArray(data.data)) {
          setCategories(data.data);
        } else if (Array.isArray(data)) {
          setCategories(data);
        } else if (data && Array.isArray(data.result)) {
          setCategories(data.result);
        } else {
          setCategories([]);
        }
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handlePublish = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const url = editingId
        ? `${BASE_URL}/api/video-tutorials-category/${editingId}`
        : `${BASE_URL}/api/add-video-tutorial-category`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category_name: formData.category_name }),
      });

      const resData = await res.json();
      if (res.ok || resData.status) {
        Swal.fire(`Category ${editingId ? 'updated' : 'added'} successfully!`);
        setIsPublishModalOpen(false);
        setFormData({ category_name: '' });
        setEditingId(null);
        fetchCategories();
      } else {
        Swal.fire(resData.message || `Failed to ${editingId ? 'update' : 'add'} category.`);
      }
    } catch (err) {
      console.error('Error saving category:', err);
      Swal.fire('Error occurred while saving category.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Are you sure you want to delete this category?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, proceed!'
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${BASE_URL}/api/video-tutorials-category/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok || data.status) {
        Swal.fire("Category deleted successfully.");
        fetchCategories();
      } else {
        Swal.fire(data.message || "Failed to delete category.");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const filtered = categories.filter(c =>
    (c.category_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fade-in" style={{ padding: '4px 0', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>

        </div>
        <button
          onClick={() => {
            setFormData({ category_name: '' });
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
          <span className="material-icons" style={{ fontSize: 18 }}>library_add</span>
          Add New Category
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ background: 'var(--bg-sidebar)', borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>

        {/* Controls Bar */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', width: 300 }}>
              <span className="material-icons" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 18 }}>search</span>
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 10px 10px 38px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  fontSize: 13,
                  outline: 'none',
                  background: 'white',
                  transition: 'all 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
            Total Categories: <span style={{ color: 'var(--text-main)', fontWeight: 800 }}>{filtered.length}</span>
          </div>
        </div>

        {/* Categories List */}
        <div style={{ padding: 24, minHeight: 400 }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-muted)' }}>
              <span className="material-icons" style={{ fontSize: 40, animation: 'spin 1s linear infinite' }}>autorenew</span>
              <p style={{ marginTop: 12, fontSize: 13, fontWeight: 600 }}>Loading categories...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 24 }}>
              {filtered.map(category => (
                <div
                  key={category._id || category.id}
                  style={{
                    background: 'white',
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
                    border: '1px solid #f1f5f9',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '20px',
                    transition: 'transform 0.2s ease, boxShadow 0.2s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ background: 'var(--primary-light)', padding: 12, borderRadius: 12, color: 'var(--primary)' }}>
                        <span className="material-icons" style={{ fontSize: 24 }}>category</span>
                      </div>
                      <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>{category.category_name}</h4>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span
                        onClick={() => {
                          setFormData({ category_name: category.category_name });
                          setEditingId(category._id || category.id);
                          setIsPublishModalOpen(true);
                        }}
                        style={{ cursor: 'pointer', color: '#3b82f6', padding: 4 }}
                        title="Edit"
                      >
                        <span className="material-icons" style={{ fontSize: 18 }}>edit</span>
                      </span>
                      <span
                        onClick={() => handleDelete(category._id || category.id)}
                        style={{ cursor: 'pointer', color: '#ef4444', padding: 4 }}
                        title="Delete"
                      >
                        <span className="material-icons" style={{ fontSize: 18 }}>delete</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-muted)' }}>
              <span className="material-icons" style={{ fontSize: 48, color: '#cbd5e1', marginBottom: 16 }}>category</span>
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>No categories found</h4>
              <p style={{ margin: '4px 0 0', fontSize: 13 }}>Click "Add New Category" to create one.</p>
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
            style={{ width: '90%', maxWidth: 400, background: 'var(--bg-sidebar)', borderRadius: 20, padding: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="material-icons" style={{ color: 'var(--primary)' }}>{editingId ? 'edit' : 'library_add'}</span>
                {editingId ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button onClick={() => setIsPublishModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <span className="material-icons">close</span>
              </button>
            </div>

            <form onSubmit={handlePublish} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Beginner Tutorials"
                  value={formData.category_name}
                  onChange={e => setFormData({ category_name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 13, outline: 'none' }}
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
                  {formLoading ? 'Saving...' : (editingId ? 'Update Category' : 'Add Category')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

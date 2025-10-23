import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Users, Plus, Edit, Trash2, Image, X, Upload } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import './AdminHighlights.css';

const AdminHighlights = () => {
  const [highlights, setHighlights] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'achievement',
    imageUrl: '',
    date: ''
  });

  useEffect(() => {
    loadHighlights();
  }, []);

  const loadHighlights = async () => {
    try {
      const storedHighlights = JSON.parse(localStorage.getItem('schoolHighlights') || '[]');
      setHighlights(storedHighlights);
    } catch (error) {
      console.error('Error loading highlights:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const highlightData = {
        ...formData,
        id: editingHighlight ? editingHighlight.id : Date.now().toString(),
        createdAt: new Date().toISOString()
      };

      if (editingHighlight) {
        const updatedHighlights = highlights.map(highlight =>
          highlight.id === editingHighlight.id ? highlightData : highlight
        );
        setHighlights(updatedHighlights);
        localStorage.setItem('schoolHighlights', JSON.stringify(updatedHighlights));
      } else {
        const newHighlights = [...highlights, highlightData];
        setHighlights(newHighlights);
        localStorage.setItem('schoolHighlights', JSON.stringify(newHighlights));
      }

      handleCloseModal();
      alert(editingHighlight ? 'Highlight updated!' : 'Highlight created!');

      // Refresh home page data
      if (window.refreshHomeData) {
        window.refreshHomeData();
      }
    } catch (error) {
      console.error('Error saving highlight:', error);
      alert('Failed to save highlight');
    }
  };

  const handleEdit = (highlight) => {
    setEditingHighlight(highlight);
    setFormData({
      title: highlight.title,
      description: highlight.description,
      category: highlight.category || 'achievement',
      imageUrl: highlight.imageUrl || '',
      date: highlight.date || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this highlight?')) {
      try {
        const updatedHighlights = highlights.filter(highlight => highlight.id !== id);
        setHighlights(updatedHighlights);
        localStorage.setItem('schoolHighlights', JSON.stringify(updatedHighlights));
        alert('Highlight deleted!');

        // Refresh home page data
        if (window.refreshHomeData) {
          window.refreshHomeData();
        }
      } catch (error) {
        console.error('Error deleting highlight:', error);
        alert('Failed to delete highlight');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingHighlight(null);
    setFormData({
      title: '',
      description: '',
      category: 'achievement',
      imageUrl: '',
      date: ''
    });
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'achievement': return '#10b981';
      case 'recognition': return '#3b82f6';
      case 'partnership': return '#8b5cf6';
      case 'event': return '#f59e0b';
      default: return '#667eea';
    }
  };

  return (
    <div className="admin-highlights-page">
      <Navbar />
      <div className="admin-highlights-container">
        <div className="page-header">
          <div>
            <h1><Users size={32} /> Highlights Management</h1>
            <p>Create and manage community highlights and achievements</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            New Highlight
          </button>
        </div>

        <div className="highlights-list">
          {highlights.map((highlight) => (
            <div
              key={highlight.id}
              className="highlight-item"
              style={{ borderLeftColor: getCategoryColor(highlight.category) }}
            >
              <div className="highlight-item-header">
                <div className="highlight-badges">
                  <span
                    className="category-badge"
                    style={{ backgroundColor: getCategoryColor(highlight.category) }}
                  >
                    {highlight.category}
                  </span>
                </div>
                <div className="highlight-actions">
                  <button className="btn-icon" onClick={() => handleEdit(highlight)}>
                    <Edit size={16} />
                  </button>
                  <button className="btn-icon danger" onClick={() => handleDelete(highlight.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="highlight-image-preview">
                {highlight.imageUrl ? (
                  <img src={highlight.imageUrl} alt={highlight.title} />
                ) : (
                  <div className="image-placeholder">
                    <Image size={32} />
                    <span>No Image</span>
                  </div>
                )}
              </div>

              <div className="highlight-content">
                <h3>{highlight.title}</h3>
                <p>{highlight.description}</p>

                <div className="highlight-meta">
                  {highlight.date && (
                    <span className="highlight-date">
                      Date: {new Date(highlight.date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="highlight-item-footer">
                <span className="highlight-created">
                  Created: {new Date(highlight.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}

          {highlights.length === 0 && (
            <div className="empty-state">
              <Users size={48} />
              <h3>No highlights yet</h3>
              <p>Create your first highlight to celebrate community achievements</p>
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingHighlight ? 'Edit Highlight' : 'New Highlight'}</h2>
                <button className="close-btn" onClick={handleCloseModal}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Highlight title"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Highlight description"
                      rows="4"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                      >
                        <option value="achievement">Achievement</option>
                        <option value="recognition">Recognition</option>
                        <option value="partnership">Partnership</option>
                        <option value="event">Event</option>
                        <option value="milestone">Milestone</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Date</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <ImageUpload
                      value={formData.imageUrl}
                      onChange={(imageData) => setFormData({...formData, imageUrl: imageData})}
                      placeholder="Upload highlight image"
                    />
                  </div>

                  <div className="image-preview">
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} alt="Preview" />
                    ) : (
                      <div className="image-placeholder">
                        <Upload size={32} />
                        <span>Image Preview</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingHighlight ? 'Update' : 'Create'} Highlight
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AdminHighlights;

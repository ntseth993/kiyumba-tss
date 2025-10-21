import { useState, useEffect } from 'react';
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../services/announcementsService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Bell, Plus, Edit, Trash2, Eye, X, AlertCircle } from 'lucide-react';
import './AdminAnnouncements.css';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'normal',
    targetAudience: 'all',
    expiresAt: ''
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('Error loading announcements:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editingAnnouncement) {
        await updateAnnouncement(editingAnnouncement.id, formData);
      } else {
        await createAnnouncement(formData);
      }
      
      await loadAnnouncements();
      handleCloseModal();
      alert(editingAnnouncement ? 'Announcement updated!' : 'Announcement created!');
    } catch (error) {
      console.error('Error saving announcement:', error);
      alert('Failed to save announcement');
    }
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      message: announcement.message,
      priority: announcement.priority || 'normal',
      targetAudience: announcement.targetAudience || 'all',
      expiresAt: announcement.expiresAt || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await deleteAnnouncement(id);
        await loadAnnouncements();
        alert('Announcement deleted!');
      } catch (error) {
        console.error('Error deleting announcement:', error);
        alert('Failed to delete announcement');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      message: '',
      priority: 'normal',
      targetAudience: 'all',
      expiresAt: ''
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#667eea';
    }
  };

  return (
    <div className="admin-announcements-page">
      <Navbar />
      <div className="admin-announcements-container">
        <div className="page-header">
          <div>
            <h1><Bell size={32} /> Announcements</h1>
            <p>Create and manage announcements for students, teachers, and staff</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            New Announcement
          </button>
        </div>

        {/* Announcements List */}
        <div className="announcements-list">
          {announcements.map((announcement) => (
            <div 
              key={announcement.id} 
              className="announcement-item"
              style={{ borderLeftColor: getPriorityColor(announcement.priority) }}
            >
              <div className="announcement-item-header">
                <div className="announcement-badges">
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(announcement.priority) }}
                  >
                    {announcement.priority}
                  </span>
                  <span className="audience-badge">{announcement.targetAudience}</span>
                </div>
                <div className="announcement-actions">
                  <button className="btn-icon" onClick={() => handleEdit(announcement)}>
                    <Edit size={16} />
                  </button>
                  <button className="btn-icon danger" onClick={() => handleDelete(announcement.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3>{announcement.title}</h3>
              <p>{announcement.message}</p>
              
              <div className="announcement-item-footer">
                <span className="announcement-date">
                  Posted: {new Date(announcement.createdAt).toLocaleDateString()}
                </span>
                {announcement.expiresAt && (
                  <span className="announcement-expires">
                    Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                  </span>
                )}
                <span className="announcement-views">
                  <Eye size={14} />
                  {announcement.views || 0} views
                </span>
              </div>
            </div>
          ))}

          {announcements.length === 0 && (
            <div className="empty-state">
              <Bell size={48} />
              <h3>No announcements yet</h3>
              <p>Create your first announcement to notify users</p>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}</h2>
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
                      placeholder="Announcement title"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Message *</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Announcement message"
                      rows="6"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Priority</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Target Audience</label>
                      <select
                        value={formData.targetAudience}
                        onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                      >
                        <option value="all">All Users</option>
                        <option value="students">Students Only</option>
                        <option value="teachers">Teachers Only</option>
                        <option value="staff">Staff Only</option>
                        <option value="parents">Parents Only</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Expiration Date (Optional)</label>
                    <input
                      type="datetime-local"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                    />
                    <small>Leave empty for no expiration</small>
                  </div>

                  <div className="info-box">
                    <AlertCircle size={20} />
                    <div>
                      <strong>Note:</strong> This announcement will be visible to {formData.targetAudience === 'all' ? 'all users' : formData.targetAudience} on their dashboards.
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingAnnouncement ? 'Update' : 'Create'} Announcement
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

export default AdminAnnouncements;

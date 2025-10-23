import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Bell, Plus, Edit, Trash2, AlertCircle, X } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import './AdminNotifications.css';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'medium',
    targetAudience: 'all',
    actionUrl: '',
    actionText: '',
    imageUrl: ''
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const storedNotifications = JSON.parse(localStorage.getItem('schoolNotifications') || '[]');
      setNotifications(storedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.message.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const notificationData = {
        ...formData,
        id: editingNotification ? editingNotification.id : Date.now().toString(),
        createdAt: new Date().toISOString(),
        views: 0
      };

      if (editingNotification) {
        const updatedNotifications = notifications.map(notification =>
          notification.id === editingNotification.id ? notificationData : notification
        );
        setNotifications(updatedNotifications);
        localStorage.setItem('schoolNotifications', JSON.stringify(updatedNotifications));
      } else {
        const newNotifications = [...notifications, notificationData];
        setNotifications(newNotifications);
        localStorage.setItem('schoolNotifications', JSON.stringify(newNotifications));
      }

      handleCloseModal();
      alert(editingNotification ? 'Notification updated!' : 'Notification created!');

      // Refresh home page data
      if (window.refreshHomeData) {
        window.refreshHomeData();
      }
    } catch (error) {
      console.error('Error saving notification:', error);
      alert('Failed to save notification');
    }
  };

  const handleEdit = (notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      message: notification.message,
      priority: notification.priority || 'medium',
      targetAudience: notification.targetAudience || 'all',
      actionUrl: notification.actionUrl || '',
      actionText: notification.actionText || '',
      imageUrl: notification.imageUrl || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        const updatedNotifications = notifications.filter(notification => notification.id !== id);
        setNotifications(updatedNotifications);
        localStorage.setItem('schoolNotifications', JSON.stringify(updatedNotifications));
        alert('Notification deleted!');

        // Refresh home page data
        if (window.refreshHomeData) {
          window.refreshHomeData();
        }
      } catch (error) {
        console.error('Error deleting notification:', error);
        alert('Failed to delete notification');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingNotification(null);
    setFormData({
      title: '',
      message: '',
      priority: 'medium',
      targetAudience: 'all',
      actionUrl: '',
      actionText: '',
      imageUrl: ''
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
    <div className="admin-notifications-page">
      <Navbar />
      <div className="admin-notifications-container">
        <div className="page-header">
          <div>
            <h1><Bell size={32} /> Notifications Management</h1>
            <p>Create and manage important notifications for the school community</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            New Notification
          </button>
        </div>

        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="notification-item"
              style={{ borderLeftColor: getPriorityColor(notification.priority) }}
            >
              <div className="notification-item-header">
                <div className="notification-badges">
                  <span
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(notification.priority) }}
                  >
                    {notification.priority} Priority
                  </span>
                  <span className="audience-badge">{notification.targetAudience}</span>
                </div>
                <div className="notification-actions">
                  <button className="btn-icon" onClick={() => handleEdit(notification)}>
                    <Edit size={16} />
                  </button>
                  <button className="btn-icon danger" onClick={() => handleDelete(notification.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3>{notification.title}</h3>
              <p>{notification.message}</p>

              {notification.actionText && notification.actionUrl && (
                <div className="notification-action-preview">
                  <span className="action-label">Action:</span>
                  <span className="action-text">{notification.actionText}</span>
                  <span className="action-url">({notification.actionUrl})</span>
                </div>
              )}

              <div className="notification-item-footer">
                <span className="notification-date">
                  Created: {new Date(notification.createdAt).toLocaleDateString()}
                </span>
                <span className="notification-views">
                  {notification.views || 0} views
                </span>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="empty-state">
              <Bell size={48} />
              <h3>No notifications yet</h3>
              <p>Create your first notification to keep the community informed</p>
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingNotification ? 'Edit Notification' : 'New Notification'}</h2>
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
                      placeholder="Notification title"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Message *</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Notification message"
                      rows="4"
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

                  <div className="form-row">
                    <div className="form-group">
                      <label>Action URL (Optional)</label>
                      <input
                        type="url"
                        value={formData.actionUrl}
                        onChange={(e) => setFormData({...formData, actionUrl: e.target.value})}
                        placeholder="https://example.com"
                      />
                    </div>

                    <div className="form-group">
                      <label>Action Text (Optional)</label>
                      <input
                        type="text"
                        value={formData.actionText}
                        onChange={(e) => setFormData({...formData, actionText: e.target.value})}
                        placeholder="Register Now"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <ImageUpload
                      value={formData.imageUrl}
                      onChange={(imageData) => setFormData({...formData, imageUrl: imageData})}
                      placeholder="Upload notification image"
                    />
                  </div>

                  <div className="info-box">
                    <AlertCircle size={20} />
                    <div>
                      <strong>Note:</strong> This notification will be visible to {formData.targetAudience === 'all' ? 'all users' : formData.targetAudience} on the home page.
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingNotification ? 'Update' : 'Create'} Notification
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

export default AdminNotifications;

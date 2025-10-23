import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { TrendingUp, Plus, Edit, Trash2, Settings, X, Save } from 'lucide-react';
import './AdminWidgets.css';

const AdminWidgets = () => {
  const [widgets, setWidgets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'progress',
    description: '',
    enabled: true,
    settings: {}
  });

  useEffect(() => {
    loadWidgets();
  }, []);

  const loadWidgets = async () => {
    try {
      const storedWidgets = JSON.parse(localStorage.getItem('dashboardWidgets') || '[]');
      setWidgets(storedWidgets);
    } catch (error) {
      console.error('Error loading widgets:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.type) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const widgetData = {
        ...formData,
        id: editingWidget ? editingWidget.id : Date.now().toString(),
        createdAt: new Date().toISOString()
      };

      if (editingWidget) {
        const updatedWidgets = widgets.map(widget =>
          widget.id === editingWidget.id ? widgetData : widget
        );
        setWidgets(updatedWidgets);
        localStorage.setItem('dashboardWidgets', JSON.stringify(updatedWidgets));
      } else {
        const newWidgets = [...widgets, widgetData];
        setWidgets(newWidgets);
        localStorage.setItem('dashboardWidgets', JSON.stringify(newWidgets));
      }

      handleCloseModal();
      alert(editingWidget ? 'Widget updated!' : 'Widget created!');
    } catch (error) {
      console.error('Error saving widget:', error);
      alert('Failed to save widget');
    }
  };

  const handleEdit = (widget) => {
    setEditingWidget(widget);
    setFormData({
      title: widget.title,
      type: widget.type || 'progress',
      description: widget.description || '',
      enabled: widget.enabled !== false,
      settings: widget.settings || {}
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this widget?')) {
      try {
        const updatedWidgets = widgets.filter(widget => widget.id !== id);
        setWidgets(updatedWidgets);
        localStorage.setItem('dashboardWidgets', JSON.stringify(updatedWidgets));
        alert('Widget deleted!');
      } catch (error) {
        console.error('Error deleting widget:', error);
        alert('Failed to delete widget');
      }
    }
  };

  const handleToggleWidget = async (id, enabled) => {
    try {
      const updatedWidgets = widgets.map(widget =>
        widget.id === id ? { ...widget, enabled } : widget
      );
      setWidgets(updatedWidgets);
      localStorage.setItem('dashboardWidgets', JSON.stringify(updatedWidgets));
    } catch (error) {
      console.error('Error toggling widget:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingWidget(null);
    setFormData({
      title: '',
      type: 'progress',
      description: '',
      enabled: true,
      settings: {}
    });
  };

  const getWidgetTypeColor = (type) => {
    switch (type) {
      case 'progress': return '#10b981';
      case 'achievement': return '#f59e0b';
      case 'schedule': return '#3b82f6';
      case 'notification': return '#ef4444';
      default: return '#667eea';
    }
  };

  return (
    <div className="admin-widgets-page">
      <Navbar />
      <div className="admin-widgets-container">
        <div className="page-header">
          <div>
            <h1><TrendingUp size={32} /> Dashboard Widgets</h1>
            <p>Configure and manage widgets displayed on user dashboards</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            New Widget
          </button>
        </div>

        <div className="widgets-list">
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className={`widget-item ${widget.enabled ? 'enabled' : 'disabled'}`}
              style={{ borderLeftColor: getWidgetTypeColor(widget.type) }}
            >
              <div className="widget-item-header">
                <div className="widget-badges">
                  <span
                    className="widget-type-badge"
                    style={{ backgroundColor: getWidgetTypeColor(widget.type) }}
                  >
                    {widget.type}
                  </span>
                  <span className={`status-badge ${widget.enabled ? 'active' : 'inactive'}`}>
                    {widget.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="widget-actions">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={widget.enabled}
                      onChange={(e) => handleToggleWidget(widget.id, e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                  <button className="btn-icon" onClick={() => handleEdit(widget)}>
                    <Edit size={16} />
                  </button>
                  <button className="btn-icon danger" onClick={() => handleDelete(widget.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3>{widget.title}</h3>
              <p>{widget.description}</p>

              <div className="widget-item-footer">
                <span className="widget-created">
                  Created: {new Date(widget.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}

          {widgets.length === 0 && (
            <div className="empty-state">
              <TrendingUp size={48} />
              <h3>No widgets configured</h3>
              <p>Create widgets to enhance user dashboards with personalized content</p>
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingWidget ? 'Edit Widget' : 'New Widget'}</h2>
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
                      placeholder="Widget title"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                      >
                        <option value="progress">Progress Tracking</option>
                        <option value="achievement">Achievements</option>
                        <option value="schedule">Schedule</option>
                        <option value="notification">Notifications</option>
                        <option value="announcement">Announcements</option>
                      </select>
                    </div>

                    <div className="form-group checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.enabled}
                          onChange={(e) => setFormData({...formData, enabled: e.target.checked})}
                        />
                        <span className="checkmark"></span>
                        Enabled for all users
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Widget description"
                      rows="3"
                    />
                  </div>

                  <div className="info-box">
                    <Settings size={20} />
                    <div>
                      <strong>Widget Configuration:</strong> This widget will be displayed on all user dashboards based on its type and settings.
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Save size={16} />
                    {editingWidget ? 'Update' : 'Create'} Widget
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

export default AdminWidgets;

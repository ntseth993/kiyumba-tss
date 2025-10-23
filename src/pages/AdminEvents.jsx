import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Calendar, Plus, Edit, Trash2, X, Clock, MapPin } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import './AdminEvents.css';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    eventType: 'academic',
    targetAudience: 'all',
    featured: false,
    imageUrl: ''
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      // For now, using localStorage since no API is set up
      const storedEvents = JSON.parse(localStorage.getItem('schoolEvents') || '[]');
      setEvents(storedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.date) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const eventData = {
        ...formData,
        id: editingEvent ? editingEvent.id : Date.now().toString(),
        createdAt: new Date().toISOString()
      };

      if (editingEvent) {
        const updatedEvents = events.map(event =>
          event.id === editingEvent.id ? eventData : event
        );
        setEvents(updatedEvents);
        localStorage.setItem('schoolEvents', JSON.stringify(updatedEvents));
      } else {
        const newEvents = [...events, eventData];
        setEvents(newEvents);
        localStorage.setItem('schoolEvents', JSON.stringify(newEvents));
      }

      handleCloseModal();
      alert(editingEvent ? 'Event updated!' : 'Event created!');

      // Refresh home page data
      if (window.refreshHomeData) {
        window.refreshHomeData();
      }
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time || '',
      location: event.location || '',
      eventType: event.eventType || 'academic',
      targetAudience: event.targetAudience || 'all',
      featured: event.featured || false,
      imageUrl: event.imageUrl || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const updatedEvents = events.filter(event => event.id !== id);
        setEvents(updatedEvents);
        localStorage.setItem('schoolEvents', JSON.stringify(updatedEvents));
        alert('Event deleted!');

        // Refresh home page data
        if (window.refreshHomeData) {
          window.refreshHomeData();
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      eventType: 'academic',
      targetAudience: 'all',
      featured: false,
      imageUrl: ''
    });
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'academic': return '#3b82f6';
      case 'career': return '#10b981';
      case 'social': return '#f59e0b';
      default: return '#667eea';
    }
  };

  return (
    <div className="admin-events-page">
      <Navbar />
      <div className="admin-events-container">
        <div className="page-header">
          <div>
            <h1><Calendar size={32} /> Events Management</h1>
            <p>Create and manage school events and activities</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            New Event
          </button>
        </div>

        <div className="events-list">
          {events.map((event) => (
            <div
              key={event.id}
              className={`event-item ${event.featured ? 'featured' : ''}`}
              style={{ borderLeftColor: getEventTypeColor(event.eventType) }}
            >
              <div className="event-item-header">
                <div className="event-badges">
                  <span
                    className="event-type-badge"
                    style={{ backgroundColor: getEventTypeColor(event.eventType) }}
                  >
                    {event.eventType}
                  </span>
                  {event.featured && (
                    <span className="featured-badge">Featured</span>
                  )}
                  <span className="audience-badge">{event.targetAudience}</span>
                </div>
                <div className="event-actions">
                  <button className="btn-icon" onClick={() => handleEdit(event)}>
                    <Edit size={16} />
                  </button>
                  <button className="btn-icon danger" onClick={() => handleDelete(event.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="event-date-info">
                <div className="event-date">
                  <Clock size={16} />
                  {new Date(event.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                  {event.time && ` at ${event.time}`}
                </div>
                {event.location && (
                  <div className="event-location">
                    <MapPin size={16} />
                    {event.location}
                  </div>
                )}
              </div>

              <h3>{event.title}</h3>
              <p>{event.description}</p>

              <div className="event-item-footer">
                <span className="event-created">
                  Created: {new Date(event.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}

          {events.length === 0 && (
            <div className="empty-state">
              <Calendar size={48} />
              <h3>No events yet</h3>
              <p>Create your first event to start planning school activities</p>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingEvent ? 'Edit Event' : 'New Event'}</h2>
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
                      placeholder="Event title"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Event description"
                      rows="4"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Date *</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Time</label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="Event location"
                    />
                  </div>

                  <div className="form-group">
                    <ImageUpload
                      value={formData.imageUrl}
                      onChange={(imageData) => setFormData({...formData, imageUrl: imageData})}
                      placeholder="Upload event image"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Event Type</label>
                      <select
                        value={formData.eventType}
                        onChange={(e) => setFormData({...formData, eventType: e.target.value})}
                      >
                        <option value="academic">Academic</option>
                        <option value="career">Career</option>
                        <option value="social">Social</option>
                        <option value="sports">Sports</option>
                        <option value="cultural">Cultural</option>
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

                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                      />
                      <span className="checkmark"></span>
                      Featured Event
                    </label>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingEvent ? 'Update' : 'Create'} Event
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

export default AdminEvents;

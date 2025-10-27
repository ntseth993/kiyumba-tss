import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Video, Plus, Edit, Trash2, X, Clock, Users, Calendar, Play, Square, UserPlus, UserMinus, Send, Search } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import { useAuth } from '../context/AuthContext';
import {
  getMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  startMeeting,
  endMeeting,
  joinMeeting,
  sendInvitations,
  getMeetingStatistics,
  searchMeetings
} from '../services/meetingsService';
import './AdminMeetings.css';

const AdminMeetings = () => {
  const { user } = useAuth();

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledTime: '',
    duration: 60,
    platform: 'zoom',
    meetingType: 'academic',
    hostId: user?.id || '',
    hostName: user?.name || '',
    hostEmail: user?.email || '',
    participants: [],
    recording: false,
    waitingRoom: true,
    joinBeforeHost: false,
    muteUponEntry: true,
    maxParticipants: 100,
    agenda: '',
    imageUrl: ''
  });

  const isAdmin = user?.role === 'admin' || user?.role === 'Admin' || user?.isAdmin;

  useEffect(() => {
    if (!isAdmin) {
      window.location.href = '/';
      return;
    }
    loadMeetings();
  }, [isAdmin]);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const meetingsData = await getMeetings();
      setMeetings(meetingsData);
    } catch (error) {
      console.error('Error loading meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.scheduledTime) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editingMeeting) {
        await updateMeeting(editingMeeting.id, formData);
        alert('Meeting updated successfully!');
      } else {
        await createMeeting(formData);
        alert('Meeting created successfully!');
      }

      handleCloseModal();
      loadMeetings();
    } catch (error) {
      console.error('Error saving meeting:', error);
      alert('Failed to save meeting');
    }
  };

  const handleEdit = (meeting) => {
    setEditingMeeting(meeting);
    setFormData({
      title: meeting.title,
      description: meeting.description,
      scheduledTime: meeting.scheduledTime,
      duration: meeting.duration || 60,
      platform: meeting.platform || 'zoom',
      meetingType: meeting.meetingType || 'academic',
      hostId: meeting.hostId,
      hostName: meeting.hostName,
      hostEmail: meeting.hostEmail,
      participants: meeting.participants || [],
      recording: meeting.settings?.recording || false,
      waitingRoom: meeting.settings?.waitingRoom !== false,
      joinBeforeHost: meeting.settings?.joinBeforeHost || false,
      muteUponEntry: meeting.settings?.muteUponEntry !== false,
      maxParticipants: meeting.maxParticipants || 100,
      agenda: meeting.agenda || '',
      imageUrl: meeting.imageUrl || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this meeting? This action cannot be undone.')) {
      try {
        await deleteMeeting(id);
        alert('Meeting deleted successfully!');
        loadMeetings();
      } catch (error) {
        console.error('Error deleting meeting:', error);
        alert('Failed to delete meeting');
      }
    }
  };

  const handleStartMeeting = async (meeting) => {
    try {
      await startMeeting(meeting.id, user);
      alert('Meeting started successfully!');
      loadMeetings();
    } catch (error) {
      console.error('Error starting meeting:', error);
      alert('Failed to start meeting');
    }
  };

  const handleEndMeeting = async (meeting) => {
    try {
      await endMeeting(meeting.id, user);
      alert('Meeting ended successfully!');
      loadMeetings();
    } catch (error) {
      console.error('Error ending meeting:', error);
      alert('Failed to end meeting');
    }
  };

  const handleSendInvitations = async (meeting) => {
    try {
      await sendInvitations(meeting.id);
      alert('Invitations sent successfully!');
    } catch (error) {
      console.error('Error sending invitations:', error);
      alert('Failed to send invitations');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMeeting(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      scheduledTime: '',
      duration: 60,
      platform: 'zoom',
      meetingType: 'academic',
      hostId: user?.id || '',
      hostName: user?.name || '',
      hostEmail: user?.email || '',
      participants: [],
      recording: false,
      waitingRoom: true,
      joinBeforeHost: false,
      muteUponEntry: true,
      maxParticipants: 100,
      agenda: '',
      imageUrl: ''
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#3b82f6';
      case 'active': return '#10b981';
      case 'ended': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#667eea';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'scheduled': return 'Scheduled';
      case 'active': return 'Active';
      case 'ended': return 'Ended';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'zoom': return '🎥';
      case 'teams': return '👥';
      case 'googleMeet': return '🔗';
      case 'webrtc': return '📹';
      default: return '💬';
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = searchTerm === '' ||
      meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.hostName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || meeting.status === filterStatus;
    const matchesType = filterType === 'all' || meeting.meetingType === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const statistics = getMeetingStatistics();

  if (!isAdmin) {
    return (
      <div className="admin-meetings-page">
        <Navbar />
        <div className="unauthorized">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="admin-meetings-page">
      <Navbar />
      <div className="admin-meetings-container">
        <div className="page-header">
          <div>
            <h1><Video size={32} /> Meetings Management</h1>
            <p>Schedule and manage video meetings and conferences</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            New Meeting
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="statistics-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{statistics.totalMeetings}</h3>
              <p>Total Meetings</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏰</div>
            <div className="stat-content">
              <h3>{statistics.scheduledMeetings}</h3>
              <p>Scheduled</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔴</div>
            <div className="stat-content">
              <h3>{statistics.activeMeetings}</h3>
              <p>Active</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{statistics.endedMeetings}</h3>
              <p>Completed</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="filters-bar">
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search meetings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-selects">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="active">Active</option>
              <option value="ended">Ended</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="academic">Academic</option>
              <option value="administrative">Administrative</option>
              <option value="counseling">Counseling</option>
              <option value="parent-teacher">Parent-Teacher</option>
              <option value="student-group">Student Group</option>
              <option value="staff">Staff</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Meetings List */}
        <div className="meetings-list">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading meetings...</p>
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="empty-state">
              <Video size={48} />
              <h3>No meetings found</h3>
              <p>{searchTerm || filterStatus !== 'all' || filterType !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first meeting to get started'}</p>
            </div>
          ) : (
            filteredMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className={`meeting-item ${meeting.status}`}
                style={{ borderLeftColor: getStatusColor(meeting.status) }}
              >
                <div className="meeting-item-header">
                  <div className="meeting-badges">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(meeting.status) }}
                    >
                      {getStatusLabel(meeting.status)}
                    </span>
                    <span className="platform-badge">
                      {getPlatformIcon(meeting.platform)} {meeting.platform}
                    </span>
                    <span className="type-badge">{meeting.meetingType}</span>
                  </div>
                  <div className="meeting-actions">
                    {meeting.status === 'scheduled' && (
                      <button
                        className="btn-icon success"
                        onClick={() => handleStartMeeting(meeting)}
                        title="Start Meeting"
                      >
                        <Play size={16} />
                      </button>
                    )}
                    {meeting.status === 'active' && (
                      <button
                        className="btn-icon danger"
                        onClick={() => handleEndMeeting(meeting)}
                        title="End Meeting"
                      >
                        <Square size={16} />
                      </button>
                    )}
                    <button
                      className="btn-icon"
                      onClick={() => handleEdit(meeting)}
                      title="Edit Meeting"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="btn-icon danger"
                      onClick={() => handleDelete(meeting.id)}
                      title="Delete Meeting"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="meeting-date-info">
                  <div className="meeting-date">
                    <Calendar size={16} />
                    {new Date(meeting.scheduledTime).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="meeting-time">
                    <Clock size={16} />
                    {new Date(meeting.scheduledTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })} - {meeting.duration}min
                  </div>
                </div>

                <h3>{meeting.title}</h3>
                <p>{meeting.description}</p>

                <div className="meeting-details">
                  <div className="detail-item">
                    <Users size={16} />
                    <span>Host: {meeting.hostName}</span>
                  </div>
                  {meeting.participants && meeting.participants.length > 0 && (
                    <div className="detail-item">
                      <UserPlus size={16} />
                      <span>{meeting.participants.length} participants</span>
                    </div>
                  )}
                  {meeting.joinUrl && (
                    <div className="detail-item">
                      <span className="join-link">
                        <a href={meeting.joinUrl} target="_blank" rel="noopener noreferrer">
                          Join Meeting
                        </a>
                      </span>
                    </div>
                  )}
                </div>

                <div className="meeting-item-footer">
                  <span className="meeting-created">
                    Created: {new Date(meeting.createdAt).toLocaleDateString()}
                  </span>
                  {meeting.status === 'scheduled' && (
                    <button
                      className="btn btn-small btn-outline"
                      onClick={() => handleSendInvitations(meeting)}
                    >
                      <Send size={14} />
                      Send Invites
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingMeeting ? 'Edit Meeting' : 'New Meeting'}</h2>
                <button className="close-btn" onClick={handleCloseModal}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Title *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Meeting title"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Platform</label>
                      <select
                        value={formData.platform}
                        onChange={(e) => setFormData({...formData, platform: e.target.value})}
                      >
                        <option value="zoom">Zoom</option>
                        <option value="teams">Microsoft Teams</option>
                        <option value="googleMeet">Google Meet</option>
                        <option value="webrtc">WebRTC (Custom)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Meeting description and agenda"
                      rows="3"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Scheduled Time *</label>
                      <input
                        type="datetime-local"
                        value={formData.scheduledTime}
                        onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Duration (minutes)</label>
                      <input
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                        min="15"
                        max="480"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Meeting Type</label>
                      <select
                        value={formData.meetingType}
                        onChange={(e) => setFormData({...formData, meetingType: e.target.value})}
                      >
                        <option value="academic">Academic</option>
                        <option value="administrative">Administrative</option>
                        <option value="counseling">Counseling</option>
                        <option value="parent-teacher">Parent-Teacher</option>
                        <option value="student-group">Student Group</option>
                        <option value="staff">Staff</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Max Participants</label>
                      <input
                        type="number"
                        value={formData.maxParticipants}
                        onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value)})}
                        min="2"
                        max="1000"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <ImageUpload
                      value={formData.imageUrl}
                      onChange={(imageData) => setFormData({...formData, imageUrl: imageData})}
                      placeholder="Upload meeting thumbnail (optional)"
                    />
                  </div>

                  <div className="settings-section">
                    <h4>Meeting Settings</h4>

                    <div className="checkbox-grid">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.recording}
                          onChange={(e) => setFormData({...formData, recording: e.target.checked})}
                        />
                        <span className="checkmark"></span>
                        Enable Recording
                      </label>

                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.waitingRoom}
                          onChange={(e) => setFormData({...formData, waitingRoom: e.target.checked})}
                        />
                        <span className="checkmark"></span>
                        Enable Waiting Room
                      </label>

                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.joinBeforeHost}
                          onChange={(e) => setFormData({...formData, joinBeforeHost: e.target.checked})}
                        />
                        <span className="checkmark"></span>
                        Allow Join Before Host
                      </label>

                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.muteUponEntry}
                          onChange={(e) => setFormData({...formData, muteUponEntry: e.target.checked})}
                        />
                        <span className="checkmark"></span>
                        Mute Upon Entry
                      </label>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingMeeting ? 'Update' : 'Create'} Meeting
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

export default AdminMeetings;

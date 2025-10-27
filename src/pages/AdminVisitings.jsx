import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Users, Calendar, Video, Clock, MapPin, Phone, Mail, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  joinMeeting,
  getUserMeetings,
  getTodayMeetings,
  getUpcomingMeetings
} from '../services/meetingsService';
import './AdminVisitings.css';

const AdminVisitings = () => {
  const { user } = useAuth();

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('scheduled');
  const [visitors, setVisitors] = useState([]);
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

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

  const loadVisitors = () => {
    // Load visitors from localStorage or API
    const storedVisitors = JSON.parse(localStorage.getItem('schoolVisitors') || '[]');
    setVisitors(storedVisitors);
  };

  const handleJoinMeeting = async (meeting, userData) => {
    try {
      await joinMeeting(meeting.id, userData);
      alert('Successfully joined the meeting!');
    } catch (error) {
      console.error('Error joining meeting:', error);
      alert('Failed to join meeting');
    }
  };

  const getMeetingStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={16} className="status-active" />;
      case 'ended':
        return <CheckCircle size={16} className="status-ended" />;
      case 'cancelled':
        return <XCircle size={16} className="status-cancelled" />;
      default:
        return <Clock size={16} className="status-scheduled" />;
    }
  };

  const getMeetingStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'ended':
        return 'Ended';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Scheduled';
    }
  };

  const todayMeetings = meetings.filter(meeting => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const meetingTime = new Date(meeting.scheduledTime);
    return meetingTime >= startOfDay && meetingTime < endOfDay;
  });

  const upcomingMeetings = meetings.filter(meeting => {
    const now = new Date();
    const futureTime = new Date(now.getTime() + (168 * 60 * 60 * 1000));
    const meetingTime = new Date(meeting.scheduledTime);
    return meetingTime >= now && meetingTime <= futureTime;
  });

  const userMeetings = meetings.filter(meeting =>
    meeting.hostId === user?.id ||
    (meeting.participants && meeting.participants.some(p => p.id === user?.id))
  );

  const tabs = [
    { id: 'today', label: 'Today', count: todayMeetings.length },
    { id: 'upcoming', label: 'Upcoming', count: upcomingMeetings.length },
    { id: 'my-meetings', label: 'My Meetings', count: userMeetings.length },
    { id: 'all', label: 'All Meetings', count: meetings.length },
    { id: 'visitors', label: 'Visitors', count: visitors.length }
  ];

  if (!isAdmin) {
    return (
      <div className="admin-visitings-page">
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
    <div className="admin-visitings-page">
      <Navbar />
      <div className="admin-visitings-container">
        <div className="page-header">
          <div>
            <h1><Users size={32} /> Meetings & Visitors</h1>
            <p>Manage meetings, conferences, and visitor appointments</p>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-primary"
              onClick={() => window.location.href = '/admin/meetings'}
            >
              <Video size={20} />
              Manage Meetings
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="tabs-navigation">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              <span className="tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'today' && (
            <div className="meetings-section">
              <div className="section-header">
                <h2><Calendar size={24} /> Today's Meetings</h2>
              </div>

              {todayMeetings.length === 0 ? (
                <div className="empty-state">
                  <Calendar size={48} />
                  <h3>No meetings today</h3>
                  <p>Schedule a meeting or check upcoming appointments</p>
                </div>
              ) : (
                <div className="meetings-grid">
                  {todayMeetings.map(meeting => (
                    <div key={meeting.id} className="meeting-card">
                      <div className="meeting-card-header">
                        <div className="meeting-status">
                          {getMeetingStatusIcon(meeting.status)}
                          <span>{getMeetingStatusText(meeting.status)}</span>
                        </div>
                        <div className="meeting-platform">
                          {meeting.platform === 'zoom' && '🎥 Zoom'}
                          {meeting.platform === 'teams' && '👥 Teams'}
                          {meeting.platform === 'googleMeet' && '🔗 Meet'}
                          {meeting.platform === 'webrtc' && '📹 WebRTC'}
                        </div>
                      </div>

                      <h3>{meeting.title}</h3>
                      <p>{meeting.description}</p>

                      <div className="meeting-details">
                        <div className="detail-item">
                          <Clock size={16} />
                          <span>{new Date(meeting.scheduledTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                        <div className="detail-item">
                          <Users size={16} />
                          <span>{meeting.participants?.length || 0} participants</span>
                        </div>
                      </div>

                      <div className="meeting-actions">
                        {meeting.joinUrl && (
                          <a
                            href={meeting.joinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary btn-small"
                          >
                            Join Meeting
                          </a>
                        )}
                        <button
                          className="btn btn-outline btn-small"
                          onClick={() => setSelectedMeeting(meeting)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'upcoming' && (
            <div className="meetings-section">
              <div className="section-header">
                <h2><Clock size={24} /> Upcoming Meetings</h2>
              </div>

              {upcomingMeetings.length === 0 ? (
                <div className="empty-state">
                  <Clock size={48} />
                  <h3>No upcoming meetings</h3>
                  <p>Schedule a meeting for future dates</p>
                </div>
              ) : (
                <div className="meetings-list">
                  {upcomingMeetings.map(meeting => (
                    <div key={meeting.id} className="meeting-list-item">
                      <div className="meeting-info">
                        <div className="meeting-date">
                          {new Date(meeting.scheduledTime).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="meeting-time">
                          {new Date(meeting.scheduledTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="meeting-title">{meeting.title}</div>
                        <div className="meeting-host">Host: {meeting.hostName}</div>
                      </div>
                      <div className="meeting-actions">
                        {meeting.joinUrl && (
                          <a
                            href={meeting.joinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary btn-small"
                          >
                            Join
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'my-meetings' && (
            <div className="meetings-section">
              <div className="section-header">
                <h2><Users size={24} /> My Meetings</h2>
              </div>

              {userMeetings.length === 0 ? (
                <div className="empty-state">
                  <Users size={48} />
                  <h3>No meetings found</h3>
                  <p>You're not participating in any meetings yet</p>
                </div>
              ) : (
                <div className="meetings-grid">
                  {userMeetings.map(meeting => (
                    <div key={meeting.id} className="meeting-card">
                      <div className="meeting-card-header">
                        <div className="meeting-status">
                          {getMeetingStatusIcon(meeting.status)}
                          <span>{getMeetingStatusText(meeting.status)}</span>
                        </div>
                        <div className="meeting-type">{meeting.meetingType}</div>
                      </div>

                      <h3>{meeting.title}</h3>
                      <p>{meeting.description}</p>

                      <div className="meeting-details">
                        <div className="detail-item">
                          <Calendar size={16} />
                          <span>{new Date(meeting.scheduledTime).toLocaleDateString()}</span>
                        </div>
                        <div className="detail-item">
                          <Clock size={16} />
                          <span>{meeting.duration} minutes</span>
                        </div>
                      </div>

                      <div className="meeting-actions">
                        {meeting.status === 'scheduled' && (
                          <button
                            className="btn btn-success btn-small"
                            onClick={() => handleJoinMeeting(meeting, user)}
                          >
                            Join Meeting
                          </button>
                        )}
                        <button
                          className="btn btn-outline btn-small"
                          onClick={() => setSelectedMeeting(meeting)}
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'all' && (
            <div className="meetings-section">
              <div className="section-header">
                <h2><Video size={24} /> All Meetings</h2>
                <button
                  className="btn btn-primary"
                  onClick={() => window.location.href = '/admin/meetings'}
                >
                  <Plus size={16} />
                  New Meeting
                </button>
              </div>

              {meetings.length === 0 ? (
                <div className="empty-state">
                  <Video size={48} />
                  <h3>No meetings created yet</h3>
                  <p>Create your first meeting to get started</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => window.location.href = '/admin/meetings'}
                  >
                    Create Meeting
                  </button>
                </div>
              ) : (
                <div className="meetings-table-container">
                  <table className="meetings-table">
                    <thead>
                      <tr>
                        <th>Meeting</th>
                        <th>Host</th>
                        <th>Date & Time</th>
                        <th>Platform</th>
                        <th>Status</th>
                        <th>Participants</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {meetings.map(meeting => (
                        <tr key={meeting.id}>
                          <td>
                            <div>
                              <div className="meeting-title">{meeting.title}</div>
                              <div className="meeting-description">{meeting.description}</div>
                            </div>
                          </td>
                          <td>{meeting.hostName}</td>
                          <td>
                            <div>{new Date(meeting.scheduledTime).toLocaleDateString()}</div>
                            <div className="meeting-time">
                              {new Date(meeting.scheduledTime).toLocaleTimeString()}
                            </div>
                          </td>
                          <td>
                            <span className="platform-badge">
                              {meeting.platform === 'zoom' && '🎥 Zoom'}
                              {meeting.platform === 'teams' && '👥 Teams'}
                              {meeting.platform === 'googleMeet' && '🔗 Meet'}
                              {meeting.platform === 'webrtc' && '📹 WebRTC'}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${meeting.status}`}>
                              {getMeetingStatusText(meeting.status)}
                            </span>
                          </td>
                          <td>{meeting.participants?.length || 0}</td>
                          <td>
                            <div className="table-actions">
                              {meeting.joinUrl && (
                                <a
                                  href={meeting.joinUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn-icon"
                                  title="Join Meeting"
                                >
                                  <Video size={16} />
                                </a>
                              )}
                              <button
                                className="btn-icon"
                                onClick={() => setSelectedMeeting(meeting)}
                                title="View Details"
                              >
                                <Edit size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'visitors' && (
            <div className="visitors-section">
              <div className="section-header">
                <h2><Users size={24} /> Visitor Management</h2>
                <button className="btn btn-primary" onClick={() => setShowVisitorModal(true)}>
                  <Plus size={16} />
                  Add Visitor
                </button>
              </div>

              {visitors.length === 0 ? (
                <div className="empty-state">
                  <Users size={48} />
                  <h3>No visitors registered</h3>
                  <p>Register visitors for campus visits and meetings</p>
                </div>
              ) : (
                <div className="visitors-grid">
                  {visitors.map(visitor => (
                    <div key={visitor.id} className="visitor-card">
                      <div className="visitor-header">
                        <div className="visitor-name">{visitor.name}</div>
                        <div className="visitor-type">{visitor.type}</div>
                      </div>

                      <div className="visitor-details">
                        <div className="detail-item">
                          <Mail size={16} />
                          <span>{visitor.email}</span>
                        </div>
                        <div className="detail-item">
                          <Phone size={16} />
                          <span>{visitor.phone}</span>
                        </div>
                        {visitor.company && (
                          <div className="detail-item">
                            <span>Company: {visitor.company}</span>
                          </div>
                        )}
                      </div>

                      <div className="visitor-visit-info">
                        <div className="visit-purpose">{visitor.purpose}</div>
                        <div className="visit-date">
                          {new Date(visitor.visitDate).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="visitor-actions">
                        <button className="btn btn-outline btn-small">Edit</button>
                        <button className="btn btn-danger btn-small">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Meeting Details Modal */}
        {selectedMeeting && (
          <div className="modal-overlay" onClick={() => setSelectedMeeting(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedMeeting.title}</h2>
                <button className="close-btn" onClick={() => setSelectedMeeting(null)}>
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="meeting-details-modal">
                  <div className="detail-section">
                    <h4>Meeting Information</h4>
                    <p><strong>Description:</strong> {selectedMeeting.description}</p>
                    <p><strong>Host:</strong> {selectedMeeting.hostName}</p>
                    <p><strong>Type:</strong> {selectedMeeting.meetingType}</p>
                    <p><strong>Platform:</strong> {selectedMeeting.platform}</p>
                    <p><strong>Duration:</strong> {selectedMeeting.duration} minutes</p>
                  </div>

                  <div className="detail-section">
                    <h4>Schedule</h4>
                    <p><strong>Date:</strong> {new Date(selectedMeeting.scheduledTime).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {new Date(selectedMeeting.scheduledTime).toLocaleTimeString()}</p>
                    <p><strong>Status:</strong> <span className={`status-badge ${selectedMeeting.status}`}>
                      {getMeetingStatusText(selectedMeeting.status)}
                    </span></p>
                  </div>

                  {selectedMeeting.participants && selectedMeeting.participants.length > 0 && (
                    <div className="detail-section">
                      <h4>Participants ({selectedMeeting.participants.length})</h4>
                      <div className="participants-list">
                        {selectedMeeting.participants.map((participant, index) => (
                          <div key={index} className="participant-item">
                            <span>{participant.name}</span>
                            <span>{participant.email}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedMeeting.joinUrl && (
                    <div className="detail-section">
                      <h4>Join Meeting</h4>
                      <a
                        href={selectedMeeting.joinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                      >
                        Join Meeting
                      </a>
                      {selectedMeeting.password && (
                        <p><strong>Password:</strong> {selectedMeeting.password}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline" onClick={() => setSelectedMeeting(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AdminVisitings;
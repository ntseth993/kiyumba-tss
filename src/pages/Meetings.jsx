import { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Video, Calendar, Clock, Users, Play, Eye, Search, Filter, MapPin } from 'lucide-react';
import MeetingCard from '../components/MeetingCard';
import { useAuth } from '../context/AuthContext';
import {
  getMeetings,
  joinMeeting,
  getUserMeetings,
  getUpcomingMeetings,
  getTodayMeetings,
  searchMeetings
} from '../services/meetingsService';
import './Meetings.css';

const Meetings = () => {
  const { user } = useAuth();

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [todayMeetings, setTodayMeetings] = useState([]);
  const [userMeetings, setUserMeetings] = useState([]);

  useEffect(() => {
    loadMeetings();
  }, []);

  useEffect(() => {
    // Reload filtered meetings when user changes (for user meetings)
    if (user) {
      getUserMeetings(user.id).then(setUserMeetings);
    }
  }, [user]);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const meetingsData = await getMeetings();
      setMeetings(meetingsData);

      // Load filtered meetings
      const [upcoming, today, userMeetingsData] = await Promise.all([
        getUpcomingMeetings(),
        getTodayMeetings(),
        user ? getUserMeetings(user.id) : Promise.resolve([])
      ]);

      setUpcomingMeetings(upcoming);
      setTodayMeetings(today);
      setUserMeetings(userMeetingsData);
    } catch (error) {
      console.error('Error loading meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = async (meeting) => {
    if (!user) {
      alert('Please log in to join meetings');
      return;
    }

    try {
      await joinMeeting(meeting.id, {
        id: user.id,
        name: user.name,
        email: user.email
      });
      alert('Successfully joined the meeting!');
      setSelectedMeeting(null);
      loadMeetings();
    } catch (error) {
      console.error('Error joining meeting:', error);
      alert('Failed to join meeting. Please try again.');
    }
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
      case 'active': return 'Live Now';
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
      case 'physical': return '🏫';
      case 'hybrid': return '🔄';
      default: return '💬';
    }
  };

  const getLocationInfo = (meeting) => {
    if (meeting.venue) {
      return {
        icon: '🏫',
        label: meeting.venue,
        type: 'Physical'
      };
    }
    
    if (meeting.platform) {
      return {
        icon: getPlatformIcon(meeting.platform),
        label: meeting.platform === 'webrtc' ? 'Built-in Video Call' : meeting.platform,
        type: 'Virtual'
      };
    }

    if (meeting.link) {
      return {
        icon: '🔗',
        label: 'External Link',
        type: 'Virtual'
      };
    }

    return {
      icon: '📍',
      label: 'Location TBD',
      type: 'Unspecified'
    };
  };

  const canJoinMeeting = (meeting) => {
    if (!user) return false;
    if (meeting.status !== 'scheduled') return false;

    const meetingTime = new Date(meeting.scheduledTime);
    const now = new Date();
    const timeDiff = meetingTime.getTime() - now.getTime();
    const minutesUntilMeeting = timeDiff / (1000 * 60);

    // Can join if meeting starts within 24 hours
    return minutesUntilMeeting <= 24 * 60 && minutesUntilMeeting >= -60; // 1 hour before to 1 hour after
  };

  const filteredMeetings = useMemo(() => {
    let meetingsToFilter = [];

    // Get meetings based on active tab
    switch (activeTab) {
      case 'upcoming':
        meetingsToFilter = upcomingMeetings;
        break;
      case 'today':
        meetingsToFilter = todayMeetings;
        break;
      case 'my-meetings':
        meetingsToFilter = userMeetings;
        break;
      case 'all':
        meetingsToFilter = meetings;
        break;
      default:
        meetingsToFilter = upcomingMeetings;
    }

    // Apply search filter
    if (searchTerm) {
      meetingsToFilter = meetingsToFilter.filter(meeting =>
        meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.hostName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      meetingsToFilter = meetingsToFilter.filter(meeting =>
        meeting.meetingType === filterType
      );
    }

    return meetingsToFilter;
  }, [activeTab, searchTerm, filterType, upcomingMeetings, todayMeetings, userMeetings, meetings]);

  const tabs = [
    { id: 'upcoming', label: 'Upcoming', count: upcomingMeetings.length },
    { id: 'today', label: 'Today', count: todayMeetings.length },
    { id: 'my-meetings', label: 'My Meetings', count: userMeetings.length },
    { id: 'all', label: 'All Meetings', count: meetings.length }
  ];

  return (
    <div className="meetings-page">
      <Navbar />
      <div className="meetings-container">
        <div className="page-header">
          <div>
            <h1><Video size={32} /> Meetings & Conferences</h1>
            <p>Join video meetings and conferences with your school community</p>
          </div>
          {user && (
            <div className="user-info">
              <span>Welcome, {user.name}!</span>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="filters-section">
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search meetings by title, location, or host..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-select">
            <Filter size={20} />
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

        {/* Meetings Content */}
        <div className="meetings-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading meetings...</p>
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="empty-state">
              <Video size={48} />
              <h3>No meetings found</h3>
              <p>
                {searchTerm || filterType !== 'all'
                  ? 'Try adjusting your search or filters'
                  : activeTab === 'my-meetings'
                    ? "You haven't joined any meetings yet"
                    : "No meetings are currently scheduled"}
              </p>
            </div>
          ) : (
            <div className="meetings-grid">
              {filteredMeetings.map(meeting => (
                <div
                  key={meeting.id}
                  className={`meeting-card ${meeting.status} ${canJoinMeeting(meeting) ? 'joinable' : ''}`}
                  style={{ borderLeftColor: getStatusColor(meeting.status) }}
                >
                  <div className="meeting-card-header">
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
                      {canJoinMeeting(meeting) && meeting.joinUrl && (
                        <a
                          href={meeting.joinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-icon join"
                          title="Join Meeting"
                        >
                          <Play size={16} />
                        </a>
                      )}
                      <button
                        className="btn-icon view"
                        onClick={() => setSelectedMeeting(meeting)}
                        title="View Details"
                      >
                        <Eye size={16} />
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
                      })}
                      <span className="duration">({meeting.duration}min)</span>
                    </div>
                  </div>

                  <h3>{meeting.title}</h3>
                  <p>{meeting.description}</p>

                  <div className="meeting-details">
                    <div className="detail-item">
                      <Users size={16} />
                      <span>Host: {meeting.hostName}</span>
                    </div>
                    {meeting.platform && (
                      <div className="detail-item">
                        <Video size={16} />
                        <span>Source: {meeting.platform}</span>
                      </div>
                    )}
                    {meeting.location && (
                      <div className="detail-item location-item">
                        <Building size={16} />
                        <span>{meeting.location}</span>
                      </div>
                    )}
                    {meeting.participants && meeting.participants.length > 0 && (
                      <div className="detail-item">
                        <Users size={16} />
                        <span>{meeting.participants.length} participants</span>
                      </div>
                    )}
                  </div>

                  <div className="meeting-card-footer">
                    <div className="meeting-created">
                      Created: {new Date(meeting.createdAt).toLocaleDateString()}
                    </div>
                    {canJoinMeeting(meeting) && !user && (
                      <button
                        className="btn btn-primary btn-small"
                        onClick={() => alert('Please log in to join meetings')}
                      >
                        Login to Join
                      </button>
                    )}
                    {canJoinMeeting(meeting) && user && !meeting.joinUrl && (
                      <button
                        className="btn btn-success btn-small"
                        onClick={() => handleJoinMeeting(meeting)}
                      >
                        <Play size={16} />
                        Join {meeting.platform || 'Web'} Meeting
                      </button>
                    )}
                    {meeting.status === 'active' && (
                      <div className="meeting-active-info">
                        <span className="live-indicator">
                          🔴 LIVE
                        </span>
                        <a href={`/meetings/live/${meeting.id}`} className="btn btn-primary btn-small">
                          <Video size={16} />
                          Enter Live Session
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <div className="quick-action-card">
            <div className="quick-action-icon">
              <Calendar size={32} />
            </div>
            <h3>Schedule Meeting</h3>
            <p>Request a meeting with teachers or staff</p>
            <button
              className="btn btn-outline"
              onClick={() => alert('Meeting scheduling feature coming soon!')}
            >
              Request Meeting
            </button>
          </div>

          <div className="quick-action-card">
            <div className="quick-action-icon">
              <Users size={32} />
            </div>
            <h3>Join Study Group</h3>
            <p>Connect with classmates for group study sessions</p>
            <button
              className="btn btn-outline"
              onClick={() => alert('Study group feature coming soon!')}
            >
              Find Groups
            </button>
          </div>

          <div className="quick-action-card">
            <div className="quick-action-icon">
              <Video size={32} />
            </div>
            <h3>Office Hours</h3>
            <p>Join virtual office hours with instructors</p>
            <button
              className="btn btn-outline"
              onClick={() => alert('Office hours schedule coming soon!')}
            >
              View Schedule
            </button>
          </div>
        </div>
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
                  <p><strong>Max Participants:</strong> {selectedMeeting.maxParticipants || 'Unlimited'}</p>
                </div>

                <div className="detail-section">
                  <h4>Schedule</h4>
                  <p><strong>Date:</strong> {new Date(selectedMeeting.scheduledTime).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {new Date(selectedMeeting.scheduledTime).toLocaleTimeString()}</p>
                  <p><strong>Status:</strong>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedMeeting.status) }}
                    >
                      {getStatusLabel(selectedMeeting.status)}
                    </span>
                  </p>
                </div>

                {selectedMeeting.participants && selectedMeeting.participants.length > 0 && (
                  <div className="detail-section">
                    <h4>Participants ({selectedMeeting.participants.length})</h4>
                    <div className="participants-list">
                      {selectedMeeting.participants.map((participant, index) => (
                        <div key={index} className="participant-item">
                          <span>{participant.name}</span>
                          <span className="participant-email">{participant.email}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="detail-section">
                  <h4>Meeting Settings</h4>
                  <div className="settings-list">
                    {selectedMeeting.settings?.recording && (
                      <div className="setting-item">✅ Recording enabled</div>
                    )}
                    {selectedMeeting.settings?.waitingRoom && (
                      <div className="setting-item">⏳ Waiting room enabled</div>
                    )}
                    {selectedMeeting.settings?.joinBeforeHost && (
                      <div className="setting-item">🚪 Join before host allowed</div>
                    )}
                    {selectedMeeting.settings?.muteUponEntry && (
                      <div className="setting-item">🔇 Muted upon entry</div>
                    )}
                  </div>
                </div>

                {selectedMeeting.joinUrl && (
                  <div className="detail-section">
                    <h4>Join Meeting</h4>
                    <div className="join-section">
                      <a
                        href={selectedMeeting.joinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-large"
                      >
                        <Play size={20} />
                        Join Meeting
                      </a>
                      {selectedMeeting.password && (
                        <p><strong>Meeting Password:</strong> {selectedMeeting.password}</p>
                      )}
                      {selectedMeeting.meetingCode && (
                        <p><strong>Meeting Code:</strong> {selectedMeeting.meetingCode}</p>
                      )}
                    </div>
                  </div>
                )}

                {!selectedMeeting.joinUrl && canJoinMeeting(selectedMeeting) && user && (
                  <div className="detail-section">
                    <h4>Join Meeting</h4>
                    <button
                      className="btn btn-success btn-large"
                      onClick={() => handleJoinMeeting(selectedMeeting)}
                    >
                      <Play size={20} />
                      Join Meeting
                    </button>
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

      <Footer />
    </div>
  );
};

export default Meetings;

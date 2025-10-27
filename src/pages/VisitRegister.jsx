import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Calendar, Clock, Users, Video, User, Mail, Phone, Building, MessageSquare, Send, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMeetings, createMeeting, updateMeeting } from '../services/meetingsService';
import './VisitRegister.css';

const VisitRegister = () => {
  const { user } = useAuth();

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('register');
  const [registrationType, setRegistrationType] = useState('meeting');
  const [formData, setFormData] = useState({
    // Personal Information
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    studentId: user?.studentId || '',

    // Meeting Registration
    meetingId: '',
    registrationReason: '',
    specialRequests: '',

    // Visit Registration
    visitDate: '',
    visitTime: '',
    visitPurpose: '',
    company: '',
    department: '',
    hostName: '',
    visitorCount: 1,
    visitDuration: 60,

    // Meeting Creation (for staff)
    meetingTitle: '',
    meetingDescription: '',
    scheduledDate: '',
    scheduledTime: '',
    meetingDuration: 60,
    meetingType: 'academic',
    platform: 'zoom',
    maxParticipants: 50,

    // Common
    additionalNotes: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const isStaff = user?.role === 'teacher' || user?.role === 'admin' || user?.role === 'staff';

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        studentId: user.studentId || prev.studentId
      }));
    }
    loadMeetings();
  }, [user]);

  const loadMeetings = async () => {
    try {
      const meetingsData = await getMeetings();
      setMeetings(meetingsData);
    } catch (error) {
      console.error('Error loading meetings:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (registrationType === 'meeting') {
        await handleMeetingRegistration();
      } else if (registrationType === 'visit') {
        await handleVisitRegistration();
      } else if (registrationType === 'create-meeting' && isStaff) {
        await handleCreateMeeting();
      }

      setSubmitted(true);
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMeetingRegistration = async () => {
    if (!formData.meetingId) {
      throw new Error('Please select a meeting');
    }

    const meeting = meetings.find(m => m.id === formData.meetingId);
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    // Register for meeting (this would typically call an API)
    const registration = {
      id: Date.now().toString(),
      meetingId: formData.meetingId,
      userId: user?.id,
      userName: formData.name,
      userEmail: formData.email,
      userPhone: formData.phone,
      registrationReason: formData.registrationReason,
      specialRequests: formData.specialRequests,
      registeredAt: new Date().toISOString(),
      status: 'pending'
    };

    // Store registration in localStorage for demo
    const registrations = JSON.parse(localStorage.getItem('meetingRegistrations') || '[]');
    registrations.push(registration);
    localStorage.setItem('meetingRegistrations', JSON.stringify(registrations));

    // Add user to meeting participants if not already there
    const updatedParticipants = [...(meeting.participants || []), {
      id: user?.id || `guest-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      registeredAt: new Date().toISOString(),
      status: 'registered'
    }];

    // Update meeting with new participant
    await updateMeeting(formData.meetingId, { participants: updatedParticipants });
  };

  const handleVisitRegistration = async () => {
    if (!formData.visitDate || !formData.visitPurpose) {
      throw new Error('Please fill in all required fields');
    }

    const visit = {
      id: Date.now().toString(),
      type: 'visit',
      visitorName: formData.name,
      visitorEmail: formData.email,
      visitorPhone: formData.phone,
      visitDate: formData.visitDate,
      visitTime: formData.visitTime,
      visitPurpose: formData.visitPurpose,
      company: formData.company,
      department: formData.department,
      hostName: formData.hostName,
      visitorCount: formData.visitorCount,
      duration: formData.visitDuration,
      additionalNotes: formData.additionalNotes,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Store visit in localStorage for demo
    const visits = JSON.parse(localStorage.getItem('schoolVisits') || '[]');
    visits.push(visit);
    localStorage.setItem('schoolVisits', JSON.stringify(visits));
  };

  const handleCreateMeeting = async () => {
    if (!isStaff) {
      throw new Error('Only staff can create meetings');
    }

    if (!formData.meetingTitle || !formData.scheduledDate || !formData.scheduledTime) {
      throw new Error('Please fill in all required fields');
    }

    const meetingData = {
      title: formData.meetingTitle,
      description: formData.meetingDescription,
      scheduledTime: `${formData.scheduledDate}T${formData.scheduledTime}:00`,
      duration: formData.meetingDuration,
      platform: formData.platform,
      meetingType: formData.meetingType,
      hostId: user.id,
      hostName: user.name,
      hostEmail: user.email,
      maxParticipants: formData.maxParticipants,
      participants: [],
      settings: {
        recording: false,
        waitingRoom: true,
        joinBeforeHost: false,
        muteUponEntry: true
      }
    };

    await createMeeting(meetingData);
  };

  const resetForm = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      studentId: user?.studentId || '',
      meetingId: '',
      registrationReason: '',
      specialRequests: '',
      visitDate: '',
      visitTime: '',
      visitPurpose: '',
      company: '',
      department: '',
      hostName: '',
      visitorCount: 1,
      visitDuration: 60,
      meetingTitle: '',
      meetingDescription: '',
      scheduledDate: '',
      scheduledTime: '',
      meetingDuration: 60,
      meetingType: 'academic',
      platform: 'zoom',
      maxParticipants: 50,
      additionalNotes: ''
    });
    setSubmitted(false);
  };

  const availableMeetings = meetings.filter(meeting =>
    meeting.status === 'scheduled' &&
    (!meeting.maxParticipants || (meeting.participants?.length || 0) < meeting.maxParticipants)
  );

  const visitPurposes = [
    'Campus Tour',
    'Meeting with Faculty',
    'Student Services',
    'Career Counseling',
    'Admissions Inquiry',
    'Parent Consultation',
    'Industry Partnership',
    'Research Collaboration',
    'Other'
  ];

  const departments = [
    'Software Development',
    'Fashion Design',
    'Building Construction',
    'Wood Technology',
    'Administration',
    'Student Services',
    'Admissions',
    'Career Services',
    'Other'
  ];

  if (submitted) {
    return (
      <div className="visit-register-page">
        <Navbar />
        <div className="success-container">
          <div className="success-card">
            <CheckCircle size={64} className="success-icon" />
            <h2>Registration Successful!</h2>
            <p>
              {registrationType === 'meeting' && 'You have successfully registered for the meeting.'}
              {registrationType === 'visit' && 'Your visit has been scheduled successfully.'}
              {registrationType === 'create-meeting' && 'Your meeting has been created successfully.'}
            </p>
            <div className="success-actions">
              <button className="btn btn-primary" onClick={resetForm}>
                Register Another
              </button>
              <button
                className="btn btn-outline"
                onClick={() => window.location.href = '/meetings'}
              >
                View Meetings
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="visit-register-page">
      <Navbar />
      <div className="visit-register-container">
        <div className="page-header">
          <div>
            <h1><Calendar size={32} /> Meeting & Visit Registration</h1>
            <p>Register for meetings or schedule campus visits</p>
          </div>
        </div>

        {/* Registration Type Selection */}
        <div className="registration-types">
          <button
            className={`type-button ${registrationType === 'meeting' ? 'active' : ''}`}
            onClick={() => setRegistrationType('meeting')}
          >
            <Video size={24} />
            Join Meeting
          </button>
          <button
            className={`type-button ${registrationType === 'visit' ? 'active' : ''}`}
            onClick={() => setRegistrationType('visit')}
          >
            <Building size={24} />
            Schedule Visit
          </button>
          {isStaff && (
            <button
              className={`type-button ${registrationType === 'create-meeting' ? 'active' : ''}`}
              onClick={() => setRegistrationType('create-meeting')}
            >
              <Users size={24} />
              Create Meeting
            </button>
          )}
        </div>

        {/* Registration Form */}
        <div className="registration-form-container">
          <form onSubmit={handleSubmit} className="registration-form">

            {/* Personal Information */}
            <div className="form-section">
              <h3>Personal Information</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <User size={16} />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Mail size={16} />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <Phone size={16} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Enter your phone number"
                  />
                </div>

                {user?.role === 'student' && (
                  <div className="form-group">
                    <label>Student ID</label>
                    <input
                      type="text"
                      value={formData.studentId}
                      onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                      placeholder="Enter your student ID"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Meeting Registration */}
            {registrationType === 'meeting' && (
              <div className="form-section">
                <h3>Meeting Registration</h3>

                <div className="form-group">
                  <label>Select Meeting *</label>
                  <select
                    value={formData.meetingId}
                    onChange={(e) => setFormData({...formData, meetingId: e.target.value})}
                    required
                  >
                    <option value="">Choose a meeting...</option>
                    {availableMeetings.map(meeting => (
                      <option key={meeting.id} value={meeting.id}>
                        {meeting.title} - {new Date(meeting.scheduledTime).toLocaleDateString()} at {new Date(meeting.scheduledTime).toLocaleTimeString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Reason for Joining</label>
                  <select
                    value={formData.registrationReason}
                    onChange={(e) => setFormData({...formData, registrationReason: e.target.value})}
                  >
                    <option value="">Select reason...</option>
                    <option value="academic">Academic Discussion</option>
                    <option value="career">Career Guidance</option>
                    <option value="project">Project Consultation</option>
                    <option value="counseling">Personal Counseling</option>
                    <option value="collaboration">Collaboration</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Special Requests or Comments</label>
                  <textarea
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
                    placeholder="Any special accommodations or topics you'd like to discuss..."
                    rows="3"
                  />
                </div>
              </div>
            )}

            {/* Visit Registration */}
            {registrationType === 'visit' && (
              <div className="form-section">
                <h3>Visit Information</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Visit Date *</label>
                    <input
                      type="date"
                      value={formData.visitDate}
                      onChange={(e) => setFormData({...formData, visitDate: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Preferred Time</label>
                    <select
                      value={formData.visitTime}
                      onChange={(e) => setFormData({...formData, visitTime: e.target.value})}
                    >
                      <option value="">Select time...</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Purpose of Visit *</label>
                    <select
                      value={formData.visitPurpose}
                      onChange={(e) => setFormData({...formData, visitPurpose: e.target.value})}
                      required
                    >
                      <option value="">Select purpose...</option>
                      {visitPurposes.map(purpose => (
                        <option key={purpose} value={purpose}>{purpose}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Number of Visitors</label>
                    <input
                      type="number"
                      value={formData.visitorCount}
                      onChange={(e) => setFormData({...formData, visitorCount: parseInt(e.target.value)})}
                      min="1"
                      max="10"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Department to Visit</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                    >
                      <option value="">Select department...</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Preferred Host (if known)</label>
                    <input
                      type="text"
                      value={formData.hostName}
                      onChange={(e) => setFormData({...formData, hostName: e.target.value})}
                      placeholder="Name of specific person you'd like to meet"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Company/Organization (if applicable)</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    placeholder="Your company or organization name"
                  />
                </div>

                <div className="form-group">
                  <label>Additional Notes</label>
                  <textarea
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
                    placeholder="Any additional information or special requirements..."
                    rows="3"
                  />
                </div>
              </div>
            )}

            {/* Create Meeting (Staff Only) */}
            {registrationType === 'create-meeting' && isStaff && (
              <div className="form-section">
                <h3>Create New Meeting</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Meeting Title *</label>
                    <input
                      type="text"
                      value={formData.meetingTitle}
                      onChange={(e) => setFormData({...formData, meetingTitle: e.target.value})}
                      placeholder="Enter meeting title"
                      required
                    />
                  </div>

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
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.meetingDescription}
                    onChange={(e) => setFormData({...formData, meetingDescription: e.target.value})}
                    placeholder="Meeting description and agenda"
                    rows="3"
                    required
                  />
                </div>

                <div className="form-row">
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

                  <div className="form-group">
                    <label>Duration (minutes)</label>
                    <input
                      type="number"
                      value={formData.meetingDuration}
                      onChange={(e) => setFormData({...formData, meetingDuration: parseInt(e.target.value)})}
                      min="15"
                      max="480"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Time *</label>
                    <input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                      required
                    />
                  </div>
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
            )}

            {/* Submit Button */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={resetForm}
              >
                Reset Form
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner small"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    {registrationType === 'meeting' && 'Register for Meeting'}
                    {registrationType === 'visit' && 'Schedule Visit'}
                    {registrationType === 'create-meeting' && 'Create Meeting'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Available Meetings (for meeting registration) */}
        {registrationType === 'meeting' && availableMeetings.length > 0 && (
          <div className="available-meetings">
            <h3>Available Meetings</h3>
            <div className="meetings-list">
              {availableMeetings.map(meeting => (
                <div
                  key={meeting.id}
                  className={`meeting-item ${formData.meetingId === meeting.id ? 'selected' : ''}`}
                  onClick={() => setFormData({...formData, meetingId: meeting.id})}
                >
                  <div className="meeting-info">
                    <h4>{meeting.title}</h4>
                    <p>{meeting.description}</p>
                    <div className="meeting-meta">
                      <span className="meta-item">
                        <Calendar size={16} />
                        {new Date(meeting.scheduledTime).toLocaleDateString()}
                      </span>
                      <span className="meta-item">
                        <Clock size={16} />
                        {new Date(meeting.scheduledTime).toLocaleTimeString()}
                      </span>
                      <span className="meta-item">
                        <Users size={16} />
                        {meeting.participants?.length || 0}/{meeting.maxParticipants || '∞'}
                      </span>
                    </div>
                  </div>
                  <div className="meeting-platform">
                    {meeting.platform === 'zoom' && '🎥 Zoom'}
                    {meeting.platform === 'teams' && '👥 Teams'}
                    {meeting.platform === 'googleMeet' && '🔗 Meet'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default VisitRegister;
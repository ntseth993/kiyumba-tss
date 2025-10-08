import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chat from '../components/Chat';
import { Users, BookOpen, Award, Calendar, Settings, FileText, MessageSquare, Bell } from 'lucide-react';
import { getPosts } from '../services/postsService';
import { getAllMessages } from '../services/messagesService';
import { getContactSubmissions } from '../services/contactService';
import './StaffDashboard.css';

const StaffDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [postStats, setPostStats] = useState({ total: 0, visible: 0, hidden: 0 });
  const [messages, setMessages] = useState([]);
  const [contactSubmissions, setContactSubmissions] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load post stats
      const posts = await getPosts();
      const visible = posts.filter(p => p.visible !== false).length;
      const hidden = posts.filter(p => p.visible === false).length;
      setPostStats({ total: posts.length, visible, hidden });

      // Load messages
      const messagesData = await getAllMessages();
      setMessages(messagesData);

      // Load contact submissions
      const contactData = await getContactSubmissions();
      setContactSubmissions(contactData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const stats = [
    { id: 1, label: 'Total Posts', value: postStats.total.toString(), icon: FileText, color: '#4F46E5', change: `${postStats.visible} visible` },
    { id: 2, label: 'Messages', value: messages.length.toString(), icon: MessageSquare, color: '#10B981', change: 'New messages' },
    { id: 3, label: 'Contact Forms', value: contactSubmissions.length.toString(), icon: Bell, color: '#F59E0B', change: 'Submissions' },
    { id: 4, label: 'Active Students', value: '1,524', icon: Users, color: '#EF4444', change: '+12%' },
  ];

  const recentMessages = messages.slice(0, 5);
  const recentContacts = contactSubmissions.slice(0, 5);

  return (
    <div className="staff-dashboard">
      <Navbar />
      
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="welcome-section">
            <img src={user.avatar} alt={user.name} className="user-avatar" />
            <div>
              <h1>Welcome, {user.name}</h1>
              <p>Staff Dashboard</p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/staff/settings')}>
            <Settings size={18} />
            Settings
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.id} className="stat-card card">
              <div className="stat-icon" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon size={28} color={stat.color} />
              </div>
              <div className="stat-content">
                <p className="stat-label">{stat.label}</p>
                <div className="stat-value-row">
                  <h3>{stat.value}</h3>
                  <span className="stat-change positive">
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="staff-grid">
          {/* Recent Messages */}
          <div className="staff-section">
            <div className="section-header">
              <h2>
                <MessageSquare size={24} />
                Recent Messages
              </h2>
              <button className="btn btn-outline btn-sm">View All</button>
            </div>
            <div className="messages-list">
              {recentMessages.length === 0 ? (
                <p className="empty-state">No messages yet</p>
              ) : (
                recentMessages.map((message) => (
                  <div key={message.id} className="message-item card">
                    <div className="message-header">
                      <span className="sender-name">{message.senderName || 'Anonymous'}</span>
                      <span className="message-time">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="message-content">{message.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Contact Form Submissions */}
          <div className="staff-section">
            <div className="section-header">
              <h2>
                <Bell size={24} />
                Contact Submissions
              </h2>
              <button className="btn btn-outline btn-sm">View All</button>
            </div>
            <div className="contact-list">
              {recentContacts.length === 0 ? (
                <p className="empty-state">No contact submissions yet</p>
              ) : (
                recentContacts.map((contact) => (
                  <div key={contact.id} className="contact-item card">
                    <div className="contact-header">
                      <span className="contact-name">{contact.name}</span>
                      <span className="contact-time">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="contact-subject">{contact.subject}</p>
                    <p className="contact-message">{contact.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="staff-section">
            <div className="section-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="quick-actions-grid">
              <button className="action-btn card" onClick={() => navigate('/admin/content')}>
                <FileText size={24} />
                <span>View Posts</span>
              </button>
              <button className="action-btn card" onClick={() => navigate('/admin/applications')}>
                <Users size={24} />
                <span>Applications</span>
              </button>
              <button className="action-btn card">
                <MessageSquare size={24} />
                <span>Send Message</span>
              </button>
              <button className="action-btn card">
                <Calendar size={24} />
                <span>Schedule Event</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Chat />
      <Footer />
    </div>
  );
};

export default StaffDashboard;

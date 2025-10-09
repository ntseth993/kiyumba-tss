import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chat from '../components/Chat';
import { 
  Users, 
  BookOpen, 
  Award, 
  Calendar, 
  Settings, 
  FileText, 
  MessageSquare, 
  Bell,
  DollarSign,
  TrendingUp,
  ClipboardList,
  GraduationCap,
  Calculator
} from 'lucide-react';
import { getPosts } from '../services/postsService';
import { getAllMessages } from '../services/messagesService';
import { getContactSubmissions } from '../services/contactService';
import './StaffDashboard.css';

const DODDashboard = () => {
  const { user } = useAuth();
  const [postStats, setPostStats] = useState({ total: 0, visible: 0, hidden: 0 });
  const [messages, setMessages] = useState([]);
  const [contactSubmissions, setContactSubmissions] = useState([]);
  const [disciplineCases, setDisciplineCases] = useState([]);

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

      // Mock discipline cases for DOD
      setDisciplineCases([
        { id: 1, student: 'John Doe', case: 'Late arrival', status: 'pending' },
        { id: 2, student: 'Jane Smith', case: 'Misbehavior', status: 'resolved' },
        { id: 3, student: 'Mike Johnson', case: 'Missing uniform', status: 'in_progress' }
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const stats = [
    { 
      id: 1, 
      label: 'Total Posts', 
      value: postStats.total.toString(), 
      icon: FileText, 
      color: '#4F46E5', 
      change: `${postStats.visible} visible` 
    },
    { 
      id: 2, 
      label: 'Discipline Cases', 
      value: disciplineCases.filter(c => c.status === 'pending').length.toString(), 
      icon: ClipboardList, 
      color: '#EF4444', 
      change: `${disciplineCases.length} total` 
    },
    { 
      id: 3, 
      label: 'Messages', 
      value: messages.length.toString(), 
      icon: MessageSquare, 
      color: '#10B981', 
      change: 'New messages' 
    },
    { 
      id: 4, 
      label: 'Contact Forms', 
      value: contactSubmissions.length.toString(), 
      icon: Bell, 
      color: '#F59E0B', 
      change: 'Submissions' 
    },
  ];

  return (
    <div className="staff-dashboard">
      <Navbar />
      
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="welcome-section">
            <img src={user.avatar} alt={user.name} className="user-avatar" />
            <div>
              <h1>Welcome, {user.name}</h1>
              <p>Director of Discipline Dashboard</p>
            </div>
          </div>
        </div>

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

        <div className="staff-grid">
          <div className="staff-section">
            <div className="section-header">
              <h2>
                <ClipboardList size={24} />
                Active Discipline Cases
              </h2>
              <button className="btn btn-outline btn-sm">View All</button>
            </div>
            <div className="discipline-list">
              {disciplineCases.filter(c => c.status === 'pending').length === 0 ? (
                <p className="empty-state">No pending discipline cases</p>
              ) : (
                disciplineCases.filter(c => c.status === 'pending').map((caseItem) => (
                  <div key={caseItem.id} className="discipline-item card">
                    <div className="discipline-header">
                      <span className="student-name">{caseItem.student}</span>
                      <span className={`status-badge ${caseItem.status}`}>
                        {caseItem.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="discipline-case">{caseItem.case}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="staff-section">
            <div className="section-header">
              <h2>
                <MessageSquare size={24} />
                Recent Messages
              </h2>
              <button className="btn btn-outline btn-sm">View All</button>
            </div>
            <div className="messages-list">
              {messages.slice(0, 3).map((message) => (
                <div key={message.id} className="message-item card">
                  <div className="message-header">
                    <span className="sender-name">{message.senderName || 'Anonymous'}</span>
                    <span className="message-time">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="message-content">{message.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Chat />
      <Footer />
    </div>
  );
};

export default DODDashboard;

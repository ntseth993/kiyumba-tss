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
  GraduationCap,
  TrendingUp,
  ClipboardCheck,
  BarChart3
} from 'lucide-react';
import { getPosts } from '../services/postsService';
import { getAllMessages } from '../services/messagesService';
import { getContactSubmissions } from '../services/contactService';
import './StaffDashboard.css';

const DOSDashboard = () => {
  const { user } = useAuth();
  const [postStats, setPostStats] = useState({ total: 0, visible: 0, hidden: 0 });
  const [messages, setMessages] = useState([]);
  const [contactSubmissions, setContactSubmissions] = useState([]);
  const [academicStats, setAcademicStats] = useState({
    totalStudents: 1524,
    passRate: 87.5,
    examResults: 94.2,
    teacherPerformance: 91.8
  });

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
    { 
      id: 1, 
      label: 'Academic Performance', 
      value: `${academicStats.passRate}%`, 
      icon: GraduationCap, 
      color: '#10B981', 
      change: '+2.3% from last term' 
    },
    { 
      id: 2, 
      label: 'Exam Results', 
      value: `${academicStats.examResults}%`, 
      icon: Award, 
      color: '#4F46E5', 
      change: 'Above target' 
    },
    { 
      id: 3, 
      label: 'Teacher Performance', 
      value: `${academicStats.teacherPerformance}%`, 
      icon: TrendingUp, 
      color: '#F59E0B', 
      change: 'Excellent' 
    },
    { 
      id: 4, 
      label: 'Total Students', 
      value: academicStats.totalStudents.toString(), 
      icon: Users, 
      color: '#EF4444', 
      change: '+12 students' 
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
              <p>Director of Studies Dashboard</p>
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
                <BarChart3 size={24} />
                Academic Analytics
              </h2>
              <button className="btn btn-outline btn-sm">View Reports</button>
            </div>
            <div className="analytics-grid">
              <div className="analytic-card card">
                <div className="analytic-header">
                  <GraduationCap size={20} />
                  <span>Subject Performance</span>
                </div>
                <div className="analytic-content">
                  <div className="subject-stats">
                    <div className="subject-stat">
                      <span className="subject-name">Mathematics</span>
                      <span className="subject-score">92%</span>
                    </div>
                    <div className="subject-stat">
                      <span className="subject-name">English</span>
                      <span className="subject-score">88%</span>
                    </div>
                    <div className="subject-stat">
                      <span className="subject-name">Physics</span>
                      <span className="subject-score">85%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="analytic-card card">
                <div className="analytic-header">
                  <ClipboardCheck size={20} />
                  <span>Assessment Results</span>
                </div>
                <div className="analytic-content">
                  <div className="assessment-stats">
                    <div className="assessment-stat">
                      <span>Mid-term Exams</span>
                      <span className="pass-rate">94%</span>
                    </div>
                    <div className="assessment-stat">
                      <span>Quizzes</span>
                      <span className="pass-rate">89%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="staff-section">
            <div className="section-header">
              <h2>
                <MessageSquare size={24} />
                Recent Communications
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

export default DOSDashboard;

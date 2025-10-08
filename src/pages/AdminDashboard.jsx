import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chat from '../components/Chat';
import { Users, BookOpen, Award, DollarSign, TrendingUp, UserCheck, Calendar, Settings, FileText, Image } from 'lucide-react';
import { getPosts } from '../services/postsService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [postStats, setPostStats] = useState({ total: 0, visible: 0, hidden: 0 });

  useEffect(() => {
    loadPostStats();
  }, []);

  const loadPostStats = async () => {
    try {
      const posts = await getPosts();
      const visible = posts.filter(p => p.visible !== false).length;
      const hidden = posts.filter(p => p.visible === false).length;
      setPostStats({ total: posts.length, visible, hidden });
    } catch (error) {
      console.error('Error loading post stats:', error);
    }
  };

  const stats = [
    { id: 1, label: 'Total Posts', value: postStats.total.toString(), icon: FileText, color: '#4F46E5', change: `${postStats.visible} visible` },
    { id: 2, label: 'Total Students', value: '1,524', icon: Users, color: '#10B981', change: '+12%' },
    { id: 3, label: 'Total Teachers', value: '124', icon: UserCheck, color: '#F59E0B', change: '+5%' },
    { id: 4, label: 'Active Courses', value: '48', icon: BookOpen, color: '#EF4444', change: '+8%' },
  ];

  const recentStudents = [
    { id: 1, name: 'Alice Johnson', email: 'alice@school.com', grade: '10th', status: 'Active' },
    { id: 2, name: 'Bob Smith', email: 'bob@school.com', grade: '9th', status: 'Active' },
    { id: 3, name: 'Carol Williams', email: 'carol@school.com', grade: '11th', status: 'Active' },
    { id: 4, name: 'David Brown', email: 'david@school.com', grade: '10th', status: 'Inactive' },
  ];

  const courseStats = [
    { id: 1, name: 'Mathematics', students: 245, completion: 78 },
    { id: 2, name: 'English', students: 198, completion: 85 },
    { id: 3, name: 'Science', students: 223, completion: 72 },
    { id: 4, name: 'History', students: 167, completion: 81 },
  ];

  const upcomingEvents = [
    { id: 1, title: 'Staff Meeting', date: '2024-04-15', time: '10:00 AM' },
    { id: 2, title: 'Parent-Teacher Conference', date: '2024-04-18', time: '2:00 PM' },
    { id: 3, title: 'Annual Sports Day', date: '2024-04-25', time: '9:00 AM' },
  ];

  return (
    <div className="admin-dashboard">
      <Navbar />
      
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="welcome-section">
            <img src={user.avatar} alt={user.name} className="user-avatar" />
            <div>
              <h1>Welcome, {user.name}</h1>
              <p>Administrator Dashboard</p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/admin/settings')}>
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
                    <TrendingUp size={16} />
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="admin-grid">
          {/* Recent Students */}
          <div className="admin-section">
            <div className="section-header">
              <h2>
                <Users size={24} />
                Recent Students
              </h2>
              <button className="btn btn-outline btn-sm">View All</button>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Grade</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="student-name">{student.name}</td>
                      <td>{student.email}</td>
                      <td>{student.grade}</td>
                      <td>
                        <span className={`status-badge ${student.status.toLowerCase()}`}>
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Course Statistics */}
          <div className="admin-section">
            <div className="section-header">
              <h2>
                <BookOpen size={24} />
                Course Statistics
              </h2>
            </div>
            <div className="course-stats-list">
              {courseStats.map((course) => (
                <div key={course.id} className="course-stat-item">
                  <div className="course-stat-header">
                    <h4>{course.name}</h4>
                    <span className="student-count">{course.students} students</span>
                  </div>
                  <div className="completion-section">
                    <div className="completion-header">
                      <span>Completion Rate</span>
                      <span className="completion-percentage">{course.completion}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${course.completion}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="admin-section">
            <div className="section-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="quick-actions-grid">
              <button className="action-btn card" onClick={() => navigate('/admin/applications')}>
                <FileText size={24} />
                <span>Applications</span>
              </button>
              <button className="action-btn card" onClick={() => navigate('/admin/users')}>
                <Users size={24} />
                <span>Manage Users</span>
              </button>
              <button className="action-btn card" onClick={() => navigate('/admin/content')}>
                <Image size={24} />
                <span>Content</span>
              </button>
              <button className="action-btn card">
                <BookOpen size={24} />
                <span>Create Course</span>
              </button>
              <button className="action-btn card">
                <Calendar size={24} />
                <span>Schedule Event</span>
              </button>
              <button className="action-btn card">
                <Award size={24} />
                <span>View Reports</span>
              </button>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="admin-section">
            <div className="section-header">
              <h2>
                <Calendar size={24} />
                Upcoming Events
              </h2>
              <button className="btn btn-outline btn-sm">Add Event</button>
            </div>
            <div className="events-list">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="event-item card">
                  <div className="event-date">
                    <div className="event-day">
                      {new Date(event.date).getDate()}
                    </div>
                    <div className="event-month">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </div>
                  <div className="event-details">
                    <h4>{event.title}</h4>
                    <p>{event.time}</p>
                  </div>
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

export default AdminDashboard;

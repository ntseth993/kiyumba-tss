import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StudentExamView from '../components/StudentExamView';
import StudentReportView from '../components/StudentReportView';
import StudentAttendanceView from '../components/StudentAttendanceView';
import StudentPaymentView from '../components/StudentPaymentView';
import {
  FileText,
  Calendar,
  DollarSign,
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  Bell,
  CheckCircle,
  BarChart2,
  Bookmark,
  FileCheck,
  CalendarCheck,
  MessageSquare,
  Settings,
  LogOut,
  Users,
  Activity,
  Target,
  Zap
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - in real app, this would come from API
  const statsData = [
    {
      id: 1,
      title: 'Active Courses',
      value: '6',
      icon: BookOpen,
      color: '#4F46E5',
      bgColor: '#EEF2FF',
      trend: '+2 from last semester'
    },
    {
      id: 2,
      title: 'Average Grade',
      value: '92.5%',
      icon: TrendingUp,
      color: '#10B981',
      bgColor: '#F0FDF4',
      trend: '+3.2% from last month'
    },
    {
      id: 3,
      title: 'Achievements',
      value: '18',
      icon: Award,
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      trend: '5 this month'
    },
    {
      id: 4,
      title: 'Attendance Rate',
      value: '96%',
      icon: Activity,
      color: '#8B5CF6',
      bgColor: '#F3E8FF',
      trend: 'Excellent attendance'
    }
  ];

  const recentActivity = [
    { id: 1, type: 'grade', title: 'Math Exam Results', time: '2 hours ago', status: 'A+' },
    { id: 2, type: 'assignment', title: 'Physics Lab Report', time: '4 hours ago', status: 'Submitted' },
    { id: 3, type: 'event', title: 'Science Fair Registration', time: '1 day ago', status: 'Registered' },
  ];

  return (
    <div className="student-dashboard">
      <Navbar />

      <div className="dashboard-container">
        {/* Top Navigation Bar */}
        <div className="top-navigation">
          <div className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <BarChart2 size={20} />
              <span>Overview</span>
            </button>
            <button
              className={`nav-tab ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <FileText size={20} />
              <span>Reports</span>
            </button>
            <button
              className={`nav-tab ${activeTab === 'attendance' ? 'active' : ''}`}
              onClick={() => setActiveTab('attendance')}
            >
              <CalendarCheck size={20} />
              <span>Attendance</span>
            </button>
            <button
              className={`nav-tab ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              <DollarSign size={20} />
              <span>Payments</span>
            </button>
          </div>

          {/* Profile Section */}
          <div className="profile-section">
            <div className="profile-info">
              <div className="profile-avatar">
                {user?.name?.charAt(0) || 'S'}
              </div>
              <div className="profile-details">
                <h4>{user?.name || 'Student'}</h4>
                <p>{user?.email || 'student@school.com'}</p>
              </div>
            </div>
            <button className="settings-btn">
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'reports' && <StudentReportView />}
        {activeTab === 'attendance' && <StudentAttendanceView />}
        {activeTab === 'payments' && <StudentPaymentView />}

        {activeTab === 'overview' && (
          <>
            {/* Welcome Section */}
            <div className="welcome-section">
              <div className="welcome-content">
                <h1>Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋</h1>
                <p>Here's your academic overview for today</p>
              </div>
              <div className="welcome-actions">
                <button className="action-btn primary">
                  <Target size={16} />
                  View Goals
                </button>
                <button className="action-btn secondary">
                  <MessageSquare size={16} />
                  Ask Question
                </button>
              </div>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="stats-grid">
              {statsData.map((stat) => {
                const IconComponent = stat.icon;
                return (
                  <div key={stat.id} className="stat-card">
                    <div className="stat-header">
                      <div className="stat-icon" style={{ backgroundColor: stat.bgColor }}>
                        <IconComponent size={24} color={stat.color} />
                      </div>
                      <div className="stat-indicator">
                        <TrendingUp size={16} color="#10B981" />
                      </div>
                    </div>
                    <div className="stat-content">
                      <h3>{stat.value}</h3>
                      <p>{stat.title}</p>
                      <span className="stat-trend">{stat.trend}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent Activity */}
            <div className="activity-section">
              <h2 className="section-title">Recent Activity</h2>
              <div className="activity-list">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">
                      {activity.type === 'grade' && <Award size={16} color="#10B981" />}
                      {activity.type === 'assignment' && <FileCheck size={16} color="#4F46E5" />}
                      {activity.type === 'event' && <Calendar size={16} color="#F59E0B" />}
                    </div>
                    <div className="activity-content">
                      <h4>{activity.title}</h4>
                      <p>{activity.time}</p>
                    </div>
                    <div className="activity-status">
                      <span className={`status-badge ${activity.type}`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-grid">
              <div className="dashboard-section full-width">
                <StudentExamView />
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default StudentDashboard;

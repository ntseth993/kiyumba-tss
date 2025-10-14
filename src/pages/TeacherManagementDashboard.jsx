import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Users,
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  BarChart2,
  Filter,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Star,
  Calendar,
  Target,
  Activity
} from 'lucide-react';

const TeacherManagementDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');

  // Mock data - in real app, this would come from API
  const teachers = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      subject: 'Mathematics',
      department: 'Science',
      studentsCount: 45,
      avgPerformance: 87.5,
      attendance: 96,
      rating: 4.8,
      classesThisWeek: 12,
      experience: '8 years'
    },
    {
      id: 2,
      name: 'Mr. Michael Chen',
      subject: 'English Literature',
      department: 'Humanities',
      studentsCount: 38,
      avgPerformance: 82.3,
      attendance: 94,
      rating: 4.6,
      classesThisWeek: 10,
      experience: '5 years'
    },
    {
      id: 3,
      name: 'Mrs. Emily Rodriguez',
      subject: 'Physics',
      department: 'Science',
      studentsCount: 42,
      avgPerformance: 89.1,
      attendance: 98,
      rating: 4.9,
      classesThisWeek: 14,
      experience: '12 years'
    },
    {
      id: 4,
      name: 'Mr. David Kim',
      subject: 'Chemistry',
      department: 'Science',
      studentsCount: 40,
      avgPerformance: 85.7,
      attendance: 92,
      rating: 4.5,
      classesThisWeek: 11,
      experience: '6 years'
    }
  ];

  const departments = ['all', 'Science', 'Humanities', 'Arts', 'Languages'];

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || teacher.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const statsData = [
    {
      title: 'Total Teachers',
      value: teachers.length,
      icon: Users,
      color: '#4F46E5',
      bgColor: '#EEF2FF',
      trend: '+2 this semester'
    },
    {
      title: 'Avg Performance',
      value: '86.2%',
      icon: TrendingUp,
      color: '#10B981',
      bgColor: '#F0FDF4',
      trend: '+3.1% from last month'
    },
    {
      title: 'Avg Attendance',
      value: '95%',
      icon: Activity,
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      trend: 'Excellent rate'
    },
    {
      title: 'Total Classes',
      value: '47',
      icon: BookOpen,
      color: '#8B5CF6',
      bgColor: '#F3E8FF',
      trend: 'This week'
    }
  ];

  return (
    <div className="teacher-management-dashboard">
      <Navbar />

      <div className="dashboard-container">
        {/* Top Navigation */}
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
              className={`nav-tab ${activeTab === 'teachers' ? 'active' : ''}`}
              onClick={() => setActiveTab('teachers')}
            >
              <Users size={20} />
              <span>Teachers</span>
            </button>
            <button
              className={`nav-tab ${activeTab === 'performance' ? 'active' : ''}`}
              onClick={() => setActiveTab('performance')}
            >
              <Target size={20} />
              <span>Performance</span>
            </button>
            <button
              className={`nav-tab ${activeTab === 'schedule' ? 'active' : ''}`}
              onClick={() => setActiveTab('schedule')}
            >
              <Calendar size={20} />
              <span>Schedule</span>
            </button>
          </div>

          {/* Profile Section */}
          <div className="profile-section">
            <div className="profile-info">
              <div className="profile-avatar">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="profile-details">
                <h4>{user?.name || 'Admin'}</h4>
                <p>{user?.email || 'admin@school.com'}</p>
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Welcome Section */}
            <div className="welcome-section">
              <div className="welcome-content">
                <h1>Teacher Performance Dashboard 👨‍🏫</h1>
                <p>Monitor and manage your teaching staff effectively</p>
              </div>
              <div className="welcome-actions">
                <button className="action-btn primary">
                  <Plus size={16} />
                  Add Teacher
                </button>
                <button className="action-btn secondary">
                  <Filter size={16} />
                  Generate Report
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
              {statsData.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="stat-card">
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

            {/* Teachers Overview */}
            <div className="content-grid">
              <div className="teachers-section">
                <div className="section-header">
                  <h2 className="section-title">Teacher Overview</h2>
                  <div className="section-actions">
                    <div className="search-box">
                      <Search size={18} />
                      <input
                        type="text"
                        placeholder="Search teachers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <select
                      value={filterDepartment}
                      onChange={(e) => setFilterDepartment(e.target.value)}
                      className="filter-select"
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}>
                          {dept === 'all' ? 'All Departments' : dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="teachers-grid">
                  {filteredTeachers.map((teacher) => (
                    <div key={teacher.id} className="teacher-card">
                      <div className="teacher-header">
                        <div className="teacher-avatar">
                          {teacher.name.charAt(0)}
                        </div>
                        <div className="teacher-info">
                          <h3>{teacher.name}</h3>
                          <p>{teacher.subject} • {teacher.department}</p>
                        </div>
                      </div>

                      <div className="teacher-stats">
                        <div className="stat-item">
                          <span className="stat-label">Students</span>
                          <span className="stat-value">{teacher.studentsCount}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Performance</span>
                          <span className="stat-value">{teacher.avgPerformance}%</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Attendance</span>
                          <span className="stat-value">{teacher.attendance}%</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Rating</span>
                          <div className="rating">
                            <Star size={14} fill="#F59E0B" color="#F59E0B" />
                            <span>{teacher.rating}</span>
                          </div>
                        </div>
                      </div>

                      <div className="teacher-actions">
                        <button className="action-btn-icon">
                          <Eye size={16} />
                        </button>
                        <button className="action-btn-icon">
                          <Edit size={16} />
                        </button>
                        <button className="action-btn-icon danger">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="performance-section">
                <h2 className="section-title">Performance Trends</h2>
                <div className="performance-chart">
                  <div className="chart-placeholder">
                    <BarChart2 size={48} color="#64748b" />
                    <p>Performance analytics will be displayed here</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'teachers' && (
          <div className="teachers-management">
            <h2>Teacher Management</h2>
            <p>Full teacher management interface will be implemented here</p>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="performance-analysis">
            <h2>Performance Analysis</h2>
            <p>Detailed performance analysis tools will be implemented here</p>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="schedule-management">
            <h2>Schedule Management</h2>
            <p>Teaching schedule and timetable management will be implemented here</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default TeacherManagementDashboard;

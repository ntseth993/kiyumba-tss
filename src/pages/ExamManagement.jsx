import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  FileText,
  Calendar,
  Users,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  BookOpen,
  Settings,
  BarChart2,
  CalendarCheck,
  Award,
  TrendingUp,
  Target
} from 'lucide-react';

const ExamManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('exams');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedExam, setSelectedExam] = useState(null);

  // Mock data - in real app, this would come from API
  const exams = [
    {
      id: 1,
      title: 'Mathematics Mid-term Exam',
      subject: 'Mathematics',
      class: 'Grade 10A',
      date: '2024-04-15',
      time: '09:00 - 11:00',
      duration: '2 hours',
      room: 'Hall A',
      totalStudents: 45,
      registeredStudents: 43,
      status: 'scheduled',
      type: 'mid-term',
      maxMarks: 100
    },
    {
      id: 2,
      title: 'English Literature Final',
      subject: 'English Literature',
      class: 'Grade 11B',
      date: '2024-04-18',
      time: '14:00 - 16:30',
      duration: '2.5 hours',
      room: 'Auditorium',
      totalStudents: 38,
      registeredStudents: 38,
      status: 'scheduled',
      type: 'final',
      maxMarks: 100
    },
    {
      id: 3,
      title: 'Physics Practical Exam',
      subject: 'Physics',
      class: 'Grade 12A',
      date: '2024-04-20',
      time: '10:00 - 13:00',
      duration: '3 hours',
      room: 'Lab 1',
      totalStudents: 28,
      registeredStudents: 25,
      status: 'ongoing',
      type: 'practical',
      maxMarks: 50
    },
    {
      id: 4,
      title: 'Chemistry Quiz',
      subject: 'Chemistry',
      class: 'Grade 9B',
      date: '2024-04-12',
      time: '11:00 - 12:00',
      duration: '1 hour',
      room: 'Room 102',
      totalStudents: 32,
      registeredStudents: 32,
      status: 'completed',
      type: 'quiz',
      maxMarks: 25
    }
  ];

  const examStatuses = ['all', 'scheduled', 'ongoing', 'completed', 'cancelled'];
  const examTypes = ['all', 'mid-term', 'final', 'quiz', 'practical'];

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.class.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || exam.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statsData = [
    {
      title: 'Total Exams',
      value: exams.length,
      icon: FileText,
      color: '#4F46E5',
      bgColor: '#EEF2FF',
      trend: 'This semester'
    },
    {
      title: 'Scheduled',
      value: exams.filter(e => e.status === 'scheduled').length,
      icon: Calendar,
      color: '#10B981',
      bgColor: '#F0FDF4',
      trend: 'Upcoming exams'
    },
    {
      title: 'In Progress',
      value: exams.filter(e => e.status === 'ongoing').length,
      icon: Clock,
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      trend: 'Currently running'
    },
    {
      title: 'Completed',
      value: exams.filter(e => e.status === 'completed').length,
      icon: CheckCircle,
      color: '#8B5CF6',
      bgColor: '#F3E8FF',
      trend: 'Results available'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#10B981';
      case 'ongoing': return '#F59E0B';
      case 'completed': return '#4F46E5';
      case 'cancelled': return '#EF4444';
      default: return '#64748b';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'scheduled': return '#D1FAE5';
      case 'ongoing': return '#FEF3C7';
      case 'completed': return '#DBEAFE';
      case 'cancelled': return '#FEE2E2';
      default: return '#f8fafc';
    }
  };

  return (
    <div className="exam-management">
      <Navbar />

      <div className="dashboard-container">
        {/* Top Navigation */}
        <div className="top-navigation">
          <div className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === 'exams' ? 'active' : ''}`}
              onClick={() => setActiveTab('exams')}
            >
              <FileText size={20} />
              <span>Exams</span>
            </button>
            <button
              className={`nav-tab ${activeTab === 'results' ? 'active' : ''}`}
              onClick={() => setActiveTab('results')}
            >
              <Award size={20} />
              <span>Results</span>
            </button>
            <button
              className={`nav-tab ${activeTab === 'seating' ? 'active' : ''}`}
              onClick={() => setActiveTab('seating')}
            >
              <Users size={20} />
              <span>Seating</span>
            </button>
            <button
              className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <BarChart2 size={20} />
              <span>Analytics</span>
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

        {activeTab === 'exams' && (
          <>
            {/* Welcome Section */}
            <div className="welcome-section">
              <div className="welcome-content">
                <h1>Exam Management System 📝</h1>
                <p>Create, schedule, and manage examinations efficiently</p>
              </div>
              <div className="welcome-actions">
                <button className="action-btn primary">
                  <Plus size={16} />
                  Create Exam
                </button>
                <button className="action-btn secondary">
                  <Download size={16} />
                  Export Schedule
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
                        <CheckCircle size={16} color="#10B981" />
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

            {/* Exam Management */}
            <div className="content-grid">
              <div className="exams-section">
                <div className="section-header">
                  <h2 className="section-title">Exam Schedule</h2>
                  <div className="section-actions">
                    <div className="search-box">
                      <Search size={18} />
                      <input
                        type="text"
                        placeholder="Search exams..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="filter-select"
                    >
                      {examStatuses.map(status => (
                        <option key={status} value={status}>
                          {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="exams-grid">
                  {filteredExams.map((exam) => (
                    <div key={exam.id} className="exam-card">
                      <div className="exam-header">
                        <div className="exam-status">
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor: getStatusBgColor(exam.status),
                              color: getStatusColor(exam.status)
                            }}
                          >
                            {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                          </span>
                        </div>
                        <div className="exam-actions">
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

                      <div className="exam-content">
                        <h3 className="exam-title">{exam.title}</h3>
                        <div className="exam-details">
                          <div className="detail-item">
                            <BookOpen size={16} color="#64748b" />
                            <span>{exam.subject} • {exam.class}</span>
                          </div>
                          <div className="detail-item">
                            <Calendar size={16} color="#64748b" />
                            <span>{new Date(exam.date).toLocaleDateString()}</span>
                          </div>
                          <div className="detail-item">
                            <Clock size={16} color="#64748b" />
                            <span>{exam.time} • {exam.duration}</span>
                          </div>
                          <div className="detail-item">
                            <MapPin size={16} color="#64748b" />
                            <span>{exam.room}</span>
                          </div>
                        </div>

                        <div className="exam-stats">
                          <div className="stat-item">
                            <span className="stat-label">Registered</span>
                            <span className="stat-value">{exam.registeredStudents}/{exam.totalStudents}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Type</span>
                            <span className="stat-value">{exam.type}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Max Marks</span>
                            <span className="stat-value">{exam.maxMarks}</span>
                          </div>
                        </div>

                        <div className="exam-footer">
                          <button className="secondary-btn">
                            View Details
                          </button>
                          <button className="primary-btn">
                            Manage Results
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="exam-tools">
                <h2 className="section-title">Exam Tools</h2>

                <div className="tools-grid">
                  <div className="tool-card">
                    <div className="tool-icon">
                      <Plus size={24} color="#4F46E5" />
                    </div>
                    <div className="tool-content">
                      <h3>Create New Exam</h3>
                      <p>Schedule a new examination</p>
                      <button className="tool-btn">Create Exam</button>
                    </div>
                  </div>

                  <div className="tool-card">
                    <div className="tool-icon">
                      <Users size={24} color="#10B981" />
                    </div>
                    <div className="tool-content">
                      <h3>Student Registration</h3>
                      <p>Manage exam registrations</p>
                      <button className="tool-btn">Manage Registration</button>
                    </div>
                  </div>

                  <div className="tool-card">
                    <div className="tool-icon">
                      <MapPin size={24} color="#F59E0B" />
                    </div>
                    <div className="tool-content">
                      <h3>Seating Arrangement</h3>
                      <p>Arrange student seating</p>
                      <button className="tool-btn">Arrange Seating</button>
                    </div>
                  </div>

                  <div className="tool-card">
                    <div className="tool-icon">
                      <Award size={24} color="#8B5CF6" />
                    </div>
                    <div className="tool-content">
                      <h3>Grade Processing</h3>
                      <p>Process and publish results</p>
                      <button className="tool-btn">Process Grades</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'results' && (
          <div className="results-management">
            <h2>Results Management</h2>
            <p>View and manage exam results and grades</p>
          </div>
        )}

        {activeTab === 'seating' && (
          <div className="seating-arrangement">
            <h2>Seating Arrangement</h2>
            <p>Manage student seating arrangements for exams</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="exam-analytics">
            <h2>Exam Analytics</h2>
            <p>Analyze exam performance and trends</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ExamManagement;

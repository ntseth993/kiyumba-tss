import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  FileText,
  Calendar,
  Users,
  Clock,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Send,
  Settings,
  BarChart2,
  Target,
  Award,
  TrendingUp,
  User,
  FileCheck,
  AlertCircle
} from 'lucide-react';

const AssignmentManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('assignments');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');

  // Mock data - in real app, this would come from API
  const assignments = [
    {
      id: 1,
      title: 'Mathematics Problem Set - Chapter 5',
      subject: 'Mathematics',
      class: 'Grade 10A',
      teacher: 'Dr. Sarah Johnson',
      description: 'Complete exercises 1-20 from chapter 5 on quadratic equations. Show all working.',
      dueDate: '2024-04-20',
      createdDate: '2024-04-10',
      status: 'active',
      totalSubmissions: 45,
      gradedSubmissions: 38,
      lateSubmissions: 3,
      maxPoints: 50,
      type: 'homework',
      priority: 'high'
    },
    {
      id: 2,
      title: 'English Literature Essay',
      subject: 'English Literature',
      class: 'Grade 11B',
      teacher: 'Mr. Michael Chen',
      description: 'Write a 1000-word essay analyzing the themes in "To Kill a Mockingbird".',
      dueDate: '2024-04-25',
      createdDate: '2024-04-12',
      status: 'active',
      totalSubmissions: 38,
      gradedSubmissions: 15,
      lateSubmissions: 0,
      maxPoints: 100,
      type: 'essay',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Physics Lab Report',
      subject: 'Physics',
      class: 'Grade 12A',
      teacher: 'Mrs. Emily Rodriguez',
      description: 'Submit lab report for the pendulum experiment including data analysis and conclusions.',
      dueDate: '2024-04-18',
      createdDate: '2024-04-08',
      status: 'overdue',
      totalSubmissions: 28,
      gradedSubmissions: 28,
      lateSubmissions: 5,
      maxPoints: 75,
      type: 'lab-report',
      priority: 'high'
    },
    {
      id: 4,
      title: 'Chemistry Quiz Review',
      subject: 'Chemistry',
      class: 'Grade 9B',
      teacher: 'Mr. David Kim',
      description: 'Review questions for the upcoming quiz on chemical bonding.',
      dueDate: '2024-04-22',
      createdDate: '2024-04-15',
      status: 'draft',
      totalSubmissions: 0,
      gradedSubmissions: 0,
      lateSubmissions: 0,
      maxPoints: 25,
      type: 'quiz',
      priority: 'low'
    }
  ];

  const subjects = ['all', 'Mathematics', 'English Literature', 'Physics', 'Chemistry'];
  const statuses = ['all', 'draft', 'active', 'overdue', 'completed'];

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.class.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
    const matchesSubject = filterSubject === 'all' || assignment.subject === filterSubject;
    return matchesSearch && matchesStatus && matchesSubject;
  });

  const statsData = [
    {
      title: 'Total Assignments',
      value: assignments.length,
      icon: FileText,
      color: '#4F46E5',
      bgColor: '#EEF2FF',
      trend: 'This month'
    },
    {
      title: 'Active',
      value: assignments.filter(a => a.status === 'active').length,
      icon: Clock,
      color: '#10B981',
      bgColor: '#F0FDF4',
      trend: 'Currently active'
    },
    {
      title: 'Overdue',
      value: assignments.filter(a => a.status === 'overdue').length,
      icon: AlertTriangle,
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      trend: 'Need attention'
    },
    {
      title: 'Completed',
      value: assignments.filter(a => a.status === 'completed').length,
      icon: CheckCircle,
      color: '#8B5CF6',
      bgColor: '#F3E8FF',
      trend: 'Fully graded'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return '#64748b';
      case 'active': return '#10B981';
      case 'overdue': return '#F59E0B';
      case 'completed': return '#4F46E5';
      default: return '#64748b';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'draft': return '#f1f5f9';
      case 'active': return '#D1FAE5';
      case 'overdue': return '#FEF3C7';
      case 'completed': return '#DBEAFE';
      default: return '#f8fafc';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#64748b';
    }
  };

  return (
    <div className="assignment-management">
      <Navbar />

      <div className="dashboard-container">
        {/* Top Navigation */}
        <div className="top-navigation">
          <div className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === 'assignments' ? 'active' : ''}`}
              onClick={() => setActiveTab('assignments')}
            >
              <FileText size={20} />
              <span>Assignments</span>
            </button>
            <button
              className={`nav-tab ${activeTab === 'submissions' ? 'active' : ''}`}
              onClick={() => setActiveTab('submissions')}
            >
              <Send size={20} />
              <span>Submissions</span>
            </button>
            <button
              className={`nav-tab ${activeTab === 'grading' ? 'active' : ''}`}
              onClick={() => setActiveTab('grading')}
            >
              <Award size={20} />
              <span>Grading</span>
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

        {activeTab === 'assignments' && (
          <>
            {/* Welcome Section */}
            <div className="welcome-section">
              <div className="welcome-content">
                <h1>Assignment Management System 📄</h1>
                <p>Create, manage, and track student assignments efficiently</p>
              </div>
              <div className="welcome-actions">
                <button className="action-btn primary">
                  <Plus size={16} />
                  Create Assignment
                </button>
                <button className="action-btn secondary">
                  <Download size={16} />
                  Export Reports
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

            {/* Assignment Management */}
            <div className="content-grid">
              <div className="assignments-section">
                <div className="section-header">
                  <h2 className="section-title">Assignment Overview</h2>
                  <div className="section-actions">
                    <div className="search-box">
                      <Search size={18} />
                      <input
                        type="text"
                        placeholder="Search assignments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="filter-select"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>
                          {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                    <select
                      value={filterSubject}
                      onChange={(e) => setFilterSubject(e.target.value)}
                      className="filter-select"
                    >
                      {subjects.map(subject => (
                        <option key={subject} value={subject}>
                          {subject === 'all' ? 'All Subjects' : subject}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="assignments-grid">
                  {filteredAssignments.map((assignment) => (
                    <div key={assignment.id} className="assignment-card">
                      <div className="assignment-header">
                        <div className="assignment-status">
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor: getStatusBgColor(assignment.status),
                              color: getStatusColor(assignment.status)
                            }}
                          >
                            {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                          </span>
                          <span
                            className="priority-badge"
                            style={{ backgroundColor: `${getPriorityColor(assignment.priority)}20`, color: getPriorityColor(assignment.priority) }}
                          >
                            {assignment.priority}
                          </span>
                        </div>
                        <div className="assignment-actions">
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

                      <div className="assignment-content">
                        <h3 className="assignment-title">{assignment.title}</h3>
                        <div className="assignment-details">
                          <div className="detail-item">
                            <BookOpen size={16} color="#64748b" />
                            <span>{assignment.subject} • {assignment.class}</span>
                          </div>
                          <div className="detail-item">
                            <User size={16} color="#64748b" />
                            <span>{assignment.teacher}</span>
                          </div>
                          <div className="detail-item">
                            <Calendar size={16} color="#64748b" />
                            <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                          </div>
                          <div className="detail-item">
                            <Clock size={16} color="#64748b" />
                            <span>Created: {new Date(assignment.createdDate).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <p className="assignment-description">{assignment.description}</p>

                        <div className="assignment-stats">
                          <div className="stat-item">
                            <span className="stat-label">Submissions</span>
                            <span className="stat-value">{assignment.totalSubmissions}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Graded</span>
                            <span className="stat-value">{assignment.gradedSubmissions}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Late</span>
                            <span className="stat-value">{assignment.lateSubmissions}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Points</span>
                            <span className="stat-value">{assignment.maxPoints}</span>
                          </div>
                        </div>

                        <div className="assignment-footer">
                          <button className="secondary-btn">
                            View Submissions
                          </button>
                          <button className="primary-btn">
                            Grade Assignments
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="assignment-tools">
                <h2 className="section-title">Assignment Tools</h2>

                <div className="tools-grid">
                  <div className="tool-card">
                    <div className="tool-icon">
                      <Plus size={24} color="#4F46E5" />
                    </div>
                    <div className="tool-content">
                      <h3>Create Assignment</h3>
                      <p>Create new homework or project assignments</p>
                      <button className="tool-btn">Create Assignment</button>
                    </div>
                  </div>

                  <div className="tool-card">
                    <div className="tool-icon">
                      <FileCheck size={24} color="#10B981" />
                    </div>
                    <div className="tool-content">
                      <h3>Grade Submissions</h3>
                      <p>Review and grade student submissions</p>
                      <button className="tool-btn">Start Grading</button>
                    </div>
                  </div>

                  <div className="tool-card">
                    <div className="tool-icon">
                      <Clock size={24} color="#F59E0B" />
                    </div>
                    <div className="tool-content">
                      <h3>Deadline Tracking</h3>
                      <p>Monitor assignment deadlines and extensions</p>
                      <button className="tool-btn">Track Deadlines</button>
                    </div>
                  </div>

                  <div className="tool-card">
                    <div className="tool-icon">
                      <AlertCircle size={24} color="#8B5CF6" />
                    </div>
                    <div className="tool-content">
                      <h3>Plagiarism Check</h3>
                      <p>Scan submissions for plagiarism</p>
                      <button className="tool-btn">Check Plagiarism</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'submissions' && (
          <div className="submissions-management">
            <h2>Student Submissions</h2>
            <p>View and manage all student assignment submissions</p>
          </div>
        )}

        {activeTab === 'grading' && (
          <div className="grading-system">
            <h2>Grading System</h2>
            <p>Grade assignments and provide feedback to students</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="assignment-analytics">
            <h2>Assignment Analytics</h2>
            <p>Analyze assignment performance and completion rates</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AssignmentManagement;

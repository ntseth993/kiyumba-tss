import { Users, BookOpen, TrendingUp, UserCheck, Calendar, Settings, FileText, Image, Plus, Edit, Trash2, X, Activity, Globe, Database, Shield, Bell, ChevronDown, ChevronUp, Key, Eye, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chat from '../components/Chat';
import ProfilePictureUpload from '../components/ProfilePictureUpload';
import SchoolManagementNav from '../components/SchoolManagementNav';
import DashboardFeed from '../components/DashboardFeed';
import { studentsService } from '../services/studentsService';
import { statsService } from '../services/statsService';
import { activityLogsService } from '../services/activityLogsService';
import { getUpcomingEvents, createEvent, updateEvent, deleteEvent } from '../services/eventsService';
import './AdminDashboard.css';
import '../components/SchoolManagementNav.css';

const AdminDashboard = () => {
  const { user, impersonateUser } = useAuth();
  const navigate = useNavigate();

  console.log('AdminDashboard rendering, user:', user);

  // State for dashboard data
  const [dashboardStats, setDashboardStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [events, setEvents] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Advanced dashboard state
  const [expandedSections, setExpandedSections] = useState({
    students: true,
    activity: true,
    users: true,
    events: true,
    content: true,
    system: true
  });

  // Modal state
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form state
  const [studentForm, setStudentForm] = useState({ name: '', email: '', grade: '', status: 'Active' });
  const [eventForm, setEventForm] = useState({ title: '', date: '', time: '' });
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'student', status: 'Active', password: '' });
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });

  // User management state
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@school.com', role: 'teacher', status: 'Active', avatar: null, createdAt: new Date().toISOString() },
    { id: 2, name: 'Jane Smith', email: 'jane@school.com', role: 'student', status: 'Active', avatar: null, createdAt: new Date().toISOString() },
    { id: 3, name: 'Michael Brown', email: 'michael@school.com', role: 'dod', status: 'Active', avatar: null, createdAt: new Date().toISOString() },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@school.com', role: 'accountant', status: 'Active', avatar: null, createdAt: new Date().toISOString() },
    { id: 5, name: 'David Lee', email: 'david@school.com', role: 'secretary', status: 'Inactive', avatar: null, createdAt: new Date().toISOString() }
  ]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadStudents(),
        loadEvents(),
        loadActivityLogs()
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const stats = await statsService.getDashboardStats();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Failed to load stats', error);
    }
  };

  const loadStudents = async () => {
    try {
      const list = await studentsService.getStudents();
      setStudents(list.slice(0, 4));
    } catch (error) {
      console.error('Failed to load students', error);
    }
  };

  const loadEvents = async () => {
    try {
      const list = await getUpcomingEvents();
      setEvents(list);
    } catch (error) {
      console.error('Failed to load events', error);
    }
  };

  const loadActivityLogs = async () => {
    try {
      const logs = await activityLogsService.getRecentActivityLogs(3);
      setActivityLogs(logs);
    } catch (error) {
      console.error('Failed to load activity logs', error);
    }
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setStudentForm({ name: '', email: '', grade: '', status: 'Active' });
    setShowStudentModal(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setStudentForm({
      name: student.name || '',
      email: student.email || '',
      grade: student.grade || '',
      status: student.status || 'Active'
    });
    setShowStudentModal(true);
  };

  const handleSaveStudent = async () => {
    const { name, email, grade, status } = studentForm;
    if (!name || !email || !grade) {
      alert('Please complete all student fields.');
      return;
    }

    try {
      if (editingStudent) {
        await studentsService.updateStudent(editingStudent.id, { name, email, grade, status });
        await activityLogsService.logActivity(user.name, 'updated student', name, 'info');
      } else {
        await studentsService.createStudent({ name, email, grade, status });
        await activityLogsService.logActivity(user.name, 'created student', name, 'success');
      }
      setShowStudentModal(false);
      await Promise.all([loadStudents(), loadStats(), loadActivityLogs()]);
    } catch (error) {
      console.error('Failed to save student', error);
      alert('Unable to save student.');
    }
  };

  const handleDeleteStudent = async (student) => {
    if (!window.confirm(`Delete ${student.name}?`)) return;
    try {
      await studentsService.deleteStudent(student.id);
      await activityLogsService.logActivity(user.name, 'deleted student', student.name, 'warning');
      await Promise.all([loadStudents(), loadStats(), loadActivityLogs()]);
    } catch (error) {
      console.error('Failed to delete student', error);
      alert('Unable to delete student.');
    }
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setEventForm({ title: '', date: '', time: '' });
    setShowEventModal(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title || '',
      date: event.date ? event.date.slice(0, 10) : '',
      time: event.time || ''
    });
    setShowEventModal(true);
  };

  const handleSaveEvent = async () => {
    const { title, date, time } = eventForm;
    if (!title || !date || !time) {
      alert('Please complete all event fields.');
      return;
    }

    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, { title, date, time });
        await activityLogsService.logActivity(user.name, 'updated event', title, 'info');
      } else {
        await createEvent({ title, date, time });
        await activityLogsService.logActivity(user.name, 'created event', title, 'success');
      }
      setShowEventModal(false);
      await Promise.all([loadEvents(), loadActivityLogs()]);
    } catch (error) {
      console.error('Failed to save event', error);
      alert('Unable to save event.');
    }
  };

  const handleDeleteEvent = async (event) => {
    if (!window.confirm(`Delete ${event.title}?`)) return;
    try {
      await deleteEvent(event.id);
      await activityLogsService.logActivity(user.name, 'deleted event', event.title, 'warning');
      await Promise.all([loadEvents(), loadActivityLogs()]);
    } catch (error) {
      console.error('Failed to delete event', error);
      alert('Unable to delete event.');
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setUserForm({ name: '', email: '', role: 'student', status: 'Active' });
    setShowUserModal(true);
  };

  const handleEditUser = (userToEdit) => {
    setEditingUser(userToEdit);
    setUserForm({
      name: userToEdit.name,
      email: userToEdit.email,
      role: userToEdit.role,
      status: userToEdit.status || 'Active'
    });
    setShowUserModal(true);
  };

  const handleDeleteUser = (userToDelete) => {
    if (window.confirm(`Are you sure you want to delete ${userToDelete.name}?`)) {
      setUsers(users.filter(u => u.id !== userToDelete.id));
    }
  };

  const handleSaveUser = async () => {
    if (!userForm.name || !userForm.email) {
      alert('Please fill in all required fields.');
      return;
    }

    if (!editingUser && !userForm.password) {
      alert('Password is required for new users.');
      return;
    }

    try {
      if (editingUser) {
        setUsers(users.map(u =>
          u.id === editingUser.id
            ? { ...u, name: userForm.name, email: userForm.email, role: userForm.role, status: userForm.status }
            : u
        ));
        await activityLogsService.logActivity(user.name, 'updated user', userForm.name, 'info');
      } else {
        const newUser = {
          id: Date.now(),
          ...userForm,
          avatar: null,
          createdAt: new Date().toISOString()
        };
        setUsers([...users, newUser]);
        await activityLogsService.logActivity(user.name, 'created user', userForm.name, 'success');
      }

      setShowUserModal(false);
      setUserForm({ name: '', email: '', role: 'student', status: 'Active', password: '' });
      await loadActivityLogs();
    } catch (error) {
      console.error('Failed to save user', error);
      alert('Unable to save user.');
    }
  };

  const handleViewUserDetails = (userToView) => {
    setSelectedUser(userToView);
    setShowUserDetailsModal(true);
  };

  const handleResetPassword = (userToReset) => {
    setSelectedUser(userToReset);
    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setShowPasswordModal(true);
  };

  const handleSavePassword = async () => {
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      alert('Please fill in both password fields.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    try {
      // In a real app, this would call an API to update the password
      await activityLogsService.logActivity(user.name, 'reset password for user', selectedUser.name, 'warning');
      alert(`Password successfully reset for ${selectedUser.name}`);
      setShowPasswordModal(false);
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      await loadActivityLogs();
    } catch (error) {
      console.error('Failed to reset password', error);
      alert('Unable to reset password.');
    }
  };

  const handleAccessUserDashboard = async (userToAccess) => {
    // Navigate to the user's dashboard based on their role
    const dashboardRoutes = {
      admin: '/admin/dashboard',
      staff: '/staff/dashboard',
      teacher: '/teacher/dashboard',
      student: '/student/dashboard',
      dod: '/dod/dashboard',
      dos: '/dos/dashboard',
      accountant: '/accountant/dashboard',
      animateur: '/animateur/dashboard',
      secretary: '/secretary/dashboard'
    };

    const route = dashboardRoutes[userToAccess.role.toLowerCase()] || '/';
    
    // Log the access
    await activityLogsService.logActivity(user.name, 'accessed dashboard for user', userToAccess.name, 'info');
    
    // Use the impersonateUser function from AuthContext
    const result = impersonateUser(userToAccess);
    
    if (result.success) {
      // Navigate to the user's dashboard
      window.location.href = route;
    } else {
      alert(result.error || 'Failed to access user dashboard');
    }
  };

  const handleDeleteUserAccount = async (userToDelete) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${userToDelete.name}'s account? This action cannot be undone.`)) {
      return;
    }

    try {
      setUsers(users.filter(u => u.id !== userToDelete.id));
      await activityLogsService.logActivity(user.name, 'deleted user account', userToDelete.name, 'warning');
      alert(`User account for ${userToDelete.name} has been deleted.`);
      await loadActivityLogs();
    } catch (error) {
      console.error('Failed to delete user', error);
      alert('Unable to delete user account.');
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: '4F46E5',
      staff: '10B981',
      teacher: 'F59E0B',
      student: 'EF4444',
      dod: 'EF4444',
      dos: '4F46E5',
      accountant: '10B981',
      animateur: 'F59E0B',
      secretary: '8B5CF6'
    };
    return colors[role] || '6366F1';
  };

  const stats = dashboardStats ? [
    {
      id: 1,
      label: 'Total Users',
      value: dashboardStats.students.total + dashboardStats.teachers.total,
      icon: Users,
      color: '#4F46E5',
      change: '+12%',
      trend: 'up'
    },
    {
      id: 2,
      label: 'Active Students',
      value: dashboardStats.students.active,
      icon: UserCheck,
      color: '#10B981',
      change: `${dashboardStats.students.total} total`,
      trend: 'up'
    },
    {
      id: 3,
      label: 'Content Posts',
      value: dashboardStats.posts.total,
      icon: FileText,
      color: '#F59E0B',
      change: `${dashboardStats.posts.visible} visible`,
      trend: 'up'
    },
    {
      id: 4,
      label: 'Active Courses',
      value: dashboardStats.courses.active,
      icon: BookOpen,
      color: '#8B5CF6',
      change: `${dashboardStats.courses.total} total`,
      trend: 'stable'
    }
  ] : [];

  const getLogTime = (timestamp) => {
    const diff = Math.max(0, Date.now() - new Date(timestamp).getTime());
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  };

  // Add early return for debugging
  if (!user) {
    return (
      <div className="admin-dashboard">
        <Navbar />
        <div className="dashboard-container">
          <h1>Loading user data...</h1>
          <p>User: {JSON.stringify(user)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <Navbar />

      <div className="dashboard-container">
        {/* Advanced Stats Grid */}
        <div className="stats-grid-modern">
          {loading && stats.length === 0 ? (
            <div className="loading-skeleton">Loading statistics...</div>
          ) : (
            stats.map((stat) => (
              <div key={stat.id} className="stat-card-modern">
                <div className="stat-card-header">
                  <div className="stat-icon-modern" style={{ backgroundColor: `${stat.color}15` }}>
                    <stat.icon size={24} color={stat.color} />
                  </div>
                  <span className={`stat-trend ${stat.trend}`}>
                    <TrendingUp size={14} />
                  </span>
                </div>
                <div className="stat-content-modern">
                  <h3 className="stat-value-modern">{stat.value}</h3>
                  <p className="stat-label-modern">{stat.label}</p>
                  <span className="stat-change-modern">{stat.change}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Main Admin Grid */}
        <div className="admin-grid-modern">
          {/* Student Management Section */}
          <div className="section-modern">
            <div className="section-header-modern" onClick={() => toggleSection('students')}>
              <div className="section-title">
                <Users size={24} />
                <h2>Student Management</h2>
              </div>
              <button className="toggle-btn">
                {expandedSections.students ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
            {expandedSections.students && (
              <div className="section-content">
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Grade</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                            No students yet. Click "Add Student" to create one.
                          </td>
                        </tr>
                      ) : (
                        students.map((student) => (
                          <tr key={student.id}>
                            <td className="student-name">{student.name}</td>
                            <td>{student.email}</td>
                            <td>{student.grade}</td>
                            <td>
                              <span className={`status-badge ${student.status?.toLowerCase() || 'active'}`}>
                                {student.status}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-sm btn-outline" onClick={() => handleEditStudent(student)} title="Edit">
                                  <Edit size={14} />
                                </button>
                                <button
                                  className="btn btn-sm btn-outline"
                                  onClick={() => handleDeleteStudent(student)}
                                  title="Delete"
                                  style={{ color: '#EF4444' }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={handleAddStudent}>
                  <Plus size={16} />
                  Add Student
                </button>
              </div>
            )}
          </div>

          {/* User Activity Monitor */}
          <div className="section-modern">
            <div className="section-header-modern" onClick={() => toggleSection('activity')}>
              <div className="section-title">
                <Activity size={24} />
                <h2>User Activity Monitor</h2>
              </div>
              <button className="toggle-btn">
                {expandedSections.activity ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
            {expandedSections.activity && (
              <div className="section-content">
                <div className="activity-monitor">
                  {activityLogs.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                      No recent activity logs.
                    </p>
                  ) : (
                    activityLogs.map((log) => (
                      <div key={log.id} className="activity-item">
                        <div className={`activity-icon ${log.type || 'info'}`}>
                          <UserCheck size={16} />
                        </div>
                        <div className="activity-details">
                          <span className="activity-user">{log.user}</span>
                          <span className="activity-action">{log.action}</span>
                          {log.details && <span className="activity-details-text">{log.details}</span>}
                          <span className="activity-time">{getLogTime(log.timestamp)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={loadActivityLogs}>
                  Refresh Logs
                </button>
              </div>
            )}
          </div>
        </div>

        {/* User Management & Events Grid */}
        <div className="admin-grid-modern">
          {/* User Management Section */}
          <div className="section-modern">
            <div className="section-header-modern" onClick={() => toggleSection('users')}>
              <div className="section-title">
                <Users size={24} />
                <h2>User Management</h2>
              </div>
              <button className="toggle-btn">
                {expandedSections.users ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
            {expandedSections.users && (
              <div className="section-content">
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                            No users yet. Click "Add User" to create one.
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.id}>
                            <td className="student-name">{user.name}</td>
                            <td>{user.email}</td>
                            <td style={{ textTransform: 'capitalize' }}>{user.role}</td>
                            <td>
                              <span className={`status-badge ${user.status?.toLowerCase() || 'active'}`}>
                                {user.status}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  className="btn btn-sm btn-outline"
                                  onClick={() => handleViewUserDetails(user)}
                                  title="View Details"
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                  className="btn btn-sm btn-outline"
                                  onClick={() => handleAccessUserDashboard(user)}
                                  title="Access Dashboard"
                                >
                                  <LogIn size={14} />
                                </button>
                                <button
                                  className="btn btn-sm btn-outline"
                                  onClick={() => handleResetPassword(user)}
                                  title="Reset Password"
                                >
                                  <Key size={14} />
                                </button>
                                <button
                                  className="btn btn-sm btn-outline"
                                  onClick={() => handleEditUser(user)}
                                  title="Edit User"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  className="btn btn-sm btn-outline"
                                  onClick={() => handleDeleteUserAccount(user)}
                                  title="Delete Account"
                                  style={{ color: '#EF4444' }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={handleAddUser}>
                  <Plus size={16} />
                  Add User
                </button>
              </div>
            )}
          </div>

          {/* Events Management Section */}
          <div className="section-modern">
            <div className="section-header-modern" onClick={() => toggleSection('events')}>
              <div className="section-title">
                <Calendar size={24} />
                <h2>Events Management</h2>
              </div>
              <button className="toggle-btn">
                {expandedSections.events ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
            {expandedSections.events && (
              <div className="section-content">
                <div className="events-list">
                  {events.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                      No upcoming events. Click "Add Event" to create one.
                    </p>
                  ) : (
                    events.map((event) => (
                      <div key={event.id} className="event-item card">
                        <div className="event-date">
                          <div className="event-day">{new Date(event.date).getDate()}</div>
                          <div className="event-month">
                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                        </div>
                        <div className="event-details">
                          <h4>{event.title}</h4>
                          <p>{event.time}</p>
                        </div>
                        <div className="event-actions">
                          <button className="btn btn-sm btn-outline" onClick={() => handleEditEvent(event)} title="Edit">
                            <Edit size={14} />
                          </button>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleDeleteEvent(event)}
                            title="Delete"
                            style={{ color: '#EF4444' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={handleAddEvent}>
                  <Plus size={16} />
                  Add Event
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Posts and Announcements Feed */}
        <DashboardFeed />

        {/* Content & System Management Grid */}
        <div className="admin-grid-modern">
          {/* School Management Section */}
          <div className="section-modern">
            <div className="section-header-modern">
              <div className="section-title">
                <FileText size={24} />
                <h2>School Management System</h2>
              </div>
              <button className="toggle-btn">
                <ChevronDown size={20} />
              </button>
            </div>
            <div className="section-content">
              <div className="school-management-container">
                <SchoolManagementNav />
              </div>
            </div>
          </div>

          {/* Content Management Section */}
          <div className="section-modern">
            <div className="section-header-modern" onClick={() => toggleSection('content')}>
              <div className="section-title">
                <FileText size={24} />
                <h2>Content Management</h2>
              </div>
              <button className="toggle-btn">
                {expandedSections.content ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
            {expandedSections.content && (
              <div className="section-content">
                <div className="quick-actions-modern">
                  <button className="action-card" onClick={() => navigate('/admin/posts')}>
                    <FileText size={24} />
                    <span>Manage Posts</span>
                  </button>
                  <button className="action-card" onClick={() => navigate('/admin/pages')}>
                    <Globe size={24} />
                    <span>Pages</span>
                  </button>
                  <button className="action-card" onClick={() => navigate('/admin/media')}>
                    <Image size={24} />
                    <span>Media Library</span>
                  </button>
                  <button className="action-card" onClick={() => navigate('/admin/announcements')}>
                    <Bell size={24} />
                    <span>Announcements</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* System Management Section */}
          <div className="section-modern">
            <div className="section-header-modern" onClick={() => toggleSection('system')}>
              <div className="section-title">
                <Settings size={24} />
                <h2>System Management</h2>
              </div>
              <button className="toggle-btn">
                {expandedSections.system ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
            {expandedSections.system && (
              <div className="section-content">
                <div className="quick-actions-modern">
                  <button className="action-card" onClick={() => navigate('/admin/settings')}>
                    <Settings size={24} />
                    <span>Site Settings</span>
                  </button>
                  <button className="action-card" onClick={() => navigate('/admin/permissions')}>
                    <Shield size={24} />
                    <span>Permissions</span>
                  </button>
                  <button className="action-card" onClick={() => navigate('/admin/database')}>
                    <Database size={24} />
                    <span>Database</span>
                  </button>
                  <button className="action-card" onClick={() => navigate('/admin/logs')}>
                    <Activity size={24} />
                    <span>System Logs</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Student Modal */}
      {showStudentModal && (
        <div className="modal-overlay" onClick={() => setShowStudentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingStudent ? 'Edit Student' : 'Add Student'}</h3>
              <button className="modal-close" onClick={() => setShowStudentModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <label>
                Name
                <input
                  type="text"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  placeholder="Student name"
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                  placeholder="Email address"
                />
              </label>
              <label>
                Grade
                <input
                  type="text"
                  value={studentForm.grade}
                  onChange={(e) => setStudentForm({ ...studentForm, grade: e.target.value })}
                  placeholder="e.g. 10th"
                />
              </label>
              <label>
                Status
                <select
                  value={studentForm.status}
                  onChange={(e) => setStudentForm({ ...studentForm, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowStudentModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveStudent}>
                {editingStudent ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingUser ? 'Edit User' : 'Add User'}</h3>
              <button className="modal-close" onClick={() => setShowUserModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <label>
                Name
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="User name"
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="Email address"
                />
              </label>
              <label>
                Role
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                  <option value="dod">Director of Discipline (DOD)</option>
                  <option value="dos">Director of Studies (DOS)</option>
                  <option value="accountant">Accountant</option>
                  <option value="animateur">Animateur</option>
                  <option value="secretary">Secretary</option>
                </select>
              </label>
              {!editingUser && (
                <label>
                  Password
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    placeholder="Enter password"
                  />
                </label>
              )}
              <label>
                Status
                <select
                  value={userForm.status}
                  onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowUserModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveUser}>
                {editingUser ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Modal */}
      {showEventModal && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingEvent ? 'Edit Event' : 'Add Event'}</h3>
              <button className="modal-close" onClick={() => setShowEventModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <label>
                Title
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="Event title"
                />
              </label>
              <label>
                Date
                <input
                  type="date"
                  value={eventForm.date ? new Date(eventForm.date).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEventForm({ ...eventForm, date: new Date(e.target.value).toISOString() })}
                />
              </label>
              <label>
                Time
                <input
                  type="time"
                  value={eventForm.time}
                  onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                />
              </label>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowEventModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveEvent}>
                {editingEvent ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reset Password for {selectedUser.name}</h3>
              <button className="modal-close" onClick={() => setShowPasswordModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <label>
                New Password
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Enter new password"
                />
              </label>
              <label>
                Confirm Password
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />
              </label>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                Password must be at least 6 characters long.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowPasswordModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSavePassword}>
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetailsModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Details</h3>
              <button className="modal-close" onClick={() => setShowUserDetailsModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="user-details-grid">
                <div className="user-detail-avatar">
                  <img
                    src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&background=${getRoleColor(selectedUser.role)}&color=fff&size=120`}
                    alt={selectedUser.name}
                    style={{ width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto', display: 'block' }}
                  />
                </div>
                <div className="user-detail-item">
                  <strong>Name:</strong> {selectedUser.name}
                </div>
                <div className="user-detail-item">
                  <strong>Email:</strong> {selectedUser.email}
                </div>
                <div className="user-detail-item">
                  <strong>Role:</strong> <span style={{ textTransform: 'capitalize' }}>{selectedUser.role}</span>
                </div>
                <div className="user-detail-item">
                  <strong>Status:</strong> 
                  <span className={`status-badge ${selectedUser.status?.toLowerCase() || 'active'}`} style={{ marginLeft: '0.5rem' }}>
                    {selectedUser.status}
                  </span>
                </div>
                <div className="user-detail-item">
                  <strong>Created:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}
                </div>
                <div className="user-detail-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-outline" onClick={() => {
                    setShowUserDetailsModal(false);
                    handleAccessUserDashboard(selectedUser);
                  }}>
                    <LogIn size={16} />
                    Access Dashboard
                  </button>
                  <button className="btn btn-outline" onClick={() => {
                    setShowUserDetailsModal(false);
                    handleResetPassword(selectedUser);
                  }}>
                    <Key size={16} />
                    Reset Password
                  </button>
                  <button className="btn btn-outline" onClick={() => {
                    setShowUserDetailsModal(false);
                    handleEditUser(selectedUser);
                  }}>
                    <Edit size={16} />
                    Edit User
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowUserDetailsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Chat />
      <Footer />
    </div>
  );
};

export default AdminDashboard;

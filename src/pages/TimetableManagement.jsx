import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Edit,
  Trash2,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  BookOpen,
  Settings,
  BarChart2,
  CalendarCheck
} from 'lucide-react';

const TimetableManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedDay, setSelectedDay] = useState('monday');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - in real app, this would come from API
  const timeSlots = [
    { id: 1, start: '08:00', end: '09:00', period: 'Period 1' },
    { id: 2, start: '09:00', end: '10:00', period: 'Period 2' },
    { id: 3, start: '10:00', end: '11:00', period: 'Period 3' },
    { id: 4, start: '11:00', end: '12:00', period: 'Period 4' },
    { id: 5, start: '12:00', end: '13:00', period: 'Lunch Break' },
    { id: 6, start: '13:00', end: '14:00', period: 'Period 5' },
    { id: 7, start: '14:00', end: '15:00', period: 'Period 6' },
    { id: 8, start: '15:00', end: '16:00', period: 'Period 7' }
  ];

  const teachers = [
    { id: 1, name: 'Dr. Sarah Johnson', subject: 'Mathematics', department: 'Science' },
    { id: 2, name: 'Mr. Michael Chen', subject: 'English Literature', department: 'Humanities' },
    { id: 3, name: 'Mrs. Emily Rodriguez', subject: 'Physics', department: 'Science' },
    { id: 4, name: 'Mr. David Kim', subject: 'Chemistry', department: 'Science' }
  ];

  const rooms = [
    { id: 1, name: 'Room 101', capacity: 30, type: 'Classroom' },
    { id: 2, name: 'Room 102', capacity: 25, type: 'Lab' },
    { id: 3, name: 'Room 103', capacity: 35, type: 'Classroom' },
    { id: 4, name: 'Auditorium', capacity: 100, type: 'Auditorium' }
  ];

  const subjects = [
    { id: 1, name: 'Mathematics', code: 'MATH101', department: 'Science' },
    { id: 2, name: 'English Literature', code: 'ENG101', department: 'Humanities' },
    { id: 3, name: 'Physics', code: 'PHYS101', department: 'Science' },
    { id: 4, name: 'Chemistry', code: 'CHEM101', department: 'Science' }
  ];

  // Mock schedule data
  const schedule = {
    monday: [
      { id: 1, timeSlot: 1, subject: 'Mathematics', teacher: 'Dr. Sarah Johnson', room: 'Room 101', class: 'Grade 10A' },
      { id: 2, timeSlot: 2, subject: 'English Literature', teacher: 'Mr. Michael Chen', room: 'Room 103', class: 'Grade 10B' },
      { id: 3, timeSlot: 3, subject: 'Physics', teacher: 'Mrs. Emily Rodriguez', room: 'Room 102', class: 'Grade 11A' }
    ],
    tuesday: [
      { id: 4, timeSlot: 1, subject: 'Chemistry', teacher: 'Mr. David Kim', room: 'Room 102', class: 'Grade 11B' },
      { id: 5, timeSlot: 2, subject: 'Mathematics', teacher: 'Dr. Sarah Johnson', room: 'Room 101', class: 'Grade 10A' }
    ]
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

  const currentSchedule = schedule[selectedDay] || [];

  const statsData = [
    {
      title: 'Total Classes',
      value: '156',
      icon: Calendar,
      color: '#4F46E5',
      bgColor: '#EEF2FF',
      trend: 'This week'
    },
    {
      title: 'Active Teachers',
      value: '24',
      icon: Users,
      color: '#10B981',
      bgColor: '#F0FDF4',
      trend: 'On schedule'
    },
    {
      title: 'Room Utilization',
      value: '87%',
      icon: MapPin,
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      trend: 'Optimal usage'
    },
    {
      title: 'Conflicts',
      value: '0',
      icon: AlertTriangle,
      color: '#EF4444',
      bgColor: '#FEE2E2',
      trend: 'No conflicts detected'
    }
  ];

  return (
    <div className="timetable-management">
      <Navbar />

      <div className="dashboard-container">
        {/* Top Navigation */}
        <div className="top-navigation">
          <div className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === 'schedule' ? 'active' : ''}`}
              onClick={() => setActiveTab('schedule')}
            >
              <Calendar size={20} />
              <span>Schedule</span>
            </button>
            <button
              className={`nav-tab ${activeTab === 'teachers' ? 'active' : ''}`}
              onClick={() => setActiveTab('teachers')}
            >
              <Users size={20} />
              <span>Teachers</span>
            </button>
            <button
              className={`nav-tab ${activeTab === 'rooms' ? 'active' : ''}`}
              onClick={() => setActiveTab('rooms')}
            >
              <MapPin size={20} />
              <span>Rooms</span>
            </button>
            <button
              className={`nav-tab ${activeTab === 'conflicts' ? 'active' : ''}`}
              onClick={() => setActiveTab('conflicts')}
            >
              <AlertTriangle size={20} />
              <span>Conflicts</span>
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

        {activeTab === 'schedule' && (
          <>
            {/* Welcome Section */}
            <div className="welcome-section">
              <div className="welcome-content">
                <h1>Timetable Management 📅</h1>
                <p>Create and manage class schedules efficiently</p>
              </div>
              <div className="welcome-actions">
                <button className="action-btn primary">
                  <Plus size={16} />
                  Add Class
                </button>
                <button className="action-btn secondary">
                  <Settings size={16} />
                  Auto Schedule
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
                        {stat.title === 'Conflicts' ? (
                          <XCircle size={16} color="#EF4444" />
                        ) : (
                          <CheckCircle size={16} color="#10B981" />
                        )}
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

            {/* Schedule Management */}
            <div className="content-grid">
              <div className="schedule-section">
                <div className="section-header">
                  <h2 className="section-title">Weekly Schedule</h2>
                  <div className="day-selector">
                    {days.map(day => (
                      <button
                        key={day}
                        className={`day-btn ${selectedDay === day ? 'active' : ''}`}
                        onClick={() => setSelectedDay(day)}
                      >
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="schedule-grid">
                  {timeSlots.map(slot => {
                    const classForSlot = currentSchedule.find(cls => cls.timeSlot === slot.id);

                    return (
                      <div key={slot.id} className={`schedule-slot ${classForSlot ? 'occupied' : 'available'}`}>
                        <div className="slot-header">
                          <span className="slot-time">{slot.start} - {slot.end}</span>
                          <span className="slot-period">{slot.period}</span>
                        </div>

                        {classForSlot ? (
                          <div className="class-info">
                            <div className="class-subject">{classForSlot.subject}</div>
                            <div className="class-teacher">{classForSlot.teacher}</div>
                            <div className="class-details">
                              <span className="class-room">{classForSlot.room}</span>
                              <span className="class-grade">{classForSlot.class}</span>
                            </div>
                            <div className="class-actions">
                              <button className="action-btn-icon small">
                                <Edit size={14} />
                              </button>
                              <button className="action-btn-icon small danger">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="slot-empty">
                            <button className="add-class-btn">
                              <Plus size={16} />
                              Add Class
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="schedule-tools">
                <h2 className="section-title">Schedule Tools</h2>

                <div className="tools-grid">
                  <div className="tool-card">
                    <div className="tool-icon">
                      <Plus size={24} color="#4F46E5" />
                    </div>
                    <div className="tool-content">
                      <h3>Add New Class</h3>
                      <p>Schedule a new class or activity</p>
                      <button className="tool-btn">Create Class</button>
                    </div>
                  </div>

                  <div className="tool-card">
                    <div className="tool-icon">
                      <Users size={24} color="#10B981" />
                    </div>
                    <div className="tool-content">
                      <h3>Teacher Assignment</h3>
                      <p>Assign teachers to subjects and classes</p>
                      <button className="tool-btn">Manage Teachers</button>
                    </div>
                  </div>

                  <div className="tool-card">
                    <div className="tool-icon">
                      <MapPin size={24} color="#F59E0B" />
                    </div>
                    <div className="tool-content">
                      <h3>Room Management</h3>
                      <p>Allocate and manage classroom spaces</p>
                      <button className="tool-btn">Manage Rooms</button>
                    </div>
                  </div>

                  <div className="tool-card">
                    <div className="tool-icon">
                      <AlertTriangle size={24} color="#EF4444" />
                    </div>
                    <div className="tool-content">
                      <h3>Conflict Detection</h3>
                      <p>Check for scheduling conflicts</p>
                      <button className="tool-btn">Check Conflicts</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'teachers' && (
          <div className="teachers-assignment">
            <h2>Teacher Assignment Management</h2>
            <p>Assign teachers to subjects and manage their schedules</p>
          </div>
        )}

        {activeTab === 'rooms' && (
          <div className="room-management">
            <h2>Room Management</h2>
            <p>Manage classroom allocation and utilization</p>
          </div>
        )}

        {activeTab === 'conflicts' && (
          <div className="conflict-detection">
            <h2>Conflict Detection</h2>
            <p>Identify and resolve scheduling conflicts</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default TimetableManagement;

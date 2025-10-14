import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chat from '../components/Chat';
import {
  FileText,
  Users,
  Calendar,
  ClipboardList,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  UserCheck,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import ProfilePictureUpload from '../components/ProfilePictureUpload';
import { comprehensiveStudentsService } from '../services/comprehensiveStudentsService';
import './StaffDashboard.css';

const SecretaryDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [correspondence, setCorrespondence] = useState([]);
  const [visitorLog, setVisitorLog] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [expandedSections, setExpandedSections] = useState({ students: false });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // Load students
    const allStudents = await comprehensiveStudentsService.getAllStudents();
    setStudents(allStudents);
    
    // Mock appointments
    setAppointments([
      { 
        id: 1, 
        visitor: 'Parent - Mr. John Smith', 
        time: '09:00',
        purpose: 'Student progress discussion',
        status: 'confirmed'
      },
      { 
        id: 2, 
        visitor: 'Supplier - ABC Books Ltd', 
        time: '14:30',
        purpose: 'Textbook delivery',
        status: 'pending'
      },
      { 
        id: 3, 
        visitor: 'Teacher - Mrs. Johnson', 
        time: '16:00',
        purpose: 'Meeting with Principal',
        status: 'confirmed'
      }
    ]);

    // Mock correspondence
    setCorrespondence([
      { 
        id: 1, 
        type: 'incoming', 
        subject: 'Student Transfer Request', 
        sender: 'City High School', 
        date: '2024-04-15',
        status: 'unread'
      },
      { 
        id: 2, 
        type: 'outgoing', 
        subject: 'Event Invitation Response', 
        recipient: 'Local Community Center', 
        date: '2024-04-14',
        status: 'sent'
      },
      { 
        id: 3, 
        type: 'incoming', 
        subject: 'Ministry of Education Update', 
        sender: 'Education Ministry', 
        date: '2024-04-13',
        status: 'read'
      }
    ]);

    // Mock visitor log
    setVisitorLog([
      { 
        id: 1, 
        name: 'Sarah Wilson', 
        purpose: 'Parent consultation', 
        timeIn: '08:30',
        timeOut: '09:15',
        status: 'completed'
      },
      { 
        id: 2, 
        name: 'David Brown', 
        purpose: 'Book delivery', 
        timeIn: '10:00',
        timeOut: null,
        status: 'ongoing'
      }
    ]);
  };

  useEffect(() => {
    applyFilters();
  }, [students, selectedClass, selectedDepartment]);

  const applyFilters = () => {
    let filtered = [...students];
    if (selectedClass !== 'All') {
      filtered = filtered.filter(s => s.class === selectedClass);
    }
    if (selectedDepartment !== 'All') {
      filtered = filtered.filter(s => s.department === selectedDepartment);
    }
    setFilteredStudents(filtered);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const stats = [
    { 
      id: 1, 
      label: 'Today\'s Appointments', 
      value: appointments.filter(a => a.status === 'confirmed').length.toString(), 
      icon: Calendar, 
      color: '#4F46E5', 
      change: `${appointments.length} total` 
    },
    { 
      id: 2, 
      label: 'Unread Correspondence', 
      value: correspondence.filter(c => c.status === 'unread').length.toString(), 
      icon: Mail, 
      color: '#EF4444', 
      change: 'Requires attention' 
    },
    { 
      id: 3, 
      label: 'Visitors Today', 
      value: visitorLog.length.toString(), 
      icon: UserCheck, 
      color: '#10B981', 
      change: 'Check-ins' 
    },
    { 
      id: 4, 
      label: 'Pending Tasks', 
      value: '8', 
      icon: ClipboardList, 
      color: '#F59E0B', 
      change: 'Action required' 
    },
  ];

  return (
    <div className="staff-dashboard">
      <Navbar />
      
      <div className="dashboard-container">
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
                <Calendar size={24} />
                Today's Appointments
              </h2>
              <button className="btn btn-outline btn-sm">Manage Schedule</button>
            </div>
            <div className="appointments-list">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="appointment-item card">
                  <div className="appointment-header">
                    <div className="appointment-time">
                      <Clock size={16} />
                      <span>{appointment.time}</span>
                    </div>
                    <span className={`status-badge ${appointment.status}`}>
                      {appointment.status}
                    </span>
                  </div>
                  <div className="appointment-details">
                    <h4>{appointment.visitor}</h4>
                    <p className="appointment-purpose">{appointment.purpose}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="staff-section">
            <div className="section-header">
              <h2>
                <Mail size={24} />
                Recent Correspondence
              </h2>
              <button className="btn btn-outline btn-sm">View All</button>
            </div>
            <div className="correspondence-list">
              {correspondence.map((item) => (
                <div key={item.id} className="correspondence-item card">
                  <div className="correspondence-header">
                    <div className="correspondence-type">
                      {item.type === 'incoming' ? (
                        <Mail size={16} color="#4F46E5" />
                      ) : (
                        <FileText size={16} color="#10B981" />
                      )}
                      <span className={`correspondence-direction ${item.type}`}>
                        {item.type}
                      </span>
                    </div>
                    <span className={`status-badge ${item.status}`}>
                      {item.status}
                    </span>
                  </div>
                  <h4 className="correspondence-subject">{item.subject}</h4>
                  <div className="correspondence-meta">
                    <span className="correspondence-sender">
                      {item.type === 'incoming' ? item.sender : item.recipient}
                    </span>
                    <span className="correspondence-date">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="staff-section">
            <div className="section-header">
              <h2>
                <UserCheck size={24} />
                Visitor Log
              </h2>
              <button className="btn btn-outline btn-sm">View Full Log</button>
            </div>
            <div className="visitor-log">
              {visitorLog.map((visitor) => (
                <div key={visitor.id} className="visitor-item card">
                  <div className="visitor-header">
                    <span className="visitor-name">{visitor.name}</span>
                    <span className={`status-badge ${visitor.status}`}>
                      {visitor.status === 'ongoing' ? (
                        <><Clock size={14} /> Ongoing</>
                      ) : (
                        <><CheckCircle size={14} /> Completed</>
                      )}
                    </span>
                  </div>
                  <p className="visitor-purpose">{visitor.purpose}</p>
                  <div className="visitor-times">
                    <span>Check-in: {visitor.timeIn}</span>
                    {visitor.timeOut && <span>Check-out: {visitor.timeOut}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Students Section */}
          <div className="staff-section" style={{ gridColumn: '1 / -1' }}>
            <div className="section-header" style={{ cursor: 'pointer' }}>
              <div className="section-title" onClick={() => toggleSection('students')}>
                <Users size={24} />
                <h2>Student Records - Secretary</h2>
              </div>
              <button className="toggle-btn" onClick={() => toggleSection('students')}>
                {expandedSections.students ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
            
            {expandedSections.students && (
              <div className="section-content">
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  <select 
                    value={selectedClass} 
                    onChange={(e) => setSelectedClass(e.target.value)}
                    style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
                  >
                    <option value="All">All Classes</option>
                    <option value="L3">L3</option>
                    <option value="L4">L4</option>
                    <option value="L5">L5</option>
                  </select>

                  <select 
                    value={selectedDepartment} 
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
                  >
                    <option value="All">All Departments</option>
                    <option value="SOD">SOD</option>
                    <option value="Fashion">Fashion</option>
                    <option value="BUC">BUC</option>
                    <option value="Wood Technology">Wood Technology</option>
                  </select>

                  <div style={{ marginLeft: 'auto', fontWeight: '600', color: '#667eea' }}>
                    Showing {filteredStudents.length} of {students.length} students
                  </div>
                </div>

                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Class</th>
                        <th>Department</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Guardian</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                            No students found
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((student) => (
                          <tr key={student.id}>
                            <td>{student.studentId}</td>
                            <td className="student-name">{student.name}</td>
                            <td>{student.class}</td>
                            <td>{student.department}</td>
                            <td>{student.email}</td>
                            <td>{student.phone}</td>
                            <td>{student.guardianName}</td>
                            <td>
                              <span className={`status-badge ${student.status?.toLowerCase() || 'active'}`}>
                                {student.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Chat />
      <Footer />
    </div>
  );
};

export default SecretaryDashboard;

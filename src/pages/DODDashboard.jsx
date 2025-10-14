import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  FileText, 
  Filter, 
  Eye, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  ClipboardList,
  GraduationCap,
  Calculator,
  X
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chat from '../components/Chat';
import ProfilePictureUpload from '../components/ProfilePictureUpload';
import { comprehensiveStudentsService } from '../services/comprehensiveStudentsService';
import './StaffDashboard.css';

const DODDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [showDisciplineOnly, setShowDisciplineOnly] = useState(false);
  
  // Modal states
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDisciplineModal, setShowDisciplineModal] = useState(false);
  const [disciplineIssue, setDisciplineIssue] = useState('');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showConductModal, setShowConductModal] = useState(false);
  const [conductMarks, setConductMarks] = useState({ term1: 0, term2: 0, term3: 0 });
  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    class: 'L3',
    department: 'SOD',
    guardianName: '',
    guardianPhone: ''
  });
  
  // Section expansion
  const [expandedSections, setExpandedSections] = useState({
    students: true,
    discipline: true
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [students, selectedClass, selectedDepartment, showDisciplineOnly]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const allStudents = await comprehensiveStudentsService.getAllStudents();
      const stats = await comprehensiveStudentsService.getStatistics();
      setStudents(allStudents);
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...students];
    
    if (selectedClass !== 'All') {
      filtered = filtered.filter(s => s.class === selectedClass);
    }
    
    if (selectedDepartment !== 'All') {
      filtered = filtered.filter(s => s.department === selectedDepartment);
    }
    
    if (showDisciplineOnly) {
      filtered = filtered.filter(s => s.disciplineIssues && s.disciplineIssues.length > 0);
    }
    
    setFilteredStudents(filtered);
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const handleAddDisciplineIssue = (student) => {
    setSelectedStudent(student);
    setShowDisciplineModal(true);
  };

  const handleSaveDisciplineIssue = async () => {
    if (!disciplineIssue.trim()) {
      alert('Please enter a discipline issue');
      return;
    }
    
    const result = await comprehensiveStudentsService.addDisciplineIssue(selectedStudent.id, disciplineIssue);
    if (result.success) {
      alert('Discipline issue added successfully');
      setShowDisciplineModal(false);
      setDisciplineIssue('');
      await loadDashboardData();
    } else {
      alert('Failed to add discipline issue');
    }
  };

  const handleManageConduct = (student) => {
    setSelectedStudent(student);
    setConductMarks(student.conduct || { term1: 0, term2: 0, term3: 0 });
    setShowConductModal(true);
  };

  const handleSaveConduct = async (term) => {
    const marks = conductMarks[term];
    if (marks < 0 || marks > 40) {
      alert('Conduct marks must be between 0 and 40');
      return;
    }
    
    const result = await comprehensiveStudentsService.updateConduct(selectedStudent.id, term, marks);
    if (result.success) {
      alert(`Conduct marks for ${term} updated successfully`);
      await loadDashboardData();
    } else {
      alert('Failed to update conduct marks');
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleAddStudent = () => {
    setShowAddStudentModal(true);
  };

  const handleSaveNewStudent = async () => {
    if (!newStudentForm.name || !newStudentForm.email || !newStudentForm.phone) {
      alert('Please fill in all required fields');
      return;
    }

    const result = await comprehensiveStudentsService.addStudent(newStudentForm);
    if (result.success) {
      alert(`Student ${result.student.name} added successfully with ID: ${result.student.studentId}`);
      setShowAddStudentModal(false);
      setNewStudentForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        class: 'L3',
        department: 'SOD',
        guardianName: '',
        guardianPhone: ''
      });
      await loadDashboardData();
    } else {
      alert('Failed to add student: ' + result.error);
    }
  };

  const stats = statistics ? [
    { 
      id: 1, 
      label: 'Total Students', 
      value: statistics.total.toString(), 
      icon: Users, 
      color: '#4F46E5', 
      change: `${filteredStudents.length} filtered` 
    },
    { 
      id: 2, 
      label: 'Discipline Issues', 
      value: statistics.withDisciplineIssues.toString(), 
      icon: AlertTriangle, 
      color: '#EF4444', 
      change: 'Requires attention' 
    },
    { 
      id: 3, 
      label: 'Average Attendance', 
      value: `${statistics.averageAttendance}%`, 
      icon: ClipboardList, 
      color: '#10B981', 
      change: 'Overall' 
    },
    { 
      id: 4, 
      label: 'Average GPA', 
      value: statistics.averageGPA, 
      icon: GraduationCap, 
      color: '#F59E0B', 
      change: 'Overall' 
    },
  ] : [];

  return (
    <div className="staff-dashboard">
      <Navbar />
      
      <div className="dashboard-container">
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
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters Section */}
        <div className="filters-section card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={20} />
              <span style={{ fontWeight: '600' }}>Filters:</span>
            </div>
            
            <select 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)}
              className="filter-select"
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
              className="filter-select"
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
            >
              <option value="All">All Departments</option>
              <option value="SOD">SOD</option>
              <option value="Fashion">Fashion</option>
              <option value="BUC">BUC</option>
              <option value="Wood Technology">Wood Technology</option>
            </select>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={showDisciplineOnly}
                onChange={(e) => setShowDisciplineOnly(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <span>Discipline Issues Only</span>
            </label>

            <div style={{ marginLeft: 'auto', fontWeight: '600', color: '#667eea' }}>
              Showing {filteredStudents.length} of {students.length} students
            </div>
          </div>
        </div>

        {/* Students Management Section */}
        <div className="management-section card">
          <div className="section-header" style={{ cursor: 'pointer' }}>
            <div className="section-title" onClick={() => toggleSection('students')}>
              <Users size={24} />
              <h2>Student Management - Director of Discipline</h2>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button className="btn btn-primary" onClick={handleAddStudent}>
                <Plus size={16} />
                Add Student
              </button>
              <button className="toggle-btn" onClick={() => toggleSection('students')}>
                {expandedSections.students ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
          </div>
          
          {expandedSections.students && (
            <div className="section-content">
              {loading ? (
                <p style={{ textAlign: 'center', padding: '2rem' }}>Loading students...</p>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Class</th>
                        <th>Department</th>
                        <th>Attendance</th>
                        <th>GPA</th>
                        <th>Conduct</th>
                        <th>Discipline</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>
                            No students found with current filters
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((student) => (
                          <tr key={student.id}>
                            <td>{student.studentId}</td>
                            <td className="student-name">{student.name}</td>
                            <td>{student.class}</td>
                            <td>{student.department}</td>
                            <td>{student.attendance}%</td>
                            <td>{student.gpa}</td>
                            <td>
                              <div style={{ fontSize: '0.85rem' }}>
                                T1: {student.conduct?.term1 || 0}/40<br/>
                                T2: {student.conduct?.term2 || 0}/40<br/>
                                T3: {student.conduct?.term3 || 0}/40
                              </div>
                            </td>
                            <td>
                              {student.disciplineIssues && student.disciplineIssues.length > 0 ? (
                                <span className="status-badge warning">
                                  {student.disciplineIssues.length} issue{student.disciplineIssues.length > 1 ? 's' : ''}
                                </span>
                              ) : (
                                <span className="status-badge active">Clean</span>
                              )}
                            </td>
                            <td>
                              <span className={`status-badge ${student.status?.toLowerCase() || 'active'}`}>
                                {student.status}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button
                                  className="btn btn-sm btn-outline"
                                  onClick={() => handleViewStudent(student)}
                                  title="View Details"
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                  className="btn btn-sm btn-outline"
                                  onClick={() => handleManageConduct(student)}
                                  title="Manage Conduct"
                                  style={{ color: '#4F46E5' }}
                                >
                                  <Calculator size={14} />
                                </button>
                                <button
                                  className="btn btn-sm btn-outline"
                                  onClick={() => handleAddDisciplineIssue(student)}
                                  title="Add Discipline Issue"
                                  style={{ color: '#EF4444' }}
                                >
                                  <AlertTriangle size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Student Details Modal */}
      {showStudentModal && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowStudentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Student Details</h2>
              <button className="close-btn" onClick={() => setShowStudentModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="student-details-grid">
                <div className="detail-item"><strong>Student ID:</strong> {selectedStudent.studentId}</div>
                <div className="detail-item"><strong>Name:</strong> {selectedStudent.name}</div>
                <div className="detail-item"><strong>Email:</strong> {selectedStudent.email}</div>
                <div className="detail-item"><strong>Phone:</strong> {selectedStudent.phone}</div>
                <div className="detail-item"><strong>Class:</strong> {selectedStudent.class}</div>
                <div className="detail-item"><strong>Department:</strong> {selectedStudent.department}</div>
                <div className="detail-item"><strong>Address:</strong> {selectedStudent.address}</div>
                <div className="detail-item"><strong>Attendance:</strong> {selectedStudent.attendance}%</div>
                <div className="detail-item"><strong>GPA:</strong> {selectedStudent.gpa}</div>
                <div className="detail-item"><strong>Status:</strong> {selectedStudent.status}</div>
                <div className="detail-item"><strong>Guardian Name:</strong> {selectedStudent.guardianName}</div>
                <div className="detail-item"><strong>Guardian Phone:</strong> {selectedStudent.guardianPhone}</div>
                <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                  <strong>Discipline Issues:</strong>
                  {selectedStudent.disciplineIssues && selectedStudent.disciplineIssues.length > 0 ? (
                    <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                      {selectedStudent.disciplineIssues.map((issue, index) => (
                        <li key={index} style={{ color: '#EF4444', marginBottom: '0.25rem' }}>{issue}</li>
                      ))}
                    </ul>
                  ) : (
                    <span style={{ color: '#10B981', marginLeft: '0.5rem' }}>No discipline issues</span>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowStudentModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Discipline Issue Modal */}
      {showDisciplineModal && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowDisciplineModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Discipline Issue - {selectedStudent.name}</h2>
              <button className="close-btn" onClick={() => setShowDisciplineModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <label>
                <strong>Discipline Issue:</strong>
                <textarea
                  value={disciplineIssue}
                  onChange={(e) => setDisciplineIssue(e.target.value)}
                  placeholder="Describe the discipline issue..."
                  rows="4"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb', marginTop: '0.5rem' }}
                />
              </label>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowDisciplineModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveDisciplineIssue}>Save Issue</button>
            </div>
          </div>
        </div>
      )}

      {/* Conduct Marks Modal */}
      {showConductModal && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowConductModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Manage Conduct - {selectedStudent.name}</h2>
              <button className="close-btn" onClick={() => setShowConductModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
                Enter conduct marks for each term (Maximum: 40 marks per term)
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <strong>Term 1:</strong>
                    <input
                      type="number"
                      min="0"
                      max="40"
                      value={conductMarks.term1}
                      onChange={(e) => setConductMarks({ ...conductMarks, term1: parseInt(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '2px solid #e5e7eb', marginTop: '0.5rem' }}
                    />
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>/40</span>
                  </div>
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => handleSaveConduct('term1')}
                    style={{ marginTop: '1.5rem' }}
                  >
                    Save T1
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <strong>Term 2:</strong>
                    <input
                      type="number"
                      min="0"
                      max="40"
                      value={conductMarks.term2}
                      onChange={(e) => setConductMarks({ ...conductMarks, term2: parseInt(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '2px solid #e5e7eb', marginTop: '0.5rem' }}
                    />
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>/40</span>
                  </div>
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => handleSaveConduct('term2')}
                    style={{ marginTop: '1.5rem' }}
                  >
                    Save T2
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <strong>Term 3:</strong>
                    <input
                      type="number"
                      min="0"
                      max="40"
                      value={conductMarks.term3}
                      onChange={(e) => setConductMarks({ ...conductMarks, term3: parseInt(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '2px solid #e5e7eb', marginTop: '0.5rem' }}
                    />
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>/40</span>
                  </div>
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => handleSaveConduct('term3')}
                    style={{ marginTop: '1.5rem' }}
                  >
                    Save T3
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowConductModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Student Modal */}
      {showAddStudentModal && (
        <div className="modal-overlay" onClick={() => setShowAddStudentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Add New Student</h2>
              <button className="close-btn" onClick={() => setShowAddStudentModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <label style={{ gridColumn: '1 / -1' }}>
                  <strong>Full Name *</strong>
                  <input
                    type="text"
                    value={newStudentForm.name}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                    placeholder="Enter student name"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb', marginTop: '0.5rem' }}
                  />
                </label>

                <label>
                  <strong>Email *</strong>
                  <input
                    type="email"
                    value={newStudentForm.email}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
                    placeholder="student@email.com"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb', marginTop: '0.5rem' }}
                  />
                </label>

                <label>
                  <strong>Phone *</strong>
                  <input
                    type="tel"
                    value={newStudentForm.phone}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, phone: e.target.value })}
                    placeholder="0788123456"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb', marginTop: '0.5rem' }}
                  />
                </label>

                <label style={{ gridColumn: '1 / -1' }}>
                  <strong>Address</strong>
                  <input
                    type="text"
                    value={newStudentForm.address}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, address: e.target.value })}
                    placeholder="Kigali, Rwanda"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb', marginTop: '0.5rem' }}
                  />
                </label>

                <label>
                  <strong>Class *</strong>
                  <select
                    value={newStudentForm.class}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, class: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb', marginTop: '0.5rem' }}
                  >
                    <option value="L3">L3</option>
                    <option value="L4">L4</option>
                    <option value="L5">L5</option>
                  </select>
                </label>

                <label>
                  <strong>Trade/Department *</strong>
                  <select
                    value={newStudentForm.department}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, department: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb', marginTop: '0.5rem' }}
                  >
                    <option value="SOD">SOD</option>
                    <option value="Fashion">Fashion</option>
                    <option value="BUC">BUC</option>
                    <option value="Wood Technology">Wood Technology</option>
                  </select>
                </label>

                <label>
                  <strong>Guardian Name</strong>
                  <input
                    type="text"
                    value={newStudentForm.guardianName}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, guardianName: e.target.value })}
                    placeholder="Guardian name"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb', marginTop: '0.5rem' }}
                  />
                </label>

                <label>
                  <strong>Guardian Phone</strong>
                  <input
                    type="tel"
                    value={newStudentForm.guardianPhone}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, guardianPhone: e.target.value })}
                    placeholder="0788123456"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb', marginTop: '0.5rem' }}
                  />
                </label>
              </div>
              <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
                * Required fields. Student ID will be auto-generated.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowAddStudentModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveNewStudent}>Add Student</button>
            </div>
          </div>
        </div>
      )}

      <Chat />
      <Footer />
    </div>
  );
};

export default DODDashboard;

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
  BarChart3,
  Eye,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { getPosts } from '../services/postsService';
import { getAllMessages } from '../services/messagesService';
import ProfilePictureUpload from '../components/ProfilePictureUpload';
import { comprehensiveStudentsService } from '../services/comprehensiveStudentsService';
import { subjectReportService } from '../services/subjectReportService';
import DOSStudentReports from '../components/DOSStudentReports';
import './StaffDashboard.css';

const DOSDashboard = () => {
  const { user } = useAuth();
  const [postStats, setPostStats] = useState({ total: 0, visible: 0, hidden: 0 });
  const [messages, setMessages] = useState([]);
  const [contactSubmissions, setContactSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [expandedSections, setExpandedSections] = useState({ 
    students: false,
    subjectReports: false,
    departmentReports: false,
    individualReports: false
  });
  const [academicStats, setAcademicStats] = useState({
    totalStudents: 1524,
    passRate: 87.5,
    examResults: 94.2,
    teacherPerformance: 91.8
  });
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [classReport, setClassReport] = useState(null);
  const [departmentReport, setDepartmentReport] = useState(null);
  const [selectedReportDept, setSelectedReportDept] = useState('SOD');

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

      // Load students
      const allStudents = await comprehensiveStudentsService.getAllStudents();
      setStudents(allStudents);
      setAcademicStats(prev => ({ ...prev, totalStudents: allStudents.length }));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
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

  const handleGenerateClassReport = async () => {
    if (selectedClass === 'All') {
      alert('Please select a specific class');
      return;
    }
    
    const result = await subjectReportService.generateClassSubjectReport(
      selectedClass,
      selectedDepartment,
      selectedTerm
    );
    
    if (result.success) {
      setClassReport(result.report);
    } else {
      alert('Failed to generate report: ' + result.error);
    }
  };

  const handleGenerateDepartmentReport = async () => {
    const result = await subjectReportService.generateDepartmentReport(
      selectedReportDept,
      selectedTerm
    );
    
    if (result.success) {
      setDepartmentReport(result.report);
    } else {
      alert('Failed to generate report: ' + result.error);
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

          {/* Subject Reports by Class Section */}
          <div className="staff-section" style={{ gridColumn: '1 / -1' }}>
            <div className="section-header" style={{ cursor: 'pointer' }}>
              <div className="section-title" onClick={() => toggleSection('subjectReports')}>
                <FileText size={24} />
                <h2>Subject Performance Reports by Class</h2>
              </div>
              <button className="toggle-btn" onClick={() => toggleSection('subjectReports')}>
                {expandedSections.subjectReports ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
            
            {expandedSections.subjectReports && (
              <div className="section-content">
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <select 
                    value={selectedClass} 
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="filter-select"
                  >
                    <option value="All">Select Class</option>
                    <option value="L3">L3</option>
                    <option value="L4">L4</option>
                    <option value="L5">L5</option>
                  </select>

                  <select 
                    value={selectedDepartment} 
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="filter-select"
                  >
                    <option value="All">All Departments</option>
                    <option value="SOD">SOD</option>
                    <option value="Fashion">Fashion</option>
                    <option value="BUC">BUC</option>
                    <option value="Wood Technology">Wood Technology</option>
                  </select>

                  <select 
                    value={selectedTerm} 
                    onChange={(e) => setSelectedTerm(e.target.value)}
                    className="filter-select"
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>

                  <button 
                    className="btn btn-primary"
                    onClick={handleGenerateClassReport}
                    disabled={selectedClass === 'All'}
                  >
                    <BarChart3 size={18} />
                    Generate Report
                  </button>
                </div>

                {classReport && (
                  <div style={{ marginTop: '2rem' }}>
                    <div style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      marginBottom: '1.5rem'
                    }}>
                      <h3 style={{ margin: '0 0 0.5rem 0' }}>
                        {classReport.class} - {classReport.department === 'All' ? 'All Departments' : classReport.department}
                      </h3>
                      <p style={{ margin: 0, opacity: 0.9 }}>
                        {classReport.term} | Total Students: {classReport.totalStudents}
                      </p>
                    </div>

                    {/* Core Subjects */}
                    {classReport.coreSubjects.length > 0 && (
                      <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ 
                          color: '#1e293b', 
                          marginBottom: '1rem',
                          paddingBottom: '0.5rem',
                          borderBottom: '2px solid #667eea'
                        }}>
                          Core Subjects ({classReport.department})
                        </h3>
                        <div className="table-container">
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Subject</th>
                                <th>Class Average</th>
                                <th>Highest Mark</th>
                                <th>Lowest Mark</th>
                                <th>Pass Rate</th>
                              </tr>
                            </thead>
                            <tbody>
                              {classReport.coreSubjects.map((subject, index) => (
                                <tr key={index}>
                                  <td className="student-name">{subject.subject}</td>
                                  <td><strong style={{ color: '#667eea' }}>{subject.average}%</strong></td>
                                  <td><span style={{ color: '#10B981' }}>{subject.highest}%</span></td>
                                  <td><span style={{ color: '#EF4444' }}>{subject.lowest}%</span></td>
                                  <td>
                                    <span className={`status-badge ${subject.passRate >= 80 ? 'active' : subject.passRate >= 60 ? 'warning' : 'inactive'}`}>
                                      {subject.passRate}%
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Non-Core Subjects */}
                    <div>
                      <h3 style={{ 
                        color: '#1e293b', 
                        marginBottom: '1rem',
                        paddingBottom: '0.5rem',
                        borderBottom: '2px solid #10B981'
                      }}>
                        Non-Core Subjects (Common to All Departments)
                      </h3>
                      <div className="table-container">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Subject</th>
                              <th>Class Average</th>
                              <th>Highest Mark</th>
                              <th>Lowest Mark</th>
                              <th>Pass Rate</th>
                            </tr>
                          </thead>
                          <tbody>
                            {classReport.nonCoreSubjects.map((subject, index) => (
                              <tr key={index}>
                                <td className="student-name">{subject.subject}</td>
                                <td><strong style={{ color: '#10B981' }}>{subject.average}%</strong></td>
                                <td><span style={{ color: '#10B981' }}>{subject.highest}%</span></td>
                                <td><span style={{ color: '#EF4444' }}>{subject.lowest}%</span></td>
                                <td>
                                  <span className={`status-badge ${subject.passRate >= 80 ? 'active' : subject.passRate >= 60 ? 'warning' : 'inactive'}`}>
                                    {subject.passRate}%
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Department Performance Reports */}
          <div className="staff-section" style={{ gridColumn: '1 / -1' }}>
            <div className="section-header" style={{ cursor: 'pointer' }}>
              <div className="section-title" onClick={() => toggleSection('departmentReports')}>
                <Award size={24} />
                <h2>Department Performance Analysis</h2>
              </div>
              <button className="toggle-btn" onClick={() => toggleSection('departmentReports')}>
                {expandedSections.departmentReports ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
            
            {expandedSections.departmentReports && (
              <div className="section-content">
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <select 
                    value={selectedReportDept} 
                    onChange={(e) => setSelectedReportDept(e.target.value)}
                    className="filter-select"
                  >
                    <option value="SOD">SOD</option>
                    <option value="Fashion">Fashion</option>
                    <option value="BUC">BUC</option>
                    <option value="Wood Technology">Wood Technology</option>
                  </select>

                  <select 
                    value={selectedTerm} 
                    onChange={(e) => setSelectedTerm(e.target.value)}
                    className="filter-select"
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>

                  <button 
                    className="btn btn-primary"
                    onClick={handleGenerateDepartmentReport}
                  >
                    <Award size={18} />
                    Generate Department Report
                  </button>
                </div>

                {departmentReport && (
                  <div style={{ marginTop: '2rem' }}>
                    <div style={{ 
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      color: 'white',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      marginBottom: '1.5rem'
                    }}>
                      <h3 style={{ margin: '0 0 0.5rem 0' }}>
                        {departmentReport.department} Department Performance
                      </h3>
                      <p style={{ margin: 0, opacity: 0.9 }}>
                        {departmentReport.term} | Total Students: {departmentReport.totalStudents} | 
                        Overall Average: {departmentReport.overallDepartmentAverage}%
                      </p>
                    </div>

                    {/* Performance by Level */}
                    <div style={{ marginBottom: '2rem' }}>
                      <h3 style={{ color: '#1e293b', marginBottom: '1rem' }}>Performance by Level</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        {Object.entries(departmentReport.levelPerformance).map(([level, data]) => (
                          <div key={level} className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#667eea' }}>{level}</h4>
                            <p style={{ margin: '0.25rem 0', color: '#64748b' }}>
                              Students: <strong>{data.students}</strong>
                            </p>
                            <p style={{ margin: '0.25rem 0', color: '#64748b' }}>
                              Avg GPA: <strong style={{ color: '#10B981' }}>{data.averageGPA}</strong>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Core Subjects Performance */}
                    <div>
                      <h3 style={{ color: '#1e293b', marginBottom: '1rem' }}>Core Subjects Performance</h3>
                      <div className="table-container">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Subject</th>
                              <th>Department Average</th>
                              <th>Grade</th>
                            </tr>
                          </thead>
                          <tbody>
                            {departmentReport.coreSubjectsPerformance.map((subject, index) => (
                              <tr key={index}>
                                <td className="student-name">{subject.subject}</td>
                                <td><strong style={{ color: '#667eea' }}>{subject.average}%</strong></td>
                                <td>
                                  <span className="status-badge active">{subject.grade}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Individual Student Reports */}
          <div className="staff-section" style={{ gridColumn: '1 / -1' }}>
            <div className="section-header" style={{ cursor: 'pointer' }}>
              <div className="section-title" onClick={() => toggleSection('individualReports')}>
                <FileText size={24} />
                <h2>Individual Student Report Cards</h2>
              </div>
              <button className="toggle-btn" onClick={() => toggleSection('individualReports')}>
                {expandedSections.individualReports ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
            
            {expandedSections.individualReports && (
              <div className="section-content">
                <DOSStudentReports />
              </div>
            )}
          </div>

          {/* Students Section */}
          <div className="staff-section" style={{ gridColumn: '1 / -1' }}>
            <div className="section-header" style={{ cursor: 'pointer' }}>
              <div className="section-title" onClick={() => toggleSection('students')}>
                <Users size={24} />
                <h2>Student Overview - Director of Studies</h2>
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
                        <th>Attendance</th>
                        <th>GPA</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
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
                            <td>{student.attendance}%</td>
                            <td>{student.gpa}</td>
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

export default DOSDashboard;

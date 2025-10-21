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
  X,
  FileCheck,
  Download,
  Search,
  CheckCircle,
  Clock,
  Ban,
  TrendingUp,
  Award,
  BookOpen,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import { getPosts } from '../services/postsService';
import { getAllMessages } from '../services/messagesService';
import ProfilePictureUpload from '../components/ProfilePictureUpload';
import { comprehensiveStudentsService } from '../services/comprehensiveStudentsService';
import { subjectReportService } from '../services/subjectReportService';
import DOSStudentReports from '../components/DOSStudentReports';
import Navbar from '../components/Navbar';
import Chat from '../components/Chat';
import Footer from '../components/Footer';
import { marksService } from '../services/marksService';
import { studentsService } from '../services/studentsService';
import { getDepartmentSubjects } from '../services/departmentSubjectsService';
import { getDepartmentById } from '../services/departmentsService';
import './StaffDashboard.css';

const DOSDashboard = () => {
  const { user } = useAuth();
  const [postStats, setPostStats] = useState({ total: 0, visible: 0, hidden: 0 });
  const [messages, setMessages] = useState([]);
  const [contactSubmissions, setContactSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('All');
  
  // Marks viewing state
  const [allMarks, setAllMarks] = useState([]);
  const [marksSelectedDepartment, setMarksSelectedDepartment] = useState('all');
  const [marksSelectedClass, setMarksSelectedClass] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [departmentSubjects, setDepartmentSubjects] = useState([]);
  const [showMarksModal, setShowMarksModal] = useState(false);
  const [selectedStudentMarks, setSelectedStudentMarks] = useState(null);
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('All');
  const [expandedSections, setExpandedSections] = useState({ 
    students: false,
    subjectReports: false,
    departmentReports: false,
    individualReports: false,
    teacherMarks: false
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

  // Teacher marks viewing state
  const [teacherMarks, setTeacherMarks] = useState([]);
  const [selectedClassForReports, setSelectedClassForReports] = useState('All');
  const [selectedSubjectForReports, setSelectedSubjectForReports] = useState('All');
  const [showMarksReportModal, setShowMarksReportModal] = useState(false);
  const [selectedMarksData, setSelectedMarksData] = useState(null);

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
      const allStudents = await studentsService.getStudents();
      setStudents(allStudents);
      setAcademicStats(prev => ({ ...prev, totalStudents: allStudents.length }));

      // Load all marks
      const marks = await marksService.getAllMarks();
      setAllMarks(marks);

      // Initialize teacher marks data
      initializeTeacherMarks();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const initializeTeacherMarks = () => {
    setTeacherMarks([
      {
        id: 1,
        assessmentId: 1,
        assessmentName: 'Mathematics Midterm Exam',
        teacherName: 'Mr. John Smith',
        class: 'L3',
        subject: 'Mathematics',
        students: [
          { id: 1, name: 'Alice Johnson', mark: 85, maxMark: 100, grade: 'A', submitted: true },
          { id: 2, name: 'Bob Smith', mark: 72, maxMark: 100, grade: 'B', submitted: true },
          { id: 3, name: 'Carol Davis', mark: 91, maxMark: 100, grade: 'A', submitted: true },
          { id: 4, name: 'David Wilson', mark: 68, maxMark: 100, grade: 'C', submitted: true }
        ],
        averageScore: 79,
        totalStudents: 4,
        submittedCount: 4
      },
      {
        id: 2,
        assessmentId: 2,
        assessmentName: 'Physics Quiz 1',
        teacherName: 'Ms. Sarah Johnson',
        class: 'L4',
        subject: 'Physics',
        students: [
          { id: 5, name: 'Emma Davis', mark: 88, maxMark: 100, grade: 'A', submitted: true },
          { id: 6, name: 'Frank Miller', mark: 76, maxMark: 100, grade: 'B', submitted: true },
          { id: 7, name: 'Grace Lee', mark: 82, maxMark: 100, grade: 'A', submitted: true }
        ],
        averageScore: 82,
        totalStudents: 3,
        submittedCount: 3
      },
      {
        id: 3,
        assessmentId: 3,
        assessmentName: 'Chemistry Lab Report',
        teacherName: 'Dr. Michael Brown',
        class: 'L5',
        subject: 'Chemistry',
        students: [
          { id: 8, name: 'Henry Taylor', mark: 94, maxMark: 100, grade: 'A', submitted: true },
          { id: 9, name: 'Ivy Taylor', mark: 87, maxMark: 100, grade: 'A', submitted: true },
          { id: 10, name: 'Jack Anderson', mark: 79, maxMark: 100, grade: 'B', submitted: true }
        ],
        averageScore: 87,
        totalStudents: 3,
        submittedCount: 3
      }
    ]);
  };

  useEffect(() => {
    applyFilters();
  }, [students, selectedClass, selectedDepartmentFilter]);

  useEffect(() => {
    if (marksSelectedDepartment && marksSelectedDepartment !== 'all') {
      const subjects = getDepartmentSubjects(marksSelectedDepartment);
      setDepartmentSubjects(subjects);
    } else {
      setDepartmentSubjects([]);
    }
  }, [marksSelectedDepartment]);

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
      alert('Failed to generate department report: ' + result.error);
    }
  };

  const handleViewStudentMarks = async (studentId) => {
    const studentMarksData = await marksService.getMarksByStudent(studentId);
    const student = students.find(s => s.id === studentId);
    setSelectedStudentMarks({ student, marks: studentMarksData });
    setShowMarksModal(true);
  };

  const getFilteredMarks = () => {
    let filtered = [...allMarks];
    
    if (marksSelectedDepartment !== 'all') {
      filtered = filtered.filter(m => m.department === marksSelectedDepartment);
    }
    
    if (marksSelectedClass !== 'All') {
      filtered = filtered.filter(m => m.class === marksSelectedClass);
    }
    
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(m => m.subjectId === parseInt(selectedSubject));
    }
    
    return filtered;
  };

  const handleGenerateMarksReport = () => {
    if (selectedClassForReports === 'All') {
      alert('Please select a specific class');
      return;
    }

    // Filter marks by selected class
    const filteredMarks = teacherMarks.filter(mark => mark.class === selectedClassForReports);

    if (filteredMarks.length === 0) {
      alert('No marks data found for the selected class');
      return;
    }

    // Generate a comprehensive report
    const reportData = {
      class: selectedClassForReports,
      totalAssessments: filteredMarks.length,
      totalStudents: filteredMarks.length > 0 
        ? Math.max(...filteredMarks.map(m => m.totalStudents || 0).filter(n => n > 0))
        : 0,
      assessments: filteredMarks
    };

    setSelectedMarksData(reportData);
    setShowMarksReportModal(true);
  };

  const handleViewMarksDetails = (markEntry) => {
    setSelectedMarksData(markEntry);
    setShowMarksReportModal(true);
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

          {/* Student Marks Viewing Section */}
          <div className="staff-section" style={{ gridColumn: '1 / -1' }}>
            <div className="section-header">
              <div className="section-title">
                <GraduationCap size={24} />
                <h2>Student Marks by Class & Subject</h2>
              </div>
            </div>

            <div className="section-content">
              {/* Filters */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem', background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>Department</label>
                  <select
                    value={marksSelectedDepartment}
                    onChange={(e) => setMarksSelectedDepartment(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
                  >
                    <option value="all">All Departments</option>
                    <option value="sod">SOD</option>
                    <option value="fashion">Fashion</option>
                    <option value="buc">BUC</option>
                    <option value="wod">Wood Technology</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>Class</label>
                  <select
                    value={marksSelectedClass}
                    onChange={(e) => setMarksSelectedClass(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
                  >
                    <option value="All">All Classes</option>
                    <option value="L3">L3</option>
                    <option value="L4">L4</option>
                    <option value="L5">L5</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
                    disabled={marksSelectedDepartment === 'all'}
                  >
                    <option value="all">All Subjects</option>
                    {departmentSubjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Marks Table */}
              <div className="table-container" style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Class</th>
                      <th>Department</th>
                      <th>Subject</th>
                      <th>Assessment</th>
                      <th>Mark</th>
                      <th>Max Mark</th>
                      <th>Percentage</th>
                      <th>Grade</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredMarks().length === 0 ? (
                      <tr>
                        <td colSpan="10" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                          No marks data available for the selected filters
                        </td>
                      </tr>
                    ) : (
                      getFilteredMarks().map((mark) => {
                        const percentage = ((mark.mark / mark.maxMark) * 100).toFixed(1);
                        return (
                          <tr key={mark.id}>
                            <td style={{ fontWeight: '600' }}>{mark.studentName}</td>
                            <td>{mark.class}</td>
                            <td>
                              <span style={{ 
                                padding: '0.25rem 0.75rem', 
                                borderRadius: '12px', 
                                background: '#e0e7ff',
                                color: '#4338ca',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                textTransform: 'uppercase'
                              }}>
                                {mark.department}
                              </span>
                            </td>
                            <td>{mark.subjectName}</td>
                            <td>
                              <span style={{ 
                                padding: '0.25rem 0.75rem', 
                                borderRadius: '12px', 
                                background: mark.assessmentType === 'exam' ? '#dbeafe' : mark.assessmentType === 'test' ? '#fef3c7' : '#fce7f3',
                                color: mark.assessmentType === 'exam' ? '#1e40af' : mark.assessmentType === 'test' ? '#92400e' : '#be185d',
                                fontSize: '0.875rem',
                                fontWeight: '500'
                              }}>
                                {mark.assessmentType.charAt(0).toUpperCase() + mark.assessmentType.slice(1)}
                              </span>
                            </td>
                            <td style={{ fontWeight: '600', color: '#667eea' }}>{mark.mark}</td>
                            <td>{mark.maxMark}</td>
                            <td>
                              <span style={{ fontWeight: '600', color: percentage >= 70 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444' }}>
                                {percentage}%
                              </span>
                            </td>
                            <td>
                              <span className={`status-badge ${mark.grade === 'A' || mark.grade === 'B' ? 'active' : mark.grade === 'C' || mark.grade === 'D' ? 'warning' : 'inactive'}`}>
                                {mark.grade}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="btn btn-sm btn-outline" 
                                onClick={() => handleViewStudentMarks(mark.studentId)}
                                title="View all marks for this student"
                              >
                                <Eye size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Teacher Marks Overview Section */}
          <div className="staff-section" style={{ gridColumn: '1 / -1' }}>
            <div className="section-header" style={{ cursor: 'pointer' }}>
              <div className="section-title" onClick={() => toggleSection('teacherMarks')}>
                <Calculator size={24} />
                <h2>Teacher Marks Overview</h2>
              </div>
              <button className="toggle-btn" onClick={() => toggleSection('teacherMarks')}>
                {expandedSections.teacherMarks ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>

            {expandedSections.teacherMarks && (
              <div className="section-content">
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <select
                    value={selectedClassForReports}
                    onChange={(e) => setSelectedClassForReports(e.target.value)}
                    className="filter-select"
                  >
                    <option value="All">All Classes</option>
                    <option value="L3">L3</option>
                    <option value="L4">L4</option>
                    <option value="L5">L5</option>
                  </select>

                  <button
                    className="btn btn-primary"
                    onClick={handleGenerateMarksReport}
                    disabled={selectedClassForReports === 'All'}
                  >
                    <BarChart3 size={18} />
                    Generate Class Report
                  </button>

                  <div style={{ marginLeft: 'auto', fontWeight: '600', color: '#667eea' }}>
                    {teacherMarks.length} assessments recorded
                  </div>
                </div>

                <div className="marks-overview-grid">
                  {teacherMarks.map((markEntry) => (
                    <div key={markEntry.id} className="marks-card card">
                      <div className="marks-header">
                        <h3>{markEntry.assessmentName}</h3>
                        <span className="teacher-name">by {markEntry.teacherName}</span>
                      </div>
                      <div className="marks-details">
                        <div className="marks-info">
                          <p><strong>Class:</strong> {markEntry.class}</p>
                          <p><strong>Subject:</strong> {markEntry.subject}</p>
                          <p><strong>Average Score:</strong> <span style={{ color: '#667eea', fontWeight: 'bold' }}>{markEntry.averageScore}%</span></p>
                          <p><strong>Students:</strong> {markEntry.submittedCount}/{markEntry.totalStudents}</p>
                        </div>
                        <div className="marks-actions">
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleViewMarksDetails(markEntry)}
                          >
                            <Eye size={14} />
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Marks Report Modal */}
      {showMarksReportModal && selectedMarksData && (
        <div className="modal-overlay" onClick={() => setShowMarksReportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
            <div className="modal-header">
              <h2>
                {selectedMarksData.class ? `${selectedMarksData.class} Marks Report` : `${selectedMarksData.assessmentName} - Marks Details`}
              </h2>
              <button className="close-btn" onClick={() => setShowMarksReportModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              {selectedMarksData.class ? (
                // Class-wide report
                <div>
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    marginBottom: '2rem'
                  }}>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>
                      {selectedMarksData.class} Class Report
                    </h3>
                    <p style={{ margin: 0, opacity: 0.9 }}>
                      Total Assessments: {selectedMarksData.totalAssessments} |
                      Total Students: {selectedMarksData.totalStudents}
                    </p>
                  </div>

                  {(selectedMarksData.assessments || []).map((assessment, index) => (
                    <div key={assessment.id} style={{ marginBottom: '2rem' }}>
                      <h3 style={{ color: '#1e293b', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #667eea' }}>
                        {assessment.assessmentName} - {assessment.subject}
                      </h3>

                      <div className="table-container">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Student Name</th>
                              <th>Mark</th>
                              <th>Grade</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(assessment.students || []).map((student) => (
                              <tr key={student.id}>
                                <td className="student-name">{student.name}</td>
                                <td><strong style={{ color: '#667eea' }}>{student.mark}/{student.maxMark}</strong></td>
                                <td>
                                  <span className={`status-badge ${student.grade === 'A' ? 'active' : student.grade === 'B' ? 'warning' : 'inactive'}`}>
                                    {student.grade}
                                  </span>
                                </td>
                                <td>
                                  {student.submitted ? (
                                    <span style={{ color: '#10B981' }}>✓ Submitted</span>
                                  ) : (
                                    <span style={{ color: '#EF4444' }}>Pending</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Individual assessment details
                <div>
                  <div style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    marginBottom: '2rem'
                  }}>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>
                      {selectedMarksData.assessmentName}
                    </h3>
                    <p style={{ margin: 0, opacity: 0.9 }}>
                      Class: {selectedMarksData.class} | Subject: {selectedMarksData.subject} |
                      Average Score: {selectedMarksData.averageScore}%
                    </p>
                  </div>

                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Mark</th>
                          <th>Grade</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedMarksData.students || []).map((student) => (
                          <tr key={student.id}>
                            <td className="student-name">{student.name}</td>
                            <td><strong style={{ color: '#667eea' }}>{student.mark}/{student.maxMark}</strong></td>
                            <td>
                              <span className={`status-badge ${student.grade === 'A' ? 'active' : student.grade === 'B' ? 'warning' : 'inactive'}`}>
                                {student.grade}
                              </span>
                            </td>
                            <td>
                              {student.submitted ? (
                                <span style={{ color: '#10B981' }}>✓ Submitted</span>
                              ) : (
                                <span style={{ color: '#EF4444' }}>Pending</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowMarksReportModal(false)}>Close</button>
              <button className="btn btn-primary">
                <Download size={16} />
                Export Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Marks Details Modal */}
      {showMarksModal && selectedStudentMarks && (
        <div className="modal-overlay" onClick={() => setShowMarksModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h2>Student Marks Report</h2>
              <button className="close-btn" onClick={() => setShowMarksModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '2rem'
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>
                  {selectedStudentMarks.student?.name}
                </h3>
                <p style={{ margin: 0, opacity: 0.9 }}>
                  Class: {selectedStudentMarks.student?.class} | 
                  Department: {selectedStudentMarks.student?.department?.toUpperCase()} | 
                  Total Subjects: {selectedStudentMarks.marks.length}
                </p>
              </div>

              {selectedStudentMarks.marks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  No marks recorded for this student yet.
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Assessment</th>
                        <th>Mark</th>
                        <th>Max Mark</th>
                        <th>Percentage</th>
                        <th>Grade</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedStudentMarks.marks || []).map((mark) => {
                        const percentage = ((mark.mark / mark.maxMark) * 100).toFixed(1);
                        return (
                          <tr key={mark.id}>
                            <td style={{ fontWeight: '600' }}>{mark.subjectName}</td>
                            <td>
                              <span style={{ 
                                padding: '0.25rem 0.75rem', 
                                borderRadius: '12px', 
                                background: mark.assessmentType === 'exam' ? '#dbeafe' : mark.assessmentType === 'test' ? '#fef3c7' : '#fce7f3',
                                color: mark.assessmentType === 'exam' ? '#1e40af' : mark.assessmentType === 'test' ? '#92400e' : '#be185d',
                                fontSize: '0.875rem',
                                fontWeight: '500'
                              }}>
                                {mark.assessmentType.charAt(0).toUpperCase() + mark.assessmentType.slice(1)}
                              </span>
                            </td>
                            <td style={{ fontWeight: '600', color: '#667eea' }}>{mark.mark}</td>
                            <td>{mark.maxMark}</td>
                            <td>
                              <span style={{ fontWeight: '600', color: percentage >= 70 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444' }}>
                                {percentage}%
                              </span>
                            </td>
                            <td>
                              <span className={`status-badge ${mark.grade === 'A' || mark.grade === 'B' ? 'active' : mark.grade === 'C' || mark.grade === 'D' ? 'warning' : 'inactive'}`}>
                                {mark.grade}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                              {new Date(mark.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Summary Statistics */}
                  <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                    <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Average</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#667eea' }}>
                        {selectedStudentMarks.marks.length > 0
                          ? (selectedStudentMarks.marks.reduce((sum, m) => sum + (m.mark / m.maxMark) * 100, 0) / selectedStudentMarks.marks.length).toFixed(1)
                          : '0'}%
                      </div>
                    </div>
                    <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Highest</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>
                        {selectedStudentMarks.marks && selectedStudentMarks.marks.length > 0
                          ? Math.max(...selectedStudentMarks.marks.map(m => (m.mark / m.maxMark) * 100)).toFixed(1)
                          : '0'}%
                      </div>
                    </div>
                    <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Lowest</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>
                        {selectedStudentMarks.marks && selectedStudentMarks.marks.length > 0
                          ? Math.min(...selectedStudentMarks.marks.map(m => (m.mark / m.maxMark) * 100)).toFixed(1)
                          : '0'}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowMarksModal(false)}>Close</button>
              <button className="btn btn-primary">
                <Download size={16} />
                Export Student Report
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

export default DOSDashboard;

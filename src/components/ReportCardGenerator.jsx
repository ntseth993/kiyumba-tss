import { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  Filter,
  Award,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { comprehensiveStudentsService } from '../services/comprehensiveStudentsService';
import { reportCardService } from '../services/reportCardService';
import './ReportCardGenerator.css';

const ReportCardGenerator = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [academicYear, setAcademicYear] = useState('2024');
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [classStats, setClassStats] = useState(null);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [students, searchTerm, selectedClass, selectedDepartment]);

  useEffect(() => {
    if (selectedClass !== 'All') {
      loadClassStatistics();
    }
  }, [selectedClass, selectedTerm]);

  const loadStudents = async () => {
    const allStudents = await comprehensiveStudentsService.getAllStudents();
    setStudents(allStudents);
  };

  const applyFilters = () => {
    let filtered = [...students];
    
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedClass !== 'All') {
      filtered = filtered.filter(s => s.class === selectedClass);
    }
    
    if (selectedDepartment !== 'All') {
      filtered = filtered.filter(s => s.department === selectedDepartment);
    }
    
    setFilteredStudents(filtered);
  };

  const loadClassStatistics = async () => {
    const result = await reportCardService.getClassStatistics(selectedClass, selectedTerm);
    if (result.success) {
      setClassStats(result.statistics);
    }
  };

  const handleGenerateReport = async (student) => {
    setLoading(true);
    const result = await reportCardService.generateReportCard(student.id, selectedTerm, academicYear);
    
    if (result.success) {
      setCurrentReport(result.reportCard);
      setShowReportModal(true);
    } else {
      alert('Failed to generate report card: ' + result.error);
    }
    
    setLoading(false);
  };

  const handleGenerateClassReports = async () => {
    if (selectedClass === 'All') {
      alert('Please select a specific class to generate reports');
      return;
    }

    setLoading(true);
    const result = await reportCardService.generateClassReportCards(selectedClass, selectedTerm, academicYear);
    
    if (result.success) {
      alert(`Successfully generated ${result.count} report cards for ${selectedClass}`);
      // In a real app, this would trigger a bulk download
    } else {
      alert('Failed to generate class reports: ' + result.error);
    }
    
    setLoading(false);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const getGradeColor = (grade) => {
    if (grade.startsWith('A')) return '#10B981';
    if (grade.startsWith('B')) return '#3B82F6';
    if (grade.startsWith('C')) return '#F59E0B';
    if (grade.startsWith('D')) return '#EF4444';
    return '#991b1b';
  };

  return (
    <div className="report-card-generator">
      <div className="report-header">
        <div className="header-left">
          <FileText size={32} />
          <div>
            <h2>Report Card Generator</h2>
            <p>Generate comprehensive student report cards</p>
          </div>
        </div>
        <div className="header-right">
          <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}>
            <option value="Term 1">Term 1</option>
            <option value="Term 2">Term 2</option>
            <option value="Term 3">Term 3</option>
          </select>
          <input
            type="text"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            placeholder="Academic Year"
            className="year-input"
          />
        </div>
      </div>

      {/* Class Statistics */}
      {classStats && selectedClass !== 'All' && (
        <div className="class-statistics">
          <h3>{selectedClass} Statistics - {selectedTerm}</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <Users size={20} />
              <div>
                <span className="stat-value">{classStats.totalStudents}</span>
                <span className="stat-label">Total Students</span>
              </div>
            </div>
            <div className="stat-item">
              <TrendingUp size={20} />
              <div>
                <span className="stat-value">{classStats.averageClassMark}%</span>
                <span className="stat-label">Class Average</span>
              </div>
            </div>
            <div className="stat-item">
              <Award size={20} />
              <div>
                <span className="stat-value">{classStats.highestMark}%</span>
                <span className="stat-label">Highest Mark</span>
              </div>
            </div>
            <div className="stat-item">
              <CheckCircle size={20} />
              <div>
                <span className="stat-value">{classStats.passRate}%</span>
                <span className="stat-label">Pass Rate</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="report-controls">
        <div className="filters">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            <option value="All">All Classes</option>
            <option value="L3">L3</option>
            <option value="L4">L4</option>
            <option value="L5">L5</option>
          </select>

          <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
            <option value="All">All Departments</option>
            <option value="SOD">SOD</option>
            <option value="Fashion">Fashion</option>
            <option value="BUC">BUC</option>
            <option value="Wood Technology">Wood Technology</option>
          </select>
        </div>

        {selectedClass !== 'All' && (
          <button 
            className="btn-generate-class" 
            onClick={handleGenerateClassReports}
            disabled={loading}
          >
            <Download size={18} />
            Generate Class Reports
          </button>
        )}
      </div>

      {/* Students Table */}
      <div className="students-table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Class</th>
              <th>Department</th>
              <th>GPA</th>
              <th>Attendance</th>
              <th>Conduct</th>
              <th>Actions</th>
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
              filteredStudents.map(student => (
                <tr key={student.id}>
                  <td>{student.studentId}</td>
                  <td className="student-name">{student.name}</td>
                  <td>{student.class}</td>
                  <td>{student.department}</td>
                  <td>
                    <span className="gpa-badge">{student.gpa}</span>
                  </td>
                  <td>
                    <span className={`attendance-badge ${student.attendance >= 90 ? 'good' : student.attendance >= 75 ? 'average' : 'poor'}`}>
                      {student.attendance}%
                    </span>
                  </td>
                  <td>
                    {student.conduct ? (
                      <span className="conduct-score">
                        {student.conduct[`term${selectedTerm.split(' ')[1]}`] || 0}/40
                      </span>
                    ) : (
                      <span className="conduct-score">0/40</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn-generate"
                      onClick={() => handleGenerateReport(student)}
                      disabled={loading}
                    >
                      <Eye size={14} />
                      Generate
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Report Card Modal */}
      {showReportModal && currentReport && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header no-print">
              <h2>Report Card</h2>
              <button className="close-btn" onClick={() => setShowReportModal(false)}>
                ×
              </button>
            </div>
            
            <div className="report-card-content">
              {/* School Header */}
              <div className="school-header">
                <h1>KIYUMBA TVET SCHOOL</h1>
                <p>Excellence in Technical and Vocational Education</p>
                <h2>STUDENT REPORT CARD</h2>
              </div>

              {/* Report Info */}
              <div className="report-info-bar">
                <div className="info-item">
                  <strong>Academic Year:</strong> {currentReport.academic.academicYear}
                </div>
                <div className="info-item">
                  <strong>Term:</strong> {currentReport.academic.term}
                </div>
                <div className="info-item">
                  <strong>Generated:</strong> {new Date(currentReport.generatedAt).toLocaleDateString()}
                </div>
              </div>

              {/* Student Information */}
              <div className="report-section">
                <h3>Student Information</h3>
                <div className="info-grid">
                  <div className="info-row">
                    <span>Student ID:</span>
                    <strong>{currentReport.student.id}</strong>
                  </div>
                  <div className="info-row">
                    <span>Name:</span>
                    <strong>{currentReport.student.name}</strong>
                  </div>
                  <div className="info-row">
                    <span>Class:</span>
                    <strong>{currentReport.student.class}</strong>
                  </div>
                  <div className="info-row">
                    <span>Department:</span>
                    <strong>{currentReport.student.department}</strong>
                  </div>
                </div>
              </div>

              {/* Academic Performance */}
              <div className="report-section">
                <h3>Academic Performance</h3>
                <table className="marks-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Mark</th>
                      <th>Grade</th>
                      <th>Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportCardService.getSubjectAnalysis(currentReport.academic.marks).map((subject, index) => (
                      <tr key={index}>
                        <td>{subject.subject}</td>
                        <td><strong>{subject.mark}</strong></td>
                        <td>
                          <span 
                            className="grade-badge" 
                            style={{ backgroundColor: `${getGradeColor(subject.grade)}20`, color: getGradeColor(subject.grade) }}
                          >
                            {subject.grade}
                          </span>
                        </td>
                        <td>{subject.comment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="summary-row">
                  <div className="summary-item">
                    <span>Total Marks:</span>
                    <strong>{currentReport.academic.totalMarks}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Average:</span>
                    <strong>{currentReport.academic.averageMark}%</strong>
                  </div>
                  <div className="summary-item">
                    <span>Overall Grade:</span>
                    <strong style={{ color: getGradeColor(currentReport.academic.grade) }}>
                      {currentReport.academic.grade}
                    </strong>
                  </div>
                  <div className="summary-item">
                    <span>GPA:</span>
                    <strong>{currentReport.academic.gpa}</strong>
                  </div>
                </div>
              </div>

              {/* Conduct & Attendance */}
              <div className="report-section">
                <h3>Conduct & Attendance</h3>
                <div className="conduct-attendance-grid">
                  <div className="conduct-box">
                    <h4>Conduct</h4>
                    <div className="score-display">
                      <span className="score">{currentReport.conduct.mark}/40</span>
                      <span className="percentage">({currentReport.conduct.percentage}%)</span>
                    </div>
                    <p className="comment">{currentReport.conduct.comment}</p>
                  </div>
                  <div className="attendance-box">
                    <h4>Attendance</h4>
                    <div className="score-display">
                      <span className="score">{currentReport.attendance.percentage}%</span>
                      <span className="status">{currentReport.attendance.status}</span>
                    </div>
                    <p className="comment">{currentReport.attendance.comment}</p>
                  </div>
                </div>
              </div>

              {/* Discipline */}
              {currentReport.discipline.issues.length > 0 && (
                <div className="report-section discipline-section">
                  <h3>Discipline Record</h3>
                  <div className="discipline-status">
                    <AlertTriangle size={20} color="#EF4444" />
                    <span>Status: {currentReport.discipline.status}</span>
                  </div>
                  <ul className="discipline-list">
                    {currentReport.discipline.issues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Overall Comment */}
              <div className="report-section overall-comment">
                <h3>Teacher's Comment</h3>
                <p>{currentReport.overallComment}</p>
              </div>

              {/* Signatures */}
              <div className="signatures">
                <div className="signature-box">
                  <div className="signature-line"></div>
                  <p>Class Teacher</p>
                </div>
                <div className="signature-box">
                  <div className="signature-line"></div>
                  <p>Director of Studies</p>
                </div>
                <div className="signature-box">
                  <div className="signature-line"></div>
                  <p>Parent/Guardian</p>
                </div>
              </div>
            </div>

            <div className="modal-footer no-print">
              <button className="btn btn-outline" onClick={() => setShowReportModal(false)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={handlePrintReport}>
                <Download size={18} />
                Print/Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportCardGenerator;

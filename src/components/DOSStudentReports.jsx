import { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  Filter,
  Eye,
  X,
  Printer
} from 'lucide-react';
import { comprehensiveStudentsService } from '../services/comprehensiveStudentsService';
import { subjectReportService } from '../services/subjectReportService';
import './DOSStudentReports.css';

const DOSStudentReports = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [students, searchTerm, selectedClass, selectedDepartment]);

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

  const handleGenerateReport = async (student) => {
    setLoading(true);
    const result = await subjectReportService.generateStudentSubjectReport(student.id, selectedTerm);
    
    if (result.success) {
      setCurrentReport(result.report);
      setShowReportModal(true);
    } else {
      alert('Failed to generate report: ' + result.error);
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
    <div className="dos-student-reports">
      <div className="reports-header">
        <div className="header-content">
          <FileText size={28} />
          <div>
            <h2>Student Academic Reports</h2>
            <p>Generate comprehensive academic reports for individual students</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="reports-controls">
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

        <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}>
          <option value="Term 1">Term 1</option>
          <option value="Term 2">Term 2</option>
          <option value="Term 3">Term 3</option>
        </select>
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
                    <span className="conduct-score">
                      {student.conduct?.[`term${selectedTerm.split(' ')[1]}`] || 0}/40
                    </span>
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
              <h2>Student Report Card</h2>
              <button className="close-btn" onClick={() => setShowReportModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="report-card-content">
              {/* School Header */}
              <div className="school-header">
                <h1>KIYUMBA TVET SCHOOL</h1>
                <p className="school-subtitle">Excellence in Technical and Vocational Education</p>
                <h2 className="report-title">STUDENT REPORT CARD</h2>
              </div>

              {/* Report Info Bar */}
              <div className="report-info-bar">
                <div className="info-item">
                  <span className="info-label">Academic Year:</span>
                  <strong>2024</strong>
                </div>
                <div className="info-item">
                  <span className="info-label">Term:</span>
                  <strong>{currentReport.term}</strong>
                </div>
                <div className="info-item">
                  <span className="info-label">Generated:</span>
                  <strong>{new Date().toLocaleDateString()}</strong>
                </div>
              </div>

              {/* Student Information */}
              <div className="report-section">
                <h3>Student Information</h3>
                <div className="info-grid">
                  <div className="info-row">
                    <span className="info-label">Student ID:</span>
                    <strong>{currentReport.student.id}</strong>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Name:</span>
                    <strong>{currentReport.student.name}</strong>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Class:</span>
                    <strong>{currentReport.student.class}</strong>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Department:</span>
                    <strong>{currentReport.student.department}</strong>
                  </div>
                </div>
              </div>

              {/* Core Subjects */}
              {currentReport.coreSubjects.length > 0 && (
                <div className="report-section">
                  <h3 className="section-title core">Core Subjects ({currentReport.student.department})</h3>
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
                      {currentReport.coreSubjects.map((subject, index) => (
                        <tr key={index}>
                          <td className="subject-name">{subject.subject}</td>
                          <td><strong>{subject.mark}</strong></td>
                          <td>
                            <span 
                              className="grade-badge" 
                              style={{ 
                                backgroundColor: `${getGradeColor(subject.grade)}20`, 
                                color: getGradeColor(subject.grade) 
                              }}
                            >
                              {subject.grade}
                            </span>
                          </td>
                          <td className="comment-text">{subject.comment}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="section-summary">
                    <span>Core Subjects Average:</span>
                    <strong>{currentReport.statistics.coreAverage}%</strong>
                  </div>
                </div>
              )}

              {/* Non-Core Subjects */}
              <div className="report-section">
                <h3 className="section-title non-core">Non-Core Subjects (Common)</h3>
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
                    {currentReport.nonCoreSubjects.map((subject, index) => (
                      <tr key={index}>
                        <td className="subject-name">{subject.subject}</td>
                        <td><strong>{subject.mark}</strong></td>
                        <td>
                          <span 
                            className="grade-badge" 
                            style={{ 
                              backgroundColor: `${getGradeColor(subject.grade)}20`, 
                              color: getGradeColor(subject.grade) 
                            }}
                          >
                            {subject.grade}
                          </span>
                        </td>
                        <td className="comment-text">{subject.comment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="section-summary">
                  <span>Non-Core Subjects Average:</span>
                  <strong>{currentReport.statistics.nonCoreAverage}%</strong>
                </div>
              </div>

              {/* Overall Performance */}
              <div className="report-section overall-section">
                <h3>Overall Performance Summary</h3>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Total Subjects</span>
                    <strong className="summary-value">{currentReport.statistics.totalSubjects}</strong>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Overall Average</span>
                    <strong className="summary-value highlight">{currentReport.statistics.overallAverage}%</strong>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Overall Grade</span>
                    <strong 
                      className="summary-value" 
                      style={{ color: getGradeColor(currentReport.statistics.overallGrade) }}
                    >
                      {currentReport.statistics.overallGrade}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="signatures">
                <div className="signature-box">
                  <div className="signature-line"></div>
                  <p>Class Teacher</p>
                  <span className="signature-date">Date: __________</span>
                </div>
                <div className="signature-box">
                  <div className="signature-line"></div>
                  <p>Director of Studies</p>
                  <span className="signature-date">Date: __________</span>
                </div>
                <div className="signature-box">
                  <div className="signature-line"></div>
                  <p>Parent/Guardian</p>
                  <span className="signature-date">Date: __________</span>
                </div>
              </div>

              {/* Footer */}
              <div className="report-footer">
                <p>This is an official academic report from Kiyumba TVET School</p>
                <p className="footer-note">Generated on {new Date().toLocaleString()}</p>
              </div>
            </div>

            <div className="modal-footer no-print">
              <button className="btn btn-outline" onClick={() => setShowReportModal(false)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={handlePrintReport}>
                <Download size={18} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DOSStudentReports;

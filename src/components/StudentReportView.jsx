import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Download, 
  Calendar,
  Award,
  TrendingUp,
  Eye,
  X
} from 'lucide-react';
import { comprehensiveStudentsService } from '../services/comprehensiveStudentsService';
import { subjectReportService } from '../services/subjectReportService';
import './StudentReportView.css';

const StudentReportView = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [reportCard, setReportCard] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      const students = await comprehensiveStudentsService.getAllStudents();
      // Find current student by email or ID
      const student = students.find(s => 
        s.email === user.email || s.studentId === user.studentId
      );
      
      if (student) {
        setStudentData(student);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading student data:', error);
      setLoading(false);
    }
  };

  const handleViewReport = async (term) => {
    if (!studentData) return;
    
    setLoading(true);
    const result = await subjectReportService.generateStudentSubjectReport(
      studentData.id,
      term
    );
    
    if (result.success) {
      setReportCard(result.report);
      setShowReportModal(true);
    } else {
      alert('Failed to load report: ' + result.error);
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

  if (loading) {
    return (
      <div className="student-report-view">
        <div className="loading-state">Loading your reports...</div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="student-report-view">
        <div className="error-state">
          <p>Unable to load your student data. Please contact administration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-report-view">
      <div className="report-header">
        <div className="header-content">
          <FileText size={32} />
          <div>
            <h2>My Academic Reports</h2>
            <p>View and download your report cards</p>
          </div>
        </div>
      </div>

      {/* Student Info Card */}
      <div className="student-info-card">
        <div className="info-section">
          <h3>Student Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Student ID:</span>
              <strong>{studentData.studentId}</strong>
            </div>
            <div className="info-item">
              <span className="label">Name:</span>
              <strong>{studentData.name}</strong>
            </div>
            <div className="info-item">
              <span className="label">Class:</span>
              <strong>{studentData.class}</strong>
            </div>
            <div className="info-item">
              <span className="label">Department:</span>
              <strong>{studentData.department}</strong>
            </div>
            <div className="info-item">
              <span className="label">GPA:</span>
              <strong className="gpa-value">{studentData.gpa}</strong>
            </div>
            <div className="info-item">
              <span className="label">Attendance:</span>
              <strong className={`attendance-value ${studentData.attendance >= 90 ? 'good' : studentData.attendance >= 75 ? 'average' : 'poor'}`}>
                {studentData.attendance}%
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="reports-grid">
        <h3>Available Report Cards</h3>
        <div className="term-cards">
          {['Term 1', 'Term 2', 'Term 3'].map((term) => (
            <div key={term} className="term-card">
              <div className="term-icon">
                <FileText size={32} />
              </div>
              <h4>{term}</h4>
              <p>Academic Year 2024</p>
              <div className="term-stats">
                <div className="stat">
                  <Calendar size={16} />
                  <span>
                    {term === 'Term 1' ? 'Jan - Apr' : 
                     term === 'Term 2' ? 'May - Aug' : 'Sep - Dec'}
                  </span>
                </div>
                {studentData.conduct && (
                  <div className="stat">
                    <Award size={16} />
                    <span>Conduct: {studentData.conduct[`term${term.split(' ')[1]}`] || 0}/40</span>
                  </div>
                )}
              </div>
              <button 
                className="btn-view-report"
                onClick={() => handleViewReport(term)}
                disabled={loading}
              >
                <Eye size={16} />
                View Report
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="performance-summary">
        <h3>Performance Overview</h3>
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon" style={{ backgroundColor: '#10B98115' }}>
              <TrendingUp size={24} color="#10B981" />
            </div>
            <div className="summary-content">
              <span className="summary-label">Current GPA</span>
              <strong className="summary-value">{studentData.gpa}</strong>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon" style={{ backgroundColor: '#3B82F615' }}>
              <Calendar size={24} color="#3B82F6" />
            </div>
            <div className="summary-content">
              <span className="summary-label">Attendance Rate</span>
              <strong className="summary-value">{studentData.attendance}%</strong>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon" style={{ backgroundColor: '#8B5CF615' }}>
              <Award size={24} color="#8B5CF6" />
            </div>
            <div className="summary-content">
              <span className="summary-label">Overall Status</span>
              <strong className="summary-value">{studentData.status}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && reportCard && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header no-print">
              <h2>My Report Card - {reportCard.term}</h2>
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

              {/* Report Info */}
              <div className="report-info-bar">
                <div className="info-item">
                  <span className="info-label">Academic Year:</span>
                  <strong>2024</strong>
                </div>
                <div className="info-item">
                  <span className="info-label">Term:</span>
                  <strong>{reportCard.term}</strong>
                </div>
                <div className="info-item">
                  <span className="info-label">Generated:</span>
                  <strong>{new Date().toLocaleDateString()}</strong>
                </div>
              </div>

              {/* Student Information */}
              <div className="report-section">
                <h3>Student Information</h3>
                <div className="info-grid-report">
                  <div className="info-row">
                    <span>Student ID:</span>
                    <strong>{reportCard.student.id}</strong>
                  </div>
                  <div className="info-row">
                    <span>Name:</span>
                    <strong>{reportCard.student.name}</strong>
                  </div>
                  <div className="info-row">
                    <span>Class:</span>
                    <strong>{reportCard.student.class}</strong>
                  </div>
                  <div className="info-row">
                    <span>Department:</span>
                    <strong>{reportCard.student.department}</strong>
                  </div>
                </div>
              </div>

              {/* Core Subjects */}
              {reportCard.coreSubjects.length > 0 && (
                <div className="report-section">
                  <h3 className="section-title core">Core Subjects ({reportCard.student.department})</h3>
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
                      {reportCard.coreSubjects.map((subject, index) => (
                        <tr key={index}>
                          <td>{subject.subject}</td>
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
                          <td>{subject.comment}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="section-summary">
                    <span>Core Subjects Average:</span>
                    <strong>{reportCard.statistics.coreAverage}%</strong>
                  </div>
                </div>
              )}

              {/* Non-Core Subjects */}
              <div className="report-section">
                <h3 className="section-title non-core">Non-Core Subjects</h3>
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
                    {reportCard.nonCoreSubjects.map((subject, index) => (
                      <tr key={index}>
                        <td>{subject.subject}</td>
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
                        <td>{subject.comment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="section-summary">
                  <span>Non-Core Subjects Average:</span>
                  <strong>{reportCard.statistics.nonCoreAverage}%</strong>
                </div>
              </div>

              {/* Overall Performance */}
              <div className="report-section overall-section">
                <h3>Overall Performance</h3>
                <div className="summary-grid-report">
                  <div className="summary-item">
                    <span>Total Subjects</span>
                    <strong>{reportCard.statistics.totalSubjects}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Overall Average</span>
                    <strong className="highlight">{reportCard.statistics.overallAverage}%</strong>
                  </div>
                  <div className="summary-item">
                    <span>Overall Grade</span>
                    <strong style={{ color: getGradeColor(reportCard.statistics.overallGrade) }}>
                      {reportCard.statistics.overallGrade}
                    </strong>
                  </div>
                </div>
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

export default StudentReportView;

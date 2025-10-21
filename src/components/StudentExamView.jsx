import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getExamsForStudent, getUpcomingExams } from '../services/examsService';
import { 
  FileText, 
  Calendar, 
  Clock, 
  Award,
  Download,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import './StudentExamView.css';

const StudentExamView = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, past

  // Student class and department - from user profile
  const studentClass = user?.class || 'L3';
  const studentDepartment = user?.department || 'sod';

  useEffect(() => {
    loadExams();
  }, [studentClass, studentDepartment]);

  const loadExams = async () => {
    try {
      setLoading(true);
      // Fetch assessments from localStorage (from TeacherDashboard)
      const storedAssessments = localStorage.getItem('assessments');
      const allAssessments = storedAssessments ? JSON.parse(storedAssessments) : [];
      
      // Filter assessments by student's class and department
      const studentAssessments = allAssessments.filter(assessment => 
        assessment.class === studentClass
      );
      
      const now = new Date();
      const upcoming = studentAssessments.filter(assessment => 
        new Date(assessment.dueDate) > now
      );
      
      setExams(studentAssessments);
      setUpcomingExams(upcoming);
    } catch (error) {
      console.error('Error loading exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = (examDate) => {
    return new Date(examDate) > new Date();
  };

  const isPast = (examDate) => {
    return new Date(examDate) < new Date();
  };

  const getDaysUntil = (examDate) => {
    const today = new Date();
    const exam = new Date(examDate);
    const diffTime = exam - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredExams = exams.filter(exam => {
    const examDate = exam.dueDate || exam.examDate;
    if (filter === 'upcoming') return isUpcoming(examDate);
    if (filter === 'past') return isPast(examDate);
    return true;
  });

  const handleDownload = (exam) => {
    if (exam.file) {
      // Download from base64 data
      const link = document.createElement('a');
      link.href = exam.file;
      link.download = exam.fileName || `${exam.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (exam.fileUrl) {
      // In production, this would download from cloud storage
      window.open(exam.fileUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="student-exam-view">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-exam-view">
      <div className="exam-view-header">
        <div>
          <h2>
            <FileText size={24} />
            My Exams
          </h2>
          <p>View and download exam materials</p>
        </div>
        
        {/* Filter Buttons */}
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({exams.length})
          </button>
          <button
            className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming ({upcomingExams.length})
          </button>
          <button
            className={`filter-btn ${filter === 'past' ? 'active' : ''}`}
            onClick={() => setFilter('past')}
          >
            Past
          </button>
        </div>
      </div>

      {/* Upcoming Exams Alert */}
      {upcomingExams.length > 0 && filter !== 'past' && (
        <div className="upcoming-alert">
          <AlertCircle size={20} />
          <div>
            <strong>You have {upcomingExams.length} upcoming exam{upcomingExams.length > 1 ? 's' : ''}</strong>
            <p>Make sure to prepare and download the exam materials</p>
          </div>
        </div>
      )}

      {/* Exams List */}
      <div className="exams-list">
        {filteredExams.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <h3>No exams found</h3>
            <p>
              {filter === 'upcoming' 
                ? 'You have no upcoming exams' 
                : filter === 'past'
                ? 'You have no past exams'
                : 'Your teacher hasn\'t uploaded any exams yet'}
            </p>
          </div>
        ) : (
          filteredExams.map(exam => {
            const examDate = exam.dueDate || exam.examDate;
            const daysUntil = getDaysUntil(examDate);
            const isExamUpcoming = isUpcoming(examDate);
            
            return (
              <div 
                key={exam.id} 
                className={`exam-item card ${isExamUpcoming ? 'upcoming' : 'past'}`}
              >
                <div className="exam-item-header">
                  <div className="exam-title-section">
                    <h3>{exam.title}</h3>
                    <div className="exam-badges">
                      <span className="subject-badge">{exam.type || exam.subject}</span>
                      <span className="class-badge">{exam.class}</span>
                      {isExamUpcoming && daysUntil <= 7 && (
                        <span className="urgent-badge">
                          {daysUntil === 0 ? 'Today' : `In ${daysUntil} day${daysUntil > 1 ? 's' : ''}`}
                        </span>
                      )}
                      {isPast(examDate) && (
                        <span className="completed-badge">
                          <CheckCircle size={14} />
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {exam.description && (
                  <p className="exam-description">{exam.description}</p>
                )}

                <div className="exam-details-grid">
                  <div className="detail-item">
                    <Calendar size={16} />
                    <div>
                      <span className="detail-label">Due Date</span>
                      <span className="detail-value">{formatDate(examDate)}</span>
                    </div>
                  </div>

                  {exam.totalMarks && (
                    <div className="detail-item">
                      <Award size={16} />
                      <div>
                        <span className="detail-label">Total Marks</span>
                        <span className="detail-value">{exam.totalMarks}</span>
                      </div>
                    </div>
                  )}

                  {exam.duration && (
                    <div className="detail-item">
                      <Clock size={16} />
                      <div>
                        <span className="detail-label">Duration</span>
                        <span className="detail-value">{exam.duration}</span>
                      </div>
                    </div>
                  )}

                  <div className="detail-item">
                    <FileText size={16} />
                    <div>
                      <span className="detail-label">Status</span>
                      <span className="detail-value">{exam.status || 'Active'}</span>
                    </div>
                  </div>
                </div>

                <div className="exam-footer">
                  <div className="teacher-info">
                    <span>Created: {formatDate(exam.createdAt || new Date())}</span>
                  </div>
                  
                  {(exam.fileName || exam.file) && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleDownload(exam)}
                    >
                      <Download size={16} />
                      Download {exam.type || 'Exam'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentExamView;

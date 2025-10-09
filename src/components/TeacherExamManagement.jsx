import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  createExam, 
  getExamsByTeacher, 
  deleteExam,
  updateExam
} from '../services/examsService';
import { 
  FileText, 
  Upload, 
  Calendar, 
  Clock, 
  Trash2, 
  Edit, 
  X,
  Plus,
  Users,
  Award
} from 'lucide-react';
import './TeacherExamManagement.css';

const TeacherExamManagement = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    classId: '',
    className: '',
    examDate: '',
    dueDate: '',
    totalMarks: '',
    duration: '',
    file: null
  });

  // Available classes - in production this would come from an API
  const classes = [
    { id: 'p1', name: 'Primary 1' },
    { id: 'p2', name: 'Primary 2' },
    { id: 'p3', name: 'Primary 3' },
    { id: 'p4', name: 'Primary 4' },
    { id: 'p5', name: 'Primary 5' },
    { id: 'p6', name: 'Primary 6' },
    { id: 's1', name: 'Senior 1' },
    { id: 's2', name: 'Senior 2' },
    { id: 's3', name: 'Senior 3' },
    { id: 's4', name: 'Senior 4' },
    { id: 's5', name: 'Senior 5' },
    { id: 's6', name: 'Senior 6' }
  ];

  const subjects = [
    'Mathematics',
    'English',
    'Physics',
    'Chemistry',
    'Biology',
    'History',
    'Geography',
    'French',
    'Kinyarwanda',
    'Computer Science',
    'Economics',
    'Literature'
  ];

  useEffect(() => {
    loadExams();
  }, [user]);

  const loadExams = async () => {
    try {
      const teacherExams = await getExamsByTeacher(user.id.toString());
      setExams(teacherExams);
    } catch (error) {
      console.error('Error loading exams:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-fill className when classId is selected
    if (name === 'classId') {
      const selectedClass = classes.find(c => c.id === value);
      setFormData(prev => ({
        ...prev,
        className: selectedClass?.name || ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a PDF or Word document');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        file
      }));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form
      if (!formData.title || !formData.subject || !formData.classId || 
          !formData.examDate || !formData.totalMarks) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Create exam data
      const examData = {
        ...formData,
        teacherId: user.id.toString(),
        teacherName: user.name,
        fileUrl: formData.file ? URL.createObjectURL(formData.file) : '' // In production, upload to cloud storage
      };

      await createExam(examData);
      setSuccess('Exam created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        subject: '',
        classId: '',
        className: '',
        examDate: '',
        dueDate: '',
        totalMarks: '',
        duration: '',
        file: null
      });

      // Reload exams
      await loadExams();
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowCreateModal(false);
        setSuccess('');
      }, 2000);
    } catch (error) {
      setError(error.message || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) {
      return;
    }

    try {
      await deleteExam(examId);
      setSuccess('Exam deleted successfully');
      await loadExams();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to delete exam');
      setTimeout(() => setError(''), 3000);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="teacher-exam-management">
      <div className="exam-header">
        <div>
          <h2>
            <FileText size={24} />
            Exam Management
          </h2>
          <p>Create and manage exams for your classes</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={18} />
          Create New Exam
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}
      {error && !showCreateModal && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Exams List */}
      <div className="exams-grid">
        {exams.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <h3>No exams yet</h3>
            <p>Create your first exam to get started</p>
          </div>
        ) : (
          exams.map(exam => (
            <div key={exam.id} className="exam-card card">
              <div className="exam-card-header">
                <div>
                  <h3>{exam.title}</h3>
                  <div className="exam-meta">
                    <span className="subject-badge">{exam.subject}</span>
                    <span className="class-badge">{exam.className}</span>
                  </div>
                </div>
                <div className="exam-actions">
                  <button 
                    className="icon-btn"
                    onClick={() => handleDelete(exam.id)}
                    title="Delete exam"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <p className="exam-description">{exam.description}</p>

              <div className="exam-details">
                <div className="detail-item">
                  <Calendar size={16} />
                  <span>Exam: {formatDate(exam.examDate)}</span>
                </div>
                {exam.dueDate && (
                  <div className="detail-item">
                    <Clock size={16} />
                    <span>Due: {formatDate(exam.dueDate)}</span>
                  </div>
                )}
                <div className="detail-item">
                  <Award size={16} />
                  <span>{exam.totalMarks} marks</span>
                </div>
                {exam.duration && (
                  <div className="detail-item">
                    <Clock size={16} />
                    <span>{exam.duration}</span>
                  </div>
                )}
                <div className="detail-item">
                  <Users size={16} />
                  <span>{exam.submissions?.length || 0} submissions</span>
                </div>
              </div>

              {exam.fileName && (
                <div className="exam-file">
                  <FileText size={16} />
                  <span>{exam.fileName}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Exam Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Exam</h2>
              <button 
                className="close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="exam-form">
              <div className="form-group">
                <label htmlFor="title">Exam Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Mid-Term Mathematics Exam"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select subject</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="classId">Class *</label>
                  <select
                    id="classId"
                    name="classId"
                    value={formData.classId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select class</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the exam"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="examDate">Exam Date *</label>
                  <input
                    type="date"
                    id="examDate"
                    name="examDate"
                    value={formData.examDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dueDate">Submission Due Date</label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="totalMarks">Total Marks *</label>
                  <input
                    type="number"
                    id="totalMarks"
                    name="totalMarks"
                    value={formData.totalMarks}
                    onChange={handleInputChange}
                    placeholder="e.g., 100"
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="duration">Duration</label>
                  <input
                    type="text"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 2 hours"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="file">Upload Exam File (PDF or Word)</label>
                <div className="file-upload-area">
                  <input
                    type="file"
                    id="file"
                    name="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                  />
                  <div className="file-upload-label">
                    <Upload size={24} />
                    <p>
                      {formData.file 
                        ? formData.file.name 
                        : 'Click to upload or drag and drop'}
                    </p>
                    <span>PDF or Word document (max 10MB)</span>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherExamManagement;

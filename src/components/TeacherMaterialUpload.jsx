import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  uploadMaterial, 
  getTeacherAssignments, 
  setTeacherAssignments,
  getMaterialsByTeacher,
  deleteMaterial,
  getTeacherStats,
  AVAILABLE_SUBJECTS,
  AVAILABLE_CLASSES,
  MATERIAL_TYPES,
  initializeTeacherAssignments
} from '../services/teacherMaterialsService';
import { 
  Upload, 
  FileText, 
  Trash2, 
  Eye, 
  Download, 
  Settings,
  Plus,
  X,
  Save,
  CheckCircle
} from 'lucide-react';
import './TeacherMaterialUpload.css';

const TeacherMaterialUpload = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState({ subjects: [], classes: [] });
  const [stats, setStats] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'notes',
    subject: '',
    classes: [],
    fileData: null,
    fileName: '',
    fileSize: 0
  });

  // Settings form
  const [settingsForm, setSettingsForm] = useState({
    subjects: [],
    classes: []
  });

  useEffect(() => {
    initializeTeacherAssignments();
    loadData();
  }, [user]);

  const loadData = () => {
    if (user && user.role === 'teacher') {
      const teacherAssignments = getTeacherAssignments(user.id);
      setAssignments(teacherAssignments);
      setSettingsForm({
        subjects: teacherAssignments.subjects || [],
        classes: teacherAssignments.classes || []
      });
      
      const teacherMaterials = getMaterialsByTeacher(user.id);
      setMaterials(teacherMaterials);
      
      const teacherStats = getTeacherStats(user.id);
      setStats(teacherStats);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you'd upload to a server
      // For demo, we'll store file info only
      setFormData({
        ...formData,
        fileName: file.name,
        fileSize: file.size,
        fileData: `data:${file.type};base64,demo` // Placeholder
      });
    }
  };

  const handleClassToggle = (className) => {
    const newClasses = formData.classes.includes(className)
      ? formData.classes.filter(c => c !== className)
      : [...formData.classes, className];
    
    setFormData({ ...formData, classes: newClasses });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.subject || formData.classes.length === 0) {
      alert('Please fill all required fields');
      return;
    }

    const result = await uploadMaterial({
      teacherId: user.id,
      teacherName: user.name,
      title: formData.title,
      description: formData.description,
      type: formData.type,
      subject: formData.subject,
      classes: formData.classes,
      fileName: formData.fileName,
      fileSize: formData.fileSize,
      fileData: formData.fileData
    });

    if (result.success) {
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
      setShowUploadForm(false);
      setFormData({
        title: '',
        description: '',
        type: 'notes',
        subject: '',
        classes: [],
        fileData: null,
        fileName: '',
        fileSize: 0
      });
      loadData();
    }
  };

  const handleDelete = async (materialId) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      const result = await deleteMaterial(materialId, user.id);
      if (result.success) {
        loadData();
      }
    }
  };

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    setTeacherAssignments(user.id, settingsForm.subjects, settingsForm.classes);
    setAssignments({ subjects: settingsForm.subjects, classes: settingsForm.classes });
    setShowSettings(false);
    alert('Settings saved successfully!');
  };

  const toggleSubject = (subject) => {
    const newSubjects = settingsForm.subjects.includes(subject)
      ? settingsForm.subjects.filter(s => s !== subject)
      : [...settingsForm.subjects, subject];
    setSettingsForm({ ...settingsForm, subjects: newSubjects });
  };

  const toggleClass = (className) => {
    const newClasses = settingsForm.classes.includes(className)
      ? settingsForm.classes.filter(c => c !== className)
      : [...settingsForm.classes, className];
    setSettingsForm({ ...settingsForm, classes: newClasses });
  };

  const getMaterialIcon = (type) => {
    const materialType = MATERIAL_TYPES.find(t => t.value === type);
    return materialType ? materialType.icon : '📄';
  };

  const getMaterialColor = (type) => {
    const materialType = MATERIAL_TYPES.find(t => t.value === type);
    return materialType ? materialType.color : '#6366f1';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (user?.role !== 'teacher') {
    return (
      <div className="teacher-materials-container">
        <div className="access-denied">
          <p>This feature is only available for teachers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-materials-container">
      {/* Success notification */}
      {uploadSuccess && (
        <div className="upload-success-notification">
          <CheckCircle size={20} />
          <span>Material uploaded successfully!</span>
        </div>
      )}

      {/* Header */}
      <div className="materials-header">
        <div>
          <h2>Teaching Materials</h2>
          <p>Upload and manage your course materials for students</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-settings"
            onClick={() => setShowSettings(true)}
          >
            <Settings size={18} />
            Settings
          </button>
          <button 
            className="btn-upload"
            onClick={() => setShowUploadForm(true)}
          >
            <Plus size={18} />
            Upload Material
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#e0e7ff' }}>
              <FileText size={24} color="#6366f1" />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Materials</span>
              <span className="stat-value">{stats.totalMaterials}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7' }}>
              <Eye size={24} color="#f59e0b" />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Views</span>
              <span className="stat-value">{stats.totalViews}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dbeafe' }}>
              <Download size={24} color="#3b82f6" />
            </div>
            <div className="stat-info">
              <span className="stat-label">Downloads</span>
              <span className="stat-value">{stats.totalDownloads}</span>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Info */}
      <div className="teacher-info-card">
        <h3>Your Teaching Assignment</h3>
        <div className="assignment-info">
          <div>
            <strong>Subjects:</strong>
            <div className="tag-list">
              {assignments.subjects.length > 0 ? (
                assignments.subjects.map(subject => (
                  <span key={subject} className="tag tag-subject">{subject}</span>
                ))
              ) : (
                <span className="text-muted">No subjects assigned. Click Settings to configure.</span>
              )}
            </div>
          </div>
          <div>
            <strong>Classes:</strong>
            <div className="tag-list">
              {assignments.classes.length > 0 ? (
                assignments.classes.map(cls => (
                  <span key={cls} className="tag tag-class">{cls}</span>
                ))
              ) : (
                <span className="text-muted">No classes assigned. Click Settings to configure.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Materials List */}
      <div className="materials-list">
        <h3>Uploaded Materials ({materials.length})</h3>
        {materials.length === 0 ? (
          <div className="empty-state">
            <Upload size={64} color="#cbd5e1" />
            <h4>No materials uploaded yet</h4>
            <p>Click "Upload Material" to share content with your students</p>
          </div>
        ) : (
          <div className="materials-grid">
            {materials.map(material => (
              <div key={material.id} className="material-card">
                <div 
                  className="material-icon"
                  style={{ background: getMaterialColor(material.type) + '20', color: getMaterialColor(material.type) }}
                >
                  <span style={{ fontSize: '32px' }}>{getMaterialIcon(material.type)}</span>
                </div>
                <div className="material-content">
                  <h4>{material.title}</h4>
                  <p className="material-description">{material.description}</p>
                  <div className="material-meta">
                    <span className="meta-item">
                      <strong>Subject:</strong> {material.subject}
                    </span>
                    <span className="meta-item">
                      <strong>Classes:</strong> {material.classes.join(', ')}
                    </span>
                    <span className="meta-item">
                      <strong>File:</strong> {material.fileName} ({formatFileSize(material.fileSize)})
                    </span>
                  </div>
                  <div className="material-stats">
                    <span><Eye size={14} /> {material.views || 0}</span>
                    <span><Download size={14} /> {material.downloads || 0}</span>
                    <span className="upload-date">
                      {new Date(material.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button 
                  className="btn-delete-material"
                  onClick={() => handleDelete(material.id)}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="modal-overlay" onClick={() => setShowUploadForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload Material</h3>
              <button onClick={() => setShowUploadForm(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="upload-form">
              <div className="form-group">
                <label>Material Type *</label>
                <div className="type-selector">
                  {MATERIAL_TYPES.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      className={`type-btn ${formData.type === type.value ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, type: type.value })}
                      style={{ 
                        borderColor: formData.type === type.value ? type.color : '#e5e7eb',
                        background: formData.type === type.value ? type.color + '10' : 'white'
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>{type.icon}</span>
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Chapter 5 - Quadratic Equations"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the material..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Subject *</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                >
                  <option value="">Select subject</option>
                  {assignments.subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Classes * (Select at least one)</label>
                <div className="class-selector">
                  {assignments.classes.map(className => (
                    <button
                      key={className}
                      type="button"
                      className={`class-btn ${formData.classes.includes(className) ? 'selected' : ''}`}
                      onClick={() => handleClassToggle(className)}
                    >
                      {className}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Upload File *</label>
                <div className="file-upload-area">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                    id="file-input"
                    required
                  />
                  <label htmlFor="file-input" className="file-upload-label">
                    <Upload size={32} />
                    <span>{formData.fileName || 'Choose file or drag here'}</span>
                    <small>PDF, DOC, PPT, XLS (Max 10MB)</small>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowUploadForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  <Upload size={18} />
                  Upload Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Teaching Settings</h3>
              <button onClick={() => setShowSettings(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSettingsSubmit} className="settings-form">
              <div className="form-group">
                <label>Your Teaching Subjects</label>
                <div className="checkbox-grid">
                  {AVAILABLE_SUBJECTS.map(subject => (
                    <label key={subject} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={settingsForm.subjects.includes(subject)}
                        onChange={() => toggleSubject(subject)}
                      />
                      <span>{subject}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Your Teaching Classes</label>
                <div className="checkbox-grid">
                  {AVAILABLE_CLASSES.map(className => (
                    <label key={className} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={settingsForm.classes.includes(className)}
                        onChange={() => toggleClass(className)}
                      />
                      <span>{className}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowSettings(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  <Save size={18} />
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherMaterialUpload;

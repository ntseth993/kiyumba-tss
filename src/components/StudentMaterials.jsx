import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getMaterialsForStudent, 
  getMaterialsByType,
  incrementViews,
  incrementDownloads,
  MATERIAL_TYPES
} from '../services/teacherMaterialsService';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  Search,
  Filter,
  BookOpen
} from 'lucide-react';
import './StudentMaterials.css';

const StudentMaterials = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [studentClass] = useState('Grade 10A'); // In real app, this would come from user profile

  useEffect(() => {
    loadMaterials();
  }, [studentClass]);

  useEffect(() => {
    filterMaterials();
  }, [materials, selectedType, searchQuery]);

  const loadMaterials = () => {
    const allMaterials = getMaterialsForStudent(studentClass);
    setMaterials(allMaterials);
  };

  const filterMaterials = () => {
    let filtered = [...materials];

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(m => m.type === selectedType);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredMaterials(filtered);
  };

  const handleView = (materialId) => {
    incrementViews(materialId);
    // In a real app, this would open the file
    alert('Opening material... (In real app, this would open/preview the file)');
  };

  const handleDownload = (materialId, fileName) => {
    incrementDownloads(materialId);
    // In a real app, this would download the file
    alert(`Downloading ${fileName}... (In real app, this would trigger actual download)`);
    loadMaterials(); // Refresh to show updated download count
  };

  const getMaterialIcon = (type) => {
    const materialType = MATERIAL_TYPES.find(t => t.value === type);
    return materialType ? materialType.icon : '📄';
  };

  const getMaterialColor = (type) => {
    const materialType = MATERIAL_TYPES.find(t => t.value === type);
    return materialType ? materialType.color : '#6366f1';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const groupBySubject = () => {
    const grouped = {};
    filteredMaterials.forEach(material => {
      if (!grouped[material.subject]) {
        grouped[material.subject] = [];
      }
      grouped[material.subject].push(material);
    });
    return grouped;
  };

  if (user?.role !== 'student') {
    return (
      <div className="student-materials-container">
        <div className="access-denied">
          <p>This feature is only available for students.</p>
        </div>
      </div>
    );
  }

  const groupedMaterials = groupBySubject();

  return (
    <div className="student-materials-container">
      {/* Header */}
      <div className="materials-header-student">
        <div>
          <h2>📚 Course Materials</h2>
          <p>Access notes, tests, quizzes, and exams from your teachers</p>
        </div>
        <div className="student-class-badge">
          <BookOpen size={18} />
          <span>{studentClass}</span>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="materials-summary">
        <div className="summary-card">
          <span className="summary-count">{materials.length}</span>
          <span className="summary-label">Total Materials</span>
        </div>
        {MATERIAL_TYPES.map(type => {
          const count = materials.filter(m => m.type === type.value).length;
          return (
            <div key={type.value} className="summary-card">
              <span className="summary-icon">{type.icon}</span>
              <span className="summary-count">{count}</span>
              <span className="summary-label">{type.label}</span>
            </div>
          );
        })}
      </div>

      {/* Filters and Search */}
      <div className="materials-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search materials, subjects, or teachers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="type-filters">
          <button
            className={`filter-btn ${selectedType === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedType('all')}
          >
            <Filter size={16} />
            All
          </button>
          {MATERIAL_TYPES.map(type => (
            <button
              key={type.value}
              className={`filter-btn ${selectedType === type.value ? 'active' : ''}`}
              onClick={() => setSelectedType(type.value)}
              style={{
                borderColor: selectedType === type.value ? type.color : '#e2e8f0',
                color: selectedType === type.value ? type.color : '#64748b'
              }}
            >
              <span>{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Materials List */}
      {filteredMaterials.length === 0 ? (
        <div className="empty-state-student">
          <div className="empty-icon">📭</div>
          <h3>No materials found</h3>
          <p>
            {searchQuery 
              ? 'Try adjusting your search terms' 
              : 'Your teachers haven\'t uploaded any materials yet'}
          </p>
        </div>
      ) : (
        <div className="materials-content">
          {Object.keys(groupedMaterials).map(subject => (
            <div key={subject} className="subject-section">
              <h3 className="subject-title">
                <span className="subject-icon">📖</span>
                {subject}
                <span className="material-count">
                  {groupedMaterials[subject].length} materials
                </span>
              </h3>
              
              <div className="materials-grid-student">
                {groupedMaterials[subject].map(material => (
                  <div key={material.id} className="material-card-student">
                    <div 
                      className="material-card-icon"
                      style={{ 
                        background: getMaterialColor(material.type) + '20',
                        color: getMaterialColor(material.type)
                      }}
                    >
                      <span style={{ fontSize: '28px' }}>
                        {getMaterialIcon(material.type)}
                      </span>
                    </div>

                    <div className="material-card-content">
                      <div className="material-type-badge" style={{ background: getMaterialColor(material.type) }}>
                        {material.type.toUpperCase()}
                      </div>
                      
                      <h4>{material.title}</h4>
                      
                      {material.description && (
                        <p className="material-description">{material.description}</p>
                      )}

                      <div className="material-meta-info">
                        <span className="meta-teacher">
                          👨‍🏫 {material.teacherName}
                        </span>
                        <span className="meta-date">
                          <Calendar size={14} />
                          {formatDate(material.uploadedAt)}
                        </span>
                      </div>

                      <div className="material-stats-student">
                        <span>
                          <Eye size={14} />
                          {material.views || 0} views
                        </span>
                        <span>
                          <Download size={14} />
                          {material.downloads || 0} downloads
                        </span>
                        <span className="file-size">
                          {formatFileSize(material.fileSize)}
                        </span>
                      </div>
                    </div>

                    <div className="material-card-actions">
                      <button
                        className="btn-view"
                        onClick={() => handleView(material.id)}
                        title="View"
                      >
                        <Eye size={18} />
                        View
                      </button>
                      <button
                        className="btn-download"
                        onClick={() => handleDownload(material.id, material.fileName)}
                        title="Download"
                      >
                        <Download size={18} />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentMaterials;

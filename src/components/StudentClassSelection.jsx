import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, GraduationCap, BookOpen } from 'lucide-react';
import './DepartmentSelection.css';

const StudentClassSelection = () => {
  const { user, selectStudentClassAndDepartment, availableDepartments } = useAuth();
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [step, setStep] = useState(1); // 1: Select Class, 2: Select Department
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const classes = [
    { id: 'L3', name: 'Level 3 (L3)', description: 'Foundation level', icon: '📚' },
    { id: 'L4', name: 'Level 4 (L4)', description: 'Intermediate level', icon: '📖' },
    { id: 'L5', name: 'Level 5 (L5)', description: 'Advanced level', icon: '🎓' }
  ];

  const handleClassSelect = (classId) => {
    setSelectedClass(classId);
    setError('');
    // Move to department selection
    setTimeout(() => setStep(2), 300);
  };

  const handleDepartmentSelect = async (departmentId) => {
    setSelectedDepartment(departmentId);
    setError('');

    setLoading(true);
    try {
      const result = await selectStudentClassAndDepartment(selectedClass, departmentId);
      if (result.success) {
        navigate('/student/dashboard');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to complete selection. Please try again.');
    }
    setLoading(false);
  };

  const handleBack = () => {
    setStep(1);
    setSelectedDepartment('');
  };

  // Group departments by type
  const tradeDepartments = availableDepartments.filter(dept =>
    ['sod', 'wod', 'buc', 'fashion'].includes(dept.id.toLowerCase())
  );

  return (
    <div className="department-selection">
      <div className="department-container">
        <div className="department-header">
          <div className="user-info">
            <img src={user?.avatar} alt={user?.name} className="user-avatar" />
            <div>
              <h1>Welcome, {user?.name}</h1>
              <p>
                {step === 1 
                  ? 'Please select your class level to continue' 
                  : 'Now select your department'}
              </p>
            </div>
          </div>
          
          {/* Progress Indicator */}
          <div className="progress-steps">
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <span>Select Class</span>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <span>Select Department</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {/* Step 1: Class Selection */}
        {step === 1 && (
          <div className="departments-section">
            <div className="department-group">
              <h2 className="group-title">
                <GraduationCap size={24} />
                Choose Your Class Level
              </h2>
              <div className="departments-grid">
                {classes.map((classItem) => (
                  <div
                    key={classItem.id}
                    className={`department-card ${selectedClass === classItem.id ? 'selected' : ''}`}
                    onClick={() => !loading && handleClassSelect(classItem.id)}
                  >
                    <div className="department-icon" style={{ backgroundColor: '#4F46E5' }}>
                      <span style={{ fontSize: '2rem' }}>{classItem.icon}</span>
                    </div>
                    <div className="department-info">
                      <h3>{classItem.name}</h3>
                      <p>{classItem.description}</p>
                    </div>
                    {selectedClass === classItem.id && (
                      <CheckCircle size={20} color="#4F46E5" className="selected-icon" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Department Selection */}
        {step === 2 && (
          <div className="departments-section">
            <div className="selection-summary">
              <div className="summary-item">
                <span className="summary-label">Selected Class:</span>
                <span className="summary-value">{classes.find(c => c.id === selectedClass)?.name}</span>
                <button className="btn-link" onClick={handleBack}>Change</button>
              </div>
            </div>

            <div className="department-group">
              <h2 className="group-title">
                <BookOpen size={24} />
                Choose Your Department
              </h2>
              <div className="departments-grid">
                {tradeDepartments.map((department) => (
                  <div
                    key={department.id}
                    className={`department-card ${selectedDepartment === department.id ? 'selected' : ''}`}
                    onClick={() => !loading && handleDepartmentSelect(department.id)}
                    style={{
                      borderColor: selectedDepartment === department.id ? department.color : undefined
                    }}
                  >
                    <div className="department-icon" style={{ backgroundColor: department.color }}>
                      <span>{department.icon}</span>
                    </div>
                    <div className="department-info">
                      <h3>{department.name}</h3>
                      <p>{department.description}</p>
                    </div>
                    {selectedDepartment === department.id && (
                      <CheckCircle size={20} color={department.color} className="selected-icon" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner">Setting up your dashboard...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentClassSelection;

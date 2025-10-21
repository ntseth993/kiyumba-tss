// src/components/DepartmentSelection.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import './DepartmentSelection.css';

const DepartmentSelection = () => {
  const { user, selectTeacherDepartment, availableDepartments } = useAuth();
  const navigate = useNavigate();
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDepartmentSelect = async (departmentId) => {
    setSelectedDepartment(departmentId);
    setError('');

    setLoading(true);
    try {
      const result = await selectTeacherDepartment(departmentId);
      if (result.success) {
        navigate('/teacher/dashboard');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to select department. Please try again.');
    }
    setLoading(false);
  };

  // Group departments by type
  const tradeDepartments = (availableDepartments || []).filter(dept =>
    ['SOD', 'WOD', 'BUC', 'FASHION'].includes(dept.id.toUpperCase())
  );

  const generalDepartments = (availableDepartments || []).filter(dept =>
    !['SOD', 'WOD', 'BUC', 'FASHION'].includes(dept.id.toUpperCase())
  );

  return (
    <div className="department-selection">
      <div className="department-container">
        <div className="department-header">
          <div className="user-info">
            <img src={user?.avatar} alt={user?.name} className="user-avatar" />
            <div>
              <h1>Welcome, {user?.name}</h1>
              <p>Please select your teaching department to continue</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div className="departments-section">
          {/* Trade Departments */}
          <div className="department-group">
            <h2 className="group-title">Trade Departments</h2>
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

          {/* General Subjects */}
          <div className="department-group">
            <h2 className="group-title">General Subjects</h2>
            <div className="departments-grid">
              {generalDepartments.map((department) => (
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

        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner">Setting up your department...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentSelection;

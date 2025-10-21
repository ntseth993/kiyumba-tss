import { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Download,
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  Settings,
  TrendingUp,
  Calculator
} from 'lucide-react';

const AccountantFeeManagement = () => {
  const [feeStructures, setFeeStructures] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [showFeeForm, setShowFeeForm] = useState(false);
  const [showStudentAssignment, setShowStudentAssignment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');

  useEffect(() => {
    loadFeeData();
  }, []);

  const loadFeeData = () => {
    // Mock fee structures data
    const mockFeeStructures = [
      {
        id: 1,
        name: 'Senior 6 Tuition Fee',
        department: 'SOD',
        class: 'L6',
        amount: 150000,
        description: 'Annual tuition fee for Senior 6 students',
        dueDate: '2024-09-15',
        lateFee: 5000,
        installmentAllowed: true,
        maxInstallments: 3,
        status: 'active',
        studentsAssigned: 45,
        totalCollected: 6750000,
        outstanding: 0
      },
      {
        id: 2,
        name: 'Fashion Design Course Fee',
        department: 'Fashion',
        class: 'L5',
        amount: 125000,
        description: 'Course fee for Fashion Design program',
        dueDate: '2024-09-15',
        lateFee: 4000,
        installmentAllowed: true,
        maxInstallments: 2,
        status: 'active',
        studentsAssigned: 32,
        totalCollected: 4000000,
        outstanding: 0
      },
      {
        id: 3,
        name: 'Wood Technology Lab Fee',
        department: 'Wood Technology',
        class: 'L4',
        amount: 80000,
        description: 'Laboratory and materials fee',
        dueDate: '2024-09-15',
        lateFee: 3000,
        installmentAllowed: false,
        maxInstallments: 1,
        status: 'active',
        studentsAssigned: 28,
        totalCollected: 2240000,
        outstanding: 0
      },
      {
        id: 4,
        name: 'BUC Registration Fee',
        department: 'BUC',
        class: 'L3',
        amount: 60000,
        description: 'Registration and administrative fee',
        dueDate: '2024-09-15',
        lateFee: 2000,
        installmentAllowed: true,
        maxInstallments: 2,
        status: 'inactive',
        studentsAssigned: 0,
        totalCollected: 0,
        outstanding: 0
      }
    ];

    // Mock students data for assignment
    const mockStudents = [
      { id: 1, name: 'John Doe', studentId: 'STU001', class: 'L6', department: 'SOD', currentFees: [] },
      { id: 2, name: 'Jane Smith', studentId: 'STU002', class: 'L5', department: 'Fashion', currentFees: [] },
      { id: 3, name: 'Mike Johnson', studentId: 'STU003', class: 'L4', department: 'Wood Technology', currentFees: [] },
      { id: 4, name: 'Sarah Wilson', studentId: 'STU004', class: 'L3', department: 'BUC', currentFees: [] }
    ];

    setFeeStructures(mockFeeStructures);
    setStudents(mockStudents);
    setLoading(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getStatusBadge = (status) => {
    return status === 'active' ? 'Active' : 'Inactive';
  };

  const getStatusClass = (status) => {
    return `status-badge ${status}`;
  };

  const filteredStructures = feeStructures.filter(structure => {
    const matchesSearch = structure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         structure.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'All' || structure.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleCreateFeeStructure = (newStructure) => {
    const structure = {
      id: feeStructures.length + 1,
      ...newStructure,
      status: 'active',
      studentsAssigned: 0,
      totalCollected: 0,
      outstanding: 0
    };
    setFeeStructures([...feeStructures, structure]);
    setShowFeeForm(false);
  };

  const handleEditFeeStructure = (updatedStructure) => {
    setFeeStructures(feeStructures.map(s =>
      s.id === updatedStructure.id ? updatedStructure : s
    ));
  };

  const handleDeleteFeeStructure = (id) => {
    setFeeStructures(feeStructures.filter(s => s.id !== id));
  };

  const handleAssignStudents = (structureId, studentIds) => {
    setFeeStructures(feeStructures.map(s =>
      s.id === structureId
        ? { ...s, studentsAssigned: s.studentsAssigned + studentIds.length }
        : s
    ));
  };

  if (loading) {
    return (
      <div className="accountant-fee-management">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading fee management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="accountant-fee-management">
      {/* Header */}
      <div className="fee-header">
        <div className="header-content">
          <DollarSign size={28} />
          <div>
            <h2>Fee Management System</h2>
            <p>Manage fee structures, assignments, and collections</p>
          </div>
        </div>

        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowFeeForm(true)}>
            <Plus size={16} />
            Create Fee Structure
          </button>
          <button className="btn btn-secondary">
            <Download size={16} />
            Export Fee Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="fee-summary-grid">
        <div className="summary-card active-fees">
          <div className="card-icon">
            <DollarSign size={24} color="#10B981" />
          </div>
          <div className="card-content">
            <h3>{feeStructures.filter(f => f.status === 'active').length}</h3>
            <p>Active Fee Structures</p>
          </div>
        </div>

        <div className="summary-card total-students">
          <div className="card-icon">
            <Users size={24} color="#4F46E5" />
          </div>
          <div className="card-content">
            <h3>{formatNumber(feeStructures.reduce((sum, f) => sum + f.studentsAssigned, 0))}</h3>
            <p>Students Assigned</p>
          </div>
        </div>

        <div className="summary-card total-collected">
          <div className="card-icon">
            <TrendingUp size={24} color="#8B5CF6" />
          </div>
          <div className="card-content">
            <h3>{formatCurrency(feeStructures.reduce((sum, f) => sum + f.totalCollected, 0))}</h3>
            <p>Total Collected</p>
          </div>
        </div>

        <div className="summary-card outstanding">
          <div className="card-icon">
            <AlertCircle size={24} color="#F59E0B" />
          </div>
          <div className="card-content">
            <h3>{formatCurrency(feeStructures.reduce((sum, f) => sum + f.outstanding, 0))}</h3>
            <p>Outstanding Amount</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="fee-controls">
        <div className="search-box">
          <Search size={20} color="#64748b" />
          <input
            type="text"
            placeholder="Search fee structures..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="department-filter"
        >
          <option value="All">All Departments</option>
          <option value="SOD">SOD</option>
          <option value="Fashion">Fashion</option>
          <option value="BUC">BUC</option>
          <option value="Wood Technology">Wood Technology</option>
        </select>
      </div>

      {/* Fee Structures Table */}
      <div className="fee-structures-section">
        <h3>Fee Structures</h3>
        <div className="table-container">
          <table className="fee-table">
            <thead>
              <tr>
                <th>Fee Structure</th>
                <th>Department</th>
                <th>Class</th>
                <th>Amount</th>
                <th>Students</th>
                <th>Collected</th>
                <th>Outstanding</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStructures.map((structure) => (
                <tr key={structure.id}>
                  <td>
                    <div className="fee-info">
                      <h4>{structure.name}</h4>
                      <p>{structure.description}</p>
                    </div>
                  </td>
                  <td>
                    <span className="department-badge">{structure.department}</span>
                  </td>
                  <td>{structure.class}</td>
                  <td className="amount-cell">
                    {formatCurrency(structure.amount)}
                    {structure.lateFee > 0 && (
                      <span className="late-fee">+{formatCurrency(structure.lateFee)} late fee</span>
                    )}
                  </td>
                  <td>{formatNumber(structure.studentsAssigned)}</td>
                  <td className="collected-cell">
                    {formatCurrency(structure.totalCollected)}
                  </td>
                  <td className="outstanding-cell">
                    {formatCurrency(structure.outstanding)}
                  </td>
                  <td>
                    <span className={getStatusClass(structure.status)}>
                      {getStatusBadge(structure.status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon"
                        onClick={() => setSelectedStructure(structure)}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => setShowStudentAssignment(true)}
                        title="Assign Students"
                      >
                        <Users size={16} />
                      </button>
                      <button className="btn-icon" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => handleDeleteFeeStructure(structure.id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fee Structure Form Modal */}
      {showFeeForm && (
        <FeeStructureForm
          onClose={() => setShowFeeForm(false)}
          onSave={handleCreateFeeStructure}
        />
      )}

      {/* Student Assignment Modal */}
      {showStudentAssignment && (
        <StudentAssignmentModal
          students={students}
          onClose={() => setShowStudentAssignment(false)}
          onAssign={handleAssignStudents}
        />
      )}

      {/* Fee Structure Details Modal */}
      {selectedStructure && (
        <FeeStructureDetails
          structure={selectedStructure}
          onClose={() => setSelectedStructure(null)}
          onEdit={handleEditFeeStructure}
        />
      )}
    </div>
  );
};

// Fee Structure Form Component
const FeeStructureForm = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    department: 'SOD',
    class: 'L3',
    amount: '',
    description: '',
    dueDate: '',
    lateFee: 0,
    installmentAllowed: false,
    maxInstallments: 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create Fee Structure</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Fee Structure Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Department</label>
              <select
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
              >
                <option value="SOD">SOD</option>
                <option value="Fashion">Fashion</option>
                <option value="BUC">BUC</option>
                <option value="Wood Technology">Wood Technology</option>
              </select>
            </div>

            <div className="form-group">
              <label>Class</label>
              <select
                value={formData.class}
                onChange={(e) => handleChange('class', e.target.value)}
              >
                <option value="L3">L3</option>
                <option value="L4">L4</option>
                <option value="L5">L5</option>
                <option value="L6">L6</option>
              </select>
            </div>

            <div className="form-group">
              <label>Amount (RWF)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleChange('amount', Number(e.target.value))}
                required
              />
            </div>

            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Late Fee (RWF)</label>
              <input
                type="number"
                value={formData.lateFee}
                onChange={(e) => handleChange('lateFee', Number(e.target.value))}
              />
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows="3"
              />
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.installmentAllowed}
                  onChange={(e) => handleChange('installmentAllowed', e.target.checked)}
                />
                Allow Installment Payments
              </label>
            </div>

            {formData.installmentAllowed && (
              <div className="form-group">
                <label>Max Installments</label>
                <select
                  value={formData.maxInstallments}
                  onChange={(e) => handleChange('maxInstallments', Number(e.target.value))}
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                </select>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Fee Structure
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Student Assignment Modal Component
const StudentAssignmentModal = ({ students, onClose, onAssign }) => {
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [structureId] = useState(1); // In real app, this would come from props

  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAssign = () => {
    onAssign(structureId, selectedStudents);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h2>Assign Students to Fee Structure</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="students-list">
            {students.map((student) => (
              <div key={student.id} className="student-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => handleStudentToggle(student.id)}
                  />
                  <div className="student-info">
                    <h4>{student.name}</h4>
                    <p>{student.studentId} • {student.class} • {student.department}</p>
                  </div>
                </label>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAssign}
              disabled={selectedStudents.length === 0}
            >
              Assign {selectedStudents.length} Students
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Fee Structure Details Modal Component
const FeeStructureDetails = ({ structure, onClose, onEdit }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Fee Structure Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="details-grid">
            <div className="detail-item">
              <label>Structure Name</label>
              <p>{structure.name}</p>
            </div>
            <div className="detail-item">
              <label>Department</label>
              <p>{structure.department}</p>
            </div>
            <div className="detail-item">
              <label>Class</label>
              <p>{structure.class}</p>
            </div>
            <div className="detail-item">
              <label>Amount</label>
              <p>{formatCurrency(structure.amount)}</p>
            </div>
            <div className="detail-item">
              <label>Due Date</label>
              <p>{new Date(structure.dueDate).toLocaleDateString()}</p>
            </div>
            <div className="detail-item">
              <label>Status</label>
              <p>
                <span className={`status-badge ${structure.status}`}>
                  {structure.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>
          </div>

          <div className="structure-info">
            <h4>Payment Options</h4>
            <div className="payment-options">
              <div className="option-item">
                <span>Late Fee:</span>
                <strong>{formatCurrency(structure.lateFee)}</strong>
              </div>
              <div className="option-item">
                <span>Installments:</span>
                <strong>{structure.installmentAllowed ? `Up to ${structure.maxInstallments}` : 'Not Allowed'}</strong>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button className="btn btn-primary">
              <Edit size={16} />
              Edit Structure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountantFeeManagement;

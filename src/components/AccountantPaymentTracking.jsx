import { useState, useEffect } from 'react';
import { comprehensiveStudentsService } from '../services/comprehensiveStudentsService';
import { DollarSign, CreditCard, AlertCircle, CheckCircle, Eye, X, Filter } from 'lucide-react';
import './AccountantPaymentTracking.css';

const AccountantPaymentTracking = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  
  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [students, selectedClass, selectedDepartment, paymentFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const allStudents = await comprehensiveStudentsService.getAllStudents();
      const stats = await comprehensiveStudentsService.getStatistics();
      setStudents(allStudents);
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...students];
    
    if (selectedClass !== 'All') {
      filtered = filtered.filter(s => s.class === selectedClass);
    }
    
    if (selectedDepartment !== 'All') {
      filtered = filtered.filter(s => s.department === selectedDepartment);
    }
    
    if (paymentFilter !== 'All') {
      filtered = filtered.filter(s => s.payments?.status === paymentFilter);
    }
    
    setFilteredStudents(filtered);
  };

  const handleAddPayment = (student) => {
    setSelectedStudent(student);
    setPaymentAmount('');
    setShowPaymentModal(true);
  };

  const handleSavePayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (amount > selectedStudent.payments.balance) {
      alert(`Payment amount cannot exceed balance: ${selectedStudent.payments.balance.toLocaleString()} RWF`);
      return;
    }

    const result = await comprehensiveStudentsService.updatePayment(selectedStudent.id, amount);
    if (result.success) {
      alert(`Payment of ${amount.toLocaleString()} RWF recorded successfully for ${selectedStudent.name}`);
      setShowPaymentModal(false);
      setPaymentAmount('');
      await loadData();
    } else {
      alert('Failed to record payment: ' + result.error);
    }
  };

  const formatCurrency = (amount) => {
    return `${amount.toLocaleString()} RWF`;
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'Paid': return '#10B981';
      case 'Partial': return '#F59E0B';
      case 'Unpaid': return '#EF4444';
      default: return '#64748b';
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading payment data...</div>;
  }

  return (
    <div className="accountant-container">
      <div className="accountant-header">
        <div>
          <h2>
            <DollarSign size={24} />
            Payment Tracking & Management
          </h2>
          <p>Monitor and manage student fee payments</p>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="payment-stats-grid">
          <div className="payment-stat-card paid">
            <div className="stat-icon">
              <CheckCircle size={28} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Fully Paid</p>
              <h3>{statistics.paymentStats.paid}</h3>
              <span className="stat-subtitle">Students</span>
            </div>
          </div>

          <div className="payment-stat-card partial">
            <div className="stat-icon">
              <CreditCard size={28} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Partial Payment</p>
              <h3>{statistics.paymentStats.partial}</h3>
              <span className="stat-subtitle">Students</span>
            </div>
          </div>

          <div className="payment-stat-card unpaid">
            <div className="stat-icon">
              <AlertCircle size={28} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Unpaid</p>
              <h3>{statistics.paymentStats.unpaid}</h3>
              <span className="stat-subtitle">Students</span>
            </div>
          </div>

          <div className="payment-stat-card balance">
            <div className="stat-icon">
              <DollarSign size={28} />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Outstanding</p>
              <h3>{formatCurrency(statistics.paymentStats.totalBalance)}</h3>
              <span className="stat-subtitle">Balance</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section card">
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={20} />
            <span style={{ fontWeight: '600' }}>Filters:</span>
          </div>
          
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Classes</option>
            <option value="L3">L3</option>
            <option value="L4">L4</option>
            <option value="L5">L5</option>
          </select>

          <select 
            value={selectedDepartment} 
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Departments</option>
            <option value="SOD">SOD</option>
            <option value="Fashion">Fashion</option>
            <option value="BUC">BUC</option>
            <option value="Wood Technology">Wood Technology</option>
          </select>

          <select 
            value={paymentFilter} 
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Payment Status</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Unpaid">Unpaid</option>
          </select>

          <div style={{ marginLeft: 'auto', fontWeight: '600', color: '#667eea' }}>
            Showing {filteredStudents.length} of {students.length} students
          </div>
        </div>
      </div>

      {/* Payment Table */}
      <div className="table-container">
        <table className="payment-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Class</th>
              <th>Department</th>
              <th>Tuition Fee</th>
              <th>Paid Amount</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Last Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>
                  No students found with current filters
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.studentId}</td>
                  <td className="student-name">{student.name}</td>
                  <td>{student.class}</td>
                  <td>{student.department}</td>
                  <td>{formatCurrency(student.payments?.tuitionFee || 0)}</td>
                  <td>{formatCurrency(student.payments?.paidAmount || 0)}</td>
                  <td>
                    <strong style={{ color: student.payments?.balance > 0 ? '#EF4444' : '#10B981' }}>
                      {formatCurrency(student.payments?.balance || 0)}
                    </strong>
                  </td>
                  <td>
                    <span 
                      className="payment-status-badge"
                      style={{ 
                        backgroundColor: `${getPaymentStatusColor(student.payments?.status)}15`,
                        color: getPaymentStatusColor(student.payments?.status)
                      }}
                    >
                      {student.payments?.status || 'Unknown'}
                    </span>
                  </td>
                  <td>{student.payments?.lastPayment || 'Never'}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleAddPayment(student)}
                      disabled={student.payments?.balance === 0}
                      title="Add Payment"
                    >
                      <CreditCard size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Record Payment - {selectedStudent.name}</h2>
              <button className="close-btn" onClick={() => setShowPaymentModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="payment-info-box">
                <div className="info-row">
                  <span>Student ID:</span>
                  <strong>{selectedStudent.studentId}</strong>
                </div>
                <div className="info-row">
                  <span>Class:</span>
                  <strong>{selectedStudent.class} - {selectedStudent.department}</strong>
                </div>
                <div className="info-row">
                  <span>Tuition Fee:</span>
                  <strong>{formatCurrency(selectedStudent.payments.tuitionFee)}</strong>
                </div>
                <div className="info-row">
                  <span>Already Paid:</span>
                  <strong style={{ color: '#10B981' }}>{formatCurrency(selectedStudent.payments.paidAmount)}</strong>
                </div>
                <div className="info-row">
                  <span>Outstanding Balance:</span>
                  <strong style={{ color: '#EF4444' }}>{formatCurrency(selectedStudent.payments.balance)}</strong>
                </div>
              </div>

              <label style={{ marginTop: '1.5rem', display: 'block' }}>
                <strong>Payment Amount (RWF)</strong>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="0"
                  max={selectedStudent.payments.balance}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    borderRadius: '8px', 
                    border: '2px solid #e5e7eb', 
                    marginTop: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
              </label>

              <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                  New balance after payment: <strong style={{ color: '#667eea' }}>
                    {formatCurrency(selectedStudent.payments.balance - (parseFloat(paymentAmount) || 0))}
                  </strong>
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowPaymentModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSavePayment}>
                <CreditCard size={16} />
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountantPaymentTracking;

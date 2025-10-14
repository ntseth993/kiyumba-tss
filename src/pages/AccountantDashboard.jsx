import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chat from '../components/Chat';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Calculator, 
  FileText, 
  Calendar, 
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import ProfilePictureUpload from '../components/ProfilePictureUpload';
import { comprehensiveStudentsService } from '../services/comprehensiveStudentsService';
import './StaffDashboard.css';

const AccountantDashboard = () => {
  const { user } = useAuth();
  const [financialStats, setFinancialStats] = useState({
    totalRevenue: 1250000,
    totalExpenses: 850000,
    pendingPayments: 45000,
    completedTransactions: 234
  });
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [showUnpaidOnly, setShowUnpaidOnly] = useState(false);
  const [expandedSections, setExpandedSections] = useState({ students: false });
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // Load students
    const allStudents = await comprehensiveStudentsService.getAllStudents();
    setStudents(allStudents);
    
    // Calculate financial stats from student payments
    const totalRevenue = allStudents.reduce((sum, s) => sum + (s.payments?.paidAmount || 0), 0);
    const pendingPayments = allStudents.reduce((sum, s) => sum + (s.payments?.balance || 0), 0);
    setFinancialStats(prev => ({ ...prev, totalRevenue, pendingPayments }));
    
    // Mock recent transactions
    setRecentTransactions([
      { 
        id: 1, 
        type: 'income', 
        description: 'School fees - Senior 6', 
        amount: 150000, 
        date: '2024-04-15',
        status: 'completed'
      },
      { 
        id: 2, 
        type: 'expense', 
        description: 'Laboratory equipment', 
        amount: 85000, 
        date: '2024-04-14',
        status: 'completed'
      },
      { 
        id: 3, 
        type: 'expense', 
        description: 'Teacher salaries', 
        amount: 120000, 
        date: '2024-04-13',
        status: 'pending'
      },
      { 
        id: 4, 
        type: 'income', 
        description: 'Registration fees', 
        amount: 50000, 
        date: '2024-04-12',
        status: 'completed'
      }
    ]);
  };

  useEffect(() => {
    applyFilters();
  }, [students, selectedClass, selectedDepartment, showUnpaidOnly]);

  const applyFilters = () => {
    let filtered = [...students];
    if (selectedClass !== 'All') {
      filtered = filtered.filter(s => s.class === selectedClass);
    }
    if (selectedDepartment !== 'All') {
      filtered = filtered.filter(s => s.department === selectedDepartment);
    }
    if (showUnpaidOnly) {
      filtered = filtered.filter(s => s.payments && s.payments.balance > 0);
    }
    setFilteredStudents(filtered);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const stats = [
    { 
      id: 1, 
      label: 'Total Revenue', 
      value: formatCurrency(financialStats.totalRevenue), 
      icon: TrendingUp, 
      color: '#10B981', 
      change: '+12% from last month' 
    },
    { 
      id: 2, 
      label: 'Total Expenses', 
      value: formatCurrency(financialStats.totalExpenses), 
      icon: TrendingDown, 
      color: '#EF4444', 
      change: '+8% from last month' 
    },
    { 
      id: 3, 
      label: 'Pending Payments', 
      value: formatCurrency(financialStats.pendingPayments), 
      icon: Clock, 
      color: '#F59E0B', 
      change: 'Needs attention' 
    },
    { 
      id: 4, 
      label: 'Transactions', 
      value: financialStats.completedTransactions.toString(), 
      icon: Calculator, 
      color: '#4F46E5', 
      change: 'This month' 
    },
  ];

  return (
    <div className="staff-dashboard">
      <Navbar />
      
      <div className="dashboard-container">
        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.id} className="stat-card card">
              <div className="stat-icon" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon size={28} color={stat.color} />
              </div>
              <div className="stat-content">
                <p className="stat-label">{stat.label}</p>
                <div className="stat-value-row">
                  <h3>{stat.value}</h3>
                  <span className="stat-change positive">
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="staff-grid">
          <div className="staff-section">
            <div className="section-header">
              <h2>
                <Calculator size={24} />
                Recent Transactions
              </h2>
              <button className="btn btn-outline btn-sm">View All</button>
            </div>
            <div className="transactions-list">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="transaction-item card">
                  <div className="transaction-header">
                    <div className="transaction-icon">
                      {transaction.type === 'income' ? (
                        <TrendingUp size={20} color="#10B981" />
                      ) : (
                        <TrendingDown size={20} color="#EF4444" />
                      )}
                    </div>
                    <div className="transaction-details">
                      <span className="transaction-description">{transaction.description}</span>
                      <span className="transaction-date">
                        {new Date(transaction.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="transaction-right">
                      <span className={`transaction-amount ${transaction.type}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                      <span className={`status-badge ${transaction.status}`}>
                        {transaction.status === 'completed' ? (
                          <><CheckCircle size={14} /> Completed</>
                        ) : (
                          <><AlertCircle size={14} /> Pending</>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="staff-section">
            <div className="section-header">
              <h2>
                <DollarSign size={24} />
                Financial Summary
              </h2>
              <button className="btn btn-outline btn-sm">Generate Report</button>
            </div>
            <div className="financial-summary">
              <div className="summary-card card">
                <div className="summary-header">
                  <DollarSign size={20} />
                  <span>Monthly Budget</span>
                </div>
                <div className="summary-content">
                  <div className="budget-progress">
                    <div className="budget-bar">
                      <div 
                        className="budget-fill" 
                        style={{ width: `${(financialStats.totalExpenses / 1500000) * 100}%` }}
                      ></div>
                    </div>
                    <div className="budget-text">
                      <span className="budget-used">
                        {formatCurrency(financialStats.totalExpenses)}
                      </span>
                      <span className="budget-total">
                        / {formatCurrency(1500000)}
                      </span>
                    </div>
                  </div>
                  <p className="budget-status">
                    {((financialStats.totalExpenses / 1500000) * 100).toFixed(1)}% of monthly budget used
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Student Payments Section */}
          <div className="staff-section" style={{ gridColumn: '1 / -1' }}>
            <div className="section-header" style={{ cursor: 'pointer' }}>
              <div className="section-title" onClick={() => toggleSection('students')}>
                <Users size={24} />
                <h2>Student Payment Tracking - Accountant</h2>
              </div>
              <button className="toggle-btn" onClick={() => toggleSection('students')}>
                {expandedSections.students ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
            
            {expandedSections.students && (
              <div className="section-content">
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <select 
                    value={selectedClass} 
                    onChange={(e) => setSelectedClass(e.target.value)}
                    style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
                  >
                    <option value="All">All Classes</option>
                    <option value="L3">L3</option>
                    <option value="L4">L4</option>
                    <option value="L5">L5</option>
                  </select>

                  <select 
                    value={selectedDepartment} 
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
                  >
                    <option value="All">All Departments</option>
                    <option value="SOD">SOD</option>
                    <option value="Fashion">Fashion</option>
                    <option value="BUC">BUC</option>
                    <option value="Wood Technology">Wood Technology</option>
                  </select>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={showUnpaidOnly}
                      onChange={(e) => setShowUnpaidOnly(e.target.checked)}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span>Unpaid/Partial Only</span>
                  </label>

                  <div style={{ marginLeft: 'auto', fontWeight: '600', color: '#667eea' }}>
                    Showing {filteredStudents.length} of {students.length} students
                  </div>
                </div>

                <div className="table-container">
                  <table className="data-table">
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
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>
                            No students found
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
                            <td style={{ color: '#10B981', fontWeight: '600' }}>
                              {formatCurrency(student.payments?.paidAmount || 0)}
                            </td>
                            <td style={{ color: student.payments?.balance > 0 ? '#EF4444' : '#10B981', fontWeight: '600' }}>
                              {formatCurrency(student.payments?.balance || 0)}
                            </td>
                            <td>
                              <span className={`status-badge ${
                                student.payments?.status === 'Paid' ? 'active' : 
                                student.payments?.status === 'Partial' ? 'warning' : 'inactive'
                              }`}>
                                {student.payments?.status || 'Unpaid'}
                              </span>
                            </td>
                            <td>{student.payments?.lastPayment || 'N/A'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Chat />
      <Footer />
    </div>
  );
};

export default AccountantDashboard;

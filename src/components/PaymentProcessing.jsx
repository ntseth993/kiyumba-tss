import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  Smartphone, 
  Building, 
  Wallet,
  Receipt,
  Download,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { comprehensiveStudentsService } from '../services/comprehensiveStudentsService';
import { paymentService } from '../services/paymentService';
import './PaymentProcessing.css';

const PaymentProcessing = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'cash',
    reference: '',
    description: 'Tuition Fee Payment',
    term: 'Term 1'
  });
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [students, searchTerm, filterStatus]);

  const loadData = async () => {
    const allStudents = await comprehensiveStudentsService.getAllStudents();
    setStudents(allStudents);
    
    const stats = await paymentService.getPaymentStatistics();
    setStatistics(stats);
    
    const transactions = await paymentService.getAllTransactions();
    setRecentTransactions(transactions.slice(-10).reverse());
  };

  const applyFilters = () => {
    let filtered = [...students];
    
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'All') {
      filtered = filtered.filter(s => s.payments?.status === filterStatus);
    }
    
    setFilteredStudents(filtered);
  };

  const handleProcessPayment = (student) => {
    setSelectedStudent(student);
    setPaymentForm({
      ...paymentForm,
      amount: student.payments?.balance || 0
    });
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = async () => {
    if (!paymentForm.amount || paymentForm.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    const paymentData = {
      studentId: selectedStudent.id,
      amount: parseFloat(paymentForm.amount),
      paymentMethod: paymentForm.paymentMethod,
      reference: paymentForm.reference || `PAY-${Date.now()}`,
      description: paymentForm.description,
      term: paymentForm.term,
      processedBy: 'Accountant'
    };
    
    const result = await paymentService.processPayment(paymentData);
    
    if (result.success) {
      alert('Payment processed successfully!');
      
      // Generate and show receipt
      const receiptResult = await paymentService.generateReceipt(result.transaction.id);
      if (receiptResult.success) {
        setCurrentReceipt(receiptResult.receipt);
        setShowReceiptModal(true);
      }
      
      setShowPaymentModal(false);
      setPaymentForm({
        amount: '',
        paymentMethod: 'cash',
        reference: '',
        description: 'Tuition Fee Payment',
        term: 'Term 1'
      });
      
      await loadData();
    } else {
      alert('Failed to process payment: ' + result.error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash': return <Wallet size={18} />;
      case 'mobile_money': return <Smartphone size={18} />;
      case 'bank_transfer': return <Building size={18} />;
      case 'card': return <CreditCard size={18} />;
      default: return <DollarSign size={18} />;
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="payment-processing">
      <div className="payment-header">
        <div className="header-left">
          <DollarSign size={32} />
          <div>
            <h2>Payment Processing</h2>
            <p>Process student payments and manage transactions</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="payment-stats">
          <div className="stat-card revenue">
            <DollarSign size={24} />
            <div>
              <span className="stat-value">{formatCurrency(statistics.totalRevenue)}</span>
              <span className="stat-label">Total Revenue</span>
            </div>
          </div>
          <div className="stat-card transactions">
            <Receipt size={24} />
            <div>
              <span className="stat-value">{statistics.transactionCount}</span>
              <span className="stat-label">Transactions</span>
            </div>
          </div>
          <div className="stat-card average">
            <CreditCard size={24} />
            <div>
              <span className="stat-value">{formatCurrency(statistics.averageTransaction)}</span>
              <span className="stat-label">Average Payment</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="payment-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="All">All Status</option>
          <option value="Paid">Paid</option>
          <option value="Partial">Partial</option>
          <option value="Unpaid">Unpaid</option>
        </select>
      </div>

      {/* Students Payment Table */}
      <div className="payment-table-container">
        <h3>Student Payment Status</h3>
        <table className="payment-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Class</th>
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
                <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>
                  No students found
                </td>
              </tr>
            ) : (
              filteredStudents.map(student => (
                <tr key={student.id}>
                  <td>{student.studentId}</td>
                  <td className="student-name">{student.name}</td>
                  <td>{student.class}</td>
                  <td>{formatCurrency(student.payments?.tuitionFee || 0)}</td>
                  <td className="paid-amount">{formatCurrency(student.payments?.paidAmount || 0)}</td>
                  <td className={`balance ${student.payments?.balance > 0 ? 'unpaid' : 'paid'}`}>
                    {formatCurrency(student.payments?.balance || 0)}
                  </td>
                  <td>
                    <span className={`status-badge ${student.payments?.status?.toLowerCase() || 'unpaid'}`}>
                      {student.payments?.status || 'Unpaid'}
                    </span>
                  </td>
                  <td>{student.payments?.lastPayment || 'N/A'}</td>
                  <td>
                    <button
                      className="btn-process"
                      onClick={() => handleProcessPayment(student)}
                      disabled={student.payments?.balance === 0}
                    >
                      <CreditCard size={14} />
                      Process
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Recent Transactions */}
      <div className="recent-transactions">
        <h3>Recent Transactions</h3>
        <div className="transactions-list">
          {recentTransactions.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              No transactions yet
            </p>
          ) : (
            recentTransactions.map(transaction => (
              <div key={transaction.id} className="transaction-card">
                <div className="transaction-icon">
                  {getPaymentMethodIcon(transaction.paymentMethod)}
                </div>
                <div className="transaction-details">
                  <span className="transaction-ref">{transaction.receiptNumber}</span>
                  <span className="transaction-date">
                    {new Date(transaction.processedAt).toLocaleString()}
                  </span>
                </div>
                <div className="transaction-amount">
                  {formatCurrency(transaction.amount)}
                </div>
                <span className={`transaction-status ${transaction.status}`}>
                  {transaction.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Process Payment</h2>
              <button className="close-btn" onClick={() => setShowPaymentModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="student-info">
                <h3>{selectedStudent.name}</h3>
                <p>ID: {selectedStudent.studentId} | Class: {selectedStudent.class}</p>
                <p className="balance-info">
                  Outstanding Balance: <strong>{formatCurrency(selectedStudent.payments?.balance || 0)}</strong>
                </p>
              </div>

              <div className="payment-form">
                <div className="form-group">
                  <label>Amount *</label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    placeholder="Enter amount"
                    min="0"
                    max={selectedStudent.payments?.balance || 0}
                  />
                </div>

                <div className="form-group">
                  <label>Payment Method *</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  >
                    <option value="cash">Cash</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="card">Card</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Reference Number</label>
                  <input
                    type="text"
                    value={paymentForm.reference}
                    onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                    placeholder="Optional reference number"
                  />
                </div>

                <div className="form-group">
                  <label>Term</label>
                  <select
                    value={paymentForm.term}
                    onChange={(e) => setPaymentForm({ ...paymentForm, term: e.target.value })}
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={paymentForm.description}
                    onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSubmitPayment}>
                <CheckCircle size={18} />
                Process Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && currentReceipt && (
        <div className="modal-overlay" onClick={() => setShowReceiptModal(false)}>
          <div className="modal-content receipt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Payment Receipt</h2>
              <button className="close-btn" onClick={() => setShowReceiptModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="receipt-content">
                <div className="receipt-header">
                  <h1>KIYUMBA TVET SCHOOL</h1>
                  <p>Official Payment Receipt</p>
                </div>
                
                <div className="receipt-info">
                  <div className="info-row">
                    <span>Receipt No:</span>
                    <strong>{currentReceipt.receiptNumber}</strong>
                  </div>
                  <div className="info-row">
                    <span>Date:</span>
                    <strong>{new Date(currentReceipt.date).toLocaleString()}</strong>
                  </div>
                </div>

                <div className="receipt-section">
                  <h3>Student Information</h3>
                  <div className="info-row">
                    <span>Student ID:</span>
                    <span>{currentReceipt.student.id}</span>
                  </div>
                  <div className="info-row">
                    <span>Name:</span>
                    <span>{currentReceipt.student.name}</span>
                  </div>
                  <div className="info-row">
                    <span>Class:</span>
                    <span>{currentReceipt.student.class}</span>
                  </div>
                  <div className="info-row">
                    <span>Department:</span>
                    <span>{currentReceipt.student.department}</span>
                  </div>
                </div>

                <div className="receipt-section">
                  <h3>Payment Details</h3>
                  <div className="info-row">
                    <span>Description:</span>
                    <span>{currentReceipt.payment.description}</span>
                  </div>
                  <div className="info-row">
                    <span>Payment Method:</span>
                    <span style={{ textTransform: 'capitalize' }}>
                      {currentReceipt.payment.method.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="info-row">
                    <span>Reference:</span>
                    <span>{currentReceipt.payment.reference}</span>
                  </div>
                  <div className="info-row amount-row">
                    <span>Amount Paid:</span>
                    <strong>{formatCurrency(currentReceipt.payment.amount)}</strong>
                  </div>
                  <div className="info-row">
                    <span>Remaining Balance:</span>
                    <strong>{formatCurrency(currentReceipt.balance)}</strong>
                  </div>
                </div>

                <div className="receipt-footer">
                  <p>Processed by: {currentReceipt.processedBy}</p>
                  <p className="receipt-note">
                    This is an official receipt. Please keep for your records.
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowReceiptModal(false)}>
                Close
              </button>
              <button className="btn btn-primary" onClick={handlePrintReceipt}>
                <Download size={18} />
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentProcessing;

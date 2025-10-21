import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DollarSign, Download, Calendar, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import { paymentService } from '../services/paymentService';
import './StudentPaymentView.css';

const StudentPaymentView = () => {
  const { user } = useAuth();
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [balance, setBalance] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalFees, setTotalFees] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    try {
      // Get student's payment history
      const history = await paymentService.getStudentPayments(user.studentId || user.email);
      
      // Calculate totals
      const paid = history.reduce((sum, payment) => sum + payment.amount, 0);
      const fees = 500000; // Total annual fees (example)
      const remaining = fees - paid;

      setPaymentHistory(history);
      setTotalPaid(paid);
      setTotalFees(fees);
      setBalance(remaining);
      setLoading(false);
    } catch (error) {
      console.error('Error loading payment data:', error);
      setLoading(false);
    }
  };

  const handleDownloadReceipt = (payment) => {
    // In a real app, this would generate and download a PDF receipt
    alert(`Receipt for payment ${payment.receiptNumber} will be downloaded`);
  };

  const getPaymentMethodIcon = (method) => {
    return <CreditCard size={18} />;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="student-payment-view">
        <div className="loading-state">Loading payment information...</div>
      </div>
    );
  }

  const paymentPercentage = (totalPaid / totalFees) * 100;

  return (
    <div className="student-payment-view">
      <div className="payment-header">
        <div className="header-content">
          <DollarSign size={32} />
          <div>
            <h2>My Payments</h2>
            <p>View your payment history and balance</p>
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="payment-summary-grid">
        <div className="summary-card total-fees">
          <div className="summary-icon">
            <DollarSign size={28} />
          </div>
          <div className="summary-content">
            <span className="summary-label">Total Fees</span>
            <strong className="summary-value">{formatCurrency(totalFees)}</strong>
            <span className="summary-subtitle">Annual fees</span>
          </div>
        </div>

        <div className="summary-card total-paid">
          <div className="summary-icon">
            <CheckCircle size={28} />
          </div>
          <div className="summary-content">
            <span className="summary-label">Total Paid</span>
            <strong className="summary-value">{formatCurrency(totalPaid)}</strong>
            <span className="summary-subtitle">{paymentPercentage.toFixed(1)}% completed</span>
          </div>
        </div>

        <div className="summary-card balance">
          <div className="summary-icon">
            <AlertCircle size={28} />
          </div>
          <div className="summary-content">
            <span className="summary-label">Balance</span>
            <strong className="summary-value">{formatCurrency(balance)}</strong>
            <span className={`summary-subtitle ${balance > 0 ? 'pending' : 'paid'}`}>
              {balance > 0 ? 'Payment pending' : 'Fully paid'}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Progress */}
      <div className="payment-progress-card">
        <h3>Payment Progress</h3>
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${Math.min(paymentPercentage, 100)}%` }}
            ></div>
          </div>
          <span className="progress-text">{paymentPercentage.toFixed(1)}% Paid</span>
        </div>
        <div className="progress-details">
          <span>Paid: {formatCurrency(totalPaid)}</span>
          <span>Remaining: {formatCurrency(balance)}</span>
        </div>
      </div>

      {/* Payment Alert */}
      {balance > 0 && (
        <div className="payment-alert">
          <AlertCircle size={20} />
          <div>
            <strong>Payment Reminder</strong>
            <p>You have an outstanding balance of {formatCurrency(balance)}. Please make a payment to avoid any academic holds.</p>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="payment-history">
        <h3>Payment History</h3>
        {paymentHistory.length === 0 ? (
          <div className="empty-state">
            <DollarSign size={48} color="#94a3b8" />
            <p>No payment records found</p>
          </div>
        ) : (
          <div className="payment-table-container">
            <table className="payment-table">
              <thead>
                <tr>
                  <th>Receipt No.</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Term</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      <span className="receipt-number">{payment.receiptNumber}</span>
                    </td>
                    <td>
                      <div className="date-cell">
                        <Calendar size={16} />
                        <span>{new Date(payment.date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td>
                      <strong className="amount-value">{formatCurrency(payment.amount)}</strong>
                    </td>
                    <td>
                      <div className="method-cell">
                        {getPaymentMethodIcon(payment.method)}
                        <span>{payment.method}</span>
                      </div>
                    </td>
                    <td>
                      <span className="term-badge">{payment.term}</span>
                    </td>
                    <td>
                      <span className="status-badge status-completed">
                        <CheckCircle size={14} />
                        Completed
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-download"
                        onClick={() => handleDownloadReceipt(payment)}
                      >
                        <Download size={14} />
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Information */}
      <div className="payment-info">
        <h3>Payment Information</h3>
        <div className="info-grid">
          <div className="info-card">
            <h4>Accepted Payment Methods</h4>
            <ul>
              <li>💵 Cash (at school office)</li>
              <li>📱 Mobile Money (MTN, Airtel)</li>
              <li>🏦 Bank Transfer</li>
              <li>💳 Credit/Debit Card</li>
            </ul>
          </div>
          <div className="info-card">
            <h4>Payment Schedule</h4>
            <ul>
              <li><strong>Term 1:</strong> Due by January 31</li>
              <li><strong>Term 2:</strong> Due by May 31</li>
              <li><strong>Term 3:</strong> Due by September 30</li>
            </ul>
          </div>
          <div className="info-card">
            <h4>Need Help?</h4>
            <p>Contact the Accounts Office:</p>
            <ul>
              <li>📧 accounts@kiyumba.edu</li>
              <li>📞 +250 XXX XXX XXX</li>
              <li>🏢 Administration Building</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPaymentView;

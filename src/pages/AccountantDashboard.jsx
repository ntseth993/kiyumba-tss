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
  Clock
} from 'lucide-react';
import './StaffDashboard.css';

const AccountantDashboard = () => {
  const { user } = useAuth();
  const [financialStats, setFinancialStats] = useState({
    totalRevenue: 1250000,
    totalExpenses: 850000,
    pendingPayments: 45000,
    completedTransactions: 234
  });

  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
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
        <div className="dashboard-header">
          <div className="welcome-section">
            <img src={user.avatar} alt={user.name} className="user-avatar" />
            <div>
              <h1>Welcome, {user.name}</h1>
              <p>Accountant Dashboard</p>
            </div>
          </div>
        </div>

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
        </div>
      </div>

      <Chat />
      <Footer />
    </div>
  );
};

export default AccountantDashboard;

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  FileText,
  Download,
  Filter,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';

const AccountantFinancialReports = () => {
  const [reports, setReports] = useState({
    overview: {
      totalRevenue: 0,
      totalExpenses: 0,
      netIncome: 0,
      outstandingFees: 0,
      paidFees: 0,
      paymentRate: 0
    },
    monthlyRevenue: [],
    paymentStatus: {},
    departmentBreakdown: [],
    expenseCategories: []
  });

  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('thisYear');
  const [selectedChart, setSelectedChart] = useState('revenue');

  useEffect(() => {
    loadFinancialData();
  }, [selectedPeriod]);

  const loadFinancialData = () => {
    // Mock financial data - in real app, this would come from API
    const mockData = {
      overview: {
        totalRevenue: 2450000, // UGX
        totalExpenses: 1800000,
        netIncome: 650000,
        outstandingFees: 125000,
        paidFees: 2325000,
        paymentRate: 94.9
      },
      monthlyRevenue: [
        { month: 'Jan', revenue: 180000, expenses: 150000, students: 245 },
        { month: 'Feb', revenue: 195000, expenses: 145000, students: 248 },
        { month: 'Mar', revenue: 210000, expenses: 160000, students: 252 },
        { month: 'Apr', revenue: 185000, expenses: 155000, students: 250 },
        { month: 'May', revenue: 220000, expenses: 165000, students: 255 },
        { month: 'Jun', revenue: 200000, expenses: 150000, students: 253 },
        { month: 'Jul', revenue: 235000, expenses: 175000, students: 258 },
        { month: 'Aug', revenue: 240000, expenses: 180000, students: 260 },
        { month: 'Sep', revenue: 225000, expenses: 170000, students: 257 },
        { month: 'Oct', revenue: 250000, expenses: 185000, students: 262 },
        { month: 'Nov', revenue: 230000, expenses: 175000, students: 260 },
        { month: 'Dec', revenue: 260000, expenses: 190000, students: 265 }
      ],
      paymentStatus: {
        paid: 2325000,
        pending: 85000,
        overdue: 40000,
        waived: 25000
      },
      departmentBreakdown: [
        { department: 'SOD', revenue: 850000, students: 85, avgPerStudent: 10000 },
        { department: 'Fashion', revenue: 620000, students: 62, avgPerStudent: 10000 },
        { department: 'BUC', revenue: 580000, students: 58, avgPerStudent: 10000 },
        { department: 'Wood Technology', revenue: 275000, students: 60, avgPerStudent: 4583 }
      ],
      expenseCategories: [
        { category: 'Salaries', amount: 950000, percentage: 52.8 },
        { category: 'School Supplies', amount: 280000, percentage: 15.6 },
        { category: 'Maintenance', amount: 220000, percentage: 12.2 },
        { category: 'Utilities', amount: 180000, percentage: 10.0 },
        { category: 'Equipment', amount: 120000, percentage: 6.7 },
        { category: 'Other', amount: 50000, percentage: 2.8 }
      ]
    };

    setReports(mockData);
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

  const getPercentageChange = (current, previous) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="accountant-financial-reports">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading financial reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="accountant-financial-reports">
      {/* Header */}
      <div className="reports-header">
        <div className="header-content">
          <BarChart3 size={28} />
          <div>
            <h2>Financial Reports & Analytics</h2>
            <p>Comprehensive financial overview and performance metrics</p>
          </div>
        </div>

        {/* Controls */}
        <div className="header-controls">
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
            <option value="thisMonth">This Month</option>
            <option value="thisQuarter">This Quarter</option>
            <option value="thisYear">This Year</option>
            <option value="lastYear">Last Year</option>
          </select>

          <button className="export-btn">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="overview-cards">
        <div className="overview-card revenue">
          <div className="card-icon">
            <TrendingUp size={24} color="#10B981" />
          </div>
          <div className="card-content">
            <h3>{formatCurrency(reports.overview.totalRevenue)}</h3>
            <p>Total Revenue</p>
            <span className="trend positive">+12.5% from last month</span>
          </div>
        </div>

        <div className="overview-card expenses">
          <div className="card-icon">
            <TrendingDown size={24} color="#EF4444" />
          </div>
          <div className="card-content">
            <h3>{formatCurrency(reports.overview.totalExpenses)}</h3>
            <p>Total Expenses</p>
            <span className="trend negative">+8.2% from last month</span>
          </div>
        </div>

        <div className="overview-card profit">
          <div className="card-icon">
            <DollarSign size={24} color="#8B5CF6" />
          </div>
          <div className="card-content">
            <h3>{formatCurrency(reports.overview.netIncome)}</h3>
            <p>Net Income</p>
            <span className="trend positive">+18.7% from last month</span>
          </div>
        </div>

        <div className="overview-card outstanding">
          <div className="card-icon">
            <AlertCircle size={24} color="#F59E0B" />
          </div>
          <div className="card-content">
            <h3>{formatCurrency(reports.overview.outstandingFees)}</h3>
            <p>Outstanding Fees</p>
            <span className="trend">2.1% of total fees</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-tabs">
          <button
            className={`chart-tab ${selectedChart === 'revenue' ? 'active' : ''}`}
            onClick={() => setSelectedChart('revenue')}
          >
            <BarChart3 size={16} />
            Revenue Trends
          </button>
          <button
            className={`chart-tab ${selectedChart === 'payments' ? 'active' : ''}`}
            onClick={() => setSelectedChart('payments')}
          >
            <PieChart size={16} />
            Payment Status
          </button>
          <button
            className={`chart-tab ${selectedChart === 'departments' ? 'active' : ''}`}
            onClick={() => setSelectedChart('departments')}
          >
            <Activity size={16} />
            Department Analysis
          </button>
        </div>

        <div className="chart-container">
          {selectedChart === 'revenue' && (
            <div className="revenue-chart">
              <h3>Monthly Revenue vs Expenses</h3>
              <div className="chart-placeholder">
                <div className="chart-bars">
                  {reports.monthlyRevenue.map((month, index) => (
                    <div key={index} className="month-bar">
                      <div className="revenue-bar" style={{ height: `${(month.revenue / 300000) * 100}%` }}>
                        <span className="bar-value">{formatCurrency(month.revenue)}</span>
                      </div>
                      <div className="expense-bar" style={{ height: `${(month.expenses / 300000) * 100}%` }}>
                        <span className="bar-value">{formatCurrency(month.expenses)}</span>
                      </div>
                      <span className="month-label">{month.month}</span>
                    </div>
                  ))}
                </div>
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-color revenue"></div>
                    <span>Revenue</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color expense"></div>
                    <span>Expenses</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedChart === 'payments' && (
            <div className="payment-chart">
              <h3>Payment Status Distribution</h3>
              <div className="pie-chart-placeholder">
                <div className="pie-segments">
                  <div className="segment paid" style={{ '--percentage': '89%' }}>
                    <span className="segment-label">Paid<br/>{formatCurrency(reports.paymentStatus.paid)}</span>
                  </div>
                  <div className="segment pending" style={{ '--percentage': '3.3%' }}>
                    <span className="segment-label">Pending<br/>{formatCurrency(reports.paymentStatus.pending)}</span>
                  </div>
                  <div className="segment overdue" style={{ '--percentage': '1.5%' }}>
                    <span className="segment-label">Overdue<br/>{formatCurrency(reports.paymentStatus.overdue)}</span>
                  </div>
                  <div className="segment waived" style={{ '--percentage': '1%' }}>
                    <span className="segment-label">Waived<br/>{formatCurrency(reports.paymentStatus.waived)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedChart === 'departments' && (
            <div className="department-chart">
              <h3>Revenue by Department</h3>
              <div className="department-bars">
                {reports.departmentBreakdown.map((dept, index) => (
                  <div key={index} className="department-bar">
                    <div className="dept-info">
                      <span className="dept-name">{dept.department}</span>
                      <span className="dept-students">{dept.students} students</span>
                    </div>
                    <div className="dept-bar-container">
                      <div
                        className="dept-bar"
                        style={{ width: `${(dept.revenue / 1000000) * 100}%` }}
                      >
                        <span className="dept-value">{formatCurrency(dept.revenue)}</span>
                      </div>
                      <span className="dept-avg">{formatCurrency(dept.avgPerStudent)}/student</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="reports-tables">
        {/* Department Breakdown */}
        <div className="table-section">
          <h3>Department Financial Breakdown</h3>
          <div className="table-container">
            <table className="financial-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Students</th>
                  <th>Total Revenue</th>
                  <th>Avg per Student</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {reports.departmentBreakdown.map((dept, index) => (
                  <tr key={index}>
                    <td>
                      <div className="dept-cell">
                        <span className="dept-name">{dept.department}</span>
                      </div>
                    </td>
                    <td>{formatNumber(dept.students)}</td>
                    <td className="revenue-cell">{formatCurrency(dept.revenue)}</td>
                    <td>{formatCurrency(dept.avgPerStudent)}</td>
                    <td>
                      <span className={`performance-badge ${dept.avgPerStudent >= 8000 ? 'excellent' : dept.avgPerStudent >= 6000 ? 'good' : 'average'}`}>
                        {dept.avgPerStudent >= 8000 ? 'Excellent' : dept.avgPerStudent >= 6000 ? 'Good' : 'Average'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expense Categories */}
        <div className="table-section">
          <h3>Expense Categories</h3>
          <div className="table-container">
            <table className="financial-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Percentage</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {reports.expenseCategories.map((expense, index) => (
                  <tr key={index}>
                    <td>
                      <div className="expense-cell">
                        <span className="expense-name">{expense.category}</span>
                      </div>
                    </td>
                    <td className="expense-amount">{formatCurrency(expense.amount)}</td>
                    <td>
                      <div className="percentage-cell">
                        <div className="percentage-bar">
                          <div
                            className="percentage-fill"
                            style={{ width: `${expense.percentage}%` }}
                          ></div>
                        </div>
                        <span className="percentage-text">{expense.percentage}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`trend-indicator ${expense.percentage > 20 ? 'high' : expense.percentage > 10 ? 'medium' : 'low'}`}>
                        {expense.percentage > 20 ? '↑ High' : expense.percentage > 10 ? '→ Medium' : '↓ Low'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Summary Insights */}
      <div className="financial-insights">
        <h3>Key Financial Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <Target size={20} color="#10B981" />
            <div>
              <h4>Revenue Growth</h4>
              <p>School revenue increased by 15.2% compared to last year</p>
            </div>
          </div>

          <div className="insight-card">
            <CheckCircle size={20} color="#8B5CF6" />
            <div>
              <h4>Payment Efficiency</h4>
              <p>{reports.overview.paymentRate}% of fees collected on time</p>
            </div>
          </div>

          <div className="insight-card">
            <AlertCircle size={20} color="#F59E0B" />
            <div>
              <h4>Outstanding Fees</h4>
              <p>{formatCurrency(reports.overview.outstandingFees)} in pending payments</p>
            </div>
          </div>

          <div className="insight-card">
            <TrendingUp size={20} color="#EF4444" />
            <div>
              <h4>Expense Management</h4>
              <p>Operating expenses up 8.2% - monitor budget closely</p>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="export-options">
        <h3>Export Reports</h3>
        <div className="export-buttons">
          <button className="export-btn primary">
            <Download size={16} />
            Export PDF Report
          </button>
          <button className="export-btn secondary">
            <FileText size={16} />
            Export Excel
          </button>
          <button className="export-btn secondary">
            <Eye size={16} />
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountantFinancialReports;

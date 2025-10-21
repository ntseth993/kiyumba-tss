import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Filter,
  Search,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  BarChart3,
  PieChart
} from 'lucide-react';

const AccountantExpenseTracking = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedChart, setSelectedChart] = useState('categories');

  useEffect(() => {
    loadExpenseData();
  }, []);

  const loadExpenseData = () => {
    // Mock expense categories
    const mockCategories = [
      { id: 1, name: 'Salaries', color: '#10B981', budget: 950000, spent: 950000 },
      { id: 2, name: 'School Supplies', color: '#3B82F6', budget: 300000, spent: 280000 },
      { id: 3, name: 'Maintenance', color: '#F59E0B', budget: 250000, spent: 220000 },
      { id: 4, name: 'Utilities', color: '#8B5CF6', budget: 200000, spent: 180000 },
      { id: 5, name: 'Equipment', color: '#EF4444', budget: 150000, spent: 120000 },
      { id: 6, name: 'Other', color: '#6B7280', budget: 100000, spent: 50000 }
    ];

    // Mock expenses data
    const mockExpenses = [
      {
        id: 1,
        description: 'Teacher Salaries - April 2024',
        category: 'Salaries',
        amount: 950000,
        date: '2024-04-30',
        status: 'approved',
        approvedBy: 'Admin',
        approvedDate: '2024-04-29',
        receipt: 'REC-001',
        notes: 'Monthly teacher salaries for all departments'
      },
      {
        id: 2,
        description: 'Laboratory Equipment Purchase',
        category: 'Equipment',
        amount: 120000,
        date: '2024-04-25',
        status: 'approved',
        approvedBy: 'Admin',
        approvedDate: '2024-04-24',
        receipt: 'REC-002',
        notes: 'New microscopes for science lab'
      },
      {
        id: 3,
        description: 'Office Supplies Restock',
        category: 'School Supplies',
        amount: 85000,
        date: '2024-04-20',
        status: 'pending',
        approvedBy: null,
        approvedDate: null,
        receipt: null,
        notes: 'Paper, pens, and other office materials'
      },
      {
        id: 4,
        description: 'Building Maintenance',
        category: 'Maintenance',
        amount: 75000,
        date: '2024-04-18',
        status: 'approved',
        approvedBy: 'Admin',
        approvedDate: '2024-04-17',
        receipt: 'REC-003',
        notes: 'Plumbing repairs and painting'
      },
      {
        id: 5,
        description: 'Electricity Bill - March 2024',
        category: 'Utilities',
        amount: 45000,
        date: '2024-04-15',
        status: 'approved',
        approvedBy: 'Admin',
        approvedDate: '2024-04-14',
        receipt: 'REC-004',
        notes: 'Monthly electricity consumption'
      },
      {
        id: 6,
        description: 'Water Bill - March 2024',
        category: 'Utilities',
        amount: 25000,
        date: '2024-04-12',
        status: 'approved',
        approvedBy: 'Admin',
        approvedDate: '2024-04-11',
        receipt: 'REC-005',
        notes: 'Monthly water consumption'
      }
    ];

    setCategories(mockCategories);
    setExpenses(mockExpenses);
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
    switch (status) {
      case 'approved': return 'Approved';
      case 'pending': return 'Pending';
      case 'rejected': return 'Rejected';
      default: return 'Unknown';
    }
  };

  const getStatusClass = (status) => {
    return `status-badge ${status}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle size={14} />;
      case 'pending': return <Clock size={14} />;
      case 'rejected': return <AlertTriangle size={14} />;
      default: return null;
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || expense.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || expense.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getTotalByCategory = (categoryName) => {
    return expenses
      .filter(exp => exp.category === categoryName)
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  const getTotalExpenses = () => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  const getPendingExpenses = () => {
    return expenses.filter(exp => exp.status === 'pending').length;
  };

  if (loading) {
    return (
      <div className="accountant-expense-tracking">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading expense tracking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="accountant-expense-tracking">
      {/* Header */}
      <div className="expense-header">
        <div className="header-content">
          <TrendingDown size={28} />
          <div>
            <h2>Expense Tracking</h2>
            <p>Monitor and manage school expenses by category</p>
          </div>
        </div>

        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowExpenseForm(true)}>
            <Plus size={16} />
            Add Expense
          </button>
          <button className="btn btn-secondary">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="expense-summary-grid">
        <div className="summary-card total-expenses">
          <div className="card-icon">
            <DollarSign size={24} color="#EF4444" />
          </div>
          <div className="card-content">
            <h3>{formatCurrency(getTotalExpenses())}</h3>
            <p>Total Expenses</p>
            <span className="trend">This month</span>
          </div>
        </div>

        <div className="summary-card pending-approvals">
          <div className="card-icon">
            <Clock size={24} color="#F59E0B" />
          </div>
          <div className="card-content">
            <h3>{getPendingExpenses()}</h3>
            <p>Pending Approvals</p>
            <span className="trend">Requires attention</span>
          </div>
        </div>

        <div className="summary-card approved-expenses">
          <div className="card-icon">
            <CheckCircle size={24} color="#10B981" />
          </div>
          <div className="card-content">
            <h3>{expenses.filter(e => e.status === 'approved').length}</h3>
            <p>Approved Expenses</p>
            <span className="trend">This month</span>
          </div>
        </div>

        <div className="summary-card categories">
          <div className="card-icon">
            <BarChart3 size={24} color="#8B5CF6" />
          </div>
          <div className="card-content">
            <h3>{categories.length}</h3>
            <p>Expense Categories</p>
            <span className="trend">Active categories</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-tabs">
          <button
            className={`chart-tab ${selectedChart === 'categories' ? 'active' : ''}`}
            onClick={() => setSelectedChart('categories')}
          >
            <PieChart size={16} />
            By Category
          </button>
          <button
            className={`chart-tab ${selectedChart === 'monthly' ? 'active' : ''}`}
            onClick={() => setSelectedChart('monthly')}
          >
            <BarChart3 size={16} />
            Monthly Trend
          </button>
        </div>

        <div className="chart-container">
          {selectedChart === 'categories' && (
            <div className="category-chart">
              <h3>Expenses by Category</h3>
              <div className="category-bars">
                {categories.map((category) => {
                  const spent = category.spent;
                  const budget = category.budget;
                  const percentage = (spent / budget) * 100;

                  return (
                    <div key={category.id} className="category-bar">
                      <div className="category-info">
                        <div className="category-color" style={{ backgroundColor: category.color }}></div>
                        <span className="category-name">{category.name}</span>
                        <span className="category-amount">{formatCurrency(spent)}</span>
                      </div>
                      <div className="category-progress">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${Math.min(percentage, 100)}%`,
                              backgroundColor: category.color
                            }}
                          ></div>
                        </div>
                        <span className="progress-text">
                          {percentage.toFixed(1)}% of {formatCurrency(budget)} budget
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedChart === 'monthly' && (
            <div className="monthly-chart">
              <h3>Monthly Expense Trend</h3>
              <div className="monthly-placeholder">
                <div className="trend-info">
                  <p>Monthly expense tracking visualization would go here</p>
                  <p>Showing trends over time with line/bar charts</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="expense-controls">
        <div className="search-box">
          <Search size={20} color="#64748b" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="category-filter"
        >
          <option value="All">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.name}>{category.name}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="status-filter"
        >
          <option value="All">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Expenses Table */}
      <div className="expenses-section">
        <h3>Recent Expenses</h3>
        <div className="table-container">
          <table className="expense-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Receipt</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense) => (
                <tr key={expense.id}>
                  <td>
                    <div className="expense-info">
                      <h4>{expense.description}</h4>
                      {expense.notes && <p>{expense.notes}</p>}
                    </div>
                  </td>
                  <td>
                    <span className="category-badge" style={{
                      backgroundColor: categories.find(c => c.name === expense.category)?.color + '20',
                      color: categories.find(c => c.name === expense.category)?.color
                    }}>
                      {expense.category}
                    </span>
                  </td>
                  <td className="amount-cell">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td>{new Date(expense.date).toLocaleDateString()}</td>
                  <td>
                    <span className={getStatusClass(expense.status)}>
                      {getStatusIcon(expense.status)}
                      {getStatusBadge(expense.status)}
                    </span>
                  </td>
                  <td>
                    {expense.receipt ? (
                      <span className="receipt-number">{expense.receipt}</span>
                    ) : (
                      <span className="no-receipt">-</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon"
                        onClick={() => setSelectedExpense(expense)}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button className="btn-icon" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button className="btn-icon delete" title="Delete">
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

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <ExpenseForm
          categories={categories}
          onClose={() => setShowExpenseForm(false)}
          onSave={(newExpense) => {
            setExpenses([...expenses, { id: expenses.length + 1, ...newExpense }]);
            setShowExpenseForm(false);
          }}
        />
      )}

      {/* Expense Details Modal */}
      {selectedExpense && (
        <ExpenseDetails
          expense={selectedExpense}
          categories={categories}
          onClose={() => setSelectedExpense(null)}
        />
      )}
    </div>
  );
};

// Expense Form Component
const ExpenseForm = ({ categories, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    description: '',
    category: categories[0]?.name || '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    receipt: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      amount: Number(formData.amount),
      status: 'pending'
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Expense</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Amount (RWF)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Receipt Number (Optional)</label>
              <input
                type="text"
                value={formData.receipt}
                onChange={(e) => handleChange('receipt', e.target.value)}
              />
            </div>

            <div className="form-group full-width">
              <label>Notes (Optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows="3"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Expense Details Modal Component
const ExpenseDetails = ({ expense, categories, onClose }) => {
  const category = categories.find(c => c.name === expense.category);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Expense Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="expense-details">
            <div className="detail-row">
              <label>Description:</label>
              <p>{expense.description}</p>
            </div>

            <div className="detail-row">
              <label>Category:</label>
              <p>
                <span className="category-badge" style={{
                  backgroundColor: category?.color + '20',
                  color: category?.color
                }}>
                  {expense.category}
                </span>
              </p>
            </div>

            <div className="detail-row">
              <label>Amount:</label>
              <p className="amount">{formatCurrency(expense.amount)}</p>
            </div>

            <div className="detail-row">
              <label>Date:</label>
              <p>{new Date(expense.date).toLocaleDateString()}</p>
            </div>

            {expense.receipt && (
              <div className="detail-row">
                <label>Receipt:</label>
                <p className="receipt-number">{expense.receipt}</p>
              </div>
            )}

            {expense.notes && (
              <div className="detail-row">
                <label>Notes:</label>
                <p>{expense.notes}</p>
              </div>
            )}

            <div className="detail-row">
              <label>Status:</label>
              <p>
                <span className={`status-badge ${expense.status}`}>
                  {expense.status === 'approved' && <CheckCircle size={14} />}
                  {expense.status === 'pending' && <Clock size={14} />}
                  {expense.status === 'rejected' && <AlertTriangle size={14} />}
                  {getStatusBadge(expense.status)}
                </span>
              </p>
            </div>

            {expense.approvedBy && (
              <div className="detail-row">
                <label>Approved By:</label>
                <p>{expense.approvedBy} on {new Date(expense.approvedDate).toLocaleDateString()}</p>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button className="btn btn-primary">
              <Edit size={16} />
              Edit Expense
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountantExpenseTracking;

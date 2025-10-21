import { useState, useEffect } from 'react';
import {
  Target,
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
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Activity,
  Settings
} from 'lucide-react';

const AccountantBudgetManagement = () => {
  const [budgets, setBudgets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedChart, setSelectedChart] = useState('overview');

  useEffect(() => {
    loadBudgetData();
  }, []);

  const loadBudgetData = () => {
    // Mock departments
    const mockDepartments = [
      { id: 1, name: 'SOD', color: '#4F46E5' },
      { id: 2, name: 'Fashion', color: '#10B981' },
      { id: 3, name: 'BUC', color: '#F59E0B' },
      { id: 4, name: 'Wood Technology', color: '#EF4444' }
    ];

    // Mock budgets data
    const mockBudgets = [
      {
        id: 1,
        name: 'Academic Year 2024 Budget',
        department: 'All',
        period: '2024',
        totalBudget: 5000000,
        spent: 4250000,
        remaining: 750000,
        status: 'active',
        categories: [
          { name: 'Salaries', allocated: 2000000, spent: 2000000, percentage: 100 },
          { name: 'School Supplies', allocated: 800000, spent: 650000, percentage: 81.3 },
          { name: 'Maintenance', allocated: 600000, spent: 550000, percentage: 91.7 },
          { name: 'Equipment', allocated: 500000, spent: 450000, percentage: 90 },
          { name: 'Utilities', allocated: 400000, spent: 350000, percentage: 87.5 },
          { name: 'Other', allocated: 700000, spent: 500000, percentage: 71.4 }
        ],
        createdDate: '2024-01-01',
        modifiedDate: '2024-04-15'
      },
      {
        id: 2,
        name: 'SOD Department Budget',
        department: 'SOD',
        period: '2024-Q2',
        totalBudget: 1500000,
        spent: 1350000,
        remaining: 150000,
        status: 'active',
        categories: [
          { name: 'Salaries', allocated: 800000, spent: 800000, percentage: 100 },
          { name: 'Supplies', allocated: 300000, spent: 250000, percentage: 83.3 },
          { name: 'Equipment', allocated: 200000, spent: 180000, percentage: 90 },
          { name: 'Training', allocated: 200000, spent: 120000, percentage: 60 }
        ],
        createdDate: '2024-04-01',
        modifiedDate: '2024-04-15'
      },
      {
        id: 3,
        name: 'Fashion Department Budget',
        department: 'Fashion',
        period: '2024-Q2',
        totalBudget: 1200000,
        spent: 950000,
        remaining: 250000,
        status: 'active',
        categories: [
          { name: 'Salaries', allocated: 600000, spent: 600000, percentage: 100 },
          { name: 'Materials', allocated: 300000, spent: 200000, percentage: 66.7 },
          { name: 'Equipment', allocated: 150000, spent: 120000, percentage: 80 },
          { name: 'Marketing', allocated: 150000, spent: 30000, percentage: 20 }
        ],
        createdDate: '2024-04-01',
        modifiedDate: '2024-04-15'
      }
    ];

    setDepartments(mockDepartments);
    setBudgets(mockBudgets);
    setLoading(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'draft': return 'Draft';
      case 'archived': return 'Archived';
      default: return 'Unknown';
    }
  };

  const getStatusClass = (status) => {
    return `status-badge ${status}`;
  };

  const getBudgetHealth = (spent, total) => {
    const percentage = (spent / total) * 100;
    if (percentage > 90) return { status: 'critical', color: '#EF4444', icon: AlertTriangle };
    if (percentage > 75) return { status: 'warning', color: '#F59E0B', icon: TrendingUp };
    return { status: 'good', color: '#10B981', icon: CheckCircle };
  };

  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         budget.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'All' || budget.department === filterDepartment;
    const matchesStatus = filterStatus === 'All' || budget.status === filterStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getTotalBudget = () => {
    return budgets.reduce((sum, budget) => sum + budget.totalBudget, 0);
  };

  const getTotalSpent = () => {
    return budgets.reduce((sum, budget) => sum + budget.spent, 0);
  };

  const getTotalRemaining = () => {
    return budgets.reduce((sum, budget) => sum + budget.remaining, 0);
  };

  if (loading) {
    return (
      <div className="accountant-budget-management">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading budget management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="accountant-budget-management">
      {/* Header */}
      <div className="budget-header">
        <div className="header-content">
          <Target size={28} />
          <div>
            <h2>Budget Management</h2>
            <p>Plan, monitor, and control school budgets</p>
          </div>
        </div>

        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowBudgetForm(true)}>
            <Plus size={16} />
            Create Budget
          </button>
          <button className="btn btn-secondary">
            <Download size={16} />
            Export Budget Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="budget-summary-grid">
        <div className="summary-card total-budget">
          <div className="card-icon">
            <Target size={24} color="#8B5CF6" />
          </div>
          <div className="card-content">
            <h3>{formatCurrency(getTotalBudget())}</h3>
            <p>Total Budget</p>
            <span className="trend">All active budgets</span>
          </div>
        </div>

        <div className="summary-card total-spent">
          <div className="card-icon">
            <TrendingDown size={24} color="#EF4444" />
          </div>
          <div className="card-content">
            <h3>{formatCurrency(getTotalSpent())}</h3>
            <p>Total Spent</p>
            <span className="trend">{((getTotalSpent() / getTotalBudget()) * 100).toFixed(1)}% utilized</span>
          </div>
        </div>

        <div className="summary-card remaining">
          <div className="card-icon">
            <TrendingUp size={24} color="#10B981" />
          </div>
          <div className="card-content">
            <h3>{formatCurrency(getTotalRemaining())}</h3>
            <p>Remaining Budget</p>
            <span className="trend">{((getTotalRemaining() / getTotalBudget()) * 100).toFixed(1)}% available</span>
          </div>
        </div>

        <div className="summary-card active-budgets">
          <div className="card-icon">
            <Activity size={24} color="#4F46E5" />
          </div>
          <div className="card-content">
            <h3>{budgets.filter(b => b.status === 'active').length}</h3>
            <p>Active Budgets</p>
            <span className="trend">Currently monitored</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-tabs">
          <button
            className={`chart-tab ${selectedChart === 'overview' ? 'active' : ''}`}
            onClick={() => setSelectedChart('overview')}
          >
            <BarChart3 size={16} />
            Budget Overview
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
          {selectedChart === 'overview' && (
            <div className="budget-overview-chart">
              <h3>Budget vs Actual Spending</h3>
              <div className="budget-bars">
                {budgets.map((budget) => {
                  const health = getBudgetHealth(budget.spent, budget.totalBudget);
                  const HealthIcon = health.icon;

                  return (
                    <div key={budget.id} className="budget-bar">
                      <div className="budget-info">
                        <div className="budget-header">
                          <h4>{budget.name}</h4>
                          <div className="budget-health">
                            <HealthIcon size={16} color={health.color} />
                            <span style={{ color: health.color }}>
                              {((budget.spent / budget.totalBudget) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="budget-amounts">
                          <span className="spent">{formatCurrency(budget.spent)}</span>
                          <span className="separator">/</span>
                          <span className="total">{formatCurrency(budget.totalBudget)}</span>
                        </div>
                      </div>
                      <div className="budget-progress">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${Math.min((budget.spent / budget.totalBudget) * 100, 100)}%`,
                              backgroundColor: health.color
                            }}
                          ></div>
                        </div>
                        <div className="progress-labels">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedChart === 'departments' && (
            <div className="department-chart">
              <h3>Department Budget Utilization</h3>
              <div className="department-grid">
                {departments.map((dept) => {
                  const deptBudget = budgets.find(b => b.department === dept.name);
                  if (!deptBudget) return null;

                  const utilization = (deptBudget.spent / deptBudget.totalBudget) * 100;

                  return (
                    <div key={dept.id} className="department-card">
                      <div className="dept-header">
                        <div className="dept-color" style={{ backgroundColor: dept.color }}></div>
                        <h4>{dept.name}</h4>
                      </div>
                      <div className="dept-stats">
                        <div className="stat">
                          <span className="label">Budget:</span>
                          <span className="value">{formatCurrency(deptBudget.totalBudget)}</span>
                        </div>
                        <div className="stat">
                          <span className="label">Spent:</span>
                          <span className="value">{formatCurrency(deptBudget.spent)}</span>
                        </div>
                        <div className="stat">
                          <span className="label">Utilization:</span>
                          <span className="value">{utilization.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="dept-progress">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${Math.min(utilization, 100)}%`,
                              backgroundColor: dept.color
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="budget-controls">
        <div className="search-box">
          <Search size={20} color="#64748b" />
          <input
            type="text"
            placeholder="Search budgets..."
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
          {departments.map(dept => (
            <option key={dept.id} value={dept.name}>{dept.name}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="status-filter"
        >
          <option value="All">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Budgets Table */}
      <div className="budgets-section">
        <h3>Budget Overview</h3>
        <div className="table-container">
          <table className="budget-table">
            <thead>
              <tr>
                <th>Budget Name</th>
                <th>Department</th>
                <th>Period</th>
                <th>Total Budget</th>
                <th>Spent</th>
                <th>Remaining</th>
                <th>Utilization</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBudgets.map((budget) => {
                const utilization = (budget.spent / budget.totalBudget) * 100;
                const health = getBudgetHealth(budget.spent, budget.totalBudget);
                const HealthIcon = health.icon;

                return (
                  <tr key={budget.id}>
                    <td>
                      <div className="budget-info">
                        <h4>{budget.name}</h4>
                        <p>Modified: {new Date(budget.modifiedDate).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td>
                      <span className="department-badge">{budget.department}</span>
                    </td>
                    <td>{budget.period}</td>
                    <td className="amount-cell">
                      {formatCurrency(budget.totalBudget)}
                    </td>
                    <td className="spent-cell">
                      {formatCurrency(budget.spent)}
                    </td>
                    <td className="remaining-cell">
                      {formatCurrency(budget.remaining)}
                    </td>
                    <td>
                      <div className="utilization-cell">
                        <div className="utilization-bar">
                          <div
                            className="utilization-fill"
                            style={{
                              width: `${Math.min(utilization, 100)}%`,
                              backgroundColor: health.color
                            }}
                          ></div>
                        </div>
                        <span className="utilization-text">{utilization.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={getStatusClass(budget.status)}>
                        {getStatusBadge(budget.status)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon"
                          onClick={() => setSelectedBudget(budget)}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button className="btn-icon" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button className="btn-icon delete" title="Archive">
                          <Settings size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Budget Alerts */}
      <div className="budget-alerts">
        <h3>Budget Alerts</h3>
        <div className="alerts-grid">
          {budgets.filter(b => (b.spent / b.totalBudget) > 0.9).map((budget) => (
            <div key={budget.id} className="alert-card critical">
              <AlertTriangle size={20} color="#EF4444" />
              <div className="alert-content">
                <h4>{budget.name}</h4>
                <p>Budget utilization at {((budget.spent / budget.totalBudget) * 100).toFixed(1)}% - consider budget adjustment</p>
              </div>
            </div>
          ))}

          {budgets.filter(b => (b.spent / b.totalBudget) > 0.75 && (b.spent / b.totalBudget) <= 0.9).map((budget) => (
            <div key={budget.id} className="alert-card warning">
              <TrendingUp size={20} color="#F59E0B" />
              <div className="alert-content">
                <h4>{budget.name}</h4>
                <p>Budget utilization at {((budget.spent / budget.totalBudget) * 100).toFixed(1)}% - monitor closely</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Budget Form Modal */}
      {showBudgetForm && (
        <BudgetForm
          departments={departments}
          onClose={() => setShowBudgetForm(false)}
          onSave={(newBudget) => {
            setBudgets([...budgets, { id: budgets.length + 1, ...newBudget }]);
            setShowBudgetForm(false);
          }}
        />
      )}

      {/* Budget Details Modal */}
      {selectedBudget && (
        <BudgetDetails
          budget={selectedBudget}
          onClose={() => setSelectedBudget(null)}
        />
      )}
    </div>
  );
};

// Budget Form Component
const BudgetForm = ({ departments, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    department: 'All',
    period: '2024',
    totalBudget: '',
    categories: [
      { name: 'Salaries', allocated: '', percentage: 0 },
      { name: 'School Supplies', allocated: '', percentage: 0 },
      { name: 'Maintenance', allocated: '', percentage: 0 },
      { name: 'Equipment', allocated: '', percentage: 0 },
      { name: 'Utilities', allocated: '', percentage: 0 },
      { name: 'Other', allocated: '', percentage: 0 }
    ]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalAllocated = formData.categories.reduce((sum, cat) => sum + (Number(cat.allocated) || 0), 0);
    onSave({
      ...formData,
      totalBudget: totalAllocated,
      spent: 0,
      remaining: totalAllocated,
      status: 'active',
      createdDate: new Date().toISOString().split('T')[0],
      modifiedDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.map((cat, i) =>
        i === index ? { ...cat, [field]: value } : cat
      )
    }));
  };

  const totalAllocated = formData.categories.reduce((sum, cat) => sum + (Number(cat.allocated) || 0), 0);

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h2>Create New Budget</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Budget Name</label>
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
                <option value="All">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Budget Period</label>
              <select
                value={formData.period}
                onChange={(e) => handleChange('period', e.target.value)}
              >
                <option value="2024">2024</option>
                <option value="2024-Q1">2024 Q1</option>
                <option value="2024-Q2">2024 Q2</option>
                <option value="2024-Q3">2024 Q3</option>
                <option value="2024-Q4">2024 Q4</option>
              </select>
            </div>

            <div className="form-group">
              <label>Total Budget (UGX)</label>
              <input
                type="number"
                value={totalAllocated}
                readOnly
                className="total-budget-display"
              />
            </div>
          </div>

          <div className="categories-section">
            <h4>Budget Allocation by Category</h4>
            <div className="categories-grid">
              {formData.categories.map((category, index) => (
                <div key={index} className="category-allocation">
                  <label>{category.name}</label>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={category.allocated}
                    onChange={(e) => handleCategoryChange(index, 'allocated', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Budget Details Modal Component
const BudgetDetails = ({ budget, onClose }) => {
  const utilization = (budget.spent / budget.totalBudget) * 100;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Budget Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="budget-overview">
            <div className="overview-item">
              <label>Budget Name:</label>
              <p>{budget.name}</p>
            </div>
            <div className="overview-item">
              <label>Department:</label>
              <p>{budget.department}</p>
            </div>
            <div className="overview-item">
              <label>Period:</label>
              <p>{budget.period}</p>
            </div>
            <div className="overview-item">
              <label>Total Budget:</label>
              <p className="amount">{formatCurrency(budget.totalBudget)}</p>
            </div>
            <div className="overview-item">
              <label>Amount Spent:</label>
              <p className="spent">{formatCurrency(budget.spent)}</p>
            </div>
            <div className="overview-item">
              <label>Remaining:</label>
              <p className="remaining">{formatCurrency(budget.remaining)}</p>
            </div>
          </div>

          <div className="categories-breakdown">
            <h4>Category Breakdown</h4>
            <div className="categories-list">
              {budget.categories.map((category, index) => (
                <div key={index} className="category-item">
                  <div className="category-header">
                    <span className="category-name">{category.name}</span>
                    <span className="category-percentage">{category.percentage}%</span>
                  </div>
                  <div className="category-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                    <div className="category-amounts">
                      <span>{formatCurrency(category.spent)}</span>
                      <span>/</span>
                      <span>{formatCurrency(category.allocated)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button className="btn btn-primary">
              <Edit size={16} />
              Edit Budget
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountantBudgetManagement;

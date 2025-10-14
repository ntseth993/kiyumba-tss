import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Users, Shield, UserCheck, Edit, Trash2, Search, Key, LogIn, Eye } from 'lucide-react';
import './AdminUserManagement.css';

const AdminUserManagement = () => {
  const { impersonateUser, changeUserPassword, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordUserId, setPasswordUserId] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, users]);

  const loadUsers = () => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    // Add default users if not exists
    if (storedUsers.length === 0) {
      const defaultUsers = [
        {
          id: 1,
          name: 'Admin User',
          email: 'admin@kiyumba.com',
          role: 'admin',
          avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=4F46E5&color=fff',
          createdDate: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Staff Member',
          email: 'staff@kiyumba.com',
          role: 'staff',
          avatar: 'https://ui-avatars.com/api/?name=Staff+Member&background=10B981&color=fff',
          createdDate: new Date().toISOString()
        },
        {
          id: 21,
          name: 'Director of Discipline',
          email: 'dod@kiyumba.com',
          role: 'dod',
          avatar: 'https://ui-avatars.com/api/?name=DOD&background=EF4444&color=fff',
          createdDate: new Date().toISOString()
        },
        {
          id: 22,
          name: 'Director of Studies',
          email: 'dos@kiyumba.com',
          role: 'dos',
          avatar: 'https://ui-avatars.com/api/?name=DOS&background=4F46E5&color=fff',
          createdDate: new Date().toISOString()
        },
        {
          id: 23,
          name: 'School Accountant',
          email: 'accountant@kiyumba.com',
          role: 'accountant',
          avatar: 'https://ui-avatars.com/api/?name=Accountant&background=10B981&color=fff',
          createdDate: new Date().toISOString()
        },
        {
          id: 24,
          name: 'Activities Coordinator',
          email: 'animateur@kiyumba.com',
          role: 'animateur',
          avatar: 'https://ui-avatars.com/api/?name=Animateur&background=F59E0B&color=fff',
          createdDate: new Date().toISOString()
        },
        {
          id: 25,
          name: 'School Secretary',
          email: 'secretary@kiyumba.com',
          role: 'secretary',
          avatar: 'https://ui-avatars.com/api/?name=Secretary&background=8B5CF6&color=fff',
          createdDate: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Teacher User',
          email: 'teacher@kiyumba.com',
          role: 'teacher',
          avatar: 'https://ui-avatars.com/api/?name=Teacher+User&background=F59E0B&color=fff',
          createdDate: new Date().toISOString()
        },
        {
          id: 4,
          name: 'John Doe',
          email: 'student@kiyumba.com',
          role: 'student',
          studentId: 'STD2024001',
          program: 'software',
          level: 'L4',
          avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=10B981&color=fff',
          createdDate: new Date().toISOString()
        }
      ];
      localStorage.setItem('users', JSON.stringify(defaultUsers));
      setUsers(defaultUsers);
      setFilteredUsers(defaultUsers);
    } else {
      setUsers(storedUsers);
      setFilteredUsers(storedUsers);
    }
  };

  const handleRoleChange = (userId, newRole) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return { ...user, role: newRole, updatedDate: new Date().toISOString() };
      }
      return user;
    });

    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setSelectedUser(null);
    alert(`User role updated to ${newRole}`);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      alert('User deleted successfully');
    }
  };

  // Handle user impersonation
  const handleImpersonateUser = (targetUser) => {
    if (!isAdmin) {
      alert('Only administrators can impersonate users');
      return;
    }

    const result = impersonateUser(targetUser);
    if (result.success) {
      // Navigate to the appropriate dashboard based on user role
      switch (targetUser.role) {
        case 'student':
          navigate('/student/dashboard');
          break;
        case 'teacher':
          if (targetUser.department) {
            navigate('/teacher/dashboard');
          } else {
            navigate('/teacher/department-selection');
          }
          break;
        case 'staff':
          navigate('/staff/dashboard');
          break;
        case 'dod':
          navigate('/dod/dashboard');
          break;
        case 'dos':
          navigate('/dos/dashboard');
          break;
        case 'accountant':
          navigate('/accountant/dashboard');
          break;
        case 'animateur':
          navigate('/animateur/dashboard');
          break;
        case 'secretary':
          navigate('/secretary/dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/');
      }
    } else {
      alert(result.error);
    }
  };

  // Handle password change
  const handleChangePassword = (userId) => {
    setPasswordUserId(userId);
    setShowPasswordModal(true);
    setNewPassword('');
  };

  // Handle password update
  const handlePasswordChange = () => {
    if (!newPassword.trim()) {
      alert('Please enter a new password');
      return;
    }

    const result = changeUserPassword(passwordUserId, newPassword);
    if (result.success) {
      alert('Password updated successfully');
      setShowPasswordModal(false);
      setNewPassword('');
      setPasswordUserId(null);
    } else {
      alert(result.error);
    }
  };

  const getRoleLabel = (role) => {
    const roles = {
      admin: 'Administrator',
      student: 'Student',
      teacher: 'Teacher',
      staff: 'Staff',
      dod: 'Director of Discipline',
      dos: 'Director of Studies',
      accountant: 'Accountant',
      animateur: 'Animateur',
      secretary: 'Secretary'
    };
    return roles[role] || role;
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield size={16} />;
      case 'teacher':
        return <UserCheck size={16} />;
      case 'dod':
        return <Users size={16} />;
      case 'dos':
        return <UserCheck size={16} />;
      case 'accountant':
        return <Users size={16} />;
      case 'animateur':
        return <Users size={16} />;
      case 'secretary':
        return <Users size={16} />;
      default:
        return <Users size={16} />;
    }
  };

  const roleCounts = {
    all: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    student: users.filter(u => u.role === 'student').length,
    teacher: users.filter(u => u.role === 'teacher').length,
    staff: users.filter(u => u.role === 'staff').length,
    dod: users.filter(u => u.role === 'dod').length,
    dos: users.filter(u => u.role === 'dos').length,
    accountant: users.filter(u => u.role === 'accountant').length,
    animateur: users.filter(u => u.role === 'animateur').length,
    secretary: users.filter(u => u.role === 'secretary').length
  };

  return (
    <div className="admin-user-management">
      <Navbar />
      
      <div className="dashboard-container">
        <div className="page-header">
          <h1>User Management</h1>
          <p>Manage users and their roles across the system</p>
        </div>

        {/* Statistics */}
        <div className="stats-grid">
          <div className="stat-card card">
            <div className="stat-icon" style={{ backgroundColor: '#EEF2FF' }}>
              <Users size={24} color="#4F46E5" />
            </div>
            <div className="stat-content">
              <h3>{roleCounts.all}</h3>
              <p>Total Users</p>
            </div>
          </div>
          <div className="stat-card card">
            <div className="stat-icon" style={{ backgroundColor: '#FEF3C7' }}>
              <Shield size={24} color="#F59E0B" />
            </div>
            <div className="stat-content">
              <h3>{roleCounts.admin}</h3>
              <p>Administrators</p>
            </div>
          </div>
          <div className="stat-card card">
            <div className="stat-icon" style={{ backgroundColor: '#F0FDF4' }}>
              <Users size={24} color="#10B981" />
            </div>
            <div className="stat-content">
              <h3>{roleCounts.student}</h3>
              <p>Students</p>
            </div>
          </div>
          <div className="stat-card card">
            <div className="stat-icon" style={{ backgroundColor: '#DBEAFE' }}>
              <UserCheck size={24} color="#3B82F6" />
            </div>
            <div className="stat-content">
              <h3>{roleCounts.teacher + roleCounts.staff}</h3>
              <p>Staff & Teachers</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="user-filters card">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-tabs">
            <button
              className={`filter-tab ${roleFilter === 'all' ? 'active' : ''}`}
              onClick={() => setRoleFilter('all')}
            >
              All ({roleCounts.all})
            </button>
            <button
              className={`filter-tab ${roleFilter === 'admin' ? 'active' : ''}`}
              onClick={() => setRoleFilter('admin')}
            >
              Admins ({roleCounts.admin})
            </button>
            <button
              className={`filter-tab ${roleFilter === 'student' ? 'active' : ''}`}
              onClick={() => setRoleFilter('student')}
            >
              Students ({roleCounts.student})
            </button>
            <button
              className={`filter-tab ${roleFilter === 'teacher' ? 'active' : ''}`}
              onClick={() => setRoleFilter('teacher')}
            >
              Teachers ({roleCounts.teacher})
            </button>
            <button
              className={`filter-tab ${roleFilter === 'staff' ? 'active' : ''}`}
              onClick={() => setRoleFilter('staff')}
            >
              Staff ({roleCounts.staff})
            </button>
            <button
              className={`filter-tab ${roleFilter === 'dod' ? 'active' : ''}`}
              onClick={() => setRoleFilter('dod')}
            >
              DOD ({roleCounts.dod})
            </button>
            <button
              className={`filter-tab ${roleFilter === 'dos' ? 'active' : ''}`}
              onClick={() => setRoleFilter('dos')}
            >
              DOS ({roleCounts.dos})
            </button>
            <button
              className={`filter-tab ${roleFilter === 'accountant' ? 'active' : ''}`}
              onClick={() => setRoleFilter('accountant')}
            >
              Accountant ({roleCounts.accountant})
            </button>
            <button
              className={`filter-tab ${roleFilter === 'animateur' ? 'active' : ''}`}
              onClick={() => setRoleFilter('animateur')}
            >
              Animateur ({roleCounts.animateur})
            </button>
            <button
              className={`filter-tab ${roleFilter === 'secretary' ? 'active' : ''}`}
              onClick={() => setRoleFilter('secretary')}
            >
              Secretary ({roleCounts.secretary})
            </button>
          </div>
        </div>

        {/* Users List */}
        <div className="users-section card">
          {filteredUsers.length === 0 ? (
            <div className="empty-state">
              <p>No users found.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Details</th>
                    <th>Joined Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="user-cell">
                        <img src={user.avatar} alt={user.name} className="user-avatar-small" />
                        <span className="user-name">{user.name}</span>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {getRoleIcon(user.role)}
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="user-details">
                        {user.studentId && <span>ID: {user.studentId}</span>}
                        {user.program && <span>Program: {user.program}</span>}
                        {user.level && <span>Level: {user.level}</span>}
                      </td>
                      <td>
                        {user.createdDate
                          ? new Date(user.createdDate).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon"
                            onClick={() => handleImpersonateUser(user)}
                            title="Access Dashboard"
                          >
                            <LogIn size={18} />
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => handleChangePassword(user.id)}
                            title="Change Password"
                          >
                            <Key size={18} />
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => setSelectedUser(user)}
                            title="Edit Role"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            className="btn-icon delete"
                            onClick={() => handleDeleteUser(user.id)}
                            title="Delete User"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit Role Modal */}
        {selectedUser && (
          <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
            <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Change User Role</h2>
                <button
                  className="modal-close"
                  onClick={() => setSelectedUser(null)}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="user-info">
                  <img src={selectedUser.avatar} alt={selectedUser.name} className="user-avatar-large" />
                  <div>
                    <h3>{selectedUser.name}</h3>
                    <p>{selectedUser.email}</p>
                    <span className={`role-badge ${selectedUser.role}`}>
                      Current: {getRoleLabel(selectedUser.role)}
                    </span>
                  </div>
                </div>

                <div className="role-selection">
                  <h4>Select New Role:</h4>
                  <div className="role-options">
                    {['admin', 'teacher', 'staff', 'dod', 'dos', 'accountant', 'animateur', 'secretary', 'student'].map(role => (
                      <button
                        key={role}
                        className={`role-option ${selectedUser.role === role ? 'current' : ''}`}
                        onClick={() => handleRoleChange(selectedUser.id, role)}
                      >
                        {getRoleIcon(role)}
                        <span>{getRoleLabel(role)}</span>
                        {selectedUser.role === role && (
                          <span className="current-label">Current</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
            <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Change User Password</h2>
                <button
                  className="modal-close"
                  onClick={() => setShowPasswordModal(false)}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="newPassword">New Password:</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="form-input"
                  />
                </div>
                <div className="modal-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowPasswordModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handlePasswordChange}
                    disabled={!newPassword.trim()}
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AdminUserManagement;

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Menu, 
  X, 
  User,
  Sun,
  Moon,
  Monitor,
  Settings,
  Bell,
  Search,
  Smile,
  Paperclip,
  Send,
  LogOut, 
  Home, 
  BookOpen, 
  Users,
  GraduationCap,
  Calendar,
  DollarSign,
  FileText
} from 'lucide-react';
import ImpersonationBanner from './ImpersonationBanner';
import NotificationBell from './NotificationBell';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // State management
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Refs for click outside detection
  const userMenuRef = useRef(null);
  const themeMenuRef = useRef(null);

  // Toggle functions
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const toggleUserMenu = () => setShowUserMenu(!showUserMenu);
  const toggleThemeMenu = () => setShowThemeMenu(!showThemeMenu);

  // Enhanced logout function
  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  const handleDashboardClick = () => {
    if (user?.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (user?.role === 'student') {
      navigate('/student/dashboard');
    } else if (user?.role === 'teacher') {
      if (user?.requiresDepartmentSelection) {
        navigate('/teacher/department-selection');
      } else {
        navigate('/teacher/dashboard');
      }
    } else if (user?.role === 'staff') {
      navigate('/staff/dashboard');
    } else if (user?.role === 'dod') {
      navigate('/dod/dashboard');
    } else if (user?.role === 'dos') {
      navigate('/dos/dashboard');
    } else if (user?.role === 'accountant') {
      navigate('/accountant/dashboard');
    } else if (user?.role === 'animateur') {
      navigate('/animateur/dashboard');
    } else if (user?.role === 'secretary') {
      navigate('/secretary/dashboard');
    }
    // Close menus after navigation
    if (mobileMenuOpen) toggleMobileMenu();
    if (showUserMenu) toggleUserMenu();
  };

  const handleSettingsClick = () => {
    if (user?.role === 'admin') {
      navigate('/admin/settings');
    } else if (user?.role === 'student') {
      navigate('/student/settings');
    } else if (user?.role === 'teacher') {
      navigate('/teacher/settings');
    } else if (user?.role === 'staff') {
      navigate('/staff/settings');
    } else if (user?.role === 'dod') {
      navigate('/dod/settings');
    } else if (user?.role === 'dos') {
      navigate('/dos/settings');
    } else if (user?.role === 'accountant') {
      navigate('/accountant/settings');
    } else if (user?.role === 'animateur') {
      navigate('/animateur/settings');
    } else if (user?.role === 'secretary') {
      navigate('/secretary/settings');
    }
    // Close menus after navigation
    if (mobileMenuOpen) toggleMobileMenu();
    if (showUserMenu) toggleUserMenu();
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    toggleThemeMenu();
  };

  // Helper function to get role badge colors
  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      teacher: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      student: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      staff: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      dod: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      dos: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      accountant: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      animateur: 'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)',
      secretary: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    };
    return colors[role] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };

  return (
    <nav className="navbar-modern">
      <div className="navbar-container-modern">
        {/* Logo Section */}
        <Link to="/" className="navbar-logo-modern" onClick={toggleMobileMenu}>
          <div className="logo-icon-modern">
            <GraduationCap size={28} />
          </div>
          <div className="logo-text-modern">
            <span className="logo-title">Kiyumba School</span>
            <span className="logo-subtitle">Education Platform</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-nav-modern">
          <Link to="/" className="nav-link-modern">Home</Link>
          <Link to="/about" className="nav-link-modern">About</Link>
          <Link to="/contact" className="nav-link-modern">Contact</Link>

          {/* New Feature Links - Role Based */}
          {isAuthenticated && ['teacher', 'dod', 'dos', 'admin', 'staff'].includes(user?.role) && (
            <Link to="/attendance" className="nav-link-modern">
              <Calendar size={16} />
              <span>Attendance</span>
            </Link>
          )}
          
          {isAuthenticated && ['accountant', 'dos', 'admin'].includes(user?.role) && (
            <Link to="/payments" className="nav-link-modern">
              <DollarSign size={16} />
              <span>Payments</span>
            </Link>
          )}
          
          {isAuthenticated && ['teacher', 'dod', 'dos', 'admin', 'staff', 'secretary'].includes(user?.role) && (
            <Link to="/reports" className="nav-link-modern">
              <FileText size={16} />
              <span>Reports</span>
            </Link>
          )}

          {/* Search Bar */}
          <div className="navbar-search-modern">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search..."
              className="search-input-modern"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="navbar-actions-modern">
          {/* Theme Toggle */}
          <div className="theme-toggle-container">
            <button
              className="theme-toggle-btn-modern"
              onClick={toggleThemeMenu}
              title={`Current theme: ${theme}`}
            >
              {theme === 'light' && <Sun size={20} />}
              {theme === 'dark' && <Moon size={20} />}
              {theme === 'auto' && <Monitor size={20} />}
            </button>

            {showThemeMenu && (
              <div className="theme-menu-modern" ref={themeMenuRef}>
                <button
                  className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('light')}
                >
                  <Sun size={16} />
                  <span>Light</span>
                </button>
                <button
                  className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('dark')}
                >
                  <Moon size={16} />
                  <span>Dark</span>
                </button>
                <button
                  className={`theme-option ${theme === 'auto' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('auto')}
                >
                  <Monitor size={16} />
                  <span>System</span>
                </button>
              </div>
            )}
          </div>

          {/* Notifications */}
          {isAuthenticated && <NotificationBell />}

          {/* User Menu */}
          {isAuthenticated ? (
            <div className="user-menu-container" ref={userMenuRef}>
              <button
                className="user-menu-btn-modern"
                onClick={toggleUserMenu}
              >
                <div className="user-avatar-modern">
                  <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=${user?.role}&color=fff&size=128`}
                    alt={user?.name}
                  />
                </div>
                <div className="user-info-modern">
                  <span className="user-name">{user?.name}</span>
                  <div
                    className="user-role-badge"
                    style={{ background: getRoleBadgeColor(user?.role) }}
                  >
                    {user?.role}
                  </div>
                </div>
              </button>

              {showUserMenu && (
                <div className="user-dropdown-modern">
                  <div className="user-dropdown-header">
                    <div className="user-avatar-dropdown">
                      <img
                        src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=${user?.role}&color=fff&size=128`}
                        alt={user?.name}
                      />
                    </div>
                    <div className="user-details">
                      <span className="user-name-dropdown">{user?.name}</span>
                      <span className="user-email-dropdown">{user?.email}</span>
                      <div
                        className="user-role-dropdown"
                        style={{ background: getRoleBadgeColor(user?.role) }}
                      >
                        {user?.role}
                      </div>
                    </div>
                  </div>

                  <div className="user-dropdown-menu">
                    <button onClick={handleDashboardClick} className="dropdown-item-modern">
                      <User size={18} />
                      <span>Dashboard</span>
                    </button>
                    <button onClick={handleSettingsClick} className="dropdown-item-modern">
                      <Settings size={18} />
                      <span>Settings</span>
                    </button>
                    <button onClick={handleLogoutClick} className="dropdown-item-modern logout">
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-btn-modern">
              <User size={18} />
              <span>Login</span>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="navbar-mobile-toggle-modern"
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="navbar-mobile-menu-modern">
          <div className="mobile-menu-header">
            <div className="mobile-user-info">
              {isAuthenticated && (
                <>
                  <div className="mobile-user-avatar">
                    <img
                      src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=${user?.role}&color=fff&size=128`}
                      alt={user?.name}
                    />
                  </div>
                  <div className="mobile-user-details">
                    <span className="mobile-user-name">{user?.name}</span>
                    <div
                      className="mobile-user-role"
                      style={{ background: getRoleBadgeColor(user?.role) }}
                    >
                      {user?.role}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mobile-nav-links">
            <Link to="/" className="mobile-nav-link" onClick={toggleMobileMenu}>
              Home
            </Link>
            <Link to="/about" className="mobile-nav-link" onClick={toggleMobileMenu}>
              About
            </Link>
            <Link to="/contact" className="mobile-nav-link" onClick={toggleMobileMenu}>
              Contact
            </Link>

            {/* New Feature Links - Role Based */}
            {isAuthenticated && ['teacher', 'dod', 'dos', 'admin', 'staff'].includes(user?.role) && (
              <Link to="/attendance" className="mobile-nav-link" onClick={toggleMobileMenu}>
                <Calendar size={18} />
                <span>Attendance</span>
              </Link>
            )}
            
            {isAuthenticated && ['accountant', 'dos', 'admin'].includes(user?.role) && (
              <Link to="/payments" className="mobile-nav-link" onClick={toggleMobileMenu}>
                <DollarSign size={18} />
                <span>Payments</span>
              </Link>
            )}
            
            {isAuthenticated && ['teacher', 'dod', 'dos', 'admin', 'staff', 'secretary'].includes(user?.role) && (
              <Link to="/reports" className="mobile-nav-link" onClick={toggleMobileMenu}>
                <FileText size={18} />
                <span>Reports</span>
              </Link>
            )}

            {/* Theme Toggle in Mobile */}
            <div className="mobile-theme-toggle">
              <button
                className={`mobile-theme-option ${theme === 'light' ? 'active' : ''}`}
                onClick={() => {
                  handleThemeChange('light');
                  toggleMobileMenu();
                }}
              >
                <Sun size={16} />
                <span>Light</span>
              </button>
              <button
                className={`mobile-theme-option ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => {
                  handleThemeChange('dark');
                  toggleMobileMenu();
                }}
              >
                <Moon size={16} />
                <span>Dark</span>
              </button>
              <button
                className={`mobile-theme-option ${theme === 'auto' ? 'active' : ''}`}
                onClick={() => {
                  handleThemeChange('auto');
                  toggleMobileMenu();
                }}
              >
                <Monitor size={16} />
                <span>System</span>
              </button>
            </div>

            {isAuthenticated ? (
              <div className="mobile-user-actions">
                <button onClick={handleDashboardClick} className="mobile-action-btn">
                  <User size={18} />
                  <span>Dashboard</span>
                </button>
                <button onClick={handleSettingsClick} className="mobile-action-btn">
                  <Settings size={18} />
                  <span>Settings</span>
                </button>
                <button onClick={handleLogoutClick} className="mobile-action-btn logout">
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="mobile-login-btn"
                onClick={toggleMobileMenu}
              >
                <User size={18} />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close menus */}
      {(showThemeMenu || showUserMenu) && (
        <div
          className="navbar-overlay"
          onClick={() => {
            toggleThemeMenu();
            toggleUserMenu();
          }}
        />
      )}

      {/* Impersonation Banner */}
      <ImpersonationBanner />
    </nav>
  );
};

export default Navbar;

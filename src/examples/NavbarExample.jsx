// Example usage of Navbar functions in a component
import { useNavbar } from '../hooks/useApp';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const {
    mobileMenuOpen,
    showUserMenu,
    showThemeMenu,
    userMenuRef,
    themeMenuRef,
    toggleMobileMenu,
    toggleUserMenu,
    toggleThemeMenu,
    handleSearch,
    handleLogout,
    getRoleBadgeColor
  } = useNavbar(user);

  const handleDashboardClick = () => {
    if (user?.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (user?.role === 'student') {
      navigate('/student/dashboard');
    }
    // Close menus after navigation
    toggleMobileMenu();
    toggleUserMenu();
  };

  return (
    <nav className="navbar-modern">
      {/* Logo */}
      <Link to="/" className="navbar-logo-modern">
        <div className="logo-icon-modern">
          <GraduationCap size={28} />
        </div>
        <div className="logo-text-modern">
          <span className="logo-title">Kiyumba School</span>
          <span className="logo-subtitle">Education Platform</span>
        </div>
      </Link>

      {/* Theme Toggle Button */}
      <button
        className="theme-toggle-btn-modern"
        onClick={toggleThemeMenu}
        title={`Current theme: ${theme}`}
      >
        {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* User Menu Button */}
      <div ref={userMenuRef}>
        <button className="user-menu-btn-modern" onClick={toggleUserMenu}>
          <div className="user-avatar-modern">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`}
              alt={user?.name}
            />
          </div>
        </button>

        {/* User Dropdown */}
        {showUserMenu && (
          <div className="user-dropdown-modern">
            <div className="user-dropdown-header">
              <img src={user?.avatar} alt={user?.name} />
              <div>
                <span>{user?.name}</span>
                <div style={{ background: getRoleBadgeColor(user?.role) }}>
                  {user?.role}
                </div>
              </div>
            </div>
            <button onClick={handleDashboardClick}>Dashboard</button>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button className="navbar-mobile-toggle-modern" onClick={toggleMobileMenu}>
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </nav>
  );
};

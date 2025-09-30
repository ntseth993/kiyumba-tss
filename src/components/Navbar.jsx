import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, GraduationCap, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleDashboardClick = () => {
    if (user?.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (user?.role === 'student') {
      navigate('/student/dashboard');
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => setMobileMenuOpen(false)}>
          <GraduationCap size={32} />
          <span>Kiyumba School</span>
        </Link>

        {/* Desktop Menu */}
        <div className="navbar-menu">
          <Link to="/" className="navbar-link">Home</Link>
          <Link to="/about" className="navbar-link">About</Link>
          <Link to="/contact" className="navbar-link">Contact</Link>
          
          {isAuthenticated ? (
            <div className="navbar-user-menu">
              <button onClick={handleDashboardClick} className="btn btn-primary">
                <User size={18} />
                Dashboard
              </button>
              <button onClick={handleLogout} className="btn btn-outline">
                <LogOut size={18} />
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary">Login</Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="navbar-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="navbar-mobile-menu">
          <Link to="/" className="navbar-mobile-link" onClick={() => setMobileMenuOpen(false)}>
            Home
          </Link>
          <Link to="/about" className="navbar-mobile-link" onClick={() => setMobileMenuOpen(false)}>
            About
          </Link>
          <Link to="/contact" className="navbar-mobile-link" onClick={() => setMobileMenuOpen(false)}>
            Contact
          </Link>
          
          {isAuthenticated ? (
            <>
              <button onClick={handleDashboardClick} className="btn btn-primary" style={{width: '100%', marginTop: '12px'}}>
                <User size={18} />
                Dashboard
              </button>
              <button onClick={handleLogout} className="btn btn-outline" style={{width: '100%', marginTop: '8px'}}>
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{width: '100%', marginTop: '12px'}} onClick={() => setMobileMenuOpen(false)}>
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

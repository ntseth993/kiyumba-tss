import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      // Navigate based on user role
      if (result.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (result.user.role === 'staff') {
        navigate('/staff/dashboard');
      } else if (result.user.role === 'dod') {
        navigate('/dod/dashboard');
      } else if (result.user.role === 'dos') {
        navigate('/dos/dashboard');
      } else if (result.user.role === 'accountant') {
        navigate('/accountant/dashboard');
      } else if (result.user.role === 'animateur') {
        navigate('/animateur/dashboard');
      } else if (result.user.role === 'secretary') {
        navigate('/secretary/dashboard');
      } else if (result.user.role === 'teacher') {
        if (result.requiresDepartmentSelection) {
          navigate('/teacher/department-selection');
        } else {
          navigate('/teacher/dashboard');
        }
      } else if (result.user.role === 'student') {
        if (result.requiresClassSelection) {
          navigate('/student/class-selection');
        } else {
          navigate('/student/dashboard');
        }
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const fillDemoCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@kiyumba.com');
      setPassword('admin123');
    } else if (role === 'staff') {
      setEmail('staff@kiyumba.com');
      setPassword('staff123');
    } else if (role === 'dod') {
      setEmail('dod@kiyumba.com');
      setPassword('dod123');
    } else if (role === 'dos') {
      setEmail('dos@kiyumba.com');
      setPassword('dos123');
    } else if (role === 'accountant') {
      setEmail('accountant@kiyumba.com');
      setPassword('accountant123');
    } else if (role === 'animateur') {
      setEmail('animateur@kiyumba.com');
      setPassword('animateur123');
    } else if (role === 'secretary') {
      setEmail('secretary@kiyumba.com');
      setPassword('secretary123');
    } else if (role === 'teacher') {
      setEmail('teacher@kiyumba.com');
      setPassword('teacher123');
    } else {
      setEmail('student@kiyumba.com');
      setPassword('student123');
    }
    setError('');
  };

  return (
    <div className="login-page">
      <Link to="/" className="back-button">
        <ArrowLeft size={20} />
        Back to Home
      </Link>

      <div className="login-container">
        <div className="login-card card">
          <div className="login-header">
            <div className="login-logo">
              <GraduationCap size={48} />
            </div>
            <h1>Welcome Back</h1>
            <p>Login to access your dashboard</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
              <p style={{fontSize: '12px', marginTop: '8px'}}>
                Use demo accounts below or correct credentials
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">
                <Mail size={18} />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <Lock size={18} />
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Demo credentials for testing */}
          <div className="demo-credentials">
            <h3>Demo Accounts</h3>
            <p style={{fontSize: '13px', color: '#666', marginBottom: '12px'}}>
              Click to auto-fill credentials
            </p>
            <div className="demo-buttons">
              <button 
                type="button" 
                className="demo-btn admin" 
                onClick={() => fillDemoCredentials('admin')}
                title="admin@kiyumba.com / admin123"
              >
                Admin
              </button>
              <button 
                type="button" 
                className="demo-btn staff" 
                onClick={() => fillDemoCredentials('staff')}
                title="staff@kiyumba.com / staff123"
              >
                Staff
              </button>
              <button 
                type="button" 
                className="demo-btn dod" 
                onClick={() => fillDemoCredentials('dod')}
                title="dod@kiyumba.com / dod123"
              >
                DOD
              </button>
              <button 
                type="button" 
                className="demo-btn dos" 
                onClick={() => fillDemoCredentials('dos')}
                title="dos@kiyumba.com / dos123"
              >
                DOS
              </button>
              <button 
                type="button" 
                className="demo-btn accountant" 
                onClick={() => fillDemoCredentials('accountant')}
                title="accountant@kiyumba.com / accountant123"
              >
                Accountant
              </button>
              <button 
                type="button" 
                className="demo-btn animateur" 
                onClick={() => fillDemoCredentials('animateur')}
                title="animateur@kiyumba.com / animateur123"
              >
                Animateur
              </button>
              <button 
                type="button" 
                className="demo-btn secretary" 
                onClick={() => fillDemoCredentials('secretary')}
                title="secretary@kiyumba.com / secretary123"
              >
                Secretary
              </button>
              <button 
                type="button" 
                className="demo-btn teacher" 
                onClick={() => fillDemoCredentials('teacher')}
                title="teacher@kiyumba.com / teacher123"
              >
                Teacher
              </button>
              <button 
                type="button" 
                className="demo-btn student" 
                onClick={() => fillDemoCredentials('student')}
                title="student@kiyumba.com / student123"
              >
                Student
              </button>
            </div>
            <div style={{marginTop: '12px', fontSize: '12px', color: '#666', textAlign: 'center'}}>
              <strong>Correct format:</strong> role@kiyumba.com (not @kiyumbaschool.com)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

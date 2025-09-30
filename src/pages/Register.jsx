import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, User, Mail, Lock, Phone, MapPin, ArrowLeft, Calendar } from 'lucide-react';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    program: '',
    level: '',
    previousSchool: '',
    reason: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const programs = [
    { value: 'software', label: 'Software Development' },
    { value: 'fashion', label: 'Fashion & Design' },
    { value: 'construction', label: 'Building Construction' },
    { value: 'wood', label: 'Wood Technology' }
  ];

  const levels = [
    { value: 'L3', label: 'Level 3 (L3)' },
    { value: 'L4', label: 'Level 4 (L4)' },
    { value: 'L5', label: 'Level 5 (L5)' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (!formData.program || !formData.level) {
      setError('Please select both program and level');
      setLoading(false);
      return;
    }

    // In production, this would send to an API
    const application = {
      id: Date.now(),
      ...formData,
      status: 'pending',
      appliedDate: new Date().toISOString(),
      role: 'applicant'
    };

    // Store in localStorage (in production, send to backend)
    const existingApplications = JSON.parse(localStorage.getItem('applications') || '[]');
    existingApplications.push(application);
    localStorage.setItem('applications', JSON.stringify(existingApplications));

    console.log('Application submitted:', application);
    
    setLoading(false);
    setSuccess(true);

    setTimeout(() => {
      navigate('/login');
    }, 3000);
  };

  if (success) {
    return (
      <div className="register-page">
        <Link to="/" className="back-button">
          <ArrowLeft size={20} />
          Back to Home
        </Link>
        <div className="register-container">
          <div className="success-card card">
            <div className="success-icon">
              <GraduationCap size={64} />
            </div>
            <h1>Application Submitted Successfully!</h1>
            <p>
              Thank you for applying to Kiyumba Technical School. Your application has been received 
              and is pending review by our admissions team.
            </p>
            <p>
              You will receive an email notification once your application has been reviewed. 
              This usually takes 2-3 business days.
            </p>
            <div className="success-actions">
              <Link to="/" className="btn btn-primary">Back to Home</Link>
              <Link to="/login" className="btn btn-outline">Login</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <Link to="/" className="back-button">
        <ArrowLeft size={20} />
        Back to Home
      </Link>

      <div className="register-container">
        <div className="register-card card">
          <div className="register-header">
            <div className="register-logo">
              <GraduationCap size={48} />
            </div>
            <h1>Apply to Kiyumba Technical School</h1>
            <p>Fill out the form below to submit your application</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form">
            {/* Personal Information */}
            <div className="form-section">
              <h3>Personal Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">
                    <User size={18} />
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">
                    <User size={18} />
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">
                    <Mail size={18} />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">
                    <Phone size={18} />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+250 XXX XXX XXX"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dateOfBirth">
                    <Calendar size={18} />
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">
                    <MapPin size={18} />
                    Address *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="City, District"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Account Security */}
            <div className="form-section">
              <h3>Account Security</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">
                    <Lock size={18} />
                    Password *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    <Lock size={18} />
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Program Selection */}
            <div className="form-section">
              <h3>Program Selection</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="program">
                    <GraduationCap size={18} />
                    Choose Your Program *
                  </label>
                  <select
                    id="program"
                    name="program"
                    value={formData.program}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a program</option>
                    {programs.map(prog => (
                      <option key={prog.value} value={prog.value}>
                        {prog.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="level">
                    Level *
                  </label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a level</option>
                    {levels.map(lvl => (
                      <option key={lvl.value} value={lvl.value}>
                        {lvl.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="form-section">
              <h3>Additional Information</h3>
              
              <div className="form-group">
                <label htmlFor="previousSchool">
                  Previous School
                </label>
                <input
                  type="text"
                  id="previousSchool"
                  name="previousSchool"
                  value={formData.previousSchool}
                  onChange={handleChange}
                  placeholder="Name of your previous school"
                />
              </div>

              <div className="form-group">
                <label htmlFor="reason">
                  Why do you want to join Kiyumba Technical School? *
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Tell us about your motivation..."
                  rows="4"
                  required
                ></textarea>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-large"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </form>

          <div className="register-footer">
            <p>Already have an account? <Link to="/login">Login here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

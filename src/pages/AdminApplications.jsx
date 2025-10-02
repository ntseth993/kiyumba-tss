import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CheckCircle, XCircle, Eye, Search, Filter } from 'lucide-react';
import './AdminApplications.css';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Resolve API base at runtime: try /config.json (runtime override), then VITE_API_URL, then same-origin
    const resolveApiBase = async () => {
      // attempt to read runtime config
      try {
        const cfgRes = await fetch('/config.json');
        if (cfgRes.ok) {
          const cfg = await cfgRes.json();
          if (cfg && cfg.VITE_API_URL) return cfg.VITE_API_URL.replace(/\/+$/, '');
        }
      } catch (e) {
        // ignore
      }
      // build-time env
      if (import.meta.env && import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
      // fallback to same-origin (useful if API is served from same host)
      return window.location.origin;
    };

    // Try loading applications from server API, fallback to localStorage
    const load = async () => {
      const API_BASE = await resolveApiBase();
      try {
        const res = await fetch(`${API_BASE.replace(/\/+$/, '')}/api/applications`);
        if (!res.ok) throw new Error('API fetch failed');
        const data = await res.json();
        // Map server fields to UI expected fields
        const mapped = data.map(a => ({
          id: a.id,
          firstName: a.first_name,
          lastName: a.last_name,
          email: a.email,
          phone: a.phone,
          program: a.program,
          level: a.level,
          address: a.address,
          dateOfBirth: a.date_of_birth,
          previousSchool: a.previous_school,
          reason: a.reason,
          status: a.status,
          appliedDate: a.applied_date
        }));
        setApplications(mapped);
        setFilteredApplications(mapped);
      } catch (err) {
        const stored = JSON.parse(localStorage.getItem('applications') || '[]');
        setApplications(stored);
        setFilteredApplications(stored);
      }
    };
    load();
  }, []);

  useEffect(() => {
    let filtered = applications;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(app => app.status === filterStatus);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredApplications(filtered);
  }, [filterStatus, searchTerm, applications]);

  const handleApprove = (application) => {
    // Try to update on server, fallback to localStorage
    const update = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${API_BASE}/api/applications/${application.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'approved' })
        });
        if (!res.ok) throw new Error('API update failed');
        // create user locally after success
        const newUser = {
          id: application.id,
          name: `${application.firstName} ${application.lastName}`,
          email: application.email,
          role: 'student',
          program: application.program,
          level: application.level,
          phone: application.phone,
          address: application.address,
          dateOfBirth: application.dateOfBirth,
          studentId: `STD${Date.now()}`,
          avatar: `https://ui-avatars.com/api/?name=${application.firstName}+${application.lastName}&background=10B981&color=fff`,
          enrolledDate: new Date().toISOString()
        };
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        // update UI
        const updated = applications.map(app => app.id === application.id ? { ...app, status: 'approved', approvedDate: new Date().toISOString() } : app);
        setApplications(updated);
        setFilteredApplications(updated);
        setSelectedApplication(null);
        alert('Application approved! Student account created.');
      } catch (err) {
        // fallback
        const updatedApplications = applications.map(app =>
          app.id === application.id
            ? { ...app, status: 'approved', approvedDate: new Date().toISOString() }
            : app
        );
        setApplications(updatedApplications);
        localStorage.setItem('applications', JSON.stringify(updatedApplications));
        const newUser = {
          id: application.id,
          name: `${application.firstName} ${application.lastName}`,
          email: application.email,
          role: 'student',
          program: application.program,
          level: application.level,
          phone: application.phone,
          address: application.address,
          dateOfBirth: application.dateOfBirth,
          studentId: `STD${Date.now()}`,
          avatar: `https://ui-avatars.com/api/?name=${application.firstName}+${application.lastName}&background=10B981&color=fff`,
          enrolledDate: new Date().toISOString()
        };
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        setSelectedApplication(null);
        alert('Application approved (offline). Student account created.');
      }
    };
    update();
  };

  const handleReject = (application) => {
    const update = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${API_BASE}/api/applications/${application.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'rejected' })
        });
        if (!res.ok) throw new Error('API update failed');
        const updated = applications.map(app => app.id === application.id ? { ...app, status: 'rejected', rejectedDate: new Date().toISOString() } : app);
        setApplications(updated);
        setFilteredApplications(updated);
        setSelectedApplication(null);
        alert('Application rejected.');
      } catch (err) {
        const updatedApplications = applications.map(app =>
          app.id === application.id
            ? { ...app, status: 'rejected', rejectedDate: new Date().toISOString() }
            : app
        );
        setApplications(updatedApplications);
        localStorage.setItem('applications', JSON.stringify(updatedApplications));
        setSelectedApplication(null);
        alert('Application rejected (offline).');
      }
    };
    update();
  };

  const getProgramLabel = (program) => {
    const programs = {
      software: 'Software Development',
      fashion: 'Fashion & Design',
      construction: 'Building Construction',
      wood: 'Wood Technology'
    };
    return programs[program] || program;
  };

  const statusCounts = {
    all: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    approved: applications.filter(app => app.status === 'approved').length,
    rejected: applications.filter(app => app.status === 'rejected').length
  };

  return (
    <div className="admin-applications">
      <Navbar />
      
      <div className="dashboard-container">
        <div className="page-header">
          <h1>Student Applications</h1>
          <p>Review and manage student applications</p>
        </div>

        {/* Statistics */}
        <div className="stats-grid">
          <div className="stat-card card">
            <div className="stat-content">
              <h3>{statusCounts.all}</h3>
              <p>Total Applications</p>
            </div>
          </div>
          <div className="stat-card card">
            <div className="stat-content">
              <h3>{statusCounts.pending}</h3>
              <p>Pending Review</p>
            </div>
          </div>
          <div className="stat-card card">
            <div className="stat-content">
              <h3>{statusCounts.approved}</h3>
              <p>Approved</p>
            </div>
          </div>
          <div className="stat-card card">
            <div className="stat-content">
              <h3>{statusCounts.rejected}</h3>
              <p>Rejected</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="applications-filters card">
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
              className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All ({statusCounts.all})
            </button>
            <button
              className={`filter-tab ${filterStatus === 'pending' ? 'active' : ''}`}
              onClick={() => setFilterStatus('pending')}
            >
              Pending ({statusCounts.pending})
            </button>
            <button
              className={`filter-tab ${filterStatus === 'approved' ? 'active' : ''}`}
              onClick={() => setFilterStatus('approved')}
            >
              Approved ({statusCounts.approved})
            </button>
            <button
              className={`filter-tab ${filterStatus === 'rejected' ? 'active' : ''}`}
              onClick={() => setFilterStatus('rejected')}
            >
              Rejected ({statusCounts.rejected})
            </button>
          </div>
        </div>

        {/* Applications List */}
        <div className="applications-section card">
          {filteredApplications.length === 0 ? (
            <div className="empty-state">
              <p>No applications found.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Email</th>
                    <th>Program</th>
                    <th>Level</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((application) => (
                    <tr key={application.id}>
                      <td className="applicant-name">
                        {application.firstName} {application.lastName}
                      </td>
                      <td>{application.email}</td>
                      <td>{getProgramLabel(application.program)}</td>
                      <td>{application.level}</td>
                      <td>
                        {new Date(application.appliedDate).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`status-badge ${application.status}`}>
                          {application.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon"
                            onClick={() => setSelectedApplication(application)}
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          {application.status === 'pending' && (
                            <>
                              <button
                                className="btn-icon approve"
                                onClick={() => handleApprove(application)}
                                title="Approve"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button
                                className="btn-icon reject"
                                onClick={() => handleReject(application)}
                                title="Reject"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Application Details Modal */}
        {selectedApplication && (
          <div className="modal-overlay" onClick={() => setSelectedApplication(null)}>
            <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Application Details</h2>
                <button
                  className="modal-close"
                  onClick={() => setSelectedApplication(null)}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Full Name</label>
                    <p>{selectedApplication.firstName} {selectedApplication.lastName}</p>
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <p>{selectedApplication.email}</p>
                  </div>
                  <div className="detail-item">
                    <label>Phone</label>
                    <p>{selectedApplication.phone}</p>
                  </div>
                  <div className="detail-item">
                    <label>Date of Birth</label>
                    <p>{new Date(selectedApplication.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                  <div className="detail-item">
                    <label>Address</label>
                    <p>{selectedApplication.address}</p>
                  </div>
                  <div className="detail-item">
                    <label>Program</label>
                    <p>{getProgramLabel(selectedApplication.program)}</p>
                  </div>
                  <div className="detail-item">
                    <label>Level</label>
                    <p>{selectedApplication.level}</p>
                  </div>
                  <div className="detail-item">
                    <label>Previous School</label>
                    <p>{selectedApplication.previousSchool || 'Not specified'}</p>
                  </div>
                  <div className="detail-item full-width">
                    <label>Reason for Joining</label>
                    <p>{selectedApplication.reason}</p>
                  </div>
                  <div className="detail-item">
                    <label>Status</label>
                    <span className={`status-badge ${selectedApplication.status}`}>
                      {selectedApplication.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Applied Date</label>
                    <p>{new Date(selectedApplication.appliedDate).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {selectedApplication.status === 'pending' && (
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleApprove(selectedApplication)}
                  >
                    <CheckCircle size={18} />
                    Approve Application
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => handleReject(selectedApplication)}
                    style={{ color: 'var(--error-color)', borderColor: 'var(--error-color)' }}
                  >
                    <XCircle size={18} />
                    Reject Application
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AdminApplications;

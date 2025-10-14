import { useAuth } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';
import './ImpersonationBanner.css';

const ImpersonationBanner = () => {
  const { user, stopImpersonation, isImpersonated, originalAdmin } = useAuth();

  if (!isImpersonated || !originalAdmin) {
    return null;
  }

  const handleStopImpersonation = () => {
    const result = stopImpersonation();
    if (result.success) {
      // Redirect back to admin dashboard
      window.location.href = '/admin/dashboard';
    }
  };

  return (
    <div className="impersonation-banner">
      <div className="impersonation-content">
        <div className="impersonation-info">
          <User size={16} />
          <span>
            You are viewing as <strong>{user.name}</strong> ({user.role})
          </span>
        </div>
        <div className="impersonation-admin">
          <span>Admin: {originalAdmin.name}</span>
        </div>
        <button 
          className="stop-impersonation-btn"
          onClick={handleStopImpersonation}
          title="Return to Admin Dashboard"
        >
          <LogOut size={16} />
          Exit Impersonation
        </button>
      </div>
    </div>
  );
};

export default ImpersonationBanner;

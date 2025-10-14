import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, DollarSign, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './QuickAccessFeatures.css';

const QuickAccessFeatures = () => {
  const { user } = useAuth();

  const features = [];

  // Attendance - for teachers, DOD, DOS, admin, staff
  if (['teacher', 'dod', 'dos', 'admin', 'staff'].includes(user?.role)) {
    features.push({
      title: 'Attendance Management',
      description: 'Mark and track daily student attendance',
      icon: Calendar,
      link: '/attendance',
      color: '#667eea'
    });
  }

  // Payments - for accountant, admin only
  if (['accountant', 'admin'].includes(user?.role)) {
    features.push({
      title: 'Payment Processing',
      description: 'Process student payments and generate receipts',
      icon: DollarSign,
      link: '/payments',
      color: '#10B981'
    });
  }

  // Reports - for all staff except students
  if (['teacher', 'dod', 'dos', 'admin', 'staff', 'secretary'].includes(user?.role)) {
    features.push({
      title: 'Report Cards',
      description: 'Generate comprehensive student report cards',
      icon: FileText,
      link: '/reports',
      color: '#8B5CF6'
    });
  }

  // Don't render if no features available
  if (features.length === 0) return null;

  return (
    <div className="quick-access-features">
      <h2 className="quick-access-title">Quick Access</h2>
      <div className="features-grid">
        {features.map((feature, index) => (
          <Link
            key={index}
            to={feature.link}
            className="feature-card"
            style={{ '--feature-color': feature.color }}
          >
            <div className="feature-icon" style={{ backgroundColor: `${feature.color}15` }}>
              <feature.icon size={32} color={feature.color} />
            </div>
            <div className="feature-content">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
            <div className="feature-arrow">→</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickAccessFeatures;

// src/components/departments/WODDashboard.jsx
import { useState, useEffect } from 'react';
import { Wrench, Users, Award, TrendingUp } from 'lucide-react';

const WODDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    workshops: 0,
    apprentices: 0,
    certifications: 0,
    projects: 0
  });

  useEffect(() => {
    setStats({
      workshops: 8,
      apprentices: 32,
      certifications: 45,
      projects: 15
    });
  }, []);

  return (
    <div className="department-dashboard wod-dashboard">
      <div className="dashboard-header">
        <div className="department-badge">
          <Wrench size={24} color="#10B981" />
          <span>Workshop of Development</span>
        </div>
        <h2>Technical Workshop Overview</h2>
        <p>Hands-on technical skills and workshop training</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeft: '4px solid #10B981' }}>
          <div className="stat-icon" style={{ backgroundColor: '#F0FDF4' }}>
            <Wrench size={24} color="#10B981" />
          </div>
          <div className="stat-content">
            <h3>{stats.workshops}</h3>
            <p>Active Workshops</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #3B82F6' }}>
          <div className="stat-icon" style={{ backgroundColor: '#DBEAFE' }}>
            <Users size={24} color="#3B82F6" />
          </div>
          <div className="stat-content">
            <h3>{stats.apprentices}</h3>
            <p>Apprentices</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #F59E0B' }}>
          <div className="stat-icon" style={{ backgroundColor: '#FEF3C7' }}>
            <Award size={24} color="#F59E0B" />
          </div>
          <div className="stat-content">
            <h3>{stats.certifications}</h3>
            <p>Certifications</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #8B5CF6' }}>
          <div className="stat-icon" style={{ backgroundColor: '#F3F4F6' }}>
            <TrendingUp size={24} color="#8B5CF6" />
          </div>
          <div className="stat-content">
            <h3>{stats.projects}</h3>
            <p>Live Projects</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WODDashboard;

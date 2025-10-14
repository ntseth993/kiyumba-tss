// src/components/departments/BUCDashboard.jsx
import { useState, useEffect } from 'react';
import { Building, Users, Award, TrendingUp } from 'lucide-react';

const BUCDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    internships: 0,
    placements: 0
  });

  useEffect(() => {
    setStats({
      courses: 15,
      students: 78,
      internships: 23,
      placements: 56
    });
  }, []);

  return (
    <div className="department-dashboard buc-dashboard">
      <div className="dashboard-header">
        <div className="department-badge">
          <Building size={24} color="#F59E0B" />
          <span>Business Unit Commerce</span>
        </div>
        <h2>Business & Commerce Overview</h2>
        <p>Business education and entrepreneurship</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeft: '4px solid #F59E0B' }}>
          <div className="stat-icon" style={{ backgroundColor: '#FEF3C7' }}>
            <Building size={24} color="#F59E0B" />
          </div>
          <div className="stat-content">
            <h3>{stats.courses}</h3>
            <p>Business Courses</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #10B981' }}>
          <div className="stat-icon" style={{ backgroundColor: '#F0FDF4' }}>
            <Users size={24} color="#10B981" />
          </div>
          <div className="stat-content">
            <h3>{stats.students}</h3>
            <p>Business Students</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BUCDashboard;

// src/components/departments/FashionDashboard.jsx
import { useState, useEffect } from 'react';
import { Scissors, Users, Award, TrendingUp } from 'lucide-react';

const FashionDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    designs: 0,
    students: 0,
    shows: 0,
    collections: 0
  });

  useEffect(() => {
    setStats({
      designs: 34,
      students: 28,
      shows: 5,
      collections: 12
    });
  }, []);

  return (
    <div className="department-dashboard fashion-dashboard">
      <div className="dashboard-header">
        <div className="department-badge">
          <Scissors size={24} color="#EC4899" />
          <span>Fashion Design</span>
        </div>
        <h2>Fashion Department Overview</h2>
        <p>Creative fashion design and textile arts</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeft: '4px solid #EC4899' }}>
          <div className="stat-icon" style={{ backgroundColor: '#FDF2F8' }}>
            <Scissors size={24} color="#EC4899" />
          </div>
          <div className="stat-content">
            <h3>{stats.designs}</h3>
            <p>Design Projects</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #8B5CF6' }}>
          <div className="stat-icon" style={{ backgroundColor: '#F3F4F6' }}>
            <Users size={24} color="#8B5CF6" />
          </div>
          <div className="stat-content">
            <h3>{stats.students}</h3>
            <p>Fashion Students</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FashionDashboard;

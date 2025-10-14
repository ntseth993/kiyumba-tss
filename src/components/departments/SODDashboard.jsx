// src/components/departments/SODDashboard.jsx
import { useState, useEffect } from 'react';
import { Palette, Users, Award, TrendingUp } from 'lucide-react';

const SODDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeStudents: 0,
    completedWorks: 0,
    upcomingExhibitions: 0
  });

  useEffect(() => {
    // Load SOD-specific data
    setStats({
      totalProjects: 12,
      activeStudents: 45,
      completedWorks: 89,
      upcomingExhibitions: 3
    });
  }, []);

  return (
    <div className="department-dashboard sod-dashboard">
      <div className="dashboard-header">
        <div className="department-badge">
          <Palette size={24} color="#8B5CF6" />
          <span>School of Design</span>
        </div>
        <h2>Design Department Overview</h2>
        <p>Creative projects and artistic development</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeft: '4px solid #8B5CF6' }}>
          <div className="stat-icon" style={{ backgroundColor: '#F3F4F6' }}>
            <Palette size={24} color="#8B5CF6" />
          </div>
          <div className="stat-content">
            <h3>{stats.totalProjects}</h3>
            <p>Active Projects</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #10B981' }}>
          <div className="stat-icon" style={{ backgroundColor: '#F0FDF4' }}>
            <Users size={24} color="#10B981" />
          </div>
          <div className="stat-content">
            <h3>{stats.activeStudents}</h3>
            <p>Design Students</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #F59E0B' }}>
          <div className="stat-icon" style={{ backgroundColor: '#FEF3C7' }}>
            <Award size={24} color="#F59E0B" />
          </div>
          <div className="stat-content">
            <h3>{stats.completedWorks}</h3>
            <p>Portfolio Pieces</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #EF4444' }}>
          <div className="stat-icon" style={{ backgroundColor: '#FEE2E2' }}>
            <TrendingUp size={24} color="#EF4444" />
          </div>
          <div className="stat-content">
            <h3>{stats.upcomingExhibitions}</h3>
            <p>Upcoming Shows</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <div className="section-header">
            <h3>Recent Design Projects</h3>
          </div>
          <div className="projects-list">
            <div className="project-card">
              <h4>Logo Design Collection</h4>
              <p>Brand identity projects for local businesses</p>
              <div className="project-meta">
                <span className="status active">In Progress</span>
                <span className="participants">12 students</span>
              </div>
            </div>
            <div className="project-card">
              <h4>Digital Art Exhibition</h4>
              <p>Mixed media digital artworks showcase</p>
              <div className="project-meta">
                <span className="status completed">Completed</span>
                <span className="participants">8 students</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h3>Design Resources</h3>
          </div>
          <div className="resources-list">
            <div className="resource-item">
              <Palette size={20} />
              <div>
                <h4>Adobe Creative Suite</h4>
                <p>Professional design software access</p>
              </div>
            </div>
            <div className="resource-item">
              <Users size={20} />
              <div>
                <h4>Design Studio</h4>
                <p>Equipped workspace for creative work</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SODDashboard;

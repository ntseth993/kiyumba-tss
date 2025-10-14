// src/components/departments/GeneralSubjectDashboard.jsx
import { useState, useEffect } from 'react';
import { BookOpen, Users, Award, Clock } from 'lucide-react';

const GeneralSubjectDashboard = ({ user, subjectName, subjectColor }) => {
  const [stats, setStats] = useState({
    classes: 0,
    students: 0,
    assignments: 0,
    avgGrade: 0
  });

  useEffect(() => {
    // Mock data based on subject
    const baseStats = {
      classes: Math.floor(Math.random() * 8) + 4,
      students: Math.floor(Math.random() * 50) + 20,
      assignments: Math.floor(Math.random() * 15) + 5,
      avgGrade: Math.floor(Math.random() * 20) + 70
    };
    setStats(baseStats);
  }, [subjectName]);

  return (
    <div className="department-dashboard general-dashboard">
      <div className="dashboard-header">
        <div className="department-badge">
          <BookOpen size={24} color={subjectColor} />
          <span>{subjectName} Department</span>
        </div>
        <h2>{subjectName} Overview</h2>
        <p>Teaching and learning activities</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeft: `4px solid ${subjectColor}` }}>
          <div className="stat-icon" style={{ backgroundColor: '#F8FAFC' }}>
            <BookOpen size={24} color={subjectColor} />
          </div>
          <div className="stat-content">
            <h3>{stats.classes}</h3>
            <p>Active Classes</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #10B981' }}>
          <div className="stat-icon" style={{ backgroundColor: '#F0FDF4' }}>
            <Users size={24} color="#10B981" />
          </div>
          <div className="stat-content">
            <h3>{stats.students}</h3>
            <p>Total Students</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #F59E0B' }}>
          <div className="stat-icon" style={{ backgroundColor: '#FEF3C7' }}>
            <Award size={24} color="#F59E0B" />
          </div>
          <div className="stat-content">
            <h3>{stats.assignments}</h3>
            <p>Assignments</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #8B5CF6' }}>
          <div className="stat-icon" style={{ backgroundColor: '#F3F4F6' }}>
            <Clock size={24} color="#8B5CF6" />
          </div>
          <div className="stat-content">
            <h3>{stats.avgGrade}%</h3>
            <p>Avg. Grade</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSubjectDashboard;

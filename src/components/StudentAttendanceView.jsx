import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, TrendingUp, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { attendanceService } from '../services/attendanceService';
import './StudentAttendanceView.css';

const StudentAttendanceView = () => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [stats, setStats] = useState({
    totalDays: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    percentage: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    try {
      // Get all attendance records
      const allRecords = attendanceService.getAttendanceByDate(new Date().toISOString().split('T')[0]);
      
      // Filter for current student
      const studentRecords = allRecords.filter(r => 
        r.studentId === user.studentId || r.email === user.email
      );

      // Calculate stats
      const present = studentRecords.filter(r => r.status === 'present').length;
      const absent = studentRecords.filter(r => r.status === 'absent').length;
      const late = studentRecords.filter(r => r.status === 'late').length;
      const excused = studentRecords.filter(r => r.status === 'excused').length;
      const total = studentRecords.length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

      setStats({
        totalDays: total,
        present,
        absent,
        late,
        excused,
        percentage
      });

      setAttendanceRecords(studentRecords.slice(0, 30)); // Last 30 records
      setLoading(false);
    } catch (error) {
      console.error('Error loading attendance:', error);
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle size={20} color="#10B981" />;
      case 'absent':
        return <XCircle size={20} color="#EF4444" />;
      case 'late':
        return <Clock size={20} color="#F59E0B" />;
      case 'excused':
        return <AlertCircle size={20} color="#3B82F6" />;
      default:
        return null;
    }
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status}`;
  };

  if (loading) {
    return (
      <div className="student-attendance-view">
        <div className="loading-state">Loading attendance data...</div>
      </div>
    );
  }

  return (
    <div className="student-attendance-view">
      <div className="attendance-header">
        <div className="header-content">
          <Calendar size={32} />
          <div>
            <h2>My Attendance</h2>
            <p>Track your attendance record</p>
          </div>
        </div>
      </div>

      {/* Attendance Stats */}
      <div className="attendance-stats-grid">
        <div className="stat-card overall">
          <div className="stat-icon">
            <TrendingUp size={28} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Attendance Rate</span>
            <strong className="stat-value">{stats.percentage}%</strong>
            <span className={`stat-status ${stats.percentage >= 90 ? 'good' : stats.percentage >= 75 ? 'average' : 'poor'}`}>
              {stats.percentage >= 90 ? 'Excellent' : stats.percentage >= 75 ? 'Good' : 'Needs Improvement'}
            </span>
          </div>
        </div>

        <div className="stat-card present">
          <div className="stat-icon">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Present</span>
            <strong className="stat-value">{stats.present}</strong>
            <span className="stat-subtitle">days</span>
          </div>
        </div>

        <div className="stat-card absent">
          <div className="stat-icon">
            <XCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Absent</span>
            <strong className="stat-value">{stats.absent}</strong>
            <span className="stat-subtitle">days</span>
          </div>
        </div>

        <div className="stat-card late">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Late</span>
            <strong className="stat-value">{stats.late}</strong>
            <span className="stat-subtitle">days</span>
          </div>
        </div>

        <div className="stat-card excused">
          <div className="stat-icon">
            <AlertCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Excused</span>
            <strong className="stat-value">{stats.excused}</strong>
            <span className="stat-subtitle">days</span>
          </div>
        </div>
      </div>

      {/* Attendance Alert */}
      {stats.percentage < 75 && (
        <div className="attendance-alert">
          <AlertCircle size={20} />
          <div>
            <strong>Low Attendance Warning</strong>
            <p>Your attendance is below 75%. Please improve your attendance to avoid academic penalties.</p>
          </div>
        </div>
      )}

      {/* Attendance History */}
      <div className="attendance-history">
        <h3>Attendance History</h3>
        {attendanceRecords.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} color="#94a3b8" />
            <p>No attendance records found</p>
          </div>
        ) : (
          <div className="attendance-table-container">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record, index) => (
                  <tr key={index}>
                    <td>
                      <div className="date-cell">
                        <Calendar size={16} />
                        <span>{new Date(record.date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td>
                      <div className="status-cell">
                        {getStatusIcon(record.status)}
                        <span className={getStatusClass(record.status)}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="remarks-text">
                        {record.remarks || '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Attendance Tips */}
      <div className="attendance-tips">
        <h3>Attendance Tips</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <CheckCircle size={20} color="#10B981" />
            <p><strong>Maintain 90%+</strong> attendance for excellent academic standing</p>
          </div>
          <div className="tip-card">
            <AlertCircle size={20} color="#F59E0B" />
            <p><strong>Below 75%</strong> may result in academic penalties</p>
          </div>
          <div className="tip-card">
            <Calendar size={20} color="#3B82F6" />
            <p><strong>Notify in advance</strong> for planned absences</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendanceView;

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Save,
  Download,
  Filter,
  Search
} from 'lucide-react';
import { comprehensiveStudentsService } from '../services/comprehensiveStudentsService';
import { attendanceService } from '../services/attendanceService';
import './AttendanceManagement.css';

const AttendanceManagement = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceData, setAttendanceData] = useState({});
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, late: 0, excused: 0 });
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [students, selectedClass, selectedDepartment, searchTerm]);

  useEffect(() => {
    loadAttendanceForDate();
  }, [selectedDate, filteredStudents]);

  const loadStudents = async () => {
    const allStudents = await comprehensiveStudentsService.getAllStudents();
    setStudents(allStudents);
  };

  const applyFilters = () => {
    let filtered = [...students];
    
    if (selectedClass !== 'All') {
      filtered = filtered.filter(s => s.class === selectedClass);
    }
    
    if (selectedDepartment !== 'All') {
      filtered = filtered.filter(s => s.department === selectedDepartment);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredStudents(filtered);
  };

  const loadAttendanceForDate = async () => {
    const records = await attendanceService.getAttendanceByDate(selectedDate);
    const attendanceMap = {};
    
    records.forEach(record => {
      attendanceMap[record.studentId] = {
        status: record.status,
        remarks: record.remarks
      };
    });
    
    // Initialize attendance for filtered students
    const initialData = {};
    filteredStudents.forEach(student => {
      initialData[student.id] = attendanceMap[student.id] || { status: 'present', remarks: '' };
    });
    
    setAttendanceData(initialData);
    calculateStats(initialData);
  };

  const calculateStats = (data) => {
    const statuses = Object.values(data);
    setStats({
      total: statuses.length,
      present: statuses.filter(s => s.status === 'present').length,
      absent: statuses.filter(s => s.status === 'absent').length,
      late: statuses.filter(s => s.status === 'late').length,
      excused: statuses.filter(s => s.status === 'excused').length
    });
  };

  const handleStatusChange = (studentId, status) => {
    const newData = {
      ...attendanceData,
      [studentId]: { ...attendanceData[studentId], status }
    };
    setAttendanceData(newData);
    calculateStats(newData);
  };

  const handleRemarksChange = (studentId, remarks) => {
    setAttendanceData({
      ...attendanceData,
      [studentId]: { ...attendanceData[studentId], remarks }
    });
  };

  const handleSaveAttendance = async () => {
    setLoading(true);
    setSaveStatus('Saving...');
    
    const attendanceRecords = filteredStudents.map(student => ({
      studentId: student.id,
      date: selectedDate,
      status: attendanceData[student.id]?.status || 'present',
      remarks: attendanceData[student.id]?.remarks || ''
    }));
    
    const result = await attendanceService.markBulkAttendance(attendanceRecords);
    
    if (result.success) {
      setSaveStatus('✓ Saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } else {
      setSaveStatus('✗ Failed to save');
      setTimeout(() => setSaveStatus(''), 3000);
    }
    
    setLoading(false);
  };

  const handleMarkAll = (status) => {
    const newData = {};
    filteredStudents.forEach(student => {
      newData[student.id] = { status, remarks: attendanceData[student.id]?.remarks || '' };
    });
    setAttendanceData(newData);
    calculateStats(newData);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircle size={16} color="#10B981" />;
      case 'absent': return <XCircle size={16} color="#EF4444" />;
      case 'late': return <Clock size={16} color="#F59E0B" />;
      case 'excused': return <AlertCircle size={16} color="#3B82F6" />;
      default: return null;
    }
  };

  const attendancePercentage = stats.total > 0 
    ? Math.round(((stats.present + stats.late) / stats.total) * 100) 
    : 0;

  return (
    <div className="attendance-management">
      <div className="attendance-header">
        <div className="header-left">
          <Calendar size={32} />
          <div>
            <h2>Attendance Management</h2>
            <p>Mark and track daily student attendance</p>
          </div>
        </div>
        <div className="header-right">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="attendance-stats">
        <div className="stat-card total">
          <Users size={24} />
          <div>
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Students</span>
          </div>
        </div>
        <div className="stat-card present">
          <CheckCircle size={24} />
          <div>
            <span className="stat-value">{stats.present}</span>
            <span className="stat-label">Present</span>
          </div>
        </div>
        <div className="stat-card absent">
          <XCircle size={24} />
          <div>
            <span className="stat-value">{stats.absent}</span>
            <span className="stat-label">Absent</span>
          </div>
        </div>
        <div className="stat-card late">
          <Clock size={24} />
          <div>
            <span className="stat-value">{stats.late}</span>
            <span className="stat-label">Late</span>
          </div>
        </div>
        <div className="stat-card excused">
          <AlertCircle size={24} />
          <div>
            <span className="stat-value">{stats.excused}</span>
            <span className="stat-label">Excused</span>
          </div>
        </div>
        <div className="stat-card percentage">
          <div className="percentage-circle">
            <span>{attendancePercentage}%</span>
          </div>
          <span className="stat-label">Attendance Rate</span>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="attendance-controls">
        <div className="filters">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            <option value="All">All Classes</option>
            <option value="L3">L3</option>
            <option value="L4">L4</option>
            <option value="L5">L5</option>
          </select>

          <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
            <option value="All">All Departments</option>
            <option value="SOD">SOD</option>
            <option value="Fashion">Fashion</option>
            <option value="BUC">BUC</option>
            <option value="Wood Technology">Wood Technology</option>
          </select>
        </div>

        <div className="quick-actions">
          <button className="btn-quick present" onClick={() => handleMarkAll('present')}>
            <CheckCircle size={16} /> Mark All Present
          </button>
          <button className="btn-quick absent" onClick={() => handleMarkAll('absent')}>
            <XCircle size={16} /> Mark All Absent
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="attendance-table-container">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Class</th>
              <th>Department</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                  No students found
                </td>
              </tr>
            ) : (
              filteredStudents.map(student => (
                <tr key={student.id}>
                  <td>{student.studentId}</td>
                  <td className="student-name">{student.name}</td>
                  <td>{student.class}</td>
                  <td>{student.department}</td>
                  <td>
                    <div className="status-buttons">
                      <button
                        className={`status-btn present ${attendanceData[student.id]?.status === 'present' ? 'active' : ''}`}
                        onClick={() => handleStatusChange(student.id, 'present')}
                        title="Present"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        className={`status-btn absent ${attendanceData[student.id]?.status === 'absent' ? 'active' : ''}`}
                        onClick={() => handleStatusChange(student.id, 'absent')}
                        title="Absent"
                      >
                        <XCircle size={18} />
                      </button>
                      <button
                        className={`status-btn late ${attendanceData[student.id]?.status === 'late' ? 'active' : ''}`}
                        onClick={() => handleStatusChange(student.id, 'late')}
                        title="Late"
                      >
                        <Clock size={18} />
                      </button>
                      <button
                        className={`status-btn excused ${attendanceData[student.id]?.status === 'excused' ? 'active' : ''}`}
                        onClick={() => handleStatusChange(student.id, 'excused')}
                        title="Excused"
                      >
                        <AlertCircle size={18} />
                      </button>
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      className="remarks-input"
                      placeholder="Add remarks..."
                      value={attendanceData[student.id]?.remarks || ''}
                      onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Save Button */}
      <div className="attendance-footer">
        <div className="save-status">{saveStatus}</div>
        <button 
          className="btn-save" 
          onClick={handleSaveAttendance}
          disabled={loading || filteredStudents.length === 0}
        >
          <Save size={18} />
          {loading ? 'Saving...' : 'Save Attendance'}
        </button>
      </div>
    </div>
  );
};

export default AttendanceManagement;

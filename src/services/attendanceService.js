// Attendance Management Service
// Handles daily attendance tracking, reports, and analytics

const initializeAttendance = () => {
  const existing = localStorage.getItem('attendanceRecords');
  if (!existing) {
    localStorage.setItem('attendanceRecords', JSON.stringify([]));
  }
};

export const attendanceService = {
  // Mark attendance for a student
  async markAttendance(studentId, date, status, remarks = '') {
    try {
      initializeAttendance();
      const records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
      
      // Check if attendance already exists for this student on this date
      const existingIndex = records.findIndex(
        r => r.studentId === studentId && r.date === date
      );
      
      const record = {
        id: existingIndex >= 0 ? records[existingIndex].id : Date.now(),
        studentId,
        date,
        status, // 'present', 'absent', 'late', 'excused'
        remarks,
        markedAt: new Date().toISOString(),
        markedBy: 'current_user' // Should be replaced with actual user
      };
      
      if (existingIndex >= 0) {
        records[existingIndex] = record;
      } else {
        records.push(record);
      }
      
      localStorage.setItem('attendanceRecords', JSON.stringify(records));
      return { success: true, record };
    } catch (error) {
      console.error('Error marking attendance:', error);
      return { success: false, error: error.message };
    }
  },

  // Mark attendance for multiple students (bulk)
  async markBulkAttendance(attendanceData) {
    try {
      initializeAttendance();
      const records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
      const newRecords = [];
      
      for (const data of attendanceData) {
        const existingIndex = records.findIndex(
          r => r.studentId === data.studentId && r.date === data.date
        );
        
        const record = {
          id: existingIndex >= 0 ? records[existingIndex].id : Date.now() + Math.random(),
          studentId: data.studentId,
          date: data.date,
          status: data.status,
          remarks: data.remarks || '',
          markedAt: new Date().toISOString(),
          markedBy: 'current_user'
        };
        
        if (existingIndex >= 0) {
          records[existingIndex] = record;
        } else {
          records.push(record);
        }
        
        newRecords.push(record);
      }
      
      localStorage.setItem('attendanceRecords', JSON.stringify(records));
      return { success: true, records: newRecords };
    } catch (error) {
      console.error('Error marking bulk attendance:', error);
      return { success: false, error: error.message };
    }
  },

  // Get attendance for a specific date
  async getAttendanceByDate(date) {
    try {
      initializeAttendance();
      const records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
      return records.filter(r => r.date === date);
    } catch (error) {
      console.error('Error fetching attendance by date:', error);
      return [];
    }
  },

  // Get attendance for a student
  async getStudentAttendance(studentId, startDate = null, endDate = null) {
    try {
      initializeAttendance();
      let records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
      records = records.filter(r => r.studentId === studentId);
      
      if (startDate && endDate) {
        records = records.filter(r => r.date >= startDate && r.date <= endDate);
      }
      
      return records;
    } catch (error) {
      console.error('Error fetching student attendance:', error);
      return [];
    }
  },

  // Get attendance for a class
  async getClassAttendance(classLevel, date) {
    try {
      initializeAttendance();
      const records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
      // This would need to be joined with student data to filter by class
      return records.filter(r => r.date === date);
    } catch (error) {
      console.error('Error fetching class attendance:', error);
      return [];
    }
  },

  // Calculate attendance percentage for a student
  async calculateAttendancePercentage(studentId, startDate = null, endDate = null) {
    try {
      const records = await this.getStudentAttendance(studentId, startDate, endDate);
      if (records.length === 0) return 0;
      
      const presentCount = records.filter(r => r.status === 'present' || r.status === 'late').length;
      const percentage = (presentCount / records.length) * 100;
      
      return Math.round(percentage * 10) / 10; // Round to 1 decimal
    } catch (error) {
      console.error('Error calculating attendance percentage:', error);
      return 0;
    }
  },

  // Get attendance statistics
  async getAttendanceStats(date) {
    try {
      const records = await this.getAttendanceByDate(date);
      
      return {
        total: records.length,
        present: records.filter(r => r.status === 'present').length,
        absent: records.filter(r => r.status === 'absent').length,
        late: records.filter(r => r.status === 'late').length,
        excused: records.filter(r => r.status === 'excused').length,
        percentage: records.length > 0 
          ? Math.round((records.filter(r => r.status === 'present' || r.status === 'late').length / records.length) * 100)
          : 0
      };
    } catch (error) {
      console.error('Error getting attendance stats:', error);
      return { total: 0, present: 0, absent: 0, late: 0, excused: 0, percentage: 0 };
    }
  },

  // Get attendance report for date range
  async getAttendanceReport(startDate, endDate, filters = {}) {
    try {
      initializeAttendance();
      let records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
      
      // Filter by date range
      records = records.filter(r => r.date >= startDate && r.date <= endDate);
      
      // Apply additional filters
      if (filters.studentId) {
        records = records.filter(r => r.studentId === filters.studentId);
      }
      if (filters.status) {
        records = records.filter(r => r.status === filters.status);
      }
      
      return records;
    } catch (error) {
      console.error('Error generating attendance report:', error);
      return [];
    }
  },

  // Delete attendance record
  async deleteAttendance(recordId) {
    try {
      initializeAttendance();
      const records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
      const filtered = records.filter(r => r.id !== recordId);
      localStorage.setItem('attendanceRecords', JSON.stringify(filtered));
      return { success: true };
    } catch (error) {
      console.error('Error deleting attendance:', error);
      return { success: false, error: error.message };
    }
  },

  // Get students with low attendance
  async getStudentsWithLowAttendance(threshold = 75) {
    try {
      initializeAttendance();
      const records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
      
      // Group by student
      const studentAttendance = {};
      records.forEach(record => {
        if (!studentAttendance[record.studentId]) {
          studentAttendance[record.studentId] = { total: 0, present: 0 };
        }
        studentAttendance[record.studentId].total++;
        if (record.status === 'present' || record.status === 'late') {
          studentAttendance[record.studentId].present++;
        }
      });
      
      // Calculate percentages and filter
      const lowAttendanceStudents = [];
      Object.keys(studentAttendance).forEach(studentId => {
        const data = studentAttendance[studentId];
        const percentage = (data.present / data.total) * 100;
        if (percentage < threshold) {
          lowAttendanceStudents.push({
            studentId: parseInt(studentId),
            percentage: Math.round(percentage * 10) / 10,
            totalDays: data.total,
            presentDays: data.present
          });
        }
      });
      
      return lowAttendanceStudents;
    } catch (error) {
      console.error('Error fetching low attendance students:', error);
      return [];
    }
  }
};

// Club Attendance Service for tracking student attendance at club meetings
const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const useLocalStorage = !import.meta.env.VITE_API_BASE;

// Get all attendance records
export const getAttendanceRecords = async () => {
  if (useLocalStorage) {
    return JSON.parse(localStorage.getItem('clubAttendance') || '[]');
  }

  try {
    const response = await fetch(`${API_BASE}/club-attendance`);
    if (!response.ok) throw new Error('Failed to fetch attendance');
    return await response.json();
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return JSON.parse(localStorage.getItem('clubAttendance') || '[]');
  }
};

// Get attendance for specific club
export const getClubAttendance = async (clubId) => {
  const records = await getAttendanceRecords();
  return records.filter(r => r.clubId === clubId);
};

// Get attendance for specific student
export const getStudentAttendance = async (studentId) => {
  const records = await getAttendanceRecords();
  return records.filter(r => r.studentId === studentId);
};

// Record attendance for a meeting
export const recordAttendance = async (attendanceData) => {
  if (useLocalStorage) {
    const records = JSON.parse(localStorage.getItem('clubAttendance') || '[]');
    const newRecord = {
      id: Date.now(),
      ...attendanceData,
      createdAt: new Date().toISOString()
    };
    const updated = [newRecord, ...records];
    localStorage.setItem('clubAttendance', JSON.stringify(updated));
    return newRecord;
  }

  try {
    const response = await fetch(`${API_BASE}/club-attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attendanceData),
    });
    if (!response.ok) throw new Error('Failed to record attendance');
    return await response.json();
  } catch (error) {
    console.error('Error recording attendance:', error);
    throw error;
  }
};

// Update attendance record
export const updateAttendance = async (id, updates) => {
  if (useLocalStorage) {
    const records = JSON.parse(localStorage.getItem('clubAttendance') || '[]');
    const updated = records.map(r => 
      r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
    );
    localStorage.setItem('clubAttendance', JSON.stringify(updated));
    return updated.find(r => r.id === id);
  }

  try {
    const response = await fetch(`${API_BASE}/club-attendance?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update attendance');
    return await response.json();
  } catch (error) {
    console.error('Error updating attendance:', error);
    throw error;
  }
};

// Delete attendance record
export const deleteAttendance = async (id) => {
  if (useLocalStorage) {
    const records = JSON.parse(localStorage.getItem('clubAttendance') || '[]');
    const updated = records.filter(r => r.id !== id);
    localStorage.setItem('clubAttendance', JSON.stringify(updated));
    return true;
  }

  try {
    const response = await fetch(`${API_BASE}/club-attendance?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete attendance');
    return true;
  } catch (error) {
    console.error('Error deleting attendance:', error);
    throw error;
  }
};

// Get attendance statistics for a club
export const getClubAttendanceStats = async (clubId) => {
  const records = await getClubAttendance(clubId);
  const uniqueMeetings = [...new Set(records.map(r => r.meetingDate))];
  
  const totalMeetings = uniqueMeetings.length;
  const totalAttendance = records.filter(r => r.attended).length;
  const totalAbsences = records.filter(r => !r.attended).length;
  
  return {
    totalMeetings,
    totalAttendance,
    totalAbsences,
    attendanceRate: totalMeetings > 0 
      ? Math.round((totalAttendance / (totalAttendance + totalAbsences)) * 100)
      : 0
  };
};

// Get attendance statistics for a student in a specific club
export const getStudentClubAttendanceStats = async (studentId, clubId) => {
  const records = await getAttendanceRecords();
  const studentRecords = records.filter(r => r.studentId === studentId && r.clubId === clubId);
  
  const totalMeetings = studentRecords.length;
  const attended = studentRecords.filter(r => r.attended).length;
  const absent = studentRecords.filter(r => !r.attended).length;
  
  return {
    totalMeetings,
    attended,
    absent,
    attendanceRate: totalMeetings > 0 
      ? Math.round((attended / totalMeetings) * 100)
      : 0
  };
};

// Bulk record attendance for a meeting
export const recordBulkAttendance = async (clubId, clubName, meetingDate, attendanceList) => {
  const records = attendanceList.map(item => ({
    clubId,
    clubName,
    studentId: item.studentId,
    studentName: item.studentName,
    studentClass: item.studentClass,
    studentDepartment: item.studentDepartment,
    meetingDate,
    attended: item.attended,
    notes: item.notes || ''
  }));

  const savedRecords = [];
  for (const record of records) {
    const saved = await recordAttendance(record);
    savedRecords.push(saved);
  }

  return savedRecords;
};

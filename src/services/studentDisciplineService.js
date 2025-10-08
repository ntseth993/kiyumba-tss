const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const getAllDisciplineRecords = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/student-discipline`);
    return await response.json();
  } catch (error) {
    console.error('Get discipline records error:', error);
    return [];
  }
};

export const getStudentDisciplineRecords = async (studentId) => {
  try {
    const response = await fetch(`${API_BASE}/api/student-discipline?student_id=${studentId}`);
    return await response.json();
  } catch (error) {
    console.error('Get student discipline error:', error);
    return [];
  }
};

export const createDisciplineRecord = async (studentId, offense, description, consequence, startDate, endDate, issuedBy) => {
  try {
    const response = await fetch(`${API_BASE}/api/student-discipline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: studentId,
        offense: offense,
        description: description,
        consequence: consequence,
        start_date: startDate,
        end_date: endDate,
        issued_by: issuedBy
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Create discipline record error:', error);
    throw error;
  }
};

export const updateDisciplineRecord = async (recordId, status, consequence, endDate) => {
  try {
    const response = await fetch(`${API_BASE}/api/student-discipline`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: recordId,
        status: status,
        consequence: consequence,
        end_date: endDate
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Update discipline record error:', error);
    throw error;
  }
};

export const deleteDisciplineRecord = async (recordId) => {
  try {
    const response = await fetch(`${API_BASE}/api/student-discipline?id=${recordId}`, {
      method: 'DELETE'
    });
    return await response.json();
  } catch (error) {
    console.error('Delete discipline record error:', error);
    throw error;
  }
};

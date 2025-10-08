const API_BASE = import.meta.env.VITE_API_URL || '';

export const getSubjects = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/subjects`);
    if (!response.ok) throw new Error('Failed to fetch subjects');
    return await response.json();
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
};

export const getClasses = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/classes`);
    if (!response.ok) throw new Error('Failed to fetch classes');
    return await response.json();
  } catch (error) {
    console.error('Error fetching classes:', error);
    return [];
  }
};

export const getTeacherSubjects = async (teacherId) => {
  try {
    const response = await fetch(`${API_BASE}/api/teacher-subjects?teacher_id=${teacherId}`);
    if (!response.ok) throw new Error('Failed to fetch teacher subjects');
    return await response.json();
  } catch (error) {
    console.error('Error fetching teacher subjects:', error);
    return [];
  }
};

export const assignTeacherSubject = async (teacherId, subjectId, classId) => {
  try {
    const response = await fetch(`${API_BASE}/api/teacher-subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teacher_id: teacherId,
        subject_id: subjectId,
        class_id: classId
      })
    });
    if (!response.ok) throw new Error('Failed to assign subject');
    return await response.json();
  } catch (error) {
    console.error('Error assigning subject:', error);
    throw error;
  }
};

export const removeTeacherSubject = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/api/teacher-subjects?id=${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to remove subject');
    return true;
  } catch (error) {
    console.error('Error removing subject:', error);
    throw error;
  }
};

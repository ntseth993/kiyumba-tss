const API_BASE = import.meta.env.VITE_API_URL || '';

export const getAssessments = async (teacherId = null, studentView = false) => {
  try {
    let url = `${API_BASE}/api/assessments`;
    if (teacherId) {
      url += `?teacher_id=${teacherId}`;
    } else if (studentView) {
      url += `?student_view=true`;
    }
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch assessments');
    return await response.json();
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return [];
  }
};

export const createAssessment = async (assessmentData) => {
  try {
    const response = await fetch(`${API_BASE}/api/assessments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessmentData)
    });
    if (!response.ok) throw new Error('Failed to create assessment');
    return await response.json();
  } catch (error) {
    console.error('Error creating assessment:', error);
    throw error;
  }
};

export const updateAssessment = async (id, assessmentData) => {
  try {
    const response = await fetch(`${API_BASE}/api/assessments?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessmentData)
    });
    if (!response.ok) throw new Error('Failed to update assessment');
    return await response.json();
  } catch (error) {
    console.error('Error updating assessment:', error);
    throw error;
  }
};

export const deleteAssessment = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/api/assessments?id=${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete assessment');
    return true;
  } catch (error) {
    console.error('Error deleting assessment:', error);
    throw error;
  }
};

export const sendAssessmentToStudents = async (assessmentId, studentIds) => {
  try {
    const response = await fetch(`${API_BASE}/api/assessments/${assessmentId}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentIds })
    });
    if (!response.ok) throw new Error('Failed to send assessment to students');
    return await response.json();
  } catch (error) {
    console.error('Error sending assessment to students:', error);
    throw error;
  }
};

export const getAssessmentsByTeacher = async (teacherId) => {
  try {
    const response = await fetch(`${API_BASE}/api/assessments/teacher/${teacherId}`);
    if (!response.ok) throw new Error('Failed to fetch teacher assessments');
    return await response.json();
  } catch (error) {
    console.error('Error fetching teacher assessments:', error);
    return [];
  }
};

export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

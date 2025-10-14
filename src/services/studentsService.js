const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// Initialize sample students data
const initializeStudents = () => {
  const existing = localStorage.getItem('students');
  if (!existing) {
    const sampleStudents = [
      { id: 1, name: 'Alice Johnson', email: 'alice@school.com', grade: '10th', status: 'Active', createdAt: new Date().toISOString() },
      { id: 2, name: 'Bob Smith', email: 'bob@school.com', grade: '9th', status: 'Active', createdAt: new Date().toISOString() },
      { id: 3, name: 'Carol Williams', email: 'carol@school.com', grade: '11th', status: 'Active', createdAt: new Date().toISOString() },
      { id: 4, name: 'David Brown', email: 'david@school.com', grade: '10th', status: 'Inactive', createdAt: new Date().toISOString() }
    ];
    localStorage.setItem('students', JSON.stringify(sampleStudents));
  }
};

// Students Service
export const studentsService = {
  async getStudents() {
    try {
      // Initialize sample data if not exists
      initializeStudents();

      const response = await fetch(`${API_BASE}/students`);
      if (!response.ok) throw new Error('Failed to fetch students');
      return await response.json();
    } catch (error) {
      console.error('Error fetching students:', error);
      // Fallback to localStorage
      initializeStudents();
      const stored = localStorage.getItem('students');
      return stored ? JSON.parse(stored) : [];
    }
  },

  async createStudent(studentData) {
    try {
      const response = await fetch(`${API_BASE}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
      if (!response.ok) throw new Error('Failed to create student');
      return await response.json();
    } catch (error) {
      console.error('Error creating student:', error);
      // Fallback to localStorage
      const students = await this.getStudents();
      const newStudent = {
        id: Date.now(),
        ...studentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      students.push(newStudent);
      localStorage.setItem('students', JSON.stringify(students));
      return newStudent;
    }
  },

  async updateStudent(id, studentData) {
    try {
      const response = await fetch(`${API_BASE}/students?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
      if (!response.ok) throw new Error('Failed to update student');
      return await response.json();
    } catch (error) {
      console.error('Error updating student:', error);
      // Fallback to localStorage
      const students = await this.getStudents();
      const index = students.findIndex(s => s.id === id);
      if (index !== -1) {
        students[index] = {
          ...students[index],
          ...studentData,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('students', JSON.stringify(students));
        return students[index];
      }
      throw new Error('Student not found');
    }
  },

  async deleteStudent(id) {
    try {
      const response = await fetch(`${API_BASE}/students?id=${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete student');
      return true;
    } catch (error) {
      console.error('Error deleting student:', error);
      // Fallback to localStorage
      const students = await this.getStudents();
      const filtered = students.filter(s => s.id !== id);
      localStorage.setItem('students', JSON.stringify(filtered));
      return true;
    }
  }
};

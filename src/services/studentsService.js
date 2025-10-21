const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// Initialize sample students data
const initializeStudents = () => {
  const existing = localStorage.getItem('students');
  if (!existing) {
    const sampleStudents = [
      // SOD Department - L3
      { id: 1, name: 'Alice Johnson', email: 'alice@school.com', class: 'L3', department: 'sod', status: 'Active', createdAt: new Date().toISOString() },
      { id: 2, name: 'Bob Smith', email: 'bob@school.com', class: 'L3', department: 'sod', status: 'Active', createdAt: new Date().toISOString() },
      { id: 3, name: 'Carol Williams', email: 'carol@school.com', class: 'L3', department: 'sod', status: 'Active', createdAt: new Date().toISOString() },
      
      // SOD Department - L4
      { id: 4, name: 'David Brown', email: 'david@school.com', class: 'L4', department: 'sod', status: 'Active', createdAt: new Date().toISOString() },
      { id: 5, name: 'Emma Davis', email: 'emma@school.com', class: 'L4', department: 'sod', status: 'Active', createdAt: new Date().toISOString() },
      
      // Fashion Department - L3
      { id: 6, name: 'Frank Miller', email: 'frank@school.com', class: 'L3', department: 'fashion', status: 'Active', createdAt: new Date().toISOString() },
      { id: 7, name: 'Grace Wilson', email: 'grace@school.com', class: 'L3', department: 'fashion', status: 'Active', createdAt: new Date().toISOString() },
      
      // BUC Department - L3
      { id: 8, name: 'Henry Moore', email: 'henry@school.com', class: 'L3', department: 'buc', status: 'Active', createdAt: new Date().toISOString() },
      { id: 9, name: 'Ivy Taylor', email: 'ivy@school.com', class: 'L3', department: 'buc', status: 'Active', createdAt: new Date().toISOString() },
      
      // Wood Technology - L3
      { id: 10, name: 'Jack Anderson', email: 'jack@school.com', class: 'L3', department: 'wod', status: 'Active', createdAt: new Date().toISOString() },
      { id: 11, name: 'Kate Thomas', email: 'kate@school.com', class: 'L3', department: 'wod', status: 'Active', createdAt: new Date().toISOString() },
      
      // SOD Department - L5
      { id: 12, name: 'Liam Jackson', email: 'liam@school.com', class: 'L5', department: 'sod', status: 'Active', createdAt: new Date().toISOString() },
      { id: 13, name: 'Mia White', email: 'mia@school.com', class: 'L5', department: 'sod', status: 'Active', createdAt: new Date().toISOString() },
      
      // Fashion Department - L4
      { id: 14, name: 'Noah Harris', email: 'noah@school.com', class: 'L4', department: 'fashion', status: 'Active', createdAt: new Date().toISOString() },
      { id: 15, name: 'Olivia Martin', email: 'olivia@school.com', class: 'L4', department: 'fashion', status: 'Active', createdAt: new Date().toISOString() }
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
  },

  async getStudentsByClass(className) {
    const students = await this.getStudents();
    return students.filter(s => s.class === className && s.status === 'Active');
  },

  async getStudentsByDepartment(department) {
    const students = await this.getStudents();
    return students.filter(s => s.department === department && s.status === 'Active');
  },

  async getStudentsByClassAndDepartment(className, department) {
    const students = await this.getStudents();
    return students.filter(s => s.class === className && s.department === department && s.status === 'Active');
  }
};

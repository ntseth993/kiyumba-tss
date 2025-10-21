// Marks Service for managing student marks
const MARKS_STORAGE_KEY = 'student_marks';

// Initialize marks storage
const initializeMarks = () => {
  const existing = localStorage.getItem(MARKS_STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(MARKS_STORAGE_KEY, JSON.stringify([]));
  }
};

// Helper function to calculate grade
export const calculateGrade = (mark, maxMark = 100) => {
  const percentage = (mark / maxMark) * 100;
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  if (percentage >= 50) return 'E';
  return 'F';
};

export const marksService = {
  // Get all marks
  async getAllMarks() {
    initializeMarks();
    const marks = localStorage.getItem(MARKS_STORAGE_KEY);
    return marks ? JSON.parse(marks) : [];
  },

  // Get marks by teacher
  async getMarksByTeacher(teacherId) {
    const allMarks = await this.getAllMarks();
    return allMarks.filter(m => m.teacherId === teacherId);
  },

  // Get marks by student
  async getMarksByStudent(studentId) {
    const allMarks = await this.getAllMarks();
    return allMarks.filter(m => m.studentId === studentId);
  },

  // Get marks by class
  async getMarksByClass(className) {
    const allMarks = await this.getAllMarks();
    return allMarks.filter(m => m.class === className);
  },

  // Get marks by department
  async getMarksByDepartment(department) {
    const allMarks = await this.getAllMarks();
    return allMarks.filter(m => m.department === department);
  },

  // Get marks by class and subject
  async getMarksByClassAndSubject(className, subjectId) {
    const allMarks = await this.getAllMarks();
    return allMarks.filter(m => m.class === className && m.subjectId === subjectId);
  },

  // Create a new mark entry
  async createMark(markData) {
    const allMarks = await this.getAllMarks();
    const newMark = {
      id: Date.now(),
      ...markData,
      grade: calculateGrade(markData.mark, markData.maxMark || 100),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    allMarks.push(newMark);
    localStorage.setItem(MARKS_STORAGE_KEY, JSON.stringify(allMarks));
    return newMark;
  },

  // Update a mark entry
  async updateMark(markId, markData) {
    const allMarks = await this.getAllMarks();
    const index = allMarks.findIndex(m => m.id === markId);
    
    if (index !== -1) {
      allMarks[index] = {
        ...allMarks[index],
        ...markData,
        grade: calculateGrade(markData.mark || allMarks[index].mark, markData.maxMark || allMarks[index].maxMark || 100),
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(MARKS_STORAGE_KEY, JSON.stringify(allMarks));
      return allMarks[index];
    }
    throw new Error('Mark not found');
  },

  // Delete a mark entry
  async deleteMark(markId) {
    const allMarks = await this.getAllMarks();
    const filtered = allMarks.filter(m => m.id !== markId);
    localStorage.setItem(MARKS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  // Get marks summary for a class
  async getClassMarksSummary(className) {
    const classMarks = await this.getMarksByClass(className);
    
    // Group by subject
    const subjectGroups = {};
    classMarks.forEach(mark => {
      if (!subjectGroups[mark.subjectId]) {
        subjectGroups[mark.subjectId] = {
          subjectId: mark.subjectId,
          subjectName: mark.subjectName,
          marks: []
        };
      }
      subjectGroups[mark.subjectId].marks.push(mark);
    });

    return Object.values(subjectGroups);
  },

  // Get student marks summary
  async getStudentMarksSummary(studentId) {
    const studentMarks = await this.getMarksByStudent(studentId);
    
    const summary = {
      totalSubjects: 0,
      averageMark: 0,
      highestMark: 0,
      lowestMark: 100,
      marks: studentMarks
    };

    if (studentMarks.length > 0) {
      summary.totalSubjects = studentMarks.length;
      const totalMarks = studentMarks.reduce((sum, m) => sum + (m.mark / (m.maxMark || 100)) * 100, 0);
      summary.averageMark = totalMarks / studentMarks.length;
      summary.highestMark = Math.max(...studentMarks.map(m => (m.mark / (m.maxMark || 100)) * 100));
      summary.lowestMark = Math.min(...studentMarks.map(m => (m.mark / (m.maxMark || 100)) * 100));
    }

    return summary;
  }
};

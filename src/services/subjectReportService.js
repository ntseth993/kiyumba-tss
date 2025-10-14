// Subject Report Service for DOS Dashboard
// Manages core and non-core subjects by department and level

// Non-core subjects (common to all departments and levels)
export const NON_CORE_SUBJECTS = [
  'Mathematics',
  'Kinyarwanda',
  'French',
  'English',
  'Physics',
  'Sport',
  'ICT'
];

// Core subjects by department
export const CORE_SUBJECTS_BY_DEPARTMENT = {
  SOD: [
    'Software Development',
    'Database Management',
    'Web Development',
    'Mobile App Development',
    'System Analysis',
    'Network Administration'
  ],
  Fashion: [
    'Fashion Design',
    'Pattern Making',
    'Textile Science',
    'Garment Construction',
    'Fashion Illustration',
    'Fashion Marketing'
  ],
  BUC: [
    'Business Management',
    'Accounting',
    'Economics',
    'Marketing',
    'Entrepreneurship',
    'Business Communication'
  ],
  'Wood Technology': [
    'Carpentry',
    'Wood Finishing',
    'Furniture Design',
    'Wood Machinery',
    'Technical Drawing',
    'Wood Materials Science'
  ]
};

export const subjectReportService = {
  // Get all subjects for a specific department
  getSubjectsForDepartment(department) {
    const coreSubjects = CORE_SUBJECTS_BY_DEPARTMENT[department] || [];
    return {
      core: coreSubjects,
      nonCore: NON_CORE_SUBJECTS,
      all: [...coreSubjects, ...NON_CORE_SUBJECTS]
    };
  },

  // Generate subject report for a student
  async generateStudentSubjectReport(studentId, term = 'Term 1') {
    try {
      const students = JSON.parse(localStorage.getItem('comprehensiveStudents') || '[]');
      const student = students.find(s => s.id === studentId);
      
      if (!student) {
        return { success: false, error: 'Student not found' };
      }

      const subjects = this.getSubjectsForDepartment(student.department);
      const marks = student.marks || {};
      
      // Generate marks for all subjects (core + non-core)
      const subjectReports = subjects.all.map(subject => {
        const mark = marks[subject.toLowerCase().replace(/\s+/g, '')] || 
                     Math.floor(Math.random() * 40) + 50; // Random for demo
        
        return {
          subject,
          mark,
          grade: this.calculateGrade(mark),
          isCoreSubject: subjects.core.includes(subject),
          comment: this.getSubjectComment(mark)
        };
      });

      // Separate core and non-core
      const coreReports = subjectReports.filter(r => r.isCoreSubject);
      const nonCoreReports = subjectReports.filter(r => !r.isCoreSubject);

      // Calculate averages
      const coreAverage = coreReports.length > 0 
        ? coreReports.reduce((sum, r) => sum + r.mark, 0) / coreReports.length 
        : 0;
      
      const nonCoreAverage = nonCoreReports.length > 0
        ? nonCoreReports.reduce((sum, r) => sum + r.mark, 0) / nonCoreReports.length
        : 0;
      
      const overallAverage = (coreAverage + nonCoreAverage) / 2;

      return {
        success: true,
        report: {
          student: {
            id: student.studentId,
            name: student.name,
            class: student.class,
            department: student.department
          },
          term,
          coreSubjects: coreReports,
          nonCoreSubjects: nonCoreReports,
          statistics: {
            coreAverage: Math.round(coreAverage * 10) / 10,
            nonCoreAverage: Math.round(nonCoreAverage * 10) / 10,
            overallAverage: Math.round(overallAverage * 10) / 10,
            overallGrade: this.calculateGrade(overallAverage),
            totalSubjects: subjectReports.length
          }
        }
      };
    } catch (error) {
      console.error('Error generating subject report:', error);
      return { success: false, error: error.message };
    }
  },

  // Generate class subject report
  async generateClassSubjectReport(classLevel, department, term = 'Term 1') {
    try {
      const students = JSON.parse(localStorage.getItem('comprehensiveStudents') || '[]');
      let filteredStudents = students.filter(s => s.class === classLevel);
      
      if (department !== 'All') {
        filteredStudents = filteredStudents.filter(s => s.department === department);
      }

      if (filteredStudents.length === 0) {
        return { success: false, error: 'No students found' };
      }

      const subjects = department !== 'All' 
        ? this.getSubjectsForDepartment(department)
        : { core: [], nonCore: NON_CORE_SUBJECTS, all: NON_CORE_SUBJECTS };

      // Calculate average for each subject across all students
      const subjectAverages = {};
      
      subjects.all.forEach(subject => {
        const marks = filteredStudents.map(student => {
          const studentMarks = student.marks || {};
          return studentMarks[subject.toLowerCase().replace(/\s+/g, '')] || 
                 Math.floor(Math.random() * 40) + 50;
        });
        
        const average = marks.reduce((sum, mark) => sum + mark, 0) / marks.length;
        const highest = Math.max(...marks);
        const lowest = Math.min(...marks);
        const passCount = marks.filter(m => m >= 50).length;
        
        subjectAverages[subject] = {
          subject,
          average: Math.round(average * 10) / 10,
          highest,
          lowest,
          passRate: Math.round((passCount / marks.length) * 100),
          isCoreSubject: subjects.core.includes(subject)
        };
      });

      return {
        success: true,
        report: {
          class: classLevel,
          department,
          term,
          totalStudents: filteredStudents.length,
          subjects: Object.values(subjectAverages),
          coreSubjects: Object.values(subjectAverages).filter(s => s.isCoreSubject),
          nonCoreSubjects: Object.values(subjectAverages).filter(s => !s.isCoreSubject)
        }
      };
    } catch (error) {
      console.error('Error generating class subject report:', error);
      return { success: false, error: error.message };
    }
  },

  // Generate department performance report
  async generateDepartmentReport(department, term = 'Term 1') {
    try {
      const students = JSON.parse(localStorage.getItem('comprehensiveStudents') || '[]');
      const deptStudents = students.filter(s => s.department === department);

      if (deptStudents.length === 0) {
        return { success: false, error: 'No students in this department' };
      }

      const subjects = this.getSubjectsForDepartment(department);
      
      // Performance by level
      const levelPerformance = {};
      ['L3', 'L4', 'L5'].forEach(level => {
        const levelStudents = deptStudents.filter(s => s.class === level);
        if (levelStudents.length > 0) {
          const avgGPA = levelStudents.reduce((sum, s) => sum + parseFloat(s.gpa || 0), 0) / levelStudents.length;
          levelPerformance[level] = {
            students: levelStudents.length,
            averageGPA: Math.round(avgGPA * 100) / 100
          };
        }
      });

      // Core subjects performance
      const corePerformance = subjects.core.map(subject => {
        const marks = deptStudents.map(s => {
          const studentMarks = s.marks || {};
          return studentMarks[subject.toLowerCase().replace(/\s+/g, '')] || 
                 Math.floor(Math.random() * 40) + 50;
        });
        
        const average = marks.reduce((sum, m) => sum + m, 0) / marks.length;
        return {
          subject,
          average: Math.round(average * 10) / 10,
          grade: this.calculateGrade(average)
        };
      });

      return {
        success: true,
        report: {
          department,
          term,
          totalStudents: deptStudents.length,
          levelPerformance,
          coreSubjectsPerformance: corePerformance,
          overallDepartmentAverage: Math.round(
            corePerformance.reduce((sum, s) => sum + s.average, 0) / corePerformance.length * 10
          ) / 10
        }
      };
    } catch (error) {
      console.error('Error generating department report:', error);
      return { success: false, error: error.message };
    }
  },

  // Calculate grade
  calculateGrade(mark) {
    if (mark >= 90) return 'A+';
    if (mark >= 85) return 'A';
    if (mark >= 80) return 'A-';
    if (mark >= 75) return 'B+';
    if (mark >= 70) return 'B';
    if (mark >= 65) return 'B-';
    if (mark >= 60) return 'C+';
    if (mark >= 55) return 'C';
    if (mark >= 50) return 'C-';
    if (mark >= 45) return 'D+';
    if (mark >= 40) return 'D';
    return 'F';
  },

  // Get subject comment
  getSubjectComment(mark) {
    if (mark >= 90) return 'Outstanding';
    if (mark >= 80) return 'Excellent';
    if (mark >= 70) return 'Very Good';
    if (mark >= 60) return 'Good';
    if (mark >= 50) return 'Satisfactory';
    return 'Needs Improvement';
  }
};

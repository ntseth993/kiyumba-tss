// Comprehensive Students Service for Staff Dashboards
// Supports filtering by class (L3, L4, L5) and department (SOD, Fashion, BUC, Wood Technology)

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// Initialize comprehensive student data with all details including marks and payments
const initializeComprehensiveStudents = () => {
  const existing = localStorage.getItem('comprehensiveStudents');
  if (!existing) {
    const sampleStudents = [
      // L3 Students
      { 
        id: 1, name: 'Alice Johnson', email: 'alice@kiyumba.com', class: 'L3', department: 'SOD', 
        studentId: 'KYB-L3-SOD-001', phone: '0788123456', address: 'Kigali', 
        guardianName: 'John Johnson', guardianPhone: '0788111222', disciplineIssues: [], 
        attendance: 95, gpa: 3.8, status: 'Active', enrollmentDate: '2023-09-01',
        marks: { math: 85, english: 90, science: 88, practical: 92 },
        conduct: { term1: 38, term2: 35, term3: 37 },
        payments: { tuitionFee: 500000, paidAmount: 500000, balance: 0, status: 'Paid', lastPayment: '2024-01-15' }
      },
      { 
        id: 2, name: 'Bob Smith', email: 'bob@kiyumba.com', class: 'L3', department: 'Fashion', 
        studentId: 'KYB-L3-FASH-001', phone: '0788234567', address: 'Kigali', 
        guardianName: 'Mary Smith', guardianPhone: '0788222333', 
        disciplineIssues: ['Late arrival - 2024-01-15'], attendance: 88, gpa: 3.5, status: 'Active', 
        enrollmentDate: '2023-09-01',
        marks: { design: 80, sewing: 85, theory: 78, practical: 82 },
        conduct: { term1: 32, term2: 30, term3: 33 },
        payments: { tuitionFee: 500000, paidAmount: 300000, balance: 200000, status: 'Partial', lastPayment: '2024-01-10' }
      },
      { 
        id: 3, name: 'Carol Williams', email: 'carol@kiyumba.com', class: 'L3', department: 'BUC', 
        studentId: 'KYB-L3-BUC-001', phone: '0788345678', address: 'Kigali', 
        guardianName: 'David Williams', guardianPhone: '0788333444', disciplineIssues: [], 
        attendance: 92, gpa: 3.9, status: 'Active', enrollmentDate: '2023-09-01',
        marks: { construction: 90, masonry: 88, theory: 85, practical: 91 },
        conduct: { term1: 39, term2: 38, term3: 40 },
        payments: { tuitionFee: 500000, paidAmount: 500000, balance: 0, status: 'Paid', lastPayment: '2024-01-20' }
      },
      { 
        id: 4, name: 'David Brown', email: 'david@kiyumba.com', class: 'L3', department: 'Wood Technology', 
        studentId: 'KYB-L3-WOOD-001', phone: '0788456789', address: 'Kigali', 
        guardianName: 'Sarah Brown', guardianPhone: '0788444555', 
        disciplineIssues: ['Uniform violation - 2024-02-10'], attendance: 85, gpa: 3.2, status: 'Active', 
        enrollmentDate: '2023-09-01',
        marks: { carpentry: 75, joinery: 80, theory: 70, practical: 78 },
        conduct: { term1: 28, term2: 30, term3: 31 },
        payments: { tuitionFee: 500000, paidAmount: 150000, balance: 350000, status: 'Unpaid', lastPayment: '2023-12-05' }
      },
      
      // L4 Students
      { 
        id: 5, name: 'Emma Davis', email: 'emma@kiyumba.com', class: 'L4', department: 'SOD', 
        studentId: 'KYB-L4-SOD-001', phone: '0788567890', address: 'Kigali', 
        guardianName: 'James Davis', guardianPhone: '0788555666', disciplineIssues: [], 
        attendance: 97, gpa: 4.0, status: 'Active', enrollmentDate: '2022-09-01',
        marks: { math: 95, english: 92, science: 94, practical: 96 },
        conduct: { term1: 40, term2: 39, term3: 40 },
        payments: { tuitionFee: 550000, paidAmount: 550000, balance: 0, status: 'Paid', lastPayment: '2024-01-18' }
      },
      { 
        id: 6, name: 'Frank Miller', email: 'frank@kiyumba.com', class: 'L4', department: 'Fashion', 
        studentId: 'KYB-L4-FASH-001', phone: '0788678901', address: 'Kigali', 
        guardianName: 'Linda Miller', guardianPhone: '0788666777', 
        disciplineIssues: ['Disruptive behavior - 2024-01-20', 'Missing assignment - 2024-02-05'], 
        attendance: 82, gpa: 3.0, status: 'Warning', enrollmentDate: '2022-09-01',
        marks: { design: 70, sewing: 75, theory: 68, practical: 72 },
        conduct: { term1: 25, term2: 27, term3: 28 },
        payments: { tuitionFee: 550000, paidAmount: 200000, balance: 350000, status: 'Unpaid', lastPayment: '2023-11-20' }
      },
      { 
        id: 7, name: 'Grace Wilson', email: 'grace@kiyumba.com', class: 'L4', department: 'BUC', 
        studentId: 'KYB-L4-BUC-001', phone: '0788789012', address: 'Kigali', 
        guardianName: 'Robert Wilson', guardianPhone: '0788777888', disciplineIssues: [], 
        attendance: 94, gpa: 3.7, status: 'Active', enrollmentDate: '2022-09-01',
        marks: { construction: 88, masonry: 85, theory: 82, practical: 87 },
        conduct: { term1: 37, term2: 36, term3: 38 },
        payments: { tuitionFee: 550000, paidAmount: 550000, balance: 0, status: 'Paid', lastPayment: '2024-01-22' }
      },
      { 
        id: 8, name: 'Henry Moore', email: 'henry@kiyumba.com', class: 'L4', department: 'Wood Technology', 
        studentId: 'KYB-L4-WOOD-001', phone: '0788890123', address: 'Kigali', 
        guardianName: 'Patricia Moore', guardianPhone: '0788888999', disciplineIssues: [], 
        attendance: 90, gpa: 3.6, status: 'Active', enrollmentDate: '2022-09-01',
        marks: { carpentry: 85, joinery: 88, theory: 80, practical: 86 },
        conduct: { term1: 35, term2: 36, term3: 37 },
        payments: { tuitionFee: 550000, paidAmount: 400000, balance: 150000, status: 'Partial', lastPayment: '2024-01-05' }
      },
      
      // L5 Students
      { 
        id: 9, name: 'Ivy Taylor', email: 'ivy@kiyumba.com', class: 'L5', department: 'SOD', 
        studentId: 'KYB-L5-SOD-001', phone: '0788901234', address: 'Kigali', 
        guardianName: 'Michael Taylor', guardianPhone: '0788999000', disciplineIssues: [], 
        attendance: 98, gpa: 4.0, status: 'Active', enrollmentDate: '2021-09-01',
        marks: { math: 98, english: 95, science: 96, practical: 97 },
        conduct: { term1: 40, term2: 40, term3: 39 },
        payments: { tuitionFee: 600000, paidAmount: 600000, balance: 0, status: 'Paid', lastPayment: '2024-01-25' }
      },
      { 
        id: 10, name: 'Jack Anderson', email: 'jack@kiyumba.com', class: 'L5', department: 'Fashion', 
        studentId: 'KYB-L5-FASH-001', phone: '0788012345', address: 'Kigali', 
        guardianName: 'Jennifer Anderson', guardianPhone: '0788000111', disciplineIssues: [], 
        attendance: 93, gpa: 3.8, status: 'Active', enrollmentDate: '2021-09-01',
        marks: { design: 90, sewing: 92, theory: 88, practical: 91 },
        conduct: { term1: 38, term2: 37, term3: 39 },
        payments: { tuitionFee: 600000, paidAmount: 600000, balance: 0, status: 'Paid', lastPayment: '2024-01-28' }
      },
      { 
        id: 11, name: 'Kate Thomas', email: 'kate@kiyumba.com', class: 'L5', department: 'BUC', 
        studentId: 'KYB-L5-BUC-001', phone: '0788123450', address: 'Kigali', 
        guardianName: 'Christopher Thomas', guardianPhone: '0788111000', disciplineIssues: [], 
        attendance: 96, gpa: 3.9, status: 'Active', enrollmentDate: '2021-09-01',
        marks: { construction: 92, masonry: 90, theory: 88, practical: 93 },
        conduct: { term1: 39, term2: 38, term3: 39 },
        payments: { tuitionFee: 600000, paidAmount: 450000, balance: 150000, status: 'Partial', lastPayment: '2024-01-12' }
      },
      { 
        id: 12, name: 'Leo Jackson', email: 'leo@kiyumba.com', class: 'L5', department: 'Wood Technology', 
        studentId: 'KYB-L5-WOOD-001', phone: '0788234501', address: 'Kigali', 
        guardianName: 'Nancy Jackson', guardianPhone: '0788222111', 
        disciplineIssues: ['Equipment misuse - 2024-01-10'], attendance: 87, gpa: 3.4, status: 'Warning', 
        enrollmentDate: '2021-09-01',
        marks: { carpentry: 80, joinery: 82, theory: 75, practical: 81 },
        conduct: { term1: 29, term2: 31, term3: 30 },
        payments: { tuitionFee: 600000, paidAmount: 250000, balance: 350000, status: 'Unpaid', lastPayment: '2023-12-10' }
      },
    ];
    localStorage.setItem('comprehensiveStudents', JSON.stringify(sampleStudents));
  }
};

export const comprehensiveStudentsService = {
  // Get all students
  async getAllStudents() {
    try {
      initializeComprehensiveStudents();
      const students = JSON.parse(localStorage.getItem('comprehensiveStudents') || '[]');
      return students;
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  },

  // Get students by class
  async getStudentsByClass(classLevel) {
    try {
      const students = await this.getAllStudents();
      return students.filter(s => s.class === classLevel);
    } catch (error) {
      console.error('Error fetching students by class:', error);
      return [];
    }
  },

  // Get students by department
  async getStudentsByDepartment(department) {
    try {
      const students = await this.getAllStudents();
      return students.filter(s => s.department === department);
    } catch (error) {
      console.error('Error fetching students by department:', error);
      return [];
    }
  },

  // Get students by class and department
  async getStudentsByClassAndDepartment(classLevel, department) {
    try {
      const students = await this.getAllStudents();
      return students.filter(s => s.class === classLevel && s.department === department);
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  },

  // Get students with discipline issues
  async getStudentsWithDisciplineIssues() {
    try {
      const students = await this.getAllStudents();
      return students.filter(s => s.disciplineIssues && s.disciplineIssues.length > 0);
    } catch (error) {
      console.error('Error fetching students with discipline issues:', error);
      return [];
    }
  },

  // Get student by ID
  async getStudentById(id) {
    try {
      const students = await this.getAllStudents();
      return students.find(s => s.id === id);
    } catch (error) {
      console.error('Error fetching student:', error);
      return null;
    }
  },

  // Add discipline issue
  async addDisciplineIssue(studentId, issue) {
    try {
      const students = await this.getAllStudents();
      const student = students.find(s => s.id === studentId);
      if (student) {
        if (!student.disciplineIssues) student.disciplineIssues = [];
        student.disciplineIssues.push(`${issue} - ${new Date().toISOString().split('T')[0]}`);
        localStorage.setItem('comprehensiveStudents', JSON.stringify(students));
        return { success: true, student };
      }
      return { success: false, error: 'Student not found' };
    } catch (error) {
      console.error('Error adding discipline issue:', error);
      return { success: false, error: error.message };
    }
  },

  // Update student
  async updateStudent(studentId, updates) {
    try {
      const students = await this.getAllStudents();
      const index = students.findIndex(s => s.id === studentId);
      if (index !== -1) {
        students[index] = { ...students[index], ...updates };
        localStorage.setItem('comprehensiveStudents', JSON.stringify(students));
        return { success: true, student: students[index] };
      }
      return { success: false, error: 'Student not found' };
    } catch (error) {
      console.error('Error updating student:', error);
      return { success: false, error: error.message };
    }
  },

  // Get statistics
  async getStatistics() {
    try {
      const students = await this.getAllStudents();
      return {
        total: students.length,
        byClass: {
          L3: students.filter(s => s.class === 'L3').length,
          L4: students.filter(s => s.class === 'L4').length,
          L5: students.filter(s => s.class === 'L5').length
        },
        byDepartment: {
          SOD: students.filter(s => s.department === 'SOD').length,
          Fashion: students.filter(s => s.department === 'Fashion').length,
          BUC: students.filter(s => s.department === 'BUC').length,
          'Wood Technology': students.filter(s => s.department === 'Wood Technology').length
        },
        withDisciplineIssues: students.filter(s => s.disciplineIssues && s.disciplineIssues.length > 0).length,
        averageAttendance: (students.reduce((sum, s) => sum + s.attendance, 0) / students.length).toFixed(1),
        averageGPA: (students.reduce((sum, s) => sum + s.gpa, 0) / students.length).toFixed(2),
        paymentStats: {
          paid: students.filter(s => s.payments?.status === 'Paid').length,
          partial: students.filter(s => s.payments?.status === 'Partial').length,
          unpaid: students.filter(s => s.payments?.status === 'Unpaid').length,
          totalBalance: students.reduce((sum, s) => sum + (s.payments?.balance || 0), 0)
        }
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return null;
    }
  },

  // Add new student
  async addStudent(studentData) {
    try {
      const students = await this.getAllStudents();
      const newId = Math.max(...students.map(s => s.id), 0) + 1;
      
      // Generate student ID based on class and department
      const deptCode = {
        'SOD': 'SOD',
        'Fashion': 'FASH',
        'BUC': 'BUC',
        'Wood Technology': 'WOOD'
      }[studentData.department] || 'GEN';
      
      const classStudents = students.filter(s => s.class === studentData.class && s.department === studentData.department);
      const studentNumber = String(classStudents.length + 1).padStart(3, '0');
      
      const newStudent = {
        id: newId,
        ...studentData,
        studentId: `KYB-${studentData.class}-${deptCode}-${studentNumber}`,
        enrollmentDate: new Date().toISOString().split('T')[0],
        disciplineIssues: [],
        attendance: 100,
        gpa: 0,
        status: 'Active',
        marks: {},
        payments: {
          tuitionFee: studentData.class === 'L3' ? 500000 : studentData.class === 'L4' ? 550000 : 600000,
          paidAmount: 0,
          balance: studentData.class === 'L3' ? 500000 : studentData.class === 'L4' ? 550000 : 600000,
          status: 'Unpaid',
          lastPayment: null
        }
      };
      
      students.push(newStudent);
      localStorage.setItem('comprehensiveStudents', JSON.stringify(students));
      return { success: true, student: newStudent };
    } catch (error) {
      console.error('Error adding student:', error);
      return { success: false, error: error.message };
    }
  },

  // Update student marks (for teachers)
  async updateMarks(studentId, marks) {
    try {
      const students = await this.getAllStudents();
      const student = students.find(s => s.id === studentId);
      if (student) {
        student.marks = { ...student.marks, ...marks };
        
        // Calculate GPA from marks
        const markValues = Object.values(student.marks);
        if (markValues.length > 0) {
          const average = markValues.reduce((sum, mark) => sum + mark, 0) / markValues.length;
          student.gpa = (average / 25).toFixed(2); // Convert to 4.0 scale
        }
        
        localStorage.setItem('comprehensiveStudents', JSON.stringify(students));
        return { success: true, student };
      }
      return { success: false, error: 'Student not found' };
    } catch (error) {
      console.error('Error updating marks:', error);
      return { success: false, error: error.message };
    }
  },

  // Update payment (for accountant)
  async updatePayment(studentId, paymentAmount) {
    try {
      const students = await this.getAllStudents();
      const student = students.find(s => s.id === studentId);
      if (student) {
        student.payments.paidAmount += paymentAmount;
        student.payments.balance = student.payments.tuitionFee - student.payments.paidAmount;
        student.payments.lastPayment = new Date().toISOString().split('T')[0];
        
        if (student.payments.balance === 0) {
          student.payments.status = 'Paid';
        } else if (student.payments.paidAmount > 0) {
          student.payments.status = 'Partial';
        } else {
          student.payments.status = 'Unpaid';
        }
        
        localStorage.setItem('comprehensiveStudents', JSON.stringify(students));
        return { success: true, student };
      }
      return { success: false, error: 'Student not found' };
    } catch (error) {
      console.error('Error updating payment:', error);
      return { success: false, error: error.message };
    }
  },

  // Get students by class and trade (organized view)
  async getStudentsByClassAndTrade() {
    try {
      const students = await this.getAllStudents();
      const organized = {
        L3: {
          SOD: students.filter(s => s.class === 'L3' && s.department === 'SOD'),
          Fashion: students.filter(s => s.class === 'L3' && s.department === 'Fashion'),
          BUC: students.filter(s => s.class === 'L3' && s.department === 'BUC'),
          'Wood Technology': students.filter(s => s.class === 'L3' && s.department === 'Wood Technology')
        },
        L4: {
          SOD: students.filter(s => s.class === 'L4' && s.department === 'SOD'),
          Fashion: students.filter(s => s.class === 'L4' && s.department === 'Fashion'),
          BUC: students.filter(s => s.class === 'L4' && s.department === 'BUC'),
          'Wood Technology': students.filter(s => s.class === 'L4' && s.department === 'Wood Technology')
        },
        L5: {
          SOD: students.filter(s => s.class === 'L5' && s.department === 'SOD'),
          Fashion: students.filter(s => s.class === 'L5' && s.department === 'Fashion'),
          BUC: students.filter(s => s.class === 'L5' && s.department === 'BUC'),
          'Wood Technology': students.filter(s => s.class === 'L5' && s.department === 'Wood Technology')
        }
      };
      return organized;
    } catch (error) {
      console.error('Error organizing students:', error);
      return null;
    }
  },

  // Get students with unpaid fees (for accountant)
  async getStudentsWithUnpaidFees() {
    try {
      const students = await this.getAllStudents();
      return students.filter(s => s.payments && s.payments.balance > 0);
    } catch (error) {
      console.error('Error fetching students with unpaid fees:', error);
      return [];
    }
  },

  // Update conduct marks (for DOD)
  async updateConduct(studentId, term, marks) {
    try {
      const students = await this.getAllStudents();
      const student = students.find(s => s.id === studentId);
      if (student) {
        if (!student.conduct) student.conduct = { term1: 0, term2: 0, term3: 0 };
        student.conduct[term] = marks;
        localStorage.setItem('comprehensiveStudents', JSON.stringify(students));
        return { success: true, student };
      }
      return { success: false, error: 'Student not found' };
    } catch (error) {
      console.error('Error updating conduct:', error);
      return { success: false, error: error.message };
    }
  }
};

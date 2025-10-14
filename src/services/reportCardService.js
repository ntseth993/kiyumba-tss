// Report Card Generation Service
// Generates comprehensive student report cards with marks, conduct, and attendance

import { comprehensiveStudentsService } from './comprehensiveStudentsService';
import { attendanceService } from './attendanceService';

export const reportCardService = {
  // Generate report card for a student
  async generateReportCard(studentId, term = 'Term 1', academicYear = '2024') {
    try {
      const student = await comprehensiveStudentsService.getStudentById(studentId);
      if (!student) {
        return { success: false, error: 'Student not found' };
      }

      // Calculate attendance percentage for the term
      const attendancePercentage = student.attendance || 0;

      // Get conduct marks for the term
      const conductMark = student.conduct?.[`term${term.split(' ')[1]}`] || 0;

      // Get subject marks
      const marks = student.marks || {};

      // Calculate overall performance
      const markValues = Object.values(marks);
      const totalMarks = markValues.reduce((sum, mark) => sum + mark, 0);
      const averageMark = markValues.length > 0 ? totalMarks / markValues.length : 0;

      // Determine grade
      const grade = this.calculateGrade(averageMark);
      const position = 'N/A'; // Would need class comparison for actual position

      const reportCard = {
        student: {
          id: student.studentId,
          name: student.name,
          class: student.class,
          department: student.department,
          email: student.email,
          phone: student.phone
        },
        academic: {
          term,
          academicYear,
          marks,
          totalMarks,
          averageMark: Math.round(averageMark * 10) / 10,
          grade,
          position,
          gpa: student.gpa
        },
        conduct: {
          mark: conductMark,
          maxMark: 40,
          percentage: Math.round((conductMark / 40) * 100),
          comment: this.getConductComment(conductMark)
        },
        attendance: {
          percentage: attendancePercentage,
          status: this.getAttendanceStatus(attendancePercentage),
          comment: this.getAttendanceComment(attendancePercentage)
        },
        discipline: {
          issues: student.disciplineIssues || [],
          status: student.disciplineIssues?.length > 0 ? 'Has Issues' : 'Clean Record'
        },
        overallComment: this.generateOverallComment(averageMark, conductMark, attendancePercentage),
        generatedAt: new Date().toISOString(),
        generatedBy: 'System'
      };

      return { success: true, reportCard };
    } catch (error) {
      console.error('Error generating report card:', error);
      return { success: false, error: error.message };
    }
  },

  // Generate report cards for entire class
  async generateClassReportCards(classLevel, term = 'Term 1', academicYear = '2024') {
    try {
      const students = await comprehensiveStudentsService.getStudentsByClass(classLevel);
      const reportCards = [];

      for (const student of students) {
        const result = await this.generateReportCard(student.id, term, academicYear);
        if (result.success) {
          reportCards.push(result.reportCard);
        }
      }

      return { success: true, reportCards, count: reportCards.length };
    } catch (error) {
      console.error('Error generating class report cards:', error);
      return { success: false, error: error.message };
    }
  },

  // Calculate grade based on average mark
  calculateGrade(averageMark) {
    if (averageMark >= 90) return 'A+';
    if (averageMark >= 85) return 'A';
    if (averageMark >= 80) return 'A-';
    if (averageMark >= 75) return 'B+';
    if (averageMark >= 70) return 'B';
    if (averageMark >= 65) return 'B-';
    if (averageMark >= 60) return 'C+';
    if (averageMark >= 55) return 'C';
    if (averageMark >= 50) return 'C-';
    if (averageMark >= 45) return 'D+';
    if (averageMark >= 40) return 'D';
    return 'F';
  },

  // Get conduct comment based on marks
  getConductComment(conductMark) {
    if (conductMark >= 36) return 'Excellent behavior and discipline';
    if (conductMark >= 32) return 'Very good conduct';
    if (conductMark >= 28) return 'Good conduct';
    if (conductMark >= 24) return 'Satisfactory conduct';
    if (conductMark >= 20) return 'Needs improvement';
    return 'Poor conduct - requires immediate attention';
  },

  // Get attendance status
  getAttendanceStatus(percentage) {
    if (percentage >= 95) return 'Excellent';
    if (percentage >= 90) return 'Very Good';
    if (percentage >= 85) return 'Good';
    if (percentage >= 75) return 'Satisfactory';
    if (percentage >= 65) return 'Poor';
    return 'Very Poor';
  },

  // Get attendance comment
  getAttendanceComment(percentage) {
    if (percentage >= 95) return 'Outstanding attendance record';
    if (percentage >= 90) return 'Very good attendance';
    if (percentage >= 85) return 'Good attendance';
    if (percentage >= 75) return 'Attendance needs improvement';
    if (percentage >= 65) return 'Poor attendance - parent meeting required';
    return 'Unacceptable attendance - immediate action required';
  },

  // Generate overall comment
  generateOverallComment(averageMark, conductMark, attendancePercentage) {
    const performance = averageMark >= 75 ? 'excellent' : averageMark >= 60 ? 'good' : averageMark >= 50 ? 'satisfactory' : 'needs improvement';
    const conduct = conductMark >= 32 ? 'exemplary' : conductMark >= 28 ? 'good' : 'needs attention';
    const attendance = attendancePercentage >= 90 ? 'excellent' : attendancePercentage >= 75 ? 'good' : 'poor';

    let comment = `The student has shown ${performance} academic performance this term. `;
    comment += `Their conduct has been ${conduct}. `;
    comment += `Attendance has been ${attendance}. `;

    if (averageMark < 50 || conductMark < 24 || attendancePercentage < 75) {
      comment += 'Immediate intervention and support are recommended.';
    } else if (averageMark >= 75 && conductMark >= 32 && attendancePercentage >= 90) {
      comment += 'Keep up the excellent work!';
    } else {
      comment += 'Continue to work hard and maintain consistency.';
    }

    return comment;
  },

  // Get subject-wise performance analysis
  getSubjectAnalysis(marks) {
    const analysis = [];
    
    Object.entries(marks).forEach(([subject, mark]) => {
      const grade = this.calculateGrade(mark);
      const performance = mark >= 75 ? 'Excellent' : mark >= 60 ? 'Good' : mark >= 50 ? 'Average' : 'Below Average';
      
      analysis.push({
        subject: subject.charAt(0).toUpperCase() + subject.slice(1),
        mark,
        grade,
        performance,
        comment: this.getSubjectComment(mark)
      });
    });

    return analysis;
  },

  // Get subject-specific comment
  getSubjectComment(mark) {
    if (mark >= 90) return 'Outstanding performance';
    if (mark >= 80) return 'Excellent work';
    if (mark >= 70) return 'Good understanding';
    if (mark >= 60) return 'Satisfactory progress';
    if (mark >= 50) return 'Needs more effort';
    return 'Requires additional support';
  },

  // Calculate class statistics
  async getClassStatistics(classLevel, term = 'Term 1') {
    try {
      const students = await comprehensiveStudentsService.getStudentsByClass(classLevel);
      
      if (students.length === 0) {
        return { success: false, error: 'No students found in class' };
      }

      const allMarks = students.map(s => {
        const marks = Object.values(s.marks || {});
        return marks.length > 0 ? marks.reduce((sum, m) => sum + m, 0) / marks.length : 0;
      });

      const totalStudents = students.length;
      const averageClassMark = allMarks.reduce((sum, m) => sum + m, 0) / totalStudents;
      const highestMark = Math.max(...allMarks);
      const lowestMark = Math.min(...allMarks);
      
      const passCount = allMarks.filter(m => m >= 50).length;
      const passRate = (passCount / totalStudents) * 100;

      return {
        success: true,
        statistics: {
          totalStudents,
          averageClassMark: Math.round(averageClassMark * 10) / 10,
          highestMark: Math.round(highestMark * 10) / 10,
          lowestMark: Math.round(lowestMark * 10) / 10,
          passCount,
          passRate: Math.round(passRate * 10) / 10
        }
      };
    } catch (error) {
      console.error('Error calculating class statistics:', error);
      return { success: false, error: error.message };
    }
  }
};

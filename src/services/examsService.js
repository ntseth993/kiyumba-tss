// Service for managing exams
// This service handles exam creation, retrieval, and management

// Mock database - in production this would be replaced with actual database calls
const EXAMS_STORAGE_KEY = 'kiyumba_exams';

// Get all exams from storage
const getExamsFromStorage = () => {
  try {
    const exams = localStorage.getItem(EXAMS_STORAGE_KEY);
    return exams ? JSON.parse(exams) : [];
  } catch (error) {
    console.error('Error reading exams from storage:', error);
    return [];
  }
};

// Save exams to storage
const saveExamsToStorage = (exams) => {
  try {
    localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(exams));
  } catch (error) {
    console.error('Error saving exams to storage:', error);
    throw new Error('Failed to save exam');
  }
};

/**
 * Create a new exam
 * @param {Object} examData - The exam data
 * @param {string} examData.title - Exam title
 * @param {string} examData.description - Exam description
 * @param {string} examData.subject - Subject name
 * @param {string} examData.classId - Target class ID
 * @param {string} examData.className - Target class name
 * @param {string} examData.teacherId - Teacher's ID
 * @param {string} examData.teacherName - Teacher's name
 * @param {Date} examData.examDate - Date of the exam
 * @param {Date} examData.dueDate - Submission due date
 * @param {number} examData.totalMarks - Total marks
 * @param {string} examData.duration - Duration (e.g., "2 hours")
 * @param {File} examData.file - Exam file (PDF, DOCX, etc.)
 * @returns {Promise<Object>} Created exam object
 */
export const createExam = async (examData) => {
  try {
    const exams = getExamsFromStorage();
    
    // Create new exam object
    const newExam = {
      id: Date.now().toString(),
      title: examData.title,
      description: examData.description || '',
      subject: examData.subject,
      classId: examData.classId,
      className: examData.className,
      teacherId: examData.teacherId,
      teacherName: examData.teacherName,
      examDate: examData.examDate,
      dueDate: examData.dueDate,
      totalMarks: examData.totalMarks,
      duration: examData.duration,
      fileName: examData.file?.name || '',
      fileUrl: examData.fileUrl || '', // In production, this would be uploaded to cloud storage
      fileType: examData.file?.type || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active', // active, completed, cancelled
      submissions: []
    };

    // Add to exams array
    exams.push(newExam);
    saveExamsToStorage(exams);

    return newExam;
  } catch (error) {
    console.error('Error creating exam:', error);
    throw new Error('Failed to create exam');
  }
};

/**
 * Get all exams
 * @returns {Promise<Array>} Array of exam objects
 */
export const getAllExams = async () => {
  try {
    return getExamsFromStorage();
  } catch (error) {
    console.error('Error getting exams:', error);
    throw new Error('Failed to retrieve exams');
  }
};

/**
 * Get exams by teacher ID
 * @param {string} teacherId - Teacher's ID
 * @returns {Promise<Array>} Array of exam objects
 */
export const getExamsByTeacher = async (teacherId) => {
  try {
    const exams = getExamsFromStorage();
    return exams.filter(exam => exam.teacherId === teacherId);
  } catch (error) {
    console.error('Error getting teacher exams:', error);
    throw new Error('Failed to retrieve teacher exams');
  }
};

/**
 * Get exams by class ID
 * @param {string} classId - Class ID
 * @returns {Promise<Array>} Array of exam objects
 */
export const getExamsByClass = async (classId) => {
  try {
    const exams = getExamsFromStorage();
    return exams.filter(exam => exam.classId === classId);
  } catch (error) {
    console.error('Error getting class exams:', error);
    throw new Error('Failed to retrieve class exams');
  }
};

/**
 * Get exams for a student based on their class
 * @param {string} studentClass - Student's class
 * @returns {Promise<Array>} Array of exam objects
 */
export const getExamsForStudent = async (studentClass) => {
  try {
    const exams = getExamsFromStorage();
    return exams.filter(exam => 
      exam.className === studentClass || exam.classId === studentClass
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Error getting student exams:', error);
    throw new Error('Failed to retrieve student exams');
  }
};

/**
 * Get exam by ID
 * @param {string} examId - Exam ID
 * @returns {Promise<Object>} Exam object
 */
export const getExamById = async (examId) => {
  try {
    const exams = getExamsFromStorage();
    const exam = exams.find(exam => exam.id === examId);
    if (!exam) {
      throw new Error('Exam not found');
    }
    return exam;
  } catch (error) {
    console.error('Error getting exam:', error);
    throw new Error('Failed to retrieve exam');
  }
};

/**
 * Update exam
 * @param {string} examId - Exam ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated exam object
 */
export const updateExam = async (examId, updates) => {
  try {
    const exams = getExamsFromStorage();
    const examIndex = exams.findIndex(exam => exam.id === examId);
    
    if (examIndex === -1) {
      throw new Error('Exam not found');
    }

    // Update exam
    exams[examIndex] = {
      ...exams[examIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    saveExamsToStorage(exams);
    return exams[examIndex];
  } catch (error) {
    console.error('Error updating exam:', error);
    throw new Error('Failed to update exam');
  }
};

/**
 * Delete exam
 * @param {string} examId - Exam ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteExam = async (examId) => {
  try {
    const exams = getExamsFromStorage();
    const filteredExams = exams.filter(exam => exam.id !== examId);
    
    if (exams.length === filteredExams.length) {
      throw new Error('Exam not found');
    }

    saveExamsToStorage(filteredExams);
    return true;
  } catch (error) {
    console.error('Error deleting exam:', error);
    throw new Error('Failed to delete exam');
  }
};

/**
 * Submit exam (student submission)
 * @param {string} examId - Exam ID
 * @param {Object} submissionData - Submission data
 * @returns {Promise<Object>} Updated exam object
 */
export const submitExam = async (examId, submissionData) => {
  try {
    const exams = getExamsFromStorage();
    const examIndex = exams.findIndex(exam => exam.id === examId);
    
    if (examIndex === -1) {
      throw new Error('Exam not found');
    }

    const submission = {
      id: Date.now().toString(),
      studentId: submissionData.studentId,
      studentName: submissionData.studentName,
      submittedAt: new Date().toISOString(),
      fileUrl: submissionData.fileUrl,
      fileName: submissionData.fileName,
      status: 'submitted', // submitted, graded
      marks: null,
      feedback: ''
    };

    // Add submission to exam
    if (!exams[examIndex].submissions) {
      exams[examIndex].submissions = [];
    }
    exams[examIndex].submissions.push(submission);
    exams[examIndex].updatedAt = new Date().toISOString();

    saveExamsToStorage(exams);
    return exams[examIndex];
  } catch (error) {
    console.error('Error submitting exam:', error);
    throw new Error('Failed to submit exam');
  }
};

/**
 * Grade exam submission
 * @param {string} examId - Exam ID
 * @param {string} submissionId - Submission ID
 * @param {number} marks - Marks awarded
 * @param {string} feedback - Feedback text
 * @returns {Promise<Object>} Updated exam object
 */
export const gradeExamSubmission = async (examId, submissionId, marks, feedback) => {
  try {
    const exams = getExamsFromStorage();
    const examIndex = exams.findIndex(exam => exam.id === examId);
    
    if (examIndex === -1) {
      throw new Error('Exam not found');
    }

    const submissionIndex = exams[examIndex].submissions.findIndex(
      sub => sub.id === submissionId
    );

    if (submissionIndex === -1) {
      throw new Error('Submission not found');
    }

    // Update submission
    exams[examIndex].submissions[submissionIndex].marks = marks;
    exams[examIndex].submissions[submissionIndex].feedback = feedback;
    exams[examIndex].submissions[submissionIndex].status = 'graded';
    exams[examIndex].submissions[submissionIndex].gradedAt = new Date().toISOString();
    exams[examIndex].updatedAt = new Date().toISOString();

    saveExamsToStorage(exams);
    return exams[examIndex];
  } catch (error) {
    console.error('Error grading submission:', error);
    throw new Error('Failed to grade submission');
  }
};

/**
 * Get upcoming exams for a class
 * @param {string} classId - Class ID
 * @returns {Promise<Array>} Array of upcoming exam objects
 */
export const getUpcomingExams = async (classId) => {
  try {
    const exams = getExamsFromStorage();
    const now = new Date();
    
    return exams
      .filter(exam => 
        (exam.classId === classId || exam.className === classId) &&
        new Date(exam.examDate) > now &&
        exam.status === 'active'
      )
      .sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
  } catch (error) {
    console.error('Error getting upcoming exams:', error);
    throw new Error('Failed to retrieve upcoming exams');
  }
};

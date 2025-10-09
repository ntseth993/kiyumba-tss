// Teacher Materials Service - Handles uploads for tests, quizzes, notes, exams
const MATERIALS_KEY = 'teacherMaterials';
const TEACHER_ASSIGNMENTS_KEY = 'teacherAssignments';

// Get teacher assignments (subjects and classes)
export const getTeacherAssignments = (teacherId) => {
  const assignments = JSON.parse(localStorage.getItem(TEACHER_ASSIGNMENTS_KEY) || '{}');
  return assignments[teacherId] || {
    teacherId,
    subjects: [],
    classes: []
  };
};

// Set teacher assignments
export const setTeacherAssignments = (teacherId, subjects, classes) => {
  const assignments = JSON.parse(localStorage.getItem(TEACHER_ASSIGNMENTS_KEY) || '{}');
  assignments[teacherId] = {
    teacherId,
    subjects,
    classes,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(TEACHER_ASSIGNMENTS_KEY, JSON.stringify(assignments));
  return assignments[teacherId];
};

// Initialize default teacher assignments
export const initializeTeacherAssignments = () => {
  const existing = localStorage.getItem(TEACHER_ASSIGNMENTS_KEY);
  if (!existing) {
    const defaultAssignments = {
      3: { // Teacher User ID
        teacherId: 3,
        subjects: ['Mathematics', 'Physics'],
        classes: ['Grade 10A', 'Grade 10B', 'Grade 11A'],
        updatedAt: new Date().toISOString()
      }
    };
    localStorage.setItem(TEACHER_ASSIGNMENTS_KEY, JSON.stringify(defaultAssignments));
  }
};

// Upload material (test, quiz, note, exam)
export const uploadMaterial = async (materialData) => {
  try {
    const materials = JSON.parse(localStorage.getItem(MATERIALS_KEY) || '[]');
    
    const newMaterial = {
      id: Date.now(),
      ...materialData,
      uploadedAt: new Date().toISOString(),
      views: 0,
      downloads: 0,
      status: 'active'
    };
    
    materials.push(newMaterial);
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(materials));
    
    console.log('Material uploaded:', newMaterial);
    return { success: true, material: newMaterial };
  } catch (error) {
    console.error('Error uploading material:', error);
    return { success: false, error: error.message };
  }
};

// Get materials by teacher
export const getMaterialsByTeacher = (teacherId) => {
  const materials = JSON.parse(localStorage.getItem(MATERIALS_KEY) || '[]');
  return materials.filter(m => m.teacherId === teacherId && m.status === 'active');
};

// Get materials for student (based on their class)
export const getMaterialsForStudent = (studentClass) => {
  const materials = JSON.parse(localStorage.getItem(MATERIALS_KEY) || '[]');
  return materials.filter(m => 
    m.status === 'active' && 
    m.classes.includes(studentClass)
  ).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
};

// Get materials by type
export const getMaterialsByType = (type, studentClass = null) => {
  const materials = JSON.parse(localStorage.getItem(MATERIALS_KEY) || '[]');
  let filtered = materials.filter(m => m.type === type && m.status === 'active');
  
  if (studentClass) {
    filtered = filtered.filter(m => m.classes.includes(studentClass));
  }
  
  return filtered.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
};

// Get all materials
export const getAllMaterials = () => {
  const materials = JSON.parse(localStorage.getItem(MATERIALS_KEY) || '[]');
  return materials.filter(m => m.status === 'active')
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
};

// Update material
export const updateMaterial = (materialId, updates) => {
  const materials = JSON.parse(localStorage.getItem(MATERIALS_KEY) || '[]');
  const index = materials.findIndex(m => m.id === materialId);
  
  if (index !== -1) {
    materials[index] = {
      ...materials[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(materials));
    return { success: true, material: materials[index] };
  }
  
  return { success: false, error: 'Material not found' };
};

// Delete material
export const deleteMaterial = (materialId, teacherId) => {
  const materials = JSON.parse(localStorage.getItem(MATERIALS_KEY) || '[]');
  const material = materials.find(m => m.id === materialId);
  
  if (material && material.teacherId === teacherId) {
    material.status = 'deleted';
    material.deletedAt = new Date().toISOString();
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(materials));
    return { success: true };
  }
  
  return { success: false, error: 'Material not found or unauthorized' };
};

// Increment view count
export const incrementViews = (materialId) => {
  const materials = JSON.parse(localStorage.getItem(MATERIALS_KEY) || '[]');
  const material = materials.find(m => m.id === materialId);
  
  if (material) {
    material.views = (material.views || 0) + 1;
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(materials));
  }
};

// Increment download count
export const incrementDownloads = (materialId) => {
  const materials = JSON.parse(localStorage.getItem(MATERIALS_KEY) || '[]');
  const material = materials.find(m => m.id === materialId);
  
  if (material) {
    material.downloads = (material.downloads || 0) + 1;
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(materials));
  }
};

// Get statistics
export const getTeacherStats = (teacherId) => {
  const materials = getMaterialsByTeacher(teacherId);
  
  return {
    totalMaterials: materials.length,
    totalViews: materials.reduce((sum, m) => sum + (m.views || 0), 0),
    totalDownloads: materials.reduce((sum, m) => sum + (m.downloads || 0), 0),
    byType: {
      notes: materials.filter(m => m.type === 'notes').length,
      tests: materials.filter(m => m.type === 'test').length,
      quizzes: materials.filter(m => m.type === 'quiz').length,
      exams: materials.filter(m => m.type === 'exam').length
    }
  };
};

// Available subjects and classes
export const AVAILABLE_SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'French',
  'Kinyarwanda',
  'History',
  'Geography',
  'Computer Science',
  'Economics',
  'Business Studies'
];

export const AVAILABLE_CLASSES = [
  'Grade 7A', 'Grade 7B', 'Grade 7C',
  'Grade 8A', 'Grade 8B', 'Grade 8C',
  'Grade 9A', 'Grade 9B', 'Grade 9C',
  'Grade 10A', 'Grade 10B', 'Grade 10C',
  'Grade 11A', 'Grade 11B', 'Grade 11C',
  'Grade 12A', 'Grade 12B', 'Grade 12C'
];

export const MATERIAL_TYPES = [
  { value: 'notes', label: 'Notes', icon: '📝', color: '#3b82f6' },
  { value: 'test', label: 'Test', icon: '📄', color: '#f59e0b' },
  { value: 'quiz', label: 'Quiz', icon: '❓', color: '#8b5cf6' },
  { value: 'exam', label: 'Exam', icon: '📋', color: '#ef4444' }
];

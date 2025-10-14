// src/services/departmentsService.js
export const DEPARTMENTS = {
  // Trade/Technical Departments
  SOD: {
    id: 'sod',
    name: 'School of Design',
    fullName: 'School of Design',
    color: '#8B5CF6',
    icon: 'Palette',
    description: 'Creative design and visual arts education'
  },
  WOD: {
    id: 'wod',
    name: 'Workshop of Development',
    fullName: 'Workshop of Development',
    color: '#10B981',
    icon: 'Wrench',
    description: 'Technical skills and workshop training'
  },
  BUC: {
    id: 'buc',
    name: 'Business Unit Commerce',
    fullName: 'Business Unit Commerce',
    color: '#F59E0B',
    icon: 'Building',
    description: 'Business and commerce education'
  },
  FASHION: {
    id: 'fashion',
    name: 'Fashion Design',
    fullName: 'Fashion Design Department',
    color: '#EC4899',
    icon: 'Scissors',
    description: 'Fashion design and textile arts'
  },

  // General Subjects
  ENGLISH: {
    id: 'english',
    name: 'English',
    fullName: 'English Language',
    color: '#3B82F6',
    icon: 'BookOpen',
    description: 'English language and literature'
  },
  KINYARWANDA: {
    id: 'kinyarwanda',
    name: 'Kinyarwanda',
    fullName: 'Kinyarwanda Language',
    color: '#EF4444',
    icon: 'BookOpen',
    description: 'Kinyarwanda language and culture'
  },
  MATHEMATICS: {
    id: 'mathematics',
    name: 'Mathematics',
    fullName: 'Mathematics Department',
    color: '#8B5CF6',
    icon: 'Calculator',
    description: 'Mathematics and numerical sciences'
  },
  PHYSICS: {
    id: 'physics',
    name: 'Physics',
    fullName: 'Physics Department',
    color: '#059669',
    icon: 'Zap',
    description: 'Physics and physical sciences'
  },
  ICT: {
    id: 'ict',
    name: 'ICT',
    fullName: 'Information & Communication Technology',
    color: '#0EA5E9',
    icon: 'Monitor',
    description: 'Computer science and technology'
  },
  SPORTS: {
    id: 'sports',
    name: 'Sports',
    fullName: 'Physical Education & Sports',
    color: '#10B981',
    icon: 'Trophy',
    description: 'Physical education and sports'
  },
  FRENCH: {
    id: 'french',
    name: 'French',
    fullName: 'French Language',
    color: '#F97316',
    icon: 'BookOpen',
    description: 'French language and culture'
  }
};

export const getAllDepartments = () => {
  return Object.values(DEPARTMENTS);
};

export const getDepartmentById = (id) => {
  return DEPARTMENTS[id.toUpperCase()] || DEPARTMENTS[id.toLowerCase()] || null;
};

export const getDepartmentsByType = (type) => {
  const departments = Object.values(DEPARTMENTS);
  if (type === 'trade') {
    return departments.filter(dept => ['SOD', 'WOD', 'BUC', 'FASHION'].includes(dept.id.toUpperCase()));
  } else if (type === 'general') {
    return departments.filter(dept => !['SOD', 'WOD', 'BUC', 'FASHION'].includes(dept.id.toUpperCase()));
  }
  return departments;
};

export const getTeacherDepartmentInfo = (teacher) => {
  if (!teacher || !teacher.department) {
    return null;
  }
  return getDepartmentById(teacher.department);
};

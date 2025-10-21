// Department-specific subjects configuration
export const departmentSubjects = {
  sod: [
    { id: 1, name: 'Software Engineering', code: 'SOD101' },
    { id: 2, name: 'Database Management', code: 'SOD102' },
    { id: 3, name: 'Web Development', code: 'SOD103' },
    { id: 4, name: 'Mobile App Development', code: 'SOD104' },
    { id: 5, name: 'System Analysis', code: 'SOD105' },
    { id: 6, name: 'Network Administration', code: 'SOD106' }
  ],
  fashion: [
    { id: 1, name: 'Fashion Design', code: 'FAS101' },
    { id: 2, name: 'Pattern Making', code: 'FAS102' },
    { id: 3, name: 'Textile Technology', code: 'FAS103' },
    { id: 4, name: 'Garment Construction', code: 'FAS104' },
    { id: 5, name: 'Fashion Marketing', code: 'FAS105' },
    { id: 6, name: 'Fashion Illustration', code: 'FAS106' }
  ],
  buc: [
    { id: 1, name: 'Construction Management', code: 'BUC101' },
    { id: 2, name: 'Building Materials', code: 'BUC102' },
    { id: 3, name: 'Structural Engineering', code: 'BUC103' },
    { id: 4, name: 'Architectural Drawing', code: 'BUC104' },
    { id: 5, name: 'Quantity Surveying', code: 'BUC105' },
    { id: 6, name: 'Civil Engineering', code: 'BUC106' }
  ],
  wod: [
    { id: 1, name: 'Woodwork Technology', code: 'WOD101' },
    { id: 2, name: 'Furniture Design', code: 'WOD102' },
    { id: 3, name: 'Wood Finishing', code: 'WOD103' },
    { id: 4, name: 'Carpentry Skills', code: 'WOD104' },
    { id: 5, name: 'Machine Operations', code: 'WOD105' },
    { id: 6, name: 'Wood Preservation', code: 'WOD106' }
  ],
  general: [
    { id: 1, name: 'Mathematics', code: 'GEN101' },
    { id: 2, name: 'English', code: 'GEN102' },
    { id: 3, name: 'Physics', code: 'GEN103' },
    { id: 4, name: 'Chemistry', code: 'GEN104' },
    { id: 5, name: 'Entrepreneurship', code: 'GEN105' },
    { id: 6, name: 'ICT Basics', code: 'GEN106' }
  ]
};

export const getDepartmentSubjects = (departmentId) => {
  return departmentSubjects[departmentId] || departmentSubjects.general;
};

export const getSubjectById = (departmentId, subjectId) => {
  const subjects = getDepartmentSubjects(departmentId);
  return subjects.find(s => s.id === subjectId);
};

export const getAllSubjectsForDepartment = (departmentId) => {
  return getDepartmentSubjects(departmentId);
};

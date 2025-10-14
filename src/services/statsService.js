const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// Initialize sample data for calculations
const initializeSampleData = () => {
  // Initialize posts if not exists
  const existingPosts = localStorage.getItem('posts');
  if (!existingPosts) {
    const samplePosts = [
      { id: 1, title: 'Welcome to School', content: 'Welcome message', visible: true, author: 'admin', date: new Date().toISOString() },
      { id: 2, title: 'Exam Schedule', content: 'Upcoming exams', visible: true, author: 'teacher', date: new Date().toISOString() }
    ];
    localStorage.setItem('posts', JSON.stringify(samplePosts));
  }

  // Initialize users if not exists
  const existingUsers = localStorage.getItem('users');
  if (!existingUsers) {
    const sampleUsers = [
      { id: 1, name: 'Admin User', email: 'admin@school.com', role: 'admin', status: 'active' },
      { id: 2, name: 'Teacher One', email: 'teacher@school.com', role: 'teacher', status: 'active' },
      { id: 3, name: 'Student One', email: 'student@school.com', role: 'student', status: 'active' }
    ];
    localStorage.setItem('users', JSON.stringify(sampleUsers));
  }
};

// Stats Service
export const statsService = {
  async getDashboardStats() {
    try {
      // Initialize sample data
      initializeSampleData();

      const response = await fetch(`${API_BASE}/stats/dashboard`);
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Fallback to calculated stats from localStorage
      return await this.getCalculatedStats();
    }
  },

  async getCalculatedStats() {
    try {
      initializeSampleData();

      const posts = JSON.parse(localStorage.getItem('posts') || '[]');
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const students = JSON.parse(localStorage.getItem('students') || '[]');
      const events = JSON.parse(localStorage.getItem('events') || '[]');

      // Calculate stats
      const totalPosts = posts.length;
      const visiblePosts = posts.filter(p => p.visible !== false).length;
      const totalStudents = students.length;
      const activeStudents = students.filter(s => s.status === 'Active').length;
      const totalTeachers = users.filter(u => u.role === 'teacher' || u.role === 'admin').length;
      const activeTeachers = users.filter(u => (u.role === 'teacher' || u.role === 'admin') && u.status === 'active').length;
      const totalCourses = 48; // Static for now
      const activeCourses = 45; // Static for now

      return {
        posts: {
          total: totalPosts,
          visible: visiblePosts,
          hidden: totalPosts - visiblePosts
        },
        students: {
          total: totalStudents,
          active: activeStudents,
          inactive: totalStudents - activeStudents
        },
        teachers: {
          total: totalTeachers,
          active: activeTeachers,
          inactive: totalTeachers - activeTeachers
        },
        courses: {
          total: totalCourses,
          active: activeCourses,
          inactive: totalCourses - activeCourses
        }
      };
    } catch (error) {
      console.error('Error calculating stats:', error);
      // Return default stats
      return {
        posts: { total: 0, visible: 0, hidden: 0 },
        students: { total: 0, active: 0, inactive: 0 },
        teachers: { total: 0, active: 0, inactive: 0 },
        courses: { total: 0, active: 0, inactive: 0 }
      };
    }
  }
};

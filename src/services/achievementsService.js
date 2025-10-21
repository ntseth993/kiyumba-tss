// Achievements Service for managing student achievements and awards
const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const useLocalStorage = !import.meta.env.VITE_API_BASE;

// Get all achievements
export const getAchievements = async () => {
  if (useLocalStorage) {
    return JSON.parse(localStorage.getItem('achievements') || '[]');
  }

  try {
    const response = await fetch(`${API_BASE}/achievements`);
    if (!response.ok) throw new Error('Failed to fetch achievements');
    return await response.json();
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return JSON.parse(localStorage.getItem('achievements') || '[]');
  }
};

// Get achievements for specific student
export const getStudentAchievements = async (studentId) => {
  const achievements = await getAchievements();
  return achievements.filter(a => a.studentId === studentId);
};

// Get achievements by type
export const getAchievementsByType = async (type) => {
  const achievements = await getAchievements();
  return achievements.filter(a => a.type === type);
};

// Create achievement
export const createAchievement = async (achievementData) => {
  if (useLocalStorage) {
    const achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
    const newAchievement = {
      id: Date.now(),
      ...achievementData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [newAchievement, ...achievements];
    localStorage.setItem('achievements', JSON.stringify(updated));
    return newAchievement;
  }

  try {
    const response = await fetch(`${API_BASE}/achievements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(achievementData),
    });
    if (!response.ok) throw new Error('Failed to create achievement');
    return await response.json();
  } catch (error) {
    console.error('Error creating achievement:', error);
    throw error;
  }
};

// Update achievement
export const updateAchievement = async (id, achievementData) => {
  if (useLocalStorage) {
    const achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
    const updated = achievements.map(a => 
      a.id === id ? { ...a, ...achievementData, updatedAt: new Date().toISOString() } : a
    );
    localStorage.setItem('achievements', JSON.stringify(updated));
    return updated.find(a => a.id === id);
  }

  try {
    const response = await fetch(`${API_BASE}/achievements?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(achievementData),
    });
    if (!response.ok) throw new Error('Failed to update achievement');
    return await response.json();
  } catch (error) {
    console.error('Error updating achievement:', error);
    throw error;
  }
};

// Delete achievement
export const deleteAchievement = async (id) => {
  if (useLocalStorage) {
    const achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
    const updated = achievements.filter(a => a.id !== id);
    localStorage.setItem('achievements', JSON.stringify(updated));
    return true;
  }

  try {
    const response = await fetch(`${API_BASE}/achievements?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete achievement');
    return true;
  } catch (error) {
    console.error('Error deleting achievement:', error);
    throw error;
  }
};

// Get achievement statistics
export const getAchievementStatistics = async () => {
  const achievements = await getAchievements();
  
  const typeCount = {};
  achievements.forEach(a => {
    typeCount[a.type] = (typeCount[a.type] || 0) + 1;
  });

  return {
    total: achievements.length,
    byType: typeCount,
    recent: achievements
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
  };
};

// Get top achievers
export const getTopAchievers = async (limit = 10) => {
  const achievements = await getAchievements();
  
  const studentCounts = {};
  achievements.forEach(a => {
    if (!studentCounts[a.studentId]) {
      studentCounts[a.studentId] = {
        studentId: a.studentId,
        studentName: a.studentName,
        studentClass: a.studentClass,
        studentDepartment: a.studentDepartment,
        count: 0,
        achievements: []
      };
    }
    studentCounts[a.studentId].count++;
    studentCounts[a.studentId].achievements.push(a);
  });

  return Object.values(studentCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

// Achievement types
export const ACHIEVEMENT_TYPES = {
  SPORTS: 'Sports',
  MUSIC: 'Music',
  DRAMA: 'Drama',
  ART: 'Art',
  LEADERSHIP: 'Leadership',
  ACADEMIC: 'Academic',
  COMMUNITY_SERVICE: 'Community Service',
  OTHER: 'Other'
};

// Award levels
export const AWARD_LEVELS = {
  GOLD: 'Gold',
  SILVER: 'Silver',
  BRONZE: 'Bronze',
  PARTICIPATION: 'Participation',
  CERTIFICATE: 'Certificate'
};

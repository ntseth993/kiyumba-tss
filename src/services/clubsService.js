// Clubs Service for managing student clubs and activities
const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const useLocalStorage = !import.meta.env.VITE_API_BASE;

// Get all clubs
export const getClubs = async () => {
  if (useLocalStorage) {
    return JSON.parse(localStorage.getItem('clubs') || '[]');
  }

  try {
    const response = await fetch(`${API_BASE}/clubs`);
    if (!response.ok) throw new Error('Failed to fetch clubs');
    return await response.json();
  } catch (error) {
    console.error('Error fetching clubs:', error);
    return JSON.parse(localStorage.getItem('clubs') || '[]');
  }
};

// Get club by ID
export const getClubById = async (id) => {
  const clubs = await getClubs();
  return clubs.find(c => c.id === id);
};

// Create club
export const createClub = async (clubData) => {
  if (useLocalStorage) {
    const clubs = JSON.parse(localStorage.getItem('clubs') || '[]');
    const newClub = {
      id: Date.now(),
      ...clubData,
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [newClub, ...clubs];
    localStorage.setItem('clubs', JSON.stringify(updated));
    return newClub;
  }

  try {
    const response = await fetch(`${API_BASE}/clubs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clubData),
    });
    if (!response.ok) throw new Error('Failed to create club');
    return await response.json();
  } catch (error) {
    console.error('Error creating club:', error);
    throw error;
  }
};

// Update club
export const updateClub = async (id, clubData) => {
  if (useLocalStorage) {
    const clubs = JSON.parse(localStorage.getItem('clubs') || '[]');
    const updated = clubs.map(c => 
      c.id === id ? { ...c, ...clubData, updatedAt: new Date().toISOString() } : c
    );
    localStorage.setItem('clubs', JSON.stringify(updated));
    return updated.find(c => c.id === id);
  }

  try {
    const response = await fetch(`${API_BASE}/clubs?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clubData),
    });
    if (!response.ok) throw new Error('Failed to update club');
    return await response.json();
  } catch (error) {
    console.error('Error updating club:', error);
    throw error;
  }
};

// Delete club
export const deleteClub = async (id) => {
  if (useLocalStorage) {
    const clubs = JSON.parse(localStorage.getItem('clubs') || '[]');
    const updated = clubs.filter(c => c.id !== id);
    localStorage.setItem('clubs', JSON.stringify(updated));
    return true;
  }

  try {
    const response = await fetch(`${API_BASE}/clubs?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete club');
    return true;
  } catch (error) {
    console.error('Error deleting club:', error);
    throw error;
  }
};

// Add student to club
export const addStudentToClub = async (clubId, studentData) => {
  const clubs = await getClubs();
  const club = clubs.find(c => c.id === clubId);
  
  if (!club) throw new Error('Club not found');
  
  const member = {
    id: Date.now(),
    studentId: studentData.studentId,
    studentName: studentData.name,
    studentClass: studentData.class,
    studentDepartment: studentData.department,
    joinedDate: new Date().toISOString(),
    attendance: 0,
    role: 'member'
  };

  const updatedMembers = [...(club.members || []), member];
  await updateClub(clubId, { members: updatedMembers });
  
  return member;
};

// Remove student from club
export const removeStudentFromClub = async (clubId, studentId) => {
  const clubs = await getClubs();
  const club = clubs.find(c => c.id === clubId);
  
  if (!club) throw new Error('Club not found');
  
  const updatedMembers = (club.members || []).filter(m => m.studentId !== studentId);
  await updateClub(clubId, { members: updatedMembers });
  
  return true;
};

// Get club statistics
export const getClubStatistics = async () => {
  const clubs = await getClubs();
  
  return {
    totalClubs: clubs.length,
    activeClubs: clubs.filter(c => c.status === 'active').length,
    totalMembers: clubs.reduce((sum, c) => sum + (c.members?.length || 0), 0),
    averageMembersPerClub: clubs.length > 0 
      ? Math.round(clubs.reduce((sum, c) => sum + (c.members?.length || 0), 0) / clubs.length)
      : 0
  };
};

// Initialize default clubs if none exist
export const initializeDefaultClubs = async () => {
  const clubs = await getClubs();
  
  if (clubs.length === 0) {
    const defaultClubs = [
      {
        id: 1,
        name: 'Music Club',
        description: 'For students passionate about music and singing',
        type: 'music',
        coordinator: 'Mrs. Sarah Johnson',
        meetingDay: 'Thursday',
        meetingTime: '15:00',
        meetingVenue: 'Music Room',
        status: 'active',
        members: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Drama Club',
        description: 'Theatrical performances and drama activities',
        type: 'drama',
        coordinator: 'Mr. David Brown',
        meetingDay: 'Wednesday',
        meetingTime: '16:00',
        meetingVenue: 'Auditorium',
        status: 'active',
        members: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Sports Club',
        description: 'Various sports and physical activities',
        type: 'sports',
        coordinator: 'Coach Mike Wilson',
        meetingDay: 'Tuesday',
        meetingTime: '14:30',
        meetingVenue: 'Sports Field',
        status: 'active',
        members: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    localStorage.setItem('clubs', JSON.stringify(defaultClubs));
    return defaultClubs;
  }
  
  return clubs;
};

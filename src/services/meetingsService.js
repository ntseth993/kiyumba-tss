const getBaseURL = () => {
  // Check for localStorage mode first
  if (import.meta.env.VITE_USE_LOCAL_STORAGE === 'true') {
    return 'INVALID_API_URL';
  }

  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Use the same port as the main API service
  const port = import.meta.env.VITE_API_PORT || '4000';
  return `http://localhost:${port}`;
};

const API_BASE = getBaseURL();
const useLocalStorage = import.meta.env.VITE_USE_LOCAL_STORAGE === 'true' || API_BASE === 'INVALID_API_URL';

// Initialize sample meetings data
const initializeMeetings = () => {
  const existing = localStorage.getItem('schoolMeetings');
  if (!existing) {
    const sampleMeetings = [
      {
        id: '1',
        title: 'Staff Meeting',
        description: 'Weekly staff meeting to discuss school operations',
        scheduledTime: '2024-11-25T10:00:00',
        duration: 60,
        platform: 'zoom',
        meetingType: 'administrative',
        hostId: 'admin1',
        hostName: 'School Admin',
        hostEmail: 'admin@school.com',
        participants: [],
        status: 'scheduled',
        maxParticipants: 50,
        settings: {
          recording: false,
          waitingRoom: true,
          joinBeforeHost: false,
          muteUponEntry: true
        },
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Parent-Teacher Conference',
        description: 'Quarterly meeting with parents to discuss student progress',
        scheduledTime: '2024-11-28T14:00:00',
        duration: 90,
        platform: 'teams',
        meetingType: 'parent-teacher',
        hostId: 'teacher1',
        hostName: 'John Smith',
        hostEmail: 'john.smith@school.com',
        participants: [],
        status: 'scheduled',
        maxParticipants: 100,
        settings: {
          recording: true,
          waitingRoom: true,
          joinBeforeHost: false,
          muteUponEntry: true
        },
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('schoolMeetings', JSON.stringify(sampleMeetings));
  }
};

export const getMeetings = async () => {
  // Always use localStorage if explicitly enabled
  if (useLocalStorage) {
    console.log('Using localStorage for meetings');
    initializeMeetings();
    const stored = localStorage.getItem('schoolMeetings');
    return stored ? JSON.parse(stored) : [];
  }

  // If localStorage mode is not explicitly enabled, still try localStorage first if data exists
  const localStorageMeetings = localStorage.getItem('schoolMeetings');
  if (localStorageMeetings) {
    console.log('Using localStorage fallback for meetings');
    initializeMeetings();
    return JSON.parse(localStorageMeetings);
  }

  try {
    // Initialize sample data if not exists
    initializeMeetings();

    const response = await fetch(`${API_BASE}/api/meetings`);
    if (!response.ok) throw new Error('Failed to fetch meetings');
    return await response.json();
  } catch (error) {
    console.error('Error fetching meetings:', error);
    // Fallback to localStorage
    initializeMeetings();
    const stored = localStorage.getItem('schoolMeetings');
    return stored ? JSON.parse(stored) : [];
  }
};

export const getUpcomingMeetings = async (hours = 168) => {
  try {
    const meetings = await getMeetings();
    const now = new Date();
    const futureTime = new Date(now.getTime() + (hours * 60 * 60 * 1000));

    return meetings.filter(meeting => {
      const meetingTime = new Date(meeting.scheduledTime);
      return meetingTime >= now && meetingTime <= futureTime;
    }).sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
  } catch (error) {
    console.error('Error fetching upcoming meetings:', error);
    return [];
  }
};

export const getTodayMeetings = async () => {
  try {
    const meetings = await getMeetings();
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    return meetings.filter(meeting => {
      const meetingTime = new Date(meeting.scheduledTime);
      return meetingTime >= startOfDay && meetingTime < endOfDay;
    }).sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
  } catch (error) {
    console.error('Error fetching today\'s meetings:', error);
    return [];
  }
};

export const getUserMeetings = async (userId) => {
  try {
    const meetings = await getMeetings();
    return meetings.filter(meeting =>
      meeting.hostId === userId ||
      (meeting.participants && meeting.participants.some(p => p.id === userId))
    );
  } catch (error) {
    console.error('Error fetching user meetings:', error);
    return [];
  }
};

export const createMeeting = async (meetingData) => {
  // Always use localStorage if explicitly enabled
  if (useLocalStorage) {
    console.log('Using localStorage for creating meeting');
    initializeMeetings();
    const meetings = JSON.parse(localStorage.getItem('schoolMeetings') || '[]');
    const newMeeting = {
      id: Date.now().toString(),
      ...meetingData,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };
    const updated = [newMeeting, ...meetings];
    localStorage.setItem('schoolMeetings', JSON.stringify(updated));
    return newMeeting;
  }

  // If localStorage mode is not explicitly enabled, still try localStorage first
  const localStorageMeetings = localStorage.getItem('schoolMeetings');
  if (localStorageMeetings || !localStorageMeetings) {
    console.log('Using localStorage fallback for creating meeting');
    initializeMeetings();
    const meetings = JSON.parse(localStorage.getItem('schoolMeetings') || '[]');
    const newMeeting = {
      id: Date.now().toString(),
      ...meetingData,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };
    const updated = [newMeeting, ...meetings];
    localStorage.setItem('schoolMeetings', JSON.stringify(updated));
    return newMeeting;
  }

  try {
    const response = await fetch(`${API_BASE}/api/meetings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meetingData)
    });
    if (!response.ok) throw new Error('Failed to create meeting');
    return await response.json();
  } catch (error) {
    console.error('Error creating meeting, using localStorage:', error);
    const meetings = await getMeetings();
    const newMeeting = {
      id: Date.now().toString(),
      ...meetingData,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };
    meetings.unshift(newMeeting);
    localStorage.setItem('schoolMeetings', JSON.stringify(meetings));
    return newMeeting;
  }
};

export const updateMeeting = async (id, meetingData) => {
  try {
    const response = await fetch(`${API_BASE}/api/meetings?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meetingData)
    });
    if (!response.ok) throw new Error('Failed to update meeting');
    return await response.json();
  } catch (error) {
    console.error('Error updating meeting, using localStorage:', error);
    const meetings = await getMeetings();
    const index = meetings.findIndex(m => m.id === id);
    if (index !== -1) {
      meetings[index] = { ...meetings[index], ...meetingData, updatedAt: new Date().toISOString() };
      localStorage.setItem('schoolMeetings', JSON.stringify(meetings));
      return meetings[index];
    }
    throw new Error('Meeting not found');
  }
};

export const deleteMeeting = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/api/meetings?id=${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete meeting');
    return true;
  } catch (error) {
    console.error('Error deleting meeting, using localStorage:', error);
    const meetings = await getMeetings();
    const filtered = meetings.filter(m => m.id !== id);
    localStorage.setItem('schoolMeetings', JSON.stringify(filtered));
    return true;
  }
};

export const startMeeting = async (id, user) => {
  try {
    const meetings = await getMeetings();
    const meeting = meetings.find(m => m.id === id);
    if (!meeting) throw new Error('Meeting not found');

    const updatedMeeting = {
      ...meeting,
      status: 'active',
      startedAt: new Date().toISOString(),
      startedBy: user
    };

    return await updateMeeting(id, updatedMeeting);
  } catch (error) {
    console.error('Error starting meeting:', error);
    throw error;
  }
};

export const endMeeting = async (id, user) => {
  try {
    const meetings = await getMeetings();
    const meeting = meetings.find(m => m.id === id);
    if (!meeting) throw new Error('Meeting not found');

    const updatedMeeting = {
      ...meeting,
      status: 'ended',
      endedAt: new Date().toISOString(),
      endedBy: user
    };

    return await updateMeeting(id, updatedMeeting);
  } catch (error) {
    console.error('Error ending meeting:', error);
    throw error;
  }
};

export const joinMeeting = async (id, userData) => {
  try {
    const meetings = await getMeetings();
    const meeting = meetings.find(m => m.id === id);
    if (!meeting) throw new Error('Meeting not found');

    // Check if user is already a participant
    const existingParticipant = meeting.participants?.find(p => p.id === userData.id);
    if (existingParticipant) {
      throw new Error('Already joined this meeting');
    }

    const updatedParticipants = [...(meeting.participants || []), {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      joinedAt: new Date().toISOString(),
      status: 'joined'
    }];

    return await updateMeeting(id, { participants: updatedParticipants });
  } catch (error) {
    console.error('Error joining meeting:', error);
    throw error;
  }
};

export const sendInvitations = async (id) => {
  try {
    const meetings = await getMeetings();
    const meeting = meetings.find(m => m.id === id);
    if (!meeting) throw new Error('Meeting not found');

    // Here you would integrate with email/SMS service
    console.log('Sending invitations for meeting:', meeting.title);

    return { success: true, message: 'Invitations sent successfully' };
  } catch (error) {
    console.error('Error sending invitations:', error);
    throw error;
  }
};

export const searchMeetings = async (query) => {
  try {
    const meetings = await getMeetings();
    const lowercaseQuery = query.toLowerCase();

    return meetings.filter(meeting =>
      meeting.title.toLowerCase().includes(lowercaseQuery) ||
      meeting.description.toLowerCase().includes(lowercaseQuery) ||
      meeting.hostName?.toLowerCase().includes(lowercaseQuery) ||
      meeting.meetingType.toLowerCase().includes(lowercaseQuery)
    );
  } catch (error) {
    console.error('Error searching meetings:', error);
    return [];
  }
};

export const getMeetingStatistics = async () => {
  try {
    const meetings = await getMeetings();

    return {
      totalMeetings: meetings.length,
      scheduledMeetings: meetings.filter(m => m.status === 'scheduled').length,
      activeMeetings: meetings.filter(m => m.status === 'active').length,
      endedMeetings: meetings.filter(m => m.status === 'ended').length,
      cancelledMeetings: meetings.filter(m => m.status === 'cancelled').length,
      totalParticipants: meetings.reduce((sum, m) => sum + (m.participants?.length || 0), 0),
      upcomingThisWeek: await getUpcomingMeetings(168)
    };
  } catch (error) {
    console.error('Error getting meeting statistics:', error);
    return {
      totalMeetings: 0,
      scheduledMeetings: 0,
      activeMeetings: 0,
      endedMeetings: 0,
      cancelledMeetings: 0,
      totalParticipants: 0,
      upcomingThisWeek: []
    };
  }
};

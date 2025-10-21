// Club Events Service for managing club activities and events
const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const useLocalStorage = !import.meta.env.VITE_API_BASE;

// Get all events
export const getClubEvents = async () => {
  if (useLocalStorage) {
    return JSON.parse(localStorage.getItem('clubEvents') || '[]');
  }

  try {
    const response = await fetch(`${API_BASE}/club-events`);
    if (!response.ok) throw new Error('Failed to fetch events');
    return await response.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    return JSON.parse(localStorage.getItem('clubEvents') || '[]');
  }
};

// Get upcoming events
export const getUpcomingEvents = async () => {
  const events = await getClubEvents();
  const now = new Date();
  return events
    .filter(e => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Get past events
export const getPastEvents = async () => {
  const events = await getClubEvents();
  const now = new Date();
  return events
    .filter(e => new Date(e.date) < now)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Create event
export const createClubEvent = async (eventData) => {
  if (useLocalStorage) {
    const events = JSON.parse(localStorage.getItem('clubEvents') || '[]');
    const newEvent = {
      id: Date.now(),
      ...eventData,
      attendees: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [newEvent, ...events];
    localStorage.setItem('clubEvents', JSON.stringify(updated));
    return newEvent;
  }

  try {
    const response = await fetch(`${API_BASE}/club-events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    if (!response.ok) throw new Error('Failed to create event');
    return await response.json();
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Update event
export const updateClubEvent = async (id, eventData) => {
  if (useLocalStorage) {
    const events = JSON.parse(localStorage.getItem('clubEvents') || '[]');
    const updated = events.map(e => 
      e.id === id ? { ...e, ...eventData, updatedAt: new Date().toISOString() } : e
    );
    localStorage.setItem('clubEvents', JSON.stringify(updated));
    return updated.find(e => e.id === id);
  }

  try {
    const response = await fetch(`${API_BASE}/club-events?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    if (!response.ok) throw new Error('Failed to update event');
    return await response.json();
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// Delete event
export const deleteClubEvent = async (id) => {
  if (useLocalStorage) {
    const events = JSON.parse(localStorage.getItem('clubEvents') || '[]');
    const updated = events.filter(e => e.id !== id);
    localStorage.setItem('clubEvents', JSON.stringify(updated));
    return true;
  }

  try {
    const response = await fetch(`${API_BASE}/club-events?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete event');
    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// Register student for event
export const registerStudentForEvent = async (eventId, studentData) => {
  const events = await getClubEvents();
  const event = events.find(e => e.id === eventId);
  
  if (!event) throw new Error('Event not found');
  
  const attendee = {
    id: Date.now(),
    studentId: studentData.studentId,
    studentName: studentData.name,
    studentClass: studentData.class,
    studentDepartment: studentData.department,
    registeredDate: new Date().toISOString(),
    attended: false
  };

  const updatedAttendees = [...(event.attendees || []), attendee];
  await updateClubEvent(eventId, { attendees: updatedAttendees });
  
  return attendee;
};

// Mark attendance for event
export const markEventAttendance = async (eventId, studentId, attended) => {
  const events = await getClubEvents();
  const event = events.find(e => e.id === eventId);
  
  if (!event) throw new Error('Event not found');
  
  const updatedAttendees = (event.attendees || []).map(a => 
    a.studentId === studentId ? { ...a, attended } : a
  );
  
  await updateClubEvent(eventId, { attendees: updatedAttendees });
  return true;
};

// Initialize default events
export const initializeDefaultEvents = async () => {
  const events = await getClubEvents();
  
  if (events.length === 0) {
    const now = new Date();
    const defaultEvents = [
      {
        id: 1,
        title: 'Inter-House Sports Competition',
        description: 'Annual sports day with various competitions',
        type: 'sports',
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '14:00',
        venue: 'School Sports Field',
        organizer: 'Sports Club',
        maxParticipants: 100,
        status: 'upcoming',
        attendees: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Music Festival Auditions',
        description: 'Auditions for the annual music festival',
        type: 'music',
        date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '15:30',
        venue: 'Auditorium',
        organizer: 'Music Club',
        maxParticipants: 50,
        status: 'upcoming',
        attendees: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    localStorage.setItem('clubEvents', JSON.stringify(defaultEvents));
    return defaultEvents;
  }
  
  return events;
};

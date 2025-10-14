const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// Initialize sample events data
const initializeEvents = () => {
  const existing = localStorage.getItem('events');
  if (!existing) {
    const sampleEvents = [
      { id: 1, title: 'Staff Meeting', date: '2024-04-15', time: '10:00 AM', createdAt: new Date().toISOString() },
      { id: 2, title: 'Parent-Teacher Conference', date: '2024-04-18', time: '2:00 PM', createdAt: new Date().toISOString() },
      { id: 3, title: 'Annual Sports Day', date: '2024-04-25', time: '9:00 AM', createdAt: new Date().toISOString() }
    ];
    localStorage.setItem('events', JSON.stringify(sampleEvents));
  }
};

export const getEvents = async () => {
  try {
    // Initialize sample data if not exists
    initializeEvents();

    const response = await fetch(`${API_BASE}/api/events`);
    if (!response.ok) throw new Error('Failed to fetch events');
    return await response.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    // Fallback to localStorage
    initializeEvents();
    const stored = localStorage.getItem('events');
    return stored ? JSON.parse(stored) : [];
  }
};

export const getUpcomingEvents = async () => {
  try {
    const events = await getEvents();
    const now = new Date();
    return events.filter(e => new Date(e.date) >= now).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return [];
  }
};

export const createEvent = async (eventData) => {
  try {
    const response = await fetch(`${API_BASE}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    if (!response.ok) throw new Error('Failed to create event');
    return await response.json();
  } catch (error) {
    console.error('Error creating event, using localStorage:', error);
    const events = await getEvents();
    const newEvent = { id: Date.now(), ...eventData, createdAt: new Date().toISOString() };
    events.push(newEvent);
    localStorage.setItem('events', JSON.stringify(events));
    return newEvent;
  }
};

export const updateEvent = async (id, eventData) => {
  try {
    const response = await fetch(`${API_BASE}/api/events?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    if (!response.ok) throw new Error('Failed to update event');
    return await response.json();
  } catch (error) {
    console.error('Error updating event, using localStorage:', error);
    const events = await getEvents();
    const index = events.findIndex(e => e.id === id);
    if (index !== -1) {
      events[index] = { ...events[index], ...eventData, updatedAt: new Date().toISOString() };
      localStorage.setItem('events', JSON.stringify(events));
      return events[index];
    }
    throw new Error('Event not found');
  }
};

export const deleteEvent = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/api/events?id=${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete event');
    return true;
  } catch (error) {
    console.error('Error deleting event, using localStorage:', error);
    const events = await getEvents();
    const filtered = events.filter(e => e.id !== id);
    localStorage.setItem('events', JSON.stringify(filtered));
    return true;
  }
};

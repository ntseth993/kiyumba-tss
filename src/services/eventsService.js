const API_BASE = import.meta.env.VITE_API_URL || '';

export const getEvents = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/events`);
    if (!response.ok) throw new Error('Failed to fetch events');
    return await response.json();
  } catch (error) {
    console.error('Error fetching events:', error);
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
    console.error('Error creating event:', error);
    throw error;
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
    console.error('Error updating event:', error);
    throw error;
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
    console.error('Error deleting event:', error);
    throw error;
  }
};

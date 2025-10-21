// Announcements Service
const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const useLocalStorage = !import.meta.env.VITE_API_BASE;

// Get all announcements
export const getAnnouncements = async () => {
  if (useLocalStorage) {
    return JSON.parse(localStorage.getItem('announcements') || '[]');
  }

  try {
    const response = await fetch(`${API_BASE}/announcements`);
    if (!response.ok) {
      throw new Error('Failed to fetch announcements');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return JSON.parse(localStorage.getItem('announcements') || '[]');
  }
};

// Get active announcements (not expired)
export const getActiveAnnouncements = async () => {
  const announcements = await getAnnouncements();
  const now = new Date().getTime();
  return announcements.filter(a => {
    if (!a.expiresAt) return true;
    return new Date(a.expiresAt).getTime() > now;
  });
};

// Create announcement
export const createAnnouncement = async (data) => {
  if (useLocalStorage) {
    const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
    const newAnnouncement = {
      id: Date.now(),
      ...data,
      createdAt: new Date().toISOString(),
      views: 0
    };
    const updated = [newAnnouncement, ...announcements];
    localStorage.setItem('announcements', JSON.stringify(updated));
    return newAnnouncement;
  }

  try {
    const response = await fetch(`${API_BASE}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to create announcement');
    return await response.json();
  } catch (error) {
    console.error('Error creating announcement:', error);
    const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
    const newAnnouncement = {
      id: Date.now(),
      ...data,
      createdAt: new Date().toISOString(),
      views: 0
    };
    const updated = [newAnnouncement, ...announcements];
    localStorage.setItem('announcements', JSON.stringify(updated));
    return newAnnouncement;
  }
};

// Update announcement
export const updateAnnouncement = async (id, data) => {
  if (useLocalStorage) {
    const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
    const updated = announcements.map(a => a.id === id ? { ...a, ...data } : a);
    localStorage.setItem('announcements', JSON.stringify(updated));
    return updated.find(a => a.id === id);
  }

  try {
    const response = await fetch(`${API_BASE}/announcements?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to update announcement');
    return await response.json();
  } catch (error) {
    console.error('Error updating announcement:', error);
    const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
    const updated = announcements.map(a => a.id === id ? { ...a, ...data } : a);
    localStorage.setItem('announcements', JSON.stringify(updated));
    return updated.find(a => a.id === id);
  }
};

// Delete announcement
export const deleteAnnouncement = async (id) => {
  if (useLocalStorage) {
    const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
    const updated = announcements.filter(a => a.id !== id);
    localStorage.setItem('announcements', JSON.stringify(updated));
    return true;
  }

  try {
    const response = await fetch(`${API_BASE}/announcements?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to delete announcement');
    return true;
  } catch (error) {
    console.error('Error deleting announcement:', error);
    const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
    const updated = announcements.filter(a => a.id !== id);
    localStorage.setItem('announcements', JSON.stringify(updated));
    return true;
  }
};

// Mark announcement as viewed
export const markAnnouncementAsViewed = async (id, userId) => {
  if (useLocalStorage) {
    const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
    const updated = announcements.map(a => {
      if (a.id === id) {
        const viewedBy = a.viewedBy || [];
        if (!viewedBy.includes(userId)) {
          return {
            ...a,
            views: (a.views || 0) + 1,
            viewedBy: [...viewedBy, userId]
          };
        }
      }
      return a;
    });
    localStorage.setItem('announcements', JSON.stringify(updated));
    return updated.find(a => a.id === id);
  }

  try {
    const response = await fetch(`${API_BASE}/announcements/view?id=${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) throw new Error('Failed to mark as viewed');
    return await response.json();
  } catch (error) {
    console.error('Error marking announcement as viewed:', error);
    return null;
  }
};

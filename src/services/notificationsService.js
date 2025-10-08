const API_BASE = import.meta.env.VITE_API_URL || '';

export const getNotifications = async (role = null) => {
  try {
    const url = role 
      ? `${API_BASE}/api/notifications?role=${role}`
      : `${API_BASE}/api/notifications`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

export const createNotification = async (notificationData) => {
  try {
    const response = await fetch(`${API_BASE}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notificationData)
    });
    if (!response.ok) throw new Error('Failed to create notification');
    return await response.json();
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

const API_BASE = import.meta.env.VITE_USE_LOCAL_STORAGE === 'true' ? 'INVALID_API_URL' : (import.meta.env.VITE_API_BASE || '/api');
const useLocalStorage = import.meta.env.VITE_USE_LOCAL_STORAGE === 'true';

// Helper function to safely get from localStorage
const safeLocalStorageGet = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

// Helper function to safely set in localStorage
const safeLocalStorageSet = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
};

export const getNotifications = async (role = null) => {
  // Always use localStorage if explicitly enabled
  if (useLocalStorage) {
    console.log('Using localStorage for notifications');
    const notifications = safeLocalStorageGet('schoolNotifications');
    return role ? notifications.filter(n => n.targetAudience === role || n.targetAudience === 'all') : notifications;
  }

  // If localStorage mode is not explicitly enabled, still try localStorage first if data exists
  const localStorageNotifications = safeLocalStorageGet('schoolNotifications');
  if (localStorageNotifications.length > 0) {
    console.log('Using localStorage fallback for notifications');
    return role ? localStorageNotifications.filter(n => n.targetAudience === role || n.targetAudience === 'all') : localStorageNotifications;
  }

  try {
    const url = role
      ? `${API_BASE}/api/notifications?role=${role}`
      : `${API_BASE}/api/notifications`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    const notifications = safeLocalStorageGet('schoolNotifications');
    return role ? notifications.filter(n => n.targetAudience === role || n.targetAudience === 'all') : notifications;
  }
};

export const createNotification = async (notificationData) => {
  // Always use localStorage if explicitly enabled
  if (useLocalStorage) {
    console.log('Using localStorage for creating notification');
    const notifications = safeLocalStorageGet('schoolNotifications');
    const newNotification = {
      id: Date.now().toString(),
      ...notificationData,
      createdAt: new Date().toISOString(),
      views: 0
    };
    const updated = [newNotification, ...notifications];
    safeLocalStorageSet('schoolNotifications', updated);
    return newNotification;
  }

  // If localStorage mode is not explicitly enabled, still try localStorage first
  const localStorageNotifications = safeLocalStorageGet('schoolNotifications');
  if (localStorageNotifications.length >= 0) {
    console.log('Using localStorage fallback for creating notification');
    const newNotification = {
      id: Date.now().toString(),
      ...notificationData,
      createdAt: new Date().toISOString(),
      views: 0
    };
    const updated = [newNotification, ...localStorageNotifications];
    safeLocalStorageSet('schoolNotifications', updated);
    return newNotification;
  }

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
    const notifications = safeLocalStorageGet('schoolNotifications');
    const newNotification = {
      id: Date.now().toString(),
      ...notificationData,
      createdAt: new Date().toISOString(),
      views: 0
    };
    const updated = [newNotification, ...notifications];
    safeLocalStorageSet('schoolNotifications', updated);
    return newNotification;
  }
};

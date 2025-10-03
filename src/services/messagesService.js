// Messages service for admin-user communication
const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const useLocalStorage = !import.meta.env.VITE_API_BASE;

// Get messages for a user
export const getUserMessages = async (userId) => {
  if (useLocalStorage) {
    return JSON.parse(localStorage.getItem('messages') || '[]');
  }

  try {
    const response = await fetch(`${API_BASE}/messages?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching messages:', error);
    return JSON.parse(localStorage.getItem('messages') || '[]');
  }
};

// Get all messages for admin
export const getAllMessages = async () => {
  if (useLocalStorage) {
    return JSON.parse(localStorage.getItem('messages') || '[]');
  }

  try {
    const response = await fetch(`${API_BASE}/messages?adminOnly=true`);
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching messages:', error);
    return JSON.parse(localStorage.getItem('messages') || '[]');
  }
};

// Send a new message
export const sendMessage = async (messageData) => {
  if (useLocalStorage) {
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const newMessage = {
      id: Date.now(),
      ...messageData,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    const updated = [newMessage, ...messages];
    localStorage.setItem('messages', JSON.stringify(updated));
    return newMessage;
  }

  try {
    const response = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    // Fallback to localStorage if API fails
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const newMessage = {
      id: Date.now(),
      ...messageData,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    const updated = [newMessage, ...messages];
    localStorage.setItem('messages', JSON.stringify(updated));
    return newMessage;
  }
};

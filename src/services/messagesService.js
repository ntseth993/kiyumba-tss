// Messages service for admin-user communication
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// Get messages for a user
export const getUserMessages = async (userId) => {
  try {
    const response = await fetch(`${API_BASE}/messages?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

// Get all messages for admin
export const getAllMessages = async () => {
  try {
    const response = await fetch(`${API_BASE}/messages?adminOnly=true`);
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

// Send a new message
export const sendMessage = async (messageData) => {
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
    throw error;
  }
};

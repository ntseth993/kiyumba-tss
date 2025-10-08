const API_BASE = import.meta.env.VITE_API_URL || '';

export const getChatMessages = async (limit = 100, userId = null) => {
  try {
    const url = userId 
      ? `${API_BASE}/api/chat?limit=${limit}&user_id=${userId}`
      : `${API_BASE}/api/chat?limit=${limit}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch messages');
    return await response.json();
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    throw error;
  }
};

export const sendChatMessage = async (messageData) => {
  try {
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData)
    });
    if (!response.ok) throw new Error('Failed to send message');
    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const deleteChatMessage = async (messageId, userId) => {
  try {
    const response = await fetch(`${API_BASE}/api/chat?id=${messageId}&user_id=${userId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete message');
    return true;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

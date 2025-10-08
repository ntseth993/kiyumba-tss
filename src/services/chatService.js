const API_BASE = import.meta.env.VITE_API_URL || '';
const USE_LOCALSTORAGE = true; // Use localStorage for now

export const getChatMessages = async (limit = 100, userId = null) => {
  // Use localStorage for demo/offline mode
  if (USE_LOCALSTORAGE) {
    const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    return messages.slice(-limit);
  }

  try {
    const url = userId 
      ? `${API_BASE}/api/chat?limit=${limit}&user_id=${userId}`
      : `${API_BASE}/api/chat?limit=${limit}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch messages');
    return await response.json();
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    // Fallback to localStorage
    const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    return messages.slice(-limit);
  }
};

export const sendChatMessage = async (messageData) => {
  // Use localStorage for demo/offline mode
  if (USE_LOCALSTORAGE) {
    const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    const newMessage = {
      id: Date.now(),
      ...messageData,
      created_at: new Date().toISOString(),
      sender_name: messageData.sender_name || 'User',
      reactions: []
    };
    messages.push(newMessage);
    localStorage.setItem('chatMessages', JSON.stringify(messages));
    return newMessage;
  }

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
    // Fallback to localStorage
    const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    const newMessage = {
      id: Date.now(),
      ...messageData,
      created_at: new Date().toISOString(),
      sender_name: messageData.sender_name || 'User',
      reactions: []
    };
    messages.push(newMessage);
    localStorage.setItem('chatMessages', JSON.stringify(messages));
    return newMessage;
  }
};

export const deleteChatMessage = async (messageId, userId) => {
  // Use localStorage for demo/offline mode
  if (USE_LOCALSTORAGE) {
    const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    const filtered = messages.filter(m => m.id !== messageId);
    localStorage.setItem('chatMessages', JSON.stringify(filtered));
    return true;
  }

  try {
    const response = await fetch(`${API_BASE}/api/chat?id=${messageId}&user_id=${userId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete message');
    return true;
  } catch (error) {
    console.error('Error deleting message:', error);
    // Fallback to localStorage
    const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    const filtered = messages.filter(m => m.id !== messageId);
    localStorage.setItem('chatMessages', JSON.stringify(filtered));
    return true;
  }
};

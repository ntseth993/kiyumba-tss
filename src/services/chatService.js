const API_BASE = import.meta.env.VITE_API_URL || '';
const USE_LOCALSTORAGE = true; // Use localStorage for now
const CHAT_STORAGE_KEY = 'schoolCommunityMessages'; // Shared key for all users

export const getChatMessages = async (limit = 100, userId = null) => {
  // Use localStorage for demo/offline mode - shared across all users
  if (USE_LOCALSTORAGE) {
    const messages = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || '[]');
    // Sort by timestamp to show oldest first
    const sortedMessages = messages.sort((a, b) => 
      new Date(a.created_at) - new Date(b.created_at)
    );
    return sortedMessages.slice(-limit);
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
    const messages = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || '[]');
    const sortedMessages = messages.sort((a, b) => 
      new Date(a.created_at) - new Date(b.created_at)
    );
    return sortedMessages.slice(-limit);
  }
};

export const sendChatMessage = async (messageData) => {
  // Use localStorage for demo/offline mode - shared across all users
  if (USE_LOCALSTORAGE) {
    const messages = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || '[]');
    const newMessage = {
      id: Date.now(),
      ...messageData,
      created_at: new Date().toISOString(),
      sender_name: messageData.sender_name || 'User',
      reactions: [],
      is_read: false
    };
    messages.push(newMessage);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    console.log('Message sent to shared chat:', newMessage);
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
    const messages = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || '[]');
    const newMessage = {
      id: Date.now(),
      ...messageData,
      created_at: new Date().toISOString(),
      sender_name: messageData.sender_name || 'User',
      reactions: [],
      is_read: false
    };
    messages.push(newMessage);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    return newMessage;
  }
};

export const deleteChatMessage = async (messageId, userId) => {
  // Use localStorage for demo/offline mode
  if (USE_LOCALSTORAGE) {
    const messages = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || '[]');
    const filtered = messages.filter(m => m.id !== messageId);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(filtered));
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
    const messages = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || '[]');
    const filtered = messages.filter(m => m.id !== messageId);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }
};

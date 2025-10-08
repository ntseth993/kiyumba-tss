// Navbar Functions
export const navbarFunctions = {
  // Theme switching functionality
  handleThemeToggle: (currentTheme, setTheme) => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    // Update document theme attribute
    document.documentElement.setAttribute('data-theme', newTheme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', newTheme === 'dark' ? '#0f172a' : '#ffffff');
    }

    return newTheme;
  },

  // User menu handling
  handleUserMenuToggle: (isOpen, setIsOpen) => {
    setIsOpen(!isOpen);
  },

  // Mobile menu toggle
  handleMobileMenuToggle: (isOpen, setIsOpen) => {
    setIsOpen(!isOpen);
  },

  // Search functionality
  handleSearch: (query, setSearchQuery) => {
    setSearchQuery(query);
  },

  // Get role badge color
  getRoleBadgeColor: (role) => {
    switch (role) {
      case 'admin': return 'linear-gradient(135deg, #ff6b6b, #ee5a24)';
      case 'teacher': return 'linear-gradient(135deg, #4ecdc4, #44a08d)';
      case 'staff': return 'linear-gradient(135deg, #ffd93d, #ff6b6b)';
      case 'student': return 'linear-gradient(135deg, #667eea, #764ba2)';
      default: return 'linear-gradient(135deg, #a8edea, #fed6e3)';
    }
  }
};

// Chat Functions
export const chatFunctions = {
  // Message sending function
  handleSendMessage: async (messageData, onSuccess, onError) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const result = await response.json();

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error) {
      console.error('Error sending message:', error);

      if (onError) {
        onError(error);
      }

      throw error;
    }
  },

  // Emoji reactions handler
  handleEmojiReaction: async (messageId, emoji, userId, onSuccess, onError) => {
    try {
      const response = await fetch(`/api/chat/${messageId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emoji,
          userId,
          messageId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add reaction');
      }

      const result = await response.json();

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error) {
      console.error('Error adding reaction:', error);

      if (onError) {
        onError(error);
      }

      throw error;
    }
  },

  // File upload handling
  handleFileUpload: async (file, userId, onProgress, onSuccess, onError) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percentComplete = (event.loaded / event.total) * 100;
          onProgress(percentComplete);
        }
      };

      // Handle successful upload
      xhr.onload = () => {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);

          if (onSuccess) {
            onSuccess(result);
          }
        } else {
          throw new Error('Upload failed');
        }
      };

      // Handle errors
      xhr.onerror = () => {
        const error = new Error('Upload failed');

        if (onError) {
          onError(error);
        }

        throw error;
      };

      xhr.open('POST', '/api/chat/upload');
      xhr.send(formData);

      return xhr;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  // Real-time updates function
  setupRealTimeUpdates: (userId, onMessageReceived, onError) => {
    let eventSource;

    try {
      // Use Server-Sent Events for real-time updates
      eventSource = new EventSource(`/api/chat/stream?userId=${userId}`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (onMessageReceived) {
            onMessageReceived(data);
          }
        } catch (parseError) {
          console.error('Error parsing real-time message:', parseError);
        }
      };

      eventSource.onerror = (error) => {
        console.error('Real-time connection error:', error);

        if (onError) {
          onError(error);
        }
      };

      // Return cleanup function
      return () => {
        if (eventSource) {
          eventSource.close();
        }
      };
    } catch (error) {
      console.error('Error setting up real-time updates:', error);

      // Fallback to polling if SSE is not available
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/chat?limit=50&userId=${userId}`);
          const messages = await response.json();

          if (onMessageReceived) {
            onMessageReceived({ type: 'messages', data: messages });
          }
        } catch (pollError) {
          console.error('Error polling for messages:', pollError);

          if (onError) {
            onError(pollError);
          }
        }
      }, 3000);

      return () => clearInterval(pollInterval);
    }
  },

  // Message formatting utilities
  formatMessageTime: (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
    return date.toLocaleDateString();
  },

  // Input validation
  validateMessage: (message) => {
    const errors = [];

    if (!message.trim()) {
      errors.push('Message cannot be empty');
    }

    if (message.length > 1000) {
      errors.push('Message is too long (max 1000 characters)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Emoji picker utilities
  emojiCategories: {
    smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇'],
    gestures: ['👍', '👎', '👌', '✌️', '🤞', '👏', '🙌', '🤝', '🙏'],
    hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎'],
    activities: ['🎉', '🎊', '🎈', '🎁', '🎂', '🎄', '🎅', '🎆', '🎇']
  },

  // Message status utilities
  getMessageStatus: (message) => {
    if (message.is_read) return { status: 'read', icon: '✓✓', color: '#4ecdc4' };
    if (message.sent_at) return { status: 'sent', icon: '✓', color: '#999' };
    return { status: 'sending', icon: '...', color: '#667eea' };
  }
};

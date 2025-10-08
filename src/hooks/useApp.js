import { useState, useEffect, useRef, useCallback } from 'react';
import { navbarFunctions, chatFunctions } from '../utils/appFunctions';

// Custom hook for navbar functionality
export const useNavbar = (user) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Refs for click outside detection
  const userMenuRef = useRef(null);
  const themeMenuRef = useRef(null);

  // Handle mobile menu toggle
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  // Handle user menu toggle
  const toggleUserMenu = useCallback(() => {
    setShowUserMenu(prev => !prev);
  }, []);

  // Handle theme menu toggle
  const toggleThemeMenu = useCallback(() => {
    setShowThemeMenu(prev => !prev);
  }, []);

  // Handle search
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  // Handle logout - properly close menus and handle logout
  const handleLogout = useCallback((logoutFn, navigate) => {
    // Close all menus first
    setMobileMenuOpen(false);
    setShowUserMenu(false);
    setShowThemeMenu(false);

    // Call the actual logout function from auth context
    if (logoutFn) {
      logoutFn();
    }

    // Navigate to home page
    if (navigate) {
      navigate('/');
    }
  }, []);

  // Get role badge color
  const getRoleBadgeColor = useCallback((role) => {
    return navbarFunctions.getRoleBadgeColor(role);
  }, []);

  // Click outside handler - simplified version
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close user menu if clicking outside
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }

      // Close theme menu if clicking outside
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target)) {
        setShowThemeMenu(false);
      }
    };

    if (showUserMenu || showThemeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu, showThemeMenu]);

  return {
    // State
    mobileMenuOpen,
    showUserMenu,
    showThemeMenu,
    searchQuery,

    // Refs
    userMenuRef,
    themeMenuRef,

    // Handlers
    toggleMobileMenu,
    toggleUserMenu,
    toggleThemeMenu,
    handleSearch,
    handleLogout,
    getRoleBadgeColor
  };
};

// Custom hook for chat functionality
export const useChat = (userId) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Send message
  const sendMessage = useCallback(async (messageData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await chatFunctions.handleSendMessage(
        { ...messageData, sender_id: userId },
        (result) => {
          setMessages(prev => [...prev, result]);
        },
        (error) => {
          setError(error.message);
        }
      );

      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Add emoji reaction
  const addReaction = useCallback(async (messageId, emoji) => {
    try {
      await chatFunctions.handleEmojiReaction(
        messageId,
        emoji,
        userId,
        (result) => {
          // Update message in state with new reaction
          setMessages(prev => prev.map(msg =>
            msg.id === messageId
              ? { ...msg, reactions: [...(msg.reactions || []), { emoji, userId }] }
              : msg
          ));
        }
      );
    } catch (error) {
      setError(error.message);
    }
  }, [userId]);

  // Upload file
  const uploadFile = useCallback(async (file) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await chatFunctions.handleFileUpload(
        file,
        userId,
        (progress) => setUploadProgress(progress),
        (result) => {
          // Add file message to chat
          setMessages(prev => [...prev, {
            id: Date.now(),
            sender_id: userId,
            message: `📎 ${file.name}`,
            message_type: 'file',
            file_url: result.url,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            created_at: new Date().toISOString()
          }]);
          setUploadProgress(0);
        },
        (error) => {
          setError(error.message);
          setUploadProgress(0);
        }
      );

      return result;
    } catch (error) {
      setError(error.message);
      setUploadProgress(0);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Setup real-time updates
  useEffect(() => {
    if (!userId) return;

    const cleanup = chatFunctions.setupRealTimeUpdates(
      userId,
      (data) => {
        if (data.type === 'messages') {
          setMessages(data.data);
        } else if (data.type === 'new_message') {
          setMessages(prev => [...prev, data.message]);
        }
      },
      (error) => {
        console.error('Real-time error:', error);
        setError('Connection lost, using polling mode');
      }
    );

    return cleanup;
  }, [userId]);

  // Load initial messages
  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/chat?limit=100&userId=${userId}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Format message time
  const formatTime = useCallback((timestamp) => {
    return chatFunctions.formatMessageTime(timestamp);
  }, []);

  // Validate message
  const validateMessage = useCallback((message) => {
    return chatFunctions.validateMessage(message);
  }, []);

  // Get emoji categories
  const getEmojiCategories = useCallback(() => {
    return chatFunctions.emojiCategories;
  }, []);

  return {
    // State
    messages,
    isLoading,
    error,
    uploadProgress,

    // Actions
    sendMessage,
    addReaction,
    uploadFile,
    loadMessages,

    // Utilities
    formatTime,
    validateMessage,
    getEmojiCategories,

    // Clear error
    clearError: () => setError(null)
  };
};

// Custom hook for theme management
export const useThemeManager = () => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const setThemeMode = useCallback((newTheme) => {
    if (['light', 'dark', 'auto'].includes(newTheme)) {
      setTheme(newTheme);
    }
  }, []);

  return {
    theme,
    toggleTheme,
    setThemeMode,
    isLight: theme === 'light',
    isDark: theme === 'dark',
    isAuto: theme === 'auto'
  };
};

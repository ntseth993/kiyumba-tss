import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../hooks/useApp';
import {
  MessageCircle,
  Send,
  X,
  Paperclip,
  Trash2,
  Minimize2,
  Maximize2,
  Heart,
  Smile,
  MoreHorizontal,
  Check,
  CheckCheck
} from 'lucide-react';
import { getChatMessages, sendChatMessage, deleteChatMessage } from '../services/chatService';
import './Chat.css';

const Chat = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showMessageActions, setShowMessageActions] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Use the chat hook for additional functionality
  const {
    isLoading: hookLoading,
    error: hookError,
    uploadProgress,
    sendMessage: hookSendMessage,
    addReaction: hookAddReaction,
    uploadFile: hookUploadFile,
    formatTime: hookFormatTime,
    validateMessage: hookValidateMessage,
    getEmojiCategories,
    clearError: clearHookError
  } = useChat(user?.id);

  // Emoji reactions for messages
  const reactions = ['❤️', '👍', '👎', '😂', '😮', '😢', '🔥', '🎉'];

  useEffect(() => {
    if (user) {
      loadMessages();
      checkUnreadMessages();
      const interval = setInterval(() => {
        if (isOpen) {
          loadMessages();
        } else {
          checkUnreadMessages();
        }
      }, 3000); // Faster updates for better UX
      return () => clearInterval(interval);
    }
  }, [user, isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      // Don't pass user.id - we want ALL messages for everyone
      const data = await getChatMessages(100, null);
      console.log('Loaded messages:', data);
      setMessages(data);
      if (isOpen) {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const checkUnreadMessages = async () => {
    try {
      const data = await getChatMessages(100, null);
      const unread = data.filter(msg => msg.sender_id !== user.id && !msg.is_read);
      setUnreadCount(unread.length);
    } catch (error) {
      console.error('Error checking unread messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      await sendChatMessage({
        sender_id: user?.id || 1,
        sender_name: user?.name || 'Guest',
        sender_role: user?.role || 'student',
        sender_avatar: user?.avatar || null,
        message: newMessage.trim(),
        message_type: 'text'
      });
      setNewMessage('');
      setShowEmojiPicker(false);
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      // Error is already handled by localStorage fallback
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;

    try {
      await deleteChatMessage(messageId, user.id);
      await loadMessages();
      setShowMessageActions(null);
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  const handleReaction = async (messageId, emoji) => {
    // For now, just show the reaction visually
    // In a full implementation, this would be saved to the database
    console.log('Reacted with:', emoji, 'to message:', messageId);
    setShowMessageActions(null);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
    return date.toLocaleDateString();
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'linear-gradient(135deg, #ff6b6b, #ee5a24)';
      case 'teacher': return 'linear-gradient(135deg, #4ecdc4, #44a08d)';
      case 'staff': return 'linear-gradient(135deg, #ffd93d, #ff6b6b)';
      case 'student': return 'linear-gradient(135deg, #667eea, #764ba2)';
      default: return 'linear-gradient(135deg, #a8edea, #fed6e3)';
    }
  };

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  if (!user) return null;

  return (
    <>
      {/* Modern Chat Toggle Button */}
      {!isOpen && (
        <button className="chat-toggle-btn-modern" onClick={() => setIsOpen(true)}>
          <div className="chat-toggle-icon">
            <MessageCircle size={24} />
          </div>
          {unreadCount > 0 && (
            <span className="chat-badge-modern">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
          <div className="chat-pulse"></div>
        </button>
      )}

      {/* Modern Chat Window */}
      {isOpen && (
        <div className={`chat-window-modern ${isMinimized ? 'minimized' : ''}`}>
          {/* Modern Chat Header */}
          <div className="chat-header-modern">
            <div className="chat-header-content">
              <div className="chat-avatar">
                <MessageCircle size={20} />
              </div>
              <div className="chat-info">
                <h3>School Community</h3>
                <div className="chat-status-modern">
                  <div className="status-dot"></div>
                  <span>{messages.length} messages • Online</span>
                </div>
              </div>
            </div>
            <div className="chat-header-actions-modern">
              <button
                className="chat-action-btn"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Maximize' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button
                className="chat-action-btn"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Typing Indicator */}
          {typingUsers.length > 0 && !isMinimized && (
            <div className="typing-indicator">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span>Someone is typing...</span>
            </div>
          )}

          {/* Modern Chat Messages */}
          {!isMinimized && (
            <>
              <div className="chat-messages-modern" ref={chatContainerRef}>
                {messages.length === 0 ? (
                  <div className="chat-empty-modern">
                    <div className="empty-icon">
                      <MessageCircle size={64} />
                    </div>
                    <h3>Start a conversation</h3>
                    <p>Share updates, ask questions, and connect with your school community</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => {
                      const prevMsg = messages[index - 1];
                      const isConsecutive = prevMsg && prevMsg.sender_id === msg.sender_id;
                      const timeDiff = prevMsg ? new Date(msg.created_at) - new Date(prevMsg.created_at) : 0;
                      const showAvatar = !isConsecutive || timeDiff > 300000; // 5 minutes

                      return (
                        <div
                          key={msg.id}
                          className={`message-wrapper ${msg.sender_id === user.id ? 'own' : 'other'}`}
                        >
                          {showAvatar && msg.sender_id !== user.id && (
                            <div className="message-avatar-modern">
                              <img
                                src={msg.sender_avatar || `https://ui-avatars.com/api/?name=${msg.sender_name}&background=${msg.sender_role}&color=fff&size=128`}
                                alt={msg.sender_name}
                              />
                            </div>
                          )}

                          <div className={`message-bubble ${msg.sender_id === user.id ? 'own-bubble' : 'other-bubble'}`}>
                            {showAvatar && msg.sender_id !== user.id && (
                              <div className="message-sender-info">
                                <span className="sender-name">{msg.sender_name}</span>
                                <div
                                  className="role-badge-modern"
                                  style={{ background: getRoleBadgeColor(msg.sender_role) }}
                                >
                                  {msg.sender_role}
                                </div>
                              </div>
                            )}

                            <div className="message-content-modern">
                              <p>{msg.message}</p>

                              {/* Message reactions */}
                              {msg.reactions && msg.reactions.length > 0 && (
                                <div className="message-reactions">
                                  {msg.reactions.map((reaction, idx) => (
                                    <span key={idx} className="reaction">{reaction}</span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="message-footer">
                              <span className="message-time">{formatTime(msg.created_at)}</span>

                              {/* Message status */}
                              {msg.sender_id === user.id && (
                                <div className="message-status">
                                  {msg.is_read ? (
                                    <CheckCheck size={14} color="#4ecdc4" />
                                  ) : (
                                    <Check size={14} color="#999" />
                                  )}
                                </div>
                              )}

                              {/* Message actions */}
                              <div className="message-actions">
                                <button
                                  className="action-btn"
                                  onClick={() => setShowMessageActions(showMessageActions === msg.id ? null : msg.id)}
                                >
                                  <MoreHorizontal size={14} />
                                </button>

                                {showMessageActions === msg.id && (
                                  <div className="message-actions-menu">
                                    <div className="reactions-picker">
                                      {reactions.map(emoji => (
                                        <button
                                          key={emoji}
                                          className="reaction-btn"
                                          onClick={() => handleReaction(msg.id, emoji)}
                                        >
                                          {emoji}
                                        </button>
                                      ))}
                                    </div>
                                    {msg.sender_id === user.id && (
                                      <button
                                        className="delete-btn"
                                        onClick={() => handleDeleteMessage(msg.id)}
                                      >
                                        <Trash2 size={14} />
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Modern Chat Input */}
              <form className="chat-input-modern" onSubmit={handleSendMessage}>
                <div className="input-container">
                  <button
                    type="button"
                    className="emoji-btn"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Smile size={20} />
                  </button>

                  <input
                    type="text"
                    placeholder="Message your school community..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={loading}
                    className="message-input"
                  />

                  <button
                    type="button"
                    className="attachment-btn"
                    onClick={handleFileUpload}
                    title="Attach file"
                  >
                    <Paperclip size={20} />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    style={{ display: 'none' }}
                    accept="image/*,.pdf,.doc,.docx"
                  />
                </div>

                <button
                  type="submit"
                  className={`send-btn-modern ${newMessage.trim() ? 'active' : ''}`}
                  disabled={loading || !newMessage.trim()}
                >
                  <Send size={20} />
                </button>

                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div className="emoji-picker">
                    <div className="emoji-grid">
                      {['😀', '😂', '😊', '😍', '🥰', '😘', '😗', '😙', '😚', '🙂', '🤗', '🤔', '😎', '😮', '😢', '😭', '😤', '😡', '🥺', '😴', '🤯', '🥴', '😵', '🤐', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤯', '🤠', '🥳'].map(emoji => (
                        <button
                          key={emoji}
                          className="emoji-item"
                          onClick={() => addEmoji(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Chat;

// Example usage of Chat functions in a component
import { useChat } from '../hooks/useApp';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Chat = () => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const {
    messages,
    isLoading,
    error,
    uploadProgress,
    sendMessage,
    addReaction,
    uploadFile,
    formatTime,
    validateMessage,
    getEmojiCategories,
    clearError
  } = useChat(user?.id);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    // Validate message
    const validation = validateMessage(newMessage);
    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }

    try {
      await sendMessage({
        message: newMessage.trim(),
        message_type: 'text'
      });

      setNewMessage('');
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        await uploadFile(file);
      } catch (error) {
        console.error('Failed to upload file:', error);
      }
    }
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      await addReaction(messageId, emoji);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const emojiCategories = getEmojiCategories();

  return (
    <div className="chat-window-modern">
      {/* Messages */}
      <div className="chat-messages-modern">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-wrapper ${msg.sender_id === user.id ? 'own' : 'other'}`}>
            <div className={`message-bubble ${msg.sender_id === user.id ? 'own-bubble' : 'other-bubble'}`}>
              <div className="message-content-modern">
                <p>{msg.message}</p>

                {/* Message reactions */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="message-reactions">
                    {msg.reactions.map((reaction, idx) => (
                      <span key={idx} className="reaction">{reaction.emoji}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="message-footer">
                <span className="message-time">{formatTime(msg.created_at)}</span>
                <button onClick={() => handleReaction(msg.id, '❤️')}>
                  ❤️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <form className="chat-input-modern" onSubmit={handleSendMessage}>
        <div className="input-container">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile size={20} />
          </button>

          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isLoading}
          />

          <input
            type="file"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx"
            style={{ display: 'none' }}
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Paperclip size={20} />
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading || !newMessage.trim()}
        >
          <Send size={20} />
        </button>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="emoji-picker">
            {Object.entries(emojiCategories).map(([category, emojis]) => (
              <div key={category}>
                <div className="emoji-category">
                  {emojis.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiSelect(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </form>

      {/* Loading and Error States */}
      {isLoading && <div className="loading">Sending...</div>}
      {uploadProgress > 0 && <div className="upload-progress">{uploadProgress}%</div>}
      {error && <div className="error">{error} <button onClick={clearError}>×</button></div>}
    </div>
  );
};

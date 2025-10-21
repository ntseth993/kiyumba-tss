import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, User, Trash2, Copy, Check, ChevronDown } from 'lucide-react';
import { getAIResponse } from '../services/aiService';
import './StudentAIChat.css';

const StudentAIChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAI, setSelectedAI] = useState('gemini');
  const [showAISelector, setShowAISelector] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const aiProviders = [
    { 
      id: 'gemini', 
      name: 'Google Gemini', 
      icon: '🤖',
      color: '#4285F4',
      description: 'Fast and intelligent responses'
    },
    { 
      id: 'chatgpt', 
      name: 'ChatGPT', 
      icon: '✨',
      color: '#10A37F',
      description: 'Conversational AI expert'
    },
    { 
      id: 'claude', 
      name: 'Claude', 
      icon: '🧠',
      color: '#D97757',
      description: 'Helpful and harmless AI'
    }
  ];

  const currentAI = aiProviders.find(ai => ai.id === selectedAI);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get conversation history for context
      const history = messages
        .filter(m => m.sender !== 'ai' || !m.isError)
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }));

      // Call actual AI service
      const response = await getAIResponse(input, selectedAI, history);
      
      const aiMessage = {
        id: Date.now() + 1,
        text: response,
        sender: 'ai',
        aiProvider: selectedAI,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again or try a different AI provider.',
        sender: 'ai',
        aiProvider: selectedAI,
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear all messages?')) {
      setMessages([]);
    }
  };

  const handleCopyMessage = (messageId, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "Help me understand this topic",
    "Explain this concept simply",
    "What are the key points?",
    "Can you give me examples?"
  ];

  return (
    <div className="ai-chat-container">
      <div className="ai-chat-header">
        <div className="header-left">
          <div className="ai-avatar" style={{ background: currentAI.color }}>
            <span>{currentAI.icon}</span>
          </div>
          <div className="header-info">
            <h2>AI Study Assistant</h2>
            <p>Powered by {currentAI.name}</p>
          </div>
        </div>
        <div className="header-actions">
          <div className="ai-selector-wrapper">
            <button 
              className="ai-selector-btn"
              onClick={() => setShowAISelector(!showAISelector)}
            >
              <span className="current-ai-icon">{currentAI.icon}</span>
              <span>{currentAI.name}</span>
              <ChevronDown size={16} />
            </button>
            
            {showAISelector && (
              <div className="ai-dropdown">
                {aiProviders.map(ai => (
                  <button
                    key={ai.id}
                    className={`ai-option ${selectedAI === ai.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedAI(ai.id);
                      setShowAISelector(false);
                    }}
                  >
                    <span className="ai-icon">{ai.icon}</span>
                    <div className="ai-info">
                      <span className="ai-name">{ai.name}</span>
                      <span className="ai-desc">{ai.description}</span>
                    </div>
                    {selectedAI === ai.id && <Check size={16} />}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button className="icon-btn" onClick={handleClearChat} title="Clear chat">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="ai-chat-messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Sparkles size={48} />
            </div>
            <h3>Start a conversation with AI</h3>
            <p>Ask questions, get homework help, or explore any topic!</p>
            
            <div className="suggested-questions">
              <p className="suggested-title">Try asking:</p>
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  className="suggested-btn"
                  onClick={() => setInput(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-avatar">
                  {message.sender === 'user' ? (
                    <User size={20} />
                  ) : (
                    <span className="ai-icon">
                      {aiProviders.find(ai => ai.id === message.aiProvider)?.icon}
                    </span>
                  )}
                </div>
                <div className="message-content">
                  <div className="message-header">
                    <span className="message-sender">
                      {message.sender === 'user' ? 'You' : currentAI.name}
                    </span>
                    <span className="message-time">{message.timestamp}</span>
                  </div>
                  <div className={`message-text ${message.isError ? 'error' : ''}`}>
                    {message.text}
                  </div>
                  {message.sender === 'ai' && (
                    <button
                      className="copy-btn"
                      onClick={() => handleCopyMessage(message.id, message.text)}
                      title="Copy message"
                    >
                      {copiedId === message.id ? (
                        <>
                          <Check size={14} />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message ai">
                <div className="message-avatar">
                  <Bot size={20} />
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="ai-chat-input">
        <div className="input-wrapper">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask ${currentAI.name} anything...`}
            rows="1"
            disabled={isLoading}
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            style={{ background: currentAI.color }}
          >
            <Send size={20} />
          </button>
        </div>
        <div className="input-hint">
          Press Enter to send, Shift + Enter for new line
        </div>
      </div>
    </div>
  );
};

export default StudentAIChat;

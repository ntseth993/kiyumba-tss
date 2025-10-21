import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, Sparkles, User, Trash2, Copy, Check, ChevronDown, Paperclip, X } from 'lucide-react';
import { getAIResponse } from '../services/aiService';
import './StudentAIChat.css';

const StudentAIChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAI, setSelectedAI] = useState('gemini');
  const [showAISelector, setShowAISelector] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
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

  const playSound = (frequency, duration = 200, type = 'sine') => {
    if (!window.AudioContext && !window.webkitAudioContext) return;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  };

  const playSendSound = () => playSound(800, 100);
  const playReceiveSound = () => playSound(600, 150);
  const playTypingSound = () => playSound(400, 50);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() && uploadedFiles.length === 0) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
      files: uploadedFiles.length > 0 ? uploadedFiles : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    const currentFiles = [...uploadedFiles];
    setInput('');
    setUploadedFiles([]);
    setIsLoading(true);

    playSendSound();

    try {
      // Get conversation history for context
      const history = messages
        .filter(m => m.sender !== 'ai' || !m.isError)
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
          files: m.files || undefined
        }));

      // Call actual AI service with files
      const response = await getAIResponse(currentInput, selectedAI, history, currentFiles);
      
      const aiMessage = {
        id: Date.now() + 1,
        text: response,
        sender: 'ai',
        aiProvider: selectedAI,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, aiMessage]);

      playReceiveSound();
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

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') ||
                         file.type === 'application/pdf' ||
                         file.type.startsWith('text/') ||
                         file.name.endsWith('.txt') ||
                         file.name.endsWith('.md');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert('Some files were skipped. Only images, PDFs, and text files under 10MB are allowed.');
    }

    const fileData = await Promise.all(validFiles.map(async (file) => {
      const base64 = await fileToBase64(file);
      return {
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.type,
        size: file.size,
        data: base64,
        url: file.type.startsWith('image/') ? base64 : null
      };
    }));

    setUploadedFiles(prev => [...prev, ...fileData]);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
                    {message.sender === 'ai' ? (
                      <ReactMarkdown>
                        {message.text}
                      </ReactMarkdown>
                    ) : (
                      message.text
                    )}
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
                  <div className="typing-indicator" onAnimationIteration={playTypingSound}>
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
        {/* File Upload Area */}
        {uploadedFiles.length > 0 && (
          <div className="uploaded-files">
            {uploadedFiles.map(file => (
              <div key={file.id} className="uploaded-file">
                {file.url ? (
                  <img src={file.url} alt={file.name} className="file-preview" />
                ) : (
                  <div className="file-icon">
                    📄
                  </div>
                )}
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{formatFileSize(file.size)}</span>
                </div>
                <button
                  className="remove-file-btn"
                  onClick={() => removeFile(file.id)}
                  title="Remove file"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="input-wrapper">
          {/* Drag & Drop Area */}
          <div
            className={`file-drop-area ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip size={20} />
            <span>Drop files here or click to upload</span>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.txt,.md,text/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>

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
            disabled={(!input.trim() && uploadedFiles.length === 0) || isLoading}
            style={{ background: currentAI.color }}
          >
            <Send size={20} />
          </button>
        </div>
        <div className="input-hint">
          Press Enter to send, Shift + Enter for new line • Drag & drop files to upload
        </div>
      </div>
    </div>
  );
};

export default StudentAIChat;

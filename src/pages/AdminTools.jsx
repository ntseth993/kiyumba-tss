import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Zap, Plus, Edit, Trash2, BookOpen, X, Save } from 'lucide-react';
import './AdminTools.css';

const AdminTools = () => {
  const [tools, setTools] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'quiz',
    description: '',
    enabled: true,
    difficulty: 'medium',
    settings: {}
  });

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    try {
      const storedTools = JSON.parse(localStorage.getItem('learningTools') || '[]');
      setTools(storedTools);
    } catch (error) {
      console.error('Error loading tools:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.type) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const toolData = {
        ...formData,
        id: editingTool ? editingTool.id : Date.now().toString(),
        createdAt: new Date().toISOString()
      };

      if (editingTool) {
        const updatedTools = tools.map(tool =>
          tool.id === editingTool.id ? toolData : tool
        );
        setTools(updatedTools);
        localStorage.setItem('learningTools', JSON.stringify(updatedTools));
      } else {
        const newTools = [...tools, toolData];
        setTools(newTools);
        localStorage.setItem('learningTools', JSON.stringify(newTools));
      }

      handleCloseModal();
      alert(editingTool ? 'Tool updated!' : 'Tool created!');
    } catch (error) {
      console.error('Error saving tool:', error);
      alert('Failed to save tool');
    }
  };

  const handleEdit = (tool) => {
    setEditingTool(tool);
    setFormData({
      title: tool.title,
      type: tool.type || 'quiz',
      description: tool.description || '',
      enabled: tool.enabled !== false,
      difficulty: tool.difficulty || 'medium',
      settings: tool.settings || {}
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this tool?')) {
      try {
        const updatedTools = tools.filter(tool => tool.id !== id);
        setTools(updatedTools);
        localStorage.setItem('learningTools', JSON.stringify(updatedTools));
        alert('Tool deleted!');
      } catch (error) {
        console.error('Error deleting tool:', error);
        alert('Failed to delete tool');
      }
    }
  };

  const handleToggleTool = async (id, enabled) => {
    try {
      const updatedTools = tools.map(tool =>
        tool.id === id ? { ...tool, enabled } : tool
      );
      setTools(updatedTools);
      localStorage.setItem('learningTools', JSON.stringify(updatedTools));
    } catch (error) {
      console.error('Error toggling tool:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTool(null);
    setFormData({
      title: '',
      type: 'quiz',
      description: '',
      enabled: true,
      difficulty: 'medium',
      settings: {}
    });
  };

  const getToolTypeColor = (type) => {
    switch (type) {
      case 'quiz': return '#10b981';
      case 'poll': return '#3b82f6';
      case 'challenge': return '#f59e0b';
      case 'lesson': return '#8b5cf6';
      case 'game': return '#ef4444';
      default: return '#667eea';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#667eea';
    }
  };

  return (
    <div className="admin-tools-page">
      <Navbar />
      <div className="admin-tools-container">
        <div className="page-header">
          <div>
            <h1><Zap size={32} /> Interactive Tools</h1>
            <p>Create and manage quizzes, polls, challenges, and learning resources</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            New Tool
          </button>
        </div>

        <div className="tools-list">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className={`tool-item ${tool.enabled ? 'enabled' : 'disabled'}`}
              style={{ borderLeftColor: getToolTypeColor(tool.type) }}
            >
              <div className="tool-item-header">
                <div className="tool-badges">
                  <span
                    className="tool-type-badge"
                    style={{ backgroundColor: getToolTypeColor(tool.type) }}
                  >
                    {tool.type}
                  </span>
                  <span
                    className="difficulty-badge"
                    style={{ backgroundColor: getDifficultyColor(tool.difficulty) }}
                  >
                    {tool.difficulty}
                  </span>
                  <span className={`status-badge ${tool.enabled ? 'active' : 'inactive'}`}>
                    {tool.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="tool-actions">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={tool.enabled}
                      onChange={(e) => handleToggleTool(tool.id, e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                  <button className="btn-icon" onClick={() => handleEdit(tool)}>
                    <Edit size={16} />
                  </button>
                  <button className="btn-icon danger" onClick={() => handleDelete(tool.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3>{tool.title}</h3>
              <p>{tool.description}</p>

              <div className="tool-item-footer">
                <span className="tool-created">
                  Created: {new Date(tool.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}

          {tools.length === 0 && (
            <div className="empty-state">
              <Zap size={48} />
              <h3>No tools configured</h3>
              <p>Create interactive learning tools to engage students and track progress</p>
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingTool ? 'Edit Tool' : 'New Tool'}</h2>
                <button className="close-btn" onClick={handleCloseModal}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Tool title"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                      >
                        <option value="quiz">Quiz</option>
                        <option value="poll">Poll</option>
                        <option value="challenge">Challenge</option>
                        <option value="lesson">Interactive Lesson</option>
                        <option value="game">Educational Game</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Difficulty</label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.enabled}
                        onChange={(e) => setFormData({...formData, enabled: e.target.checked})}
                      />
                      <span className="checkmark"></span>
                      Enabled for all users
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Tool description and instructions"
                      rows="3"
                    />
                  </div>

                  <div className="info-box">
                    <BookOpen size={20} />
                    <div>
                      <strong>Tool Configuration:</strong> This interactive tool will be available to students based on their level and the tool's difficulty setting.
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Save size={16} />
                    {editingTool ? 'Update' : 'Create'} Tool
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AdminTools;

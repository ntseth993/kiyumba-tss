// Online Document Editor Service
// Real-time collaborative document creation and editing

import { apiService, ApiError } from './apiService';

class DocumentEditor {
  constructor() {
    this.activeDocuments = new Map();
    this.documentHistory = new Map();
    this.collaborators = new Map();
    this.templates = new Map();
    this.revisions = new Map();
    this.comments = new Map();
  }

  // Create new document
  async createDocument(documentData) {
    try {
      const result = await apiService.post('/api/documents', {
        ...documentData,
        content: documentData.content || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Track active document
      this.activeDocuments.set(result.id, result);

      return result;
    } catch (error) {
      console.error('Error creating document:', error);
      throw new ApiError('Failed to create document', 500, 'Unable to create document. Please try again.');
    }
  }

  // Load document
  async loadDocument(documentId) {
    try {
      const result = await apiService.get(`/api/documents/${documentId}`);

      // Track active document
      this.activeDocuments.set(documentId, result);

      return result;
    } catch (error) {
      console.error('Error loading document:', error);
      throw new ApiError('Failed to load document', 500, 'Unable to load document. Please try again.');
    }
  }

  // Save document
  async saveDocument(documentId, content, options = {}) {
    const {
      title = null,
      description = null,
      tags = [],
      isAutoSave = false
    } = options;

    try {
      const result = await apiService.put(`/api/documents/${documentId}`, {
        content,
        title,
        description,
        tags,
        updatedAt: new Date().toISOString(),
        isAutoSave
      });

      // Update local document
      const document = this.activeDocuments.get(documentId);
      if (document) {
        document.content = content;
        document.updatedAt = new Date().toISOString();
        this.activeDocuments.set(documentId, document);
      }

      return result;
    } catch (error) {
      console.error('Error saving document:', error);
      throw new ApiError('Failed to save document', 500, 'Unable to save document. Please try again.');
    }
  }

  // Real-time collaboration
  async joinCollaboration(documentId, userData) {
    try {
      const result = await apiService.post(`/api/documents/${documentId}/collaborate`, {
        ...userData,
        joinedAt: new Date().toISOString()
      });

      // Add to collaborators
      if (!this.collaborators.has(documentId)) {
        this.collaborators.set(documentId, []);
      }

      const documentCollaborators = this.collaborators.get(documentId);
      const existingIndex = documentCollaborators.findIndex(c => c.userId === userData.userId);

      if (existingIndex === -1) {
        documentCollaborators.push({ ...userData, status: 'active' });
      } else {
        documentCollaborators[existingIndex].status = 'active';
      }

      this.collaborators.set(documentId, documentCollaborators);

      return result;
    } catch (error) {
      console.error('Error joining collaboration:', error);
      throw new ApiError('Failed to join collaboration', 500, 'Unable to join document collaboration.');
    }
  }

  // Leave collaboration
  async leaveCollaboration(documentId, userId) {
    try {
      await apiService.delete(`/api/documents/${documentId}/collaborate/${userId}`);

      // Update local collaborators
      if (this.collaborators.has(documentId)) {
        const documentCollaborators = this.collaborators.get(documentId);
        const updated = documentCollaborators.map(c =>
          c.userId === userId ? { ...c, status: 'left', leftAt: new Date().toISOString() } : c
        );
        this.collaborators.set(documentId, updated);
      }

      return true;
    } catch (error) {
      console.error('Error leaving collaboration:', error);
      throw new ApiError('Failed to leave collaboration', 500, 'Unable to leave document collaboration.');
    }
  }

  // Send real-time update
  async sendUpdate(documentId, operation, data) {
    try {
      return await apiService.post(`/api/documents/${documentId}/update`, {
        operation,
        data,
        timestamp: Date.now(),
        userId: this.getCurrentUserId()
      });
    } catch (error) {
      console.error('Error sending update:', error);
      throw new ApiError('Failed to send update', 500, 'Unable to send document update.');
    }
  }

  // Get document collaborators
  async getCollaborators(documentId) {
    try {
      const result = await apiService.get(`/api/documents/${documentId}/collaborators`);
      this.collaborators.set(documentId, result);
      return result;
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      throw new ApiError('Failed to fetch collaborators', 500, 'Unable to load document collaborators.');
    }
  }

  // Document templates
  async createTemplate(templateData) {
    try {
      const result = await apiService.post('/api/documents/templates', {
        ...templateData,
        createdAt: new Date().toISOString()
      });

      this.templates.set(result.id, result);
      return result;
    } catch (error) {
      console.error('Error creating template:', error);
      throw new ApiError('Failed to create template', 500, 'Unable to create document template.');
    }
  }

  // Get templates
  async getTemplates(category = null) {
    try {
      const params = category ? new URLSearchParams({ category }) : '';
      const result = await apiService.get(`/api/documents/templates${params ? `?${params}` : ''}`);

      // Cache templates
      result.forEach(template => {
        this.templates.set(template.id, template);
      });

      return result;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw new ApiError('Failed to fetch templates', 500, 'Unable to load document templates.');
    }
  }

  // Apply template
  async applyTemplate(documentId, templateId) {
    try {
      const result = await apiService.post(`/api/documents/${documentId}/apply-template`, {
        templateId
      });

      // Update document
      const document = this.activeDocuments.get(documentId);
      if (document) {
        document.content = result.content;
        document.updatedAt = new Date().toISOString();
        this.activeDocuments.set(documentId, document);
      }

      return result;
    } catch (error) {
      console.error('Error applying template:', error);
      throw new ApiError('Failed to apply template', 500, 'Unable to apply document template.');
    }
  }

  // Document versions/revisions
  async createRevision(documentId, content, description = '') {
    try {
      const result = await apiService.post(`/api/documents/${documentId}/revisions`, {
        content,
        description,
        createdAt: new Date().toISOString()
      });

      // Add to revisions
      if (!this.revisions.has(documentId)) {
        this.revisions.set(documentId, []);
      }

      const documentRevisions = this.revisions.get(documentId);
      documentRevisions.unshift(result);
      this.revisions.set(documentId, documentRevisions);

      return result;
    } catch (error) {
      console.error('Error creating revision:', error);
      throw new ApiError('Failed to create revision', 500, 'Unable to create document revision.');
    }
  }

  // Get document revisions
  async getRevisions(documentId) {
    try {
      const result = await apiService.get(`/api/documents/${documentId}/revisions`);
      this.revisions.set(documentId, result);
      return result;
    } catch (error) {
      console.error('Error fetching revisions:', error);
      throw new ApiError('Failed to fetch revisions', 500, 'Unable to load document revisions.');
    }
  }

  // Restore revision
  async restoreRevision(documentId, revisionId) {
    try {
      const result = await apiService.post(`/api/documents/${documentId}/revisions/${revisionId}/restore`);

      // Update document
      const document = this.activeDocuments.get(documentId);
      if (document) {
        document.content = result.content;
        document.updatedAt = new Date().toISOString();
        this.activeDocuments.set(documentId, document);
      }

      return result;
    } catch (error) {
      console.error('Error restoring revision:', error);
      throw new ApiError('Failed to restore revision', 500, 'Unable to restore document revision.');
    }
  }

  // Document comments
  async addComment(documentId, commentData) {
    try {
      const result = await apiService.post(`/api/documents/${documentId}/comments`, {
        ...commentData,
        createdAt: new Date().toISOString()
      });

      // Add to comments
      if (!this.comments.has(documentId)) {
        this.comments.set(documentId, []);
      }

      const documentComments = this.comments.get(documentId);
      documentComments.push(result);
      this.comments.set(documentId, documentComments);

      return result;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new ApiError('Failed to add comment', 500, 'Unable to add comment to document.');
    }
  }

  // Get document comments
  async getComments(documentId) {
    try {
      const result = await apiService.get(`/api/documents/${documentId}/comments`);
      this.comments.set(documentId, result);
      return result;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw new ApiError('Failed to fetch comments', 500, 'Unable to load document comments.');
    }
  }

  // Resolve comment
  async resolveComment(documentId, commentId) {
    try {
      await apiService.patch(`/api/documents/${documentId}/comments/${commentId}/resolve`);

      // Update local comment
      if (this.comments.has(documentId)) {
        const documentComments = this.comments.get(documentId);
        const commentIndex = documentComments.findIndex(c => c.id === commentId);
        if (commentIndex !== -1) {
          documentComments[commentIndex].resolved = true;
          documentComments[commentIndex].resolvedAt = new Date().toISOString();
          this.comments.set(documentId, documentComments);
        }
      }

      return true;
    } catch (error) {
      console.error('Error resolving comment:', error);
      throw new ApiError('Failed to resolve comment', 500, 'Unable to resolve comment.');
    }
  }

  // Document sharing
  async shareDocument(documentId, users, permissions = 'view') {
    try {
      const result = await apiService.post(`/api/documents/${documentId}/share`, {
        users,
        permissions,
        sharedAt: new Date().toISOString()
      });

      // Update document
      const document = this.activeDocuments.get(documentId);
      if (document) {
        document.sharedWith = users;
        document.permissions = permissions;
        this.activeDocuments.set(documentId, document);
      }

      return result;
    } catch (error) {
      console.error('Error sharing document:', error);
      throw new ApiError('Failed to share document', 500, 'Unable to share document.');
    }
  }

  // Export document
  async exportDocument(documentId, format = 'pdf', options = {}) {
    try {
      const params = new URLSearchParams({ format, ...options });
      const result = await apiService.get(`/api/documents/${documentId}/export?${params}`);

      // Create download link
      const blob = new Blob([result], {
        type: format === 'pdf' ? 'application/pdf' :
              format === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
              'text/plain'
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${this.activeDocuments.get(documentId)?.title || 'document'}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error exporting document:', error);
      throw new ApiError(`Failed to export document as ${format}`, 500, 'Unable to export document.');
    }
  }

  // Import document
  async importDocument(file, options = {}) {
    const { type = 'document', title = null } = options;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      if (title) formData.append('title', title);

      const result = await apiService.post('/api/documents/import', formData);

      // Track imported document
      this.activeDocuments.set(result.id, result);

      return result;
    } catch (error) {
      console.error('Error importing document:', error);
      throw new ApiError('Failed to import document', 500, 'Unable to import document.');
    }
  }

  // Document search
  async searchDocuments(query, options = {}) {
    const {
      type = null,
      tags = [],
      author = null,
      dateFrom = null,
      dateTo = null
    } = options;

    try {
      const params = new URLSearchParams({
        q: query,
        type,
        author,
        dateFrom,
        dateTo,
        tags: tags.join(',')
      });

      return await apiService.get(`/api/documents/search?${params}`);
    } catch (error) {
      console.error('Error searching documents:', error);
      throw new ApiError('Search failed', 500, 'Unable to search documents.');
    }
  }

  // Document tagging
  async addTags(documentId, tags) {
    try {
      await apiService.post(`/api/documents/${documentId}/tags`, { tags });

      // Update local document
      const document = this.activeDocuments.get(documentId);
      if (document) {
        document.tags = [...(document.tags || []), ...tags];
        this.activeDocuments.set(documentId, document);
      }

      return true;
    } catch (error) {
      console.error('Error adding tags:', error);
      throw new ApiError('Failed to add tags', 500, 'Unable to add tags to document.');
    }
  }

  // Remove tags
  async removeTags(documentId, tags) {
    try {
      await apiService.delete(`/api/documents/${documentId}/tags`, { data: { tags } });

      // Update local document
      const document = this.activeDocuments.get(documentId);
      if (document) {
        document.tags = document.tags.filter(tag => !tags.includes(tag));
        this.activeDocuments.set(documentId, document);
      }

      return true;
    } catch (error) {
      console.error('Error removing tags:', error);
      throw new ApiError('Failed to remove tags', 500, 'Unable to remove tags from document.');
    }
  }

  // Document permissions
  async updatePermissions(documentId, permissions) {
    try {
      const result = await apiService.patch(`/api/documents/${documentId}/permissions`, permissions);

      // Update local document
      const document = this.activeDocuments.get(documentId);
      if (document) {
        document.permissions = permissions;
        this.activeDocuments.set(documentId, document);
      }

      return result;
    } catch (error) {
      console.error('Error updating permissions:', error);
      throw new ApiError('Failed to update permissions', 500, 'Unable to update document permissions.');
    }
  }

  // Get document permissions
  async getPermissions(documentId) {
    try {
      return await apiService.get(`/api/documents/${documentId}/permissions`);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      throw new ApiError('Failed to fetch permissions', 500, 'Unable to load document permissions.');
    }
  }

  // Document analytics
  async getDocumentAnalytics(documentId) {
    try {
      return await apiService.get(`/api/documents/${documentId}/analytics`);
    } catch (error) {
      console.error('Error fetching document analytics:', error);
      throw new ApiError('Failed to fetch analytics', 500, 'Unable to load document analytics.');
    }
  }

  // Duplicate document
  async duplicateDocument(documentId, newTitle) {
    try {
      const result = await apiService.post(`/api/documents/${documentId}/duplicate`, {
        title: newTitle,
        duplicatedAt: new Date().toISOString()
      });

      return result;
    } catch (error) {
      console.error('Error duplicating document:', error);
      throw new ApiError('Failed to duplicate document', 500, 'Unable to duplicate document.');
    }
  }

  // Delete document
  async deleteDocument(documentId) {
    try {
      await apiService.delete(`/api/documents/${documentId}`);

      // Remove from local tracking
      this.activeDocuments.delete(documentId);
      this.collaborators.delete(documentId);
      this.revisions.delete(documentId);
      this.comments.delete(documentId);

      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new ApiError('Failed to delete document', 500, 'Unable to delete document.');
    }
  }

  // Get current user ID
  getCurrentUserId() {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      return user.id || null;
    } catch {
      return null;
    }
  }

  // Real-time collaboration setup
  setupRealTimeCollaboration(documentId, onUpdate, onCollaboratorChange) {
    // WebSocket connection for real-time updates
    const wsUrl = `wss://${window.location.host}/api/documents/${documentId}/ws`;

    try {
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('Connected to document collaboration');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'document_update' && onUpdate) {
            onUpdate(data);
          } else if (data.type === 'collaborator_change' && onCollaboratorChange) {
            onCollaboratorChange(data);
          }
        } catch (error) {
          console.error('Error parsing collaboration message:', error);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      socket.onclose = () => {
        console.log('Disconnected from document collaboration');
      };

      return socket;
    } catch (error) {
      console.error('Failed to setup real-time collaboration:', error);

      // Fallback to polling
      return this.setupPollingCollaboration(documentId, onUpdate, onCollaboratorChange);
    }
  }

  // Polling fallback for collaboration
  setupPollingCollaboration(documentId, onUpdate, onCollaboratorChange) {
    const pollInterval = setInterval(async () => {
      try {
        const updates = await apiService.get(`/api/documents/${documentId}/updates`);
        if (updates.length > 0 && onUpdate) {
          onUpdate({ type: 'batch_updates', data: updates });
        }

        const collaborators = await this.getCollaborators(documentId);
        if (onCollaboratorChange) {
          onCollaboratorChange({ type: 'collaborators', data: collaborators });
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 2000); // Poll every 2 seconds

    // Return cleanup function
    return () => clearInterval(pollInterval);
  }

  // Document formatting
  formatDocument(content, format) {
    switch (format) {
      case 'html':
        return this.convertToHTML(content);
      case 'markdown':
        return this.convertToMarkdown(content);
      case 'plain':
        return this.stripFormatting(content);
      default:
        return content;
    }
  }

  // Convert to HTML
  convertToHTML(content) {
    return content
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  }

  // Convert to Markdown
  convertToMarkdown(content) {
    return content
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '\n\n')
      .replace(/<br>/g, '\n')
      .replace(/<strong>/g, '**')
      .replace(/<\/strong>/g, '**')
      .replace(/<em>/g, '*')
      .replace(/<\/em>/g, '*');
  }

  // Strip formatting
  stripFormatting(content) {
    return content
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"');
  }

  // Document validation
  validateDocument(content, options = {}) {
    const {
      minLength = 10,
      maxLength = 50000,
      requiredSections = []
    } = options;

    const errors = [];

    if (content.length < minLength) {
      errors.push(`Document must be at least ${minLength} characters`);
    }

    if (content.length > maxLength) {
      errors.push(`Document must be no more than ${maxLength} characters`);
    }

    requiredSections.forEach(section => {
      if (!content.includes(section)) {
        errors.push(`Document must include: ${section}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get active documents
  getActiveDocuments() {
    return Array.from(this.activeDocuments.values());
  }

  // Get document templates
  getTemplates() {
    return Array.from(this.templates.values());
  }

  // Get document revisions
  getRevisions(documentId) {
    return this.revisions.get(documentId) || [];
  }

  // Get document comments
  getComments(documentId) {
    return this.comments.get(documentId) || [];
  }

  // Get document collaborators
  getCollaborators(documentId) {
    return this.collaborators.get(documentId) || [];
  }

  // Cleanup resources
  cleanup() {
    this.activeDocuments.clear();
    this.documentHistory.clear();
    this.collaborators.clear();
    this.templates.clear();
    this.revisions.clear();
    this.comments.clear();
  }
}

// React hooks for document editor
export const useDocumentEditor = (documentId = null) => {
  const [document, setDocument] = React.useState(null);
  const [content, setContent] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [collaborators, setCollaborators] = React.useState([]);
  const [comments, setComments] = React.useState([]);

  const loadDocument = React.useCallback(async (id) => {
    setLoading(true);
    try {
      const result = await documentEditor.loadDocument(id);
      setDocument(result);
      setContent(result.content || '');
      return result;
    } catch (error) {
      console.error('Error loading document:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveDocument = React.useCallback(async (newContent, options = {}) => {
    if (!documentId) return;

    setSaving(true);
    try {
      const result = await documentEditor.saveDocument(documentId, newContent, options);
      setDocument(result);
      return result;
    } catch (error) {
      console.error('Error saving document:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [documentId]);

  const updateContent = React.useCallback(async (operation, data) => {
    if (!documentId) return;

    try {
      return await documentEditor.sendUpdate(documentId, operation, data);
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  }, [documentId]);

  const addComment = React.useCallback(async (commentData) => {
    if (!documentId) return;

    try {
      const result = await documentEditor.addComment(documentId, commentData);
      setComments(prev => [...prev, result]);
      return result;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }, [documentId]);

  const loadComments = React.useCallback(async () => {
    if (!documentId) return;

    try {
      const result = await documentEditor.getComments(documentId);
      setComments(result);
      return result;
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
    }
  }, [documentId]);

  const exportDocument = React.useCallback(async (format, options) => {
    if (!documentId) return;

    try {
      return await documentEditor.exportDocument(documentId, format, options);
    } catch (error) {
      console.error('Error exporting document:', error);
      throw error;
    }
  }, [documentId]);

  const shareDocument = React.useCallback(async (users, permissions) => {
    if (!documentId) return;

    try {
      return await documentEditor.shareDocument(documentId, users, permissions);
    } catch (error) {
      console.error('Error sharing document:', error);
      throw error;
    }
  }, [documentId]);

  // Load document on mount
  React.useEffect(() => {
    if (documentId) {
      loadDocument(documentId);
      loadComments();
    }
  }, [documentId, loadDocument, loadComments]);

  return {
    document,
    content,
    setContent,
    loading,
    saving,
    collaborators,
    comments,
    loadDocument,
    saveDocument,
    updateContent,
    addComment,
    loadComments,
    exportDocument,
    shareDocument,
    createDocument: documentEditor.createDocument.bind(documentEditor),
    getTemplates: documentEditor.getTemplates.bind(documentEditor),
    applyTemplate: (templateId) => documentEditor.applyTemplate(documentId, templateId),
    getRevisions: () => documentId ? documentEditor.getRevisions(documentId) : [],
    restoreRevision: (revisionId) => documentId ? documentEditor.restoreRevision(documentId, revisionId) : null
  };
};

// Create singleton instance
export const documentEditor = new DocumentEditor();

export default documentEditor;

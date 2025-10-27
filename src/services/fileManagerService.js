// Advanced File Manager Service
// Comprehensive file organization, sharing, and collaboration system

import { apiService, ApiError } from './apiService';

class FileManager {
  constructor() {
    this.uploadedFiles = new Map();
    this.folders = new Map();
    this.sharedFiles = new Map();
    this.recentFiles = [];
    this.favorites = new Set();
    this.fileVersions = new Map();
    this.collaborators = new Map();
  }

  // File organization and structure
  async createFolder(name, parentId = null, metadata = {}) {
    const folderData = {
      name,
      parentId,
      type: 'folder',
      metadata,
      createdAt: new Date().toISOString()
    };

    try {
      const result = await apiService.post('/api/files/folders', folderData);
      this.folders.set(result.id, result);
      return result;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw new ApiError('Failed to create folder', 500, 'Unable to create folder. Please try again.');
    }
  }

  // Upload file with advanced options
  async uploadFile(file, options = {}) {
    const {
      folderId = null,
      isPublic = false,
      collaborators = [],
      tags = [],
      description = '',
      onProgress
    } = options;

    const uploadData = {
      folderId,
      isPublic,
      collaborators,
      tags,
      description,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    };

    try {
      // Create file record first
      const fileRecord = await apiService.post('/api/files', uploadData);

      // Upload file data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileId', fileRecord.id);

      const result = await apiService.post(`/api/files/${fileRecord.id}/upload`, formData, {
        onUploadProgress: onProgress
      });

      this.uploadedFiles.set(result.id, result);
      this.addToRecent(result);

      return result;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new ApiError('Failed to upload file', 500, 'Unable to upload file. Please try again.');
    }
  }

  // Get files with filtering and sorting
  async getFiles(options = {}) {
    const {
      folderId = null,
      type = null,
      tags = [],
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 50
    } = options;

    try {
      const params = new URLSearchParams({
        folderId,
        type,
        sortBy,
        sortOrder,
        page,
        limit,
        search,
        tags: tags.join(',')
      });

      const result = await apiService.get(`/api/files?${params}`);
      return result;
    } catch (error) {
      console.error('Error fetching files:', error);
      throw new ApiError('Failed to fetch files', 500, 'Unable to load files. Please try again.');
    }
  }

  // Advanced file search
  async searchFiles(query, options = {}) {
    const {
      type = null,
      tags = [],
      dateFrom = null,
      dateTo = null,
      fileSizeMin = null,
      fileSizeMax = null,
      sortBy = 'relevance'
    } = options;

    try {
      const params = new URLSearchParams({
        q: query,
        type,
        sortBy,
        tags: tags.join(','),
        dateFrom,
        dateTo,
        fileSizeMin,
        fileSizeMax
      });

      return await apiService.get(`/api/files/search?${params}`);
    } catch (error) {
      console.error('Error searching files:', error);
      throw new ApiError('Search failed', 500, 'Unable to search files. Please try again.');
    }
  }

  // Share file with users
  async shareFile(fileId, users, permissions = 'view') {
    try {
      const result = await apiService.post(`/api/files/${fileId}/share`, {
        users,
        permissions,
        sharedAt: new Date().toISOString()
      });

      // Update local state
      const file = this.uploadedFiles.get(fileId);
      if (file) {
        file.sharedWith = users;
        file.permissions = permissions;
        this.uploadedFiles.set(fileId, file);
      }

      return result;
    } catch (error) {
      console.error('Error sharing file:', error);
      throw new ApiError('Failed to share file', 500, 'Unable to share file. Please try again.');
    }
  }

  // Get shared files
  async getSharedFiles() {
    try {
      const result = await apiService.get('/api/files/shared');
      this.sharedFiles.clear();

      result.forEach(file => {
        this.sharedFiles.set(file.id, file);
      });

      return result;
    } catch (error) {
      console.error('Error fetching shared files:', error);
      throw new ApiError('Failed to fetch shared files', 500, 'Unable to load shared files.');
    }
  }

  // File versioning
  async createVersion(fileId, newFile, description = '') {
    try {
      const formData = new FormData();
      formData.append('file', newFile);
      formData.append('description', description);

      const result = await apiService.post(`/api/files/${fileId}/versions`, formData);

      // Update versions
      if (!this.fileVersions.has(fileId)) {
        this.fileVersions.set(fileId, []);
      }

      const versions = this.fileVersions.get(fileId);
      versions.unshift(result);
      this.fileVersions.set(fileId, versions);

      return result;
    } catch (error) {
      console.error('Error creating file version:', error);
      throw new ApiError('Failed to create version', 500, 'Unable to create file version.');
    }
  }

  // Get file versions
  async getFileVersions(fileId) {
    try {
      const result = await apiService.get(`/api/files/${fileId}/versions`);
      this.fileVersions.set(fileId, result);
      return result;
    } catch (error) {
      console.error('Error fetching file versions:', error);
      throw new ApiError('Failed to fetch versions', 500, 'Unable to load file versions.');
    }
  }

  // Restore file version
  async restoreVersion(fileId, versionId) {
    try {
      const result = await apiService.post(`/api/files/${fileId}/versions/${versionId}/restore`);
      return result;
    } catch (error) {
      console.error('Error restoring version:', error);
      throw new ApiError('Failed to restore version', 500, 'Unable to restore file version.');
    }
  }

  // Add file to favorites
  addToFavorites(fileId) {
    this.favorites.add(fileId);

    // Update in API
    apiService.post(`/api/files/${fileId}/favorite`).catch(error => {
      console.error('Error adding to favorites:', error);
    });

    return true;
  }

  // Remove from favorites
  removeFromFavorites(fileId) {
    this.favorites.delete(fileId);

    // Update in API
    apiService.delete(`/api/files/${fileId}/favorite`).catch(error => {
      console.error('Error removing from favorites:', error);
    });

    return true;
  }

  // Get favorite files
  getFavoriteFiles() {
    return Array.from(this.favorites).map(fileId => this.uploadedFiles.get(fileId)).filter(Boolean);
  }

  // Add to recent files
  addToRecent(file) {
    this.recentFiles.unshift(file);

    // Keep only last 20 recent files
    if (this.recentFiles.length > 20) {
      this.recentFiles = this.recentFiles.slice(0, 20);
    }

    localStorage.setItem('recentFiles', JSON.stringify(this.recentFiles));
  }

  // Get recent files
  getRecentFiles() {
    const stored = localStorage.getItem('recentFiles');
    if (stored) {
      this.recentFiles = JSON.parse(stored);
    }
    return this.recentFiles;
  }

  // File collaboration
  async addCollaborator(fileId, userId, permissions = 'view') {
    try {
      const result = await apiService.post(`/api/files/${fileId}/collaborators`, {
        userId,
        permissions,
        addedAt: new Date().toISOString()
      });

      // Update local state
      if (!this.collaborators.has(fileId)) {
        this.collaborators.set(fileId, []);
      }

      const fileCollaborators = this.collaborators.get(fileId);
      fileCollaborators.push(result);
      this.collaborators.set(fileId, fileCollaborators);

      return result;
    } catch (error) {
      console.error('Error adding collaborator:', error);
      throw new ApiError('Failed to add collaborator', 500, 'Unable to add collaborator.');
    }
  }

  // Remove collaborator
  async removeCollaborator(fileId, userId) {
    try {
      await apiService.delete(`/api/files/${fileId}/collaborators/${userId}`);

      // Update local state
      if (this.collaborators.has(fileId)) {
        const fileCollaborators = this.collaborators.get(fileId);
        const updated = fileCollaborators.filter(c => c.userId !== userId);
        this.collaborators.set(fileId, updated);
      }

      return true;
    } catch (error) {
      console.error('Error removing collaborator:', error);
      throw new ApiError('Failed to remove collaborator', 500, 'Unable to remove collaborator.');
    }
  }

  // Get file collaborators
  async getCollaborators(fileId) {
    try {
      const result = await apiService.get(`/api/files/${fileId}/collaborators`);
      this.collaborators.set(fileId, result);
      return result;
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      throw new ApiError('Failed to fetch collaborators', 500, 'Unable to load collaborators.');
    }
  }

  // File tagging system
  async addTags(fileId, tags) {
    try {
      const result = await apiService.post(`/api/files/${fileId}/tags`, { tags });

      // Update local file
      const file = this.uploadedFiles.get(fileId);
      if (file) {
        file.tags = [...(file.tags || []), ...tags];
        this.uploadedFiles.set(fileId, file);
      }

      return result;
    } catch (error) {
      console.error('Error adding tags:', error);
      throw new ApiError('Failed to add tags', 500, 'Unable to add tags to file.');
    }
  }

  // Remove tags
  async removeTags(fileId, tags) {
    try {
      await apiService.delete(`/api/files/${fileId}/tags`, { data: { tags } });

      // Update local file
      const file = this.uploadedFiles.get(fileId);
      if (file) {
        file.tags = file.tags.filter(tag => !tags.includes(tag));
        this.uploadedFiles.set(fileId, file);
      }

      return true;
    } catch (error) {
      console.error('Error removing tags:', error);
      throw new ApiError('Failed to remove tags', 500, 'Unable to remove tags from file.');
    }
  }

  // Get files by tags
  async getFilesByTags(tags) {
    try {
      const params = new URLSearchParams({ tags: tags.join(',') });
      return await apiService.get(`/api/files/by-tags?${params}`);
    } catch (error) {
      console.error('Error fetching files by tags:', error);
      throw new ApiError('Failed to fetch files by tags', 500, 'Unable to load files.');
    }
  }

  // File analytics
  async getFileAnalytics(fileId) {
    try {
      const result = await apiService.get(`/api/files/${fileId}/analytics`);
      return result;
    } catch (error) {
      console.error('Error fetching file analytics:', error);
      throw new ApiError('Failed to fetch analytics', 500, 'Unable to load file analytics.');
    }
  }

  // Bulk operations
  async bulkMove(files, targetFolderId) {
    try {
      const result = await apiService.post('/api/files/bulk/move', {
        files,
        targetFolderId
      });

      // Update local state
      files.forEach(fileId => {
        const file = this.uploadedFiles.get(fileId);
        if (file) {
          file.folderId = targetFolderId;
          this.uploadedFiles.set(fileId, file);
        }
      });

      return result;
    } catch (error) {
      console.error('Error moving files:', error);
      throw new ApiError('Failed to move files', 500, 'Unable to move files.');
    }
  }

  // Bulk delete
  async bulkDelete(files) {
    try {
      await apiService.post('/api/files/bulk/delete', { files });

      // Update local state
      files.forEach(fileId => {
        this.uploadedFiles.delete(fileId);
        this.favorites.delete(fileId);
      });

      return true;
    } catch (error) {
      console.error('Error deleting files:', error);
      throw new ApiError('Failed to delete files', 500, 'Unable to delete files.');
    }
  }

  // File preview generation
  async generatePreview(fileId, options = {}) {
    const {
      width = 300,
      height = 200,
      format = 'jpeg',
      quality = 0.8
    } = options;

    try {
      const params = new URLSearchParams({ width, height, format, quality });
      return await apiService.get(`/api/files/${fileId}/preview?${params}`);
    } catch (error) {
      console.error('Error generating preview:', error);
      throw new ApiError('Failed to generate preview', 500, 'Unable to generate file preview.');
    }
  }

  // File download with tracking
  async downloadFile(fileId, trackDownload = true) {
    try {
      const result = await apiService.get(`/api/files/${fileId}/download`);

      if (trackDownload) {
        // Track download
        apiService.post(`/api/files/${fileId}/download-track`).catch(error => {
          console.error('Error tracking download:', error);
        });
      }

      return result;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new ApiError('Failed to download file', 500, 'Unable to download file.');
    }
  }

  // File compression
  async compressFile(fileId, options = {}) {
    const {
      quality = 0.8,
      format = null,
      maxWidth = null,
      maxHeight = null
    } = options;

    try {
      const params = new URLSearchParams({ quality, format, maxWidth, maxHeight });
      return await apiService.post(`/api/files/${fileId}/compress?${params}`);
    } catch (error) {
      console.error('Error compressing file:', error);
      throw new ApiError('Failed to compress file', 500, 'Unable to compress file.');
    }
  }

  // File conversion
  async convertFile(fileId, targetFormat) {
    try {
      return await apiService.post(`/api/files/${fileId}/convert`, {
        targetFormat
      });
    } catch (error) {
      console.error('Error converting file:', error);
      throw new ApiError('Failed to convert file', 500, 'Unable to convert file format.');
    }
  }

  // Get file metadata
  async getFileMetadata(fileId) {
    try {
      return await apiService.get(`/api/files/${fileId}/metadata`);
    } catch (error) {
      console.error('Error fetching file metadata:', error);
      throw new ApiError('Failed to fetch metadata', 500, 'Unable to load file information.');
    }
  }

  // Update file metadata
  async updateMetadata(fileId, metadata) {
    try {
      const result = await apiService.patch(`/api/files/${fileId}/metadata`, metadata);

      // Update local file
      const file = this.uploadedFiles.get(fileId);
      if (file) {
        file.metadata = { ...file.metadata, ...metadata };
        this.uploadedFiles.set(fileId, file);
      }

      return result;
    } catch (error) {
      console.error('Error updating metadata:', error);
      throw new ApiError('Failed to update metadata', 500, 'Unable to update file information.');
    }
  }

  // File access permissions
  async checkAccess(fileId, userId) {
    try {
      return await apiService.get(`/api/files/${fileId}/access/${userId}`);
    } catch (error) {
      console.error('Error checking file access:', error);
      return { hasAccess: false, permissions: [] };
    }
  }

  // File activity log
  async getFileActivity(fileId) {
    try {
      return await apiService.get(`/api/files/${fileId}/activity`);
    } catch (error) {
      console.error('Error fetching file activity:', error);
      throw new ApiError('Failed to fetch activity', 500, 'Unable to load file activity.');
    }
  }

  // Storage usage statistics
  async getStorageUsage(userId) {
    try {
      return await apiService.get(`/api/files/storage/${userId}`);
    } catch (error) {
      console.error('Error fetching storage usage:', error);
      throw new ApiError('Failed to fetch storage usage', 500, 'Unable to load storage information.');
    }
  }

  // Cleanup resources
  cleanup() {
    this.uploadedFiles.clear();
    this.folders.clear();
    this.sharedFiles.clear();
    this.fileVersions.clear();
    this.collaborators.clear();
    this.favorites.clear();
    this.recentFiles = [];
  }

  // Export file manager data
  exportData() {
    return {
      uploadedFiles: Array.from(this.uploadedFiles.values()),
      folders: Array.from(this.folders.values()),
      sharedFiles: Array.from(this.sharedFiles.values()),
      favorites: Array.from(this.favorites),
      recentFiles: this.recentFiles
    };
  }
}

// React hooks for file management
export const useFileManager = () => {
  const [files, setFiles] = React.useState([]);
  const [folders, setFolders] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [currentFolder, setCurrentFolder] = React.useState(null);

  const loadFiles = React.useCallback(async (folderId = null) => {
    setLoading(true);
    try {
      const result = await fileManager.getFiles({ folderId });
      setFiles(result.files || []);
      setCurrentFolder(folderId);
      return result;
    } catch (error) {
      console.error('Error loading files:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadFile = React.useCallback(async (file, options = {}) => {
    try {
      const result = await fileManager.uploadFile(file, {
        folderId: currentFolder,
        ...options
      });

      // Refresh file list
      await loadFiles(currentFolder);
      return result;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }, [currentFolder, loadFiles]);

  const createFolder = React.useCallback(async (name, metadata = {}) => {
    try {
      const result = await fileManager.createFolder(name, currentFolder, metadata);
      setFolders(prev => [...prev, result]);
      return result;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  }, [currentFolder]);

  const searchFiles = React.useCallback(async (query, options = {}) => {
    setLoading(true);
    try {
      const result = await fileManager.searchFiles(query, options);
      setFiles(result.files || []);
      return result;
    } catch (error) {
      console.error('Error searching files:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const shareFile = React.useCallback(async (fileId, users, permissions) => {
    try {
      return await fileManager.shareFile(fileId, users, permissions);
    } catch (error) {
      console.error('Error sharing file:', error);
      throw error;
    }
  }, []);

  const deleteFile = React.useCallback(async (fileId) => {
    try {
      await apiService.delete(`/api/files/${fileId}`);
      setFiles(prev => prev.filter(f => f.id !== fileId));
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }, []);

  return {
    files,
    folders,
    loading,
    currentFolder,
    setCurrentFolder,
    loadFiles,
    uploadFile,
    createFolder,
    searchFiles,
    shareFile,
    deleteFile,
    getFavoriteFiles: fileManager.getFavoriteFiles.bind(fileManager),
    getRecentFiles: fileManager.getRecentFiles.bind(fileManager),
    addToFavorites: fileManager.addToFavorites.bind(fileManager),
    removeFromFavorites: fileManager.removeFromFavorites.bind(fileManager)
  };
};

// File manager context for React
export const FileManagerContext = React.createContext();

// File manager provider
export const FileManagerProvider = ({ children }) => {
  const fileManager = useFileManager();

  return (
    <FileManagerContext.Provider value={fileManager}>
      {children}
    </FileManagerContext.Provider>
  );
};

// Create singleton instance
export const fileManager = new FileManager();

export default fileManager;

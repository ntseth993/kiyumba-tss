// Advanced Media Gallery Service
// Comprehensive image and video management with editing tools

import { apiService, ApiError } from './apiService';

class MediaGallery {
  constructor() {
    this.mediaFiles = new Map();
    this.albums = new Map();
    this.tags = new Map();
    this.favorites = new Set();
    this.recentMedia = [];
    this.editingSession = null;
  }

  // Upload media file
  async uploadMedia(file, options = {}) {
    const {
      albumId = null,
      tags = [],
      description = '',
      isPublic = false,
      onProgress
    } = options;

    try {
      // Validate file
      const validation = this.validateMediaFile(file);
      if (!validation.isValid) {
        throw new ApiError('File validation failed', 400, validation.errors.join(', '));
      }

      const uploadData = {
        albumId,
        tags,
        description,
        isPublic,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        dimensions: validation.dimensions
      };

      // Create media record
      const mediaRecord = await apiService.post('/api/media', uploadData);

      // Upload file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mediaId', mediaRecord.id);

      const result = await apiService.post(`/api/media/${mediaRecord.id}/upload`, formData, {
        onUploadProgress: onProgress
      });

      this.mediaFiles.set(result.id, result);
      this.addToRecent(result);

      return result;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw new ApiError('Failed to upload media', 500, 'Unable to upload media file. Please try again.');
    }
  }

  // Validate media file
  validateMediaFile(file) {
    const errors = [];
    let dimensions = null;

    // Check file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      errors.push('File size must be less than 50MB');
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/mov', 'video/avi', 'video/webm'
    ];

    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }

    // Check dimensions for images
    if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          dimensions = { width: img.width, height: img.height };

          // Check minimum dimensions
          if (img.width < 100 || img.height < 100) {
            errors.push('Image must be at least 100x100 pixels');
          }

          // Check maximum dimensions
          if (img.width > 5000 || img.height > 5000) {
            errors.push('Image must be no larger than 5000x5000 pixels');
          }

          resolve({
            isValid: errors.length === 0,
            errors,
            dimensions
          });
        };
        img.onerror = () => {
          errors.push('Invalid image file');
          resolve({ isValid: false, errors, dimensions });
        };
        img.src = URL.createObjectURL(file);
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      dimensions
    };
  }

  // Get media files
  async getMedia(options = {}) {
    const {
      albumId = null,
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
        albumId,
        type,
        sortBy,
        sortOrder,
        page,
        limit,
        search,
        tags: tags.join(',')
      });

      const result = await apiService.get(`/api/media?${params}`);
      return result;
    } catch (error) {
      console.error('Error fetching media:', error);
      throw new ApiError('Failed to fetch media', 500, 'Unable to load media files. Please try again.');
    }
  }

  // Create album
  async createAlbum(albumData) {
    try {
      const result = await apiService.post('/api/media/albums', {
        ...albumData,
        createdAt: new Date().toISOString()
      });

      this.albums.set(result.id, result);
      return result;
    } catch (error) {
      console.error('Error creating album:', error);
      throw new ApiError('Failed to create album', 500, 'Unable to create album. Please try again.');
    }
  }

  // Get albums
  async getAlbums() {
    try {
      const result = await apiService.get('/api/media/albums');

      result.forEach(album => {
        this.albums.set(album.id, album);
      });

      return result;
    } catch (error) {
      console.error('Error fetching albums:', error);
      throw new ApiError('Failed to fetch albums', 500, 'Unable to load albums. Please try again.');
    }
  }

  // Media editing tools
  async editMedia(mediaId, edits) {
    try {
      const result = await apiService.post(`/api/media/${mediaId}/edit`, edits);

      // Update local media
      const media = this.mediaFiles.get(mediaId);
      if (media) {
        media.edits = { ...media.edits, ...edits };
        media.editedAt = new Date().toISOString();
        this.mediaFiles.set(mediaId, media);
      }

      return result;
    } catch (error) {
      console.error('Error editing media:', error);
      throw new ApiError('Failed to edit media', 500, 'Unable to edit media file.');
    }
  }

  // Image cropping
  async cropImage(mediaId, cropArea, options = {}) {
    const {
      quality = 0.9,
      format = 'image/jpeg'
    } = options;

    try {
      const result = await apiService.post(`/api/media/${mediaId}/crop`, {
        cropArea,
        quality,
        format
      });

      // Update local media
      const media = this.mediaFiles.get(mediaId);
      if (media) {
        media.croppedUrl = result.url;
        media.editedAt = new Date().toISOString();
        this.mediaFiles.set(mediaId, media);
      }

      return result;
    } catch (error) {
      console.error('Error cropping image:', error);
      throw new ApiError('Failed to crop image', 500, 'Unable to crop image.');
    }
  }

  // Image resizing
  async resizeImage(mediaId, dimensions, options = {}) {
    const {
      quality = 0.9,
      format = 'image/jpeg',
      maintainAspectRatio = true
    } = options;

    try {
      const result = await apiService.post(`/api/media/${mediaId}/resize`, {
        dimensions,
        quality,
        format,
        maintainAspectRatio
      });

      // Update local media
      const media = this.mediaFiles.get(mediaId);
      if (media) {
        media.resizedUrl = result.url;
        media.editedAt = new Date().toISOString();
        this.mediaFiles.set(mediaId, media);
      }

      return result;
    } catch (error) {
      console.error('Error resizing image:', error);
      throw new ApiError('Failed to resize image', 500, 'Unable to resize image.');
    }
  }

  // Image filters and effects
  async applyFilter(mediaId, filter, options = {}) {
    const {
      intensity = 1.0,
      parameters = {}
    } = options;

    try {
      const result = await apiService.post(`/api/media/${mediaId}/filter`, {
        filter,
        intensity,
        parameters
      });

      // Update local media
      const media = this.mediaFiles.get(mediaId);
      if (media) {
        media.filteredUrl = result.url;
        media.editedAt = new Date().toISOString();
        this.mediaFiles.set(mediaId, media);
      }

      return result;
    } catch (error) {
      console.error('Error applying filter:', error);
      throw new ApiError('Failed to apply filter', 500, 'Unable to apply image filter.');
    }
  }

  // Video editing
  async editVideo(mediaId, edits) {
    try {
      const result = await apiService.post(`/api/media/${mediaId}/edit-video`, edits);

      // Update local media
      const media = this.mediaFiles.get(mediaId);
      if (media) {
        media.editedUrl = result.url;
        media.editedAt = new Date().toISOString();
        this.mediaFiles.set(mediaId, media);
      }

      return result;
    } catch (error) {
      console.error('Error editing video:', error);
      throw new ApiError('Failed to edit video', 500, 'Unable to edit video.');
    }
  }

  // Generate thumbnails
  async generateThumbnails(mediaId, options = {}) {
    const {
      sizes = ['small', 'medium', 'large'],
      quality = 0.8
    } = options;

    try {
      const result = await apiService.post(`/api/media/${mediaId}/thumbnails`, {
        sizes,
        quality
      });

      // Update local media
      const media = this.mediaFiles.get(mediaId);
      if (media) {
        media.thumbnails = result.thumbnails;
        this.mediaFiles.set(mediaId, media);
      }

      return result;
    } catch (error) {
      console.error('Error generating thumbnails:', error);
      throw new ApiError('Failed to generate thumbnails', 500, 'Unable to generate thumbnails.');
    }
  }

  // Media search
  async searchMedia(query, options = {}) {
    const {
      type = null,
      tags = [],
      dateFrom = null,
      dateTo = null,
      albumId = null
    } = options;

    try {
      const params = new URLSearchParams({
        q: query,
        type,
        albumId,
        dateFrom,
        dateTo,
        tags: tags.join(',')
      });

      return await apiService.get(`/api/media/search?${params}`);
    } catch (error) {
      console.error('Error searching media:', error);
      throw new ApiError('Search failed', 500, 'Unable to search media files.');
    }
  }

  // Media tagging
  async addTags(mediaId, tags) {
    try {
      await apiService.post(`/api/media/${mediaId}/tags`, { tags });

      // Update local media
      const media = this.mediaFiles.get(mediaId);
      if (media) {
        media.tags = [...(media.tags || []), ...tags];
        this.mediaFiles.set(mediaId, media);
      }

      return true;
    } catch (error) {
      console.error('Error adding tags:', error);
      throw new ApiError('Failed to add tags', 500, 'Unable to add tags to media.');
    }
  }

  // Remove tags
  async removeTags(mediaId, tags) {
    try {
      await apiService.delete(`/api/media/${mediaId}/tags`, { data: { tags } });

      // Update local media
      const media = this.mediaFiles.get(mediaId);
      if (media) {
        media.tags = media.tags.filter(tag => !tags.includes(tag));
        this.mediaFiles.set(mediaId, media);
      }

      return true;
    } catch (error) {
      console.error('Error removing tags:', error);
      throw new ApiError('Failed to remove tags', 500, 'Unable to remove tags from media.');
    }
  }

  // Add to favorites
  addToFavorites(mediaId) {
    this.favorites.add(mediaId);

    // Update in API
    apiService.post(`/api/media/${mediaId}/favorite`).catch(error => {
      console.error('Error adding to favorites:', error);
    });

    return true;
  }

  // Remove from favorites
  removeFromFavorites(mediaId) {
    this.favorites.delete(mediaId);

    // Update in API
    apiService.delete(`/api/media/${mediaId}/favorite`).catch(error => {
      console.error('Error removing from favorites:', error);
    });

    return true;
  }

  // Get favorite media
  getFavoriteMedia() {
    return Array.from(this.favorites).map(mediaId => this.mediaFiles.get(mediaId)).filter(Boolean);
  }

  // Add to recent
  addToRecent(media) {
    this.recentMedia.unshift(media);

    // Keep only last 50 recent items
    if (this.recentMedia.length > 50) {
      this.recentMedia = this.recentMedia.slice(0, 50);
    }

    localStorage.setItem('recentMedia', JSON.stringify(this.recentMedia));
  }

  // Get recent media
  getRecentMedia() {
    const stored = localStorage.getItem('recentMedia');
    if (stored) {
      this.recentMedia = JSON.parse(stored);
    }
    return this.recentMedia;
  }

  // Media sharing
  async shareMedia(mediaId, users, permissions = 'view') {
    try {
      const result = await apiService.post(`/api/media/${mediaId}/share`, {
        users,
        permissions,
        sharedAt: new Date().toISOString()
      });

      // Update local media
      const media = this.mediaFiles.get(mediaId);
      if (media) {
        media.sharedWith = users;
        media.permissions = permissions;
        this.mediaFiles.set(mediaId, media);
      }

      return result;
    } catch (error) {
      console.error('Error sharing media:', error);
      throw new ApiError('Failed to share media', 500, 'Unable to share media file.');
    }
  }

  // Media comments
  async addComment(mediaId, commentData) {
    try {
      const result = await apiService.post(`/api/media/${mediaId}/comments`, {
        ...commentData,
        createdAt: new Date().toISOString()
      });

      // Update local media
      const media = this.mediaFiles.get(mediaId);
      if (media) {
        if (!media.comments) media.comments = [];
        media.comments.push(result);
        this.mediaFiles.set(mediaId, media);
      }

      return result;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new ApiError('Failed to add comment', 500, 'Unable to add comment to media.');
    }
  }

  // Get media comments
  async getComments(mediaId) {
    try {
      return await apiService.get(`/api/media/${mediaId}/comments`);
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw new ApiError('Failed to fetch comments', 500, 'Unable to load media comments.');
    }
  }

  // Media analytics
  async getMediaAnalytics(mediaId) {
    try {
      return await apiService.get(`/api/media/${mediaId}/analytics`);
    } catch (error) {
      console.error('Error fetching media analytics:', error);
      throw new ApiError('Failed to fetch analytics', 500, 'Unable to load media analytics.');
    }
  }

  // Bulk operations
  async bulkMove(mediaIds, albumId) {
    try {
      const result = await apiService.post('/api/media/bulk/move', {
        mediaIds,
        albumId
      });

      // Update local media
      mediaIds.forEach(mediaId => {
        const media = this.mediaFiles.get(mediaId);
        if (media) {
          media.albumId = albumId;
          this.mediaFiles.set(mediaId, media);
        }
      });

      return result;
    } catch (error) {
      console.error('Error moving media:', error);
      throw new ApiError('Failed to move media', 500, 'Unable to move media files.');
    }
  }

  // Bulk delete
  async bulkDelete(mediaIds) {
    try {
      await apiService.post('/api/media/bulk/delete', { mediaIds });

      // Update local state
      mediaIds.forEach(mediaId => {
        this.mediaFiles.delete(mediaId);
        this.favorites.delete(mediaId);
      });

      return true;
    } catch (error) {
      console.error('Error deleting media:', error);
      throw new ApiError('Failed to delete media', 500, 'Unable to delete media files.');
    }
  }

  // Media download
  async downloadMedia(mediaId, options = {}) {
    const {
      quality = 'original',
      format = null
    } = options;

    try {
      const params = new URLSearchParams({ quality, format });
      const result = await apiService.get(`/api/media/${mediaId}/download?${params}`);

      // Create download link
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = result.fileName || 'media';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return true;
    } catch (error) {
      console.error('Error downloading media:', error);
      throw new ApiError('Failed to download media', 500, 'Unable to download media file.');
    }
  }

  // Media conversion
  async convertMedia(mediaId, targetFormat, options = {}) {
    try {
      const result = await apiService.post(`/api/media/${mediaId}/convert`, {
        targetFormat,
        ...options
      });

      return result;
    } catch (error) {
      console.error('Error converting media:', error);
      throw new ApiError('Failed to convert media', 500, 'Unable to convert media format.');
    }
  }

  // Media compression
  async compressMedia(mediaId, options = {}) {
    const {
      quality = 0.8,
      maxWidth = null,
      maxHeight = null
    } = options;

    try {
      const result = await apiService.post(`/api/media/${mediaId}/compress`, {
        quality,
        maxWidth,
        maxHeight
      });

      // Update local media
      const media = this.mediaFiles.get(mediaId);
      if (media) {
        media.compressedUrl = result.url;
        media.editedAt = new Date().toISOString();
        this.mediaFiles.set(mediaId, media);
      }

      return result;
    } catch (error) {
      console.error('Error compressing media:', error);
      throw new ApiError('Failed to compress media', 500, 'Unable to compress media file.');
    }
  }

  // Get media metadata
  async getMediaMetadata(mediaId) {
    try {
      return await apiService.get(`/api/media/${mediaId}/metadata`);
    } catch (error) {
      console.error('Error fetching media metadata:', error);
      throw new ApiError('Failed to fetch metadata', 500, 'Unable to load media information.');
    }
  }

  // Update media metadata
  async updateMetadata(mediaId, metadata) {
    try {
      const result = await apiService.patch(`/api/media/${mediaId}/metadata`, metadata);

      // Update local media
      const media = this.mediaFiles.get(mediaId);
      if (media) {
        media.metadata = { ...media.metadata, ...metadata };
        this.mediaFiles.set(mediaId, media);
      }

      return result;
    } catch (error) {
      console.error('Error updating metadata:', error);
      throw new ApiError('Failed to update metadata', 500, 'Unable to update media information.');
    }
  }

  // Media gallery statistics
  async getGalleryStats() {
    try {
      return await apiService.get('/api/media/stats');
    } catch (error) {
      console.error('Error fetching gallery stats:', error);
      throw new ApiError('Failed to fetch statistics', 500, 'Unable to load gallery statistics.');
    }
  }

  // Delete media
  async deleteMedia(mediaId) {
    try {
      await apiService.delete(`/api/media/${mediaId}`);

      // Remove from local tracking
      this.mediaFiles.delete(mediaId);
      this.favorites.delete(mediaId);

      return true;
    } catch (error) {
      console.error('Error deleting media:', error);
      throw new ApiError('Failed to delete media', 500, 'Unable to delete media file.');
    }
  }

  // Get media by tags
  async getMediaByTags(tags) {
    try {
      const params = new URLSearchParams({ tags: tags.join(',') });
      return await apiService.get(`/api/media/by-tags?${params}`);
    } catch (error) {
      console.error('Error fetching media by tags:', error);
      throw new ApiError('Failed to fetch media by tags', 500, 'Unable to load media files.');
    }
  }

  // Get popular tags
  async getPopularTags(limit = 20) {
    try {
      const params = new URLSearchParams({ limit });
      return await apiService.get(`/api/media/tags/popular?${params}`);
    } catch (error) {
      console.error('Error fetching popular tags:', error);
      throw new ApiError('Failed to fetch popular tags', 500, 'Unable to load popular tags.');
    }
  }

  // Media preview
  async generatePreview(mediaId, options = {}) {
    const {
      width = 300,
      height = 200,
      quality = 0.8
    } = options;

    try {
      const params = new URLSearchParams({ width, height, quality });
      return await apiService.get(`/api/media/${mediaId}/preview?${params}`);
    } catch (error) {
      console.error('Error generating preview:', error);
      throw new ApiError('Failed to generate preview', 500, 'Unable to generate media preview.');
    }
  }

  // Get media files
  getMedia() {
    return Array.from(this.mediaFiles.values());
  }

  // Get albums
  getAlbums() {
    return Array.from(this.albums.values());
  }

  // Get tags
  getTags() {
    return Array.from(this.tags.values());
  }

  // Cleanup resources
  cleanup() {
    this.mediaFiles.clear();
    this.albums.clear();
    this.tags.clear();
    this.favorites.clear();
    this.recentMedia = [];
    this.editingSession = null;
  }
}

// React hooks for media gallery
export const useMediaGallery = () => {
  const [media, setMedia] = React.useState([]);
  const [albums, setAlbums] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [currentAlbum, setCurrentAlbum] = React.useState(null);

  const loadMedia = React.useCallback(async (options = {}) => {
    setLoading(true);
    try {
      const result = await mediaGallery.getMedia({ albumId: currentAlbum, ...options });
      setMedia(result.items || []);
      return result;
    } catch (error) {
      console.error('Error loading media:', error);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  }, [currentAlbum]);

  const loadAlbums = React.useCallback(async () => {
    try {
      const result = await mediaGallery.getAlbums();
      setAlbums(result);
      return result;
    } catch (error) {
      console.error('Error loading albums:', error);
      setAlbums([]);
    }
  }, []);

  const uploadMedia = React.useCallback(async (file, options = {}) => {
    try {
      const result = await mediaGallery.uploadMedia(file, {
        albumId: currentAlbum,
        ...options
      });

      // Refresh media list
      await loadMedia();
      return result;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
  }, [currentAlbum, loadMedia]);

  const createAlbum = React.useCallback(async (albumData) => {
    try {
      const result = await mediaGallery.createAlbum(albumData);
      setAlbums(prev => [...prev, result]);
      return result;
    } catch (error) {
      console.error('Error creating album:', error);
      throw error;
    }
  }, []);

  const searchMedia = React.useCallback(async (query, options = {}) => {
    setLoading(true);
    try {
      const result = await mediaGallery.searchMedia(query, options);
      setMedia(result.items || []);
      return result;
    } catch (error) {
      console.error('Error searching media:', error);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const editMedia = React.useCallback(async (mediaId, edits) => {
    try {
      return await mediaGallery.editMedia(mediaId, edits);
    } catch (error) {
      console.error('Error editing media:', error);
      throw error;
    }
  }, []);

  const deleteMedia = React.useCallback(async (mediaId) => {
    try {
      await mediaGallery.deleteMedia(mediaId);
      setMedia(prev => prev.filter(m => m.id !== mediaId));
      return true;
    } catch (error) {
      console.error('Error deleting media:', error);
      throw error;
    }
  }, []);

  // Load media on album change
  React.useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  return {
    media,
    albums,
    loading,
    currentAlbum,
    setCurrentAlbum,
    loadMedia,
    loadAlbums,
    uploadMedia,
    createAlbum,
    searchMedia,
    editMedia,
    deleteMedia,
    getFavoriteMedia: mediaGallery.getFavoriteMedia.bind(mediaGallery),
    getRecentMedia: mediaGallery.getRecentMedia.bind(mediaGallery),
    addToFavorites: mediaGallery.addToFavorites.bind(mediaGallery),
    removeFromFavorites: mediaGallery.removeFromFavorites.bind(mediaGallery),
    getGalleryStats: mediaGallery.getGalleryStats.bind(mediaGallery)
  };
};

// Create singleton instance
export const mediaGallery = new MediaGallery();

export default mediaGallery;

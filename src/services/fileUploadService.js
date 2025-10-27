// Advanced File Upload Service
// Handles file uploads with validation, compression, cropping, and progress tracking

import { apiService, ApiError } from './apiService';

class FileUploadManager {
  constructor() {
    this.maxFileSize = 10 * 1024 * 1024; // 10MB default
    this.allowedTypes = {
      image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
      video: ['video/mp4', 'video/mov', 'video/avi', 'video/webm'],
      audio: ['audio/mp3', 'audio/wav', 'audio/m4a']
    };
    this.uploadQueue = [];
    this.activeUploads = new Map();
    this.completedUploads = new Map();
  }

  // Validate file before upload
  validateFile(file, type = 'image', options = {}) {
    const errors = [];

    // Check file size
    const maxSize = options.maxSize || this.maxFileSize;
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${this.formatFileSize(maxSize)}`);
    }

    // Check file type
    const allowedTypes = this.allowedTypes[type] || this.allowedTypes.image;
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Check file name
    if (options.validateName && !/^[a-zA-Z0-9._-]+$/.test(file.name)) {
      errors.push('File name contains invalid characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Compress image before upload
  async compressImage(file, options = {}) {
    return new Promise((resolve, reject) => {
      const {
        maxWidth = 1920,
        maxHeight = 1080,
        quality = 0.8,
        format = 'image/jpeg'
      } = options;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: format,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          format,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Crop image using canvas
  async cropImage(file, cropArea, options = {}) {
    return new Promise((resolve, reject) => {
      const {
        quality = 0.9,
        format = 'image/jpeg'
      } = options;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const { x, y, width, height } = cropArea;

        // Set canvas to crop dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw cropped area
        ctx.drawImage(
          img,
          x, y, width, height,  // Source rectangle
          0, 0, width, height   // Destination rectangle
        );

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const croppedFile = new File([blob], file.name, {
                type: format,
                lastModified: Date.now()
              });
              resolve(croppedFile);
            } else {
              reject(new Error('Failed to crop image'));
            }
          },
          format,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Upload single file
  async uploadFile(file, options = {}) {
    const {
      type = 'image',
      compress = true,
      crop = null,
      onProgress,
      metadata = {}
    } = options;

    // Validate file
    const validation = this.validateFile(file, type, options);
    if (!validation.isValid) {
      throw new ApiError('File validation failed', 400, validation.errors.join(', '));
    }

    // Compress image if requested
    let processedFile = file;
    if (compress && type === 'image') {
      processedFile = await this.compressImage(file, options.compressOptions);
    }

    // Crop image if crop area provided
    if (crop && type === 'image') {
      processedFile = await this.cropImage(processedFile, crop, options.cropOptions);
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', processedFile);
    formData.append('type', type);

    // Add metadata
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });

    // Upload with progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const uploadId = Date.now() + Math.random();

      this.activeUploads.set(uploadId, { file: processedFile, xhr });

      // Track progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete, uploadId);
        }
      };

      // Handle completion
      xhr.onload = () => {
        this.activeUploads.delete(uploadId);

        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            this.completedUploads.set(uploadId, response);
            resolve(response);
          } catch (e) {
            resolve(xhr.responseText);
          }
        } else {
          reject(new ApiError(
            `Upload failed: ${xhr.statusText}`,
            xhr.status,
            'File upload failed. Please try again.'
          ));
        }
      };

      // Handle errors
      xhr.onerror = () => {
        this.activeUploads.delete(uploadId);
        reject(new ApiError(
          'Upload failed',
          0,
          'Network error during file upload.'
        ));
      };

      // Set timeout
      xhr.timeout = 300000; // 5 minutes
      xhr.ontimeout = () => {
        this.activeUploads.delete(uploadId);
        reject(new ApiError(
          'Upload timeout',
          408,
          'Upload took too long. Please try again.'
        ));
      };

      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    });
  }

  // Upload multiple files
  async uploadMultiple(files, options = {}) {
    const results = [];
    const errors = [];

    for (const file of files) {
      try {
        const result = await this.uploadFile(file, options);
        results.push(result);
      } catch (error) {
        errors.push({ file: file.name, error: error.message });
      }
    }

    return {
      successful: results,
      failed: errors,
      total: files.length,
      successCount: results.length,
      errorCount: errors.length
    };
  }

  // Cancel upload
  cancelUpload(uploadId) {
    const upload = this.activeUploads.get(uploadId);
    if (upload && upload.xhr) {
      upload.xhr.abort();
      this.activeUploads.delete(uploadId);
      return true;
    }
    return false;
  }

  // Get upload progress
  getUploadProgress(uploadId) {
    const upload = this.activeUploads.get(uploadId);
    return upload ? upload.progress || 0 : 0;
  }

  // Get active uploads
  getActiveUploads() {
    return Array.from(this.activeUploads.entries()).map(([id, upload]) => ({
      id,
      fileName: upload.file.name,
      fileSize: upload.file.size,
      progress: upload.progress || 0
    }));
  }

  // Get completed uploads
  getCompletedUploads() {
    return Array.from(this.completedUploads.values());
  }

  // Clear completed uploads
  clearCompletedUploads() {
    this.completedUploads.clear();
  }

  // Generate thumbnail
  async generateThumbnail(file, options = {}) {
    const {
      width = 300,
      height = 200,
      quality = 0.7
    } = options;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate dimensions
        const aspectRatio = img.width / img.height;
        let drawWidth = width;
        let drawHeight = height;

        if (aspectRatio > width / height) {
          drawHeight = width / aspectRatio;
        } else {
          drawWidth = height * aspectRatio;
        }

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Draw image centered
        const x = (width - drawWidth) / 2;
        const y = (height - drawHeight) / 2;

        ctx.drawImage(img, x, y, drawWidth, drawHeight);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const thumbnailFile = new File([blob], `thumb_${file.name}`, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(thumbnailFile);
            } else {
              reject(new Error('Failed to generate thumbnail'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Batch upload with queue management
  async uploadBatch(files, options = {}) {
    const {
      maxConcurrent = 3,
      onBatchProgress,
      onFileComplete
    } = options;

    return new Promise((resolve, reject) => {
      const results = [];
      const errors = [];
      let completedCount = 0;
      let activeCount = 0;

      const processNext = async () => {
        if (this.uploadQueue.length === 0) {
          return;
        }

        if (activeCount >= maxConcurrent) {
          return;
        }

        const file = this.uploadQueue.shift();
        activeCount++;

        try {
          const result = await this.uploadFile(file, options);
          results.push(result);

          if (onFileComplete) {
            onFileComplete(file.name, result, 'success');
          }
        } catch (error) {
          errors.push({ file: file.name, error: error.message });

          if (onFileComplete) {
            onFileComplete(file.name, error, 'error');
          }
        }

        completedCount++;
        activeCount--;

        // Update batch progress
        if (onBatchProgress) {
          onBatchProgress(completedCount, files.length);
        }

        // Process next file
        if (completedCount < files.length) {
          processNext();
        } else {
          // All files processed
          resolve({
            successful: results,
            failed: errors,
            total: files.length,
            successCount: results.length,
            errorCount: errors.length
          });
        }
      };

      // Add all files to queue
      this.uploadQueue = [...files];

      // Start processing
      for (let i = 0; i < Math.min(maxConcurrent, files.length); i++) {
        processNext();
      }
    });
  }

  // Drag and drop utilities
  createDropZone(element, options = {}) {
    const {
      onDrop,
      onDragOver,
      onDragLeave,
      acceptedTypes = this.allowedTypes.image
    } = options;

    let dragCounter = 0;

    const handleDragEnter = (e) => {
      e.preventDefault();
      dragCounter++;
      element.classList.add('drag-over');
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter === 0) {
        element.classList.remove('drag-over');
      }
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      if (onDragOver) onDragOver(e);
    };

    const handleDrop = (e) => {
      e.preventDefault();
      dragCounter = 0;
      element.classList.remove('drag-over');

      const files = Array.from(e.dataTransfer.files);

      // Filter by accepted types
      const validFiles = files.filter(file =>
        acceptedTypes.includes(file.type)
      );

      if (onDrop) {
        onDrop(validFiles);
      }
    };

    // Add event listeners
    element.addEventListener('dragenter', handleDragEnter);
    element.addEventListener('dragleave', handleDragLeave);
    element.addEventListener('dragover', handleDragOver);
    element.addEventListener('drop', handleDrop);

    // Return cleanup function
    return () => {
      element.removeEventListener('dragenter', handleDragEnter);
      element.removeEventListener('dragleave', handleDragLeave);
      element.removeEventListener('dragover', handleDragOver);
      element.removeEventListener('drop', handleDrop);
    };
  }

  // File preview generator
  async generatePreview(file) {
    return new Promise((resolve, reject) => {
      const preview = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      };

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          preview.url = e.target.result;
          preview.isImage = true;
          preview.dimensions = this.getImageDimensions(file);
          resolve(preview);
        };
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        preview.isVideo = true;
        preview.icon = '🎥';
        resolve(preview);
      } else if (file.type.startsWith('audio/')) {
        preview.isAudio = true;
        preview.icon = '🎵';
        resolve(preview);
      } else {
        preview.icon = '📄';
        resolve(preview);
      }
    });
  }

  // Get image dimensions
  getImageDimensions(file) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.src = URL.createObjectURL(file);
    });
  }

  // File type detection
  detectFileType(file) {
    const type = file.type;

    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('audio/')) return 'audio';
    if (type.includes('pdf') || type.includes('document') || type.includes('text')) return 'document';

    return 'unknown';
  }

  // File validation utilities
  validateImageDimensions(file, minWidth = 100, minHeight = 100) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const isValid = img.width >= minWidth && img.height >= minHeight;
        resolve({
          isValid,
          width: img.width,
          height: img.height,
          message: isValid ? 'Valid dimensions' : `Image must be at least ${minWidth}x${minHeight}px`
        });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Cleanup resources
  cleanup() {
    // Cancel all active uploads
    for (const [id, upload] of this.activeUploads.entries()) {
      if (upload.xhr) {
        upload.xhr.abort();
      }
    }
    this.activeUploads.clear();

    // Clear preview URLs
    this.completedUploads.forEach(upload => {
      if (upload.previewUrl) {
        URL.revokeObjectURL(upload.previewUrl);
      }
    });
    this.completedUploads.clear();
  }
}

// Create singleton instance
export const fileUploadManager = new FileUploadManager();

// React hooks for file uploads
export const useFileUpload = (options = {}) => {
  const [uploads, setUploads] = React.useState([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [progress, setProgress] = React.useState({});

  const uploadFiles = React.useCallback(async (files) => {
    setIsUploading(true);
    const uploadPromises = files.map(async (file, index) => {
      try {
        const result = await fileUploadManager.uploadFile(file, {
          ...options,
          onProgress: (percent, uploadId) => {
            setProgress(prev => ({
              ...prev,
              [file.name]: { percent, uploadId }
            }));
          }
        });

        return { file: file.name, result, success: true };
      } catch (error) {
        return { file: file.name, error: error.message, success: false };
      }
    });

    const results = await Promise.all(uploadPromises);
    setUploads(results);
    setIsUploading(false);

    return results;
  }, [options]);

  const cancelUpload = React.useCallback((uploadId) => {
    fileUploadManager.cancelUpload(uploadId);
  }, []);

  const clearUploads = React.useCallback(() => {
    setUploads([]);
    setProgress({});
  }, []);

  return {
    uploadFiles,
    cancelUpload,
    clearUploads,
    uploads,
    isUploading,
    progress,
    activeUploads: fileUploadManager.getActiveUploads()
  };
};

// File preview component
export const FilePreview = ({ file, onRemove, className = '' }) => {
  const [preview, setPreview] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fileUploadManager.generatePreview(file).then(setPreview).finally(() => setLoading(false));
  }, [file]);

  if (loading) {
    return (
      <div className={`file-preview loading ${className}`}>
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (preview?.isImage) {
    return (
      <div className={`file-preview image ${className}`}>
        <img src={preview.url} alt={file.name} />
        <div className="file-info">
          <span className="file-name">{file.name}</span>
          <span className="file-size">{fileUploadManager.formatFileSize(file.size)}</span>
        </div>
        {onRemove && (
          <button className="remove-btn" onClick={() => onRemove(file)}>
            ×
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`file-preview document ${className}`}>
      <div className="file-icon">{preview?.icon || '📄'}</div>
      <div className="file-info">
        <span className="file-name">{file.name}</span>
        <span className="file-size">{fileUploadManager.formatFileSize(file.size)}</span>
      </div>
      {onRemove && (
        <button className="remove-btn" onClick={() => onRemove(file)}>
          ×
        </button>
      )}
    </div>
  );
};

// Drag and drop component
export const DragDropZone = ({
  onFilesDrop,
  acceptedTypes = ['image/*'],
  multiple = true,
  className = '',
  children
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const dropRef = React.useRef();

  React.useEffect(() => {
    const cleanup = fileUploadManager.createDropZone(dropRef.current, {
      onDrop: (files) => {
        setIsDragOver(false);
        onFilesDrop(multiple ? files : files.slice(0, 1));
      },
      onDragOver: () => setIsDragOver(true),
      onDragLeave: () => setIsDragOver(false),
      acceptedTypes
    });

    return cleanup;
  }, [onFilesDrop, multiple, acceptedTypes]);

  return (
    <div
      ref={dropRef}
      className={`drag-drop-zone ${isDragOver ? 'drag-over' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default fileUploadManager;

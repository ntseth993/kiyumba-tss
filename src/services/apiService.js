// API Service Layer
// Centralized API handling with fallback support and proper error management

class ApiService {
  constructor() {
    this.baseURL = this.getBaseURL();
    this.useLocalStorage = this.shouldUseLocalStorage();
    this.token = this.getAuthToken();
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  getBaseURL() {
    // Detect environment and return appropriate base URL
    const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost';

    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }

    // Check for localStorage mode first
    if (import.meta.env.VITE_USE_LOCAL_STORAGE === 'true') {
      console.log('🔄 Using localStorage mode - API calls disabled');
      return 'INVALID_API_URL';
    }

    // Fallback URLs for different environments
    if (isProduction) {
      return window.location.origin;
    }

    // Development - try port 4000 first (our server), then fallback to 3000
    const port = import.meta.env.VITE_API_PORT || '4000';
    return `http://localhost:${port}`;
  }

  shouldUseLocalStorage() {
    // Check if we should use localStorage fallback
    return import.meta.env.VITE_USE_LOCAL_STORAGE === 'true' ||
           !this.baseURL ||
           this.baseURL.includes('localhost:5173');
  }

  getAuthToken() {
    return localStorage.getItem('authToken') || null;
  }

  setAuthToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  getHeaders(includeAuth = true) {
    const headers = { ...this.defaultHeaders };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.includeAuth),
      ...options,
    };

    // Remove includeAuth from config as it's not a standard fetch option
    delete config.includeAuth;

    try {
      // If using localStorage, simulate API delay for consistency
      if (this.useLocalStorage) {
        await this.simulateNetworkDelay();
      }

      const response = await fetch(url, config);

      if (!response.ok) {
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          await this.getErrorMessage(response)
        );
      }

      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Network or parsing error
      throw new ApiError(
        error.message || 'Network request failed',
        0,
        'Please check your connection and try again.'
      );
    }
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  async uploadFile(endpoint, file, additionalData = {}, onProgress) {
    const formData = new FormData();

    // Add file
    formData.append('file', file);

    // Add additional data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    const url = `${this.baseURL}${endpoint}`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            onProgress(percentComplete);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
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

      xhr.onerror = () => {
        reject(new ApiError(
          'Upload failed',
          0,
          'Network error during file upload.'
        ));
      };

      xhr.open('POST', url);
      xhr.send(formData);
    });
  }

  // Simulate network delay for localStorage fallback
  async simulateNetworkDelay(min = 100, max = 500) {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  async getErrorMessage(response) {
    try {
      const errorData = await response.json();
      return errorData.message || errorData.error || response.statusText;
    } catch {
      return response.statusText || 'Unknown error occurred';
    }
  }

  // WebSocket/SSE connection for real-time updates
  createEventSource(endpoint, options = {}) {
    const url = `${this.baseURL.replace('http', 'ws')}${endpoint}`;

    try {
      const eventSource = new EventSource(url, options);

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        // Could implement fallback polling here
      };

      return eventSource;
    } catch (error) {
      console.error('Failed to create EventSource:', error);
      return null;
    }
  }

  // Real-time updates via polling fallback
  async startPolling(endpoint, callback, interval = 5000) {
    const poll = async () => {
      try {
        const data = await this.get(endpoint);
        callback(data);
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    // Initial call
    await poll();

    // Set up interval
    const pollInterval = setInterval(poll, interval);

    // Return cleanup function
    return () => clearInterval(pollInterval);
  }
}

// Custom error class for API errors
export class ApiError extends Error {
  constructor(message, status, userMessage) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.userMessage = userMessage;
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Export commonly used API endpoints
export const api = {
  // Authentication
  auth: {
    login: (credentials) => apiService.post('/api/auth/login', credentials),
    register: (userData) => apiService.post('/api/auth/register', userData),
    logout: () => apiService.post('/api/auth/logout'),
    refreshToken: () => apiService.post('/api/auth/refresh'),
    getProfile: () => apiService.get('/api/auth/profile'),
    updateProfile: (data) => apiService.put('/api/auth/profile', data),
  },

  // Posts
  posts: {
    getAll: (params) => apiService.get('/api/posts', { params }),
    getById: (id) => apiService.get(`/api/posts/${id}`),
    create: (data) => apiService.post('/api/posts', data),
    update: (id, data) => apiService.put(`/api/posts/${id}`, data),
    delete: (id) => apiService.delete(`/api/posts/${id}`),
    like: (id) => apiService.post(`/api/posts/${id}/like`),
    unlike: (id) => apiService.delete(`/api/posts/${id}/like`),
  },

  // Comments
  comments: {
    getAll: (postId) => apiService.get(`/api/posts/${postId}/comments`),
    create: (postId, data) => apiService.post(`/api/posts/${postId}/comments`, data),
    update: (postId, commentId, data) => apiService.put(`/api/posts/${postId}/comments/${commentId}`, data),
    delete: (postId, commentId) => apiService.delete(`/api/posts/${postId}/comments/${commentId}`),
  },

  // Notifications
  notifications: {
    getAll: () => apiService.get('/api/notifications'),
    markAsRead: (id) => apiService.patch(`/api/notifications/${id}/read`),
    markAllAsRead: () => apiService.patch('/api/notifications/read-all'),
    delete: (id) => apiService.delete(`/api/notifications/${id}`),
    create: (data) => apiService.post('/api/notifications', data),
  },

  // Users
  users: {
    getAll: () => apiService.get('/api/users'),
    getById: (id) => apiService.get(`/api/users/${id}`),
    update: (id, data) => apiService.put(`/api/users/${id}`, data),
    delete: (id) => apiService.delete(`/api/users/${id}`),
    getStats: () => apiService.get('/api/users/stats'),
  },

  // Applications
  applications: {
    getAll: () => apiService.get('/api/applications'),
    getById: (id) => apiService.get(`/api/applications/${id}`),
    updateStatus: (id, status) => apiService.patch(`/api/applications/${id}/status`, { status }),
    create: (data) => apiService.post('/api/applications', data),
  },

  // File uploads
  upload: {
    image: (file, onProgress) => apiService.uploadFile('/api/upload/image', file, {}, onProgress),
    document: (file, onProgress) => apiService.uploadFile('/api/upload/document', file, {}, onProgress),
    avatar: (file, userId, onProgress) => apiService.uploadFile('/api/upload/avatar', file, { userId }, onProgress),
  },

  // Real-time features
  realtime: {
    subscribe: (endpoint, callback) => {
      // Try EventSource first, fallback to polling
      const eventSource = apiService.createEventSource(endpoint);
      if (eventSource) {
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            callback(data);
          } catch (e) {
            console.error('Error parsing real-time data:', e);
          }
        };
        return eventSource;
      } else {
        return apiService.startPolling(endpoint, callback);
      }
    }
  }
};

// Export default instance
export default apiService;

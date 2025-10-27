// Error Handling and Logging Service
// Comprehensive error management system with logging and user-friendly messages

class ErrorHandler {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // Keep last 1000 errors
    this.isProduction = import.meta.env.PROD;
  }

  // Log error with context
  log(error, context = {}) {
    const errorEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      message: error.message || 'Unknown error',
      stack: error.stack,
      type: error.name || 'Error',
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: this.getCurrentUserId(),
        ...context
      }
    };

    // Add to local logs
    this.logs.unshift(errorEntry);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Store in localStorage for persistence
    localStorage.setItem('errorLogs', JSON.stringify(this.logs));

    // Console logging based on environment
    if (this.isProduction) {
      console.error('Error:', errorEntry);
    } else {
      console.error('Development Error:', errorEntry);
    }

    // In production, send to logging service
    if (this.isProduction && import.meta.env.VITE_ERROR_LOGGING_URL) {
      this.sendToLoggingService(errorEntry);
    }

    return errorEntry;
  }

  // Handle API errors
  handleApiError(error, context = {}) {
    let userMessage = 'An unexpected error occurred. Please try again.';
    let statusCode = 500;

    if (error instanceof ApiError) {
      userMessage = error.userMessage || userMessage;
      statusCode = error.status || 500;
    } else if (error.response) {
      // Handle HTTP response errors
      statusCode = error.response.status;
      switch (statusCode) {
        case 400:
          userMessage = 'Invalid request. Please check your input.';
          break;
        case 401:
          userMessage = 'You are not authorized to perform this action.';
          break;
        case 403:
          userMessage = 'Access denied. Please contact your administrator.';
          break;
        case 404:
          userMessage = 'The requested resource was not found.';
          break;
        case 429:
          userMessage = 'Too many requests. Please wait a moment and try again.';
          break;
        case 500:
          userMessage = 'Server error. Please try again later.';
          break;
        case 503:
          userMessage = 'Service temporarily unavailable. Please try again later.';
          break;
        default:
          userMessage = `Server error (${statusCode}). Please try again.`;
      }
    } else if (error.code === 'NETWORK_ERROR') {
      userMessage = 'Network connection error. Please check your internet connection.';
    }

    const enhancedContext = {
      ...context,
      statusCode,
      endpoint: context.endpoint || 'unknown',
      method: context.method || 'unknown'
    };

    this.log(error, enhancedContext);

    return {
      message: userMessage,
      statusCode,
      originalError: error
    };
  }

  // Handle validation errors
  handleValidationError(errors, context = {}) {
    const errorMessages = Object.values(errors).flat();
    const userMessage = errorMessages.length > 0
      ? `Please fix the following: ${errorMessages.join(', ')}`
      : 'Please check your input and try again.';

    this.log(new Error('Validation failed'), {
      ...context,
      validationErrors: errors,
      message: userMessage
    });

    return {
      message: userMessage,
      validationErrors: errors
    };
  }

  // Handle authentication errors
  handleAuthError(error, context = {}) {
    let userMessage = 'Authentication failed. Please log in again.';

    if (error.message?.includes('token')) {
      userMessage = 'Your session has expired. Please log in again.';
    } else if (error.message?.includes('credentials')) {
      userMessage = 'Invalid username or password. Please try again.';
    }

    this.log(error, { ...context, type: 'authentication' });

    return {
      message: userMessage,
      requiresLogin: true
    };
  }

  // Handle network errors
  handleNetworkError(error, context = {}) {
    const userMessage = 'Network connection error. Please check your internet connection and try again.';

    this.log(error, { ...context, type: 'network' });

    return {
      message: userMessage,
      isNetworkError: true
    };
  }

  // Get current user ID for error context
  getCurrentUserId() {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      return user.id || null;
    } catch {
      return null;
    }
  }

  // Send error to external logging service
  async sendToLoggingService(errorEntry) {
    try {
      await fetch(import.meta.env.VITE_ERROR_LOGGING_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorEntry)
      });
    } catch (loggingError) {
      console.error('Failed to send error to logging service:', loggingError);
    }
  }

  // Get error logs (for admin/debugging)
  getLogs(filters = {}) {
    let filteredLogs = [...this.logs];

    if (filters.type) {
      filteredLogs = filteredLogs.filter(log => log.type === filters.type);
    }

    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => log.context.userId === filters.userId);
    }

    if (filters.dateFrom) {
      filteredLogs = filteredLogs.filter(log =>
        new Date(log.timestamp) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filteredLogs = filteredLogs.filter(log =>
        new Date(log.timestamp) <= new Date(filters.dateTo)
      );
    }

    return filteredLogs;
  }

  // Clear error logs
  clearLogs() {
    this.logs = [];
    localStorage.removeItem('errorLogs');
  }

  // Export logs for debugging
  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }

  // Initialize error handler
  init() {
    // Load existing logs from localStorage
    const storedLogs = localStorage.getItem('errorLogs');
    if (storedLogs) {
      try {
        this.logs = JSON.parse(storedLogs);
      } catch (error) {
        console.error('Error loading stored logs:', error);
        this.logs = [];
      }
    }

    // Set up global error handlers
    this.setupGlobalErrorHandlers();

    console.log('Error handler initialized');
  }

  // Set up global error handlers
  setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.log(new Error(event.reason), {
        type: 'unhandled_promise_rejection',
        context: { promise: event.promise }
      });

      // Prevent the default browser behavior
      event.preventDefault();
    });

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      this.log(event.error, {
        type: 'javascript_error',
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });

    // Handle network errors
    window.addEventListener('offline', () => {
      this.log(new Error('Network connection lost'), { type: 'network_offline' });
    });

    window.addEventListener('online', () => {
      this.log(new Error('Network connection restored'), { type: 'network_online' });
    });
  }
}

// Error boundary component for React
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    errorHandler.log(error, {
      componentStack: errorInfo.componentStack,
      type: 'react_error_boundary'
    });

    this.setState({ error });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-container">
            <h2>Something went wrong</h2>
            <p>We're sorry, but something unexpected happened.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Reload Page
            </button>
            {this.props.fallback && this.props.fallback(this.state.error)}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Toast notification system for user feedback
export class ToastManager {
  constructor() {
    this.toasts = [];
    this.listeners = new Set();
  }

  // Show toast notification
  show(toast) {
    const toastId = Date.now() + Math.random();
    const newToast = {
      id: toastId,
      type: toast.type || 'info', // success, error, warning, info
      title: toast.title || '',
      message: toast.message || '',
      duration: toast.duration || 5000,
      timestamp: Date.now()
    };

    this.toasts.push(newToast);
    this.notifyListeners();

    // Auto remove after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        this.remove(toastId);
      }, newToast.duration);
    }

    return toastId;
  }

  // Remove toast
  remove(toastId) {
    this.toasts = this.toasts.filter(t => t.id !== toastId);
    this.notifyListeners();
  }

  // Clear all toasts
  clear() {
    this.toasts = [];
    this.notifyListeners();
  }

  // Subscribe to toast changes
  subscribe(callback) {
    this.listeners.add(callback);

    // Return unsubscribe function
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(callback => callback([...this.toasts]));
  }

  // Convenience methods
  success(message, title = 'Success') {
    return this.show({ type: 'success', title, message });
  }

  error(message, title = 'Error') {
    return this.show({ type: 'error', title, message, duration: 7000 });
  }

  warning(message, title = 'Warning') {
    return this.show({ type: 'warning', title, message, duration: 6000 });
  }

  info(message, title = 'Info') {
    return this.show({ type: 'info', title, message });
  }
}

// Create singleton instances
export const errorHandler = new ErrorHandler();
export const toastManager = new ToastManager();

// Initialize error handler
errorHandler.init();

// Export ApiError class (already defined in apiService.js)
export { ApiError } from './apiService';

// Utility functions for common error scenarios
export const errorUtils = {
  // Handle form submission errors
  handleFormError: (error, formData) => {
    const handled = errorHandler.handleApiError(error, {
      type: 'form_submission',
      formData: { ...formData, password: '[REDACTED]' } // Don't log passwords
    });

    toastManager.error(handled.message);
    return handled;
  },

  // Handle authentication errors
  handleAuthError: (error) => {
    const handled = errorHandler.handleAuthError(error, {
      type: 'authentication'
    });

    if (handled.requiresLogin) {
      // Clear current user and redirect to login
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }

    toastManager.error(handled.message);
    return handled;
  },

  // Handle network errors
  handleNetworkError: (error, context) => {
    const handled = errorHandler.handleNetworkError(error, context);

    if (handled.isNetworkError) {
      toastManager.warning(handled.message);
    }

    return handled;
  },

  // Show loading state
  showLoading: (message = 'Loading...') => {
    return toastManager.info(message, 'Loading');
  },

  // Hide loading and show success
  showSuccess: (message, title = 'Success') => {
    toastManager.success(message, title);
  },

  // Show error with retry option
  showErrorWithRetry: (message, retryCallback) => {
    const toastId = toastManager.error(message, 'Error');

    // Add retry button to toast (if using a toast component)
    return toastId;
  }
};

export default errorHandler;

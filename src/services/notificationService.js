// Enhanced Notification Service with Real-time Support
// Manages in-app notifications, alerts, and reminders with real-time updates

import { apiService, ApiError } from './apiService';

const useLocalStorage = import.meta.env.VITE_USE_LOCAL_STORAGE === 'true';

class RealTimeNotificationManager {
  constructor() {
    this.eventSource = null;
    this.pollInterval = null;
    this.listeners = new Set();
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Subscribe to real-time notifications
  subscribe(userId, callback) {
    this.listeners.add(callback);

    if (this.isConnected) {
      return () => this.unsubscribe(callback);
    }

    this.connect(userId);
    return () => this.unsubscribe(callback);
  }

  // Unsubscribe from notifications
  unsubscribe(callback) {
    this.listeners.delete(callback);

    if (this.listeners.size === 0) {
      this.disconnect();
    }
  }

  // Connect to real-time notifications
  async connect(userId) {
    if (this.isConnected) return;

    try {
      // Try EventSource first (modern browsers)
      if (this.supportsEventSource()) {
        this.connectEventSource(userId);
      } else {
        // Fallback to polling
        this.connectPolling(userId);
      }
    } catch (error) {
      console.error('Failed to connect to real-time notifications:', error);
      this.connectPolling(userId);
    }
  }

  // Check if EventSource is supported
  supportsEventSource() {
    return typeof EventSource !== 'undefined';
  }

  // Connect using EventSource
  connectEventSource(userId) {
    try {
      this.eventSource = new EventSource(`/api/notifications/stream?userId=${userId}`);

      this.eventSource.onopen = () => {
        console.log('Connected to notification stream');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);
          this.notifyListeners(notification);
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        this.isConnected = false;
        this.handleReconnection(userId);
      };

    } catch (error) {
      console.error('Failed to create EventSource:', error);
      this.connectPolling(userId);
    }
  }

  // Connect using polling fallback
  connectPolling(userId) {
    console.log('Using polling fallback for notifications');

    const poll = async () => {
      try {
        const notifications = await this.getNotifications();
        this.notifyListeners({ type: 'batch', data: notifications });
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    // Initial poll
    poll();

    // Set up polling interval (every 30 seconds)
    this.pollInterval = setInterval(poll, 30000);

    this.isConnected = true;
  }

  // Handle reconnection logic
  handleReconnection(userId) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);

      setTimeout(() => {
        this.disconnect();
        this.connect(userId);
      }, 5000 * this.reconnectAttempts); // Exponential backoff
    } else {
      console.log('Max reconnection attempts reached, using polling fallback');
      this.connectPolling(userId);
    }
  }

  // Notify all listeners
  notifyListeners(data) {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  // Disconnect from real-time updates
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    this.isConnected = false;
  }
}

// Create singleton instance for real-time notifications
const realTimeManager = new RealTimeNotificationManager();

export const notificationService = {
  // Initialize with sample notifications for localStorage mode
  initializeNotifications() {
    const sampleNotifications = [
      {
        id: 'notif-001',
        type: 'payment',
        title: 'Payment Reminder',
        message: 'Your Term 2 payment is due in 5 days. Please make a payment to avoid late fees.',
        priority: 'high',
        read: false,
        timestamp: new Date().toISOString(),
        actionUrl: '/payments',
        userId: null
      },
      {
        id: 'notif-002',
        type: 'attendance',
        title: 'Low Attendance Alert',
        message: 'Your attendance has dropped to 72%. Please improve to avoid academic penalties.',
        priority: 'high',
        read: false,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        actionUrl: '/attendance',
        userId: null
      },
      {
        id: 'notif-003',
        type: 'exam',
        title: 'Upcoming Exam',
        message: 'Mathematics final exam is scheduled for next Monday at 9:00 AM.',
        priority: 'medium',
        read: false,
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        actionUrl: '/exams',
        userId: null
      },
      {
        id: 'notif-004',
        type: 'report',
        title: 'Report Card Available',
        message: 'Your Term 1 report card is now available for download.',
        priority: 'medium',
        read: true,
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        actionUrl: '/reports',
        userId: null
      },
      {
        id: 'notif-005',
        type: 'announcement',
        title: 'School Holiday',
        message: 'School will be closed on Friday for national holiday.',
        priority: 'low',
        read: true,
        timestamp: new Date(Date.now() - 345600000).toISOString(),
        actionUrl: null,
        userId: null
      }
    ];

    localStorage.setItem('notifications', JSON.stringify(sampleNotifications));
    return sampleNotifications;
  },

  // Get all notifications
  async getAllNotifications() {
    if (useLocalStorage) {
      const notifications = localStorage.getItem('notifications');
      return notifications ? JSON.parse(notifications) : this.initializeNotifications();
    }

    try {
      return await apiService.get('/api/notifications');
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fallback to localStorage when API fails
      const notifications = localStorage.getItem('notifications');
      return notifications ? JSON.parse(notifications) : this.initializeNotifications();
    }
  },

  // Get notifications for specific user
  async getUserNotifications(userId) {
    if (useLocalStorage) {
      // Fix: Get notifications from localStorage properly
      const notifications = localStorage.getItem('notifications');
      const allNotifications = notifications ? JSON.parse(notifications) : this.initializeNotifications();
      return allNotifications.filter(n => !n.userId || n.userId === userId);
    }

    try {
      return await apiService.get(`/api/notifications/user/${userId}`);
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw new ApiError('Failed to fetch notifications', 500, 'Unable to load your notifications. Please try again.');
    }
  },

  // Get unread count
  async getUnreadCount(userId) {
    if (useLocalStorage) {
      const notifications = await this.getUserNotifications(userId);
      return notifications.filter(n => !n.read).length;
    }

    try {
      const count = await apiService.get(`/api/notifications/unread-count/${userId}`);
      return count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      // Fallback to localStorage
      const notifications = await this.getUserNotifications(userId);
      return notifications.filter(n => !n.read).length;
    }
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    if (useLocalStorage) {
      const notifications = await this.getAllNotifications();
      const updated = notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      localStorage.setItem('notifications', JSON.stringify(updated));
      return true;
    }

    try {
      await apiService.patch(`/api/notifications/${notificationId}/read`);
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Fallback to localStorage
      const notifications = await this.getAllNotifications();
      const updated = notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      localStorage.setItem('notifications', JSON.stringify(updated));
      return true;
    }
  },

  // Mark all as read
  async markAllAsRead(userId) {
    if (useLocalStorage) {
      const notifications = await this.getAllNotifications();
      const updated = notifications.map(n => ({ ...n, read: true }));
      localStorage.setItem('notifications', JSON.stringify(updated));
      return true;
    }

    try {
      await apiService.patch(`/api/notifications/user/${userId}/read-all`);
      return true;
    } catch (error) {
      console.error('Error marking all as read:', error);
      // Fallback to localStorage
      const notifications = await this.getAllNotifications();
      const updated = notifications.map(n => ({ ...n, read: true }));
      localStorage.setItem('notifications', JSON.stringify(updated));
      return true;
    }
  },

  // Delete notification
  async deleteNotification(notificationId) {
    if (useLocalStorage) {
      const notifications = await this.getAllNotifications();
      const updated = notifications.filter(n => n.id !== notificationId);
      localStorage.setItem('notifications', JSON.stringify(updated));
      return true;
    }

    try {
      await apiService.delete(`/api/notifications/${notificationId}`);
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Fallback to localStorage
      const notifications = await this.getAllNotifications();
      const updated = notifications.filter(n => n.id !== notificationId);
      localStorage.setItem('notifications', JSON.stringify(updated));
      return true;
    }
  },

  // Create new notification
  async createNotification(notification) {
    if (useLocalStorage) {
      const notifications = await this.getAllNotifications();
      const newNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        read: false,
        timestamp: new Date().toISOString(),
        ...notification
      };
      notifications.unshift(newNotification);
      localStorage.setItem('notifications', JSON.stringify(notifications));
      return newNotification;
    }

    try {
      return await apiService.post('/api/notifications', notification);
    } catch (error) {
      console.error('Error creating notification:', error);
      // Fallback to localStorage
      const notifications = await this.getAllNotifications();
      const newNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        read: false,
        timestamp: new Date().toISOString(),
        ...notification
      };
      notifications.unshift(newNotification);
      localStorage.setItem('notifications', JSON.stringify(notifications));
      return newNotification;
    }
  },

  // Real-time subscription
  subscribeToNotifications(userId, callback) {
    return realTimeManager.subscribe(userId, callback);
  },

  // Get notifications by type
  async getNotificationsByType(userId, type) {
    const notifications = await this.getUserNotifications(userId);
    return notifications.filter(n => n.type === type);
  },

  // Get notifications by priority
  async getNotificationsByPriority(userId, priority) {
    const notifications = await this.getUserNotifications(userId);
    return notifications.filter(n => n.priority === priority);
  },

  // Send various types of notifications
  async sendPaymentReminder(studentId, amount, dueDate) {
    return this.createNotification({
      type: 'payment',
      title: 'Payment Reminder',
      message: `Payment of ${amount} is due on ${dueDate}. Please make a payment soon.`,
      priority: 'high',
      actionUrl: '/payments',
      userId: studentId
    });
  },

  async sendAttendanceAlert(studentId, attendanceRate) {
    return this.createNotification({
      type: 'attendance',
      title: 'Attendance Alert',
      message: `Your attendance is ${attendanceRate}%. Please improve to meet the minimum requirement of 75%.`,
      priority: 'high',
      actionUrl: '/attendance',
      userId: studentId
    });
  },

  async sendExamReminder(studentId, examName, examDate) {
    return this.createNotification({
      type: 'exam',
      title: 'Exam Reminder',
      message: `${examName} is scheduled for ${examDate}. Good luck!`,
      priority: 'medium',
      actionUrl: '/exams',
      userId: studentId
    });
  },

  async sendReportCardNotification(studentId, term) {
    return this.createNotification({
      type: 'report',
      title: 'Report Card Available',
      message: `Your ${term} report card is now available for download.`,
      priority: 'medium',
      actionUrl: '/reports',
      userId: studentId
    });
  },

  async sendAnnouncement(title, message, priority = 'low', targetUsers = null) {
    return this.createNotification({
      type: 'announcement',
      title,
      message,
      priority,
      actionUrl: null,
      userId: targetUsers
    });
  },

  // Social engagement notifications
  async sendLikeNotification(postId, likerName, authorId) {
    return this.createNotification({
      type: 'like',
      title: 'New Like on Your Post',
      message: `${likerName} liked your post.`,
      priority: 'low',
      actionUrl: `/posts/${postId}`,
      metadata: { postId, likerName, type: 'like' },
      userId: authorId
    });
  },

  async sendCommentNotification(postId, commenterName, authorId, commentPreview) {
    return this.createNotification({
      type: 'comment',
      title: 'New Comment on Your Post',
      message: `${commenterName}: "${commentPreview.substring(0, 50)}${commentPreview.length > 50 ? '...' : ''}"`,
      priority: 'medium',
      actionUrl: `/posts/${postId}`,
      metadata: { postId, commenterName, commentPreview, type: 'comment' },
      userId: authorId
    });
  },

  // Get engagement notifications
  async getEngagementNotifications(userId) {
    const notifications = await this.getUserNotifications(userId);
    return notifications.filter(n =>
      n.type === 'like' || n.type === 'share' || n.type === 'comment'
    );
  },

  // Get activity summary
  async getActivitySummary(userId, days = 7) {
    const notifications = await this.getUserNotifications(userId);
    const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));

    const recentActivity = notifications.filter(n =>
      new Date(n.timestamp) >= cutoffDate &&
      (n.type === 'like' || n.type === 'share' || n.type === 'comment')
    );

    return {
      totalEngagement: recentActivity.length,
      likes: recentActivity.filter(n => n.type === 'like').length,
      shares: recentActivity.filter(n => n.type === 'share').length,
      comments: recentActivity.filter(n => n.type === 'comment').length
    };
  },

  // Clear all notifications
  async clearAllNotifications(userId) {
    if (useLocalStorage) {
      localStorage.removeItem('notifications');
      this.initializeNotifications(); // Reinitialize with sample data
      return true;
    }

    try {
      await apiService.delete(`/api/notifications/user/${userId}`);
      return true;
    } catch (error) {
      console.error('Error clearing notifications:', error);
      // Fallback to localStorage
      localStorage.removeItem('notifications');
      this.initializeNotifications(); // Reinitialize with sample data
      return true;
    }
  },

  // Get notification statistics
  async getNotificationStats(userId) {
    const notifications = await this.getUserNotifications(userId);

    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      highPriority: notifications.filter(n => n.priority === 'high').length,
      mediumPriority: notifications.filter(n => n.priority === 'medium').length,
      lowPriority: notifications.filter(n => n.priority === 'low').length
    };
  },

  // Get current user ID from auth context or localStorage
  getCurrentUserId() {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      return user.id || null;
    } catch {
      return null;
    }
  }
};

export default notificationService;

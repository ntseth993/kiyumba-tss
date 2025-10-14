// Notification Service
// Manages in-app notifications, alerts, and reminders

export const notificationService = {
  // Get all notifications from localStorage
  getAllNotifications() {
    const notifications = localStorage.getItem('notifications');
    return notifications ? JSON.parse(notifications) : this.initializeNotifications();
  },

  // Initialize with sample notifications
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
        actionUrl: '/payments'
      },
      {
        id: 'notif-002',
        type: 'attendance',
        title: 'Low Attendance Alert',
        message: 'Your attendance has dropped to 72%. Please improve to avoid academic penalties.',
        priority: 'high',
        read: false,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        actionUrl: '/attendance'
      },
      {
        id: 'notif-003',
        type: 'exam',
        title: 'Upcoming Exam',
        message: 'Mathematics final exam is scheduled for next Monday at 9:00 AM.',
        priority: 'medium',
        read: false,
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        actionUrl: '/exams'
      },
      {
        id: 'notif-004',
        type: 'report',
        title: 'Report Card Available',
        message: 'Your Term 1 report card is now available for download.',
        priority: 'medium',
        read: true,
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        actionUrl: '/reports'
      },
      {
        id: 'notif-005',
        type: 'announcement',
        title: 'School Holiday',
        message: 'School will be closed on Friday for national holiday.',
        priority: 'low',
        read: true,
        timestamp: new Date(Date.now() - 345600000).toISOString(),
        actionUrl: null
      }
    ];

    localStorage.setItem('notifications', JSON.stringify(sampleNotifications));
    return sampleNotifications;
  },

  // Get notifications for specific user
  getUserNotifications(userId) {
    const allNotifications = this.getAllNotifications();
    // In a real app, filter by userId
    return allNotifications;
  },

  // Get unread count
  getUnreadCount(userId) {
    const notifications = this.getUserNotifications(userId);
    return notifications.filter(n => !n.read).length;
  },

  // Mark notification as read
  markAsRead(notificationId) {
    const notifications = this.getAllNotifications();
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem('notifications', JSON.stringify(updated));
    return true;
  },

  // Mark all as read
  markAllAsRead(userId) {
    const notifications = this.getAllNotifications();
    const updated = notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem('notifications', JSON.stringify(updated));
    return true;
  },

  // Delete notification
  deleteNotification(notificationId) {
    const notifications = this.getAllNotifications();
    const updated = notifications.filter(n => n.id !== notificationId);
    localStorage.setItem('notifications', JSON.stringify(updated));
    return true;
  },

  // Create new notification
  createNotification(notification) {
    const notifications = this.getAllNotifications();
    const newNotification = {
      id: `notif-${Date.now()}`,
      read: false,
      timestamp: new Date().toISOString(),
      ...notification
    };
    notifications.unshift(newNotification);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    return newNotification;
  },

  // Send payment reminder
  sendPaymentReminder(studentId, amount, dueDate) {
    return this.createNotification({
      type: 'payment',
      title: 'Payment Reminder',
      message: `Payment of ${amount} is due on ${dueDate}. Please make a payment soon.`,
      priority: 'high',
      actionUrl: '/payments'
    });
  },

  // Send attendance alert
  sendAttendanceAlert(studentId, attendanceRate) {
    return this.createNotification({
      type: 'attendance',
      title: 'Attendance Alert',
      message: `Your attendance is ${attendanceRate}%. Please improve to meet the minimum requirement of 75%.`,
      priority: 'high',
      actionUrl: '/attendance'
    });
  },

  // Send exam reminder
  sendExamReminder(studentId, examName, examDate) {
    return this.createNotification({
      type: 'exam',
      title: 'Exam Reminder',
      message: `${examName} is scheduled for ${examDate}. Good luck!`,
      priority: 'medium',
      actionUrl: '/exams'
    });
  },

  // Send report card notification
  sendReportCardNotification(studentId, term) {
    return this.createNotification({
      type: 'report',
      title: 'Report Card Available',
      message: `Your ${term} report card is now available for download.`,
      priority: 'medium',
      actionUrl: '/reports'
    });
  },

  // Send general announcement
  sendAnnouncement(title, message, priority = 'low') {
    return this.createNotification({
      type: 'announcement',
      title,
      message,
      priority,
      actionUrl: null
    });
  },

  // Get notifications by type
  getNotificationsByType(userId, type) {
    const notifications = this.getUserNotifications(userId);
    return notifications.filter(n => n.type === type);
  },

  // Get notifications by priority
  getNotificationsByPriority(userId, priority) {
    const notifications = this.getUserNotifications(userId);
    return notifications.filter(n => n.priority === priority);
  },

  // Clear all notifications
  clearAllNotifications() {
    localStorage.removeItem('notifications');
    return true;
  }
};

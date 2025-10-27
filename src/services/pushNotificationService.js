// Push Notification Service
// Handles browser notifications, service workers, and mobile push notifications

class PushNotificationManager {
  constructor() {
    this.isSupported = 'Notification' in window;
    this.isGranted = false;
    this.serviceWorker = null;
    this.subscription = null;
    this.listeners = new Set();
  }

  // Initialize push notifications
  async init() {
    if (!this.isSupported) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      // Check current permission
      this.isGranted = Notification.permission === 'granted';

      if (Notification.permission === 'default') {
        // Request permission
        const permission = await Notification.requestPermission();
        this.isGranted = permission === 'granted';
      }

      if (this.isGranted) {
        // Register service worker for push notifications
        await this.registerServiceWorker();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  // Register service worker
  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers not supported');
      return;
    }

    try {
      this.serviceWorker = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', this.serviceWorker);

      // Get existing push subscription
      this.subscription = await this.serviceWorker.pushManager.getSubscription();

      return this.serviceWorker;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  // Subscribe to push notifications
  async subscribe(vapidPublicKey) {
    if (!this.serviceWorker) {
      await this.registerServiceWorker();
    }

    try {
      this.subscription = await this.serviceWorker.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });

      console.log('Push subscription:', this.subscription);

      // Send subscription to server
      await this.sendSubscriptionToServer();

      return this.subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      throw error;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe() {
    if (this.subscription) {
      await this.subscription.unsubscribe();
      this.subscription = null;

      // Remove from server
      await this.removeSubscriptionFromServer();
    }
  }

  // Send subscription to server
  async sendSubscriptionToServer() {
    if (!this.subscription) return;

    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: this.subscription.toJSON()
        })
      });
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
    }
  }

  // Remove subscription from server
  async removeSubscriptionFromServer() {
    try {
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: this.subscription?.toJSON()
        })
      });
    } catch (error) {
      console.error('Failed to remove subscription from server:', error);
    }
  }

  // Show browser notification
  showNotification(title, options = {}) {
    if (!this.isGranted) {
      console.warn('Notification permission not granted');
      return null;
    }

    const defaultOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'kiyumba-notification',
      requireInteraction: false,
      silent: false,
      ...options
    };

    try {
      const notification = new Notification(title, defaultOptions);

      // Auto close after 5 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      // Handle click events
      notification.onclick = () => {
        window.focus();

        if (options.onClick) {
          options.onClick(notification);
        }

        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return null;
    }
  }

  // Show different types of notifications
  showInfo(title, message, options = {}) {
    return this.showNotification(title, {
      body: message,
      icon: '/favicon.ico',
      ...options
    });
  }

  showSuccess(title, message, options = {}) {
    return this.showNotification(title, {
      body: message,
      icon: '/favicon.ico',
      ...options
    });
  }

  showWarning(title, message, options = {}) {
    return this.showNotification(title, {
      body: message,
      icon: '/favicon.ico',
      ...options
    });
  }

  showError(title, message, options = {}) {
    return this.showNotification(title, {
      body: message,
      icon: '/favicon.ico',
      requireInteraction: true,
      ...options
    });
  }

  // Show notification for different event types
  showNewMessage(sender, message) {
    return this.showNotification(`New message from ${sender}`, {
      body: message.length > 100 ? message.substring(0, 100) + '...' : message,
      icon: '/favicon.ico',
      tag: 'new-message',
      data: { type: 'message', sender }
    });
  }

  showAssignmentDue(assignmentName, dueDate) {
    return this.showNotification('Assignment Due Soon', {
      body: `${assignmentName} is due on ${dueDate}`,
      icon: '/favicon.ico',
      tag: 'assignment-due',
      requireInteraction: true,
      data: { type: 'assignment', assignmentName, dueDate }
    });
  }

  showGradeAvailable(subject, grade) {
    return this.showNotification('Grade Available', {
      body: `Your ${subject} grade is now available: ${grade}`,
      icon: '/favicon.ico',
      tag: 'grade-available',
      data: { type: 'grade', subject, grade }
    });
  }

  showEventReminder(eventName, eventTime) {
    return this.showNotification('Event Reminder', {
      body: `${eventName} starts at ${eventTime}`,
      icon: '/favicon.ico',
      tag: 'event-reminder',
      data: { type: 'event', eventName, eventTime }
    });
  }

  // Schedule notification for later
  scheduleNotification(title, options = {}, delay) {
    setTimeout(() => {
      this.showNotification(title, options);
    }, delay);
  }

  // Convert VAPID key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Get notification settings
  getSettings() {
    return {
      isSupported: this.isSupported,
      isGranted: this.isGranted,
      isSubscribed: !!this.subscription,
      serviceWorkerRegistered: !!this.serviceWorker
    };
  }

  // Update notification settings
  async updateSettings(settings) {
    if (settings.enabled !== undefined) {
      if (settings.enabled && !this.isGranted) {
        await this.init();
      } else if (!settings.enabled && this.subscription) {
        await this.unsubscribe();
      }
    }

    // Store settings in localStorage
    localStorage.setItem('notificationSettings', JSON.stringify({
      ...this.getSettings(),
      ...settings
    }));
  }

  // Load settings from localStorage
  loadSettings() {
    const stored = localStorage.getItem('notificationSettings');
    if (stored) {
      return JSON.parse(stored);
    }
    return this.getSettings();
  }

  // Test notification
  testNotification() {
    return this.showNotification('Test Notification', {
      body: 'This is a test notification from Kiyumba School.',
      icon: '/favicon.ico'
    });
  }
}

// React hook for push notifications
export const usePushNotifications = () => {
  const [settings, setSettings] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    pushNotificationManager.init().then(() => {
      setSettings(pushNotificationManager.getSettings());
      setIsLoading(false);
    });
  }, []);

  const requestPermission = React.useCallback(async () => {
    setIsLoading(true);
    await pushNotificationManager.init();
    setSettings(pushNotificationManager.getSettings());
    setIsLoading(false);
  }, []);

  const subscribe = React.useCallback(async (vapidPublicKey) => {
    setIsLoading(true);
    try {
      await pushNotificationManager.subscribe(vapidPublicKey);
      setSettings(pushNotificationManager.getSettings());
    } catch (error) {
      console.error('Subscription failed:', error);
    }
    setIsLoading(false);
  }, []);

  const unsubscribe = React.useCallback(async () => {
    setIsLoading(true);
    await pushNotificationManager.unsubscribe();
    setSettings(pushNotificationManager.getSettings());
    setIsLoading(false);
  }, []);

  const showNotification = React.useCallback((title, options) => {
    return pushNotificationManager.showNotification(title, options);
  }, []);

  const updateSettings = React.useCallback(async (newSettings) => {
    await pushNotificationManager.updateSettings(newSettings);
    setSettings(pushNotificationManager.getSettings());
  }, []);

  return {
    settings,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification,
    updateSettings,
    testNotification: pushNotificationManager.testNotification.bind(pushNotificationManager)
  };
};

// Notification preferences component
export const NotificationPreferences = ({ onClose }) => {
  const { settings, updateSettings, testNotification } = usePushNotifications();
  const [preferences, setPreferences] = React.useState({
    messages: true,
    assignments: true,
    grades: true,
    events: true,
    announcements: true,
    sound: true,
    desktop: true
  });

  React.useEffect(() => {
    const stored = localStorage.getItem('notificationPreferences');
    if (stored) {
      setPreferences(JSON.parse(stored));
    }
  }, []);

  const handlePreferenceChange = (key, value) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    localStorage.setItem('notificationPreferences', JSON.stringify(newPreferences));
  };

  return (
    <div className="notification-preferences">
      <div className="preferences-header">
        <h3>Notification Preferences</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="preferences-content">
        <div className="preference-group">
          <h4>Notification Types</h4>
          <label className="preference-item">
            <input
              type="checkbox"
              checked={preferences.messages}
              onChange={(e) => handlePreferenceChange('messages', e.target.checked)}
            />
            <span>New Messages</span>
          </label>

          <label className="preference-item">
            <input
              type="checkbox"
              checked={preferences.assignments}
              onChange={(e) => handlePreferenceChange('assignments', e.target.checked)}
            />
            <span>Assignment Reminders</span>
          </label>

          <label className="preference-item">
            <input
              type="checkbox"
              checked={preferences.grades}
              onChange={(e) => handlePreferenceChange('grades', e.target.checked)}
            />
            <span>Grade Updates</span>
          </label>

          <label className="preference-item">
            <input
              type="checkbox"
              checked={preferences.events}
              onChange={(e) => handlePreferenceChange('events', e.target.checked)}
            />
            <span>Event Reminders</span>
          </label>

          <label className="preference-item">
            <input
              type="checkbox"
              checked={preferences.announcements}
              onChange={(e) => handlePreferenceChange('announcements', e.target.checked)}
            />
            <span>School Announcements</span>
          </label>
        </div>

        <div className="preference-group">
          <h4>Delivery Options</h4>
          <label className="preference-item">
            <input
              type="checkbox"
              checked={preferences.desktop}
              onChange={(e) => handlePreferenceChange('desktop', e.target.checked)}
            />
            <span>Desktop Notifications</span>
          </label>

          <label className="preference-item">
            <input
              type="checkbox"
              checked={preferences.sound}
              onChange={(e) => handlePreferenceChange('sound', e.target.checked)}
            />
            <span>Sound Notifications</span>
          </label>
        </div>

        <div className="preferences-actions">
          <button onClick={testNotification} className="btn btn-outline">
            Test Notification
          </button>
          <button onClick={onClose} className="btn btn-primary">
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

// Service Worker for background push notifications
export const createServiceWorker = () => {
  return `
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('Push received:', event);

  let notificationData = {
    title: 'Kiyumba School',
    body: 'You have a new notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'kiyumba-notification'
  };

  if (event.data) {
    try {
      notificationData = { ...notificationData, ...event.data.json() };
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: notificationData.requireInteraction || false,
      silent: notificationData.silent || false
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }

      // Open app if not already open
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
  `.trim();
};

// Create and register service worker
export const registerPushServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('Push Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

// Create singleton instance
export const pushNotificationManager = new PushNotificationManager();

export default pushNotificationManager;

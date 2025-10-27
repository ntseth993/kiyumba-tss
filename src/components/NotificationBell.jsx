import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, AlertCircle, Calendar, DollarSign, FileText, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import './NotificationBell.css';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();

    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Click outside to close
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user ID
      const currentUserId = notificationService.getCurrentUserId();

      // Use async API calls with user ID
      const [allNotifications, unreadCountResult] = await Promise.all([
        notificationService.getUserNotifications(currentUserId),
        notificationService.getUnreadCount(currentUserId)
      ]);

      // Ensure allNotifications is an array
      const notificationsArray = Array.isArray(allNotifications) ? allNotifications : [];
      setNotifications(notificationsArray.slice(0, 10)); // Show latest 10
      setUnreadCount(unreadCountResult || 0);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Failed to load notifications');
      // Fallback to empty state
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      await notificationService.markAsRead(notification.id);
      await loadNotifications(); // Refresh after marking as read

      if (notification.actionUrl) {
        navigate(notification.actionUrl);
      }

      setShowDropdown(false);
    } catch (err) {
      console.error('Error handling notification click:', err);
      // Still navigate even if marking as read fails
      if (notification.actionUrl) {
        navigate(notification.actionUrl);
      }
      setShowDropdown(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const currentUserId = notificationService.getCurrentUserId();
      await notificationService.markAllAsRead(currentUserId);
      await loadNotifications(); // Refresh after marking all as read
    } catch (err) {
      console.error('Error marking all as read:', err);
      // Show error but don't block UI
      setError('Failed to mark notifications as read');
    }
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(notificationId);
      await loadNotifications(); // Refresh after deletion
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment':
        return <DollarSign size={18} />;
      case 'attendance':
        return <Calendar size={18} />;
      case 'exam':
        return <FileText size={18} />;
      case 'report':
        return <FileText size={18} />;
      case 'announcement':
        return <MessageSquare size={18} />;
      default:
        return <Bell size={18} />;
    }
  };

  const getPriorityClass = (priority) => {
    return `priority-${priority}`;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="notification-bell-container" ref={dropdownRef}>
        <button className="notification-bell-btn" title="Notifications">
          <Bell size={20} />
          <span className="notification-badge loading">...</span>
        </button>
      </div>
    );
  }

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button
        className="notification-bell-btn"
        onClick={() => setShowDropdown(!showDropdown)}
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button
                className="mark-all-read-btn"
                onClick={handleMarkAllRead}
                disabled={loading}
              >
                <Check size={16} />
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">
            {error && (
              <div className="notification-error">
                <AlertCircle size={16} />
                <span>{error}</span>
                <button onClick={loadNotifications} className="retry-btn">
                  Retry
                </button>
              </div>
            )}

            {notifications.length === 0 && !loading && !error ? (
              <div className="empty-notifications">
                <Bell size={48} color="#94a3b8" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''} ${getPriorityClass(notification.priority)}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {formatTimestamp(notification.timestamp)}
                    </span>
                  </div>
                  <button
                    className="delete-notification-btn"
                    onClick={(e) => handleDeleteNotification(e, notification.id)}
                    disabled={loading}
                  >
                    <X size={16} />
                  </button>
                  {!notification.read && <div className="unread-indicator"></div>}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && !error && (
            <div className="notification-footer">
              <button
                className="view-all-btn"
                onClick={() => {
                  navigate('/notifications');
                  setShowDropdown(false);
                }}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

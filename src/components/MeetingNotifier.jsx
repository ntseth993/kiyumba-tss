import React, { useEffect, useState } from 'react';
import { Bell, Video, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './MeetingNotifier.css';

const MeetingNotifier = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    checkUpcomingMeetings();
    const interval = setInterval(checkUpcomingMeetings, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user]);

  const checkUpcomingMeetings = () => {
    try {
      const allMeetings = JSON.parse(localStorage.getItem('schoolMeetings') || '[]');
      const now = new Date();
      const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60000);
      
      const relevantMeetings = allMeetings.filter(meeting => {
        // Check if user is host or participant
        const isParticipant = meeting.participants.includes(user?.id) || 
                             meeting.hostId === user?.id ||
                             meeting.hostEmail === user?.email;
        
        if (!isParticipant) return false;
        
        const meetingTime = new Date(meeting.scheduledTime);
        return meetingTime > now && meetingTime <= thirtyMinutesFromNow;
      });

      const newNotifications = relevantMeetings.map(meeting => ({
        id: `meeting-${meeting.id}`,
        title: meeting.title,
        message: `Meeting starting in ${Math.round((new Date(meeting.scheduledTime) - now) / 60000)} minutes`,
        type: 'meeting',
        meetingId: meeting.id,
        scheduledTime: meeting.scheduledTime,
        joinUrl: meeting.joinUrl,
        read: false
      }));

      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error checking upcoming meetings:', error);
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const joinMeeting = (notification) => {
    if (notification.joinUrl) {
      window.open(notification.joinUrl, '_blank');
    }
    markAsRead(notification.id);
  };

  return (
    <div className="meeting-notifier">
      <div className="notifier-icon">
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>
      
      {notifications.length > 0 && (
        <div className="notifications-dropdown">
          <h3>Upcoming Meetings</h3>
          <div className="notifications-list">
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              >
                <div className="notification-content">
                  <div className="notification-icon">
                    <Video size={20} />
                  </div>
                  <div className="notification-text">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <div className="notification-time">
                      <Calendar size={14} />
                      <span>
                        {new Date(notification.scheduledTime).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  className="join-meeting-btn"
                  onClick={() => joinMeeting(notification)}
                >
                  Join
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingNotifier;
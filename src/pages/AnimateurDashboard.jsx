import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chat from '../components/Chat';
import { 
  Users, 
  Calendar, 
  Trophy, 
  Music, 
  Camera, 
  Gamepad2, 
  Heart, 
  Star,
  Clock,
  CheckCircle
} from 'lucide-react';
import './StaffDashboard.css';

const AnimateurDashboard = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // Mock activities
    setActivities([
      { 
        id: 1, 
        name: 'Music Club', 
        participants: 45, 
        nextMeeting: '2024-04-18',
        status: 'active',
        type: 'music'
      },
      { 
        id: 2, 
        name: 'Drama Club', 
        participants: 32, 
        nextMeeting: '2024-04-20',
        status: 'active',
        type: 'drama'
      },
      { 
        id: 3, 
        name: 'Sports Club', 
        participants: 67, 
        nextMeeting: '2024-04-22',
        status: 'active',
        type: 'sports'
      },
      { 
        id: 4, 
        name: 'Art Club', 
        participants: 28, 
        nextMeeting: '2024-04-25',
        status: 'planning',
        type: 'art'
      }
    ]);

    // Mock upcoming events
    setUpcomingEvents([
      { 
        id: 1, 
        title: 'Inter-House Sports Competition', 
        date: '2024-04-16',
        time: '14:00',
        venue: 'School Field'
      },
      { 
        id: 2, 
        title: 'Music Festival Auditions', 
        date: '2024-04-19',
        time: '15:30',
        venue: 'Auditorium'
      },
      { 
        id: 3, 
        title: 'Drama Club Performance', 
        date: '2024-04-21',
        time: '18:00',
        venue: 'School Hall'
      }
    ]);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'music': return Music;
      case 'drama': return Camera;
      case 'sports': return Trophy;
      case 'art': return Star;
      default: return Heart;
    }
  };

  const stats = [
    { 
      id: 1, 
      label: 'Active Clubs', 
      value: activities.filter(a => a.status === 'active').length.toString(), 
      icon: Users, 
      color: '#4F46E5', 
      change: `${activities.length} total` 
    },
    { 
      id: 2, 
      label: 'Total Participants', 
      value: activities.reduce((sum, a) => sum + a.participants, 0).toString(), 
      icon: Heart, 
      color: '#10B981', 
      change: 'Engaged students' 
    },
    { 
      id: 3, 
      label: 'Upcoming Events', 
      value: upcomingEvents.length.toString(), 
      icon: Calendar, 
      color: '#F59E0B', 
      change: 'This month' 
    },
    { 
      id: 4, 
      label: 'Completed Activities', 
      value: '12', 
      icon: CheckCircle, 
      color: '#EF4444', 
      change: 'This term' 
    },
  ];

  return (
    <div className="staff-dashboard">
      <Navbar />
      
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="welcome-section">
            <img src={user.avatar} alt={user.name} className="user-avatar" />
            <div>
              <h1>Welcome, {user.name}</h1>
              <p>Animateur Dashboard</p>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.id} className="stat-card card">
              <div className="stat-icon" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon size={28} color={stat.color} />
              </div>
              <div className="stat-content">
                <p className="stat-label">{stat.label}</p>
                <div className="stat-value-row">
                  <h3>{stat.value}</h3>
                  <span className="stat-change positive">
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="staff-grid">
          <div className="staff-section">
            <div className="section-header">
              <h2>
                <Users size={24} />
                Student Clubs & Activities
              </h2>
              <button className="btn btn-outline btn-sm">Manage Clubs</button>
            </div>
            <div className="activities-grid">
              {activities.map((activity) => {
                const IconComponent = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="activity-card card">
                    <div className="activity-header">
                      <div className="activity-icon">
                        <IconComponent size={24} />
                      </div>
                      <div className="activity-info">
                        <h4>{activity.name}</h4>
                        <span className={`activity-status ${activity.status}`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                    <div className="activity-details">
                      <div className="activity-stat">
                        <Users size={16} />
                        <span>{activity.participants} participants</span>
                      </div>
                      <div className="activity-stat">
                        <Calendar size={16} />
                        <span>Next: {new Date(activity.nextMeeting).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="staff-section">
            <div className="section-header">
              <h2>
                <Calendar size={24} />
                Upcoming Events
              </h2>
              <button className="btn btn-outline btn-sm">View Calendar</button>
            </div>
            <div className="events-list">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="event-item card">
                  <div className="event-indicator event"></div>
                  <div className="event-content">
                    <h4>{event.title}</h4>
                    <div className="event-details">
                      <div className="event-detail">
                        <Calendar size={14} />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="event-detail">
                        <Clock size={14} />
                        <span>{event.time}</span>
                      </div>
                      <div className="event-detail">
                        <span className="venue">{event.venue}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Chat />
      <Footer />
    </div>
  );
};

export default AnimateurDashboard;

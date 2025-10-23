import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BookOpen, Users, Award, Lightbulb, ArrowRight, CheckCircle, Heart, MessageCircle, Image as ImageIcon, Video, Share2, Eye, Search, Calendar, Bell, TrendingUp, Zap, Star, Book, GraduationCap, Trophy, Target } from 'lucide-react';
import { getVisiblePosts, likePost, unlikePost, viewPost } from '../services/postsService';
import { getComments, addComment } from '../services/commentsService';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [viewedPosts, setViewedPosts] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'Admin' || user?.isAdmin;

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    loadEvents();
    loadNotifications();
    loadHighlights();
  }, []);

  useEffect(() => {
    // Listen for localStorage changes to refresh data
    const handleStorageChange = (e) => {
      if (e.key === 'schoolEvents' || e.key === 'schoolNotifications' || e.key === 'schoolHighlights') {
        loadEvents();
        loadNotifications();
        loadHighlights();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check for changes every 2 seconds in case same-tab changes
    const interval = setInterval(() => {
      loadEvents();
      loadNotifications();
      loadHighlights();
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // Track views for newly loaded posts
    posts.forEach(post => {
      if (!viewedPosts.has(post.id)) {
        handleView(post.id);
        setViewedPosts(prev => new Set([...prev, post.id]));
      }
    });
  }, [posts]);

  const loadPosts = async () => {
    try {
      const postsData = await getVisiblePosts();
      setPosts(postsData);

      // Load comments for each post (with error handling)
      const commentsData = {};
      for (const post of postsData) {
        try {
          const postComments = await getComments(post.id);
          commentsData[post.id] = postComments;
        } catch (error) {
          console.log(`Comments not available for post ${post.id}, using empty array`);
          commentsData[post.id] = [];
        }
      }
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const loadEvents = async () => {
    try {
      const eventsData = JSON.parse(localStorage.getItem('schoolEvents') || '[]');
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const notificationsData = JSON.parse(localStorage.getItem('schoolNotifications') || '[]');
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadHighlights = async () => {
    try {
      const highlightsData = JSON.parse(localStorage.getItem('schoolHighlights') || '[]');
      setHighlights(highlightsData);
    } catch (error) {
      console.error('Error loading highlights:', error);
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'academic': return '#3b82f6';
      case 'career': return '#10b981';
      case 'social': return '#f59e0b';
      default: return '#667eea';
    }
  };

  // Global refresh function for admin pages to trigger home page updates
  window.refreshHomeData = () => {
    loadEvents();
    loadNotifications();
    loadHighlights();
    loadPosts();
  };

  const handleShare = async (post) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(`${post.title}\n${post.excerpt}\n\nView post: ${window.location.href}`);
        alert('Post details copied to clipboard! 📋');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
      // Manual fallback if clipboard fails
      try {
        const textArea = document.createElement('textarea');
        textArea.value = `${post.title}\n${post.excerpt}\n\nView post: ${window.location.href}`;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Post details copied to clipboard! 📋');
      } catch (fallbackError) {
        alert('Unable to share post. Please copy the URL manually.');
      }
    }
  };

  const handleView = async (postId) => {
    try {
      await viewPost(postId, user?.id || 'anonymous');
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !selectedPost) return;

    try {
      const commentData = {
        text: newComment.trim(),
        author: user.name || user.email || 'Anonymous',
        authorEmail: user.email || '',
        authorId: user.id || 'anonymous'
      };

      await addComment(selectedPost.id, commentData);

      // Reload comments for this post
      try {
        const updatedComments = await getComments(selectedPost.id);
        setComments(prev => ({
          ...prev,
          [selectedPost.id]: updatedComments
        }));
      } catch (error) {
        console.log(`Failed to reload comments for post ${selectedPost.id}`);
        // Still update with the new comment added locally
        setComments(prev => ({
          ...prev,
          [selectedPost.id]: [...(prev[selectedPost.id] || []), commentData]
        }));
      }

      setNewComment('');
      alert('Comment added successfully! 💬');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  };

  const handleShowComments = async (post) => {
    setSelectedPost(post);
    setShowComments(true);

    // Load fresh comments for this post
    try {
      const postComments = await getComments(post.id);
      setComments(prev => ({
        ...prev,
        [post.id]: postComments
      }));
    } catch (error) {
      console.log(`Comments not available for post ${post.id}, using empty array`);
      setComments(prev => ({
        ...prev,
        [post.id]: []
      }));
    }
  };

  return (
    <div className="home">
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              #1 Technical School in Rwanda
            </div>
            <h1 className="hero-title">
              Shape Your Future with
              <span className="gradient-text"> Professional Skills</span>
            </h1>
            <p className="hero-subtitle">
              Join Rwanda's leading technical institution. Master Software Development, Fashion Design, 
              Building Construction, or Wood Technology with hands-on training and industry-recognized 
              certifications at L3, L4, and L5 levels.
            </p>

            {/* Search Bar */}
            <div className="hero-search">
              <div className="search-container">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search posts, programs, or announcements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                {searchTerm && (
                  <button className="search-clear" onClick={() => setSearchTerm('')}>
                    ×
                  </button>
                )}
              </div>
            </div>

            <div className="hero-buttons">
              <Link to="/register" className="btn btn-modern btn-primary">
                <span>Start Your Journey</span>
                <ArrowRight size={20} />
              </Link>
              <Link to="/about" className="btn btn-modern btn-glass">
                <BookOpen size={20} />
                <span>Explore Programs</span>
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card card-1">
              <BookOpen size={40} />
              <h4>Software Development</h4>
              <p>Build the future</p>
            </div>
            <div className="floating-card card-2">
              <Award size={40} />
              <h4>Certified Programs</h4>
              <p>Industry recognized</p>
            </div>
            <div className="floating-card card-3">
              <Users size={40} />
              <h4>Expert Instructors</h4>
              <p>Learn from the best</p>
            </div>
            <div className="hero-main-icon">
              <div className="icon-gradient">
                <BookOpen size={80} strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Panel */}
      <section className="quick-actions">
        <div className="container">
          <div className="quick-actions-grid">
            <Link to="/student" className="quick-action-card">
              <div className="quick-action-icon">
                <GraduationCap size={32} />
              </div>
              <h3>Student Portal</h3>
              <p>Access your courses, grades, and materials</p>
              <ArrowRight size={20} />
            </Link>

            <Link to="/teacher" className="quick-action-card">
              <div className="quick-action-icon">
                <Book size={32} />
              </div>
              <h3>Teacher Dashboard</h3>
              <p>Manage classes, assignments, and students</p>
              <ArrowRight size={20} />
            </Link>

            <Link to="/admin" className="quick-action-card">
              <div className="quick-action-icon">
                <Trophy size={32} />
              </div>
              <h3>Admin Panel</h3>
              <p>Manage school operations and content</p>
              <ArrowRight size={20} />
            </Link>

            <Link to="/contact" className="quick-action-card">
              <div className="quick-action-icon">
                <MessageCircle size={32} />
              </div>
              <h3>Contact Us</h3>
              <p>Get in touch for inquiries and support</p>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Events Calendar Section */}
      <section className="events-calendar">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <Calendar size={32} />
              Upcoming Events
            </h2>
            <p className="section-subtitle">
              Stay updated with important school events and deadlines
            </p>
            {isAdmin && (
              <div className="admin-controls">
                <Link to="/admin/events" className="btn btn-small btn-outline">
                  <Calendar size={16} />
                  Manage Events
                </Link>
              </div>
            )}
          </div>

          <div className="events-grid">
            {/* Show dynamic events first (newest admin-added events) */}
            {events.length > 0 && events.map((event) => (
              <div
                key={`dynamic-${event.id}`}
                className={`event-card ${event.featured ? 'featured' : ''}`}
                style={{ borderLeftColor: getEventTypeColor(event.eventType) }}
              >
                {event.imageUrl && (
                  <div className="event-image">
                    <img src={event.imageUrl} alt={event.title} />
                    <div className="event-image-overlay">
                      <span className="event-type-badge">{event.eventType}</span>
                    </div>
                  </div>
                )}
                <div className="event-date">
                  <span className="day">
                    {new Date(event.date).getDate()}
                  </span>
                  <span className="month">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                  </span>
                </div>
                <div className="event-content">
                  <span className="event-type">{event.eventType}</span>
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                  <div className="event-meta">
                    <span>{event.targetAudience}</span>
                    {event.location && <><span>•</span><span>{event.location}</span></>}
                  </div>
                  {isAdmin && (
                    <div className="admin-controls event-controls">
                      <button
                        className="btn btn-small btn-outline"
                        onClick={() => alert(`Edit ${event.title} event - navigate to edit form`)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => alert(`Delete ${event.title} event - confirm and delete`)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Always show hardcoded events */}
            <div className="event-card featured">
              <div className="event-image">
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzNiODJmNiIvPgogIDx0ZXh0IHg9IjIwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5GaW5hbCBFeGFtIFdlZWs8L3RleHQ+Cjwvc3ZnPg==" alt="Final Exam Week" />
                <div className="event-image-overlay">
                  <span className="event-type-badge">Academic</span>
                </div>
              </div>
              <div className="event-date">
                <span className="day">15</span>
                <span className="month">NOV</span>
              </div>
              <div className="event-content">
                <span className="event-type">Academic</span>
                <h3>Final Exam Week</h3>
                <p>End-of-semester examinations for all programs</p>
                <div className="event-meta">
                  <span>All Students</span>
                  <span>•</span>
                  <span>Multiple Locations</span>
                </div>
                {isAdmin && (
                  <div className="admin-controls event-controls">
                    <button
                      className="btn btn-small btn-outline"
                      onClick={() => alert('Edit Final Exam Week event - navigate to edit form')}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => alert('Delete Final Exam Week event - confirm and delete')}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="event-card">
              <div className="event-image">
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzEwYjk4MSIvPgogIDx0ZXh0IHg9IjIwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbmR1c3RyeSBEYXk8L3RleHQ+Cjwvc3ZnPg==" alt="Industry Day" />
                <div className="event-image-overlay">
                  <span className="event-type-badge">Career</span>
                </div>
              </div>
              <div className="event-date">
                <span className="day">22</span>
                <span className="month">NOV</span>
              </div>
              <div className="event-content">
                <span className="event-type">Career</span>
                <h3>Industry Day</h3>
                <p>Meet with industry professionals and explore career opportunities</p>
                <div className="event-meta">
                  <span>L4 & L5 Students</span>
                  <span>•</span>
                  <span>Main Auditorium</span>
                </div>
                {isAdmin && (
                  <div className="admin-controls event-controls">
                    <button
                      className="btn btn-small btn-outline"
                      onClick={() => alert('Edit Industry Day event - navigate to edit form')}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => alert('Delete Industry Day event - confirm and delete')}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="event-card">
              <div className="event-image">
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1OWUwYiIvPgogIDx0ZXh0IHg9IjIwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5HcmFkdWF0aW9uPC90ZXh0Pgo8L3N2Zz4=" alt="Graduation Ceremony" />
                <div className="event-image-overlay">
                  <span className="event-type-badge">Social</span>
                </div>
              </div>
              <div className="event-date">
                <span className="day">01</span>
                <span className="month">DEC</span>
              </div>
              <div className="event-content">
                <span className="event-type">Social</span>
                <h3>Graduation Ceremony</h3>
                <p>Celebrate the achievements of our graduating students</p>
                <div className="event-meta">
                  <span>All Students & Families</span>
                  <span>•</span>
                  <span>School Grounds</span>
                </div>
                {isAdmin && (
                  <div className="admin-controls event-controls">
                    <button
                      className="btn btn-small btn-outline"
                      onClick={() => alert('Edit Graduation Ceremony event - navigate to edit form')}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => alert('Delete Graduation Ceremony event - confirm and delete')}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="events-actions">
            <Link to="/events" className="btn btn-outline">
              <Calendar size={20} />
              View All Events
            </Link>
            {isAdmin && (
              <button
                className="btn btn-primary"
                onClick={() => navigate('/admin/events')}
              >
                Add New Event
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="notifications">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <Bell size={32} />
              Important Notifications
            </h2>
            <p className="section-subtitle">
              Stay informed with the latest school announcements and updates
            </p>
            {isAdmin && (
              <div className="admin-controls">
                <Link to="/admin/notifications" className="btn btn-small btn-outline">
                  <Bell size={16} />
                  Manage Notifications
                </Link>
              </div>
            )}
          </div>

          <div className="notifications-grid">
            {/* Show dynamic notifications first (newest admin-added notifications) */}
            {notifications.length > 0 && notifications.map((notification) => (
              <div
                key={`dynamic-${notification.id}`}
                className={`notification-card priority-${notification.priority === 'high' ? 'high' : notification.priority === 'medium' ? 'medium' : 'low'}`}
              >
                {notification.imageUrl && (
                  <div className="notification-image">
                    <img src={notification.imageUrl} alt={notification.title} />
                    <div className="notification-image-overlay">
                      <span className="notification-priority-badge">
                        {notification.priority === 'high' ? 'High Priority' :
                         notification.priority === 'medium' ? 'Medium Priority' : 'Information'}
                      </span>
                    </div>
                  </div>
                )}
                <div className="notification-icon">
                  <Bell size={24} />
                </div>
                <div className="notification-content">
                  <div className="notification-header">
                    <span className="notification-priority">
                      {notification.priority === 'high' ? 'High Priority' :
                       notification.priority === 'medium' ? 'Medium Priority' : 'Information'}
                    </span>
                    <span className="notification-time">
                      {new Date(notification.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })} ago
                    </span>
                  </div>
                  <h3>{notification.title}</h3>
                  <p>{notification.message}</p>
                  <div className="notification-actions">
                    {notification.actionUrl && (
                      <button
                        className="btn btn-small btn-primary"
                        onClick={() => navigate(notification.actionUrl)}
                      >
                        {notification.actionText || 'View Details'}
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => alert(`Delete ${notification.title} notification`)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Always show hardcoded notifications */}
            <div className="notification-card priority-high">
              <div className="notification-image">
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VmNDQ0NCIvPgogIDx0ZXh0IHg9IjIwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5SZWdpc3RyYXRpb24gRGVhZGxpbmU8L3RleHQ+Cjwvc3ZnPg==" alt="Registration Deadline Extended" />
                <div className="notification-image-overlay">
                  <span className="notification-priority-badge">High Priority</span>
                </div>
              </div>
              <div className="notification-icon">
                <Bell size={24} />
              </div>
              <div className="notification-content">
                <div className="notification-header">
                  <span className="notification-priority">High Priority</span>
                  <span className="notification-time">2 hours ago</span>
                </div>
                <h3>Registration Deadline Extended</h3>
                <p>L5 program registration deadline has been extended to November 30th. Don't miss your chance!</p>
                <div className="notification-actions">
                  <button
                    className="btn btn-small btn-primary"
                    onClick={() => navigate('/register')}
                  >
                    Register Now
                  </button>
                  <button
                    className="btn btn-small btn-outline"
                    onClick={() => navigate('/about')}
                  >
                    Learn More
                  </button>
                  {isAdmin && (
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => alert('Delete Registration Deadline Extended notification')}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="notification-card priority-medium">
              <div className="notification-image">
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzhkNWNmNiIvPgogIDx0ZXh0IHg9IjIwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TY2hvbGFyc2hpcHM8L3RleHQ+Cjwvc3ZnPg==" alt="New Scholarship Opportunities" />
                <div className="notification-image-overlay">
                  <span className="notification-priority-badge">Medium Priority</span>
                </div>
              </div>
              <div className="notification-icon">
                <Award size={24} />
              </div>
              <div className="notification-content">
                <div className="notification-header">
                  <span className="notification-priority">Medium Priority</span>
                  <span className="notification-time">1 day ago</span>
                </div>
                <h3>New Scholarship Opportunities</h3>
                <p>Applications are now open for the 2024 Technical Excellence Scholarships. Apply before December 15th.</p>
                <div className="notification-actions">
                  <button
                    className="btn btn-small btn-outline"
                    onClick={() => navigate('/scholarships')}
                  >
                    View Details
                  </button>
                  {isAdmin && (
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => alert('Delete New Scholarship Opportunities notification')}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="notification-card priority-low">
              <div className="notification-image">
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzEwYjk4MSIvPgogIDx0ZXh0IHg9IjIwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DYW1wdXMgVG91cjwvdGV4dD4KPC9zdmc+" alt="Campus Tour Available" />
                <div className="notification-image-overlay">
                  <span className="notification-priority-badge">Information</span>
                </div>
              </div>
              <div className="notification-icon">
                <Users size={24} />
              </div>
              <div className="notification-content">
                <div className="notification-header">
                  <span className="notification-priority">Information</span>
                  <span className="notification-time">3 days ago</span>
                </div>
                <h3>Campus Tour Available</h3>
                <p>Book a guided tour of our facilities and meet with department heads to learn more about our programs.</p>
                <div className="notification-actions">
                  <button
                    className="btn btn-small btn-outline"
                    onClick={() => navigate('/contact')}
                  >
                    Schedule Tour
                  </button>
                  {isAdmin && (
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => alert('Delete Campus Tour Available notification')}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Admin edit controls */}
          {isAdmin && (
            <div className="admin-actions">
              <Link to="/admin/notifications" className="btn btn-outline">
                <Bell size={16} />
                Manage All Notifications
              </Link>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/admin/notifications')}
              >
                Add New Notification
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Community Highlights */}
      <section className="community-highlights">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <Users size={32} />
              Community Highlights
            </h2>
            <p className="section-subtitle">
              Celebrating achievements and milestones from our school community
            </p>
            {isAdmin && (
              <div className="admin-controls">
                <Link to="/admin/highlights" className="btn btn-small btn-outline">
                  <Users size={16} />
                  Manage Highlights
                </Link>
              </div>
            )}
          </div>

          <div className="highlights-grid">
            {/* Show dynamic highlights first (newest admin-added highlights) */}
            {highlights.length > 0 && highlights.map((highlight) => (
              <div key={`dynamic-${highlight.id}`} className="highlight-card">
                <div className="highlight-image">
                  <img
                    src={highlight.imageUrl || '/photo/default-highlight.jpg'}
                    alt={highlight.title}
                  />
                  <div className="highlight-overlay">
                    <span className="highlight-category">{highlight.category}</span>
                  </div>
                </div>
                <div className="highlight-content">
                  <h3>{highlight.title}</h3>
                  <p>{highlight.description}</p>
                  <div className="highlight-meta">
                    <span>{highlight.category}</span>
                    <span>•</span>
                    <span>{new Date(highlight.date || highlight.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}</span>
                  </div>
                  {isAdmin && (
                    <div className="admin-controls highlight-controls">
                      <button
                        className="btn btn-small btn-outline"
                        onClick={() => alert(`Edit ${highlight.title} highlight`)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => alert(`Delete ${highlight.title} highlight`)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Always show hardcoded highlights */}
            <div className="highlight-card">
              <div className="highlight-image">
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzEwYjk4MSIvPgogIDx0ZXh0IHg9IjIwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TdHVkZW50IEFjaGlldmVtZW50PC90ZXh0Pgo8L3N2Zz4=" alt="Student Achievement" />
                <div className="highlight-overlay">
                  <span className="highlight-category">Achievement</span>
                </div>
              </div>
              <div className="highlight-content">
                <h3>Outstanding Student Performance</h3>
                <p>Congratulations to Sarah from Software Development L4 for achieving the highest GPA this semester!</p>
                <div className="highlight-meta">
                  <span>Software Development</span>
                  <span>•</span>
                  <span>October 2024</span>
                </div>
                {isAdmin && (
                  <div className="admin-controls highlight-controls">
                    <button
                      className="btn btn-small btn-outline"
                      onClick={() => alert('Edit Outstanding Student Performance highlight')}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => alert('Delete Outstanding Student Performance highlight')}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="highlight-card">
              <div className="highlight-image">
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzNiODJmNiIvPgogIDx0ZXh0IHg9IjIwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5UZWFjaGVyIEF3YXJkPC90ZXh0Pgo8L3N2Zz4=" alt="Teacher Award" />
                <div className="highlight-overlay">
                  <span className="highlight-category">Recognition</span>
                </div>
              </div>
              <div className="highlight-content">
                <h3>Teacher Excellence Award</h3>
                <p>Mr. Johnson recognized for innovative teaching methods in Building Construction program.</p>
                <div className="highlight-meta">
                  <span>Building Construction</span>
                  <span>•</span>
                  <span>September 2024</span>
                </div>
                {isAdmin && (
                  <div className="admin-controls highlight-controls">
                    <button
                      className="btn btn-small btn-outline"
                      onClick={() => alert('Edit Teacher Excellence Award highlight')}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => alert('Delete Teacher Excellence Award highlight')}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="highlight-card">
              <div className="highlight-image">
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzhkNWNmNiIvPgogIDx0ZXh0IHg9IjIwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbmR1c3RyeSBQYXJ0bmVyc2hpcDwvdGV4dD4KPC9zdmc+" alt="Industry Partnership" />
                <div className="highlight-overlay">
                  <span className="highlight-category">Partnership</span>
                </div>
              </div>
              <div className="highlight-content">
                <h3>New Industry Partnership</h3>
                <p>Kiyumba partners with local tech companies to provide internship opportunities for L5 students.</p>
                <div className="highlight-meta">
                  <span>Industry Relations</span>
                  <span>•</span>
                  <span>October 2024</span>
                </div>
                {isAdmin && (
                  <div className="admin-controls highlight-controls">
                    <button
                      className="btn btn-small btn-outline"
                      onClick={() => alert('Edit New Industry Partnership highlight')}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => alert('Delete New Industry Partnership highlight')}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="highlights-actions">
            <Link to="/community" className="btn btn-outline">
              <Users size={20} />
              View All Highlights
            </Link>
            {isAdmin && (
              <button
                className="btn btn-primary"
                onClick={() => navigate('/admin/highlights')}
              >
                Add New Highlight
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Personalized Dashboard Widgets - Admin can configure */}
      {isAdmin && (
        <section className="personalized-widgets">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">
                <TrendingUp size={32} />
                Dashboard Widgets (Admin Control)
              </h2>
              <p className="section-subtitle">
                Configure widgets and personalized content for all users
              </p>
              <div className="admin-controls">
                <Link to="/admin/widgets" className="btn btn-small btn-primary">
                  <TrendingUp size={16} />
                  Manage Widgets
                </Link>
              </div>
            </div>

            {/* Widgets content - Admin can edit */}
            <div className="admin-actions">
              <Link to="/admin/widgets" className="btn btn-primary">
                Configure Dashboard
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Interactive Learning Tools - Admin can manage */}
      {isAdmin && (
        <section className="interactive-tools">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">
                <Zap size={32} />
                Interactive Tools (Admin Control)
              </h2>
              <p className="section-subtitle">
                Manage quizzes, polls, challenges, and learning resources
              </p>
              <div className="admin-controls">
                <Link to="/admin/tools" className="btn btn-small btn-primary">
                  <Zap size={16} />
                  Manage Tools
                </Link>
              </div>
            </div>

            {/* Tools content - Admin can edit */}
            <div className="admin-actions">
              <Link to="/admin/tools" className="btn btn-primary">
                Configure Learning Tools
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose Kiyumba?</h2>
          <p className="section-subtitle">
            We provide world-class education with a focus on holistic development
          </p>

          <div className="features-grid">
            <div className="feature-card card">
              <div className="feature-icon">
                <BookOpen size={40} />
              </div>
              <h3>Quality Education</h3>
              <p>
                Comprehensive curriculum designed to meet international standards
                and prepare students for global opportunities.
              </p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">
                <Users size={40} />
              </div>
              <h3>Expert Teachers</h3>
              <p>
                Highly qualified and dedicated educators committed to nurturing
                each student's potential and academic excellence.
              </p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">
                <Award size={40} />
              </div>
              <h3>Excellence Awards</h3>
              <p>
                Recognized for outstanding academic achievements and innovative
                teaching methodologies across the region.
              </p>
            </div>

            <div className="feature-card card">
              <div className="feature-icon">
                <Lightbulb size={40} />
              </div>
              <h3>Modern Facilities</h3>
              <p>
                State-of-the-art classrooms, laboratories, and technology to
                enhance the learning experience for all students.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="programs">
        <div className="container">
          <h2 className="section-title">Our Technical Programs</h2>
          <p className="section-subtitle">
            Professional technical education across levels L3, L4, and L5
          </p>

          <div className="programs-grid">
            <div className="program-card card">
              <h3>Software Development</h3>
              <ul className="program-features">
                <li><CheckCircle size={20} /> Web Development</li>
                <li><CheckCircle size={20} /> Mobile Apps</li>
                <li><CheckCircle size={20} /> Database Management</li>
                <li><CheckCircle size={20} /> Levels: L3, L4, L5</li>
              </ul>
              <Link to="/register" className="btn btn-outline">Apply Now</Link>
            </div>

            <div className="program-card card featured">
              <div className="featured-badge">Most Popular</div>
              <h3>Fashion & Design</h3>
              <ul className="program-features">
                <li><CheckCircle size={20} /> Pattern Making</li>
                <li><CheckCircle size={20} /> Garment Construction</li>
                <li><CheckCircle size={20} /> Fashion Illustration</li>
                <li><CheckCircle size={20} /> Levels: L3, L4, L5</li>
              </ul>
              <Link to="/register" className="btn btn-primary">Apply Now</Link>
            </div>

            <div className="program-card card">
              <h3>Building Construction</h3>
              <ul className="program-features">
                <li><CheckCircle size={20} /> Structural Design</li>
                <li><CheckCircle size={20} /> Construction Methods</li>
                <li><CheckCircle size={20} /> Site Management</li>
                <li><CheckCircle size={20} /> Levels: L3, L4, L5</li>
              </ul>
              <Link to="/register" className="btn btn-outline">Apply Now</Link>
            </div>

            <div className="program-card card">
              <h3>Wood Technology</h3>
              <ul className="program-features">
                <li><CheckCircle size={20} /> Carpentry Skills</li>
                <li><CheckCircle size={20} /> Furniture Design</li>
                <li><CheckCircle size={20} /> Wood Processing</li>
                <li><CheckCircle size={20} /> Levels: L3, L4, L5</li>
              </ul>
              <Link to="/register" className="btn btn-outline">Apply Now</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Posts Section */}
      {posts.length > 0 && (
        <section className="posts-section-home">
          <div className="container">
            <h2 className="section-title">Latest News & Updates</h2>
            <p className="section-subtitle">
              Stay informed with the latest announcements and updates from Kiyumba
            </p>

            <div className="home-posts-grid">
              {posts.slice(0, 6).map(post => (
                <div key={post.id} className="home-post-card card">
                    {post.imageUrl && (
                      <div className="home-post-image">
                        <img src={post.imageUrl} alt={post.title} />
                      </div>
                    )}
                    {post.videoUrl && (
                      <div className="home-post-image">
                        <video controls>
                          <source src={post.videoUrl} type="video/mp4" />
                        </video>
                      </div>
                    )}

                    <div className="home-post-content">
                      <div className="home-post-type">
                        {post.type === 'image' && <ImageIcon size={16} />}
                        {post.type === 'video' && <Video size={16} />}
                        <span>{post.type}</span>
                      </div>

                      <h3 style={{ fontSize: post.textSize === 'small' ? '1rem' : post.textSize === 'large' ? '1.5rem' : '1.25rem' }}>
                        {post.title}
                      </h3>

                      <p className="home-post-text" style={{ fontSize: post.textSize === 'small' ? '0.875rem' : post.textSize === 'large' ? '1.125rem' : '1rem' }}>
                        {post.excerpt}
                      </p>

                      <div className="home-post-meta">
                        <span className="post-date">
                          {new Date(post.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <div className="home-post-actions">
                          <button
                            className={`post-action-btn ${post.likedBy?.includes(user?.id) ? 'liked' : ''}`}
                            onClick={() => handleLike(post.id)}
                            title={user ? "Like this post" : "Log in to like posts"}
                          >
                            <Heart size={16} fill={post.likedBy?.includes(user?.id) ? 'currentColor' : 'none'} />
                            {post.likes || 0}
                          </button>
                          <button
                            className="post-action-btn"
                            title={user ? "View comments" : "Log in to view comments"}
                            onClick={() => {
                              if (user) {
                                handleShowComments(post);
                              } else {
                                alert('Please log in to view comments');
                              }
                            }}
                          >
                            <MessageCircle size={16} />
                            {post.comments?.length || 0}
                          </button>
                          <button
                            className="post-action-btn"
                            title="View post"
                          >
                            <Eye size={16} />
                            {post.views || 0}
                          </button>
                          <button
                            className="post-action-btn"
                            title="Share this post"
                            onClick={() => handleShare(post)}
                          >
                            <Share2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Join Kiyumba Technical School?</h2>
            <p>
              Start your journey towards professional technical excellence.
              Apply now and transform your future with hands-on training.
            </p>
            <Link to="/register" className="btn btn-primary btn-large">
              Apply Now
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="location-section">
        <div className="container">
          <h2 className="section-title">Visit Us</h2>
          <p className="section-subtitle">
            Find Kiyumba Technical Secondary School on the map
          </p>
          <div className="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.5!2d30.0!3d-1.95!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMcKwNTcnMDAuMCJTIDMwwrAwMCcwMC4wIkU!5e0!3m2!1sen!2srw!4v1234567890!5m2!1sen!2srw"
              width="100%"
              height="450"
              style={{ border: 0, borderRadius: '12px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Kiyumba Technical Secondary School Location"
            ></iframe>
          </div>
          <div className="location-info">
            <div className="location-card">
              <h3>Address</h3>
              <p>Kiyumba, Rwanda</p>
            </div>
            <div className="location-card">
              <h3>Contact</h3>
              <p>Phone: +250 XXX XXX XXX</p>
              <p>Email: info@kiyumba.com</p>
            </div>
            <div className="location-card">
              <h3>Opening Hours</h3>
              <p>Monday - Friday: 7:00 AM - 5:00 PM</p>
              <p>Saturday: 8:00 AM - 12:00 PM</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comments Modal */}
      {showComments && selectedPost && (
        <div className="comments-modal-overlay" onClick={() => setShowComments(false)}>
          <div className="comments-modal" onClick={(e) => e.stopPropagation()}>
            <div className="comments-modal-header">
              <h3>{selectedPost.title}</h3>
              <button
                className="comments-modal-close"
                onClick={() => setShowComments(false)}
              >
                ×
              </button>
            </div>

            <div className="comments-modal-content">
              <div className="post-excerpt-modal">
                {selectedPost.excerpt}
              </div>

              {/* Add Comment Form */}
              {user && (
                <form onSubmit={handleAddComment} className="comment-form-modal">
                  <div className="comment-input-group-modal">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="comment-input-modal"
                      maxLength={500}
                    />
                    <button
                      type="submit"
                      className="comment-submit-btn-modal"
                      disabled={!newComment.trim()}
                    >
                      Post Comment
                    </button>
                  </div>
                </form>
              )}

              {/* Comments List */}
              <div className="comments-list-modal">
                {comments[selectedPost.id] && comments[selectedPost.id].length > 0 ? (
                  comments[selectedPost.id].map(comment => (
                    <div key={comment.id} className="comment-item-modal">
                      <div className="comment-header-modal">
                        <div className="comment-author-modal">
                          <strong>{comment.author}</strong>
                          <span className="comment-date-modal">
                            {new Date(comment.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="comment-text-modal">
                        {comment.text}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-comments-modal">
                    <p>No comments yet. Be the first to comment!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Home;

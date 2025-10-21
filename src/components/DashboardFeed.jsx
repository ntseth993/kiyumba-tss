import { useState, useEffect } from 'react';
import { getVisiblePosts, likePost, unlikePost } from '../services/postsService';
import { getActiveAnnouncements, markAnnouncementAsViewed } from '../services/announcementsService';
import { Heart, MessageCircle, Eye, Bell, X, Image as ImageIcon, Video } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './DashboardFeed.css';

const DashboardFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  useEffect(() => {
    loadFeedData();
  }, []);

  const loadFeedData = async () => {
    try {
      const [postsData, announcementsData] = await Promise.all([
        getVisiblePosts(),
        getActiveAnnouncements()
      ]);
      setPosts(postsData);
      setAnnouncements(announcementsData);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const post = posts.find(p => p.id === postId);
      const userLiked = post.likedBy?.includes(user?.id);

      if (userLiked) {
        await unlikePost(postId, user?.id);
      } else {
        await likePost(postId, user?.id);
      }

      const updatedPosts = await getVisiblePosts();
      setPosts(updatedPosts);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleViewAnnouncement = async (announcement) => {
    setSelectedAnnouncement(announcement);
    if (user?.id && !announcement.viewedBy?.includes(user.id)) {
      await markAnnouncementAsViewed(announcement.id, user.id);
      const updatedAnnouncements = await getActiveAnnouncements();
      setAnnouncements(updatedAnnouncements);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#667eea';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-feed">
        <div className="feed-loading">Loading feed...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-feed">
      {/* Announcements Section */}
      {announcements.length > 0 && (
        <div className="announcements-section">
          <h3 className="feed-section-title">
            <Bell size={20} />
            Announcements
          </h3>
          <div className="announcements-grid">
            {announcements.slice(0, 3).map((announcement) => (
              <div
                key={announcement.id}
                className="announcement-card"
                style={{ borderLeftColor: getPriorityColor(announcement.priority) }}
                onClick={() => handleViewAnnouncement(announcement)}
              >
                <div className="announcement-header">
                  <span 
                    className="announcement-priority"
                    style={{ backgroundColor: getPriorityColor(announcement.priority) }}
                  >
                    {announcement.priority || 'normal'}
                  </span>
                  <span className="announcement-target">{announcement.targetAudience || 'All'}</span>
                </div>
                <h4>{announcement.title}</h4>
                <p>{announcement.message.substring(0, 100)}...</p>
                <div className="announcement-footer">
                  <span className="announcement-date">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </span>
                  <span className="announcement-views">
                    <Eye size={14} />
                    {announcement.views || 0} views
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Posts Section */}
      {posts.length > 0 && (
        <div className="posts-section">
          <h3 className="feed-section-title">Latest Posts</h3>
          <div className="posts-grid">
            {posts.map((post) => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <div className="post-author">
                    <img 
                      src={post.authorAvatar || 'https://ui-avatars.com/api/?name=Admin&background=4F46E5&color=fff'} 
                      alt={post.author || 'Admin'}
                      className="post-avatar"
                    />
                    <div>
                      <div className="post-author-name">{post.author || 'Admin'}</div>
                      <div className="post-date">
                        {new Date(post.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  {post.type && (
                    <span className={`post-type-badge ${post.type}`}>
                      {post.type === 'video' && <Video size={14} />}
                      {post.type === 'image' && <ImageIcon size={14} />}
                      {post.type}
                    </span>
                  )}
                </div>

                <h3 className="post-title">{post.title}</h3>
                <p className="post-excerpt">{post.excerpt}</p>

                {/* Media Display */}
                {post.mediaUrl && post.type === 'image' && (
                  <div className="post-media">
                    <img src={post.mediaUrl} alt={post.title} />
                  </div>
                )}

                {post.mediaUrl && post.type === 'video' && (
                  <div className="post-media">
                    <video controls>
                      <source src={post.mediaUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

                <div className="post-footer">
                  <button 
                    className={`post-action ${post.likedBy?.includes(user?.id) ? 'liked' : ''}`}
                    onClick={() => handleLike(post.id)}
                  >
                    <Heart size={16} fill={post.likedBy?.includes(user?.id) ? 'currentColor' : 'none'} />
                    {post.likes || 0}
                  </button>
                  <span className="post-action">
                    <MessageCircle size={16} />
                    {post.comments?.length || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {posts.length === 0 && announcements.length === 0 && (
        <div className="feed-empty">
          <p>No posts or announcements yet. Check back later!</p>
        </div>
      )}

      {/* Announcement Modal */}
      {selectedAnnouncement && (
        <div className="announcement-modal-overlay" onClick={() => setSelectedAnnouncement(null)}>
          <div className="announcement-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedAnnouncement(null)}>
              <X size={24} />
            </button>
            <div className="announcement-modal-header">
              <span 
                className="announcement-priority-large"
                style={{ backgroundColor: getPriorityColor(selectedAnnouncement.priority) }}
              >
                {selectedAnnouncement.priority || 'normal'} priority
              </span>
              <h2>{selectedAnnouncement.title}</h2>
              <p className="announcement-meta">
                Posted on {new Date(selectedAnnouncement.createdAt).toLocaleDateString()} • 
                For {selectedAnnouncement.targetAudience || 'All Users'}
              </p>
            </div>
            <div className="announcement-modal-body">
              <p>{selectedAnnouncement.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardFeed;

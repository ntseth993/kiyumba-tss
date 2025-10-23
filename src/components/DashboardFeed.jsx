import { useState, useEffect } from 'react';
import { getVisiblePosts, likePost, unlikePost } from '../services/postsService';
import { getComments, addComment } from '../services/commentsService';
import { getActiveAnnouncements, markAnnouncementAsViewed } from '../services/announcementsService';
import { Heart, MessageCircle, Eye, Bell, X, Image as ImageIcon, Video, Share2, Facebook, Twitter, Linkedin, MessageSquare, Copy, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Comments from './Comments';
import { socialMediaService, likeService } from '../services/socialMediaService';

const DashboardFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [shareOptionsPost, setShareOptionsPost] = useState(null);

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
    if (!user) {
      alert('Please log in to like posts');
      return;
    }

    try {
      const post = posts.find(p => p.id === postId);
      const userLiked = post.likedBy?.includes(user?.id);

      if (userLiked) {
        await likeService.unlikePost(postId, user?.id);
      } else {
        await likeService.likePost(postId, user?.id);
      }

      // Refresh posts data
      const updatedPosts = await getVisiblePosts();
      setPosts(updatedPosts);
    } catch (error) {
      console.error('Error liking post:', error);
      alert('Failed to like post. Please try again.');
    }
  };

  const handleShare = (post) => {
    setShareOptionsPost(post);
    setShowShareOptions(true);
  };

  const handleSocialShare = async (platform, post) => {
    try {
      switch (platform) {
        case 'facebook':
          socialMediaService.shareToFacebook(post);
          break;
        case 'twitter':
          socialMediaService.shareToTwitter(post);
          break;
        case 'linkedin':
          socialMediaService.shareToLinkedIn(post);
          break;
        case 'whatsapp':
          socialMediaService.shareToWhatsApp(post);
          break;
        case 'telegram':
          socialMediaService.shareToTelegram(post);
          break;
        case 'copy':
          const result = await socialMediaService.copyLink(post);
          alert(result.message);
          break;
        case 'native':
          await socialMediaService.nativeShare(post);
          break;
        default:
          console.warn('Unknown share platform:', platform);
      }

      // Track the share for analytics
      socialMediaService.trackShare(post.id, platform);

      setShowShareOptions(false);
      setShareOptionsPost(null);
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to copy link
      try {
        const result = await socialMediaService.copyLink(post);
        alert(result.message);
      } catch (fallbackError) {
        alert('Unable to share post. Please copy the URL manually.');
      }
    }
  };

  const handleViewAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
    // Mark as viewed (if API available)
    if (announcement.id) {
      markAnnouncementAsViewed(announcement.id).catch(console.warn);
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
        <div className="feed-loading">
          <div className="loading-spinner"></div>
          <p>Loading your feed...</p>
        </div>

        {/* Skeleton loaders for posts */}
        <div className="posts-section">
          <div className="skeleton-posts">
            {[1, 2, 3].map((i) => (
              <div key={i} className="post-card skeleton">
                <div className="post-header skeleton">
                  <div className="post-author">
                    <div className="skeleton-avatar"></div>
                    <div className="skeleton-text short"></div>
                  </div>
                </div>
                <div className="skeleton-text title"></div>
                <div className="skeleton-text content"></div>
                <div className="skeleton-media"></div>
                <div className="post-footer skeleton">
                  <div className="skeleton-text actions"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
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
                {post.imageUrl && post.type === 'image' && (
                  <div className="post-media">
                    <img src={post.imageUrl} alt={post.title} loading="lazy" />
                    <div className="media-overlay">
                      <span className="media-type">📷 Image</span>
                    </div>
                  </div>
                )}

                {post.videoUrl && post.type === 'video' && (
                  <div className="post-media">
                    <video controls preload="metadata" poster={post.imageUrl}>
                      <source src={post.videoUrl} type={post.mimeType || 'video/mp4'} />
                      <source src={post.videoUrl} type="video/webm" />
                      <source src={post.videoUrl} type="video/ogg" />
                      Your browser does not support the video tag.
                    </video>
                    <div className="media-overlay">
                      <span className="media-type">🎥 Video</span>
                    </div>
                  </div>
                )}

                <div className="post-footer">
                  <button
                    className={`post-action like-button ${post.likedBy?.includes(user?.id) ? 'liked' : ''}`}
                    data-post-id={post.id}
                    onClick={() => handleLike(post.id)}
                    title={post.likedBy?.includes(user?.id) ? 'Unlike post' : 'Like post'}
                  >
                    <Heart size={16} fill={post.likedBy?.includes(user?.id) ? 'currentColor' : 'none'} />
                    {post.likes || 0}
                  </button>
                  <button
                    className="post-action"
                    onClick={() => {
                      if (!user) {
                        alert('Please log in to view comments');
                        return;
                      }
                      setSelectedPost(post);
                      setShowComments(true);
                    }}
                    title={user ? "View comments" : "Log in to view comments"}
                  >
                    <MessageCircle size={16} />
                    {post.comments?.length || 0}
                  </button>
                  <span className="post-action">
                    <Eye size={16} />
                    {post.views || 0}
                  </span>
                  <div className="share-dropdown">
                    <button
                      className="post-action"
                      onClick={() => handleShare(post)}
                      title="Share post"
                    >
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                {showComments && selectedPost && (
                  <div className="post-comments-section">
                    <Comments
                      postId={selectedPost.id}
                      comments={selectedPost.comments || []}
                      onCommentAdded={() => {
                        loadFeedData();
                        setShowComments(false);
                      }}
                      inline={true}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {posts.length === 0 && announcements.length === 0 && (
        <div className="feed-empty">
          <div className="empty-state-icon">📭</div>
          <h3>Welcome to your dashboard!</h3>
          <p>It looks like there are no posts or announcements yet. Check back later for updates from your school community.</p>
          <div className="empty-state-actions">
            <button className="btn btn-primary" onClick={() => window.location.href = '/admin'}>
              Create First Post
            </button>
          </div>
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

      {/* Share Options Modal */}
      {showShareOptions && shareOptionsPost && (
        <div className="share-modal-overlay" onClick={() => setShowShareOptions(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal-header">
              <h3>Share this post</h3>
              <button
                className="share-modal-close"
                onClick={() => setShowShareOptions(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="share-options">
              <button
                className="share-option facebook"
                onClick={() => handleSocialShare('facebook', shareOptionsPost)}
              >
                <Facebook size={20} />
                <span>Facebook</span>
              </button>

              <button
                className="share-option twitter"
                onClick={() => handleSocialShare('twitter', shareOptionsPost)}
              >
                <Twitter size={20} />
                <span>Twitter</span>
              </button>

              <button
                className="share-option linkedin"
                onClick={() => handleSocialShare('linkedin', shareOptionsPost)}
              >
                <Linkedin size={20} />
                <span>LinkedIn</span>
              </button>

              <button
                className="share-option whatsapp"
                onClick={() => handleSocialShare('whatsapp', shareOptionsPost)}
              >
                <MessageSquare size={20} />
                <span>WhatsApp</span>
              </button>

              <button
                className="share-option telegram"
                onClick={() => handleSocialShare('telegram', shareOptionsPost)}
              >
                <MessageSquare size={20} />
                <span>Telegram</span>
              </button>

              <button
                className="share-option copy"
                onClick={() => handleSocialShare('copy', shareOptionsPost)}
              >
                <Copy size={20} />
                <span>Copy Link</span>
              </button>

              {navigator.share && (
                <button
                  className="share-option native"
                  onClick={() => handleSocialShare('native', shareOptionsPost)}
                >
                  <LinkIcon size={20} />
                  <span>More Options</span>
                </button>
              )}
            </div>

            <div className="share-modal-footer">
              <p className="share-post-title">{shareOptionsPost.title}</p>
              <p className="share-post-excerpt">{shareOptionsPost.excerpt}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardFeed;

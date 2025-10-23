import { useState, useEffect } from 'react';
import { Heart, Share2, MessageCircle, TrendingUp, Users, Eye } from 'lucide-react';
import './PostAnalytics.css';

const PostAnalytics = ({ postId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [postId]);

  const loadAnalytics = async () => {
    try {
      // This would call your analytics API
      // For now, using mock data
      const mockData = {
        likes: Math.floor(Math.random() * 100) + 10,
        shares: Math.floor(Math.random() * 50) + 5,
        comments: Math.floor(Math.random() * 30) + 3,
        views: Math.floor(Math.random() * 500) + 50,
        sharePlatforms: {
          facebook: Math.floor(Math.random() * 20),
          twitter: Math.floor(Math.random() * 15),
          linkedin: Math.floor(Math.random() * 10),
          whatsapp: Math.floor(Math.random() * 25),
          telegram: Math.floor(Math.random() * 8)
        },
        recentActivity: [
          { type: 'like', user: 'John Doe', time: '2 hours ago' },
          { type: 'share', platform: 'Facebook', user: 'Jane Smith', time: '4 hours ago' },
          { type: 'comment', user: 'Mike Johnson', time: '6 hours ago' }
        ]
      };

      setAnalytics(mockData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="post-analytics">
        <div className="analytics-loading">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="post-analytics">
        <div className="analytics-error">Failed to load analytics</div>
      </div>
    );
  }

  return (
    <div className="post-analytics">
      <div className="analytics-header">
        <h3>Post Performance</h3>
        <div className="analytics-summary">
          <div className="summary-item">
            <Heart size={16} />
            <span>{analytics.likes} likes</span>
          </div>
          <div className="summary-item">
            <Share2 size={16} />
            <span>{analytics.shares} shares</span>
          </div>
          <div className="summary-item">
            <MessageCircle size={16} />
            <span>{analytics.comments} comments</span>
          </div>
          <div className="summary-item">
            <Eye size={16} />
            <span>{analytics.views} views</span>
          </div>
        </div>
      </div>

      <div className="analytics-sections">
        {/* Share Platforms Breakdown */}
        <div className="analytics-section">
          <h4>Share Platforms</h4>
          <div className="platform-stats">
            {Object.entries(analytics.sharePlatforms).map(([platform, count]) => (
              <div key={platform} className="platform-stat">
                <div className={`platform-icon ${platform}`}>
                  {platform === 'facebook' && '📘'}
                  {platform === 'twitter' && '🐦'}
                  {platform === 'linkedin' && '💼'}
                  {platform === 'whatsapp' && '💬'}
                  {platform === 'telegram' && '✈️'}
                </div>
                <span className="platform-name">{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                <span className="platform-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="analytics-section">
          <h4>Recent Activity</h4>
          <div className="activity-list">
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  {activity.type === 'like' && <Heart size={14} />}
                  {activity.type === 'share' && <Share2 size={14} />}
                  {activity.type === 'comment' && <MessageCircle size={14} />}
                </div>
                <div className="activity-details">
                  <span className="activity-user">{activity.user}</span>
                  {activity.type === 'share' && (
                    <span className="activity-platform">shared on {activity.platform}</span>
                  )}
                  {activity.type === 'comment' && (
                    <span className="activity-comment">commented</span>
                  )}
                  {activity.type === 'like' && (
                    <span className="activity-like">liked the post</span>
                  )}
                </div>
                <span className="activity-time">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="analytics-section">
          <h4>Engagement Rate</h4>
          <div className="engagement-metrics">
            <div className="engagement-metric">
              <div className="metric-label">Like Rate</div>
              <div className="metric-value">
                {((analytics.likes / analytics.views) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="engagement-metric">
              <div className="metric-label">Share Rate</div>
              <div className="metric-value">
                {((analytics.shares / analytics.views) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="engagement-metric">
              <div className="metric-label">Comment Rate</div>
              <div className="metric-value">
                {((analytics.comments / analytics.views) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostAnalytics;

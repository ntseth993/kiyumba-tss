import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Image, Video, MessageSquare, Upload, Trash2, Eye } from 'lucide-react';
import './AdminContent.css';

const AdminContent = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    type: 'text',
    title: '',
    content: '',
    imageUrl: '',
    videoUrl: ''
  });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('posts') || '[]');
    setPosts(stored);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const post = {
      id: Date.now(),
      ...newPost,
      author: 'Admin',
      date: new Date().toISOString(),
      likes: 0,
      comments: []
    };

    const updatedPosts = [post, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem('posts', JSON.stringify(updatedPosts));
    
    setNewPost({ type: 'text', title: '', content: '', imageUrl: '', videoUrl: '' });
    alert('Post created successfully!');
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this post?')) {
      const updated = posts.filter(p => p.id !== id);
      setPosts(updated);
      localStorage.setItem('posts', JSON.stringify(updated));
    }
  };

  return (
    <div className="admin-content">
      <Navbar />
      
      <div className="dashboard-container">
        <div className="page-header">
          <h1>Content Management</h1>
          <p>Create and manage posts, images, and videos</p>
        </div>

        {/* Create Post Section */}
        <div className="create-post-section card">
          <h2>Create New Post</h2>
          
          <div className="post-type-tabs">
            <button
              className={`type-tab ${newPost.type === 'text' ? 'active' : ''}`}
              onClick={() => setNewPost({...newPost, type: 'text'})}
            >
              <MessageSquare size={20} />
              Text Post
            </button>
            <button
              className={`type-tab ${newPost.type === 'image' ? 'active' : ''}`}
              onClick={() => setNewPost({...newPost, type: 'image'})}
            >
              <Image size={20} />
              Image Post
            </button>
            <button
              className={`type-tab ${newPost.type === 'video' ? 'active' : ''}`}
              onClick={() => setNewPost({...newPost, type: 'video'})}
            >
              <Video size={20} />
              Video Post
            </button>
          </div>

          <form onSubmit={handleSubmit} className="post-form">
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                placeholder="Enter post title"
                required
              />
            </div>

            <div className="form-group">
              <label>Content *</label>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                placeholder="Write your content here..."
                rows="6"
                required
              ></textarea>
            </div>

            {newPost.type === 'image' && (
              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  value={newPost.imageUrl}
                  onChange={(e) => setNewPost({...newPost, imageUrl: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            )}

            {newPost.type === 'video' && (
              <div className="form-group">
                <label>Video URL (YouTube/Vimeo)</label>
                <input
                  type="url"
                  value={newPost.videoUrl}
                  onChange={(e) => setNewPost({...newPost, videoUrl: e.target.value})}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary">
              <Upload size={18} />
              Publish Post
            </button>
          </form>
        </div>

        {/* Posts List */}
        <div className="posts-section card">
          <h2>Recent Posts ({posts.length})</h2>
          
          {posts.length === 0 ? (
            <div className="empty-state">
              <p>No posts yet. Create your first post above!</p>
            </div>
          ) : (
            <div className="posts-grid">
              {posts.map(post => (
                <div key={post.id} className="post-card card">
                  <div className="post-header">
                    <div>
                      <span className={`post-type-badge ${post.type}`}>
                        {post.type === 'image' && <Image size={14} />}
                        {post.type === 'video' && <Video size={14} />}
                        {post.type === 'text' && <MessageSquare size={14} />}
                        {post.type}
                      </span>
                      <h3>{post.title}</h3>
                      <p className="post-meta">
                        By {post.author} • {new Date(post.date).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      className="btn-icon delete"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <p className="post-content">{post.content}</p>
                  
                  {post.imageUrl && (
                    <div className="post-media">
                      <img src={post.imageUrl} alt={post.title} />
                    </div>
                  )}
                  
                  {post.videoUrl && (
                    <div className="post-media">
                      <div className="video-placeholder">
                        <Video size={48} />
                        <p>Video: {post.videoUrl}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="post-stats">
                    <span>{post.likes} likes</span>
                    <span>{post.comments.length} comments</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminContent;

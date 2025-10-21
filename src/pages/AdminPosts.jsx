import { useState, useEffect } from 'react';
import { getPosts, createPost, updatePost, deletePost, togglePostVisibility, uploadMedia } from '../services/postsService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FileText, Plus, Edit, Trash2, Eye, EyeOff, Image as ImageIcon, Video, X, Upload } from 'lucide-react';
import './AdminPosts.css';

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    author: 'Admin',
    type: 'blog',
    mediaUrl: '',
    visible: true
  });
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await getPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploadingMedia(true);
    try {
      const mediaData = await uploadMedia(file);
      setFormData(prev => ({
        ...prev,
        mediaUrl: mediaData.url,
        type: mediaData.type
      }));
    } catch (error) {
      console.error('Error uploading media:', error);
      alert('Failed to upload media');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.excerpt.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editingPost) {
        await updatePost(editingPost.id, formData);
        alert('Post updated successfully!');
      } else {
        await createPost(formData);
        const visibilityMsg = formData.visible 
          ? '✅ Post created and is now visible to all users on their dashboards!' 
          : 'Post created but is hidden. Toggle visibility to make it visible to users.';
        alert(visibilityMsg);
      }
      
      await loadPosts();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post');
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content || '',
      author: post.author || 'Admin',
      type: post.type || 'blog',
      mediaUrl: post.mediaUrl || '',
      visible: post.visible !== false
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(id);
        await loadPosts();
        alert('Post deleted successfully!');
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post');
      }
    }
  };

  const handleToggleVisibility = async (id) => {
    try {
      await togglePostVisibility(id);
      await loadPosts();
    } catch (error) {
      console.error('Error toggling visibility:', error);
      alert('Failed to toggle visibility');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPost(null);
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      author: 'Admin',
      type: 'blog',
      mediaUrl: '',
      visible: true
    });
  };

  const filteredPosts = filterType === 'all' 
    ? posts 
    : posts.filter(p => p.type === filterType);

  return (
    <div className="admin-posts-page">
      <Navbar />
      <div className="admin-posts-container">
        <div className="page-header">
          <div>
            <h1><FileText size={32} /> Manage Posts</h1>
            <p>Create and manage blog posts, images, and videos</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            Create New Post
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button 
            className={filterType === 'all' ? 'active' : ''}
            onClick={() => setFilterType('all')}
          >
            All Posts ({posts.length})
          </button>
          <button 
            className={filterType === 'blog' ? 'active' : ''}
            onClick={() => setFilterType('blog')}
          >
            <FileText size={16} />
            Blogs ({posts.filter(p => p.type === 'blog').length})
          </button>
          <button 
            className={filterType === 'image' ? 'active' : ''}
            onClick={() => setFilterType('image')}
          >
            <ImageIcon size={16} />
            Images ({posts.filter(p => p.type === 'image').length})
          </button>
          <button 
            className={filterType === 'video' ? 'active' : ''}
            onClick={() => setFilterType('video')}
          >
            <Video size={16} />
            Videos ({posts.filter(p => p.type === 'video').length})
          </button>
        </div>

        {/* Posts Grid */}
        <div className="posts-management-grid">
          {filteredPosts.map((post) => (
            <div key={post.id} className="post-management-card">
              {post.mediaUrl && (
                <div className="post-thumbnail">
                  {post.type === 'image' && <img src={post.mediaUrl} alt={post.title} />}
                  {post.type === 'video' && (
                    <video>
                      <source src={post.mediaUrl} type="video/mp4" />
                    </video>
                  )}
                  <span className="post-type-badge">{post.type}</span>
                </div>
              )}
              <div className="post-card-content">
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <div className="post-meta">
                  <span className="post-author">{post.author || 'Admin'}</span>
                  <span className="post-date">
                    {new Date(post.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="post-stats">
                  <span>❤️ {post.likes || 0} likes</span>
                  <span>💬 {post.comments?.length || 0} comments</span>
                </div>
              </div>
              <div className="post-card-actions">
                <button 
                  className={`btn-icon ${post.visible !== false ? 'success' : 'muted'}`}
                  onClick={() => handleToggleVisibility(post.id)}
                  title={post.visible !== false ? 'Hide post' : 'Show post'}
                >
                  {post.visible !== false ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button 
                  className="btn-icon primary"
                  onClick={() => handleEdit(post)}
                  title="Edit post"
                >
                  <Edit size={16} />
                </button>
                <button 
                  className="btn-icon danger"
                  onClick={() => handleDelete(post.id)}
                  title="Delete post"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {filteredPosts.length === 0 && (
            <div className="empty-state">
              <FileText size={48} />
              <h3>No posts found</h3>
              <p>Create your first post to get started</p>
            </div>
          )}
        </div>

        {/* Create/Edit Post Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingPost ? 'Edit Post' : 'Create New Post'}</h2>
                <button className="close-btn" onClick={handleCloseModal}>
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Post Type *</label>
                    <div className="radio-group">
                      <label>
                        <input
                          type="radio"
                          value="blog"
                          checked={formData.type === 'blog'}
                          onChange={(e) => setFormData({...formData, type: e.target.value})}
                        />
                        <FileText size={18} />
                        Blog Post
                      </label>
                      <label>
                        <input
                          type="radio"
                          value="image"
                          checked={formData.type === 'image'}
                          onChange={(e) => setFormData({...formData, type: e.target.value})}
                        />
                        <ImageIcon size={18} />
                        Image Post
                      </label>
                      <label>
                        <input
                          type="radio"
                          value="video"
                          checked={formData.type === 'video'}
                          onChange={(e) => setFormData({...formData, type: e.target.value})}
                        />
                        <Video size={18} />
                        Video Post
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Enter post title"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Excerpt/Summary *</label>
                    <textarea
                      value={formData.excerpt}
                      onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                      placeholder="Short description (shown in previews)"
                      rows="3"
                      required
                    />
                  </div>

                  {formData.type === 'blog' && (
                    <div className="form-group">
                      <label>Full Content</label>
                      <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                        placeholder="Write your full blog post content here..."
                        rows="8"
                      />
                    </div>
                  )}

                  {(formData.type === 'image' || formData.type === 'video') && (
                    <div className="form-group">
                      <label>Upload {formData.type === 'image' ? 'Image' : 'Video'}</label>
                      <div className="upload-area">
                        <input
                          type="file"
                          accept={formData.type === 'image' ? 'image/*' : 'video/*'}
                          onChange={handleMediaUpload}
                          id="media-upload"
                          style={{ display: 'none' }}
                        />
                        <label htmlFor="media-upload" className="upload-label">
                          <Upload size={24} />
                          {uploadingMedia ? 'Uploading...' : `Click to upload ${formData.type}`}
                          <small>Max size: 10MB</small>
                        </label>
                        {formData.mediaUrl && (
                          <div className="media-preview">
                            {formData.type === 'image' && <img src={formData.mediaUrl} alt="Preview" />}
                            {formData.type === 'video' && (
                              <video controls>
                                <source src={formData.mediaUrl} type="video/mp4" />
                              </video>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Author Name</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({...formData, author: e.target.value})}
                      placeholder="Author name"
                    />
                  </div>

                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.visible}
                        onChange={(e) => setFormData({...formData, visible: e.target.checked})}
                      />
                      Make post visible immediately
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={uploadingMedia}>
                    {editingPost ? 'Update Post' : 'Create Post'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AdminPosts;

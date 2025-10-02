import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Image, Video, MessageSquare, Upload, Trash2, Eye, FileUp, X, Heart } from 'lucide-react';
import { getPosts, createPost, updatePost, deletePost, togglePostVisibility } from '../services/postsService';
import ImageCropper from '../components/ImageCropper';
import ImageCarousel from '../components/ImageCarousel';
import './AdminContent.css';

const AdminContent = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    type: 'text',
    title: '',
    content: '',
    imageUrl: '',
    images: [],
    videoUrl: '',
    textSize: 'medium'
  });
  const [errors, setErrors] = useState({});
  const [editingPostId, setEditingPostId] = useState(null);
  const [editPost, setEditPost] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imagesToCrop, setImagesToCrop] = useState([]);
  const [currentCropIndex, setCurrentCropIndex] = useState(0);
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef(null);
  const multiFileInputRef = useRef(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await getPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
      alert('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        if (file.type.startsWith('image/')) {
          setNewPost({...newPost, type: 'image', imageUrl: content});
        } else if (file.type.startsWith('text/')) {
          setNewPost({...newPost, content: content});
        }
        setUploadedFile(file);
      };
      
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('text/')) {
        reader.readAsText(file);
      }
    }
  };

  const handleMultipleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) return;

    const imagePromises = imageFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then(images => {
      setImagesToCrop(images);
      setCurrentCropIndex(0);
      setShowCropper(true);
    });
  };

  const handleCropComplete = (croppedImage) => {
    const updatedImages = [...newPost.images, croppedImage];
    setNewPost({...newPost, images: updatedImages, type: 'image'});

    // Move to next image or close cropper
    if (currentCropIndex < imagesToCrop.length - 1) {
      setCurrentCropIndex(prev => prev + 1);
    } else {
      setShowCropper(false);
      setImagesToCrop([]);
      setCurrentCropIndex(0);
      if (multiFileInputRef.current) multiFileInputRef.current.value = '';
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImagesToCrop([]);
    setCurrentCropIndex(0);
    if (multiFileInputRef.current) multiFileInputRef.current.value = '';
  };

  const removeImage = (index) => {
    const updatedImages = newPost.images.filter((_, i) => i !== index);
    setNewPost({...newPost, images: updatedImages});
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!newPost.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (newPost.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (newPost.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }
    
    if (!newPost.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (newPost.content.length < 10) {
      newErrors.content = 'Content must be at least 10 characters';
    }
    
    if (newPost.type === 'image' && newPost.imageUrl && !isValidUrl(newPost.imageUrl)) {
      newErrors.imageUrl = 'Please enter a valid URL';
    }
    
    if (newPost.type === 'video' && newPost.videoUrl && !isValidUrl(newPost.videoUrl)) {
      newErrors.videoUrl = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const postData = {
        ...newPost,
        textSize: newPost.textSize || 'medium',
        visible: true,
        author: 'Admin',
        fileName: uploadedFile ? uploadedFile.name : null
      };

      await createPost(postData);
      await loadPosts();
      
      setNewPost({ type: 'text', title: '', content: '', imageUrl: '', images: [], videoUrl: '', textSize: 'medium' });
      setUploadedFile(null);
      setErrors({});
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (multiFileInputRef.current) multiFileInputRef.current.value = '';
      alert('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this post?')) {
      setLoading(true);
      try {
        await deletePost(id);
        await loadPosts();
        alert('Post deleted successfully!');
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post');
      } finally {
        setLoading(false);
      }
    }
  };

  const startEdit = (post) => {
    setEditingPostId(post.id);
    setEditPost({ ...post });
  };

  const cancelEdit = () => {
    setEditingPostId(null);
    setEditPost(null);
  };

  const handleEditChange = (field, value) => {
    setEditPost(prev => ({ ...prev, [field]: value }));
  };

  const validateEditForm = () => {
    if (!editPost.title.trim() || editPost.title.length < 3) {
      alert('Title must be at least 3 characters');
      return false;
    }
    if (!editPost.content.trim() || editPost.content.length < 10) {
      alert('Content must be at least 10 characters');
      return false;
    }
    if (editPost.imageUrl && !isValidUrl(editPost.imageUrl)) {
      alert('Please enter a valid image URL');
      return false;
    }
    if (editPost.videoUrl && !isValidUrl(editPost.videoUrl)) {
      alert('Please enter a valid video URL');
      return false;
    }
    return true;
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    
    if (!validateEditForm()) {
      return;
    }
    
    setLoading(true);
    try {
      await updatePost(editingPostId, editPost);
      await loadPosts();
      setEditingPostId(null);
      setEditPost(null);
      alert('Post updated successfully!');
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (id) => {
    setLoading(true);
    try {
      await togglePostVisibility(id);
      await loadPosts();
    } catch (error) {
      console.error('Error toggling visibility:', error);
      alert('Failed to toggle visibility');
    } finally {
      setLoading(false);
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
              <label>
                <FileUp size={18} />
                Upload Multiple Images (Optional)
              </label>
              <input
                ref={multiFileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleMultipleImageUpload}
                className="file-input"
              />
              <p className="file-hint">Select multiple images to upload and crop</p>
              
              {newPost.images.length > 0 && (
                <div className="uploaded-images-preview">
                  <p className="file-info">{newPost.images.length} image(s) uploaded</p>
                  <div className="images-grid">
                    {newPost.images.map((img, index) => (
                      <div key={index} className="preview-image-item">
                        <img src={img} alt={`Preview ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => removeImage(index)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                placeholder="Enter post title"
                required
                maxLength="100"
              />
              {errors.title && <span className="error-text">{errors.title}</span>}
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
              {errors.content && <span className="error-text">{errors.content}</span>}
            </div>

            <div className="form-group">
              <label>Text Size</label>
              <select
                value={newPost.textSize}
                onChange={(e) => setNewPost({...newPost, textSize: e.target.value})}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
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
                {errors.imageUrl && <span className="error-text">{errors.imageUrl}</span>}
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
                {errors.videoUrl && <span className="error-text">{errors.videoUrl}</span>}
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
                      <h3>{post.title} {post.visible === false && <span className="badge hidden">Hidden</span>}</h3>
                      <p className="post-meta">
                        By {post.author} • {new Date(post.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="post-actions">
                      <button className="btn-icon" onClick={() => handleToggleVisibility(post.id)} title={post.visible ? 'Hide post' : 'Show post'} disabled={loading}>
                        <Eye size={18} />
                      </button>
                      <button className="btn-icon" onClick={() => startEdit(post)} title="Edit post">
                        Edit
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => handleDelete(post.id)}
                        title="Delete post"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {editingPostId === post.id ? (
                    <form className="edit-post-form" onSubmit={saveEdit}>
                      <div className="form-group">
                        <label>Title</label>
                        <input type="text" value={editPost.title} onChange={(e) => handleEditChange('title', e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label>Content</label>
                        <textarea rows="5" value={editPost.content} onChange={(e) => handleEditChange('content', e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label>Image URL</label>
                        <input type="url" value={editPost.imageUrl || ''} onChange={(e) => handleEditChange('imageUrl', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Video URL</label>
                        <input type="url" value={editPost.videoUrl || ''} onChange={(e) => handleEditChange('videoUrl', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Text Size</label>
                        <select value={editPost.textSize || 'medium'} onChange={(e) => handleEditChange('textSize', e.target.value)}>
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </div>
                      <div className="form-group form-row">
                        <label>
                          <input type="checkbox" checked={editPost.visible !== false} onChange={(e) => handleEditChange('visible', e.target.checked)} /> Visible
                        </label>
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn btn-primary">Save</button>
                        <button type="button" className="btn btn-outline" onClick={cancelEdit}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p className="post-content" style={{ fontSize: post.textSize === 'small' ? '14px' : post.textSize === 'large' ? '18px' : '16px' }}>{post.content}</p>
                      
                      {post.images && post.images.length > 0 && (
                        <ImageCarousel images={post.images} />
                      )}
                      
                      {post.imageUrl && !post.images?.length && (
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
                        <div className="likes-section">
                          <Heart size={18} fill="#EF4444" color="#EF4444" />
                          <span>{post.likes || 0} likes</span>
                          {post.likedBy && post.likedBy.length > 0 && (
                            <div className="liked-by-list">
                              <p className="liked-by-title">Liked by:</p>
                              <ul>
                                {post.likedBy.slice(0, 5).map((userId, idx) => (
                                  <li key={idx}>{userId}</li>
                                ))}
                                {post.likedBy.length > 5 && (
                                  <li>and {post.likedBy.length - 5} more...</li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                        <span>{post.comments?.length || 0} comments</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCropper && imagesToCrop.length > 0 && (
        <ImageCropper
          image={imagesToCrop[currentCropIndex]}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      <Footer />
    </div>
  );
};

export default AdminContent;

import { useState, useEffect } from 'react';
import { getPosts, uploadMedia } from '../services/postsService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Image as ImageIcon, Video, Upload, X, Trash2, Download } from 'lucide-react';
import './AdminMediaLibrary.css';

const AdminMediaLibrary = () => {
  const [mediaItems, setMediaItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState('image');
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    loadMediaFromPosts();
  }, []);

  const loadMediaFromPosts = async () => {
    try {
      const posts = await getPosts();
      const media = posts
        .filter(p => p.mediaUrl)
        .map(p => ({
          id: p.id,
          url: p.mediaUrl,
          type: p.type,
          title: p.title,
          date: p.date,
          postId: p.id
        }));
      setMediaItems(media);
    } catch (error) {
      console.error('Error loading media:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      const mediaData = await uploadMedia(file);
      setPreviewUrl(mediaData.url);
      setUploadType(mediaData.type);
      alert('Media uploaded successfully! You can now use it in posts.');
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (url, title) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = title || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredMedia = filter === 'all' 
    ? mediaItems 
    : mediaItems.filter(m => m.type === filter);

  return (
    <div className="media-library-page">
      <Navbar />
      <div className="media-library-container">
        <div className="page-header">
          <div>
            <h1><ImageIcon size={32} /> Media Library</h1>
            <p>Manage images and videos used in posts</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
            <Upload size={20} />
            Upload Media
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All Media ({mediaItems.length})
          </button>
          <button 
            className={filter === 'image' ? 'active' : ''}
            onClick={() => setFilter('image')}
          >
            <ImageIcon size={16} />
            Images ({mediaItems.filter(m => m.type === 'image').length})
          </button>
          <button 
            className={filter === 'video' ? 'active' : ''}
            onClick={() => setFilter('video')}
          >
            <Video size={16} />
            Videos ({mediaItems.filter(m => m.type === 'video').length})
          </button>
        </div>

        {/* Media Grid */}
        <div className="media-grid">
          {filteredMedia.map((item) => (
            <div key={item.id} className="media-card">
              <div className="media-thumbnail">
                {item.type === 'image' && (
                  <img src={item.url} alt={item.title} />
                )}
                {item.type === 'video' && (
                  <video>
                    <source src={item.url} type="video/mp4" />
                  </video>
                )}
                <div className="media-overlay">
                  <button 
                    className="overlay-btn"
                    onClick={() => handleDownload(item.url, item.title)}
                    title="Download"
                  >
                    <Download size={18} />
                  </button>
                </div>
              </div>
              <div className="media-info">
                <h4>{item.title}</h4>
                <p className="media-date">
                  {new Date(item.date).toLocaleDateString()}
                </p>
                <span className="media-type-badge">{item.type}</span>
              </div>
            </div>
          ))}

          {filteredMedia.length === 0 && (
            <div className="empty-state">
              <ImageIcon size={48} />
              <h3>No media found</h3>
              <p>Upload images or videos to get started</p>
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Upload Media</h2>
                <button className="close-btn" onClick={() => setShowUploadModal(false)}>
                  <X size={24} />
                </button>
              </div>
              
              <div className="modal-body">
                <div className="upload-section">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    id="file-upload"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="file-upload" className="upload-area-large">
                    <Upload size={48} />
                    <h3>Click to upload or drag and drop</h3>
                    <p>Images and videos up to 10MB</p>
                  </label>

                  {uploading && (
                    <div className="uploading-indicator">
                      <div className="spinner"></div>
                      <p>Uploading...</p>
                    </div>
                  )}

                  {previewUrl && (
                    <div className="upload-preview">
                      <h4>Upload Complete!</h4>
                      {uploadType === 'image' && (
                        <img src={previewUrl} alt="Uploaded" />
                      )}
                      {uploadType === 'video' && (
                        <video controls>
                          <source src={previewUrl} type="video/mp4" />
                        </video>
                      )}
                      <p>You can now use this media in your posts.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline" onClick={() => {
                  setShowUploadModal(false);
                  setPreviewUrl('');
                }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AdminMediaLibrary;

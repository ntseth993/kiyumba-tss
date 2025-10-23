import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const ImageUpload = ({ value, onChange, placeholder = "Upload an image", className = "" }) => {
  const [preview, setPreview] = useState(value || '');
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = (files) => {
    const file = files[0];
    if (file && file.type.match('image.*')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        setPreview(base64);
        onChange(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    handleFiles(e.target.files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeImage = () => {
    setPreview('');
    onChange('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  return (
    <div className={`image-upload-container ${className}`}>
      <label className="image-upload-label">Image</label>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />

      {/* Upload area */}
      <div
        className={`image-upload-area ${dragActive ? 'drag-active' : ''} ${preview ? 'has-image' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        {preview ? (
          <div className="image-preview-container">
            <img src={preview} alt="Preview" className="image-preview" />
            <button
              type="button"
              className="image-remove-btn"
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="image-upload-prompt">
            <div className="upload-icon">
              <Upload size={32} />
            </div>
            <div className="upload-text">
              <span className="upload-primary">{placeholder}</span>
              <span className="upload-secondary">or drag and drop</span>
            </div>
          </div>
        )}
      </div>

      {/* URL input fallback */}
      <div className="image-url-fallback">
        <label className="url-label">Or enter image URL:</label>
        <input
          type="url"
          value={value && !preview ? value : ''}
          onChange={(e) => {
            setPreview(e.target.value);
            onChange(e.target.value);
          }}
          placeholder="https://example.com/image.jpg"
          className="url-input"
        />
      </div>
    </div>
  );
};

export default ImageUpload;

import { useState, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { applyEffectsToImage } from '../utils/imageEffects';
import './ImageEditorModal.css';

const ImageEditorModal = ({ isOpen, onClose, onSave, initialImage }) => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [effects, setEffects] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('crop'); // 'crop' or 'effects'

  useEffect(() => {
    if (initialImage) {
      setImage(initialImage);
      setPreviewUrl(URL.createObjectURL(initialImage));
    }
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [initialImage]);

  const onCropComplete = (croppedArea, croppedAreaPixelsData) => {
    setCroppedAreaPixels(croppedAreaPixelsData);
  };

  const handleEffectChange = (effect, value) => {
    setEffects(prev => ({ ...prev, [effect]: value }));
  };

  const handleSave = async () => {
    if (!image || isProcessing) return;

    try {
      setIsProcessing(true);
      const processedFile = await applyEffectsToImage(
        previewUrl,
        effects,
        croppedAreaPixels,
        rotation
      );
      onSave(processedFile);
      onClose();
    } catch (error) {
      console.error('Error saving image:', error);
      alert('Failed to save image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="image-editor-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Image</h2>
          <div className="tab-buttons">
            <button 
              className={`tab-button ${activeTab === 'crop' ? 'active' : ''}`}
              onClick={() => setActiveTab('crop')}
            >
              Crop & Rotate
            </button>
            <button 
              className={`tab-button ${activeTab === 'effects' ? 'active' : ''}`}
              onClick={() => setActiveTab('effects')}
            >
              Adjust
            </button>
          </div>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        <div className="editor-container">
          {activeTab === 'crop' ? (
            <div className="crop-container">
              <div className="crop-area">
                <Cropper
                  image={previewUrl}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={16 / 9}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                  onCropComplete={onCropComplete}
                />
              </div>
              <div className="crop-controls">
                <div className="control-group">
                  <label>Zoom</label>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                  />
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <div className="control-group">
                  <label>Rotate</label>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value))}
                  />
                  <span>{rotation}°</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="effects-container">
              <div className="preview-area">
                <img src={previewUrl} alt="Preview" />
              </div>
              <div className="effects-controls">
                <div className="control-group">
                  <label>Brightness</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={effects.brightness}
                    onChange={(e) => handleEffectChange('brightness', parseInt(e.target.value))}
                  />
                  <span>{effects.brightness}%</span>
                </div>

                <div className="control-group">
                  <label>Contrast</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={effects.contrast}
                    onChange={(e) => handleEffectChange('contrast', parseInt(e.target.value))}
                  />
                  <span>{effects.contrast}%</span>
                </div>

                <div className="control-group">
                  <label>Saturation</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={effects.saturation}
                    onChange={(e) => handleEffectChange('saturation', parseInt(e.target.value))}
                  />
                  <span>{effects.saturation}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button 
            onClick={handleSave}
            disabled={isProcessing}
            className="save-button"
          >
            {isProcessing ? 'Processing...' : 'Save Changes'}
          </button>
          <button onClick={onClose} className="cancel-button">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditorModal;
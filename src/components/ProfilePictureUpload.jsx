import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, Upload, X } from 'lucide-react';

const ProfilePictureUpload = ({ size = 'medium', showName = false, className = '' }) => {
  const { user, updateProfilePicture } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const fileInputRef = useRef(null);

  const sizeClasses = {
    small: 'w-8 h-8 text-sm',
    medium: 'w-12 h-12 text-base',
    large: 'w-16 h-16 text-lg',
    xlarge: 'w-24 h-24 text-xl'
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image smaller than 5MB');
      return;
    }

    setIsUploading(true);
    setShowUploadOptions(false);

    try {
      const result = await updateProfilePicture(file);
      if (result.success) {
        // Success feedback could be added here
      } else {
        alert(result.error || 'Failed to update profile picture');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to update profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleRemovePicture = async () => {
    if (!user?.hasCustomAvatar) return;

    setIsUploading(true);
    setShowUploadOptions(false);

    try {
      // Create a default avatar based on user name and role
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 100;
      canvas.height = 100;

      // This would generate a default avatar - for now just reset to UI Avatars
      const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=${getRoleColor(user.role)}&color=fff&size=100`;

      const result = await updateProfilePicture(null, defaultAvatar);
      if (result.success) {
        // Success feedback
      }
    } catch (error) {
      console.error('Error removing profile picture:', error);
      alert('Failed to remove profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: '4F46E5',
      staff: '10B981',
      teacher: 'F59E0B',
      student: 'EF4444',
      dod: 'EF4444',
      dos: '4F46E5',
      accountant: '10B981',
      animateur: 'F59E0B',
      secretary: '8B5CF6'
    };
    return colors[role] || '6366F1';
  };

  return (
    <div className={`profile-picture-upload ${className}`}>
      <div className="relative inline-block">
        {/* Profile Picture */}
        <div
          className={`relative ${sizeClasses[size]} rounded-full overflow-hidden cursor-pointer group ${isUploading ? 'opacity-50' : ''}`}
          onClick={handleClick}
          title={isUploading ? 'Uploading...' : 'Click to change profile picture'}
        >
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=${getRoleColor(user?.role)}&color=fff`}
            alt={user?.name || 'Profile'}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Camera Icon Badge - Like Social Media */}
        <div 
          className={`absolute bottom-0 right-0 ${size === 'small' ? 'w-6 h-6' : size === 'medium' ? 'w-8 h-8' : size === 'large' ? 'w-10 h-10' : 'w-12 h-12'} bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-all shadow-lg border-3 border-white ${isUploading ? 'opacity-50' : ''}`}
          onClick={handleClick}
          title={isUploading ? 'Uploading...' : 'Change profile picture'}
          style={{ borderWidth: '3px' }}
        >
          {isUploading ? (
            <Upload size={size === 'small' ? 12 : size === 'medium' ? 16 : size === 'large' ? 18 : 22} className="text-white animate-pulse" />
          ) : (
            <Camera size={size === 'small' ? 12 : size === 'medium' ? 16 : size === 'large' ? 18 : 22} className="text-white" />
          )}
        </div>
      </div>

      {/* User Name (optional) */}
      {showName && user?.name && (
        <div className="mt-2 text-center">
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500 capitalize">{user.role}</p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
};

export default ProfilePictureUpload;

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Share2, Copy, Check, X } from 'lucide-react';
import './MeetingAccess.css';

const MeetingAccess = ({ meeting, onGenerateLink }) => {
  const { user } = useAuth();
  const [accessLink, setAccessLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [accessType, setAccessType] = useState('invite'); // 'invite' or 'public'

  const generateMeetingLink = async () => {
    try {
      // Generate a unique meeting link with token
      const link = await onGenerateLink({
        meetingId: meeting.id,
        accessType,
        allowedUsers: selectedUsers,
        expiresIn: '24h'
      });
      setAccessLink(link);
    } catch (error) {
      console.error('Error generating meeting link:', error);
    }
  };

  const copyLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(accessLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const handleAccessTypeChange = (type) => {
    setAccessType(type);
    if (type === 'public') {
      setSelectedUsers([]);
    }
  };

  return (
    <div className="meeting-access-control">
      <div className="access-header">
        <h3>Meeting Access Control</h3>
        <div className="access-type-toggle">
          <button
            className={`toggle-btn ${accessType === 'invite' ? 'active' : ''}`}
            onClick={() => handleAccessTypeChange('invite')}
          >
            Invite Only
          </button>
          <button
            className={`toggle-btn ${accessType === 'public' ? 'active' : ''}`}
            onClick={() => handleAccessTypeChange('public')}
          >
            Public Link
          </button>
        </div>
      </div>

      {accessType === 'invite' && (
        <div className="invite-section">
          <div className="user-select">
            <input
              type="text"
              placeholder="Search users to invite..."
              className="user-search"
            />
            <div className="selected-users">
              {selectedUsers.map(user => (
                <div key={user.id} className="selected-user">
                  <span>{user.name}</span>
                  <button onClick={() => setSelectedUsers(prev => prev.filter(u => u.id !== user.id))}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="link-section">
        {accessLink ? (
          <div className="generated-link">
            <input
              type="text"
              value={accessLink}
              readOnly
              className="link-input"
            />
            <button 
              className="copy-btn"
              onClick={copyLinkToClipboard}
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
        ) : (
          <button 
            className="generate-btn"
            onClick={generateMeetingLink}
          >
            <Share2 size={20} />
            Generate Meeting Link
          </button>
        )}
      </div>

      <div className="access-footer">
        <p className="access-note">
          {accessType === 'invite' 
            ? '⚠️ Only invited users will be able to join with this link'
            : '⚠️ Anyone with this link can join the meeting'}
        </p>
      </div>
    </div>
  );
};

export default MeetingAccess;
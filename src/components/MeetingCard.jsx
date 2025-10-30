import React from 'react';
import { Calendar, Clock, Users, MapPin, Video, ExternalLink } from 'lucide-react';

const MeetingCard = ({ meeting, onJoin, onViewDetails }) => {
  const locationInfo = getLocationInfo(meeting);
  
  return (
    <div className="meeting-card">
      <div className="meeting-card-header">
        <div className="meeting-status" data-status={meeting.status}>
          {meeting.status === 'active' && <span className="live-indicator"></span>}
          {getStatusLabel(meeting.status)}
        </div>
        <h3 className="meeting-title">{meeting.title}</h3>
      </div>

      <div className="meeting-info-grid">
        <div className="info-item">
          <Calendar size={16} />
          <span>{new Date(meeting.scheduledTime).toLocaleDateString()}</span>
        </div>
        <div className="info-item">
          <Clock size={16} />
          <span>{new Date(meeting.scheduledTime).toLocaleTimeString()}</span>
        </div>
        <div className="info-item">
          <Users size={16} />
          <span>{meeting.participants?.length || 0} Participants</span>
        </div>
        <div className="info-item location">
          <MapPin size={16} />
          <div className="location-details">
            <span className="location-type">{locationInfo.type}</span>
            <span className="location-label">
              {locationInfo.icon} {locationInfo.label}
            </span>
          </div>
        </div>
      </div>

      <div className="meeting-controls">
        {meeting.status === 'active' && (
          <button 
            className="control-btn primary" 
            onClick={() => onJoin(meeting)}
          >
            <Video size={20} />
            Join Now
          </button>
        )}
        
        {meeting.status === 'scheduled' && (
          <button 
            className="control-btn secondary"
            onClick={() => onJoin(meeting)}
          >
            <Calendar size={20} />
            Join When Ready
          </button>
        )}

        {locationInfo.type === 'Physical' && (
          <button 
            className="control-btn info"
            onClick={() => window.open(`https://maps.google.com?q=${encodeURIComponent(meeting.venue)}`, '_blank')}
          >
            <MapPin size={20} />
            View Map
          </button>
        )}

        <button 
          className="control-btn outline"
          onClick={() => onViewDetails(meeting)}
        >
          <ExternalLink size={20} />
          Details
        </button>
      </div>
    </div>
  );
};

export default MeetingCard;
import React from 'react';
import { Clock, UserCheck, UserX, X, Users } from 'lucide-react';
import './WaitingRoom.css';

const WaitingRoom = ({ user, pendingParticipants = [], onApprove, onDeny, isHost, onClose }) => {
  return (
    <div className="waiting-room">
      <div className="waiting-content">
        <div className="waiting-header">
          <h2>Manage Meeting Access</h2>
          {onClose && (
            <button className="close-waiting" onClick={onClose} title="Close">
              <X size={18} />
            </button>
          )}
        </div>

        {isHost ? (
          <>
            <p className="waiting-description">
              Review and manage participants waiting to join the meeting
            </p>
            
            <div className="waiting-list">
              {pendingParticipants.length > 0 ? (
                pendingParticipants.map(participant => (
                  <div key={participant.id} className="waiting-participant">
                    <div className="participant-info">
                      <span className="participant-name">{participant.name}</span>
                      <span className="participant-email">{participant.email}</span>
                      <span className="request-time">
                        Requested: {new Date(participant.requestedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="action-buttons">
                      <button 
                        className="approve-btn"
                        onClick={() => onApprove(participant)}
                        title="Allow participant to join"
                      >
                        <UserCheck size={20} />
                        Admit
                      </button>
                      <button 
                        className="deny-btn"
                        onClick={() => onDeny(participant)}
                        title="Deny access to meeting"
                      >
                        <UserX size={20} />
                        Deny
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-pending">
                  <Users size={32} className="icon" />
                  <p>No participants are waiting</p>
                  <span className="hint">When someone requests to join, they'll appear here</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="waiting-status">
            <Clock size={48} className="waiting-icon" />
            <h2>Waiting for Approval</h2>
            <p>The host has been notified of your request to join</p>
            <div className="status-details">
              <p><strong>Your Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </div>
            <div className="waiting-spinner"></div>
            <p className="waiting-hint">Please wait while the host reviews your request...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaitingRoom;
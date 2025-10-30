import React, { useState, useEffect } from 'react';
import { Users, ArrowLeft, MessageSquare, Clock } from 'lucide-react';
import './BreakoutRooms.css';

const BreakoutRooms = ({ 
  participants, 
  onCreateRooms, 
  onJoinRoom, 
  onEndRooms,
  onBroadcastMessage,
  className = ''
}) => {
  const [rooms, setRooms] = useState([]);
  const [roomCount, setRoomCount] = useState(2);
  const [duration, setDuration] = useState(15);
  const [assignment, setAssignment] = useState('random'); // random, manual
  const [message, setMessage] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    let timer;
    if (timeRemaining !== null && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      handleEndRooms();
    }
    return () => clearInterval(timer);
  }, [timeRemaining]);

  const handleCreateRooms = () => {
    const newRooms = [];
    let remainingParticipants = [...participants];

    if (assignment === 'random') {
      // Shuffle participants
      remainingParticipants.sort(() => Math.random() - 0.5);
    }

    // Calculate participants per room
    const participantsPerRoom = Math.ceil(remainingParticipants.length / roomCount);

    // Create rooms and assign participants
    for (let i = 0; i < roomCount && remainingParticipants.length > 0; i++) {
      const roomParticipants = remainingParticipants.splice(0, participantsPerRoom);
      newRooms.push({
        id: `room-${i + 1}`,
        name: `Room ${i + 1}`,
        participants: roomParticipants,
        messages: []
      });
    }

    setRooms(newRooms);
    setTimeRemaining(duration * 60);
    onCreateRooms(newRooms);
  };

  const handleEndRooms = () => {
    setRooms([]);
    setTimeRemaining(null);
    onEndRooms();
  };

  const handleBroadcastMessage = () => {
    if (!message.trim()) return;
    onBroadcastMessage(message);
    setMessage('');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`breakout-rooms ${className}`}>
      {rooms.length === 0 ? (
        <div className="setup-panel">
          <h3><Users size={20} /> Breakout Rooms Setup</h3>
          
          <div className="form-group">
            <label>Number of Rooms</label>
            <input
              type="number"
              min="2"
              max={Math.min(10, participants.length)}
              value={roomCount}
              onChange={(e) => setRoomCount(parseInt(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label>Duration (minutes)</label>
            <input
              type="number"
              min="5"
              max="60"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label>Assignment Method</label>
            <select
              value={assignment}
              onChange={(e) => setAssignment(e.target.value)}
            >
              <option value="random">Random</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          <button className="create-rooms-btn" onClick={handleCreateRooms}>
            Create Breakout Rooms
          </button>
        </div>
      ) : (
        <div className="rooms-panel">
          <div className="rooms-header">
            <button className="back-btn" onClick={handleEndRooms}>
              <ArrowLeft size={20} />
              End Rooms
            </button>
            {timeRemaining !== null && (
              <div className="timer">
                <Clock size={20} />
                {formatTime(timeRemaining)}
              </div>
            )}
          </div>

          <div className="rooms-grid">
            {rooms.map(room => (
              <div key={room.id} className="room-card">
                <h4>{room.name}</h4>
                <div className="participant-count">
                  <Users size={16} />
                  {room.participants.length} participants
                </div>
                <div className="participant-list">
                  {room.participants.map(participant => (
                    <div key={participant.id} className="participant-item">
                      {participant.name}
                    </div>
                  ))}
                </div>
                <button 
                  className="join-room-btn"
                  onClick={() => onJoinRoom(room.id)}
                >
                  Join Room
                </button>
              </div>
            ))}
          </div>

          <div className="broadcast-panel">
            <h4><MessageSquare size={16} /> Broadcast Message</h4>
            <div className="message-input">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message to all rooms..."
              />
              <button onClick={handleBroadcastMessage}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BreakoutRooms;
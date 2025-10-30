import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, Users, MessageSquare, Hand, Mic, MicOff, 
  Camera, CameraOff, Share2, Layout, CircleDot, Square,
  Type, Pencil, Users2, Download, Settings, ScreenShare,
  MonitorUp, Film, SplitSquareHorizontal, Lock, PictureInPicture, UserX
} from 'lucide-react';
import {
  checkIfHost,
  requestMeetingAccess,
  approveMeetingAccess,
  denyMeetingAccess,
  getPendingParticipants
} from '../services/meetingAccessService';
import signaling from '../services/wsSignaling';
import WaitingRoom from './WaitingRoom';
import { useAuth } from '../context/AuthContext';
import webRTCService from '../services/webRTCService';
import recordingService from '../services/recordingService';
import captionsService from '../services/captionsService';
import Whiteboard from './Whiteboard';
import BreakoutRooms from './BreakoutRooms';
import './LiveMeeting.css';

const LiveMeeting = ({ meetingId, accessToken }) => {
  const { user } = useAuth();
  const [meeting, setMeeting] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [pendingParticipants, setPendingParticipants] = useState([]);
  const [accessStatus, setAccessStatus] = useState('pending'); // 'pending', 'approved', 'denied'
  const [layout, setLayout] = useState('grid');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showBreakoutRooms, setShowBreakoutRooms] = useState(false);
  const [captions, setCaptions] = useState([]);
  const [showCaptions, setShowCaptions] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState('participants');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showWaitingRoom, setShowWaitingRoom] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [selectedMicrophone, setSelectedMicrophone] = useState(null);
  const [devices, setDevices] = useState({ cameras: [], microphones: [] });
  const [pingedUser, setPingedUser] = useState(null);
  const [quality, setQuality] = useState('auto');
  const [meetingStarted, setMeetingStarted] = useState(false);

  // Initialize signaling and handle meeting state
  useEffect(() => {
    if (!meetingId || !accessToken) return;
    
    signaling.init(meetingId, accessToken);
    
    const cleanup = signaling.onMessage((message) => {
      switch (message.type) {
        case 'meeting-started':
          setMeetingStarted(true);
          setAccessStatus('approved');
          break;
        case 'meeting-ended':
          setMeetingStarted(false);
          setAccessStatus('pending');
          break;
        case 'user-joined':
          setParticipants(prev => [...prev, message.userId]);
          break;
        case 'user-left':
          setParticipants(prev => prev.filter(id => id !== message.userId));
          break;
      }
    });

    // Check if meeting is already in progress
    const checkMeetingStatus = async () => {
      try {
        const response = await fetch(`/api/meetings/${meetingId}/status`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const data = await response.json();
        if (data.status === 'in-progress') {
          setMeetingStarted(true);
        }
      } catch (error) {
        console.error('Error checking meeting status:', error);
      }
    };

    checkMeetingStatus();

    return () => {
      cleanup();
      signaling.close();
    };
  }, [meetingId, accessToken]);
  const [bandwidth, setBandwidth] = useState('auto');
  const [virtualBackground, setVirtualBackground] = useState('none');
  const [isHost, setIsHost] = useState(false);
  const [isMeetingLocked, setIsMeetingLocked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [pollVisible, setPollVisible] = useState(false);
  const [currentPoll, setCurrentPoll] = useState(null);
  const [breakoutRooms, setBreakoutRooms] = useState([]);
  const [isFileShareOpen, setIsFileShareOpen] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  
  const localVideoRef = useRef(null);
  const screenShareRef = useRef(null);
  const screenShareStreamRef = useRef(null);
  const recordingRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnections = useRef({});

  useEffect(() => {
    if (!meetingId || !user) {
      console.error('No meeting ID or user provided');
      return;
    }
    
    requestAccess();
  }, [meetingId, user]);

  // Listen for storage events so participants detect approval/denial from host
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'pendingParticipants' || e.key === 'schoolMeetings') {
        try {
          const meetings = JSON.parse(localStorage.getItem('schoolMeetings') || '[]');
          const meeting = meetings.find(m => m.id === meetingId);
          if (meeting) {
            // If participant has been added to meeting participants, approve
            if (meeting.participants && meeting.participants.some(p => p.id === user.id)) {
              setAccessStatus('approved');
              return;
            }
          }

          const pending = JSON.parse(localStorage.getItem('pendingParticipants') || '{}');
          const isPending = (pending[meetingId] || []).some(p => p.id === user.id);
          if (!isPending && accessStatus === 'pending') {
            // If not pending and not approved, might be denied
            // Double-check meetings list
            if (meeting && meeting.participants && meeting.participants.some(p => p.id === user.id)) {
              setAccessStatus('approved');
            } else {
              setAccessStatus('denied');
            }
          }
        } catch (err) {
          // ignore
        }
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [meetingId, user, accessStatus]);

  // Load pending participants for hosts
  useEffect(() => {
    if (isHost) {
      const loadPendingParticipants = async () => {
        try {
          const pending = await getPendingParticipants(meetingId);
          setPendingParticipants(pending);
        } catch (error) {
          console.error('Error loading pending participants:', error);
        }
      };

      loadPendingParticipants();
      // Refresh pending participants list every 10 seconds
      const interval = setInterval(loadPendingParticipants, 10000);
      return () => clearInterval(interval);
    }
  }, [isHost, meetingId]);

  useEffect(() => {
    if (accessStatus === 'approved') {
      initializeDevices();
      loadMeeting();

      // initialize signaling channel for this meeting (local two-tab testing)
      try {
        signaling.init(`kiyumba-meeting-${meetingId}`);

        // forward webRTCService ice candidates via signaling
        webRTCService.sendIceCandidate = (participantId, candidate) => {
          signaling.send({
            type: 'ice-candidate',
            meetingId,
            from: user.id,
            to: participantId,
            candidate
          });
        };

        // handle incoming signaling messages
        signaling.onMessage(async (msg) => {
          if (!msg || msg.meetingId !== meetingId) return;

          // ignore messages from self
          if (msg.from === user.id) return;

          // Admin/command messages
          if (msg.type === 'command' && msg.target === user.id) {
            try {
              const cmd = msg.command;
              if (cmd === 'mute') {
                if (localStreamRef.current) {
                  localStreamRef.current.getAudioTracks().forEach(t => t.enabled = false);
                  setAudioEnabled(false);
                }
              }

              if (cmd === 'disableVideo') {
                if (localStreamRef.current) {
                  localStreamRef.current.getVideoTracks().forEach(t => t.enabled = false);
                  setVideoEnabled(false);
                }
              }

              if (cmd === 'makeHost') {
                // Promote this user to host
                setIsHost(true);
                setParticipants(prev => prev.map(p => p.id === user.id ? { ...p, isHost: true } : p));
              }

              if (cmd === 'grantControl') {
                // Give the user presenter/control privileges
                setParticipants(prev => prev.map(p => p.id === user.id ? { ...p, hasControl: true } : p));
              }

              if (cmd === 'kick') {
                // Deny access and cleanup
                setAccessStatus('denied');
                stopAllStreams();
              }
            } catch (err) {
              console.error('Error handling command message:', err);
            }
            return;
          }

          if (msg.type === 'join') {
            // a remote participant joined, create a peer connection and send offer
            const remoteId = msg.from;
            try {
              webRTCService.createPeerConnection(remoteId);
              const offer = await webRTCService.createOffer(remoteId);
              signaling.send({ type: 'offer', meetingId, from: user.id, to: remoteId, offer });
            } catch (err) {
              console.error('Error creating offer for', remoteId, err);
            }
          }

          if (msg.type === 'offer' && msg.to === user.id) {
            const remoteId = msg.from;
            try {
              // ensure peer connection exists
              webRTCService.createPeerConnection(remoteId);
              const answer = await webRTCService.handleOffer(remoteId, msg.offer);
              signaling.send({ type: 'answer', meetingId, from: user.id, to: remoteId, answer });
            } catch (err) {
              console.error('Error handling offer from', remoteId, err);
            }
          }

          if (msg.type === 'answer' && msg.to === user.id) {
            const remoteId = msg.from;
            try {
              await webRTCService.handleAnswer(remoteId, msg.answer);
            } catch (err) {
              console.error('Error handling answer from', remoteId, err);
            }
          }

          if (msg.type === 'ice-candidate' && msg.to === user.id) {
            try {
              await webRTCService.handleIceCandidate(msg.from, msg.candidate);
            } catch (err) {
              console.error('Error handling ICE candidate', err);
            }
          }
        });
      } catch (e) {
        console.warn('Signaling init failed (BroadcastChannel unavailable):', e);
      }

      const interval = setInterval(updateParticipants, 10000);
      return () => {
        clearInterval(interval);
        stopAllStreams();
        try { signaling.close(); } catch (e) {}
      };
    }
  }, [accessStatus]);

  // Admin commands are handled via signaling channel (BroadcastChannel or WebSocket)
  // Removed legacy window.postMessage handler in favor of signaling messages.

  const requestAccess = async () => {
    try {
      // Check if user is host
      const isHostResult = await checkIfHost(meetingId, user.id);
      setIsHost(isHostResult);

      if (isHostResult) {
        setAccessStatus('approved');
        // Load any pending participants immediately
        const pending = await getPendingParticipants(meetingId);
        setPendingParticipants(pending);
        return;
      }

      // Check if user is already in the meeting
      const meetings = JSON.parse(localStorage.getItem('schoolMeetings') || '[]');
      const meeting = meetings.find(m => m.id === meetingId);
      
      if (meeting?.participants?.some(p => p.id === user.id)) {
        setAccessStatus('approved');
        return;
      }

      // Request access for participants
      console.log('Requesting access for:', user.name);
      const result = await requestMeetingAccess(meetingId, {
        userId: user.id,
        name: user.name,
        email: user.email,
        requestedAt: new Date().toISOString()
      });

      if (result.autoApproved) {
        console.log('Access auto-approved');
        setAccessStatus('approved');
      } else {
        console.log('Waiting for host approval');
        setAccessStatus('pending');
      }
    } catch (error) {
      console.error('Error requesting access:', error);
      setAccessStatus('denied');
    }
  };

  const handleApproveParticipant = async (participant) => {
    try {
      await approveMeetingAccess(meetingId, participant.id);
      setPendingParticipants(prev => 
        prev.filter(p => p.id !== participant.id)
      );
      setParticipants(prev => [...prev, participant]);
    } catch (error) {
      console.error('Error approving participant:', error);
    }
  };

  const handleDenyParticipant = async (participant) => {
    try {
      await denyMeetingAccess(meetingId, participant.id);
      setPendingParticipants(prev => 
        prev.filter(p => p.id !== participant.id)
      );
    } catch (error) {
      console.error('Error denying participant:', error);
    }
  };

  const initializeDevices = async () => {
    try {
      // Request permissions
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      
      // Get available devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const cameras = devices.filter(device => device.kind === 'videoinput');
      const microphones = devices.filter(device => device.kind === 'audioinput');
      
      setDevices({ cameras, microphones });
      
      // Set default devices
      if (cameras.length) setSelectedCamera(cameras[0].deviceId);
      if (microphones.length) setSelectedMicrophone(microphones[0].deviceId);
      
      // Start local video
      await startLocalVideo();
      
      // Register WebRTC callbacks
      webRTCService.onTrack((participantId, stream) => {
        attachRemoteStream(participantId, stream);
      });

      webRTCService.onParticipantLeave((participantId) => {
        setParticipants(prev => prev.filter(p => p.id !== participantId));
      });
    } catch (error) {
      console.error('Error initializing devices:', error);
    }
  };

  const startLocalVideo = async () => {
    try {
      console.log('Starting local video...');
      
      // Stop any existing streams first
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        localVideoRef.current.srcObject = null;
      }

      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      console.log('Got media stream:', stream);

      // Store the stream reference
      localStreamRef.current = stream;

      // Set the stream as the video element's source
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        try {
          await localVideoRef.current.play();
          console.log('Video playback started');
          setVideoEnabled(true);
        } catch (playError) {
          console.error('Error playing video:', playError);
        }
      }
    } catch (error) {
      console.error('Error starting local video:', error);
      setVideoEnabled(false);
    }
  };

  const attachRemoteStream = (participantId, stream) => {
    const videoEl = document.getElementById(`video-${participantId}`);
    if (videoEl) {
      videoEl.srcObject = stream;
      videoEl.play().catch(err => console.error('Error playing remote video:', err));
    }
  };

  const muteParticipant = (participantId) => {
    // Host-only operation: set participant's audio flag false and inform peers via signaling
    setParticipants(prev => prev.map(p => p.id === participantId ? { ...p, audio: false } : p));
    try {
      if (signaling && signaling.send) {
        signaling.send({ type: 'command', meetingId, from: user.id, target: participantId, command: 'mute' });
      }
    } catch (e) {
      console.error('Error sending mute command:', e);
    }
  };

  const makeHost = (participantId) => {
    setParticipants(prev => prev.map(p => p.id === participantId ? { ...p, isHost: true } : { ...p, isHost: false }));
    try {
      if (signaling && signaling.send) {
        signaling.send({ type: 'command', meetingId, from: user.id, target: participantId, command: 'makeHost' });
      }
    } catch (e) {
      console.error('Error sending makeHost command:', e);
    }
  };

  const grantControl = (participantId) => {
    setParticipants(prev => prev.map(p => p.id === participantId ? { ...p, hasControl: true } : p));
    try {
      if (signaling && signaling.send) {
        signaling.send({ type: 'command', meetingId, from: user.id, target: participantId, command: 'grantControl' });
      }
    } catch (e) {
      console.error('Error sending grantControl command:', e);
    }
  };

  const disableParticipantVideo = (participantId) => {
    setParticipants(prev => prev.map(p => p.id === participantId ? { ...p, video: false } : p));
    try {
      if (signaling && signaling.send) {
        signaling.send({ type: 'command', meetingId, from: user.id, target: participantId, command: 'disableVideo' });
      }
    } catch (e) {
      console.error('Error sending disableVideo command:', e);
    }
  };

  const removeParticipant = (participantId) => {
    // Host-only operation: remove from participants list and close peer connection
    setParticipants(prev => prev.filter(p => p.id !== participantId));
    if (peerConnections.current[participantId]) {
      try {
        peerConnections.current[participantId].close();
      } catch (e) { /* ignore */ }
      delete peerConnections.current[participantId];
    }

    try {
      if (signaling && signaling.send) {
        signaling.send({ type: 'command', meetingId, from: user.id, target: participantId, command: 'kick' });
      }
    } catch (e) {
      console.error('Error sending kick command:', e);
    }
    // TODO: notify server to kick participant in production
  };

  const startScreenShare = async () => {
    if (!isHost) {
      alert('Only the host can share their screen');
      return;
    }

    try {
      console.log('Starting screen share...');
      
      // Request screen share with both video and audio
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always",
          displaySurface: "monitor"
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      
      // Log track information
      const tracks = stream.getTracks();
      console.log('Screen share tracks:', tracks.map(t => ({
        kind: t.kind,
        enabled: t.enabled,
        id: t.id,
        label: t.label
      })));
      
      // Check if we got a video track
      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) {
        throw new Error('No video track in screen share stream');
      }
      
      setIsScreenSharing(true);
      
      // Handle stream ended by user
      videoTrack.onended = () => {
        console.log('Screen sharing ended by user');
        stopScreenShare();
      };

      // Set up the video element
      if (screenShareRef.current) {
        console.log('Setting screen share stream to video element');
        const videoEl = screenShareRef.current;
        
        // Remove any existing stream
        if (videoEl.srcObject) {
          videoEl.srcObject.getTracks().forEach(track => track.stop());
          videoEl.srcObject = null;
        }
        
        // Set the new stream
        videoEl.srcObject = stream;
        videoEl.muted = true; // Mute to prevent echo
        
        try {
          await videoEl.play();
          console.log('Screen share video playing:', {
            videoWidth: videoEl.videoWidth,
            videoHeight: videoEl.videoHeight,
            readyState: videoEl.readyState
          });
        } catch (err) {
          console.error('Error playing screen share:', err);
          alert('Failed to start screen sharing. Please try again.');
          stopScreenShare();
          return;
        }
      } else {
        console.error('No screen share video element reference found');
        alert('Screen sharing initialization failed. Please try again.');
        stopScreenShare();
        return;
      }
      
      // Save screen share stream reference for cleanup
      screenShareStreamRef.current = stream;
      
      // Add screen share track to all peer connections
      const peerConnectionList = Object.values(peerConnections.current);
      console.log('Adding screen share to', peerConnectionList.length, 'peer connections');
      
      peerConnectionList.forEach(pc => {
        stream.getTracks().forEach(track => {
          console.log('Adding track to peer connection:', track.kind);
          pc.addTrack(track, stream);
        });
      });

      // Notify other participants about screen sharing
      signaling.send({
        type: 'screen-share-started',
        meetingId,
        from: user.id
      });

    } catch (error) {
      console.error('Error sharing screen:', error);
      setIsScreenSharing(false);
    }
  };

  const stopScreenShare = () => {
    console.log('Stopping screen share...');
    
    // Stop all tracks in the screen share stream
    if (screenShareStreamRef.current) {
      console.log('Stopping screen share tracks');
      screenShareStreamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind);
      });
      screenShareStreamRef.current = null;
    }

    // Clear the video element
    if (screenShareRef.current) {
      console.log('Clearing screen share video element');
      screenShareRef.current.srcObject = null;
    }
    
    // Remove screen share tracks from peer connections
    Object.values(peerConnections.current).forEach(pc => {
      const senders = pc.getSenders();
      senders.forEach(sender => {
        if (sender.track && sender.track.kind === 'video') {
          console.log('Removing screen share track from peer connection');
          pc.removeTrack(sender);
        }
      });
    });
    
    setIsScreenSharing(false);
    
    // Notify other participants
    signaling.send({
      type: 'screen-share-stopped',
      meetingId,
      from: user.id
    });
  };

  const stopAllStreams = () => {
    // Stop local video
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    
    // Stop screen share
    stopScreenShare();
    
    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }
  };

  const loadMeeting = () => {
    try {
      const meetings = JSON.parse(localStorage.getItem('schoolMeetings') || '[]');
      const currentMeeting = meetings.find(m => m.id === meetingId);
      if (currentMeeting) {
        setMeeting(currentMeeting);
        // Simulate some participants
        setParticipants([
          { id: 1, name: 'John Smith', role: 'host', audio: true, video: true, hand: false },
          { id: 2, name: 'Sarah Johnson', role: 'participant', audio: true, video: true, hand: false },
          { id: 3, name: 'David Wilson', role: 'participant', audio: false, video: true, hand: true },
        ]);
      }
    } catch (error) {
      console.error('Error loading meeting:', error);
    }
  };

  const updateParticipants = () => {
    // In a real implementation, this would sync with the meeting platform's API
    console.log('Updating participants...');
  };

  const toggleAudio = async () => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach(t => t.enabled = newState);
      }
      if (webRTCService && webRTCService.toggleAudio) {
        await webRTCService.toggleAudio(newState);
      }
    } catch (e) {
      console.error('Error toggling audio:', e);
    }
  };

  const toggleVideo = async () => {
    const newState = !videoEnabled;
    console.log('Toggling video to:', newState);
    setVideoEnabled(newState);
    try {
      if (localStreamRef.current) {
        console.log('Current video tracks:', localStreamRef.current.getVideoTracks().length);
        localStreamRef.current.getVideoTracks().forEach(t => {
          console.log('Setting track enabled:', t.kind, newState);
          t.enabled = newState
        });
        
        // If video was turned off and on, we might need to restart the stream
        if (newState && localStreamRef.current.getVideoTracks().length === 0) {
          console.log('No video tracks found, restarting local video');
          await startLocalVideo();
          return;
        }
        
        // Inform peers by replacing track if needed
        if (webRTCService && webRTCService.replaceTrack) {
          const newTrack = localStreamRef.current.getVideoTracks()[0];
          await webRTCService.replaceTrack(null, newTrack);
        }
      } else {
        console.log('No local stream reference found, starting new stream');
        await startLocalVideo();
        return;
      }
      if (webRTCService && webRTCService.toggleVideo) {
        await webRTCService.toggleVideo(newState);
      }
    } catch (e) {
      console.error('Error toggling video:', e);
    }
  };
  const toggleHand = () => setHandRaised(!handRaised);

  const toggleMeetingLock = () => {
    if (!isHost) return;
    const newLockState = !isMeetingLocked;
    setIsMeetingLocked(newLockState);
    signaling.send({
      type: 'meeting-lock',
      meetingId,
      from: user.id,
      locked: newLockState
    });
  };

  const createBreakoutRoom = () => {
    if (!isHost) return;
    const newRoom = {
      id: Date.now(),
      name: `Room ${breakoutRooms.length + 1}`,
      participants: []
    };
    setBreakoutRooms([...breakoutRooms, newRoom]);
  };

  const assignToBreakoutRoom = (participantId, roomId) => {
    if (!isHost) return;
    setBreakoutRooms(rooms => 
      rooms.map(room => {
        if (room.id === roomId) {
          return { ...room, participants: [...room.participants, participantId] };
        }
        return room;
      })
    );
    signaling.send({
      type: 'breakout-assign',
      meetingId,
      from: user.id,
      participantId,
      roomId
    });
  };

  const startPoll = (question, options) => {
    if (!isHost) return;
    const newPoll = {
      id: Date.now(),
      question,
      options: options.map(opt => ({ text: opt, votes: 0 })),
      voters: []
    };
    setCurrentPoll(newPoll);
    setPollVisible(true);
    signaling.send({
      type: 'poll-start',
      meetingId,
      from: user.id,
      poll: newPoll
    });
  };

  const submitPollVote = (optionIndex) => {
    if (!currentPoll || currentPoll.voters.includes(user.id)) return;
    const updatedPoll = {
      ...currentPoll,
      options: currentPoll.options.map((opt, idx) => ({
        ...opt,
        votes: idx === optionIndex ? opt.votes + 1 : opt.votes
      })),
      voters: [...currentPoll.voters, user.id]
    };
    setCurrentPoll(updatedPoll);
    signaling.send({
      type: 'poll-vote',
      meetingId,
      from: user.id,
      pollId: currentPoll.id,
      optionIndex
    });
  };

  const shareFile = async (file) => {
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        signaling.send({
          type: 'file-share',
          meetingId,
          from: user.id,
          fileName: file.name,
          fileType: file.type,
          fileData: e.target.result
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error sharing file:', error);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      sender: user?.name || 'Anonymous',
      text: newMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const changeLayout = () => {
    setLayout(layout === 'grid' ? 'spotlight' : 'grid');
  };

  if (!meeting) {
    return <div className="live-meeting-loading">Loading meeting...</div>;
  }

  if (accessStatus === 'pending' || (isHost && pendingParticipants.length > 0)) {
    return (
      <WaitingRoom 
        user={user}
        isHost={isHost}
        pendingParticipants={pendingParticipants}
        onApprove={handleApproveParticipant}
        onDeny={handleDenyParticipant}
      />
    );
  }

  if (accessStatus === 'denied') {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You do not have permission to join this meeting.</p>
      </div>
    );
  }

  return (
    <div className="live-meeting">
      <div className="meeting-header">
        <div className="meeting-info">
          <h2>{meeting?.title}</h2>
          <span className="meeting-status" data-status="active">Live</span>
        </div>
        <div className="meeting-actions">
          <button 
            className={`action-btn ${layout === 'grid' ? 'active' : ''}`}
            onClick={changeLayout}
            title="Change Layout"
          >
            <Layout size={20} />
          </button>
          {isHost && (
            <button
              className="action-btn"
              onClick={() => setShowWaitingRoom(true)}
              title="Manage Waiting Room"
            >
              <Users size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="meeting-content">
        {showWaitingRoom && (
          <WaitingRoom
            user={user}
            isHost={isHost}
            pendingParticipants={pendingParticipants}
            onApprove={handleApproveParticipant}
            onDeny={handleDenyParticipant}
            onClose={() => setShowWaitingRoom(false)}
          />
        )}
        <main className={`video-grid ${layout} ${isScreenSharing ? 'with-screen-share' : ''}`}>
          {/* Screen Share */}
          {isScreenSharing && (
            <div className="screen-share-container">
              <video
                ref={screenShareRef}
                autoPlay
                playsInline
                muted={false}
                controls={true}
                style={{ width: '100%', height: '100%' }}
                className="screen-share-video"
              />
              <div className="screen-share-indicator">
                Screen sharing active
              </div>
              <div className="screen-share-overlay">
                <span className="screen-share-label">
                  {isHost ? 'You are sharing your screen' : 'Screen being shared'}
                </span>
                {isHost && (
                  <button
                    className="control-btn mini danger"
                    onClick={stopScreenShare}
                    title="Stop sharing"
                  >
                    <Square size={16} />
                  </button>
                )}
              </div>
            </div>
          )}
          {/* Local Video */}
                      <div className={`video-container local ${!videoEnabled ? 'video-off' : ''}`}>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="video-element"
              style={{ 
                transform: 'scaleX(-1)',
                display: videoEnabled ? 'block' : 'none',
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onLoadedMetadata={(e) => {
                console.log('Video metadata loaded');
                e.target.play().catch(err => console.error('Error playing video:', err));
              }}
              onPlay={() => console.log('Video started playing')}
              onError={(e) => console.error('Video error:', e)}
            />
            {!videoEnabled && (
              <div className="video-placeholder">
                <span className="participant-initial">
                  {user?.name?.charAt(0)}
                </span>
              </div>
            )}
            <div className="participant-info">
              <span className="participant-name">{user?.name} (You)</span>
              <div className="participant-controls">
                {!audioEnabled && <MicOff size={16} />}
                {!videoEnabled && <CameraOff size={16} />}
                {handRaised && <Hand size={16} className="raised" />}
              </div>
            </div>
            <div className="video-overlay-controls">
              <button
                className={`control-btn mini ${audioEnabled ? '' : 'disabled'}`}
                onClick={() => toggleAudio()}
                title={audioEnabled ? 'Mute' : 'Unmute'}
              >
                {audioEnabled ? <Mic size={16} /> : <MicOff size={16} />}
              </button>
              <button
                className={`control-btn mini ${videoEnabled ? '' : 'disabled'}`}
                onClick={() => toggleVideo()}
                title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
              >
                {videoEnabled ? <Camera size={16} /> : <CameraOff size={16} />}
              </button>
            </div>
          </div>

          {/* Remote Participants */}
          {participants.map((participant) => (
            <div 
              key={participant.id} 
              className={`video-container remote ${!participant.video ? 'video-off' : ''}`}
            >
              <video
                id={`video-${participant.id}`}
                autoPlay
                playsInline
                className="video-element"
              />
              {!participant.video && (
                <div className="video-placeholder">
                  <span className="participant-initial">
                    {participant.name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="participant-info">
                <span className="participant-name">
                  {participant.name}
                  {participant.isHost && <span className="host-badge">Host</span>}
                </span>
                <div className="participant-controls">
                  {!participant.audio && <MicOff size={16} />}
                  {!participant.video && <CameraOff size={16} />}
                  {participant.hand && <Hand size={16} className="raised" />}
                </div>
              </div>
              {isHost && (
                <div className="host-controls">
                  <button
                    className="control-btn mini"
                    onClick={() => muteParticipant(participant.id)}
                    title="Mute participant"
                  >
                    <MicOff size={16} />
                  </button>
                  <button
                    className="control-btn mini danger"
                    onClick={() => removeParticipant(participant.id)}
                    title="Remove participant"
                  >
                    <UserX size={16} />
                  </button>
                  <button
                    className="control-btn mini"
                    onClick={() => makeHost(participant.id)}
                    title="Make host"
                  >
                    <Lock size={16} />
                  </button>
                  <button
                    className="control-btn mini"
                    onClick={() => grantControl(participant.id)}
                    title="Grant control / presenter"
                  >
                    <PictureInPicture size={16} />
                  </button>
                  <button
                    className="control-btn mini"
                    onClick={() => disableParticipantVideo(participant.id)}
                    title="Disable participant video"
                  >
                    <CameraOff size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </main>

        <aside className="meeting-sidebar">
          <div className="participants-list">
            <h3><Users size={16} /> Participants ({participants.length})</h3>
            
            {isHost && pendingParticipants.length > 0 && (
              <div className="pending-requests-banner">
                <button 
                  className="view-requests-btn"
                  onClick={() => setShowWaitingRoom(true)}
                >
                  <UserX size={16} />
                  View Requests ({pendingParticipants.length})
                </button>
              </div>
            )}
            
            <div className="participants-scroll">
              {participants.map((participant) => (
                <div key={participant.id} className="participant-item">
                  <span>{participant.name}</span>
                  <span className="participant-role">{participant.role}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="chat-section">
            <h3><MessageSquare size={16} /> Meeting Chat</h3>
            <div className="chat-messages">
              {messages.map((message) => (
                <div key={message.id} className="chat-message">
                  <strong>{message.sender}:</strong>
                  <p>{message.text}</p>
                  <span className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button type="submit">Send</button>
            </form>
          </div>
        </aside>
      </div>

      <div className="meeting-controls">
        <div className="controls-row">
          <button
            className={`control-btn ${audioEnabled ? '' : 'disabled'}`}
            onClick={toggleAudio}
            title="Toggle Microphone"
          >
            {audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          </button>
          <button
            className={`control-btn ${videoEnabled ? '' : 'disabled'}`}
            onClick={toggleVideo}
            title="Toggle Camera"
          >
            {videoEnabled ? <Camera size={20} /> : <CameraOff size={20} />}
          </button>
          <button 
            className={`control-btn ${handRaised ? 'active' : ''}`}
            onClick={toggleHand}
            title="Raise/Lower Hand"
          >
            <Hand size={20} />
          </button>
          <div className="control-separator" />
          {isHost && (
            <>
              <button 
                className={`control-btn ${isScreenSharing ? 'active' : ''}`}
                onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
              >
                <ScreenShare size={20} />
              </button>
              <button 
                className={`control-btn ${isMeetingLocked ? 'active' : ''}`}
                onClick={toggleMeetingLock}
                title={isMeetingLocked ? 'Unlock Meeting' : 'Lock Meeting'}
              >
                <Lock size={20} />
              </button>
              <button 
                className="control-btn"
                onClick={() => setShowBreakoutRooms(true)}
                title="Create Breakout Rooms"
              >
                <Users2 size={20} />
              </button>
              <button 
                className="control-btn"
                onClick={() => setPollVisible(true)}
                title="Create Poll"
              >
                <MessageSquare size={20} />
              </button>
              <div className="control-separator" />
            </>
          )}
          <button 
            className="control-btn"
            onClick={() => setIsFileShareOpen(true)}
            title="Share File"
          >
            <Share2 size={20} />
          </button>
          <button 
            className={`control-btn ${showWhiteboard ? 'active' : ''}`}
            onClick={() => setShowWhiteboard(!showWhiteboard)}
            title="Toggle Whiteboard"
          >
            <Pencil size={20} />
          </button>
          <button 
            className={`control-btn ${isRecording ? 'active' : ''}`}
            onClick={() => setIsRecording(!isRecording)}
            title={isRecording ? 'Stop Recording' : 'Start Recording'}
          >
            <CircleDot size={20} />
          </button>
          <div className="control-separator" />
          <button 
            className="control-btn"
            onClick={() => setShowSettings(true)}
            title="Meeting Settings"
          >
            <Settings size={20} />
          </button>
          <button 
            className="control-btn danger"
            onClick={() => setShowLeaveDialog(true)}
            title="Leave Meeting"
          >
            <Video size={20} />
          </button>
        </div>
      </div>

      {/* Modal Components */}
      {showSettings && (
        <div className="modal settings-modal">
          <h3>Meeting Settings</h3>
          <div className="settings-grid">
            <div className="setting-item">
              <label>Video Quality</label>
              <select value={quality} onChange={(e) => setQuality(e.target.value)}>
                <option value="auto">Auto</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="setting-item">
              <label>Virtual Background</label>
              <select value={virtualBackground} onChange={(e) => setVirtualBackground(e.target.value)}>
                <option value="none">None</option>
                <option value="blur">Blur</option>
                <option value="office">Office</option>
                <option value="beach">Beach</option>
              </select>
            </div>
          </div>
          <button onClick={() => setShowSettings(false)}>Close</button>
        </div>
      )}

      {pollVisible && currentPoll && (
        <div className="modal poll-modal">
          <h3>Poll: {currentPoll.question}</h3>
          <div className="poll-options">
            {currentPoll.options.map((option, index) => (
              <button 
                key={index}
                className="poll-option"
                onClick={() => submitPollVote(index)}
                disabled={currentPoll.voters.includes(user.id)}
              >
                {option.text}
                {currentPoll.voters.includes(user.id) && (
                  <span className="vote-count">{option.votes} votes</span>
                )}
              </button>
            ))}
          </div>
          {isHost && (
            <button onClick={() => setPollVisible(false)}>End Poll</button>
          )}
        </div>
      )}

      {isFileShareOpen && (
        <div className="modal file-share-modal">
          <h3>Share File</h3>
          <input 
            type="file"
            onChange={(e) => shareFile(e.target.files[0])}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          />
          <button onClick={() => setIsFileShareOpen(false)}>Close</button>
        </div>
      )}

      {showLeaveDialog && (
        <div className="modal leave-modal">
          <h3>Leave Meeting</h3>
          <p>Are you sure you want to leave the meeting?</p>
          {isHost && (
            <p className="warning-text">
              As the host, leaving will end the meeting for all participants.
            </p>
          )}
          <div className="modal-actions">
            <button 
              className="btn secondary"
              onClick={() => setShowLeaveDialog(false)}
            >
              Cancel
            </button>
            <button 
              className="btn danger"
              onClick={() => {
                stopAllStreams();
                if (isHost) {
                  signaling.send({
                    type: 'meeting-end',
                    meetingId,
                    from: user.id
                  });
                }
                window.location.href = '/meetings';
              }}
            >
              {isHost ? 'End Meeting' : 'Leave Meeting'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMeeting;
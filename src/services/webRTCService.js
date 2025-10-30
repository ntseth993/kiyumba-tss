// WebRTC service for handling peer connections and media streams
class WebRTCService {
  constructor() {
    this.peerConnections = new Map();
    this.localStream = null;
    this.onTrackCallbacks = new Set();
    this.onParticipantLeaveCallbacks = new Set();
  }

  async initializeMedia(videoEnabled = true, audioEnabled = true) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: videoEnabled,
        audio: audioEnabled
      });
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  async initializeScreenShare() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      return screenStream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw error;
    }
  }

  createPeerConnection(participantId, configuration = null) {
    const peerConnection = new RTCPeerConnection(configuration || {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
      ]
    });

    // Add local tracks to the peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream);
      });
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send the candidate to the remote peer via your signaling server
        this.sendIceCandidate(participantId, event.candidate);
      }
    };

    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      this.onTrackCallbacks.forEach(callback => {
        callback(participantId, event.streams[0]);
      });
    };

    // Store the peer connection
    this.peerConnections.set(participantId, peerConnection);
    return peerConnection;
  }

  async createOffer(participantId) {
    const peerConnection = this.peerConnections.get(participantId);
    if (!peerConnection) {
      throw new Error('No peer connection exists for this participant');
    }

    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  async handleAnswer(participantId, answer) {
    const peerConnection = this.peerConnections.get(participantId);
    if (!peerConnection) {
      throw new Error('No peer connection exists for this participant');
    }

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error handling answer:', error);
      throw error;
    }
  }

  async handleOffer(participantId, offer) {
    let peerConnection = this.peerConnections.get(participantId);
    if (!peerConnection) {
      peerConnection = this.createPeerConnection(participantId);
    }

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      return answer;
    } catch (error) {
      console.error('Error handling offer:', error);
      throw error;
    }
  }

  handleIceCandidate(participantId, candidate) {
    const peerConnection = this.peerConnections.get(participantId);
    if (!peerConnection) {
      throw new Error('No peer connection exists for this participant');
    }

    try {
      peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
      throw error;
    }
  }

  onTrack(callback) {
    this.onTrackCallbacks.add(callback);
    return () => this.onTrackCallbacks.delete(callback);
  }

  onParticipantLeave(callback) {
    this.onParticipantLeaveCallbacks.add(callback);
    return () => this.onParticipantLeaveCallbacks.delete(callback);
  }

  async toggleAudio(enabled) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  async toggleVideo(enabled) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  async replaceTrack(oldTrack, newTrack) {
    this.peerConnections.forEach(peerConnection => {
      const sender = peerConnection.getSenders().find(s => s.track === oldTrack);
      if (sender) {
        sender.replaceTrack(newTrack);
      }
    });
  }

  closeConnection(participantId) {
    const peerConnection = this.peerConnections.get(participantId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(participantId);
      this.onParticipantLeaveCallbacks.forEach(callback => {
        callback(participantId);
      });
    }
  }

  closeAllConnections() {
    this.peerConnections.forEach((_, participantId) => {
      this.closeConnection(participantId);
    });
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }
}

export default new WebRTCService();
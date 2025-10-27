// Video Conferencing Integration Service
// Integration with Zoom, Microsoft Teams, Google Meet, and other platforms

import { apiService, ApiError } from './apiService';

class VideoConferenceManager {
  constructor() {
    this.activeMeetings = new Map();
    this.meetingHistory = new Map();
    this.platforms = new Map();
    this.recordings = new Map();
    this.participants = new Map();
  }

  // Initialize video conferencing platform
  async initializePlatform(platform, credentials) {
    try {
      const result = await apiService.post(`/api/video/${platform}/init`, credentials);
      this.platforms.set(platform, { ...credentials, ...result });
      return result;
    } catch (error) {
      console.error(`Error initializing ${platform}:`, error);
      throw new ApiError(`Failed to initialize ${platform}`, 500, `Unable to connect to ${platform}. Please check your credentials.`);
    }
  }

  // Zoom Integration
  async connectZoom(apiKey, apiSecret) {
    return this.initializePlatform('zoom', { apiKey, apiSecret });
  }

  // Microsoft Teams Integration
  async connectTeams(clientId, clientSecret, tenantId) {
    return this.initializePlatform('teams', { clientId, clientSecret, tenantId });
  }

  // Google Meet Integration
  async connectGoogleMeet(clientId, clientSecret) {
    return this.initializePlatform('googleMeet', { clientId, clientSecret });
  }

  // Create meeting
  async createMeeting(platform, meetingData) {
    try {
      const result = await apiService.post(`/api/video/${platform}/meetings`, meetingData);

      // Track active meeting
      this.activeMeetings.set(result.id, {
        ...result,
        platform,
        createdAt: new Date().toISOString()
      });

      return result;
    } catch (error) {
      console.error(`Error creating ${platform} meeting:`, error);
      throw new ApiError(`Failed to create ${platform} meeting`, 500, 'Unable to create video meeting.');
    }
  }

  // Create Zoom meeting
  async createZoomMeeting(meetingData) {
    const defaultData = {
      topic: 'Kiyumba School Meeting',
      type: 2, // Scheduled meeting
      start_time: new Date().toISOString(),
      duration: 60,
      timezone: 'UTC',
      agenda: 'School meeting',
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        watermark: false,
        use_pmi: false,
        approval_type: 0,
        audio: 'both',
        auto_recording: 'none'
      }
    };

    return this.createMeeting('zoom', { ...defaultData, ...meetingData });
  }

  // Create Teams meeting
  async createTeamsMeeting(meetingData) {
    const defaultData = {
      subject: 'Kiyumba School Meeting',
      startDateTime: new Date().toISOString(),
      endDateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
      body: {
        content: 'School meeting agenda'
      },
      attendees: [],
      isOnlineMeeting: true,
      onlineMeetingProvider: 'teamsForBusiness'
    };

    return this.createMeeting('teams', { ...defaultData, ...meetingData });
  }

  // Create Google Meet meeting
  async createGoogleMeet(meetingData) {
    const defaultData = {
      summary: 'Kiyumba School Meeting',
      start: {
        dateTime: new Date().toISOString(),
        timeZone: 'UTC'
      },
      end: {
        dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        timeZone: 'UTC'
      },
      conferenceData: {
        createRequest: {
          requestId: Date.now().toString(),
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      }
    };

    return this.createMeeting('googleMeet', { ...defaultData, ...meetingData });
  }

  // Join meeting
  async joinMeeting(platform, meetingId, userData = {}) {
    try {
      const result = await apiService.post(`/api/video/${platform}/meetings/${meetingId}/join`, userData);

      // Track participant
      this.addParticipant(meetingId, userData);

      return result;
    } catch (error) {
      console.error(`Error joining ${platform} meeting:`, error);
      throw new ApiError(`Failed to join ${platform} meeting`, 500, 'Unable to join video meeting.');
    }
  }

  // Start meeting
  async startMeeting(platform, meetingId) {
    try {
      const result = await apiService.post(`/api/video/${platform}/meetings/${meetingId}/start`);

      // Update meeting status
      const meeting = this.activeMeetings.get(meetingId);
      if (meeting) {
        meeting.status = 'active';
        meeting.startedAt = new Date().toISOString();
        this.activeMeetings.set(meetingId, meeting);
      }

      return result;
    } catch (error) {
      console.error(`Error starting ${platform} meeting:`, error);
      throw new ApiError(`Failed to start ${platform} meeting`, 500, 'Unable to start video meeting.');
    }
  }

  // End meeting
  async endMeeting(platform, meetingId) {
    try {
      const result = await apiService.post(`/api/video/${platform}/meetings/${meetingId}/end`);

      // Update meeting status
      const meeting = this.activeMeetings.get(meetingId);
      if (meeting) {
        meeting.status = 'ended';
        meeting.endedAt = new Date().toISOString();
        this.activeMeetings.set(meetingId, meeting);

        // Move to history
        this.meetingHistory.set(meetingId, meeting);
        this.activeMeetings.delete(meetingId);
      }

      return result;
    } catch (error) {
      console.error(`Error ending ${platform} meeting:`, error);
      throw new ApiError(`Failed to end ${platform} meeting`, 500, 'Unable to end video meeting.');
    }
  }

  // Get meeting details
  async getMeetingDetails(platform, meetingId) {
    try {
      return await apiService.get(`/api/video/${platform}/meetings/${meetingId}`);
    } catch (error) {
      console.error(`Error fetching ${platform} meeting details:`, error);
      throw new ApiError(`Failed to fetch ${platform} meeting`, 500, 'Unable to load meeting details.');
    }
  }

  // Get meeting participants
  async getMeetingParticipants(platform, meetingId) {
    try {
      const result = await apiService.get(`/api/video/${platform}/meetings/${meetingId}/participants`);
      this.participants.set(meetingId, result.participants || []);
      return result;
    } catch (error) {
      console.error(`Error fetching ${platform} participants:`, error);
      throw new ApiError('Failed to fetch participants', 500, 'Unable to load meeting participants.');
    }
  }

  // Add participant to meeting
  addParticipant(meetingId, userData) {
    if (!this.participants.has(meetingId)) {
      this.participants.set(meetingId, []);
    }

    const participants = this.participants.get(meetingId);
    const existingIndex = participants.findIndex(p => p.id === userData.id);

    if (existingIndex === -1) {
      participants.push({
        ...userData,
        joinedAt: new Date().toISOString(),
        status: 'active'
      });
    } else {
      participants[existingIndex].status = 'active';
      participants[existingIndex].rejoinedAt = new Date().toISOString();
    }

    this.participants.set(meetingId, participants);
  }

  // Remove participant from meeting
  removeParticipant(meetingId, userId) {
    if (this.participants.has(meetingId)) {
      const participants = this.participants.get(meetingId);
      const updated = participants.map(p =>
        p.id === userId ? { ...p, status: 'left', leftAt: new Date().toISOString() } : p
      );
      this.participants.set(meetingId, updated);
    }
  }

  // Start recording
  async startRecording(platform, meetingId, options = {}) {
    try {
      const result = await apiService.post(`/api/video/${platform}/meetings/${meetingId}/recording/start`, options);

      // Update meeting
      const meeting = this.activeMeetings.get(meetingId);
      if (meeting) {
        meeting.recording = { ...result, status: 'recording' };
        this.activeMeetings.set(meetingId, meeting);
      }

      return result;
    } catch (error) {
      console.error(`Error starting ${platform} recording:`, error);
      throw new ApiError(`Failed to start ${platform} recording`, 500, 'Unable to start meeting recording.');
    }
  }

  // Stop recording
  async stopRecording(platform, meetingId) {
    try {
      const result = await apiService.post(`/api/video/${platform}/meetings/${meetingId}/recording/stop`);

      // Update meeting
      const meeting = this.activeMeetings.get(meetingId);
      if (meeting && meeting.recording) {
        meeting.recording.status = 'completed';
        meeting.recording.completedAt = new Date().toISOString();
      }

      // Store recording
      this.recordings.set(result.id, result);

      return result;
    } catch (error) {
      console.error(`Error stopping ${platform} recording:`, error);
      throw new ApiError(`Failed to stop ${platform} recording`, 500, 'Unable to stop meeting recording.');
    }
  }

  // Get meeting recordings
  async getMeetingRecordings(platform, meetingId) {
    try {
      const result = await apiService.get(`/api/video/${platform}/meetings/${meetingId}/recordings`);
      return result;
    } catch (error) {
      console.error(`Error fetching ${platform} recordings:`, error);
      throw new ApiError(`Failed to fetch ${platform} recordings`, 500, 'Unable to load meeting recordings.');
    }
  }

  // Download recording
  async downloadRecording(platform, recordingId) {
    try {
      const result = await apiService.get(`/api/video/${platform}/recordings/${recordingId}/download`);

      // Create download link
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = result.fileName || 'recording.mp4';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return true;
    } catch (error) {
      console.error(`Error downloading ${platform} recording:`, error);
      throw new ApiError(`Failed to download ${platform} recording`, 500, 'Unable to download recording.');
    }
  }

  // Update meeting settings
  async updateMeetingSettings(platform, meetingId, settings) {
    try {
      const result = await apiService.patch(`/api/video/${platform}/meetings/${meetingId}/settings`, settings);

      // Update local meeting
      const meeting = this.activeMeetings.get(meetingId);
      if (meeting) {
        meeting.settings = { ...meeting.settings, ...settings };
        this.activeMeetings.set(meetingId, meeting);
      }

      return result;
    } catch (error) {
      console.error(`Error updating ${platform} meeting settings:`, error);
      throw new ApiError(`Failed to update ${platform} settings`, 500, 'Unable to update meeting settings.');
    }
  }

  // Send meeting invitation
  async sendInvitation(platform, meetingId, invitees, options = {}) {
    const {
      message = 'You are invited to join a video meeting',
      sendEmail = true,
      sendSMS = false
    } = options;

    try {
      return await apiService.post(`/api/video/${platform}/meetings/${meetingId}/invite`, {
        invitees,
        message,
        sendEmail,
        sendSMS
      });
    } catch (error) {
      console.error(`Error sending ${platform} invitation:`, error);
      throw new ApiError(`Failed to send ${platform} invitation`, 500, 'Unable to send meeting invitation.');
    }
  }

  // Get meeting chat messages
  async getMeetingChat(platform, meetingId) {
    try {
      return await apiService.get(`/api/video/${platform}/meetings/${meetingId}/chat`);
    } catch (error) {
      console.error(`Error fetching ${platform} chat:`, error);
      throw new ApiError(`Failed to fetch ${platform} chat`, 500, 'Unable to load meeting chat.');
    }
  }

  // Send chat message
  async sendChatMessage(platform, meetingId, message, options = {}) {
    const { isPrivate = false, recipientId = null } = options;

    try {
      return await apiService.post(`/api/video/${platform}/meetings/${meetingId}/chat`, {
        message,
        isPrivate,
        recipientId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error sending ${platform} chat message:`, error);
      throw new ApiError(`Failed to send ${platform} message`, 500, 'Unable to send chat message.');
    }
  }

  // Schedule meeting
  async scheduleMeeting(platform, meetingData, options = {}) {
    const {
      sendInvitations = true,
      createCalendarEvent = true,
      reminders = []
    } = options;

    try {
      const result = await apiService.post(`/api/video/${platform}/schedule`, {
        ...meetingData,
        sendInvitations,
        createCalendarEvent,
        reminders
      });

      return result;
    } catch (error) {
      console.error(`Error scheduling ${platform} meeting:`, error);
      throw new ApiError(`Failed to schedule ${platform} meeting`, 500, 'Unable to schedule meeting.');
    }
  }

  // Get scheduled meetings
  async getScheduledMeetings(platform, options = {}) {
    const {
      startDate = new Date(),
      endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status = 'scheduled'
    } = options;

    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status
      });

      return await apiService.get(`/api/video/${platform}/scheduled?${params}`);
    } catch (error) {
      console.error(`Error fetching ${platform} scheduled meetings:`, error);
      throw new ApiError(`Failed to fetch ${platform} meetings`, 500, 'Unable to load scheduled meetings.');
    }
  }

  // Cancel scheduled meeting
  async cancelScheduledMeeting(platform, meetingId, reason = '') {
    try {
      const result = await apiService.post(`/api/video/${platform}/meetings/${meetingId}/cancel`, {
        reason,
        cancelledAt: new Date().toISOString()
      });

      // Update local meeting
      const meeting = this.activeMeetings.get(meetingId);
      if (meeting) {
        meeting.status = 'cancelled';
        meeting.cancelledAt = new Date().toISOString();
        this.activeMeetings.set(meetingId, meeting);
      }

      return result;
    } catch (error) {
      console.error(`Error cancelling ${platform} meeting:`, error);
      throw new ApiError(`Failed to cancel ${platform} meeting`, 500, 'Unable to cancel meeting.');
    }
  }

  // Get meeting analytics
  async getMeetingAnalytics(platform, meetingId) {
    try {
      return await apiService.get(`/api/video/${platform}/meetings/${meetingId}/analytics`);
    } catch (error) {
      console.error(`Error fetching ${platform} analytics:`, error);
      throw new ApiError(`Failed to fetch ${platform} analytics`, 500, 'Unable to load meeting analytics.');
    }
  }

  // Get platform usage statistics
  async getUsageStatistics(platform, options = {}) {
    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate = new Date()
    } = options;

    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      return await apiService.get(`/api/video/${platform}/stats?${params}`);
    } catch (error) {
      console.error(`Error fetching ${platform} usage statistics:`, error);
      throw new ApiError(`Failed to fetch ${platform} statistics`, 500, 'Unable to load usage statistics.');
    }
  }

  // Test meeting connection
  async testConnection(platform) {
    try {
      const result = await apiService.get(`/api/video/${platform}/test`);
      return result;
    } catch (error) {
      console.error(`Error testing ${platform} connection:`, error);
      throw new ApiError(`Failed to test ${platform} connection`, 500, 'Unable to test platform connection.');
    }
  }

  // Get platform settings
  async getPlatformSettings(platform) {
    try {
      return await apiService.get(`/api/video/${platform}/settings`);
    } catch (error) {
      console.error(`Error fetching ${platform} settings:`, error);
      throw new ApiError(`Failed to fetch ${platform} settings`, 500, 'Unable to load platform settings.');
    }
  }

  // Update platform settings
  async updatePlatformSettings(platform, settings) {
    try {
      return await apiService.put(`/api/video/${platform}/settings`, settings);
    } catch (error) {
      console.error(`Error updating ${platform} settings:`, error);
      throw new ApiError(`Failed to update ${platform} settings`, 500, 'Unable to update platform settings.');
    }
  }

  // WebRTC integration for custom video calls
  async createWebRTCMeeting(meetingData) {
    try {
      const result = await apiService.post('/api/video/webrtc/meetings', {
        ...meetingData,
        createdAt: new Date().toISOString()
      });

      this.activeMeetings.set(result.id, {
        ...result,
        platform: 'webrtc',
        createdAt: new Date().toISOString()
      });

      return result;
    } catch (error) {
      console.error('Error creating WebRTC meeting:', error);
      throw new ApiError('Failed to create WebRTC meeting', 500, 'Unable to create video meeting.');
    }
  }

  // Get WebRTC signaling data
  async getWebRTCSignaling(meetingId) {
    try {
      return await apiService.get(`/api/video/webrtc/meetings/${meetingId}/signaling`);
    } catch (error) {
      console.error('Error fetching WebRTC signaling:', error);
      throw new ApiError('Failed to fetch signaling data', 500, 'Unable to load signaling information.');
    }
  }

  // Send WebRTC signal
  async sendWebRTCSignal(meetingId, signalData) {
    try {
      return await apiService.post(`/api/video/webrtc/meetings/${meetingId}/signal`, {
        ...signalData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error sending WebRTC signal:', error);
      throw new ApiError('Failed to send signal', 500, 'Unable to send signaling data.');
    }
  }

  // Meeting templates
  async createMeetingTemplate(templateData) {
    try {
      return await apiService.post('/api/video/templates', templateData);
    } catch (error) {
      console.error('Error creating meeting template:', error);
      throw new ApiError('Failed to create template', 500, 'Unable to create meeting template.');
    }
  }

  // Get meeting templates
  async getMeetingTemplates() {
    try {
      return await apiService.get('/api/video/templates');
    } catch (error) {
      console.error('Error fetching meeting templates:', error);
      throw new ApiError('Failed to fetch templates', 500, 'Unable to load meeting templates.');
    }
  }

  // Integration status
  async getIntegrationStatus(platform) {
    try {
      return await apiService.get(`/api/video/${platform}/status`);
    } catch (error) {
      console.error(`Error fetching ${platform} status:`, error);
      return { connected: false, error: error.message };
    }
  }

  // Disconnect platform
  async disconnectPlatform(platform) {
    try {
      await apiService.post(`/api/video/${platform}/disconnect`);

      // Clear local data
      this.platforms.delete(platform);

      // End all active meetings for this platform
      for (const [meetingId, meeting] of this.activeMeetings.entries()) {
        if (meeting.platform === platform) {
          await this.endMeeting(platform, meetingId);
        }
      }

      return true;
    } catch (error) {
      console.error(`Error disconnecting ${platform}:`, error);
      throw new ApiError(`Failed to disconnect ${platform}`, 500, 'Unable to disconnect platform.');
    }
  }

  // Get active meetings
  getActiveMeetings() {
    return Array.from(this.activeMeetings.values());
  }

  // Get meeting history
  getMeetingHistory() {
    return Array.from(this.meetingHistory.values());
  }

  // Get platform connections
  getConnectedPlatforms() {
    return Array.from(this.platforms.keys());
  }

  // Get recordings
  getRecordings() {
    return Array.from(this.recordings.values());
  }

  // Cleanup resources
  cleanup() {
    this.activeMeetings.clear();
    this.meetingHistory.clear();
    this.platforms.clear();
    this.recordings.clear();
    this.participants.clear();
  }
}

// React hooks for video conferencing
export const useVideoConference = (platform = 'zoom') => {
  const [activeMeetings, setActiveMeetings] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [connected, setConnected] = React.useState(false);

  const initialize = React.useCallback(async (credentials) => {
    setLoading(true);
    try {
      let result;

      switch (platform) {
        case 'zoom':
          result = await videoConferenceManager.connectZoom(credentials.apiKey, credentials.apiSecret);
          break;
        case 'teams':
          result = await videoConferenceManager.connectTeams(credentials.clientId, credentials.clientSecret, credentials.tenantId);
          break;
        case 'googleMeet':
          result = await videoConferenceManager.connectGoogleMeet(credentials.clientId, credentials.clientSecret);
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      setConnected(true);
      return result;
    } catch (error) {
      console.error(`Error initializing ${platform}:`, error);
      setConnected(false);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [platform]);

  const createMeeting = React.useCallback(async (meetingData) => {
    setLoading(true);
    try {
      let result;

      switch (platform) {
        case 'zoom':
          result = await videoConferenceManager.createZoomMeeting(meetingData);
          break;
        case 'teams':
          result = await videoConferenceManager.createTeamsMeeting(meetingData);
          break;
        case 'googleMeet':
          result = await videoConferenceManager.createGoogleMeet(meetingData);
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      // Refresh active meetings
      setActiveMeetings(videoConferenceManager.getActiveMeetings());
      return result;
    } catch (error) {
      console.error(`Error creating ${platform} meeting:`, error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [platform]);

  const joinMeeting = React.useCallback(async (meetingId, userData) => {
    try {
      return await videoConferenceManager.joinMeeting(platform, meetingId, userData);
    } catch (error) {
      console.error(`Error joining ${platform} meeting:`, error);
      throw error;
    }
  }, [platform]);

  const endMeeting = React.useCallback(async (meetingId) => {
    try {
      await videoConferenceManager.endMeeting(platform, meetingId);
      setActiveMeetings(videoConferenceManager.getActiveMeetings());
      return true;
    } catch (error) {
      console.error(`Error ending ${platform} meeting:`, error);
      throw error;
    }
  }, [platform]);

  const startRecording = React.useCallback(async (meetingId, options) => {
    try {
      return await videoConferenceManager.startRecording(platform, meetingId, options);
    } catch (error) {
      console.error(`Error starting ${platform} recording:`, error);
      throw error;
    }
  }, [platform]);

  const stopRecording = React.useCallback(async (meetingId) => {
    try {
      return await videoConferenceManager.stopRecording(platform, meetingId);
    } catch (error) {
      console.error(`Error stopping ${platform} recording:`, error);
      throw error;
    }
  }, [platform]);

  const getRecordings = React.useCallback(async (meetingId) => {
    try {
      return await videoConferenceManager.getMeetingRecordings(platform, meetingId);
    } catch (error) {
      console.error(`Error fetching ${platform} recordings:`, error);
      throw error;
    }
  }, [platform]);

  const disconnect = React.useCallback(async () => {
    setLoading(true);
    try {
      await videoConferenceManager.disconnectPlatform(platform);
      setConnected(false);
      setActiveMeetings([]);
      return true;
    } catch (error) {
      console.error(`Error disconnecting ${platform}:`, error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [platform]);

  // Load active meetings on mount
  React.useEffect(() => {
    if (connected) {
      setActiveMeetings(videoConferenceManager.getActiveMeetings());
    }
  }, [connected]);

  return {
    activeMeetings,
    loading,
    connected,
    initialize,
    createMeeting,
    joinMeeting,
    endMeeting,
    startRecording,
    stopRecording,
    getRecordings,
    disconnect,
    getStatus: () => videoConferenceManager.getIntegrationStatus(platform),
    getUsageStats: (options) => videoConferenceManager.getUsageStatistics(platform, options)
  };
};

// Create singleton instance
export const videoConferenceManager = new VideoConferenceManager();

export default videoConferenceManager;

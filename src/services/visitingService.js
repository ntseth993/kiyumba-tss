// Meeting and Visit Management Service
// Handles scheduling, managing, and tracking meetings/visits

import React from 'react';
import { videoConferenceManager } from './videoConferenceService';

class MeetingManager {
  constructor() {
    this.meetings = new Map();
    this.meetingHistory = new Map();
    this.platforms = ['zoom', 'teams', 'googleMeet', 'webrtc'];
    this.meetingTypes = ['academic', 'administrative', 'counseling', 'parent-teacher', 'student-group', 'staff', 'other'];
  }

  // Initialize meeting service
  async initialize() {
    try {
      // Load existing meetings from localStorage
      this.loadMeetingsFromStorage();
      return true;
    } catch (error) {
      console.error('Error initializing meeting service:', error);
      return false;
    }
  }

  // Load meetings from localStorage
  loadMeetingsFromStorage() {
    try {
      const storedMeetings = JSON.parse(localStorage.getItem('schoolMeetings') || '[]');
      storedMeetings.forEach(meeting => {
        this.meetings.set(meeting.id, meeting);
        if (meeting.status === 'ended') {
          this.meetingHistory.set(meeting.id, meeting);
        }
      });
    } catch (error) {
      console.error('Error loading meetings from storage:', error);
    }
  }

  // Save meetings to localStorage
  saveMeetingsToStorage() {
    try {
      const meetingsArray = Array.from(this.meetings.values());
      localStorage.setItem('schoolMeetings', JSON.stringify(meetingsArray));
    } catch (error) {
      console.error('Error saving meetings to storage:', error);
    }
  }

  // Create new meeting
  async createMeeting(meetingData) {
    try {
      const meeting = {
        id: Date.now().toString(),
        ...meetingData,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        participants: meetingData.participants || [],
        platform: meetingData.platform || 'zoom',
        meetingType: meetingData.meetingType || 'academic',
        settings: {
          recording: meetingData.recording || false,
          waitingRoom: meetingData.waitingRoom !== false,
          joinBeforeHost: meetingData.joinBeforeHost || false,
          muteUponEntry: meetingData.muteUponEntry !== false,
          ...meetingData.settings
        }
      };

      // Create video conference meeting
      let videoMeeting = null;
      if (meeting.platform && meeting.platform !== 'webrtc') {
        try {
          switch (meeting.platform) {
            case 'zoom':
              videoMeeting = await videoConferenceManager.createZoomMeeting({
                topic: meeting.title,
                start_time: meeting.scheduledTime,
                duration: meeting.duration || 60,
                agenda: meeting.description,
                settings: meeting.settings
              });
              break;
            case 'teams':
              videoMeeting = await videoConferenceManager.createTeamsMeeting({
                subject: meeting.title,
                startDateTime: meeting.scheduledTime,
                endDateTime: new Date(new Date(meeting.scheduledTime).getTime() + (meeting.duration || 60) * 60000).toISOString(),
                body: { content: meeting.description }
              });
              break;
            case 'googleMeet':
              videoMeeting = await videoConferenceManager.createGoogleMeet({
                summary: meeting.title,
                start: { dateTime: meeting.scheduledTime, timeZone: 'UTC' },
                end: { dateTime: new Date(new Date(meeting.scheduledTime).getTime() + (meeting.duration || 60) * 60000).toISOString(), timeZone: 'UTC' },
                conferenceData: {
                  createRequest: {
                    requestId: meeting.id,
                    conferenceSolutionKey: { type: 'hangoutsMeet' }
                  }
                }
              });
              break;
          }

          if (videoMeeting) {
            meeting.videoMeetingId = videoMeeting.id;
            meeting.joinUrl = videoMeeting.join_url || videoMeeting.joinUrl;
            meeting.meetingCode = videoMeeting.id || videoMeeting.meetingCode;
            meeting.password = videoMeeting.password;
          }
        } catch (error) {
          console.error('Error creating video meeting:', error);
          // Continue without video integration if it fails
        }
      }

      this.meetings.set(meeting.id, meeting);
      this.saveMeetingsToStorage();

      return meeting;
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw new Error('Failed to create meeting');
    }
  }

  // Get meeting by ID
  getMeeting(meetingId) {
    return this.meetings.get(meetingId);
  }

  // Get all meetings
  getAllMeetings() {
    return Array.from(this.meetings.values());
  }

  // Get meetings by status
  getMeetingsByStatus(status) {
    return Array.from(this.meetings.values()).filter(meeting => meeting.status === status);
  }

  // Get meetings by type
  getMeetingsByType(type) {
    return Array.from(this.meetings.values()).filter(meeting => meeting.meetingType === type);
  }

  // Get meetings for user
  getUserMeetings(userId) {
    return Array.from(this.meetings.values()).filter(meeting =>
      meeting.hostId === userId ||
      meeting.participants.some(p => p.id === userId)
    );
  }

  // Update meeting
  async updateMeeting(meetingId, updateData) {
    try {
      const meeting = this.meetings.get(meetingId);
      if (!meeting) {
        throw new Error('Meeting not found');
      }

      const updatedMeeting = {
        ...meeting,
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      this.meetings.set(meetingId, updatedMeeting);
      this.saveMeetingsToStorage();

      return updatedMeeting;
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw error;
    }
  }

  // Delete meeting
  async deleteMeeting(meetingId) {
    try {
      const meeting = this.meetings.get(meetingId);
      if (meeting) {
        // Cancel video meeting if it exists
        if (meeting.videoMeetingId && meeting.platform) {
          try {
            await videoConferenceManager.cancelScheduledMeeting(meeting.platform, meeting.videoMeetingId);
          } catch (error) {
            console.error('Error canceling video meeting:', error);
          }
        }

        this.meetings.delete(meetingId);
        this.saveMeetingsToStorage();

        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting meeting:', error);
      throw error;
    }
  }

  // Start meeting
  async startMeeting(meetingId, userData = {}) {
    try {
      const meeting = this.meetings.get(meetingId);
      if (!meeting) {
        throw new Error('Meeting not found');
      }

      // Update meeting status
      await this.updateMeeting(meetingId, {
        status: 'active',
        startedAt: new Date().toISOString(),
        startedBy: userData.id
      });

      // Start video meeting if applicable
      if (meeting.videoMeetingId && meeting.platform) {
        try {
          await videoConferenceManager.startMeeting(meeting.platform, meeting.videoMeetingId);
        } catch (error) {
          console.error('Error starting video meeting:', error);
        }
      }

      return meeting;
    } catch (error) {
      console.error('Error starting meeting:', error);
      throw error;
    }
  }

  // Join meeting
  async joinMeeting(meetingId, userData) {
    try {
      const meeting = this.meetings.get(meetingId);
      if (!meeting) {
        throw new Error('Meeting not found');
      }

      // Add participant to meeting
      const participants = meeting.participants || [];
      const existingParticipant = participants.find(p => p.id === userData.id);

      if (!existingParticipant) {
        participants.push({
          ...userData,
          joinedAt: new Date().toISOString(),
          status: 'active'
        });
      } else {
        existingParticipant.status = 'active';
        existingParticipant.rejoinedAt = new Date().toISOString();
      }

      await this.updateMeeting(meetingId, { participants });

      // Join video meeting if applicable
      if (meeting.videoMeetingId && meeting.platform) {
        try {
          await videoConferenceManager.joinMeeting(meeting.platform, meeting.videoMeetingId, userData);
        } catch (error) {
          console.error('Error joining video meeting:', error);
        }
      }

      return meeting;
    } catch (error) {
      console.error('Error joining meeting:', error);
      throw error;
    }
  }

  // End meeting
  async endMeeting(meetingId, userData = {}) {
    try {
      const meeting = this.meetings.get(meetingId);
      if (!meeting) {
        throw new Error('Meeting not found');
      }

      // Update meeting status
      await this.updateMeeting(meetingId, {
        status: 'ended',
        endedAt: new Date().toISOString(),
        endedBy: userData.id
      });

      // End video meeting if applicable
      if (meeting.videoMeetingId && meeting.platform) {
        try {
          await videoConferenceManager.endMeeting(meeting.platform, meeting.videoMeetingId);
        } catch (error) {
          console.error('Error ending video meeting:', error);
        }
      }

      // Move to history
      this.meetingHistory.set(meetingId, meeting);
      this.meetings.delete(meetingId);
      this.saveMeetingsToStorage();

      return meeting;
    } catch (error) {
      console.error('Error ending meeting:', error);
      throw error;
    }
  }

  // Cancel meeting
  async cancelMeeting(meetingId, reason = '') {
    try {
      const meeting = this.meetings.get(meetingId);
      if (!meeting) {
        throw new Error('Meeting not found');
      }

      // Cancel video meeting if applicable
      if (meeting.videoMeetingId && meeting.platform) {
        try {
          await videoConferenceManager.cancelScheduledMeeting(meeting.platform, meeting.videoMeetingId, reason);
        } catch (error) {
          console.error('Error canceling video meeting:', error);
        }
      }

      // Update meeting status
      await this.updateMeeting(meetingId, {
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        cancelReason: reason
      });

      return meeting;
    } catch (error) {
      console.error('Error canceling meeting:', error);
      throw error;
    }
  }

  // Add participant to meeting
  async addParticipant(meetingId, participantData) {
    try {
      const meeting = this.meetings.get(meetingId);
      if (!meeting) {
        throw new Error('Meeting not found');
      }

      const participants = meeting.participants || [];
      const existingIndex = participants.findIndex(p => p.id === participantData.id);

      if (existingIndex === -1) {
        participants.push({
          ...participantData,
          addedAt: new Date().toISOString(),
          status: 'invited'
        });
      }

      await this.updateMeeting(meetingId, { participants });
      return meeting;
    } catch (error) {
      console.error('Error adding participant:', error);
      throw error;
    }
  }

  // Remove participant from meeting
  async removeParticipant(meetingId, participantId) {
    try {
      const meeting = this.meetings.get(meetingId);
      if (!meeting) {
        throw new Error('Meeting not found');
      }

      const participants = meeting.participants || [];
      const updatedParticipants = participants.filter(p => p.id !== participantId);

      await this.updateMeeting(meetingId, { participants: updatedParticipants });
      return meeting;
    } catch (error) {
      console.error('Error removing participant:', error);
      throw error;
    }
  }

  // Get meeting statistics
  getMeetingStatistics() {
    const meetings = Array.from(this.meetings.values());
    const totalMeetings = meetings.length;
    const scheduledMeetings = meetings.filter(m => m.status === 'scheduled').length;
    const activeMeetings = meetings.filter(m => m.status === 'active').length;
    const endedMeetings = meetings.filter(m => m.status === 'ended').length;
    const cancelledMeetings = meetings.filter(m => m.status === 'cancelled').length;

    const meetingsByType = {};
    this.meetingTypes.forEach(type => {
      meetingsByType[type] = meetings.filter(m => m.meetingType === type).length;
    });

    const meetingsByPlatform = {};
    this.platforms.forEach(platform => {
      meetingsByPlatform[platform] = meetings.filter(m => m.platform === platform).length;
    });

    return {
      totalMeetings,
      scheduledMeetings,
      activeMeetings,
      endedMeetings,
      cancelledMeetings,
      meetingsByType,
      meetingsByPlatform
    };
  }

  // Send meeting invitations
  async sendInvitations(meetingId, options = {}) {
    try {
      const meeting = this.meetings.get(meetingId);
      if (!meeting) {
        throw new Error('Meeting not found');
      }

      const {
        sendEmail = true,
        sendSMS = false,
        customMessage = ''
      } = options;

      // Send invitations via video conference service if applicable
      if (meeting.videoMeetingId && meeting.platform && meeting.participants.length > 0) {
        try {
          await videoConferenceManager.sendInvitation(
            meeting.platform,
            meeting.videoMeetingId,
            meeting.participants.map(p => p.email).filter(Boolean),
            {
              message: customMessage || `You are invited to join the meeting: ${meeting.title}`,
              sendEmail,
              sendSMS
            }
          );
        } catch (error) {
          console.error('Error sending video invitations:', error);
        }
      }

      // Mark invitations as sent
      await this.updateMeeting(meetingId, { invitationsSent: true });

      return true;
    } catch (error) {
      console.error('Error sending invitations:', error);
      throw error;
    }
  }

  // Get upcoming meetings
  getUpcomingMeetings(hours = 24) {
    const now = new Date();
    const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);

    return Array.from(this.meetings.values())
      .filter(meeting => {
        const meetingTime = new Date(meeting.scheduledTime);
        return meetingTime >= now && meetingTime <= futureTime && meeting.status === 'scheduled';
      })
      .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
  }

  // Get meetings for today
  getTodayMeetings() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    return Array.from(this.meetings.values())
      .filter(meeting => {
        const meetingTime = new Date(meeting.scheduledTime);
        return meetingTime >= startOfDay && meetingTime < endOfDay;
      })
      .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
  }

  // Search meetings
  searchMeetings(query) {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.meetings.values()).filter(meeting =>
      meeting.title.toLowerCase().includes(lowercaseQuery) ||
      meeting.description.toLowerCase().includes(lowercaseQuery) ||
      meeting.hostName?.toLowerCase().includes(lowercaseQuery) ||
      meeting.participants.some(p =>
        p.name?.toLowerCase().includes(lowercaseQuery) ||
        p.email?.toLowerCase().includes(lowercaseQuery)
      )
    );
  }

  // Get meeting history
  getMeetingHistory() {
    return Array.from(this.meetingHistory.values())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Cleanup old meetings
  cleanupOldMeetings(daysToKeep = 90) {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    for (const [meetingId, meeting] of this.meetings.entries()) {
      if (new Date(meeting.createdAt) < cutoffDate && meeting.status === 'ended') {
        this.meetingHistory.set(meetingId, meeting);
        this.meetings.delete(meetingId);
      }
    }

    this.saveMeetingsToStorage();
  }
}

// Create singleton instance
export const meetingManager = new MeetingManager();

// React hooks for meetings
export const useMeetings = () => {
  const [meetings, setMeetings] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const refreshMeetings = React.useCallback(() => {
    setMeetings(meetingManager.getAllMeetings());
  }, []);

  const createMeeting = React.useCallback(async (meetingData) => {
    setLoading(true);
    try {
      const result = await meetingManager.createMeeting(meetingData);
      refreshMeetings();
      return result;
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshMeetings]);

  const updateMeeting = React.useCallback(async (meetingId, updateData) => {
    try {
      const result = await meetingManager.updateMeeting(meetingId, updateData);
      refreshMeetings();
      return result;
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw error;
    }
  }, [refreshMeetings]);

  const deleteMeeting = React.useCallback(async (meetingId) => {
    try {
      const result = await meetingManager.deleteMeeting(meetingId);
      refreshMeetings();
      return result;
    } catch (error) {
      console.error('Error deleting meeting:', error);
      throw error;
    }
  }, [refreshMeetings]);

  const joinMeeting = React.useCallback(async (meetingId, userData) => {
    try {
      return await meetingManager.joinMeeting(meetingId, userData);
    } catch (error) {
      console.error('Error joining meeting:', error);
      throw error;
    }
  }, []);

  const startMeeting = React.useCallback(async (meetingId, userData) => {
    try {
      const result = await meetingManager.startMeeting(meetingId, userData);
      refreshMeetings();
      return result;
    } catch (error) {
      console.error('Error starting meeting:', error);
      throw error;
    }
  }, [refreshMeetings]);

  const endMeeting = React.useCallback(async (meetingId, userData) => {
    try {
      const result = await meetingManager.endMeeting(meetingId, userData);
      refreshMeetings();
      return result;
    } catch (error) {
      console.error('Error ending meeting:', error);
      throw error;
    }
  }, [refreshMeetings]);

  const getUserMeetings = React.useCallback((userId) => {
    return meetingManager.getUserMeetings(userId);
  }, []);

  const getUpcomingMeetings = React.useCallback((hours = 24) => {
    return meetingManager.getUpcomingMeetings(hours);
  }, []);

  const getTodayMeetings = React.useCallback(() => {
    return meetingManager.getTodayMeetings();
  }, []);

  const searchMeetings = React.useCallback((query) => {
    return meetingManager.searchMeetings(query);
  }, []);

  const getStatistics = React.useCallback(() => {
    return meetingManager.getMeetingStatistics();
  }, []);

  // Initialize and load meetings on mount
  React.useEffect(() => {
    meetingManager.initialize();
    refreshMeetings();
  }, [refreshMeetings]);

  return {
    meetings,
    loading,
    refreshMeetings,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    joinMeeting,
    startMeeting,
    endMeeting,
    getUserMeetings,
    getUpcomingMeetings,
    getTodayMeetings,
    searchMeetings,
    getStatistics
  };
};

export default meetingManager;
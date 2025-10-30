// Meeting access control service
export const checkIfHost = async (meetingId, userId) => {
  try {
    // Get meeting from localStorage
    const meetings = JSON.parse(localStorage.getItem('schoolMeetings') || '[]');
    const meeting = meetings.find(m => m.id === meetingId);
    
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    // Check if user is host
    return meeting.hostId === userId || meeting.hosts?.includes(userId);
  } catch (error) {
    console.error('Error checking host status:', error);
    return false;
  }
};

export const requestMeetingAccess = async (meetingId, userInfo) => {
  try {
    // Get meeting and pending participants from localStorage
    const meetings = JSON.parse(localStorage.getItem('schoolMeetings') || '[]');
    const pendingParticipants = JSON.parse(localStorage.getItem('pendingParticipants') || '{}');
    
    const meeting = meetings.find(m => m.id === meetingId);
    
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    // Check if user is already approved
    if (meeting.participants?.some(p => p.id === userInfo.userId)) {
      return { autoApproved: true };
    }

    // Check if auto-approval is enabled for this meeting
    if (meeting.autoApprove) {
      // Add user to participants
      meeting.participants = [...(meeting.participants || []), {
        id: userInfo.userId,
        name: userInfo.name,
        email: userInfo.email,
        joinedAt: new Date().toISOString()
      }];
      
      // Update meetings in localStorage
      localStorage.setItem('schoolMeetings', JSON.stringify(meetings));
      
      return { autoApproved: true };
    }

    // Add to pending participants if not auto-approved
    if (!pendingParticipants[meetingId]) {
      pendingParticipants[meetingId] = [];
    }

    // Check if already pending
    if (!pendingParticipants[meetingId].some(p => p.id === userInfo.userId)) {
      pendingParticipants[meetingId].push({
        id: userInfo.userId,
        name: userInfo.name,
        email: userInfo.email,
        requestedAt: new Date().toISOString()
      });
    }

    // Update pending participants in localStorage
    localStorage.setItem('pendingParticipants', JSON.stringify(pendingParticipants));

    return { autoApproved: false };
  } catch (error) {
    console.error('Error requesting meeting access:', error);
    throw error;
  }
};

export const approveMeetingAccess = async (meetingId, userId) => {
  try {
    // Get meeting and pending participants from localStorage
    const meetings = JSON.parse(localStorage.getItem('schoolMeetings') || '[]');
    const pendingParticipants = JSON.parse(localStorage.getItem('pendingParticipants') || '{}');
    
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) {
      throw new Error('Meeting not found');
    }

    // Find pending participant
    const participant = pendingParticipants[meetingId]?.find(p => p.id === userId);
    if (!participant) {
      throw new Error('Participant not found in pending list');
    }

    // Remove from pending
    pendingParticipants[meetingId] = pendingParticipants[meetingId].filter(p => p.id !== userId);

    // Add to meeting participants
    meeting.participants = [...(meeting.participants || []), {
      ...participant,
      approvedAt: new Date().toISOString()
    }];

    // Update storage
    localStorage.setItem('schoolMeetings', JSON.stringify(meetings));
    localStorage.setItem('pendingParticipants', JSON.stringify(pendingParticipants));

    return true;
  } catch (error) {
    console.error('Error approving meeting access:', error);
    throw error;
  }
};

export const denyMeetingAccess = async (meetingId, userId) => {
  try {
    // Get pending participants from localStorage
    const pendingParticipants = JSON.parse(localStorage.getItem('pendingParticipants') || '{}');
    
    // Remove from pending
    if (pendingParticipants[meetingId]) {
      pendingParticipants[meetingId] = pendingParticipants[meetingId].filter(p => p.id !== userId);
      localStorage.setItem('pendingParticipants', JSON.stringify(pendingParticipants));
    }

    return true;
  } catch (error) {
    console.error('Error denying meeting access:', error);
    throw error;
  }
};

export const getPendingParticipants = async (meetingId) => {
  try {
    const pendingParticipants = JSON.parse(localStorage.getItem('pendingParticipants') || '{}');
    return pendingParticipants[meetingId] || [];
  } catch (error) {
    console.error('Error getting pending participants:', error);
    return [];
  }
};
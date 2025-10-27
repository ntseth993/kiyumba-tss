// Calendar Integration Service
// Sync with Google Calendar, Outlook, and other calendar systems

import { apiService, ApiError } from './apiService';

class CalendarManager {
  constructor() {
    this.connectedAccounts = new Map();
    this.calendarEvents = new Map();
    this.syncStatus = new Map();
    this.eventReminders = new Map();
    this.recurringEvents = new Map();
  }

  // Google Calendar Integration
  async connectGoogleCalendar() {
    try {
      // Initiate OAuth flow
      const authUrl = `https://accounts.google.com/oauth/authorize?` +
        `client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(window.location.origin + '/auth/google/callback')}&` +
        `scope=https://www.googleapis.com/auth/calendar&` +
        `response_type=code&` +
        `access_type=offline`;

      // Open OAuth window
      const authWindow = window.open(
        authUrl,
        'google-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      return new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (authWindow.closed) {
            clearInterval(checkClosed);
            reject(new Error('Authentication cancelled'));
          }
        }, 1000);

        // Listen for auth completion
        window.addEventListener('message', (event) => {
          if (event.origin !== window.location.origin) return;

          if (event.data.type === 'google-auth-success') {
            clearInterval(checkClosed);
            authWindow.close();
            resolve(event.data);
          } else if (event.data.type === 'google-auth-error') {
            clearInterval(checkClosed);
            authWindow.close();
            reject(new Error(event.data.error));
          }
        });
      });
    } catch (error) {
      console.error('Google Calendar connection failed:', error);
      throw new ApiError('Failed to connect Google Calendar', 500, 'Unable to connect to Google Calendar. Please try again.');
    }
  }

  // Outlook Calendar Integration
  async connectOutlookCalendar() {
    try {
      const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
        `client_id=${import.meta.env.VITE_OUTLOOK_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(window.location.origin + '/auth/outlook/callback')}&` +
        `scope=https://graph.microsoft.com/Calendars.ReadWrite&` +
        `response_type=code`;

      const authWindow = window.open(
        authUrl,
        'outlook-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      return new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (authWindow.closed) {
            clearInterval(checkClosed);
            reject(new Error('Authentication cancelled'));
          }
        }, 1000);

        window.addEventListener('message', (event) => {
          if (event.origin !== window.location.origin) return;

          if (event.data.type === 'outlook-auth-success') {
            clearInterval(checkClosed);
            authWindow.close();
            resolve(event.data);
          } else if (event.data.type === 'outlook-auth-error') {
            clearInterval(checkClosed);
            authWindow.close();
            reject(new Error(event.data.error));
          }
        });
      });
    } catch (error) {
      console.error('Outlook Calendar connection failed:', error);
      throw new ApiError('Failed to connect Outlook Calendar', 500, 'Unable to connect to Outlook Calendar. Please try again.');
    }
  }

  // Sync calendar events
  async syncCalendar(provider, options = {}) {
    const {
      calendarId = 'primary',
      startDate = new Date(),
      endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      syncDirection = 'both' // both, import, export
    } = options;

    try {
      this.syncStatus.set(provider, 'syncing');

      const result = await apiService.post(`/api/calendar/${provider}/sync`, {
        calendarId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        syncDirection
      });

      this.syncStatus.set(provider, 'completed');
      return result;
    } catch (error) {
      this.syncStatus.set(provider, 'error');
      console.error(`${provider} calendar sync failed:`, error);
      throw new ApiError(`Failed to sync ${provider} calendar`, 500, `Unable to sync ${provider} calendar. Please try again.`);
    }
  }

  // Get calendar events
  async getCalendarEvents(provider, options = {}) {
    const {
      calendarId = 'primary',
      startDate = new Date(),
      endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      maxResults = 100
    } = options;

    try {
      const params = new URLSearchParams({
        calendarId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        maxResults
      });

      const result = await apiService.get(`/api/calendar/${provider}/events?${params}`);

      // Cache events
      this.calendarEvents.set(`${provider}_${calendarId}`, result);

      return result;
    } catch (error) {
      console.error(`Error fetching ${provider} calendar events:`, error);
      throw new ApiError(`Failed to fetch ${provider} events`, 500, `Unable to load calendar events.`);
    }
  }

  // Create calendar event
  async createCalendarEvent(provider, eventData, options = {}) {
    const {
      calendarId = 'primary',
      sendNotifications = true
    } = options;

    try {
      const result = await apiService.post(`/api/calendar/${provider}/events`, {
        calendarId,
        ...eventData,
        sendNotifications
      });

      // Invalidate cache
      this.calendarEvents.delete(`${provider}_${calendarId}`);

      return result;
    } catch (error) {
      console.error(`Error creating ${provider} event:`, error);
      throw new ApiError('Failed to create event', 500, 'Unable to create calendar event.');
    }
  }

  // Update calendar event
  async updateCalendarEvent(provider, eventId, eventData, options = {}) {
    const { calendarId = 'primary' } = options;

    try {
      const result = await apiService.put(`/api/calendar/${provider}/events/${eventId}`, {
        calendarId,
        ...eventData
      });

      // Invalidate cache
      this.calendarEvents.delete(`${provider}_${calendarId}`);

      return result;
    } catch (error) {
      console.error(`Error updating ${provider} event:`, error);
      throw new ApiError('Failed to update event', 500, 'Unable to update calendar event.');
    }
  }

  // Delete calendar event
  async deleteCalendarEvent(provider, eventId, options = {}) {
    const { calendarId = 'primary' } = options;

    try {
      await apiService.delete(`/api/calendar/${provider}/events/${eventId}`, {
        data: { calendarId }
      });

      // Invalidate cache
      this.calendarEvents.delete(`${provider}_${calendarId}`);

      return true;
    } catch (error) {
      console.error(`Error deleting ${provider} event:`, error);
      throw new ApiError('Failed to delete event', 500, 'Unable to delete calendar event.');
    }
  }

  // Get available calendars
  async getCalendars(provider) {
    try {
      return await apiService.get(`/api/calendar/${provider}/calendars`);
    } catch (error) {
      console.error(`Error fetching ${provider} calendars:`, error);
      throw new ApiError(`Failed to fetch ${provider} calendars`, 500, 'Unable to load calendars.');
    }
  }

  // Import events from external calendar
  async importEvents(provider, calendarId, options = {}) {
    const {
      startDate = new Date(),
      endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    } = options;

    try {
      const result = await apiService.post(`/api/calendar/${provider}/import`, {
        calendarId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      return result;
    } catch (error) {
      console.error(`Error importing ${provider} events:`, error);
      throw new ApiError(`Failed to import ${provider} events`, 500, 'Unable to import calendar events.');
    }
  }

  // Export events to external calendar
  async exportEvents(provider, events, options = {}) {
    const { calendarId = 'primary' } = options;

    try {
      const result = await apiService.post(`/api/calendar/${provider}/export`, {
        calendarId,
        events: events.map(event => ({
          ...event,
          start: { dateTime: event.start },
          end: { dateTime: event.end }
        }))
      });

      return result;
    } catch (error) {
      console.error(`Error exporting to ${provider}:`, error);
      throw new ApiError(`Failed to export to ${provider}`, 500, 'Unable to export calendar events.');
    }
  }

  // Set up event reminders
  async setupReminders(eventId, reminders = []) {
    try {
      const result = await apiService.post(`/api/calendar/events/${eventId}/reminders`, {
        reminders
      });

      this.eventReminders.set(eventId, reminders);
      return result;
    } catch (error) {
      console.error('Error setting up reminders:', error);
      throw new ApiError('Failed to setup reminders', 500, 'Unable to set up event reminders.');
    }
  }

  // Create recurring events
  async createRecurringEvent(eventData, recurrenceRule) {
    try {
      const result = await apiService.post('/api/calendar/recurring', {
        ...eventData,
        recurrence: recurrenceRule
      });

      this.recurringEvents.set(result.id, {
        ...eventData,
        recurrence: recurrenceRule
      });

      return result;
    } catch (error) {
      console.error('Error creating recurring event:', error);
      throw new ApiError('Failed to create recurring event', 500, 'Unable to create recurring event.');
    }
  }

  // Get recurring event instances
  async getRecurringInstances(eventId, options = {}) {
    const {
      startDate = new Date(),
      endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    } = options;

    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      return await apiService.get(`/api/calendar/recurring/${eventId}/instances?${params}`);
    } catch (error) {
      console.error('Error fetching recurring instances:', error);
      throw new ApiError('Failed to fetch recurring instances', 500, 'Unable to load recurring event instances.');
    }
  }

  // Calendar sharing
  async shareCalendar(provider, calendarId, users, permissions = 'read') {
    try {
      return await apiService.post(`/api/calendar/${provider}/calendars/${calendarId}/share`, {
        users,
        permissions
      });
    } catch (error) {
      console.error(`Error sharing ${provider} calendar:`, error);
      throw new ApiError('Failed to share calendar', 500, 'Unable to share calendar.');
    }
  }

  // Get calendar sharing permissions
  async getCalendarPermissions(provider, calendarId) {
    try {
      return await apiService.get(`/api/calendar/${provider}/calendars/${calendarId}/permissions`);
    } catch (error) {
      console.error(`Error fetching ${provider} calendar permissions:`, error);
      throw new ApiError('Failed to fetch permissions', 500, 'Unable to load calendar permissions.');
    }
  }

  // Calendar availability
  async getAvailability(provider, users, options = {}) {
    const {
      startDate = new Date(),
      endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      duration = 60 // minutes
    } = options;

    try {
      return await apiService.post(`/api/calendar/${provider}/availability`, {
        users,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        duration
      });
    } catch (error) {
      console.error(`Error fetching ${provider} availability:`, error);
      throw new ApiError('Failed to fetch availability', 500, 'Unable to load availability information.');
    }
  }

  // Schedule meeting
  async scheduleMeeting(meetingData, options = {}) {
    const {
      provider = 'google',
      sendInvites = true,
      createEvent = true
    } = options;

    try {
      const result = await apiService.post(`/api/calendar/${provider}/schedule`, {
        ...meetingData,
        sendInvites,
        createEvent
      });

      return result;
    } catch (error) {
      console.error(`Error scheduling ${provider} meeting:`, error);
      throw new ApiError('Failed to schedule meeting', 500, 'Unable to schedule meeting.');
    }
  }

  // Calendar integration status
  async getIntegrationStatus(provider) {
    try {
      return await apiService.get(`/api/calendar/${provider}/status`);
    } catch (error) {
      console.error(`Error fetching ${provider} integration status:`, error);
      return { connected: false, error: error.message };
    }
  }

  // Disconnect calendar
  async disconnectCalendar(provider) {
    try {
      await apiService.post(`/api/calendar/${provider}/disconnect`);

      // Clear local cache
      this.connectedAccounts.delete(provider);
      this.calendarEvents.clear();
      this.syncStatus.delete(provider);

      return true;
    } catch (error) {
      console.error(`Error disconnecting ${provider}:`, error);
      throw new ApiError(`Failed to disconnect ${provider}`, 500, 'Unable to disconnect calendar.');
    }
  }

  // Get connected accounts
  getConnectedAccounts() {
    return Array.from(this.connectedAccounts.keys());
  }

  // Get sync status
  getSyncStatus(provider) {
    return this.syncStatus.get(provider) || 'disconnected';
  }

  // Calendar analytics
  async getCalendarAnalytics(provider, options = {}) {
    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate = new Date()
    } = options;

    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      return await apiService.get(`/api/calendar/${provider}/analytics?${params}`);
    } catch (error) {
      console.error(`Error fetching ${provider} analytics:`, error);
      throw new ApiError('Failed to fetch analytics', 500, 'Unable to load calendar analytics.');
    }
  }

  // Export calendar data
  async exportCalendar(provider, format = 'ics', options = {}) {
    const {
      calendarId = 'primary',
      startDate = new Date(),
      endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    } = options;

    try {
      const params = new URLSearchParams({
        format,
        calendarId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      const result = await apiService.get(`/api/calendar/${provider}/export?${params}`);

      // Create download link
      const blob = new Blob([result], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `calendar.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error(`Error exporting ${provider} calendar:`, error);
      throw new ApiError(`Failed to export ${provider} calendar`, 500, 'Unable to export calendar data.');
    }
  }

  // Import calendar data
  async importCalendar(provider, file, options = {}) {
    const { calendarId = 'primary' } = options;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('calendarId', calendarId);

      return await apiService.post(`/api/calendar/${provider}/import`, formData);
    } catch (error) {
      console.error(`Error importing to ${provider}:`, error);
      throw new ApiError(`Failed to import to ${provider}`, 500, 'Unable to import calendar data.');
    }
  }

  // Bulk operations
  async bulkCreateEvents(provider, events, options = {}) {
    const { calendarId = 'primary' } = options;

    try {
      return await apiService.post(`/api/calendar/${provider}/events/bulk`, {
        calendarId,
        events
      });
    } catch (error) {
      console.error(`Error bulk creating ${provider} events:`, error);
      throw new ApiError('Failed to create events', 500, 'Unable to create calendar events.');
    }
  }

  // Event conflict detection
  async checkConflicts(provider, eventData, options = {}) {
    const { calendarId = 'primary' } = options;

    try {
      return await apiService.post(`/api/calendar/${provider}/conflicts`, {
        calendarId,
        ...eventData
      });
    } catch (error) {
      console.error(`Error checking ${provider} conflicts:`, error);
      throw new ApiError('Failed to check conflicts', 500, 'Unable to check for scheduling conflicts.');
    }
  }

  // Quick event creation
  async createQuickEvent(provider, title, startTime, endTime, options = {}) {
    const { calendarId = 'primary' } = options;

    try {
      return await apiService.post(`/api/calendar/${provider}/quick-event`, {
        calendarId,
        title,
        start: { dateTime: startTime.toISOString() },
        end: { dateTime: endTime.toISOString() }
      });
    } catch (error) {
      console.error(`Error creating quick ${provider} event:`, error);
      throw new ApiError('Failed to create quick event', 500, 'Unable to create quick event.');
    }
  }

  // Calendar notifications
  async setupEventNotifications(eventId, notifications = []) {
    try {
      return await apiService.post(`/api/calendar/events/${eventId}/notifications`, {
        notifications
      });
    } catch (error) {
      console.error('Error setting up event notifications:', error);
      throw new ApiError('Failed to setup notifications', 500, 'Unable to set up event notifications.');
    }
  }

  // Get calendar settings
  async getCalendarSettings(provider) {
    try {
      return await apiService.get(`/api/calendar/${provider}/settings`);
    } catch (error) {
      console.error(`Error fetching ${provider} settings:`, error);
      throw new ApiError('Failed to fetch settings', 500, 'Unable to load calendar settings.');
    }
  }

  // Update calendar settings
  async updateCalendarSettings(provider, settings) {
    try {
      return await apiService.put(`/api/calendar/${provider}/settings`, settings);
    } catch (error) {
      console.error(`Error updating ${provider} settings:`, error);
      throw new ApiError('Failed to update settings', 500, 'Unable to update calendar settings.');
    }
  }

  // Calendar backup
  async backupCalendar(provider, options = {}) {
    const {
      calendarId = 'primary',
      format = 'json'
    } = options;

    try {
      const params = new URLSearchParams({ calendarId, format });
      return await apiService.get(`/api/calendar/${provider}/backup?${params}`);
    } catch (error) {
      console.error(`Error backing up ${provider} calendar:`, error);
      throw new ApiError(`Failed to backup ${provider} calendar`, 500, 'Unable to backup calendar data.');
    }
  }

  // Calendar restore
  async restoreCalendar(provider, backupData, options = {}) {
    const { calendarId = 'primary' } = options;

    try {
      return await apiService.post(`/api/calendar/${provider}/restore`, {
        calendarId,
        backupData
      });
    } catch (error) {
      console.error(`Error restoring ${provider} calendar:`, error);
      throw new ApiError(`Failed to restore ${provider} calendar`, 500, 'Unable to restore calendar data.');
    }
  }

  // Get calendar usage statistics
  async getUsageStats(provider, options = {}) {
    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate = new Date()
    } = options;

    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      return await apiService.get(`/api/calendar/${provider}/stats?${params}`);
    } catch (error) {
      console.error(`Error fetching ${provider} usage stats:`, error);
      throw new ApiError('Failed to fetch usage statistics', 500, 'Unable to load calendar usage statistics.');
    }
  }

  // Cleanup resources
  cleanup() {
    this.connectedAccounts.clear();
    this.calendarEvents.clear();
    this.syncStatus.clear();
    this.eventReminders.clear();
    this.recurringEvents.clear();
  }
}

// React hooks for calendar integration
export const useCalendar = (provider = 'google') => {
  const [events, setEvents] = React.useState([]);
  const [calendars, setCalendars] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [connected, setConnected] = React.useState(false);

  const connect = React.useCallback(async () => {
    setLoading(true);
    try {
      let result;

      if (provider === 'google') {
        result = await calendarManager.connectGoogleCalendar();
      } else if (provider === 'outlook') {
        result = await calendarManager.connectOutlookCalendar();
      }

      setConnected(true);
      return result;
    } catch (error) {
      console.error(`Error connecting ${provider}:`, error);
      setConnected(false);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [provider]);

  const sync = React.useCallback(async (options = {}) => {
    setLoading(true);
    try {
      return await calendarManager.syncCalendar(provider, options);
    } catch (error) {
      console.error(`Error syncing ${provider}:`, error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [provider]);

  const loadEvents = React.useCallback(async (options = {}) => {
    setLoading(true);
    try {
      const result = await calendarManager.getCalendarEvents(provider, options);
      setEvents(result.items || []);
      return result;
    } catch (error) {
      console.error(`Error loading ${provider} events:`, error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [provider]);

  const createEvent = React.useCallback(async (eventData, options = {}) => {
    try {
      const result = await calendarManager.createCalendarEvent(provider, eventData, options);

      // Refresh events
      await loadEvents();
      return result;
    } catch (error) {
      console.error(`Error creating ${provider} event:`, error);
      throw error;
    }
  }, [provider, loadEvents]);

  const updateEvent = React.useCallback(async (eventId, eventData, options = {}) => {
    try {
      const result = await calendarManager.updateCalendarEvent(provider, eventId, eventData, options);

      // Refresh events
      await loadEvents();
      return result;
    } catch (error) {
      console.error(`Error updating ${provider} event:`, error);
      throw error;
    }
  }, [provider, loadEvents]);

  const deleteEvent = React.useCallback(async (eventId, options = {}) => {
    try {
      await calendarManager.deleteCalendarEvent(provider, eventId, options);

      // Refresh events
      await loadEvents();
      return true;
    } catch (error) {
      console.error(`Error deleting ${provider} event:`, error);
      throw error;
    }
  }, [provider, loadEvents]);

  const loadCalendars = React.useCallback(async () => {
    try {
      const result = await calendarManager.getCalendars(provider);
      setCalendars(result.items || []);
      return result;
    } catch (error) {
      console.error(`Error loading ${provider} calendars:`, error);
      setCalendars([]);
    }
  }, [provider]);

  const disconnect = React.useCallback(async () => {
    setLoading(true);
    try {
      await calendarManager.disconnectCalendar(provider);
      setConnected(false);
      setEvents([]);
      setCalendars([]);
      return true;
    } catch (error) {
      console.error(`Error disconnecting ${provider}:`, error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [provider]);

  return {
    events,
    calendars,
    loading,
    connected,
    connect,
    sync,
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    loadCalendars,
    disconnect,
    getStatus: () => calendarManager.getIntegrationStatus(provider),
    getSyncStatus: () => calendarManager.getSyncStatus(provider)
  };
};

// Create singleton instance
export const calendarManager = new CalendarManager();

export default calendarManager;

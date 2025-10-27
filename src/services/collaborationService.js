// Collaborative Workspace Service
// Unified workspace for team collaboration with integrated tools

import { apiService, ApiError } from './apiService';

class CollaborationWorkspace {
  constructor() {
    this.workspaces = new Map();
    this.activeWorkspace = null;
    this.workspaceMembers = new Map();
    this.workspaceActivity = new Map();
    this.sharedResources = new Map();
    this.workspaceSettings = new Map();
  }

  // Create workspace
  async createWorkspace(workspaceData) {
    try {
      const result = await apiService.post('/api/workspaces', {
        ...workspaceData,
        createdAt: new Date().toISOString(),
        status: 'active'
      });

      this.workspaces.set(result.id, result);
      this.workspaceSettings.set(result.id, result.settings || {});

      return result;
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw new ApiError('Failed to create workspace', 500, 'Unable to create workspace. Please try again.');
    }
  }

  // Join workspace
  async joinWorkspace(workspaceId, userData) {
    try {
      const result = await apiService.post(`/api/workspaces/${workspaceId}/join`, {
        ...userData,
        joinedAt: new Date().toISOString(),
        role: userData.role || 'member'
      });

      // Add to workspace members
      if (!this.workspaceMembers.has(workspaceId)) {
        this.workspaceMembers.set(workspaceId, []);
      }

      const members = this.workspaceMembers.get(workspaceId);
      const existingIndex = members.findIndex(m => m.userId === userData.userId);

      if (existingIndex === -1) {
        members.push(result);
      } else {
        members[existingIndex] = result;
      }

      this.workspaceMembers.set(workspaceId, members);

      this.activeWorkspace = workspaceId;

      return result;
    } catch (error) {
      console.error('Error joining workspace:', error);
      throw new ApiError('Failed to join workspace', 500, 'Unable to join workspace.');
    }
  }

  // Leave workspace
  async leaveWorkspace(workspaceId, userId) {
    try {
      await apiService.post(`/api/workspaces/${workspaceId}/leave`, {
        userId,
        leftAt: new Date().toISOString()
      });

      // Update local members
      if (this.workspaceMembers.has(workspaceId)) {
        const members = this.workspaceMembers.get(workspaceId);
        const updated = members.filter(m => m.userId !== userId);
        this.workspaceMembers.set(workspaceId, updated);
      }

      if (this.activeWorkspace === workspaceId) {
        this.activeWorkspace = null;
      }

      return true;
    } catch (error) {
      console.error('Error leaving workspace:', error);
      throw new ApiError('Failed to leave workspace', 500, 'Unable to leave workspace.');
    }
  }

  // Get workspace details
  async getWorkspace(workspaceId) {
    try {
      const result = await apiService.get(`/api/workspaces/${workspaceId}`);
      this.workspaces.set(workspaceId, result);
      return result;
    } catch (error) {
      console.error('Error fetching workspace:', error);
      throw new ApiError('Failed to fetch workspace', 500, 'Unable to load workspace.');
    }
  }

  // Get user's workspaces
  async getUserWorkspaces(userId) {
    try {
      const result = await apiService.get(`/api/workspaces/user/${userId}`);

      result.forEach(workspace => {
        this.workspaces.set(workspace.id, workspace);
      });

      return result;
    } catch (error) {
      console.error('Error fetching user workspaces:', error);
      throw new ApiError('Failed to fetch workspaces', 500, 'Unable to load workspaces.');
    }
  }

  // Workspace collaboration tools
  async inviteToWorkspace(workspaceId, users, role = 'member') {
    try {
      const result = await apiService.post(`/api/workspaces/${workspaceId}/invite`, {
        users,
        role,
        invitedAt: new Date().toISOString()
      });

      return result;
    } catch (error) {
      console.error('Error inviting to workspace:', error);
      throw new ApiError('Failed to send invitations', 500, 'Unable to send workspace invitations.');
    }
  }

  // Workspace activity tracking
  async trackActivity(workspaceId, activity) {
    try {
      const activityData = {
        ...activity,
        workspaceId,
        timestamp: new Date().toISOString(),
        userId: this.getCurrentUserId()
      };

      await apiService.post(`/api/workspaces/${workspaceId}/activity`, activityData);

      // Update local activity
      if (!this.workspaceActivity.has(workspaceId)) {
        this.workspaceActivity.set(workspaceId, []);
      }

      const activities = this.workspaceActivity.get(workspaceId);
      activities.unshift(activityData);

      // Keep only last 100 activities
      if (activities.length > 100) {
        activities.splice(100);
      }

      this.workspaceActivity.set(workspaceId, activities);

      return activityData;
    } catch (error) {
      console.error('Error tracking activity:', error);
      throw new ApiError('Failed to track activity', 500, 'Unable to track workspace activity.');
    }
  }

  // Get workspace activity
  async getWorkspaceActivity(workspaceId, options = {}) {
    const {
      limit = 50,
      type = null,
      userId = null
    } = options;

    try {
      const params = new URLSearchParams({ limit, type, userId });
      return await apiService.get(`/api/workspaces/${workspaceId}/activity?${params}`);
    } catch (error) {
      console.error('Error fetching workspace activity:', error);
      throw new ApiError('Failed to fetch activity', 500, 'Unable to load workspace activity.');
    }
  }

  // Shared resources management
  async shareResource(workspaceId, resourceData) {
    try {
      const result = await apiService.post(`/api/workspaces/${workspaceId}/resources`, {
        ...resourceData,
        sharedAt: new Date().toISOString()
      });

      // Add to shared resources
      if (!this.sharedResources.has(workspaceId)) {
        this.sharedResources.set(workspaceId, []);
      }

      const resources = this.sharedResources.get(workspaceId);
      resources.push(result);
      this.sharedResources.set(workspaceId, resources);

      return result;
    } catch (error) {
      console.error('Error sharing resource:', error);
      throw new ApiError('Failed to share resource', 500, 'Unable to share resource in workspace.');
    }
  }

  // Get shared resources
  async getSharedResources(workspaceId) {
    try {
      const result = await apiService.get(`/api/workspaces/${workspaceId}/resources`);
      this.sharedResources.set(workspaceId, result);
      return result;
    } catch (error) {
      console.error('Error fetching shared resources:', error);
      throw new ApiError('Failed to fetch resources', 500, 'Unable to load shared resources.');
    }
  }

  // Workspace settings
  async updateWorkspaceSettings(workspaceId, settings) {
    try {
      const result = await apiService.patch(`/api/workspaces/${workspaceId}/settings`, settings);

      // Update local settings
      const currentSettings = this.workspaceSettings.get(workspaceId) || {};
      this.workspaceSettings.set(workspaceId, { ...currentSettings, ...settings });

      return result;
    } catch (error) {
      console.error('Error updating workspace settings:', error);
      throw new ApiError('Failed to update settings', 500, 'Unable to update workspace settings.');
    }
  }

  // Get workspace settings
  async getWorkspaceSettings(workspaceId) {
    try {
      const result = await apiService.get(`/api/workspaces/${workspaceId}/settings`);
      this.workspaceSettings.set(workspaceId, result);
      return result;
    } catch (error) {
      console.error('Error fetching workspace settings:', error);
      throw new ApiError('Failed to fetch settings', 500, 'Unable to load workspace settings.');
    }
  }

  // Workspace permissions
  async updateMemberPermissions(workspaceId, userId, permissions) {
    try {
      const result = await apiService.patch(`/api/workspaces/${workspaceId}/members/${userId}/permissions`, {
        permissions,
        updatedAt: new Date().toISOString()
      });

      // Update local member
      if (this.workspaceMembers.has(workspaceId)) {
        const members = this.workspaceMembers.get(workspaceId);
        const memberIndex = members.findIndex(m => m.userId === userId);
        if (memberIndex !== -1) {
          members[memberIndex].permissions = permissions;
          this.workspaceMembers.set(workspaceId, members);
        }
      }

      return result;
    } catch (error) {
      console.error('Error updating member permissions:', error);
      throw new ApiError('Failed to update permissions', 500, 'Unable to update member permissions.');
    }
  }

  // Workspace roles
  async assignRole(workspaceId, userId, role) {
    try {
      const result = await apiService.patch(`/api/workspaces/${workspaceId}/members/${userId}/role`, {
        role,
        assignedAt: new Date().toISOString()
      });

      // Update local member
      if (this.workspaceMembers.has(workspaceId)) {
        const members = this.workspaceMembers.get(workspaceId);
        const memberIndex = members.findIndex(m => m.userId === userId);
        if (memberIndex !== -1) {
          members[memberIndex].role = role;
          this.workspaceMembers.set(workspaceId, members);
        }
      }

      return result;
    } catch (error) {
      console.error('Error assigning role:', error);
      throw new ApiError('Failed to assign role', 500, 'Unable to assign workspace role.');
    }
  }

  // Workspace notifications
  async setupWorkspaceNotifications(workspaceId, notificationSettings) {
    try {
      return await apiService.post(`/api/workspaces/${workspaceId}/notifications`, {
        ...notificationSettings,
        setupAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error setting up workspace notifications:', error);
      throw new ApiError('Failed to setup notifications', 500, 'Unable to set up workspace notifications.');
    }
  }

  // Workspace calendar integration
  async connectWorkspaceCalendar(workspaceId, calendarData) {
    try {
      return await apiService.post(`/api/workspaces/${workspaceId}/calendar`, {
        ...calendarData,
        connectedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error connecting workspace calendar:', error);
      throw new ApiError('Failed to connect calendar', 500, 'Unable to connect workspace calendar.');
    }
  }

  // Workspace file sharing
  async shareWorkspaceFiles(workspaceId, files, shareSettings) {
    try {
      return await apiService.post(`/api/workspaces/${workspaceId}/files/share`, {
        files,
        ...shareSettings,
        sharedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error sharing workspace files:', error);
      throw new ApiError('Failed to share files', 500, 'Unable to share workspace files.');
    }
  }

  // Workspace analytics
  async getWorkspaceAnalytics(workspaceId, options = {}) {
    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate = new Date()
    } = options;

    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      return await apiService.get(`/api/workspaces/${workspaceId}/analytics?${params}`);
    } catch (error) {
      console.error('Error fetching workspace analytics:', error);
      throw new ApiError('Failed to fetch analytics', 500, 'Unable to load workspace analytics.');
    }
  }

  // Workspace backup
  async backupWorkspace(workspaceId) {
    try {
      return await apiService.post(`/api/workspaces/${workspaceId}/backup`);
    } catch (error) {
      console.error('Error backing up workspace:', error);
      throw new ApiError('Failed to backup workspace', 500, 'Unable to backup workspace.');
    }
  }

  // Workspace restore
  async restoreWorkspace(workspaceId, backupId) {
    try {
      return await apiService.post(`/api/workspaces/${workspaceId}/restore`, {
        backupId
      });
    } catch (error) {
      console.error('Error restoring workspace:', error);
      throw new ApiError('Failed to restore workspace', 500, 'Unable to restore workspace.');
    }
  }

  // Delete workspace
  async deleteWorkspace(workspaceId) {
    try {
      await apiService.delete(`/api/workspaces/${workspaceId}`);

      // Remove from local tracking
      this.workspaces.delete(workspaceId);
      this.workspaceMembers.delete(workspaceId);
      this.workspaceActivity.delete(workspaceId);
      this.sharedResources.delete(workspaceId);
      this.workspaceSettings.delete(workspaceId);

      if (this.activeWorkspace === workspaceId) {
        this.activeWorkspace = null;
      }

      return true;
    } catch (error) {
      console.error('Error deleting workspace:', error);
      throw new ApiError('Failed to delete workspace', 500, 'Unable to delete workspace.');
    }
  }

  // Get current user ID
  getCurrentUserId() {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      return user.id || null;
    } catch {
      return null;
    }
  }

  // Get active workspace
  getActiveWorkspace() {
    return this.activeWorkspace;
  }

  // Set active workspace
  setActiveWorkspace(workspaceId) {
    this.activeWorkspace = workspaceId;
    localStorage.setItem('activeWorkspace', workspaceId);
  }

  // Get workspace members
  getWorkspaceMembers(workspaceId) {
    return this.workspaceMembers.get(workspaceId) || [];
  }

  // Get workspace activity
  getWorkspaceActivity(workspaceId) {
    return this.workspaceActivity.get(workspaceId) || [];
  }

  // Get shared resources
  getSharedResources(workspaceId) {
    return this.sharedResources.get(workspaceId) || [];
  }

  // Get workspace settings
  getWorkspaceSettings(workspaceId) {
    return this.workspaceSettings.get(workspaceId) || {};
  }

  // Workspace search
  async searchWorkspace(workspaceId, query, options = {}) {
    const {
      type = 'all', // all, files, messages, members, activities
      limit = 20
    } = options;

    try {
      const params = new URLSearchParams({
        q: query,
        type,
        limit
      });

      return await apiService.get(`/api/workspaces/${workspaceId}/search?${params}`);
    } catch (error) {
      console.error('Error searching workspace:', error);
      throw new ApiError('Search failed', 500, 'Unable to search workspace.');
    }
  }

  // Workspace dashboard data
  async getWorkspaceDashboard(workspaceId) {
    try {
      const [workspace, members, activity, resources, analytics] = await Promise.all([
        this.getWorkspace(workspaceId),
        this.getWorkspaceMembers(workspaceId),
        this.getWorkspaceActivity(workspaceId),
        this.getSharedResources(workspaceId),
        this.getWorkspaceAnalytics(workspaceId)
      ]);

      return {
        workspace,
        members,
        recentActivity: activity.slice(0, 10),
        sharedResources: resources.slice(0, 10),
        analytics,
        stats: {
          memberCount: members.length,
          activityCount: activity.length,
          resourceCount: resources.length,
          activeMembers: members.filter(m => m.status === 'active').length
        }
      };
    } catch (error) {
      console.error('Error fetching workspace dashboard:', error);
      throw new ApiError('Failed to fetch dashboard', 500, 'Unable to load workspace dashboard.');
    }
  }

  // Real-time workspace updates
  setupWorkspaceUpdates(workspaceId, onUpdate) {
    // WebSocket connection for real-time updates
    const wsUrl = `wss://${window.location.host}/api/workspaces/${workspaceId}/ws`;

    try {
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('Connected to workspace updates');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (onUpdate) {
            onUpdate(data);
          }

          // Update local state based on update type
          this.handleWorkspaceUpdate(workspaceId, data);
        } catch (error) {
          console.error('Error parsing workspace update:', error);
        }
      };

      socket.onerror = (error) => {
        console.error('Workspace WebSocket error:', error);
      };

      socket.onclose = () => {
        console.log('Disconnected from workspace updates');
      };

      return socket;
    } catch (error) {
      console.error('Failed to setup workspace updates:', error);

      // Fallback to polling
      return this.setupWorkspacePolling(workspaceId, onUpdate);
    }
  }

  // Handle workspace update
  handleWorkspaceUpdate(workspaceId, update) {
    switch (update.type) {
      case 'member_joined':
        if (this.workspaceMembers.has(workspaceId)) {
          const members = this.workspaceMembers.get(workspaceId);
          members.push(update.data);
          this.workspaceMembers.set(workspaceId, members);
        }
        break;

      case 'member_left':
        if (this.workspaceMembers.has(workspaceId)) {
          const members = this.workspaceMembers.get(workspaceId);
          const updated = members.map(m =>
            m.userId === update.data.userId ? { ...m, status: 'left' } : m
          );
          this.workspaceMembers.set(workspaceId, updated);
        }
        break;

      case 'new_activity':
        if (this.workspaceActivity.has(workspaceId)) {
          const activities = this.workspaceActivity.get(workspaceId);
          activities.unshift(update.data);
          this.workspaceActivity.set(workspaceId, activities);
        }
        break;

      case 'resource_shared':
        if (this.sharedResources.has(workspaceId)) {
          const resources = this.sharedResources.get(workspaceId);
          resources.unshift(update.data);
          this.sharedResources.set(workspaceId, resources);
        }
        break;
    }
  }

  // Polling fallback for workspace updates
  setupWorkspacePolling(workspaceId, onUpdate) {
    const pollInterval = setInterval(async () => {
      try {
        const updates = await apiService.get(`/api/workspaces/${workspaceId}/updates`);

        if (updates.length > 0 && onUpdate) {
          updates.forEach(update => {
            onUpdate(update);
            this.handleWorkspaceUpdate(workspaceId, update);
          });
        }
      } catch (error) {
        console.error('Workspace polling error:', error);
      }
    }, 5000); // Poll every 5 seconds

    // Return cleanup function
    return () => clearInterval(pollInterval);
  }

  // Workspace templates
  async createWorkspaceTemplate(templateData) {
    try {
      return await apiService.post('/api/workspaces/templates', {
        ...templateData,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error creating workspace template:', error);
      throw new ApiError('Failed to create template', 500, 'Unable to create workspace template.');
    }
  }

  // Get workspace templates
  async getWorkspaceTemplates() {
    try {
      return await apiService.get('/api/workspaces/templates');
    } catch (error) {
      console.error('Error fetching workspace templates:', error);
      throw new ApiError('Failed to fetch templates', 500, 'Unable to load workspace templates.');
    }
  }

  // Apply workspace template
  async applyWorkspaceTemplate(templateId) {
    try {
      return await apiService.post(`/api/workspaces/templates/${templateId}/apply`);
    } catch (error) {
      console.error('Error applying workspace template:', error);
      throw new ApiError('Failed to apply template', 500, 'Unable to apply workspace template.');
    }
  }

  // Workspace export
  async exportWorkspace(workspaceId, format = 'json') {
    try {
      const params = new URLSearchParams({ format });
      return await apiService.get(`/api/workspaces/${workspaceId}/export?${params}`);
    } catch (error) {
      console.error('Error exporting workspace:', error);
      throw new ApiError('Failed to export workspace', 500, 'Unable to export workspace.');
    }
  }

  // Workspace import
  async importWorkspace(workspaceData, options = {}) {
    const { name = null, description = null } = options;

    try {
      return await apiService.post('/api/workspaces/import', {
        workspaceData,
        name,
        description,
        importedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error importing workspace:', error);
      throw new ApiError('Failed to import workspace', 500, 'Unable to import workspace.');
    }
  }

  // Get user's workspaces
  getUserWorkspaces() {
    return Array.from(this.workspaces.values()).filter(w =>
      this.workspaceMembers.get(w.id)?.some(m => m.userId === this.getCurrentUserId())
    );
  }

  // Get workspace statistics
  getWorkspaceStats(workspaceId) {
    const members = this.workspaceMembers.get(workspaceId) || [];
    const activity = this.workspaceActivity.get(workspaceId) || [];
    const resources = this.sharedResources.get(workspaceId) || [];

    return {
      memberCount: members.length,
      activeMembers: members.filter(m => m.status === 'active').length,
      activityCount: activity.length,
      resourceCount: resources.length,
      lastActivity: activity[0]?.timestamp || null
    };
  }

  // Cleanup resources
  cleanup() {
    this.workspaces.clear();
    this.workspaceMembers.clear();
    this.workspaceActivity.clear();
    this.sharedResources.clear();
    this.workspaceSettings.clear();
    this.activeWorkspace = null;
  }
}

// React hooks for workspace collaboration
export const useWorkspace = (workspaceId = null) => {
  const [workspace, setWorkspace] = React.useState(null);
  const [members, setMembers] = React.useState([]);
  const [activity, setActivity] = React.useState([]);
  const [resources, setResources] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const loadWorkspace = React.useCallback(async (id) => {
    setLoading(true);
    try {
      const result = await collaborationWorkspace.getWorkspace(id);
      setWorkspace(result);
      return result;
    } catch (error) {
      console.error('Error loading workspace:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMembers = React.useCallback(async (id) => {
    try {
      const result = await collaborationWorkspace.getWorkspaceMembers(id);
      setMembers(result);
      return result;
    } catch (error) {
      console.error('Error loading workspace members:', error);
      setMembers([]);
    }
  }, []);

  const loadActivity = React.useCallback(async (id) => {
    try {
      const result = await collaborationWorkspace.getWorkspaceActivity(id);
      setActivity(result);
      return result;
    } catch (error) {
      console.error('Error loading workspace activity:', error);
      setActivity([]);
    }
  }, []);

  const loadResources = React.useCallback(async (id) => {
    try {
      const result = await collaborationWorkspace.getSharedResources(id);
      setResources(result);
      return result;
    } catch (error) {
      console.error('Error loading workspace resources:', error);
      setResources([]);
    }
  }, []);

  const joinWorkspace = React.useCallback(async (id, userData) => {
    try {
      const result = await collaborationWorkspace.joinWorkspace(id, userData);
      await Promise.all([
        loadWorkspace(id),
        loadMembers(id),
        loadActivity(id),
        loadResources(id)
      ]);
      return result;
    } catch (error) {
      console.error('Error joining workspace:', error);
      throw error;
    }
  }, [loadWorkspace, loadMembers, loadActivity, loadResources]);

  const leaveWorkspace = React.useCallback(async (id) => {
    try {
      await collaborationWorkspace.leaveWorkspace(id, collaborationWorkspace.getCurrentUserId());
      setWorkspace(null);
      setMembers([]);
      setActivity([]);
      setResources([]);
      return true;
    } catch (error) {
      console.error('Error leaving workspace:', error);
      throw error;
    }
  }, []);

  const createWorkspace = React.useCallback(async (workspaceData) => {
    try {
      const result = await collaborationWorkspace.createWorkspace(workspaceData);
      return result;
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw error;
    }
  }, []);

  const updateSettings = React.useCallback(async (id, settings) => {
    try {
      return await collaborationWorkspace.updateWorkspaceSettings(id, settings);
    } catch (error) {
      console.error('Error updating workspace settings:', error);
      throw error;
    }
  }, []);

  // Load workspace data on mount
  React.useEffect(() => {
    if (workspaceId) {
      Promise.all([
        loadWorkspace(workspaceId),
        loadMembers(workspaceId),
        loadActivity(workspaceId),
        loadResources(workspaceId)
      ]);
    }
  }, [workspaceId, loadWorkspace, loadMembers, loadActivity, loadResources]);

  return {
    workspace,
    members,
    activity,
    resources,
    loading,
    joinWorkspace,
    leaveWorkspace,
    createWorkspace,
    updateSettings,
    getStats: () => workspaceId ? collaborationWorkspace.getWorkspaceStats(workspaceId) : {},
    searchWorkspace: (query, options) => workspaceId ? collaborationWorkspace.searchWorkspace(workspaceId, query, options) : null,
    getDashboard: () => workspaceId ? collaborationWorkspace.getWorkspaceDashboard(workspaceId) : null
  };
};

// Create singleton instance
export const collaborationWorkspace = new CollaborationWorkspace();

export default collaborationWorkspace;

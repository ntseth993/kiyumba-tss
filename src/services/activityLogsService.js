const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// Initialize sample activity logs
const initializeActivityLogs = () => {
  const existing = localStorage.getItem('activityLogs');
  if (!existing) {
    const sampleLogs = [
      {
        id: 1,
        user: 'Admin User',
        action: 'created new student',
        details: 'Alice Johnson',
        type: 'success',
        timestamp: new Date(Date.now() - 300000).toISOString() // 5 minutes ago
      },
      {
        id: 2,
        user: 'Teacher One',
        action: 'updated course content',
        details: 'Mathematics 101',
        type: 'info',
        timestamp: new Date(Date.now() - 900000).toISOString() // 15 minutes ago
      },
      {
        id: 3,
        user: 'Admin User',
        action: 'created new event',
        details: 'Staff Meeting',
        type: 'success',
        timestamp: new Date(Date.now() - 1800000).toISOString() // 30 minutes ago
      }
    ];
    localStorage.setItem('activityLogs', JSON.stringify(sampleLogs));
  }
};

// Activity Logs Service
export const activityLogsService = {
  async getRecentActivityLogs(limit = 10) {
    try {
      // Initialize sample data if not exists
      initializeActivityLogs();

      const response = await fetch(`${API_BASE}/activity-logs?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch activity logs');
      return await response.json();
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      // Fallback to localStorage
      initializeActivityLogs();
      const stored = localStorage.getItem('activityLogs');
      const logs = stored ? JSON.parse(stored) : [];
      return logs.slice(0, limit);
    }
  },

  async logActivity(user, action, details = '', type = 'info') {
    try {
      const response = await fetch(`${API_BASE}/activity-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, action, details, type, timestamp: new Date().toISOString() })
      });
      if (!response.ok) throw new Error('Failed to log activity');
      return await response.json();
    } catch (error) {
      console.error('Error logging activity:', error);
      // Fallback to localStorage
      const logs = await this.getRecentActivityLogs(50);
      const newLog = {
        id: Date.now(),
        user,
        action,
        details,
        type,
        timestamp: new Date().toISOString()
      };
      logs.unshift(newLog);
      localStorage.setItem('activityLogs', JSON.stringify(logs.slice(0, 100))); // Keep last 100
      return newLog;
    }
  }
};

// Security Service
// Handles role-based permissions, data validation, sanitization, and access control

class SecurityManager {
  constructor() {
    this.roles = {
      admin: {
        level: 100,
        permissions: [
          'users.read', 'users.write', 'users.delete',
          'posts.read', 'posts.write', 'posts.delete',
          'applications.read', 'applications.write',
          'notifications.read', 'notifications.write',
          'system.admin', 'system.settings'
        ]
      },
      teacher: {
        level: 75,
        permissions: [
          'posts.read', 'posts.write',
          'students.read', 'students.write',
          'grades.read', 'grades.write',
          'attendance.read', 'attendance.write',
          'assessments.read', 'assessments.write'
        ]
      },
      staff: {
        level: 50,
        permissions: [
          'students.read',
          'posts.read',
          'applications.read',
          'notifications.read'
        ]
      },
      student: {
        level: 25,
        permissions: [
          'profile.read', 'profile.write',
          'posts.read',
          'notifications.read',
          'grades.read',
          'attendance.read'
        ]
      }
    };

    this.validationRules = {
      email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      phone: /^\+?[\d\s\-\(\)]+$/,
      password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      name: /^[a-zA-Z\s]{2,50}$/,
      studentId: /^[A-Z0-9]{6,12}$/
    };

    this.sanitizationRules = {
      html: /<[^>]*>/g,
      sql: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      xss: /(\bjavascript:|vbscript:|on\w+\s*=)/gi
    };
  }

  // Check if user has permission
  hasPermission(userRole, permission) {
    const role = this.roles[userRole];
    if (!role) return false;

    return role.permissions.includes(permission);
  }

  // Check if user can access resource
  canAccess(userRole, resource, action = 'read') {
    const permission = `${resource}.${action}`;
    return this.hasPermission(userRole, permission);
  }

  // Get user role level
  getRoleLevel(role) {
    return this.roles[role]?.level || 0;
  }

  // Check if user role is sufficient for action
  requiresRoleLevel(userRole, requiredLevel) {
    const userLevel = this.getRoleLevel(userRole);
    return userLevel >= requiredLevel;
  }

  // Validate data against rules
  validate(data, rules) {
    const errors = {};
    let isValid = true;

    for (const [field, rule] of Object.entries(rules)) {
      const value = data[field];

      if (rule.required && (value === undefined || value === null || value === '')) {
        errors[field] = `${field} is required`;
        isValid = false;
        continue;
      }

      if (value && rule.type && !this.validateType(value, rule.type)) {
        errors[field] = `${field} must be of type ${rule.type}`;
        isValid = false;
        continue;
      }

      if (value && rule.pattern && !rule.pattern.test(value)) {
        errors[field] = `${field} format is invalid`;
        isValid = false;
        continue;
      }

      if (value && rule.minLength && value.length < rule.minLength) {
        errors[field] = `${field} must be at least ${rule.minLength} characters`;
        isValid = false;
        continue;
      }

      if (value && rule.maxLength && value.length > rule.maxLength) {
        errors[field] = `${field} must be no more than ${rule.maxLength} characters`;
        isValid = false;
        continue;
      }

      if (value && rule.custom && !rule.custom(value)) {
        errors[field] = rule.customMessage || `${field} is invalid`;
        isValid = false;
        continue;
      }
    }

    return { isValid, errors };
  }

  // Validate data type
  validateType(value, type) {
    switch (type) {
      case 'email':
        return this.validationRules.email.test(value);
      case 'phone':
        return this.validationRules.phone.test(value);
      case 'password':
        return this.validationRules.password.test(value);
      case 'name':
        return this.validationRules.name.test(value);
      case 'studentId':
        return this.validationRules.studentId.test(value);
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null;
      default:
        return true;
    }
  }

  // Sanitize input data
  sanitize(input, type = 'text') {
    let sanitized = String(input);

    switch (type) {
      case 'html':
        // Remove HTML tags
        sanitized = sanitized.replace(this.sanitizationRules.html, '');
        break;
      case 'sql':
        // Remove potential SQL injection patterns
        sanitized = sanitized.replace(this.sanitizationRules.sql, '');
        break;
      case 'xss':
        // Remove XSS patterns
        sanitized = sanitized.replace(this.sanitizationRules.xss, '');
        break;
      case 'filename':
        // Safe filename characters only
        sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');
        break;
      case 'url':
        // Basic URL validation and sanitization
        try {
          const url = new URL(sanitized);
          return url.href;
        } catch {
          return '';
        }
      default:
        // Basic text sanitization
        sanitized = sanitized.trim();
    }

    return sanitized;
  }

  // Comprehensive input sanitization
  sanitizeInput(input, options = {}) {
    const {
      maxLength = 1000,
      allowedTags = [],
      stripHtml = false,
      preventSql = true,
      preventXss = true
    } = options;

    let sanitized = String(input);

    // Length limit
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    // HTML sanitization
    if (stripHtml) {
      sanitized = sanitized.replace(this.sanitizationRules.html, '');
    } else if (allowedTags.length > 0) {
      // Allow only specific tags
      const allowedTagsPattern = new RegExp(`<(?!/?(${allowedTags.join('|')})\\b)[^>]*>`, 'gi');
      sanitized = sanitized.replace(allowedTagsPattern, '');
    }

    // Security sanitization
    if (preventSql) {
      sanitized = sanitized.replace(this.sanitizationRules.sql, '');
    }

    if (preventXss) {
      sanitized = sanitized.replace(this.sanitizationRules.xss, '');
    }

    return sanitized.trim();
  }

  // Rate limiting
  checkRateLimit(userId, action, limit = 10, windowMs = 60000) {
    const key = `rate_${userId}_${action}`;
    const now = Date.now();
    const attempts = JSON.parse(localStorage.getItem(key) || '[]');

    // Remove old attempts outside the window
    const validAttempts = attempts.filter(timestamp => now - timestamp < windowMs);

    if (validAttempts.length >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: validAttempts[0] + windowMs
      };
    }

    return {
      allowed: true,
      remaining: limit - validAttempts.length - 1,
      resetTime: now + windowMs
    };
  }

  // Update rate limit
  updateRateLimit(userId, action) {
    const key = `rate_${userId}_${action}`;
    const now = Date.now();
    const attempts = JSON.parse(localStorage.getItem(key) || '[]');

    // Remove old attempts and add new one
    const validAttempts = attempts.filter(timestamp => now - timestamp < 60000); // 1 minute window
    validAttempts.push(now);

    localStorage.setItem(key, JSON.stringify(validAttempts));
  }

  // CSRF protection
  generateCSRFToken() {
    const token = this.generateRandomString(32);
    const timestamp = Date.now();

    const csrfData = {
      token,
      timestamp,
      expires: timestamp + 3600000 // 1 hour
    };

    localStorage.setItem('csrfToken', JSON.stringify(csrfData));
    return token;
  }

  // Validate CSRF token
  validateCSRFToken(token) {
    const stored = localStorage.getItem('csrfToken');
    if (!stored) return false;

    try {
      const csrfData = JSON.parse(stored);

      if (csrfData.token !== token) return false;
      if (Date.now() > csrfData.expires) return false;

      return true;
    } catch {
      return false;
    }
  }

  // Generate secure random string
  generateRandomString(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }

  // Password strength checker
  checkPasswordStrength(password) {
    let score = 0;
    const feedback = [];

    if (password.length >= 8) score += 1; else feedback.push('At least 8 characters');
    if (password.length >= 12) score += 1; else feedback.push('12+ characters recommended');
    if (/[a-z]/.test(password)) score += 1; else feedback.push('Add lowercase letters');
    if (/[A-Z]/.test(password)) score += 1; else feedback.push('Add uppercase letters');
    if (/\d/.test(password)) score += 1; else feedback.push('Add numbers');
    if (/[@$!%*?&]/.test(password)) score += 1; else feedback.push('Add special characters');

    const strength = score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong';

    return { score, strength, feedback };
  }

  // Session management
  createSession(user) {
    const session = {
      id: this.generateRandomString(32),
      userId: user.id,
      role: user.role,
      createdAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      ip: this.getClientIP(),
      userAgent: navigator.userAgent
    };

    localStorage.setItem('session', JSON.stringify(session));
    return session;
  }

  // Validate session
  validateSession() {
    const sessionData = localStorage.getItem('session');
    if (!sessionData) return null;

    try {
      const session = JSON.parse(sessionData);

      if (Date.now() > session.expiresAt) {
        this.destroySession();
        return null;
      }

      return session;
    } catch {
      this.destroySession();
      return null;
    }
  }

  // Destroy session
  destroySession() {
    localStorage.removeItem('session');
    localStorage.removeItem('csrfToken');
  }

  // Get client IP (for security logging)
  getClientIP() {
    // In a real application, this would be provided by the server
    return 'unknown';
  }

  // Security audit logging
  logSecurityEvent(event, details = {}) {
    const securityLog = {
      id: this.generateRandomString(16),
      timestamp: new Date().toISOString(),
      event,
      userId: this.getCurrentUserId(),
      sessionId: this.getCurrentSessionId(),
      ip: this.getClientIP(),
      userAgent: navigator.userAgent,
      details
    };

    // Store in localStorage (in production, send to server)
    const logs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
    logs.unshift(securityLog);

    // Keep only last 1000 logs
    if (logs.length > 1000) {
      logs.splice(1000);
    }

    localStorage.setItem('securityLogs', JSON.stringify(logs));

    console.log('Security Event:', securityLog);
  }

  // Get current user ID
  getCurrentUserId() {
    const session = this.validateSession();
    return session ? session.userId : null;
  }

  // Get current session ID
  getCurrentSessionId() {
    const session = this.validateSession();
    return session ? session.id : null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.validateSession();
  }

  // Check if user has admin privileges
  isAdmin() {
    const session = this.validateSession();
    return session && session.role === 'admin';
  }

  // Get current user role
  getCurrentRole() {
    const session = this.validateSession();
    return session ? session.role : null;
  }

  // Security headers for API requests
  getSecurityHeaders() {
    const session = this.validateSession();
    const headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'X-Client-IP': this.getClientIP()
    };

    if (session) {
      headers['X-Session-ID'] = session.id;
      headers['X-User-ID'] = session.userId;
    }

    return headers;
  }

  // Validate file upload
  validateFileUpload(file, options = {}) {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
      allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf']
    } = options;

    const errors = [];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }

    // Check file extension
    const extension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      errors.push(`File extension .${extension} is not allowed`);
    }

    // Check for suspicious filenames
    if (/[<>"|?*]/.test(file.name)) {
      errors.push('Filename contains invalid characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Encrypt sensitive data (basic implementation)
  encrypt(data, key = 'default-key') {
    // In production, use proper encryption like AES
    try {
      return btoa(JSON.stringify(data));
    } catch {
      return data;
    }
  }

  // Decrypt sensitive data
  decrypt(encryptedData, key = 'default-key') {
    // In production, use proper decryption
    try {
      return JSON.parse(atob(encryptedData));
    } catch {
      return encryptedData;
    }
  }

  // Security settings
  getSecuritySettings() {
    return {
      twoFactorEnabled: false,
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
      maxLoginAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutes
      passwordMinLength: 8,
      requireSpecialChars: true,
      requireNumbers: true,
      requireUppercase: true
    };
  }

  // Check if account is locked
  isAccountLocked(userId) {
    const lockoutKey = `lockout_${userId}`;
    const lockoutData = localStorage.getItem(lockoutKey);

    if (!lockoutData) return false;

    try {
      const lockout = JSON.parse(lockoutData);
      if (Date.now() > lockout.expiresAt) {
        localStorage.removeItem(lockoutKey);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  // Lock account after failed attempts
  lockAccount(userId, attempts = 5) {
    const lockoutKey = `lockout_${userId}`;
    const lockoutData = {
      attempts,
      lockedAt: Date.now(),
      expiresAt: Date.now() + (15 * 60 * 1000) // 15 minutes
    };

    localStorage.setItem(lockoutKey, JSON.stringify(lockoutData));

    this.logSecurityEvent('account_locked', {
      userId,
      attempts,
      lockoutDuration: 15 * 60 * 1000
    });
  }

  // Record failed login attempt
  recordFailedLogin(userId, reason = 'invalid_credentials') {
    const attemptsKey = `failed_attempts_${userId}`;
    const attempts = JSON.parse(localStorage.getItem(attemptsKey) || '[]');

    attempts.push({
      timestamp: Date.now(),
      reason,
      ip: this.getClientIP()
    });

    // Keep only last 10 attempts
    if (attempts.length > 10) {
      attempts.splice(0, attempts.length - 10);
    }

    localStorage.setItem(attemptsKey, JSON.stringify(attempts));

    // Check if should lock account
    const recentAttempts = attempts.filter(a =>
      Date.now() - a.timestamp < 15 * 60 * 1000 // Last 15 minutes
    );

    if (recentAttempts.length >= 5) {
      this.lockAccount(userId, recentAttempts.length);
    }

    this.logSecurityEvent('failed_login', {
      userId,
      reason,
      totalAttempts: attempts.length
    });
  }

  // Clear failed attempts on successful login
  clearFailedAttempts(userId) {
    localStorage.removeItem(`failed_attempts_${userId}`);
    localStorage.removeItem(`lockout_${userId}`);
  }

  // Get security logs
  getSecurityLogs(filters = {}) {
    const logs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
    let filteredLogs = [...logs];

    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
    }

    if (filters.event) {
      filteredLogs = filteredLogs.filter(log => log.event === filters.event);
    }

    if (filters.dateFrom) {
      filteredLogs = filteredLogs.filter(log =>
        new Date(log.timestamp) >= new Date(filters.dateFrom)
      );
    }

    return filteredLogs;
  }
}

// React hooks for security
export const useSecurity = () => {
  const [user, setUser] = React.useState(null);
  const [permissions, setPermissions] = React.useState([]);

  React.useEffect(() => {
    const session = securityManager.validateSession();
    if (session) {
      setUser(session);
      setPermissions(securityManager.roles[session.role]?.permissions || []);
    }
  }, []);

  const hasPermission = React.useCallback((permission) => {
    return securityManager.hasPermission(user?.role, permission);
  }, [user]);

  const canAccess = React.useCallback((resource, action = 'read') => {
    return securityManager.canAccess(user?.role, resource, action);
  }, [user]);

  const logout = React.useCallback(() => {
    securityManager.destroySession();
    setUser(null);
    setPermissions([]);
  }, []);

  return {
    user,
    permissions,
    hasPermission,
    canAccess,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };
};

// Higher-order component for protected routes
export const withAuth = (WrappedComponent, requiredPermissions = []) => {
  return (props) => {
    const { isAuthenticated, hasPermission } = useSecurity();

    if (!isAuthenticated) {
      return <div>Please log in to access this page.</div>;
    }

    const hasRequiredPermissions = requiredPermissions.every(permission =>
      hasPermission(permission)
    );

    if (!hasRequiredPermissions) {
      return <div>You don't have permission to access this page.</div>;
    }

    return <WrappedComponent {...props} />;
  };
};

// Create singleton instance
export const securityManager = new SecurityManager();

// Initialize security on app start
export const initSecurity = () => {
  console.log('Security system initialized');

  // Clear expired sessions on startup
  const session = securityManager.validateSession();
  if (!session) {
    securityManager.destroySession();
  }

  return securityManager;
};

export default securityManager;

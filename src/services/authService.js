import { apiService, ApiError } from './apiService';

const useLocalStorage = import.meta.env.VITE_USE_LOCAL_STORAGE === 'true';

// Register a new user
export const registerUser = async (userData) => {
  if (useLocalStorage) {
    // Store in localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if email already exists
    if (users.find(u => u.email === userData.email)) {
      throw new ApiError('Email already registered', 400, 'This email is already registered. Please use a different email address.');
    }

    const newUser = {
      id: Date.now(),
      name: `${userData.firstName} ${userData.lastName}`,
      email: userData.email,
      password: userData.password, // In production, hash this!
      role: 'student',
      phone: userData.phone,
      program: userData.program,
      level: userData.level,
      status: 'active',
      avatar: `https://ui-avatars.com/api/?name=${userData.firstName}+${userData.lastName}&background=4F46E5&color=fff`,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Also store application
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    applications.push({
      id: Date.now(),
      ...userData,
      status: 'approved',
      appliedDate: new Date().toISOString()
    });
    localStorage.setItem('applications', JSON.stringify(applications));

    return newUser;
  }

  // Use API service for production
  try {
    const result = await apiService.post('/api/auth/register', userData);
    return result;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Login user
export const loginUser = async (email, password) => {
  if (useLocalStorage) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new ApiError('Invalid email or password', 401, 'The email or password you entered is incorrect. Please try again.');
    }
    
    return user;
  }

  // Use API service for production
  try {
    const result = await apiService.post('/api/auth/login', { email, password });
    return result;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Update user
export const updateUser = async (userId, updates) => {
  if (useLocalStorage) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const index = users.findIndex(u => u.id === userId);
    
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem('users', JSON.stringify(users));
      return users[index];
    }
    
    throw new ApiError('User not found', 404, 'The user could not be found.');
  }

  // Use API service for production
  try {
    const result = await apiService.put(`/api/users/${userId}`, updates);
    return result;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Delete user
export const deleteUser = async (userId) => {
  if (useLocalStorage) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const filtered = users.filter(u => u.id !== userId);
    localStorage.setItem('users', JSON.stringify(filtered));
    return true;
  }

  // Use API service for production
  try {
    await apiService.delete(`/api/users/${userId}`);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (userId) => {
  if (useLocalStorage) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === userId);

    if (!user) {
      throw new ApiError('User not found', 404, 'The user profile could not be found.');
    }

    return user;
  }

  // Use API service for production
  try {
    const result = await apiService.get(`/api/users/${userId}`);
    return result;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Change password
export const changePassword = async (userId, currentPassword, newPassword) => {
  if (useLocalStorage) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const index = users.findIndex(u => u.id === userId);

    if (index === -1) {
      throw new ApiError('User not found', 404, 'User not found.');
    }

    if (users[index].password !== currentPassword) {
      throw new ApiError('Invalid current password', 400, 'Current password is incorrect.');
    }

    users[index].password = newPassword;
    localStorage.setItem('users', JSON.stringify(users));

    return { success: true };
  }

  // Use API service for production
  try {
    const result = await apiService.post('/api/auth/change-password', {
      userId,
      currentPassword,
      newPassword
    });
    return result;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Forgot password / Reset password
export const resetPassword = async (email) => {
  if (useLocalStorage) {
    // Simulate password reset
    return {
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.'
    };
  }

  // Use API service for production
  try {
    const result = await apiService.post('/api/auth/reset-password', { email });
    return result;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

// Verify email
export const verifyEmail = async (token) => {
  if (useLocalStorage) {
    // Simulate email verification
    return { success: true, message: 'Email verified successfully' };
  }

  // Use API service for production
  try {
    const result = await apiService.post('/api/auth/verify-email', { token });
    return result;
  } catch (error) {
    console.error('Error verifying email:', error);
    throw error;
  }
};

// Get all users (admin only)
export const getAllUsers = async () => {
  if (useLocalStorage) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users;
  }

  // Use API service for production
  try {
    const result = await apiService.get('/api/users');
    return result;
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};

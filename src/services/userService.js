// User service for profile management
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const response = await fetch(`${API_BASE}/users/profile?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (userId, profileData) => {
  try {
    const response = await fetch(`${API_BASE}/users/profile?userId=${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error('Failed to update user profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

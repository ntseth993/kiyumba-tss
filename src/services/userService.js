// User service for profile management
const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const useLocalStorage = !import.meta.env.VITE_API_BASE;

// Get user profile
export const getUserProfile = async (userId) => {
  if (useLocalStorage) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find(u => u.id === userId) || null;
  }

  try {
    const response = await fetch(`${API_BASE}/users/profile?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find(u => u.id === userId) || null;
  }
};

// Update user profile
export const updateUserProfile = async (userId, profileData) => {
  if (useLocalStorage) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updated = users.map(u => 
      u.id === userId ? { ...u, ...profileData } : u
    );
    localStorage.setItem('users', JSON.stringify(updated));
    return updated.find(u => u.id === userId);
  }

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
    // Fallback to localStorage if API fails
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updated = users.map(u => 
      u.id === userId ? { ...u, ...profileData } : u
    );
    localStorage.setItem('users', JSON.stringify(updated));
    return updated.find(u => u.id === userId);
  }
};

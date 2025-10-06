import { sql } from '../lib/db';

const useLocalStorage = !sql;

// Detect if running in production (Vercel) - use API endpoints
const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost';
const API_BASE_URL = isProduction ? '' : 'http://localhost:5173';

// Register a new user
export const registerUser = async (userData) => {
  const emailClean = (userData.email || '').toString().trim().toLowerCase();
  const passwordClean = (userData.password || '').toString().trim();

  // Try server API first (will work on Vercel if DATABASE_URL is configured)
  if (typeof window !== 'undefined') {
    try {
      const resp = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...userData, email: emailClean, password: passwordClean })
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data && data.success && data.user) {
          return data.user;
        }
      } else {
        console.debug('Server register responded with', resp.status);
      }
    } catch (err) {
      console.debug('Server register failed (falling back to localStorage):', err.message);
    }
  }

  // Fallback: localStorage registration
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    if (users.find(u => (u.email || '').toString().trim().toLowerCase() === emailClean)) {
      throw new Error('Email already registered');
    }

    const newUser = {
      id: Date.now(),
      name: `${userData.firstName} ${userData.lastName}`,
      email: emailClean,
      password: passwordClean, // demo only
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

    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    applications.push({
      id: Date.now(),
      full_name: newUser.name,
      email: emailClean,
      phone: userData.phone || null,
      program: userData.program || null,
      level: userData.level || null,
      education_level: userData.previousSchool || null,
      status: 'approved',
      appliedDate: new Date().toISOString()
    });
    localStorage.setItem('applications', JSON.stringify(applications));

    return newUser;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Login user
export const loginUser = async (email, password) => {
  const emailClean = (email || '').toString().trim().toLowerCase();
  const passwordClean = (password || '').toString().trim();

  // First, try serverless API (works on Vercel if DATABASE_URL is set)
  if (typeof window !== 'undefined') {
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailClean, password: passwordClean })
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data && data.success && data.user) {
          return data.user;
        }
      } else {
        // If server responds 4xx/5xx, fall through to localStorage fallback
        console.debug('Server login responded with', resp.status);
      }
    } catch (err) {
      console.debug('Server login failed (probably not available):', err.message);
    }
  }

  // Fallback: localStorage-based lookup (works for deployments without DB)
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => (u.email || '').toString().trim().toLowerCase() === emailClean && (u.password || '').toString().trim() === passwordClean);
    console.debug('Local login lookup for', emailClean, 'found:', !!user);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    return user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Get all users (admin only)
export const getAllUsers = async () => {
  if (useLocalStorage) {
    return JSON.parse(localStorage.getItem('users') || '[]');
  }

  try {
    const users = await sql`
      SELECT 
        id,
        email,
        name,
        role,
        avatar,
        created_at as "createdAt"
      FROM users
      ORDER BY created_at DESC
    `;

    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
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
    
    throw new Error('User not found');
  }

  try {
    const result = await sql`
      UPDATE users
      SET 
        name = ${updates.name},
        email = ${updates.email},
        role = ${updates.role}
      WHERE id = ${userId}
      RETURNING id, email, name, role, avatar, created_at as "createdAt"
    `;

    return result[0];
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

  try {
    await sql`DELETE FROM users WHERE id = ${userId}`;
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

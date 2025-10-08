import { sql } from '../lib/db';

const useLocalStorage = !sql;

// Detect if running in production (Vercel) - use API endpoints
const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost';
const API_BASE_URL = isProduction ? '' : 'http://localhost:5173';

// Register a new user
export const registerUser = async (userData) => {
  if (useLocalStorage) {
    // Store in localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if email already exists
    if (users.find(u => u.email === userData.email)) {
      throw new Error('Email already registered');
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

  try {
    // Check if user exists
    const existing = await sql`
      SELECT id FROM users WHERE email = ${userData.email}
    `;

    if (existing.length > 0) {
      throw new Error('Email already registered');
    }

    // Insert user
    const result = await sql`
      INSERT INTO users (
        email,
        password,
        name,
        role,
        avatar
      )
      VALUES (
        ${userData.email},
        ${userData.password},
        ${userData.firstName + ' ' + userData.lastName},
        'student',
        ${'https://ui-avatars.com/api/?name=' + userData.firstName + '+' + userData.lastName + '&background=4F46E5&color=fff'}
      )
      RETURNING id, email, name, role, avatar, created_at as "createdAt"
    `;

    // Insert application
    await sql`
      INSERT INTO applications (
        full_name,
        email,
        phone,
        program,
        level,
        education_level,
        status
      )
      VALUES (
        ${userData.firstName + ' ' + userData.lastName},
        ${userData.email},
        ${userData.phone || null},
        ${userData.program},
        ${userData.previousSchool || null},
        'approved'
      )
    `;

    return result[0];
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
      throw new Error('Invalid email or password');
    }
    
    return user;
  }

  try {
    const result = await sql`
      SELECT id, email, name, role, avatar, created_at as "createdAt"
      FROM users
      WHERE email = ${email} AND password = ${password}
    `;

    if (result.length === 0) {
      throw new Error('Invalid email or password');
    }

    return result[0];
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

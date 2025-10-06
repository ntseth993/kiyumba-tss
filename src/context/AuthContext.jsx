import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Seed demo users into localStorage so the fallback login works on fresh deployments
    const existing = JSON.parse(localStorage.getItem('users') || 'null');
    if (!existing) {
      const demoUsers = [
        { id: 1, name: 'Admin User', email: 'admin@kiyumba.com', password: 'admin123', role: 'admin' },
        { id: 2, name: 'Staff Member', email: 'staff@kiyumba.com', password: 'staff123', role: 'staff' },
        { id: 3, name: 'Teacher User', email: 'teacher@kiyumba.com', password: 'teacher123', role: 'teacher' },
        { id: 4, name: 'Student User', email: 'student@kiyumba.com', password: 'student123', role: 'student' }
      ];
      localStorage.setItem('users', JSON.stringify(demoUsers));
      console.info('Demo users seeded into localStorage');
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Normalize inputs
    const emailClean = (email || '').toString().trim().toLowerCase();
    const passwordClean = (password || '').toString().trim();
    console.log('Login attempt:', { email: emailClean });
    try {
      // Check demo accounts first
      if (emailClean === 'admin@kiyumba.com' && passwordClean === 'admin123') {
        console.log('Admin login successful');
        const userData = {
          id: 1,
          name: 'Admin User',
          email: 'admin@kiyumba.com',
          role: 'admin',
          avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=4F46E5&color=fff'
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, user: userData };
      }

      // Demo staff account
      if (emailClean === 'staff@kiyumba.com' && passwordClean === 'staff123') {
        console.log('Staff login successful');
        const userData = {
          id: 2,
          name: 'Staff Member',
          email: 'staff@kiyumba.com',
          role: 'staff',
          avatar: 'https://ui-avatars.com/api/?name=Staff+Member&background=10B981&color=fff'
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, user: userData };
      }

      // Demo teacher account
      if (emailClean === 'teacher@kiyumba.com' && passwordClean === 'teacher123') {
        console.log('Teacher login successful');
        const userData = {
          id: 3,
          name: 'Teacher User',
          email: 'teacher@kiyumba.com',
          role: 'teacher',
          avatar: 'https://ui-avatars.com/api/?name=Teacher+User&background=F59E0B&color=fff'
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, user: userData };
      }

      // Demo student account
      if (emailClean === 'student@kiyumba.com' && passwordClean === 'student123') {
        console.log('Student login successful');
        const userData = {
          id: 4,
          name: 'Student User',
          email: 'student@kiyumba.com',
          role: 'student',
          avatar: 'https://ui-avatars.com/api/?name=Student+User&background=EF4444&color=fff'
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, user: userData };
      }

      // Try to login with database/localStorage
      try {
        const userData = await loginUser(emailClean, passwordClean);
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, user: userData };
      } catch (error) {
        return { success: false, error: 'Invalid email or password' };
      }
    } catch (error) {
      return { success: false, error: error.message || 'Invalid credentials' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isStaff: user?.role === 'staff',
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

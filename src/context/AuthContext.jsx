import { createContext, useContext, useState, useEffect } from 'react';

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
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Mock authentication - In production, this would call an API
    if (email === 'admin@kiyumba.com' && password === 'admin123') {
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
    } else if (email === 'student@kiyumba.com' && password === 'student123') {
      const userData = {
        id: 2,
        name: 'John Doe',
        email: 'student@kiyumba.com',
        role: 'student',
        studentId: 'STD2024001',
        grade: '10th Grade',
        avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=10B981&color=fff'
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    return { success: false, error: 'Invalid credentials' };
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
    isStudent: user?.role === 'student'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

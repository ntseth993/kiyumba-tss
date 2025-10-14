import { createContext, useContext, useState, useEffect } from 'react';
import { getDepartmentById, DEPARTMENTS } from '../services/departmentsService';

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

  const login = async (email, password) => {
    console.log('Login attempt:', { email, password });
    try {
      // Check demo accounts first
      if (email === 'admin@kiyumba.com' && password === 'admin123') {
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
      if (email === 'staff@kiyumba.com' && password === 'staff123') {
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

      // Demo DOD account
      if (email === 'dod@kiyumba.com' && password === 'dod123') {
        console.log('DOD login successful');
        const userData = {
          id: 21,
          name: 'Director of Discipline',
          email: 'dod@kiyumba.com',
          role: 'dod',
          avatar: 'https://ui-avatars.com/api/?name=DOD&background=EF4444&color=fff'
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, user: userData };
      }

      // Demo DOS account
      if (email === 'dos@kiyumba.com' && password === 'dos123') {
        console.log('DOS login successful');
        const userData = {
          id: 22,
          name: 'Director of Studies',
          email: 'dos@kiyumba.com',
          role: 'dos',
          avatar: 'https://ui-avatars.com/api/?name=DOS&background=4F46E5&color=fff'
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, user: userData };
      }

      // Demo Accountant account
      if (email === 'accountant@kiyumba.com' && password === 'accountant123') {
        console.log('Accountant login successful');
        const userData = {
          id: 23,
          name: 'School Accountant',
          email: 'accountant@kiyumba.com',
          role: 'accountant',
          avatar: 'https://ui-avatars.com/api/?name=Accountant&background=10B981&color=fff'
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, user: userData };
      }

      // Demo Animateur account
      if (email === 'animateur@kiyumba.com' && password === 'animateur123') {
        console.log('Animateur login successful');
        const userData = {
          id: 24,
          name: 'Activities Coordinator',
          email: 'animateur@kiyumba.com',
          role: 'animateur',
          avatar: 'https://ui-avatars.com/api/?name=Animateur&background=F59E0B&color=fff'
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, user: userData };
      }

      // Demo Secretary account
      if (email === 'secretary@kiyumba.com' && password === 'secretary123') {
        console.log('Secretary login successful');
        const userData = {
          id: 25,
          name: 'School Secretary',
          email: 'secretary@kiyumba.com',
          role: 'secretary',
          avatar: 'https://ui-avatars.com/api/?name=Secretary&background=8B5CF6&color=fff'
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, user: userData };
      }

      // Demo teacher account
      if (email === 'teacher@kiyumba.com' && password === 'teacher123') {
        console.log('Teacher login successful');
        const userData = {
          id: 3,
          name: 'Teacher User',
          email: 'teacher@kiyumba.com',
          role: 'teacher',
          department: null, // Will be selected after login
          avatar: 'https://ui-avatars.com/api/?name=Teacher+User&background=F59E0B&color=fff',
          requiresDepartmentSelection: true
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, user: userData, requiresDepartmentSelection: true };
      }

      // Demo student account
      if (email === 'student@kiyumba.com' && password === 'student123') {
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
        const userData = await loginUser(email, password);
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

  const selectTeacherDepartment = (departmentId) => {
    if (!user || user.role !== 'teacher') {
      return { success: false, error: 'Only teachers can select departments' };
    }

    const department = getDepartmentById(departmentId);
    if (!department) {
      return { success: false, error: 'Invalid department selected' };
    }

    const updatedUser = {
      ...user,
      department: department.id,
      departmentInfo: department,
      requiresDepartmentSelection: false
    };

    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return { success: true, user: updatedUser };
  };

  // Admin impersonation function
  const impersonateUser = (targetUser) => {
    if (!user || user.role !== 'admin') {
      return { success: false, error: 'Only admins can impersonate users' };
    }

    // Store original admin user for later restoration
    localStorage.setItem('originalAdmin', JSON.stringify(user));
    
    // Set the target user as current user with impersonation flag
    const impersonatedUser = {
      ...targetUser,
      isImpersonated: true,
      originalAdmin: user
    };

    setUser(impersonatedUser);
    localStorage.setItem('user', JSON.stringify(impersonatedUser));
    return { success: true, user: impersonatedUser };
  };

  // Stop impersonation and return to admin
  const stopImpersonation = () => {
    const originalAdmin = localStorage.getItem('originalAdmin');
    if (originalAdmin) {
      const adminUser = JSON.parse(originalAdmin);
      setUser(adminUser);
      localStorage.setItem('user', JSON.stringify(adminUser));
      localStorage.removeItem('originalAdmin');
      return { success: true, user: adminUser };
    }
    return { success: false, error: 'No original admin found' };
  };

  // Update user profile picture
  const updateProfilePicture = async (file) => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      // Convert file to base64 for storage
      const base64 = await fileToBase64(file);

      // Generate avatar URL from uploaded image or use UI Avatars as fallback
      const avatarUrl = base64
        ? `data:${file.type};base64,${base64}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=${getRoleColor(user.role)}&color=fff`;

      const updatedUser = {
        ...user,
        avatar: avatarUrl,
        hasCustomAvatar: !!base64
      };

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Log activity
      if (typeof window !== 'undefined' && window.activityLogsService) {
        try {
          await window.activityLogsService.logActivity(user.name, 'updated profile picture', '', 'info');
        } catch (e) {
          console.log('Activity logging not available');
        }
      }

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Error updating profile picture:', error);
      return { success: false, error: 'Failed to update profile picture' };
    }
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  // Admin password change function
  const changeUserPassword = (userId, newPassword) => {
    if (!user || user.role !== 'admin') {
      return { success: false, error: 'Only admins can change user passwords' };
    }

    // In a real app, this would make an API call to update the password
    // For demo purposes, we'll just return success
    console.log(`Admin ${user.name} changed password for user ID: ${userId}`);
    return { success: true, message: 'Password updated successfully' };
  };

  const value = {
    user,
    login,
    logout,
    selectTeacherDepartment,
    impersonateUser,
    stopImpersonation,
    changeUserPassword,
    updateProfilePicture,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isStaff: user?.role === 'staff',
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',
    isDOD: user?.role === 'dod',
    isDOS: user?.role === 'dos',
    isAccountant: user?.role === 'accountant',
    isAnimateur: user?.role === 'animateur',
    isSecretary: user?.role === 'secretary',
    // Helper to check if user is any type of staff
    isStaffMember: user?.role === 'staff' || user?.role === 'dod' || user?.role === 'dos' ||
                  user?.role === 'accountant' || user?.role === 'animateur' || user?.role === 'secretary',
    // Department helpers for teachers
    hasDepartment: user?.role === 'teacher' && user?.department,
    requiresDepartmentSelection: user?.role === 'teacher' && user?.requiresDepartmentSelection,
    userDepartment: user?.departmentInfo || null,
    availableDepartments: Object.values(DEPARTMENTS),
    // Impersonation helpers
    isImpersonated: user?.isImpersonated || false,
    originalAdmin: user?.originalAdmin || null
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

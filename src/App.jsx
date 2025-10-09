import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminApplications from './pages/AdminApplications';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminContent from './pages/AdminContent';
import AdminSettings from './pages/AdminSettings';
import TeacherSettings from './pages/TeacherSettings';
import StaffSettings from './pages/StaffSettings';
import StudentSettings from './pages/StudentSettings';
import StaffDashboard from './pages/StaffDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import DODDashboard from './pages/DODDashboard';
import DOSDashboard from './pages/DOSDashboard';
import AccountantDashboard from './pages/AccountantDashboard';
import AnimateurDashboard from './pages/AnimateurDashboard';
import SecretaryDashboard from './pages/SecretaryDashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role or is in allowed roles
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/applications"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminUserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/content"
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff', 'teacher']}>
              <AdminContent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute requiredRole="staff">
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dod/dashboard"
          element={
            <ProtectedRoute requiredRole="dod">
              <DODDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dos/dashboard"
          element={
            <ProtectedRoute requiredRole="dos">
              <DOSDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accountant/dashboard"
          element={
            <ProtectedRoute requiredRole="accountant">
              <AccountantDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/animateur/dashboard"
          element={
            <ProtectedRoute requiredRole="animateur">
              <AnimateurDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/secretary/dashboard"
          element={
            <ProtectedRoute requiredRole="secretary">
              <SecretaryDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/settings"
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dod/settings"
          element={
            <ProtectedRoute requiredRole="dod">
              <StaffSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dos/settings"
          element={
            <ProtectedRoute requiredRole="dos">
              <StaffSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accountant/settings"
          element={
            <ProtectedRoute requiredRole="accountant">
              <StaffSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/animateur/settings"
          element={
            <ProtectedRoute requiredRole="animateur">
              <StaffSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/secretary/settings"
          element={
            <ProtectedRoute requiredRole="secretary">
              <StaffSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/settings"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentSettings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

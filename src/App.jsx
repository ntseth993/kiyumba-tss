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
import AdminPosts from './pages/AdminPosts';
import AdminEvents from './pages/AdminEvents';
import AdminNotifications from './pages/AdminNotifications';
import AdminHighlights from './pages/AdminHighlights';
import AdminWidgets from './pages/AdminWidgets';
import AdminTools from './pages/AdminTools';
import TeacherSettings from './pages/TeacherSettings';
import StaffSettings from './pages/StaffSettings';
import StudentSettings from './pages/StudentSettings';
import StaffDashboard from './pages/StaffDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import DepartmentSelection from './components/DepartmentSelection';
import StudentClassSelection from './components/StudentClassSelection';
import DODDashboard from './pages/DODDashboard';
import DOSDashboard from './pages/DOSDashboard';
import AccountantDashboard from './pages/AccountantDashboard';
import AnimateurDashboard from './pages/AnimateurDashboard';
import SecretaryDashboard from './pages/SecretaryDashboard';
import AttendancePage from './pages/AttendancePage';
import PaymentsPage from './pages/PaymentsPage';
import ReportsPage from './pages/ReportsPage';
import About from './pages/About';
import Contact from './pages/Contact';

// New School Management System Dashboards
import TeacherManagementDashboard from './pages/TeacherManagementDashboard';
import TimetableManagement from './pages/TimetableManagement';
import ExamManagement from './pages/ExamManagement';
import AssignmentManagement from './pages/AssignmentManagement';

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
          path="/student/class-selection"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentClassSelection />
            </ProtectedRoute>
          }
        />
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
          path="/admin/posts"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPosts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/highlights"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminHighlights />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/widgets"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminWidgets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tools"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminTools />
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
          path="/teacher/department-selection"
          element={
            <ProtectedRoute requiredRole="teacher">
              <DepartmentSelection />
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
        
        {/* New Feature Routes */}
        <Route
          path="/attendance"
          element={
            <ProtectedRoute allowedRoles={['teacher', 'dod', 'dos', 'admin', 'staff']}>
              <AttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute allowedRoles={['accountant', 'dos', 'admin']}>
              <PaymentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={['teacher', 'dod', 'dos', 'admin', 'staff', 'secretary']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        {/* School Management System Routes */}
        <Route
          path="/school/teachers"
          element={
            <ProtectedRoute allowedRoles={['admin', 'dos', 'dod', 'staff']}>
              <TeacherManagementDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/timetable"
          element={
            <ProtectedRoute allowedRoles={['admin', 'dos', 'dod', 'teacher', 'staff']}>
              <TimetableManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/exams"
          element={
            <ProtectedRoute allowedRoles={['admin', 'dos', 'dod', 'teacher', 'staff']}>
              <ExamManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/assignments"
          element={
            <ProtectedRoute allowedRoles={['admin', 'dos', 'dod', 'teacher', 'staff', 'student']}>
              <AssignmentManagement />
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

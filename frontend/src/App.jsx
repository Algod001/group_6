import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; // We will create this context next
import { Toaster } from './components/ui/toaster'; // Optional if you have UI components, otherwise remove
import { Loader } from 'lucide-react';

// Page Imports
import Login from './pages/Login';
import Signup from './pages/Signup';
import PatientDashboard from './pages/PatientDashboard';
import SpecialistDashboard from './pages/SpecialistDashboard';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import Profile from './pages/Profile';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader className="animate-spin"/></div>;
  
  if (!user) return <Navigate to="/login" />;

  // Optional: Check role
  // if (allowedRoles && !allowedRoles.includes(user.user_metadata.role)) {
  //   return <div>Access Denied</div>;
  // }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />

      {/* Protected Routes */}
      <Route path="/patient-dashboard" element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>} />
      <Route path="/specialist-dashboard" element={<ProtectedRoute><SpecialistDashboard /></ProtectedRoute>} />
      <Route path="/staff-dashboard" element={<ProtectedRoute><StaffDashboard /></ProtectedRoute>} />
      <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* Root Redirect Logic */}
      <Route path="/" element={
        user ? (
          // Redirect based on role
          user.user_metadata?.role === 'patient' ? <Navigate to="/patient-dashboard" /> :
          user.user_metadata?.role === 'specialist' ? <Navigate to="/specialist-dashboard" /> :
          user.user_metadata?.role === 'staff' ? <Navigate to="/staff-dashboard" /> :
          user.user_metadata?.role === 'administrator' ? <Navigate to="/admin-dashboard" /> :
          <Navigate to="/patient-dashboard" /> // Default
        ) : (
          <Navigate to="/login" />
        )
      } />

      {/* Catch-all: 404 */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
           <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}
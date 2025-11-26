import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { supabase } from "./supabaseClient";
import { Toaster } from "./components/ui/toaster";
import { LogOut, Activity } from "lucide-react";

// Import Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PatientDashboard from "./pages/PatientDashboard";
import SpecialistDashboard from "./pages/SpecialistDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";

// 1. Navigation Bar (Only shows when logged in)
const Navbar = () => {
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (!user) return null; // Completely hide navbar on Login page

  return (
    <nav className="bg-white border-b px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 p-1.5 rounded-lg">
          <Activity className="h-5 w-5 text-white" />
        </div>
        <span className="font-bold text-xl text-slate-800">Glucose Monitor</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right hidden md:block">
          <div className="text-sm font-semibold text-slate-900">{user.full_name || user.email}</div>
          <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">
            {user.role}
          </div>
        </div>
        
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-2 text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded-md transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </nav>
  );
};

// 2. "The Bouncer" for Login Pages (Redirects to Dashboard if already logged in)
const PublicOnlyRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (user) {
    // User is already logged in, send them to their home!
    if (user.role === 'patient') return <Navigate to="/patient" />;
    if (user.role === 'specialist') return <Navigate to="/specialist" />;
    if (user.role === 'staff') return <Navigate to="/staff" />;
    if (user.role === 'administrator') return <Navigate to="/admin" />;
  }

  return children;
};

// 3. Protected Routes (Only allows specific roles)
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  
  if (!user) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />; // Wrong role? Go to default handler
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
          <Navbar />
          <Routes>
            {/* Public Routes (Wrapped in Bouncer) */}
            <Route path="/login" element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            } />
            <Route path="/signup" element={
              <PublicOnlyRoute>
                <Signup />
              </PublicOnlyRoute>
            } />

            {/* Role-Based Routes */}
            <Route path="/patient" element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            } />

            <Route path="/specialist" element={
              <ProtectedRoute allowedRoles={['specialist']}>
                <SpecialistDashboard />
              </ProtectedRoute>
            } />

            <Route path="/staff" element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffDashboard />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['administrator']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['patient', 'specialist', 'staff', 'administrator']}>
                <Profile />
              </ProtectedRoute>
            } />

            {/* Root Redirect Logic */}
            <Route path="/" element={<RoleRedirect />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <Toaster />
        </div>
      </AuthProvider>
    </Router>
  );
}

// Helper: Decides where to send the user if they hit the homepage
const RoleRedirect = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  if (user.role === 'patient') return <Navigate to="/patient" />;
  if (user.role === 'specialist') return <Navigate to="/specialist" />;
  if (user.role === 'staff') return <Navigate to="/staff" />;
  if (user.role === 'administrator') return <Navigate to="/admin" />;
  
  return <div>Unknown Role: {user.role}</div>;
};

export default App;
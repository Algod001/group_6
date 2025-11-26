import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { Loader2 } from 'lucide-react';

// Import Real Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import PatientDashboard from './pages/PatientDashboard';
import SpecialistDashboard from './pages/SpecialistDashboard';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for changes (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        fetchRole(session.user.id);
      } else {
        setUser(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles') // Ensure your table is named 'profiles' or 'users'
        .select('role')
        .eq('id', userId) // Or 'user_id' depending on your column name
        .single();
      
      if (data) setRole(data.role);
    } catch (err) {
      console.error("Role fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setRole(null);
    setUser(null);
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        {/* Navbar */}
        {user && (
          <nav className="bg-white border-b px-6 py-3 flex justify-between items-center">
            <span className="font-bold text-xl text-blue-600">GlucoseMonitor</span>
            <div className="flex gap-4 items-center">
              <span className="text-sm text-gray-500 capitalize">Role: {role || '...'}</span>
              <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">Sign Out</button>
            </div>
          </nav>
        )}

        {/* Routing Logic */}
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
          
          {/* Protected Routes based on Role */}
          <Route path="/" element={
            !user ? <Navigate to="/login" /> :
            role === 'patient' ? <PatientDashboard session={{user}} /> :
            role === 'specialist' ? <SpecialistDashboard /> :
            role === 'administrator' ? <AdminDashboard /> :
            role === 'staff' ? <StaffDashboard /> :
            <div className="p-10 text-center">Loading your profile...</div>
          } />
        </Routes>
      </div>
    </Router>
  );
}
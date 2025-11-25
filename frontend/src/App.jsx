import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// --- TEMPORARY PLACEHOLDERS (Uncomment imports below after creating files) ---
import Login from './pages/Login';
import Signup from './pages/Signup';
import PatientDashboard from './pages/PatientDashboard';
import SpecialistDashboard from './pages/SpecialistDashboard';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import { supabase } from './supabaseClient';


function App() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check Active Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchRole(session.user.id);
      else setLoading(false);
    });

    // 2. Listen for Login/Logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchRole(session.user.id);
      else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe ? subscription.unsubscribe() : null;
  }, []);

  const fetchRole = async (userId) => {
    const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
    setRole(data?.role);
    setLoading(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!session ? <Signup /> : <Navigate to="/" />} />

        {/* Protected Routes based on Role */}
        <Route path="/" element={
          !session ? <Navigate to="/login" /> :
          role === 'patient' ? <PatientDashboard session={session} /> :
          role === 'specialist' ? <SpecialistDashboard session={session} /> :
          role === 'administrator' ? <AdminDashboard session={session} /> :
          role === 'staff' ? <StaffDashboard session={session} /> :
          <div className="text-center mt-10">Role not assigned. Contact Admin.</div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
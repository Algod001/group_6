import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import Landing from "@/pages/landing";
import PatientDashboard from "@/pages/patient-dashboard";
import SpecialistDashboard from "@/pages/specialist-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import StaffDashboard from "@/pages/staff-dashboard";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase"; // Import Supabase

function App() {
  // @ts-ignore
  const { user, isLoading } = useAuth();
  
  // NEW: Real Logout Function

const handleLogout = async () => {
  // 1. Attempt Supabase SignOut
  await supabase.auth.signOut();
  
  // 2. FORCE CLEAR Local Storage (The Nuclear Option)
  // This wipes the session token immediately so the app forgets who you are.
  localStorage.clear();
  sessionStorage.clear();

  // 3. Force a hard redirect to the home page
  window.location.href = "/";
};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Landing />
        <Toaster />
      </>
    );
  }

  const role = user.role; 

  return (
    <>
      <div className="min-h-screen bg-background">
        <nav className="border-b bg-white px-6 py-3 flex justify-between items-center">
          <span className="font-bold text-xl text-primary">Glucose Monitor</span>
          <div className="flex items-center gap-4">
             <span className="text-sm text-muted-foreground capitalize">
               {role || 'User'}
             </span>
             {/* NEW: Use handleLogout here */}
             <button 
               onClick={handleLogout} 
               className="text-sm text-red-500 hover:underline"
             >
               Sign Out
             </button>
          </div>
        </nav>

        <main className="container mx-auto py-6 px-4">
          {role === 'patient' && <PatientDashboard />}
          {role === 'specialist' && <SpecialistDashboard />}
          {role === 'administrator' && <AdminDashboard />}
          {role === 'staff' && <StaffDashboard />}
          
          {!['patient', 'specialist', 'administrator', 'staff'].includes(role) && (
            <div className="text-center mt-10">
              <h2 className="text-xl">Account Role Error</h2>
              <p>Your account (Role: {role}) does not have a valid dashboard.</p>
            </div>
          )}
        </main>
      </div>
      <Toaster />
    </>
  );
}

export default App;
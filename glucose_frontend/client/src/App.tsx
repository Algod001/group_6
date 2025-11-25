import { Switch, Route, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import Landing from "@/pages/landing";
import PatientDashboard from "@/pages/patient-dashboard";
import SpecialistDashboard from "@/pages/specialist-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import StaffDashboard from "@/pages/staff-dashboard";
import { Loader2 } from "lucide-react";

function App() {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 2. Routing Logic
  // If no user is logged in, force them to the Landing Page
  if (!user) {
    return (
      <>
        <Landing />
        <Toaster />
      </>
    );
  }

  // 3. Role-Based Redirection
  // If user IS logged in, show their specific dashboard
  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Top Navigation Bar (Visible only when logged in) */}
        <nav className="border-b bg-white px-6 py-3 flex justify-between items-center">
          <span className="font-bold text-xl text-primary">Glucose Monitor</span>
          <div className="flex items-center gap-4">
             <span className="text-sm text-muted-foreground capitalize">
               {user.user_metadata?.role || 'User'}
             </span>
             <button 
               onClick={() => window.location.reload()} 
               className="text-sm text-red-500 hover:underline"
             >
               Sign Out
             </button>
          </div>
        </nav>

        {/* Dashboard Content */}
        <main className="container mx-auto py-6 px-4">
          {user.user_metadata?.role === 'patient' && <PatientDashboard />}
          {user.user_metadata?.role === 'specialist' && <SpecialistDashboard />}
          {user.user_metadata?.role === 'administrator' && <AdminDashboard />}
          {user.user_metadata?.role === 'staff' && <StaffDashboard />}
          
          {/* Fallback if role is missing */}
          {!['patient', 'specialist', 'administrator', 'staff'].includes(user.user_metadata?.role) && (
            <div className="text-center mt-10">
              <h2 className="text-xl">Account Role Error</h2>
              <p>Your account does not have a valid role assigned.</p>
            </div>
          )}
        </main>
      </div>
      <Toaster />
    </>
  );
}

export default App;
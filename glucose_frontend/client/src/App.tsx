import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import PatientDashboard from "@/pages/patient-dashboard";
import SpecialistDashboard from "@/pages/specialist-dashboard";
import StaffDashboard from "@/pages/staff-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ROLE_DASHBOARDS } from "@shared/constants";

function ProtectedRoute({ 
  component: Component, 
  allowedRoles 
}: { 
  component: React.ComponentType; 
  allowedRoles: string[] 
}) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/');
    } else if (!loading && user && !allowedRoles.includes(user.role)) {
      // Redirect to their correct dashboard based on role
      setLocation(ROLE_DASHBOARDS[user.role] || '/');
    }
  }, [user, loading, allowedRoles, setLocation]);

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid grid-cols-3 gap-4 mt-8">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <Component />;
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  if (!user) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b bg-card">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
          </header>
          <main className="flex-1 overflow-y-auto p-8 bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const { user } = useAuth();

  return (
    <Switch>
      <Route path="/" component={Landing} />
      
      <Route path="/patient/dashboard">
        <DashboardLayout>
          <ProtectedRoute component={PatientDashboard} allowedRoles={['patient']} />
        </DashboardLayout>
      </Route>

      <Route path="/patient/readings">
        <DashboardLayout>
          <ProtectedRoute component={PatientDashboard} allowedRoles={['patient']} />
        </DashboardLayout>
      </Route>

      <Route path="/specialist/dashboard">
        <DashboardLayout>
          <ProtectedRoute component={SpecialistDashboard} allowedRoles={['specialist']} />
        </DashboardLayout>
      </Route>

      <Route path="/specialist/patients">
        <DashboardLayout>
          <ProtectedRoute component={SpecialistDashboard} allowedRoles={['specialist']} />
        </DashboardLayout>
      </Route>

      <Route path="/staff/dashboard">
        <DashboardLayout>
          <ProtectedRoute component={StaffDashboard} allowedRoles={['staff']} />
        </DashboardLayout>
      </Route>

      <Route path="/staff/records">
        <DashboardLayout>
          <ProtectedRoute component={StaffDashboard} allowedRoles={['staff']} />
        </DashboardLayout>
      </Route>

      <Route path="/staff/settings">
        <DashboardLayout>
          <ProtectedRoute component={StaffDashboard} allowedRoles={['staff']} />
        </DashboardLayout>
      </Route>

      <Route path="/admin/dashboard">
        <DashboardLayout>
          <ProtectedRoute component={AdminDashboard} allowedRoles={['administrator']} />
        </DashboardLayout>
      </Route>

      <Route path="/admin/users">
        <DashboardLayout>
          <ProtectedRoute component={AdminDashboard} allowedRoles={['administrator']} />
        </DashboardLayout>
      </Route>

      <Route path="/admin/reports">
        <DashboardLayout>
          <ProtectedRoute component={AdminDashboard} allowedRoles={['administrator']} />
        </DashboardLayout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

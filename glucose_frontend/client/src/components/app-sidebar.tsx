import { Home, Activity, Users, Settings, BarChart3, LogOut, UserCog } from 'lucide-react';
import { Link } from 'wouter';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function AppSidebar() {
  const { user, signOut } = useAuth();

  const getMenuItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'patient':
        return [
          { title: 'Dashboard', url: '/patient/dashboard', icon: Home },
          { title: 'My Readings', url: '/patient/readings', icon: Activity },
        ];
      case 'specialist':
        return [
          { title: 'Dashboard', url: '/specialist/dashboard', icon: Home },
          { title: 'Patients', url: '/specialist/patients', icon: Users },
        ];
      case 'staff':
        return [
          { title: 'Dashboard', url: '/staff/dashboard', icon: Home },
          { title: 'Patient Records', url: '/staff/records', icon: Users },
          { title: 'Settings', url: '/staff/settings', icon: Settings },
        ];
      case 'administrator':
        return [
          { title: 'Dashboard', url: '/admin/dashboard', icon: Home },
          { title: 'User Management', url: '/admin/users', icon: UserCog },
          { title: 'Reports', url: '/admin/reports', icon: BarChart3 },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary p-2">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-base">Blood Sugar Monitor</h2>
            <p className="text-xs text-muted-foreground capitalize">{user?.role || 'User'}</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Separator className="mb-4" />
        <div className="space-y-3">
          <div className="px-3">
            <p className="text-sm font-medium truncate">{user?.fullName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start" 
            onClick={signOut}
            data-testid="button-sign-out"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

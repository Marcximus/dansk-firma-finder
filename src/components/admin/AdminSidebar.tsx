import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Users,
  TrendingUp,
  Building2,
  BarChart3,
  Settings,
  Home,
  AlertTriangle,
  FileText,
  DollarSign,
  Scale,
  Database,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const adminNavItems = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: Home,
  },
  {
    title: 'User Management',
    url: '/admin/users',
    icon: Users,
  },
  {
    title: 'Company Insights',
    url: '/admin/companies',
    icon: Building2,
  },
  {
    title: 'Revenue Analytics',
    url: '/admin/revenue',
    icon: DollarSign,
  },
  {
    title: 'Reports & Orders',
    url: '/admin/reports',
    icon: FileText,
  },
  {
    title: 'Lead Management',
    url: '/admin/leads',
    icon: Scale,
  },
  {
    title: 'Company Sync',
    url: '/admin/sync',
    icon: Database,
  },
  {
    title: 'System Health',
    url: '/admin/system',
    icon: AlertTriangle,
  },
];

export const AdminSidebar: React.FC = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const isActiveRoute = (path: string) => {
    if (path === '/admin') {
      return currentPath === '/admin';
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-accent/50';

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-64'} collapsible="icon">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          {!collapsed && (
            <span className="font-bold text-lg">Admin Panel</span>
          )}
        </div>
        <SidebarTrigger className="mt-2" />
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/admin'}
                      className={({ isActive }) => getNavCls({ isActive: isActiveRoute(item.url) })}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
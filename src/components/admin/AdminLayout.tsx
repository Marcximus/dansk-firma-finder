import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export const AdminLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <main className="flex-1 p-6 bg-background">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};
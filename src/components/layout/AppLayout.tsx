'use client';

import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { User } from '@/types';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  user: User;
}

export function AppLayout({ children, user }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <AppHeader user={user} />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
} 
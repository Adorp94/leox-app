'use client';

import { Sidebar } from './Sidebar';
import { User } from '@/types';

interface AppLayoutProps {
  children: React.ReactNode;
  user: User;
}

export function AppLayout({ children, user }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
} 
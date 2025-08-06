'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Building2, 
  CreditCard, 
  FileText, 
  Users, 
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface User {
  name: string;
  email: string;
  role: 'buyer' | 'developer';
}

interface SidebarProps {
  user: User;
}

export function Sidebar({ user }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const buyerNavigation = [
    { name: 'Mi Unidad', href: '/buyer/unit', icon: Home },
    { name: 'Mi Contrato', href: '/buyer/contract', icon: FileText },
    { name: 'Estado de Pagos', href: '/buyer/payments', icon: CreditCard },
  ];

  const developerNavigation = [
    { name: 'Dashboard', href: '/developer', icon: BarChart3 },
    { name: 'Ventas', href: '/developer/sales', icon: Users },
    { name: 'Productos', href: '/developer/products', icon: Building2 },
    { name: 'Pagos', href: '/developer/payments', icon: CreditCard },
    { name: 'Contratos', href: '/developer/contracts', icon: FileText },
  ];

  const navigation = user.role === 'buyer' ? buyerNavigation : developerNavigation;

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div>
            <h1 className="text-xl font-bold gradient-text">Leox</h1>
            <p className="text-xs text-gray-500">Preventas</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hover:bg-gray-100"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gray-900 text-white">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.role === 'buyer' ? 'Comprador' : 'Desarrollador'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start ${
                  isCollapsed ? 'px-2' : ''
                } ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90 font-medium border-l-4 border-l-blue-500' 
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
                size="sm"
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span className="ml-2">{item.name}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-1">
        <Link href="/settings">
          <Button
            variant="ghost"
            className={`w-full justify-start ${
              isCollapsed ? 'px-2' : ''
            }`}
            size="sm"
          >
            <Settings className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span className="ml-2">Configuración</span>}
          </Button>
        </Link>
        <Button
          variant="ghost"
          className={`w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 ${
            isCollapsed ? 'px-2' : ''
          }`}
          size="sm"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span className="ml-2">Cerrar Sesión</span>}
        </Button>
      </div>
    </div>
  );
} 
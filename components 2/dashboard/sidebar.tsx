'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/lib/contexts/auth-context';
import { Home, Users, Settings, LogOut, FolderOpen } from 'lucide-react';

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    badge: null,
  },
  {
    title: 'Projects',
    href: '/projects',
    icon: FolderOpen,
    badge: '0',
  },
  {
    title: 'Team',
    href: '/team',
    icon: Users,
    badge: '1',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    badge: null,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const userDisplayName =
    user?.user_metadata?.full_name || user?.email || 'User';

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r">
      {/* Logo/Brand */}
      <div className="flex h-14 items-center border-b px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="flex items-center gap-2 text-white">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="text-sm font-bold">S1</span>
          </div>
          <h2 className="text-lg font-semibold">BMW</h2>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:shadow-sm',
                isActive
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-l-4 border-l-blue-600 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {item.title}
              </div>
              {item.badge && (
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full font-medium',
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {getInitials(userDisplayName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.user_metadata?.first_name || userDisplayName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut()}
            className="h-8 w-8"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { ReactNode, useState, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { GlobalSearch } from './global-search';
import { LanguageSwitcher } from './language-switcher';
import { Bell, Search, Plus } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  user?: {
    name: string;
    email: string;
    role: 'super_admin' | 'admin' | 'user';
    avatar?: string;
  };
}

export function DashboardLayout({
  children,
  title,
  subtitle,
  actions,
  user = {
    name: 'Florian',
    email: 'florian@brandblueprint.com',
    role: 'super_admin',
  },
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed');
    if (stored) {
      setSidebarCollapsed(stored === 'true');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        user={user}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        )}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex h-16 items-center justify-between px-6">
            {/* Title Section */}
            <div className="flex flex-col">
              {title && <h1 className="text-lg font-semibold">{title}</h1>}
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="hidden lg:block">
                <GlobalSearch
                  placeholder="Search..."
                  className="w-64"
                />
              </div>

              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
              </Button>

              {/* Custom Actions */}
              {actions}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}

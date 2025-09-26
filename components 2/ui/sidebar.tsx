'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { signOut } from '@/app/actions/auth';
import { ThemeToggle } from './theme-toggle';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Building2,
  Briefcase,
  FileText,
  BookOpen,
  HelpCircle,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Crown,
  Sparkles,
  User,
} from 'lucide-react';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  adminOnly?: boolean;
}

const sidebarItems: SidebarItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    label: 'Organizations',
    href: '/organizations',
    icon: Building2,
    adminOnly: true,
  },
  { label: 'Businesses', href: '/businesses', icon: Briefcase },
  { label: 'Projects', href: '/projects', icon: FileText },
  { label: 'Workshop', href: '/workshop', icon: Sparkles },
  { label: 'Brand Guide', href: '/brand-guide', icon: BookOpen },
];

const adminItems: SidebarItem[] = [
  { label: 'Questions', href: '/admin/questions', icon: HelpCircle },
  { label: 'Modules', href: '/admin/modules', icon: Package },
  { label: 'Strategies', href: '/admin/strategies', icon: BarChart3 },
];

const bottomItems: SidebarItem[] = [
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  user?: {
    name: string;
    email: string;
    role: 'super_admin' | 'admin' | 'user';
    avatar?: string;
  };
  className?: string;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Sidebar({
  user,
  className,
  collapsed,
  onCollapsedChange,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed ?? false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Load collapsed state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed');
    if (stored) {
      const collapsedState = stored === 'true';
      setIsCollapsed(collapsedState);
      onCollapsedChange?.(collapsedState);
    }
  }, [onCollapsedChange]);

  // Update internal state when prop changes
  useEffect(() => {
    if (collapsed !== undefined) {
      setIsCollapsed(collapsed);
    }
  }, [collapsed]);

  // Save collapsed state to localStorage and notify parent
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
    onCollapsedChange?.(newState);
  };

  const isActive = (href: string) => {
    // Exact match
    if (pathname === href) return true;

    // For routes with dynamic segments or sub-routes (but not dashboard)
    if (href !== '/dashboard' && pathname.startsWith(href + '/')) return true;

    // Special handling for locale-prefixed paths (e.g., /en/projects)
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '');
    if (pathWithoutLocale === href) return true;
    if (href !== '/dashboard' && pathWithoutLocale.startsWith(href + '/')) return true;

    return false;
  };
  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 ease-in-out z-50 flex flex-col',
        isCollapsed ? 'w-20' : 'w-64',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-2 transition-opacity',
            isCollapsed && 'justify-center'
          )}
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">B</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm">BRAND</span>
              <span className="text-xs text-muted-foreground">BLUEPRINT</span>
            </div>
          )}
        </Link>

        <button
          onClick={toggleCollapsed}
          className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>


      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {sidebarItems.map(item => {
          if (item.adminOnly && !isSuperAdmin) return null;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                'hover:bg-secondary/50',
                !isActive(item.href) && 'hover:text-primary',
                isActive(item.href) && 'bg-primary/10 text-primary border-r-4 border-r-primary shadow-sm',
                isCollapsed && 'justify-center px-0'
              )}
              onMouseEnter={() => isCollapsed && setShowTooltip(item.label)}
              onMouseLeave={() => setShowTooltip(null)}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
              {item.badge && !isCollapsed && (
                <span className="ml-auto px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                  {item.badge}
                </span>
              )}

              {/* Tooltip */}
              {isCollapsed && showTooltip === item.label && (
                <div className="absolute left-20 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg border border-border whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}

        {/* Admin Section */}
        {isSuperAdmin && (
          <>
            <div
              className={cn(
                'pt-4 mt-4 border-t border-border',
                isCollapsed && 'pt-2 mt-2'
              )}
            >
              {!isCollapsed && (
                <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Admin
                </p>
              )}
              {adminItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    'hover:bg-secondary/50',
                    !isActive(item.href) && 'hover:text-primary',
                    isActive(item.href) && 'bg-primary/10 text-primary border-r-4 border-r-primary shadow-sm',
                    isCollapsed && 'justify-center px-0'
                  )}
                  onMouseEnter={() => isCollapsed && setShowTooltip(item.label)}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}

                  {/* Tooltip */}
                  {isCollapsed && showTooltip === item.label && (
                    <div className="absolute left-20 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg border border-border whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 py-4 border-t border-border space-y-1">
        {bottomItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              'hover:bg-secondary/50',
              !isActive(item.href) && 'hover:text-primary',
              isActive(item.href) && 'bg-primary/10 text-primary border-r-4 border-r-primary shadow-sm',
              isCollapsed && 'justify-center px-0'
            )}
            onMouseEnter={() => isCollapsed && setShowTooltip(item.label)}
            onMouseLeave={() => setShowTooltip(null)}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>{item.label}</span>}

            {/* Tooltip */}
            {isCollapsed && showTooltip === item.label && (
              <div className="absolute left-20 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg border border-border whitespace-nowrap z-50">
                {item.label}
              </div>
            )}
          </Link>
        ))}

        {/* Theme Toggle */}
        <ThemeToggle
          className={cn(
            isCollapsed && 'justify-center px-0'
          )}
          showLabels={!isCollapsed}
        />

        {/* Logout */}
        <button
          onClick={async () => {
            try {
              const result = await signOut();
              if (result?.error) {
                console.error('Logout error:', result.error);
              } else {
                // Handle successful logout with client-side redirect
                router.push('/login');
                router.refresh();
              }
            } catch (err: any) {
              // Check if it's a NEXT_REDIRECT error (which means success)
              if (err?.message?.includes('NEXT_REDIRECT')) {
                router.push('/login');
                router.refresh();
              } else {
                console.error('Logout error:', err);
              }
            }
          }}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 w-full',
            'hover:bg-secondary/50 hover:text-primary text-muted-foreground',
            isCollapsed && 'justify-center px-0'
          )}
          onMouseEnter={() => isCollapsed && setShowTooltip('Log Out')}
          onMouseLeave={() => setShowTooltip(null)}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span>Log Out</span>}

          {/* Tooltip */}
          {isCollapsed && showTooltip === 'Log Out' && (
            <div className="absolute left-20 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg border border-border whitespace-nowrap z-50">
              Log Out
            </div>
          )}
        </button>

        {/* User Info */}
        {user && (
          <div
            className={cn(
              'flex items-center gap-3 px-3 pt-3 border-t border-border',
              isCollapsed && 'justify-center px-0'
            )}
          >
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full rounded-full"
                />
              ) : (
                <User className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.role === 'super_admin' ? 'Super Admin' : user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

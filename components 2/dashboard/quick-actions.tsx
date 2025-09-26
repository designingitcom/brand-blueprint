'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Plus,
  Palette,
  FileText,
  Camera,
  Megaphone,
  BarChart3,
  Users,
  Target,
} from 'lucide-react';
import Link from 'next/link';

export function QuickActions() {
  const quickActions = [
    {
      title: 'Create Project',
      description: 'Start a new brand project',
      icon: Plus,
      href: '/projects/new',
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Brand Kit',
      description: 'Manage colors & assets',
      icon: Palette,
      href: '/brand-kit',
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Content Library',
      description: 'Browse brand assets',
      icon: FileText,
      href: '/content',
      color: 'green',
      gradient: 'from-green-500 to-green-600',
    },
    {
      title: 'Campaign',
      description: 'Launch marketing campaign',
      icon: Megaphone,
      href: '/campaigns/new',
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Analytics',
      description: 'View performance metrics',
      icon: BarChart3,
      href: '/analytics',
      color: 'indigo',
      gradient: 'from-indigo-500 to-indigo-600',
    },
    {
      title: 'Team Invite',
      description: 'Add team members',
      icon: Users,
      href: '/team/invite',
      color: 'pink',
      gradient: 'from-pink-500 to-pink-600',
    },
  ];
  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
          <p className="text-sm text-muted-foreground">
            Everything you need to manage your brand in one place
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col gap-2 hover:shadow-md transition-all duration-200 group"
                >
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

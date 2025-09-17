'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { KPICard } from '@/components/ui/kpi-card';
import { OnboardingStatusCard } from '@/components/onboarding-status-card';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Users,
  FileText,
  Plus,
  Settings,
  Activity,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface BusinessDashboardProps {
  business: {
    id: string;
    name: string;
    slug: string;
    onboarding_completed?: boolean;
    organization_name?: string;
    team_size?: number;
  };
}

export function BusinessDashboard({ business }: BusinessDashboardProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusinessData();
  }, [business.id]);

  const loadBusinessData = async () => {
    const supabase = createClient();
    
    try {
      // Load projects for this business
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('business_id', business.id);
      
      // Load team members (if we have user management)
      // For now, just mock data
      const { data: teamData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('business_id', business.id);
      
      setProjects(projectsData || []);
      setTeamMembers(teamData || []);
    } catch (error) {
      console.error('Error loading business data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate KPIs
  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const teamSize = teamMembers.length || business.team_size || 1;

  const kpis = [
    {
      label: 'Total Projects',
      value: projects.length.toString(),
      change: 0,
      icon: FileText,
    },
    {
      label: 'Active Projects',
      value: activeProjects.toString(),
      change: 0,
      icon: Activity,
    },
    {
      label: 'Completed Projects',
      value: completedProjects.toString(),
      change: 0,
      icon: Building2,
    },
    {
      label: 'Team Members',
      value: teamSize.toString(),
      change: 0,
      icon: Users,
    },
  ];

  return (
    <DashboardLayout
      title={business.name}
      subtitle={business.organization_name ? `${business.organization_name} • Business Dashboard` : 'Business Dashboard'}
      actions={
        <div className="flex gap-2">
          <Link href={`/businesses/${business.slug}/settings`}>
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </Link>
          {business.onboarding_completed && (
            <Link href="/projects/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </Link>
          )}
        </div>
      }
    >
      <div className="space-y-8">
        {/* Onboarding Status - Prominent for end users */}
        <OnboardingStatusCard 
          businesses={[business]} 
          isAdminView={false} 
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map(kpi => (
            <KPICard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              change={kpi.change}
              changeLabel="this month"
              icon={kpi.icon}
            />
          ))}
        </div>

        {/* Recent Projects */}
        {business.onboarding_completed && projects.length > 0 && (
          <div className="bg-card rounded-2xl border border-border">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-lg font-semibold">Recent Projects</h2>
                <p className="text-sm text-muted-foreground">
                  Your latest brand strategy projects
                </p>
              </div>
              <Link href="/projects">
                <Button variant="outline">View All</Button>
              </Link>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {projects.slice(0, 5).map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div>
                      <h3 className="font-medium">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Status: {project.status?.replace('_', ' ')}
                      </p>
                    </div>
                    <Link href={`/projects/${project.slug || project.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {business.onboarding_completed && (
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/projects/new">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Project
                </Button>
              </Link>
              <Link href={`/businesses/${business.slug}/team`}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Users className="h-4 w-4" />
                  Manage Team
                </Button>
              </Link>
              <Link href="/workshop">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Activity className="h-4 w-4" />
                  Strategy Workshop
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
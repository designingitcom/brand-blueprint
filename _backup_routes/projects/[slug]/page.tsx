import { getProjectBySlugOrId } from '@/app/actions/projects';
import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/ui/kpi-card';
import {
  ArrowLeft,
  Plus,
  Building2,
  Users,
  Briefcase,
  Settings,
  Calendar,
  Clock,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  DollarSign,
  FileText,
  MessageSquare,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Load project data
  const { slug } = await params;
  const result = await getProjectBySlugOrId(slug);
  
  if (result.error || !result.data) {
    return (
      <DashboardLayout
        title="Project Not Found"
        subtitle="The requested project could not be found"
      >
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Project Not Found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            The project you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link href="/projects">
            <Button variant="outline">Back to Projects</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const project = result.data;

  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate stats from real project data
  const modules = project.project_modules || [];
  const completedModules = modules.filter(m => m.status === 'approved').length;
  const inProgressModules = modules.filter(m => m.status === 'in_progress').length;
  const totalModules = modules.length;
  const completionPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'pending':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      case 'on_hold':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'in_progress':
        return PlayCircle;
      case 'pending':
        return Clock;
      case 'on_hold':
        return PauseCircle;
      default:
        return Clock;
    }
  };

  const StatusIcon = getStatusIcon(project.status || 'active');

  const projectStats = [
    { label: 'Budget Remaining', value: '$0', change: 0, icon: DollarSign },
    { label: 'Modules Total', value: totalModules.toString(), change: 0, icon: Clock },
    { label: 'Modules Complete', value: `${completedModules}/${totalModules}`, change: 0, icon: CheckCircle },
    { label: 'Team Members', value: '0', change: 0, icon: Users },
  ];

  return (
    <DashboardLayout
      title={project.name}
      subtitle={`${project.client?.name || 'No Client'} • ${project.strategy_mode || 'Custom'}`}
      actions={
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          <Button className="gap-2">
            <Zap className="h-4 w-4" />
            Workshop
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Back Button */}
        <Link href="/projects">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
        </Link>

        {/* Project Header */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border',
                    getStatusColor(project.status || 'active')
                  )}
                >
                  <StatusIcon className="h-3 w-3" />
                  {(project.status || 'active').replace('_', ' ')}
                </span>
                <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-500">
                  {project.strategy_mode || 'custom'} strategy
                </span>
              </div>

              <p className="text-muted-foreground mb-4 max-w-3xl">
                {project.code && `Project Code: ${project.code}`}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Client</p>
                  <p className="font-medium">
                    {project.client?.name || 'No client assigned'}
                  </p>
                  {project.client?.website && (
                    <p className="text-xs text-muted-foreground">
                      {project.client.website}
                    </p>
                  )}
                </div>
                {project.client?.organization && (
                  <div>
                    <p className="text-muted-foreground">Organization</p>
                    <Link
                      href={`/organizations/${project.client.organization.slug}`}
                      className="font-medium hover:text-primary"
                    >
                      {project.client.organization.name}
                    </Link>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {project.created_at 
                      ? new Date(project.created_at).toLocaleDateString()
                      : 'Unknown'
                    }
                  </p>
                </div>
                {project.strategy_path && (
                  <div>
                    <p className="text-muted-foreground">Strategy Path</p>
                    <p className="font-medium">{project.strategy_path.name}</p>
                  </div>
                )}
                {project.base_project && (
                  <div>
                    <p className="text-muted-foreground">Base Project</p>
                    <Link
                      href={`/projects/${project.base_project.slug || project.base_project.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {project.base_project.name}
                    </Link>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Strategy Mode</p>
                  <p className="font-medium capitalize">
                    {project.strategy_mode || 'Custom'}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Circle */}
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 mb-3">
                <div className="w-full h-full rounded-full border-4 border-secondary"></div>
                <div
                  className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-primary border-t-transparent transform -rotate-90"
                  style={{
                    background: `conic-gradient(from 270deg, hsl(var(--primary)) ${completionPercentage * 3.6}deg, transparent ${completionPercentage * 3.6}deg)`,
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold">
                    {completionPercentage}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Progress</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {projectStats.map(stat => (
            <KPICard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              change={stat.change}
              changeLabel="vs target"
              icon={stat.icon}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Modules Section */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Project Modules ({totalModules})</h3>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Module
              </Button>
            </div>

            {modules.length > 0 ? (
              <div className="space-y-4">
                {modules.slice(0, 5).map(module => (
                  <div
                    key={module.id}
                    className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{module.module?.name || 'Unnamed Module'}</h4>
                        <span
                          className={cn(
                            'text-xs px-2 py-0.5 rounded-full',
                            getStatusColor(module.status || 'not_started')
                          )}
                        >
                          {(module.status || 'not_started').replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{module.module?.category || 'Uncategorized'}</span>
                        {module.user && <span>{module.user.name}</span>}
                        {module.due_at && (
                          <span>
                            Due {new Date(module.due_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Building2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {modules.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    And {modules.length - 5} more modules...
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No modules configured yet</p>
              </div>
            )}
          </div>

          {/* Deliverables Section */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="text-lg font-semibold mb-6">Deliverables ({project.deliverables?.length || 0})</h3>

            {project.deliverables && project.deliverables.length > 0 ? (
              <div className="space-y-4">
                {project.deliverables.slice(0, 5).map(deliverable => (
                  <div key={deliverable.id} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          'w-3 h-3 rounded-full border-2',
                          deliverable.status === 'completed'
                            ? 'bg-green-500 border-green-500'
                            : deliverable.status === 'in_progress'
                              ? 'bg-blue-500 border-blue-500'
                              : 'bg-secondary border-border'
                        )}
                      ></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{deliverable.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {deliverable.type} • {new Date(deliverable.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'text-xs px-2 py-1 rounded',
                        getStatusColor(deliverable.status || 'pending')
                      )}
                    >
                      {(deliverable.status || 'pending').replace('_', ' ')}
                    </span>
                  </div>
                ))}
                {project.deliverables.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    And {project.deliverables.length - 5} more deliverables...
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No deliverables created yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            View Files
          </Button>
          <Button variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Comments
          </Button>
          <Button>
            <Zap className="h-4 w-4 mr-2" />
            Start Workshop
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

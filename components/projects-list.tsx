'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  Edit,
  Trash2,
  ArrowRight,
  Search,
  Filter,
  Loader2,
  Calendar,
  Clock,
  CheckCircle,
  PlayCircle,
  PauseCircle,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ProjectWizard } from '@/components/forms/project-wizard';
import { deleteProject } from '@/app/actions/projects';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Project {
  id: string;
  name: string;
  slug?: string;
  client?: string;
  business?: string;
  business_slug?: string;
  organization?: string;
  organization_slug?: string;
  status?: string;
  progress?: number;
  budget?: number;
  spent?: number;
  team_size?: number;
  deadline?: string;
  created_at?: string;
  type?: string;
  priority?: string;
}

interface ProjectsListProps {
  projects: Project[];
  clients?: Array<{ id: string; name: string; slug?: string }>;
  searchQuery?: string;
  selectedType?: string;
  selectedStatus?: string;
  selectedOrganization?: string;
  onSearchChange?: (query: string) => void;
  onTypeChange?: (type: string) => void;
  onStatusChange?: (status: string) => void;
  onOrganizationChange?: (org: string) => void;
}

const PROJECT_TYPES = [
  'Brand Identity',
  'Rebranding',
  'Logo Design',
  'Brand Guidelines',
  'Identity System',
  'Product Design',
];

const PROJECT_STATUSES = ['in_progress', 'completed', 'on_hold', 'review'];

export function ProjectsList({
  projects,
  clients = [],
  searchQuery = '',
  selectedType = 'all',
  selectedStatus = 'all',
  selectedOrganization = 'all',
  onSearchChange,
  onTypeChange,
  onStatusChange,
  onOrganizationChange,
}: ProjectsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredProjects = projects.filter(project => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.client || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.business || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || project.type === selectedType;
    const matchesStatus =
      selectedStatus === 'all' || project.status === selectedStatus;
    const matchesOrg =
      selectedOrganization === 'all' ||
      project.organization_slug === selectedOrganization;
    return matchesSearch && matchesType && matchesStatus && matchesOrg;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'review':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
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
      case 'review':
        return Clock;
      case 'on_hold':
        return PauseCircle;
      default:
        return Clock;
    }
  };

  const handleDelete = async (projectId: string, projectName: string) => {
    setDeletingId(projectId);

    try {
      const result = await deleteProject(projectId);

      if (result.error) {
        toast.error('Failed to delete project', {
          description: result.error,
        });
      } else {
        toast.success('Project deleted successfully', {
          description: `${projectName} has been permanently deleted.`,
        });
        // Refresh the page to update the list
        window.location.reload();
      }
    } catch (error) {
      toast.error('Failed to delete project', {
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={e => onSearchChange?.(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-card text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedOrganization}
            onChange={e => onOrganizationChange?.(e.target.value)}
            className="h-10 px-4 rounded-lg border border-input bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary min-w-[160px]"
          >
            <option value="all">All Organizations</option>
            {Array.from(new Set(projects.map(p => ({ slug: p.organization_slug, name: p.organization }))).filter(o => o.name)).map(org => (
              <option key={org.slug} value={org.slug}>
                {org.name}
              </option>
            ))}
          </select>
          <select
            value={selectedType}
            onChange={e => onTypeChange?.(e.target.value)}
            className="h-10 px-4 rounded-lg border border-input bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary min-w-[140px]"
          >
            <option value="all">All Types</option>
            {PROJECT_TYPES.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={e => onStatusChange?.(e.target.value)}
            className="h-10 px-4 rounded-lg border border-input bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary min-w-[120px]"
          >
            <option value="all">All Status</option>
            {PROJECT_STATUSES.map(status => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredProjects.map(project => {
          const StatusIcon = getStatusIcon(project.status || '');
          return (
            <div
              key={project.id}
              className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-200"
            >
              {/* Project Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">
                        {project.name}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {project.client}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {project.business && (
                        <>
                          <Link
                            href={`/businesses/${project.business_slug}`}
                            className="hover:text-primary"
                          >
                            {project.business}
                          </Link>
                          <span>•</span>
                        </>
                      )}
                      {project.organization && (
                        <Link
                          href={`/organizations/${project.organization_slug}`}
                          className="hover:text-primary"
                        >
                          {project.organization}
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
                        getStatusColor(project.status || '')
                      )}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {(project.status || '').replace('_', ' ')}
                    </span>
                    <span className="text-xs text-primary font-medium">
                      {project.type}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                {project.status === 'in_progress' && project.progress && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        Progress
                      </span>
                      <span className="text-sm font-medium">
                        {project.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Project Stats */}
                {(project.budget || project.spent || project.team_size) && (
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {project.budget && (
                      <div>
                        <p className="text-lg font-bold">
                          {formatCurrency(project.budget)}
                        </p>
                        <p className="text-xs text-muted-foreground">Budget</p>
                      </div>
                    )}
                    {project.spent && (
                      <div>
                        <p className="text-lg font-bold">
                          {formatCurrency(project.spent)}
                        </p>
                        <p className="text-xs text-muted-foreground">Spent</p>
                      </div>
                    )}
                    {project.team_size && (
                      <div>
                        <p className="text-lg font-bold">{project.team_size}</p>
                        <p className="text-xs text-muted-foreground">Team Size</p>
                      </div>
                    )}
                  </div>
                )}

                {(project.deadline || project.priority) && (
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    {project.deadline && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Due {new Date(project.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {project.priority && (
                      <span
                        className={cn(
                          'text-xs px-2 py-1 rounded',
                          project.priority === 'high'
                            ? 'bg-red-500/10 text-red-500'
                            : project.priority === 'medium'
                              ? 'bg-yellow-500/10 text-yellow-500'
                              : 'bg-gray-500/10 text-gray-500'
                        )}
                      >
                        {project.priority} priority
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Project Footer */}
              <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                <div className="flex gap-1">
                  {/* Edit Button */}
                  <ProjectWizard
                    project={project}
                    clients={clients}
                    trigger={
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-3 w-3" />
                      </Button>
                    }
                    onSuccess={() => {
                      window.location.reload();
                    }}
                  />

                  {/* Delete Button */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                        disabled={deletingId === project.id}
                      >
                        {deletingId === project.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Project</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{project.name}"? This
                          action cannot be undone. All project data, modules, and
                          deliverables will be permanently removed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(project.id, project.name)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete Project
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <Button asChild variant="outline" size="sm" className="gap-2">
                  <Link href={`/projects/${project.slug || project.id}`}>
                    View Details
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No projects found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first project'}
          </p>
          <ProjectWizard
            clients={clients}
            trigger={
              <Button className="gap-2">
                <Briefcase className="h-4 w-4" />
                Create Project
              </Button>
            }
            onSuccess={() => {
              window.location.reload();
            }}
          />
        </div>
      )}
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Building2,
  Users,
  Edit,
  ArrowRight,
  Search,
  Calendar,
  MoreVertical,
  PlayCircle,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ProjectWizard } from '@/components/forms/project-wizard';

interface Project {
  id: string;
  name: string;
  slug?: string;
  client?: string;
  status?: string;
  progress?: number;
  budget?: number;
  spent?: number;
  team_size?: number;
  deadline?: string;
  created_at?: string;
  type?: string;
}

interface Business {
  id: string;
  name: string;
  slug?: string;
  organization?: { name: string; slug: string };
  type?: string;
  description?: string;
  projects?: Project[];
  created_at?: string;
  status_enum?: 'pending' | 'onboarding' | 'active' | 'inactive' | 'suspended';
  onboarding_completed?: boolean;
  onboarding_current_step?: number;
}

interface BusinessDetailContentProps {
  business: Business;
}

export function BusinessDetailContent({ business }: BusinessDetailContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const projects = business.projects || [];
  
  // Check if business needs onboarding
  const needsOnboarding = business.status_enum === 'pending' || business.onboarding_completed === false;
  const isOnboarding = business.status_enum === 'onboarding' || 
                       (business.onboarding_current_step && business.onboarding_current_step > 0);
  
  const onboardingButtonText = isOnboarding ? 'Continue Onboarding' : 'Start Onboarding';
  
  const filteredProjects = projects.filter(proj => {
    const matchesSearch =
      proj.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.client?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.type?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === 'all' || proj.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'on_hold':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div>
      {/* Projects Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Projects ({projects.length})</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-10 pl-10 pr-4 w-64 rounded-lg border border-input bg-card text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="h-10 px-4 rounded-lg border border-input bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>
            {needsOnboarding ? (
              <Button asChild className="gap-2">
                <Link href={`/en/onboarding?business=${business.id}`}>
                  <PlayCircle className="h-4 w-4" />
                  {onboardingButtonText}
                </Link>
              </Button>
            ) : (
              <ProjectWizard
                trigger={
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Project
                  </Button>
                }
                onSuccess={() => {
                  window.location.reload();
                }}
              />
            )}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredProjects.map(project => (
            <div
              key={project.id}
              className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-200"
            >
              {/* Project Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-1">
                      {project.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-1">
                      {project.client}
                    </p>
                    <p className="text-xs text-primary">{project.type}</p>
                  </div>
                  {project.status && (
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                        getStatusColor(project.status)
                      )}
                    >
                      {project.status.replace('_', ' ')}
                    </span>
                  )}
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
                {(project.budget || project.spent) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-lg font-bold">
                        {formatCurrency(project.budget)}
                      </p>
                      <p className="text-xs text-muted-foreground">Budget</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">
                        {formatCurrency(project.spent)}
                      </p>
                      <p className="text-xs text-muted-foreground">Spent</p>
                    </div>
                  </div>
                )}

                {(project.team_size || project.deadline) && (
                  <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      {project.team_size && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{project.team_size} members</span>
                        </div>
                      )}
                      {project.deadline && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(project.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Project Footer */}
              <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                <div className="flex gap-1">
                  <ProjectWizard
                    project={project}
                    trigger={
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-3 w-3" />
                      </Button>
                    }
                    onSuccess={() => {
                      window.location.reload();
                    }}
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </div>
                <Button asChild variant="outline" size="sm" className="gap-2">
                  <Link href={`/projects/${project.slug || project.id}`}>
                    View Details
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : needsOnboarding 
                  ? 'Complete the M0 onboarding module before creating projects'
                  : 'Get started by creating your first project for this business'}
            </p>
            {needsOnboarding ? (
              <Button asChild className="gap-2">
                <Link href={`/en/onboarding?business=${business.id}`}>
                  <PlayCircle className="h-4 w-4" />
                  {onboardingButtonText}
                </Link>
              </Button>
            ) : (
              <ProjectWizard
                trigger={
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Project
                  </Button>
                }
                onSuccess={() => {
                  window.location.reload();
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/ui/kpi-card';
import { Card, CardContent } from '@/components/ui/card';
import {
  Plus,
  Building2,
  Users,
  Briefcase,
  Edit,
  Trash2,
  ArrowRight,
  Search,
  Filter,
  MoreVertical,
  TrendingUp,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ProjectWizard } from '@/components/forms/project-wizard';
import { deleteProject, getProjects } from '@/app/actions/projects';
import { getBusinesses } from '@/app/actions/businesses';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
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

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [showProjectWizard, setShowProjectWizard] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBusiness, setFilterBusiness] = useState('all');
  const [businesses, setBusinesses] = useState<any[]>([]);

  useEffect(() => {
    loadProjects();
    loadBusinesses();
    checkOnboardingStatus();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const result = await getProjects();
      if (result.success && result.data) {
        setProjects(result.data);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const loadBusinesses = async () => {
    try {
      const result = await getBusinesses();
      if (result.success && result.data) {
        setBusinesses(result.data);
      }
    } catch (error) {
      console.error('Error loading businesses:', error);
    }
  };

  const checkOnboardingStatus = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Check if user has completed onboarding
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('onboarding_completed, completed_modules')
        .eq('user_id', user.id)
        .single();
      
      // Check onboarding completion status
      setHasCompletedOnboarding(profile?.onboarding_completed || false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const result = await deleteProject(projectId);
      if (result.success) {
        toast.success('Project deleted successfully');
        await loadProjects();
      } else {
        toast.error(result.error || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
    setDeleteProjectId(null);
  };

  // Filter projects based on search, status, and business
  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.code?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || project.status === filterStatus;
    
    const matchesBusiness = 
      filterBusiness === 'all' || project.business_id === filterBusiness;
    
    return matchesSearch && matchesStatus && matchesBusiness;
  });

  // Calculate statistics
  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalProjects = projects.length;

  const stats = [
    {
      label: 'Total Projects',
      value: totalProjects.toString(),
      icon: Building2,
      change: 0,
    },
    {
      label: 'Active',
      value: activeProjects.toString(),
      icon: PlayCircle,
      change: 0,
    },
    {
      label: 'Completed',
      value: completedProjects.toString(),
      icon: CheckCircle,
      change: 0,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <PlayCircle className="h-4 w-4 text-blue-600" />;
      case 'on_hold':
        return <PauseCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    return status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Pending';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-muted-foreground mt-1">
              Manage your brand strategy projects
            </p>
          </div>
          {hasCompletedOnboarding ? (
            <Button onClick={() => setShowProjectWizard(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          ) : (
            <Button 
              onClick={() => router.push('/onboarding')}
              className="gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Complete Onboarding First
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat, index) => (
            <KPICard key={index} {...stat} />
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <select
            value={filterBusiness}
            onChange={(e) => setFilterBusiness(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Businesses</option>
            {businesses.map(business => (
              <option key={business.id} value={business.id}>
                {business.name}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>

        {/* Projects List or Empty State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading projects...</p>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {projects.length === 0 ? 'No Projects Yet' : 'No Projects Found'}
              </h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                {projects.length === 0 ? (
                  hasCompletedOnboarding ? (
                    'Get started by creating your first project. Projects help you organize and track your brand strategy work.'
                  ) : (
                    'Complete the onboarding process to unlock project creation. This ensures you understand the brand methodology before starting projects.'
                  )
                ) : (
                  'Try adjusting your search or filters to find what you\'re looking for.'
                )}
              </p>
              {projects.length === 0 && (
                <div className="flex gap-3">
                  {hasCompletedOnboarding ? (
                    <Button onClick={() => setShowProjectWizard(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Your First Project
                    </Button>
                  ) : (
                    <>
                      <Button 
                        onClick={() => router.push('/onboarding')}
                        className="gap-2"
                      >
                        <BookOpen className="h-4 w-4" />
                        Start Onboarding
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => router.push('/dashboard')}
                        className="gap-2"
                      >
                        <ArrowRight className="h-4 w-4" />
                        Back to Dashboard
                      </Button>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          <Link
                            href={`/projects/${project.slug || project.id}`}
                            className="hover:text-primary transition-colors"
                          >
                            {project.name}
                          </Link>
                        </h3>
                        <span className="text-sm text-muted-foreground">
                          {project.code}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          <span>{project.business_name || 'No Business'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(project.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusIcon(project.status)}
                        <span className="text-sm font-medium">
                          {getStatusLabel(project.status)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/projects/${project.slug || project.id}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Edit className="h-3 w-3" />
                          View
                        </Button>
                      </Link>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Project</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{project.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteProject(project.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Project Wizard Modal */}
        {showProjectWizard && (
          <ProjectWizard
            onClose={() => setShowProjectWizard(false)}
            onSuccess={() => {
              setShowProjectWizard(false);
              loadProjects();
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
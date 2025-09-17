import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  Trash2,
  Copy,
  Settings, 
  Plus, 
  Book, 
  Users, 
  Calendar,
  Tag,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { cn } from '@/lib/utils';
import { 
  getModule, 
  Module, 
  ModuleCategory, 
  ModuleType 
} from '@/app/actions/modules';
import { ModuleForm } from '@/components/forms/module-form';
import { QuestionsSection } from '@/components/admin/questions-section';
import { DeleteModuleDialog } from '@/components/admin/delete-module-dialog';
import { CloneModuleDialog } from '@/components/admin/clone-module-dialog';

export const dynamic = 'force-dynamic';

export default async function ModuleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getModule(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const module = result.data;
  
  // Load all modules to get prerequisite names
  const { getModules } = await import('@/app/actions/modules');
  const allModules = await getModules();
  
  // Create a map of module IDs to names
  const moduleMap = new Map(allModules.map(m => [m.id, m.name]));

  const getCategoryColor = (category: ModuleCategory) => {
    const colors = {
      foundation: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
      strategy: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      brand: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      marketing: 'bg-green-500/10 text-green-500 border-green-500/20',
      operations: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      finance: 'bg-red-500/10 text-red-500 border-red-500/20',
      technology: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    };
    return colors[category] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  const getTypeColor = (type: ModuleType) => {
    const colors = {
      standard: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
      onboarding: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      assessment: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
      custom: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    };
    return colors[type] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout
      title={module.name}
      subtitle={`Module details and configuration`}
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Modules', href: '/admin/modules' },
        { label: module.name, href: `/admin/modules/${module.id}` }
      ]}
      actions={
        <div className="flex gap-2">
          <ModuleForm
            module={module}
            trigger={
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            }
          />
          <CloneModuleDialog
            module={module}
            trigger={
              <Button variant="outline" size="sm" className="gap-2">
                <Copy className="h-4 w-4" />
                Clone
              </Button>
            }
          />
          <DeleteModuleDialog
            module={module}
            trigger={
              <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            }
          />
        </div>
      }
    >
      <div className="space-y-8">
        {/* Module Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold">{module.name}</h1>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          module.is_active 
                            ? "bg-green-500/10 text-green-500 border-green-500/20" 
                            : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                        )}
                      >
                        {module.is_active ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">
                      /{module.slug}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {module.description && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Description
                    </h3>
                    <p className="text-sm leading-relaxed">{module.description}</p>
                  </div>
                )}

                {/* Classification */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Category
                    </h3>
                    <Badge 
                      variant="outline" 
                      className={cn("capitalize", getCategoryColor(module.category))}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {module.category}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Type
                    </h3>
                    <Badge 
                      variant="outline" 
                      className={cn("capitalize", getTypeColor(module.module_type))}
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      {module.module_type}
                    </Badge>
                  </div>
                </div>

                {/* Prerequisites */}
                {module.prerequisites && module.prerequisites.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Prerequisites
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {module.prerequisites.map((prereqId, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {moduleMap.get(prereqId) || 'Unknown Module'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="pt-4 border-t border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>Created: {module.created_at ? formatDate(module.created_at) : 'Unknown'}</span>
                    </div>
                    {module.updated_at && module.updated_at !== module.created_at && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>Updated: {formatDate(module.updated_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Questions Stats */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Questions</h3>
                  <Book className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {module.questions?.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total questions in this module
                  </p>
                </div>
              </div>
            </Card>

            {/* Prerequisites */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Prerequisites</h3>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {module.prerequisites?.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Required modules
                  </p>
                </div>
              </div>
            </Card>

          </div>
        </div>


        {/* Questions Section */}
        <Suspense fallback={
          <Card className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-48" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          </Card>
        }>
          <QuestionsSection module={module} />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
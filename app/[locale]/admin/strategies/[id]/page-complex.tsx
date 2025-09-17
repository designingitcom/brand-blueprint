'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Copy,
  Eye,
  EyeOff,
  GitBranch,
  Target,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ArrowDown,
  Settings,
  Plus,
  GripVertical,
  ChevronRight,
  Link2,
  Workflow,
  BarChart3
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getStrategySimple as getStrategy, StrategySimple as Strategy, cloneStrategySimple as cloneStrategy, deleteStrategySimple as deleteStrategy } from '@/app/actions/strategies-simple';
import { StrategyForm } from '@/components/forms/strategy-form';
import { cn } from '@/lib/utils';

export default function StrategyDetailPage() {
  const params = useParams();
  const strategyId = params.id as string;
  
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [modules, setModules] = useState<StrategyModule[]>([]);
  const [isReordering, setIsReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    async function loadStrategy() {
      try {
        const result = await getStrategy(strategyId);
        
        if (result.success && result.data) {
          setStrategy(result.data);
          setModules(result.data.modules || []);
        } else {
          setError(result.error || 'Strategy not found');
        }
      } catch (err) {
        setError('Failed to load strategy');
      } finally {
        setLoading(false);
      }
    }

    if (strategyId) {
      loadStrategy();
    }
  }, [strategyId]);

  const handleCloneStrategy = async () => {
    if (!strategy) return;
    
    setIsCloning(true);
    try {
      const result = await cloneStrategy(
        strategy.id, 
        `${strategy.name} (Copy)`,
        `${strategy.code}-copy`
      );
      
      if (result.success) {
        // Redirect to new strategy or show success message
        window.location.href = `/admin/strategies/${result.data?.id}`;
      } else {
        setError(result.error || 'Failed to clone strategy');
      }
    } catch (err) {
      setError('Failed to clone strategy');
    } finally {
      setIsCloning(false);
    }
  };

  const handleDeleteStrategy = async () => {
    if (!strategy || !window.confirm(`Are you sure you want to delete "${strategy.name}"? This action cannot be undone.`)) {
      return;
    }
    
    setIsDeleting(true);
    try {
      const result = await deleteStrategy(strategy.id);
      
      if (result.success) {
        window.location.href = '/admin/strategies';
      } else {
        setError(result.error || 'Failed to delete strategy');
      }
    } catch (err) {
      setError('Failed to delete strategy');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = modules.findIndex((m) => m.id === active.id);
      const newIndex = modules.findIndex((m) => m.id === over.id);
      
      const newModules = arrayMove(modules, oldIndex, newIndex);
      setModules(newModules);

      // Update sort orders
      setIsReordering(true);
      try {
        const updateData = newModules.map((module, index) => ({
          id: module.id,
          sort_order: index + 1
        }));

        const result = await reorderStrategyModules(updateData);
        if (!result.success) {
          // Revert on error
          setModules(modules);
          setError(result.error || 'Failed to update module order');
        }
      } catch (err) {
        // Revert on error
        setModules(modules);
        setError('Failed to update module order');
      } finally {
        setIsReordering(false);
      }
    }
  };

  const handleStrategyUpdate = (updatedStrategy: Strategy) => {
    setStrategy(updatedStrategy);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      foundation: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      strategy: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      communication: 'bg-green-500/10 text-green-500 border-green-500/20',
      visual: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      digital: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
      marketing: 'bg-red-500/10 text-red-500 border-red-500/20',
      experience: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      analytics: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  const getCompletionStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'needs_review':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const SortableModuleItem = ({ strategyModule, index, isLastModule }: { 
    strategyModule: StrategyModule; 
    index: number; 
    isLastModule: boolean; 
  }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: strategyModule.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const module = strategyModule.module;

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={cn(
          "relative",
          isDragging && "opacity-50"
        )}
      >
        {/* Module card */}
        <div className={cn(
          "flex items-start gap-4 p-4 rounded-lg border transition-colors",
          "hover:bg-muted/50",
          strategyModule.is_required ? "border-blue-500/20 bg-blue-500/5" : "border-border",
          isDragging && "shadow-lg"
        )}>
          {editMode && (
            <div 
              {...listeners}
              className="flex flex-col items-center gap-2 pt-1 cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
              {strategyModule.sort_order}
            </div>
            {getCompletionStatusIcon(module.completion_status)}
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Link 
                    href={`/admin/modules/${module.id}`}
                    className="font-medium text-sm text-primary hover:underline"
                  >
                    {module.name}
                  </Link>
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs capitalize", getCategoryColor(module.category))}
                  >
                    {module.category}
                  </Badge>
                  {strategyModule.is_required && (
                    <Badge variant="secondary" className="text-xs">
                      Required
                    </Badge>
                  )}
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs capitalize",
                      strategyModule.default_visibility === 'client' 
                        ? "text-green-600 border-green-200" 
                        : "text-gray-600 border-gray-200"
                    )}
                  >
                    {strategyModule.default_visibility}
                  </Badge>
                </div>
                
                {module.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {module.description}
                  </p>
                )}

                {strategyModule.notes && (
                  <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded border-l-2 border-blue-200">
                    <strong>Strategy Notes:</strong> {strategyModule.notes}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {editMode && (
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
                <Link 
                  href={`/admin/modules/${module.id}`}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Eye className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Dependencies */}
            {module.dependencies && module.dependencies.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Link2 className="h-3 w-3" />
                  Dependencies ({module.dependencies.length})
                </h5>
                <div className="flex flex-wrap gap-2">
                  {module.dependencies.map((dep) => (
                    <div 
                      key={dep.id}
                      className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded text-xs"
                    >
                      <ArrowLeft className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {dep.depends_on_module.name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {dep.dependency_type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unlock rules if they exist */}
            {strategyModule.unlock_rule_json && Object.keys(strategyModule.unlock_rule_json).length > 0 && (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Unlock Rules:</span> {JSON.stringify(strategyModule.unlock_rule_json)}
              </div>
            )}
          </div>
        </div>

        {/* Flow arrow to next module */}
        {!isLastModule && (
          <div className="flex justify-center py-2">
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
    );
  };

  const ModuleChainVisualization = ({ modules }: { modules: StrategyModule[] }) => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-medium flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Module Chain Flow ({modules.length} modules)
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Sequential Flow
            </Badge>
            {editMode && (
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Module
              </Button>
            )}
          </div>
        </div>

        <div className="relative">
          {/* Flow visualization */}
          {editMode && modules.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <GripVertical className="h-4 w-4" />
                <span>Drag and drop modules to reorder them in the strategy flow</span>
                {isReordering && (
                  <div className="flex items-center gap-1 ml-auto">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs">Updating order...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={modules.map(m => m.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {modules.map((strategyModule, index) => {
                  const isLastModule = index === modules.length - 1;
                  
                  return (
                    <SortableModuleItem
                      key={strategyModule.id}
                      strategyModule={strategyModule}
                      index={index}
                      isLastModule={isLastModule}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>

          {/* Empty state */}
          {modules.length === 0 && (
            <div className="text-center py-12">
              <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-sm font-medium mb-2">No Modules in Strategy</h4>
              <p className="text-sm text-muted-foreground mb-4">
                This strategy doesn't have any modules assigned yet.
              </p>
              {editMode && (
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Module
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Loading..."
        subtitle="Loading strategy details"
      >
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading strategy...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !strategy) {
    return (
      <DashboardLayout
        title="Strategy Not Found"
        subtitle="The requested strategy could not be found"
      >
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Strategy Not Found</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button asChild>
            <Link href="/admin/strategies">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Strategies
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={strategy.name}
      subtitle={`Strategy • ${strategy.modules?.length || 0} modules`}
      actions={
        <div className="flex gap-2">
          <StrategyForm
            strategy={strategy}
            trigger={
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            }
            onSuccess={handleStrategyUpdate}
          />
          <Button 
            variant="outline"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                View Mode
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Edit Mode
              </>
            )}
          </Button>
          <Button 
            variant="outline"
            onClick={handleCloneStrategy}
            disabled={isCloning}
          >
            {isCloning ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            Clone
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDeleteStrategy}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Delete
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/strategies">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Strategies
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Strategy Overview */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={strategy.is_active ? "default" : "outline"}>
                    {strategy.is_active ? "Active" : "Inactive"}
                  </Badge>
                  {strategy.is_default && (
                    <Badge variant="secondary">Default Strategy</Badge>
                  )}
                  <Badge variant="outline" className="font-mono text-xs">
                    {strategy.code}
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold">{strategy.name}</h1>
                {strategy.description && (
                  <p className="text-muted-foreground">{strategy.description}</p>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                ID: {strategy.id}
              </div>
            </div>

            {strategy.target_audience && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Target Audience
                  </h3>
                  <p className="text-sm">{strategy.target_audience}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Strategy Statistics */}
        <Card className="p-6">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Strategy Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {strategy.modules?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Modules</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {strategy.modules?.filter(m => m.is_required).length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Required</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {strategy.modules?.filter(m => m.default_visibility === 'client').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Client Visible</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {new Set(strategy.modules?.map(m => m.module.category)).size || 0}
              </div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
          </div>
        </Card>

        {/* Module Chain Visualization */}
        <Card className="p-6">
          <ModuleChainVisualization modules={modules} />
        </Card>

        {/* Technical Details */}
        <Card className="p-6">
          <h3 className="font-medium mb-4">Technical Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Created:</span>
              <span className="ml-2">{new Date(strategy.created_at).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Last Updated:</span>
              <span className="ml-2">{new Date(strategy.updated_at).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Organization:</span>
              <span className="ml-2">
                {strategy.organization_id ? (
                  <Badge variant="outline" className="ml-1">
                    Org: {strategy.organization_id.substring(0, 8)}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">Global Template</span>
                )}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
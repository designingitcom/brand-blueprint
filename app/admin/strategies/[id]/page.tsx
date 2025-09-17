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
  Loader2,
  AlertCircle
} from 'lucide-react';
import { getStrategySimple as getStrategy, StrategySimple as Strategy, cloneStrategySimple as cloneStrategy, deleteStrategySimple as deleteStrategy } from '@/app/actions/strategies-simple';
import { StrategyForm } from '@/components/forms/strategy-form';
import { StrategyModuleBuilder } from '@/components/strategy/strategy-module-builder';

export default function StrategyDetailPage() {
  const params = useParams();
  const strategyId = params.id as string;
  
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCloning, setIsCloning] = useState(false);

  useEffect(() => {
    async function loadStrategy() {
      try {
        const result = await getStrategy(strategyId);
        
        if (result.success && result.data) {
          setStrategy(result.data);
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
      const result = await cloneStrategy(strategy.id);
      
      if (result.success) {
        // Redirect to new strategy
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

  const handleStrategyUpdate = (updatedStrategy: Strategy) => {
    setStrategy(updatedStrategy);
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
      subtitle={`Strategy • ${strategy.module_sequence?.length || 0} modules`}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Info (takes 2 columns) */}
            <div className="space-y-4 lg:col-span-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={strategy.is_active ? "default" : "outline"}>
                    {strategy.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline" className="font-mono text-xs">
                    {strategy.slug}
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold">{strategy.name}</h1>
                {strategy.description && (
                  <p className="text-sm text-muted-foreground">{strategy.description}</p>
                )}
              </div>
              
              {strategy.target_audience && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Target Audience
                  </h3>
                  <p className="text-sm text-muted-foreground">{strategy.target_audience}</p>
                </div>
              )}
            </div>

            {/* Right Column - Stats (takes 1 column) */}
            <div className="flex flex-col justify-start">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Created: </span>
                  <span className="font-medium">{new Date(strategy.created_at).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">ID: </span>
                  <span className="font-mono text-xs">{strategy.id}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Module Builder */}
        <StrategyModuleBuilder
          strategy={strategy}
          onUpdate={handleStrategyUpdate}
        />
      </div>
    </DashboardLayout>
  );
}
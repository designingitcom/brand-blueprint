'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
  Copy,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Crown,
  Users,
  MapIcon,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StrategySimple as Strategy, deleteStrategySimple as deleteStrategy, cloneStrategySimple as cloneStrategy } from '@/app/actions/strategies-simple';
import { StrategyForm } from '@/components/forms/strategy-form';

interface StrategiesTableProps {
  strategies: Strategy[];
  onStrategyUpdate?: (strategy: Strategy) => void;
  onStrategyDelete?: (strategyId: string) => void;
}

export function StrategiesTable({ 
  strategies, 
  onStrategyUpdate,
  onStrategyDelete 
}: StrategiesTableProps) {
  const [sortField, setSortField] = useState<'name' | 'code' | 'modules_count'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [deletingStrategy, setDeletingStrategy] = useState<string | null>(null);
  const [cloningStrategy, setCloningStrategy] = useState<string | null>(null);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedStrategies = [...strategies].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortField) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'code':
        aValue = a.code.toLowerCase();
        bValue = b.code.toLowerCase();
        break;
      case 'modules_count':
        aValue = a.modules_count || 0;
        bValue = b.modules_count || 0;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  const handleDelete = async (strategy: Strategy) => {
    if (!confirm(`Are you sure you want to delete "${strategy.name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingStrategy(strategy.id);
    try {
      const result = await deleteStrategy(strategy.id);
      if (result.success) {
        onStrategyDelete?.(strategy.id);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting strategy:', error);
      alert('Failed to delete strategy');
    } finally {
      setDeletingStrategy(null);
    }
  };

  const handleClone = async (strategy: Strategy) => {
    setCloningStrategy(strategy.id);
    try {
      const result = await cloneStrategy(strategy.id);
      if (result.success && result.data) {
        // The cloned strategy will appear after refresh due to revalidation
        window.location.reload();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error cloning strategy:', error);
      alert('Failed to clone strategy');
    } finally {
      setCloningStrategy(null);
    }
  };

  if (strategies.length === 0) {
    return (
      <Card className="p-12 text-center">
        <MapIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground text-lg mb-4">No strategies found</p>
        <p className="text-sm text-muted-foreground mb-6">
          Create your first strategy path to organize your module sequences
        </p>
        <StrategyForm
          trigger={
            <Button>
              Create First Strategy
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <colgroup>
            <col className="w-[25%]" />
            <col className="w-[15%]" />
            <col className="w-[12%]" />
            <col className="w-[20%]" />
            <col className="w-[12%]" />
            <col className="w-[16%]" />
          </colgroup>
          <thead className="border-b border-border">
            <tr>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Strategy
                  {getSortIcon('name')}
                </button>
              </th>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                <button
                  onClick={() => handleSort('code')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Slug
                  {getSortIcon('code')}
                </button>
              </th>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                <button
                  onClick={() => handleSort('modules_count')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Modules
                  {getSortIcon('modules_count')}
                </button>
              </th>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                Target Audience
              </th>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                Status
              </th>
              <th className="text-right p-4 font-medium text-sm text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedStrategies.map((strategy) => (
              <tr key={strategy.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="p-4 overflow-hidden">
                  <div className="min-w-0">
                    <Link href={`/admin/strategies/${strategy.id}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="font-medium hover:text-yellow-500 transition-colors cursor-pointer truncate">
                          {strategy.name}
                        </h3>
                        {strategy.is_default && (
                          <Crown className="h-3 w-3 text-yellow-500 flex-shrink-0" title="Default Strategy" />
                        )}
                      </div>
                    </Link>
                    {strategy.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {strategy.description}
                      </p>
                    )}
                  </div>
                </td>
                <td className="p-4 overflow-hidden">
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono whitespace-nowrap">
                    {strategy.code}
                  </code>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {strategy.modules_count || 0}
                    </span>
                    {strategy.active_modules_count !== strategy.modules_count && (
                      <span className="text-xs text-muted-foreground">
                        ({strategy.active_modules_count || 0} active)
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm text-muted-foreground">
                    {strategy.target_audience || 'Not specified'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {strategy.is_active ? (
                      <Eye className="h-3 w-3 text-green-500" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className={cn(
                      "text-xs font-medium",
                      strategy.is_active ? "text-green-600" : "text-muted-foreground"
                    )}>
                      {strategy.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="View strategy"
                      asChild
                    >
                      <Link href={`/admin/strategies/${strategy.id}`}>
                        <Eye className="h-3 w-3" />
                      </Link>
                    </Button>
                    
                    <StrategyForm
                      strategy={strategy}
                      trigger={
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Edit strategy"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      }
                      onSuccess={onStrategyUpdate}
                    />
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="Clone strategy"
                      onClick={() => handleClone(strategy)}
                      disabled={cloningStrategy === strategy.id}
                    >
                      {cloningStrategy === strategy.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      title="Delete strategy"
                      onClick={() => handleDelete(strategy)}
                      disabled={deletingStrategy === strategy.id}
                    >
                      {deletingStrategy === strategy.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
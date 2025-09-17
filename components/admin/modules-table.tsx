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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Module, ModuleCategory, ModuleType } from '@/app/actions/modules';
import { ModuleForm } from '@/components/forms/module-form';
import { DeleteModuleDialog } from '@/components/admin/delete-module-dialog';

interface ModulesTableProps {
  modules: Module[];
}

export function ModulesTable({ modules }: ModulesTableProps) {
  const [sortField, setSortField] = useState<'name' | 'category' | 'type' | 'questions_count'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedModules = [...modules].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortField) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'category':
        aValue = a.category;
        bValue = b.category;
        break;
      case 'type':
        aValue = a.module_type;
        bValue = b.module_type;
        break;
      case 'questions_count':
        aValue = a.questions_count || 0;
        bValue = b.questions_count || 0;
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

  if (modules.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground text-lg mb-4">No modules found</p>
        <p className="text-sm text-muted-foreground mb-6">
          Create your first module to start building questionnaires
        </p>
        <ModuleForm
          trigger={
            <Button>
              Create First Module
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border">
            <tr>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Module
                  {getSortIcon('name')}
                </button>
              </th>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                <button
                  onClick={() => handleSort('category')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Category
                  {getSortIcon('category')}
                </button>
              </th>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                <button
                  onClick={() => handleSort('type')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Type
                  {getSortIcon('type')}
                </button>
              </th>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                <button
                  onClick={() => handleSort('questions_count')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Questions
                  {getSortIcon('questions_count')}
                </button>
              </th>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                Status
              </th>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">
                Dependencies
              </th>
              <th className="text-right p-4 font-medium text-sm text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedModules.map((module) => (
              <tr key={module.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="p-4">
                  <div>
                    <Link href={`/admin/modules/${module.id}`}>
                      <h3 className="font-medium hover:text-yellow-500 transition-colors cursor-pointer">
                        {module.name}
                      </h3>
                    </Link>
                    {module.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {module.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      /{module.slug}
                    </p>
                  </div>
                </td>
                <td className="p-4">
                  <Badge
                    variant="outline"
                    className={cn("capitalize", getCategoryColor(module.category))}
                  >
                    {module.category}
                  </Badge>
                </td>
                <td className="p-4">
                  <Badge
                    variant="outline"
                    className={cn("capitalize", getTypeColor(module.module_type))}
                  >
                    {module.module_type}
                  </Badge>
                </td>
                <td className="p-4">
                  <span className="text-sm font-medium">
                    {module.questions_count || 0}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {module.is_active ? (
                      <Eye className="h-3 w-3 text-green-500" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className={cn(
                      "text-xs font-medium",
                      module.is_active ? "text-green-600" : "text-muted-foreground"
                    )}>
                      {module.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {module.dependencies && module.dependencies.length > 0 ? (
                      module.dependencies.map((dep) => (
                        <Badge
                          key={dep.id}
                          variant="outline"
                          className="text-xs"
                        >
                          {dep.depends_on_module?.name || dep.depends_on_module_id}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="View module"
                      asChild
                    >
                      <Link href={`/admin/modules/${module.id}`}>
                        <Eye className="h-3 w-3" />
                      </Link>
                    </Button>
                    <ModuleForm
                      module={module}
                      trigger={
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Edit module"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      }
                    />
                    <DeleteModuleDialog
                      module={module}
                      trigger={
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          title="Delete module"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      }
                    />
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
'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Settings,
  Book,
  ArrowRight,
  MoreVertical,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getModules, Module, ModuleCategory, ModuleType } from '@/app/actions/modules';
import { ModuleForm } from '@/components/forms/module-form';
import { ModulesTable } from '@/components/admin/modules-table';

export default function ModulesAdminPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    async function loadModules() {
      try {
        const modules = await getModules();
        setModules(modules);
        setError(null);
      } catch (err) {
        console.error('Error loading modules:', err);
        setError('Failed to load modules');
      } finally {
        setLoading(false);
      }
    }

    loadModules();
  }, []);

  const moduleCategories: ModuleCategory[] = ['foundation', 'strategy', 'brand', 'marketing', 'operations', 'finance', 'technology'];
  const moduleTypes: ModuleType[] = ['standard', 'onboarding', 'assessment', 'custom'];

  // Filter modules based on search and selections
  const filteredModules = modules.filter(module => {
    const matchesSearch = searchQuery === '' || 
      module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (module.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.slug.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    const matchesType = selectedType === 'all' || module.module_type === selectedType;
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'active' ? module.is_active : !module.is_active);
    
    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  return (
    <DashboardLayout
      title="Module Administration"
      subtitle="Manage questionnaire modules and dependencies"
      actions={
        <ModuleForm
          trigger={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Module
            </Button>
          }
          onSuccess={(module) => {
            setModules(prev => [module, ...prev]);
          }}
        />
      }
    >
      <div className="space-y-8">
        {/* Filters - Same structure as businesses page */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-card text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="h-10 px-4 rounded-lg border border-input bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary capitalize"
            >
              <option value="all">All Categories</option>
              {moduleCategories.map(category => (
                <option key={category} value={category} className="capitalize">
                  {category}
                </option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="h-10 px-4 rounded-lg border border-input bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary capitalize"
            >
              <option value="all">All Types</option>
              {moduleTypes.map(type => (
                <option key={type} value={type} className="capitalize">
                  {type}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="h-10 px-4 rounded-lg border border-input bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Loading, Error, or Table */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading modules...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Modules</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : (
          /* Modules Table */
          <ModulesTable modules={filteredModules} />
        )}
      </div>
    </DashboardLayout>
  );
}
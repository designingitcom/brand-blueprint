'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/ui/dashboard-layout';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/ui/kpi-card';
import {
  Plus,
  Search,
  Filter,
  MapIcon,
  Target,
  Layers,
  Settings,
  Loader2,
} from 'lucide-react';
import { StrategiesTable } from '@/components/strategies-table';
import { StrategyForm } from '@/components/forms/strategy-form';
import { getStrategiesSimple as getStrategies, StrategySimple as Strategy } from '@/app/actions/strategies-simple';

export default function StrategiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDefault, setSelectedDefault] = useState('all');
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStrategies() {
      try {
        const result = await getStrategies();
        if (result.success && result.data) {
          setStrategies(result.data);
          setError('');
        } else {
          setError(result.error || 'Failed to load strategies');
        }
      } catch (err) {
        console.error('Error loading strategies:', err);
        setError('Failed to load strategies');
      } finally {
        setLoading(false);
      }
    }

    loadStrategies();
  }, []);

  const filteredStrategies = strategies.filter(strategy => {
    const matchesSearch =
      strategy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      strategy.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (strategy.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (strategy.target_audience || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'active' ? strategy.is_active : !strategy.is_active);
    
    const matchesDefault = selectedDefault === 'all' ||
      (selectedDefault === 'default' ? strategy.is_default : !strategy.is_default);
    
    return matchesSearch && matchesStatus && matchesDefault;
  });

  // Calculate stats from real data
  const strategyStats = [
    { 
      label: 'Total Strategies', 
      value: strategies.length.toString(), 
      change: 0, 
      icon: MapIcon 
    },
    { 
      label: 'Active Strategies', 
      value: strategies.filter(s => s.is_active).length.toString(), 
      change: 0, 
      icon: Target 
    },
    { 
      label: 'Default Strategies', 
      value: strategies.filter(s => s.is_default).length.toString(), 
      change: 0, 
      icon: Settings 
    },
    { 
      label: 'Total Modules', 
      value: strategies.reduce((sum, s) => sum + (s.modules_count || 0), 0).toString(), 
      change: 0, 
      icon: Layers 
    },
  ];

  const handleStrategyUpdate = (updatedStrategy: Strategy) => {
    setStrategies(prev => 
      prev.map(s => s.id === updatedStrategy.id ? updatedStrategy : s)
    );
  };

  const handleStrategyCreate = (newStrategy: Strategy) => {
    setStrategies(prev => [newStrategy, ...prev]);
  };

  const handleStrategyDelete = (strategyId: string) => {
    setStrategies(prev => prev.filter(s => s.id !== strategyId));
  };

  return (
    <DashboardLayout
      title="Strategy Paths"
      subtitle="Manage strategic pathways and module sequences"
      actions={
        <StrategyForm
          trigger={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Strategy
            </Button>
          }
          onSuccess={handleStrategyCreate}
        />
      }
    >
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {strategyStats.map(stat => (
            <KPICard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              change={stat.change}
              changeLabel="this month"
              icon={stat.icon}
            />
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search strategies..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-card text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="h-10 px-4 rounded-lg border border-input bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={selectedDefault}
              onChange={e => setSelectedDefault(e.target.value)}
              className="h-10 px-4 rounded-lg border border-input bg-card text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Default Status</option>
              <option value="default">Default</option>
              <option value="custom">Custom</option>
            </select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading strategies...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <MapIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Strategies</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : strategies.length === 0 ? (
          /* Empty State - No strategies at all */
          <div className="text-center py-12">
            <MapIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No strategies found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get started by creating your first strategy path
            </p>
            <StrategyForm
              trigger={
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Strategy
                </Button>
              }
              onSuccess={handleStrategyCreate}
            />
          </div>
        ) : filteredStrategies.length === 0 ? (
          /* Empty State - Strategies exist but none match filters */
          <div className="text-center py-12">
            <MapIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No strategies found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          /* Strategies Table */
          <StrategiesTable 
            strategies={filteredStrategies}
            onStrategyUpdate={handleStrategyUpdate}
            onStrategyDelete={handleStrategyDelete}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
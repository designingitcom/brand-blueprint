'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  Network,
  List,
  TreePine,
  Lightbulb
} from 'lucide-react';
import {
  DependencyTreeNode,
  DependencyValidationResult,
  ModuleOrderingResult,
  DependencyError,
  DependencyWarning,
  DependencySuggestion,
  createDependencyManager,
  ModuleNode,
  ModuleDependency
} from '@/lib/utils/module-dependencies';

interface DependencyVisualizerProps {
  modules: ModuleNode[];
  dependencies: ModuleDependency[];
  completedModules?: string[];
  inProgressModules?: string[];
  onModuleSelect?: (moduleId: string) => void;
  onApplySuggestion?: (suggestion: DependencySuggestion) => void;
}

export function DependencyVisualizer({
  modules,
  dependencies,
  completedModules = [],
  inProgressModules = [],
  onModuleSelect,
  onApplySuggestion
}: DependencyVisualizerProps) {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('tree');

  const dependencyManager = useMemo(() => 
    createDependencyManager(modules, dependencies), 
    [modules, dependencies]
  );

  const validation = useMemo(() => 
    dependencyManager.validateDependencies(), 
    [dependencyManager]
  );

  const ordering = useMemo(() => 
    dependencyManager.getTopologicalOrder(), 
    [dependencyManager]
  );

  const availableModules = useMemo(() =>
    dependencyManager.getAvailableModules(completedModules),
    [dependencyManager, completedModules]
  );

  const suggestedNext = useMemo(() =>
    dependencyManager.suggestNextModules(completedModules, inProgressModules),
    [dependencyManager, completedModules, inProgressModules]
  );

  const getModuleStatus = (moduleId: string) => {
    if (completedModules.includes(moduleId)) return 'completed';
    if (inProgressModules.includes(moduleId)) return 'in-progress';
    if (availableModules.find(m => m.id === moduleId)) return 'available';
    return 'blocked';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'available': return <CheckCircle className="w-4 h-4 text-yellow-500" />;
      case 'blocked': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'available': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: 'error' | 'warning') => {
    return severity === 'error' ? 'text-red-600 bg-red-50 border-red-200' : 'text-yellow-600 bg-yellow-50 border-yellow-200';
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleModuleClick = (moduleId: string) => {
    setSelectedModule(moduleId);
    onModuleSelect?.(moduleId);
  };

  return (
    <div className="space-y-6">
      {/* Validation Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5" />
            Module Dependency Status
          </CardTitle>
          <CardDescription>
            Overview of dependency validation and system health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {validation.isValid ? '✓' : '✗'}
              </div>
              <div className="text-sm text-gray-600">System Valid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{validation.errors.length}</div>
              <div className="text-sm text-gray-600">Errors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{validation.warnings.length}</div>
              <div className="text-sm text-gray-600">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{validation.suggestions.length}</div>
              <div className="text-sm text-gray-600">Suggestions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues and Suggestions */}
      {(validation.errors.length > 0 || validation.warnings.length > 0 || validation.suggestions.length > 0) && (
        <div className="space-y-4">
          {/* Errors */}
          {validation.errors.map((error, index) => (
            <Alert key={`error-${index}`} className={getSeverityColor(error.severity)}>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{error.type.replace('_', ' ').toUpperCase()}:</strong> {error.message}
                {error.moduleIds.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {error.moduleIds.map(id => {
                      const module = modules.find(m => m.id === id);
                      return module ? (
                        <Badge key={id} variant="outline" className="text-xs">
                          {module.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          ))}

          {/* Warnings */}
          {validation.warnings.map((warning, index) => (
            <Alert key={`warning-${index}`} className="text-yellow-600 bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>WARNING:</strong> {warning.message}
                {warning.suggestion && (
                  <div className="mt-1 text-sm italic">Suggestion: {warning.suggestion}</div>
                )}
              </AlertDescription>
            </Alert>
          ))}

          {/* Suggestions */}
          {validation.suggestions.map((suggestion, index) => (
            <Alert key={`suggestion-${index}`} className="text-blue-600 bg-blue-50 border-blue-200">
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-start justify-between">
                  <div>
                    <strong>SUGGESTION:</strong> {suggestion.message}
                    <div className="mt-1 text-sm">{suggestion.action}</div>
                    <Badge className={`mt-2 ${getPriorityColor(suggestion.priority)}`}>
                      {suggestion.priority} priority
                    </Badge>
                  </div>
                  {onApplySuggestion && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onApplySuggestion(suggestion)}
                    >
                      Apply
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Main Visualization Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Module Dependencies</CardTitle>
          <CardDescription>
            Visualize module relationships and execution order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tree" className="flex items-center gap-2">
                <TreePine className="w-4 h-4" />
                Tree View
              </TabsTrigger>
              <TabsTrigger value="ordering" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                Optimal Order
              </TabsTrigger>
              <TabsTrigger value="available" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Available Now
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Next Steps
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tree" className="space-y-4">
              <DependencyTree 
                tree={ordering.dependencyTree} 
                modules={modules}
                getModuleStatus={getModuleStatus}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
                onModuleClick={handleModuleClick}
                selectedModule={selectedModule}
              />
            </TabsContent>

            <TabsContent value="ordering" className="space-y-4">
              <OptimalOrderView 
                orderedModules={ordering.orderedModules}
                getModuleStatus={getModuleStatus}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
                onModuleClick={handleModuleClick}
                selectedModule={selectedModule}
              />
            </TabsContent>

            <TabsContent value="available" className="space-y-4">
              <AvailableModulesView 
                availableModules={availableModules}
                getModuleStatus={getModuleStatus}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
                onModuleClick={handleModuleClick}
                selectedModule={selectedModule}
              />
            </TabsContent>

            <TabsContent value="suggestions" className="space-y-4">
              <NextStepsView 
                suggestedModules={suggestedNext}
                getModuleStatus={getModuleStatus}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
                onModuleClick={handleModuleClick}
                selectedModule={selectedModule}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Tree View Component
function DependencyTree({ 
  tree, 
  modules,
  getModuleStatus,
  getStatusIcon,
  getStatusColor,
  onModuleClick,
  selectedModule
}: {
  tree: DependencyTreeNode[];
  modules: ModuleNode[];
  getModuleStatus: (id: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
  onModuleClick: (id: string) => void;
  selectedModule: string | null;
}) {
  const renderTreeNode = (node: DependencyTreeNode, level: number = 0) => {
    const status = getModuleStatus(node.module.id);
    const isSelected = selectedModule === node.module.id;
    
    return (
      <div key={node.module.id} className="space-y-2">
        <div 
          className={`
            flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors
            ${isSelected ? 'bg-blue-100 border-2 border-blue-300' : 'hover:bg-gray-50 border border-gray-200'}
            ${getStatusColor(status)}
          `}
          style={{ marginLeft: `${level * 24}px` }}
          onClick={() => onModuleClick(node.module.id)}
        >
          {getStatusIcon(status)}
          <div className="flex-1">
            <div className="font-medium">{node.module.name}</div>
            <div className="text-sm text-gray-600">{node.module.code}</div>
            {!node.prerequisitesMet && (
              <div className="text-xs text-red-600 mt-1">Prerequisites not met</div>
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            Depth: {node.depth}
          </Badge>
        </div>
        
        {node.dependents.map(dependent => renderTreeNode(dependent, level + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {tree.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No dependency tree available (possible circular dependencies)
        </div>
      ) : (
        tree.map(rootNode => renderTreeNode(rootNode))
      )}
    </div>
  );
}

// Optimal Order View Component
function OptimalOrderView({
  orderedModules,
  getModuleStatus,
  getStatusIcon,
  getStatusColor,
  onModuleClick,
  selectedModule
}: {
  orderedModules: ModuleNode[];
  getModuleStatus: (id: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
  onModuleClick: (id: string) => void;
  selectedModule: string | null;
}) {
  return (
    <div className="space-y-2">
      {orderedModules.map((module, index) => {
        const status = getModuleStatus(module.id);
        const isSelected = selectedModule === module.id;
        
        return (
          <div key={module.id} className="flex items-center gap-4">
            <div className="w-8 text-center text-sm text-gray-500 font-mono">
              {index + 1}
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div 
              className={`
                flex-1 flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
                ${isSelected ? 'bg-blue-100 border-2 border-blue-300' : 'hover:bg-gray-50 border border-gray-200'}
                ${getStatusColor(status)}
              `}
              onClick={() => onModuleClick(module.id)}
            >
              {getStatusIcon(status)}
              <div className="flex-1">
                <div className="font-medium">{module.name}</div>
                <div className="text-sm text-gray-600">{module.category}</div>
              </div>
              <Badge variant="outline">{module.code}</Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Available Modules View Component
function AvailableModulesView({
  availableModules,
  getModuleStatus,
  getStatusIcon,
  getStatusColor,
  onModuleClick,
  selectedModule
}: {
  availableModules: ModuleNode[];
  getModuleStatus: (id: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
  onModuleClick: (id: string) => void;
  selectedModule: string | null;
}) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        These modules are ready to start based on completed prerequisites:
      </div>
      <div className="grid gap-3">
        {availableModules.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No modules are currently available to start
          </div>
        ) : (
          availableModules.map(module => {
            const status = getModuleStatus(module.id);
            const isSelected = selectedModule === module.id;
            
            return (
              <div 
                key={module.id}
                className={`
                  flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-colors
                  ${isSelected ? 'bg-blue-100 border-2 border-blue-300' : 'hover:bg-gray-50 border border-gray-200'}
                  ${getStatusColor(status)}
                `}
                onClick={() => onModuleClick(module.id)}
              >
                {getStatusIcon(status)}
                <div className="flex-1">
                  <div className="font-medium">{module.name}</div>
                  <div className="text-sm text-gray-600">{module.description}</div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{module.code}</Badge>
                    <Badge variant="outline">{module.category}</Badge>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Next Steps View Component
function NextStepsView({
  suggestedModules,
  getModuleStatus,
  getStatusIcon,
  getStatusColor,
  onModuleClick,
  selectedModule
}: {
  suggestedModules: ModuleNode[];
  getModuleStatus: (id: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
  onModuleClick: (id: string) => void;
  selectedModule: string | null;
}) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        Recommended next modules to maximize progress:
      </div>
      <div className="grid gap-3">
        {suggestedModules.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No suggestions available at this time
          </div>
        ) : (
          suggestedModules.map((module, index) => {
            const status = getModuleStatus(module.id);
            const isSelected = selectedModule === module.id;
            
            return (
              <div 
                key={module.id}
                className={`
                  flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-colors border-l-4 border-l-blue-500
                  ${isSelected ? 'bg-blue-100 border-2 border-blue-300' : 'hover:bg-gray-50 border border-gray-200'}
                  ${getStatusColor(status)}
                `}
                onClick={() => onModuleClick(module.id)}
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {index + 1}
                </div>
                {getStatusIcon(status)}
                <div className="flex-1">
                  <div className="font-medium">{module.name}</div>
                  <div className="text-sm text-gray-600">{module.description}</div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{module.code}</Badge>
                    <Badge variant="outline">{module.category}</Badge>
                    <Badge className="bg-blue-100 text-blue-800">Recommended</Badge>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
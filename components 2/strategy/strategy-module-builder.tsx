'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
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
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GripVertical, 
  Plus, 
  Trash2,
  ChevronDown,
  ChevronRight 
} from 'lucide-react';
import { getModulesByCategory, ModuleSimple } from '@/app/actions/modules-simple';
import { updateStrategySimple, StrategySimple } from '@/app/actions/strategies-simple';

interface StrategyModuleBuilderProps {
  strategy: StrategySimple;
  onUpdate?: (updatedStrategy: StrategySimple) => void;
}

interface SelectedModule {
  id: string;
  name: string;
  category: string;
  description?: string;
  questions_count?: number;
}

// Sortable item component
function SortableModuleItem({ module, onRemove }: { module: SelectedModule; onRemove: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-card border border-border rounded-lg ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="cursor-grab hover:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-medium">{module.name}</div>
        {module.description && (
          <div className="text-sm text-muted-foreground truncate mt-1">
            {module.description}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        {module.questions_count !== undefined && (
          <div className="px-2 py-1 bg-muted/50 rounded text-xs text-muted-foreground border border-border">
            {module.questions_count} {module.questions_count === 1 ? 'question' : 'questions'}
          </div>
        )}
        <Badge variant="outline" className="text-xs bg-muted/30">
          {module.category}
        </Badge>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="text-muted-foreground hover:text-red-600 flex-shrink-0"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Available modules panel
function AvailableModulesPanel({ 
  modulesByCategory, 
  selectedModuleIds, 
  onAddModule 
}: { 
  modulesByCategory: Record<string, ModuleSimple[]>;
  selectedModuleIds: Set<string>;
  onAddModule: (module: ModuleSimple) => void;
}) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['foundation']));

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const categoryDisplayNames: Record<string, string> = {
    foundation: 'Foundation',
    brand: 'Brand Strategy',
    customer: 'Customer Research',
    messaging: 'Messaging',
    website: 'Website',
    execution: 'Execution'
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm text-muted-foreground">Available Modules</h3>
      
      {Object.entries(modulesByCategory).map(([category, modules]) => (
        <div key={category} className="space-y-2">
          <button
            onClick={() => toggleCategory(category)}
            className="flex items-center gap-2 text-sm font-medium hover:text-foreground transition-colors w-full text-left"
          >
            {expandedCategories.has(category) ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            {categoryDisplayNames[category] || category}
            <span className="text-muted-foreground">({modules.length})</span>
          </button>
          
          {expandedCategories.has(category) && (
            <div className="space-y-1 ml-6">
              {modules.map(module => (
                <div
                  key={module.id}
                  className={`group p-3 text-sm border border-border rounded hover:bg-muted/50 transition-colors ${
                    selectedModuleIds.has(module.id) ? 'bg-muted opacity-50' : 'bg-card cursor-pointer'
                  }`}
                  onClick={() => !selectedModuleIds.has(module.id) && onAddModule(module)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{module.name}</span>
                    {!selectedModuleIds.has(module.id) && (
                      <Plus className="h-3 w-3 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                    {selectedModuleIds.has(module.id) && (
                      <span className="text-xs text-muted-foreground">Added</span>
                    )}
                  </div>
                  {module.description && (
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {module.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function StrategyModuleBuilder({ strategy, onUpdate }: StrategyModuleBuilderProps) {
  const [selectedModules, setSelectedModules] = useState<SelectedModule[]>([]);
  const [modulesByCategory, setModulesByCategory] = useState<Record<string, ModuleSimple[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load modules and initialize selected modules
  useEffect(() => {
    async function loadData() {
      try {
        const result = await getModulesByCategory();
        if (result.success && result.data) {
          setModulesByCategory(result.data);
          
          // Initialize selected modules from strategy
          if (strategy.module_sequence && strategy.module_sequence.length > 0) {
            const allModules = Object.values(result.data).flat();
            const selected = strategy.module_sequence
              .map(moduleId => allModules.find(m => m.id === moduleId))
              .filter(Boolean)
              .map(module => ({
                id: module!.id,
                name: module!.name,
                category: module!.category,
                description: module!.description,
                questions_count: module!.questions_count
              }));
            setSelectedModules(selected);
          }
        } else {
          setError(result.error || 'Failed to load modules');
        }
      } catch (err) {
        setError('Failed to load modules');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [strategy.module_sequence]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const newModules = (() => {
        const oldIndex = selectedModules.findIndex(m => m.id === active.id);
        const newIndex = selectedModules.findIndex(m => m.id === over.id);
        return arrayMove(selectedModules, oldIndex, newIndex);
      })();
      
      setSelectedModules(newModules);
      await saveModuleSequence(newModules);
    }
  };

  const addModule = async (module: ModuleSimple) => {
    if (!selectedModules.find(m => m.id === module.id)) {
      const newModules = [...selectedModules, {
        id: module.id,
        name: module.name,
        category: module.category,
        description: module.description,
        questions_count: module.questions_count
      }];
      setSelectedModules(newModules);
      await saveModuleSequence(newModules);
    }
  };

  const removeModule = async (moduleId: string) => {
    const newModules = selectedModules.filter(m => m.id !== moduleId);
    setSelectedModules(newModules);
    await saveModuleSequence(newModules);
  };

  const saveModuleSequence = async (modules?: SelectedModule[]) => {
    const modulesToSave = modules || selectedModules;
    setSaving(true);
    setError('');

    try {
      const moduleSequence = modulesToSave.map(m => m.id);
      const result = await updateStrategySimple(strategy.id, {
        module_sequence: moduleSequence
      });

      if (result.success && result.data && onUpdate) {
        onUpdate(result.data);
        setHasChanges(false);
      } else {
        setError(result.error || 'Failed to save module sequence');
      }
    } catch (err) {
      setError('Failed to save module sequence');
    } finally {
      setSaving(false);
    }
  };

  const selectedModuleIds = new Set(selectedModules.map(m => m.id));

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading modules...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Available Modules Panel */}
      <div className="lg:col-span-1">
        <Card className="p-4 h-fit">
          <AvailableModulesPanel
            modulesByCategory={modulesByCategory}
            selectedModuleIds={selectedModuleIds}
            onAddModule={addModule}
          />
        </Card>
      </div>

      {/* Strategy Builder Panel */}
      <div className="lg:col-span-2">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-medium">Strategy Module Sequence</h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {selectedModules.length} modules
              </span>
              {saving && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Saving...
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
              {error}
            </div>
          )}

          {selectedModules.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <h4 className="font-medium mb-2">No modules selected</h4>
              <p className="text-sm">
                Add modules from the left panel to build your strategy sequence.
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={selectedModules.map(m => m.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {selectedModules.map((module, index) => (
                    <div key={module.id} className="relative">
                      <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-medium flex items-center justify-center">
                        {index + 1}
                      </div>
                      <SortableModuleItem
                        module={module}
                        onRemove={() => removeModule(module.id)}
                      />
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

        </Card>
      </div>
    </div>
  );
}
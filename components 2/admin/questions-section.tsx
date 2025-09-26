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
  DragStartEvent,
  DragOverlay,
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
import { 
  Plus, 
  Search, 
  Filter, 
  Edit,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Module } from '@/app/actions/modules';
import { Question, QuestionType, getQuestionsByModule } from '@/app/actions/questions';
import { QuestionForm } from '@/components/forms/question-form';
import { AssociateQuestionForm } from '@/components/forms/associate-question-form';
import { RemoveQuestionFromModuleDialog } from '@/components/admin/remove-question-from-module-dialog';

interface QuestionsSectionProps {
  module: Module;
}

interface SortableQuestionItemProps {
  question: Question;
  module: Module;
  questionTypes: Array<{ value: string; label: string }>;
  getTypeColor: (type: string) => string;
  onRefresh: () => void;
}

function SortableQuestionItem({ question, module, questionTypes, getTypeColor, onRefresh }: SortableQuestionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-card transition-colors",
        isDragging ? "opacity-50 shadow-lg" : "hover:bg-muted/30"
      )}
    >
      {/* Drag Handle */}
      <div
        className="cursor-move opacity-0 group-hover:opacity-100 transition-opacity touch-none flex items-center justify-center"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Question Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-medium text-sm truncate">{question.title || question.label || 'Untitled Question'}</h4>
          {question.required && (
            <Badge variant="outline" className="text-xs h-4 px-1.5 bg-red-500/10 text-red-500 border-red-500/20 flex-shrink-0">
              Required
            </Badge>
          )}
          <Badge 
            variant="outline" 
            className={cn("text-xs h-4 px-1.5 capitalize flex-shrink-0", getTypeColor(question.type))}
          >
            {questionTypes.find(t => t.value === question.type)?.label || question.type}
          </Badge>
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs h-4 px-1.5 flex-shrink-0",
              question.is_active !== false
                ? "bg-green-500/10 text-green-500 border-green-500/20" 
                : "bg-gray-500/10 text-gray-500 border-gray-500/20"
            )}
          >
            {question.is_active !== false ? (
              <>
                <Eye className="h-2.5 w-2.5 mr-1" />
                Active
              </>
            ) : (
              <>
                <EyeOff className="h-2.5 w-2.5 mr-1" />
                Inactive
              </>
            )}
          </Badge>
        </div>
        
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
          <span className="font-mono">{question.code}</span>
          {question.placeholder && (
            <span className="truncate">Placeholder: "{question.placeholder}"</span>
          )}
          {question.options && question.options.length > 0 && (
            <span className="flex-shrink-0">{question.options.length} options</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <QuestionForm
          defaultModuleId={module.id}
          question={question}
          trigger={
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Edit className="h-3 w-3" />
            </Button>
          }
        />
        <RemoveQuestionFromModuleDialog
          questionId={question.id}
          questionTitle={question.title || question.label || 'Untitled Question'}
          trigger={
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="h-3 w-3" />
            </Button>
          }
          onSuccess={onRefresh}
        />
      </div>
    </div>
  );
}

export function QuestionsSection({ module }: QuestionsSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        const result = await getQuestionsByModule(module.id);
        if (result.success && result.data) {
          setQuestions(result.data);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [module.id]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
      
      // TODO: Update order in database
      console.log('Reordered from', active.id, 'to', over.id);
    }
  };

  const questionTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'textarea', label: 'Long Text' },
    { value: 'select', label: 'Dropdown' },
    { value: 'multiselect', label: 'Multi Select' },
    { value: 'radio', label: 'Radio Buttons' },
    { value: 'checkbox', label: 'Checkboxes' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'email', label: 'Email' },
    { value: 'url', label: 'URL' },
  ];

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      text: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      textarea: 'bg-blue-600/10 text-blue-600 border-blue-600/20',
      select: 'bg-green-500/10 text-green-500 border-green-500/20',
      multiselect: 'bg-green-600/10 text-green-600 border-green-600/20',
      radio: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      checkbox: 'bg-purple-600/10 text-purple-600 border-purple-600/20',
      number: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      date: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
      email: 'bg-red-500/10 text-red-500 border-red-500/20',
      url: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    };
    return colors[type] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = (question.label?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (question.code?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (question.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesType = typeFilter === 'all' || question.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && question.is_active !== false) ||
                         (statusFilter === 'inactive' && question.is_active === false);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Module Questions</h2>
            <p className="text-sm text-muted-foreground">
              Configure the questions that will be presented in this module
            </p>
          </div>
          <AssociateQuestionForm
            moduleId={module.id}
            trigger={
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Associate Questions
              </Button>
            }
            onSuccess={() => {
              // Refresh questions after association
              const fetchQuestions = async () => {
                try {
                  const result = await getQuestionsByModule(module.id);
                  if (result.success && result.data) {
                    setQuestions(result.data);
                  }
                } catch (error) {
                  console.error('Error fetching questions:', error);
                }
              };
              fetchQuestions();
            }}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-sm"
            >
              <option value="all">All Types</option>
              {questionTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-48 mx-auto" />
              <div className="h-4 bg-muted rounded w-32 mx-auto" />
            </div>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-12">
            {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' ? (
              <div className="space-y-2">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">No questions match your filters</p>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setTypeFilter('all');
                    setStatusFilter('all');
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                  <h3 className="font-medium">No questions yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Add your first question to get started with this module
                  </p>
                </div>
                <AssociateQuestionForm
                  moduleId={module.id}
                  trigger={
                    <Button variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Associate First Question
                    </Button>
                  }
                  onSuccess={() => {
                    // Refresh questions after association
                    const fetchQuestions = async () => {
                      try {
                        const result = await getQuestionsByModule(module.id);
                        if (result.success && result.data) {
                          setQuestions(result.data);
                        }
                      } catch (error) {
                        console.error('Error fetching questions:', error);
                      }
                    };
                    fetchQuestions();
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={filteredQuestions.map(q => q.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {filteredQuestions.map((question, index) => (
                  <SortableQuestionItem
                    key={question.id}
                    question={question}
                    module={module}
                    questionTypes={questionTypes}
                    getTypeColor={getTypeColor}
                    onRefresh={() => {
                      const fetchQuestions = async () => {
                        try {
                          const result = await getQuestionsByModule(module.id);
                          if (result.success && result.data) {
                            setQuestions(result.data);
                          }
                        } catch (error) {
                          console.error('Error fetching questions:', error);
                        }
                      };
                      fetchQuestions();
                    }}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeId ? (
                <div className="p-3 border border-border rounded-lg bg-card shadow-lg opacity-80">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {filteredQuestions.find(q => q.id === activeId)?.title || 
                       filteredQuestions.find(q => q.id === activeId)?.label || 
                       'Untitled Question'}
                    </span>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

        )}

        {filteredQuestions.length > 0 && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Showing {filteredQuestions.length} of {questions.length} questions
              {(searchTerm || typeFilter !== 'all' || statusFilter !== 'all') && ' (filtered)'}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
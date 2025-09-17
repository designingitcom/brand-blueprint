'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { X, Plus, AlertCircle, Trash2, Info, Search, Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Question,
  QuestionType, 
  QuestionOption,
  CreateQuestionData,
  createQuestion,
  updateQuestion,
  getQuestions
} from '@/app/actions/questions';
import { getModulesWithResult, Module } from '@/app/actions/modules';

interface QuestionFormProps {
  question?: Question;
  trigger: React.ReactNode;
  onSuccess?: (question: Question) => void;
  defaultModuleId?: string;
}

const questionTypes: { value: QuestionType; label: string; hasOptions?: boolean }[] = [
  { value: 'text', label: 'Text' },
  { value: 'longtext', label: 'Long Text' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Yes/No' },
  { value: 'date', label: 'Date' },
  { value: 'rating', label: 'Rating' },
  { value: 'select', label: 'Select', hasOptions: true },
  { value: 'multiselect', label: 'Multi-Select', hasOptions: true },
  { value: 'url', label: 'URL' },
  { value: 'file', label: 'File Upload' },
  { value: 'persona', label: 'Persona' },
  { value: 'matrix', label: 'Matrix' },
];

export function QuestionForm({ question, trigger, onSuccess, defaultModuleId }: QuestionFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [options, setOptions] = useState<QuestionOption[]>(question?.options || []);
  const [newOption, setNewOption] = useState({ value: '', label: '' });
  const [examples, setExamples] = useState<string[]>(question?.examples || []);
  const [newExample, setNewExample] = useState('');
  const [prerequisites, setPrerequisites] = useState<string[]>(question?.prerequisites || []);
  const [prerequisiteSearch, setPrerequisiteSearch] = useState('');
  const [prerequisiteCategory, setPrerequisiteCategory] = useState('all');
  const [showPrerequisiteDropdown, setShowPrerequisiteDropdown] = useState(false);

  const [formData, setFormData] = useState<CreateQuestionData>({
    module_id: question?.module_id || defaultModuleId || '',
    title: question?.title || '',
    question_type: question?.question_type || 'standard',
    definition: question?.definition || '',
    why_it_matters: question?.why_it_matters || '',
    simple_terms: question?.simple_terms || '',
    sort_order: question?.sort_order || 999, // Default high value for new questions
    confidence_calibration_score: question?.confidence_calibration_score ?? 7,
    ai_assistance_enabled: question?.ai_assistance_enabled ?? true,
    // Optional fields
    prerequisites: question?.prerequisites || [],
    examples: question?.examples || [],
    demonstrations: question?.demonstrations || {},
    validation_rules: question?.validation_rules || {},
    ui_config: question?.ui_config || {},
  });

  // Load modules and questions when component opens
  useEffect(() => {
    if (isOpen) {
      loadModules();
      loadQuestions();
    }
  }, [isOpen]);

  const loadModules = async () => {
    try {
      const result = await getModulesWithResult();
      if (result.success && result.data) {
        // Filter to only show active modules
        const activeModules = result.data.filter(m => m.is_active);
        setModules(activeModules);
      } else {
        console.error('Error loading modules:', result.error);
      }
    } catch (error) {
      console.error('Error loading modules:', error);
    }
  };

  const loadQuestions = async () => {
    try {
      const result = await getQuestions();
      if (result.success && result.data) {
        // Filter out current question if editing
        const filteredQuestions = question 
          ? result.data.filter(q => q.id !== question.id)
          : result.data;
        setAvailableQuestions(filteredQuestions);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let result;
      if (question) {
        // For updates, send the correct database fields
        const updateData = {
          title: formData.title,
          question_type: formData.question_type,
          definition: formData.definition,
          why_it_matters: formData.why_it_matters,
          simple_terms: formData.simple_terms,
          sort_order: formData.sort_order,
          prerequisites,
          examples,
          demonstrations: formData.demonstrations,
          confidence_calibration_score: formData.confidence_calibration_score || 7,
          confidence_calibration_enabled: formData.confidence_calibration_score ? formData.confidence_calibration_score > 5 : true,
          ai_assistance_enabled: formData.ai_assistance_enabled,
          validation_rules: formData.validation_rules,
          ui_config: formData.ui_config,
          options: shouldShowOptions() ? options : undefined,
        };
        console.log('Sending update for question ID:', question.id, 'Update data:', updateData);
        result = await updateQuestion(question.id, updateData);
        console.log('Update result:', result);
      } else {
        // For creates, send the full CreateQuestionData
        const dataToSubmit = {
          ...formData,
          examples,
          prerequisites,
          options: shouldShowOptions() ? options : undefined,
        };
        result = await createQuestion(dataToSubmit);
      }

      if (result.success) {
        setIsOpen(false);
        if (result.data) {
          onSuccess?.(result.data);
        }
        router.refresh();
      } else {
        console.error('Update failed:', result.error);
        console.error('Data sent:', dataToSubmit);
        setError(result.error || 'An error occurred');
      }
    } catch (err) {
      console.error('Exception in form submission:', err);
      setError('An unexpected error occurred. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const shouldShowOptions = () => {
    return ['select', 'multiselect'].includes(formData.question_type || '');
  };

  const addOption = () => {
    if (newOption.value.trim() && newOption.label.trim()) {
      const newOptionItem: QuestionOption = {
        value: newOption.value.trim(),
        label: newOption.label.trim(),
        sort_order: options.length,
        is_active: true,
      };
      setOptions(prev => [...prev, newOptionItem]);
      setNewOption({ value: '', label: '' });
    }
  };

  const removeOption = (index: number) => {
    setOptions(prev => prev.filter((_, i) => i !== index));
  };

  const addExample = () => {
    if (newExample.trim()) {
      setExamples(prev => [...prev, newExample.trim()]);
      setNewExample('');
    }
  };

  const removeExample = (index: number) => {
    setExamples(prev => prev.filter((_, i) => i !== index));
  };

  const togglePrerequisite = (questionId: string) => {
    setPrerequisites(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  const removePrerequisite = (questionId: string) => {
    setPrerequisites(prev => prev.filter(id => id !== questionId));
  };

  // Filter questions for prerequisites search
  const filteredQuestions = availableQuestions.filter(q => {
    const matchesSearch = prerequisiteSearch === '' || 
      q.title.toLowerCase().includes(prerequisiteSearch.toLowerCase()) ||
      q.definition.toLowerCase().includes(prerequisiteSearch.toLowerCase()) ||
      (q.module?.name || '').toLowerCase().includes(prerequisiteSearch.toLowerCase());
    
    const matchesCategory = prerequisiteCategory === 'all' || prerequisiteCategory === '' || q.question_type === prerequisiteCategory;
    
    const notAlreadySelected = !prerequisites.includes(q.id);
    return matchesSearch && matchesCategory && notAlreadySelected;
  }).slice(0, 10); // Limit to 10 results
  
  // Get filtered results by category only (for initial display)
  const categoryFilteredQuestions = prerequisiteCategory === 'all' || prerequisiteCategory === '' ? [] : availableQuestions.filter(q => {
    const matchesCategory = q.question_type === prerequisiteCategory;
    const notAlreadySelected = !prerequisites.includes(q.id);
    return matchesCategory && notAlreadySelected;
  }).slice(0, 5);

  const getSelectedPrerequisiteQuestions = () => {
    return availableQuestions.filter(q => prerequisites.includes(q.id));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="w-full max-w-5xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle>
            {question ? 'Edit Question' : 'Create New Question'}
          </DialogTitle>
        </DialogHeader>
          
        <form onSubmit={handleSubmit} className="space-y-6">
          <style dangerouslySetInnerHTML={{
            __html: `
              .custom-scrollbar {
                scrollbar-width: thin;
                scrollbar-color: hsl(var(--muted-foreground)) transparent;
              }
              .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: hsl(var(--border));
                border-radius: 3px;
                transition: background 0.2s ease;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: hsl(var(--muted-foreground));
              }
              .custom-scrollbar:hover {
                scrollbar-color: hsl(var(--muted-foreground)) hsl(var(--muted));
              }
            `
          }} />
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Title - Most Important Field */}
          <div className="space-y-2">
            <Label htmlFor="title">Question Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., What is your brand's mission statement?"
              required
              className="text-lg"
            />
          </div>

          {/* Module and Type Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="module_id">Module *</Label>
              <Select
                value={formData.module_id}
                onValueChange={(value: string) =>
                  setFormData(prev => ({ ...prev, module_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a module..." />
                </SelectTrigger>
                <SelectContent>
                  {modules.length === 0 ? (
                    <SelectItem value="no-modules" disabled>
                      No active modules available
                    </SelectItem>
                  ) : (
                    modules.map((module) => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.name} ({module.category})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="question_type">Question Category *</Label>
              <Select
                value={formData.question_type}
                onValueChange={(value: string) =>
                  setFormData(prev => ({ ...prev, question_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="foundational">Foundational</SelectItem>
                  <SelectItem value="strategic">Strategic</SelectItem>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="assessment">Assessment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Language Indicator */}
          <div className="bg-muted/50 rounded-lg p-4 border border-muted">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Language:</span>
              <Badge variant="secondary" className="gap-1">
                🇺🇸 English (Default)
              </Badge>
              <span className="text-xs text-muted-foreground">
                Questions are created in English by default. Use translation features to create multilingual versions.
              </span>
            </div>
          </div>

          {/* Definition - Required Field */}
          <div className="space-y-2">
            <Label htmlFor="definition">Definition *</Label>
            <Textarea
              id="definition"
              value={formData.definition}
              onChange={(e) => setFormData(prev => ({ ...prev, definition: e.target.value }))}
              placeholder="Provide a clear definition of what this question is asking..."
              rows={3}
              required
            />
          </div>

          {/* Why It Matters and Simple Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="why_it_matters">Why It Matters *</Label>
              <Textarea
                id="why_it_matters"
                value={formData.why_it_matters}
                onChange={(e) => setFormData(prev => ({ ...prev, why_it_matters: e.target.value }))}
                placeholder="Explain why this question is important..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="simple_terms">In Simple Terms *</Label>
              <Textarea
                id="simple_terms"
                value={formData.simple_terms}
                onChange={(e) => setFormData(prev => ({ ...prev, simple_terms: e.target.value }))}
                placeholder="Explain this in simple, everyday language..."
                rows={3}
                required
              />
            </div>
          </div>

          {/* Examples Section */}
          <div className="space-y-3 p-4 border border-border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Examples</Label>
              <Badge variant="secondary" className="text-xs">
                {examples.length} example{examples.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Input
                value={newExample}
                onChange={(e) => setNewExample(e.target.value)}
                placeholder="Add an example answer or scenario..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExample())}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addExample}
                disabled={!newExample.trim()}
                className="px-3"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {examples.length > 0 && (
              <div className="space-y-2">
                {examples.map((example, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-background border border-border rounded"
                  >
                    <span className="flex-1 text-sm">{example}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExample(index)}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prerequisites Section - Enhanced Multi-Select */}
          <div className="space-y-3 p-4 border border-border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Prerequisites</Label>
              <Badge variant="secondary" className="text-xs">
                {prerequisites.length} selected
              </Badge>
            </div>
            

            {/* Selected Prerequisites */}
            {prerequisites.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground">Selected Prerequisites:</h4>
                <div className="flex flex-wrap gap-2">
                  {getSelectedPrerequisiteQuestions().map((q) => (
                    <div
                      key={q.id}
                      className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full"
                    >
                      <span className="text-xs">{q.title}</span>
                      {q.module && (
                        <Badge variant="outline" className="text-xs h-4">
                          {q.module.name}
                        </Badge>
                      )}
                      <button
                        type="button"
                        onClick={() => removePrerequisite(q.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category Filter */}
            <div className="space-y-2">
              <Label className="text-xs">Filter by Category</Label>
              <Select 
                value={prerequisiteCategory} 
                onValueChange={(value) => {
                  setPrerequisiteCategory(value);
                  if (value) {
                    setShowPrerequisiteDropdown(true);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="foundational">Foundational</SelectItem>
                  <SelectItem value="strategic">Strategic</SelectItem>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="assessment">Assessment</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={prerequisiteSearch}
                onChange={(e) => {
                  setPrerequisiteSearch(e.target.value);
                  setShowPrerequisiteDropdown(true);
                }}
                onFocus={() => setShowPrerequisiteDropdown(true)}
                placeholder="Search for questions to add as prerequisites..."
                className="pl-10"
              />
              {prerequisiteSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setPrerequisiteSearch('');
                    setShowPrerequisiteDropdown(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showPrerequisiteDropdown && (prerequisiteSearch || prerequisiteCategory || filteredQuestions.length > 0 || categoryFilteredQuestions.length > 0) && (
              <div className="relative z-50 border border-border rounded-md bg-background shadow-lg max-h-60 overflow-y-auto custom-scrollbar">
                {(() => {
                  const questionsToShow = prerequisiteSearch ? filteredQuestions : categoryFilteredQuestions;
                  if (questionsToShow.length === 0) {
                    return (
                      <div className="p-3 text-center text-sm text-muted-foreground">
                        {prerequisiteSearch ? 'No questions found matching your search' : 
                         prerequisiteCategory ? ('No ' + prerequisiteCategory + ' questions available') :
                         'Start typing to search or select a category'}
                      </div>
                    );
                  }
                  return (
                    <div className="divide-y divide-border">
                      {questionsToShow.map((q) => (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => {
                            togglePrerequisite(q.id);
                            setPrerequisiteSearch('');
                            setShowPrerequisiteDropdown(false);
                          }}
                          className="w-full text-left p-3 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{q.title}</div>
                              <div className="text-xs text-muted-foreground truncate mt-1">
                                {q.definition}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                              {q.module && (
                                <Badge variant="outline" className="text-xs">
                                  {q.module.name}
                                </Badge>
                              )}
                              {prerequisites.includes(q.id) ? (
                                <Check className="h-4 w-4 text-primary" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Close dropdown when clicking outside */}
            {showPrerequisiteDropdown && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowPrerequisiteDropdown(false)}
              />
            )}
          </div>

          {/* Settings Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border border-border rounded-lg">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="confidence_calibration">Confidence Importance Score (1-10)</Label>
              </div>
              <div className="flex items-center gap-3">
                <Select
                  value={formData.confidence_calibration_score?.toString() || "7"}
                  onValueChange={(value) => 
                    setFormData(prev => ({ 
                      ...prev, 
                      confidence_calibration_score: parseInt(value)
                    }))
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <SelectItem key={score} value={score.toString()}>
                        {score} / 10 ({score * 10}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">
                  Desired Confidence Level
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="ai_assistance">AI Assistance</Label>
              </div>
              <Switch
                id="ai_assistance"
                checked={formData.ai_assistance_enabled}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, ai_assistance_enabled: checked }))
                }
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isLoading || !formData.module_id || !formData.title.trim() || !formData.definition.trim() || !formData.why_it_matters.trim() || !formData.simple_terms.trim()}
            >
              {isLoading ? 'Saving...' : question ? 'Update Question' : 'Create Question'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
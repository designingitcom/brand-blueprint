'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Search, Plus, AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Question, getQuestions, associateQuestionsToModule } from '@/app/actions/questions';

interface AssociateQuestionFormProps {
  moduleId: string;
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

// Question types for filtering
const questionTypes = [
  { value: 'text', label: 'Text Input' },
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

export function AssociateQuestionForm({ moduleId, trigger, onSuccess }: AssociateQuestionFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for questions and filters
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());

  // Load questions when component opens
  useEffect(() => {
    if (isOpen) {
      loadQuestions();
    }
  }, [isOpen]);

  // Filter questions based on search and type
  useEffect(() => {
    let filtered = questions;

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(question => 
        (question.title || question.label || '').toLowerCase().includes(search) ||
        question.code.toLowerCase().includes(search) ||
        question.help_text?.toLowerCase().includes(search)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(question => question.type === typeFilter);
    }

    // Show latest 20 questions if no filters applied, otherwise show all matches
    if (!searchTerm.trim() && typeFilter === 'all') {
      filtered = filtered.slice(0, 20);
    }

    setFilteredQuestions(filtered);
  }, [questions, searchTerm, typeFilter]);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const result = await getQuestions();
      if (result.success && result.data) {
        // Filter out questions that are already associated with this module
        const availableQuestions = result.data.filter(question => 
          question && question.id && question.module_id !== moduleId
        );
        console.log('Available questions for module', moduleId, ':', availableQuestions.length);
        setQuestions(availableQuestions);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      setError('Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionToggle = (questionId: string) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestions(newSelected);
  };

  const handleSubmit = async () => {
    if (selectedQuestions.size === 0) {
      setError('Please select at least one question to associate');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await associateQuestionsToModule(moduleId, Array.from(selectedQuestions));
      
      if (result.success) {
        // Reset form
        setSelectedQuestions(new Set());
        setSearchTerm('');
        setTypeFilter('all');
        setIsOpen(false);
        
        onSuccess?.();
        router.refresh();
      } else {
        setError(result.error || 'Failed to associate questions');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      text: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      longtext: 'bg-blue-600/10 text-blue-600 border-blue-600/20',
      select: 'bg-green-500/10 text-green-500 border-green-500/20',
      multiselect: 'bg-green-600/10 text-green-600 border-green-600/20',
      boolean: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      number: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      date: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
      url: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    };
    return colors[type] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Associate Questions to Module</DialogTitle>
        </DialogHeader>
          
        <div className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Questions</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, code, or description..."
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Question Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {questionTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Selected Questions Summary */}
          {selectedQuestions.size > 0 && (
            <div className="p-4 bg-muted/30 rounded-lg border">
              <p className="text-sm font-medium mb-2">
                Selected Questions ({selectedQuestions.size})
              </p>
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedQuestions).map(id => {
                  const question = questions.find(q => q.id === id);
                  return question ? (
                    <Badge key={id} variant="secondary" className="text-xs">
                      {question.title || question.label || 'Untitled Question'}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Questions List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-muted rounded w-48 mx-auto" />
                <div className="h-4 bg-muted rounded w-32 mx-auto" />
              </div>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No questions found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm || typeFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'No unassociated questions available. All questions may already be associated with this module.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredQuestions.map((question) => (
                <div
                  key={question.id}
                  className={cn(
                    "flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors",
                    selectedQuestions.has(question.id)
                      ? "bg-blue-500/10 border-blue-500/20"
                      : "bg-card hover:bg-muted/30 border-border"
                  )}
                  onClick={() => handleQuestionToggle(question.id)}
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{question.title || question.label || 'Untitled Question'}</h4>
                      {question.required && (
                        <Badge variant="outline" className="text-xs bg-red-500/10 text-red-500 border-red-500/20">
                          Required
                        </Badge>
                      )}
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs capitalize", getTypeColor(question.type))}
                      >
                        {questionTypes.find(t => t.value === question.type)?.label || question.type}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="font-mono">{question.code}</span>
                      {question.options && question.options.length > 0 && (
                        <span>{question.options.length} options</span>
                      )}
                    </div>

                    {question.help_text && (
                      <p className="text-xs text-muted-foreground italic">
                        {question.help_text}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <div className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center",
                      selectedQuestions.has(question.id)
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "border-border"
                    )}>
                      {selectedQuestions.has(question.id) && (
                        <Check className="h-3 w-3" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!searchTerm && typeFilter === 'all' && filteredQuestions.length === 20 && (
            <p className="text-xs text-muted-foreground text-center">
              Showing latest 20 questions. Use search or filters to find specific questions.
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || selectedQuestions.size === 0}
              variant="default"
            >
              {isLoading ? 'Associating...' : `Associate ${selectedQuestions.size} Question${selectedQuestions.size !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
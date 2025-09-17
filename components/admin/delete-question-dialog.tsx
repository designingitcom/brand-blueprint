'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Question, deleteQuestion } from '@/app/actions/questions';

interface DeleteQuestionDialogProps {
  questionId: string;
  questionLabel: string;
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

export function DeleteQuestionDialog({ questionId, questionLabel, trigger, onSuccess }: DeleteQuestionDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await deleteQuestion(questionId);

      if (result.success) {
        setIsOpen(false);
        onSuccess?.();
        router.refresh();
      } else {
        setError(result.error || 'Failed to delete question');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="w-full max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle className="text-lg font-semibold text-destructive">Delete Question</DialogTitle>
          </div>
        </DialogHeader>
          
        <div className="space-y-4">
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">
                Are you sure you want to delete this question?
              </p>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone. The question and all its associated data will be permanently removed.
              </p>
            </div>

            {/* Question Details */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Question Title</h3>
                <p className="font-medium">{questionLabel}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Question ID</h4>
                <p className="text-sm font-mono text-muted-foreground">{questionId}</p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}


            {/* Note: We can't easily check for existing answers here without additional data,
                 but the deleteQuestion function will handle that validation */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 mb-1">
                    Answer Data Warning
                  </p>
                  <p className="text-sm text-amber-700">
                    If this question has existing answers or is used in framework bindings, deletion will be prevented.
                  </p>
                </div>
              </div>
            </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isLoading}
            variant="destructive"
            className="flex-1"
          >
            {isLoading ? 'Deleting...' : 'Delete Question'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
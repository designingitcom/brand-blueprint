'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { removeQuestionFromModule } from '@/app/actions/questions';
import { Loader2, AlertTriangle } from 'lucide-react';

interface RemoveQuestionFromModuleDialogProps {
  questionId: string;
  questionTitle: string;
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

export function RemoveQuestionFromModuleDialog({
  questionId,
  questionTitle,
  trigger,
  onSuccess,
}: RemoveQuestionFromModuleDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRemove = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await removeQuestionFromModule(questionId);
      
      if (result.success) {
        setIsOpen(false);
        onSuccess?.();
      } else {
        setError(result.error || 'Failed to remove question from module');
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <DialogTitle>Remove Question from Module</DialogTitle>
              <DialogDescription>
                This will remove the question from this module but keep the question itself.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove <strong>{questionTitle}</strong> from this module? 
            The question will still exist and can be associated with other modules.
          </p>
          
          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Removing...
              </>
            ) : (
              'Remove from Module'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
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
import { Module, deleteModule } from '@/app/actions/modules';

interface DeleteModuleDialogProps {
  module: Module;
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

export function DeleteModuleDialog({ module, trigger, onSuccess }: DeleteModuleDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await deleteModule(module.id);

      if (result.success) {
        setIsOpen(false);
        onSuccess?.();
        router.refresh();
      } else {
        setError(result.error || 'Failed to delete module');
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
            <DialogTitle className="text-lg font-semibold text-destructive">Delete Module</DialogTitle>
          </div>
        </DialogHeader>
          
        <div className="space-y-4">
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">
                Are you sure you want to delete this module?
              </p>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone. The module and all its associated data will be permanently removed.
              </p>
            </div>

            {/* Module Details */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Module Name</h3>
                <p className="font-medium">{module.name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Category</h4>
                  <Badge variant="outline" className="capitalize">
                    {module.category}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Type</h4>
                  <Badge variant="outline" className="capitalize">
                    {module.module_type}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Questions</h4>
                  <p className="text-sm">{module.questions_count || 0}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Dependencies</h4>
                  <p className="text-sm">{module.dependencies?.length || 0}</p>
                </div>
              </div>

              {module.description && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Deletion Warnings */}
            {(module.dependencies && module.dependencies.length > 0) && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 mb-1">
                      Dependency Warning
                    </p>
                    <p className="text-sm text-amber-700">
                      Other modules may depend on this module. Deleting it could cause issues.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {(module.questions_count && module.questions_count > 0) && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 mb-1">
                      Content Warning
                    </p>
                    <p className="text-sm text-amber-700">
                      This module contains {module.questions_count} question{module.questions_count !== 1 ? 's' : ''} that will also be deleted.
                    </p>
                  </div>
                </div>
              </div>
            )}
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
            {isLoading ? 'Deleting...' : 'Delete Module'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
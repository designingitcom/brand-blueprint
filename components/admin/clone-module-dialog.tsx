'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { AlertCircle } from 'lucide-react';
import { Module, cloneModule } from '@/app/actions/modules';

interface CloneModuleDialogProps {
  module: Module;
  trigger: React.ReactNode;
}

export function CloneModuleDialog({ module, trigger }: CloneModuleDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState(`${module.name} (Copy)`);

  const handleClone = async () => {
    if (!newName.trim()) {
      setError('Please enter a name for the cloned module');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await cloneModule(module.id, newName.trim());

      if (result.success) {
        setIsOpen(false);
        setNewName(`${module.name} (Copy)`);
        router.refresh();
        
        // Optionally redirect to the new module
        if (result.data) {
          router.push(`/admin/modules/${result.data.id}`);
        }
      } else {
        setError(result.error || 'Failed to clone module');
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Clone Module</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="module-name">Original Module</Label>
            <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
              {module.name}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clone-name">New Module Name</Label>
            <Input
              id="clone-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter name for cloned module"
            />
            <p className="text-xs text-muted-foreground">
              The cloned module will be created as inactive by default
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleClone}
            disabled={isLoading || !newName.trim()}
          >
            {isLoading ? 'Cloning...' : 'Clone Module'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
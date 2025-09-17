'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FolderOpen, Loader2 } from 'lucide-react';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectSetupProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onFinish: () => void;
}

export function ProjectSetup({ onNext, onSkip }: ProjectSetupProps) {
  const [error, setError] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true);
    setError('');

    try {
      // TODO: Create project API call
      // For now, just simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Creating project:', data);
      onNext();
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <FolderOpen className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Create your first project</h3>
          <p className="text-sm text-muted-foreground">
            Projects help you organize your brand management work
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">Project Name</Label>
          <Input
            id="name"
            placeholder="e.g., Brand Refresh 2024"
            {...register('name')}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Input
            id="description"
            placeholder="Brief description of your project goals"
            {...register('description')}
            disabled={isLoading}
          />
          {errors.description && (
            <p className="text-sm text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onSkip}
          >
            Skip for now
          </Button>
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Project
          </Button>
        </div>
      </form>

      <div className="p-4 rounded-lg bg-muted/50">
        <h4 className="font-medium mb-2">What you can do with projects:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Organize brand assets and guidelines</li>
          <li>• Track campaign performance</li>
          <li>• Collaborate with team members</li>
          <li>• Manage brand consistency</li>
        </ul>
      </div>
    </div>
  );
}

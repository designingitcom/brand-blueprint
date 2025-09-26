'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus } from 'lucide-react';
import {
  createProject,
  updateProject,
  type CreateProjectData,
  type UpdateProjectData,
} from '@/app/actions/projects';

// Project schema for validation
const projectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Name must be less than 100 characters'),
  slug: z.string().optional(),
  business_id: z.string().min(1, 'Business is required'),
  code: z.string().optional(),
  strategy_mode: z.enum(['custom', 'predefined', 'hybrid']).optional(),
  strategy_path_id: z.string().optional(),
  base_project_id: z.string().optional(),
  status: z.enum(['active', 'archived']).optional(),
  description: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  project?: {
    id?: string;
    name?: string;
    slug?: string;
    business_id?: string;
    code?: string;
    strategy_mode?: 'custom' | 'predefined' | 'hybrid';
    strategy_path_id?: string;
    base_project_id?: string;
    status?: 'active' | 'archived';
    description?: string;
  };
  businessId?: string;
  businesses?: Array<{ id: string; name: string; slug?: string }>;
  onSuccess?: (project: any) => void;
  trigger?: React.ReactNode;
}

const STRATEGY_MODES = [
  { value: 'custom', label: 'Custom Strategy' },
  { value: 'predefined', label: 'Predefined Strategy' },
  { value: 'hybrid', label: 'Hybrid Strategy' },
];

const PROJECT_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

export function ProjectForm({
  project,
  businessId,
  businesses = [],
  onSuccess,
  trigger,
}: ProjectFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hasManuallyEditedSlug, setHasManuallyEditedSlug] = useState(false);
  const isEditing = !!project?.id;

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name || '',
      slug: project?.slug || '',
      business_id: project?.business_id || businessId || '',
      code: project?.code || '',
      strategy_mode: project?.strategy_mode || 'custom',
      strategy_path_id: project?.strategy_path_id || '',
      base_project_id: project?.base_project_id || '',
      status: project?.status || 'active',
      description: project?.description || '',
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      let result;
      
      if (isEditing && project?.id) {
        // Update existing project
        const updateData: UpdateProjectData = {
          name: data.name,
          slug: data.slug || undefined,
          code: data.code || undefined,
          strategy_mode: data.strategy_mode,
          strategy_path_id: data.strategy_path_id || undefined,
          base_project_id: data.base_project_id || undefined,
          status: data.status,
        };
        
        result = await updateProject(project.id, updateData);
      } else {
        // Create new project
        const submitData: CreateProjectData = {
          name: data.name,
          slug: data.slug || undefined,
          business_id: data.business_id,
          code: data.code || undefined,
          strategy_mode: data.strategy_mode || 'custom',
          strategy_path_id: data.strategy_path_id || undefined,
          base_project_id: data.base_project_id || undefined,
          status: data.status || 'active',
        };

        result = await createProject(submitData);
      }

      if (result.error) {
        setError(result.error);
        return;
      }

      // Success!
      setOpen(false);
      form.reset();
      setHasManuallyEditedSlug(false);
      
      // Refresh the page to see changes
      if (isEditing) {
        window.location.reload();
      }
      
      onSuccess?.(result.data);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    // Only auto-update slug if user hasn't manually edited it
    if (!hasManuallyEditedSlug) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      form.setValue('slug', generatedSlug);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={newOpen => {
        setOpen(newOpen);
        if (!newOpen) {
          setHasManuallyEditedSlug(false);
          setError('');
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update project information and settings.'
              : 'Create a new project to manage business work and deliverables.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Project Name - Required */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Project Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter project name"
                        {...field}
                        onChange={e => {
                          field.onChange(e);
                          handleNameChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Business - Required */}
              <FormField
                control={form.control}
                name="business_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!!businessId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select business" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {businesses.map(business => (
                          <SelectItem key={business.id} value={business.id}>
                            {business.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Project Code */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., PROJ-001"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional internal project code
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Slug - Auto-generated */}
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Slug</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="project-slug"
                        {...field}
                        onChange={e => {
                          field.onChange(e);
                          setHasManuallyEditedSlug(true);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROJECT_STATUSES.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Strategy Mode */}
              <FormField
                control={form.control}
                name="strategy_mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Strategy Mode</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select strategy mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STRATEGY_MODES.map(mode => (
                          <SelectItem key={mode.value} value={mode.value}>
                            {mode.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of this project..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional description of the project scope and goals.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditing ? 'Update Project' : 'Create Project'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
'use client';

import { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, X } from 'lucide-react';
import { 
  Module,
  ModuleType, 
  ModuleCategory,
  ModuleFormData,
  createModule,
  updateModule,
  getModules
} from '@/app/actions/modules';

// Schema that matches the exact database structure
const moduleSchema = z.object({
  name: z
    .string()
    .min(1, 'Module name is required')
    .max(100, 'Name must be less than 100 characters'),
  slug: z.string().optional(),
  description: z.string().optional(),
  module_type: z.enum(['standard', 'onboarding', 'assessment', 'custom']),
  category: z.enum(['foundation', 'strategy', 'brand', 'marketing', 'operations', 'finance', 'technology']),
  is_active: z.boolean().optional(),
  prerequisites: z.array(z.string()).optional(),
});

type ModuleFormData = z.infer<typeof moduleSchema>;

interface ModuleFormProps {
  module?: {
    id?: string;
    name?: string;
    slug?: string;
    description?: string;
    module_type?: ModuleType;
    category?: ModuleCategory;
    is_active?: boolean;
    prerequisites?: string[];
  };
  onSuccess?: (module: any) => void;
  trigger?: React.ReactNode;
}

const MODULE_TYPES = [
  { value: 'standard' as const, label: 'Standard', description: 'Regular questionnaire module' },
  { value: 'onboarding' as const, label: 'Onboarding', description: 'Initial setup and configuration' },
  { value: 'assessment' as const, label: 'Assessment', description: 'Evaluation and scoring module' },
  { value: 'custom' as const, label: 'Custom', description: 'Specialized or unique functionality' },
];

const MODULE_CATEGORIES = [
  { value: 'foundation' as const, label: 'Foundation', description: 'Core setup and foundational processes' },
  { value: 'strategy' as const, label: 'Strategy', description: 'Strategic planning and direction' },
  { value: 'brand' as const, label: 'Brand', description: 'Brand identity and positioning' },
  { value: 'marketing' as const, label: 'Marketing', description: 'Marketing campaigns and channels' },
  { value: 'operations' as const, label: 'Operations', description: 'Business operations and processes' },
  { value: 'finance' as const, label: 'Finance', description: 'Financial planning and analysis' },
  { value: 'technology' as const, label: 'Technology', description: 'Technology infrastructure and tools' },
];

export function ModuleForm({
  module,
  onSuccess,
  trigger,
}: ModuleFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hasManuallyEditedSlug, setHasManuallyEditedSlug] = useState(false);
  const [prerequisites, setPrerequisites] = useState<string[]>(module?.prerequisites || []);
  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [availableModules, setAvailableModules] = useState<Module[]>([]);
  const isEditing = !!module?.id;

  const form = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      name: module?.name || '',
      slug: module?.slug || '',
      description: module?.description || '',
      module_type: module?.module_type || 'standard',
      category: module?.category || 'strategy',
      is_active: module?.is_active ?? true,
      prerequisites: module?.prerequisites || [],
    },
  });

  // Load available modules for prerequisites
  useEffect(() => {
    if (open) {
      const loadModules = async () => {
        try {
          const modules = await getModules();
          // Filter out the current module if editing
          const filteredModules = module?.id 
            ? modules.filter(m => m.id !== module.id)
            : modules;
          setAvailableModules(filteredModules);
        } catch (error) {
          console.error('Failed to load modules for prerequisites:', error);
        }
      };
      loadModules();
    }
  }, [open, module?.id]);

  const onSubmit = async (data: ModuleFormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      let result;
      
      // Prepare the final data with prerequisites from state
      const submitData = {
        ...data,
        prerequisites,
        slug: data.slug || generateSlug(data.name),
        is_active: data.is_active ?? true,
      };

      if (isEditing && module?.id) {
        // Update existing module
        result = await updateModule(module.id, submitData);
      } else {
        // Create new module
        result = await createModule(submitData);
      }

      if (result.error || !result.success) {
        setError(result.error || 'An error occurred');
        return;
      }

      // Success!
      setOpen(false);
      form.reset();
      setHasManuallyEditedSlug(false);
      setPrerequisites([]);
      setNewPrerequisite('');
      
      onSuccess?.(result.data);
      
      // Refresh to see changes
      if (isEditing) {
        window.location.reload();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (value: string) => {
    // Only auto-update slug if user hasn't manually edited it
    if (!hasManuallyEditedSlug) {
      const generatedSlug = generateSlug(value);
      form.setValue('slug', generatedSlug);
    }
  };

  const addPrerequisite = () => {
    if (newPrerequisite && !prerequisites.includes(newPrerequisite)) {
      setPrerequisites(prev => [...prev, newPrerequisite]);
      setNewPrerequisite('');
    }
  };

  const removePrerequisite = (prereqId: string) => {
    setPrerequisites(prev => prev.filter(p => p !== prereqId));
  };

  const getModuleName = (moduleId: string) => {
    const foundModule = availableModules.find(m => m.id === moduleId);
    return foundModule?.name || moduleId;
  };

  return (
    <Dialog
      open={open}
      onOpenChange={newOpen => {
        setOpen(newOpen);
        if (!newOpen) {
          setHasManuallyEditedSlug(false);
          setError('');
          setPrerequisites(module?.prerequisites || []);
          setNewPrerequisite('');
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Module
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Module' : 'Create New Module'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update module information and settings.'
              : 'Add a new learning module to organize questions and content.'
            }
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
              {/* Module Name - Required */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Module Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter module name"
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

              {/* Slug - Auto-generated */}
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Slug</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="module-slug"
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

              {/* Module Type - Required */}
              <FormField
                control={form.control}
                name="module_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Module Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select module type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MODULE_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category - Required */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MODULE_CATEGORIES.map(category => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Active Status */}
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value === 'true')} 
                      defaultValue={field.value ? 'true' : 'false'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
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
                        placeholder="Describe what this module covers and its purpose..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Prerequisites Section */}
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-3">Prerequisites</h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Select 
                      value={newPrerequisite} 
                      onValueChange={setNewPrerequisite}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select prerequisite module..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModules
                          .filter(m => !prerequisites.includes(m.id))
                          .map(module => (
                            <SelectItem key={module.id} value={module.id}>
                              {module.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addPrerequisite}
                      className="px-3"
                      disabled={!newPrerequisite}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {prerequisites.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {prerequisites.map((prereqId, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="pr-1"
                        >
                          {getModuleName(prereqId)}
                          <button
                            type="button"
                            onClick={() => removePrerequisite(prereqId)}
                            className="ml-2 hover:bg-destructive/20 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
              <Button type="submit" variant="default" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditing ? 'Update Module' : 'Create Module'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
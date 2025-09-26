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
import { Loader2 } from 'lucide-react';
import { 
  StrategySimple as Strategy,
  CreateStrategySimpleData as CreateStrategyData,
  createStrategySimple as createStrategy,
  updateStrategySimple as updateStrategy,
} from '@/app/actions/strategies-simple';

// Schema matching actual database structure (uses slug instead of code)
const strategySchema = z.object({
  name: z
    .string()
    .min(1, 'Strategy name is required')
    .max(100, 'Name must be less than 100 characters'),
  slug: z.string().optional(), // Auto-generated
  description: z.string().optional(),
  target_audience: z.string().optional(),
  is_active: z.boolean().optional(),
});

type StrategyFormValues = z.infer<typeof strategySchema>;

interface StrategyFormProps {
  strategy?: {
    id?: string;
    name?: string;
    slug?: string;
    description?: string;
    target_audience?: string;
    is_active?: boolean;
  };
  onSuccess?: (strategy: Strategy) => void;
  trigger?: React.ReactNode;
}

export function StrategyForm({
  strategy,
  onSuccess,
  trigger,
}: StrategyFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hasManuallyEditedCode, setHasManuallyEditedCode] = useState(false);
  const isEditing = !!strategy?.id;

  const form = useForm<StrategyFormValues>({
    resolver: zodResolver(strategySchema),
    defaultValues: {
      name: strategy?.name || '',
      slug: strategy?.slug || '',
      description: strategy?.description || '',
      target_audience: strategy?.target_audience || '',
      is_active: strategy?.is_active ?? true,
    },
  });

  // Auto-generate slug from name when creating new strategy
  useEffect(() => {
    if (!isEditing && !hasManuallyEditedCode) {
      const name = form.watch('name');
      if (name) {
        const generatedSlug = name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        form.setValue('slug', generatedSlug);
      }
    }
  }, [form.watch('name'), isEditing, hasManuallyEditedCode]);

  const onSubmit = async (data: StrategyFormValues) => {
    setIsSubmitting(true);
    setError('');

    try {
      let result;
      
      // Create strategy data with simple structure matching actual database
      const strategyData = {
        ...data,
        is_active: data.is_active ?? true,
        module_sequence: [], // Empty array initially
      };
      
      if (isEditing && strategy?.id) {
        result = await updateStrategy(strategy.id, strategyData);
      } else {
        result = await createStrategy(strategyData);
      }

      if (result.success && result.data) {
        onSuccess?.(result.data);
        setOpen(false);
        form.reset();
      } else {
        setError(result.error || 'Something went wrong');
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            {isEditing ? 'Edit Strategy' : 'Create Strategy'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Strategy' : 'Create New Strategy'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the strategy path details below.'
              : 'Create a new strategy path. You can add and organize modules after creation.'}
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
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Strategy Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Startup Launch Strategy" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Strategy Slug *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., startup-launch" 
                        {...field} 
                        onChange={(e) => {
                          setHasManuallyEditedCode(true);
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what this strategy path is designed for..."
                      className="resize-none"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_audience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Audience</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Early-stage startups, Established businesses" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status field only shown when editing */}
            {isEditing && (
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === 'active')}
                      defaultValue={field.value ? 'active' : 'inactive'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update Strategy' : 'Create Strategy'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
  createOrganization,
  updateOrganization,
  type CreateOrganizationData,
} from '@/app/actions/organizations';

// Schema that matches the exact database structure
const organizationSchema = z.object({
  name: z
    .string()
    .min(1, 'Organization name is required')
    .max(100, 'Name must be less than 100 characters'),
  slug: z.string().optional(),
  website: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  industry: z.string().optional(),
  company_size: z
    .enum(['startup', 'small', 'medium', 'large', 'enterprise'])
    .optional(),
  timezone: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'archived']).optional(),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

interface OrganizationFormProps {
  organization?: {
    id?: string;
    name?: string;
    slug?: string;
    website?: string;
    industry?: string;
    company_size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
    timezone?: string;
    status?: string;
  };
  onSuccess?: (organization: any) => void;
  trigger?: React.ReactNode;
}

const COMPANY_SIZES = [
  { value: 'startup', label: 'Startup (1-10 employees)' },
  { value: 'small', label: 'Small (11-50 employees)' },
  { value: 'medium', label: 'Medium (51-200 employees)' },
  { value: 'large', label: 'Large (201-1000 employees)' },
  { value: 'enterprise', label: 'Enterprise (1000+ employees)' },
];

const COMMON_INDUSTRIES = [
  'Technology',
  'Design & Creative',
  'Marketing & Advertising',
  'Consulting',
  'E-commerce',
  'Healthcare',
  'Financial Services',
  'Education',
  'Real Estate',
  'Manufacturing',
  'Media & Entertainment',
  'Non-profit',
  'Other',
];

const COMMON_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'UTC',
];

const ORGANIZATION_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'archived', label: 'Archived' },
];

export function OrganizationForm({
  organization,
  onSuccess,
  trigger,
}: OrganizationFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hasManuallyEditedSlug, setHasManuallyEditedSlug] = useState(false);
  const router = useRouter();
  const isEditing = !!organization?.id;

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: organization?.name || '',
      slug: organization?.slug || '', // Show current slug for editing
      website: organization?.website || '',
      industry: organization?.industry || '',
      company_size: organization?.company_size || undefined,
      timezone:
        organization?.timezone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      status: organization?.status || 'active',
    },
  });

  const onSubmit = async (data: OrganizationFormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      let result;

      if (isEditing && organization?.id) {
        // Update existing organization
        const updateData = {
          name: data.name,
          slug: data.slug || undefined,
          website: data.website || undefined,
          industry: data.industry || undefined,
          company_size: data.company_size || undefined,
          timezone: data.timezone || undefined,
          status: data.status || undefined,
        };

        result = await updateOrganization(organization.id, updateData);
      } else {
        // Create new organization
        const submitData: CreateOrganizationData = {
          name: data.name,
          slug: data.slug || undefined,
          website: data.website || undefined,
          industry: data.industry || undefined,
          company_size: data.company_size || undefined,
          timezone: data.timezone || undefined,
          status: data.status || 'active',
        };

        result = await createOrganization(submitData);
      }

      if (result.error) {
        setError(result.error);
        toast.error(
          `Failed to ${isEditing ? 'update' : 'create'} organization`,
          {
            description: result.error,
          }
        );
        return;
      }

      // Success!
      setOpen(false);
      form.reset();
      setHasManuallyEditedSlug(false);

      toast.success(
        `Organization ${isEditing ? 'updated' : 'created'} successfully!`,
        {
          description: isEditing
            ? `${result.data.name} has been updated.`
            : `${result.data.name} has been created and you've been added as the owner.`,
        }
      );

      // Refresh the page to see changes
      if (isEditing) {
        window.location.reload();
      } else {
        router.push('/organizations');
      }

      onSuccess?.(result.data);
    } catch (err) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      toast.error('Failed to create organization', {
        description: errorMessage,
      });
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
            New Organization
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Organization' : 'Create New Organization'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update organization information and settings.'
              : 'Add a new organization to manage businesses and projects.'}
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
              {/* Organization Name - Required */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Organization Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter organization name"
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
                        placeholder="organization-slug"
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

              {/* Website */}
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Industry */}
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COMMON_INDUSTRIES.map(industry => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Company Size */}
              <FormField
                control={form.control}
                name="company_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Size</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COMPANY_SIZES.map(size => (
                          <SelectItem key={size.value} value={size.value}>
                            {size.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Timezone */}
              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COMMON_TIMEZONES.map(tz => (
                          <SelectItem key={tz} value={tz}>
                            {tz.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        {ORGANIZATION_STATUSES.map(status => (
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
                ) : isEditing ? (
                  'Update Organization'
                ) : (
                  'Create Organization'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

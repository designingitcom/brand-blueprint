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
import { FileUpload } from '@/components/ui/file-upload';
import { Loader2, Plus } from 'lucide-react';
import {
  createBusiness,
  updateBusiness,
  type CreateBusinessData,
  type UpdateBusinessData,
} from '@/app/actions/businesses';
import { useRouter } from 'next/navigation';

// Schema that matches the exact database structure and onboarding Q1-Q6
const businessSchema = z.object({
  name: z
    .string()
    .min(1, 'Business name is required')
    .max(100, 'Name must be less than 100 characters'),
  slug: z.string().optional(),
  organization_id: z.string().min(1, 'Organization is required'),
  business_type: z.string().optional(),  // Q5: B2B, B2C, etc.
  industry: z.string().optional(),       // Q3: Industry
  description: z.string().optional(),    // Q7: Company description
  website_url: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),                   // Q2: Website URL
  website_context: z.string().optional(), // Q2: Website context
  linkedin_url: z
    .string()
    .url('Please enter a valid LinkedIn URL')
    .optional()
    .or(z.literal('')),                   // Q4: LinkedIn URL
  logo_url: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'archived']).optional(),
});

type BusinessFormData = z.infer<typeof businessSchema>;

interface BusinessFormProps {
  business?: {
    id?: string;
    name?: string;
    slug?: string;
    organization_id?: string;
    business_type?: string;
    industry?: string;
    description?: string;
    website_url?: string;
    website_context?: string;
    linkedin_url?: string;
    logo_url?: string;
    status?: string;
  };
  organizationId?: string;
  organizations?: Array<{ id: string; name: string; slug: string }>;
  onSuccess?: (business: any) => void;
  trigger?: React.ReactNode;
}


const BUSINESS_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'archived', label: 'Archived' },
];

export function BusinessForm({
  business,
  organizationId,
  organizations = [],
  onSuccess,
  trigger,
}: BusinessFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hasManuallyEditedSlug, setHasManuallyEditedSlug] = useState(false);
  const isEditing = !!business?.id;

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: business?.name || '',
      slug: business?.slug || '',
      organization_id: business?.organization_id || organizationId || '',
      business_type: business?.business_type || '',
      industry: business?.industry || '',
      description: business?.description || '',
      website_url: business?.website_url || '',
      website_context: business?.website_context || '',
      linkedin_url: business?.linkedin_url || '',
      logo_url: business?.logo_url || '',
      status: business?.status || 'active',
    },
  });

  const onSubmit = async (data: BusinessFormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      let result;
      
      if (isEditing && business?.id) {
        // Update existing business
        const updateData: UpdateBusinessData = {
          name: data.name,
          slug: data.slug || undefined,
          business_type: data.business_type || undefined,
          industry: data.industry || undefined,
          description: data.description || undefined,
          website_url: data.website_url || undefined,
          website_context: data.website_context || undefined,
          linkedin_url: data.linkedin_url || undefined,
          logo_url: data.logo_url || undefined,
          status: data.status || undefined,
        };

        result = await updateBusiness(business.id, updateData);
      } else {
        // Create new business
        const submitData: CreateBusinessData = {
          name: data.name,
          slug: data.slug || undefined,
          organization_id: data.organization_id,
          business_type: data.business_type || undefined,
          industry: data.industry || undefined,
          description: data.description || undefined,
          website_url: data.website_url || undefined,
          website_context: data.website_context || undefined,
          linkedin_url: data.linkedin_url || undefined,
          logo_url: data.logo_url || undefined,
          status: data.status || 'active',
        };

        result = await createBusiness(submitData);
      }

      if (result.error) {
        setError(result.error);
        return;
      }

      // Success!
      setOpen(false);
      form.reset();
      setHasManuallyEditedSlug(false);
      
      if (!isEditing && result.data) {
        // Redirect to onboarding wizard for new businesses
        router.push(`/en/onboarding?businessId=${result.data.id}`);
      } else if (isEditing) {
        // Refresh the page to see changes for edits
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
    <>
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
            New Business
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Business' : 'Create New Business'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update business information and settings.'
              : 'Add a new business unit to manage projects and teams.'
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
              {/* Business Name - Required */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Business Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter business name"
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

              {/* Organization - Required */}
              <FormField
                control={form.control}
                name="organization_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!!organizationId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select organization" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {organizations.map(org => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        placeholder="business-slug"
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


              {/* Website URL (Q2) */}
              <FormField
                control={form.control}
                name="website_url"
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

              {/* LinkedIn URL (Q4) */}
              <FormField
                control={form.control}
                name="linkedin_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn Profile</FormLabel>
                    <FormControl>
                      <Input placeholder="https://linkedin.com/company/example" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Industry (Q3) */}
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Technology, Healthcare" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Business Type (Q5) */}
              <FormField
                control={form.control}
                name="business_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="B2B">B2B</SelectItem>
                        <SelectItem value="B2C">B2C</SelectItem>
                        <SelectItem value="B2B2C">B2B2C</SelectItem>
                        <SelectItem value="Marketplace">Marketplace</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Logo Upload */}
              <FormField
                control={form.control}
                name="logo_url"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Business Logo</FormLabel>
                    <FormControl>
                      <FileUpload
                        value={field.value}
                        onChange={field.onChange}
                        bucket="business-logos"
                        accept="image/*"
                        maxSize={5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status - Only show when editing */}
              {isEditing && (
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
                          {BUSINESS_STATUSES.map(status => (
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
              )}

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of this business unit..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional description of what this business unit does.
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
                  isEditing ? 'Update Business' : 'Create Business'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>

    </>
  );
}

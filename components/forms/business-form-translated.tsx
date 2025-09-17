'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations, useLocale } from 'next-intl';
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
import { Loader2, Plus, Globe } from 'lucide-react';
import {
  createBusiness,
  updateBusiness,
  type CreateBusinessData,
  type UpdateBusinessData,
} from '@/app/actions/businesses';

// Example of properly translated form component
export function BusinessFormTranslated({
  business,
  organizationId,
  organizations,
  onSuccess,
  trigger,
}: BusinessFormProps) {
  const t = useTranslations();
  const locale = useLocale(); // Current UI language
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  // Create validation schema with translated messages
  const businessSchema = z.object({
    name: z
      .string()
      .min(1, t('businesses.form.validation.nameRequired'))
      .max(100, t('businesses.form.validation.nameMax')),
    organization_id: z.string().min(1, t('businesses.form.validation.orgRequired')),
    type: z.string().optional(),
    description: z.string().optional(),
    website: z
      .string()
      .url(t('businesses.form.validation.invalidUrl'))
      .optional()
      .or(z.literal('')),
    logo_url: z.string().optional(),
    status: z.enum(['active', 'inactive', 'suspended', 'archived']).optional(),
  });

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: business?.name || '',
      organization_id: business?.organization_id || organizationId || '',
      type: business?.type || '',
      description: business?.description || '',
      website: business?.website || '',
      logo_url: business?.logo_url || '',
      status: (business?.status as any) || 'active',
    },
  });

  const onSubmit = async (data: BusinessFormData) => {
    setError('');

    try {
      if (business?.id) {
        // Update existing business
        const result = await updateBusiness(business.id, {
          ...data,
          // Keep original content language
        });

        if (result.error) {
          setError(result.error);
        } else {
          setOpen(false);
          onSuccess?.(result.data);
        }
      } else {
        // Create new business with content language tracking
        const result = await createBusiness({
          ...data,
          content_language: locale, // Track the language of the content
        } as any);

        if (result.error) {
          setError(result.error);
        } else {
          setOpen(false);
          onSuccess?.(result.data);
        }
      }
    } catch (err) {
      setError(t('common.errors.generic'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('businesses.create')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {business ? t('businesses.edit') : t('businesses.create')}
          </DialogTitle>
          <DialogDescription>
            {t('businesses.form.description')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('businesses.form.name')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        placeholder={t('businesses.form.namePlaceholder')}
                      />
                      {/* Show language indicator */}
                      <Badge
                        variant="outline"
                        className="absolute right-2 top-2 text-xs"
                      >
                        {locale.toUpperCase()}
                      </Badge>
                    </div>
                  </FormControl>
                  <FormDescription>
                    {t('businesses.form.nameHelp')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {organizations && organizations.length > 0 && (
              <FormField
                control={form.control}
                name="organization_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('businesses.form.organization')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t('businesses.form.selectOrganization')}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            <div className="flex items-center gap-2">
                              {org.name}
                              {/* Show if org is in different language */}
                              {org.content_language &&
                               org.content_language !== locale && (
                                <Badge variant="outline" className="text-xs">
                                  {org.content_language.toUpperCase()}
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('businesses.form.type')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('businesses.form.selectType')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* Business types should also be translated */}
                      <SelectItem value="brand_design">
                        {t('businesses.types.brandDesign')}
                      </SelectItem>
                      <SelectItem value="digital_marketing">
                        {t('businesses.types.digitalMarketing')}
                      </SelectItem>
                      <SelectItem value="web_development">
                        {t('businesses.types.webDevelopment')}
                      </SelectItem>
                      <SelectItem value="consulting">
                        {t('businesses.types.consulting')}
                      </SelectItem>
                      <SelectItem value="other">
                        {t('businesses.types.other')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <div className="flex items-center justify-between">
                      {t('businesses.form.description')}
                      <Badge variant="outline" className="text-xs">
                        {t('businesses.form.contentLanguage', { lang: locale.toUpperCase() })}
                      </Badge>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t('businesses.form.descriptionPlaceholder')}
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormDescription>
                    {t('businesses.form.descriptionHelp')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('businesses.form.website')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="url"
                      placeholder="https://example.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={form.formState.isSubmitting}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {business ? t('common.save') : t('common.create')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Interface types
interface BusinessFormProps {
  business?: any;
  organizationId?: string;
  organizations?: Array<any>;
  onSuccess?: (business: any) => void;
  trigger?: React.ReactNode;
}

type BusinessFormData = {
  name: string;
  organization_id: string;
  type?: string;
  description?: string;
  website?: string;
  logo_url?: string;
  status?: string;
};
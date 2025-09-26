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
import { Loader2, Languages, Globe, Copy } from 'lucide-react';
import { cloneQuestionForTranslation, Question } from '@/app/actions/questions';

const cloneTranslateSchema = z.object({
  targetLanguage: z.string().min(1, 'Target language is required'),
  translatedTitle: z.string().min(1, 'Translated title is required'),
  translatedDefinition: z.string().optional(),
  translatedWhyItMatters: z.string().optional(),
  translatedSimpleTerms: z.string().optional(),
});

type CloneTranslateFormData = z.infer<typeof cloneTranslateSchema>;

interface CloneTranslateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  masterQuestion: Question;
  targetLanguage?: string;
  availableLanguages?: string[];
  onSuccess?: (clonedQuestion: any) => void;
}

const LANGUAGE_NAMES: { [key: string]: string } = {
  en: 'English',
  de: 'Deutsch (German)',
  es: 'Español (Spanish)',
  fr: 'Français (French)',
  it: 'Italiano (Italian)',
  pt: 'Português (Portuguese)',
  ru: 'Русский (Russian)',
  zh: '中文 (Chinese)',
  ja: '日本語 (Japanese)',
  ko: '한국어 (Korean)',
};

export function CloneTranslateModal({
  open,
  onOpenChange,
  masterQuestion,
  targetLanguage,
  availableLanguages = ['de', 'es', 'fr'],
  onSuccess,
}: CloneTranslateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<CloneTranslateFormData>({
    resolver: zodResolver(cloneTranslateSchema),
    defaultValues: {
      targetLanguage: targetLanguage || '',
      translatedTitle: '',
      translatedDefinition: '',
      translatedWhyItMatters: '',
      translatedSimpleTerms: '',
    },
  });

  const selectedLanguage = form.watch('targetLanguage');

  const onSubmit = async (data: CloneTranslateFormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      const result = await cloneQuestionForTranslation(
        masterQuestion.id,
        data.targetLanguage,
        data.translatedTitle,
        data.translatedDefinition || undefined,
        data.translatedWhyItMatters || undefined,
        data.translatedSimpleTerms || undefined
      );

      if (result.error) {
        setError(result.error);
        return;
      }

      // Success!
      onOpenChange(false);
      form.reset();
      onSuccess?.(result.data);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyOriginalText = () => {
    form.setValue('translatedTitle', masterQuestion.title);
    form.setValue('translatedDefinition', masterQuestion.definition || '');
    form.setValue('translatedWhyItMatters', masterQuestion.why_it_matters || '');
    form.setValue('translatedSimpleTerms', masterQuestion.simple_terms || '');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Clone Question for Translation
          </DialogTitle>
          <DialogDescription>
            Create a translated version of "{masterQuestion.title}" in another language.
            You can manually translate the content or start with the original text and edit.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Original Question Preview */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">
                  {(masterQuestion.content_language || 'en').toUpperCase()}
                </Badge>
                <span className="text-sm font-medium">Original Question</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={copyOriginalText}
                  className="ml-auto"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy as starting point
                </Button>
              </div>
              <h4 className="font-medium mb-1">{masterQuestion.title}</h4>
              {masterQuestion.definition && (
                <p className="text-sm text-muted-foreground">{masterQuestion.definition}</p>
              )}
            </div>

            {/* Target Language Selection */}
            <FormField
              control={form.control}
              name="targetLanguage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Language</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableLanguages.map(lang => (
                        <SelectItem key={lang} value={lang}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {lang.toUpperCase()}
                            </Badge>
                            <span>{LANGUAGE_NAMES[lang] || lang}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedLanguage && (
              <>
                {/* Translated Title */}
                <FormField
                  control={form.control}
                  name="translatedTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Translated Title
                        <Badge variant="outline" className="text-xs">
                          {selectedLanguage.toUpperCase()}
                        </Badge>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={`Enter title in ${LANGUAGE_NAMES[selectedLanguage] || selectedLanguage}...`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Translated Definition */}
                <FormField
                  control={form.control}
                  name="translatedDefinition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Translated Definition (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={`Enter definition in ${LANGUAGE_NAMES[selectedLanguage] || selectedLanguage}...`}
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The main explanation or definition of the question.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Why It Matters */}
                <FormField
                  control={form.control}
                  name="translatedWhyItMatters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Why It Matters (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={`Explain why this matters in ${LANGUAGE_NAMES[selectedLanguage] || selectedLanguage}...`}
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Explain the importance and context of this question.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Simple Terms */}
                <FormField
                  control={form.control}
                  name="translatedSimpleTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Simple Terms Explanation (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={`Explain in simple terms in ${LANGUAGE_NAMES[selectedLanguage] || selectedLanguage}...`}
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A simplified explanation for users who need clearer guidance.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Translation...
                  </>
                ) : (
                  <>
                    <Languages className="h-4 w-4 mr-2" />
                    Create Translation
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
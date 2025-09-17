'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { Question } from '@/app/actions/questions';
import { createClient } from '@/lib/supabase/client';

interface UsePreferredLanguageQuestionsOptions {
  moduleId?: string;
  questionType?: string;
  fallbackToMaster?: boolean;
}

interface UsePreferredLanguageQuestionsReturn {
  questions: Question[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getQuestionForLanguage: (masterId: string, preferredLanguage?: string) => Question | null;
}

export function usePreferredLanguageQuestions(
  options: UsePreferredLanguageQuestionsOptions = {}
): UsePreferredLanguageQuestionsReturn {
  const locale = useLocale();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { moduleId, questionType, fallbackToMaster = true } = options;

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();

      // Build the query to get questions with language preference
      let query = supabase
        .from('questions')
        .select(`
          *,
          modules:module_id (
            id,
            name,
            slug
          )
        `);

      // Apply filters
      if (moduleId) {
        query = query.eq('module_id', moduleId);
      }

      if (questionType) {
        query = query.eq('question_type', questionType);
      }

      // Get all questions (we'll filter for language preference after)
      const { data: allQuestions, error: questionsError } = await query
        .order('sort_order', { ascending: true });

      if (questionsError) {
        throw questionsError;
      }

      if (!allQuestions) {
        setQuestions([]);
        return;
      }

      // Process questions to prefer user's language
      const preferredQuestions: Question[] = [];
      const processedMasters = new Set<string>();

      // Group questions by master
      const questionGroups = new Map<string, Question[]>();

      allQuestions.forEach(q => {
        const masterId = q.is_master ? q.id : q.parent_question_id;
        if (masterId) {
          if (!questionGroups.has(masterId)) {
            questionGroups.set(masterId, []);
          }
          questionGroups.get(masterId)!.push(q);
        }
      });

      // For each group, select the preferred language version
      questionGroups.forEach((group, masterId) => {
        if (processedMasters.has(masterId)) return;

        // Try to find question in user's preferred language
        let selectedQuestion = group.find(q => q.content_language === locale);

        // If not found and fallback is enabled, use master
        if (!selectedQuestion && fallbackToMaster) {
          selectedQuestion = group.find(q => q.is_master);
        }

        // If still not found, use the first available
        if (!selectedQuestion) {
          selectedQuestion = group[0];
        }

        if (selectedQuestion) {
          // Add all language versions to the selected question for context
          const otherVersions = group.filter(q => q.id !== selectedQuestion!.id);

          preferredQuestions.push({
            ...selectedQuestion,
            language_versions: otherVersions,
          });
        }

        processedMasters.add(masterId);
      });

      // Sort by original sort order
      preferredQuestions.sort((a, b) => a.sort_order - b.sort_order);

      setQuestions(preferredQuestions);
    } catch (err) {
      console.error('Error fetching preferred language questions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  }, [locale, moduleId, questionType, fallbackToMaster]);

  // Function to get a specific question in preferred language
  const getQuestionForLanguage = useCallback(
    (masterId: string, preferredLanguage?: string): Question | null => {
      const targetLanguage = preferredLanguage || locale;

      // First, try to find among loaded questions
      const existingQuestion = questions.find(q => {
        if (q.is_master && q.id === masterId) {
          return q.content_language === targetLanguage;
        }
        return q.parent_question_id === masterId && q.content_language === targetLanguage;
      });

      if (existingQuestion) {
        return existingQuestion;
      }

      // Check language versions
      for (const question of questions) {
        if (question.language_versions) {
          const version = question.language_versions.find(
            v => v.content_language === targetLanguage &&
                 (v.parent_question_id === masterId || v.id === masterId)
          );
          if (version) return version;
        }
      }

      // Fallback to master if available
      if (fallbackToMaster) {
        return questions.find(q => q.is_master && q.id === masterId) || null;
      }

      return null;
    },
    [questions, locale, fallbackToMaster]
  );

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return {
    questions,
    loading,
    error,
    refresh: fetchQuestions,
    getQuestionForLanguage,
  };
}

// Utility function to use in server components
export async function getPreferredLanguageQuestion(
  masterId: string,
  preferredLanguage: string = 'en'
): Promise<Question | null> {
  try {
    const supabase = createClient();

    // Use the database function we created
    const { data, error } = await supabase.rpc('get_question_for_language', {
      p_master_question_id: masterId,
      p_preferred_language: preferredLanguage
    });

    if (error) {
      console.error('Error getting preferred language question:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Error getting preferred language question:', error);
    return null;
  }
}

// Hook for getting questions by module with language preference
export function useModuleQuestionsInLanguage(
  moduleId: string,
  preferredLanguage?: string
) {
  return usePreferredLanguageQuestions({
    moduleId,
    fallbackToMaster: true,
  });
}

// Hook for getting questions by type with language preference
export function useQuestionsByTypeInLanguage(
  questionType: string,
  preferredLanguage?: string
) {
  return usePreferredLanguageQuestions({
    questionType,
    fallbackToMaster: true,
  });
}
'use client';

import { useLocale } from 'next-intl';
import { translateContent } from '@/lib/services/translation-service';
import { useEffect, useState } from 'react';

/**
 * Hook for translating database content based on current locale
 */
export function useContentTranslation(content: string, context?: string) {
  const locale = useLocale();
  const [translatedContent, setTranslatedContent] = useState(content);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (!content || locale === 'en') {
      setTranslatedContent(content);
      return;
    }

    setIsTranslating(true);
    translateContent(content, locale, context)
      .then(translated => {
        setTranslatedContent(translated);
      })
      .catch(error => {
        console.error('Translation failed:', error);
        setTranslatedContent(content); // Fallback to original
      })
      .finally(() => {
        setIsTranslating(false);
      });
  }, [content, locale, context]);

  return {
    translatedContent,
    isTranslating,
    isTranslated: locale !== 'en' && translatedContent !== content,
  };
}

/**
 * Hook for translating multiple pieces of content
 */
export function useBatchTranslation(contents: string[], context?: string) {
  const locale = useLocale();
  const [translatedContents, setTranslatedContents] = useState(contents);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (!contents.length || locale === 'en') {
      setTranslatedContents(contents);
      return;
    }

    setIsTranslating(true);
    Promise.all(
      contents.map(content => translateContent(content, locale, context))
    )
      .then(translations => {
        setTranslatedContents(translations);
      })
      .catch(error => {
        console.error('Batch translation failed:', error);
        setTranslatedContents(contents); // Fallback to original
      })
      .finally(() => {
        setIsTranslating(false);
      });
  }, [contents, locale, context]);

  return {
    translatedContents,
    isTranslating,
    isTranslated: locale !== 'en',
  };
}
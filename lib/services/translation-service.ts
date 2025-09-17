import { openRouterService } from '@/lib/services/openrouter';

interface TranslationCache {
  [key: string]: string;
}

// Simple in-memory cache - in production, use Redis or similar
const translationCache: TranslationCache = {};

export interface TranslateOptions {
  text: string;
  fromLanguage?: string;
  toLanguage: string;
  context?: string;
}

/**
 * Translate text using OpenAI/OpenRouter
 */
export async function translateText({
  text,
  fromLanguage = 'English',
  toLanguage,
  context,
}: TranslateOptions): Promise<string> {
  // Generate cache key
  const cacheKey = `${text}:${fromLanguage}:${toLanguage}:${context || ''}`;

  // Check cache first
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  // Don't translate if target language is the same as source
  if (fromLanguage.toLowerCase() === toLanguage.toLowerCase() ||
      (fromLanguage === 'English' && toLanguage === 'en') ||
      (fromLanguage === 'German' && toLanguage === 'de')) {
    return text;
  }

  try {
    const targetLanguageName = getLanguageName(toLanguage);

    const prompt = `Translate the following text from ${fromLanguage} to ${targetLanguageName}.
${context ? `Context: This is ${context}. ` : ''}Keep the same tone and meaning. Only return the translation, no explanations.

Text to translate: "${text}"

Translation:`;

    const response = await openRouterService.sendMessage([
      {
        role: 'system',
        content: `You are a professional translator. Translate text accurately while preserving tone, context, and meaning. Only return the translated text, nothing else.`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ], 'openai/gpt-4o-mini', 0.1);

    const translation = response.choices[0]?.message?.content?.trim() || text;

    // Cache the translation
    translationCache[cacheKey] = translation;

    return translation;
  } catch (error) {
    console.error('Translation error:', error);
    // Return original text if translation fails
    return text;
  }
}

/**
 * Translate multiple texts in batch for better performance
 */
export async function translateBatch(
  texts: string[],
  toLanguage: string,
  context?: string
): Promise<string[]> {
  const translations = await Promise.all(
    texts.map(text =>
      translateText({ text, toLanguage, context })
    )
  );

  return translations;
}

/**
 * Get full language name from locale code
 */
function getLanguageName(locale: string): string {
  const languageMap: Record<string, string> = {
    en: 'English',
    de: 'German',
    es: 'Spanish',
    fr: 'French',
    it: 'Italian',
    pt: 'Portuguese',
    nl: 'Dutch',
    ru: 'Russian',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Chinese',
  };

  return languageMap[locale] || locale;
}

/**
 * Helper function to translate database content based on current locale
 */
export async function translateContent(
  content: string,
  locale: string,
  context?: string
): Promise<string> {
  // If locale is English or empty, return original
  if (!locale || locale === 'en') {
    return content;
  }

  return translateText({
    text: content,
    toLanguage: locale,
    context,
  });
}

/**
 * Clear translation cache (useful for development)
 */
export function clearTranslationCache(): void {
  Object.keys(translationCache).forEach(key => {
    delete translationCache[key];
  });
}
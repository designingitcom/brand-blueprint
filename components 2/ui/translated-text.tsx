'use client';

import { useContentTranslation } from '@/lib/hooks/use-translation';
import { cn } from '@/lib/utils';

interface TranslatedTextProps {
  children: string;
  context?: string;
  className?: string;
  element?: 'span' | 'p' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  showTranslationIndicator?: boolean;
}

/**
 * Component that automatically translates text content based on current locale
 */
export function TranslatedText({
  children,
  context,
  className,
  element: Element = 'span',
  showTranslationIndicator = false,
}: TranslatedTextProps) {
  const { translatedContent, isTranslating, isTranslated } = useContentTranslation(
    children,
    context
  );

  return (
    <Element
      className={cn(
        className,
        isTranslating && 'opacity-70 animate-pulse',
        showTranslationIndicator && isTranslated && 'relative'
      )}
      title={isTranslated ? `Original: ${children}` : undefined}
    >
      {translatedContent}
      {showTranslationIndicator && isTranslated && (
        <span
          className="ml-1 text-xs opacity-50"
          title="Auto-translated"
        >
          🌐
        </span>
      )}
    </Element>
  );
}

/**
 * Higher-order component to wrap existing components with translation
 */
export function withTranslation<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: {
    textProp?: keyof P;
    context?: string;
  }
) {
  return function TranslatedComponent(props: P) {
    const textProp = options?.textProp || 'children';
    const text = props[textProp] as string;

    const { translatedContent } = useContentTranslation(text, options?.context);

    const translatedProps = {
      ...props,
      [textProp]: translatedContent,
    };

    return <WrappedComponent {...translatedProps} />;
  };
}
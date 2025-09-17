'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Globe } from 'lucide-react';
import { locales } from '@/i18n/config';

const languageNames = {
  en: 'English',
  de: 'Deutsch',
} as const;

const flagEmojis = {
  en: '🇺🇸',
  de: '🇩🇪',
} as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('common');

  const switchLanguage = (newLocale: string) => {
    // Use next-intl's router for proper locale handling
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((availableLocale) => (
          <DropdownMenuItem
            key={availableLocale}
            onClick={() => switchLanguage(availableLocale)}
            className={
              locale === availableLocale
                ? 'bg-accent font-medium'
                : ''
            }
          >
            <span className="mr-2">
              {flagEmojis[availableLocale as keyof typeof flagEmojis]}
            </span>
            {languageNames[availableLocale as keyof typeof languageNames]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
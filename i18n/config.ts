import { Pathnames } from 'next-intl/navigation';

export const locales = ['en', 'de'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const pathnames = {
  '/': '/',
  '/dashboard': {
    en: '/dashboard',
    de: '/dashboard'
  },
  '/businesses': {
    en: '/businesses',
    de: '/unternehmen'
  },
  '/organizations': {
    en: '/organizations',
    de: '/organisationen'
  },
  '/projects': {
    en: '/projects',
    de: '/projekte'
  },
  '/admin': {
    en: '/admin',
    de: '/admin'
  }
} satisfies Pathnames<typeof locales>;

export const localePrefix = 'always';

export type AppPathnames = keyof typeof pathnames;
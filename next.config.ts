import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    // Expose SKIP_LINDY_IN_DEV to client components
    SKIP_LINDY_IN_DEV: process.env.SKIP_LINDY_IN_DEV || 'true',
  },
};

export default withNextIntl(nextConfig);

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import prettierPlugin from 'eslint-plugin-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals'),
  ...compat.extends('prettier'),
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      'react/no-unescaped-entities': 'off',
    },
  },
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      '.hive-mind/**',
      '.swarm/**',
      '.claude-flow/**',
      '.claude/**',
      '.cursor/**',
      '.taskmaster/**',
      'memory/**',
      'scripts/**',
      'supabase/migrations/**',
      'claude-flow*',
    ],
  },
];

export default eslintConfig;

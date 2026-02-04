import js from '@eslint/js';
import tanstackQuery from '@tanstack/eslint-plugin-query';
import pluginRouter from '@tanstack/eslint-plugin-router';
import noRelativeImports from 'eslint-plugin-no-relative-import-paths';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  pluginRouter.configs['flat/recommended'],
  {
    ignores: [
      'dist',
      '.yarn',
      '.vite',
      '.tanstack',
      'public/mockServiceWorker.js',
      'src/mocks/**',
      'src/api/services/**',
      'src/api/create-api-client.ts',
      'src/api/index.ts',
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@tanstack/query': tanstackQuery,
      'no-relative-import-paths': noRelativeImports,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-relative-import-paths/no-relative-import-paths': [
        'error',
        {
          allowSameFolder: true,
          allowedDepth: 1,
          rootDir: 'src',
          prefix: '',
        },
      ],
    },
  },
  {
    files: ['src/routes/**'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
);

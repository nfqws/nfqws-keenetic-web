import fs from 'node:fs';
import tsrConfig from './tsr.config.json';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const APP_VERSION = fs.readFileSync('../VERSION', 'utf8').trim();

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: './',
  define: {
    'process.env.APP_VERSION': JSON.stringify(APP_VERSION),
  },
  server:
    mode === 'staging'
      ? {
          proxy: {
            '/index.php': {
              target: 'http://192.168.0.1:90',
              changeOrigin: true,
            },
          },
        }
      : {},
  build: {
    rollupOptions: {
      output: {
        entryFileNames:
          mode !== 'production'
            ? 'assets/[name].js'
            : 'assets/[name].[hash].js',
        chunkFileNames:
          mode !== 'production'
            ? 'assets/[name].js'
            : 'assets/[name].[hash].js',
        assetFileNames:
          mode !== 'production'
            ? 'assets/[name][extname]'
            : 'assets/[name].[hash][extname]',
      },
    },
    sourcemap: mode !== 'production',
  },
  plugins: [
    tanstackRouter({
      ...tsrConfig,
      target: tsrConfig.target as 'react',
      quoteStyle: tsrConfig.quoteStyle as 'single',
      autoCodeSplitting: true,
    }),
    tsconfigPaths(),
    react(),
    {
      name: 'delete-mock',
      writeBundle() {
        fs.rmSync('dist/mockServiceWorker.js');
      },
    },
  ],
}));

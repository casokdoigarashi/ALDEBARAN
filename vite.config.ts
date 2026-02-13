import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        middlewareMode: false,
        allowedHosts: 'all',
        proxy: {
          '/api': {
            target: 'http://localhost:8000',
            changeOrigin: true,
          },
        },
      },
      plugins: [react()],
      preview: {
        port: 3001,
        host: '0.0.0.0',
        allowedHosts: 'all',
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.PUBLIC_URL': JSON.stringify('/')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      ssr: false
    };
});

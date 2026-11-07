import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'exclude-duplicate-aistudio-assets-from-dist',
        closeBundle() {
          const dupDir = path.resolve(__dirname, 'dist', 'assets', 'aistudio');
          if (fs.existsSync(dupDir)) {
            for (const entry of fs.readdirSync(dupDir)) {
              if (entry !== 'Golden_Graduation_Cap_Emblem_on_Indigo_Gradient_c53b7e46.png') {
                fs.rmSync(path.join(dupDir, entry), { recursive: true, force: true });
              }
            }
          }
        },
      },
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png', 'pwa-maskable-512x512.png', 'assets/aistudio/Golden_Graduation_Cap_Emblem_on_Indigo_Gradient_c53b7e46.png'],
        manifest: {
          id: '/',
          name: 'Elimika Tanzania | Past Papers, TIE Books, Syllabus & Moha AI',
          short_name: 'Elimika',
          description: 'Simple, fast access to Tanzanian past examination papers, marking schemes, TIE books, official syllabuses, and Moha AI for Standard 1–7 and Form 1–6.',
          theme_color: '#1d4ed8',
          background_color: '#0f172a',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          categories: ['education', 'books', 'productivity'],
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,
          maximumFileSizeToCacheInBytes: 12 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
          type: 'module',
        },
      }),
    ],
    define: {
      __CS_F5_RAW_HTMLS__: JSON.stringify(
        [
          'computer_f5_bank_of_qns_1950aee2.html',
          'computer_f5_bank_of_ques_87e7b403.html',
          'computer_f5_bank_of_questions_1e5f4d7b.html',
          'computer_f5_bank_8d71db45.html',
        ].map((f) => {
          const p = path.resolve(__dirname, 'public', 'assets', 'aistudio', f);
          return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
        })
      ),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: false,
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

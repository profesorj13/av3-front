import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Alizia',
        short_name: 'Alizia',
        description: 'Asistente de planificacion educativa',
        theme_color: '#735FE3',
        background_color: '#f0eef9',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/orb-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});


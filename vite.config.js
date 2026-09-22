import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import Sitemap from 'vite-plugin-sitemap';

// https://vite.dev/config/
export default defineConfig({
  // Base relative pour la compatibilité avec GitHub Pages (modifiée pour domaine personnalisé)
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    Sitemap({
      hostname: 'https://www.o-girador.com',
      dynamicRoutes: ['/', '/a-propos', '/tutos']
    })
  ],
  server: {
    port: 3000,
    open: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
            return 'vendor-firebase';
          }
          if (
            id.includes('node_modules/lucide-react') ||
            id.includes('node_modules/leaflet') ||
            id.includes('node_modules/react-leaflet')
          ) {
            return 'vendor-ui';
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('presets_dump.json')) {
            return 'presets-dump';
          }
        }
      }
    }
  }
});

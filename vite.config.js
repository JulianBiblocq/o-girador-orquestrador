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
      hostname: 'https://o-girador.com',
      dynamicRoutes: ['/', '/a-propos', '/tutos']
    })
  ],
  server: {
    port: 3000,
    open: true
  }
});

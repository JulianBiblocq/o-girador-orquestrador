import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  // Base relative pour la compatibilité avec GitHub Pages (/o-girador-orquestrador/ ou domaine personnalisé)
  base: '/o-girador-orquestrador/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    open: true
  }
});

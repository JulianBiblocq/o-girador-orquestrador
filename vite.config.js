import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import Sitemap from 'vite-plugin-sitemap';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8'));

// Plugin de génération automatique de version.json pour le cache-busting mobile
function versionJsonPlugin() {
  return {
    name: 'generate-version-json',
    buildStart() {
      const versionData = {
        version: packageJson.version,
        buildTime: Date.now()
      };
      const versionPath = path.resolve(__dirname, 'public/version.json');
      try {
        fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2));
      } catch (err) {
        console.warn('[versionJsonPlugin] Impossible d\'écrire version.json :', err);
      }
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  // Base relative pour la compatibilité avec GitHub Pages (modifiée pour domaine personnalisé)
  base: '/',
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version)
  },
  plugins: [
    react(),
    tailwindcss(),
    versionJsonPlugin(),
    Sitemap({
      hostname: 'https://www.o-girador.com',
      dynamicRoutes: ['/', '/a-propos', '/tutos']
    })
  ],
  server: {
    port: 5170,
    strictPort: true, // Interdit à Vite de basculer silencieusement sur un autre port
    host: '0.0.0.0',  // Permet l'accès réseau local (tablette / mobile)
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

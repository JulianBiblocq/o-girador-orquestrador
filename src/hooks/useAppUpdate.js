import { useEffect } from 'react';

export const CURRENT_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.1';

/**
 * Hook de détection de version et purge de cache PWA pour Orquestrad'Or.
 * Désactivé en développement. En production, sonde /version.json au montage
 * et lors du retour au premier plan de l'onglet.
 */
export function useAppUpdate() {
  useEffect(() => {
    // 🛡️ Garde de développement : ne pas sonder en local
    if (import.meta.env.DEV) return;

    let hasChecked = false;

    const purgeAndReload = async () => {
      if ('caches' in window) {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        } catch (_) {}
      }
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((r) => r.unregister()));
        } catch (_) {}
      }
      window.location.reload();
    };

    const displayUpdateNotification = (newVersion) => {
      const existingBanner = document.getElementById('ogirador-app-update-banner');
      if (existingBanner) return;

      const banner = document.createElement('div');
      banner.id = 'ogirador-app-update-banner';
      banner.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] bg-[#1c1613] text-[#fdf6e7] px-4 py-3 rounded-2xl border-2 border-amber-500 shadow-2xl flex items-center gap-3 font-cordel text-xs animate-in fade-in slide-in-from-bottom-2';
      banner.innerHTML = `
        <span class="text-base">✨</span>
        <div>
          <strong class="text-amber-400 block font-bold">Mise à jour disponible (${newVersion})</strong>
          <span class="text-stone-300 text-[11px]">Rechargez pour bénéficier des dernières améliorations.</span>
        </div>
        <div class="flex items-center gap-1.5 ml-2">
          <button id="ogirador-update-btn" class="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg transition-colors cursor-pointer text-xs">
            Mettre à jour
          </button>
          <button id="ogirador-update-dismiss" class="p-1 text-stone-400 hover:text-stone-200 cursor-pointer">
            ✕
          </button>
        </div>
      `;

      document.body.appendChild(banner);

      document.getElementById('ogirador-update-btn')?.addEventListener('click', () => {
        banner.remove();
        purgeAndReload();
      });

      document.getElementById('ogirador-update-dismiss')?.addEventListener('click', () => {
        banner.remove();
      });
    };

    const checkVersion = async () => {
      if (hasChecked || !navigator.onLine) return;
      hasChecked = true;
      setTimeout(() => { hasChecked = false; }, 60_000);

      try {
        const response = await fetch(`/version.json?t=${Date.now()}`);
        if (!response.ok) return;

        const data = await response.json();
        if (data && typeof data === 'object' && data.version) {
          const latestVersion = String(data.version);
          if (latestVersion !== CURRENT_VERSION) {
            const sessionKey = `update_prompted_${latestVersion}`;
            if (sessionStorage.getItem(sessionKey)) return;
            sessionStorage.setItem(sessionKey, 'true');

            displayUpdateNotification(latestVersion);
          }
        }
      } catch (_) {}
    };

    checkVersion();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', checkVersion);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', checkVersion);
      const banner = document.getElementById('ogirador-app-update-banner');
      if (banner) banner.remove();
    };
  }, []);
}

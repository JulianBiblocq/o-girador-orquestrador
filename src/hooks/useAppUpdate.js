import { useEffect } from 'react';

export const CURRENT_VERSION = '1.0.2';

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

            const shouldUpdate = window.confirm(
              "Une nouvelle version de O Girador Orquestrador est disponible. Recharger pour mettre à jour ?"
            );
            if (shouldUpdate) {
              if ('caches' in window) {
                try {
                  const keys = await caches.keys();
                  await Promise.all(keys.map(k => caches.delete(k)));
                } catch (_) {}
              }
              if ('serviceWorker' in navigator) {
                try {
                  const registrations = await navigator.serviceWorker.getRegistrations();
                  await Promise.all(registrations.map(r => r.unregister()));
                } catch (_) {}
              }
              window.location.reload();
            }
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
    };
  }, []);
}

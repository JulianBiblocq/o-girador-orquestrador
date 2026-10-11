import { useState, useEffect } from 'react';
import { 
  DEFAULT_HUB_DISPLAY_SETTINGS, 
  getCachedHubDisplaySettings, 
  subscribeToHubDisplaySettings, 
  updateHubDisplaySettings 
} from '../services/hubSettingsService';

/**
 * Hook React pour consommer et modifier la configuration d'affichage de la vitrine
 * Évite les flashs visuels en s'initialisant immédiatement avec le cache local
 * tout en écoutant en temps réel les mises à jour Firestore de settings/hub_display.
 */
export function useHubDisplaySettings() {
  const [settings, setSettings] = useState(() => getCachedHubDisplaySettings());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = subscribeToHubDisplaySettings((newSettings) => {
      if (isMounted) {
        setSettings(newSettings);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const updateSettings = async (newSettings) => {
    // Mise à jour optimiste immédiate
    setSettings((prev) => ({ ...prev, ...newSettings }));
    return await updateHubDisplaySettings(newSettings);
  };

  return {
    settings,
    loading,
    updateSettings,
    showPricing: !!settings?.showPricing,
    showAddons: !!settings?.showAddons,
    showTutorials: !!settings?.showTutorials
  };
}

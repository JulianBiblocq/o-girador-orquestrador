import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase.js';

export const HUB_DISPLAY_DOC_ID = 'hub_display';

export const DEFAULT_HUB_DISPLAY_SETTINGS = {
  showPricing: false,
  showAddons: false,
  showTutorials: false
};

const CACHE_KEY = 'ogirador_hub_display_settings';

/**
 * Récupère les paramètres mis en cache local pour éviter les flashs visuels
 */
export function getCachedHubDisplaySettings() {
  if (typeof window === 'undefined') return DEFAULT_HUB_DISPLAY_SETTINGS;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      return { ...DEFAULT_HUB_DISPLAY_SETTINGS, ...JSON.parse(cached) };
    }
  } catch (e) {
    console.warn('[hubSettingsService] Erreur lecture cache local :', e);
  }
  return DEFAULT_HUB_DISPLAY_SETTINGS;
}

/**
 * Met en cache local les paramètres d'affichage
 */
function setCachedHubDisplaySettings(settings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('[hubSettingsService] Erreur écriture cache local :', e);
  }
}

/**
 * Récupère le document de configuration globale settings/hub_display
 */
export async function getHubDisplaySettings() {
  try {
    const docRef = doc(db, 'settings', HUB_DISPLAY_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = { ...DEFAULT_HUB_DISPLAY_SETTINGS, ...snap.data() };
      setCachedHubDisplaySettings(data);
      return data;
    }
    // Si le document n'existe pas encore, on retourne les valeurs par défaut
    return DEFAULT_HUB_DISPLAY_SETTINGS;
  } catch (error) {
    console.error('[hubSettingsService] Erreur lors de la récupération des paramètres vitrine :', error);
    return getCachedHubDisplaySettings();
  }
}

/**
 * Met à jour le document de configuration settings/hub_display
 * @param {Object} newSettings - { showPricing?: boolean, showAddons?: boolean, showTutorials?: boolean }
 */
export async function updateHubDisplaySettings(newSettings) {
  try {
    const docRef = doc(db, 'settings', HUB_DISPLAY_DOC_ID);
    const payload = {
      ...newSettings,
      updatedAt: new Date().toISOString()
    };
    await setDoc(docRef, payload, { merge: true });
    setCachedHubDisplaySettings({ ...getCachedHubDisplaySettings(), ...payload });
    return true;
  } catch (error) {
    console.error('[hubSettingsService] Erreur lors de la sauvegarde des paramètres vitrine :', error);
    throw error;
  }
}

/**
 * Souscrit en temps réel aux changements du document settings/hub_display
 * @param {Function} callback - Appelée à chaque mise à jour avec les paramètres normalisés
 * @returns {Function} Fonction de désinscription (unsubscribe)
 */
export function subscribeToHubDisplaySettings(callback) {
  try {
    const docRef = doc(db, 'settings', HUB_DISPLAY_DOC_ID);
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = { ...DEFAULT_HUB_DISPLAY_SETTINGS, ...snapshot.data() };
          setCachedHubDisplaySettings(data);
          callback(data);
        } else {
          callback(DEFAULT_HUB_DISPLAY_SETTINGS);
        }
      },
      (error) => {
        console.error('[hubSettingsService] Erreur snapshot settings/hub_display :', error);
        callback(getCachedHubDisplaySettings());
      }
    );
  } catch (err) {
    console.error('[hubSettingsService] Exception écoute settings/hub_display :', err);
    callback(getCachedHubDisplaySettings());
    return () => {};
  }
}

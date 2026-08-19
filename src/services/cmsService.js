import tarifsData from '../data/tarifs.json';

const STORAGE_KEYS = {
  HERO_METRICS: 'ogirador_cms_hero',
  PRICING_PLANS: 'ogirador_cms_pricing',
};

// Par défaut, si rien n'est dans le localStorage, on retourne null
// Le composant devra utiliser ses traductions par défaut.
export const fetchHeroMetrics = async () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HERO_METRICS);
    if (data) return JSON.parse(data);
    return null; // Fallback to translations in the component
  } catch (error) {
    console.error("Error fetching hero metrics:", error);
    return null;
  }
};

export const saveHeroMetrics = async (metrics) => {
  try {
    localStorage.setItem(STORAGE_KEYS.HERO_METRICS, JSON.stringify(metrics));
    return true;
  } catch (error) {
    console.error("Error saving hero metrics:", error);
    return false;
  }
};

export const fetchPricingPlans = async () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRICING_PLANS);
    if (data) return JSON.parse(data);
    // Fallback to tarifsData.plans
    return tarifsData.plans;
  } catch (error) {
    console.error("Error fetching pricing plans:", error);
    return tarifsData.plans;
  }
};

export const savePricingPlans = async (plans) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PRICING_PLANS, JSON.stringify(plans));
    return true;
  } catch (error) {
    console.error("Error saving pricing plans:", error);
    return false;
  }
};

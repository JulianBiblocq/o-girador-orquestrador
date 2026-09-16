/**
 * Matrice des Paliers d'Axé pour le partage de ressources dans le Terreiro.
 * Définit les coûts d'importation, récompenses de première publication et dividendes.
 */

// Configuration immuable des 5 paliers d'Axé
export const AXE_TIERS = Object.freeze({
  varal: Object.freeze({
    id: 'varal',
    label: 'Varal (Fiche culturelle, toada, chant)',
    cost: 5,
    initialReward: 10,
    dividend: 2
  }),
  lutherie: Object.freeze({
    id: 'lutherie',
    label: 'Lutherie (Tuto, plan de fabrication)',
    cost: 15,
    initialReward: 20,
    dividend: 5
  }),
  sequence: Object.freeze({
    id: 'sequence',
    label: 'Séquence (Rythme ou chorégraphie simple)',
    cost: 20,
    initialReward: 25,
    dividend: 5
  }),
  combo: Object.freeze({
    id: 'combo',
    label: 'Combo (Rythme + Chorégraphie coordonnée)',
    cost: 35,
    initialReward: 40,
    dividend: 10
  }),
  bundle: Object.freeze({
    id: 'bundle',
    label: 'Bundle (Pack pédagogique complet)',
    cost: 50,
    initialReward: 60,
    dividend: 15
  })
});

// Liste des identifiants valides de paliers
export const VALID_TIER_KEYS = Object.freeze(Object.keys(AXE_TIERS));

/**
 * Vérifie si une clé de palier est valide.
 * @param {string} tier - Identifiant du palier.
 * @returns {boolean}
 */
export function isValidTier(tier) {
  return typeof tier === 'string' && Boolean(AXE_TIERS[tier]);
}

/**
 * Récupère la configuration immuable d'un palier.
 * @param {string} tier - Identifiant du palier.
 * @returns {object} Configuration du palier.
 * @throws {Error} Si le palier est inconnu.
 */
export function getTierConfig(tier) {
  if (!isValidTier(tier)) {
    throw new Error(`Palier d'Axé inconnu : "${tier}". Valeurs autorisées : ${VALID_TIER_KEYS.join(', ')}`);
  }
  return AXE_TIERS[tier];
}

/**
 * Calcule la récompense initiale lors de la première publication d'une ressource.
 * @param {string} tier - Identifiant du palier.
 * @returns {number} Points d'Axé octroyés.
 */
export function calculateReward(tier) {
  return getTierConfig(tier).initialReward;
}

/**
 * Calcule le coût d'importation d'une ressource (axeValue).
 * @param {string} tier - Identifiant du palier.
 * @returns {number} Points d'Axé requis pour importer la ressource.
 */
export function calculateImportCost(tier) {
  return getTierConfig(tier).cost;
}

/**
 * Calcule le dividende reversé à l'auteur lors de chaque import par un tiers.
 * @param {string} tier - Identifiant du palier.
 * @returns {number} Points d'Axé reversés à l'auteur.
 */
export function calculateDividend(tier) {
  return getTierConfig(tier).dividend;
}

/**
 * Déduit un palier par défaut selon la collection ou la typologie de la ressource.
 * @param {string} collectionName - Nom de la collection ('rhythms', 'choreographies', 'documents').
 * @param {string} [itemType] - Type de document facultatif.
 * @returns {string} Palier recommandé.
 */
export function inferDefaultTier(collectionName, itemType = '') {
  const normType = String(itemType).toLowerCase();
  
  if (collectionName === 'documents' || collectionName === 'instrument_models') {
    if (normType.includes('fabrication') || collectionName === 'instrument_models') {
      return 'lutherie';
    }
    return 'varal';
  }

  if (collectionName === 'rhythms' || collectionName === 'choreographies' || collectionName === 'presets') {
    if (normType.includes('combo')) return 'combo';
    if (normType.includes('bundle')) return 'bundle';
    return 'sequence';
  }

  return 'varal';
}

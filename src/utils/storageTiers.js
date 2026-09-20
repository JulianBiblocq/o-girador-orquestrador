/**
 * Configuration des Paliers de Stockage & Utilitaires de Conversion
 * Système de suivi d'espace disque pour les associations O Girador.
 */

// Constantes immuables des paliers de stockage en octets
export const STORAGE_TIERS = Object.freeze({
  STARTER: 100 * 1024 * 1024,              // 100 Mo
  STANDARD: 1024 * 1024 * 1024,             // 1 Go
  PRO: 5 * 1024 * 1024 * 1024,              // 5 Go
  ILLIMITE: 25 * 1024 * 1024 * 1024,        // 25 Go
  ILLIMITÉ: 25 * 1024 * 1024 * 1024         // Alias avec accent
});

// Constantes unitaires individuelles
export const STARTER_STORAGE = STORAGE_TIERS.STARTER;
export const STANDARD_STORAGE = STORAGE_TIERS.STANDARD;
export const PRO_STORAGE = STORAGE_TIERS.PRO;
export const UNLIMITED_STORAGE = STORAGE_TIERS.ILLIMITE;
export const ILLIMITE_STORAGE = STORAGE_TIERS.ILLIMITE;

/**
 * Formate un nombre d'octets en chaîne lisible (Mo ou Go).
 * @param {number} bytes - Quantité d'octets à formater.
 * @param {number} [decimals=1] - Nombre de décimales pour les Go.
 * @returns {string} Chaîne formatée (ex: "45 Mo", "1.2 Go").
 */
export function formatStorageBytes(bytes, decimals = 1) {
  if (bytes === null || bytes === undefined || isNaN(bytes) || bytes <= 0) {
    return '0 Mo';
  }

  const numBytes = Number(bytes);
  const oneMo = 1024 * 1024;
  const oneGo = 1024 * 1024 * 1024;

  if (numBytes < oneGo) {
    const mo = numBytes / oneMo;
    // Si la valeur est entière ou >= 10, pas de décimale inutile
    if (mo >= 10 || Math.round(mo * 10) % 10 === 0) {
      return `${Math.round(mo)} Mo`;
    }
    return `${mo.toFixed(1)} Mo`;
  }

  const go = numBytes / oneGo;
  // Si le nombre de Go est rond (ex: 1.0 Go -> 1 Go)
  if (Math.round(go * 10) % 10 === 0) {
    return `${Math.round(go)} Go`;
  }
  return `${go.toFixed(decimals)} Go`;
}

/**
 * Calcule le pourcentage de remplissage du quota de stockage.
 * @param {number} usedBytes - Octets consommés.
 * @param {number} quotaBytes - Quota total alloué en octets.
 * @returns {number} Pourcentage entre 0 et 100 (arrondi).
 */
export function getStorageUsagePercent(usedBytes, quotaBytes) {
  if (!quotaBytes || Number(quotaBytes) <= 0) return 0;
  const used = Math.max(0, Number(usedBytes) || 0);
  const ratio = (used / Number(quotaBytes)) * 100;
  return Math.min(100, Math.round(ratio));
}

/**
 * Déduit le quota de stockage initial selon les forfaits débloqués.
 * @param {Array<string>} [unlockedPacks=[]] - Liste des identifiants de packs.
 * @returns {number} Quota en octets (25 Go pour intégrale, 5 Go pour gestion, sinon 1 Go).
 */
export function inferQuotaFromPacks(unlockedPacks = []) {
  if (!Array.isArray(unlockedPacks) || unlockedPacks.length === 0) {
    return STORAGE_TIERS.STANDARD;
  }
  const packsLower = unlockedPacks.map(p => String(p).toLowerCase());
  if (packsLower.some(p => p.includes('integrale'))) {
    return STORAGE_TIERS.ILLIMITE; // 25 Go
  }
  if (packsLower.some(p => p.includes('gestion'))) {
    return STORAGE_TIERS.PRO; // 5 Go
  }
  return STORAGE_TIERS.STANDARD; // 1 Go
}

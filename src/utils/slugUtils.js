/**
 * Utilitaires de normalisation et slugification pour les identifiants techniques.
 */

/**
 * Convertit un nom d'association ou groupe en identifiant technique Firestore canonique :
 * minuscules, suppression des diacritiques (accents) et suppression des caractères non alphanumériques.
 * Ex : "Samb'à Bulles" -> "sambabulles"
 * 
 * @param {string} text - Le nom ou texte source
 * @returns {string} - L'identifiant slugifié normalisé
 */
export function slugifyAssociationId(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents et diacritiques
    .replace(/[^a-z0-9]/g, '');      // Supprime tout ce qui n'est pas alphanumérique
}

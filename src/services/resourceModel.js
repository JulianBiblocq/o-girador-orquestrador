/**
 * Modèle de données standardisé pour les ressources du Terreiro
 * Collections concernées : 'rhythms', 'choreographies', 'documents'.
 */

import { calculateImportCost, inferDefaultTier, isValidTier } from '../utils/axeTiers.js';

// Statuts éditoriaux autorisés
export const PUBLICATION_STATUSES = Object.freeze([
  'draft',
  'pending_review',
  'published',
  'needs_revision',
  'rejected'
]);

/**
 * Normalise l'objet de revue éditoriale.
 * @param {object|null} review - Données de révision.
 * @returns {object|null}
 */
export function formatEditorialReview(review) {
  if (!review || typeof review !== 'object') return null;

  return {
    reviewedAt: review.reviewedAt || new Date().toISOString(),
    reviewerRole: String(review.reviewerRole || 'admin'),
    reasonCategory: review.reasonCategory ? String(review.reasonCategory) : null,
    adminMessage: review.adminMessage ? String(review.adminMessage) : '',
    suggestedTier: review.suggestedTier && isValidTier(review.suggestedTier) ? review.suggestedTier : null,
    requiresAction: Boolean(review.requiresAction)
  };
}

/**
 * Prépare le schéma complet d'une ressource lors de sa création.
 * @param {object} rawData - Propriétés métier du document.
 * @param {object} authorInfo - Informations sur l'auteur ({ authorGroupId, authorName }).
 * @param {object} [options] - Options supplémentaires (tier, originalSourceId, isRemix, etc.).
 * @returns {object} Document prêt à être persisté.
 */
export function buildResourceCreateData(rawData = {}, authorInfo = {}, options = {}) {
  const authorGroupId = String(authorInfo.authorGroupId || rawData.authorGroupId || '').trim();
  if (!authorGroupId) {
    throw new Error("Le champ 'authorGroupId' est obligatoire et immuable.");
  }

  const authorName = String(authorInfo.authorName || rawData.authorName || 'Association Anonyme').trim();
  const rawTier = options.tier || rawData.tier || inferDefaultTier(options.collectionName || 'documents', rawData.type);
  const tier = isValidTier(rawTier) ? rawTier : 'varal';
  const axeValue = calculateImportCost(tier);

  const publicationStatus = PUBLICATION_STATUSES.includes(rawData.publicationStatus)
    ? rawData.publicationStatus
    : (options.publicationStatus || 'draft');

  // isPublic est STRICTEMENT vrai uniquement si publicationStatus === 'published'
  const isPublic = publicationStatus === 'published';

  const originalSourceId = options.originalSourceId || rawData.originalSourceId || null;
  const originalAuthorName = options.originalAuthorName || rawData.originalAuthorName || null;
  const isRemix = Boolean(options.isRemix ?? rawData.isRemix ?? false);

  return {
    ...rawData,
    // Paternité et filiation
    authorGroupId,
    authorName,
    originalSourceId,
    originalAuthorName,
    isRemix,
    // Économie d'Axé
    tier,
    axeValue,
    rewardClaimed: Boolean(rawData.rewardClaimed || false),
    downloadsCount: Number(rawData.downloadsCount || 0),
    // Cycle de vie éditorial
    publicationStatus,
    isPublic,
    editorialReview: formatEditorialReview(rawData.editorialReview)
  };
}

/**
 * Prépare la mise à jour d'un document en protégeant les règles métier et l'immuabilité.
 * @param {object} currentDoc - État actuel du document.
 * @param {object} updateFields - Champs à modifier.
 * @returns {object} Champs nettoyés et synchronisés pour mise à jour.
 */
export function buildResourceUpdateData(currentDoc = {}, updateFields = {}) {
  const cleanFields = { ...updateFields };

  // 1. Protection stricte : authorGroupId est immuable
  if ('authorGroupId' in cleanFields) {
    if (currentDoc.authorGroupId && cleanFields.authorGroupId !== currentDoc.authorGroupId) {
      throw new Error("Violation d'intégrité : Le champ 'authorGroupId' est immuable et ne peut être altéré.");
    }
    delete cleanFields.authorGroupId;
  }

  // 2. Synchronisation du palier et du coût d'Axé
  if (cleanFields.tier) {
    if (!isValidTier(cleanFields.tier)) {
      throw new Error(`Palier invalide pour mise à jour : ${cleanFields.tier}`);
    }
    cleanFields.axeValue = calculateImportCost(cleanFields.tier);
  }

  // 3. Gestion synchronisée du statut éditorial et de la visibilité publique
  const effectiveStatus = cleanFields.publicationStatus || currentDoc.publicationStatus || 'draft';
  if (cleanFields.publicationStatus) {
    if (!PUBLICATION_STATUSES.includes(cleanFields.publicationStatus)) {
      throw new Error(`Statut de publication inconnu : "${cleanFields.publicationStatus}"`);
    }
    // Règle d'or : isPublic est true UNIQUEMENT si publicationStatus === 'published'
    cleanFields.isPublic = cleanFields.publicationStatus === 'published';
  } else if ('isPublic' in cleanFields) {
    // Si isPublic est forcé sans modifier publicationStatus, on aligne publicationStatus
    if (cleanFields.isPublic) {
      cleanFields.publicationStatus = 'published';
    } else if (effectiveStatus === 'published') {
      cleanFields.publicationStatus = 'draft';
    }
    cleanFields.isPublic = cleanFields.publicationStatus === 'published';
  }

  // 4. Traçabilité de l'attribution originale si fournie
  if ('originalAuthorName' in cleanFields && !cleanFields.originalAuthorName) {
    cleanFields.originalAuthorName = null;
  }

  // 5. Normalisation de la revue éditoriale si mise à jour
  if ('editorialReview' in cleanFields) {
    cleanFields.editorialReview = formatEditorialReview(cleanFields.editorialReview);
  }

  return cleanFields;
}

/**
 * Contrôle la paternité d'une ressource et lève une exception en cas de plagiat non autorisé.
 * @param {object} resource - Données de la ressource.
 * @param {string} currentGroupId - Groupe tentant la publication.
 * @param {boolean} asRemix - Si l'option Remix est activée.
 * @param {object|null} [sourceDoc] - Document source original éventuel.
 * @returns {{ isDerivative: boolean, sourceAuthorName: string }}
 */
export function checkPaternityGuardrail(resource, currentGroupId, asRemix, sourceDoc = null) {
  let isThirdPartyDerivative = false;
  let sourceAuthorName = resource.originalAuthorName || (resource.authorGroupId !== currentGroupId ? resource.authorName : null) || 'Auteur tiers';

  if (sourceDoc && sourceDoc.authorGroupId && sourceDoc.authorGroupId !== currentGroupId) {
    isThirdPartyDerivative = true;
    sourceAuthorName = sourceDoc.authorName || sourceAuthorName;
  } else if (resource.originalSourceId && resource.originalAuthorGroupId && resource.originalAuthorGroupId !== currentGroupId) {
    isThirdPartyDerivative = true;
  } else if (resource.originalSourceId && resource.originalAuthorName && resource.originalAuthorName !== resource.authorName) {
    isThirdPartyDerivative = true;
  } else if (resource.authorGroupId && resource.authorGroupId !== currentGroupId) {
    isThirdPartyDerivative = true;
  }

  if (isThirdPartyDerivative && !asRemix) {
    throw new Error(
      `Publication refusée : Cette ressource dérive d'un contenu créé par un tiers (${sourceAuthorName}). ` +
      `La republication en tant qu'œuvre originale est strictement interdite. Veuillez choisir l'option "Remix".`
    );
  }

  return { isDerivative: isThirdPartyDerivative, sourceAuthorName };
}

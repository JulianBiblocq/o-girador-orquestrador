/**
 * Service de gestion des ressources du Terreiro (Collections: rhythms, choreographies, documents).
 * Gère le cycle de vie éditorial, la création, la publication, la resoumission et l'anti-plagiat.
 */

import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { db } from './firebase.js';
import { buildResourceCreateData, buildResourceUpdateData, checkPaternityGuardrail } from './resourceModel.js';
import { calculateImportCost, isValidTier } from '../utils/axeTiers.js';

export { checkPaternityGuardrail };
export { approveResource, requestResourceRevision, rejectResource } from './editorialService.js';

/**
 * Récupère un document depuis Firestore.
 */
export async function getResource(collectionName, resourceId) {
  const docRef = doc(db, collectionName, resourceId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Crée une ressource standardisée dans la collection spécifiée.
 */
export async function createResource(collectionName, data, authorInfo, options = {}) {
  const payload = buildResourceCreateData(data, authorInfo, { collectionName, ...options });
  const docToSave = { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
  const docRef = await addDoc(collection(db, collectionName), docToSave);
  return { id: docRef.id, ...docToSave };
}

/**
 * Met à jour une ressource existante en garantissant l'intégrité du schéma.
 */
export async function updateResource(collectionName, resourceId, updateFields, existingDoc = null) {
  const current = existingDoc || (await getResource(collectionName, resourceId));
  if (!current) throw new Error(`Ressource introuvable : ${collectionName}/${resourceId}`);

  const cleanUpdate = buildResourceUpdateData(current, updateFields);
  cleanUpdate.updatedAt = serverTimestamp();
  await updateDoc(doc(db, collectionName, resourceId), cleanUpdate);
  return { ...current, ...cleanUpdate, id: resourceId };
}

/**
 * Soumet ou publie une ressource au Terreiro avec contrôle strict de paternité (anti-plagiat).
 */
export async function publishResource({
  collectionName,
  resourceId,
  currentGroupId,
  asRemix = false,
  targetTier = null,
  targetStatus = 'pending_review',
  _getResource = getResource,
  _updateResource = updateResource
}) {
  if (!currentGroupId) throw new Error("L'identifiant de groupe 'currentGroupId' est requis pour soumettre.");

  const resource = await _getResource(collectionName, resourceId);
  if (!resource) throw new Error(`Ressource introuvable : ${collectionName}/${resourceId}`);

  let sourceDoc = null;
  if (resource.originalSourceId) {
    try {
      sourceDoc = await _getResource(collectionName, resource.originalSourceId);
    } catch {}
  }

  const { sourceAuthorName } = checkPaternityGuardrail(resource, currentGroupId, asRemix, sourceDoc);
  const effectiveTier = targetTier && isValidTier(targetTier) ? targetTier : resource.tier;
  const updatePayload = {
    publicationStatus: targetStatus,
    isPublic: targetStatus === 'published',
    tier: effectiveTier,
    axeValue: calculateImportCost(effectiveTier)
  };

  if (asRemix) {
    updatePayload.isRemix = true;
    updatePayload.originalSourceId = resource.originalSourceId || resource.id;
    updatePayload.originalAuthorName = sourceAuthorName;
  }

  return await _updateResource(collectionName, resourceId, updatePayload, resource);
}

/**
 * Renvoie une création après ajustements pour une nouvelle relecture éditoriale.
 */
export async function resubmitResource(collectionName, resourceId, updatedData = {}, options = {}) {
  const updateFn = options._updateResource || updateResource;
  const getFn = options._getResource || getResource;

  const current = await getFn(collectionName, resourceId);
  if (!current) throw new Error(`Ressource introuvable pour resoumission : ${collectionName}/${resourceId}`);

  const currentReview = current.editorialReview || {};
  const updatedReview = {
    ...currentReview,
    requiresAction: false,
    resubmittedAt: new Date().toISOString()
  };

  const historyEntry = {
    action: 'resubmitted',
    at: new Date().toISOString(),
    previousStatus: current.publicationStatus || 'needs_revision'
  };

  const updateFields = {
    ...updatedData,
    publicationStatus: 'pending_review',
    isPublic: false,
    editorialReview: updatedReview,
    history: arrayUnion(historyEntry)
  };

  return await updateFn(collectionName, resourceId, updateFields, current);
}

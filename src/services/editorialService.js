/**
 * Service de modération et navette éditoriale du Terreiro.
 * Gère l'approbation transactionnelle avec attribution d'Axé, les demandes d'ajustements et le rejet.
 */

import { doc, getDoc, updateDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { db } from './firebase.js';
import { buildResourceUpdateData } from './resourceModel.js';
import { calculateImportCost, calculateReward, isValidTier } from '../utils/axeTiers.js';

/**
 * Approuve et publie une ressource de manière atomique en créditant la prime d'Axé du groupe créateur.
 */
export async function approveResource(collectionName, resourceId, options = {}) {
  const targetDb = options.db || db;
  const runner = options.runTransaction || runTransaction;

  return await runner(targetDb, async (transaction) => {
    const resourceRef = doc(targetDb, collectionName, resourceId);
    const resourceSnap = await transaction.get(resourceRef);
    if (!resourceSnap.exists()) {
      throw new Error(`Ressource introuvable : ${collectionName}/${resourceId}`);
    }

    const resourceData = resourceSnap.data();
    const tier = resourceData.tier || 'varal';
    const primeReward = calculateReward(tier);
    const authorGroupId = resourceData.authorGroupId || resourceData.groupId;
    const shouldAwardReward = !resourceData.rewardClaimed && Boolean(authorGroupId);

    if (shouldAwardReward) {
      const assocRef = doc(targetDb, 'associations', authorGroupId);
      const assocSnap = await transaction.get(assocRef);
      if (assocSnap.exists()) {
        const currentPoints = Number(assocSnap.data().contributionPoints || 0);
        transaction.update(assocRef, { contributionPoints: currentPoints + primeReward });
      }
    }

    transaction.update(resourceRef, {
      publicationStatus: 'published',
      isPublic: true,
      rewardClaimed: true,
      publishedAt: serverTimestamp(),
      editorialReview: {
        reviewedAt: serverTimestamp(),
        reviewerRole: 'admin',
        reasonCategory: null,
        adminMessage: 'Ressource validée et publiée.',
        suggestedTier: tier,
        requiresAction: false
      },
      updatedAt: serverTimestamp()
    });

    return {
      id: resourceId,
      ...resourceData,
      publicationStatus: 'published',
      isPublic: true,
      rewardClaimed: true,
      pointsAwarded: shouldAwardReward ? primeReward : 0
    };
  });
}

/**
 * Demande des ajustements éditoriaux pour une ressource.
 */
export async function requestResourceRevision(collectionName, resourceId, reviewData = {}, options = {}) {
  const targetDb = options.db || db;
  const getFn = options._getResource || (async (c, id) => {
    const s = await getDoc(doc(targetDb, c, id));
    return s.exists() ? { id: s.id, ...s.data() } : null;
  });

  const current = await getFn(collectionName, resourceId);
  if (!current) throw new Error(`Ressource introuvable : ${collectionName}/${resourceId}`);

  const updateFields = {
    publicationStatus: 'needs_revision',
    isPublic: false,
    editorialReview: {
      reviewedAt: serverTimestamp(),
      reviewerRole: 'admin',
      reasonCategory: reviewData.reasonCategory || null,
      adminMessage: reviewData.adminMessage || '',
      suggestedTier: reviewData.suggestedTier || null,
      requiresAction: true
    }
  };

  if (reviewData.suggestedTier && isValidTier(reviewData.suggestedTier)) {
    updateFields.tier = reviewData.suggestedTier;
    updateFields.axeValue = calculateImportCost(reviewData.suggestedTier);
  }

  const cleanUpdate = buildResourceUpdateData(current, updateFields);
  cleanUpdate.updatedAt = serverTimestamp();

  const updateFn = options._updateResource || (async (c, id, data) => {
    await updateDoc(doc(targetDb, c, id), data);
  });
  await updateFn(collectionName, resourceId, cleanUpdate);

  return { ...current, ...cleanUpdate, id: resourceId };
}

/**
 * Rejette une ressource sans attribution de points.
 */
export async function rejectResource(collectionName, resourceId, adminMessage = '', options = {}) {
  const targetDb = options.db || db;
  const getFn = options._getResource || (async (c, id) => {
    const s = await getDoc(doc(targetDb, c, id));
    return s.exists() ? { id: s.id, ...s.data() } : null;
  });

  const current = await getFn(collectionName, resourceId);
  if (!current) throw new Error(`Ressource introuvable : ${collectionName}/${resourceId}`);

  const updateFields = buildResourceUpdateData(current, {
    publicationStatus: 'rejected',
    isPublic: false,
    editorialReview: {
      reviewedAt: serverTimestamp(),
      reviewerRole: 'admin',
      reasonCategory: 'rejected',
      adminMessage,
      suggestedTier: null,
      requiresAction: false
    }
  });
  updateFields.updatedAt = serverTimestamp();

  const updateFn = options._updateResource || (async (c, id, data) => {
    await updateDoc(doc(targetDb, c, id), data);
  });
  await updateFn(collectionName, resourceId, updateFields);

  return { ...current, ...updateFields, id: resourceId };
}

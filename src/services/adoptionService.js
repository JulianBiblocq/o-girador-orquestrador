/**
 * Service transactionnel d'adoption de ressources dans le Terreiro.
 * Débite les points d'Axé de l'acheteur, crédite le dividende à l'auteur,
 * incrémente les téléchargements et clone la ressource avec filiation.
 */

import { doc, collection, serverTimestamp, runTransaction, arrayUnion } from 'firebase/firestore';
import { db } from './firebase.js';
import { calculateDividend, calculateImportCost } from '../utils/axeTiers.js';

/**
 * Adopte une ressource du Terreiro de manière atomique.
 */
export async function adoptResource({
  collectionName,
  resourceId,
  buyerGroupId,
  buyerName,
  options = {}
}) {
  if (!buyerGroupId) throw new Error("L'identifiant du groupe acquéreur est requis.");
  if (!resourceId) throw new Error("L'identifiant de la ressource est requis.");

  const targetDb = options.db || db;
  const runner = options.runTransaction || runTransaction;

  return await runner(targetDb, async (transaction) => {
    const resourceRef = doc(targetDb, collectionName, resourceId);
    const buyerRef = doc(targetDb, 'associations', buyerGroupId);

    // 1. Lectures préalables (Toutes les lectures AVANT les écritures)
    const resourceSnap = await transaction.get(resourceRef);
    if (!resourceSnap.exists()) {
      throw new Error(`Ressource introuvable : ${collectionName}/${resourceId}`);
    }

    const buyerSnap = await transaction.get(buyerRef);
    if (!buyerSnap.exists()) {
      throw new Error(`Association acheteuse introuvable : ${buyerGroupId}`);
    }

    const resourceData = resourceSnap.data();
    const buyerData = buyerSnap.data();
    const authorGroupId = resourceData.authorGroupId || resourceData.groupId;

    // Sécurité 1 : Auto-adoption interdite
    if (authorGroupId && authorGroupId === buyerGroupId) {
      throw new Error("Auto-adoption interdite : Vous êtes déjà l'auteur de cette ressource.");
    }

    // Sécurité 2 : Vérification si déjà débloqué (désactiver le débit)
    const unlockedList = Array.isArray(buyerData.unlockedResources) ? buyerData.unlockedResources : [];
    if (unlockedList.includes(resourceId)) {
      return {
        success: true,
        alreadyUnlocked: true,
        cost: 0,
        message: "Cette ressource est déjà débloquée dans votre répertoire."
      };
    }

    // Calcul du coût et vérification du solde
    const cost = Number(resourceData.axeValue ?? calculateImportCost(resourceData.tier || 'varal'));
    const buyerPoints = Number(buyerData.contributionPoints || 0);
    if (buyerPoints < cost) {
      throw new Error(`Solde d'Axé insuffisant (${buyerPoints} pts disponibles, ${cost} pts requis).`);
    }

    // Lecture de l'auteur pour dividende
    let authorSnap = null;
    let authorRef = null;
    if (authorGroupId) {
      authorRef = doc(targetDb, 'associations', authorGroupId);
      authorSnap = await transaction.get(authorRef);
    }

    // 2. Écritures atomiques (Toutes les écritures APRÈS les lectures)
    const dividend = calculateDividend(resourceData.tier || 'varal');

    // Débit de l'acquéreur et ajout aux ressources débloquées
    transaction.update(buyerRef, {
      contributionPoints: buyerPoints - cost,
      unlockedResources: arrayUnion(resourceId),
      updatedAt: serverTimestamp()
    });

    // Crédit du dividende à l'auteur
    if (authorRef && authorSnap && authorSnap.exists()) {
      const currentAuthorPoints = Number(authorSnap.data().contributionPoints || 0);
      transaction.update(authorRef, {
        contributionPoints: currentAuthorPoints + dividend,
        updatedAt: serverTimestamp()
      });
    }

    // Incrémentation des téléchargements de la ressource originale
    const currentDownloads = Number(resourceData.downloadsCount || 0);
    transaction.update(resourceRef, {
      downloadsCount: currentDownloads + 1,
      updatedAt: serverTimestamp()
    });

    // Création du clone privé dans le répertoire de l'acquéreur
    const cloneRef = doc(collection(targetDb, collectionName));
    const { id: _unusedId, downloadsCount: _dc, rewardClaimed: _rc, ...cleanData } = resourceData;

    const clonePayload = {
      ...cleanData,
      authorGroupId: buyerGroupId,
      authorName: buyerName || buyerData.name || 'Notre Association',
      originalSourceId: resourceId,
      originalAuthorName: resourceData.authorName || 'Auteur tiers',
      isRemix: false,
      publicationStatus: 'draft',
      isPublic: false,
      rewardClaimed: false,
      downloadsCount: 0,
      editorialReview: null,
      adoptedAt: new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    transaction.set(cloneRef, clonePayload);

    return {
      success: true,
      clonedResourceId: cloneRef.id,
      cost,
      dividend,
      remainingPoints: buyerPoints - cost
    };
  });
}

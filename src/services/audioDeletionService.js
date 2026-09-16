/**
 * Service de suppression fiabilisée des ressources audio et presets.
 * Gère une suppression résiliente sur Firebase Storage (intercepte les erreurs 404/fichiers absents),
 * puis garantit la suppression du document dans Firestore (presets ou rhythms).
 */

import { doc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase.js';

/**
 * Supprime de manière résiliente un fichier audio de Storage et son entrée Firestore.
 * 
 * @param {Object} item - L'élément à supprimer (id, storagePath, audioUrl, etc.)
 * @param {Object} [options] - Options de configuration
 * @param {string} [options.collection] - Nom de la collection cible ('presets' ou 'rhythms')
 * @param {string} [options.collectionName] - Alias pour la collection cible
 * @param {string} [options.groupId] - Identifiant du groupe (pour déduire le storagePath)
 * @param {Object} [options.dbInstance] - Instance Firestore injectée (tests)
 * @param {Object} [options.storageInstance] - Instance Storage injectée (tests)
 * @returns {Promise<{ success: boolean, storageDeleted: boolean, firestoreDeleted: boolean, collection: string, id: string }>}
 */
export async function deleteAudioResource(item, options = {}) {
  if (!item || !item.id) {
    throw new Error("L'élément à supprimer doit comporter un identifiant valide.");
  }

  const firestore = options.dbInstance || db;
  const storageInstance = options.storageInstance || storage;
  const delDoc = options._deleteDoc || deleteDoc;
  const delObject = options._deleteObject || deleteObject;
  const makeRef = options._ref || ref;
  const makeDoc = options._doc || doc;

  let storageDeleted = false;
  let firestoreDeleted = false;

  // 1. GESTION STORAGE RÉSILIENTE
  let storageRef = null;

  try {
    if (item.storagePath) {
      // Chemin explicite de stockage
      storageRef = makeRef(storageInstance, item.storagePath);
    } else if (item.audioUrl) {
      // URL de téléchargement publique
      try {
        if (typeof storageInstance.refFromURL === 'function') {
          storageRef = storageInstance.refFromURL(item.audioUrl);
        } else if (typeof options._refFromURL === 'function') {
          storageRef = options._refFromURL(storageInstance, item.audioUrl);
        } else {
          storageRef = makeRef(storageInstance, item.audioUrl);
        }
      } catch (urlErr) {
        console.warn("[audioDeletionService] Impossible de créer la référence depuis audioUrl :", urlErr?.message || urlErr);
      }
    } else if (item.type === 'storage' || item.source === 'storage' || /\.(mp3|wav|ogg|m4a|aac|json)$/i.test(item.id)) {
      // Ancien fichier Storage du répertoire Séquenceur
      const effectiveGroupId = options.groupId || item.groupId;
      if (effectiveGroupId) {
        storageRef = makeRef(storageInstance, `documents/${effectiveGroupId}/sequencer/${item.id}`);
      }
    }

    if (storageRef) {
      await delObject(storageRef);
      storageDeleted = true;
    }
  } catch (storageError) {
    // Si la suppression Storage échoue (404, ancien format), intercepte sans bloquer
    console.warn(
      "[audioDeletionService] Fichier Storage absent ou déjà supprimé (continuation normale) :",
      storageError?.code || storageError?.message || storageError
    );
  }

  // 2. SUPPRESSION FIRESTORE GARANTIE
  const targetCollection = options.collection || options.collectionName || item.collection || item.collectionName || 'presets';

  try {
    const docRef = makeDoc(firestore, targetCollection, item.id);
    await delDoc(docRef);
    firestoreDeleted = true;
  } catch (firestoreError) {
    console.warn(
      `[audioDeletionService] Suppression Firestore directe impossible (${targetCollection}/${item.id}), tentative de marquage isDeleted :`,
      firestoreError?.message || firestoreError
    );
    try {
      const docRef = makeDoc(firestore, targetCollection, item.id);
      const updateFn = options._updateDoc || updateDoc;
      await updateFn(docRef, {
        isDeleted: true,
        updatedAt: serverTimestamp()
      });
      firestoreDeleted = true;
    } catch (fallbackError) {
      console.error("[audioDeletionService] Échec irrécupérable de la suppression Firestore :", fallbackError);
      throw fallbackError;
    }
  }

  return {
    success: true,
    storageDeleted,
    firestoreDeleted,
    collection: targetCollection,
    id: item.id
  };
}

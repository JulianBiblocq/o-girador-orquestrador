/**
 * toadaDeletionService.js
 * Service de suppression complète et résiliente des toada_packs (< 110 lignes).
 * Supprime le document Firestore toada_packs/{id} et tous les WAV associés dans Storage vocalRecordings/.
 */
import { doc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, deleteObject, listAll } from 'firebase/storage';
import { db, storage } from './firebase.js';

export async function deleteToadaPack(pack, options = {}) {
  if (!pack || !pack.id) {
    throw new Error("Le pack vocal à supprimer doit comporter un identifiant valide.");
  }

  const toadaId = pack.id;
  const firestore = options.dbInstance || db;
  const storageInstance = options.storageInstance || storage;
  let deletedFilesCount = 0;

  // 1. Suppression exhaustive dans Storage vocalRecordings/
  try {
    const folderRef = ref(storageInstance, 'vocalRecordings');
    const folderList = await listAll(folderRef);
    const prefix = `${toadaId}_`;

    for (const itemRef of folderList.items) {
      if (itemRef.name.startsWith(prefix)) {
        try {
          await deleteObject(itemRef);
          deletedFilesCount++;
        } catch (err) {
          console.warn(`[toadaDeletionService] Erreur suppression ${itemRef.name}:`, err);
        }
      }
    }
  } catch (listErr) {
    console.warn('[toadaDeletionService] listAll indisponible, tentative par URL et patterns:', listErr);
    // Fallback : suppression via patterns et audioUrl
    const patterns = Array.isArray(pack.patterns) ? pack.patterns : [];
    for (const p of patterns) {
      const urls = [p.audioUrl];
      if (p.variants) {
        Object.values(p.variants).forEach(v => { if (v?.audioUrl) urls.push(v.audioUrl); });
      }
      for (const u of urls.filter(Boolean)) {
        try {
          const match = u.match(/\/o\/([^?]+)/);
          const path = match ? decodeURIComponent(match[1]) : `vocalRecordings/${toadaId}_${p.id}.wav`;
          await deleteObject(ref(storageInstance, path));
          deletedFilesCount++;
        } catch {}
      }
    }
  }

  // 2. Suppression dans Firestore toada_packs/{id}
  let firestoreDeleted = false;
  try {
    const docRef = doc(firestore, 'toada_packs', toadaId);
    await deleteDoc(docRef);
    firestoreDeleted = true;
  } catch (delErr) {
    console.warn(`[toadaDeletionService] Échec deleteDoc toada_packs/${toadaId}, marquage isDeleted:`, delErr);
    try {
      const docRef = doc(firestore, 'toada_packs', toadaId);
      await updateDoc(docRef, { isDeleted: true, updatedAt: serverTimestamp() });
      firestoreDeleted = true;
    } catch (upErr) {
      console.error("[toadaDeletionService] Erreur irrécupérable Firestore:", upErr);
      throw upErr;
    }
  }

  return {
    success: firestoreDeleted,
    toadaId,
    deletedFilesCount
  };
}

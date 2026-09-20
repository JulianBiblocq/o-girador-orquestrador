/**
 * Service de Calcul & Métriques de Stockage Cloud Functions (v2)
 * Calcule l'espace disque consommé par chaque association et synchronise Firestore.
 */

const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const { onCall, HttpsError } = require('firebase-functions/v2/https');

// Constantes de quotas par défaut (en octets)
const QUOTA_1_GO = 1024 * 1024 * 1024;
const QUOTA_5_GO = 5 * 1024 * 1024 * 1024;
const QUOTA_25_GO = 25 * 1024 * 1024 * 1024;

/**
 * Déduit le quota de stockage initial d'après les forfaits débloqués.
 * @param {Array<string>} [unlockedPacks=[]] - Liste des packs souscrits.
 * @returns {number} Quota en octets.
 */
function resolveDefaultQuota(unlockedPacks = []) {
  if (!Array.isArray(unlockedPacks) || unlockedPacks.length === 0) {
    return QUOTA_1_GO;
  }
  const packs = unlockedPacks.map(p => String(p).toLowerCase());
  if (packs.some(p => p.includes('integrale'))) {
    return QUOTA_25_GO;
  }
  if (packs.some(p => p.includes('gestion'))) {
    return QUOTA_5_GO;
  }
  return QUOTA_1_GO;
}

/**
 * Cloud Function HTTPS Callable : calculateAssociationStorageUsage
 * Parcourt les 6 préfixes Storage isolés par groupId, calcule le total et met à jour Firestore.
 */
const calculateAssociationStorageUsage = onCall({ cors: true }, async (request) => {
  // 1. Vérification de l'authentification
  const authData = request.auth || (request.context && request.context.auth);
  if (!authData || !authData.uid) {
    throw new HttpsError('unauthenticated', 'Authentification requise pour calculer les métriques de stockage.');
  }

  const uid = authData.uid;
  const data = request.data || request;
  const rawGroupId = data?.groupId;

  if (!rawGroupId || typeof rawGroupId !== 'string') {
    throw new HttpsError('invalid-argument', "L'identifiant du groupe (groupId) est requis.");
  }

  const groupId = rawGroupId.trim().toLowerCase();
  const db = getFirestore();

  // 2. Contrôle de sécurité : Super-Admin ou Mestre/Admin de l'association
  const userDoc = await db.collection('users').doc(uid).get();
  const userData = userDoc.exists ? (userDoc.data() || {}) : {};

  const isSuperAdmin = (
    userData.isSystemAdmin === true ||
    userData.role === 'admin' ||
    userData.role === 'super-admin' ||
    authData.token?.isSystemAdmin === true ||
    authData.token?.role === 'admin'
  );

  const userGroupId = String(userData.groupId || authData.token?.groupId || '').trim().toLowerCase();
  const userRole = String(userData.role || authData.token?.role || '').toLowerCase();
  const isAuthorizedGroupAdmin = (
    userGroupId === groupId &&
    ['mestre', 'admin', 'bureau', 'ca', 'super-admin'].includes(userRole)
  );

  if (!isSuperAdmin && !isAuthorizedGroupAdmin) {
    throw new HttpsError(
      'permission-denied',
      "Accès réservé aux administrateurs ou au Mestre de l'association."
    );
  }

  // 3. Résolution du bucket Firebase Storage
  let bucket;
  try {
    bucket = process.env.STORAGE_BUCKET 
      ? getStorage().bucket(process.env.STORAGE_BUCKET) 
      : getStorage().bucket('o-girador-7828c.firebasestorage.app');
  } catch (err) {
    bucket = getStorage().bucket();
  }

  // 4. Constitution des 6 préfixes isolés par groupe à scanner
  const targetPrefixes = new Set([
    `associations/${groupId}/`,
    `documents/${groupId}/`,
    `workshops_media/${groupId}/`,
    `studio_validation/${groupId}/`,
    `orders/${groupId}/`,
    `transactions/${groupId}/`
  ]);

  // Tolérance pour les fichiers historiques avec casse brute
  if (rawGroupId.trim() !== groupId) {
    const raw = rawGroupId.trim();
    targetPrefixes.add(`associations/${raw}/`);
    targetPrefixes.add(`documents/${raw}/`);
    targetPrefixes.add(`workshops_media/${raw}/`);
    targetPrefixes.add(`studio_validation/${raw}/`);
    targetPrefixes.add(`orders/${raw}/`);
    targetPrefixes.add(`transactions/${raw}/`);
  }

  // 5. Parcours et agrégation des octets avec déduplication
  let totalBytes = 0;
  const processedFiles = new Set();

  for (const prefix of targetPrefixes) {
    try {
      const [files] = await bucket.getFiles({ prefix });
      for (const file of files) {
        if (!processedFiles.has(file.name)) {
          processedFiles.add(file.name);
          const size = Number(file.metadata?.size || file.size || 0);
          totalBytes += size;
        }
      }
    } catch (scanErr) {
      console.warn(`[StorageMetrics] Avertissement parcours préfixe ${prefix} :`, scanErr.message);
    }
  }

  // 6. Détermination du quota actuel ou déduction dynamique
  const assocRef = db.collection('associations').doc(groupId);
  const assocSnap = await assocRef.get();
  const assocData = assocSnap.exists ? (assocSnap.data() || {}) : {};

  let quotaBytes = null;
  if (assocData.storage && Number(assocData.storage.quotaBytes) > 0) {
    quotaBytes = Number(assocData.storage.quotaBytes);
  } else if (Number(assocData.storageQuotaBytes) > 0) {
    quotaBytes = Number(assocData.storageQuotaBytes);
  } else {
    // Déduction dynamique selon unlockedPacks
    quotaBytes = resolveDefaultQuota(assocData.unlockedPacks);
  }

  // 7. Mise à jour atomique dans Firestore
  const storageUpdate = {
    usedBytes: totalBytes,
    lastCalculatedAt: FieldValue.serverTimestamp(),
    quotaBytes: quotaBytes
  };

  await assocRef.set({ storage: storageUpdate }, { merge: true });

  console.log(`[StorageMetrics] Quota recalculé pour ${groupId} : ${totalBytes} / ${quotaBytes} octets.`);

  return {
    success: true,
    usedBytes: totalBytes,
    quotaBytes: quotaBytes
  };
});

module.exports = {
  calculateAssociationStorageUsage,
  resolveDefaultQuota
};

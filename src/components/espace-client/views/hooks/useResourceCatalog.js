/**
 * Hook unifié pour le catalogue de ressources d'O Girador (presets, sections, patterns).
 * Gère le chargement parallèle optimisé, la déduplication, le cache mémoire et les mutations optimistes.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, query, where, limit, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../services/firebase';

// Cache mémoire transverse pour éviter les re-lectures Firestore lors des changements d'onglets
const catalogCache = new Map();

// Helper pour extraire les millisecondes d'une date (Firestore Timestamp, ISO ou ms)
const getTimestamp = (val) => {
  if (!val) return 0;
  if (typeof val.toMillis === 'function') return val.toMillis();
  if (typeof val.seconds === 'number') return val.seconds * 1000;
  if (typeof val === 'number') return val;
  const parsed = Date.parse(val);
  return isNaN(parsed) ? 0 : parsed;
};

export function useResourceCatalog(collectionName = 'presets', userProfile = null) {
  const userUid = userProfile?.uid || userProfile?.userUid;
  const rawGroup = userProfile?.groupId ? String(userProfile.groupId).trim() : '';
  const canonicalGroup = rawGroup.toLowerCase();

  // Détection Samambaia et repli Mestre
  const isSamambaia = canonicalGroup === 'samambaia' || userProfile?.mestreId === 'iA0SweEHyOPzAPGIDVZdeKAV2mk1';
  const effectiveMestreId = userProfile?.mestreId || (isSamambaia ? 'iA0SweEHyOPzAPGIDVZdeKAV2mk1' : null);

  // Variantes de groupId pour requêter Firestore avec tolérance
  const groupIdVariants = useMemo(() => {
    const variants = rawGroup
      ? [rawGroup, canonicalGroup, ...(isSamambaia ? ['Samambaia', 'samambaia'] : [])]
      : (isSamambaia ? ['Samambaia', 'samambaia'] : []);
    return Array.from(new Set(variants)).filter(Boolean);
  }, [rawGroup, canonicalGroup, isSamambaia]);

  // Clé unique pour le cache local
  const cacheKey = `${collectionName}_${userUid || 'anon'}_${rawGroup || 'nogroup'}`;

  const [items, setItems] = useState(() => catalogCache.get(cacheKey) || []);
  const [isLoading, setIsLoading] = useState(() => !catalogCache.has(cacheKey));
  const [error, setError] = useState(null);

  // Chargement des données Firestore
  const fetchCatalog = useCallback(async (force = false) => {
    if (!force && catalogCache.has(cacheKey)) {
      setItems(catalogCache.get(cacheKey));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const colRef = collection(db, collectionName);
      const subQueries = [];

      // 1. Mes créations
      if (userUid) {
        subQueries.push(getDocs(query(colRef, where('ownerId', '==', userUid), limit(100))));
      }

      // 2. Créations du groupe
      if (groupIdVariants.length > 0) {
        subQueries.push(getDocs(query(colRef, where('groupId', 'in', groupIdVariants), limit(100))));
      }

      // 3. Créations du Mestre
      if (effectiveMestreId && effectiveMestreId !== userUid) {
        subQueries.push(getDocs(query(colRef, where('ownerId', '==', effectiveMestreId), limit(100))));
      }

      // 4. Créations publiques
      subQueries.push(getDocs(query(colRef, where('visibility', '==', 'public'), limit(100))));

      const results = await Promise.allSettled(subQueries);
      const resourcesMap = new Map();

      results.forEach((res) => {
        if (res.status === 'fulfilled' && res.value?.docs) {
          res.value.docs.forEach((docSnap) => {
            if (!resourcesMap.has(docSnap.id)) {
              resourcesMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
            }
          });
        } else if (res.status === 'rejected') {
          console.warn(`[useResourceCatalog] Requête rejetée (${collectionName}) :`, res.reason);
        }
      });

      // Tri mémoire descendant par updatedAt puis createdAt
      const sorted = Array.from(resourcesMap.values()).sort((a, b) => {
        const timeA = getTimestamp(a.updatedAt) || getTimestamp(a.createdAt);
        const timeB = getTimestamp(b.updatedAt) || getTimestamp(b.createdAt);
        return timeB - timeA;
      });

      catalogCache.set(cacheKey, sorted);
      setItems(sorted);
    } catch (err) {
      console.error(`[useResourceCatalog] Erreur chargement ${collectionName} :`, err);
      setError(err?.message || 'Erreur lors de la récupération des ressources.');
    } finally {
      setIsLoading(false);
    }
  }, [cacheKey, collectionName, userUid, effectiveMestreId, groupIdVariants]);

  // Synchronisation au montage ou changement de contexte
  useEffect(() => {
    fetchCatalog(false);
  }, [fetchCatalog]);

  // Fonction de réactualisation explicite
  const refetch = useCallback((force = true) => fetchCatalog(force), [fetchCatalog]);

  // Renommage optimiste avec rollback en cas d'échec
  const renameResource = useCallback(async (resourceId, newName) => {
    const previous = items;
    const updated = previous.map((it) => (it.id === resourceId ? { ...it, name: newName, title: newName } : it));
    setItems(updated);
    catalogCache.set(cacheKey, updated);

    try {
      const docRef = doc(db, collectionName, resourceId);
      await updateDoc(docRef, { name: newName, updatedAt: serverTimestamp() });
    } catch (err) {
      console.warn(`[useResourceCatalog] Échec renommage (${resourceId}) :`, err);
      setItems(previous);
      catalogCache.set(cacheKey, previous);
      throw err;
    }
  }, [items, cacheKey, collectionName]);

  // Mise à jour optimiste de la visibilité
  const updateVisibility = useCallback(async (resourceId, newVisibility) => {
    const previous = items;
    const updated = previous.map((it) => (it.id === resourceId ? { ...it, visibility: newVisibility } : it));
    setItems(updated);
    catalogCache.set(cacheKey, updated);

    try {
      const docRef = doc(db, collectionName, resourceId);
      await updateDoc(docRef, { visibility: newVisibility, updatedAt: serverTimestamp() });
    } catch (err) {
      console.warn(`[useResourceCatalog] Échec mise à jour visibilité (${resourceId}) :`, err);
      setItems(previous);
      catalogCache.set(cacheKey, previous);
      throw err;
    }
  }, [items, cacheKey, collectionName]);

  // Suppression locale immédiate (déléguée au service pour le distant)
  const removeResourceLocally = useCallback((resourceId) => {
    setItems((prev) => {
      const updated = prev.filter((it) => it.id !== resourceId);
      catalogCache.set(cacheKey, updated);
      return updated;
    });
  }, [cacheKey]);

  return {
    items,
    resources: items,
    isLoading,
    loading: isLoading,
    error,
    refetch,
    renameResource,
    updateVisibility,
    removeResourceLocally
  };
}

export default useResourceCatalog;

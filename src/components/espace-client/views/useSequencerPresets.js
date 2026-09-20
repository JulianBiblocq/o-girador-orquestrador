/**
 * Hook personnalisé pour charger les morceaux du Séquenceur dans l'Espace Client.
 * Agrège en temps réel les presets Firestore (créateur, groupe, Mestre, public)
 * et les archives Firebase Storage de l'association, avec déduplication par ID.
 */

import { useState, useEffect } from 'react';
import { db, storage } from '../../../services/firebase';
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore';
import { ref, listAll } from 'firebase/storage';
import LZString from 'lz-string';

export function useSequencerPresets(userData) {
  const [items, setItems] = useState([]);
  const [publicItems, setPublicItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData?.uid) {
      setLoading(false);
      return;
    }

    const unsubs = [];
    const presetsMap = new Map();
    let storageItems = [];

    // Identification du groupe canonique et détection de Samambaia
    const rawGroupId = userData.groupId;
    const canonicalGroupId = rawGroupId ? String(rawGroupId).trim().toLowerCase() : '';
    const isSamambaia = canonicalGroupId === 'samambaia' || canonicalGroupId.includes('sammbia') || userData.mestreId === 'iA0SweEHyOPzAPGIDVZdeKAV2mk1';

    // Résolution du Mestre effectif (avec repli sur le Mestre historique pour Samambaia)
    const effectiveMestreId = userData.mestreId || (isSamambaia ? 'iA0SweEHyOPzAPGIDVZdeKAV2mk1' : null);

    // Variantes de groupId tolérantes à la casse pour interroger Firestore
    const groupVariants = Array.from(new Set([
      rawGroupId,
      canonicalGroupId,
      ...(isSamambaia ? ['Samambaia', 'samambaia'] : [])
    ])).filter(Boolean);

    // Fonction de fusion, décompression et tri en mémoire des morceaux
    const rebuildItems = () => {
      const firestoreItems = [];
      presetsMap.forEach((docSnap) => {
        const data = docSnap.data() || {};
        let parsedData = data;
        if (data.data) {
          try {
            parsedData = JSON.parse(LZString.decompressFromBase64(data.data));
          } catch (_) {}
        }

        firestoreItems.push({
          id: docSnap.id,
          title: data.name || data.title || 'Sans titre',
          isAudio: false,
          isPublic: data.visibility === 'public' || data.visibility === 'admin_global' || !!data.isPublic,
          rewardClaimed: !!data.rewardClaimed,
          dateCreation: data.createdAt || 0,
          orderIndex: data.orderIndex !== undefined ? data.orderIndex : 9999,
          source: 'firestore',
          originalData: parsedData,
          tempo: data.tempo,
          audioUrl: data.audioUrl,
          storagePath: data.storagePath,
          collection: 'presets'
        });
      });

      // Combinaison des éléments Storage et Firestore avec tri en mémoire
      const allItems = [...storageItems, ...firestoreItems];
      allItems.sort((a, b) => {
        if (a.orderIndex !== undefined && b.orderIndex !== undefined && a.orderIndex !== 9999 && b.orderIndex !== 9999) {
          return a.orderIndex - b.orderIndex;
        }
        return b.dateCreation - a.dateCreation;
      });
      setItems(allItems);
    };

    // Reconstruction de la vitrine publique
    const rebuildPublicItems = (snapshot) => {
      const publicList = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() || {};
        let parsedData = data;
        if (data.data) {
          try { parsedData = JSON.parse(LZString.decompressFromBase64(data.data)); } catch (_) {}
        }
        publicList.push({
          id: docSnap.id,
          title: data.name || data.title || 'Sans titre',
          authorName: data.authorName || 'O Girador',
          dateCreation: data.createdAt || 0,
          originalData: parsedData,
          audioUrl: data.audioUrl || null
        });
      });
      publicList.sort((a, b) => b.dateCreation - a.dateCreation);
      setPublicItems(publicList);
    };

    const presetsRef = collection(db, 'presets');

    // 1. Morceaux créés par l'utilisateur connecté
    const qOwner = query(presetsRef, where('ownerId', '==', userData.uid));
    unsubs.push(onSnapshot(qOwner, (snapshot) => {
      snapshot.forEach((d) => presetsMap.set(d.id, d));
      rebuildItems();
    }, (err) => console.warn('[useSequencerPresets] Erreur créateur :', err.message)));

    // 2. Morceaux publics et globaux
    const qPublic = query(presetsRef, where('visibility', 'in', ['public', 'admin_global']));
    unsubs.push(onSnapshot(qPublic, (snapshot) => {
      snapshot.forEach((d) => presetsMap.set(d.id, d));
      rebuildItems();
      rebuildPublicItems(snapshot);
    }, (err) => console.warn('[useSequencerPresets] Erreur publics :', err.message)));

    // 3. Morceaux spécifiquement partagés avec l'utilisateur
    const qTarget = query(presetsRef, where('targetUserId', '==', userData.uid));
    unsubs.push(onSnapshot(qTarget, (snapshot) => {
      snapshot.forEach((d) => presetsMap.set(d.id, d));
      rebuildItems();
    }, (err) => console.warn('[useSequencerPresets] Erreur ciblés :', err.message)));

    // 4. Morceaux rattachés au groupe de l'adhérent (garde-fou sur tableau non vide)
    if (groupVariants.length > 0) {
      const qGroup = query(presetsRef, where('groupId', 'in', groupVariants), limit(100));
      unsubs.push(onSnapshot(qGroup, (snapshot) => {
        snapshot.forEach((d) => presetsMap.set(d.id, d));
        rebuildItems();
      }, (err) => console.warn('[useSequencerPresets] Erreur groupe :', err.message)));
    }

    // 5. Morceaux du Mestre de l'association
    if (effectiveMestreId) {
      const qMestre = query(presetsRef, where('mestreId', '==', effectiveMestreId), limit(100));
      unsubs.push(onSnapshot(qMestre, (snapshot) => {
        snapshot.forEach((d) => presetsMap.set(d.id, d));
        rebuildItems();
      }, (err) => console.warn('[useSequencerPresets] Erreur Mestre :', err.message)));
    }

    // 6. Fichiers historiques stockés sur Firebase Storage (documents/${groupId}/sequencer)
    const fetchStorage = async () => {
      if (!rawGroupId) { setLoading(false); return; }
      try {
        const folderRef = ref(storage, `documents/${rawGroupId}/sequencer`);
        const res = await listAll(folderRef);
        storageItems = res.items.map((itemRef) => {
          const rawName = itemRef.name;
          const cleanName = rawName.replace(/^\d+_/, '').replace(/\.(json|mp3|wav|ogg|m4a|aac)$/i, '');
          return {
            id: rawName,
            title: cleanName,
            isAudio: /\.(mp3|wav|ogg|m4a|aac)$/i.test(rawName),
            isPublic: false,
            rewardClaimed: false,
            dateCreation: parseInt(rawName.split('_')[0], 10) || 0,
            storagePath: `documents/${rawGroupId}/sequencer/${rawName}`,
            source: 'storage',
            type: 'storage'
          };
        });
        rebuildItems();
      } catch (storageErr) {
        console.warn('[useSequencerPresets] Erreur Storage :', storageErr);
      } finally {
        setLoading(false);
      }
    };
    fetchStorage();

    const loadingTimer = setTimeout(() => setLoading(false), 800);

    // Nettoyage strict de l'ensemble des écouteurs Firestore à la destruction
    return () => {
      clearTimeout(loadingTimer);
      unsubs.forEach((unsub) => { if (typeof unsub === 'function') unsub(); });
    };
  }, [userData?.groupId, userData?.uid, userData?.mestreId]);

  return { items, setItems, publicItems, loading };
}

import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import packsData from '../data/packs.json';

const INITIAL_DEMO_PACKS = packsData.packs;

export async function fetchPacks() {
  try {
    const querySnapshot = await getDocs(collection(db, 'premium_packs'));
    if (!querySnapshot.empty) {
      return querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          prices: data.prices || { EUR: data.price || 0, BRL: 0 }
        };
      });
    }
  } catch (err) {
    console.warn("Firestore fetchPacks fallback:", err);
  }

  // Local storage fallback
  const localData = localStorage.getItem('ogirador_packs');
  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      return parsed.map(pack => ({
        ...pack,
        prices: pack.prices || { EUR: pack.price || 0, BRL: 0 }
      }));
    } catch (e) {
      console.error(e);
    }
  }

  // Save initial fallback data
  localStorage.setItem('ogirador_packs', JSON.stringify(INITIAL_DEMO_PACKS));
  return INITIAL_DEMO_PACKS;
}

export async function savePack(packData) {
  let updatedPack = { ...packData };

  try {
    // Si c'est un ID généré localement ou un pack de démo (commence par pack-), on crée un nouveau doc
    if (packData.id && !packData.id.startsWith('pack-')) {
      const docRef = doc(db, 'premium_packs', packData.id);
      await updateDoc(docRef, {
        ...packData,
        updatedAt: serverTimestamp()
      });
    } else {
      // Pour forcer l'ajout des packs de démo en tant que vrais documents si modifiés
      const docRef = await addDoc(collection(db, 'premium_packs'), {
        ...packData,
        createdAt: serverTimestamp()
      });
      updatedPack.id = docRef.id;
    }
  } catch (err) {
    console.warn("Firestore savePack fallback:", err);
    if (!updatedPack.id || updatedPack.id.startsWith('pack-')) {
      updatedPack.id = `pack-custom-${Date.now()}`;
    }
  }

  // Sync to local storage
  const currentList = await fetchPacks();
  const existingIdx = currentList.findIndex(p => p.id === updatedPack.id || p.id === packData.id);
  let newList;
  if (existingIdx >= 0) {
    newList = [...currentList];
    newList[existingIdx] = updatedPack;
  } else {
    newList = [updatedPack, ...currentList];
  }
  localStorage.setItem('ogirador_packs', JSON.stringify(newList));
  return newList;
}

export async function deletePack(id) {
  try {
    if (!id.startsWith('pack-')) {
      await deleteDoc(doc(db, 'premium_packs', id));
    }
  } catch (err) {
    console.warn("Firestore deletePack fallback:", err);
  }

  const currentList = await fetchPacks();
  const newList = currentList.filter(p => p.id !== id);
  localStorage.setItem('ogirador_packs', JSON.stringify(newList));
  return newList;
}

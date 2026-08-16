import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// Mock initial data for demonstration & offline fallback
const INITIAL_DEMO_GROUPS = [
  {
    id: 'asso-01',
    name: 'Batuque Samambaia (Roda de Maracatu)',
    city: 'Nantes / Rennes',
    contactEmail: 'contact@samambaia-maracatu.fr',
    contactName: 'Mestre Nico',
    planType: 'annual',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    membersCount: 45,
    appAccess: {
      sequenceur: true,
      manager: true,
      vitrine: true
    },
    universeAccess: {
      maracatu: true,
      capoeira: true,
      samba: false
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'asso-02',
    name: 'Estrela do Norte - Percussions',
    city: 'Paris',
    contactEmail: 'bateria@estreladonorte.org',
    contactName: 'Juliana Silva',
    planType: 'annual',
    startDate: '2025-08-15',
    endDate: '2026-08-15', // Expires in 13 days! (Warning J-15)
    membersCount: 30,
    appAccess: {
      sequenceur: true,
      manager: true,
      vitrine: true
    },
    universeAccess: {
      maracatu: true,
      capoeira: false,
      samba: false
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'asso-03',
    name: 'Bloco Trovoada Caipira',
    city: 'Lyon',
    contactEmail: 'contact@trovoada.fr',
    contactName: 'Lucas Dupont',
    planType: 'monthly',
    startDate: '2026-06-01',
    endDate: '2026-07-01', // Expired! (Soft Lock test)
    membersCount: 18,
    appAccess: {
      sequenceur: true,
      manager: true,
      vitrine: false
    },
    universeAccess: {
      maracatu: true,
      capoeira: false,
      samba: false
    },
    createdAt: new Date().toISOString()
  }
];

export async function fetchAssociations() {
  try {
    const querySnapshot = await getDocs(collection(db, 'associations'));
    if (!querySnapshot.empty) {
      return querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
    }
  } catch (err) {
    console.warn("Firestore fetchAssociations note:", err);
  }

  // Local storage fallback for seamless offline dev & demonstration
  const localData = localStorage.getItem('ogirador_associations');
  if (localData) {
    try {
      return JSON.parse(localData);
    } catch (e) {
      console.error(e);
    }
  }

  // Save initial fallback data
  localStorage.setItem('ogirador_associations', JSON.stringify(INITIAL_DEMO_GROUPS));
  return INITIAL_DEMO_GROUPS;
}

export async function saveAssociation(groupData) {
  let updatedGroup = { ...groupData };

  try {
    if (groupData.id && !groupData.id.startsWith('asso-')) {
      const docRef = doc(db, 'associations', groupData.id);
      await updateDoc(docRef, {
        ...groupData,
        updatedAt: serverTimestamp()
      });
    } else {
      const docRef = await addDoc(collection(db, 'associations'), {
        ...groupData,
        createdAt: serverTimestamp()
      });
      updatedGroup.id = docRef.id;
    }
  } catch (err) {
    console.warn("Firestore saveAssociation fallback:", err);
    if (!updatedGroup.id) {
      updatedGroup.id = `asso-${Date.now()}`;
    }
  }

  // Sync to local storage
  const currentList = await fetchAssociations();
  const existingIdx = currentList.findIndex(g => g.id === updatedGroup.id);
  let newList;
  if (existingIdx >= 0) {
    newList = [...currentList];
    newList[existingIdx] = updatedGroup;
  } else {
    newList = [updatedGroup, ...currentList];
  }
  localStorage.setItem('ogirador_associations', JSON.stringify(newList));
  return newList;
}

export async function deleteAssociation(id) {
  try {
    if (!id.startsWith('asso-')) {
      await deleteDoc(doc(db, 'associations', id));
    }
  } catch (err) {
    console.warn("Firestore deleteAssociation fallback:", err);
  }

  const currentList = await fetchAssociations();
  const newList = currentList.filter(g => g.id !== id);
  localStorage.setItem('ogirador_associations', JSON.stringify(newList));
  return newList;
}

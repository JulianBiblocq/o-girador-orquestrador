import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { collection, query, where, getDocs, doc, setDoc, updateDoc, increment, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { Users, Calendar, Music, Mail, Activity, Sparkles, Globe, X, Lock, Check, Eye, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import LZString from 'lz-string';
import EventsAnalysisModal from '../modals/EventsAnalysisModal';
import { awardAxePoints } from '../../../services/gamificationService';
import presetsDump from '../../../presets_dump.json';

export default function GlobalHealthStats({ userData, associationData }) {
  const hasPack = (packId) => {
    if (associationData?.isAdmin || associationData?.role === 'admin') return true;
    if (associationData?.appAccess?.[packId] === true) return true;
    const packs = associationData?.unlockedPacks || [];

    // Hiérarchie des forfaits : integrale (4) > gestion (3) > createur (2) > decouverte (1)
    let userMaxLevel = 1;
    for (const p of packs) {
      if (p.includes('integrale')) userMaxLevel = Math.max(userMaxLevel, 4);
      else if (p.includes('gestion')) userMaxLevel = Math.max(userMaxLevel, 3);
      else if (p.includes('createur') || p.includes('association') || p.includes('essentiel')) userMaxLevel = Math.max(userMaxLevel, 2);
    }

    // Niveau requis par fonctionnalité
    const levelMap = {
      'ecosysteme': 4, 'dancador': 4, 'integrale': 4,
      'manager': 3, 'vitrine': 3, 'gestion': 3,
      'sequenceur': 2, 'createur': 2, 'association': 2, 'essentiel': 2
    };
    const requiredLevel = levelMap[packId] || 5;

    // Match direct OU hiérarchie
    if (packs.some(p => p.includes(packId))) return true;
    return userMaxLevel >= requiredLevel;
  };
  const [stats, setStats] = useState({
    activeMembers: 0,
    pupitres: [],
    upcomingEvents: 0,
    nextEventName: null,
    totalRhythms: 0,
    totalChoreos: 0,
    newsletterSubscribers: 0,
    vitrineViews: 0
  });
  const [loading, setLoading] = useState(true);
  const [isPupitreModalOpen, setIsPupitreModalOpen] = useState(false);
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);
  const [isSubscribersModalOpen, setIsSubscribersModalOpen] = useState(false);
  const [isRhythmsModalOpen, setIsRhythmsModalOpen] = useState(false);
  const [isChoreosModalOpen, setIsChoreosModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [activeRhythmTab, setActiveRhythmTab] = useState('rhythm'); // 'rhythm', 'section', 'storage'
  const [activeChoreoTab, setActiveChoreoTab] = useState('choreo'); // 'choreo', 'section', 'storage'

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleImportPublicCatalog = async () => {
    if (!window.confirm("Importer les rythmes par défaut dans le catalogue public ?")) return;
    try {
      showToast("Importation en cours...");
      
      let importedCount = 0;
      for (const item of presetsDump) {
        try {
          const { filename, rawData } = item;
          const compressedData = LZString.compressToBase64(rawData);
          const docId = filename.replace('.json', '');
          
          const labelMap = {
            'fatras': 'Fatras',
            'Vou vadiar carnaval': 'Vou Vadiar Carnaval',
            '_convencao_2': 'Convention 2'
          };
          
          await setDoc(doc(db, 'presets', docId), {
            name: labelMap[docId] || docId,
            visibility: 'admin_global',
            isPublic: true,
            data: compressedData,
            authorName: 'O Girador',
            ownerId: userData.uid,
            createdAt: serverTimestamp()
          }, { merge: true });
          importedCount++;
        } catch (err) {
          console.error("Erreur avec un fichier", err);
        }
      }
      showToast(`${importedCount} rythmes importés !`);
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error(error);
      showToast("Erreur lors de l'importation.");
    }
  };

  const handleDeleteRhythm = async (item) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer "${item.label}" ?`)) return;

    try {
      if (item.type === 'section' || item.type === 'rhythm') {
        await deleteDoc(doc(db, 'presets', item.id));
      } else if (item.type === 'storage') {
        alert("Impossible de supprimer un ancien fichier Storage depuis cette interface.");
        return;
      }
      
      const newRhythms = stats.latestRhythms.filter(r => r.id !== item.id);
      setStats(prev => ({ ...prev, latestRhythms: newRhythms }));
      showToast("Rythme supprimé avec succès !");
    } catch (error) {
      console.error("Erreur suppression:", error);
      showToast("Une erreur est survenue lors de la suppression.");
    }
  };

  const moveRhythmItem = async (indexInFiltered, direction, filteredList) => {
    if ((direction === -1 && indexInFiltered === 0) || (direction === 1 && indexInFiltered === filteredList.length - 1)) return;

    const item = filteredList[indexInFiltered];
    const targetItem = filteredList[indexInFiltered + direction];
    
    const newRhythms = [...stats.latestRhythms];
    const absIdx = newRhythms.findIndex(r => r.id === item.id);
    const absTargetIdx = newRhythms.findIndex(r => r.id === targetItem.id);
    
    const temp = newRhythms[absIdx];
    newRhythms[absIdx] = newRhythms[absTargetIdx];
    newRhythms[absTargetIdx] = temp;
    
    setStats(prev => ({ ...prev, latestRhythms: newRhythms }));

    try {
      const updatePromises = [];
      if (item.type === 'section' || item.type === 'rhythm') {
        updatePromises.push(updateDoc(doc(db, 'presets', item.id), { orderIndex: indexInFiltered + direction }));
      }
      if (targetItem.type === 'section' || targetItem.type === 'rhythm') {
        updatePromises.push(updateDoc(doc(db, 'presets', targetItem.id), { orderIndex: indexInFiltered }));
      }
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Erreur réorganisation:", error);
      showToast("Erreur lors de l'enregistrement de l'ordre.");
    }
  };

  const handlePublishRhythm = async (item) => {
    if (item.isPublic) {
      showToast("Cette création est déjà publique !");
      return;
    }
    if (!window.confirm("Voulez-vous vraiment publier cette création dans le Terreiro ?")) return;

    try {
      const isEligible = true; // Simplified for the modal, or we can check originalData.measures etc.
      let canClaimReward = false;
      let toastMsg = "";

      if (!item.rewardClaimed) {
        const presetsRef = collection(db, 'presets');
        const qCap = query(presetsRef, where('ownerId', '==', userData.uid), where('rewardClaimed', '==', true));
        const snap = await getDocs(qCap);
        
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        let recentCount = 0;
        
        snap.forEach(docSnap => {
          const d = docSnap.data();
          const date = d.rewardDate?.toMillis?.() || d.dateCreation?.toMillis?.() || 0;
          if (now - date < oneDay) {
            recentCount++;
          }
        });

        if (recentCount < 2) {
          canClaimReward = true;
          toastMsg = "Morceau publié ! Arrangement complet : +25 Points d'Axé.";
        } else {
          toastMsg = "Morceau publié ! (Plafond quotidien de points atteint).";
        }
      } else {
        toastMsg = "Votre création est désormais publique !";
      }

      const creationRef = doc(db, 'presets', item.id);
      const updateData = {
        title: item.label || 'Sans titre',
        visibility: 'public',
        isPublic: true,
        authorName: associationData?.name || associationData?.nom || 'Association',
        ownerId: userData.uid
      };

      if (item.originalData) {
        updateData.tempo = item.originalData.tempo || 100;
        updateData.timeSignature = item.originalData.timeSignature || [4, 4];
        updateData.measures = item.originalData.measures || 4;
        if (item.originalData.tracks) updateData.tracks = item.originalData.tracks;
      }

      if (canClaimReward) {
        updateData.rewardClaimed = true;
        updateData.rewardDate = serverTimestamp();
      }

      await setDoc(creationRef, updateData, { merge: true });

      if (canClaimReward) {
        await awardAxePoints(userData.groupId, 'create_sequence');
      }

      showToast(toastMsg);
      setStats(prev => ({
        ...prev,
        latestRhythms: prev.latestRhythms.map(i => i.id === item.id ? { ...i, isPublic: true, type: 'rhythm', rewardClaimed: canClaimReward ? true : i.rewardClaimed } : i)
      }));
    } catch (error) {
      console.error("Erreur publication:", error);
      showToast("Une erreur est survenue lors de la publication.");
    }
  };

  const handlePublishChoreo = async (item) => {
    if (item.isPublic) {
      showToast("Cette création est déjà publique !");
      return;
    }
    if (!window.confirm("Voulez-vous vraiment publier cette création dans le Terreiro ?")) return;

    try {
      const creationRef = doc(db, 'choreographies', item.id);
      const updateData = {
        isPublic: true,
        authorName: associationData?.name || associationData?.nom || 'Association',
        authorGroupId: userData.groupId
      };

      if (!item.rewardClaimed) {
        updateData.rewardClaimed = true;
      }

      await updateDoc(creationRef, updateData);

      if (!item.rewardClaimed) {
        const awarded = await awardAxePoints(userData.groupId, 'create_choreography');
        showToast(`Félicitations ! Votre création est en ligne. Vous remportez ${awarded} Points d'Axé !`);
      } else {
        showToast("Votre création est désormais publique !");
      }

      setStats(prev => ({
        ...prev,
        latestChoreos: prev.latestChoreos.map(i => i.id === item.id ? { ...i, isPublic: true, rewardClaimed: true } : i)
      }));
    } catch (error) {
      console.error("Erreur publication:", error);
      showToast("Une erreur est survenue lors de la publication.");
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (!userData?.groupId) {
        setLoading(false);
        return;
      }

      // Helper to swallow individual permission errors
      const safeGetDocs = async (q) => {
        try {
          return await getDocs(q);
        } catch (e) {
          if (e.code !== 'permission-denied') {
            console.warn("Info fetch:", e.message);
          }
          return null; // Return null if failed
        }
      };

      try {
        // 1. Fetch Users (Membres Actifs) + Pupitres
        const usersRef = collection(db, 'users');
        const qUsers = query(usersRef, where('groupId', '==', userData.groupId), where('statutActuel', '==', 'active'));
        const usersSnap = await safeGetDocs(qUsers);
        
        let pupitresArray = [];
        let activeMembersCount = 0;
        if (usersSnap) {
          activeMembersCount = usersSnap.size;
          const pupitreCounts = {};
          usersSnap.forEach(docSnap => {
            const user = docSnap.data();
            if (!user) return;
            let insts = [];
            if (user.instrument) insts.push(user.instrument);
            else if (Array.isArray(user.instrumentsJoues) && user.instrumentsJoues.length > 0) insts = user.instrumentsJoues;
            
            if (insts.length > 0) {
              insts.forEach(inst => {
                if (typeof inst === 'string') {
                  const cleanInst = inst.trim();
                  pupitreCounts[cleanInst] = (pupitreCounts[cleanInst] || 0) + 1;
                }
              });
            }
          });
          
          pupitresArray = Object.keys(pupitreCounts)
            .map(name => ({ label: name, count: pupitreCounts[name] }))
            .sort((a, b) => b.count - a.count); // Keep all for modal
        }

        // 2. Fetch Events
        const eventsRef = collection(db, 'events');
        const qEvents = query(eventsRef, where('groupId', '==', userData.groupId));
        const eventsSnap = await safeGetDocs(qEvents);
        
        let upcomingEventsCount = 0;
        let nextEvent = null;
        let latestEventsArray = [];
        if (eventsSnap) {
          const tzOffset = (new Date()).getTimezoneOffset() * 60000;
          const todayStr = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
          const upcomingEvents = [];
          
          eventsSnap.forEach(docSnap => {
            const evt = docSnap.data();
            let dateStr = '';
            if (evt.date && typeof evt.date.toDate === 'function') {
              dateStr = evt.date.toDate().toLocaleDateString('en-CA');
            } else if (evt.date && typeof evt.date === 'string') {
              dateStr = evt.date.split('T')[0];
            } else if (evt.dateString) {
              dateStr = evt.dateString.split('T')[0];
            }
            if (dateStr && dateStr >= todayStr) {
              upcomingEvents.push({ ...evt, id: docSnap.id, dateStr });
            }
          });
          
          upcomingEvents.sort((a, b) => a.dateStr.localeCompare(b.dateStr));
          upcomingEventsCount = upcomingEvents.length;
          nextEvent = upcomingEventsCount > 0 ? (upcomingEvents[0].title || upcomingEvents[0].nom || 'Événement') : null;
          latestEventsArray = upcomingEvents.slice(0, 3);
        }

        // 3. Fetch Rhythms from Storage (Catalogue Séquenceur) & Firestore
        let rhythmsList = [];
        try {
          const { ref, listAll } = await import('firebase/storage');
          const { storage } = await import('../../../services/firebase');
          
          // A. Storage
          try {
            const folderRef = ref(storage, `documents/${userData.groupId}/sequencer`);
            const res = await listAll(folderRef);
            res.items.forEach(item => {
               const isJson = /\.json$/i.test(item.name);
               rhythmsList.push({ 
                 id: item.name, 
                 label: item.name.replace(/^\d+_/, '').replace(/\.(json|mp3|wav|ogg|m4a|aac)$/i, ''), 
                 date: parseInt(item.name.split('_')[0]) || 0,
                 type: isJson ? 'section' : 'storage',
                 isPublic: false
               });
            });
          } catch (storageErr) {
            console.warn('[STORAGE] Error fetching audio files from storage:', storageErr);
          }
          
          // B. Séquences Complètes (Presets)
          const firestoreItemsMap = new Map();

          try {
            // 1. Fetch user's own presets
            const qOwner = query(collection(db, 'presets'), where('ownerId', '==', userData.uid));
            const ownerSnap = await getDocs(qOwner);
            ownerSnap.forEach(doc => firestoreItemsMap.set(doc.id, doc));

            // 2. Fetch public presets
            const qPublic = query(collection(db, 'presets'), where('visibility', '==', 'public'));
            const publicSnap = await getDocs(qPublic);
            publicSnap.forEach(doc => firestoreItemsMap.set(doc.id, doc));
            
            // 3. Fetch presets targeted to this user
            const qTarget = query(collection(db, 'presets'), where('targetUserId', '==', userData.uid));
            const targetSnap = await getDocs(qTarget);
            targetSnap.forEach(doc => firestoreItemsMap.set(doc.id, doc));
            
            // Also fetch 'admin_global' visibility if used
            const qGlobal = query(collection(db, 'presets'), where('visibility', '==', 'admin_global'));
            const globalSnap = await getDocs(qGlobal);
            globalSnap.forEach(doc => firestoreItemsMap.set(doc.id, doc));
          } catch (presetErr) {
            console.error('[PRESETS] Error fetching presets:', presetErr.code, presetErr.message);
          }
          
          if (firestoreItemsMap.size > 0) {
            firestoreItemsMap.forEach(docSnap => {
              const data = docSnap.data();
              const isPublic = data.visibility === 'public' || data.visibility === 'admin_global';
              
              let parsedData = data;
              if (data.data) {
                try {
                  parsedData = JSON.parse(LZString.decompressFromBase64(data.data));
                } catch (e) {
                  console.warn("Could not decompress preset data:", e);
                }
              }

              rhythmsList.push({
                id: docSnap.id,
                label: data.name || data.title || 'Sans titre',
                date: data.createdAt || 0,
                type: isPublic ? 'rhythm' : 'section', // rhythm = public tab, section = local tab
                isPublic: isPublic,
                rewardClaimed: data.rewardClaimed || false,
                orderIndex: data.orderIndex !== undefined ? data.orderIndex : 9999,
                originalData: parsedData
              });
            });
          }

          // C. Séquences Publiques Globales
          const qPublicR = query(collection(db, 'presets'), where('visibility', 'in', ['admin_global', 'public']));
          const publicSnapR = await safeGetDocs(qPublicR);
          if (publicSnapR) {
            publicSnapR.forEach(docSnap => {
              const data = docSnap.data();
              // Ne pas ajouter en double si c'est déjà traité (le user est l'owner)
              if (data.ownerId === userData.uid) return;

              let parsedData = data;
              if (data.data) {
                try {
                  parsedData = JSON.parse(LZString.decompressFromBase64(data.data));
                } catch (e) {}
              }

              rhythmsList.push({
                id: docSnap.id,
                label: data.name || data.title || 'Sans titre',
                date: data.createdAt || 0,
                type: 'rhythm', // On le met dans le catalogue public
                isPublic: true,
                rewardClaimed: true, // Non applicable
                originalData: parsedData,
                isExternal: true
              });
            });
          }
          
          rhythmsList.sort((a, b) => {
            if (a.orderIndex !== undefined && b.orderIndex !== undefined && a.orderIndex !== 9999 && b.orderIndex !== 9999) {
              return a.orderIndex - b.orderIndex;
            }
            return b.date - a.date;
          });
        } catch (e) {
          console.warn("Rhythms fetch error:", e.message);
        }

        // 4. Fetch Choreographies
        let choreosList = [];
        
        // A. Fichiers Audio Danse (Stockage brut via metadata de l'utilisateur)
        const choreoStorageRef = collection(db, 'user_dance_audio_files');
        const qChoreoAudio = query(choreoStorageRef, where('userId', '==', userData.uid));
        try {
          const choreoAudioSnap = await safeGetDocs(qChoreoAudio);
          if (choreoAudioSnap) {
             choreoAudioSnap.forEach(docSnap => {
               const item = docSnap.data();
               const isJson = item.name.endsWith('.json');
               choreosList.push({
                 id: docSnap.id,
                 label: item.name,
                 date: parseInt(item.name.split('_')[0]) || 0,
                 type: isJson ? 'section' : 'storage',
                 isPublic: false
               });
             });
          }
        } catch (storageErr) {
          console.warn('[STORAGE] Error fetching choreo audio files from storage:', storageErr);
        }
        
        // B. Séquences Complètes (Choreographies)
        const choreoItemsMap = new Map();
        try {
          const qOwnerChoreo = query(collection(db, 'choreographies'), where('ownerId', '==', userData.uid));
          const ownerChoreoSnap = await safeGetDocs(qOwnerChoreo);
          if (ownerChoreoSnap) ownerChoreoSnap.forEach(doc => choreoItemsMap.set(doc.id, doc));
          
          const qPublicChoreo = query(collection(db, 'choreographies'), where('visibility', '==', 'public'));
          const publicChoreoSnap = await safeGetDocs(qPublicChoreo);
          if (publicChoreoSnap) publicChoreoSnap.forEach(doc => choreoItemsMap.set(doc.id, doc));
          
          const qTargetChoreo = query(collection(db, 'choreographies'), where('targetUserId', '==', userData.uid));
          const targetChoreoSnap = await safeGetDocs(qTargetChoreo);
          if (targetChoreoSnap) targetChoreoSnap.forEach(doc => choreoItemsMap.set(doc.id, doc));
          
          const qGlobalChoreo = query(collection(db, 'choreographies'), where('visibility', '==', 'admin_global'));
          const globalChoreoSnap = await safeGetDocs(qGlobalChoreo);
          if (globalChoreoSnap) globalChoreoSnap.forEach(doc => choreoItemsMap.set(doc.id, doc));
        } catch (choreoErr) {
          console.error('[CHOREOS] Error fetching choreos:', choreoErr.code, choreoErr.message);
        }
        
        if (choreoItemsMap.size > 0) {
          choreoItemsMap.forEach(docSnap => {
            const data = docSnap.data();
            const isPublic = data.visibility === 'public' || data.visibility === 'admin_global';
            
            let parsedData = data;
            if (data.data) {
              try {
                parsedData = JSON.parse(LZString.decompressFromBase64(data.data));
              } catch (e) {}
            }

            choreosList.push({
              id: docSnap.id,
              label: data.name || data.title || 'Sans titre',
              date: data.createdAt || 0,
              type: isPublic ? 'choreo' : 'section',
              isPublic: isPublic,
              rewardClaimed: data.rewardClaimed || false,
              orderIndex: data.orderIndex !== undefined ? data.orderIndex : 9999,
              originalData: parsedData
            });
          });
        }
        
        // C. Séquences Publiques Globales Choreos
        const qPublicChoreo2 = query(collection(db, 'choreographies'), where('visibility', 'in', ['admin_global', 'public']));
        const publicChoreoSnap2 = await safeGetDocs(qPublicChoreo2);
        if (publicChoreoSnap2) {
          publicChoreoSnap2.forEach(docSnap => {
            const data = docSnap.data();
            if (data.ownerId === userData.uid) return;

            let parsedData = data;
            if (data.data) {
              try {
                parsedData = JSON.parse(LZString.decompressFromBase64(data.data));
              } catch (e) {}
            }

            choreosList.push({
              id: docSnap.id,
              label: data.name || data.title || 'Sans titre',
              date: data.createdAt || 0,
              type: 'choreo',
              isPublic: true,
              rewardClaimed: true,
              orderIndex: data.orderIndex !== undefined ? data.orderIndex : 9999,
              originalData: parsedData,
              isGlobal: true,
              authorName: data.authorName || 'Inconnu'
            });
          });
        }
        
        choreosList.sort((a, b) => {
          if (a.orderIndex !== undefined && b.orderIndex !== undefined && a.orderIndex !== 9999 && b.orderIndex !== 9999) {
            return a.orderIndex - b.orderIndex;
          }
          return b.date - a.date;
        });

        // 5. Fetch Newsletter Subscribers
        let subscribersList = [];
        const newsletterRef = collection(db, 'newsletter_subscribers');
        const qNewsletter = query(newsletterRef, where('groupId', '==', userData.groupId));
        const newsletterSnap = await safeGetDocs(qNewsletter);
        if (newsletterSnap) {
           newsletterSnap.forEach(doc => {
             const data = doc.data();
             subscribersList.push({ id: doc.id, label: data.email || data.name || 'Abonné', date: data.createdAt?.toMillis?.() || 0 });
           });
           subscribersList.sort((a, b) => b.date - a.date);
        }

        setStats({
          activeMembers: activeMembersCount,
          pupitres: pupitresArray, // Full array
          upcomingEvents: upcomingEventsCount,
          nextEventName: nextEvent,
          latestEvents: latestEventsArray,
          totalRhythms: rhythmsList.length,
          totalChoreos: choreosList.length,
          newsletterSubscribers: subscribersList.length,
          latestSubscribers: subscribersList,
          latestRhythms: rhythmsList,
          latestChoreos: choreosList,
          vitrineViews: associationData?.vitrineViews || 0
        });
      } catch (error) {
        console.error("Erreur inattendue dans fetchStats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userData?.groupId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 w-full h-full animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((g) => (
            <div key={g} className="flex flex-col gap-3">
               <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
               <div className="h-32 bg-gray-100 rounded-xl border border-gray-100"></div>
               <div className="h-32 bg-gray-100 rounded-xl border border-gray-100"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statGroups = [
    {
      title: "👥 Communauté",
      items: [
        {
          label: "Membres Actifs",
          value: stats.activeMembers,
          icon: <Users className="w-5 h-5 text-blue-600" />,
          bgColor: "bg-blue-100",
          borderColor: "border-blue-200",
          interactive: true,
          onClick: () => setIsPupitreModalOpen(true),
          secondary: stats.pupitres?.length > 0 ? (
            <div className="mt-3 space-y-1.5">
              {stats.pupitres.slice(0, 3).map((p, idx) => (
                <div key={idx} className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500 truncate mr-2 w-16">{p.label}</span>
                  <div className="flex items-center gap-1.5 flex-1">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full" style={{ width: `${Math.max((p.count / Math.max(stats.activeMembers, 1)) * 100, 5)}%` }}></div>
                    </div>
                    <span className="font-bold text-gray-700 w-4 text-right">{p.count}</span>
                  </div>
                </div>
              ))}
              {stats.pupitres.length > 3 && (
                <div className="text-[9px] text-gray-400 text-center pt-1 italic">
                  + {stats.pupitres.length - 3} autres (cliquer pour voir tout)
                </div>
              )}
            </div>
          ) : <span className="text-[10px] text-gray-400 mt-2 block">Aucun pupitre</span>
        },
        {
          label: "Abonnés Vitrine",
          value: stats.newsletterSubscribers,
          icon: <Mail className="w-5 h-5 text-indigo-600" />,
          bgColor: hasPack('essentiel') ? "bg-indigo-100" : "bg-gray-100",
          borderColor: hasPack('essentiel') ? "border-indigo-200" : "border-gray-200",
          isLocked: !hasPack('essentiel'),
          interactive: hasPack('essentiel'),
          onClick: () => setIsSubscribersModalOpen(true),
          secondary: stats.latestSubscribers?.length > 0 ? (
            <div className="mt-3 space-y-1.5">
              {stats.latestSubscribers.slice(0, 3).map((s, idx) => (
                <div key={idx} className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500 truncate mr-2 flex-1">{s.label}</span>
                </div>
              ))}
              {stats.latestSubscribers.length > 3 && (
                <div className="text-[9px] text-gray-400 text-center pt-1 italic">
                  + {stats.latestSubscribers.length - 3} autres (cliquer pour voir tout)
                </div>
              )}
            </div>
          ) : (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] text-gray-400 block">Aucun abonné</span>
              {!hasPack('essentiel') && <Lock className="w-4 h-4 text-gray-400" />}
            </div>
          )
        }
      ]
    },
    {
      title: "🎨 Créativité",
      items: [
        {
          label: "Rythmes Audio",
          value: stats.totalRhythms,
          icon: <Music className="w-5 h-5 text-purple-600" />,
          bgColor: hasPack('association') ? "bg-purple-100" : "bg-gray-100",
          borderColor: hasPack('association') ? "border-purple-200" : "border-gray-200",
          isLocked: !hasPack('association'),
          interactive: hasPack('association'),
          onClick: () => setIsRhythmsModalOpen(true),
          secondary: stats.latestRhythms?.length > 0 ? (
            <div className="mt-3 space-y-1.5">
              {stats.latestRhythms.slice(0, 3).map((r, idx) => (
                <div key={idx} className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500 truncate mr-2 flex-1">{r.label}</span>
                </div>
              ))}
              {stats.latestRhythms.length > 3 && (
                <div className="text-[9px] text-gray-400 text-center pt-1 italic">
                  + {stats.latestRhythms.length - 3} autres (cliquer pour voir tout)
                </div>
              )}
            </div>
          ) : (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] font-bold text-purple-500/80 uppercase tracking-wider block">App Séquenceur</span>
              {!hasPack('association') && <Lock className="w-4 h-4 text-gray-400" />}
            </div>
          )
        },
        {
          label: "Chorégraphies",
          value: stats.totalChoreos,
          icon: <Activity className="w-5 h-5 text-pink-600" />,
          bgColor: hasPack('ecosysteme') ? "bg-pink-100" : "bg-gray-100",
          borderColor: hasPack('ecosysteme') ? "border-pink-200" : "border-gray-200",
          isLocked: !hasPack('ecosysteme'),
          interactive: hasPack('ecosysteme'),
          onClick: () => setIsChoreosModalOpen(true),
          secondary: stats.latestChoreos?.length > 0 ? (
            <div className="mt-3 space-y-1.5">
              {stats.latestChoreos.slice(0, 3).map((c, idx) => (
                <div key={idx} className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500 truncate mr-2 flex-1">{c.label}</span>
                </div>
              ))}
              {stats.latestChoreos.length > 3 && (
                <div className="text-[9px] text-gray-400 text-center pt-1 italic">
                  + {stats.latestChoreos.length - 3} autres (cliquer pour voir tout)
                </div>
              )}
            </div>
          ) : (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] font-bold text-pink-500/80 uppercase tracking-wider block">App Dançador</span>
              {!hasPack('ecosysteme') && <Lock className="w-4 h-4 text-gray-400" />}
            </div>
          )
        }
      ]
    },
    {
      title: "📅 Activité & Vitrine",
      items: [
        {
          label: "Événements à venir",
          value: stats.upcomingEvents,
          icon: <Calendar className="w-5 h-5 text-emerald-600" />,
          bgColor: "bg-emerald-100",
          borderColor: "border-emerald-200",
          interactive: true,
          onClick: () => setIsEventsModalOpen(true),
          secondary: stats.latestEvents && stats.latestEvents.length > 0 ? (
            <div className="mt-3 flex flex-col gap-2 bg-emerald-50 p-2 rounded border border-emerald-100">
              {stats.latestEvents.map((evt, idx) => (
                <div key={evt.id || idx} className="flex items-center gap-2">
                  {evt.coverUrl || evt.photoUrl ? (
                    <img src={evt.coverUrl || evt.photoUrl} alt="Cover" className="w-8 h-8 rounded object-cover shadow-sm" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-emerald-200 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                    </div>
                  )}
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[10px] font-bold text-emerald-900 truncate">{evt.title || evt.nom || 'Événement'}</span>
                    <span className="text-[9px] text-emerald-700">{new Date(evt.dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : <span className="text-[10px] text-gray-400 mt-3 block">Aucun événement planifié</span>
        },
        {
          label: "Vues de la Vitrine",
          value: stats.vitrineViews,
          icon: <Eye className="w-5 h-5 text-cyan-600" />,
          bgColor: hasPack('essentiel') ? "bg-cyan-100" : "bg-gray-100",
          borderColor: hasPack('essentiel') ? "border-cyan-200" : "border-gray-200",
          isLocked: !hasPack('essentiel'),
          interactive: false,
          secondary: (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] text-gray-400 block">Visiteurs sur votre page</span>
              {!hasPack('essentiel') && <Lock className="w-4 h-4 text-gray-400" />}
            </div>
          )
        }
      ]
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-amber-900/10 shadow-sm p-6 w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-[#4a2e1b] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>Santé Globale & Hub</span>
        </h3>
        <button 
          onClick={handleImportPublicCatalog}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-all text-sm flex items-center gap-2"
          title="Importer les rythmes par défaut dans la base de données"
        >
          <Music className="w-4 h-4" />
          Importer Catalogue Public
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {statGroups.map((group, gIdx) => (
          <div key={gIdx} className="flex flex-col gap-3">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 mb-1">
              {group.title}
            </h4>
            <div className="flex flex-col gap-3 flex-1">
              {group.items.map((kpi, idx) => (
                <div 
                  key={idx} 
                  onClick={kpi.interactive ? kpi.onClick : undefined}
                  className={`flex flex-col justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group 
                    ${kpi.interactive ? 'cursor-pointer hover:shadow-md hover:border-blue-300 transition-all' : 'hover:shadow-md transition-shadow'}`}
                >
                  <div className="flex justify-between items-start mb-2 relative z-10">
                    <div className={kpi.isLocked ? "opacity-50" : ""}>
                      <div className="text-2xl font-black text-[#4a2e1b] mb-0.5">{kpi.isLocked ? '-' : kpi.value}</div>
                      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{kpi.label}</div>
                    </div>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${kpi.bgColor} border ${kpi.borderColor}`}>
                      {kpi.isLocked ? <Lock className="w-5 h-5 text-gray-400" /> : kpi.icon}
                    </div>
                  </div>
                  
                  {/* Contenu secondaire */}
                  <div className="relative z-10 mt-auto border-t border-gray-50 pt-3 mt-3">
                    {kpi.secondary}
                  </div>
                  
                  {/* Background decoration */}
                  <div className={`absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-[0.03] ${kpi.bgColor.replace('100', '900')} pointer-events-none group-hover:scale-150 transition-transform duration-700`}></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Répartition Pupitres */}
      {isPupitreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#4a2e1b] flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Répartition par Pupitre
              </h3>
              <button 
                onClick={() => setIsPupitreModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1">
              {stats.pupitres.length > 0 ? (
                <div className="space-y-4">
                  {stats.pupitres.map((p, idx) => (
                    <div key={idx} className="relative">
                      <div className="flex justify-between items-end mb-1">
                        <span className="font-bold text-sm text-gray-700">{p.label}</span>
                        <span className="font-black text-lg text-[#4a2e1b]">{p.count}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${Math.max((p.count / Math.max(stats.activeMembers, 1)) * 100, 2)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Aucun membre avec un pupitre assigné pour le moment.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Analyse des Événements */}
      {isEventsModalOpen && (
        <EventsAnalysisModal 
          groupId={userData?.groupId} 
          onClose={() => setIsEventsModalOpen(false)} 
        />
      )}

      {/* Modal Abonnés Vitrine */}
      {isSubscribersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#4a2e1b] flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                Abonnés Vitrine
              </h3>
              <button 
                onClick={() => setIsSubscribersModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1">
              {stats.latestSubscribers.length > 0 ? (
                <div className="space-y-3">
                  {stats.latestSubscribers.map((item, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                      <span className="font-medium text-gray-800 line-clamp-1 flex-1">{item.label}</span>
                      {item.date > 0 && <span className="text-xs text-gray-400 ml-2 shrink-0">{new Date(item.date).toLocaleDateString()}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Aucun abonné à la vitrine pour le moment.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Rythmes Audio */}
      {isRhythmsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#4a2e1b] flex items-center gap-2">
                <Music className="w-5 h-5 text-purple-600" />
                Rythmes Audio
              </h3>
              <button 
                onClick={() => setIsRhythmsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex border-b border-gray-100 bg-gray-50 px-2">
              <button 
                onClick={() => setActiveRhythmTab('rhythm')}
                className={`flex-1 py-3 text-xs font-bold border-b-2 transition-colors ${activeRhythmTab === 'rhythm' ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Catalogue O-Girador (Public) ({stats.latestRhythms.filter(r => r.type === 'rhythm').length})
              </button>
              <button 
                onClick={() => setActiveRhythmTab('section')}
                className={`flex-1 py-3 text-xs font-bold border-b-2 transition-colors ${activeRhythmTab === 'section' ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Catalogue {associationData?.name || associationData?.nom || 'Local'} (Privé) ({stats.latestRhythms.filter(r => r.type === 'section').length})
              </button>
              <button 
                onClick={() => setActiveRhythmTab('storage')}
                className={`flex-1 py-3 text-xs font-bold border-b-2 transition-colors ${activeRhythmTab === 'storage' ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Fichiers audio ({stats.latestRhythms.filter(r => r.type === 'storage').length})
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 bg-white">
              {(() => {
                const filteredList = stats.latestRhythms.filter(r => r.type === activeRhythmTab);
                if (filteredList.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      Aucun rythme dans cette catégorie.
                    </div>
                  );
                }
                return (
                  <div className="space-y-3">
                    {filteredList.map((item, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between group">
                        <div className="flex-1 mr-2 min-w-0">
                          {(item.type === 'rhythm' || item.type === 'section') ? (
                            <a 
                              href={`https://sequenciador.o-girador.com/app?loadPreset=${item.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium text-gray-800 line-clamp-1 hover:text-purple-600 transition-colors cursor-pointer"
                              title="Ouvrir dans le séquenceur"
                            >
                              {item.label}
                            </a>
                          ) : (
                            <span className="font-medium text-gray-800 line-clamp-1">{item.label}</span>
                          )}
                          {item.date > 0 && <span className="text-xs text-gray-400 block">{new Date(item.date).toLocaleDateString()}</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          {(activeRhythmTab === 'rhythm' || activeRhythmTab === 'section') && !item.isExternal && (
                            <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); moveRhythmItem(idx, -1, filteredList); }}
                                disabled={idx === 0}
                                className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <ArrowUp className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); moveRhythmItem(idx, 1, filteredList); }}
                                disabled={idx === filteredList.length - 1}
                                className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <ArrowDown className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          
                          {item.isExternal ? (
                            <div className="flex items-center justify-center p-2 rounded-lg text-blue-500 bg-blue-50" title="Catalogue Global">
                              <Globe className="w-4 h-4" />
                            </div>
                          ) : (
                            <button 
                              onClick={() => handlePublishRhythm(item)}
                              disabled={item.isPublic}
                              className={`flex items-center justify-center p-2 rounded-lg transition-colors ${item.isPublic ? 'text-blue-500 bg-blue-50 cursor-default' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                              title={item.isPublic ? "Déjà publié" : "Publier dans le Terreiro"}
                            >
                              <Globe className="w-4 h-4" />
                            </button>
                          )}

                          {!item.isExternal && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteRhythm(item); }}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1 opacity-0 group-hover:opacity-100"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Modal Chorégraphies */}
      {isChoreosModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-pink-50">
              <h3 className="text-lg font-bold text-pink-900 flex items-center gap-2">
                <Activity className="w-6 h-6 text-pink-600" />
                Chorégraphies & Danse
              </h3>
              <button 
                onClick={() => setIsChoreosModalOpen(false)}
                className="p-1 text-pink-400 hover:text-pink-700 hover:bg-pink-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex border-b bg-gray-50">
              <button 
                onClick={() => setActiveChoreoTab('choreo')}
                className={`flex-1 py-3 text-xs font-bold border-b-2 transition-colors ${activeChoreoTab === 'choreo' ? 'border-pink-600 text-pink-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Catalogue O-Girador (Public) ({stats.latestChoreos.filter(r => r.type === 'choreo').length})
              </button>
              <button 
                onClick={() => setActiveChoreoTab('section')}
                className={`flex-1 py-3 text-xs font-bold border-b-2 transition-colors ${activeChoreoTab === 'section' ? 'border-pink-600 text-pink-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Catalogue {associationData?.name || associationData?.nom || 'Local'} (Privé) ({stats.latestChoreos.filter(r => r.type === 'section').length})
              </button>
              <button 
                onClick={() => setActiveChoreoTab('storage')}
                className={`flex-1 py-3 text-xs font-bold border-b-2 transition-colors ${activeChoreoTab === 'storage' ? 'border-pink-600 text-pink-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Fichiers audio ({stats.latestChoreos.filter(r => r.type === 'storage').length})
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 bg-white">
              {(() => {
                const filteredList = stats.latestChoreos.filter(r => r.type === activeChoreoTab);
                if (filteredList.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      Aucune donnée dans cette catégorie.
                    </div>
                  );
                }
                return (
                  <div className="space-y-3">
                    {filteredList.map((item, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between group hover:border-pink-200 transition-colors">
                        <div className="flex-1 mr-2 min-w-0">
                          <h4 className="font-bold text-gray-800 truncate">{item.label}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {item.date && typeof item.date !== 'number' ? new Date(item.date.seconds * 1000).toLocaleDateString('fr-FR') : (item.date ? new Date(item.date).toLocaleDateString('fr-FR') : 'Date inconnue')}
                            </span>
                            {item.isGlobal && (
                              <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                Par {item.authorName}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          {item.isExternal ? (
                            <div className="flex items-center justify-center p-2 rounded-lg text-blue-500 bg-blue-50" title="Catalogue Global">
                              <Globe className="w-4 h-4" />
                            </div>
                          ) : (
                            <button 
                              onClick={() => {}}
                              disabled={item.isPublic || item.type === 'storage'}
                              className={`flex items-center justify-center p-2 rounded-lg transition-colors ${(item.isPublic || item.type === 'storage') ? 'text-blue-500 bg-blue-50 cursor-default opacity-50' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                              title={item.isPublic ? "Déjà publié" : "Publier"}
                            >
                              <Globe className="w-4 h-4" />
                            </button>
                          )}

                          {!item.isExternal && (
                            <button
                              onClick={(e) => { e.stopPropagation(); }}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1 opacity-0 group-hover:opacity-100"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-gray-800 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-gray-700">
            <Check className="w-5 h-5 text-green-400" />
            <p className="font-bold text-sm">{toastMessage}</p>
          </div>
        </div>
      )}

    </div>
  );
}

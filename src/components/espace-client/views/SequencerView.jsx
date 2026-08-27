import React, { useState, useEffect } from 'react';
import { db, storage } from '../../../services/firebase';
import { collection, query, where, getDocs, doc, setDoc, updateDoc, increment, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { ref, listAll } from 'firebase/storage';
import { ArrowLeft, Plus, Music, Edit3, ExternalLink, Link as LinkIcon, Check, Globe, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import LZString from 'lz-string';

export default function SequencerView({ userData, associationData, onBack }) {
  const [items, setItems] = useState([]);
  const [publicItems, setPublicItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShare = (id) => {
    const url = `${window.location.origin}/?import_id=${id}&type=rythme#espace-client`;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedId(id);
        showToast("Lien de partage copié !");
        setTimeout(() => setCopiedId(null), 2000);
      });
    } else {
      prompt("Copiez ce lien de partage (Ctrl+C, Entrée) :", url);
    }
  };

  const isValidForPoints = (rythme) => {
    const measuresCount = Array.isArray(rythme.measures) ? rythme.measures.length : (Number(rythme.measures) || 0);
    if (measuresCount < 8) return false;

    const tracks = rythme.tracks || [];
    let hasAlfaia = false;
    let hasCaixaOrTarol = false;
    let hasGongue = false;
    let hasMineiroOrAbe = false;

    tracks.forEach(track => {
      if (track.isMuted) return;

      const instr = (track.instrument || track.name || track.id || '').toLowerCase();
      if (instr.includes('alfaia')) hasAlfaia = true;
      if (instr.includes('caixa') || instr.includes('tarol')) hasCaixaOrTarol = true;
      if (instr.includes('gongue') || instr.includes('gonguê') || instr.includes('gong')) hasGongue = true;
      if (instr.includes('mineiro') || instr.includes('abe') || instr.includes('abê')) hasMineiroOrAbe = true;
    });

    return hasAlfaia && hasCaixaOrTarol && hasGongue && hasMineiroOrAbe;
  };

  const handlePublish = async (item) => {
    if (item.isPublic) {
      showToast("Cette création est déjà publique !");
      return;
    }

    if (!window.confirm("Voulez-vous vraiment publier cette création dans le Terreiro ?")) return;

    try {
      const isEligible = isValidForPoints(item);
      let canClaimReward = false;
      let toastMsg = "";

      if (!item.rewardClaimed && isEligible) {
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
      } else if (!item.rewardClaimed && !isEligible) {
        toastMsg = "Morceau publié ! Note : Les points sont réservés aux arrangements complets (min 8 mesures, 4 instruments).";
      } else {
        toastMsg = "Votre création est désormais publique !";
      }

      const creationRef = doc(db, 'presets', item.id);
      const updateData = {
        title: item.title || item.name || 'Sans titre',
        visibility: 'public',
        isPublic: true,
        authorName: associationData?.name || associationData?.nom || 'Association',
        ownerId: userData.uid
      };

      if (canClaimReward) {
        updateData.rewardClaimed = true;
        updateData.rewardDate = serverTimestamp();
      }

      await setDoc(creationRef, updateData, { merge: true });

      if (canClaimReward) {
        const groupRef = doc(db, 'associations', userData.groupId);
        await updateDoc(groupRef, {
          contributionPoints: increment(25)
        });
      }

      showToast(toastMsg);
      setItems(items.map(i => i.id === item.id ? { ...i, isPublic: true, rewardClaimed: canClaimReward ? true : i.rewardClaimed } : i));
    } catch (error) {
      console.error("Erreur publication:", error);
      showToast("Une erreur est survenue lors de la publication.");
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer le rythme "${item.title}" ?`)) return;

    try {
      if (item.source === 'firestore') {
        await deleteDoc(doc(db, 'presets', item.id));
      } else {
        showToast("Impossible de supprimer un ancien fichier Storage ici.");
        return;
      }
      
      setItems(items.filter(i => i.id !== item.id));
      showToast("Rythme supprimé avec succès !");
    } catch (error) {
      console.error("Erreur suppression:", error);
      showToast("Une erreur est survenue lors de la suppression.");
    }
  };

  const moveItem = async (index, direction) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === items.length - 1)) return;

    const newItems = [...items];
    const targetIndex = index + direction;
    
    // Échange dans la liste locale
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    
    setItems(newItems);

    try {
      const updatePromises = [];
      if (newItems[index].source === 'firestore') {
        updatePromises.push(updateDoc(doc(db, 'presets', newItems[index].id), { orderIndex: index }));
      }
      if (newItems[targetIndex].source === 'firestore') {
        updatePromises.push(updateDoc(doc(db, 'presets', newItems[targetIndex].id), { orderIndex: targetIndex }));
      }
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Erreur lors de la réorganisation:", error);
      showToast("Erreur lors de l'enregistrement de l'ordre.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!userData?.groupId) return;
      
      try {
        // 1. Récupérer le statut de publication depuis Firestore (presets)
        const presetsRef = collection(db, 'presets');
        const q = query(presetsRef, where('ownerId', '==', userData.uid));
        const snap = await getDocs(q);
        
        const publishedMap = {};
        snap.forEach(d => {
          publishedMap[d.id] = d.data();
        });
        
        // 2. Récupérer le catalogue depuis Storage
        const folderRef = ref(storage, `documents/${userData.groupId}/sequencer`);
        const res = await listAll(folderRef);
        
        const fetchedItems = await Promise.all(
          res.items.map(async (itemRef) => {
            const rawName = itemRef.name;
            const cleanName = rawName.replace(/^\d+_/, '').replace(/\.(json|mp3|wav|ogg|m4a|aac)$/i, '');
            const isAudio = /\.(mp3|wav|ogg|m4a|aac)$/i.test(rawName);
            
            const publishedData = publishedMap[rawName];
            
            return {
              id: rawName,
              title: cleanName,
              isAudio,
              isPublic: !!publishedData?.isPublic,
              rewardClaimed: !!publishedData?.rewardClaimed,
              dateCreation: parseInt(rawName.split('_')[0]) || 0
            };
          })
        );
        
        // 3. Récupérer les créations du Séquenceur (Firestore : presets)
        const firestoreItems = [];
        try {
          console.log('[SequencerView PRESETS] Fetching for user:', userData.uid);
          
          const firestoreItemsMap = new Map();
          
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

          console.log('[SequencerView PRESETS] Found unique documents:', firestoreItemsMap.size);
          
          const processFirestoreDoc = (docSnap) => {
             const data = docSnap.data();
             
             let parsedData = data;
             if (data.data) {
               try {
                 parsedData = JSON.parse(LZString.decompressFromBase64(data.data));
               } catch(e) {}
             }

             const publishedData = publishedMap[docSnap.id];
             firestoreItems.push({
               id: docSnap.id,
               title: data.name || data.title || 'Sans titre',
               isAudio: false,
               isPublic: data.visibility === 'public' || data.visibility === 'admin_global' || !!publishedData?.isPublic,
               rewardClaimed: !!publishedData?.rewardClaimed,
               dateCreation: data.createdAt || 0,
               orderIndex: data.orderIndex !== undefined ? data.orderIndex : 9999,
               source: 'firestore',
               originalData: parsedData
             });
          };
          
          firestoreItemsMap.forEach(processFirestoreDoc);
        } catch (fsError) {
          console.error("[SequencerView PRESETS] Error:", fsError.code, fsError.message);
        }
        
        const allFetchedItems = [...fetchedItems, ...firestoreItems];
        
        // Tri par orderIndex d'abord, puis par date décroissante
        allFetchedItems.sort((a, b) => {
          if (a.orderIndex !== undefined && b.orderIndex !== undefined && a.orderIndex !== 9999 && b.orderIndex !== 9999) {
            return a.orderIndex - b.orderIndex;
          }
          return b.dateCreation - a.dateCreation;
        });
        
        setItems(allFetchedItems);

        // 4. Récupérer le catalogue public (Global)
        const publicFetchedItems = [];
        try {
          const qPublic = query(collection(db, 'presets'), where('visibility', 'in', ['admin_global', 'public']));
          const publicSnap = await getDocs(qPublic);
          
          publicSnap.forEach(docSnap => {
            const data = docSnap.data();
            // Ne pas l'ajouter s'il appartient déjà à l'utilisateur (déjà dans items)
            if (data.ownerId === userData.uid) return;

            let parsedData = data;
            if (data.data) {
              try {
                parsedData = JSON.parse(LZString.decompressFromBase64(data.data));
              } catch(e) {}
            }

            publicFetchedItems.push({
              id: docSnap.id,
              title: data.name || data.title || 'Sans titre',
              authorName: data.authorName || 'O Girador',
              dateCreation: data.createdAt || 0,
              originalData: parsedData
            });
          });
          publicFetchedItems.sort((a, b) => b.dateCreation - a.dateCreation);
          setPublicItems(publicFetchedItems.slice(0, 3));
        } catch (pubErr) {
          console.warn("Could not fetch public catalog:", pubErr);
        }

      } catch (error) {
        console.error("Erreur fetch catalogue sequencer:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userData?.groupId]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-amber-800 hover:text-amber-600 font-bold text-sm transition-colors w-max bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au tableau de bord
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fdf6e7] rounded-xl p-6 border border-amber-900/10 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-[#4a2e1b] font-cordel mb-1 flex items-center gap-2">
            <img src="/logos/sequenciador.png" alt="Séquenceur" className="w-8 h-8 rounded-lg" onError={(e) => e.target.style.display='none'} />
            Séquenceur Audio
          </h2>
          <p className="text-[#8b4513] text-sm">Créez et arrangez les rythmes de votre association.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white text-gray-400 font-bold text-sm rounded-lg border border-gray-200 cursor-not-allowed">
            Voir tout le catalogue
          </button>
          <a 
            href="https://sequenciador.o-girador.com/app" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[#d2691e] hover:bg-[#b05819] text-white font-bold text-sm rounded-lg transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            Composer un rythme
            <ExternalLink className="w-3 h-3 opacity-70 ml-1" />
          </a>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2 uppercase tracking-wider text-sm">
          <Music className="w-4 h-4 text-purple-600" />
          Rythmes récemment modifiés
        </h3>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="flex flex-col gap-3">
            {items.map((item, index) => (
              <div key={item.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row justify-between hover:shadow-md transition-shadow group gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 line-clamp-1">{item.name || item.title || 'Rythme sans titre'}</h4>
                  <p className="text-xs text-gray-500 mt-1">{item.tempo ? `${item.tempo} BPM` : 'Tempo par défaut'}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => moveItem(index, -1)}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400"
                      title="Monter"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => moveItem(index, 1)}
                      disabled={index === items.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400"
                      title="Descendre"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleShare(item.id)}
                      className="flex items-center justify-center w-8 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-[#d2691e] hover:border-[#d2691e] transition-colors"
                      title="Partager le rythme"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <LinkIcon className="w-3.5 h-3.5" />}
                    </button>
                    <button 
                      onClick={() => handlePublish(item)}
                      disabled={item.isPublic}
                      className={`flex items-center justify-center w-8 py-1.5 bg-white border border-gray-200 rounded-lg transition-colors ${item.isPublic ? 'text-blue-500 border-blue-200 bg-blue-50 cursor-default' : 'text-gray-500 hover:text-blue-600 hover:border-blue-600'}`}
                      title={item.isPublic ? "Déjà publié" : "Publier dans le Terreiro"}
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item)}
                      className="flex items-center justify-center w-8 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-red-500 hover:border-red-500 hover:bg-red-50 transition-all"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Music className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium mb-4">Vous n'avez pas encore créé de rythme.</p>
            <a 
              href="https://sequenciador.o-girador.com/app" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 font-bold text-sm rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Composer mon premier rythme
            </a>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2 uppercase tracking-wider text-sm">
          <Globe className="w-4 h-4 text-blue-600" />
          Catalogue Public (Communauté)
        </h3>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : publicItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {publicItems.map(item => (
              <div key={item.id} className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow group">
                <div>
                  <h4 className="font-bold text-gray-800 line-clamp-1">{item.title}</h4>
                  <p className="text-xs text-blue-600 mt-1">Par {item.authorName}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={() => handleShare(item.id)}
                    className="flex-1 flex items-center justify-center py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-bold text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                    Ouvrir
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Globe className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Aucun rythme public disponible pour le moment.</p>
          </div>
        )}
      </div>

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

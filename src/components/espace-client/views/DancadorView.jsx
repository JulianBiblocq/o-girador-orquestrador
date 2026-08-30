import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ArrowLeft, Plus, Activity, Edit3, ExternalLink, Link as LinkIcon, Check, Globe, Music, PlayCircle } from 'lucide-react';
import { awardAxePoints } from '../../../services/gamificationService';

export default function DancadorView({ userData, associationData, onBack }) {
  const [items, setItems] = useState([]);
  const [audios, setAudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShare = (id) => {
    const url = `${window.location.origin}/?import_id=${id}&type=choreography#espace-client`;
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

  const handlePublish = async (item) => {
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

      setItems(items.map(i => i.id === item.id ? { ...i, isPublic: true, rewardClaimed: true } : i));
    } catch (error) {
      console.error("Erreur publication:", error);
      showToast("Une erreur est survenue lors de la publication.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!userData?.groupId) return;
      
      try {
        const ref = collection(db, 'choreographies');
        const q = query(ref, where('groupId', '==', userData.groupId));
        const snap = await getDocs(q);
        
        let docs = [];
        snap.forEach(doc => docs.push({ id: doc.id, ...doc.data() }));
        
        // Tri en mémoire
        docs.sort((a, b) => {
          const dateA = a.dateCreation?.toMillis?.() || a.dateCreation || 0;
          const dateB = b.dateCreation?.toMillis?.() || b.dateCreation || 0;
          return dateB - dateA;
        });
        
        setItems(docs.slice(0, 3));

        // Fetch audios
        const audiosRef = collection(db, 'audio_masters');
        const qAudios = query(audiosRef, where('tenantId', '==', userData.groupId));
        const snapAudios = await getDocs(qAudios);
        let audioDocs = [];
        snapAudios.forEach(doc => audioDocs.push({ id: doc.id, ...doc.data() }));
        audioDocs.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        setAudios(audioDocs.slice(0, 3));
      } catch (error) {
        console.error("Erreur fetch choreographies:", error);
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
            <img src="/logos/dancador.png" alt="Dançador" className="w-8 h-8 rounded-lg" onError={(e) => e.target.style.display='none'} />
            Studio Chorégraphique
          </h2>
          <p className="text-[#8b4513] text-sm">Gérez et partagez les chorégraphies de votre groupe.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white text-gray-400 font-bold text-sm rounded-lg border border-gray-200 cursor-not-allowed">
            Voir tout le catalogue
          </button>
          <a 
            href="https://dancador.o-girador.com" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[#d2691e] hover:bg-[#b05819] text-white font-bold text-sm rounded-lg transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            Créer une chorégraphie
            <ExternalLink className="w-3 h-3 opacity-70 ml-1" />
          </a>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2 uppercase tracking-wider text-sm">
          <Activity className="w-4 h-4 text-pink-600" />
          Chorégraphies récentes
        </h3>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {items.map(item => (
              <div key={item.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow group">
                <div>
                  <h4 className="font-bold text-gray-800 line-clamp-1">{item.title || item.nom || 'Sans titre'}</h4>
                  <p className="text-xs text-gray-500 mt-1">{item.style || 'Général'}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 group-hover:border-pink-300 group-hover:text-pink-600 transition-colors cursor-not-allowed">
                    <Edit3 className="w-3.5 h-3.5" />
                    Éditer
                  </button>
                  <button 
                    onClick={() => handleShare(item.id)}
                    className="flex items-center justify-center w-8 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-[#d2691e] hover:border-[#d2691e] transition-colors"
                    title="Partager la chorégraphie"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <LinkIcon className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Activity className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium mb-4">Vous n'avez pas encore créé de chorégraphie.</p>
            <a 
              href="https://dancador.o-girador.com" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-700 hover:bg-pink-200 font-bold text-sm rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Créer ma première chorégraphie
            </a>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2 uppercase tracking-wider text-sm">
          <Music className="w-4 h-4 text-blue-600" />
          Masters Audio (Derniers enregistrements)
        </h3>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : audios.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {audios.map(audio => (
              <div key={audio.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow group">
                <div>
                  <h4 className="font-bold text-gray-800 line-clamp-1">{audio.nom || 'Piste audio sans nom'}</h4>
                  <p className="text-xs text-gray-500 mt-1">{audio.bpm ? `${audio.bpm} BPM` : 'BPM inconnu'}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  {audio.audioUrl && (
                    <a 
                      href={audio.audioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      Écouter
                    </a>
                  )}
                  <button 
                    onClick={() => handleShare(audio.id)}
                    className="flex items-center justify-center w-8 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-blue-600 hover:border-blue-600 transition-colors"
                    title="Partager l'audio"
                  >
                    {copiedId === audio.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <LinkIcon className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Music className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium mb-4">Aucun enregistrement audio disponible.</p>
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

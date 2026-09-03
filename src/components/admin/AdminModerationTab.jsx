import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { ShieldAlert, Music, Activity, Trash2, EyeOff, Loader2 } from 'lucide-react';

export default function AdminModerationTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchPublicItems();
  }, []);

  const fetchPublicItems = async () => {
    setLoading(true);
    try {
      const rhythmsRef = collection(db, 'rhythms');
      const qRhythms = query(rhythmsRef, where('isPublic', '==', true));
      const snapRhythms = await getDocs(qRhythms);
      
      const choroRef = collection(db, 'choreographies');
      const qChoro = query(choroRef, where('isPublic', '==', true));
      const snapChoro = await getDocs(qChoro);
      
      const docsRef = collection(db, 'documents');
      const qDocs = query(docsRef, where('isPublic', '==', true));
      const snapDocs = await getDocs(qDocs);
      
      const modelsRef = collection(db, 'instrument_models');
      const qModels = query(modelsRef, where('isPublic', '==', true));
      const snapModels = await getDocs(qModels);
      
      const allItems = [];
      
      snapRhythms.forEach(doc => {
        const data = doc.data();
        allItems.push({
          id: doc.id,
          collection: 'rhythms',
          type: 'Audio',
          title: data.title || 'Rythme Sans Nom',
          authorName: data.authorName || data.groupId || 'Inconnu',
          groupId: data.groupId,
          createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now()
        });
      });
      
      snapChoro.forEach(doc => {
        const data = doc.data();
        allItems.push({
          id: doc.id,
          collection: 'choreographies',
          type: 'Chorégraphie',
          title: data.title || 'Chorégraphie Sans Nom',
          authorName: data.authorName || data.groupId || 'Inconnu',
          groupId: data.groupId,
          createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now()
        });
      });
      
      snapDocs.forEach(doc => {
        const data = doc.data();
        allItems.push({
          id: doc.id,
          collection: 'documents',
          type: 'Document (Varal)',
          title: data.titre || 'Document Sans Titre',
          authorName: data.authorName || data.authorGroupId || data.groupId || 'Inconnu',
          groupId: data.authorGroupId || data.groupId,
          createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now()
        });
      });
      
      snapModels.forEach(doc => {
        const data = doc.data();
        allItems.push({
          id: doc.id,
          collection: 'instrument_models',
          type: 'Modèle Fabrication',
          title: data.nom || 'Modèle Sans Nom',
          authorName: data.authorName || data.authorGroupId || data.groupId || 'Inconnu',
          groupId: data.authorGroupId || data.groupId,
          createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now()
        });
      });
      
      // Trier du plus récent au plus ancien
      allItems.sort((a, b) => b.createdAt - a.createdAt);
      
      setItems(allItems);
    } catch (error) {
      console.error("Erreur lors de la récupération du catalogue:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (item) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir retirer "${item.title}" du catalogue public ? L'association perdra 50 points de Karma.`)) {
      return;
    }

    setProcessingId(item.id);
    try {
      // 1. Mettre à jour l'item pour isPublic: false
      const itemRef = doc(db, item.collection, item.id);
      
      // 2. Récupérer l'association pour réduire les points
      let newPoints = 0;
      if (item.groupId) {
        const assocRef = doc(db, 'associations', item.groupId);
        const assocSnap = await getDoc(assocRef);
        
        if (assocSnap.exists()) {
          const currentPoints = assocSnap.data().contributionPoints || 0;
          newPoints = Math.max(0, currentPoints - 50); // Ne pas descendre sous zéro
          
          const batch = writeBatch(db);
          batch.update(itemRef, { isPublic: false });
          batch.update(assocRef, { contributionPoints: newPoints });
          await batch.commit();
        } else {
          // Si l'association n'existe plus, on met juste à jour l'item
          await updateDoc(itemRef, { isPublic: false });
        }
      } else {
        await updateDoc(itemRef, { isPublic: false });
      }

      // 3. Mise à jour de l'UI localement
      setItems(prev => prev.filter(i => i.id !== item.id));

    } catch (error) {
      console.error("Erreur lors de la révocation:", error);
      alert("Une erreur est survenue lors de l'opération.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-[#4a2e1b]">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="font-bold">Chargement du catalogue public...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50/50 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Modération du Catalogue Public</h3>
              <p className="text-sm text-gray-500">
                Gérez les contenus publiés par les associations. Les contenus révoqués font perdre 50 points de Karma à leur auteur.
              </p>
            </div>
          </div>
          <div className="bg-white px-4 py-2 border border-gray-200 rounded-lg font-bold text-sm text-gray-700 shadow-sm">
            {items.length} contenu{items.length !== 1 && 's'} public{items.length !== 1 && 's'}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center bg-gray-50/30">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-xl text-gray-900 mb-2">✅ Aucun contenu public pour le moment</h4>
            <p className="text-gray-500 max-w-sm mx-auto">
              Tout est sous contrôle. Lorsqu'une association publiera un rythme ou une chorégraphie, il apparaîtra ici.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                  <th className="p-4">Création</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Auteur</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-gray-900 truncate max-w-xs" title={item.title}>
                        {item.title}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        item.type === 'Audio' ? 'bg-blue-100 text-blue-700' : 
                        item.type === 'Chorégraphie' ? 'bg-purple-100 text-purple-700' :
                        item.type === 'Modèle Fabrication' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {item.type === 'Audio' ? <Music className="w-3.5 h-3.5" /> : 
                         item.type === 'Chorégraphie' ? <Activity className="w-3.5 h-3.5" /> : 
                         null}
                        {item.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                        {item.authorName}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleRevoke(item)}
                        disabled={processingId === item.id}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all border ${
                          processingId === item.id 
                            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300'
                        }`}
                        title="Retirer du catalogue public"
                      >
                        {processingId === item.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Traitement...
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4" />
                            Révoquer
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

/**
 * Vue principale du Séquenceur Audio dans l'Espace Client.
 * Affiche le catalogue privé du groupe (et du Mestre) ainsi que le catalogue public,
 * avec possibilité d'ouvrir les morceaux dans l'application, de les réorganiser,
 * de les partager et de les supprimer.
 */

import React, { useState } from 'react';
import { db } from '../../../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Plus, Music, Check } from 'lucide-react';
import DeleteConfirmModal from '../modals/DeleteConfirmModal';
import { deleteAudioResource } from '../../../services/audioDeletionService';
import { launchCrossApp } from '../../../utils/crossAppAuth';
import { getEcosystemUrl } from '../../../constants/ecosystemUrls';
import { useSequencerPresets } from './useSequencerPresets';
import SequencerHeader from './SequencerHeader';
import SequencerItemCard from './SequencerItemCard';
import SequencerPublicCatalog from './SequencerPublicCatalog';

export default function SequencerView({ userData, associationData, onBack }) {
  const { items, setItems, publicItems, loading } = useSequencerPresets(userData);
  const [copiedId, setCopiedId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Affichage temporaire d'un toast informatif
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Ouverture du Séquenciad'or avec transmission fluide de l'authentification
  const handleOpenSequencer = (path = '/app') => {
    const url = getEcosystemUrl('sequenciador', path);
    launchCrossApp(url, { appKey: 'sequenciador', appLabel: 'le Séquenceur' });
  };

  // Copie du lien direct de partage du rythme
  const handleShare = (id) => {
    const url = `${window.location.origin}/?import_id=${id}&type=rythme#espace-client`;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedId(id);
        showToast('Lien de partage copié !');
        setTimeout(() => setCopiedId(null), 2000);
      });
    } else {
      prompt('Copiez ce lien de partage (Ctrl+C, Entrée) :', url);
    }
  };

  // Suppression d'un morceau avec confirmation
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteAudioResource(itemToDelete, {
        groupId: userData?.groupId,
        collection: 'presets'
      });
      setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
      showToast('Le fichier audio a bien été retiré du catalogue.');
      setItemToDelete(null);
    } catch (error) {
      console.error('Erreur suppression :', error);
      showToast('Une erreur est survenue lors de la suppression.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Réorganisation par glissement haut/bas dans la liste locale et persistance Firestore
  const moveItem = async (index, direction) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === items.length - 1)) return;
    const newItems = [...items];
    const targetIndex = index + direction;
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
      console.error('Erreur réorganisation :', error);
      showToast("Erreur lors de l'enregistrement de l'ordre.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* En-tête et navigation */}
      <SequencerHeader onBack={onBack} onOpenSequencer={handleOpenSequencer} />

      {/* Section 1 : Catalogue Privé de l'association */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2 uppercase tracking-wider text-sm">
          <Music className="w-4 h-4 text-purple-600" />
          Catalogue {associationData?.name || associationData?.nom || 'Local'} (Privé)
        </h3>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="flex flex-col gap-3">
            {items.map((item, index) => (
              <SequencerItemCard
                key={item.id}
                item={item}
                index={index}
                totalItems={items.length}
                copiedId={copiedId}
                onOpenSequencer={handleOpenSequencer}
                onMove={moveItem}
                onShare={handleShare}
                onDelete={setItemToDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Music className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium mb-4">Aucun rythme enregistré pour le moment dans votre groupe.</p>
            <a
              href={getEcosystemUrl('sequenciador', '/app')}
              onClick={(e) => { e.preventDefault(); handleOpenSequencer('/app'); }}
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

      {/* Section 2 : Catalogue Public O Girador */}
      <SequencerPublicCatalog
        publicItems={publicItems}
        loading={loading}
        onOpenSequencer={handleOpenSequencer}
      />

      {/* Modale de confirmation de suppression */}
      <DeleteConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => { if (!isDeleting) setItemToDelete(null); }}
        onConfirm={confirmDelete}
        itemName={itemToDelete?.title}
        itemType="le rythme"
        isDeleting={isDeleting}
      />

      {/* Notification Toast */}
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

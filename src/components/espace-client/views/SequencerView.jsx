/**
 * Vue Banque Rythmique unifiée du Séquenceur dans l'Espace Client (SequencerView.jsx).
 * Centralise morceaux (presets), sections et motifs avec pré-écoute, filtres et suppression sécurisée.
 */

import React, { useState, useMemo } from 'react';
import { Check } from 'lucide-react';
import { AudioPreviewProvider } from './AudioPreviewContext.jsx';
import { useResourceCatalog } from './hooks/useResourceCatalog.js';
import AudioResourceCard from './AudioResourceCard.jsx';
import ResourceFiltersBar from './ResourceFiltersBar.jsx';
import SequencerHeader from './SequencerHeader.jsx';
import DeleteConfirmModal from '../modals/DeleteConfirmModal.jsx';
import { deleteAudioResource } from '../../../services/audioDeletionService.js';
import { launchCrossApp } from '../../../utils/crossAppAuth.js';
import { getEcosystemUrl } from '../../../constants/ecosystemUrls.js';

const TABS = [
  { id: 'presets', label: 'Morceaux', icon: '🎵' }, { id: 'sections', label: 'Sections', icon: '🧱' }, { id: 'patterns', label: 'Motifs', icon: '🪘' }
];

function SequencerViewContent({ userData, onBack }) {
  const [activeTab, setActiveTab] = useState('presets');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [selectedInstrument, setSelectedInstrument] = useState('all');
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const {
    resources,
    isLoading,
    renameResource,
    updateVisibility,
    removeResourceLocally,
    refetch
  } = useResourceCatalog(activeTab, userData);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenSequencer = (path = '/app') => {
    launchCrossApp(getEcosystemUrl('sequenciador', path), { appKey: 'sequenciador', appLabel: "le Séquenceur" });
  };

  // Détection des instruments uniques présents dans la collection courante
  const availableInstruments = useMemo(() => {
    const set = new Set();
    resources.forEach((r) => {
      const inst = r.instrument || r.pupitre || r.instrumentName;
      if (inst) set.add(inst);
    });
    return Array.from(set).sort();
  }, [resources]);

  // Filtrage combiné en mémoire (recherche, visibilité, instrument)
  const filteredResources = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const userUid = userData?.uid;
    const userGroup = (userData?.groupId || '').toLowerCase();

    return resources.filter((item) => {
      if (query && !(item.name || item.title || '').toLowerCase().includes(query)) return false;
      if (visibilityFilter === 'mine' && item.ownerId !== userUid) return false;
      if (visibilityFilter === 'group' && (!item.groupId || item.groupId.toLowerCase() !== userGroup)) return false;
      if (visibilityFilter === 'public' && item.visibility !== 'public' && !item.isPublic) return false;
      if (selectedInstrument !== 'all') {
        const inst = item.instrument || item.pupitre || item.instrumentName;
        if (inst !== selectedInstrument) return false;
      }
      return true;
    });
  }, [resources, searchQuery, visibilityFilter, selectedInstrument, userData]);

  // Suppression d'une ressource avec confirmation et mise à jour locale
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteAudioResource(itemToDelete, { groupId: userData?.groupId, collection: activeTab });
      removeResourceLocally(itemToDelete.id);
      showToast('La ressource a bien été retirée du catalogue.');
      setItemToDelete(null);
    } catch (err) {
      console.error('Erreur suppression :', err);
      showToast('Une erreur est survenue lors de la suppression.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <SequencerHeader onBack={onBack} onOpenSequencer={handleOpenSequencer} />

      {/* Navigation linogravure Cordel par collection */}
      <div className="flex items-center gap-2 border-b border-[#8b4513]/40 pb-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => { setActiveTab(tab.id); setSearchQuery(''); setSelectedInstrument('all'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-xl font-cordel font-bold text-sm transition-all border-t border-x ${
                isActive
                  ? 'bg-[#1c1613] text-amber-400 border-[#c05621] shadow-lg -mb-1.5 pb-2.5 border-b-0'
                  : 'bg-stone-950/60 text-stone-400 border-transparent hover:text-stone-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Barre de recherche et de filtres */}
      <ResourceFiltersBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        visibilityFilter={visibilityFilter}
        onVisibilityFilterChange={setVisibilityFilter}
        selectedInstrument={selectedInstrument}
        onInstrumentChange={setSelectedInstrument}
        availableInstruments={availableInstruments}
        activeTab={activeTab}
        onRefresh={() => refetch(true)}
        isLoading={isLoading}
      />

      {/* Grille des cartes ressources audio */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-[#1c1613]/60 border border-[#8b4513]/20 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((item) => (
            <AudioResourceCard
              key={item.id}
              item={item}
              type={activeTab}
              onRename={renameResource}
              onVisibilityChange={updateVisibility}
              onRequestDelete={(it) => setItemToDelete(it)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-[#1c1613]/50 rounded-2xl border border-dashed border-[#8b4513]/40 p-6">
          <span className="text-3xl mb-2 block">🪵</span>
          <h4 className="font-cordel text-base text-[#fdf6e7] font-bold mb-1">
            Aucun élément trouvé dans les {activeTab}.
          </h4>
          <p className="text-xs text-stone-400">
            Modifiez vos filtres ou créez de nouveaux rythmes depuis Séquenciad'Or.
          </p>
        </div>
      )}

      {/* Modale de confirmation de suppression */}
      <DeleteConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => { if (!isDeleting) setItemToDelete(null); }}
        onConfirm={confirmDelete}
        itemName={itemToDelete?.name || itemToDelete?.title}
        itemType="la ressource"
        isDeleting={isDeleting}
      />

      {/* Toast d'alerte */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-[#1c1613] text-[#fdf6e7] px-4 py-2.5 rounded-xl border border-amber-600/60 shadow-xl flex items-center gap-2 text-xs font-bold font-cordel">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SequencerView(props) {
  return (
    <AudioPreviewProvider>
      <SequencerViewContent {...props} />
    </AudioPreviewProvider>
  );
}

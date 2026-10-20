import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, getDocs, limit } from 'firebase/firestore';
import { db } from '../../../../services/firebase';
import { deleteToadaPack } from '../../../../services/toadaDeletionService';
import ToadaPackItemCard from './ToadaPackItemCard';
import { Search, Loader2, Music, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function ToadaPacksManager({ groupId }) {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [packToDelete, setPackToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchPacks = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'toada_packs'), limit(100));
      const snap = await getDocs(q);
      const items = [];
      snap.forEach(d => {
        const data = d.data();
        if (!data.isDeleted) items.push({ id: d.id, ...data });
      });
      setPacks(items);
    } catch (err) {
      console.warn('[ToadaPacksManager] Erreur chargement packs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacks();
  }, [groupId]);

  const filteredPacks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return packs;
    return packs.filter(p => (p.title || p.metadata?.title || '').toLowerCase().includes(q) || (p.groupId || '').toLowerCase().includes(q));
  }, [packs, search]);

  const handleConfirmDelete = async () => {
    if (!packToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteToadaPack(packToDelete);
      setPacks(prev => prev.filter(p => p.id !== packToDelete.id));
      setToast(`Pack "${packToDelete.title || packToDelete.id}" supprimé (${res.deletedFilesCount} fichier(s) audio nettoyé(s)).`);
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      console.error('[ToadaPacksManager] Erreur suppression:', err);
      setToast("Erreur lors de la suppression du pack.");
      setTimeout(() => setToast(null), 4000);
    } finally {
      setIsDeleting(false);
      setPackToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      {toast && (
        <div className="p-3 bg-emerald-900/90 text-emerald-200 text-xs font-mono rounded-xl border border-emerald-500/50 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-emerald-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <h4 className="font-cordel text-lg font-bold text-[#4a2e1b] flex items-center gap-2">
          <Music className="w-5 h-5 text-[#9a3412]" />
          <span>Banque des Packs Vocaux (toada_packs)</span>
        </h4>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un pack..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#8b4513]/30 rounded-lg focus:outline-none focus:border-[#9a3412]"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-stone-500 text-xs flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#9a3412]" />
          <span>Chargement du catalogue vocal...</span>
        </div>
      ) : filteredPacks.length === 0 ? (
        <div className="p-8 text-center bg-white/50 rounded-xl border border-dashed border-[#8b4513]/30 text-xs text-[#8b4513]/70 font-mono">
          Aucun pack vocal trouvé. Publiez vos compositions depuis Cantador pour les retrouver ici.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPacks.map(pack => (
            <ToadaPackItemCard key={pack.id} pack={pack} onDelete={setPackToDelete} />
          ))}
        </div>
      )}

      {packToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#fdf6e7] border-2 border-[#9a3412] rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-700">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-cordel text-lg font-bold">Confirmer la suppression</h3>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              Voulez-vous vraiment supprimer le pack <strong>"{packToDelete.title || packToDelete.id}"</strong> ?
              Cette action supprimera définitivement le document et tous les fichiers WAV associés dans Storage.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#8b4513]/20">
              <button
                type="button"
                onClick={() => setPackToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-1.5 text-xs font-bold text-stone-600 hover:bg-stone-200 rounded-lg cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-1.5 text-xs font-bold bg-red-700 hover:bg-red-800 text-white rounded-lg flex items-center gap-1.5 cursor-pointer shadow"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Supprimer définitivement</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

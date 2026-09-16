/**
 * Banque de partage communautaire du Terreiro (Varal Public).
 * Permet de prévisualiser de manière protégée et d'adopter des ressources avec des points d'Axé.
 */

import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase.js';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { BookOpen, Hammer, Sparkles, Filter, Loader2, Music, CheckCircle, Eye } from 'lucide-react';
import PreviewModal from '../modals/PreviewModal.jsx';

export default function TerreiroSharedBank({ userData, associationData }) {
  const [documents, setDocuments] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [previewItem, setPreviewItem] = useState(null);
  const [unlockedIds, setUnlockedIds] = useState([]);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    if (associationData?.contributionPoints !== undefined) {
      setPoints(Number(associationData.contributionPoints));
    }
    if (Array.isArray(associationData?.unlockedResources)) {
      setUnlockedIds(associationData.unlockedResources);
    }
  }, [associationData]);

  useEffect(() => {
    const fetchPublicContent = async () => {
      try {
        setLoading(true);
        const docsSnap = await getDocs(query(collection(db, 'documents'), where('isPublic', '==', true)));
        const modelsSnap = await getDocs(query(collection(db, 'instrument_models'), where('isPublic', '==', true)));

        const fetchedDocs = [];
        docsSnap.forEach(d => fetchedDocs.push({ id: d.id, _sourceCollection: 'documents', ...d.data() }));

        const fetchedModels = [];
        modelsSnap.forEach(d => fetchedModels.push({ id: d.id, _sourceCollection: 'instrument_models', ...d.data() }));

        setDocuments(fetchedDocs);
        setModels(fetchedModels);
      } catch (err) {
        console.error("Erreur fetch banque de partage:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicContent();
  }, []);

  const getCategory = (item) => {
    if (item._sourceCollection === 'instrument_models' || item.type === 'fabrication') return 'fabrication';
    if (item.type === 'culture_fiche') return 'culture';
    if (item.type === 'song' || (item.categorie || '').toLowerCase().includes('toada')) return 'toada';
    return 'other';
  };

  const filteredItems = [...documents, ...models].filter(item => filter === 'all' || getCategory(item) === filter);

  const handleAdoptSuccess = (res) => {
    if (previewItem) setUnlockedIds(prev => [...prev, previewItem.id]);
    if (res?.remainingPoints !== undefined) setPoints(res.remainingPoints);
  };

  return (
    <section className="bg-[#fdf6e7] rounded-xl border border-[#e6d5c3] shadow-sm p-6 mt-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 text-[#8b4513] flex items-center justify-center border-2 border-amber-500/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-[#4a2e1b] font-cordel">Banque de Partage (Varal Public)</h3>
            <p className="text-sm text-amber-800/70">Enrichissez votre répertoire avec les fiches culturelles et tutos partagés.</p>
          </div>
        </div>
        <div className="bg-white px-3.5 py-1.5 rounded-lg border border-[#e6d5c3] text-xs font-bold text-[#8b4513] flex items-center gap-1.5 shadow-sm self-start">
          <Sparkles className="w-4 h-4 text-amber-600" /> Solde : {points} pts d'Axé
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-[#e6d5c3] pb-4 text-xs font-bold uppercase tracking-wider">
        <button onClick={() => setFilter('all')} className={`px-4 py-1.5 rounded-full transition-colors ${filter === 'all' ? 'bg-[#8b4513] text-white' : 'bg-white border text-[#8b4513]'}`}>Tout</button>
        <button onClick={() => setFilter('culture')} className={`px-4 py-1.5 rounded-full flex items-center gap-1 transition-colors ${filter === 'culture' ? 'bg-[#8b4513] text-white' : 'bg-white border text-[#8b4513]'}`}><BookOpen className="w-3.5 h-3.5" /> Culture</button>
        <button onClick={() => setFilter('fabrication')} className={`px-4 py-1.5 rounded-full flex items-center gap-1 transition-colors ${filter === 'fabrication' ? 'bg-[#8b4513] text-white' : 'bg-white border text-[#8b4513]'}`}><Hammer className="w-3.5 h-3.5" /> Fabrication</button>
        <button onClick={() => setFilter('toada')} className={`px-4 py-1.5 rounded-full flex items-center gap-1 transition-colors ${filter === 'toada' ? 'bg-[#8b4513] text-white' : 'bg-white border text-[#8b4513]'}`}><Music className="w-3.5 h-3.5" /> Toadas</button>
      </div>

      {/* Grille des fiches */}
      {loading ? (
        <div className="py-12 text-center text-[#8b4513]/60 font-bold"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" /> Chargement du Varal...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white/50 rounded-xl border border-dashed border-[#d4b895] text-sm text-[#8b4513]/70 font-bold">Aucun document trouvé.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => {
            const isMine = item.authorGroupId === userData?.groupId;
            const isUnlocked = unlockedIds.includes(item.id);
            const cost = item.axeValue || 5;

            return (
              <div key={item.id} className="bg-white rounded-xl border border-[#e6d5c3] p-4 flex flex-col hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    {cost} pts d'Axé
                  </span>
                  {item.authorName && <span className="text-[10px] text-gray-400 truncate max-w-[120px]">Par {item.authorName}</span>}
                </div>

                <h4 className="font-bold text-[#4a2e1b] text-base leading-snug mb-1.5 line-clamp-1">{item.titre || item.nom || 'Sans titre'}</h4>
                <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">{item.description || "Fiche partagée par la communauté."}</p>

                <div className="mt-auto pt-3 border-t border-[#e6d5c3] flex justify-end">
                  {isMine ? (
                    <span className="text-xs font-bold text-gray-400 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> Votre création</span>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="text-xs font-bold text-green-800 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" /> Déjà dans votre répertoire
                    </button>
                  ) : (
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="text-xs font-bold text-white bg-[#8b4513] hover:bg-[#6e370f] px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" /> Aperçu & Adopter
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modale d'aperçu sécurisé et adoption */}
      <PreviewModal
        isOpen={Boolean(previewItem)}
        onClose={() => setPreviewItem(null)}
        resource={previewItem}
        collectionName={previewItem?._sourceCollection || 'documents'}
        buyerGroupId={userData?.groupId}
        buyerPoints={points}
        isAlreadyUnlocked={previewItem ? unlockedIds.includes(previewItem.id) : false}
        onAdoptSuccess={handleAdoptSuccess}
      />
    </section>
  );
}

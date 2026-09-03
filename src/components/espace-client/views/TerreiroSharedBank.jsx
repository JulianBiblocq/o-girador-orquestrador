import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { BookOpen, Hammer, Download, Sparkles, Filter, Loader2, Music, CheckCircle } from 'lucide-react';

export default function TerreiroSharedBank({ userData }) {
  const [documents, setDocuments] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'culture', 'fabrication', 'toada', 'other'
  const [importingId, setImportingId] = useState(null);
  const [importedIds, setImportedIds] = useState([]);

  useEffect(() => {
    const fetchPublicContent = async () => {
      try {
        setLoading(true);
        // 1. Fetch public documents
        const docsRef = collection(db, 'documents');
        const qDocs = query(docsRef, where('isPublic', '==', true));
        const docsSnap = await getDocs(qDocs);
        
        let fetchedDocs = [];
        docsSnap.forEach(d => {
          fetchedDocs.push({ id: d.id, _sourceCollection: 'documents', ...d.data() });
        });

        // 2. Fetch public instrument models
        const modelsRef = collection(db, 'instrument_models');
        const qModels = query(modelsRef, where('isPublic', '==', true));
        const modelsSnap = await getDocs(qModels);
        
        let fetchedModels = [];
        modelsSnap.forEach(d => {
          fetchedModels.push({ id: d.id, _sourceCollection: 'instrument_models', ...d.data() });
        });

        setDocuments(fetchedDocs);
        setModels(fetchedModels);
      } catch (error) {
        console.error("Erreur fetch public content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicContent();
  }, []);

  const handleImport = async (item) => {
    if (!userData?.groupId) {
      alert("Erreur: Vous devez être rattaché à un groupe pour importer des documents.");
      return;
    }
    
    setImportingId(item.id);
    try {
      // Nettoyer l'objet avant import
      const { id, _sourceCollection, isPublic, authorGroupId, authorName, rewardClaimed, ...cleanData } = item;
      
      const newDoc = {
        ...cleanData,
        groupId: userData.groupId,
        importedFrom: item.id,
        originalAuthor: item.authorName || 'Communauté O-Girador',
        dateAjout: new Date().toISOString(),
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, _sourceCollection), newDoc);
      
      setImportedIds(prev => [...prev, item.id]);
    } catch (error) {
      console.error("Erreur lors de l'import :", error);
      alert("Erreur lors de l'importation du document.");
    } finally {
      setImportingId(null);
    }
  };

  const getCategoryFromItem = (item) => {
    if (item._sourceCollection === 'instrument_models') return 'fabrication';
    if (item.type === 'culture_fiche') return 'culture';
    if (item.type === 'song' || (item.categorie || '').toLowerCase().includes('toada')) return 'toada';
    return 'other';
  };

  const filteredItems = [...documents, ...models].filter(item => {
    if (filter === 'all') return true;
    return getCategoryFromItem(item) === filter;
  });

  return (
    <section className="bg-[#fdf6e7] rounded-xl border border-[#e6d5c3] shadow-sm p-6 mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 text-[#8b4513] flex items-center justify-center border-2 border-amber-500/30">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-xl text-[#4a2e1b] flex items-center gap-2 font-cordel">
            Banque de Partage (Varal Public)
          </h3>
          <p className="text-sm text-amber-800/70">
            Enrichissez votre répertoire avec les fiches culturelles et tutos partagés par la communauté.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-[#e6d5c3] pb-4">
        <div className="flex items-center gap-2 mr-2 text-sm font-bold text-[#8b4513] uppercase tracking-wider">
          <Filter className="w-4 h-4" /> Filtres :
        </div>
        <button 
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${filter === 'all' ? 'bg-[#8b4513] text-white' : 'bg-white border border-[#e6d5c3] text-[#8b4513] hover:bg-amber-50'}`}
        >
          Tout
        </button>
        <button 
          onClick={() => setFilter('culture')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1 ${filter === 'culture' ? 'bg-[#8b4513] text-white' : 'bg-white border border-[#e6d5c3] text-[#8b4513] hover:bg-amber-50'}`}
        >
          <BookOpen className="w-3.5 h-3.5" /> Culture
        </button>
        <button 
          onClick={() => setFilter('fabrication')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1 ${filter === 'fabrication' ? 'bg-[#8b4513] text-white' : 'bg-white border border-[#e6d5c3] text-[#8b4513] hover:bg-amber-50'}`}
        >
          <Hammer className="w-3.5 h-3.5" /> Fabrication
        </button>
        <button 
          onClick={() => setFilter('toada')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1 ${filter === 'toada' ? 'bg-[#8b4513] text-white' : 'bg-white border border-[#e6d5c3] text-[#8b4513] hover:bg-amber-50'}`}
        >
          <Music className="w-3.5 h-3.5" /> Toadas
        </button>
        <button 
          onClick={() => setFilter('other')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${filter === 'other' ? 'bg-[#8b4513] text-white' : 'bg-white border border-[#e6d5c3] text-[#8b4513] hover:bg-amber-50'}`}
        >
          Autres
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-[#8b4513]/60">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <p className="font-bold text-sm uppercase tracking-widest">Recherche dans les archives...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white/50 rounded-xl border border-dashed border-[#d4b895]">
          <p className="text-[#8b4513]/70 font-bold">Aucun document public trouvé dans cette catégorie.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => {
            const cat = getCategoryFromItem(item);
            const isImported = importedIds.includes(item.id);
            const isMine = item.authorGroupId === userData?.groupId;

            return (
              <div key={item.id} className="bg-white rounded-xl border border-[#e6d5c3] p-4 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden group">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-50 translate-x-1/3 -translate-y-1/3"></div>
                
                <div className="flex justify-between items-start mb-2 relative z-10">
                  <div className="flex items-center gap-2">
                    {cat === 'culture' && <span className="bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1"><BookOpen className="w-3 h-3"/> Culture</span>}
                    {cat === 'fabrication' && <span className="bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1"><Hammer className="w-3 h-3"/> Modèle</span>}
                    {cat === 'toada' && <span className="bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1"><Music className="w-3 h-3"/> Toada</span>}
                    {cat === 'other' && <span className="bg-gray-100 text-gray-700 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">Document</span>}
                  </div>
                  {item.authorName && (
                    <span className="text-[9px] font-bold text-gray-400 max-w-[100px] truncate" title={`Partagé par ${item.authorName}`}>
                      Par {item.authorName}
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-[#4a2e1b] text-lg leading-tight mb-2 relative z-10">
                  {item.titre || item.nom || 'Document sans titre'}
                </h4>
                
                {item.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3 relative z-10 flex-1">
                    {item.description}
                  </p>
                )}

                <div className="mt-auto pt-3 border-t border-[#e6d5c3] flex justify-end relative z-10">
                  {isMine ? (
                    <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Votre document
                    </span>
                  ) : isImported ? (
                    <span className="text-xs font-bold text-green-600 flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                      <CheckCircle className="w-3.5 h-3.5" /> Importé
                    </span>
                  ) : (
                    <button
                      onClick={() => handleImport(item)}
                      disabled={importingId === item.id}
                      className="text-xs font-bold text-white bg-[#8b4513] hover:bg-[#6e370f] px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {importingId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                      Importer dans mon Varal
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

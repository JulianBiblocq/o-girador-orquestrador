import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ArrowLeft, Music, Activity, Star, Download, Search, ChevronDown, ChevronUp, Users } from 'lucide-react';
import LZString from 'lz-string';

export default function PublicCatalogue({ onNavigateHome }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'rhythm' | 'choreography'
  const [expandedAuthors, setExpandedAuthors] = useState({});

  const toggleAuthor = (authorName) => {
    setExpandedAuthors(prev => ({
      ...prev,
      [authorName]: !prev[authorName]
    }));
  };

  useEffect(() => {
    const fetchPublicItems = async () => {
      try {
        const presetsRef = collection(db, 'presets');
        const choroRef = collection(db, 'choreographies');
        
        // Requêtes pour items publics
        const qPresets = query(presetsRef, where('visibility', '==', 'public'));
        const qChoro = query(choroRef, where('isPublic', '==', true));
        
        const [presetsSnap, choroSnap] = await Promise.all([
          getDocs(qPresets),
          getDocs(qChoro)
        ]);
        
        let allItems = [];
        
        presetsSnap.forEach(doc => {
          const data = doc.data();
          let parsedData = data;
          if (data.data) {
            try {
              parsedData = JSON.parse(LZString.decompressFromBase64(data.data));
            } catch(e) {}
          }
          
          allItems.push({ 
            id: doc.id, 
            itemType: 'rhythm', 
            ...data,
            title: data.name || data.title,
            originalData: parsedData 
          });
        });
        
        choroSnap.forEach(doc => {
          allItems.push({ id: doc.id, itemType: 'choreography', ...doc.data() });
        });
        
        // Tri du plus récent au plus ancien
        allItems.sort((a, b) => {
          const dateA = a.dateCreation?.toMillis?.() || a.dateCreation || 0;
          const dateB = b.dateCreation?.toMillis?.() || b.dateCreation || 0;
          return dateB - dateA;
        });
        
        setItems(allItems);
      } catch (error) {
        console.error("Erreur fetch catalogue public:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPublicItems();
  }, []);

  const filteredItems = items.filter(item => {
    if (activeFilter === 'all') return true;
    return item.itemType === activeFilter;
  });

  const groupedItems = filteredItems.reduce((acc, item) => {
    const author = item.authorName || 'Créateur Anonyme';
    if (!acc[author]) acc[author] = [];
    acc[author].push(item);
    return acc;
  }, {});

  const groupedArray = Object.entries(groupedItems).map(([authorName, authorItems]) => ({
    authorName,
    items: authorItems
  })).sort((a, b) => b.items.length - a.items.length);

  const getGradientForUniverse = (universeId) => {
    switch(universeId) {
      case 'maracatu':
        return 'from-amber-600 to-orange-900';
      case 'samba':
        return 'from-emerald-500 to-green-800';
      case 'capoeira':
        return 'from-red-500 to-orange-700';
      default:
        return 'from-gray-600 to-gray-900';
    }
  };

  const getBadgeForUniverse = (universeId) => {
    switch(universeId) {
      case 'maracatu': return { bg: 'bg-amber-100', text: 'text-amber-800' };
      case 'samba': return { bg: 'bg-green-100', text: 'text-green-800' };
      case 'capoeira': return { bg: 'bg-red-100', text: 'text-red-800' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf6e7]">
      {/* Header / Hero */}
      <div className="bg-[#4a2e1b] text-white pt-24 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/assets/texture.png')] mix-blend-overlay pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#b05819] rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <button 
            onClick={onNavigateHome}
            className="flex items-center gap-2 text-amber-200 hover:text-white font-bold text-sm transition-colors w-max mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-8 h-8 text-amber-400" />
            <h1 className="text-4xl md:text-5xl font-black font-cordel text-[#fdf6e7]">Catalogue Ouvert</h1>
          </div>
          <p className="text-amber-100 text-lg md:text-xl max-w-2xl leading-relaxed">
            Découvrez, écoutez et importez les créations partagées par les associations de notre écosystème. Une véritable bibliothèque communautaire au service des Mestre.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-10">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`px-5 py-2.5 rounded-full font-bold text-sm transition-colors ${activeFilter === 'all' ? 'bg-[#8b4513] text-white shadow-md' : 'bg-white text-[#8b4513] border border-[#d4b895] hover:bg-amber-50'}`}
          >
            Toutes les créations
          </button>
          <button 
            onClick={() => setActiveFilter('rhythm')}
            className={`px-5 py-2.5 rounded-full font-bold text-sm transition-colors flex items-center gap-2 ${activeFilter === 'rhythm' ? 'bg-[#8b4513] text-white shadow-md' : 'bg-white text-[#8b4513] border border-[#d4b895] hover:bg-amber-50'}`}
          >
            <Music className="w-4 h-4" /> Rythmes
          </button>
          <button 
            onClick={() => setActiveFilter('choreography')}
            className={`px-5 py-2.5 rounded-full font-bold text-sm transition-colors flex items-center gap-2 ${activeFilter === 'choreography' ? 'bg-[#8b4513] text-white shadow-md' : 'bg-white text-[#8b4513] border border-[#d4b895] hover:bg-amber-50'}`}
          >
            <Activity className="w-4 h-4" /> Chorégraphies
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-[#e6d5c3] overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="pt-4 mt-4 border-t border-gray-100 flex justify-between">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : groupedArray.length > 0 ? (
          <div className="space-y-6">
            {groupedArray.map(group => (
              <div key={group.authorName} className="bg-white rounded-2xl shadow-sm border border-[#e6d5c3] overflow-hidden">
                <button 
                  onClick={() => toggleAuthor(group.authorName)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-amber-50/50 hover:bg-amber-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#8b4513] to-[#b05819] text-white rounded-full flex items-center justify-center font-black text-xl shadow-inner">
                      {group.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#4a2e1b]">{group.authorName}</h3>
                      <p className="text-sm text-[#8b4513] font-medium flex items-center gap-1.5 mt-0.5">
                        <Users className="w-4 h-4" />
                        {group.items.length} {group.items.length > 1 ? 'créations publiées' : 'création publiée'}
                      </p>
                    </div>
                  </div>
                  <div className="text-[#8b4513] bg-amber-100/50 p-2 rounded-full">
                    {expandedAuthors[group.authorName] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>
                
                {expandedAuthors[group.authorName] && (
                  <div className="p-6 border-t border-[#e6d5c3] bg-gray-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {group.items.map(item => (
                        <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-[#e6d5c3] overflow-hidden hover:shadow-xl transition-all group flex flex-col">
                          
                          {/* Image Placeholder */}
                          <div className={`h-48 bg-gradient-to-br ${getGradientForUniverse(item.universeId)} relative flex items-center justify-center overflow-hidden`}>
                            <div className="absolute inset-0 opacity-20 bg-[url('/assets/texture.png')] mix-blend-overlay"></div>
                            
                            {item.itemType === 'rhythm' ? (
                              <Music className="w-20 h-20 text-white/40 group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                              <Activity className="w-20 h-20 text-white/40 group-hover:scale-110 transition-transform duration-500" />
                            )}
                            
                            {/* Badge Type */}
                            <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-white/20 shadow-sm">
                              {item.itemType === 'rhythm' ? <Music className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
                              {item.itemType === 'rhythm' ? 'Rythme' : 'Chorégraphie'}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-6 flex flex-col flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="text-xl font-bold text-[#4a2e1b] line-clamp-1">{item.title || item.nom || 'Sans titre'}</h3>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-4">
                              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm ${getBadgeForUniverse(item.universeId).bg} ${getBadgeForUniverse(item.universeId).text}`}>
                                {item.universeId || 'Universel'}
                              </span>
                              {item.style && (
                                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm bg-gray-100 text-gray-600">
                                  {item.style}
                                </span>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-2">
                              {item.description || "Aucune description fournie pour cette création."}
                            </p>

                            <div className="pt-4 border-t border-gray-100">
                              <button 
                                onClick={() => {
                                  window.location.href = `/?import_id=${item.id}&type=${item.itemType}#espace-client`;
                                }} 
                                className="w-full flex items-center justify-center gap-2 bg-[#d2691e] hover:bg-[#b05819] text-white py-3 px-4 rounded-xl font-black text-sm uppercase tracking-wide transition-all shadow-md hover:shadow-lg"
                              >
                                <Download className="w-4 h-4" />
                                Importer 
                              </button>
                              <p className="text-[10px] text-center text-gray-400 mt-2 font-medium">
                                Créez votre compte gratuit pour utiliser ce morceau
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-[#d4b895] p-16 text-center shadow-sm">
            <Search className="w-16 h-16 text-[#d4b895] mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-[#4a2e1b] mb-2">Aucune création publique</h3>
            <p className="text-[#8b4513] max-w-md mx-auto">
              La communauté n'a pas encore partagé de créations publiquement pour le moment. Revenez bientôt !
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle2, Info, X } from 'lucide-react';
import { fetchPacks } from '../../services/packsService';
import { useLanguage } from '../../hooks/useLanguage';

const APP_COLORS = {
  sequenceur: {
    badgeBg: 'bg-[#2c1d11]',
    badgeText: 'text-[#fdf6e7]',
    border: 'border-[#2c1d11]/20',
    hoverBorder: 'hover:border-[#2c1d11]',
    textHighlight: 'text-[#2c1d11]',
    buttonBg: 'bg-[#2c1d11] hover:bg-black text-white',
  },
  manager: {
    badgeBg: 'bg-[#8b4513]',
    badgeText: 'text-[#fdf6e7]',
    border: 'border-[#8b4513]/20',
    hoverBorder: 'hover:border-[#8b4513]',
    textHighlight: 'text-[#8b4513]',
    buttonBg: 'bg-[#8b4513] hover:bg-[#6b3410] text-white',
  },
  dancador: {
    badgeBg: 'bg-[#991b1b]',
    badgeText: 'text-red-100',
    border: 'border-[#991b1b]/20',
    hoverBorder: 'hover:border-[#991b1b]',
    textHighlight: 'text-[#991b1b]',
    buttonBg: 'bg-[#991b1b] hover:bg-[#7f1d1d] text-white',
  },
  vitrine: {
    badgeBg: 'bg-[#d2691e]',
    badgeText: 'text-white',
    border: 'border-[#d2691e]/20',
    hoverBorder: 'hover:border-[#d2691e]',
    textHighlight: 'text-[#d2691e]',
    buttonBg: 'bg-[#d2691e] hover:bg-[#b05819] text-white',
  }
};

export default function AddonsStore() {
  const { t } = useLanguage();
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPack, setSelectedPack] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchPacks();
      setPacks(data);
      setLoading(false);
    };
    loadData();
  }, []);

  const groupedPacks = packs.reduce((acc, pack) => {
    if (!acc[pack.targetApp]) acc[pack.targetApp] = [];
    acc[pack.targetApp].push(pack);
    return acc;
  }, {});

  return (
    <section id="boutique" className="py-16 px-4 sm:px-6 lg:px-8 bg-[#fdf6e7] border-b-2 border-[#4a2e1b]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block py-1 px-3 rounded-full bg-[#8b4513]/10 text-[#8b4513] text-sm font-bold tracking-wider mb-4">
            Boutique & Extensions
          </span>
          <h2 className="text-4xl md:text-5xl font-black font-cordel text-[#4a2e1b] mb-4">
            Boutique & Add-ons
          </h2>
          <p className="text-[#8b4513] text-lg font-medium">
            Enrichissez votre écosystème avec des packs rythmiques premium, des chorégraphies exclusives et des ressources pédagogiques prêtes à l'emploi.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-[#8b4513] font-bold py-12">Chargement du catalogue...</div>
        ) : (
          <div className="space-y-16">
            {Object.entries(groupedPacks).map(([targetApp, appPacks]) => {
              const colors = APP_COLORS[targetApp] || APP_COLORS.manager;
              return (
                <div key={targetApp}>
                  <h3 className="text-2xl font-black text-[#4a2e1b] font-cordel mb-6 border-b-2 border-[#4a2e1b]/20 pb-2">
                    Add-ons pour O Girador {targetApp.charAt(0).toUpperCase() + targetApp.slice(1)}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {appPacks.map(pack => (
                      <div key={pack.id} className={`bg-white rounded-2xl shadow-xl overflow-hidden border-2 ${colors.border} flex flex-col ${colors.hoverBorder} transition-colors`}>
                        <div className="p-8 flex-grow">
                          <div className={`inline-block px-3 py-1 text-[10px] font-bold ${colors.badgeBg} ${colors.badgeText} uppercase tracking-wider rounded mb-4`}>
                            Add-on {pack.targetApp}
                          </div>
                          <h4 className="text-2xl font-bold text-[#4a2e1b] mb-4">{pack.name}</h4>
                          <p className="text-gray-600 mb-6 text-sm leading-relaxed line-clamp-2">
                            {pack.description}
                          </p>
                          
                          <div className="space-y-3 mb-8">
                            {pack.features.slice(0, 3).map((feat, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                <span className="text-sm text-gray-700 line-clamp-1">{feat}</span>
                              </div>
                            ))}
                            {pack.features.length > 3 && (
                              <div className="text-xs text-gray-500 font-semibold italic">
                                + {pack.features.length - 3} autres points forts...
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-100 mt-auto">
                          <div className="flex items-baseline gap-1 mb-4 justify-center">
                            <span className="text-3xl font-black text-[#4a2e1b]">{pack.price}€</span>
                            <span className="text-sm text-gray-500 font-medium">/ paiement unique</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setSelectedPack({ ...pack, colors })}
                              className={`flex-1 flex items-center justify-center gap-1.5 border-2 ${colors.border} ${colors.textHighlight} hover:bg-gray-100 py-2.5 px-2 rounded-xl font-bold text-sm transition-all cursor-pointer`}
                            >
                              <Info className="w-4 h-4" />
                              Détails
                            </button>
                            <a
                              href="https://www.helloasso.com"
                              target="_blank"
                              rel="noreferrer"
                              className={`flex-1 flex items-center justify-center gap-1.5 ${colors.buttonBg} py-2.5 px-2 rounded-xl font-bold text-sm transition-all shadow-md`}
                            >
                              <ShoppingCart className="w-4 h-4" />
                              Acheter
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de détails */}
        {selectedPack && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setSelectedPack(null)}
            />
            <div className={`relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border-4 ${selectedPack.colors.border}`}>
              {/* Header Modal */}
              <div className={`${selectedPack.colors.badgeBg} ${selectedPack.colors.badgeText} p-6 flex justify-between items-start`}>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider mb-2 opacity-80">
                    Add-on O Girador {selectedPack.targetApp}
                  </div>
                  <h3 className="text-3xl font-black font-cordel leading-tight">
                    {selectedPack.name}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedPack(null)}
                  className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Body Modal */}
              <div className="flex flex-col md:flex-row">
                {selectedPack.imageUrl && (
                  <div className="w-full md:w-2/5 md:border-r border-gray-100 bg-gray-50 flex shrink-0">
                    <img 
                      src={selectedPack.imageUrl} 
                      alt={selectedPack.name} 
                      className="w-full h-48 md:h-full object-cover object-center"
                    />
                  </div>
                )}
                
                <div className={`p-8 space-y-8 ${selectedPack.imageUrl ? 'md:w-3/5' : 'w-full'}`}>
                  <div>
                    <h4 className="text-lg font-bold text-[#4a2e1b] mb-2">Description du Pack</h4>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      {selectedPack.description}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-bold text-[#4a2e1b] mb-4">Ce qui est inclus</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedPack.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <span className="text-sm font-semibold text-gray-800">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                      <span className="block text-xs text-gray-500 uppercase font-bold mb-1">Prix total</span>
                      <span className="text-4xl font-black text-[#4a2e1b]">{selectedPack.price}€</span>
                    </div>
                    <a
                      href="https://www.helloasso.com"
                      target="_blank"
                      rel="noreferrer"
                      className={`${selectedPack.colors.buttonBg} w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl hover:scale-105`}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Procéder au paiement
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

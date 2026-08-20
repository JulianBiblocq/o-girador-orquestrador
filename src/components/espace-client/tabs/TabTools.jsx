import React, { useState } from 'react';
import { PackageOpen, ChevronLeft, ChevronRight, Check, X, Lock, ShoppingCart, ExternalLink, ShieldCheck, Globe2, Music, ClipboardList, Monitor, Footprints } from 'lucide-react';
import packsData from '../../../data/packs.json';
import tarifsData from '../../../data/tarifs.json';
import { useCart } from '../../../context/CartContext';

export default function TabTools({ associationData, userData }) {
  const { addToCart, cartItems } = useCart();
  
  // Extraire les IDs de base sans la période de facturation
  const unlockedIdsRaw = associationData?.unlockedPacks || [];
  const unlockedIds = unlockedIdsRaw.map(id => {
    return id.replace('-monthly', '').replace('-annual', '');
  });

  const getAppUrl = (targetApp) => {
    switch(targetApp) {
      case 'manager':
        return 'https://organizador.o-girador.com';
      case 'sequenceur':
        return 'https://sequenciador.o-girador.com';
      case 'dancador':
        return 'https://dancador.o-girador.com';
      case 'vitrine':
        return `https://mostrador.o-girador.com/${userData?.groupId || ''}`;
      default:
        return '#';
    }
  };

  // --- PLANS & FORFAITS ---
  const planOrder = ['decouverte', 'essentiel', 'association', 'ecosysteme'];
  const activePlanId = planOrder.reverse().find(id => unlockedIds.includes(id)) || 'decouverte';
  planOrder.reverse(); // remettre dans l'ordre croissant

  const [displayedPlanIndex, setDisplayedPlanIndex] = useState(planOrder.indexOf(activePlanId));

  const handleNextPlan = () => {
    setDisplayedPlanIndex(prev => (prev + 1) % planOrder.length);
  };

  const handlePrevPlan = () => {
    setDisplayedPlanIndex(prev => (prev - 1 + planOrder.length) % planOrder.length);
  };

  const currentPlanDisplay = tarifsData.plans.find(p => p.id === planOrder[displayedPlanIndex]);
  const isCurrentlyOwnedPlan = currentPlanDisplay.id === activePlanId;

  // Liste globale des avantages (du meilleur forfait) pour la comparaison
  const globalFeatures = [
    { label: "Séquenceur & Créateur de Toadas", minLevel: 'decouverte' },
    { label: "Sauvegarde Cloud & Export HD", minLevel: 'essentiel' },
    { label: "O Girador Manager (Gestion asso)", minLevel: 'association' },
    { label: "Site Vitrine Public", minLevel: 'association' },
    { label: "Gestion Agenda, Présences, Trésorerie", minLevel: 'association' },
    { label: "Multi-univers culturels (Samba, Capoeira...)", minLevel: 'ecosysteme' },
    { label: "Statistiques avancées & Domaine personnalisé", minLevel: 'ecosysteme' }
  ];

  const hasFeature = (planId, minLevel) => {
    const levelIndex = planOrder.indexOf(minLevel);
    const planIndex = planOrder.indexOf(planId);
    return planIndex >= levelIndex;
  };

  // --- DROITS APPLICATIONS ---
  const appsRights = [
    {
      id: 'sequenceur',
      label: 'Sequenciador',
      icon: <img src="/logos/sequenciador.png" alt="Sequenciador" className="w-6 h-6 object-contain drop-shadow-sm" />,
      isOwned: associationData?.ecosystemAccess?.sequenciador !== false
    },
    {
      id: 'manager',
      label: 'Organizador',
      icon: <img src="/logos/organizador.png" alt="Organizador" className="w-6 h-6 object-contain drop-shadow-sm" />,
      isOwned: associationData?.ecosystemAccess?.hub !== false
    },
    {
      id: 'vitrine',
      label: 'Mostrador',
      icon: <img src="/logos/mostrador.png" alt="Mostrador" className="w-6 h-6 object-contain rounded-full drop-shadow-sm" />,
      isOwned: associationData?.ecosystemAccess?.vitrine !== false
    },
    {
      id: 'dancador',
      label: 'Dançador',
      icon: <img src="/logos/dancador.png" alt="Dançador" className="w-6 h-6 object-contain drop-shadow-sm" />,
      isOwned: associationData?.ecosystemAccess?.dancador !== false
    }
  ];

  // --- DROITS UNIVERS CULTURELS ---
  const cultureRights = [
    {
      id: 'maracatu',
      label: 'Maracatu de Baque Virado',
      isOwned: associationData?.universeAccess?.maracatu !== false // Par défaut actif
    },
    {
      id: 'capoeira',
      label: 'Capoeira Regional & Angola',
      isOwned: associationData?.universeAccess?.capoeira === true
    },
    {
      id: 'samba',
      label: 'Samba de Enredo & Batucada',
      isOwned: associationData?.universeAccess?.samba === true
    }
  ];

  // --- EXTENSIONS ---
  const extensions = packsData.packs.map(pack => ({
    ...pack,
    isOwned: unlockedIds.includes(pack.id)
  }));

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-8">
        <h2 className="text-3xl font-black text-[#4a2e1b] font-cordel mb-2 flex items-center gap-2">
          <PackageOpen className="w-8 h-8 text-amber-500" />
          Le Grand Hub
        </h2>
        <p className="text-[#8b4513] text-lg">
          Pilotez l'ensemble de votre écosystème O Girador depuis un seul endroit.
        </p>
      </div>

      {/* RANGÉE 1 : Forfait (Carousel) */}
      <section>
        <h3 className="text-xl font-bold text-[#4a2e1b] mb-4 border-b border-amber-900/10 pb-2">
          Les Forfaits
        </h3>
        <div className="bg-white rounded-2xl border-2 border-amber-900/10 shadow-xl overflow-hidden relative">
          
          {/* Header du Forfait */}
          <div className="bg-gradient-to-r from-[#8b4513] to-[#5c2e0b] p-6 text-white flex items-center justify-between">
            <button 
              onClick={handlePrevPlan}
              className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="text-center flex-1">
              {isCurrentlyOwnedPlan && (
                <span className="inline-block px-3 py-1 bg-amber-400 text-amber-900 text-xs font-black uppercase tracking-widest rounded-full mb-3">
                  Votre forfait actuel
                </span>
              )}
              <h4 className="text-3xl font-black tracking-wider uppercase">{currentPlanDisplay.name}</h4>
              <p className="text-amber-100/80 mt-1">{currentPlanDisplay.tagline}</p>
            </div>

            <button 
              onClick={handleNextPlan}
              className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Corps avec les features validées/non validées */}
          <div className="p-6 md:p-8 bg-amber-50/30">
            <ul className="space-y-4 max-w-2xl mx-auto">
              {globalFeatures.map((feat, idx) => {
                const included = hasFeature(currentPlanDisplay.id, feat.minLevel);
                return (
                  <li key={idx} className={`flex items-center gap-4 text-sm md:text-base transition-opacity ${included ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${included ? 'bg-amber-100 text-[#8b4513]' : 'bg-gray-200 text-gray-500'}`}>
                      {included ? <Check className="w-4 h-4 font-bold" /> : <X className="w-4 h-4" />}
                    </div>
                    <span className={`font-medium ${included ? 'text-[#4a2e1b]' : 'text-gray-500 line-through decoration-gray-300'}`}>
                      {feat.label}
                    </span>
                  </li>
                );
              })}
            </ul>

            {!isCurrentlyOwnedPlan && (
              <div className="mt-8 text-center">
                <button 
                  onClick={() => addToCart({ id: `${currentPlanDisplay.id}-annual`, name: `Abo. ${currentPlanDisplay.name} (Annuel)`, price: currentPlanDisplay.pricing.annual, type: 'subscription' })}
                  className="inline-flex items-center gap-2 bg-[#8b4513] hover:bg-[#6e370f] text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-sm transition-colors shadow-md"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Mettre à niveau ({currentPlanDisplay.pricing.monthly}€/mois)
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* RANGÉE 2 : Droits & Accès (Cartes UI) */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Carte Applications */}
          <div className="bg-white rounded-xl shadow-sm border border-amber-900/10 p-6 flex flex-col h-full">
            <h3 className="text-lg font-bold text-[#4a2e1b] mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              Droits Applications
            </h3>
            <ul className="space-y-3 flex-1">
              {appsRights.map((app) => {
                const InnerContent = (
                  <>
                    <div className={`flex items-center gap-3 ${app.isOwned ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                      <div className="flex-shrink-0">
                        {app.icon}
                      </div>
                      <span className={`font-bold ${app.isOwned ? 'text-[#4a2e1b]' : 'text-gray-500'}`}>{app.label}</span>
                    </div>
                    {app.isOwned ? (
                      <div className="flex items-center gap-3">
                        <span className="bg-amber-100 text-[#8b4513] p-1 rounded-full"><Check className="w-3.5 h-3.5" /></span>
                      </div>
                    ) : (
                      <span className="bg-gray-200 text-gray-500 p-1 rounded-full"><X className="w-3.5 h-3.5" /></span>
                    )}
                  </>
                );

                if (app.isOwned) {
                  return (
                    <li key={app.id}>
                      <a 
                        href={getAppUrl(app.id)} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center justify-between p-3 rounded-lg border border-amber-900/10 bg-white hover:bg-amber-50 transition-colors group cursor-pointer shadow-sm hover:shadow"
                      >
                        {InnerContent}
                      </a>
                    </li>
                  );
                }

                return (
                  <li key={app.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                    {InnerContent}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Carte Univers Culturels */}
          <div className="bg-white rounded-xl shadow-sm border border-amber-900/10 p-6 flex flex-col h-full">
            <h3 className="text-lg font-bold text-[#4a2e1b] mb-4 flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-amber-600" />
              Droits Univers Culturels
            </h3>
            <ul className="space-y-3 flex-1">
              {cultureRights.map((culture) => (
                <li key={culture.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                  <div className={`flex items-center gap-3 ${culture.isOwned ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                    <span className={`font-bold ${culture.isOwned ? 'text-[#4a2e1b]' : 'text-gray-500'}`}>{culture.label}</span>
                  </div>
                  {culture.isOwned ? (
                    <span className="bg-amber-100 text-[#8b4513] p-1 rounded-full"><Check className="w-3.5 h-3.5" /></span>
                  ) : (
                    <span className="bg-gray-200 text-gray-500 p-1 rounded-full"><X className="w-3.5 h-3.5" /></span>
                  )}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>

      {/* RANGÉE 3 : Mes Extensions (Add-ons) */}
      <section>
        <h3 className="text-xl font-bold text-[#4a2e1b] mb-4 border-b border-amber-900/10 pb-2">
          Mes Extensions (Packs de contenus)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {extensions.map((pack) => {
            const inCart = cartItems.some(item => item.id === pack.id);

            return (
              <div 
                key={pack.id} 
                className={`bg-white rounded-xl shadow-sm overflow-hidden flex flex-col relative transition-all ${
                  pack.isOwned 
                    ? 'border border-amber-500 bg-amber-50/30' 
                    : 'border border-gray-200 grayscale opacity-80 hover:grayscale-0 hover:opacity-100'
                }`}
              >
                {!pack.isOwned && <div className="absolute inset-0 bg-white/40 z-10 pointer-events-none"></div>}
                
                <div className="p-4 flex-grow relative z-20">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500">
                      Cible: {pack.targetApp}
                    </span>
                    {!pack.isOwned && <div className="font-black text-gray-600">{pack.price}€</div>}
                  </div>
                  <h4 className="font-bold text-[#4a2e1b] mb-1 leading-tight">
                    {pack.name}
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {pack.description}
                  </p>
                </div>
                
                <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100/50 relative z-20 mt-auto">
                  {pack.isOwned ? (
                    <div className="flex items-center justify-center gap-1.5 w-full py-1.5 px-4 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg border border-amber-200">
                      <Check className="w-3.5 h-3.5" /> Possédé
                    </div>
                  ) : (
                    <button 
                      onClick={() => !inCart && addToCart({ id: pack.id, name: pack.name, price: pack.price, type: 'addon' })}
                      disabled={inCart}
                      className={`flex items-center justify-center gap-1.5 w-full py-1.5 px-4 text-xs font-bold rounded-lg transition-colors ${
                        inCart 
                          ? 'bg-amber-200 text-amber-900 cursor-not-allowed'
                          : 'bg-white border border-gray-300 text-gray-700 hover:border-[#8b4513] hover:text-[#8b4513]'
                      }`}
                    >
                      {inCart ? 'Dans le panier' : 'Ajouter au panier'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}

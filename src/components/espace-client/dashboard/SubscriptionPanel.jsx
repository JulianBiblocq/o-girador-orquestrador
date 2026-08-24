import React, { useState, useEffect } from 'react';
import { Store, Crown, Sparkles, ExternalLink, ChevronLeft, ChevronRight, Check, Lock } from 'lucide-react';
import tarifsData from '../../../data/tarifs.json';
import universData from '../../../data/univers.json';

export default function SubscriptionPanel({ associationData, setActiveTab, onNavigateHome }) {
  const [loading, setLoading] = useState(true);
  const [activePlanIndex, setActivePlanIndex] = useState(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [universeInfo, setUniverseInfo] = useState({ name: 'Maracatu de Baque Virado' });

  const plans = tarifsData.plans;

  useEffect(() => {
    // Simulate short loading to prevent layout shift with other components
    const timer = setTimeout(() => {
      if (associationData) {
        // Determine active plan
        const unlockedIdsRaw = associationData.unlockedPacks || [];
        const unlockedIds = unlockedIdsRaw.map(id => id.replace('-monthly', '').replace('-annual', ''));
        const planOrder = ['decouverte', 'createur', 'gestion', 'integrale'];
        const activePlanId = [...planOrder].reverse().find(id => unlockedIds.includes(id)) || 'decouverte';
        
        const foundIndex = plans.findIndex(p => p.id === activePlanId);
        const actualIndex = foundIndex >= 0 ? foundIndex : 0;
        
        setActivePlanIndex(actualIndex);
        setCurrentSlideIndex(actualIndex);

        // Determine active universe (simplified: assume the first one they have access to)
        let currentUni = 'maracatu';
        if (associationData.universeAccess?.samba && !associationData.universeAccess?.maracatu) {
          currentUni = 'samba';
        } else if (associationData.universeAccess?.capoeira && !associationData.universeAccess?.maracatu) {
          currentUni = 'capoeira';
        }
        
        const uni = universData.universes.find(u => u.id === currentUni);
        if (uni) setUniverseInfo(uni);
      }
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [associationData]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 w-full h-full animate-pulse flex flex-col justify-between">
        <div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded-lg w-full mt-6"></div>
      </div>
    );
  }

  const viewedPlan = plans[currentSlideIndex];
  const isActive = currentSlideIndex === activePlanIndex;

  // Compute features to display
  const activeFeatures = viewedPlan.features.filter(f => !f.startsWith('Tous les avantages'));
  const lockedFeaturesRaw = plans.slice(currentSlideIndex + 1).flatMap(p => p.features).filter(f => !f.startsWith('Tous les avantages'));
  const lockedFeatures = [...new Set(lockedFeaturesRaw)].slice(0, 2);

  return (
    <div className="bg-gradient-to-br from-[#fdf6e7] to-white rounded-xl border border-[#d2691e]/20 shadow-sm p-6 w-full h-full flex flex-col justify-between relative overflow-hidden group">
      {/* Texture bg */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('/assets/texture.png')] mix-blend-overlay pointer-events-none"></div>
      
      {/* Arrows */}
      <button 
        disabled={currentSlideIndex === 0}
        onClick={() => setCurrentSlideIndex(prev => prev - 1)}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 rounded-full shadow-sm border border-gray-200 text-gray-400 hover:text-[#d2691e] disabled:opacity-30 disabled:cursor-not-allowed z-20 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button 
        disabled={currentSlideIndex === plans.length - 1}
        onClick={() => setCurrentSlideIndex(prev => prev + 1)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 rounded-full shadow-sm border border-gray-200 text-gray-400 hover:text-[#d2691e] disabled:opacity-30 disabled:cursor-not-allowed z-20 transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="relative z-10 px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-[#f4e8cf] rounded-xl flex items-center justify-center border border-[#8b4513]/20 shadow-sm">
            <Crown className="w-5 h-5 text-[#8b4513]" />
          </div>
          {isActive ? (
            <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-green-200">
              Actuel
            </span>
          ) : currentSlideIndex > activePlanIndex ? (
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-amber-200">
              Supérieur
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-gray-200">
              Inférieur
            </span>
          )}
        </div>
        
        <h3 className="font-bold text-gray-500 text-[10px] uppercase tracking-wider mb-1">
          Forfait {currentSlideIndex + 1}/{plans.length}
        </h3>
        <div className="text-xl font-black text-[#4a2e1b] mb-4 truncate">
          {viewedPlan.name}
        </div>

        {/* Feature List */}
        <div className="space-y-2 mb-4 flex-1 overflow-y-auto min-h-[8rem] pr-1 scrollbar-thin scrollbar-thumb-amber-200 scrollbar-track-transparent">
          {activeFeatures.map((feat, idx) => (
            <div key={`active-${idx}`} className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-700 leading-tight">{feat}</p>
            </div>
          ))}
          {lockedFeatures.map((feat, idx) => (
            <div key={`locked-${idx}`} className="flex items-start gap-2 opacity-40">
              <Lock className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-500 leading-tight line-through">{feat}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 px-4 mt-2">
        {isActive ? (
          <button 
            onClick={() => setActiveTab && setActiveTab('boutique')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#d4b895] hover:bg-amber-50 text-[#8b4513] font-bold text-sm rounded-lg transition-all shadow-sm"
          >
            Gérer mon abonnement
          </button>
        ) : currentSlideIndex > activePlanIndex ? (
          <button 
            onClick={() => {
              if (onNavigateHome) {
                window.location.hash = 'tarifs';
                onNavigateHome();
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#d2691e] hover:bg-[#b05819] text-white font-bold text-sm rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            Upgrader le forfait
          </button>
        ) : (
          <button 
            disabled
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-400 font-bold text-sm rounded-lg border border-gray-200 cursor-not-allowed"
          >
            Forfait inférieur
          </button>
        )}
      </div>
    </div>
  );
}

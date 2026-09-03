import React, { useState, useEffect } from 'react';
import { ArrowLeft, Store, Sparkles, Compass, ShoppingCart, Award } from 'lucide-react';
import packsData from '../../../data/packs.json';
import UniverseWarningModal from './UniverseWarningModal';
import { useAuth } from '../../../hooks/useAuth';
import { db } from '../../../services/firebase';
import { doc, updateDoc, increment, collection, getDocs, query, where } from 'firebase/firestore';
import { useCurrency } from '../../../context/CurrencyContext';

export default function AddonsStore({ associationData, onBack }) {
  const [loading, setLoading] = useState(true);
  const [packs, setPacks] = useState([]);
  const [selectedWarningPack, setSelectedWarningPack] = useState(null);
  const { currency, symbol } = useCurrency();
  const { userData } = useAuth();
  
  // L'univers principal de l'utilisateur (simplifié)
  const userUniverse = associationData?.universeId || 'maracatu';
  const points = associationData?.contributionPoints || 0;

  useEffect(() => {
    const fetchPacks = async () => {
      try {
        const q = query(collection(db, 'premium_packs'), where('isActive', '==', true));
        const snapshot = await getDocs(q);
        const dynamicPacks = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // On combine les packs statiques avec les packs dynamiques
        // (les dynamiques apparaissent en premier)
        setPacks([...dynamicPacks, ...(packsData.packs || [])]);
      } catch (err) {
        console.error("Erreur chargement packs:", err);
        setPacks(packsData.packs || []);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPacks();
  }, []);

  const recommendedPacks = packs.filter(p => p.universeId === userUniverse || p.isUniversal);
  const otherPacks = packs.filter(p => p.universeId !== userUniverse && !p.isUniversal);

  const handleBuyClick = (pack) => {
    if (pack.universeId !== userUniverse && !pack.isUniversal) {
      setSelectedWarningPack(pack);
    } else {
      alert(`Redirection vers le paiement pour le pack : ${pack.name}`);
    }
  };

  const handleBuyWithPoints = async (pack) => {
    if (points >= pack.pricePoints) {
      if (window.confirm(`Voulez-vous vraiment débloquer "${pack.name}" pour ${pack.pricePoints} points ?`)) {
        try {
          const docRef = doc(db, 'associations', userData.groupId);
          await updateDoc(docRef, {
            contributionPoints: increment(-pack.pricePoints)
          });
          alert('Pack débloqué avec succès ! Vous pouvez maintenant y accéder.');
        } catch (error) {
          console.error("Erreur déduction points", error);
          alert("Erreur lors de la déduction des points.");
        }
      }
    }
  };

  const getUniverseBadgeStyle = (universeId) => {
    switch (universeId) {
      case 'maracatu': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'samba': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'capoeira': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'universal': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUniverseName = (universeId) => {
    switch (universeId) {
      case 'maracatu': return 'Maracatu';
      case 'samba': return 'Samba';
      case 'capoeira': return 'Capoeira';
      case 'universal': return 'Universel';
      default: return universeId;
    }
  };

  const getAppLabel = (appId) => {
    switch (appId) {
      case 'sequenceur': return 'Séquenceur';
      case 'dancador': return 'Dançador';
      case 'manager': return 'Organizador';
      default: return 'O Girador';
    }
  };

  const PackCard = ({ pack, isRecommended }) => (
    <div className={`bg-white rounded-xl border flex flex-col h-full overflow-hidden transition-all group ${isRecommended ? 'border-amber-200 hover:shadow-lg hover:border-amber-400' : 'border-gray-200 hover:shadow-md hover:border-gray-300'}`}>
      <div className={`p-5 flex-1 flex flex-col ${isRecommended ? 'bg-gradient-to-br from-[#fdf6e7] to-white' : ''}`}>
        
        <div className="flex justify-between items-start mb-3">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getUniverseBadgeStyle(pack.universeId)}`}>
            {getUniverseName(pack.universeId)}
          </span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-1 rounded">
            {getAppLabel(pack.targetApp)}
          </span>
        </div>

        <h4 className="font-bold text-[#4a2e1b] text-lg mb-2 leading-tight">{pack.name}</h4>
        <p className="text-sm text-gray-600 mb-4 flex-1">{pack.description}</p>
        
        <div className="space-y-1.5 mb-5">
          {pack.features?.map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-1 h-1 rounded-full bg-amber-500 shrink-0"></div>
              <span>{feat}</span>
            </div>
          ))}
        </div>

      </div>
      
      <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="font-black text-xl text-[#4a2e1b]">
            {symbol === 'R$' ? 'R$' : ''}{pack.prices[currency]}{symbol === '€' ? '€' : ''}
          </div>
          <button 
            onClick={() => handleBuyClick(pack)}
            className={`flex items-center gap-2 px-4 py-2 font-bold text-sm rounded-lg transition-colors shadow-sm ${
              isRecommended 
                ? 'bg-[#d2691e] hover:bg-[#b05819] text-white' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Acheter pour {symbol === 'R$' ? 'R$' : ''}{pack.prices[currency]}{symbol === '€' ? '€' : ''}
          </button>
        </div>
        {pack.pricePoints && (
          <div className="flex items-center justify-between border-t border-gray-200 pt-3 mt-1">
            <div className="text-sm font-bold text-amber-700 flex items-center gap-1">
              <Sparkles className="w-4 h-4" /> {pack.pricePoints} pts
            </div>
            <button 
              onClick={() => handleBuyWithPoints(pack)}
              disabled={points < pack.pricePoints}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-bold text-xs rounded-lg transition-all ${
                points >= pack.pricePoints 
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300 shadow-sm cursor-pointer' 
                  : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-70'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {points >= pack.pricePoints ? `Débloquer avec ${pack.pricePoints} Points` : 'Points insuffisants'}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Header */}
      <div>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-amber-800 hover:text-amber-600 font-bold text-sm transition-colors w-max bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au tableau de bord
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#4a2e1b] text-white rounded-xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('/assets/texture.png')] mix-blend-overlay pointer-events-none"></div>
          
          <div className="relative z-10 w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="text-3xl font-black font-cordel mb-2 flex items-center gap-3 text-amber-500">
                <Store className="w-8 h-8" />
                Boutique O Girador
              </h2>
              <p className="text-amber-100 text-sm md:text-base leading-relaxed">
                Enrichissez votre écosystème avec de nouvelles séquences, des chorégraphies inédites et des ressources culturelles.
              </p>
            </div>
            
            {/* Karma Points Balance */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex items-center gap-4 shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-inner">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-amber-200 text-xs font-bold uppercase tracking-wider mb-0.5">Solde de points d'Axé</p>
                <div className="text-3xl font-black font-cordel text-white">{points}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-8">
          <div>
            <div className="h-6 bg-gray-200 rounded w-64 mb-4 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>)}
            </div>
          </div>
          <div>
            <div className="h-6 bg-gray-200 rounded w-64 mb-4 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2].map(i => <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>)}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Zone 1 : Recommandés */}
          {recommendedPacks.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-xl text-[#4a2e1b]">Recommandé pour votre groupe</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedPacks.map(pack => (
                  <PackCard key={pack.id} pack={pack} isRecommended={true} />
                ))}
              </div>
            </section>
          )}

          {/* Zone 2 : Upsell (Autres Univers) */}
          {otherPacks.length > 0 && (
            <section className="pt-6 border-t border-amber-900/10">
              <div className="flex items-center gap-2 mb-2">
                <Compass className="w-5 h-5 text-gray-400" />
                <h3 className="font-bold text-xl text-gray-700">Explorez la galaxie</h3>
              </div>
              <p className="text-sm text-gray-500 mb-6">Ces packs appartiennent à d'autres univers musicaux. Ouvrez vos horizons !</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherPacks.map(pack => (
                  <PackCard key={pack.id} pack={pack} isRecommended={false} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Modale d'Upsell Intelligent */}
      <UniverseWarningModal 
        isOpen={!!selectedWarningPack} 
        onClose={() => setSelectedWarningPack(null)}
        onConfirm={() => {
          alert(`Redirection vers le paiement pour le pack : ${selectedWarningPack?.name}`);
          setSelectedWarningPack(null);
        }}
        pack={selectedWarningPack}
        userUniverse={userUniverse}
      />

    </div>
  );
}

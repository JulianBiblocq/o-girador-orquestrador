/**
 * En-tête de la vue Séquenceur avec navigation retour et bouton de composition.
 */

import React from 'react';
import { ArrowLeft, Plus, ExternalLink } from 'lucide-react';
import { getEcosystemUrl } from '../../../constants/ecosystemUrls';

export default function SequencerHeader({ onBack, onOpenSequencer }) {
  return (
    <>
      {/* Bouton retour vers le tableau de bord */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-amber-800 hover:text-amber-600 font-bold text-sm transition-colors w-max bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au tableau de bord
      </button>

      {/* Bannière de titre */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fdf6e7] rounded-xl p-6 border border-amber-900/10 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-[#4a2e1b] font-cordel mb-1 flex items-center gap-2">
            <img src="/logos/sequenciador.png" alt="Séquenceur" className="w-8 h-8 rounded-lg" onError={(e) => { e.target.style.display = 'none'; }} />
            Séquenceur Audio
          </h2>
          <p className="text-[#8b4513] text-sm">Créez et arrangez les rythmes de votre association.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white text-gray-400 font-bold text-sm rounded-lg border border-gray-200 cursor-not-allowed">
            Voir tout le catalogue
          </button>
          <a
            href={getEcosystemUrl('sequenciador', '/app')}
            onClick={(e) => { e.preventDefault(); onOpenSequencer('/app'); }}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[#d2691e] hover:bg-[#b05819] text-white font-bold text-sm rounded-lg transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            Composer un rythme
            <ExternalLink className="w-3 h-3 opacity-70 ml-1" />
          </a>
        </div>
      </div>
    </>
  );
}

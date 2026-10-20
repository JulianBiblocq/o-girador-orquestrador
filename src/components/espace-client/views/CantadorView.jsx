import React from 'react';
import { Mic, ArrowLeft, ExternalLink, Sparkles, Music, Volume2 } from 'lucide-react';
import { launchCrossApp } from '../../../utils/crossAppAuth';
import { getEcosystemUrl } from '../../../constants/ecosystemUrls';
import ToadaPacksManager from './toada-packs/ToadaPacksManager';

export default function CantadorView({ onBack, groupId }) {
  const handleLaunchCantador = () => {
    const url = getEcosystemUrl('cantador');
    launchCrossApp(url, { appKey: 'cantador', appLabel: 'Cantador (Atelier Vocal)' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#231713] p-5 rounded-2xl border-2 border-[#9a3412]/50 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-xl border border-[#8b4513]/40 transition-colors cursor-pointer"
            title="Retour au tableau de bord"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-11 h-11 rounded-xl bg-[#9a3412] border border-[#c88a2b]/60 flex items-center justify-center text-[#fbbf24] shadow-inner">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-cordel text-xl font-bold text-[#fdf6e7] flex items-center gap-2">
              Cantador <span className="text-xs px-2 py-0.5 rounded bg-[#9a3412]/60 text-[#fbbf24] border border-[#c88a2b] font-sans">Oficina Vocal</span>
            </h3>
            <p className="text-xs text-[#d4b895]">Atelier vocal autonome : Toadas, Karaoké & guides de chant Puxador/Coro</p>
          </div>
        </div>

        <button
          onClick={handleLaunchCantador}
          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-[#9a3412] to-[#c25e38] hover:from-[#c25e38] hover:to-[#9a3412] text-white font-bold font-cordel text-sm rounded-xl border border-[#c88a2b]/60 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#fbbf24]" />
          <span>Ouvrir dans Cantador</span>
          <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-80" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#fdf6e7] border-2 border-[#8b4513]/20 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-[#9a3412] font-bold text-sm">
            <Volume2 className="w-4 h-4 text-[#0f766e]" />
            <span>Puxador & Coro</span>
          </div>
          <p className="text-xs text-[#4a2e1b] leading-relaxed">
            Séparation visuelle et guides audios dynamiques pour alterner naturellement le meneur et le chœur.
          </p>
        </div>

        <div className="bg-[#fdf6e7] border-2 border-[#8b4513]/20 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-[#9a3412] font-bold text-sm">
            <Music className="w-4 h-4 text-[#c88a2b]" />
            <span>Toada Karaoké</span>
          </div>
          <p className="text-xs text-[#4a2e1b] leading-relaxed">
            Défilement dynamique des paroles au tempo et synchronisation avec les pistes d'accompagnement.
          </p>
        </div>

        <div className="bg-[#fdf6e7] border-2 border-[#8b4513]/20 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-[#9a3412] font-bold text-sm">
            <Sparkles className="w-4 h-4 text-[#0f766e]" />
            <span>Packs de Chants</span>
          </div>
          <p className="text-xs text-[#4a2e1b] leading-relaxed">
            Exportez vos packs de toadas vers Séquenciad'Or et partagez vos compositions avec vos pupitres.
          </p>
        </div>
      </div>

      <div className="pt-2">
        <ToadaPacksManager groupId={groupId} />
      </div>
    </div>
  );
}

import React from 'react';
import { Mic, ArrowLeft, ExternalLink, Sparkles, Music, Volume2 } from 'lucide-react';
import { launchCrossApp } from '../../../utils/crossAppAuth';
import { getEcosystemUrl } from '../../../constants/ecosystemUrls';

export default function CantadorView({ onBack }) {
  const handleLaunchCantador = () => {
    const url = getEcosystemUrl('cantador');
    launchCrossApp(url, { appKey: 'cantador', appLabel: 'Cantador (Atelier Vocal)' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#1c1613] p-5 rounded-2xl border border-purple-800/40 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-xl border border-stone-700 transition-colors cursor-pointer"
            title="Retour au tableau de bord"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-11 h-11 rounded-xl bg-purple-950/80 border border-purple-600/50 flex items-center justify-center text-purple-300 shadow-inner">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-cordel text-xl font-bold text-[#fdf6e7] flex items-center gap-2">
              Cantador <span className="text-xs px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700 font-sans">Vocal Lab</span>
            </h3>
            <p className="text-xs text-stone-400">Atelier vocal autonome : Toadas, Karaoké & guides de chant Puxador/Coro</p>
          </div>
        </div>

        <button
          onClick={handleLaunchCantador}
          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold font-cordel text-sm rounded-xl border border-purple-400/40 shadow-md hover:shadow-purple-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Ouvrir dans Cantador</span>
          <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1c1613] border border-stone-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <Volume2 className="w-4 h-4" />
            <span>Puxador & Coro</span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            Séparation visuelle et guides audios dynamiques pour alterner naturellement le meneur et le chœur.
          </p>
        </div>

        <div className="bg-[#1c1613] border border-stone-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Music className="w-4 h-4" />
            <span>Toada Karaoké</span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            Défilement dynamique des paroles au tempo et synchronisation avec les pistes d'accompagnement.
          </p>
        </div>

        <div className="bg-[#1c1613] border border-stone-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Packs de Chants</span>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            Exportez vos packs de toadas vers Séquenciad'Or et partagez vos compositions avec vos pupitres.
          </p>
        </div>
      </div>
    </div>
  );
}

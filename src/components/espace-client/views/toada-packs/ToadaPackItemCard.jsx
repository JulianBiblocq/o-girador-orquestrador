import React, { useState } from 'react';
import { Mic, Play, Pause, Trash2, ExternalLink, Music, Volume2, ChevronDown, ChevronUp } from 'lucide-react';
import { launchCrossApp } from '../../../../utils/crossAppAuth';
import { getEcosystemUrl } from '../../../../constants/ecosystemUrls';

export default function ToadaPackItemCard({ pack, onDelete }) {
  const [playingUrl, setPlayingUrl] = useState(null);
  const [audioInstance, setAudioInstance] = useState(null);
  const [showPatterns, setShowPatterns] = useState(false);

  const patterns = Array.isArray(pack.patterns) ? pack.patterns : [];
  const playablePatterns = patterns.filter(p => p.audioUrl || (p.variants && Object.values(p.variants).some(v => v?.audioUrl)));

  const handlePlayToggle = (url) => {
    if (!url) return;
    if (audioInstance) {
      audioInstance.pause();
      if (playingUrl === url) {
        setPlayingUrl(null);
        setAudioInstance(null);
        return;
      }
    }
    const audio = new Audio(url);
    audio.play().catch(err => console.warn('Erreur lecture audio:', err));
    audio.onended = () => { setPlayingUrl(null); setAudioInstance(null); };
    setAudioInstance(audio);
    setPlayingUrl(url);
  };

  const handleOpenInCantador = () => {
    const url = getEcosystemUrl('cantador', `?toadaId=${pack.id}`);
    launchCrossApp(url, { appKey: 'cantador', appLabel: `Cantador — ${pack.title || 'Pack Vocal'}` });
  };

  return (
    <div className="bg-[#fdf6e7] border-2 border-[#8b4513]/30 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#9a3412] text-[#fbbf24] flex items-center justify-center font-bold">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-cordel text-base font-bold text-[#4a2e1b] leading-tight">
                {pack.title || pack.metadata?.title || 'Pack Vocal'}
              </h4>
              <span className="text-[10px] text-[#8b4513]/80 font-mono">
                {pack.bpm || 55} BPM • {pack.timeSignature || '4/4'} • {patterns.length} pattern(s)
              </span>
            </div>
          </div>
          <button
            onClick={() => onDelete(pack)}
            className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
            title="Supprimer ce pack vocal"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {playablePatterns.length > 0 && (
          <div className="mt-3 pt-2 border-t border-[#8b4513]/10">
            <button
              onClick={() => setShowPatterns(!showPatterns)}
              className="w-full flex items-center justify-between text-xs font-bold text-[#8b4513] hover:text-[#4a2e1b] py-1 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-[#0f766e]" />
                Pré-écoute ({playablePatterns.length} piste(s) audio)
              </span>
              {showPatterns ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showPatterns && (
              <div className="space-y-1.5 mt-2 max-h-40 overflow-y-auto pr-1">
                {playablePatterns.map((pat, idx) => {
                  const url = pat.audioUrl || (pat.variants && Object.values(pat.variants).find(v => v?.audioUrl)?.audioUrl);
                  const isPlaying = playingUrl === url;
                  return (
                    <div key={pat.id || idx} className="flex items-center justify-between p-2 rounded-lg bg-white/70 border border-[#8b4513]/20 text-xs">
                      <div className="truncate flex-1 pr-2">
                        <span className="font-bold text-[#4a2e1b]">{pat.name || `Padrão ${idx + 1}`}</span>
                        <span className="text-[10px] text-stone-500 ml-1.5 uppercase font-mono">({pat.role || 'voix'})</span>
                      </div>
                      <button
                        onClick={() => handlePlayToggle(url)}
                        className={`p-1.5 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                          isPlaying ? 'bg-[#9a3412] text-white' : 'bg-[#f4ecd8] text-[#9a3412] hover:bg-[#9a3412] hover:text-white'
                        }`}
                        title={isPlaying ? 'Pause' : 'Écouter'}
                      >
                        {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[#8b4513]/20 flex items-center justify-between">
        <span className="text-[10px] font-mono text-[#8b4513]/70">
          {pack.groupId ? `Groupe: ${pack.groupId}` : 'Public'}
        </span>
        <button
          onClick={handleOpenInCantador}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#9a3412] hover:bg-[#c25e38] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <span>Ouvrir dans Cantador</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

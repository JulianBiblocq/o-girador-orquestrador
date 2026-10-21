import React from 'react';
import { Mic, ExternalLink } from 'lucide-react';
import { Github } from './SocialIcons';
import { useLanguage } from '../../hooks/useLanguage';
import { getEcosystemUrl } from '../../constants/ecosystemUrls';

export default function TriptychCardCantador() {
  const { t } = useLanguage();
  const cantadorUrl = getEcosystemUrl('cantador');

  const features = [1, 2, 3, 4, 5]
    .map(num => t(`triptyque.cantador.feat${num}`))
    .filter(Boolean);

  return (
    <div className="bg-gradient-to-br from-[#312e81] via-[#2e1065] to-[#1e1b4b] text-white rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group border-4 border-[#4338ca] hover:border-indigo-300 transition-all">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-lg bg-white/10 text-indigo-200 flex items-center justify-center font-bold shadow border border-white/20">
            <Mic className="w-6 h-6 text-indigo-200" />
          </div>
          <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded bg-indigo-950 text-indigo-200 border border-indigo-700/60 shadow-sm">
            {t('triptyque.cantador.badge') || 'Atelier Vocal'}
          </span>
        </div>

        <h3 className="text-2xl font-black font-cordel text-white mb-2 group-hover:text-indigo-200 transition-colors">
          {t('triptyque.cantador.title') || 'O Girador Cantador'}
        </h3>
        <p className="text-xs text-indigo-100/90 mb-6 leading-relaxed">
          {t('triptyque.cantador.description')}
        </p>

        <div className="space-y-3 mb-8 text-xs">
          {features.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="w-4 h-4 rounded flex items-center justify-center shrink-0 font-bold bg-indigo-400/30 text-indigo-200">✓</span>
              <span className="text-indigo-50/95">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/20 pt-4 flex items-center justify-between">
        <a
          href="https://github.com/JulianBiblocq/o-girador-vocal-lab"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-indigo-200 hover:text-white flex items-center gap-1 font-semibold"
        >
          <Github className="w-3.5 h-3.5" /> Code Source
        </a>
        <a
          href={cantadorUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm"
        >
          <span>Ouvrir</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

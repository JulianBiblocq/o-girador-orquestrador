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
    <div className="bg-[#f4ecd8] text-[#2c1d11] border-4 border-[#9a3412] rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-[#c25e38] transition-all">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-lg bg-[#9a3412] text-[#f4ecd8] flex items-center justify-center font-bold shadow-md border border-[#c88a2b]/60">
            <Mic className="w-6 h-6 text-[#fbbf24]" />
          </div>
          <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded bg-[#9a3412] text-[#fbbf24] border border-[#c88a2b] shadow-sm">
            {t('triptyque.cantador.badge') || 'Atelier Vocal'}
          </span>
        </div>

        <h3 className="text-2xl font-black font-cordel text-[#9a3412] mb-2 group-hover:text-[#c25e38] transition-colors">
          {t('triptyque.cantador.title') || 'O Girador Cantador'}
        </h3>
        <p className="text-xs text-[#7c2d12] mb-6 leading-relaxed">
          {t('triptyque.cantador.description')}
        </p>

        <div className="space-y-3 mb-8 text-xs">
          {features.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="w-4 h-4 rounded flex items-center justify-center shrink-0 font-bold bg-[#0f766e] text-white">✓</span>
              <span className="text-[#4a2e1b]">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[#9a3412]/30 pt-4 flex items-center justify-between">
        <a
          href="https://github.com/JulianBiblocq/o-girador-vocal-lab"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-[#9a3412] hover:text-[#c25e38] flex items-center gap-1 font-semibold"
        >
          <Github className="w-3.5 h-3.5" /> Code Source
        </a>
        <a
          href={cantadorUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#9a3412] hover:bg-[#c25e38] text-white text-xs font-bold transition-all shadow-sm"
        >
          <span>Ouvrir</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

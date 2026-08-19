import React from 'react';
import { PlayCircle, Sparkles, ArrowRight } from 'lucide-react';
import universData from '../data/univers.json';
import { useLanguage } from '../hooks/useLanguage';
import { fetchHeroMetrics } from '../services/cmsService';
import { useState, useEffect } from 'react';

export default function HeroSection({ activeUniverse, onNavigate }) {
  const { t } = useLanguage();
  const universeObj = universData.universes.find(u => u.id === activeUniverse) || universData.universes[0];

  const [cmsMetrics, setCmsMetrics] = useState(null);

  useEffect(() => {
    fetchHeroMetrics().then(m => {
      if (m) setCmsMetrics(m);
    });
  }, []);

  const getMetric = (key, fallbackKey) => {
    if (cmsMetrics && cmsMetrics[key]) return cmsMetrics[key];
    return t(fallbackKey).replace(/🥁|📋|🌟|👣/g, '').trim();
  };

  return (
    <section className="relative overflow-hidden py-12 lg:py-16 paper-texture border-b-2 border-[#4a2e1b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-4xl mx-auto space-y-6">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f4e8cf] border-2 border-[#8b4513] text-[#8b4513] text-xs font-extrabold uppercase tracking-widest shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#e67e22]" />
          <span>{t('hero.badge')} {universeObj.name}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-[#4a2e1b] tracking-tight font-cordel leading-tight">
          {t('hero.title')} <span className="text-[#8b4513]">{t('hero.titleHighlight')}</span>
        </h1>

        <p className="text-sm sm:text-base text-[#8b4513] font-medium max-w-3xl mx-auto leading-relaxed">
          {t('hero.subtitle')}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <a
            href="#triptyque"
            className="px-6 py-3 bg-[#8b4513] text-[#fdf6e7] font-bold text-sm sm:text-base rounded-lg shadow-lg hover:bg-[#6e370f] transition-all flex items-center gap-2 border-2 border-[#4a2e1b]"
          >
            <span>{t('hero.exploreTriptyque')}</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <a
            href="#tarifs"
            className="px-6 py-3 bg-[#f4e8cf] text-[#4a2e1b] font-bold text-sm sm:text-base rounded-lg border-2 border-[#8b4513] hover:bg-[#ebd8b3] transition-all flex items-center gap-2 shadow-sm"
          >
            <span>{t('hero.discoverTarifs')}</span>
            <ArrowRight className="w-4 h-4 opacity-70" />
          </a>

          <button
            onClick={() => onNavigate('tutos')}
            className="px-6 py-3 bg-white/60 text-[#8b4513] font-bold text-sm sm:text-base rounded-lg border-2 border-[#8b4513]/40 hover:bg-white hover:border-[#8b4513] transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <PlayCircle className="w-5 h-5 text-[#e67e22]" />
            <span>{t('hero.watchDemos')}</span>
            <ArrowRight className="w-4 h-4 opacity-70" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 max-w-4xl mx-auto">
          <div className="p-4 bg-white/70 rounded-lg xilo-border text-center flex flex-col items-center justify-start">
            <img src="/logos/sequenciador.png" alt="Sequenciador" className="w-14 h-14 mb-3 object-contain drop-shadow-md" />
            <div className="text-xl font-black text-gray-800 font-cordel leading-tight">{getMetric('sequenceur', 'hero.metrics.sequenceur')}</div>
            <div className="text-xs text-gray-700 mt-2">{getMetric('sequenceurSub', 'hero.metrics.sequenceurSub')}</div>
          </div>
          <div className="p-4 bg-white/70 rounded-lg xilo-border text-center flex flex-col items-center justify-start">
            <img src="/logos/organizador.png" alt="Organizador" className="w-14 h-14 mb-3 object-contain drop-shadow-md" />
            <div className="text-xl font-black text-[#b58b4c] font-cordel leading-tight">{getMetric('manager', 'hero.metrics.manager')}</div>
            <div className="text-xs text-gray-700 mt-2">{getMetric('managerSub', 'hero.metrics.managerSub')}</div>
          </div>
          <div className="p-4 bg-white/70 rounded-lg xilo-border text-center flex flex-col items-center justify-start">
            <img src="/logos/mostrador.png" alt="Mostrador" className="w-14 h-14 mb-3 object-contain drop-shadow-md rounded-full" />
            <div className="text-xl font-black text-[#4a2e1b] font-cordel leading-tight">{getMetric('vitrine', 'hero.metrics.vitrine')}</div>
            <div className="text-xs text-gray-700 mt-2">{getMetric('vitrineSub', 'hero.metrics.vitrineSub')}</div>
          </div>
          <div className="p-4 bg-white/70 rounded-lg xilo-border text-center flex flex-col items-center justify-start">
            <img src="/logos/dancador.png" alt="Dançador" className="w-14 h-14 mb-3 object-contain drop-shadow-md" />
            <div className="text-xl font-black text-[#e67e22] font-cordel leading-tight">{getMetric('dancador', 'hero.metrics.dancador')}</div>
            <div className="text-xs text-gray-700 mt-2">{getMetric('dancadorSub', 'hero.metrics.dancadorSub')}</div>
          </div>
        </div>

      </div>
    </section>
  );
}

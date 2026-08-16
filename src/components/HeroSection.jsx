import React from 'react';
import { PlayCircle, Sparkles, ArrowRight } from 'lucide-react';
import universData from '../data/univers.json';
import { useLanguage } from '../hooks/useLanguage';

export default function HeroSection({ activeUniverse, onNavigate }) {
  const { t } = useLanguage();
  const universeObj = universData.universes.find(u => u.id === activeUniverse) || universData.universes[0];

  return (
    <section className="relative overflow-hidden py-12 lg:py-16 paper-texture border-b-2 border-[#4a2e1b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-4xl mx-auto space-y-6">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f4e8cf] border-2 border-[#8b4513] text-[#8b4513] text-xs font-extrabold uppercase tracking-widest shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#e67e22]" />
          <span>{t('hero.badge')} {universeObj.name}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-[#4a2e1b] tracking-tight font-cordel leading-tight">
          {t('hero.title')} <span className="text-[#8b4513] underline decoration-[#e67e22] decoration-wavy">{t('hero.titleHighlight')}</span>
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
          </a>

          <button
            onClick={() => onNavigate('tutos')}
            className="px-5 py-3 text-[#8b4513] hover:text-[#4a2e1b] font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
          >
            <PlayCircle className="w-5 h-5 text-[#e67e22]" />
            <span>{t('hero.watchDemos')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 max-w-3xl mx-auto">
          <div className="p-4 bg-white/70 rounded-lg xilo-border text-center">
            <div className="text-xl font-black text-[#8b4513] font-cordel">{t('hero.metrics.sequenceur')}</div>
            <div className="text-xs text-gray-700 mt-1">{t('hero.metrics.sequenceurSub')}</div>
          </div>
          <div className="p-4 bg-white/70 rounded-lg xilo-border text-center">
            <div className="text-xl font-black text-[#d2691e] font-cordel">{t('hero.metrics.manager')}</div>
            <div className="text-xs text-gray-700 mt-1">{t('hero.metrics.managerSub')}</div>
          </div>
          <div className="p-4 bg-white/70 rounded-lg xilo-border text-center">
            <div className="text-xl font-black text-[#b91c1c] font-cordel">{t('hero.metrics.vitrine')}</div>
            <div className="text-xs text-gray-700 mt-1">{t('hero.metrics.vitrineSub')}</div>
          </div>
        </div>

      </div>
    </section>
  );
}

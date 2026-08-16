import React from 'react';
import TriptychCard from './ui/TriptychCard';
import { useLanguage } from '../hooks/useLanguage';

export default function TriptychSection() {
  const { t } = useLanguage();

  return (
    <section id="triptyque" className="py-16 sm:py-20 bg-white/50 border-b-2 border-[#4a2e1b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-block px-3 py-1 bg-[#8b4513] text-[#fdf6e7] text-xs font-bold uppercase tracking-wider rounded">
            {t('triptyque.badge')}
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#4a2e1b] font-cordel">
            {t('triptyque.title')}
          </h2>
          <p className="text-xs sm:text-base text-[#8b4513] font-medium">
            {t('triptyque.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          <TriptychCard type="sequenceur" />
          <TriptychCard type="manager" />
          <TriptychCard type="vitrine" />
        </div>

      </div>
    </section>
  );
}

import React from 'react';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

export default function SynergySpotlight() {
  const { t } = useLanguage();

  return (
    <div className="bg-[#4a2e1b] text-[#fdf6e7] xilo-border rounded-xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#d2691e]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        <div className="lg:col-span-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500 text-amber-950 rounded font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            {t('tarifs.synergy.badge')}
          </div>
          <h3 className="text-2xl sm:text-4xl font-extrabold font-cordel text-white">
            {t('tarifs.synergy.title')}
          </h3>
          <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
            {t('tarifs.synergy.description')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-white/10 p-3 rounded-lg border border-amber-500/30 text-xs hover:bg-white/20 transition-colors">
              <strong className="text-amber-300 block mb-1">{t('tarifs.synergy.feat1Title')}</strong>
              {t('tarifs.synergy.feat1Text')}
            </div>
            <div className="bg-white/10 p-3 rounded-lg border border-amber-500/30 text-xs hover:bg-white/20 transition-colors">
              <strong className="text-amber-300 block mb-1">{t('tarifs.synergy.feat2Title')}</strong>
              {t('tarifs.synergy.feat2Text')}
            </div>
            <div className="bg-white/10 p-3 rounded-lg border border-amber-500/30 text-xs hover:bg-white/20 transition-colors">
              <strong className="text-amber-300 block mb-1">{t('tarifs.synergy.feat3Title')}</strong>
              {t('tarifs.synergy.feat3Text')}
            </div>
            <div className="bg-white/10 p-3 rounded-lg border border-amber-500/30 text-xs hover:bg-white/20 transition-colors">
              <strong className="text-amber-300 block mb-1">{t('tarifs.synergy.feat4Title')}</strong>
              {t('tarifs.synergy.feat4Text')}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-[#fdf6e7] text-[#2c1d11] p-6 rounded-xl border-2 border-amber-400 text-center space-y-4 shadow-lg">
          <div className="text-xl sm:text-2xl font-bold text-amber-600">🥁 ➔ 👣 ➔ 📋 ➔ 🌟</div>
          <h4 className="font-bold text-[#4a2e1b] text-base font-cordel">
            {t('tarifs.synergy.boxTitle')}
          </h4>
          <p className="text-xs text-[#8b4513]">
            {t('tarifs.synergy.boxText')}
          </p>
          <a
            href="https://www.helloasso.com"
            target="_blank"
            rel="noreferrer"
            className="w-full py-2.5 px-4 bg-[#8b4513] text-[#fdf6e7] font-bold text-xs rounded-lg hover:bg-[#6e370f] transition-all flex items-center justify-center gap-1.5 shadow"
          >
            <span>{t('tarifs.synergy.demoBtn')}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

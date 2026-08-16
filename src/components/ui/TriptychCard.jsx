import React from 'react';
import { Disc3, Calendar, Globe, Github } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

export default function TriptychCard({ type }) {
  const { t } = useLanguage();

  if (type === 'sequenceur') {
    return (
      <div className="bg-[#1a120b] text-[#fdf6e7] border-4 border-[#8b4513] rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-[#e67e22] transition-all">
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-lg bg-[#e67e22]/20 border border-[#e67e22] flex items-center justify-center text-[#e67e22]">
              <Disc3 className="w-6 h-6 animate-spin-slow" />
            </div>
            <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded bg-[#e67e22] text-[#1a120b]">
              {t('triptyque.sequenceur.badge')}
            </span>
          </div>

          <h3 className="text-2xl font-black font-cordel text-white mb-2 group-hover:text-[#e67e22] transition-colors">
            {t('triptyque.sequenceur.title')}
          </h3>
          <p className="text-xs text-amber-200/80 mb-6 leading-relaxed">
            {t('triptyque.sequenceur.description')}
          </p>

          <div className="space-y-3 mb-8 text-xs">
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded bg-[#e67e22]/20 text-[#e67e22] flex items-center justify-center shrink-0 font-bold">✓</span>
              <span>{t('triptyque.sequenceur.feat1')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded bg-[#e67e22]/20 text-[#e67e22] flex items-center justify-center shrink-0 font-bold">✓</span>
              <span>{t('triptyque.sequenceur.feat2')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded bg-[#e67e22]/20 text-[#e67e22] flex items-center justify-center shrink-0 font-bold">✓</span>
              <span>{t('triptyque.sequenceur.feat3')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded bg-[#e67e22]/20 text-[#e67e22] flex items-center justify-center shrink-0 font-bold">✓</span>
              <span>{t('triptyque.sequenceur.feat4')}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-amber-900/60 pt-4 flex items-center justify-between">
          <a
            href="https://github.com/julianbiblocq/o-girador"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-amber-300 hover:text-white flex items-center gap-1 font-semibold"
          >
            <Github className="w-3.5 h-3.5" /> {t('triptyque.sequenceur.repo')}
          </a>
          <span className="text-[10px] font-mono text-amber-400/60">React + Tone.js</span>
        </div>
      </div>
    );
  }

  if (type === 'manager') {
    return (
      <div className="bg-[#fdf6e7] text-[#2c1d11] xilo-border rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-[#d2691e] transition-all">
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-lg bg-[#8b4513] text-[#fdf6e7] flex items-center justify-center font-bold">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded bg-[#8b4513] text-[#fdf6e7]">
              {t('triptyque.manager.badge')}
            </span>
          </div>

          <h3 className="text-2xl font-black font-cordel text-[#4a2e1b] mb-2 group-hover:text-[#8b4513] transition-colors">
            {t('triptyque.manager.title')}
          </h3>
          <p className="text-xs text-[#8b4513] mb-6 leading-relaxed">
            {t('triptyque.manager.description')}
          </p>

          <div className="space-y-3 mb-8 text-xs">
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded bg-[#8b4513] text-[#fdf6e7] flex items-center justify-center shrink-0 font-bold">✓</span>
              <span>{t('triptyque.manager.feat1')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded bg-[#8b4513] text-[#fdf6e7] flex items-center justify-center shrink-0 font-bold">✓</span>
              <span>{t('triptyque.manager.feat2')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded bg-[#8b4513] text-[#fdf6e7] flex items-center justify-center shrink-0 font-bold">✓</span>
              <span>{t('triptyque.manager.feat3')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded bg-[#8b4513] text-[#fdf6e7] flex items-center justify-center shrink-0 font-bold">✓</span>
              <span>{t('triptyque.manager.feat4')}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#8b4513]/20 pt-4 flex items-center justify-between">
          <a
            href="https://github.com/JulianBiblocq/O-Girador-manager"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#8b4513] hover:text-[#4a2e1b] flex items-center gap-1 font-semibold"
          >
            <Github className="w-3.5 h-3.5" /> {t('triptyque.manager.repo')}
          </a>
          <span className="text-[10px] font-mono text-[#8b4513]/60">React + Firebase</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#d2691e] to-[#b91c1c] text-white rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group border-4 border-[#b91c1c] hover:border-amber-300 transition-all">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-lg bg-white text-[#b91c1c] flex items-center justify-center font-bold shadow">
            <Globe className="w-6 h-6" />
          </div>
          <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded bg-white text-[#b91c1c]">
            {t('triptyque.vitrine.badge')}
          </span>
        </div>

        <h3 className="text-2xl font-black font-cordel text-white mb-2 group-hover:text-amber-200 transition-colors">
          {t('triptyque.vitrine.title')}
        </h3>
        <p className="text-xs text-white/90 mb-6 leading-relaxed">
          {t('triptyque.vitrine.description')}
        </p>

        <div className="space-y-3 mb-8 text-xs">
          <div className="flex items-start gap-2">
            <span className="w-4 h-4 rounded bg-white/20 text-white flex items-center justify-center shrink-0 font-bold">✓</span>
            <span>{t('triptyque.vitrine.feat1')}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-4 h-4 rounded bg-white/20 text-white flex items-center justify-center shrink-0 font-bold">✓</span>
            <span>{t('triptyque.vitrine.feat2')}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-4 h-4 rounded bg-white/20 text-white flex items-center justify-center shrink-0 font-bold">✓</span>
            <span>{t('triptyque.vitrine.feat3')}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-4 h-4 rounded bg-white/20 text-white flex items-center justify-center shrink-0 font-bold">✓</span>
            <span>{t('triptyque.vitrine.feat4')}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/20 pt-4 flex items-center justify-between">
        <span className="text-xs text-white/90 font-semibold flex items-center gap-1">
          {t('triptyque.vitrine.note')}
        </span>
        <span className="text-[10px] font-mono text-white/80">Responsive & SEO</span>
      </div>
    </div>
  );
}

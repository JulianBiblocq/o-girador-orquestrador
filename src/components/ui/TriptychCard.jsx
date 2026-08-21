import React from 'react';
import { Disc3, Calendar, Globe, Github, Footprints, LayoutDashboard } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

export default function TriptychCard({ type }) {
  const { t } = useLanguage();

  const renderFeatures = (typeKey, styleClass) => {
    return (
      <div className="space-y-3 mb-8 text-xs">
        {[1, 2, 3, 4, 5, 6, 7].map(num => {
          const featText = t(`triptyque.${typeKey}.feat${num}`);
          if (!featText || featText === `triptyque.${typeKey}.feat${num}` || featText.includes('triptyque.')) return null;
          return (
            <div key={num} className="flex items-start gap-2">
              <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 font-bold ${styleClass}`}>✓</span>
              <span>{featText}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (type === 'sequenceur') {
    return (
      <div className="bg-[#18181b] text-[#fdf6e7] border-4 border-[#09090b] rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-[#3f3f46] transition-all">
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <Disc3 className="w-6 h-6 animate-spin-slow" />
            </div>
            <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded bg-black/50 text-white border border-white/20">
              {t('triptyque.sequenceur.badge')}
            </span>
          </div>

          <h3 className="text-2xl font-black font-cordel text-white mb-2 group-hover:text-gray-300 transition-colors">
            {t('triptyque.sequenceur.title')}
          </h3>
          <p className="text-xs text-gray-300 mb-6 leading-relaxed">
            {t('triptyque.sequenceur.description')}
          </p>

          {renderFeatures('sequenceur', 'bg-white/20 text-white')}
        </div>

        <div className="border-t border-white/20 pt-4 flex items-center justify-between">
          <a
            href="https://github.com/julianbiblocq/o-girador"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-gray-300 hover:text-white flex items-center gap-1 font-semibold"
          >
            <Github className="w-3.5 h-3.5" /> {t('triptyque.sequenceur.repo') || 'Code Source'}
          </a>
          <span className="text-[10px] font-mono text-gray-400">React + Tone.js</span>
        </div>
      </div>
    );
  }

  if (type === 'manager') {
    return (
      <div className="bg-[#fdf6e7] text-[#2c1d11] border-4 border-[#8b4513]/20 rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-[#8b4513] transition-all">
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

          {renderFeatures('manager', 'bg-[#8b4513] text-[#fdf6e7]')}
        </div>

        <div className="border-t border-[#8b4513]/20 pt-4 flex items-center justify-between">
          <a
            href="https://github.com/JulianBiblocq/O-Girador-manager"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#8b4513] hover:text-[#4a2e1b] flex items-center gap-1 font-semibold"
          >
            <Github className="w-3.5 h-3.5" /> {t('triptyque.manager.repo') || 'Code Source'}
          </a>
          <span className="text-[10px] font-mono text-[#8b4513]/60">React + Firebase</span>
        </div>
      </div>
    );
  }

  if (type === 'dancador') {
    return (
      <div className="bg-gradient-to-br from-[#991b1b] to-[#7f1d1d] text-white rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group border-4 border-[#991b1b] hover:border-red-400 transition-all">
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-lg bg-white/10 text-red-300 flex items-center justify-center font-bold shadow border border-white/20">
              <Footprints className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded bg-red-950 text-red-200 border border-red-800">
              {t('triptyque.dancador.badge') || 'Studio chorégraphique'}
            </span>
          </div>

          <h3 className="text-2xl font-black font-cordel text-white mb-2 group-hover:text-red-300 transition-colors">
            {t('triptyque.dancador.title')}
          </h3>
          <p className="text-xs text-red-100/90 mb-6 leading-relaxed">
            {t('triptyque.dancador.description')}
          </p>

          {renderFeatures('dancador', 'bg-red-400/30 text-red-200')}
        </div>

        <div className="border-t border-white/20 pt-4 flex items-center justify-between">
          <a
            href="https://github.com/JulianBiblocq/o-girador-dancador"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-red-300 hover:text-white flex items-center gap-1 font-semibold"
          >
            <Github className="w-3.5 h-3.5" /> Code Source
          </a>
          <span className="text-[10px] font-mono text-red-200/60">React + Three.js</span>
        </div>
      </div>
    );
  }

  if (type === 'terreiro') {
    return (
      <div className="bg-gradient-to-br from-[#8b4513] to-[#4a2e1b] text-white rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group border-4 border-[#4a2e1b] hover:border-[#c5631c] transition-all">
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-lg bg-white/10 text-amber-100 flex items-center justify-center font-bold shadow border border-white/20">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded bg-black/30 text-amber-100 border border-white/10">
              {t('triptyque.terreiro.badge') || 'Le Hub Global'}
            </span>
          </div>

          <h3 className="text-2xl font-black font-cordel text-white mb-2 group-hover:text-amber-200 transition-colors">
            {t('triptyque.terreiro.title')}
          </h3>
          <p className="text-xs text-amber-50/90 mb-6 leading-relaxed">
            {t('triptyque.terreiro.description')}
          </p>

          {renderFeatures('terreiro', 'bg-black/20 text-amber-100')}
        </div>

        <div className="border-t border-white/20 pt-4 flex items-center justify-between">
          <span className="text-xs text-amber-200 flex items-center gap-1 font-semibold">
            {t('triptyque.terreiro.note') || 'Connecté à l\'écosystème'}
          </span>
          <span className="text-[10px] font-mono text-amber-100/60">React + Firebase</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#d2691e] to-[#a04e14] text-white rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group border-4 border-[#d2691e] hover:border-amber-300 transition-all">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-lg bg-white text-[#d2691e] flex items-center justify-center font-bold shadow">
            <Globe className="w-6 h-6" />
          </div>
          <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded bg-white text-[#d2691e]">
            {t('triptyque.vitrine.badge')}
          </span>
        </div>

        <h3 className="text-2xl font-black font-cordel text-white mb-2 group-hover:text-amber-200 transition-colors">
          {t('triptyque.vitrine.title')}
        </h3>
        <p className="text-xs text-white/90 mb-6 leading-relaxed">
          {t('triptyque.vitrine.description')}
        </p>

        {renderFeatures('vitrine', 'bg-white/20 text-white')}
      </div>

      <div className="border-t border-white/20 pt-4 flex items-center justify-between">
        <span className="text-xs text-white/90 font-semibold flex items-center gap-1">
          {t('triptyque.vitrine.note') || 'Intégration directe Manager'}
        </span>
        <span className="text-[10px] font-mono text-white/80">Responsive & SEO</span>
      </div>
    </div>
  );
}

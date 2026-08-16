import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';

export default function LanguageSwitcher() {
  const { language, switchLanguage } = useLanguage();

  return (
    <div className="inline-flex items-center bg-[#f4e8cf] p-1 rounded-lg border border-[#8b4513]/40 shadow-inner">
      <button
        type="button"
        onClick={() => switchLanguage('fr')}
        className={`px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
          language === 'fr'
            ? 'bg-[#8b4513] text-[#fdf6e7] shadow-sm'
            : 'text-[#4a2e1b] hover:text-[#8b4513]'
        }`}
        title="Français (FR)"
      >
        <span>🇫🇷</span>
        <span className="hidden sm:inline">FR</span>
      </button>
      
      <button
        type="button"
        onClick={() => switchLanguage('pt-BR')}
        className={`px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
          language === 'pt-BR'
            ? 'bg-[#8b4513] text-[#fdf6e7] shadow-sm'
            : 'text-[#4a2e1b] hover:text-[#8b4513]'
        }`}
        title="Português do Brasil (PT-BR)"
      >
        <span>🇧🇷</span>
        <span className="hidden sm:inline">PT</span>
      </button>
    </div>
  );
}

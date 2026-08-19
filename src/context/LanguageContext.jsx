import React, { createContext, useContext, useState, useEffect } from 'react';
import frDict from '../locales/fr.json';
import ptBRDict from '../locales/pt-BR.json';

const translations = {
  fr: frDict,
  'pt-BR': ptBRDict
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const savedLang = localStorage.getItem('ogirador_lang');
    if (savedLang) return savedLang;
    
    // Auto-détection de la langue du navigateur
    const browserLang = typeof window !== 'undefined' ? (navigator.language || navigator.userLanguage) : 'fr';
    if (browserLang && browserLang.toLowerCase().startsWith('pt')) {
      return 'pt-BR';
    }
    return 'fr';
  });

  useEffect(() => {
    localStorage.setItem('ogirador_lang', language);
    document.documentElement.lang = language === 'pt-BR' ? 'pt-BR' : 'fr';
  }, [language]);

  /**
   * Fonction de résolution des clés de traduction i18n
   * Ex: t('header.title') => "O GIRADOR"
   */
  const t = (keyPath, fallback = '') => {
    if (!keyPath) return fallback;
    const keys = keyPath.split('.');
    let current = translations[language] || translations.fr;
    
    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // Fallback en français si la clé manque dans la langue secondaire
        let fallbackCurrent = translations.fr;
        for (const fKey of keys) {
          if (fallbackCurrent && fallbackCurrent[fKey] !== undefined) {
            fallbackCurrent = fallbackCurrent[fKey];
          } else {
            return fallback || keyPath;
          }
        }
        return fallbackCurrent;
      }
    }
    return typeof current === 'string' ? current : fallback || keyPath;
  };

  const switchLanguage = (newLang) => {
    if (translations[newLang]) {
      setLanguage(newLang);
    }
  };

  const value = {
    language,
    switchLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage doit être utilisé à l'intérieur d'un LanguageProvider");
  }
  return context;
}

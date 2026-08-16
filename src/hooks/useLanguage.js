import { useLanguage as useLang } from '../context/LanguageContext';

/**
 * Hook d'accès aux fonctionnalités d'internationalisation (i18n)
 */
export function useLanguage() {
  return useLang();
}

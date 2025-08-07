import { useTranslation as useI18nTranslation } from 'react-i18next';

/**
 * Hook personalizado para traducciones con fallbacks
 */
export const useTranslation = (namespace = 'common') => {
  const { t, i18n } = useI18nTranslation();

  const translate = (key, options = {}) => {
    // Intentar traducir con namespace
    const namespacedKey = namespace !== 'common' ? `${namespace}.${key}` : key;
    let translation = t(namespacedKey, { ...options, defaultValue: null });
    
    // Si no encuentra traducción, intentar en common
    if (!translation && namespace !== 'common') {
      translation = t(`common.${key}`, { ...options, defaultValue: null });
    }
    
    // Si aún no encuentra, usar la clave como fallback
    if (!translation) {
      translation = key.split('.').pop() || key;
    }
    
    return translation;
  };

  const changeLanguage = (lng) => {
    localStorage.setItem('language', lng);
    return i18n.changeLanguage(lng);
  };

  return {
    t: translate,
    i18n,
    changeLanguage,
    currentLanguage: i18n.language
  };
};
import { createContext, useContext, useState, useEffect } from 'react';
import translations, { languageMeta } from '../i18n/translations';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => localStorage.getItem('nutrichef_language') || 'en');

  useEffect(() => {
    localStorage.setItem('nutrichef_language', language);
  }, [language]);

  const setLanguage = (code) => {
    if (translations[code]) setLanguageState(code);
  };

  const t = (key) => translations[language]?.[key] || translations.en[key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languageMeta }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

import React, { createContext, useContext, useState, useEffect } from 'react';
import { en, TranslationKey } from '../locales/en';
import { bn } from '../locales/bn';

type SupportedLanguage = 'en' | 'bn';

interface LocaleContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: TranslationKey) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('cinebox4u_locale');
    return (saved === 'bn' || saved === 'en') ? saved : 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('cinebox4u_locale', lang);
  };

  const t = (key: TranslationKey): string => {
    if (language === 'bn') {
      return bn[key] || en[key] || key;
    }
    return en[key] || key;
  };

  return (
    <LocaleContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};

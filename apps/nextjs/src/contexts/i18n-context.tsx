"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "~/locales/translations";

export type Language = "vi" | "en" | "zh";

interface I18nContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.vi) => string;
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>("vi");

  useEffect(() => {
    const savedLang = localStorage.getItem("lang") as Language;
    if (savedLang && ["vi", "en", "zh"].includes(savedLang)) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("lang", lang);
  };

  const t = (key: keyof typeof translations.vi): string => {
    const dict = translations[language] || translations.vi;
    return dict[key] || translations.vi[key] || String(key);
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
};

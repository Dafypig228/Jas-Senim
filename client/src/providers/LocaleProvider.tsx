import { createContext, useState, useEffect, ReactNode } from "react";
import i18n from "@/lib/i18n";

interface LocaleContextType {
  locale: string;
  setLocale: (locale: string) => void;
  availableLocales: string[];
}

export const LocaleContext = createContext<LocaleContextType>({
  locale: "ru",
  setLocale: () => {},
  availableLocales: ["ru", "kk", "uz"]
});

interface LocaleProviderProps {
  children: ReactNode;
}

export const LocaleProvider = ({ children }: LocaleProviderProps) => {
  // Available locales
  const availableLocales = ["ru", "kk", "uz"];
  
  // Get initial locale from localStorage or default to Russian
  const getInitialLocale = (): string => {
    const savedLocale = localStorage.getItem("locale");
    
    // Check if saved locale is valid
    if (savedLocale && availableLocales.includes(savedLocale)) {
      return savedLocale;
    }
    
    // Get browser language
    const browserLang = navigator.language.split("-")[0];
    
    // Check if browser language is supported
    if (availableLocales.includes(browserLang)) {
      return browserLang;
    }
    
    // Default to Russian
    return "ru";
  };
  
  const [locale, setLocaleState] = useState<string>(getInitialLocale());
  
  // Update locale in i18n and localStorage
  const setLocale = (newLocale: string) => {
    if (availableLocales.includes(newLocale)) {
      i18n.changeLanguage(newLocale);
      localStorage.setItem("locale", newLocale);
      setLocaleState(newLocale);
      
      // Update HTML lang attribute
      document.documentElement.lang = newLocale;
    }
  };
  
  // Initialize i18n with current locale
  useEffect(() => {
    i18n.changeLanguage(locale);
    document.documentElement.lang = locale;
  }, [locale]);
  
  return (
    <LocaleContext.Provider value={{ locale, setLocale, availableLocales }}>
      {children}
    </LocaleContext.Provider>
  );
};

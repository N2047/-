"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { translations, Language, TranslationKey } from "@/lib/translations";

interface LanguageContextType {
  lang: Language;
  setLang: (newLang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, defaultVal?: string) => string;
  isNepali: boolean;
  isEnglish: boolean;
  dict: typeof translations.ne;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "dic_language_preference";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("ne");
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Restore saved language from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (saved === "ne" || saved === "en") {
        setLangState(saved);
        if (typeof document !== "undefined") {
          document.documentElement.lang = saved;
        }
      } else {
        if (typeof document !== "undefined") {
          document.documentElement.lang = "ne";
        }
      }
    } catch (e) {
      console.warn("Could not load language from localStorage", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Update language and persist
  const setLang = useCallback((newLang: Language) => {
    if (newLang !== "ne" && newLang !== "en") return;
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      if (typeof document !== "undefined") {
        document.documentElement.lang = newLang;
      }
    } catch (e) {
      console.warn("Could not save language to localStorage", e);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLang(lang === "ne" ? "en" : "ne");
  }, [lang, setLang]);

  // Dot-notation translation resolver
  const t = useCallback(
    (key: string, defaultVal?: string): string => {
      const currentDict = translations[lang] || translations.ne;
      
      // Direct key lookup
      if (key in currentDict) {
        return (currentDict as any)[key];
      }

      // Dot-notation lookup (e.g., "news.title", "common.home")
      const parts = key.split(".");
      let current: any = currentDict;
      for (const part of parts) {
        if (current && typeof current === "object" && part in current) {
          current = current[part];
        } else {
          current = undefined;
          break;
        }
      }

      if (typeof current === "string") {
        return current;
      }

      // If missing in requested language, do NOT mix languages unless defaultVal provided
      if (defaultVal !== undefined) {
        return defaultVal;
      }

      // Missing key warning in dev
      return key;
    },
    [lang]
  );

  const value = useMemo(
    () => ({
      lang,
      setLang,
      toggleLanguage,
      t,
      isNepali: lang === "ne",
      isEnglish: lang === "en",
      dict: translations[lang] || translations.ne
    }),
    [lang, setLang, toggleLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    // Graceful fallback for components rendered outside provider
    return {
      lang: "ne",
      setLang: () => {},
      toggleLanguage: () => {},
      t: (key: string, defaultVal?: string) => (translations.ne as any)[key] || defaultVal || key,
      isNepali: true,
      isEnglish: false,
      dict: translations.ne
    };
  }
  return context;
}

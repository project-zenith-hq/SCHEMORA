"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LocaleCode, DEFAULT_LOCALE, SUPPORTED_LOCALES, resolveTranslation, Translations } from '@/i18n/locales';
import enTranslations from '@/i18n/en.json';

interface TranslationContextProps {
  language: LocaleCode | string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  isTranslating: boolean;
  supportedLocales: typeof SUPPORTED_LOCALES;
}

const TranslationContext = createContext<TranslationContextProps | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<string>(DEFAULT_LOCALE);
  const [translations, setTranslations] = useState<Translations>(enTranslations);
  const [isTranslating, setIsTranslating] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const storedLang = localStorage.getItem('schemora_language');
      if (storedLang) {
        setLanguageState(storedLang);
      }
    } catch (e) {
      console.warn('Failed to read language from localStorage', e);
    }
  }, []);

  // When language changes, load the appropriate dictionary
  useEffect(() => {
    async function loadTranslations() {
      if (language === 'en') {
        setTranslations(enTranslations);
        return;
      }

      setIsTranslating(true);
      
      const localeConf = SUPPORTED_LOCALES.find(l => l.code === language);
      
      if (localeConf?.isStatic) {
        // Load static JSON
        try {
          // Dynamic import for the static JSON file
          const module = await import(`@/i18n/${language}.json`);
          setTranslations(module.default);
        } catch (error) {
          console.error(`Failed to load static translation for ${language}:`, error);
          // Fallback to English
          setTranslations(enTranslations);
        }
      } else {
        // Dynamic AI Translation (Phase 2)
        try {
          // Check local cache first
          const cacheKey = `schemora_translations_${language}`;
          const cached = localStorage.getItem(cacheKey);
          
          if (cached) {
            setTranslations(JSON.parse(cached));
          } else {
            // Call AI translation API
            const response = await fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ targetLanguage: language, source: enTranslations })
            });
            
            if (response.ok) {
              const data = await response.json();
              setTranslations(data.translations);
              localStorage.setItem(cacheKey, JSON.stringify(data.translations));
            } else {
              throw new Error('Translation API failed');
            }
          }
        } catch (error) {
          console.error('Failed dynamic translation:', error);
          // Fallback to English
          setTranslations(enTranslations);
        }
      }
      
      setIsTranslating(false);
    }

    loadTranslations();
  }, [language]);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('schemora_language', lang);
  };

  const t = (key: string): string => {
    // We pass the English fallback so it doesn't break if a translation is missing
    const englishFallback = resolveTranslation(enTranslations, key, key);
    return resolveTranslation(translations, key, englishFallback);
  };

  return (
    <TranslationContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isTranslating,
        supportedLocales: SUPPORTED_LOCALES
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}

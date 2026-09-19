"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeType = 'light' | 'dark' | 'system';
export type DensityType = 'comfortable' | 'compact';

interface SettingsContextProps {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  density: DensityType;
  setDensity: (density: DensityType) => void;
  reduceMotion: boolean;
  setReduceMotion: (reduce: boolean) => void;
  language: string;
  setLanguage: (lang: string) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
}

const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>('light');
  const [density, setDensityState] = useState<DensityType>('comfortable');
  const [reduceMotion, setReduceMotionState] = useState<boolean>(false);
  const [language, setLanguageState] = useState<string>('English');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem('schemora_theme') as ThemeType;
      const storedDensity = localStorage.getItem('schemora_density') as DensityType;
      const storedMotion = localStorage.getItem('schemora_motion');
      const storedLang = localStorage.getItem('schemora_language');

      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (storedTheme) setThemeState(storedTheme);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (storedDensity) setDensityState(storedDensity);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (storedMotion) setReduceMotionState(storedMotion === 'true');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (storedLang) setLanguageState(storedLang);
    } catch (e) {
      console.warn('Failed to read settings from localStorage', e);
    }
    setMounted(true);
  }, []);

  // Update theme data attribute and localStorage
  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem('schemora_theme', newTheme);
    applyTheme(newTheme);
  };

  const applyTheme = (currentTheme: ThemeType) => {
    if (!document) return;
    
    let resolvedTheme = currentTheme;
    if (currentTheme === 'system') {
      resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  };

  // Sync system theme changes if using 'system'
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      applyTheme('system'); // Initial apply
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      applyTheme(theme);
    }
  }, [theme]);

  // Update density data attribute and localStorage
  const setDensity = (newDensity: DensityType) => {
    setDensityState(newDensity);
    localStorage.setItem('schemora_density', newDensity);
    document.documentElement.setAttribute('data-density', newDensity);
  };

  // Set initial density
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-density', density);
    }
  }, [mounted, density]);

  // Update reduce motion data attribute and localStorage
  const setReduceMotion = (reduce: boolean) => {
    setReduceMotionState(reduce);
    localStorage.setItem('schemora_motion', String(reduce));
    document.documentElement.setAttribute('data-reduce-motion', String(reduce));
  };

  // Set initial reduce motion
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-reduce-motion', String(reduceMotion));
    }
  }, [mounted, reduceMotion]);

  // Update language
  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('schemora_language', lang);
  };

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme,
        density,
        setDensity,
        reduceMotion,
        setReduceMotion,
        language,
        setLanguage,
        isSettingsOpen,
        setIsSettingsOpen
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

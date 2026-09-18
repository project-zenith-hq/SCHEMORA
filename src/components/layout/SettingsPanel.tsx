"use client";

import React, { useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useTranslation } from '@/context/TranslationContext';
import { LanguageSelector } from './LanguageSelector';
import styles from './SettingsPanel.module.css';

export function SettingsPanel() {
  const { 
    isSettingsOpen, 
    setIsSettingsOpen,
    theme, 
    setTheme,
    density,
    setDensity,
    reduceMotion,
    setReduceMotion
  } = useSettings();

  const { language, setLanguage, t, supportedLocales, isTranslating } = useTranslation();

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSettingsOpen) {
        setIsSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsOpen, setIsSettingsOpen]);

  if (!isSettingsOpen) return null;

  return (
    <div className={`${styles.overlay} ${isSettingsOpen ? styles.open : ''}`} onClick={() => setIsSettingsOpen(false)}>
      <div 
        className={`${styles.panel} ${isSettingsOpen ? styles.panelOpen : ''}`} 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className={styles.header}>
          <h2 id="settings-title" className={styles.title}>{t('settings.title')}</h2>
          <button 
            className={styles.closeBtn} 
            onClick={() => setIsSettingsOpen(false)}
            aria-label={t('settings.close')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className={styles.content}>
          {/* Theme Section */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>{t('settings.appearance')}</h3>
            </div>
            
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label>{t('settings.theme')}</label>
                <span className={styles.desc}>{t('settings.themeDesc')}</span>
              </div>
              <div className={styles.segmentedControl}>
                <button 
                  className={`${styles.segmentButton} ${theme === 'light' ? styles.active : ''}`} 
                  onClick={() => setTheme('light')}
                >
                  {t('settings.themeOptions.light')}
                </button>
                <button 
                  className={`${styles.segmentButton} ${theme === 'dark' ? styles.active : ''}`} 
                  onClick={() => setTheme('dark')}
                >
                  {t('settings.themeOptions.dark')}
                </button>
                <button 
                  className={`${styles.segmentButton} ${theme === 'system' ? styles.active : ''}`} 
                  onClick={() => setTheme('system')}
                >
                  {t('settings.themeOptions.system')}
                </button>
              </div>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label>{t('settings.density')}</label>
                <span className={styles.desc}>{t('settings.densityDesc')}</span>
              </div>
              <div className={styles.segmentedControl}>
                <button 
                  className={`${styles.segmentButton} ${density === 'comfortable' ? styles.active : ''}`} 
                  onClick={() => setDensity('comfortable')}
                >
                  {t('settings.densityOptions.comfortable')}
                </button>
                <button 
                  className={`${styles.segmentButton} ${density === 'compact' ? styles.active : ''}`} 
                  onClick={() => setDensity('compact')}
                >
                  {t('settings.densityOptions.compact')}
                </button>
              </div>
            </div>
          </section>

          {/* Accessibility & Language Section */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>{t('settings.accessibility')}</h3>
            </div>
            
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label>{t('settings.language')} {isTranslating && <span className={styles.loadingPulse}>...</span>}</label>
                <span className={styles.desc}>{t('settings.languageDesc')}</span>
              </div>
              <div className={styles.selectWrapper}>
                <LanguageSelector />
              </div>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label>{t('settings.reduceMotion')}</label>
                <span className={styles.desc}>{t('settings.reduceMotionDesc')}</span>
              </div>
              <button 
                className={`${styles.switch} ${reduceMotion ? styles.switchOn : ''}`}
                onClick={() => setReduceMotion(!reduceMotion)}
                aria-pressed={reduceMotion}
              >
                <span className={styles.switchThumb}></span>
              </button>
            </div>
          </section>

          {/* Session/Data Section */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>{t('settings.session')}</h3>
            </div>
            
            <div className={styles.settingItem}>
              <button 
                className={styles.dangerBtn}
                onClick={() => {
                  if (confirm(t('settings.clearProgressConfirm'))) {
                    // Reset assessment logic here
                    localStorage.removeItem('schemora_assessment_state');
                    window.location.reload();
                  }
                }}
              >
                {t('settings.clearProgress')}
              </button>
            </div>
          </section>

        </div>
        
        <div className={styles.footer}>
          <span>{t('settings.version')}</span>
        </div>
      </div>
    </div>
  );
}

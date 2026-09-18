"use client";

import React, { useEffect } from 'react';
import styles from './SettingsPanel.module.css';
import { useSettings, ThemeType, DensityType } from '@/context/SettingsContext';
import { useAssessment } from '@/context/AssessmentContext';

export function SettingsPanel() {
  const { 
    isSettingsOpen, 
    setIsSettingsOpen,
    theme,
    setTheme,
    density,
    setDensity,
    reduceMotion,
    setReduceMotion,
    language,
    setLanguage
  } = useSettings();

  const { resetProfile } = useAssessment();

  // Close on Escape key
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

  const handleClearProgress = () => {
    if (window.confirm("Are you sure you want to clear your assessment progress? This cannot be undone.")) {
      resetProfile();
      setIsSettingsOpen(false);
    }
  };

  return (
    <div className={`${styles.overlay} ${isSettingsOpen ? styles.open : ''}`} onClick={() => setIsSettingsOpen(false)}>
      <div className={styles.panel} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div className={styles.header}>
          <h2 id="settings-title" className={styles.title}>Preferences</h2>
          <button className={styles.closeButton} onClick={() => setIsSettingsOpen(false)} aria-label="Close Settings">
            &times;
          </button>
        </div>

        <div className={styles.content}>
          
          {/* Appearance Section */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Appearance</h3>
            
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingName}>Theme</span>
                <span className={styles.settingDesc}>Choose your visual style</span>
              </div>
              <div className={styles.segmentedControl}>
                {(['light', 'dark', 'system'] as ThemeType[]).map(t => (
                  <button
                    key={t}
                    className={`${styles.segmentButton} ${theme === t ? styles.active : ''}`}
                    onClick={() => setTheme(t)}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingName}>Information Density</span>
                <span className={styles.settingDesc}>Adjust spacing scale</span>
              </div>
              <div className={styles.segmentedControl}>
                {(['comfortable', 'compact'] as DensityType[]).map(d => (
                  <button
                    key={d}
                    className={`${styles.segmentButton} ${density === d ? styles.active : ''}`}
                    onClick={() => setDensity(d)}
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Localization & Accessibility */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Accessibility & Locale</h3>
            
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingName}>Preferred Language</span>
                <span className={styles.settingDesc}>Assistant & content localization</span>
              </div>
              <select 
                className={styles.select}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Bengali">Bengali (বাংলা)</option>
                <option value="Marathi">Marathi (मराठी)</option>
                <option value="Telugu">Telugu (తెలుగు)</option>
                <option value="Tamil">Tamil (தமிழ்)</option>
              </select>
            </div>

            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingName}>Reduce Motion</span>
                <span className={styles.settingDesc}>Disable non-essential animations</span>
              </div>
              <button 
                className={styles.switch}
                role="switch"
                aria-checked={reduceMotion}
                onClick={() => setReduceMotion(!reduceMotion)}
              >
                <span className={styles.switchThumb} />
              </button>
            </div>
          </div>

          {/* Data & Session */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Session</h3>
            
            <div className={styles.settingRow}>
              <button className={styles.dangerAction} onClick={handleClearProgress}>
                Clear Assessment Progress
              </button>
            </div>
          </div>

        </div>

        <div className={styles.footer}>
          SCHEMORA Platform v0.1.0-beta
        </div>
      </div>
    </div>
  );
}

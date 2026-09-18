import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/context/TranslationContext';
import styles from './LanguageSelector.module.css';

export function LanguageSelector() {
  const { language, setLanguage, supportedLocales, t, isTranslating } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: string) => {
    setLanguage(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  const filteredLocales = supportedLocales.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indianLanguages = filteredLocales.filter(l => l.group === 'Indian Languages');
  const otherLanguages = filteredLocales.filter(l => l.group === 'Other Languages');

  const selectedLocale = supportedLocales.find(l => l.code === language);

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button 
        type="button" 
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={styles.triggerText}>
          {selectedLocale ? `${selectedLocale.nativeName} (${selectedLocale.name})` : 'Select Language'}
        </span>
        {isTranslating && <span className={styles.loadingPulse}>...</span>}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`${styles.chevron} ${isOpen ? styles.open : ''}`}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder={t('settings.searchLanguage') || 'Search languages...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className={styles.listbox} role="listbox">
            {indianLanguages.length > 0 && (
              <div className={styles.group}>
                <div className={styles.groupLabel}>Indian Languages</div>
                {indianLanguages.map(l => (
                  <button
                    key={l.code}
                    className={`${styles.option} ${language === l.code ? styles.selected : ''}`}
                    role="option"
                    aria-selected={language === l.code}
                    onClick={() => handleSelect(l.code)}
                  >
                    {l.nativeName} <span className={styles.englishName}>({l.name})</span>
                    {!l.isStatic && <span className={styles.aiBadge}>AI</span>}
                  </button>
                ))}
              </div>
            )}
            
            {otherLanguages.length > 0 && (
              <div className={styles.group}>
                <div className={styles.groupLabel}>Other Languages</div>
                {otherLanguages.map(l => (
                  <button
                    key={l.code}
                    className={`${styles.option} ${language === l.code ? styles.selected : ''}`}
                    role="option"
                    aria-selected={language === l.code}
                    onClick={() => handleSelect(l.code)}
                  >
                    {l.nativeName} <span className={styles.englishName}>({l.name})</span>
                    {!l.isStatic && <span className={styles.aiBadge}>AI</span>}
                  </button>
                ))}
              </div>
            )}
            
            {filteredLocales.length === 0 && (
              <div className={styles.noResults}>No languages found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

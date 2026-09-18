"use client";

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/TranslationContext';
import styles from './Footer.module.css';

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.brand}>
            <div className={styles.brandName}>SCHEMORA AI</div>
            <p className={styles.brandDesc}>
              {t('footer.brandDesc')}
            </p>
          </div>
          
          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <div className={styles.linkGroupTitle}>{t('footer.product')}</div>
              <Link href="/assessment" className={styles.link}>{t('nav.startAssessment')}</Link>
              <Link href="/explore" className={styles.link}>{t('nav.exploreSchemes')}</Link>
              <Link href="/#how-it-works" className={styles.link}>{t('nav.howItWorks')}</Link>
            </div>
            
            <div className={styles.linkGroup}>
              <div className={styles.linkGroupTitle}>{t('footer.company')}</div>
              <Link href="/about" className={styles.link}>{t('nav.about')}</Link>
              <Link href="/resources" className={styles.link}>{t('nav.resources')}</Link>
            </div>

            <div className={styles.linkGroup}>
              <div className={styles.linkGroupTitle}>{t('footer.legal')}</div>
              <Link href="/privacy" className={styles.link}>{t('footer.privacy')}</Link>
              <Link href="/terms" className={styles.link}>{t('footer.terms')}</Link>
            </div>
          </div>
        </div>
        
        <div className={styles.bottomSection}>
          <div className={styles.accuracyNote}>
            <strong>{t('footer.sourcesTitle')}</strong> {t('footer.sourcesDesc')} Last updated: September 2026.
          </div>
          <div className={styles.bottomBar}>
            <div>&copy; {new Date().getFullYear()} {t('footer.rights')}</div>
            <div className={styles.team}>
              <span><strong>{t('footer.team').split('—')[0]}</strong>—{t('footer.team').split('—')[1]}</span>
              <span>|</span>
              <span>{t('footer.event')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

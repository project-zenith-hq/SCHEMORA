import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.brand}>
            <div className={styles.brandName}>SCHEMORA AI</div>
            <p className={styles.brandDesc}>
              AI-driven scheme discovery and guidance for entrepreneurs. 
              Built for trust, precision, and accessibility.
            </p>
          </div>
          
          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <div className={styles.linkGroupTitle}>Product</div>
              <Link href="/assessment" className={styles.link}>Start Assessment</Link>
              <Link href="/explore" className={styles.link}>Explore Schemes</Link>
              <Link href="/#how-it-works" className={styles.link}>How It Works</Link>
            </div>
            
            <div className={styles.linkGroup}>
              <div className={styles.linkGroupTitle}>Company</div>
              <Link href="/about" className={styles.link}>About</Link>
              <Link href="/resources" className={styles.link}>Resources</Link>
            </div>

            <div className={styles.linkGroup}>
              <div className={styles.linkGroupTitle}>Legal</div>
              <Link href="/privacy" className={styles.link}>Privacy</Link>
              <Link href="/terms" className={styles.link}>Terms</Link>
            </div>
          </div>
        </div>
        
        <div className={styles.bottomSection}>
          <div className={styles.accuracyNote}>
            <strong>Sources & Accuracy:</strong> All scheme information is aggregated from official government publications. Rules and eligibility criteria are deterministically mapped directly from the latest gazette notifications. Last updated: September 2026.
          </div>
          <div className={styles.bottomBar}>
            <div>&copy; {new Date().getFullYear()} SCHEMORA AI. All rights reserved.</div>
            <div className={styles.team}>
              <span><strong>ASTRA-X</strong> — Ideas Beyond Limits</span>
              <span>|</span>
              <span>Smart India Hackathon 2026 (SIH26092)</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import HeroEngineDemo from "@/components/Home/HeroEngineDemo";
import styles from "./page.module.css";
import { useTranslation } from "@/context/TranslationContext";

const IndiaMap = dynamic(() => import("@/components/Map/IndiaMap"), { 
  ssr: false, 
  loading: () => <div className="animate-pulse bg-gray-100 rounded-lg w-full h-[400px] border border-gray-200"></div> 
});

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      
      {/* HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroLabel}>AI-Powered Scheme Discovery</div>
        <h1 className={styles.heroTitle}>
          <span style={{ color: 'var(--accent)' }}>{t('hero.headlineHighlight')}</span><br />
          {t('hero.headlineText')}
        </h1>
        <p className={styles.heroDesc}>
          {t('hero.subheadline')}
        </p>
        <div className={styles.heroActions}>
          <Link href="/assessment">
            <Button variant="primary" size="lg">{t('hero.ctaStart')} &rarr;</Button>
          </Link>
          <Link href="/explore">
            <Button variant="outline" size="lg">{t('hero.ctaExplore')}</Button>
          </Link>
        </div>

        {/* CREDIBILITY STRIP */}
        <div className={styles.credibilityStrip}>
          <div className={styles.credItem}>
            <strong>6</strong> {t('home.credAnalyzed')}
          </div>
          <div className={styles.credDivider} />
          <div className={styles.credItem}>
            {t('home.credEvent')}
          </div>
          <div className={styles.credDivider} />
          <div className={styles.credItem}>
            {t('home.credSector')}
          </div>
        </div>

        {/* UI PREVIEW / ENGINE DEMO */}
        <div className={styles.uiPreview}>
          <HeroEngineDemo />
        </div>
      </section>

      {/* TRUST SIGNALS */}
      <section className={styles.trustSignals}>
        <div className={styles.trustItem}>{t('home.trust1')}</div>
        <div className={styles.trustItem}>{t('home.trust2')}</div>
        <div className={styles.trustItem}>{t('home.trust3')}</div>
      </section>

      {/* PROBLEM SECTION */}
      <section className={styles.section} id="problem">
        <h2 className={styles.sectionTitle}>
          {t('home.problemTitle').split('\n').map((line: string, i: number) => (
            <React.Fragment key={i}>
              {line}
              {i === 0 && <br />}
            </React.Fragment>
          ))}
        </h2>
        
        <div className={styles.problemGrid}>
          <div>
            <div className={styles.problemNumber}>01</div>
            <h3 className={styles.problemItemTitle}>{t('home.problem1Title')}</h3>
            <p className={styles.problemItemDesc}>
              {t('home.problem1Desc')}
            </p>
          </div>
          <div>
            <div className={styles.problemNumber}>02</div>
            <h3 className={styles.problemItemTitle}>{t('home.problem2Title')}</h3>
            <p className={styles.problemItemDesc}>
              {t('home.problem2Desc')}
            </p>
          </div>
          <div>
            <div className={styles.problemNumber}>03</div>
            <h3 className={styles.problemItemTitle}>{t('home.problem3Title')}</h3>
            <p className={styles.problemItemDesc}>
              {t('home.problem3Desc')}
            </p>
          </div>
          <div>
            <div className={styles.problemNumber}>04</div>
            <h3 className={styles.problemItemTitle}>{t('home.problem4Title')}</h3>
            <p className={styles.problemItemDesc}>
              {t('home.problem4Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.section} id="how-it-works" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <h2 className={styles.sectionTitle}>{t('home.howTitle')}</h2>
        
        <div className={styles.timeline}>
          <div className={styles.timelineStep}>
            <div className={styles.timelineCircle}>01</div>
            <div className={styles.timelineTitle}>{t('home.how1Title')}</div>
            <div className={styles.timelineDesc}>{t('home.how1Desc')}</div>
          </div>
          <div className={styles.timelineStep}>
            <div className={styles.timelineCircle}>02</div>
            <div className={styles.timelineTitle}>{t('home.how2Title')}</div>
            <div className={styles.timelineDesc}>{t('home.how2Desc')}</div>
          </div>
          <div className={styles.timelineStep}>
            <div className={styles.timelineCircle}>03</div>
            <div className={styles.timelineTitle}>{t('home.how3Title')}</div>
            <div className={styles.timelineDesc}>{t('home.how3Desc')}</div>
          </div>
          <div className={styles.timelineStep}>
            <div className={styles.timelineCircle}>04</div>
            <div className={styles.timelineTitle}>{t('home.how4Title')}</div>
            <div className={styles.timelineDesc}>{t('home.how4Desc')}</div>
          </div>
          <div className={styles.timelineStep}>
            <div className={styles.timelineCircle}>05</div>
            <div className={styles.timelineTitle}>{t('home.how5Title')}</div>
            <div className={styles.timelineDesc}>{t('home.how5Desc')}</div>
          </div>
        </div>
      </section>

      {/* COVERAGE MAP SECTION */}
      <section className={styles.section} id="coverage">
        <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '1rem' }}>
          {t('home.coverageTitle')}
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
          {t('home.coverageDesc')}
        </p>
        <IndiaMap />
      </section>

    </div>
  );
}

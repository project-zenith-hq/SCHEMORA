"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      
      {/* HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroLabel}>AI-Powered Scheme Discovery</div>
        <h1 className={styles.heroTitle}>
          Find the support<br />that fits your ambition.
        </h1>
        <p className={styles.heroDesc}>
          SCHEMORA helps entrepreneurs discover potentially relevant government schemes, 
          understand eligibility, estimate financial requirements, prepare documents, 
          and identify where to apply.
        </p>
        <div className={styles.heroActions}>
          <Link href="/assessment">
            <Button variant="primary" size="lg">Start Assessment &rarr;</Button>
          </Link>
          <Link href="/explore">
            <Button variant="outline" size="lg">Explore Schemes</Button>
          </Link>
        </div>

        {/* UI PREVIEW */}
        <div className={styles.uiPreview}>
          <div className={styles.previewHeader}>
            <div className={styles.previewDot} />
            <div className={styles.previewDot} />
            <div className={styles.previewDot} />
          </div>
          <div className={styles.previewBody}>
            <div className={styles.previewSidebar}>
              <div className={`${styles.previewStep} ${styles.active}`}>01 Profile</div>
              <div className={styles.previewStep}>02 Business</div>
              <div className={styles.previewStep}>03 Funding</div>
              <div className={styles.previewStep}>04 Match Results</div>
            </div>
            <div className={styles.previewMain}>
              <div className={styles.skeletonLine}></div>
              <div className={`${styles.skeletonLine} ${styles.short}`}></div>
              <div className={styles.skeletonLine} style={{ marginTop: '2rem', height: '120px' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST SIGNALS */}
      <section className={styles.trustSignals}>
        <div className={styles.trustItem}>Rule-Based Eligibility</div>
        <div className={styles.trustItem}>Explainable Matching</div>
        <div className={styles.trustItem}>Source-Aware Information</div>
      </section>

      {/* PROBLEM SECTION */}
      <section className={styles.section} id="problem">
        <h2 className={styles.sectionTitle}>
          Finding the right opportunity shouldn't<br />require navigating complexity.
        </h2>
        
        <div className={styles.problemGrid}>
          <div>
            <div className={styles.problemNumber}>01</div>
            <h3 className={styles.problemItemTitle}>Discovery</h3>
            <p className={styles.problemItemDesc}>
              Entrepreneurs struggle to identify relevant schemes among hundreds of active government programs across different sectors.
            </p>
          </div>
          <div>
            <div className={styles.problemNumber}>02</div>
            <h3 className={styles.problemItemTitle}>Eligibility</h3>
            <p className={styles.problemItemDesc}>
              Complex statutory requirements, exclusions, and demographic criteria are difficult to understand and verify.
            </p>
          </div>
          <div>
            <div className={styles.problemNumber}>03</div>
            <h3 className={styles.problemItemTitle}>Application</h3>
            <p className={styles.problemItemDesc}>
              Required documents, financial projections, and application pathways vary widely and create friction.
            </p>
          </div>
          <div>
            <div className={styles.problemNumber}>04</div>
            <h3 className={styles.problemItemTitle}>Access</h3>
            <p className={styles.problemItemDesc}>
              Applicants often do not know where to begin, which portal to use, or which channel partner to approach.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.section} id="how-it-works" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <h2 className={styles.sectionTitle}>How SCHEMORA Works</h2>
        
        <div className={styles.timeline}>
          <div className={styles.timelineStep}>
            <div className={styles.timelineCircle}>01</div>
            <div className={styles.timelineTitle}>TELL US ABOUT YOU</div>
          </div>
          <div className={styles.timelineStep}>
            <div className={styles.timelineCircle}>02</div>
            <div className={styles.timelineTitle}>UNDERSTAND YOUR NEED</div>
          </div>
          <div className={styles.timelineStep}>
            <div className={styles.timelineCircle}>03</div>
            <div className={styles.timelineTitle}>CHECK ELIGIBILITY</div>
          </div>
          <div className={styles.timelineStep}>
            <div className={styles.timelineCircle}>04</div>
            <div className={styles.timelineTitle}>MATCH RELEVANT SCHEMES</div>
          </div>
          <div className={styles.timelineStep}>
            <div className={styles.timelineCircle}>05</div>
            <div className={styles.timelineTitle}>GUIDE YOUR NEXT STEP</div>
          </div>
        </div>
      </section>

    </div>
  );
}

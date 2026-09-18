"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import HeroEngineDemo from "@/components/Home/HeroEngineDemo";
import styles from "./page.module.css";

const IndiaMap = dynamic(() => import("@/components/Map/IndiaMap"), { 
  ssr: false, 
  loading: () => <div className="animate-pulse bg-gray-100 rounded-lg w-full h-[400px] border border-gray-200"></div> 
});

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

        {/* CREDIBILITY STRIP */}
        <div className={styles.credibilityStrip}>
          <div className={styles.credItem}>
            <strong>6</strong> Active Schemes Analyzed
          </div>
          <div className={styles.credDivider} />
          <div className={styles.credItem}>
            SIH26092: Ministry of Social Justice & Empowerment
          </div>
          <div className={styles.credDivider} />
          <div className={styles.credItem}>
            Manufacturing, Service & Agriculture
          </div>
        </div>

        {/* UI PREVIEW / ENGINE DEMO */}
        <div className={styles.uiPreview}>
          <HeroEngineDemo />
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
            <h3 className={styles.problemItemTitle}>Statutory Eligibility</h3>
            <p className={styles.problemItemDesc}>
              Complex statutory requirements, rigid exclusions, and layered demographic criteria (SC/ST, Area, Greenfield) are difficult to understand and verify.
            </p>
          </div>
          <div>
            <div className={styles.problemNumber}>03</div>
            <h3 className={styles.problemItemTitle}>Application Friction</h3>
            <p className={styles.problemItemDesc}>
              Required documents, financial projections (DPRs), and application pathways vary widely and create significant drop-off friction.
            </p>
          </div>
          <div>
            <div className={styles.problemNumber}>04</div>
            <h3 className={styles.problemItemTitle}>Access & Routing</h3>
            <p className={styles.problemItemDesc}>
              Applicants often do not know where to begin, which portal to use, or which nodal agency/channel partner to approach for sanction.
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
            <div className={styles.timelineDesc}>Input your business profile, demographics, and funding needs.</div>
          </div>
          <div className={styles.timelineStep}>
            <div className={styles.timelineCircle}>02</div>
            <div className={styles.timelineTitle}>RULE ENGINE RUNS</div>
            <div className={styles.timelineDesc}>We check statutory eligibility without LLM hallucination.</div>
          </div>
          <div className={styles.timelineStep}>
            <div className={styles.timelineCircle}>03</div>
            <div className={styles.timelineTitle}>MATCH SCHEMES</div>
            <div className={styles.timelineDesc}>Relevant schemes are ranked based on alignment and subsidy value.</div>
          </div>
          <div className={styles.timelineStep}>
            <div className={styles.timelineCircle}>04</div>
            <div className={styles.timelineTitle}>GET GUIDED</div>
            <div className={styles.timelineDesc}>See exactly which documents you need and where to apply.</div>
          </div>
          <div className={styles.timelineStep}>
            <div className={styles.timelineCircle}>05</div>
            <div className={styles.timelineTitle}>CONNECT</div>
            <div className={styles.timelineDesc}>Find nearby channel partners and nodal banks to submit your file.</div>
          </div>
        </div>
      </section>

      {/* COVERAGE MAP SECTION */}
      <section className={styles.section} id="coverage">
        <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '1rem' }}>
          National Network Coverage
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
          SCHEMORA aggregates intelligence across multiple central schemes and maps them to regional active channel partners.
        </p>
        <IndiaMap />
      </section>

    </div>
  );
}

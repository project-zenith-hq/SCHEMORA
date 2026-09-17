import Link from 'next/link';
import styles from './page.module.css';
import HeroBackground from '@/components/HeroBackground';
import HeroTelemetry from '@/components/HeroTelemetry';

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.nav} aria-label="Main navigation">
        <div className={styles.logo}>
          SCHEMORA<span>_</span>AI
        </div>
        <div className={styles.navLinks}>
          <Link href="/" className={`${styles.navLink} ${styles.navLinkActive}`}>Home</Link>
          <Link href="#challenge" className={styles.navLink}>How It Works</Link>
          <Link href="#intelligence" className={styles.navLink}>Intelligence</Link>
          <Link href="#action" className={styles.navLink}>Impact</Link>
        </div>
        <Link href="/assessment" className={styles.navCta}>
          Get Started &rarr;
        </Link>
      </nav>

      {/* Hero Section — Editorial Asymmetric */}
      <section className={styles.hero}>
        <HeroBackground />
        <HeroTelemetry />
        
        {/* Right HUD */}
        <div className={styles.hudRight}>
          <div className={styles.hudItem}>IDEAS</div>
          <div className={styles.hudItem}>PEOPLE</div>
          <div className={styles.hudItem}>OPPORTUNITIES</div>
          <div className={styles.hudItem}>STRONGER TOMORROW</div>
        </div>

        <div className={`${styles.heroContent} animate-fade-in`}>
          <div className={styles.heroMeta}>
            01 / INTELLIGENCE PLATFORM
          </div>

          <div className={styles.systemStatusModule}>
            <div className={styles.statusHeader}>SYSTEM ONLINE</div>
            <div className={styles.statusRow}>
              <span>SCHEMORA INTELLIGENCE</span>
              <span className={styles.statusReady}>READY</span>
            </div>
            <div className={styles.statusRow}>
              <span>RULE ENGINE</span>
              <span className={styles.statusReady}>READY</span>
            </div>
            <div className={styles.statusRow}>
              <span>MATCH ENGINE</span>
              <span className={styles.statusReady}>READY</span>
            </div>
            <div className={styles.statusRow}>
              <span>KNOWLEDGE LAYER</span>
              <span className={styles.statusReady}>READY</span>
            </div>
          </div>
          
          <h1 className={styles.heroTitle}>
            SCHEMORA <span>AI</span>
          </h1>
          <h2 className={styles.heroSubtitle}>
            AI-Driven Scheme Matching for Marginalized Entrepreneurs
          </h2>
          <p className={styles.heroSupporting}>
            Right Schemes. Clear Guidance. Brighter Futures.
          </p>
          
          <div className={styles.heroCtaGroup}>
            <div className={styles.ctaRow}>
              <Link href="/assessment" className={styles.primaryCta}>
                Start Assessment 
                <span className={styles.ctaArrow}>&rarr;</span>
              </Link>
              <Link href="#action" className={styles.secondaryCta}>
                Watch Demo
              </Link>
            </div>
            <div className={styles.trustSignal}>
              RULE-BASED ELIGIBILITY &bull; EXPLAINABLE MATCHING &bull; SOURCE-AWARE GUIDANCE
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className={styles.scrollIndicator}>
          <span>SCROLL TO EXPLORE</span>
          <span className={styles.scrollArrow}>&darr;</span>
        </div>
      </section>

      {/* Cinematic Transition */}
      <div className={styles.sectionTransition}>
        <div className={styles.transitionSignal}></div>
      </div>

      {/* Challenge Section */}
      <section id="challenge" className={styles.section}>
        <span className={styles.sectionSignature}>01 / THE CHALLENGE</span>
        <h2 className={styles.sectionTitle}>
          The Challenge We Solve
        </h2>
        <p className={styles.sectionSubtitle}>
          Turning complexity into opportunity.
        </p>
        
        <div className={styles.cardsGrid}>
          <div className={styles.card}>
            <span className={styles.cardNumber}>01</span>
            <h3 className={styles.cardTitle}>INFORMATION OVERLOAD</h3>
            <p className={styles.cardDesc}>
              Thousands of government schemes exist. Without dedicated guidance, discovering the right one is nearly impossible.
            </p>
          </div>
          <div className={styles.card}>
            <span className={styles.cardNumber}>02</span>
            <h3 className={styles.cardTitle}>COMPLEX ELIGIBILITY</h3>
            <p className={styles.cardDesc}>
              Conditions are buried in dense PDF policy documents, leading to high rejection rates and confusion.
            </p>
          </div>
          <div className={styles.card}>
            <span className={styles.cardNumber}>03</span>
            <h3 className={styles.cardTitle}>APPLICATION HURDLES</h3>
            <p className={styles.cardDesc}>
              Even when schemes are identified, navigating procedures and required documentation remains a massive barrier.
            </p>
          </div>
          <div className={styles.card}>
            <span className={styles.cardNumber}>04</span>
            <h3 className={styles.cardTitle}>MISSED OPPORTUNITIES</h3>
            <p className={styles.cardDesc}>
              Ultimately, eligible entrepreneurs miss vital financial support simply because they cannot find or understand it.
            </p>
          </div>
        </div>
      </section>

      <div className={styles.sectionTransition}>
        <div className={styles.transitionSignal}></div>
      </div>

      {/* See SCHEMORA in Action (Product Preview) */}
      <section id="action" className={styles.section}>
        <span className={styles.sectionSignature}>02 / IN ACTION</span>
        <h2 className={styles.sectionTitle}>
          SCHEMORA IN ACTION
        </h2>
        <p className={styles.sectionSubtitle}>
          From profile to opportunity — in one intelligent workflow.
        </p>

        <div className={styles.previewContainer}>
          <div className={styles.previewHeader}>
            <div className={styles.previewDots}>
              <div className={styles.dot}></div>
              <div className={styles.dot}></div>
              <div className={styles.dot}></div>
            </div>
            <span>SCHEMORA_WORKSPACE_v0.1</span>
          </div>
          
          <div className={styles.previewBody}>
            {/* Sidebar Data */}
            <div className={styles.previewSidebar}>
              <div className={styles.sidebarTitle}>PROFILE ANALYSIS</div>
              
              <div className={styles.profileItem}>
                <div className={styles.profileLabel}>BUSINESS TYPE</div>
                <div className={styles.profileValue}>Manufacturing</div>
              </div>
              <div className={styles.profileItem}>
                <div className={styles.profileLabel}>PROJECT COST</div>
                <div className={styles.profileValue}>₹ 8,00,000</div>
              </div>
              <div className={styles.profileItem}>
                <div className={styles.profileLabel}>LOCATION</div>
                <div className={styles.profileValue}>Example Location</div>
              </div>
              <div className={styles.profileItem}>
                <div className={styles.profileLabel}>FUNDING REQUIREMENT</div>
                <div className={styles.profileValue}>₹ 5,00,000</div>
              </div>
            </div>

            {/* Main Match Area */}
            <div className={styles.previewMain}>
              <div className={styles.previewScanline}></div>
              
              <div className={styles.matchHeader}>
                <div className={styles.matchSpinner}></div>
                <div className={styles.matchText}>ANALYZING PROFILE... 3 POTENTIAL MATCHES FOUND</div>
              </div>

              <div className={styles.previewCards}>
                {/* Result 1 */}
                <div className={styles.previewCard}>
                  <div className={styles.pcInfo}>
                    <h4>PMEGP Scheme</h4>
                    <p>Prime Minister&apos;s Employment Generation Programme</p>
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem' }}>
                      <span className={styles.eligibleLabel}>✓ ELIGIBLE</span>
                      <span className={styles.profileLabel}>WHY IT MATCHES: Manufacturing &lt; ₹10L</span>
                    </div>
                  </div>
                  <div className={styles.pcMatch}>
                    <div className={styles.pcScore}>98%</div>
                    <div className={styles.pcLabel}>MATCH SCORE</div>
                    <Link href="#" className={styles.navCta} style={{marginTop: '0.5rem', display: 'inline-block', fontSize: '0.6rem', padding: '0.4rem 1rem'}}>View Details &rarr;</Link>
                  </div>
                </div>

                {/* Result 2 */}
                <div className={styles.previewCard}>
                  <div className={styles.pcInfo}>
                    <h4>MUDRA Yojana (Tarun)</h4>
                    <p>Pradhan Mantri Mudra Yojana</p>
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem' }}>
                      <span className={styles.eligibleLabel}>✓ ELIGIBLE</span>
                      <span className={styles.profileLabel}>WHY IT MATCHES: Funding Req &le; ₹10L</span>
                    </div>
                  </div>
                  <div className={styles.pcMatch}>
                    <div className={styles.pcScore}>92%</div>
                    <div className={styles.pcLabel}>MATCH SCORE</div>
                    <Link href="#" className={styles.navCta} style={{marginTop: '0.5rem', display: 'inline-block', fontSize: '0.6rem', padding: '0.4rem 1rem'}}>View Details &rarr;</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.sectionTransition}>
        <div className={styles.transitionSignal}></div>
      </div>

      {/* Core Intelligence Architecture */}
      <section id="intelligence" className={styles.section}>
        <span className={styles.sectionSignature}>03 / INTELLIGENCE</span>
        <h2 className={styles.sectionTitle}>
          THE INTELLIGENCE LAYER
        </h2>
        <p className={styles.sectionSubtitle}>
          Combining deterministic trust with semantic intelligence.
        </p>
        
        <div className={styles.architectureMap}>
          <div className={styles.archBox}>
            <div className={styles.archTitle}>USER PROFILE</div>
          </div>
          <div className={styles.archArrow}></div>
          <div className={styles.archBox}>
            <div className={styles.archTitle}>PROFILE UNDERSTANDING</div>
            <div className={styles.archSub}>NLP Extraction</div>
          </div>
          <div className={styles.archArrow}></div>
          <div className={`${styles.archBox} ${styles.highlight}`}>
            <div className={styles.archTitle}>DETERMINISTIC ELIGIBILITY</div>
            <div className={styles.archSub}>Rule Engine = TRUST</div>
          </div>
          <div className={styles.archArrow}></div>
          <div className={`${styles.archBox} ${styles.highlight}`}>
            <div className={styles.archTitle}>AI MATCHING</div>
            <div className={styles.archSub}>AI Engine = INTELLIGENCE</div>
          </div>
          <div className={styles.archArrow}></div>
          <div className={styles.archBox}>
            <div className={styles.archTitle}>EXPLAINABLE RESULTS</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>
          SCHEMORA<span>_</span>AI
        </div>
        <p className={styles.footerTag}>
          INFRASTRUCTURE FOR INCLUSIVE ENTREPRENEURSHIP
        </p>
        
        <div className={styles.footerMeta}>
          <span>ASTRA-X</span>
          <span>|</span>
          <span>SIH26092</span>
        </div>
      </footer>
    </div>
  );
}

import React from 'react';

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '6rem 2rem', width: '100%' }}>
      <div style={{ marginBottom: '4rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 300, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          About SCHEMORA AI
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', lineHeight: 1.6 }}>
          Building an accessible bridge between government support and entrepreneurial ambition.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
        <section>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>Our Mission</h2>
          <p>
            SCHEMORA was created to solve a fundamental access problem: while numerous government schemes 
            and financial instruments exist to support entrepreneurs—particularly those from marginalized 
            backgrounds—navigating these opportunities is complex.
          </p>
          <p style={{ marginTop: '1rem' }}>
            We provide a deterministic, rule-based intelligence platform that helps users discover relevant 
            support, understand complex eligibility criteria, and take informed next steps.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>How We Do It</h2>
          <p>
            Unlike generic AI chatbots that hallucinate information, SCHEMORA relies on a strict, explainable matching engine. 
            We evaluate your profile against codified statutory rules, ensuring that every recommendation is traceable to 
            official guidelines.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>The Team</h2>
          <p>
            SCHEMORA AI is being developed by team <strong>ASTRA-X (Ideas Beyond Limits)</strong> for the 
            Smart India Hackathon (SIH26092). We are a dedicated group of engineers, designers, and researchers 
            committed to building technology that creates equitable access to financial opportunities.
          </p>
        </section>
      </div>
    </div>
  );
}

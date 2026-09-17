import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessment } from '@/context/AssessmentContext';
import { runSchemoraMatching } from '@/lib/engine';
import styles from '../assessment.module.css';

const ANALYSIS_STEPS = [
  'Understanding your profile',
  'Checking available eligibility rules',
  'Finding relevant schemes',
  'Ranking potential matches',
  'Preparing your guidance'
];

export function AnalysisTransition() {
  const router = useRouter();
  const { profile, setMatchResults } = useAssessment();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Run the actual matching algorithm immediately
    const results = runSchemoraMatching(profile);
    setMatchResults(results);

    // Simulate a thoughtful but quick loading state
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= ANALYSIS_STEPS.length - 1) {
          clearInterval(timer);
          router.push('/results');
          return prev;
        }
        return prev + 1;
      });
    }, 600); // Transitions fairly quickly, not faking a 20s load

    return () => clearInterval(timer);
  }, [profile, router, setMatchResults]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center w-full max-w-lg mx-auto">
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>SCHEMORA IS ANALYZING</h2>
      
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {ANALYSIS_STEPS.map((step, idx) => (
          <div 
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: idx === currentStep ? 'var(--bg-secondary)' : 'transparent',
              color: idx <= currentStep ? 'var(--text-primary)' : 'var(--text-dim)',
              transition: 'all 0.3s ease',
              opacity: idx > currentStep ? 0.4 : 1
            }}
          >
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: idx < currentStep ? 'var(--status-success)' : (idx === currentStep ? 'var(--accent)' : 'var(--border-subtle)'),
              color: idx <= currentStep ? '#fff' : 'inherit'
            }}>
              {idx < currentStep ? '✓' : idx + 1}
            </div>
            <span style={{ fontWeight: idx === currentStep ? 500 : 400 }}>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

import React from 'react';
import { useAssessment } from '@/context/AssessmentContext';
import { formatINR } from '@/lib/engine';
import { Button } from '@/components/ui/Button';

export function ReviewStep({ setStep }: { setStep: (step: number) => void }) {
  const { profile } = useAssessment();

  const ReviewSection = ({ title, step, children }: any) => (
    <div style={{
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      padding: '1.5rem',
      backgroundColor: 'var(--bg-primary)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{title}</h4>
        <Button variant="ghost" size="sm" onClick={() => setStep(step)}>Edit</Button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        {children}
      </div>
    </div>
  );

  const Item = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)' }}>{label}</span>
      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{value}</span>
    </div>
  );

  return (
    <>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Please review your information before we analyze your profile against our scheme database.
      </p>

      <ReviewSection title="Profile Information" step={1}>
        <Item label="Name" value={profile.fullName} />
        <Item label="Age & Gender" value={`${profile.age} • ${profile.gender}`} />
        <Item label="Category" value={profile.category} />
        <Item label="Annual Income" value={formatINR(profile.annualIncome)} />
        <Item label="Education" value={profile.education.replace('_', ' ')} />
      </ReviewSection>

      <ReviewSection title="Business Details" step={2}>
        <Item label="Type & Stage" value={`${profile.businessType.replace('_', ' ')} • ${profile.businessStage.replace('_', ' ')}`} />
        <Item label="Industry" value={profile.industry.replace('_', ' ')} />
        <Item label="Project Cost" value={formatINR(profile.projectCost)} />
      </ReviewSection>

      <ReviewSection title="Funding Request" step={3}>
        <Item label="Required Funding" value={formatINR(profile.requiredFunding)} />
        <Item label="Your Contribution" value={formatINR(profile.personalContribution)} />
        <Item label="Purpose" value={profile.fundingPurpose.replace(/_/g, ' ')} />
        <Item label="Loan Type" value={profile.loanType.replace(/_/g, ' ')} />
      </ReviewSection>

      <ReviewSection title="Location" step={4}>
        <Item label="State" value={profile.state} />
        <Item label="District & City" value={`${profile.district} • ${profile.city}`} />
        <Item label="Area" value={profile.areaType} />
      </ReviewSection>
    </>
  );
}

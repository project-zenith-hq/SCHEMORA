import React from 'react';
import { useAssessment } from '@/context/AssessmentContext';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatINR } from '@/lib/engine';

export function FundingStep() {
  const { profile, updateRequiredFunding, errors, setProfile } = useAssessment();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'requiredFunding') {
      updateRequiredFunding(Number(value));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      }));
    }
  };

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <Input
          label="Required Funding (₹)"
          name="requiredFunding"
          type="number"
          min={0}
          max={profile.projectCost}
          value={profile.requiredFunding || ''}
          onChange={handleInputChange}
          error={errors.requiredFunding}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
            Your Contribution
          </label>
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-muted)',
            fontSize: '0.95rem'
          }}>
            {formatINR(profile.personalContribution)}
          </div>
        </div>
      </div>
      <Select
        label="Primary Purpose of Funding"
        name="fundingPurpose"
        value={profile.fundingPurpose}
        onChange={handleInputChange}
        options={[
          { label: 'Machinery & Equipment', value: 'machinery_equipment' },
          { label: 'Working Capital', value: 'working_capital' },
          { label: 'Business Expansion', value: 'business_expansion' },
          { label: 'Raw Materials', value: 'raw_materials' },
          { label: 'Technology / Digital Infrastructure', value: 'tech_digital_infrastructure' }
        ]}
      />
      <Select
        label="Preferred Loan Type"
        name="loanType"
        value={profile.loanType}
        onChange={handleInputChange}
        options={[
          { label: 'Subsidy-linked Government Scheme', value: 'subsidy_linked_govt' },
          { label: 'Term Loan', value: 'term_loan' },
          { label: 'Working Capital / Cash Credit', value: 'working_capital_cc' },
          { label: 'Composite Loan (Term + Working Capital)', value: 'composite_loan' }
        ]}
      />
    </>
  );
}

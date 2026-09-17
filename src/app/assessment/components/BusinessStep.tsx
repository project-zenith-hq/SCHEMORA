import React from 'react';
import { useAssessment } from '@/context/AssessmentContext';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export function BusinessStep() {
  const { profile, setProfile, errors, updateProjectCost } = useAssessment();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'projectCost') {
      updateProjectCost(Number(value));
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
        <Select
          label="Business Type"
          name="businessType"
          value={profile.businessType}
          onChange={handleInputChange}
          options={[
            { label: 'New Business', value: 'new_business' },
            { label: 'Existing Business', value: 'existing_business' },
            { label: 'Self Employment', value: 'self_employment' },
            { label: 'Small Enterprise', value: 'small_enterprise' }
          ]}
        />
        <Select
          label="Business Stage"
          name="businessStage"
          value={profile.businessStage}
          onChange={handleInputChange}
          options={[
            { label: 'Idea / Concept', value: 'idea_concept' },
            { label: 'Setup / Early', value: 'setup_early' },
            { label: 'Operational', value: 'operational' },
            { label: 'Expansion', value: 'expansion' }
          ]}
        />
      </div>
      <Select
        label="Industry Sector"
        name="industry"
        value={profile.industry}
        onChange={handleInputChange}
        options={[
          { label: 'Manufacturing', value: 'manufacturing' },
          { label: 'Retail Trade', value: 'retail_trade' },
          { label: 'Services', value: 'services' },
          { label: 'Agriculture & Allied', value: 'agriculture_allied' },
          { label: 'Food Processing', value: 'food_processing' },
          { label: 'Technology', value: 'technology' },
          { label: 'Handicrafts & Artisans', value: 'handicrafts_artisans' },
          { label: 'Renewable Energy', value: 'renewable_energy' },
          { label: 'Other', value: 'other' }
        ]}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
          Project Description
        </label>
        <textarea
          name="projectDescription"
          placeholder="Briefly describe your venture or project..."
          value={profile.projectDescription}
          onChange={handleInputChange}
          rows={3}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            fontSize: '0.95rem',
            backgroundColor: 'var(--bg-primary)',
            border: `1px solid ${errors.projectDescription ? 'var(--status-error)' : 'var(--border-medium)'}`,
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            outline: 'none',
            resize: 'vertical'
          }}
        />
        {errors.projectDescription && (
          <span style={{ fontSize: '0.75rem', color: 'var(--status-error)', marginTop: '0.2rem' }}>
            {errors.projectDescription}
          </span>
        )}
      </div>
      <Input
        label="Estimated Project Cost (₹)"
        name="projectCost"
        type="number"
        min={0}
        value={profile.projectCost || ''}
        onChange={handleInputChange}
        error={errors.projectCost}
      />
    </>
  );
}

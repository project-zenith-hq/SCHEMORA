import React, { useMemo } from 'react';
import { useAssessment } from '@/context/AssessmentContext';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { INDIAN_STATES_DISTRICTS } from '@/data/locations';

export function LocationStep() {
  const { profile, setProfile, errors } = useAssessment();

  const stateOptions = useMemo(() => {
    return Object.keys(INDIAN_STATES_DISTRICTS).map(state => ({ label: state, value: state }));
  }, []);

  const districtOptions = useMemo(() => {
    if (!profile.state || !INDIAN_STATES_DISTRICTS[profile.state as keyof typeof INDIAN_STATES_DISTRICTS]) {
      return [];
    }
    return INDIAN_STATES_DISTRICTS[profile.state as keyof typeof INDIAN_STATES_DISTRICTS].map(d => ({ label: d, value: d }));
  }, [profile.state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'state') {
      setProfile(prev => ({
        ...prev,
        state: value,
        district: INDIAN_STATES_DISTRICTS[value as keyof typeof INDIAN_STATES_DISTRICTS][0] || ''
      }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <Select
          label="State"
          name="state"
          value={profile.state}
          onChange={handleInputChange}
          options={stateOptions}
        />
        <Select
          label="District"
          name="district"
          value={profile.district}
          onChange={handleInputChange}
          options={districtOptions}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <Input
          label="City / Town"
          name="city"
          placeholder="Enter city or town"
          value={profile.city}
          onChange={handleInputChange}
          error={errors.city}
        />
        <Select
          label="Area Type"
          name="areaType"
          value={profile.areaType}
          onChange={handleInputChange}
          options={[
            { label: 'Urban', value: 'urban' },
            { label: 'Rural', value: 'rural' }
          ]}
        />
      </div>
      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.85rem',
        color: 'var(--text-muted)'
      }}>
        <strong>Why we ask for Location:</strong> Many government schemes are specific to certain states, districts, or specifically target rural vs. urban development.
      </div>
    </>
  );
}

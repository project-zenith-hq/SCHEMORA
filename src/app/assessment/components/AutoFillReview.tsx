import React, { useState } from 'react';
import { ExtractedData } from '@/utils/idExtractor';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';
import { useAssessment } from '@/context/AssessmentContext';

interface AutoFillReviewProps {
  extractedData: ExtractedData;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AutoFillReview({ extractedData, onConfirm, onCancel }: AutoFillReviewProps) {
  const { profile, setProfile } = useAssessment();
  const [reviewData, setReviewData] = useState<ExtractedData>({ ...extractedData });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setReviewData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleApply = () => {
    setProfile(prev => ({
      ...prev,
      fullName: reviewData.fullName || prev.fullName,
      age: reviewData.age || prev.age,
      gender: (reviewData.gender as any) || prev.gender,
      state: reviewData.state || prev.state
    }));
    onConfirm();
  };

  return (
    <div style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--accent-amber)', marginBottom: '2rem' }}>
      <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Review Extracted Data</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        We found the following information. Please verify and edit if necessary before applying it to your profile.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        <Input
          label="Full Name"
          name="fullName"
          value={reviewData.fullName || ''}
          onChange={handleInputChange}
          placeholder="Not found"
        />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Age (Calculated from DOB)"
            name="age"
            type="number"
            value={reviewData.age || ''}
            onChange={handleInputChange}
            placeholder="Not found"
          />
          <Select
            label="Gender"
            name="gender"
            value={reviewData.gender || ''}
            onChange={handleInputChange}
            options={[
              { label: 'Select...', value: '' },
              { label: 'Female', value: 'female' },
              { label: 'Male', value: 'male' },
              { label: 'Transgender', value: 'transgender' },
              { label: 'Prefer not to say', value: 'prefer_not_to_say' }
            ]}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="ghost" onClick={onCancel}>Cancel Auto-Fill</Button>
        <Button variant="primary" onClick={handleApply}>Looks Good, Apply</Button>
      </div>
    </div>
  );
}

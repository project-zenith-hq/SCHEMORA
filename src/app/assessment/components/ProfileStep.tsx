import React from 'react';
import { useAssessment } from '@/context/AssessmentContext';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Gender, SocialCategory, EducationLevel } from '@/types/assessment';

export function ProfileStep() {
  const { profile, setProfile, errors } = useAssessment();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  return (
    <>
      <Input
        label="Full Name"
        name="fullName"
        placeholder="Enter your full name"
        value={profile.fullName}
        onChange={handleInputChange}
        error={errors.fullName}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <Input
          label="Age"
          name="age"
          type="number"
          min={18}
          max={100}
          value={profile.age || ''}
          onChange={handleInputChange}
          error={errors.age}
        />
        <Select
          label="Gender"
          name="gender"
          value={profile.gender}
          onChange={handleInputChange}
          options={[
            { label: 'Female', value: 'female' },
            { label: 'Male', value: 'male' },
            { label: 'Transgender', value: 'transgender' },
            { label: 'Prefer not to say', value: 'prefer_not_to_say' }
          ]}
        />
      </div>
      <Select
        label="Social Category"
        name="category"
        value={profile.category}
        onChange={handleInputChange}
        options={[
          { label: 'General', value: 'general' },
          { label: 'OBC', value: 'obc' },
          { label: 'SC', value: 'sc' },
          { label: 'ST', value: 'st' },
          { label: 'Minority', value: 'minority' },
          { label: 'Person with Disability', value: 'pwd' }
        ]}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <Input
          label="Annual Income (₹)"
          name="annualIncome"
          type="number"
          min={0}
          value={profile.annualIncome || ''}
          onChange={handleInputChange}
          error={errors.annualIncome}
        />
        <Select
          label="Education Level"
          name="education"
          value={profile.education}
          onChange={handleInputChange}
          options={[
            { label: 'Below 8th', value: 'below_8th' },
            { label: '8th Pass', value: '8th_pass' },
            { label: '10th Pass', value: '10th_pass' },
            { label: '12th Pass', value: '12th_pass' },
            { label: 'ITI / Diploma', value: 'iti_diploma' },
            { label: 'Graduate', value: 'graduate' },
            { label: 'Post Graduate', value: 'post_graduate' }
          ]}
        />
      </div>
    </>
  );
}

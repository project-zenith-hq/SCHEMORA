"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserProfile, AssessmentFormErrors, SchemeMatchResult } from '@/types/assessment';
import { DEFAULT_STATE, DEFAULT_DISTRICT } from '@/data/locations';

const INITIAL_PROFILE: UserProfile = {
  fullName: '',
  age: 28,
  gender: 'female',
  category: 'obc',
  annualIncome: 200000,
  education: '10th_pass',
  businessType: 'new_business',
  businessStage: 'idea_concept',
  industry: 'manufacturing',
  projectDescription: '',
  projectCost: 800000,
  requiredFunding: 650000,
  personalContribution: 150000,
  fundingPurpose: 'machinery_equipment',
  loanType: 'subsidy_linked_govt',
  state: DEFAULT_STATE,
  district: DEFAULT_DISTRICT,
  city: 'Varanasi Central',
  areaType: 'rural'
};

interface AssessmentContextProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  errors: AssessmentFormErrors;
  setErrors: React.Dispatch<React.SetStateAction<AssessmentFormErrors>>;
  matchResults: SchemeMatchResult[];
  setMatchResults: React.Dispatch<React.SetStateAction<SchemeMatchResult[]>>;
  updateProjectCost: (newCost: number) => void;
  updateRequiredFunding: (newFunding: number) => void;
  resetProfile: () => void;
}

const AssessmentContext = createContext<AssessmentContextProps | undefined>(undefined);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [errors, setErrors] = useState<AssessmentFormErrors>({});
  const [matchResults, setMatchResults] = useState<SchemeMatchResult[]>([]);

  const updateProjectCost = (newCost: number) => {
    const cost = Math.max(0, newCost);
    const required = Math.min(cost, profile.requiredFunding);
    const contribution = Math.max(0, cost - required);
    setProfile((prev) => ({
      ...prev,
      projectCost: cost,
      requiredFunding: required,
      personalContribution: contribution
    }));
  };

  const updateRequiredFunding = (newFunding: number) => {
    const funding = Math.max(0, newFunding);
    const contribution = Math.max(0, profile.projectCost - funding);
    setProfile((prev) => ({
      ...prev,
      requiredFunding: funding,
      personalContribution: contribution
    }));
  };

  const resetProfile = () => {
    setProfile(INITIAL_PROFILE);
    setErrors({});
    setMatchResults([]);
  };

  return (
    <AssessmentContext.Provider
      value={{
        profile,
        setProfile,
        errors,
        setErrors,
        matchResults,
        setMatchResults,
        updateProjectCost,
        updateRequiredFunding,
        resetProfile,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
}

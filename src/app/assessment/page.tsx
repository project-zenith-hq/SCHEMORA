"use client";

import React, { useState } from 'react';
import { useAssessment } from '@/context/AssessmentContext';
import { Button } from '@/components/ui/Button';

// Step Components
import { StepLayout } from './components/StepLayout';
import { ProfileStep } from './components/ProfileStep';
import { BusinessStep } from './components/BusinessStep';
import { FundingStep } from './components/FundingStep';
import { LocationStep } from './components/LocationStep';
import { ReviewStep } from './components/ReviewStep';
import { AnalysisTransition } from './components/AnalysisTransition';
import { DocumentScanner } from './components/DocumentScanner';
import { AutoFillReview } from './components/AutoFillReview';
import { ExtractedData } from '@/utils/idExtractor';

export default function AssessmentPage() {
  const [step, setStep] = useState(0); // 0 = Entry Method Selection
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [scannerMode, setScannerMode] = useState<'idle' | 'scanning' | 'review'>('idle');
  
  const { profile, setErrors } = useAssessment();

  const validateStep = (currentStep: number): boolean => {
    const newErrors: any = {};
    if (currentStep === 1) {
      if (!profile.fullName.trim()) newErrors.fullName = 'Full Name is required.';
      if (!profile.age || profile.age < 18 || profile.age > 100) newErrors.age = 'Age must be between 18 and 100.';
      if (profile.annualIncome < 0) newErrors.annualIncome = 'Annual income cannot be negative.';
    } else if (currentStep === 2) {
      if (!profile.projectDescription.trim() || profile.projectDescription.length < 15) {
        newErrors.projectDescription = 'Please provide at least 15 characters describing what you plan to start.';
      }
      if (!profile.projectCost || profile.projectCost <= 0) {
        newErrors.projectCost = 'Estimated project cost must be greater than ₹ 0.';
      }
    } else if (currentStep === 3) {
      if (profile.requiredFunding < 0) {
        newErrors.requiredFunding = 'Required funding cannot be negative.';
      }
      if (profile.requiredFunding > profile.projectCost) {
        newErrors.requiredFunding = 'Funding cannot exceed project cost.';
      }
    } else if (currentStep === 4) {
      if (!profile.city.trim()) newErrors.city = 'City/Town is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render the orchestrator
  if (step === 6) {
    return <AnalysisTransition />;
  }

  const renderStepContent = () => {
    switch (step) {
      case 0:
        if (scannerMode === 'scanning') {
          return (
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 1rem' }}>
              <DocumentScanner
                onDataExtracted={(data) => {
                  setExtractedData(data);
                  setScannerMode('review');
                }}
                onCancel={() => setScannerMode('idle')}
              />
            </div>
          );
        }
        
        if (scannerMode === 'review' && extractedData) {
          return (
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 1rem' }}>
              <AutoFillReview
                extractedData={extractedData}
                onConfirm={() => {
                  setScannerMode('idle');
                  setStep(1); // Proceed to profile step
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onCancel={() => setScannerMode('idle')}
              />
            </div>
          );
        }

        return (
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
            <h1 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '2.5rem' }}>Start Your Assessment</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.1rem' }}>
              Choose how you'd like to provide your profile details.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--accent-amber)', borderRadius: '12px', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 4px 20px rgba(234,179,8,0.1)' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', fontSize: '1.5rem' }}>Smart Auto-Fill</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Scan your ID (Aadhaar QR or photo) to securely auto-populate basic details. <strong>No sensitive numbers are stored.</strong></p>
                <Button variant="primary" style={{ width: '100%' }} onClick={() => setScannerMode('scanning')}>
                  Scan your ID to auto-fill
                </Button>
              </div>

              <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', fontSize: '1.5rem' }}>Manual Entry</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Type in all your profile details manually step by step.</p>
                <Button variant="ghost" style={{ width: '100%' }} onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  Enter manually
                </Button>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <StepLayout
            step={1}
            title="PROFILE"
            description="Tell us about yourself. This helps us match demographic-specific schemes."
            footer={
              <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="primary" onClick={handleNext}>Continue &rarr;</Button>
              </div>
            }
          >
            <ProfileStep />
          </StepLayout>
        );
      case 2:
        return (
          <StepLayout
            step={2}
            title="BUSINESS"
            description="Details about your venture help us identify sector-specific support."
            footer={
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="ghost" onClick={handleBack}>&larr; Back</Button>
                <Button variant="primary" onClick={handleNext}>Continue &rarr;</Button>
              </div>
            }
          >
            <BusinessStep />
          </StepLayout>
        );
      case 3:
        return (
          <StepLayout
            step={3}
            title="FUNDING"
            description="Understanding your financial needs helps filter schemes by loan size and subsidy caps."
            footer={
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="ghost" onClick={handleBack}>&larr; Back</Button>
                <Button variant="primary" onClick={handleNext}>Continue &rarr;</Button>
              </div>
            }
          >
            <FundingStep />
          </StepLayout>
        );
      case 4:
        return (
          <StepLayout
            step={4}
            title="LOCATION"
            description="Many schemes are restricted to specific states, districts, or rural areas."
            footer={
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="ghost" onClick={handleBack}>&larr; Back</Button>
                <Button variant="primary" onClick={handleNext}>Review &rarr;</Button>
              </div>
            }
          >
            <LocationStep />
          </StepLayout>
        );
      case 5:
        return (
          <StepLayout
            step={5}
            title="REVIEW YOUR INFORMATION"
            footer={
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="ghost" onClick={handleBack}>&larr; Back</Button>
                <Button variant="primary" onClick={handleNext}>Analyze My Options &rarr;</Button>
              </div>
            }
          >
            <ReviewStep setStep={setStep} />
          </StepLayout>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-secondary)', padding: '2rem 0' }}>
      {renderStepContent()}
    </div>
  );
}

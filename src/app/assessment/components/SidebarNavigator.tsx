"use client";

import React, { useState } from 'react';
import styles from './SidebarNavigator.module.css';
import { useAssessment } from '@/context/AssessmentContext';
import { formatINR } from '@/lib/engine';

interface SidebarNavigatorProps {
  currentStep: number;
  setStep: (step: number) => void;
}

const STEPS = [
  { id: 1, title: 'Profile' },
  { id: 2, title: 'Business' },
  { id: 3, title: 'Funding' },
  { id: 4, title: 'Location' },
  { id: 5, title: 'Review' }
];

export function SidebarNavigator({ currentStep, setStep }: SidebarNavigatorProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { profile } = useAssessment();

  // Don't show sidebar on Start screen or Analysis/Results screens
  if (currentStep < 1 || currentStep > 5) return null;

  const getPreviewData = (stepId: number) => {
    switch(stepId) {
      case 1: return profile.fullName ? `${profile.age} • ${profile.gender}` : 'Not started';
      case 2: return profile.industry ? profile.industry.replace(/_/g, ' ') : 'Not started';
      case 3: return profile.requiredFunding ? formatINR(profile.requiredFunding) : 'Not started';
      case 4: return profile.state ? `${profile.city}, ${profile.state}` : 'Not started';
      case 5: return 'Review details';
      default: return '';
    }
  };

  const handleStepClick = (stepId: number) => {
    if (stepId < currentStep) {
      setStep(stepId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <aside className={`${styles.sidebarContainer} ${isCollapsed ? styles.collapsed : ''}`}>
        <div className={styles.header}>
          <span className={styles.title}>Assessment</span>
          <button 
            className={styles.toggleBtn} 
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isCollapsed ? (
                <>
                  <line x1="21" y1="12" x2="3" y2="12"></line>
                  <polyline points="15 6 21 12 15 18"></polyline>
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <polyline points="9 18 3 12 9 6"></polyline>
                </>
              )}
            </svg>
          </button>
        </div>

        <div className={styles.stepsList}>
          {STEPS.map((step, index) => {
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;
            const isLast = index === STEPS.length - 1;

            return (
              <div 
                key={step.id} 
                className={`${styles.stepItem} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
                onClick={() => isCompleted && handleStepClick(step.id)}
              >
                {!isLast && (
                  <div className={styles.stepConnector}>
                    <div className={`${styles.stepConnectorFill} ${isCompleted ? styles.completed : ''}`} />
                  </div>
                )}
                
                <div className={styles.indicatorWrapper}>
                  <div className={styles.indicator}>
                    {isCompleted ? (
                      <svg className={styles.checkmark} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>
                </div>

                <div className={styles.contentWrapper}>
                  <span className={styles.stepTitle}>{step.title}</span>
                  <div className={styles.previewData} style={{ textTransform: 'capitalize' }}>
                    {getPreviewData(step.id)}
                  </div>
                </div>

                {isCollapsed && (
                  <div className={styles.tooltip}>{step.title}</div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Mobile Horizontal Tracker */}
      <div className={styles.mobileTracker}>
        <div className={styles.mobileScrollArea}>
          {STEPS.map((step, index) => {
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;
            const isLast = index === STEPS.length - 1;

            return (
              <div 
                key={step.id}
                className={`${styles.mobileStep} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
                onClick={() => isCompleted && handleStepClick(step.id)}
              >
                <div className={styles.indicator}>
                  {isCompleted ? (
                    <svg className={styles.checkmark} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <span className={styles.mobileTitle}>{step.title}</span>
                
                {!isLast && (
                  <div className={`${styles.mobileConnector} ${isCompleted ? styles.completed : ''}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

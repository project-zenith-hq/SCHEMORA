import React, { useState } from 'react';
import { Scheme, UserProfile, Gender, SocialCategory, BusinessType, IndustrySector } from '@/types/assessment';
import { evaluateDeterministicEligibility, formatINR } from '@/lib/engine';
import { DEFAULT_STATE, DEFAULT_DISTRICT } from '@/data/locations';
import styles from './SchemeEligibilityModal.module.css';

interface SchemeEligibilityModalProps {
  scheme: Scheme;
  onClose: () => void;
  onExit: () => void;
}

export default function SchemeEligibilityModal({ scheme, onClose, onExit }: SchemeEligibilityModalProps) {
  const rules = scheme.rules;

  // Initialize a mock profile, overriding only what user inputs
  const [profile, setProfile] = useState<UserProfile>({
    fullName: 'Applicant',
    age: 25,
    gender: 'female',
    category: 'general',
    annualIncome: 300000,
    education: '10th_pass',
    businessType: 'new_business',
    businessStage: 'idea_concept',
    industry: 'manufacturing',
    projectDescription: 'Generic Project',
    projectCost: 1000000,
    requiredFunding: 800000,
    personalContribution: 200000,
    fundingPurpose: 'working_capital',
    loanType: 'term_loan',
    state: DEFAULT_STATE,
    district: DEFAULT_DISTRICT,
    city: 'Local',
    areaType: 'urban'
  });

  const [hasEvaluated, setHasEvaluated] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof evaluateDeterministicEligibility> | null>(null);

  const handleEvaluate = () => {
    const evaluation = evaluateDeterministicEligibility(profile, scheme);
    setResult(evaluation);
    setHasEvaluated(true);
  };

  const showAge = rules.minAge !== undefined || rules.maxAge !== undefined;
  const showGender = rules.allowedGenders !== undefined || scheme.id === 'standup-india-2024';
  const showCategory = rules.allowedCategories !== undefined || scheme.id === 'standup-india-2024';
  const showBusiness = rules.allowedBusinessTypes !== undefined || rules.requiresGreenfield;
  const showIndustry = rules.allowedIndustries !== undefined;
  const showCost = rules.maxProjectCostManufacturing !== undefined || scheme.maxFundingAmount !== undefined;

  return (
    <div className={styles.overlay} onClick={onExit}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <h2>Eligibility Check: {scheme.name}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Back">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        </div>

        <div className={styles.content}>
          {!hasEvaluated ? (
            <div className={styles.form}>
              <p className={styles.description}>
                Please answer the following questions to check your eligibility for this specific scheme.
              </p>

              {scheme.needsVerification && (
                <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', padding: '12px', borderLeft: '4px solid var(--accent)', borderRadius: '4px', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '20px' }}>
                  ⚠️ <strong>Note:</strong> We only have partial eligibility data for this scheme. The evaluation may not be completely accurate. Please verify on the official portal.
                </div>
              )}

              {showAge && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Age</label>
                  <input 
                    type="number" 
                    className={styles.input}
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                  />
                </div>
              )}

              {showGender && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Gender</label>
                  <select 
                    className={styles.select}
                    value={profile.gender}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value as Gender })}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="transgender">Transgender</option>
                  </select>
                </div>
              )}

              {showCategory && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Social Category</label>
                  <select 
                    className={styles.select}
                    value={profile.category}
                    onChange={(e) => setProfile({ ...profile, category: e.target.value as SocialCategory })}
                  >
                    <option value="general">General</option>
                    <option value="obc">OBC</option>
                    <option value="sc">SC</option>
                    <option value="st">ST</option>
                    <option value="minority">Minority</option>
                    <option value="women_entrepreneur">Women Entrepreneur</option>
                  </select>
                </div>
              )}

              {showIndustry && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Industry Sector</label>
                  <select 
                    className={styles.select}
                    value={profile.industry}
                    onChange={(e) => setProfile({ ...profile, industry: e.target.value as IndustrySector })}
                  >
                    <option value="manufacturing">Manufacturing</option>
                    <option value="services">Services</option>
                    <option value="retail_trade">Retail & Trade</option>
                    <option value="agriculture_allied">Agriculture & Allied</option>
                    <option value="food_processing">Food Processing</option>
                    <option value="handicrafts_artisans">Handicrafts & Artisans</option>
                  </select>
                </div>
              )}

              {showBusiness && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Business Type</label>
                  <select 
                    className={styles.select}
                    value={profile.businessType}
                    onChange={(e) => setProfile({ ...profile, businessType: e.target.value as BusinessType })}
                  >
                    <option value="new_business">New Business (Greenfield)</option>
                    <option value="existing_business">Existing Business</option>
                  </select>
                </div>
              )}

              {showCost && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Project Cost (₹)</label>
                  <input 
                    type="number" 
                    className={styles.input}
                    value={profile.projectCost}
                    onChange={(e) => {
                      const cost = parseInt(e.target.value) || 0;
                      setProfile({ 
                        ...profile, 
                        projectCost: cost,
                        requiredFunding: Math.round(cost * 0.8),
                        personalContribution: Math.round(cost * 0.2)
                      });
                    }}
                  />
                </div>
              )}

              <button className={styles.evaluateBtn} onClick={handleEvaluate}>
                Check Eligibility
              </button>
            </div>
          ) : (
            <div className={styles.resultContainer}>
              {result?.isEligible ? (
                <div className={styles.successCard}>
                  <div className={styles.resultIcon}>✓</div>
                  <h3>You appear to be eligible!</h3>
                  <p>Based on your answers, you meet the primary criteria for this scheme.</p>
                </div>
              ) : (
                <div className={styles.errorCard}>
                  <div className={styles.resultIcon}>✕</div>
                  <h3>Not Eligible</h3>
                  <p>You do not meet one or more primary criteria for this scheme.</p>
                </div>
              )}

              <div className={styles.rulesList}>
                {result?.failedRules.map((rule, idx) => (
                  <div key={`f-${idx}`} className={`${styles.ruleItem} ${styles.ruleFailed}`}>
                    ✕ {rule}
                  </div>
                ))}
                {result?.pendingCheckRules.map((rule, idx) => (
                  <div key={`p-${idx}`} className={`${styles.ruleItem} ${styles.rulePending}`}>
                    ⚠ {rule}
                  </div>
                ))}
                {result?.matchedRules.map((rule, idx) => (
                  <div key={`m-${idx}`} className={`${styles.ruleItem} ${styles.ruleMatched}`}>
                    ✓ {rule}
                  </div>
                ))}
              </div>

              <div className={styles.actionRow}>
                <button className={styles.secondaryBtn} onClick={() => setHasEvaluated(false)}>
                  Re-check
                </button>
                <a href="/assessment" className={styles.primaryLink}>
                  Start Full Assessment
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

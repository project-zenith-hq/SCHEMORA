"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import styles from './assessment.module.css';
import { 
  UserProfile, 
  Gender, 
  SocialCategory, 
  EducationLevel, 
  BusinessType, 
  BusinessStage, 
  IndustrySector, 
  FundingPurpose, 
  PreferredLoanType, 
  AreaType, 
  SchemeMatchResult, 
  ChannelPartner,
  AssessmentFormErrors
} from '@/types/assessment';
import { INDIAN_STATES_DISTRICTS, DEFAULT_STATE, DEFAULT_DISTRICT } from '@/data/locations';
import { DEMO_USER_PRESET } from '@/data/schemes';
import { 
  formatINR, 
  calculateEMI, 
  runSchemoraMatching,
  isSpecialCategory
} from '@/lib/engine';

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

const ANALYSIS_STEPS = [
  { id: 1, title: 'ANALYZING PROFILE', doneText: 'PROFILE UNDERSTOOD & NORMALIZED' },
  { id: 2, title: 'CHECKING ELIGIBILITY RULES', doneText: 'DETERMINISTIC STATUTORY RULES EVALUATED' },
  { id: 3, title: 'SEARCHING SCHEME KNOWLEDGE', doneText: 'MSME & GOVT SCHEME DIRECTIVES ANALYZED' },
  { id: 4, title: 'RANKING POTENTIAL MATCHES', doneText: 'SUBSIDY & FIT RELEVANCE OPTIMIZED' },
  { id: 5, title: 'GENERATING EXPLANATION', doneText: 'TRANSPARENT AUDIT TRAIL READY' }
];

export default function AssessmentPage() {
  const [step, setStep] = useState<number>(1);
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [errors, setErrors] = useState<AssessmentFormErrors>({});

  // Analysis Animation State
  const [analysisStepIndex, setAnalysisStepIndex] = useState<number>(0);

  // Results State
  const [matchResults, setMatchResults] = useState<SchemeMatchResult[]>([]);
  const [filter, setFilter] = useState<'all' | 'eligible' | 'high_match' | 'subsidy' | 'collateral_free'>('all');
  const [sortBy, setSortBy] = useState<'best_match' | 'max_funding' | 'lowest_interest'>('best_match');
  const [savedSchemeIds, setSavedSchemeIds] = useState<string[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<SchemeMatchResult | null>(null);

  // Comparison State
  const [compareList, setCompareList] = useState<SchemeMatchResult[]>([]);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);

  // Detail Modal Sub-States
  const [calcLoan, setCalcLoan] = useState<number>(650000);
  const [calcRate, setCalcRate] = useState<number>(8.5);
  const [calcTenure, setCalcTenure] = useState<number>(7);
  const [calcMoratorium, setCalcMoratorium] = useState<number>(6);
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
  const [mapPartner, setMapPartner] = useState<ChannelPartner | null>(null);

  // AI Assistant in Modal
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([]);
  const [chatInput, setChatInput] = useState<string>('');

  // Auto-sync personal contribution with project cost
  const updateProjectCost = (newCost: number) => {
    const cost = Math.max(0, newCost);
    const required = Math.min(cost, profile.requiredFunding);
    const contribution = Math.max(0, cost - required);
    setProfile(prev => ({
      ...prev,
      projectCost: cost,
      requiredFunding: required,
      personalContribution: contribution
    }));
  };

  const updateRequiredFunding = (newFunding: number) => {
    const funding = Math.max(0, newFunding);
    const contribution = Math.max(0, profile.projectCost - funding);
    setProfile(prev => ({
      ...prev,
      requiredFunding: funding,
      personalContribution: contribution
    }));
  };

  // Sync loan defaults when opening scheme modal
  useEffect(() => {
    if (selectedScheme) {
      setCalcLoan(Math.min(profile.requiredFunding, selectedScheme.scheme.maxFundingAmount));
      setCalcRate(selectedScheme.scheme.interestRateMin);
      setCalcTenure(selectedScheme.scheme.repaymentTenureYears);
      setCalcMoratorium(selectedScheme.scheme.moratoriumMonths);
      setCheckedDocs({});
      // Seed contextual chat
      setChatMessages([
        {
          sender: 'ai',
          text: `Welcome, ${profile.fullName || 'Entrepreneur'}. I am SCHEMORA Intelligence. I can explain why "${selectedScheme.scheme.name}" was recommended, break down the margin subsidy, or guide you through required documentation.`
        }
      ]);
    }
  }, [selectedScheme, profile.requiredFunding, profile.fullName]);

  // Validation logic
  const validateStep = (currentStep: number): boolean => {
    const newErrors: AssessmentFormErrors = {};

    if (currentStep === 1) {
      if (!profile.fullName.trim()) newErrors.fullName = 'Full Name is required.';
      if (!profile.age || profile.age < 18 || profile.age > 80) newErrors.age = 'Age must be between 18 and 80.';
      if (profile.annualIncome < 0) newErrors.annualIncome = 'Annual income cannot be negative.';
    }

    if (currentStep === 2) {
      if (!profile.projectDescription.trim()) {
        newErrors.projectDescription = 'Please describe your business venture briefly.';
      } else if (profile.projectDescription.trim().length < 15) {
        newErrors.projectDescription = 'Please provide at least 15 characters describing what you plan to start.';
      }
      if (!profile.projectCost || profile.projectCost <= 0) {
        newErrors.projectCost = 'Estimated project cost must be greater than ₹ 0.';
      }
    }

    if (currentStep === 3) {
      if (!profile.requiredFunding || profile.requiredFunding <= 0) {
        newErrors.requiredFunding = 'Required funding must be greater than ₹ 0.';
      }
      if (profile.requiredFunding > profile.projectCost) {
        newErrors.requiredFunding = 'Funding requirement cannot exceed total project cost.';
      }
    }

    if (currentStep === 4) {
      if (!profile.state) newErrors.state = 'Please select your state.';
      if (!profile.district) newErrors.district = 'Please select your district.';
      if (!profile.city.trim()) newErrors.city = 'Please enter your town / village.';
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
    setStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Preset loader for SIH demonstration
  const handleLoadDemoPreset = () => {
    setProfile(DEMO_USER_PRESET);
    setErrors({});
  };

  // Browser Geolocation Trigger
  const handleUseMyLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setProfile(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            city: prev.city || 'Detected Location'
          }));
        },
        () => {
          // Graceful fallback simulation
          setProfile(prev => ({
            ...prev,
            state: 'Uttar Pradesh',
            district: 'Varanasi',
            city: 'Varanasi Central (Auto-located)'
          }));
        }
      );
    }
  };

  // Trigger analysis sequence
  const startAnalysis = () => {
    setStep(6); // Step 6 is analysis telemetry
    setAnalysisStepIndex(0);

    const interval = setInterval(() => {
      setAnalysisStepIndex(prev => {
        if (prev < ANALYSIS_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          // Complete analysis, generate matches, and transition to results
          setTimeout(() => {
            const results = runSchemoraMatching(profile);
            setMatchResults(results);
            setStep(7); // Step 7 is Results Dashboard
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 450);
          return prev;
        }
      });
    }, 380);
  };

  // Filter & Sort Results
  const filteredAndSortedResults = useMemo(() => {
    let list = [...matchResults];

    // Filter
    if (filter === 'eligible') {
      list = list.filter(r => r.eligibility.isEligible);
    } else if (filter === 'high_match') {
      list = list.filter(r => r.matchScore >= 90);
    } else if (filter === 'subsidy') {
      list = list.filter(r => r.scheme.subsidyRules !== undefined);
    } else if (filter === 'collateral_free') {
      list = list.filter(r => !r.scheme.collateralRequired);
    }

    // Sort
    if (sortBy === 'best_match') {
      list.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === 'max_funding') {
      list.sort((a, b) => b.scheme.maxFundingAmount - a.scheme.maxFundingAmount);
    } else if (sortBy === 'lowest_interest') {
      list.sort((a, b) => a.scheme.interestRateMin - b.scheme.interestRateMin);
    }

    return list;
  }, [matchResults, filter, sortBy]);

  // Toggle Saved Scheme
  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedSchemeIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Comparison toggle
  const toggleCompare = (res: SchemeMatchResult, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompareList(prev => {
      const exists = prev.some(item => item.scheme.id === res.scheme.id);
      if (exists) {
        return prev.filter(item => item.scheme.id !== res.scheme.id);
      } else {
        if (prev.length >= 3) {
          alert("You can compare up to 3 schemes simultaneously.");
          return prev;
        }
        return [...prev, res];
      }
    });
  };

  // EMI calculation in modal
  const emiCalculated = useMemo(() => {
    return calculateEMI(calcLoan, calcRate, calcTenure, calcMoratorium);
  }, [calcLoan, calcRate, calcTenure, calcMoratorium]);

  // Download Document Checklist
  const handleDownloadChecklist = (scheme: SchemeMatchResult) => {
    const lines = [
      `==================================================`,
      `SCHEMORA AI — OFFICIAL APPLICATION DOCUMENT CHECKLIST`,
      `SCHEME: ${scheme.scheme.name}`,
      `OFFICIAL CODE: ${scheme.scheme.officialCode}`,
      `APPLICANT: ${profile.fullName.toUpperCase()} (${profile.category.toUpperCase()})`,
      `LOCATION: ${profile.city}, ${profile.district}, ${profile.state} [${profile.areaType.toUpperCase()}]`,
      `ESTIMATED PROJECT COST: ${formatINR(profile.projectCost)}`,
      `REQUESTED FUNDING: ${formatINR(profile.requiredFunding)}`,
      `==================================================\n`,
      `MANDATORY REQUIRED DOCUMENTS:\n`,
      ...scheme.scheme.requiredDocuments.map((doc, idx) => `[ ] ${idx + 1}. ${doc}`),
      `\nAPPLICATION CHANNEL:\n${scheme.scheme.applicationChannel}`,
      `\nAPPLICATION WORKFLOW:\n`,
      ...scheme.scheme.applicationSteps.map((step, idx) => `Step ${idx + 1}: ${step}`),
      `\n==================================================`,
      `DISCLAIMER: Generated by SCHEMORA Decision Support Engine. Final approval subject to bank credit appraisal.`,
      `DEMO ENVIRONMENT • SMART INDIA HACKATHON 2024 / SIH26092`,
      `==================================================`
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SCHEMORA_Checklist_${scheme.scheme.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // AI Assistant query submission
  const handleSendChat = async (textToSend?: string) => {
    const q = (textToSend || chatInput).trim();
    if (!q || !selectedScheme) return;

    const userMsg = { sender: 'user' as const, text: q };
    setChatMessages(prev => [...prev, userMsg]);
    if (!textToSend) setChatInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          profileContext: profile,
          schemeContext: selectedScheme
        })
      });
      const data = await response.json();
      if (data.reply) {
        setChatMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
      } else {
        setChatMessages(prev => [...prev, { sender: 'ai', text: 'Error connecting to SCHEMORA intelligence.' }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'ai', text: 'Connection failed. Please try again.' }]);
    }
  };

  return (
    <div className={styles.container}>
      {/* Top HUD Navigation */}
      <header className={styles.topNav}>
        <div className={styles.logoArea}>
          <Link href="/" className={styles.logo}>
            SCHEMORA<span>_</span>AI
          </Link>
          <div className={styles.stepIndicatorBadge}>
            {step <= 5 && `ASSESSMENT / 0${step}`}
            {step === 6 && `ANALYSIS / RUNNING`}
            {step === 7 && `RESULTS / DASHBOARD`}
          </div>
        </div>

        <div className={styles.navStatus}>
          <div className={styles.secureStatus}>
            <span className={styles.pulseDot}></span>
            <span>SECURE ASSESSMENT ENVIRONMENT</span>
          </div>
          <span className={styles.demoBadge}>DEMO ENVIRONMENT • SIH26092</span>
          <Link href="/" className={styles.exitLink}>
            Exit to Home &rarr;
          </Link>
        </div>
      </header>

      <main className={styles.mainWrapper}>
        {/* Multi-Step Progress System (Visible for Steps 1 through 5) */}
        {step <= 5 && (
          <div className={styles.progressContainer}>
            <div className={styles.progressTrack}>
              {[
                { num: 1, label: '01 PROFILE' },
                { num: 2, label: '02 BUSINESS' },
                { num: 3, label: '03 FUNDING' },
                { num: 4, label: '04 LOCATION' },
                { num: 5, label: '05 REVIEW' }
              ].map((s, index) => {
                const isActive = step === s.num;
                const isCompleted = step > s.num;
                return (
                  <React.Fragment key={s.num}>
                    <button
                      type="button"
                      onClick={() => {
                        if (isCompleted) setStep(s.num);
                      }}
                      className={`${styles.stepNode} ${isActive ? styles.stepNodeActive : ''} ${isCompleted ? styles.stepNodeCompleted : ''}`}
                    >
                      <div className={styles.stepNodeNumber}>
                        {isCompleted ? '✓' : `0${s.num}`}
                      </div>
                      <span className={styles.stepNodeLabel}>{s.label}</span>
                    </button>
                    {index < 4 && (
                      <div 
                        className={`${styles.stepConnector} ${isCompleted ? styles.stepConnectorCompleted : ''}`} 
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 01: PROFILE INFORMATION */}
        {step === 1 && (
          <section className={styles.stageCard}>
            <div className={styles.stageHeader}>
              <div className={styles.stageSubHeader}>
                <span className={styles.stageTag}>[ STAGE 01 // INDIVIDUAL APPLICANT ]</span>
                <button 
                  type="button" 
                  onClick={handleLoadDemoPreset} 
                  className={styles.presetBtn}
                  title="Prefill realistic applicant for quick hackathon presentation"
                >
                  ⚡ Autofill Demo Applicant
                </button>
              </div>
              <h1 className={styles.stageTitle}>Tell Us About Yourself</h1>
              <p className={styles.stageSubtitle}>
                A few details help SCHEMORA identify statutory eligibility and reservation concessions.
              </p>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="fullName">
                  <span>FULL NAME *</span>
                  <span className={styles.fieldHelper}>As on Aadhaar / Official ID</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  className={`${styles.textInput} ${errors.fullName ? styles.textInputError : ''}`}
                  placeholder="e.g. Sunita Devi"
                  value={profile.fullName}
                  onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                />
                {errors.fullName && <span className={styles.fieldErrorText}>✕ {errors.fullName}</span>}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="age">
                  <span>AGE (YEARS) *</span>
                  <span className={styles.fieldHelper}>Min 18 for credit schemes</span>
                </label>
                <input
                  id="age"
                  type="number"
                  min="18"
                  max="80"
                  className={`${styles.textInput} ${errors.age ? styles.textInputError : ''}`}
                  value={profile.age}
                  onChange={e => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                />
                {errors.age && <span className={styles.fieldErrorText}>✕ {errors.age}</span>}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  <span>GENDER *</span>
                  <span className={styles.fieldHelper}>Important for Stand-Up India & Women quotas</span>
                </label>
                <div className={styles.segmentedGroup}>
                  {(['female', 'male', 'transgender', 'prefer_not_to_say'] as Gender[]).map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setProfile({ ...profile, gender: g })}
                      className={`${styles.segmentedButton} ${profile.gender === g ? styles.segmentedButtonActive : ''}`}
                    >
                      {g.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="category">
                  <span>SOCIAL / COMMUNITY CATEGORY *</span>
                  <span className={styles.fieldHelper}>Determines margin money subsidy %</span>
                </label>
                <select
                  id="category"
                  className={styles.selectInput}
                  value={profile.category}
                  onChange={e => setProfile({ ...profile, category: e.target.value as SocialCategory })}
                >
                  <option value="general">General Category</option>
                  <option value="obc">Other Backward Class (OBC)</option>
                  <option value="sc">Scheduled Caste (SC)</option>
                  <option value="st">Scheduled Tribe (ST)</option>
                  <option value="minority">Religious Minority Community</option>
                  <option value="women_entrepreneur">Women Owned Enterprise (&gt;51%)</option>
                  <option value="pwd">Specially Abled / PwD</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="annualIncome">
                  <span>ANNUAL HOUSEHOLD INCOME (₹)</span>
                  <span className={styles.fieldHelper}>{formatINR(profile.annualIncome)}</span>
                </label>
                <input
                  id="annualIncome"
                  type="number"
                  step="10000"
                  className={styles.textInput}
                  value={profile.annualIncome}
                  onChange={e => setProfile({ ...profile, annualIncome: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="education">
                  <span>EDUCATION LEVEL *</span>
                  <span className={styles.fieldHelper}>PMEGP mandates 8th pass for &gt;₹10L Mfg</span>
                </label>
                <select
                  id="education"
                  className={styles.selectInput}
                  value={profile.education}
                  onChange={e => setProfile({ ...profile, education: e.target.value as EducationLevel })}
                >
                  <option value="below_8th">Below 8th Standard</option>
                  <option value="8th_pass">8th Pass</option>
                  <option value="10th_pass">10th Pass (Matriculation)</option>
                  <option value="12th_pass">12th Pass (Intermediate)</option>
                  <option value="iti_diploma">ITI / Polytechnic Diploma</option>
                  <option value="graduate">Graduate (BA / BSc / BCom / BTech)</option>
                  <option value="post_graduate">Post Graduate</option>
                </select>
              </div>
            </div>

            <div className={styles.actionsBar}>
              <Link href="/" className={styles.secondaryBtn}>
                &larr; Return to Home
              </Link>
              <button type="button" onClick={handleNext} className={styles.primaryBtn}>
                Next: Business Details &rarr;
              </button>
            </div>
          </section>
        )}

        {/* STEP 02: BUSINESS INFORMATION */}
        {step === 2 && (
          <section className={styles.stageCard}>
            <div className={styles.stageHeader}>
              <span className={styles.stageTag}>[ STAGE 02 // ENTERPRISE SPECIFICATION ]</span>
              <h1 className={styles.stageTitle}>Your Business</h1>
              <p className={styles.stageSubtitle}>
                Specify your proposed venture, target sector, and expected capital requirements.
              </p>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="businessType">
                  <span>BUSINESS TYPE *</span>
                </label>
                <select
                  id="businessType"
                  className={styles.selectInput}
                  value={profile.businessType}
                  onChange={e => setProfile({ ...profile, businessType: e.target.value as BusinessType })}
                >
                  <option value="new_business">New Business (Greenfield Project)</option>
                  <option value="existing_business">Existing Business (Expansion / Modernization)</option>
                  <option value="self_employment">Individual Self-Employment</option>
                  <option value="small_enterprise">Small Enterprise Partnership / LLP</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="businessStage">
                  <span>BUSINESS STAGE *</span>
                </label>
                <select
                  id="businessStage"
                  className={styles.selectInput}
                  value={profile.businessStage}
                  onChange={e => setProfile({ ...profile, businessStage: e.target.value as BusinessStage })}
                >
                  <option value="idea_concept">Idea / Concept Phase</option>
                  <option value="setup_early">Setup / Machinery Procurement Phase</option>
                  <option value="operational">Operational &amp; Generating Revenue</option>
                  <option value="expansion">Expanding Production Capacity</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="industry">
                  <span>INDUSTRY / SECTOR *</span>
                  <span className={styles.fieldHelper}>Directs scheme policy matching</span>
                </label>
                <select
                  id="industry"
                  className={styles.selectInput}
                  value={profile.industry}
                  onChange={e => setProfile({ ...profile, industry: e.target.value as IndustrySector })}
                >
                  <option value="manufacturing">Manufacturing (Fab, Plastic, Metal, Textile)</option>
                  <option value="food_processing">Food Processing &amp; Agro Packaging</option>
                  <option value="services">Services (Transport, Repair, Salons, Hospitality)</option>
                  <option value="agriculture_allied">Agriculture &amp; Allied (Dairy, Poultry, Fisheries)</option>
                  <option value="handicrafts_artisans">Handicrafts, Pottery, Weaving &amp; Artisans</option>
                  <option value="retail_trade">Retail Trade &amp; Wholesale Distribution</option>
                  <option value="technology">Technology, IT &amp; Digital Services</option>
                  <option value="renewable_energy">Renewable Energy (Solar, Biomass)</option>
                  <option value="other">Other Commercial Activity</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="projectCost">
                  <span>ESTIMATED TOTAL PROJECT COST (₹) *</span>
                  <span className={styles.fieldHelper}>{formatINR(profile.projectCost)}</span>
                </label>
                <input
                  id="projectCost"
                  type="number"
                  step="25000"
                  min="25000"
                  className={`${styles.textInput} ${errors.projectCost ? styles.textInputError : ''}`}
                  value={profile.projectCost}
                  onChange={e => updateProjectCost(parseInt(e.target.value) || 0)}
                />
                {errors.projectCost && <span className={styles.fieldErrorText}>✕ {errors.projectCost}</span>}
              </div>

              <div className={`${styles.fieldGroup} ${styles.formGridFull}`}>
                <label className={styles.fieldLabel} htmlFor="projectDescription">
                  <span>PROJECT DESCRIPTION *</span>
                  <span className={styles.fieldHelper}>AI evaluates this description for NLP matching</span>
                </label>
                <textarea
                  id="projectDescription"
                  className={`${styles.textareaInput} ${errors.projectDescription ? styles.textareaInputError : ''}`}
                  placeholder="Tell SCHEMORA briefly what you want to start or expand (e.g. Setting up a rural organic flour mill with solar powered milling machines employing 4 people)..."
                  value={profile.projectDescription}
                  onChange={e => setProfile({ ...profile, projectDescription: e.target.value })}
                />
                {errors.projectDescription && <span className={styles.fieldErrorText}>✕ {errors.projectDescription}</span>}
              </div>
            </div>

            <div className={styles.actionsBar}>
              <button type="button" onClick={handleBack} className={styles.secondaryBtn}>
                &larr; Back to Profile
              </button>
              <button type="button" onClick={handleNext} className={styles.primaryBtn}>
                Next: Funding Need &rarr;
              </button>
            </div>
          </section>
        )}

        {/* STEP 03: FUNDING REQUIREMENT */}
        {step === 3 && (
          <section className={styles.stageCard}>
            <div className={styles.stageHeader}>
              <span className={styles.stageTag}>[ STAGE 03 // FINANCIAL REQUIREMENT ]</span>
              <h1 className={styles.stageTitle}>Funding Need</h1>
              <p className={styles.stageSubtitle}>
                Detail your debt requirement and own margin contribution for statutory credit linkage.
              </p>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="requiredFunding">
                  <span>REQUIRED LOAN / SUBSIDY FUNDING (₹) *</span>
                  <span className={styles.fieldHelper}>{formatINR(profile.requiredFunding)}</span>
                </label>
                <input
                  id="requiredFunding"
                  type="number"
                  step="25000"
                  className={`${styles.textInput} ${errors.requiredFunding ? styles.textInputError : ''}`}
                  value={profile.requiredFunding}
                  onChange={e => updateRequiredFunding(parseInt(e.target.value) || 0)}
                />
                {errors.requiredFunding && <span className={styles.fieldErrorText}>✕ {errors.requiredFunding}</span>}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="personalContribution">
                  <span>OWN / PROMOTER CONTRIBUTION (₹)</span>
                  <span className={styles.fieldHelper}>{formatINR(profile.personalContribution)}</span>
                </label>
                <input
                  id="personalContribution"
                  type="number"
                  step="10000"
                  className={styles.textInput}
                  value={profile.personalContribution}
                  onChange={e => {
                    const own = parseInt(e.target.value) || 0;
                    setProfile({ ...profile, personalContribution: own });
                  }}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="fundingPurpose">
                  <span>PURPOSE OF FUNDING *</span>
                </label>
                <select
                  id="fundingPurpose"
                  className={styles.selectInput}
                  value={profile.fundingPurpose}
                  onChange={e => setProfile({ ...profile, fundingPurpose: e.target.value as FundingPurpose })}
                >
                  <option value="machinery_equipment">Machinery &amp; Capital Equipment</option>
                  <option value="working_capital">Working Capital &amp; Inventory</option>
                  <option value="business_expansion">Business Premise Construction &amp; Expansion</option>
                  <option value="raw_materials">Bulk Raw Material Procurement</option>
                  <option value="tech_digital_infrastructure">Tech &amp; Digital Infrastructure</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="loanType">
                  <span>PREFERRED FINANCING INSTRUMENT *</span>
                </label>
                <select
                  id="loanType"
                  className={styles.selectInput}
                  value={profile.loanType}
                  onChange={e => setProfile({ ...profile, loanType: e.target.value as PreferredLoanType })}
                >
                  <option value="subsidy_linked_govt">Subsidy-Linked Government Scheme (PMEGP / ACABC)</option>
                  <option value="term_loan">Collateral-Free Term Loan (MUDRA / Stand-Up)</option>
                  <option value="working_capital_cc">Working Capital Cash Credit (CC Limit)</option>
                  <option value="composite_loan">Composite Term + CC Facility</option>
                </select>
              </div>
            </div>

            {/* Financial Telemetry Breakdown HUD */}
            <div className={styles.fundingHud}>
              <div className={styles.hudHeading}>// PROJECT CAPITAL STRUCTURE SUMMARY</div>
              <div className={styles.hudMetrics}>
                <div className={styles.hudMetricItem}>
                  <span className={styles.hudMetricLabel}>PROJECT COST</span>
                  <span className={styles.hudMetricValue}>{formatINR(profile.projectCost)}</span>
                </div>
                <div className={styles.hudMetricItem}>
                  <span className={styles.hudMetricLabel}>FUNDING REQUIRED</span>
                  <span className={`${styles.hudMetricValue} ${styles.hudMetricValueGreen}`}>
                    {formatINR(profile.requiredFunding)}
                  </span>
                </div>
                <div className={styles.hudMetricItem}>
                  <span className={styles.hudMetricLabel}>OWN CONTRIBUTION</span>
                  <span className={styles.hudMetricValue}>{formatINR(profile.personalContribution)}</span>
                </div>
              </div>

              {/* Live Ratio Bar */}
              <div className={styles.fundingBarContainer}>
                {profile.projectCost > 0 && (
                  <>
                    <div className={styles.fundingBarTrack}>
                      <div 
                        className={styles.fundingBarLoan}
                        style={{ width: `${Math.min(100, Math.round((profile.requiredFunding / profile.projectCost) * 100))}%` }}
                        title="Debt / Loan Portion"
                      />
                      <div 
                        className={styles.fundingBarOwn}
                        style={{ width: `${Math.min(100, Math.max(0, 100 - Math.round((profile.requiredFunding / profile.projectCost) * 100)))}%` }}
                        title="Equity / Margin Portion"
                      />
                    </div>
                    <div className={styles.fundingBarLegend}>
                      <span>
                        Loan: {Math.round((profile.requiredFunding / profile.projectCost) * 100)}%
                      </span>
                      <span>
                        Promoter Margin: {Math.max(0, 100 - Math.round((profile.requiredFunding / profile.projectCost) * 100))}%
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className={styles.actionsBar}>
              <button type="button" onClick={handleBack} className={styles.secondaryBtn}>
                &larr; Back to Business
              </button>
              <button type="button" onClick={handleNext} className={styles.primaryBtn}>
                Next: Location &rarr;
              </button>
            </div>
          </section>
        )}

        {/* STEP 04: LOCATION */}
        {step === 4 && (
          <section className={styles.stageCard}>
            <div className={styles.stageHeader}>
              <span className={styles.stageTag}>[ STAGE 04 // GEOGRAPHIC RELEVANCE ]</span>
              <h1 className={styles.stageTitle}>Your Location</h1>
              <p className={styles.stageSubtitle}>
                Location determines rural subsidy escalations (up to 35% margin money) and local bank channel routing.
              </p>
            </div>

            <div className={styles.locationQuickAction}>
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#fff' }}>Auto-Detect Geo Coordinates</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Permit browser location to map nearby branch channel partners automatically.
                </p>
              </div>
              <button type="button" onClick={handleUseMyLocation} className={styles.geoButton}>
                <span>◎</span> USE MY LOCATION
              </button>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="state">
                  <span>STATE *</span>
                </label>
                <select
                  id="state"
                  className={styles.selectInput}
                  value={profile.state}
                  onChange={e => {
                    const newState = e.target.value;
                    const districts = INDIAN_STATES_DISTRICTS[newState] || [];
                    setProfile({
                      ...profile,
                      state: newState,
                      district: districts[0] || ''
                    });
                  }}
                >
                  {Object.keys(INDIAN_STATES_DISTRICTS).map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="district">
                  <span>DISTRICT *</span>
                </label>
                <select
                  id="district"
                  className={styles.selectInput}
                  value={profile.district}
                  onChange={e => setProfile({ ...profile, district: e.target.value })}
                >
                  {(INDIAN_STATES_DISTRICTS[profile.state] || []).map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="city">
                  <span>CITY / TOWN / VILLAGE *</span>
                </label>
                <input
                  id="city"
                  type="text"
                  className={`${styles.textInput} ${errors.city ? styles.textInputError : ''}`}
                  placeholder="e.g. Pindra Village"
                  value={profile.city}
                  onChange={e => setProfile({ ...profile, city: e.target.value })}
                />
                {errors.city && <span className={styles.fieldErrorText}>✕ {errors.city}</span>}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  <span>AREA CLASSIFICATION *</span>
                  <span className={styles.fieldHelper}>PMEGP: Rural gives 35% vs Urban 25%</span>
                </label>
                <div className={styles.segmentedGroup}>
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, areaType: 'rural' })}
                    className={`${styles.segmentedButton} ${profile.areaType === 'rural' ? styles.segmentedButtonActive : ''}`}
                  >
                    RURAL AREA (HIGHER SUBSIDY)
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, areaType: 'urban' })}
                    className={`${styles.segmentedButton} ${profile.areaType === 'urban' ? styles.segmentedButtonActive : ''}`}
                  >
                    URBAN / MUNICIPAL
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.actionsBar}>
              <button type="button" onClick={handleBack} className={styles.secondaryBtn}>
                &larr; Back to Funding
              </button>
              <button type="button" onClick={handleNext} className={styles.primaryBtn}>
                Next: Review &rarr;
              </button>
            </div>
          </section>
        )}

        {/* STEP 05: REVIEW SCREEN */}
        {step === 5 && (
          <section className={styles.stageCard}>
            <div className={styles.stageHeader}>
              <span className={styles.stageTag}>[ STAGE 05 // COMPREHENSIVE AUDIT PREPARATION ]</span>
              <h1 className={styles.stageTitle}>Review Your Profile</h1>
              <p className={styles.stageSubtitle}>
                Inspect your profile parameters before executing the SCHEMORA deterministic rule engine.
              </p>
            </div>

            {/* Quick Preset Banner for Judges */}
            <div className={styles.presetBanner}>
              <div className={styles.presetInfo}>
                <span className={styles.presetTitle}>⚡ SMART INDIA HACKATHON BENCHMARK PROFILE</span>
                <span className={styles.presetDesc}>
                  One-click load an authentic rural micro-manufacturing candidate (Sunita Devi, OBC, Food Processing).
                </span>
              </div>
              <button type="button" onClick={handleLoadDemoPreset} className={styles.presetBtn}>
                Load SIH Demo Preset
              </button>
            </div>

            <div className={styles.reviewGrid}>
              {/* Profile Block */}
              <div className={styles.reviewCard}>
                <div className={styles.reviewCardHeader}>
                  <span className={styles.reviewCardTitle}>01 // APPLICANT PROFILE</span>
                  <button type="button" onClick={() => setStep(1)} className={styles.reviewEditBtn}>
                    [ EDIT ]
                  </button>
                </div>
                <div className={styles.reviewRow}>
                  <span className={styles.reviewLabel}>Full Name</span>
                  <span className={styles.reviewValue}>{profile.fullName || '—'}</span>
                </div>
                <div className={styles.reviewRow}>
                  <span className={styles.reviewLabel}>Age / Gender</span>
                  <span className={styles.reviewValue}>
                    {profile.age} yrs • {profile.gender.toUpperCase()}
                  </span>
                </div>
                <div className={styles.reviewRow}>
                  <span className={styles.reviewLabel}>Category</span>
                  <span className={styles.reviewValue}>{profile.category.toUpperCase()}</span>
                </div>
                <div className={styles.reviewRow}>
                  <span className={styles.reviewLabel}>Education</span>
                  <span className={styles.reviewValue}>{profile.education.replace('_', ' ').toUpperCase()}</span>
                </div>
                <div className={styles.reviewRow}>
                  <span className={styles.reviewLabel}>Annual Income</span>
                  <span className={styles.reviewValue}>{formatINR(profile.annualIncome)}</span>
                </div>
              </div>

              {/* Business Block */}
              <div className={styles.reviewCard}>
                <div className={styles.reviewCardHeader}>
                  <span className={styles.reviewCardTitle}>02 // BUSINESS VENTURE</span>
                  <button type="button" onClick={() => setStep(2)} className={styles.reviewEditBtn}>
                    [ EDIT ]
                  </button>
                </div>
                <div className={styles.reviewRow}>
                  <span className={styles.reviewLabel}>Business Type</span>
                  <span className={styles.reviewValue}>{profile.businessType.replace('_', ' ').toUpperCase()}</span>
                </div>
                <div className={styles.reviewRow}>
                  <span className={styles.reviewLabel}>Stage</span>
                  <span className={styles.reviewValue}>{profile.businessStage.replace('_', ' ').toUpperCase()}</span>
                </div>
                <div className={styles.reviewRow}>
                  <span className={styles.reviewLabel}>Industry Sector</span>
                  <span className={styles.reviewValue}>{profile.industry.replace('_', ' ').toUpperCase()}</span>
                </div>
                <div className={styles.reviewRow}>
                  <span className={styles.reviewLabel}>Project Cost</span>
                  <span className={styles.reviewValue}>{formatINR(profile.projectCost)}</span>
                </div>
                <div className={styles.reviewRow}>
                  <span className={styles.reviewLabel}>Description</span>
                  <span className={styles.reviewValue} style={{ fontSize: '0.75rem', fontStyle: 'italic' }}>
                    &ldquo;{profile.projectDescription.slice(0, 75)}...&rdquo;
                  </span>
                </div>
              </div>

              {/* Funding Block */}
              <div className={styles.reviewCard}>
                <div className={styles.reviewCardHeader}>
                  <span className={styles.reviewCardTitle}>03 // CAPITAL STRUCTURE</span>
                  <button type="button" onClick={() => setStep(3)} className={styles.reviewEditBtn}>
                    [ EDIT ]
                  </button>
                </div>
                <div className={styles.reviewRow}>
                  <span className={styles.reviewLabel}>Required Loan</span>
                  <span className={styles.reviewValue} style={{ color: 'var(--accent)' }}>
                    {formatINR(profile.requiredFunding)}
                  </span>
                </div>
                <div className={styles.reviewRow}>
                  <span className={styles.reviewLabel}>Own Contribution</span>
                  <span className={styles.reviewValue}>{formatINR(profile.personalContribution)}</span>
                </div>
                <div className={styles.reviewRow}>
                  <span className={styles.reviewLabel}>Funding Purpose</span>
                  <span className={styles.reviewValue}>{profile.fundingPurpose.replace('_', ' ').toUpperCase()}</span>
                </div>
                <div className={styles.reviewRow}>
                  <span className={styles.reviewLabel}>Preferred Instrument</span>
                  <span className={styles.reviewValue}>{profile.loanType.replace('_', ' ').toUpperCase()}</span>
                </div>
              </div>

              {/* Location Block */}
              <div className={styles.reviewCard}>
                <div className={styles.reviewCardHeader}>
                  <span className={styles.reviewCardTitle}>04 // JURISDICTION &amp; CHANNEL</span>
                  <button type="button" onClick={() => setStep(4)} className={styles.reviewEditBtn}>
                    [ EDIT ]
                  </button>
                </div>
                <div className={styles.reviewRow}>
                  <span className={styles.reviewLabel}>State</span>
                  <span className={styles.reviewValue}>{profile.state}</span>
                </div>
                <div className={styles.reviewRow}>
                  <span className={styles.reviewLabel}>District</span>
                  <span className={styles.reviewValue}>{profile.district}</span>
                </div>
                <div className={styles.reviewRow}>
                  <span className={styles.reviewLabel}>City / Village</span>
                  <span className={styles.reviewValue}>{profile.city}</span>
                </div>
                <div className={styles.reviewRow}>
                  <span className={styles.reviewLabel}>Area Type</span>
                  <span className={styles.reviewValue} style={{ color: 'var(--accent)' }}>
                    {profile.areaType.toUpperCase()} (QUALIFIED FOR RURAL SUBSIDY)
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.actionsBar}>
              <button type="button" onClick={handleBack} className={styles.secondaryBtn}>
                &larr; Edit Location
              </button>
              <button type="button" onClick={startAnalysis} className={styles.primaryBtn}>
                ANALYZE WITH SCHEMORA &rarr;
              </button>
            </div>
          </section>
        )}

        {/* STEP 06: ANALYSIS EXPERIENCE (TELEMETRY SEQUENCE) */}
        {step === 6 && (
          <section className={styles.analysisContainer}>
            <div className={styles.analysisScanline}></div>
            <div className={styles.analysisHeader}>
              <div className={styles.analysisTag}>[ SCHEMORA INTELLIGENCE // REAL-TIME INFERENCE ]</div>
              <h2 className={styles.analysisTitle}>Analyzing Opportunities For Your Venture</h2>
            </div>

            <div className={styles.analysisStepsList}>
              {ANALYSIS_STEPS.map((s, idx) => {
                const isCurrent = idx === analysisStepIndex;
                const isDone = idx < analysisStepIndex;

                return (
                  <div
                    key={s.id}
                    className={`${styles.analysisStepRow} ${isCurrent ? styles.analysisStepRowActive : ''} ${isDone ? styles.analysisStepRowDone : ''}`}
                  >
                    <span className={styles.analysisStepName}>
                      {isDone ? `✓ ${s.doneText}` : s.title}
                    </span>
                    <div className={styles.analysisStepStatus}>
                      {isCurrent && <div className={styles.statusSpinner}></div>}
                      {isDone && <span className={styles.statusCheck}>DONE</span>}
                      {!isCurrent && !isDone && <span className={styles.statusWaiting}>QUEUED</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* STEP 07: RESULTS DASHBOARD */}
        {step === 7 && (
          <div className={styles.stageCard} style={{ padding: '2rem' }}>
            {/* Header */}
            <div className={styles.resultsHeader}>
              <div>
                <span className={styles.stageTag}>[ SCHEMORA MATCH RESULTS // EXPLAINABLE RECOMMENDATIONS ]</span>
                <h1 className={styles.resultsHeading}>Opportunities Identified From Your Profile</h1>
                <p className={styles.resultsSubtitle}>
                  Ranked by deterministic statutory compliance and AI sector relevance for {profile.fullName || 'your enterprise'}.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className={styles.secondaryBtn}
                style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
              >
                ↺ Modify Assessment
              </button>
            </div>

            {/* Filter & Sorting Controls */}
            <div className={styles.resultsControls}>
              <div className={styles.filterTabs}>
                {[
                  { id: 'all', label: 'ALL SCHEMES' },
                  { id: 'eligible', label: '● ELIGIBLE ONLY' },
                  { id: 'high_match', label: 'HIGH MATCH (>90%)' },
                  { id: 'subsidy', label: 'SUBSIDY LINKED' },
                  { id: 'collateral_free', label: 'COLLATERAL FREE' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilter(tab.id as any)}
                    className={`${styles.filterTab} ${filter === tab.id ? styles.filterTabActive : ''}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className={styles.sortRow}>
                <div className={styles.matchesCount}>
                  MATCHES FOUND: <strong>{filteredAndSortedResults.length}</strong> SCHEMES
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SORT BY:</span>
                  <select 
                    value={sortBy} 
                    onChange={e => setSortBy(e.target.value as any)}
                    className={styles.sortSelect}
                  >
                    <option value="best_match">Best Schemora Match Score</option>
                    <option value="max_funding">Maximum Loan Ceiling</option>
                    <option value="lowest_interest">Lowest Interest Rate</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Schemes Cards List */}
            {filteredAndSortedResults.length > 0 ? (
              <div className={styles.schemesGrid}>
                {filteredAndSortedResults.map(res => {
                  const isSaved = savedSchemeIds.includes(res.scheme.id);
                  const isCompared = compareList.some(item => item.scheme.id === res.scheme.id);

                  return (
                    <div
                      key={res.scheme.id}
                      className={`${styles.schemeCard} ${res.eligibility.isEligible ? styles.schemeCardEligible : ''}`}
                    >
                      <div className={styles.schemeCardTop}>
                        <div className={styles.schemeMeta}>
                          <div className={styles.schemeMinistry}>{res.scheme.ministry}</div>
                          <h3 className={styles.schemeName}>{res.scheme.name}</h3>
                          <p className={styles.schemeTagline}>{res.scheme.tagline}</p>
                        </div>

                        {/* Match Score Gauge */}
                        <div className={styles.scoreVisualContainer}>
                          <div className={styles.scoreGauge}>{res.matchScore}%</div>
                          <div className={styles.scoreLabel}>SCHEMORA MATCH SCORE</div>
                          <div className={`${styles.eligibilityPill} ${res.eligibility.isEligible ? styles.pillEligible : styles.pillPartial}`}>
                            {res.eligibility.isEligible ? '● STATUTORILY ELIGIBLE' : '✕ CONDITIONAL / PARTIAL'}
                          </div>
                        </div>
                      </div>

                      {/* Why This Matches Rationale Box */}
                      <div className={styles.whyMatchBox}>
                        <div className={styles.whyMatchHeading}>
                          <span>⚡</span> WHY THIS MATCHES YOUR PROFILE
                        </div>
                        <p className={styles.whyMatchText}>{res.personalizedExplanation}</p>
                      </div>

                      {/* Key Benefit Highlight */}
                      <div className={styles.benefitHighlight}>
                        <span style={{ color: 'var(--text-dim)', fontWeight: 700 }}>KEY BENEFIT:</span>
                        <span>{res.keyBenefitHighlight}</span>
                      </div>

                      {/* Financial Quick Stats */}
                      <div className={styles.schemeStatsRow}>
                        <div className={styles.schemeStatItem}>
                          <span className={styles.schemeStatLabel}>MAX LOAN BRACKET</span>
                          <span className={styles.schemeStatValue}>{formatINR(res.scheme.maxFundingAmount)}</span>
                        </div>
                        <div className={styles.schemeStatItem}>
                          <span className={styles.schemeStatLabel}>INTEREST RATE</span>
                          <span className={styles.schemeStatValue}>
                            {res.scheme.interestRateMin}% - {res.scheme.interestRateMax}%
                          </span>
                        </div>
                        <div className={styles.schemeStatItem}>
                          <span className={styles.schemeStatLabel}>COLLATERAL STATUS</span>
                          <span className={styles.schemeStatValue} style={{ color: 'var(--text-primary)' }}>
                            {res.scheme.collateralRequired ? 'Mandatory' : '100% Collateral-Free'}
                          </span>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className={styles.cardActions}>
                        <div className={styles.secondaryCardActions}>
                          <button
                            type="button"
                            onClick={(e) => toggleSave(res.scheme.id, e)}
                            className={`${styles.miniBtn} ${isSaved ? styles.miniBtnActive : ''}`}
                          >
                            {isSaved ? '★ Saved' : '☆ Save Scheme'}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => toggleCompare(res, e)}
                            className={`${styles.miniBtn} ${isCompared ? styles.miniBtnActive : ''}`}
                          >
                            {isCompared ? '✓ Comparing' : '+ Compare'}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedScheme(res)}
                          className={styles.primaryBtn}
                          style={{ padding: '0.6rem 1.4rem', fontSize: '0.8rem' }}
                        >
                          View Details &amp; Calculator &rarr;
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* No Results State */
              <div className={styles.emptyStateBox}>
                <div className={styles.emptyStateTitle}>NO STRONG MATCH FOUND UNDER ACTIVE FILTERS</div>
                <p className={styles.emptyStateDesc}>
                  SCHEMORA evaluated all statutory guidelines against your active filter parameters.
                </p>
                <div className={styles.emptySuggestions}>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                    HOW TO EXPAND YOUR OPPORTUNITIES:
                  </strong>
                  <ul style={{ paddingLeft: '1.2rem', lineHeight: '1.6' }}>
                    <li>Switch filter tab to &ldquo;ALL SCHEMES&rdquo; to view options with alternate criteria.</li>
                    <li>Re-evaluate funding threshold (some micro-schemes cap at ₹10 Lakhs).</li>
                    <li>Verify whether your venture qualifies under rural industrial manufacturing provisions.</li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className={styles.primaryBtn}
                  style={{ margin: '1.5rem auto 0 auto' }}
                >
                  Reset Filters &rarr;
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* FLOATING COMPARE BAR */}
      {compareList.length > 0 && !showCompareModal && (
        <div className={styles.compareBar}>
          <div className={styles.compareInfo}>
            COMPARING <strong>{compareList.length}</strong> SCHEMES
          </div>
          <button
            type="button"
            onClick={() => setShowCompareModal(true)}
            className={styles.primaryBtn}
            style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}
          >
            Open Comparison Matrix &rarr;
          </button>
          <button
            type="button"
            onClick={() => setCompareList([])}
            className={styles.secondaryBtn}
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
          >
            Clear
          </button>
        </div>
      )}

      {/* SCHEME COMPARISON MODAL */}
      {showCompareModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowCompareModal(false)}>
          <div className={styles.modalWindow} onClick={e => e.stopPropagation()}>
            <div className={styles.modalTopBar}>
              <span className={styles.reviewCardTitle}>SCHEME COMPARISON MATRIX</span>
              <button type="button" onClick={() => setShowCompareModal(false)} className={styles.modalCloseBtn}>
                ✕ Close
              </button>
            </div>
            <div className={styles.modalBody}>
              <table className={styles.compareTable}>
                <thead>
                  <tr>
                    <th>PARAMETER</th>
                    {compareList.map(item => (
                      <th key={item.scheme.id}>{item.scheme.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>MATCH SCORE</strong></td>
                    {compareList.map(item => (
                      <td key={item.scheme.id} style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                        {item.matchScore}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>ELIGIBILITY STATUS</strong></td>
                    {compareList.map(item => (
                      <td key={item.scheme.id}>
                        {item.eligibility.isEligible ? '● Eligible' : '✕ Conditional'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>MAX FUNDING</strong></td>
                    {compareList.map(item => (
                      <td key={item.scheme.id}>{formatINR(item.scheme.maxFundingAmount)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>SUBSIDY RATE</strong></td>
                    {compareList.map(item => (
                      <td key={item.scheme.id}>
                        {item.eligibility.calculatedSubsidyPercent ? `${item.eligibility.calculatedSubsidyPercent}%` : 'N/A'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>INTEREST RATE</strong></td>
                    {compareList.map(item => (
                      <td key={item.scheme.id}>
                        {item.scheme.interestRateMin}% - {item.scheme.interestRateMax}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>MORATORIUM</strong></td>
                    {compareList.map(item => (
                      <td key={item.scheme.id}>{item.scheme.moratoriumMonths} Months</td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>COLLATERAL</strong></td>
                    {compareList.map(item => (
                      <td key={item.scheme.id}>
                        {item.scheme.collateralRequired ? 'Required' : 'Collateral-Free'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>APPLICATION CHANNEL</strong></td>
                    {compareList.map(item => (
                      <td key={item.scheme.id}>{item.scheme.applicationChannel}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SCHEME DETAIL DRAWER / MODAL */}
      {selectedScheme && (
        <div className={styles.modalBackdrop} onClick={() => setSelectedScheme(null)}>
          <div className={styles.modalWindow} onClick={e => e.stopPropagation()}>
            <div className={styles.modalTopBar}>
              <div>
                <span className={styles.stageTag}>[ SCHEME DOSSIER // {selectedScheme.scheme.officialCode} ]</span>
                <h2 style={{ fontSize: '1.25rem', marginTop: '0.2rem' }}>{selectedScheme.scheme.name}</h2>
              </div>
              <button type="button" onClick={() => setSelectedScheme(null)} className={styles.modalCloseBtn}>
                ✕ Close
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Section 1: Overview */}
              <div className={styles.detailSection}>
                <div className={styles.detailSectionHeading}>01 // SCHEME OVERVIEW &amp; OBJECTIVE</div>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#ccc', marginBottom: '0.8rem' }}>
                  {selectedScheme.scheme.description}
                </p>
                <div style={{ background: '#0a0a0a', padding: '0.8rem', border: '1px solid #222', borderRadius: '4px' }}>
                  <strong style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.2rem' }}>
                    TARGET COHORT:
                  </strong>
                  <span style={{ fontSize: '0.85rem', color: '#aaa' }}>{selectedScheme.scheme.whoItIsFor}</span>
                </div>
              </div>

              {/* Section 2: Explainable Eligibility Breakdown (CRITICAL TRANSPARENCY) */}
              <div className={styles.detailSection}>
                <div className={styles.detailSectionHeading}>02 // EXPLAINABLE ELIGIBILITY VERIFICATION</div>
                
                {/* Why You Match */}
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                    WHY YOU MATCH (STATUTORY RULES SATISFIED):
                  </span>
                  <div className={styles.ruleList}>
                    {selectedScheme.eligibility.matchedRules.map((rule, idx) => (
                      <div key={idx} className={`${styles.ruleItem} ${styles.rulePassed}`}>
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* What To Check */}
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--status-warning)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                    WHAT TO VERIFY BEFORE FORMAL SUBMISSION:
                  </span>
                  <div className={styles.ruleList}>
                    {selectedScheme.eligibility.pendingCheckRules.map((rule, idx) => (
                      <div key={idx} className={`${styles.ruleItem} ${styles.rulePending}`}>
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Failed Criteria (if any) */}
                {selectedScheme.eligibility.failedRules.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--status-error)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                      CONDITIONS NOT SATISFIED (STATUTORY LIMITATIONS):
                    </span>
                    <div className={styles.ruleList}>
                      {selectedScheme.eligibility.failedRules.map((rule, idx) => (
                        <div key={idx} className={`${styles.ruleItem} ${styles.ruleFailed}`}>
                          <span>{rule}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Financial Terms & Interactive EMI Calculator */}
              <div className={styles.detailSection}>
                <div className={styles.detailSectionHeading}>03 // FINANCIAL ESTIMATE (INTERACTIVE EMI CALCULATOR)</div>
                <div className={styles.calculatorBox}>
                  <div className={styles.calcInputs}>
                    <div className={styles.calcRangeGroup}>
                      <div className={styles.calcRangeLabel}>
                        <span>LOAN PRINCIPAL</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{formatINR(calcLoan)}</strong>
                      </div>
                      <input
                        type="range"
                        min="50000"
                        max={selectedScheme.scheme.maxFundingAmount}
                        step="25000"
                        value={calcLoan}
                        onChange={e => setCalcLoan(parseInt(e.target.value))}
                        className={styles.calcRangeInput}
                      />
                    </div>

                    <div className={styles.calcRangeGroup}>
                      <div className={styles.calcRangeLabel}>
                        <span>ANNUAL INTEREST RATE</span>
                        <strong>{calcRate}%</strong>
                      </div>
                      <input
                        type="range"
                        min="5.0"
                        max="14.0"
                        step="0.25"
                        value={calcRate}
                        onChange={e => setCalcRate(parseFloat(e.target.value))}
                        className={styles.calcRangeInput}
                      />
                    </div>

                    <div className={styles.calcRangeGroup}>
                      <div className={styles.calcRangeLabel}>
                        <span>REPAYMENT TENURE</span>
                        <strong>{calcTenure} Years ({calcTenure * 12} Months)</strong>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={calcTenure}
                        onChange={e => setCalcTenure(parseInt(e.target.value))}
                        className={styles.calcRangeInput}
                      />
                    </div>

                    <div className={styles.calcRangeGroup}>
                      <div className={styles.calcRangeLabel}>
                        <span>MORATORIUM PERIOD</span>
                        <strong>{calcMoratorium} Months</strong>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="18"
                        step="3"
                        value={calcMoratorium}
                        onChange={e => setCalcMoratorium(parseInt(e.target.value))}
                        className={styles.calcRangeInput}
                      />
                    </div>
                  </div>

                  {/* Calculated Output Breakdown */}
                  <div className={styles.calcOutputs}>
                    <div>
                      <span className={styles.schemeStatLabel}>ESTIMATED MONTHLY EMI</span>
                      <div className={styles.calcEmiBig}>{formatINR(emiCalculated.monthlyEMI)}</div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>After moratorium</span>
                    </div>
                    <div>
                      <span className={styles.schemeStatLabel}>TOTAL INTEREST ACCRUED</span>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: '#ffb347', marginTop: '0.3rem' }}>
                        {formatINR(emiCalculated.totalInterest)}
                      </div>
                    </div>
                    <div>
                      <span className={styles.schemeStatLabel}>TOTAL REPAYMENT</span>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: '#fff', marginTop: '0.3rem' }}>
                        {formatINR(emiCalculated.totalPayment)}
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.75rem', textAlign: 'center' }}>
                    * Calculation adheres to standard diminishing-balance formula. Final terms established by lending bank during credit sanction.
                  </p>
                </div>
              </div>

              {/* Section 4: Document Checklist */}
              <div className={styles.detailSection}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div className={styles.detailSectionHeading} style={{ margin: 0 }}>
                    04 // MANDATORY DOCUMENT CHECKLIST
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownloadChecklist(selectedScheme)}
                    className={styles.presetBtn}
                  >
                    ⬇ Download Checklist
                  </button>
                </div>

                <div className={styles.docsList}>
                  {selectedScheme.scheme.requiredDocuments.map((doc, idx) => {
                    const isChecked = !!checkedDocs[doc];
                    return (
                      <label key={idx} className={styles.docItem}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => setCheckedDocs({ ...checkedDocs, [doc]: !isChecked })}
                          className={styles.docCheckbox}
                        />
                        <span className={isChecked ? styles.docChecked : ''}>{doc}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Section 5: Channel Partner Locator */}
              <div className={styles.detailSection}>
                <div className={styles.detailSectionHeading}>05 // WHERE CAN I APPLY? (CHANNEL PARTNER LOCATOR)</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Empaneled financial institutions and DIC facilitation centers serving {profile.district}:
                </p>
                <div className={styles.partnersGrid}>
                  {selectedScheme.scheme.channelPartners.map(partner => (
                    <div key={partner.id} className={styles.partnerCard}>
                      <span className={styles.partnerType}>{partner.type}</span>
                      <strong className={styles.partnerName}>{partner.name}</strong>
                      <span className={styles.partnerAddress}>{partner.address}, {partner.district}</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.5rem' }}>
                        <span className={styles.partnerDistance}>📍 {partner.distanceKm} km away</span>
                        <button
                          type="button"
                          onClick={() => setMapPartner(partner)}
                          className={styles.miniBtn}
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                        >
                          View on Map &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 6: Contextual AI Assistant (Ask Schemora) */}
              <div className={styles.assistantBox}>
                <div className={styles.assistantHeading}>
                  <span>🤖</span> ASK SCHEMORA — CONTEXTUAL ASSISTANT
                </div>

                <div className={styles.quickQuestions}>
                  {[
                    "Why was this scheme recommended for me?",
                    "What are the exact subsidy rates for my category?",
                    "What should I do next?",
                    "How do I prepare the Detailed Project Report (DPR)?"
                  ].map((q, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSendChat(q)}
                      className={styles.quickQuestionPill}
                    >
                      {q}
                    </button>
                  ))}
                </div>

                <div className={styles.chatHistory}>
                  {chatMessages.map((m, i) => (
                    <div
                      key={i}
                      className={m.sender === 'user' ? styles.chatBubbleUser : styles.chatBubbleAi}
                    >
                      {m.text}
                    </div>
                  ))}
                </div>

                <div className={styles.chatInputRow}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSendChat();
                    }}
                    placeholder="Ask Schemora about eligibility, subsidies, or bank appraisal..."
                    className={styles.chatInput}
                  />
                  <button type="button" onClick={() => handleSendChat()} className={styles.chatSendBtn}>
                    SEND
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW ON MAP MODAL */}
      {mapPartner && (
        <div className={styles.modalBackdrop} onClick={() => setMapPartner(null)}>
          <div className={styles.modalWindow} style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalTopBar}>
              <span className={styles.reviewCardTitle}>CHANNEL PARTNER LOCATION DISCOVERY</span>
              <button type="button" onClick={() => setMapPartner(null)} className={styles.modalCloseBtn}>
                ✕ Close
              </button>
            </div>
            <div className={styles.modalBody}>
              <div style={{ background: '#111', padding: '1.25rem', border: '1px solid #222', borderRadius: '4px', marginBottom: '1rem' }}>
                <span className={styles.partnerType}>{mapPartner.type}</span>
                <h3 style={{ fontSize: '1.1rem', margin: '0.3rem 0' }}>{mapPartner.name}</h3>
                <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.8rem' }}>{mapPartner.address}, {mapPartner.district}</p>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                  <span>PHONE: {mapPartner.contactPhone}</span>
                  <span>EMAIL: {mapPartner.contactEmail}</span>
                </div>
              </div>

              {/* High Tech Map Visualization Mockup */}
              <div style={{ 
                height: '240px', 
                background: '#070707', 
                border: '1px solid rgba(255,255,255,0.08)', 
                borderRadius: '4px', 
                position: 'relative', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.06) 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}></div>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: 'var(--text-primary)',
                  zIndex: 2
                }}></div>
                <div style={{ zIndex: 2, marginTop: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  COORDINATES: {mapPartner.latitude}° N, {mapPartner.longitude}° E
                </div>
                <span style={{ zIndex: 2, fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Estimated transit: 8 mins from your selected district center ({mapPartner.distanceKm} km)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

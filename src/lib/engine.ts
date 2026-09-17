import { 
  UserProfile, 
  Scheme, 
  EligibilityEvaluation, 
  SchemeMatchResult 
} from '@/types/assessment';
import { SCHEMES_DATABASE } from '@/data/schemes';

/**
 * Format numbers according to Indian Currency System (Lakhs, Crores)
 * e.g. 800000 -> ₹ 8,00,000
 */
export function formatINR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹ 0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Calculate accurate Equated Monthly Installment (EMI)
 * Formula: E = P * r * (1+r)^n / ((1+r)^n - 1)
 * Takes into account moratorium period where interest accrues or repayment is deferred.
 */
export function calculateEMI(
  principal: number,
  annualRatePct: number,
  tenureYears: number,
  moratoriumMonths: number = 0
): { monthlyEMI: number; totalPayment: number; totalInterest: number; netTenureMonths: number } {
  if (principal <= 0 || annualRatePct <= 0 || tenureYears <= 0) {
    return { monthlyEMI: 0, totalPayment: 0, totalInterest: 0, netTenureMonths: 0 };
  }

  const totalTenureMonths = Math.round(tenureYears * 12);
  const repaymentMonths = Math.max(1, totalTenureMonths - moratoriumMonths);
  const monthlyRate = annualRatePct / (12 * 100);

  // If there is a moratorium period with simple interest added to principal
  let effectivePrincipal = principal;
  if (moratoriumMonths > 0) {
    // Interest during moratorium added to principal (capitalized)
    const moratoriumInterest = principal * monthlyRate * moratoriumMonths;
    effectivePrincipal = principal + moratoriumInterest;
  }

  const emiNumerator = effectivePrincipal * monthlyRate * Math.pow(1 + monthlyRate, repaymentMonths);
  const emiDenominator = Math.pow(1 + monthlyRate, repaymentMonths) - 1;
  const monthlyEMI = Math.round(emiNumerator / emiDenominator);

  const totalPayment = Math.round(monthlyEMI * repaymentMonths);
  const totalInterest = Math.max(0, totalPayment - principal);

  return {
    monthlyEMI,
    totalPayment,
    totalInterest,
    netTenureMonths: repaymentMonths
  };
}

/**
 * Helper to determine if applicant qualifies for special demographic categories
 * in government schemes (SC, ST, OBC, Women, Minorities, PwD, Rural).
 */
export function isSpecialCategory(profile: UserProfile): boolean {
  return (
    profile.category === 'sc' ||
    profile.category === 'st' ||
    profile.category === 'obc' ||
    profile.category === 'minority' ||
    profile.category === 'pwd' ||
    profile.category === 'women_entrepreneur' ||
    profile.gender === 'female' ||
    profile.gender === 'transgender'
  );
}

/**
 * DETERMINISTIC ELIGIBILITY RULE ENGINE
 * Evaluates concrete, statutory rules without AI hallucination.
 */
export function evaluateDeterministicEligibility(
  profile: UserProfile,
  scheme: Scheme
): EligibilityEvaluation {
  const matchedRules: string[] = [];
  const pendingCheckRules: string[] = [];
  const failedRules: string[] = [];

  const rules = scheme.rules;

  // 1. Age Verification
  if (rules.minAge && profile.age < rules.minAge) {
    failedRules.push(`Age must be at least ${rules.minAge} years (Applicant is ${profile.age}).`);
  } else if (rules.maxAge && profile.age > rules.maxAge) {
    failedRules.push(`Age exceeds maximum allowable limit of ${rules.maxAge} years (Applicant is ${profile.age}).`);
  } else {
    matchedRules.push(`Applicant age (${profile.age} yrs) complies with scheme criteria.`);
  }

  // 2. Demographic & Gender Constraints
  if (rules.allowedGenders || rules.allowedCategories) {
    const isGenderAllowed = rules.allowedGenders ? rules.allowedGenders.includes(profile.gender) : true;
    const isCategoryAllowed = rules.allowedCategories ? rules.allowedCategories.includes(profile.category) : true;

    if (scheme.id === 'standup-india-2024') {
      // Stand-Up India requires: SC OR ST OR Woman (any category)
      const isEligibleStandup = 
        profile.category === 'sc' || 
        profile.category === 'st' || 
        profile.gender === 'female' || 
        profile.gender === 'transgender';
      
      if (isEligibleStandup) {
        matchedRules.push(`Target demographic verified: ${profile.gender === 'female' ? 'Woman Entrepreneur' : `${profile.category.toUpperCase()} Category`}.`);
      } else {
        failedRules.push(`Stand-Up India is statutorily restricted to SC, ST, or Women entrepreneurs.`);
      }
    } else {
      if (isGenderAllowed && isCategoryAllowed) {
        matchedRules.push(`Social category (${profile.category.toUpperCase()}) and gender criteria satisfied.`);
      } else {
        failedRules.push(`Applicant category (${profile.category}) or gender does not match scheme target cohort.`);
      }
    }
  }

  // 3. Business Type & Greenfield Requirements
  if (rules.allowedBusinessTypes && !rules.allowedBusinessTypes.includes(profile.businessType)) {
    if (rules.requiresGreenfield && profile.businessType === 'existing_business') {
      failedRules.push(`Scheme requires Greenfield (new setup) enterprise. Existing ventures are ineligible.`);
    } else {
      pendingCheckRules.push(`Business model classified as ${profile.businessType}; requires special clearance.`);
    }
  } else {
    matchedRules.push(`Business classification (${profile.businessType.replace('_', ' ')}) aligns with scheme guidelines.`);
  }

  // 4. Industry Sector Compatibility
  if (rules.allowedIndustries && !rules.allowedIndustries.includes(profile.industry)) {
    if (scheme.id === 'pm-vishwakarma-2024') {
      failedRules.push(`PM Vishwakarma is restricted to 18 traditional artisan/craft trades (Selected: ${profile.industry}).`);
    } else if (scheme.id === 'nabard-acabc-2024') {
      failedRules.push(`NABARD ACABC requires agriculture or allied agro-processing activities.`);
    } else {
      pendingCheckRules.push(`Industry sector (${profile.industry}) requires specific activity appraisal.`);
    }
  } else {
    matchedRules.push(`Industry sector (${profile.industry.replace('_', ' ')}) is explicitly recognized.`);
  }

  // 5. Project Cost & Funding Thresholds
  const isMfg = profile.industry === 'manufacturing' || profile.industry === 'food_processing';
  const maxProjectCost = isMfg ? rules.maxProjectCostManufacturing : rules.maxProjectCostServices;

  if (maxProjectCost && profile.projectCost > maxProjectCost) {
    failedRules.push(`Project cost (${formatINR(profile.projectCost)}) exceeds statutory ceiling of ${formatINR(maxProjectCost)}.`);
  } else {
    matchedRules.push(`Project cost (${formatINR(profile.projectCost)}) is within permissible ceiling.`);
  }

  if (scheme.maxFundingAmount && profile.requiredFunding > scheme.maxFundingAmount) {
    pendingCheckRules.push(`Requested funding (${formatINR(profile.requiredFunding)}) exceeds maximum scheme ceiling (${formatINR(scheme.maxFundingAmount)}); will be capped.`);
  } else if (scheme.minFundingAmount && profile.requiredFunding < scheme.minFundingAmount) {
    pendingCheckRules.push(`Funding requested (${formatINR(profile.requiredFunding)}) is below typical minimum bracket (${formatINR(scheme.minFundingAmount)}).`);
  } else {
    matchedRules.push(`Requested credit amount (${formatINR(profile.requiredFunding)}) fits within financing band.`);
  }

  // 6. Educational Qualification (e.g. PMEGP requires 8th pass for >10L Mfg or >5L Svc)
  if (scheme.id === 'pmegp-2024') {
    const isHighValue = (isMfg && profile.projectCost > 1000000) || (!isMfg && profile.projectCost > 500000);
    if (isHighValue) {
      if (profile.education === 'below_8th') {
        failedRules.push(`PMEGP mandates at least 8th standard pass for projects exceeding ₹10L (Mfg) or ₹5L (Services).`);
      } else {
        matchedRules.push(`Educational threshold (Min 8th pass) satisfied for capital subsidy.`);
      }
    } else {
      matchedRules.push(`No minimum educational qualification mandated for projects under threshold.`);
    }
  }

  // 7. General Audit / What To Check
  pendingCheckRules.push(`Applicant must not have defaulted on any scheduled commercial bank or financial institution.`);
  pendingCheckRules.push(`Final sanction is subject to Detailed Project Report (DPR) appraisal and field verification.`);

  // 8. Calculate Subsidies & Own Contribution
  let calculatedSubsidyPercent = 0;
  let calculatedSubsidyAmount = 0;
  let requiredOwnContribution = 0;

  if (scheme.subsidyRules) {
    const isSpecial = isSpecialCategory(profile);
    const isRural = profile.areaType === 'rural';

    if (isSpecial) {
      calculatedSubsidyPercent = isRural 
        ? scheme.subsidyRules.specialRuralPercent 
        : scheme.subsidyRules.specialUrbanPercent;
      requiredOwnContribution = Math.round(profile.projectCost * (scheme.subsidyRules.ownContributionSpecial / 100));
    } else {
      calculatedSubsidyPercent = isRural 
        ? scheme.subsidyRules.generalRuralPercent 
        : scheme.subsidyRules.generalUrbanPercent;
      requiredOwnContribution = Math.round(profile.projectCost * (scheme.subsidyRules.ownContributionGeneral / 100));
    }

    const eligibleCapitalBasis = Math.min(profile.projectCost, scheme.maxFundingAmount);
    calculatedSubsidyAmount = Math.round(eligibleCapitalBasis * (calculatedSubsidyPercent / 100));

    matchedRules.push(
      `Eligible for ${calculatedSubsidyPercent}% margin money subsidy (${formatINR(calculatedSubsidyAmount)}) based on ${isSpecial ? 'Special Category' : 'General Category'} in ${isRural ? 'Rural' : 'Urban'} area.`
    );
  }

  const isEligible = failedRules.length === 0;

  return {
    isEligible,
    matchedRules,
    pendingCheckRules,
    failedRules,
    calculatedSubsidyPercent,
    calculatedSubsidyAmount,
    requiredOwnContribution
  };
}

/**
 * AI MATCHING & EXPLANATION LAYER
 * Computes semantic scoring and generates a personalized audit explanation.
 */
export function computeAIMatch(
  profile: UserProfile,
  scheme: Scheme,
  eligibility: EligibilityEvaluation
): SchemeMatchResult {
  let score = 50; // Base score

  // 1. Eligibility Weight (0 or +25)
  if (eligibility.isEligible) {
    score += 25;
  } else {
    // If hard rules failed, penalize heavily
    score = Math.max(20, score - (eligibility.failedRules.length * 15));
  }

  // 2. Sector Affinity (+10)
  if (scheme.rules.allowedIndustries?.includes(profile.industry)) {
    score += 10;
  }

  // 3. Subsidy / Benefit Value (+10)
  if (eligibility.calculatedSubsidyPercent && eligibility.calculatedSubsidyPercent > 0) {
    score += Math.min(10, Math.round(eligibility.calculatedSubsidyPercent / 3.5));
  }

  // 4. Funding Band Fit (+5)
  if (
    profile.requiredFunding >= scheme.minFundingAmount &&
    profile.requiredFunding <= scheme.maxFundingAmount
  ) {
    score += 5;
  }

  // 5. Margin adequacy bonus (+5)
  if (eligibility.requiredOwnContribution && profile.personalContribution >= eligibility.requiredOwnContribution) {
    score += 5;
  }

  // Clamp score between 25% and 98% (never claim 100% certainty before official bank audit)
  const finalScore = Math.min(98, Math.max(25, score));

  // Dynamic profile-grounded explanation
  let personalizedExplanation = '';
  let keyBenefitHighlight = '';
  let recommendedNextStep = '';

  const indLabel = profile.industry.replace('_', ' ');
  const locLabel = `${profile.city || profile.district} (${profile.areaType})`;

  if (scheme.id === 'pmegp-2024') {
    personalizedExplanation = `Directly matches your ${formatINR(profile.projectCost)} ${indLabel} venture in ${locLabel}. As an applicant qualifying under ${profile.category.toUpperCase()} category in a ${profile.areaType} zone, you are entitled to ${eligibility.calculatedSubsidyPercent}% margin money capital subsidy (${formatINR(eligibility.calculatedSubsidyAmount)}).`;
    keyBenefitHighlight = `Govt Capital Subsidy of ${eligibility.calculatedSubsidyPercent}% (${formatINR(eligibility.calculatedSubsidyAmount)}) + Collateral-Free Coverage`;
    recommendedNextStep = `Prepare Detailed Project Report (DPR) and submit online via KVIC PMEGP Portal / District Industries Centre (DIC).`;
  } else if (scheme.id === 'mudra-tarun-2024') {
    personalizedExplanation = `Your funding requirement of ${formatINR(profile.requiredFunding)} fits seamlessly into the MUDRA Tarun band (₹5L - ₹10L). No immovable property collateral is demanded, and credit risk is backed by CGFMU.`;
    keyBenefitHighlight = `100% Collateral-Free Institutional Term/CC Loan up to ₹10 Lakhs`;
    recommendedNextStep = `Approach your local bank branch with Udyam Registration & 6-month bank statements to request MUDRA Tarun sanction.`;
  } else if (scheme.id === 'standup-india-2024') {
    if (eligibility.isEligible) {
      personalizedExplanation = `Matches your greenfield project parameters. Stand-Up India specifically mandates every commercial bank branch to extend composite credit between ₹10L and ₹1Cr to ${profile.gender === 'female' ? 'Women entrepreneurs' : `${profile.category.toUpperCase()} entrepreneurs`}.`;
      keyBenefitHighlight = `High-value credit up to ₹1 Crore with composite term & working capital assistance`;
      recommendedNextStep = `Register on standupmitra.in as a 'Ready Borrower' and connect with SIDBI handholding agencies.`;
    } else {
      personalizedExplanation = `Stand-Up India requires the enterprise to be greenfield and led by SC, ST, or Women entrepreneurs.`;
      keyBenefitHighlight = `Large ticket credit up to ₹1 Crore for designated demographics`;
      recommendedNextStep = `Consider PMEGP or MUDRA which accommodate broader demographic profiles.`;
    }
  } else if (scheme.id === 'pm-vishwakarma-2024') {
    if (eligibility.isEligible) {
      personalizedExplanation = `Ideal for traditional craftsmanship and manufacturing tool support. Provides subsidized credit at flat 5% interest with ₹15,000 modern toolkit grant and skill stipend.`;
      keyBenefitHighlight = `Subsidized 5% interest loan + ₹15,000 modern toolkit incentive`;
      recommendedNextStep = `Visit the nearest Common Service Centre (CSC) for biometric trade registration.`;
    } else {
      personalizedExplanation = `PM Vishwakarma is specifically designated for 18 traditional artisan trades. Your venture may be better served by MSME micro-credit.`;
      keyBenefitHighlight = `Concessional 5% interest artisan loan`;
      recommendedNextStep = `Explore PMEGP or MUDRA for standard industrial or commercial activities.`;
    }
  } else if (scheme.id === 'cgtmse-sme-2024') {
    personalizedExplanation = `Provides an institutional guarantee to banks for your ${formatINR(profile.requiredFunding)} requirement. Eliminates the necessity of pledging personal land, building, or third-party collateral.`;
    keyBenefitHighlight = `Guarantees up to 85% of bank credit without personal asset hypothecation`;
    recommendedNextStep = `Ask your bank credit officer to process your MSME credit application under the CGTMSE guarantee scheme.`;
  } else if (scheme.id === 'nabard-acabc-2024') {
    personalizedExplanation = `Specifically engineered for agricultural and food processing ventures. Offers up to 44% composite capital subsidy for special category/women applicants setting up agro-enterprises.`;
    keyBenefitHighlight = `Up to 44% composite subsidy on agro-processing and cold-chain infrastructure`;
    recommendedNextStep = `Enroll in the 45-day MANAGE residential training program to unlock credit linkage.`;
  } else {
    personalizedExplanation = `Matches your business stage and credit requirements based on standard MSME lending directives.`;
    keyBenefitHighlight = `Competitive institutional lending terms`;
    recommendedNextStep = `Review required documentation and consult the designated channel partner.`;
  }

  return {
    scheme,
    matchScore: finalScore,
    eligibility,
    personalizedExplanation,
    keyBenefitHighlight,
    recommendedNextStep
  };
}

/**
 * Full Pipeline: Evaluates user profile against all schemes in knowledge base,
 * applies deterministic statutory rules, scores semantic relevance, and ranks results.
 */
export function runSchemoraMatching(profile: UserProfile): SchemeMatchResult[] {
  const results: SchemeMatchResult[] = SCHEMES_DATABASE.map(scheme => {
    const eligibility = evaluateDeterministicEligibility(profile, scheme);
    return computeAIMatch(profile, scheme, eligibility);
  });

  // Sort: Eligible first, then descending by matchScore
  return results.sort((a, b) => {
    if (a.eligibility.isEligible && !b.eligibility.isEligible) return -1;
    if (!a.eligibility.isEligible && b.eligibility.isEligible) return 1;
    return b.matchScore - a.matchScore;
  });
}

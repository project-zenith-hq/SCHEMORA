export type Gender = 'male' | 'female' | 'transgender' | 'prefer_not_to_say';

export type SocialCategory = 'general' | 'obc' | 'sc' | 'st' | 'minority' | 'pwd' | 'women_entrepreneur';

export type EducationLevel = 
  | 'below_8th'
  | '8th_pass'
  | '10th_pass'
  | '12th_pass'
  | 'graduate'
  | 'post_graduate'
  | 'iti_diploma';

export type BusinessType = 
  | 'new_business'
  | 'existing_business'
  | 'self_employment'
  | 'small_enterprise';

export type BusinessStage = 
  | 'idea_concept'
  | 'setup_early'
  | 'operational'
  | 'expansion';

export type IndustrySector = 
  | 'manufacturing'
  | 'retail_trade'
  | 'services'
  | 'agriculture_allied'
  | 'food_processing'
  | 'technology'
  | 'handicrafts_artisans'
  | 'renewable_energy'
  | 'other';

export type FundingPurpose = 
  | 'machinery_equipment'
  | 'working_capital'
  | 'business_expansion'
  | 'raw_materials'
  | 'tech_digital_infrastructure';

export type PreferredLoanType = 
  | 'term_loan'
  | 'working_capital_cc'
  | 'composite_loan'
  | 'subsidy_linked_govt';

export type AreaType = 'rural' | 'urban';

export interface UserProfile {
  // Step 1: Personal Profile
  fullName: string;
  age: number;
  gender: Gender;
  category: SocialCategory;
  annualIncome: number;
  education: EducationLevel;
  
  // Step 2: Business Information
  businessType: BusinessType;
  businessStage: BusinessStage;
  industry: IndustrySector;
  projectDescription: string;
  projectCost: number;

  // Step 3: Funding Requirement
  requiredFunding: number;
  personalContribution: number;
  fundingPurpose: FundingPurpose;
  loanType: PreferredLoanType;

  // Step 4: Location
  state: string;
  district: string;
  city: string;
  areaType: AreaType;
  latitude?: number;
  longitude?: number;
}

export interface SchemeRule {
  minAge?: number;
  maxAge?: number;
  allowedGenders?: Gender[];
  allowedCategories?: SocialCategory[];
  minEducation?: EducationLevel;
  allowedBusinessTypes?: BusinessType[];
  allowedIndustries?: IndustrySector[];
  maxProjectCostManufacturing?: number;
  maxProjectCostServices?: number;
  maxLoanAmount?: number;
  minLoanAmount?: number;
  requiresGreenfield?: boolean;
  minIncome?: number;
  maxIncome?: number;
}

export interface SchemeSubsidyRule {
  generalUrbanPercent: number;
  generalRuralPercent: number;
  specialUrbanPercent: number;
  specialRuralPercent: number;
  ownContributionGeneral: number; // percentage
  ownContributionSpecial: number; // percentage
}

export interface ChannelPartner {
  id: string;
  name: string;
  type: 'Public Sector Bank' | 'SCA (State Agency)' | 'NBFC-MFI' | 'DIC / KVIC Office';
  address: string;
  district: string;
  distanceKm: number;
  status: 'Accepting Applications' | 'Processing Center' | 'Empaneled';
  contactPhone: string;
  contactEmail: string;
  latitude: number;
  longitude: number;
}

export interface Scheme {
  id: string;
  name: string;
  officialCode?: string;
  ministry?: string;
  tagline?: string;
  purpose?: string;
  description: string;
  whoItIsFor?: string;
  categoryTags?: string[];
  sectors?: string[];
  maxFundingAmount?: number;
  minFundingAmount?: number;
  interestRateMin?: number;
  interestRateMax?: number;
  moratoriumMonths?: number;
  repaymentTenureYears?: number;
  collateralRequired?: boolean;
  collateralDetails?: string;
  rules: SchemeRule;
  subsidyRules?: SchemeSubsidyRule;
  requiredDocuments?: string[];
  applicationChannel?: string;
  applicationSteps?: string[];
  channelPartners?: ChannelPartner[];
  officialPortalUrl?: string;
  isDemoData?: boolean;
  states?: string[];
  issuing_authority_level?: 'central' | 'state';
  sourceLastUpdated?: string;
  dataConfidence?: number;
  needsVerification?: boolean;
  verificationNote?: string;
}

export interface EligibilityEvaluation {
  isEligible: boolean;
  matchedRules: string[];
  pendingCheckRules: string[];
  failedRules: string[];
  calculatedSubsidyPercent?: number;
  calculatedSubsidyAmount?: number;
  requiredOwnContribution?: number;
}

export interface SchemeMatchResult {
  scheme: Scheme;
  matchScore: number | null; // 0 to 100 or null if data is insufficient
  eligibility: EligibilityEvaluation;
  personalizedExplanation: string;
  keyBenefitHighlight: string;
  recommendedNextStep: string;
  dataNotVerified?: boolean;
}

export interface AssessmentFormErrors {
  [key: string]: string | undefined;
}

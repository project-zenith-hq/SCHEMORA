import { Scheme } from '@/types/assessment';

export const SCHEMES_DATABASE: Scheme[] = [
  {
    id: 'pmegp-2024',
    name: "Prime Minister's Employment Generation Programme (PMEGP)",
    officialCode: 'MSME/KVIC-PMEGP-01',
    ministry: 'Ministry of Micro, Small and Medium Enterprises (MSME)',
    tagline: 'Credit-linked subsidy programme for non-farm micro enterprise generation',
    description: 'A flagship credit-linked subsidy scheme aimed at generating self-employment opportunities through establishment of micro-enterprises in non-farm sector by helping traditional artisans and unemployed youth.',
    whoItIsFor: 'Individuals aged 18+ setting up new micro-enterprises in manufacturing or service sectors. Special category reservations for SC, ST, OBC, Minorities, Women, and Rural residents.',
    categoryTag: 'MSME',
    minFundingAmount: 100000,
    maxFundingAmount: 5000000, // ₹50 Lakh for manufacturing, ₹20 Lakh for service
    interestRateMin: 8.5,
    interestRateMax: 11.2,
    moratoriumMonths: 6,
    repaymentTenureYears: 7,
    collateralRequired: false,
    collateralDetails: 'No collateral security required for projects up to ₹10 Lakhs. Covered under CGTMSE guarantee scheme.',
    rules: {
      minAge: 18,
      allowedBusinessTypes: ['new_business', 'self_employment', 'small_enterprise'],
      allowedIndustries: ['manufacturing', 'services', 'food_processing', 'handicrafts_artisans', 'renewable_energy', 'other'],
      maxProjectCostManufacturing: 5000000,
      maxProjectCostServices: 2000000,
      minEducation: '8th_pass', // for manufacturing > 10L or service > 5L
      requiresGreenfield: true
    },
    subsidyRules: {
      generalUrbanPercent: 15,
      generalRuralPercent: 25,
      specialUrbanPercent: 25,
      specialRuralPercent: 35,
      ownContributionGeneral: 10,
      ownContributionSpecial: 5
    },
    requiredDocuments: [
      'Aadhaar Card & PAN Card',
      'Caste / Special Category Certificate (if SC/ST/OBC/Minority/PH)',
      'Detailed Project Report (DPR) with cash-flow projection',
      'Proof of Educational Qualification (Min 8th Pass certificate if > ₹10L project)',
      'Rural Area Certificate from Gram Panchayat / BDO (for rural rate)',
      'Bank Account Statement (last 6 months)',
      'Machinery & Equipment Quotations from registered vendors'
    ],
    applicationChannel: 'KVIC PMEGP e-Portal & District Industries Centre (DIC)',
    applicationSteps: [
      'Submit online application on KVIC PMEGP e-Portal with required documents',
      'Task force committee at District Industries Centre (DIC) scrutinizes the proposal',
      'Shortlisted proposal forwarded to preferred financing bank',
      'Bank sanctions loan and disburses first installment for machinery',
      'Margin Money subsidy kept in Term Deposit Receipt (TDR) for 3 years lock-in'
    ],
    channelPartners: [
      {
        id: 'cp-dic-01',
        name: 'District Industries Centre (DIC) Facilitation Desk',
        type: 'DIC / KVIC Office',
        address: 'Collectorate Compound, Administrative Block',
        district: 'Varanasi',
        distanceKm: 2.1,
        status: 'Accepting Applications',
        contactPhone: '+91 542 2508112',
        contactEmail: 'dic-varanasi@gov.in',
        latitude: 25.3216,
        longitude: 82.9876
      },
      {
        id: 'cp-sbi-01',
        name: 'State Bank of India — MSME SME Centre',
        type: 'Public Sector Bank',
        address: 'Main Branch, Kacheri Road, Near District Court',
        district: 'Varanasi',
        distanceKm: 3.4,
        status: 'Processing Center',
        contactPhone: '+91 542 2221450',
        contactEmail: 'sbi.msme.varanasi@sbi.co.in',
        latitude: 25.3341,
        longitude: 82.9912
      },
      {
        id: 'cp-sca-01',
        name: 'UP State Backward Classes Finance & Development Corp (SCA)',
        type: 'SCA (State Agency)',
        address: 'Vikas Bhawan, 3rd Floor, Room 304',
        district: 'Varanasi',
        distanceKm: 4.2,
        status: 'Empaneled',
        contactPhone: '+91 542 2310890',
        contactEmail: 'upsbcfdc.vns@up.gov.in',
        latitude: 25.3198,
        longitude: 83.0041
      }
    ],
    officialPortalUrl: 'https://www.kviconline.gov.in/pmegpeportal/',
    isDemoData: true
  },
  {
    id: 'mudra-tarun-2024',
    name: 'Pradhan Mantri MUDRA Yojana (Tarun Tier)',
    officialCode: 'DFS/MUDRA-TARUN-02',
    ministry: 'Department of Financial Services, Ministry of Finance',
    tagline: 'Collateral-free institutional credit up to ₹10 Lakhs for enterprise expansion',
    description: 'MUDRA provides refinance support to Banks and Micro Finance Institutions for lending to micro enterprises. The Tarun category provides credit above ₹5,00,000 and up to ₹10,00,000 for expanding manufacturing, trade, and service units.',
    whoItIsFor: 'Non-Corporate Small Business Segment (NCSBS) comprising proprietorship/partnership firms running small manufacturing units, service sector units, shopkeepers, and artisans needing working capital or expansion credit.',
    categoryTag: 'Microfinance',
    minFundingAmount: 500000,
    maxFundingAmount: 1000000,
    interestRateMin: 9.1,
    interestRateMax: 11.5,
    moratoriumMonths: 6,
    repaymentTenureYears: 5,
    collateralRequired: false,
    collateralDetails: 'Zero collateral security required. Credit risk guaranteed under CGFMU (Credit Guarantee Fund for Micro Units).',
    rules: {
      minAge: 18,
      maxAge: 65,
      allowedBusinessTypes: ['new_business', 'existing_business', 'self_employment', 'small_enterprise'],
      maxLoanAmount: 1000000,
      minLoanAmount: 500000
    },
    requiredDocuments: [
      'Proof of Identity (Voter ID / Driving License / PAN / Aadhaar)',
      'Proof of Residence (Recent utility bill / Aadhaar card)',
      'Business address and establishment proof (Udyam Registration)',
      'Projected Balance Sheet & Profit-Loss statement for 1 year',
      'Bank statement from existing banker for previous 6 months',
      'Quotations of items/machinery to be purchased'
    ],
    applicationChannel: 'Public/Private Sector Banks, RRBs, NBFC-MFIs or UdyamiMitra Portal',
    applicationSteps: [
      'Prepare project report with required funding breakup and machinery quotes',
      'Apply online via UdyamiMitra portal or visit any empaneled commercial bank / NBFC',
      'Bank evaluates credit appraisal and debt service coverage ratio (DSCR)',
      'Sanction letter issued without collateral demand',
      'MUDRA Debit Card issued for seamless working capital drawdown'
    ],
    channelPartners: [
      {
        id: 'cp-pnb-01',
        name: 'Punjab National Bank — Micro Lending Hub',
        type: 'Public Sector Bank',
        address: 'Godowlia Crossing, Dashashwamedh',
        district: 'Varanasi',
        distanceKm: 1.8,
        status: 'Accepting Applications',
        contactPhone: '+91 542 2451290',
        contactEmail: 'pnb.micro.vns@pnb.co.in',
        latitude: 25.3082,
        longitude: 83.0075
      },
      {
        id: 'cp-mfi-01',
        name: 'Bandhan Bank Micro Banking Unit',
        type: 'NBFC-MFI',
        address: 'Sigra Mehmoorganj Road, Opp. Stadium',
        district: 'Varanasi',
        distanceKm: 2.9,
        status: 'Processing Center',
        contactPhone: '+91 542 2226781',
        contactEmail: 'bandhan.vns@bandhanbank.com',
        latitude: 25.3155,
        longitude: 82.9841
      }
    ],
    officialPortalUrl: 'https://www.mudra.org.in/',
    isDemoData: true
  },
  {
    id: 'standup-india-2024',
    name: 'Stand-Up India Scheme for SC, ST & Women',
    officialCode: 'DFS/SIDBI-SUI-03',
    ministry: 'Ministry of Finance / Small Industries Development Bank of India (SIDBI)',
    tagline: 'Promoting bank financing from ₹10 Lakhs to ₹1 Crore for greenfield enterprises',
    description: 'Stand-Up India facilitates bank loans between ₹10 Lakhs and ₹1 Crore to at least one Scheduled Caste (SC) or Scheduled Tribe (ST) borrower and at least one woman borrower per bank branch for setting up a greenfield enterprise in manufacturing, services, or trading.',
    whoItIsFor: 'SC/ST and Women entrepreneurs aged 18+ venturing into greenfield (first time) ventures in manufacturing, services, or agri-allied activities.',
    categoryTag: 'Women / Marginalized',
    minFundingAmount: 1000000,
    maxFundingAmount: 10000000, // ₹1 Crore
    interestRateMin: 8.0,
    interestRateMax: 10.2,
    moratoriumMonths: 18,
    repaymentTenureYears: 7,
    collateralRequired: false,
    collateralDetails: 'Borrower can choose credit guarantee under Credit Guarantee Scheme for Stand-Up India (CGFSI) in lieu of collateral.',
    rules: {
      minAge: 18,
      allowedGenders: ['female', 'transgender'], // Women or SC/ST any gender
      allowedCategories: ['sc', 'st', 'women_entrepreneur'],
      allowedBusinessTypes: ['new_business'],
      requiresGreenfield: true,
      minLoanAmount: 1000000,
      maxLoanAmount: 10000000
    },
    requiredDocuments: [
      'Proof of Identity & Address (Aadhaar, Passport, Voter ID)',
      'Caste Certificate (for SC/ST category) or proof of 51%+ female ownership',
      'Comprehensive Detailed Project Report (DPR) verified by technical agency',
      'Pollution control clearance / trade license application receipt',
      'Rent/Lease agreement or land registry for premises',
      'Proforma Invoices for capital equipment'
    ],
    applicationChannel: 'Stand-Up India Portal (standupmitra.in) or Lead District Manager (LDM)',
    applicationSteps: [
      'Register on Stand-Up India portal as a Trainee Borrower or Ready Borrower',
      'Connect with SIDBI handholding agencies (DIC, NABARD, MSME DFO) if support is needed',
      'Application mapped to designated bank branch in applicant district',
      'Sanction of composite loan covering up to 85% of project cost',
      'Loan disbursed with 18-month moratorium window'
    ],
    channelPartners: [
      {
        id: 'cp-sidbi-01',
        name: 'SIDBI Handholding & Branch Office',
        type: 'Public Sector Bank',
        address: 'Babu Sampurnanand Bhawan, Sigra',
        district: 'Varanasi',
        distanceKm: 2.5,
        status: 'Accepting Applications',
        contactPhone: '+91 542 2224810',
        contactEmail: 'sidbi.varanasi@sidbi.in',
        latitude: 25.3168,
        longitude: 82.9862
      },
      {
        id: 'cp-bob-01',
        name: 'Bank of Baroda — Zonal SME Loan Factory',
        type: 'Public Sector Bank',
        address: 'Baroda House, Orderly Bazar',
        district: 'Varanasi',
        distanceKm: 4.8,
        status: 'Processing Center',
        contactPhone: '+91 542 2503291',
        contactEmail: 'bob.sme.vns@bankofbaroda.com',
        latitude: 25.3421,
        longitude: 82.9805
      }
    ],
    officialPortalUrl: 'https://www.standupmitra.in/',
    isDemoData: true
  },
  {
    id: 'pm-vishwakarma-2024',
    name: 'PM Vishwakarma Scheme',
    officialCode: 'MSME/PMV-TRAD-04',
    ministry: 'Ministry of MSME & Ministry of Skill Development',
    tagline: 'End-to-end holistic support for traditional artisans and craftspeople',
    description: 'A dedicated Central Sector Scheme to support traditional artisans and craftspeople across 18 designated trades through recognition, modern toolkits, skill upgradation, collateral-free credit at 5% interest, and digital transaction incentives.',
    whoItIsFor: 'Artisans and craftspeople working with hands and tools in one of 18 trades including carpenters, blacksmiths, goldsmiths, potters, sculptors, cobblers, tailors, and basket weavers.',
    categoryTag: 'Artisans',
    minFundingAmount: 50000,
    maxFundingAmount: 300000, // ₹1L first tranche + ₹2L second tranche
    interestRateMin: 5.0,
    interestRateMax: 5.0, // Subsidized at 5% with 8% subvention by MoMSME
    moratoriumMonths: 6,
    repaymentTenureYears: 3,
    collateralRequired: false,
    collateralDetails: '100% collateral-free credit guaranteed by Credit Guarantee Trust for Micro and Small Enterprises (CGTMSE).',
    rules: {
      minAge: 18,
      allowedIndustries: ['handicrafts_artisans', 'manufacturing'],
      maxLoanAmount: 300000
    },
    requiredDocuments: [
      'Aadhaar Card with mobile linkage',
      'Artisan Trade Self-Declaration / Verification by Gram Panchayat or ULB',
      'Bank Account details with Aadhaar seeding',
      'Ration Card / Family registration proof'
    ],
    applicationChannel: 'Common Services Centres (CSC) & PM Vishwakarma Portal',
    applicationSteps: [
      'Enrollment via Common Services Centre (CSC) with biometric authentication',
      'Level 1 verification by Gram Panchayat Head or Urban Local Body Executive',
      '5-7 days basic skill training with ₹500/day stipend + ₹15,000 toolkit grant',
      'Sanction of Tranche 1 loan up to ₹1,00,000 at 5% concessional interest',
      'On timely repayment for 6 months, unlock Tranche 2 credit up to ₹2,00,000'
    ],
    channelPartners: [
      {
        id: 'cp-csc-01',
        name: 'CSC Digital Seva Kendra — Central Facilitation',
        type: 'DIC / KVIC Office',
        address: 'Panchayat Bhawan, Block Shivpur',
        district: 'Varanasi',
        distanceKm: 1.2,
        status: 'Accepting Applications',
        contactPhone: '+91 542 2290451',
        contactEmail: 'csc.shivpur@csc.gov.in',
        latitude: 25.3512,
        longitude: 82.9641
      },
      {
        id: 'cp-union-01',
        name: 'Union Bank of India — Rural Financial Hub',
        type: 'Public Sector Bank',
        address: 'Bhadohi Road, Lahartara',
        district: 'Varanasi',
        distanceKm: 3.1,
        status: 'Processing Center',
        contactPhone: '+91 542 2371900',
        contactEmail: 'ubi.lahartara@unionbankofindia.bank',
        latitude: 25.3182,
        longitude: 82.9691
      }
    ],
    officialPortalUrl: 'https://pmvishwakarma.gov.in/',
    isDemoData: true
  },
  {
    id: 'cgtmse-sme-2024',
    name: 'Credit Guarantee Scheme for Micro & Small Enterprises (CGTMSE)',
    officialCode: 'MSME/CGTMSE-GRT-05',
    ministry: 'Ministry of MSME & SIDBI',
    tagline: 'Credit guarantee cover up to ₹5 Crore for collateral-free business loans',
    description: 'Enables micro and small enterprises to access collateral-free term loans and working capital from scheduled commercial banks and financial institutions by providing government-backed guarantee coverage up to 85%.',
    whoItIsFor: 'New and existing Micro and Small Enterprises in manufacturing and service sectors needing capital without offering third-party guarantee or immovable property collateral.',
    categoryTag: 'MSME',
    minFundingAmount: 500000,
    maxFundingAmount: 50000000, // ₹5 Crore
    interestRateMin: 8.8,
    interestRateMax: 12.0,
    moratoriumMonths: 12,
    repaymentTenureYears: 8,
    collateralRequired: false,
    collateralDetails: 'Strictly zero collateral security. Guarantee fee paid to trust provides complete coverage to lending institution.',
    rules: {
      minAge: 18,
      allowedBusinessTypes: ['new_business', 'existing_business', 'small_enterprise'],
      allowedIndustries: ['manufacturing', 'services', 'food_processing', 'technology', 'renewable_energy', 'retail_trade'],
      maxLoanAmount: 50000000
    },
    requiredDocuments: [
      'Udyam Registration Certificate',
      'Audited Financial Statements (last 2 years for existing units)',
      'Detailed Project Report (DPR) with cash flows',
      'KYC of Promoters/Directors (PAN, Aadhaar)',
      'GST returns (last 12 months) if operational'
    ],
    applicationChannel: 'All Scheduled Commercial Banks, SFBs and Regional Rural Banks',
    applicationSteps: [
      'Submit commercial loan application to any partner bank requesting CGTMSE coverage',
      'Lender evaluates techno-economic viability of the business model',
      'Bank sanctions loan and directly submits guarantee application to CGTMSE portal',
      'Guarantee coverage confirmed upon payment of nominal annual guarantee fee',
      'Disbursement in tranches directly linked to project asset creation'
    ],
    channelPartners: [
      {
        id: 'cp-canara-01',
        name: 'Canara Bank — SME Specialised Branch',
        type: 'Public Sector Bank',
        address: 'Maldahiya Crossing, Near Cantt Railway Station',
        district: 'Varanasi',
        distanceKm: 2.8,
        status: 'Accepting Applications',
        contactPhone: '+91 542 2205566',
        contactEmail: 'canara.sme.vns@canarabank.com',
        latitude: 25.3262,
        longitude: 82.9899
      },
      {
        id: 'cp-boi-01',
        name: 'Bank of India — MSME Loan Care Centre',
        type: 'Public Sector Bank',
        address: 'Rathyatra Crossing, Mahmoorganj',
        district: 'Varanasi',
        distanceKm: 2.2,
        status: 'Processing Center',
        contactPhone: '+91 542 2223941',
        contactEmail: 'boi.vns@bankofindia.co.in',
        latitude: 25.3129,
        longitude: 82.9868
      }
    ],
    officialPortalUrl: 'https://www.cgtmse.in/',
    isDemoData: true
  },
  {
    id: 'nabard-acabc-2024',
    name: 'NABARD Agri-Clinics & Agri-Business Centres (ACABC)',
    officialCode: 'MOA/NABARD-ACABC-06',
    ministry: 'Ministry of Agriculture and Farmers Welfare & NABARD',
    tagline: 'Capital and interest subsidy for agriculture, food processing, and rural tech',
    description: 'Supports agricultural graduates, diploma holders, and biological science entrepreneurs in setting up agri-ventures offering expert advisory services and agro-processing business units, with composite subsidy up to 44%.',
    whoItIsFor: 'Entrepreneurs, agricultural diploma holders, or science graduates setting up commercial agricultural infrastructure, food processing, cold storage, dairy, or custom hiring centres.',
    categoryTag: 'Agriculture',
    minFundingAmount: 500000,
    maxFundingAmount: 2000000, // ₹20 Lakhs individual, up to ₹1 Crore group
    interestRateMin: 8.0,
    interestRateMax: 10.5,
    moratoriumMonths: 12,
    repaymentTenureYears: 8,
    collateralRequired: false,
    collateralDetails: 'Projects up to ₹5 Lakhs require no collateral. Projects up to ₹20 Lakhs can be covered under CGTMSE or NABARD guarantee.',
    rules: {
      minAge: 18,
      allowedIndustries: ['agriculture_allied', 'food_processing', 'renewable_energy'],
      maxProjectCostManufacturing: 2000000,
      maxProjectCostServices: 2000000
    },
    subsidyRules: {
      generalUrbanPercent: 36,
      generalRuralPercent: 36,
      specialUrbanPercent: 44,
      specialRuralPercent: 44,
      ownContributionGeneral: 15,
      ownContributionSpecial: 10
    },
    requiredDocuments: [
      'Degree / Diploma certificate in Agriculture or allied subjects',
      'Training completion certificate from MANAGE (National Institute of Agricultural Extension Management)',
      'Detailed Techno-Economic Project Feasibility Report',
      'Land lease or purchase document for project site',
      'Vendor quotations for machinery and cold storage equipment'
    ],
    applicationChannel: 'Commercial Banks, NABARD District Offices & MANAGE Hyderabad',
    applicationSteps: [
      'Complete 45-day residential training at designated Nodal Training Institute (NTI)',
      'Prepare bankable business plan with faculty mentor support',
      'Submit loan application to financing bank through NABARD facilitation officer',
      'Bank sanctions term loan and claims back-ended composite capital subsidy from NABARD',
      'Subsidy kept in subsidy reserve fund and adjusted against final loan repayment'
    ],
    channelPartners: [
      {
        id: 'cp-nabard-01',
        name: 'NABARD District Development Office',
        type: 'SCA (State Agency)',
        address: 'Kashi Gomti Samyut Gramin Bank Building, Pandeypur',
        district: 'Varanasi',
        distanceKm: 5.1,
        status: 'Accepting Applications',
        contactPhone: '+91 542 2586110',
        contactEmail: 'ddm.varanasi@nabard.org',
        latitude: 25.3489,
        longitude: 83.0125
      }
    ],
    officialPortalUrl: 'https://www.agriclinics.net/',
    isDemoData: true
  }
];

export const DEMO_USER_PRESET: any = {
  fullName: "Sunita Devi",
  age: 32,
  gender: "female",
  category: "obc",
  annualIncome: 180000,
  education: "10th_pass",
  businessType: "new_business",
  businessStage: "idea_concept",
  industry: "food_processing",
  projectDescription: "Setting up a solar-powered organic spice grinding and flour packaging micro-unit in rural Varanasi, employing 4 local women.",
  projectCost: 800000,
  requiredFunding: 680000,
  personalContribution: 120000,
  fundingPurpose: "machinery_equipment",
  loanType: "subsidy_linked_govt",
  state: "Uttar Pradesh",
  district: "Varanasi",
  city: "Pindra Village",
  areaType: "rural"
};

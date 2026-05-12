import { evaluateAllConditions, type Question } from './assessment';

export type AssessmentMode = 'snapshot' | 'detailed';
export type QuestionPriority = 'core' | 'conditional' | 'defer';

export type QuestionTag = {
  modes?: AssessmentMode[];
  priority?: QuestionPriority;
  askIf?: (answers: Record<string, any>) => boolean;
};

// Add this to your existing Question interface:
// tags?: QuestionTag;

export const QUESTION_STRATEGY = {
  snapshotCore: [
    'ageRange',
    'relationshipStatus',
    'monthlyChildcareCost',
    'housingStatus',
    'monthlyTakeHomeIncome',
    'incomeConsistency',
    'incomeGrowthPotential',
    'monthlyHousingCost',
    'monthlyUtilities',
    'housingPressure',
    'overspendingFrequency',
    'moneyLeaks',
    'totalLiquidSavings',
    'emergencyAccess',
    'savingConsistency',
    'vehicleDebt',
    'otherDebt',
    'unexpectedExpenseHandling',
    'progressPriority',
    'protectionCoverage',
    'investingStatus',
    'financialDirection',
    'primaryFinancialPriority',
    'financialConfidence',
  ],
  detailedOnly: [
    'additionalPropertyOwnership',
    'carLoanBalance',
    'monthlyVehiclePayment',
    'vehicleValue',
    'rentalPropertyValue',
    'rentalMortgage',
    'rentalPropertyPayment',
    'rentalPropertyIncome',
    'otherPropertyValue',
    'otherPropertyDebt',
    'incomeProtectionRealityCheck',
    'incomeInterruptionCoverage',
    'healthCoverage',
    'lifeInsurance',
    'propertyCoverage',
    'autoCoverage',
    'disabilityCoverage',
    'umbrellaCoverageAmount',
    'advancedProtection',
    'investmentAccounts',
    'additionalAssetTypes',
    'cryptoAssetValue',
    'cryptoAssetContribution',
    'individualStockValue',
    'individualStockContribution',
    'k401Balance',
    'k401Contribution',
    'k401ContributionPercent',
    'k401Match',
    'iraBalance',
    'iraContribution',
    'iraContributionPercent',
    'rothBalance',
    'rothContribution',
    'rothContributionPercent',
    'brokerageBalance',
    'brokerageContribution',
    'brokerageContributionPercent',
    'hsaBalance',
    'hsaContribution',
    'hsaContributionPercent',
    'otherInvestmentAssets',
    'otherInvestmentContribution',
    'otherInvestmentContributionPercent',
    'cashSavings',
    'otherAssets',
    'monthlySavingsContribution',
    'monthlySavingsPercent',
    'creditCardDebt',
    'studentLoans',
    'personalLoans',
    'bnplDebt',
    'paydayDebt',
    'medicalDebt',
    'monthlyVehiclePayment',
    'carPaymentOpportunityReview',
    'netWorthEntry',
  ],
  remove: ['dependents', 'incomeProtection', 'housingDebt', 'leasePayment'],
  defer: [
    'incomeGrowth',
    'incomeSources',
    'spendingAwareness',
    'spendingTracking',
    'lifestyleInflation',
    'threeMonthReview',
    'lifeGoal',
  ],
} as const;


export const ASSESSMENT_ROUTING_KEYS = new Set([
  'ageRange',
  'relationshipStatus',
  'housingStatus',
]);

export const ASSESSMENT_SECTION_ORDER = [
  'foundation',
  'income',
  'spending',
  'saving',
  'debt',
  'investing',
  'protection',
  'vision',
] as const;

export type AssessmentSectionKey = (typeof ASSESSMENT_SECTION_ORDER)[number] | string;

export type AssessmentInlineField = {
  key: string;
  label: string;
  placeholder?: string;
  type?: 'number' | 'select';
  options?: { value: string; label: string }[];
  required?: boolean;
  helperText?: string;
};

export const ASSESSMENT_INLINE_GROUPS: Record<string, string[]> = {
  relationshipStatus: ['monthlyChildcareCost'],
  housingStatus: ['monthlyHousingCost', 'primaryHomeValue', 'primaryMortgage'],
  additionalPropertyOwnership: [
    'rentalPropertyValue',
    'rentalMortgage',
    'rentalPropertyPayment',
    'rentalPropertyIncome',
    'otherPropertyValue',
    'otherPropertyDebt',
    'otherPropertyPayment',
  ],
  vehicleDebt: ['carLoanBalance', 'monthlyVehiclePayment', 'vehicleValue'],
  otherDebt: [
    'creditCardDebt',
    'creditCardPayment',
    'studentLoans',
    'studentLoanPayment',
    'personalLoans',
    'personalLoanPayment',
    'bnplDebt',
    'bnplPayment',
    'paydayDebt',
    'paydayPayment',
    'medicalDebt',
    'medicalDebtPayment',
  ],
  protectionCoverage: [
    'healthCoverage',
    'autoCoverage',
    'propertyCoverage',
    'lifeInsurance',
    'disabilityCoverage',
  ],
  advancedProtection: [
    'umbrellaCoverageAmount',
    'estateDocuments',
    'trustInPlace',
    'beneficiariesUpdated',
  ],
  investingStatus: [],
  investmentAccounts: [
    'k401Balance',
    'k401Contribution',
    'k401ContributionPercent',
    'k401Match',
    'iraBalance',
    'iraContribution',
    'iraContributionPercent',
    'rothBalance',
    'rothContribution',
    'rothContributionPercent',
    'brokerageBalance',
    'brokerageContribution',
    'brokerageContributionPercent',
    'hsaBalance',
    'hsaContribution',
    'hsaContributionPercent',
    'otherInvestmentAssets',
    'otherInvestmentContribution',
    'otherInvestmentContributionPercent',
  ],
  additionalAssetTypes: [
    'cryptoAssetValue',
    'cryptoAssetContribution',
    'individualStockValue',
    'individualStockContribution',
  ],
  savingConsistency: [
    'monthlySavingsContribution',
    'monthlySavingsPercent',
    'totalLiquidSavings',
    'savingsAutomation',
  ],
};

export const ASSESSMENT_CHILD_KEYS = new Set(Object.values(ASSESSMENT_INLINE_GROUPS).flat());

export const ASSESSMENT_CHILD_PARENT_KEY: Record<string, string> = Object.entries(
  ASSESSMENT_INLINE_GROUPS
).reduce((acc, [parentKey, childKeys]) => {
  childKeys.forEach((childKey) => {
    acc[childKey] = parentKey;
  });
  return acc;
}, {} as Record<string, string>);

const BASE_OBJECT_FIELD_GROUPS: Record<string, Record<string, AssessmentInlineField[]>> = {
  relationshipStatus: {
    single_with_dependents: [
      {
        key: 'monthlyChildcareCost',
        label: 'Monthly childcare / daycare cost',
        placeholder: 'e.g. 600',
      },
    ],
    partnered_with_dependents: [
      {
        key: 'monthlyChildcareCost',
        label: 'Monthly childcare / daycare cost',
        placeholder: 'e.g. 600',
      },
    ],
  },
  housingStatus: {
    living_with_family: [
      { key: 'monthlyHousingCost', label: 'Monthly contribution, if any', placeholder: 'e.g. 0' },
    ],
    rent: [{ key: 'monthlyHousingCost', label: 'Monthly rent', placeholder: 'e.g. 1400' }],
    own_with_mortgage: [
      { key: 'monthlyHousingCost', label: 'Monthly house payment', placeholder: 'e.g. 1500' },
      { key: 'primaryHomeValue', label: 'Estimated home value', placeholder: 'e.g. 350000' },
      { key: 'primaryMortgage', label: 'Mortgage balance', placeholder: 'e.g. 185000' },
    ],
    own_outright: [
      { key: 'monthlyHousingCost', label: 'Monthly housing costs, if any', placeholder: 'e.g. 0' },
      { key: 'primaryHomeValue', label: 'Estimated home value', placeholder: 'e.g. 350000' },
    ],
  },
  savingConsistency: {
    yes_consistently: [
      { key: 'monthlySavingsContribution', label: 'Monthly savings amount', placeholder: 'e.g. 500', required: false },
      { key: 'monthlySavingsPercent', label: 'OR savings percent of take-home pay', placeholder: 'e.g. 10', required: false },
      { key: 'totalLiquidSavings', label: 'Current cash savings balance', placeholder: 'e.g. 8000' },
      {
        key: 'savingsAutomation',
        label: 'Saving setup',
        type: 'select',
        required: false,
        options: [
          { value: 'fully_automated', label: 'Fully automated' },
          { value: 'partially_automated', label: 'Partially automated' },
          { value: 'manual', label: 'Manual transfers' },
        ],
      },
    ],
    yes_irregularly: [
      { key: 'monthlySavingsContribution', label: 'Typical monthly savings amount', placeholder: 'e.g. 250', required: false },
      { key: 'monthlySavingsPercent', label: 'OR typical savings percent of take-home pay', placeholder: 'e.g. 5', required: false },
      { key: 'totalLiquidSavings', label: 'Current cash savings balance', placeholder: 'e.g. 3000' },
      {
        key: 'savingsAutomation',
        label: 'Saving setup',
        type: 'select',
        required: false,
        options: [
          { value: 'fully_automated', label: 'Fully automated' },
          { value: 'partially_automated', label: 'Partially automated' },
          { value: 'manual', label: 'Manual transfers' },
        ],
      },
    ],
    not_currently: [
      { key: 'totalLiquidSavings', label: 'Current cash savings balance', placeholder: 'e.g. 500' },
    ],
  },
  vehicleDebt: {
    car_loan: [
      { key: 'carLoanBalance', label: 'Loan balance', placeholder: 'e.g. 18000' },
      { key: 'monthlyVehiclePayment', label: 'Monthly payment', placeholder: 'e.g. 540' },
      { key: 'vehicleValue', label: 'Estimated vehicle value', placeholder: 'e.g. 15000' },
    ],
    car_lease: [{ key: 'monthlyVehiclePayment', label: 'Monthly lease payment', placeholder: 'e.g. 420' }],
  },
  additionalPropertyOwnership: {
    rental_property: [
      { key: 'rentalPropertyValue', label: 'Estimated value', placeholder: 'e.g. 250000' },
      { key: 'rentalMortgage', label: 'Mortgage balance', placeholder: 'e.g. 175000' },
      { key: 'rentalPropertyPayment', label: 'Monthly payment', placeholder: 'e.g. 1200' },
      {
        key: 'rentalPropertyIncome',
        label: 'Monthly rental income (optional)',
        placeholder: 'e.g. 1800',
        required: false,
        helperText:
          'If you include rental income here, do not include it in your overall monthly income above or the projections may be overstated.',
      },
    ],
    other_property: [
      { key: 'otherPropertyValue', label: 'Estimated value', placeholder: 'e.g. 225000' },
      { key: 'otherPropertyDebt', label: 'Mortgage or debt balance', placeholder: 'e.g. 0' },
      { key: 'otherPropertyPayment', label: 'Monthly payment', placeholder: 'e.g. 0' },
    ],
  },
  otherDebt: {
    credit_card: [
      { key: 'creditCardDebt', label: 'Balance', placeholder: 'e.g. 1200' },
      { key: 'creditCardPayment', label: 'Monthly payment', placeholder: 'e.g. 75' },
    ],
    student_loan: [
      { key: 'studentLoans', label: 'Balance', placeholder: 'e.g. 45000' },
      { key: 'studentLoanPayment', label: 'Monthly payment', placeholder: 'e.g. 300' },
    ],
    personal_loan: [
      { key: 'personalLoans', label: 'Balance', placeholder: 'e.g. 5000' },
      { key: 'personalLoanPayment', label: 'Monthly payment', placeholder: 'e.g. 175' },
    ],
    bnpl: [
      { key: 'bnplDebt', label: 'Balance', placeholder: 'e.g. 600' },
      { key: 'bnplPayment', label: 'Monthly payment', placeholder: 'e.g. 60' },
    ],
    payday: [
      { key: 'paydayDebt', label: 'Balance', placeholder: 'e.g. 300' },
      { key: 'paydayPayment', label: 'Monthly payment', placeholder: 'e.g. 100' },
    ],
    medical: [
      { key: 'medicalDebt', label: 'Balance', placeholder: 'e.g. 1500' },
      { key: 'medicalDebtPayment', label: 'Monthly payment', placeholder: 'e.g. 50' },
    ],
  },
  investmentAccounts: {
    '401k': [
      { key: 'k401Balance', label: 'Current balance', placeholder: 'e.g. 85000' },
      { key: 'k401Contribution', label: 'Monthly contribution ($)', placeholder: 'e.g. 500', required: false },
      { key: 'k401ContributionPercent', label: 'OR contribution percent of pay', placeholder: 'e.g. 6', required: false },
      {
        key: 'k401Match',
        label: 'Employer match',
        type: 'select',
        options: [
          { value: 'maximizing_match', label: 'Getting the full match' },
          { value: 'have_match_not_maxing', label: 'Not getting the full match' },
          { value: 'no_match_or_no_access', label: 'No match or unsure' },
        ],
      },
    ],
    roth_ira: [
      { key: 'rothBalance', label: 'Current balance', placeholder: 'e.g. 25000' },
      { key: 'rothContribution', label: 'Monthly contribution ($)', placeholder: 'e.g. 250', required: false },
      { key: 'rothContributionPercent', label: 'OR contribution percent of pay', placeholder: 'e.g. 5', required: false },
    ],
    traditional_ira: [
      { key: 'iraBalance', label: 'Current balance', placeholder: 'e.g. 30000' },
      { key: 'iraContribution', label: 'Monthly contribution ($)', placeholder: 'e.g. 250', required: false },
      { key: 'iraContributionPercent', label: 'OR contribution percent of pay', placeholder: 'e.g. 5', required: false },
    ],
    brokerage: [
      { key: 'brokerageBalance', label: 'Current balance', placeholder: 'e.g. 50000' },
      { key: 'brokerageContribution', label: 'Monthly contribution ($)', placeholder: 'e.g. 300', required: false },
      { key: 'brokerageContributionPercent', label: 'OR contribution percent of pay', placeholder: 'e.g. 5', required: false },
    ],
    hsa: [
      { key: 'hsaBalance', label: 'Invested HSA balance', placeholder: 'e.g. 8000' },
      { key: 'hsaContribution', label: 'Monthly contribution ($)', placeholder: 'e.g. 150', required: false },
      { key: 'hsaContributionPercent', label: 'OR contribution percent of pay', placeholder: 'e.g. 3', required: false },
    ],
    other: [
      { key: 'otherInvestmentAssets', label: 'Current balance', placeholder: 'e.g. 10000' },
      { key: 'otherInvestmentContribution', label: 'Monthly contribution ($)', placeholder: 'e.g. 100', required: false },
      { key: 'otherInvestmentContributionPercent', label: 'OR contribution percent of pay', placeholder: 'e.g. 2', required: false },
    ],
  },
  additionalAssetTypes: {
    crypto: [
      { key: 'cryptoAssetValue', label: 'Current crypto value', placeholder: 'e.g. 5000' },
      { key: 'cryptoAssetContribution', label: 'Monthly contribution (optional)', placeholder: 'e.g. 100', required: false },
    ],
    individual_stocks: [
      { key: 'individualStockValue', label: 'Current individual stock value', placeholder: 'e.g. 10000' },
      { key: 'individualStockContribution', label: 'Monthly contribution (optional)', placeholder: 'e.g. 100', required: false },
    ],
  },
};

export const SNAPSHOT_OBJECT_FIELD_GROUPS: Record<string, Record<string, AssessmentInlineField[]>> = {
  ...BASE_OBJECT_FIELD_GROUPS,
  protectionCoverage: {},
};

export const DETAILED_OBJECT_FIELD_GROUPS: Record<string, Record<string, AssessmentInlineField[]>> = {
  ...BASE_OBJECT_FIELD_GROUPS,
  protectionCoverage: {
    health: [
      {
        key: 'healthCoverage',
        label: 'Health coverage quality',
        type: 'select',
        options: [
          { value: 'solid', label: 'Solid coverage for normal needs' },
          { value: 'basic', label: 'Basic coverage, but higher costs could hurt' },
          { value: 'limited', label: 'Limited or uncertain coverage' },
          { value: 'none', label: 'No health coverage' },
        ],
      },
    ],
    auto: [
      {
        key: 'autoCoverage',
        label: 'Auto coverage level',
        type: 'select',
        options: [
          { value: 'full', label: 'Full coverage' },
          { value: 'basic', label: 'Basic but reasonable' },
          { value: 'minimal', label: 'Minimal' },
          { value: 'minimum', label: 'State minimum only' },
          { value: 'do_not_drive', label: 'Do not drive / not applicable' },
        ],
      },
    ],
    home_or_renters: [
      {
        key: 'propertyCoverage',
        label: 'Homeowners / renters coverage',
        type: 'select',
        options: [
          { value: 'solid', label: 'Solid coverage' },
          { value: 'basic', label: 'Basic coverage' },
          { value: 'minimal', label: 'Minimal / unsure' },
          { value: 'none', label: 'No coverage' },
        ],
      },
    ],
    life: [
      {
        key: 'lifeInsurance',
        label: 'Life insurance adequacy',
        type: 'select',
        options: [
          { value: 'enough', label: 'Enough for the people who depend on me' },
          { value: 'some', label: 'Some, but probably not enough' },
          { value: 'none', label: 'No life insurance' },
          { value: 'not_needed', label: 'No one depends on my income' },
        ],
      },
    ],
    disability: [
      {
        key: 'disabilityCoverage',
        label: 'Disability / income protection',
        type: 'select',
        options: [
          { value: 'strong', label: 'Strong disability coverage' },
          { value: 'employer_basic', label: 'Basic employer coverage' },
          { value: 'unsure', label: 'Not sure what I have' },
          { value: 'none', label: 'No disability coverage' },
        ],
      },
    ],
  },
  advancedProtection: {
    umbrella: [
      { key: 'umbrellaCoverageAmount', label: 'Umbrella policy amount', placeholder: 'e.g. 1000000', required: false },
    ],
    will_estate: [
      {
        key: 'estateDocuments',
        label: 'Will / estate documents status',
        type: 'select',
        options: [
          { value: 'complete', label: 'Complete and current' },
          { value: 'partial', label: 'Started or partially complete' },
          { value: 'old_or_unsure', label: 'Old or not sure if current' },
          { value: 'none', label: 'Not in place yet' },
        ],
      },
    ],
    trust: [
      {
        key: 'trustInPlace',
        label: 'Trust status',
        type: 'select',
        options: [
          { value: 'complete', label: 'Trust is in place' },
          { value: 'in_progress', label: 'In progress' },
          { value: 'not_sure', label: 'Not sure' },
          { value: 'none', label: 'No trust' },
        ],
      },
    ],
    beneficiaries_updated: [
      {
        key: 'beneficiariesUpdated',
        label: 'Beneficiaries status',
        type: 'select',
        options: [
          { value: 'yes', label: 'Reviewed and current' },
          { value: 'mostly', label: 'Mostly current' },
          { value: 'not_sure', label: 'Not sure' },
          { value: 'no', label: 'Need to review or update' },
        ],
      },
    ],
  },
};

export const SNAPSHOT_OBJECT_INLINE_ROOT_KEYS = new Set(Object.keys(SNAPSHOT_OBJECT_FIELD_GROUPS));
export const DETAILED_OBJECT_INLINE_ROOT_KEYS = new Set(Object.keys(DETAILED_OBJECT_FIELD_GROUPS));


export const DETAILED_QUESTION_COPY_OVERRIDES: Record<string, { question?: string; helperText?: string }> = {
  protectionCoverage: {
    question: 'Let’s add a little detail to your core insurance protections.',
    helperText:
      'Review or select the protections you have in place. If you came from Snapshot, your earlier selections should already be checked. We’ll ask for quality or adequacy details only under the items you select.',
  },
};

export const COMPREHENSIVE_INVESTING_ROOT_KEYS = [
  'investmentAccounts',
  'additionalAssetTypes',
  'otherAssets',
] as const;

export function getAssessmentSectionKey(question?: Question): AssessmentSectionKey {
  if (!question) return 'foundation';
  if (ASSESSMENT_ROUTING_KEYS.has(question.key)) return 'foundation';
  return question.section ?? 'context';
}

function getQuestionOriginalIndex(question: Question) {
  return OPTIMIZED_ASSESSMENT_QUESTIONS.findIndex((candidate) => candidate.key === question.key);
}

export function sortQuestionsByAssessmentOrder(questions: Question[]) {
  const sectionRank = new Map(ASSESSMENT_SECTION_ORDER.map((section, index) => [section, index]));

  return [...questions].sort((a, b) => {
    const aSection = getAssessmentSectionKey(a);
    const bSection = getAssessmentSectionKey(b);
    const aRank = sectionRank.get(aSection as typeof ASSESSMENT_SECTION_ORDER[number]) ?? 999;
    const bRank = sectionRank.get(bSection as typeof ASSESSMENT_SECTION_ORDER[number]) ?? 999;

    if (aRank !== bRank) return aRank - bRank;

    return getQuestionOriginalIndex(a) - getQuestionOriginalIndex(b);
  });
}

export const OPTIMIZED_ASSESSMENT_QUESTIONS: Question[] = [
  // ROUTING / CONTEXT
  {
    key: 'ageRange',
    question: 'What is your age range?',
    type: 'single',
    section: 'context',
    required: true,
    options: [
      { value: 'under_25', label: 'Under 25' },
      { value: '25_34', label: '25-34' },
      { value: '35_44', label: '35-44' },
      { value: '45_54', label: '45-54' },
      { value: '55_plus', label: '55+' },
    ],
    tags: { modes: ['snapshot', 'detailed'], priority: 'core' },
  },
  {
    key: 'relationshipStatus',
    question: 'What best describes your household?',
    type: 'single',
    section: 'context',
    required: true,
    options: [
      { value: 'single', label: 'Single' },
      { value: 'single_with_dependents', label: 'Single with dependents' },
      { value: 'partnered', label: 'Partnered / married' },
      { value: 'partnered_with_dependents', label: 'Partnered / married with dependents' },
    ],
    tags: { modes: ['snapshot', 'detailed'], priority: 'core' },
  },
  {
    key: 'housingStatus',
    question: 'What is your housing situation?',
    type: 'single',
    section: 'spending',
    required: true,
    helperText:
      'Choose the option that fits your primary residence. We’ll collect the key housing numbers right here so we do not ask for your primary home again later.',
    options: [
      { value: 'living_with_family', label: 'Living with family' },
      { value: 'rent', label: 'Renting' },
      { value: 'own_with_mortgage', label: 'Own with a mortgage' },
      { value: 'own_outright', label: 'Own outright' },
    ],
    tags: { modes: ['snapshot', 'detailed'], priority: 'core' },
  },

  // These fields are collected inline from housingStatus.
  // They stay in the question list for scoring, saving, continue-mode, and backwards compatibility,
  // but the questionnaire hides them as standalone questions.
  {
    key: 'monthlyHousingCost',
    question: 'What is your monthly rent or primary housing payment?',
    type: 'number',
    section: 'spending',
    required: true,
    placeholder: 'e.g. 1400',
    helperText:
      'Renters: use rent. Owners: use your monthly mortgage or regular house payment. If you live with family or own outright, use your monthly contribution, taxes, insurance, HOA, or $0.',
    conditions: [
      {
        operator: 'custom',
        fn: (r) => ['living_with_family', 'rent', 'own_with_mortgage', 'own_outright'].includes(r.housingStatus),
      },
    ],
    tags: {
      modes: ['snapshot', 'detailed'],
      priority: 'core',
      askIf: (a) => ['living_with_family', 'rent', 'own_with_mortgage', 'own_outright'].includes(a.housingStatus),
    },
  },
  {
    key: 'primaryHomeValue',
    question: 'What is your primary home worth?',
    type: 'number',
    section: 'spending',
    required: true,
    placeholder: 'e.g. 350000',
    helperText: 'Use a rough current market value. A best estimate is fine.',
    conditions: [
      {
        operator: 'custom',
        fn: (r) => r.housingStatus === 'own_with_mortgage' || r.housingStatus === 'own_outright',
      },
    ],
    tags: {
      modes: ['snapshot', 'detailed'],
      priority: 'conditional',
      askIf: (a) => a.housingStatus === 'own_with_mortgage' || a.housingStatus === 'own_outright',
    },
  },
  {
    key: 'primaryMortgage',
    question: 'What is the mortgage balance on your primary home?',
    type: 'number',
    section: 'spending',
    required: false,
    placeholder: 'e.g. 185000',
    helperText: 'Use $0 or leave blank if the home is paid off.',
    conditions: [{ key: 'housingStatus', operator: 'equals', value: 'own_with_mortgage' }],
    tags: {
      modes: ['snapshot', 'detailed'],
      priority: 'conditional',
      askIf: (a) => a.housingStatus === 'own_with_mortgage',
    },
  },

  {
    key: 'additionalPropertyOwnership',
    question: 'Do you own any rental property, land, second home, or other real estate?',
    type: 'multiple',
    section: 'spending',
    required: true,
    helperText:
      'Only include real estate you own outside your primary residence, such as rental property, land, or a second home.',
    options: [
      { value: 'rental_property', label: 'Rental property' },
      { value: 'other_property', label: 'Other property / land / second home' },
      { value: 'none', label: 'No additional property' },
    ],
    tags: {
      modes: ['detailed'],
      priority: 'conditional',
      askIf: () => true,
    },
  },

  {
    key: 'rentalPropertyValue',
    question: 'What is your rental property worth?',
    type: 'number',
    section: 'spending',
    required: true,
    placeholder: 'e.g. 250000',
    helperText: 'Use the combined value if you own more than one rental.',
    conditions: [{ key: 'additionalPropertyOwnership', operator: 'includes', value: 'rental_property' }],
    tags: {
      modes: ['detailed'],
      priority: 'conditional',
      askIf: (a) => Array.isArray(a.additionalPropertyOwnership) && a.additionalPropertyOwnership.includes('rental_property'),
    },
  },
  {
    key: 'rentalMortgage',
    question: 'What is the mortgage balance on your rental property?',
    type: 'number',
    section: 'spending',
    required: false,
    placeholder: 'e.g. 175000',
    helperText: 'Use the combined balance if you own more than one rental. Use $0 or leave blank if paid off.',
    conditions: [{ key: 'additionalPropertyOwnership', operator: 'includes', value: 'rental_property' }],
    tags: {
      modes: ['detailed'],
      priority: 'conditional',
      askIf: (a) => Array.isArray(a.additionalPropertyOwnership) && a.additionalPropertyOwnership.includes('rental_property'),
    },
  },
  {
    key: 'rentalPropertyPayment',
    question: 'What is the monthly payment on your rental property?',
    type: 'number',
    section: 'spending',
    required: false,
    placeholder: 'e.g. 1200',
    helperText: 'Use the combined payment if you own more than one rental. Use $0 if paid off.',
    conditions: [{ key: 'additionalPropertyOwnership', operator: 'includes', value: 'rental_property' }],
    tags: {
      modes: ['detailed'],
      priority: 'conditional',
      askIf: (a) => Array.isArray(a.additionalPropertyOwnership) && a.additionalPropertyOwnership.includes('rental_property'),
    },
  },
  {
    key: 'rentalPropertyIncome',
    question: 'What is the monthly rental income from this property?',
    type: 'number',
    section: 'spending',
    required: false,
    placeholder: 'e.g. 1800',
    helperText:
      'If you include rental income here, do not include it in your overall monthly income above or the projections may be overstated.',
    conditions: [{ key: 'additionalPropertyOwnership', operator: 'includes', value: 'rental_property' }],
    tags: {
      modes: ['detailed'],
      priority: 'conditional',
      askIf: (a) => Array.isArray(a.additionalPropertyOwnership) && a.additionalPropertyOwnership.includes('rental_property'),
    },
  },
  {
    key: 'otherPropertyValue',
    question: 'What is your other property worth?',
    type: 'number',
    section: 'spending',
    required: true,
    placeholder: 'e.g. 225000',
    helperText: 'Land, second homes, or other property not listed above.',
    conditions: [{ key: 'additionalPropertyOwnership', operator: 'includes', value: 'other_property' }],
    tags: {
      modes: ['detailed'],
      priority: 'conditional',
      askIf: (a) => Array.isArray(a.additionalPropertyOwnership) && a.additionalPropertyOwnership.includes('other_property'),
    },
  },
  {
    key: 'otherPropertyDebt',
    question: 'What is the mortgage or debt balance on that other property?',
    type: 'number',
    section: 'spending',
    required: false,
    placeholder: 'e.g. 0',
    helperText: 'Use $0 or leave blank if the property is paid off.',
    conditions: [{ key: 'additionalPropertyOwnership', operator: 'includes', value: 'other_property' }],
    tags: {
      modes: ['detailed'],
      priority: 'conditional',
      askIf: (a) => Array.isArray(a.additionalPropertyOwnership) && a.additionalPropertyOwnership.includes('other_property'),
    },
  },

  {
    key: 'otherPropertyPayment',
    question: 'What is the monthly payment on that other property?',
    type: 'number',
    section: 'spending',
    required: false,
    placeholder: 'e.g. 0',
    helperText: 'Use $0 or leave blank if the property is paid off.',
    conditions: [{ key: 'additionalPropertyOwnership', operator: 'includes', value: 'other_property' }],
    tags: {
      modes: ['detailed'],
      priority: 'conditional',
      askIf: (a) => Array.isArray(a.additionalPropertyOwnership) && a.additionalPropertyOwnership.includes('other_property'),
    },
  },

  {
    key: 'monthlyUtilities',
    question: 'About how much do you spend on utilities each month?',
    type: 'number',
    section: 'spending',
    required: true,
    placeholder: 'e.g. 250',
    helperText:
      'Include utilities like electric, gas, water, trash, and internet if possible.',
    tags: { modes: ['snapshot', 'detailed'], priority: 'core' },
  },
  {
    key: 'housingPressure',
    question: 'How heavy do your housing and utility costs feel in your monthly budget?',
    type: 'single',
    section: 'spending',
    required: true,
    options: [
      { value: 'very_manageable', label: 'Very manageable' },
      { value: 'manageable', label: 'Manageable' },
      { value: 'a_bit_tight', label: 'A bit tight' },
      { value: 'tight', label: 'Tight' },
      { value: 'stressful', label: 'Stressful' },
    ],
    tags: { modes: ['snapshot', 'detailed'], priority: 'core' },
  },

  // INCOME
  {
    key: 'monthlyTakeHomeIncome',
    question: 'About how much take-home pay hits your bank each month?',
    type: 'number',
    section: 'income',
    required: true,
    placeholder: 'e.g. 5000',
    helperText: 'Use take-home pay, not gross income.',
    tags: { modes: ['snapshot', 'detailed'], priority: 'core' },
  },
  {
    key: 'incomeConsistency',
    question: 'How consistent is your income?',
    type: 'single',
    section: 'income',
    required: true,
    options: [
      { value: 'very_consistent', label: 'Very consistent' },
      { value: 'mostly_consistent', label: 'Mostly consistent' },
      { value: 'variable', label: 'Variable' },
      { value: 'highly_unpredictable', label: 'Highly unpredictable' },
    ],
    tags: { modes: ['snapshot', 'detailed'], priority: 'core' },
  },
  {
    key: 'incomeGrowthPotential',
    question: 'What is your income growth potential from here?',
    type: 'single',
    section: 'income',
    required: true,
    options: [
      { value: 'high', label: 'High' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'limited', label: 'Limited' },
      { value: 'none', label: 'None / unsure' },
    ],
    tags: { modes: ['snapshot', 'detailed'], priority: 'core' },
  },
  {
    key: 'incomeGrowth',
    question: 'How has your income changed over the last year?',
    type: 'single',
    section: 'income',
    required: false,
    options: [
      { value: 'increased_significantly', label: 'Increased significantly' },
      { value: 'increased_moderately', label: 'Increased moderately' },
      { value: 'stable', label: 'Stayed about the same' },
      { value: 'decreased', label: 'Decreased' },
    ],
    tags: { modes: ['detailed'], priority: 'defer' },
  },
  {
    key: 'incomeSources',
    question: 'How many income sources do you have?',
    type: 'single',
    section: 'income',
    required: false,
    options: [
      { value: 'one', label: 'One' },
      { value: 'two', label: 'Two' },
      { value: 'three_or_more', label: 'Three or more' },
    ],
    tags: { modes: ['detailed'], priority: 'defer' },
  },

  // SPENDING / FIXED COSTS
  {
    key: 'monthlyChildcareCost',
    question: 'About how much do you spend on childcare each month?',
    type: 'number',
    section: 'spending',
    required: true,
    placeholder: 'e.g. 600',
    helperText: 'This counts as a must-pay monthly cost and is included in fixed cost load and monthly margin.',
    conditions: [
      {
        operator: 'custom',
        fn: (r) => Array.isArray(r.protectionCoverage) && r.protectionCoverage.includes('life'),
      },
    ],
    tags: {
      modes: ['snapshot', 'detailed'],
      priority: 'conditional',
      askIf: (a) =>
        ['single_with_dependents', 'partnered_with_dependents'].includes(a.relationshipStatus),
    },
  },
  {
    key: 'overspendingFrequency',
    question: 'How often do you overspend?',
    type: 'single',
    section: 'spending',
    required: true,
    options: [
      { value: 'rarely', label: 'Rarely' },
      { value: 'sometimes', label: 'Sometimes' },
      { value: 'often', label: 'Often' },
      { value: 'almost_always', label: 'Almost always' },
    ],
    tags: { modes: ['snapshot', 'detailed'], priority: 'core' },
  },
  {
    key: 'moneyLeaks',
    question:
      'Do you think you have money leaks like subscriptions, impulse spending, or frequent convenience purchases?',
    type: 'single',
    section: 'spending',
    required: true,
    options: [
      { value: 'none', label: 'No, not really' },
      { value: 'a_few', label: 'A few' },
      { value: 'several', label: 'Several' },
      { value: 'a_lot', label: 'A lot' },
    ],
    tags: { modes: ['snapshot', 'detailed'], priority: 'core' },
  },
  {
    key: 'spendingAwareness',
    question: 'How clear are you on where your money actually goes each month?',
    type: 'single',
    section: 'spending',
    required: false,
    options: [
      { value: 'track_everything', label: 'I track it closely and know the details' },
      { value: 'good_general_idea', label: 'I have a good general idea' },
      { value: 'not_really_sure', label: 'I am not really sure' },
      { value: 'no_idea', label: 'I do not have a clear picture' },
    ],
    tags: { modes: ['detailed'], priority: 'defer' },
  },
  {
    key: 'lifestyleInflation',
    question: 'When your income goes up, what usually happens?',
    type: 'single',
    section: 'spending',
    required: false,
    options: [
      { value: 'save_or_invest_most', label: 'I save or invest most of it' },
      { value: 'split_it', label: 'I split it between lifestyle and savings' },
      { value: 'spend_most', label: 'I usually spend most of it' },
    ],
    tags: { modes: ['detailed'], priority: 'defer' },
  },
  {
    key: 'threeMonthReview',
    question: 'Have you done a 3-month spending review recently?',
    helperText:
      'This means reviewing the last 3 months of bank and card transactions to see exactly where your money is going.',
    type: 'single',
    section: 'spending',
    required: false,
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
    tags: { modes: ['detailed'], priority: 'defer' },
  },

  // SAVING
  {
  key: 'totalLiquidSavings',
  question:
    'About how much do you currently have in liquid savings?',
  type: 'number',
  section: 'saving',
  required: true,
  placeholder: 'e.g. 8000',
  helperText:
    'Checking, savings, and emergency funds combined. A quick estimate is fine.',
  tags: { modes: ['snapshot', 'detailed'], priority: 'core' },
},
{
  key: 'fixedCostPressureReview',
  question: 'See your fixed cost pressure',
  type: 'single',
  section: 'spending',
  required: false,
  options: [{ value: 'review', label: 'Show me the breakdown' }],
  tags: {
    modes: ['detailed'],
    priority: 'conditional',
    askIf: () => false,
  },
},
{
  key: 'emergencyFundReview',
  question: 'See your emergency fund coverage',
  type: 'single',
  section: 'saving',
  required: false,
  options: [{ value: 'review', label: 'Show me the coverage' }],
  tags: {
    modes: ['detailed'],
    priority: 'conditional',
    askIf: () => false,
  },
},

  {
    key: 'savingConsistency',
    question: 'Are you currently saving money each month?',
    type: 'single',
    section: 'saving',
    required: true,
    options: [
      { value: 'yes_consistently', label: 'Yes, consistently' },
      { value: 'yes_irregularly', label: 'Yes, but irregularly' },
      { value: 'not_currently', label: 'Not currently' },
    ],
    tags: { modes: ['snapshot', 'detailed'], priority: 'core' },
  },
  {
    key: 'emergencyAccess',
    question:
      'If something unexpected happened, how much of your cash is truly available for emergencies?',
    type: 'single',
    section: 'saving',
    required: true,
    options: [
      { value: 'all', label: 'All of it' },
      { value: 'most', label: 'Most of it' },
      { value: 'some', label: 'Some of it' },
      { value: 'very_little', label: 'Very little of it' },
    ],
    tags: {
      modes: ['snapshot', 'detailed'],
      priority: 'core',
      askIf: (answers) => Number(String(answers.totalLiquidSavings ?? '').replace(/[^\d.-]/g, '')) > 0,
    },
  },

  // DEBT
  {
    key: 'vehicleDebt',
    question: 'What is your vehicle situation?',
    type: 'single',
    section: 'debt',
    required: true,
    options: [
      { value: 'own_outright', label: 'Own outright (no loan)' },
      { value: 'car_loan', label: 'Have a car loan' },
      { value: 'car_lease', label: 'Lease a vehicle' },
      { value: 'no_vehicle', label: 'No vehicle / not applicable' },
    ],
    tags: { modes: ['snapshot', 'detailed'], priority: 'core' },
  },
  {
  key: 'carLoanBalance',
  question: 'What is your approximate car loan balance?',
  type: 'number',
  section: 'debt',
  required: true,
  placeholder: 'e.g. 18000',
  helperText: 'A best estimate is fine.',
  conditions: [{ key: 'vehicleDebt', operator: 'equals', value: 'car_loan' }],
  tags: {
    modes: ['snapshot', 'detailed'],
    priority: 'conditional',
    askIf: (a) => a.vehicleDebt === 'car_loan',
  },
},
  {
  key: 'monthlyVehiclePayment',
  question: 'About how much is your monthly vehicle payment?',
  type: 'number',
  section: 'debt',
  required: true,
  placeholder: 'e.g. 540',
  helperText: 'Use your monthly loan or lease payment. An estimate is fine.',
  conditions: [
    {
      operator: 'custom',
      fn: (r) => r.vehicleDebt === 'car_loan' || r.vehicleDebt === 'car_lease',
    },
  ],
  tags: {
    modes: ['snapshot', 'detailed'],
    priority: 'conditional',
    askIf: (a) => a.vehicleDebt === 'car_loan' || a.vehicleDebt === 'car_lease',
  },
},
{
  key: 'vehicleValue',
  question: 'What is your vehicle worth today?',
  type: 'number',
  section: 'debt',
  required: false,
  placeholder: 'e.g. 15000',
  helperText: 'A rough private-party or trade-in estimate is fine. This helps us see whether the loan is underwater.',
  conditions: [{ operator: 'custom', fn: () => false }],
  tags: {
    modes: ['snapshot', 'detailed'],
    priority: 'conditional',
    askIf: () => false,
  },
},
{
  key: 'carPaymentOpportunityReview',
  question: 'Let’s look at what this vehicle payment is really costing you',
  type: 'single',
  section: 'debt',
  required: false,
  helperText: 'This quick activity turns the payment into real monthly and long-term numbers, then saves the insight into your report.',
  options: [{ value: 'review', label: 'Show me the impact' }],
  conditions: [
    {
      operator: 'custom',
      fn: (r) =>
        (r.vehicleDebt === 'car_loan' || r.vehicleDebt === 'car_lease') &&
        Number(r.monthlyVehiclePayment || 0) > 0,
    },
  ],
  tags: {
    modes: ['snapshot', 'detailed'],
    priority: 'conditional',
    askIf: (a) =>
      (a.vehicleDebt === 'car_loan' || a.vehicleDebt === 'car_lease') &&
      Number(a.monthlyVehiclePayment || 0) > 0,
  },
},
  {
    key: 'otherDebt',
    question: 'Which of the following debts do you currently have?',
    type: 'multiple',
    section: 'debt',
    required: true,
    options: [
      { value: 'credit_card', label: 'Credit card debt' },
      { value: 'student_loan', label: 'Student loans' },
      { value: 'personal_loan', label: 'Personal loans' },
      { value: 'bnpl', label: 'Buy now, pay later' },
      { value: 'payday', label: 'Payday / cash advance debt' },
      { value: 'medical', label: 'Medical debt' },
      { value: 'none', label: 'None of these' },
    ],
    tags: { modes: ['snapshot', 'detailed'], priority: 'core' },
  },
  {
    key: 'creditCardDebt',
    question: 'About how much credit card debt do you have?',
    type: 'number',
    section: 'debt',
    required: true,
    placeholder: 'e.g. 8500',
    helperText: 'Use the current balance you are carrying, not the monthly payment.',
    conditions: [{ key: 'otherDebt', operator: 'includes', value: 'credit_card' }],
    tags: {
      modes: ['snapshot', 'detailed'],
      priority: 'conditional',
      askIf: (a) => Array.isArray(a.otherDebt) && a.otherDebt.includes('credit_card'),
    },
  },
  {
    key: 'creditCardPayment',
    question: 'What is the minimum monthly payment on your credit cards?',
    type: 'number',
    section: 'debt',
    required: false,
    placeholder: 'e.g. 75',
    helperText: 'Use the minimum or regular required payment. A best estimate is fine.',
    conditions: [{ key: 'otherDebt', operator: 'includes', value: 'credit_card' }],
    tags: {
      modes: ['snapshot', 'detailed'],
      priority: 'conditional',
      askIf: (a) => Array.isArray(a.otherDebt) && a.otherDebt.includes('credit_card'),
    },
  },
  {
    key: 'studentLoans',
    question: 'About how much student loan debt do you have?',
    type: 'number',
    section: 'debt',
    required: true,
    placeholder: 'e.g. 12000',
    conditions: [{ key: 'otherDebt', operator: 'includes', value: 'student_loan' }],
    tags: {
      modes: ['snapshot', 'detailed'],
      priority: 'conditional',
      askIf: (a) => Array.isArray(a.otherDebt) && a.otherDebt.includes('student_loan'),
    },
  },
  {
    key: 'studentLoanPayment',
    question: 'What is the monthly payment on your student loans?',
    type: 'number',
    section: 'debt',
    required: false,
    placeholder: 'e.g. 300',
    helperText: 'Use the minimum or regular required payment. A best estimate is fine.',
    conditions: [{ key: 'otherDebt', operator: 'includes', value: 'student_loan' }],
    tags: {
      modes: ['snapshot', 'detailed'],
      priority: 'conditional',
      askIf: (a) => Array.isArray(a.otherDebt) && a.otherDebt.includes('student_loan'),
    },
  },
  {
    key: 'personalLoans',
    question: 'About how much personal loan debt do you have?',
    type: 'number',
    section: 'debt',
    required: true,
    placeholder: 'e.g. 5000',
    conditions: [{ key: 'otherDebt', operator: 'includes', value: 'personal_loan' }],
    tags: {
      modes: ['snapshot', 'detailed'],
      priority: 'conditional',
      askIf: (a) => Array.isArray(a.otherDebt) && a.otherDebt.includes('personal_loan'),
    },
  },
  {
    key: 'personalLoanPayment',
    question: 'What is the monthly payment on your personal loans?',
    type: 'number',
    section: 'debt',
    required: false,
    placeholder: 'e.g. 175',
    helperText: 'Use the minimum or regular required payment. A best estimate is fine.',
    conditions: [{ key: 'otherDebt', operator: 'includes', value: 'personal_loan' }],
    tags: {
      modes: ['snapshot', 'detailed'],
      priority: 'conditional',
      askIf: (a) => Array.isArray(a.otherDebt) && a.otherDebt.includes('personal_loan'),
    },
  },
  {
    key: 'bnplDebt',
    question: 'About how much buy now, pay later debt do you have?',
    type: 'number',
    section: 'debt',
    required: true,
    placeholder: 'e.g. 600',
    helperText: 'This counts as a must-pay monthly cost and is included in fixed cost load and monthly margin.',
    conditions: [{ key: 'otherDebt', operator: 'includes', value: 'bnpl' }],
    tags: {
      modes: ['snapshot', 'detailed'],
      priority: 'conditional',
      askIf: (a) => Array.isArray(a.otherDebt) && a.otherDebt.includes('bnpl'),
    },
  },
  {
    key: 'bnplPayment',
    question: 'What is the monthly payment on buy now, pay later debt?',
    type: 'number',
    section: 'debt',
    required: false,
    placeholder: 'e.g. 60',
    helperText: 'Use the minimum or regular required payment. A best estimate is fine.',
    conditions: [{ key: 'otherDebt', operator: 'includes', value: 'bnpl' }],
    tags: {
      modes: ['snapshot', 'detailed'],
      priority: 'conditional',
      askIf: (a) => Array.isArray(a.otherDebt) && a.otherDebt.includes('bnpl'),
    },
  },
  {
    key: 'paydayDebt',
    question: 'About how much payday or cash advance debt do you have?',
    type: 'number',
    section: 'debt',
    required: true,
    placeholder: 'e.g. 300',
    conditions: [{ key: 'otherDebt', operator: 'includes', value: 'payday' }],
    tags: {
      modes: ['snapshot', 'detailed'],
      priority: 'conditional',
      askIf: (a) => Array.isArray(a.otherDebt) && a.otherDebt.includes('payday'),
    },
  },
  {
    key: 'paydayPayment',
    question: 'What is the monthly payment on payday or cash advance debt?',
    type: 'number',
    section: 'debt',
    required: false,
    placeholder: 'e.g. 100',
    helperText: 'Use the minimum or regular required payment. A best estimate is fine.',
    conditions: [{ key: 'otherDebt', operator: 'includes', value: 'payday' }],
    tags: {
      modes: ['snapshot', 'detailed'],
      priority: 'conditional',
      askIf: (a) => Array.isArray(a.otherDebt) && a.otherDebt.includes('payday'),
    },
  },
  {
    key: 'medicalDebt',
    question: 'About how much medical debt do you have?',
    type: 'number',
    section: 'debt',
    required: true,
    placeholder: 'e.g. 1500',
    conditions: [{ key: 'otherDebt', operator: 'includes', value: 'medical' }],
    tags: {
      modes: ['snapshot', 'detailed'],
      priority: 'conditional',
      askIf: (a) => Array.isArray(a.otherDebt) && a.otherDebt.includes('medical'),
    },
  },
  {
    key: 'medicalDebtPayment',
    question: 'What is the monthly payment on your medical debt?',
    type: 'number',
    section: 'debt',
    required: false,
    placeholder: 'e.g. 50',
    helperText: 'Use the minimum or regular required payment. A best estimate is fine.',
    conditions: [{ key: 'otherDebt', operator: 'includes', value: 'medical' }],
    tags: {
      modes: ['snapshot', 'detailed'],
      priority: 'conditional',
      askIf: (a) => Array.isArray(a.otherDebt) && a.otherDebt.includes('medical'),
    },
  },

  {
    key: 'totalDebtBalance',
    question: 'Legacy total non-mortgage debt balance',
    type: 'number',
    section: 'debt',
    required: false,
    placeholder: 'e.g. 24000',
    helperText:
      'Include credit cards, car loans, student loans, personal loans, and other non-mortgage debt. A quick estimate is fine.',
    conditions: [{ operator: 'custom', fn: () => false }],
    tags: {
      modes: ['detailed'],
      priority: 'conditional',
      askIf: () => false,
    },
  },

  {
    key: 'additionalDebt',
    question: 'Any additional debt not already included?',
    type: 'number',
    section: 'debt',
    required: false,
    placeholder: 'e.g. 5000',
    helperText: 'Optional catch-all for debts not already captured above.',
    conditions: [
      {
        operator: 'custom',
        fn: (r) =>
          r.vehicleDebt === 'car_loan' ||
          r.vehicleDebt === 'car_lease' ||
          (Array.isArray(r.otherDebt) && !r.otherDebt.includes('none')),
      },
    ],
    tags: {
      modes: ['detailed'],
      priority: 'conditional',
      askIf: (a) =>
        a.vehicleDebt === 'car_loan' ||
        a.vehicleDebt === 'car_lease' ||
        (Array.isArray(a.otherDebt) && !a.otherDebt.includes('none')),
    },
  },

  {
    key: 'monthlyDebtPayments',
    question: 'About how much do you pay toward non-mortgage debt each month?',
    type: 'number',
    section: 'debt',
    required: true,
    placeholder: 'e.g. 450',
    helperText:
      'Include your car or lease payment plus credit cards, student loans, personal loans, medical debt, and similar payments. A quick estimate is fine.',
    conditions: [{ operator: 'custom', fn: () => false }],
    tags: {
      modes: ['snapshot', 'detailed'],
      priority: 'core',
      askIf: () => false,
    },
  },
  {
    key: 'debtManageability',
    question: 'How manageable does your debt feel right now?',
    type: 'single',
    section: 'debt',
    required: true,
    options: [
      { value: 'very_manageable', label: 'Very manageable' },
      { value: 'manageable', label: 'Manageable' },
      { value: 'a_bit_heavy', label: 'A bit heavy' },
      { value: 'heavy', label: 'Heavy' },
      { value: 'overwhelming', label: 'Overwhelming' },
    ],
    tags: { modes: ['snapshot', 'detailed'], priority: 'core' },
  },
  {
    key: 'debtPaydownStrategy',
    question: 'Are you using any debt paydown strategy right now?',
    type: 'single',
    section: 'debt',
    required: true,
    options: [
      { value: 'avalanche', label: 'Avalanche (highest interest first)' },
      { value: 'snowball', label: 'Snowball (smallest balance first)' },
      { value: 'general_extra', label: 'Paying extra where I can' },
      { value: 'minimums_only', label: 'Mostly minimums only' },
      { value: 'no_strategy', label: 'No real strategy' },
    ],
    conditions: [
      {
        operator: 'custom',
        fn: (r) =>
          r.vehicleDebt === 'car_loan' ||
          r.vehicleDebt === 'car_lease' ||
          (Array.isArray(r.otherDebt) && !r.otherDebt.includes('none')),
      },
    ],
    tags: {
      modes: ['snapshot', 'detailed'],
      priority: 'core',
      askIf: (a) =>
        a.vehicleDebt === 'car_loan' ||
        a.vehicleDebt === 'car_lease' ||
        (Array.isArray(a.otherDebt) && !a.otherDebt.includes('none')),
    },
  },
  {
    key: 'creditCardBehavior',
    question: 'Which best describes your credit card behavior?',
    type: 'single',
    section: 'debt',
    required: true,
    conditions: [{ key: 'otherDebt', operator: 'includes', value: 'credit_card' }],
    options: [
      { value: 'pay_in_full', label: 'I pay cards off in full monthly' },
      { value: 'small_balance', label: 'I usually carry a small balance' },
      { value: 'revolving_balance', label: 'I regularly carry a balance' },
      { value: 'behind', label: 'I am struggling to keep up' },
    ],
    tags: {
      modes: ['detailed'],
      priority: 'conditional',
      askIf: (a) => Array.isArray(a.otherDebt) && a.otherDebt.includes('credit_card'),
    },
  },

  // HOMEOWNER DETAIL
  // Replaced by V2 real estate fields above.


  // INVESTING
  {
    key: 'investingStatus',
    question: 'Are you currently investing for the future?',
    type: 'single',
    section: 'investing',
    required: true,
    options: [
      { value: 'yes_consistently', label: 'Yes, consistently' },
      { value: 'yes_irregularly', label: 'Yes, irregularly' },
      { value: 'not_yet', label: 'Not yet' },
    ],
    tags: { modes: ['snapshot', 'detailed'], priority: 'core' },
  },
  {
    key: 'employerMatch',
    question:
      'Does your employer offer a retirement match, and are you contributing enough to get it?',
    type: 'single',
    section: 'investing',
    required: true,
    options: [
      { value: 'maximizing_match', label: 'Yes, and I am getting the full match' },
      { value: 'have_match_not_maxing', label: 'Yes, but I am not getting the full match' },
      { value: 'have_match_not_contributing', label: 'Yes, but I am not contributing right now' },
      { value: 'no_match_or_no_access', label: 'No match or no workplace plan access' },
    ],
    conditions: [{ operator: 'custom', fn: () => false }],
    tags: { modes: ['detailed'], priority: 'conditional', askIf: () => false },
  },
  {
    key: 'investmentAccounts',
    question: 'Which investment accounts do you currently have?',
    type: 'multiple',
    section: 'investing',
    required: true,
    conditions: [],
    options: [
      { value: '401k', label: '401(k) / workplace plan' },
      { value: 'roth_ira', label: 'Roth IRA' },
      { value: 'traditional_ira', label: 'Traditional IRA' },
      { value: 'brokerage', label: 'Taxable brokerage' },
      { value: 'hsa', label: 'HSA invested for the future' },
      { value: 'other', label: 'Other investment account' },
      { value: 'none', label: 'None yet' },
    ],
    tags: {
      modes: ['detailed'],
      priority: 'conditional',
      askIf: (a) => a.investingStatus !== 'not_yet',
    },
  },
  {
    key: 'additionalAssetTypes',
    question: 'Do you have crypto or individual stocks we have not already counted?',
    type: 'multiple',
    section: 'investing',
    required: false,
    helperText:
      'Only include crypto or individual stocks that were not already counted in your retirement, HSA, or brokerage accounts above.',
    conditions: [],
    options: [
      { value: 'crypto', label: 'Crypto' },
      { value: 'individual_stocks', label: 'Individual stocks outside accounts above' },
      { value: 'none', label: 'None of these' },
    ],
    tags: {
      modes: ['detailed'],
      priority: 'conditional',
      askIf: (a) => a.investingStatus !== 'not_yet',
    },
  },
  {
    key: 'otherAssets',
    question: 'Other assets (optional)',
    type: 'number',
    section: 'investing',
    required: false,
    placeholder: 'e.g. 5000',
    helperText:
      'Do not include anything already counted in your retirement or brokerage accounts above.',
    conditions: [
      {
        operator: 'custom',
        fn: (r) => r.investingStatus !== 'not_yet',
      },
    ],
    tags: {
      modes: ['detailed'],
      priority: 'conditional',
      askIf: (a) => a.investingStatus !== 'not_yet',
    },
  },

  {
    key: 'investmentConfidence',
    question: 'How confident do you feel about your investing decisions?',
    type: 'single',
    section: 'investing',
    required: true,
    conditions: [
      { key: 'investingStatus', operator: 'in', value: ['yes_consistently', 'yes_irregularly'] },
    ],
    options: [
      { value: 'very_confident', label: 'Very confident' },
      { value: 'somewhat_confident', label: 'Somewhat confident' },
      { value: 'not_confident', label: 'Not confident' },
    ],
    tags: {
      modes: ['detailed'],
      priority: 'conditional',
      askIf: (a) => ['yes_consistently', 'yes_irregularly'].includes(a.investingStatus),
    },
  },
  {
    
      key: 'totalInvestments',
      question: 'About how much do you have invested in total?',
      type: 'number',
      section: 'investing',
      required: true,
      placeholder: 'e.g. 125000',
      helperText:
        'Include 401(k), IRA, brokerage accounts, and other investment accounts. A best estimate is fine.',
      conditions: [{ operator: 'custom', fn: () => false }],
      tags: {
        modes: ['detailed'],
        priority: 'conditional',
        askIf: () => false,
      },
    },

    {
      key: 'monthlyInvestmentContribution',
      question: 'About how much are you investing each month?',
      type: 'number',
      section: 'investing',
      required: true,
      placeholder: 'e.g. 500',
      helperText:
        'Include 401(k), IRA, brokerage, HSA investments, and any automatic retirement contributions. A good estimate is fine.',
      conditions: [{ operator: 'custom', fn: () => false }],
      tags: {
        modes: ['detailed'],
        priority: 'conditional',
        askIf: () => false,
      },
    },
    {
      key: 'cashSavings',
      question: 'Cash / savings balance',
      type: 'number',
      section: 'investing',
      required: false,
      placeholder: 'e.g. 25000',
      helperText: 'Legacy field. Current savings are captured earlier in liquid savings.',
      conditions: [{ operator: 'custom', fn: () => false }],
      tags: { modes: ['detailed'], priority: 'conditional', askIf: () => false },
    },
    {
      key: 'retirementAccounts',
      question: '401k / IRA balance',
      type: 'number',
      section: 'investing',
      required: false,
      placeholder: 'e.g. 150000',
      conditions: [{ operator: 'custom', fn: () => false }],
    tags: { modes: ['detailed'], priority: 'conditional', askIf: () => false },},
    {
      key: 'rothBalance',
      question: 'Roth IRA / Roth 401k balance',
      type: 'number',
      section: 'investing',
      required: false,
      placeholder: 'e.g. 25000',
      helperText: 'Leave blank if this does not apply.',
      conditions: [{ operator: 'custom', fn: () => false }],
    tags: { modes: ['detailed'], priority: 'conditional', askIf: () => false },},
    {
      key: 'brokerageAccounts',
      question: 'Taxable brokerage account balance',
      type: 'number',
      section: 'investing',
      required: false,
      placeholder: 'e.g. 50000',
      conditions: [{ operator: 'custom', fn: () => false }],
    tags: { modes: ['detailed'], priority: 'conditional', askIf: () => false },},
    {
      key: 'otherInvestments',
      question: 'Other investments',
      type: 'number',
      section: 'investing',
      required: false,
      placeholder: 'e.g. 10000',
      conditions: [{ operator: 'custom', fn: () => false }],
    tags: { modes: ['detailed'], priority: 'conditional', askIf: () => false },},
{
  key: 'investmentMix',
  question: 'What best describes your investments?',
  type: 'single',
  section: 'investing',
  required: true,
  conditions: [
    { key: 'investingStatus', operator: 'in', value: ['yes_consistently', 'yes_irregularly'] },
  ],
  options: [
    { value: 'diversified', label: 'Mostly retirement accounts / index funds' },
    { value: 'mixed', label: 'Mix of funds and individual stocks' },
    { value: 'speculative', label: 'Mostly individual stocks or crypto' },
    { value: 'unknown', label: 'Not sure' },
  ],
  tags: {
    modes: ['detailed'],
    priority: 'conditional',
    askIf: (a) => ['yes_consistently', 'yes_irregularly'].includes(a.investingStatus),
  },
},


  // PROTECTION

  {
    key: 'unexpectedExpenseHandling',
    question: 'If a $1,000 expense hit this month, what would you most likely do?',
    type: 'single',
    section: 'protection',
    required: true,
    options: [
      { value: 'savings', label: 'Use savings' },
      { value: 'credit', label: 'Use credit' },
      { value: 'adjust', label: 'Cut other spending and work around it' },
      { value: 'family', label: 'Rely on family or someone else' },
      { value: 'uncertain', label: 'I’m not really sure' },
    ],
    tags: { modes: ['detailed'], priority: 'core' },
  },
  {
    key: 'incomeProtectionLevel',
    question: 'If your income stopped tomorrow, how protected would you feel?',
    type: 'single',
    section: 'protection',
    required: true,
    helperText:
      'Your income is the engine that drives most households. If it stops, everything else is affected. In the full assessment, we will compare this feeling to your real savings and must-pay monthly bills.',
    options: [
      { value: 'well_protected', label: 'Well protected' },
      { value: 'somewhat_protected', label: 'Somewhat protected' },
      { value: 'not_protected', label: 'Not protected' },
    ],
    tags: { modes: ['detailed'], priority: 'core' },
  },

  {
    key: 'protectionCoverage',
    question: 'Which insurance protections do you currently have in place?',
    helperText:
      'Check everything that applies. This is a quick snapshot, not a full policy review. Leave anything unchecked if you do not have it or are unsure.',
    type: 'multiple',
    section: 'protection',
    required: true,
    options: [
      { value: 'health', label: 'Health insurance' },
      { value: 'auto', label: 'Auto insurance' },
      { value: 'home_or_renters', label: 'Homeowners / renters insurance' },
      { value: 'life', label: 'Life insurance' },
      { value: 'disability', label: 'Disability / income protection' },
      { value: 'none', label: 'None of these / not sure' },
    ],
    tags: { modes: ['snapshot', 'detailed'], priority: 'core' },
  },

  {
    key: 'umbrellaCoverageAmount',
    question: 'How much umbrella liability coverage do you have?',
    type: 'number',
    section: 'protection',
    required: false,
    placeholder: 'e.g. 1000000',
    helperText: 'Use the policy limit if you know it. A best estimate is fine.',
    conditions: [{ key: 'advancedProtection', operator: 'includes', value: 'umbrella' }],
    tags: {
      modes: ['detailed'],
      priority: 'conditional',
      askIf: (a) => Array.isArray(a.advancedProtection) && a.advancedProtection.includes('umbrella'),
    },
  },

  {
    key: 'advancedProtection',
    question: 'Do you have any advanced protection or estate planning items in place?',
    type: 'multiple',
    section: 'protection',
    required: true,
    helperText:
      'These are more important when others depend on you, you own property, or you have meaningful assets to protect. Select what you already have in place.',
    options: [
      { value: 'umbrella', label: 'Umbrella liability policy' },
      { value: 'will_estate', label: 'Will or estate documents' },
      { value: 'trust', label: 'Trust' },
      { value: 'beneficiaries_updated', label: 'Beneficiaries reviewed or updated' },
      { value: 'none', label: 'None of these / not sure' },
    ],
    tags: {
      modes: ['detailed'],
      priority: 'conditional',
      askIf: (a) => {
        const hasDependents = ['single_with_dependents', 'partnered_with_dependents'].includes(a.relationshipStatus);
        const partnered = ['partnered', 'partnered_with_dependents'].includes(a.relationshipStatus);
        const ownsHome = ['own_with_mortgage', 'own_outright'].includes(a.housingStatus);
        const ownsOtherProperty = Array.isArray(a.additionalPropertyOwnership) && a.additionalPropertyOwnership.some((item) => item !== 'none');
        const hasMeaningfulInvestments =
          Number(a.k401Balance || 0) +
            Number(a.iraBalance || 0) +
            Number(a.rothBalance || 0) +
            Number(a.brokerageBalance || 0) +
            Number(a.hsaBalance || 0) +
            Number(a.otherInvestmentAssets || 0) +
            Number(a.totalInvestments || 0) >=
          50000;

        return hasDependents || partnered || ownsHome || ownsOtherProperty || hasMeaningfulInvestments;
      },
    },
  },

  {
    key: 'incomeProtectionRealityCheck',
    question: 'See your income protection reality check',
    type: 'single',
    section: 'protection',
    required: false,
    helperText:
      'This uses the savings and monthly obligation numbers you already entered to show how long your household could cover must-pay bills if income stopped.',
    options: [{ value: 'review', label: 'Show me the reality check' }],
    tags: {
      modes: ['detailed'],
      priority: 'conditional',
      askIf: () => true,
    },
  },

  // Legacy compatibility fields. These are no longer shown as standalone questions.
  {
    key: 'incomeInterruptionCoverage',
    question: 'If your income stopped for a while, how prepared would you be?',
    type: 'single',
    section: 'protection',
    required: false,
    options: [
      { value: 'very_prepared', label: 'Very prepared' },
      { value: 'somewhat_prepared', label: 'Somewhat prepared' },
      { value: 'not_prepared', label: 'Not prepared' },
    ],
    conditions: [{ operator: 'custom', fn: () => false }],
    tags: { modes: ['detailed'], priority: 'conditional', askIf: () => false },
  },
  {
    key: 'healthInsurance',
    question: 'Do you have health insurance coverage?',
    type: 'single',
    section: 'protection',
    required: false,
    options: [
      { value: 'good_coverage', label: 'Yes, solid coverage' },
      { value: 'basic_coverage', label: 'Yes, basic coverage' },
      { value: 'limited_coverage', label: 'Limited coverage' },
      { value: 'none', label: 'No coverage' },
    ],
    conditions: [{ operator: 'custom', fn: () => false }],
    tags: { modes: ['snapshot', 'detailed'], priority: 'core', askIf: () => false },
  },
  {
    key: 'healthCoverage',
    question: 'How solid does your health insurance feel?',
    type: 'single',
    section: 'protection',
    required: true,
    options: [
      { value: 'solid', label: 'Solid coverage for normal needs' },
      { value: 'basic', label: 'Basic coverage, but higher costs could hurt' },
      { value: 'limited', label: 'Limited or uncertain coverage' },
      { value: 'none', label: 'No health coverage' },
    ],
    tags: {
      modes: ['detailed'],
      priority: 'conditional',
      askIf: (a) => Array.isArray(a.protectionCoverage) && a.protectionCoverage.includes('health'),
    },
  },

  {
    key: 'lifeInsurance',
    question: 'Do you have enough life insurance for the people who depend on you?',
    type: 'single',
    section: 'protection',
    required: true,
    conditions: [
      {
        operator: 'custom',
        fn: (r) => Array.isArray(r.protectionCoverage) && r.protectionCoverage.includes('life'),
      },
    ],
    options: [
      { value: 'enough', label: 'Yes, enough coverage' },
      { value: 'some', label: 'Some, but probably not enough' },
      { value: 'none', label: 'No life insurance' },
      { value: 'not_needed', label: 'No one depends on my income' },
    ],
    tags: {
      modes: ['detailed'],
      priority: 'conditional',
      askIf: (a) => Array.isArray(a.protectionCoverage) && a.protectionCoverage.includes('life'),
    },
  },
  {
    key: 'propertyCoverage',
    question: 'How would you describe your homeowners or renters coverage?',
    type: 'single',
    section: 'protection',
    required: true,
    conditions: [{ key: 'housingStatus', operator: 'not_equals', value: 'living_with_family' }],
    options: [
      { value: 'solid', label: 'Solid coverage' },
      { value: 'basic', label: 'Basic coverage' },
      { value: 'minimal', label: 'Minimal / unsure' },
      { value: 'none', label: 'No coverage' },
    ],
    tags: {
      modes: ['detailed'],
      priority: 'conditional',
      askIf: (a) =>
        Array.isArray(a.protectionCoverage) &&
        a.protectionCoverage.includes('home_or_renters') &&
        a.housingStatus !== 'living_with_family',
    },
  },
  {
    key: 'autoCoverage',
    question: 'How would you describe your auto insurance coverage?',
    type: 'single',
    section: 'protection',
    required: true,
    conditions: [{ key: 'vehicleDebt', operator: 'not_equals', value: 'no_vehicle' }],
    options: [
      { value: 'full', label: 'Full coverage' },
      { value: 'basic', label: 'Basic but reasonable' },
      { value: 'minimal', label: 'Minimal' },
      { value: 'minimum', label: 'State minimum only' },
      { value: 'do_not_drive', label: 'Do not drive / not applicable' },
    ],
    tags: {
      modes: ['detailed'],
      priority: 'conditional',
      askIf: (a) =>
        Array.isArray(a.protectionCoverage) &&
        a.protectionCoverage.includes('auto') &&
        a.vehicleDebt !== 'no_vehicle',
    },
  },


  {
    key: 'disabilityCoverage',
    question: 'How protected is your income if you could not work for a while?',
    type: 'single',
    section: 'protection',
    required: true,
    options: [
      { value: 'strong', label: 'Strong disability or income protection' },
      { value: 'employer_basic', label: 'Some coverage through work' },
      { value: 'unsure', label: 'Not sure what I have' },
      { value: 'none', label: 'No disability coverage' },
    ],
    tags: {
      modes: ['detailed'],
      priority: 'conditional',
      askIf: (a) => Array.isArray(a.protectionCoverage) && a.protectionCoverage.includes('disability'),
    },
  },

  {
    key: 'monthlySavingsContribution',
    question: 'About how much do you intentionally save each month?',
    type: 'number',
    section: 'saving',
    required: false,
    placeholder: 'e.g. 500',
    helperText: 'Do not include investment contributions here. Use the amount that goes into savings or cash reserves each month.',
    tags: { modes: ['detailed'], priority: 'conditional' },
  },
  {
    key: 'monthlySavingsPercent',
    question: 'What percentage of your take-home pay do you save each month?',
    type: 'number',
    section: 'saving',
    required: false,
    placeholder: 'e.g. 10',
    helperText: 'Use this if you know your savings as a percent instead of a dollar amount. Leave blank if you already entered a monthly savings amount.',
    tags: { modes: ['detailed'], priority: 'conditional' },
  },


{
  key: 'netWorthEntry',
  question: 'Let’s pull your full financial picture together',
  type: 'single',
  section: 'vision',
  required: false,
  options: [{ value: 'start', label: 'Calculate my net worth' }],
  tags: {
    modes: ['detailed'],
    priority: 'conditional',
    askIf: (a) =>
      Boolean(a.totalLiquidSavings) &&
      (
        Boolean(a.totalInvestments) || Boolean(a.k401Balance) || Boolean(a.iraBalance) || Boolean(a.rothBalance) || Boolean(a.brokerageBalance) || Boolean(a.hsaBalance) || Boolean(a.otherInvestmentAssets) ||
        Boolean(a.carLoanBalance) ||
        Boolean(a.creditCardDebt) ||
        Boolean(a.studentLoans) ||
        Boolean(a.personalLoans) ||
        Boolean(a.bnplDebt) ||
        Boolean(a.paydayDebt) ||
        Boolean(a.medicalDebt) ||
        Boolean(a.additionalDebt) ||
        Boolean(a.primaryHomeValue) ||
        Boolean(a.primaryMortgage) ||
        Boolean(a.rentalPropertyValue) ||
        Boolean(a.rentalMortgage) ||
        Boolean(a.otherPropertyValue) ||
        Boolean(a.otherPropertyDebt) ||
        Boolean(a.otherAssets)
      ),
  },
},


  // VISION
  {
    key: 'financialDirection',
    question: 'How clear is your financial direction right now?',
    type: 'single',
    section: 'vision',
    required: true,
    options: [
      { value: 'very_clear', label: 'Very clear' },
      { value: 'fairly_clear', label: 'Fairly clear' },
      { value: 'unclear', label: 'Unclear' },
      { value: 'very_unclear', label: 'Very unclear' },
    ],
    tags: { modes: ['snapshot', 'detailed'], priority: 'core' },
  },
  {
    key: 'primaryFinancialPriority',
    question: 'What is your biggest financial priority right now?',
    type: 'single',
    section: 'vision',
    required: true,
    options: [
      { value: 'stability', label: 'Create more breathing room month to month' },
      { value: 'debt', label: 'Pay down debt faster' },
      { value: 'saving', label: 'Build a stronger emergency cushion' },
      { value: 'investing', label: 'Make more progress toward retirement and investing' },
      { value: 'clarity', label: 'Get clear on the right overall plan' },
    ],
    tags: { modes: ['snapshot', 'detailed'], priority: 'core' },
  },
  {
    key: 'financialConfidence',
    question: 'How confident do you feel about your financial position overall?',
    type: 'single',
    section: 'vision',
    required: true,
    options: [
      { value: 'very_confident', label: 'Very confident' },
      { value: 'somewhat_confident', label: 'Somewhat confident' },
      { value: 'not_confident', label: 'Not very confident' },
      { value: 'overwhelmed', label: 'Overwhelmed / behind' },
    ],
    tags: { modes: ['snapshot', 'detailed'], priority: 'core' },
  },
  {
    key: 'progressPriority',
    question: 'What kind of progress matters most right now?',
    type: 'single',
    section: 'vision',
    required: true,
    options: [
      { value: 'relief', label: 'I need relief in the next few months' },
      { value: 'one_year', label: 'I want solid progress within the next year' },
      { value: 'long_term', label: 'I’m focused on building long-term momentum' },
      { value: 'unsure', label: 'I’m not sure yet — I mostly want a clear plan' },
    ],
    tags: { modes: ['detailed'], priority: 'core' },
  },
  {
    key: 'lifeGoal',
    question: 'What long-term outcome matters most to you?',
    type: 'single',
    section: 'vision',
    required: false,
    options: [
      { value: 'retirement_security', label: 'Retirement security' },
      { value: 'financial_freedom', label: 'Financial freedom / more options' },
      { value: 'family_security', label: 'Family security' },
      { value: 'home', label: 'Housing / home progress' },
      { value: 'peace_of_mind', label: 'Peace of mind' },
    ],
    tags: { modes: ['detailed'], priority: 'defer' },
  },
];

export function getVisibleQuestionsByMode(
  questions: Question[],
  responses: Record<string, any>,
  mode: AssessmentMode = 'detailed'
): Question[] {
  const visibleQuestions = questions.filter((q) => {
    const passesConditions = evaluateAllConditions(q.conditions || [], responses);
    const passesMode = !q.tags?.modes || q.tags.modes.includes(mode);
    const passesAskIf = !q.tags?.askIf || q.tags.askIf(responses);

    const passesPriority =
      mode === 'snapshot'
        ? q.tags?.priority === 'core' || q.tags?.priority === 'conditional'
        : true;

    return passesConditions && passesMode && passesAskIf && passesPriority;
  });

  return sortQuestionsByAssessmentOrder(visibleQuestions);
}

export function getSnapshotQuestions(responses: Record<string, any> = {}) {
  return getVisibleQuestionsByMode(OPTIMIZED_ASSESSMENT_QUESTIONS, responses, 'snapshot');
}

export function getDetailedQuestions(responses: Record<string, any> = {}) {
  return getVisibleQuestionsByMode(OPTIMIZED_ASSESSMENT_QUESTIONS, responses, 'detailed');
}
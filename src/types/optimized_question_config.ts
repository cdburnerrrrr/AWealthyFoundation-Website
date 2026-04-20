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
    'monthlyDebtPayments',
    'unexpectedExpenseHandling',
    'debtManageability',
    'progressPriority',
    'debtPaydownStrategy',
    'healthInsurance',
    'investingStatus',
    'employerMatch',
    'financialDirection',
    'primaryFinancialPriority',
    'financialConfidence',
  ],
  detailedOnly: [
    'monthlyChildcareCost',
    'childcarePressure',
    'carLoanBalance',
    'monthlyVehiclePayment',
    'mortgageBalance',
    'homeValue',
    'mortgageImpact',
    'creditCardBehavior',
    'incomeInterruptionCoverage',
    'lifeInsurance',
    'propertyCoverage',
    'autoCoverage',
    'investmentAccounts',
    'investmentConfidence',
    'totalInvestments',
    'investmentMix',
    'savingsAutomation',
    'totalDebtBalance',
    'monthlyVehiclePayment',
    'fixedCostPressureReview',
    'emergencyFundReview',
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

export const OPTIMIZED_ASSESSMENT_QUESTIONS: Question[] = [
  // ROUTING / CONTEXT
  {
    key: 'ageRange',
    question: 'What is your age range?',
    type: 'single',
    section: 'vision',
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
    section: 'vision',
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
    options: [
      { value: 'living_with_family', label: 'Living with family' },
      { value: 'rent', label: 'Renting' },
      { value: 'own_with_mortgage', label: 'Own with a mortgage' },
      { value: 'own_outright', label: 'Own outright' },
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
    key: 'monthlyHousingCost',
    question: 'What is your monthly housing cost right now?',
    type: 'number',
    section: 'spending',
    required: true,
    placeholder: 'e.g. 1400',
    helperText:
      'If you rent, use your monthly rent. If you own, use your monthly mortgage or house payment.',
    tags: { modes: ['snapshot', 'detailed'], priority: 'core' },
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
  {
    key: 'monthlyChildcareCost',
    question: 'About how much do you spend on childcare each month?',
    type: 'number',
    section: 'spending',
    required: true,
    placeholder: 'e.g. 600',
    conditions: [
      {
        key: 'relationshipStatus',
        operator: 'in',
        value: ['single_with_dependents', 'partnered_with_dependents'],
      },
    ],
    tags: {
      modes: ['detailed'],
      priority: 'conditional',
      askIf: (a) =>
        ['single_with_dependents', 'partnered_with_dependents'].includes(a.relationshipStatus),
    },
  },
  {
    key: 'childcarePressure',
    question: 'How much pressure does childcare cost put on your monthly budget?',
    type: 'single',
    section: 'spending',
    required: true,
    conditions: [
      {
        key: 'relationshipStatus',
        operator: 'in',
        value: ['single_with_dependents', 'partnered_with_dependents'],
      },
    ],
    options: [
      { value: 'none', label: 'Very little' },
      { value: 'some', label: 'Some' },
      { value: 'meaningful', label: 'Meaningful' },
      { value: 'heavy', label: 'Heavy' },
      { value: 'very_heavy', label: 'Very heavy' },
    ],
    tags: {
      modes: ['detailed'],
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
    askIf: (a) =>
      Boolean(a.monthlyTakeHomeIncome) &&
      (Boolean(a.monthlyHousingCost) || Boolean(a.monthlyUtilities) || Boolean(a.monthlyDebtPayments)),
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
    askIf: (a) =>
      Boolean(a.totalLiquidSavings) &&
      Boolean(a.monthlyTakeHomeIncome),
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
    key: 'savingsAutomation',
    question: 'How is your saving set up?',
    type: 'single',
    section: 'saving',
    required: true,
    options: [
      { value: 'fully_automated', label: 'Fully automated' },
      { value: 'partially_automated', label: 'Partially automated' },
      { value: 'manual', label: 'Manual transfers' },
      { value: 'not_saving', label: 'Not saving right now' },
    ],
    tags: { modes: ['detailed'], priority: 'conditional' },
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
    modes: ['detailed'],
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
    modes: ['detailed'],
    priority: 'conditional',
    askIf: (a) => a.vehicleDebt === 'car_loan' || a.vehicleDebt === 'car_lease',
  },
},
{
  key: 'carPaymentOpportunityReview',
  question: 'See what your car payment may be costing your future',
  type: 'single',
  section: 'debt',
  required: false,
  options: [{ value: 'review', label: 'Show me the long-term impact' }],
  conditions: [
    {
      operator: 'custom',
      fn: (r) =>
        (r.vehicleDebt === 'car_loan' || r.vehicleDebt === 'car_lease') &&
        Number(r.monthlyVehiclePayment || 0) >= 250,
    },
  ],
  tags: {
    modes: ['detailed'],
    priority: 'conditional',
    askIf: (a) =>
      (a.vehicleDebt === 'car_loan' || a.vehicleDebt === 'car_lease') &&
      Number(a.monthlyVehiclePayment || 0) >= 250,
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
    key: 'totalDebtBalance',
    question: 'About how much total non-mortgage debt do you have right now?',
    type: 'number',
    section: 'debt',
    required: true,
    placeholder: 'e.g. 24000',
    helperText:
      'Include credit cards, car loans, student loans, personal loans, and other non-mortgage debt. A quick estimate is fine.',
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
    question: 'About how much do you pay toward debt each month?',
    type: 'number',
    section: 'debt',
    required: true,
    placeholder: 'e.g. 450',
    helperText:
      'Include credit cards, car loans, student loans, and personal loans. A quick estimate is fine.',
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
  {
    key: 'mortgageBalance',
    question: 'What is your approximate mortgage balance?',
    type: 'number',
    section: 'debt',
    required: true,
    placeholder: 'e.g. 185000',
    conditions: [{ key: 'housingStatus', operator: 'equals', value: 'own_with_mortgage' }],
    tags: {
      modes: ['detailed'],
      priority: 'conditional',
      askIf: (a) => a.housingStatus === 'own_with_mortgage',
    },
  },
  {
    key: 'homeValue',
    question: 'What is your home worth today?',
    type: 'number',
    section: 'spending',
    required: true,
    placeholder: 'e.g. 260000',
    helperText: 'A Zillow estimate or best reasonable estimate is fine.',
    conditions: [{ key: 'housingStatus', operator: 'equals', value: 'own_with_mortgage' }],
    tags: {
      modes: ['detailed'],
      priority: 'conditional',
      askIf: (a) => a.housingStatus === 'own_with_mortgage',
    },
  },
  {
    key: 'mortgageImpact',
    question: 'How does your mortgage affect your overall financial progress right now?',
    type: 'single',
    section: 'spending',
    required: true,
    conditions: [{ key: 'housingStatus', operator: 'equals', value: 'own_with_mortgage' }],
    options: [
      { value: 'very_manageable', label: 'Very manageable' },
      { value: 'manageable', label: 'Manageable' },
      { value: 'slows_me_down', label: 'It slows me down some' },
      { value: 'major_pressure', label: 'It is a major source of pressure' },
    ],
    tags: {
      modes: ['detailed'],
      priority: 'conditional',
      askIf: (a) => a.housingStatus === 'own_with_mortgage',
    },
  },

  // PROTECTION
  {
    key: 'incomeInterruptionCoverage',
    question: 'If your income stopped for a while, how prepared would you be?',
    type: 'single',
    section: 'protection',
    required: true,
    options: [
      { value: 'very_prepared', label: 'Very prepared' },
      { value: 'somewhat_prepared', label: 'Somewhat prepared' },
      { value: 'not_prepared', label: 'Not prepared' },
    ],
    tags: { modes: ['detailed'], priority: 'conditional' },
  },
  {
    key: 'healthInsurance',
    question: 'Do you have health insurance coverage?',
    type: 'single',
    section: 'protection',
    required: true,
    options: [
      { value: 'good_coverage', label: 'Yes, solid coverage' },
      { value: 'basic_coverage', label: 'Yes, basic coverage' },
      { value: 'limited_coverage', label: 'Limited coverage' },
      { value: 'none', label: 'No coverage' },
    ],
    tags: { modes: ['snapshot', 'detailed'], priority: 'core' },
  },
  {
    key: 'lifeInsurance',
    question: 'Do you have life insurance coverage?',
    type: 'single',
    section: 'protection',
    required: true,
    conditions: [
      {
        key: 'relationshipStatus',
        operator: 'in',
        value: ['single_with_dependents', 'partnered_with_dependents'],
      },
    ],
    options: [
      { value: 'enough', label: 'Yes, enough coverage' },
      { value: 'some', label: 'Some, but probably not enough' },
      { value: 'none', label: 'No life insurance' },
    ],
    tags: {
      modes: ['detailed'],
      priority: 'conditional',
      askIf: (a) =>
        ['single_with_dependents', 'partnered_with_dependents'].includes(a.relationshipStatus),
    },
  },
  {
    key: 'propertyCoverage',
    question: 'How would you describe your home or renter coverage?',
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
      askIf: (a) => a.housingStatus !== 'living_with_family',
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
      askIf: (a) => a.vehicleDebt !== 'no_vehicle',
    },
  },

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
    tags: { modes: ['snapshot', 'detailed'], priority: 'core' },
  },
  {
    key: 'investmentAccounts',
    question: 'Which investment accounts do you currently have?',
    type: 'multiple',
    section: 'investing',
    required: true,
    conditions: [
      { key: 'investingStatus', operator: 'in', value: ['yes_consistently', 'yes_irregularly'] },
    ],
    options: [
      { value: '401k', label: '401(k) / workplace plan' },
      { value: 'roth_ira', label: 'Roth IRA' },
      { value: 'traditional_ira', label: 'Traditional IRA' },
      { value: 'brokerage', label: 'Taxable brokerage account' },
      { value: 'hsa', label: 'HSA invested for the future' },
      { value: 'none', label: 'None yet' },
    ],
    tags: {
      modes: ['detailed'],
      priority: 'conditional',
      askIf: (a) => ['yes_consistently', 'yes_irregularly'].includes(a.investingStatus),
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
      conditions: [
        { key: 'investingStatus', operator: 'in', value: ['yes_consistently', 'yes_irregularly'] },
      ],
      tags: {
        modes: ['detailed'],
        priority: 'conditional',
        askIf: (a) => ['yes_consistently', 'yes_irregularly'].includes(a.investingStatus),
      },
    },

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
      (Boolean(a.totalInvestments) || Boolean(a.totalDebtBalance) || Boolean(a.carLoanBalance) || Boolean(a.mortgageBalance)),
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
  return questions.filter((q) => {
    const passesConditions = evaluateAllConditions(q.conditions || [], responses);
    const passesMode = !q.tags?.modes || q.tags.modes.includes(mode);
    const passesAskIf = !q.tags?.askIf || q.tags.askIf(responses);

    const passesPriority =
      mode === 'snapshot'
        ? q.tags?.priority === 'core' || q.tags?.priority === 'conditional'
        : true;

    return passesConditions && passesMode && passesAskIf && passesPriority;
  });
}

export function getSnapshotQuestions(responses: Record<string, any> = {}) {
  return getVisibleQuestionsByMode(OPTIMIZED_ASSESSMENT_QUESTIONS, responses, 'snapshot');
}

export function getDetailedQuestions(responses: Record<string, any> = {}) {
  return getVisibleQuestionsByMode(OPTIMIZED_ASSESSMENT_QUESTIONS, responses, 'detailed');
}
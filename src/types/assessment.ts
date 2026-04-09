// =====================================================
// A WEALTHY FOUNDATION - FINANCIAL ASSESSMENT SYSTEM
// Clean replacement with:
// - mortgage + renter/fixed-cost pressure questions
// - improved action-plan generation
// - cleaner score/report logic
// - compatibility exports
// - Score Improvements
// =====================================================

export type BuildingBlockKey =
  | 'income'
  | 'spending'
  | 'saving'
  | 'debt'
  | 'protection'
  | 'investing'
  | 'vision';

export type PillarKey =
  | 'income'
  | 'spending'
  | 'saving'
  | 'investing'
  | 'debt'
  | 'protection'
  | 'vision';

export type LifeStage =
  | 'starting_out'
  | 'stability'
  | 'growth'
  | 'catch_up';

export type AssessmentType = 'free' | 'detailed' | 'premium';

export const BUILDING_BLOCK_LABELS: Record<BuildingBlockKey, string> = {
  income: 'Income',
  spending: 'Spending',
  saving: 'Saving',
  debt: 'Debt',
  protection: 'Protection',
  investing: 'Investing',
  vision: 'Vision',
};

export const PILLAR_LABELS: Record<PillarKey, string> = {
  income: 'Income',
  spending: 'Spending',
  saving: 'Saving',
  investing: 'Investing',
  debt: 'Debt',
  protection: 'Protection',
  vision: 'Vision',
};
export interface Milestone {
  id: string;
  name: string;
  description: string;
  requiredForStage: LifeStage[];
}

export const MILESTONES: Record<string, Milestone> = {
  starter_emergency: {
    id: 'starter_emergency',
    name: 'Starter Emergency Fund',
    description: 'Build your first emergency cushion.',
    requiredForStage: ['starting_out', 'stability'],
  },
  no_high_interest_debt: {
    id: 'no_high_interest_debt',
    name: 'High-Interest Debt Under Control',
    description: 'Reduce or eliminate the most expensive debt.',
    requiredForStage: ['starting_out', 'stability', 'growth'],
  },
  regular_investing: {
    id: 'regular_investing',
    name: 'Regular Investing Habit',
    description: 'Invest on a consistent basis.',
    requiredForStage: ['growth', 'catch_up'],
  },
};

export function getMilestonesForStage(stage: LifeStage): Milestone[] {
  return Object.values(MILESTONES).filter((m) => m.requiredForStage.includes(stage));
}

export function getBiggestOpportunity(
  pillarScores: Record<PillarKey, number>,
  answers?: Record<string, any>,
  signals?: UserSignals
): PillarKey {
  const weighted = { ...pillarScores };
  const derivedSignals = signals ?? (answers ? deriveSignals(answers) : undefined);

  if (derivedSignals) {
    if (derivedSignals.highObligationPressure) {
      weighted.spending -= 10;
      weighted.debt -= 10;
    }

    if (derivedSignals.hasCreditCardDebt || derivedSignals.hasBnplDebt || derivedSignals.hasPaydayDebt) {
      weighted.debt -= 12;
    }

    if (derivedSignals.noEmergencyFund) weighted.saving -= 12;
    else if (derivedSignals.lowEmergencyFund) weighted.saving -= 6;

    if (derivedSignals.noClearGoals) weighted.vision -= 6;
  }

  return Object.entries(weighted)
    .sort((a, b) => a[1] - b[1])[0][0] as PillarKey;
}

export const LIFE_STAGE_LABELS: Record<LifeStage, string> = {
  starting_out: 'Starting Out',
  stability: 'Stability',
  growth: 'Growth',
  catch_up: 'Catch-Up',
};

export interface Assessment {
  foundationScore: number;
  scoreBand: string;
  pillars: Record<PillarKey, number>;
  strengths: {
    pillar: string;
    label: string;
    score: number;
  }[];
  topFocusAreas: string[];
  insights: string[];
  summary: string;
  nextStep: string;
}

export interface ActionPlanStep {
  title: string;
  body: string;
  checklist: string[];
}

export interface ActionPlan {
  immediate: ActionPlanStep[];
  shortTerm: ActionPlanStep[];
  longTerm: ActionPlanStep[];
}

export interface DetailedReport {
  foundationScore: number;
  scoreBand: string;
  buildingBlockScores: Record<BuildingBlockKey, number>;
  pillarScores: Record<PillarKey, number>;
  pillarReasons: PillarReasons;
  biggestOpportunity: PillarKey;
  lifeStage: LifeStage;
  insights: string[];
  priorities: string[];
  actionPlan: ActionPlan;
  summary: string;
  nextStep: string;
  signals: UserSignals;
  metrics: FinancialMetrics;
  structuralWarnings: {
    type: string;
    severity: 'medium' | 'high';
    message: string;
  }[];
}


export interface FinancialMetrics {
  debtToIncomeRatio?: number;
  fixedCostPressureRatio?: number;
  savingsRate?: number;
  netWorth?: number;
  homeEquity?: number;
  totalSavings?: number;
  totalInvestments?: number;
  monthlyIncome?: number;
  monthlyDebtPayments?: number;
  monthlyHousingCost?: number;
  monthlyUtilities?: number;
  monthlyChildcareCost?: number;
  monthlyFixedCosts?: number;
}


export interface UserSignals {
  highHousingBurden: boolean;
  highObligationPressure: boolean;
  veryHighObligationPressure: boolean;
  hasCreditCardDebt: boolean;
  hasBnplDebt: boolean;
  hasPaydayDebt: boolean;
  hasPersonalLoanDebt: boolean;
  hasStudentLoanDebt: boolean;
  hasVehicleDebt: boolean;
  hasMortgage: boolean;
  hasNoDebtPlan: boolean;
  minimumsOnly: boolean;
  lowEmergencyFund: boolean;
  noEmergencyFund: boolean;
  inconsistentSaving: boolean;
  lowRetirementContribution: boolean;
  noClearGoals: boolean;
  carriesCreditCardBalance: boolean;
  debtFeelsHeavy: boolean;
  incomeConstraintTriggered: boolean;
  variableIncomeWithLowBuffer: boolean;
  limitedMonthlyMargin: boolean;
  housingRatio: number;
  obligationPressure: number;
  debtPaymentRatio: number;
}


export type PillarReasons = Record<PillarKey, string[]>;

export type AssessmentRoute = {
  stage: LifeStage;
  isRenter: boolean;
  isHomeowner: boolean;
  hasMortgage: boolean;
  hasDependents: boolean;
  hasConsumerDebt: boolean;
  hasInvestments: boolean;
  needsRetirementFocus: boolean;
  hasVariableIncome: boolean;
};


export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'in'
  | 'not_in'
  | 'includes'
  | 'not_includes'
  | 'custom';

export interface QuestionCondition {
  key?: string;
  operator: ConditionOperator;
  value?: any;
  fn?: (responses: Record<string, any>) => boolean;
}

export interface Question {
  key: string;
  question: string;
  type: 'single' | 'multiple' | 'number' | 'scale';
  options?: { value: string; label: string }[];
  placeholder?: string;
  helperText?: string;
  section?: BuildingBlockKey | 'context';
  required?: boolean;
  conditions?: QuestionCondition[];
  stage?: Array<LifeStage | 'all'>;
  askIf?: (responses: Record<string, any>, route: AssessmentRoute) => boolean;
}


function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]/g, '');
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function safeArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

const SNAPSHOT_QUESTION_KEYS = new Set([
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
  'debtManageability',
  'debtPaydownStrategy',
  'healthInsurance',
  'investingStatus',
  'employerMatch',
  'financialDirection',
  'primaryFinancialPriority',
  'financialConfidence',
]);

type ScoringMode = 'snapshot' | 'detailed';

function filterSnapshotAnswers(answers: Record<string, any>): Record<string, any> {
  return Object.fromEntries(
    Object.entries(answers).filter(([key]) => SNAPSHOT_QUESTION_KEYS.has(key))
  );
}

function hasAnswer(answers: Record<string, any>, key: string): boolean {
  const value = answers[key];
  return value !== undefined && value !== null && value !== '';
}

function midpointRangeMap(map: Record<string, number>, value: string | undefined): number {
  if (!value) return 0;
  return map[value] ?? 0;
}

function getLiquidSavingsEstimate(a: Record<string, any>): number {
  const savingsMap: Record<string, number> = {
    '100000_plus': 100000,
    '50000_100000': 75000,
    '30000_50000': 40000,
    '15000_30000': 22500,
    '5000_15000': 10000,
    '1000_5000': 3000,
    'under_1000': 500,
  };

  return midpointRangeMap(savingsMap, a.totalLiquidSavings);
}

function getEmergencyFundMonthsEstimate(a: Record<string, any>): number {
  const liquidSavings = getLiquidSavingsEstimate(a);
  const coreMonthlyCosts =
    toNumber(a.monthlyHousingCost) +
    toNumber(a.monthlyUtilities) +
    toNumber(a.monthlyChildcareCost) +
    debtPaymentEstimate(a);

  if (coreMonthlyCosts <= 0) return 0;
  return liquidSavings / coreMonthlyCosts;
}

function hasMortgage(a: Record<string, any>) {
  return a.housingDebt === 'yes';
}

function hasVehicleDebt(a: Record<string, any>) {
  return a.vehicleDebt === 'car_loan' || a.vehicleDebt === 'car_lease';
}

function hasOtherDebt(a: Record<string, any>) {
  return Array.isArray(a.otherDebt) && !a.otherDebt.includes('none');
}

function hasDependents(a: Record<string, any>) {
  return ['single_with_dependents', 'partnered_with_dependents'].includes(a.relationshipStatus);
}

function hasConsumerDebt(a: Record<string, any>) {
  return hasVehicleDebt(a) || hasOtherDebt(a);
}

export function deriveAssessmentRoute(
  answers: Record<string, any>
): AssessmentRoute {
  const stage = determineLifeStage({
    investingActivity:
      answers.investingStatus === 'yes_consistently' ||
      answers.investingStatus === 'yes_irregularly',
    answers,
  });

  const ageRange = answers.ageRange;
  const hasInvestments =
    answers.investingStatus === 'yes_consistently' ||
    answers.investingStatus === 'yes_irregularly';

  return {
    stage,
    isRenter: answers.housingStatus === 'rent',
    isHomeowner:
      answers.housingStatus === 'own_with_mortgage' ||
      answers.housingStatus === 'own_outright',
    hasMortgage:
      answers.housingStatus === 'own_with_mortgage' ||
      answers.housingDebt === 'yes',
    hasDependents: hasDependents(answers),
    hasConsumerDebt: hasConsumerDebt(answers),
    hasInvestments,
    needsRetirementFocus:
      stage === 'growth' ||
      stage === 'catch_up' ||
      ageRange === '45_54' ||
      ageRange === '55_plus',
    hasVariableIncome:
      answers.incomeConsistency === 'variable' ||
      answers.incomeConsistency === 'highly_unpredictable',
  };
}

export function determineIncomeConstraint(
  answers: Record<string, any>,
  signals?: UserSignals
) {
  const derivedSignals = signals ?? deriveSignals(answers);
  const incomeConsistency = answers.incomeConsistency;
  const housingPressure = answers.housingPressure;
  const debtManageability = answers.debtManageability;

  const unstableIncome =
    incomeConsistency === 'variable' || incomeConsistency === 'highly_unpredictable';
  const housingFeelsHeavy =
    housingPressure === 'tight' || housingPressure === 'stressful';
  const debtFeelsHeavy =
    debtManageability === 'tight' ||
    debtManageability === 'struggling' ||
    debtManageability === 'overwhelming';

  const limitedMonthlyMargin =
    derivedSignals.highObligationPressure ||
    derivedSignals.veryHighObligationPressure ||
    derivedSignals.highHousingBurden;

  const variableIncomeWithLowBuffer =
    unstableIncome &&
    (derivedSignals.lowEmergencyFund || derivedSignals.noEmergencyFund);

  const triggered =
    (limitedMonthlyMargin && (housingFeelsHeavy || debtFeelsHeavy)) ||
    variableIncomeWithLowBuffer ||
    (derivedSignals.highHousingBurden && derivedSignals.noEmergencyFund);

  return {
    triggered,
    unstableIncome,
    housingFeelsHeavy,
    debtFeelsHeavy,
    limitedMonthlyMargin,
    variableIncomeWithLowBuffer,
  };
}

export function evaluateCondition(
  condition: QuestionCondition,
  responses: Record<string, any>
): boolean {
  if (condition.operator === 'custom') {
    return condition.fn ? condition.fn(responses) : true;
  }

  const responseValue = condition.key ? responses[condition.key] : undefined;

  switch (condition.operator) {
    case 'equals':
      return responseValue === condition.value;
    case 'not_equals':
      return responseValue !== condition.value;
    case 'in':
      return Array.isArray(condition.value) && condition.value.includes(responseValue);
    case 'not_in':
      return Array.isArray(condition.value) && !condition.value.includes(responseValue);
    case 'includes':
      return Array.isArray(responseValue) && responseValue.includes(condition.value);
    case 'not_includes':
      return Array.isArray(responseValue) && !responseValue.includes(condition.value);
    default:
      return true;
  }
}

export function evaluateAllConditions(
  conditions: QuestionCondition[] = [],
  responses: Record<string, any>
): boolean {
  if (!conditions.length) return true;
  return conditions.every((c) => evaluateCondition(c, responses));
}

export function getVisibleQuestions(
  questions: Question[],
  responses: Record<string, any>
): Question[] {
  const route = deriveAssessmentRoute(responses);

  return questions.filter((q) => {
    const base = evaluateAllConditions(q.conditions || [], responses);
    if (!base) return false;

    const stageAllowed =
      !q.stage ||
      q.stage.includes('all') ||
      q.stage.includes(route.stage);

    const askIfAllowed = q.askIf ? q.askIf(responses, route) : true;

    if (!stageAllowed || !askIfAllowed) return false;

    switch (q.key) {
      case 'monthlyChildcareCost':
      case 'childcarePressure':
      case 'lifeInsurance':
        return route.hasDependents;

      case 'mortgageBalance':
      case 'homeValue':
      case 'mortgagePayment':
      case 'mortgageImpact':
        return route.hasMortgage;

      case 'carLoanBalance':
        return responses.vehicleDebt === 'car_loan';

      case 'leasePayment':
        return responses.vehicleDebt === 'car_lease';

      case 'monthlyDebtPayments':
      case 'debtManageability':
      case 'debtPaydownStrategy':
      case 'creditCardBehavior':
        return route.hasConsumerDebt;

      case 'employerMatch':
        return route.needsRetirementFocus || route.hasInvestments;

      case 'investmentAccounts':
      case 'investmentConfidence':
      case 'totalInvestments':
        return route.hasInvestments;

      default:
        return true;
    }
  });
}


export function sanitizeResponses(
  questions: Question[],
  responses: Record<string, any>
): Record<string, any> {
  const visibleKeys = new Set(getVisibleQuestions(questions, responses).map((q) => q.key));
  return Object.fromEntries(
    Object.entries(responses).filter(([key]) => visibleKeys.has(key))
  );
}

// =====================================================
// QUESTION MAP
// =====================================================

export const DETAILED_ASSESSMENT_QUESTIONS: Question[] = [
  // CONTEXT
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
  },
  {
    key: 'dependents',
    question: 'Does anyone depend on your income?',
    type: 'single',
    section: 'protection',
    required: false,
    conditions: [{ operator: 'custom', fn: () => false }],
    options: [
      { value: 'no', label: 'No' },
      { value: 'yes', label: 'Yes' },
    ],
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
  },
  {
    key: 'incomeSources',
    question: 'How many income sources do you have?',
    type: 'single',
    section: 'income',
    required: true,
    options: [
      { value: 'one', label: 'One' },
      { value: 'two', label: 'Two' },
      { value: 'three_or_more', label: 'Three or more' },
    ],
  },
  {
    key: 'incomeGrowth',
    question: 'How has your income changed over the last year?',
    type: 'single',
    section: 'income',
    required: true,
    options: [
      { value: 'increased_significantly', label: 'Increased significantly' },
      { value: 'increased_moderately', label: 'Increased moderately' },
      { value: 'stable', label: 'Stayed about the same' },
      { value: 'decreased', label: 'Decreased' },
    ],
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
  },

  // SPENDING / FIXED COSTS
  {
    key: 'monthlyHousingCost',
    question: 'What is your monthly housing cost right now?',
    type: 'number',
    section: 'spending',
    required: true,
    placeholder: 'e.g. 1400',
    helperText: 'If you rent, use your monthly rent. If you own, use your monthly mortgage or house payment.',
  },
  {
    key: 'monthlyUtilities',
    question: 'About how much do you spend on utilities each month?',
    type: 'number',
    section: 'spending',
    required: true,
    placeholder: 'e.g. 250',
    helperText: 'Include utilities like electric, gas, water, trash, and internet if possible.',
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
  },
  {
    key: 'monthlyChildcareCost',
    question: 'About how much do you spend on childcare each month?',
    type: 'number',
    section: 'spending',
    required: true,
    placeholder: 'e.g. 600',
    conditions: [{ key: 'relationshipStatus', operator: 'in', value: ['single_with_dependents', 'partnered_with_dependents'] }],
  },
  {
    key: 'childcarePressure',
    question: 'How much pressure does childcare cost put on your monthly budget?',
    type: 'single',
    section: 'spending',
    required: true,
    conditions: [{ key: 'relationshipStatus', operator: 'in', value: ['single_with_dependents', 'partnered_with_dependents'] }],
    options: [
      { value: 'none', label: 'Very little' },
      { value: 'some', label: 'Some' },
      { value: 'meaningful', label: 'Meaningful' },
      { value: 'heavy', label: 'Heavy' },
      { value: 'very_heavy', label: 'Very heavy' },
    ],
  },
  {
    key: 'spendingAwareness',
    question: 'How well do you understand where your money goes?',
    type: 'single',
    section: 'spending',
    required: true,
    options: [
      { value: 'track_everything', label: 'I track everything' },
      { value: 'good_general_idea', label: 'I have a good general idea' },
      { value: 'not_really_sure', label: 'I am not really sure' },
      { value: 'no_idea', label: 'I have no idea' },
    ],
  },
  {
    key: 'spendingTracking',
    question: 'Do you actively track your spending?',
    type: 'single',
    section: 'spending',
    required: true,
    options: [
      { value: 'yes_consistently', label: 'Yes, consistently' },
      { value: 'occasionally', label: 'Occasionally' },
      { value: 'no', label: 'No' },
    ],
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
  },
  {
    key: 'moneyLeaks',
    question: 'Do you think you have money leaks like subscriptions, impulse spending, or frequent convenience purchases?',
    type: 'single',
    section: 'spending',
    required: true,
    options: [
      { value: 'none', label: 'No, not really' },
      { value: 'a_few', label: 'A few' },
      { value: 'several', label: 'Several' },
      { value: 'a_lot', label: 'A lot' },
    ],
  },
  {
    key: 'lifestyleInflation',
    question: 'When your income goes up, what usually happens?',
    type: 'single',
    section: 'spending',
    required: true,
    options: [
      { value: 'save_or_invest_most', label: 'I save or invest most of it' },
      { value: 'split_it', label: 'I split it between lifestyle and savings' },
      { value: 'spend_most', label: 'I usually spend most of it' },
    ],
  },
  {
    key: 'threeMonthReview',
    question: 'Have you done a 3-month spending review recently?',
    helperText:
      'This means reviewing the last 3 months of bank and card transactions to see exactly where your money is going.',
    type: 'single',
    section: 'spending',
    required: true,
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },

  // SAVING
  {
    key: 'totalLiquidSavings',
    question:
      'How much do you have in total liquid savings across checking, savings, and high-yield savings?',
    type: 'single',
    section: 'saving',
    required: true,
    options: [
      { value: '100000_plus', label: '$100,000+' },
      { value: '50000_100000', label: '$50,000-$100,000' },
      { value: '30000_50000', label: '$30,000-$50,000' },
      { value: '15000_30000', label: '$15,000-$30,000' },
      { value: '5000_15000', label: '$5,000-$15,000' },
      { value: '1000_5000', label: '$1,000-$5,000' },
      { value: 'under_1000', label: 'Under $1,000' },
    ],
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
  },
  {
    key: 'savingsConfidence',
    question: 'How confident are you in your savings position?',
    type: 'single',
    section: 'saving',
    required: true,
    options: [
      { value: 'very_confident', label: 'Very confident' },
      { value: 'somewhat_confident', label: 'Somewhat confident' },
      { value: 'not_confident', label: 'Not confident' },
    ],
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
  },
  {
    key: 'carLoanBalance',
    question: 'What is your approximate car loan balance?',
    type: 'single',
    section: 'debt',
    options: [
      { value: 'under_5000', label: 'Under $5,000' },
      { value: '5000_15000', label: '$5,000-$15,000' },
      { value: '15000_30000', label: '$15,000-$30,000' },
      { value: '30000_plus', label: '$30,000+' },
    ],
    conditions: [{ key: 'vehicleDebt', operator: 'equals', value: 'car_loan' }],
  },
  {
    key: 'leasePayment',
    question: 'What is your approximate monthly lease payment?',
    type: 'single',
    section: 'debt',
    options: [
      { value: 'under_250', label: 'Under $250' },
      { value: '250_500', label: '$250-$500' },
      { value: '500_750', label: '$500-$750' },
      { value: '750_plus', label: '$750+' },
    ],
    conditions: [{ key: 'vehicleDebt', operator: 'equals', value: 'car_lease' }],
  },
  {
    key: 'housingDebt',
    question: 'Do you currently have a mortgage?',
    type: 'single',
    section: 'debt',
    required: true,
    conditions: [{ key: 'housingStatus', operator: 'equals', value: 'own_with_mortgage' }],
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    key: 'mortgageBalance',
    question: 'What is your approximate remaining mortgage balance?',
    type: 'number',
    section: 'debt',
    required: true,
    placeholder: 'e.g. 182000',
    conditions: [{ key: 'housingDebt', operator: 'equals', value: 'yes' }],
  },
  {
    key: 'homeValue',
    question: 'What is your home’s approximate current Zillow value?',
    type: 'number',
    section: 'debt',
    required: true,
    placeholder: 'e.g. 315000',
    helperText: 'An estimate is fine.',
    conditions: [{ key: 'housingDebt', operator: 'equals', value: 'yes' }],
  },
  {
    key: 'mortgagePayment',
    question: 'What is your approximate monthly mortgage payment?',
    type: 'number',
    section: 'debt',
    required: true,
    placeholder: 'e.g. 1650',
    helperText: 'Include principal, interest, taxes, and insurance if possible.',
    conditions: [{ operator: 'custom', fn: (responses) => responses.housingDebt === 'yes' && !responses.monthlyHousingCost }],
  },
  {
    key: 'mortgageImpact',
    question: 'How does your mortgage affect your overall financial progress right now?',
    type: 'single',
    section: 'debt',
    required: true,
    conditions: [{ key: 'housingDebt', operator: 'equals', value: 'yes' }],
    options: [
      { value: 'very_manageable', label: 'It feels very manageable' },
      { value: 'manageable_but_tight', label: 'It feels manageable, but I’d like more room' },
      { value: 'limits_a_little', label: 'It limits saving or investing a little' },
      { value: 'holds_me_back', label: 'It noticeably holds me back' },
      { value: 'major_pressure', label: 'It feels like a major source of pressure' },
    ],
  },
  {
    key: 'otherDebt',
    question: 'Do you have any other debt?',
    type: 'multiple',
    section: 'debt',
    required: true,
    options: [
      { value: 'none', label: 'No other debt' },
      { value: 'credit_cards', label: 'Credit cards' },
      { value: 'student_loans', label: 'Student loans' },
      { value: 'personal_loan', label: 'Personal loans' },
      { value: 'bnpl', label: 'Buy now, pay later' },
      { value: 'other', label: 'Other debt' },
    ],
  },
  {
    key: 'creditCardBehavior',
    question: 'How do you usually handle your credit card balances?',
    type: 'single',
    section: 'debt',
    options: [
      { value: 'pay_in_full', label: 'I pay in full every month' },
      { value: 'sometimes', label: 'Sometimes carry a balance' },
      { value: 'usually', label: 'Usually carry a balance' },
      { value: 'always_carry_balance', label: 'Always carry a balance' },
    ],
    conditions: [{ key: 'otherDebt', operator: 'includes', value: 'credit_cards' }],
  },
  {
    key: 'monthlyDebtPayments',
    question: 'About how much are your monthly non-mortgage debt payments total?',
    type: 'single',
    section: 'debt',
    required: true,
    conditions: [
      {
        operator: 'custom',
        fn: (responses) => {
          const vehicle = responses.vehicleDebt === 'car_loan' || responses.vehicleDebt === 'car_lease';
          const otherDebt = Array.isArray(responses.otherDebt) && !responses.otherDebt.includes('none');
          return vehicle || otherDebt;
        },
      },
    ],
    options: [
      { value: 'none', label: 'None' },
      { value: 'under_250', label: 'Under $250' },
      { value: '250_500', label: '$250-$500' },
      { value: '500_1000', label: '$500-$1,000' },
      { value: '1000_2000', label: '$1,000-$2,000' },
      { value: '2000_plus', label: '$2,000+' },
    ],
  },
  {
    key: 'debtManageability',
    question: 'How manageable does your debt feel right now?',
    type: 'single',
    section: 'debt',
    required: true,
    conditions: [
      {
        operator: 'custom',
        fn: (responses) => {
          const vehicle = responses.vehicleDebt === 'car_loan' || responses.vehicleDebt === 'car_lease';
          const otherDebt = Array.isArray(responses.otherDebt) && !responses.otherDebt.includes('none');
          return vehicle || otherDebt;
        },
      },
    ],
    options: [
      { value: 'very_manageable', label: 'Very manageable' },
      { value: 'comfortable', label: 'Comfortable' },
      { value: 'manageable', label: 'Manageable but not ideal' },
      { value: 'tight', label: 'Tight' },
      { value: 'struggling', label: 'Struggling' },
      { value: 'overwhelming', label: 'Overwhelming' },
    ],
  },
  {
    key: 'debtPaydownStrategy',
    question: 'Are you using any debt paydown strategy right now?',
    type: 'single',
    section: 'debt',
    conditions: [
      {
        operator: 'custom',
        fn: (responses) => {
          const vehicle = responses.vehicleDebt === 'car_loan' || responses.vehicleDebt === 'car_lease';
          const otherDebt = Array.isArray(responses.otherDebt) && !responses.otherDebt.includes('none');
          return vehicle || otherDebt;
        },
      },
    ],
    options: [
      { value: 'avalanche', label: 'Avalanche (highest interest first)' },
      { value: 'snowball', label: 'Snowball (smallest balance first)' },
      { value: 'general_extra', label: 'Paying extra where I can' },
      { value: 'minimums_only', label: 'Mostly minimums only' },
      { value: 'no_strategy', label: 'No real strategy' },
    ],
  },

  // PROTECTION
  {
    key: 'incomeInterruptionCoverage',
    question: 'If your income stopped tomorrow, how long could you cover essentials?',
    type: 'single',
    section: 'protection',
    required: true,
    options: [
      { value: '6_plus_months', label: '6+ months' },
      { value: '3_6_months', label: '3-6 months' },
      { value: '1_3_months', label: '1-3 months' },
      { value: 'under_1_month', label: 'Less than 1 month' },
      { value: 'not_sure', label: 'Not sure' },
      { value: 'none', label: 'No cushion' },
    ],
  },
  {
    key: 'healthInsurance',
    question: 'What best describes your health insurance coverage?',
    type: 'single',
    section: 'protection',
    required: true,
    options: [
      { value: 'employer', label: 'Employer-provided' },
      { value: 'private', label: 'Private plan' },
      { value: 'government', label: 'Government plan' },
      { value: 'through_spouse', label: 'Through spouse / partner' },
      { value: 'excellent', label: 'Excellent coverage' },
      { value: 'no_coverage', label: 'No coverage' },
      { value: 'none', label: 'None' },
    ],
  },
  {
    key: 'incomeProtection',
    question: 'How protected is your income if you could not work?',
    type: 'single',
    section: 'protection',
    required: false,
    conditions: [{ operator: 'custom', fn: () => false }],
    options: [
      { value: 'full_coverage', label: 'Full coverage' },
      { value: 'well_covered', label: 'Well covered' },
      { value: 'some_coverage', label: 'Some coverage' },
      { value: 'rely_on_savings', label: 'Mostly relying on savings' },
      { value: 'not_protected', label: 'Not protected' },
    ],
  },
  {
    key: 'lifeInsurance',
    question: 'Do you have enough life insurance for the people who depend on you?',
    type: 'single',
    section: 'protection',
    options: [
      { value: 'adequate', label: 'Yes, enough' },
      { value: 'some', label: 'Some, but probably not enough' },
      { value: 'none', label: 'No' },
      { value: 'fully_covered', label: 'Fully covered' },
    ],
    conditions: [{ key: 'relationshipStatus', operator: 'in', value: ['single_with_dependents', 'partnered_with_dependents'] }],
  },
  {
    key: 'propertyCoverage',
    question: 'How would you describe your property coverage (home/renters/etc.)?',
    type: 'single',
    section: 'protection',
    required: true,
    options: [
      { value: 'well_protected', label: 'Well protected' },
      { value: 'appropriate_coverage', label: 'Appropriate coverage' },
      { value: 'some_coverage', label: 'Some coverage' },
      { value: 'underinsured', label: 'Probably underinsured' },
      { value: 'no_coverage', label: 'No coverage' },
      { value: 'not_applicable', label: 'Not applicable' },
    ],
  },
  {
    key: 'autoCoverage',
    question: 'How would you describe your auto insurance?',
    type: 'single',
    section: 'protection',
    required: true,
    options: [
      { value: 'full', label: 'Full coverage' },
      { value: 'basic', label: 'Basic but reasonable' },
      { value: 'minimal', label: 'Minimal' },
      { value: 'minimum', label: 'State minimum only' },
      { value: 'do_not_drive', label: 'Do not drive / not applicable' },
    ],
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
  },
  {
    key: 'employerMatch',
    question: 'Does your employer offer a retirement match, and are you contributing enough to get it?',
    type: 'single',
    section: 'investing',
    required: true,
    options: [
      { value: 'maximizing_match', label: 'Yes, and I am getting the full match' },
      { value: 'have_match_not_maxing', label: 'Yes, but I am not getting the full match' },
      { value: 'have_match_not_contributing', label: 'Yes, but I am not contributing right now' },
      { value: 'no_match_or_no_access', label: 'No match or no workplace plan access' },
    ],
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
  },
  {
    key: 'totalInvestments',
    question: 'About how much do you have invested in total?',
    type: 'single',
    section: 'investing',
    required: true,
    conditions: [
      { key: 'investingStatus', operator: 'in', value: ['yes_consistently', 'yes_irregularly'] },
    ],
    options: [
      { value: '500000_plus', label: '$500,000+' },
      { value: '250000_500000', label: '$250,000-$500,000' },
      { value: '100000_250000', label: '$100,000-$250,000' },
      { value: '50000_100000', label: '$50,000-$100,000' },
      { value: '10000_50000', label: '$10,000-$50,000' },
      { value: '1000_10000', label: '$1,000-$10,000' },
      { value: 'under_1000', label: 'Under $1,000' },
    ],
  },

  // VISION
  {
    key: 'financialDirection',
    question: 'How clear is your overall financial direction?',
    type: 'single',
    section: 'vision',
    required: true,
    options: [
      { value: 'clear_plan', label: 'Very clear - I have a real plan' },
      { value: 'goals_no_plan', label: 'I have goals but no full plan' },
      { value: 'figuring_it_out', label: 'Still figuring it out' },
      { value: 'stuck', label: 'I feel stuck' },
      { value: 'somewhat_clear', label: 'Somewhat clear' },
      { value: 'no_goals', label: 'No real direction yet' },
    ],
  },
  {
    key: 'financialTimeHorizon',
    question: 'How far ahead do you typically think financially?',
    type: 'single',
    section: 'vision',
    required: true,
    options: [
      { value: 'short_term', label: 'Mostly short term' },
      { value: '5_10_years', label: '5–10 years' },
      { value: '10_20_years', label: '10–20 years' },
      { value: '20_plus_years', label: '20+ years' },
      { value: 'not_sure', label: 'Not sure' },
    ],
  },
  {
    key: 'primaryFinancialPriority',
    question: 'What is your main financial priority right now?',
    type: 'single',
    section: 'vision',
    required: true,
    options: [
      { value: 'get_out_of_debt', label: 'Get out of debt' },
      { value: 'build_savings', label: 'Build savings' },
      { value: 'grow_investing', label: 'Grow investing' },
      { value: 'increase_income', label: 'Increase income' },
      { value: 'maintain_optimize', label: 'Maintain and optimize' },
      { value: 'wealth_building', label: 'Build wealth' },
      { value: 'survival', label: 'Just get stable' },
      { value: 'reduce_debt', label: 'Reduce debt' },
    ],
  },
  {
    key: 'financialConfidence',
    question: 'How confident do you feel about your financial future?',
    type: 'single',
    section: 'vision',
    required: true,
    options: [
      { value: 'very_confident', label: 'Very confident' },
      { value: 'somewhat_confident', label: 'Somewhat confident' },
      { value: 'uncertain', label: 'Uncertain' },
      { value: 'not_confident', label: 'Not confident' },
    ],
  },
  {
    key: 'lifeGoal',
    question: 'Which outcome matters most to you?',
    type: 'single',
    section: 'vision',
    required: true,
    options: [
      { value: 'freedom_from_stress', label: 'Freedom from money stress' },
      { value: 'time_flexibility', label: 'More time flexibility' },
      { value: 'early_retirement', label: 'Early retirement' },
      { value: 'family_security', label: 'Family security' },
      { value: 'financial_freedom', label: 'Financial freedom' },
      { value: 'financial_stability', label: 'Financial stability' },
      { value: 'just_get_by', label: 'Just get by for now' },
      { value: 'not_sure_yet', label: 'Not sure yet' },
    ],
  },
];

export const FREE_ASSESSMENT_QUESTIONS = DETAILED_ASSESSMENT_QUESTIONS;

// =====================================================
// SIGNALS / REASONS
// =====================================================

export function deriveSignals(
  answers: Record<string, any>,
  mode: ScoringMode = 'detailed'
): UserSignals {
  const isSnapshot = mode === 'snapshot';
  const debts = safeArray(answers.otherDebt);
  const monthlyIncome = toNumber(answers.monthlyTakeHomeIncome);
  const obligation = calculateObligationPressure(answers);
  const hasHousingInputs = hasAnswer(answers, 'monthlyTakeHomeIncome') && hasAnswer(answers, 'monthlyHousingCost');
  const hasDebtPaymentInput = hasAnswer(answers, 'monthlyTakeHomeIncome') && hasAnswer(answers, 'monthlyDebtPayments');
  const housingRatio = hasHousingInputs && monthlyIncome > 0 ? obligation.housing / monthlyIncome : 0;
  const debtPaymentRatio = hasDebtPaymentInput && monthlyIncome > 0 ? obligation.debt / monthlyIncome : 0;
  const emergencyFundMonths = hasAnswer(answers, 'totalLiquidSavings') ? getEmergencyFundMonthsEstimate(answers) : 0;
  const hasEmergencyFundAnswer = hasAnswer(answers, 'totalLiquidSavings');
  const hasSavingConsistencyAnswer = hasAnswer(answers, 'savingConsistency') || hasAnswer(answers, 'savingsAutomation');
  const hasGoalClarityAnswer = hasAnswer(answers, 'financialDirection');
  const hasDebtStrategyAnswer = hasAnswer(answers, 'debtPaydownStrategy');
  const hasCreditBehaviorAnswer = hasAnswer(answers, 'creditCardBehavior');
  const hasDebtManageabilityAnswer = hasAnswer(answers, 'debtManageability') || hasAnswer(answers, 'mortgageImpact');

  const preliminary: UserSignals = {
    highHousingBurden: hasHousingInputs ? housingRatio >= 0.4 : false,
    highObligationPressure: hasHousingInputs ? obligation.ratio >= 0.55 : false,
    veryHighObligationPressure: hasHousingInputs ? obligation.ratio >= 0.7 : false,
    hasCreditCardDebt: debts.includes('credit_cards'),
    hasBnplDebt: debts.includes('bnpl'),
    hasPaydayDebt: debts.includes('payday') || debts.includes('rent_to_own'),
    hasPersonalLoanDebt: debts.includes('personal_loan'),
    hasStudentLoanDebt: debts.includes('student_loans'),
    hasVehicleDebt: hasVehicleDebt(answers),
    hasMortgage: hasMortgage(answers),
    hasNoDebtPlan:
      hasDebtStrategyAnswer &&
      (answers.debtPaydownStrategy === 'no_strategy' ||
        answers.debtPaydownStrategy === 'minimums_only'),
    minimumsOnly: hasDebtStrategyAnswer && answers.debtPaydownStrategy === 'minimums_only',
    lowEmergencyFund: hasEmergencyFundAnswer ? emergencyFundMonths < 3 : false,
    noEmergencyFund: hasEmergencyFundAnswer ? emergencyFundMonths < 1 : false,
    inconsistentSaving:
      hasSavingConsistencyAnswer &&
      (answers.savingConsistency === 'yes_irregularly' ||
        answers.savingConsistency === 'not_currently' ||
        answers.savingsAutomation === 'manual' ||
        answers.savingsAutomation === 'not_saving'),
    lowRetirementContribution:
      hasAnswer(answers, 'investingStatus') &&
      (answers.investingStatus !== 'yes_consistently' ||
        answers.employerMatch === 'have_match_not_contributing' ||
        answers.employerMatch === 'have_match_not_maxing'),
    noClearGoals:
      hasGoalClarityAnswer &&
      (answers.financialDirection === 'figuring_it_out' ||
        answers.financialDirection === 'goals_no_plan' ||
        answers.financialDirection === 'unclear' ||
        answers.financialDirection === 'very_unclear'),
    carriesCreditCardBalance:
      hasCreditBehaviorAnswer &&
      (answers.creditCardBehavior === 'sometimes' ||
        answers.creditCardBehavior === 'usually' ||
        answers.creditCardBehavior === 'always_carry_balance'),
    debtFeelsHeavy:
      hasDebtManageabilityAnswer &&
      (answers.debtManageability === 'tight' ||
        answers.debtManageability === 'struggling' ||
        answers.debtManageability === 'overwhelming' ||
        answers.mortgageImpact === 'holds_me_back' ||
        answers.mortgageImpact === 'major_pressure'),
    incomeConstraintTriggered: false,
    variableIncomeWithLowBuffer: false,
    limitedMonthlyMargin: false,
    housingRatio,
    obligationPressure: hasHousingInputs ? obligation.ratio : 0,
    debtPaymentRatio,
  };

  const incomeConstraint = determineIncomeConstraint(answers, preliminary);

  return {
    ...preliminary,
    incomeConstraintTriggered: isSnapshot
      ? incomeConstraint.triggered &&
        (preliminary.highObligationPressure ||
          preliminary.veryHighObligationPressure ||
          preliminary.highHousingBurden)
      : incomeConstraint.triggered,
    variableIncomeWithLowBuffer: incomeConstraint.variableIncomeWithLowBuffer,
    limitedMonthlyMargin: incomeConstraint.limitedMonthlyMargin,
  };
}


function dedupeReasons(reasons: string[]): string[] {
  return Array.from(new Set(reasons));
}

export function getPillarReasons(
  answers: Record<string, any>,
  signals: UserSignals,
  mode: ScoringMode = 'detailed'
): PillarReasons {
  const isSnapshot = mode === 'snapshot';
  const reasons: PillarReasons = {
    income: [],
    spending: [],
    saving: [],
    investing: [],
    debt: [],
    protection: [],
    vision: [],
  };

  if (signals.highHousingBurden) {
    reasons.debt.push('High housing burden relative to income');
    reasons.spending.push('A large share of income is already going toward housing');
  }

  if (signals.highObligationPressure) {
    reasons.debt.push('Monthly obligations are putting pressure on cash flow');
    reasons.spending.push('Limited monthly breathing room is making progress harder');
  }

  if (signals.hasCreditCardDebt) reasons.debt.push('Credit card debt present');
  if (signals.hasBnplDebt) reasons.debt.push('BNPL debt present');
  if (signals.hasPaydayDebt) reasons.debt.push('High-cost short-term debt present');
  if (!isSnapshot && signals.carriesCreditCardBalance) reasons.debt.push('You are carrying credit card balances month to month');
  if (signals.hasNoDebtPlan) reasons.debt.push('No clear payoff strategy selected');
  if (signals.minimumsOnly) reasons.debt.push('Mostly making minimum payments');
  if (signals.debtFeelsHeavy) reasons.debt.push('Your debt load currently feels tight or overwhelming');

  if (!isSnapshot && answers.threeMonthReview === 'no') reasons.spending.push('No recent 3-month spending review completed');
  if (!isSnapshot && answers.spendingTracking === 'no') reasons.spending.push('You are not actively tracking spending right now');
  if (answers.moneyLeaks === 'several' || answers.moneyLeaks === 'a_lot') reasons.spending.push('Money leaks are likely reducing flexibility');

  if (signals.lowEmergencyFund) reasons.saving.push('Emergency fund is below a healthy cushion');
  if (signals.noEmergencyFund) reasons.saving.push('No real emergency buffer is in place');
  if (signals.inconsistentSaving) reasons.saving.push('Saving habits are not consistent yet');

  if (signals.lowRetirementContribution) reasons.investing.push('Retirement investing is not as consistent as it could be');
  if (answers.investingStatus === 'not_yet') reasons.investing.push('Long-term investing habit has not started yet');
  if (answers.employerMatch === 'have_match_not_contributing' || answers.employerMatch === 'have_match_not_maxing') {
    reasons.investing.push('You may be leaving employer match dollars on the table');
  }

  if (answers.incomeConsistency === 'variable' || answers.incomeConsistency === 'highly_unpredictable') {
    reasons.income.push('Income consistency is creating uncertainty');
  }
  if (!isSnapshot && answers.incomeGrowth === 'decreased') reasons.income.push('Income has declined over the last year');
  if (answers.incomeGrowthPotential === 'limited' || answers.incomeGrowthPotential === 'none') {
    reasons.income.push('Income growth potential appears limited right now');
  }

  if (['no_coverage', 'none', 'limited_coverage'].includes(answers.healthInsurance)) {
    reasons.protection.push('Health coverage gap or limitation present');
  }
  if (!isSnapshot && hasDependents(answers) && ['none', 'some'].includes(answers.lifeInsurance)) {
    reasons.protection.push('Life insurance may not fully protect dependents');
  }

  if (signals.noClearGoals) reasons.vision.push('Financial direction is not very clear yet');
  if (['uncertain', 'overwhelmed', 'not_confident'].includes(answers.financialConfidence)) {
    reasons.vision.push('Financial direction still feels uncertain');
  }

  (Object.keys(reasons) as PillarKey[]).forEach((key) => {
    reasons[key] = dedupeReasons(reasons[key]).slice(0, 3);
  });

  return reasons;
}

// =====================================================
// METRICS
// =====================================================

function homeEquityEstimate(a: Record<string, any>): number {
  if (!hasMortgage(a)) return 0;
  return Math.max(0, toNumber(a.homeValue) - toNumber(a.mortgageBalance));
}

function debtPaymentEstimate(a: Record<string, any>): number {
  const map: Record<string, number> = {
    none: 0,
    under_250: 125,
    '250_500': 375,
    '500_1000': 750,
    '1000_2000': 1500,
    '2000_plus': 2500,
  };

  return midpointRangeMap(map, a.monthlyDebtPayments);
}

export function calculateAllFinancialMetrics(answers: Record<string, any>): FinancialMetrics {
  const savingsMap: Record<string, number> = {
    '100000_plus': 100000,
    '50000_100000': 75000,
    '30000_50000': 40000,
    '15000_30000': 22500,
    '5000_15000': 10000,
    '1000_5000': 3000,
    'under_1000': 500,
  };

  const investmentMap: Record<string, number> = {
    '500000_plus': 500000,
    '250000_500000': 375000,
    '100000_250000': 175000,
    '50000_100000': 75000,
    '10000_50000': 30000,
    '1000_10000': 5000,
    'under_1000': 500,
  };

  const monthlyIncome = toNumber(answers.monthlyTakeHomeIncome);
  const monthlyDebtPayments = debtPaymentEstimate(answers);
  const monthlyHousingCost = toNumber(answers.monthlyHousingCost);
  const monthlyUtilities = toNumber(answers.monthlyUtilities);
  const monthlyChildcareCost = toNumber(answers.monthlyChildcareCost);
  const monthlyFixedCosts = monthlyHousingCost + monthlyUtilities + monthlyChildcareCost + monthlyDebtPayments;
  const totalSavings = midpointRangeMap(savingsMap, answers.totalLiquidSavings);
  const totalInvestments = midpointRangeMap(investmentMap, answers.totalInvestments);
  const homeEquity = homeEquityEstimate(answers);

  const debtToIncomeRatio =
    monthlyIncome > 0 ? Number(((monthlyDebtPayments / monthlyIncome) * 100).toFixed(1)) : undefined;

  const fixedCostPressureRatio =
    monthlyIncome > 0 ? Number(((monthlyFixedCosts / monthlyIncome) * 100).toFixed(1)) : undefined;

  let savingsRate: number | undefined;
  if (monthlyIncome > 0) {
    if (answers.savingConsistency === 'yes_consistently') savingsRate = 12;
    else if (answers.savingConsistency === 'yes_irregularly') savingsRate = 5;
    else savingsRate = 0;
  }

  return {
    debtToIncomeRatio,
    fixedCostPressureRatio,
    savingsRate,
    netWorth: totalSavings + totalInvestments + homeEquity,
    homeEquity,
    totalSavings,
    totalInvestments,
    monthlyIncome,
    monthlyDebtPayments,
    monthlyHousingCost,
    monthlyUtilities,
    monthlyChildcareCost,
    monthlyFixedCosts,
  };
}

// =====================================================
// SCORING
// =====================================================

function scoreIncome(a: Record<string, any>, signals?: UserSignals) {
  const derivedSignals = signals ?? deriveSignals(a);
  let s = 0;
  const income = toNumber(a.monthlyTakeHomeIncome);

  if (income >= 8000) s += 30;
  else if (income >= 6000) s += 25;
  else if (income >= 4000) s += 20;
  else if (income >= 2500) s += 12;
  else if (income > 0) s += 5;

  switch (a.incomeConsistency) {
    case 'very_consistent':
      s += 25;
      break;
    case 'mostly_consistent':
      s += 18;
      break;
    case 'variable':
      s += 10;
      break;
    case 'highly_unpredictable':
      s += 3;
      break;
  }

  switch (a.incomeSources) {
    case 'three_or_more':
      s += 15;
      break;
    case 'two':
      s += 10;
      break;
    case 'one':
      s += 5;
      break;
  }

  switch (a.incomeGrowth) {
    case 'increased_significantly':
      s += 15;
      break;
    case 'increased_moderately':
      s += 10;
      break;
    case 'stable':
      s += 7;
      break;
    case 'decreased':
      s += 2;
      break;
  }

  switch (a.incomeGrowthPotential) {
    case 'high':
      s += 15;
      break;
    case 'moderate':
      s += 10;
      break;
    case 'limited':
      s += 5;
      break;
  }

  if (derivedSignals.variableIncomeWithLowBuffer) s -= 10;
  if (derivedSignals.incomeConstraintTriggered) s -= 8;
  if (derivedSignals.limitedMonthlyMargin) s -= 5;

  return clamp(Math.round(s));
}

function scoreSpending(
  a: Record<string, any>,
  signals?: UserSignals,
  mode: ScoringMode = 'detailed'
) {
  const derivedSignals = signals ?? deriveSignals(a);

  if (mode === 'snapshot') {
    let s = 50;

    switch (a.housingPressure) {
      case 'very_manageable':
        s += 15;
        break;
      case 'manageable':
        s += 10;
        break;
      case 'a_bit_tight':
        s += 2;
        break;
      case 'tight':
        s -= 10;
        break;
      case 'stressful':
        s -= 20;
        break;
    }

    if (a.overspendingFrequency === 'rarely') s += 15;
    else if (a.overspendingFrequency === 'sometimes') s += 5;
    else if (a.overspendingFrequency === 'often') s -= 10;
    else if (a.overspendingFrequency === 'almost_always') s -= 20;

    if (a.moneyLeaks === 'none') s += 10;
    else if (a.moneyLeaks === 'a_few') s += 5;
    else if (a.moneyLeaks === 'several') s -= 5;
    else if (a.moneyLeaks === 'a_lot') s -= 15;

    if (derivedSignals.highHousingBurden) s -= 8;
    if (derivedSignals.highObligationPressure) s -= 8;
    if (derivedSignals.veryHighObligationPressure) s -= 6;

    return clamp(Math.round(s));
  }

  let s = 0;
  const income = toNumber(a.monthlyTakeHomeIncome);
  const fixedCosts =
    toNumber(a.monthlyHousingCost) +
    toNumber(a.monthlyUtilities) +
    toNumber(a.monthlyChildcareCost) +
    debtPaymentEstimate(a);

  if (a.spendingAwareness === 'track_everything') s += 24;
  else if (a.spendingAwareness === 'good_general_idea') s += 18;
  else if (a.spendingAwareness === 'not_really_sure') s += 9;

  if (a.spendingTracking === 'yes_consistently') s += 16;
  else if (a.spendingTracking === 'occasionally') s += 8;

  if (a.overspendingFrequency === 'rarely') s += 16;
  else if (a.overspendingFrequency === 'sometimes') s += 10;
  else if (a.overspendingFrequency === 'often') s += 4;

  if (a.moneyLeaks === 'none') s += 10;
  else if (a.moneyLeaks === 'a_few') s += 7;
  else if (a.moneyLeaks === 'several') s += 3;

  if (a.lifestyleInflation === 'save_or_invest_most') s += 8;
  else if (a.lifestyleInflation === 'split_it') s += 4;

  if (a.threeMonthReview === 'yes') s += 6;

  switch (a.housingPressure) {
    case 'very_manageable':
      s += 10;
      break;
    case 'manageable':
      s += 6;
      break;
    case 'a_bit_tight':
      s += 1;
      break;
    case 'tight':
      s -= 6;
      break;
    case 'stressful':
      s -= 12;
      break;
  }

  if (income > 0) {
    const fixedCostRatio = fixedCosts / income;
    if (fixedCostRatio <= 0.35) s += 10;
    else if (fixedCostRatio <= 0.5) s += 4;
    else if (fixedCostRatio <= 0.65) s -= 5;
    else s -= 12;
  }

  if (derivedSignals.highHousingBurden) s -= 8;
  if (derivedSignals.highObligationPressure) s -= 8;
  if (derivedSignals.veryHighObligationPressure) s -= 6;

  return clamp(Math.round(s));
}

function scoreSaving(
  a: Record<string, any>,
  signals?: UserSignals,
  mode: ScoringMode = 'detailed'
) {
  const derivedSignals = signals ?? deriveSignals(a);

  if (mode === 'snapshot') {
    let s = 50;
    const months = getEmergencyFundMonthsEstimate(a);

    if (months >= 6) s += 20;
    else if (months >= 3) s += 12;
    else if (months >= 1) s += 5;
    else if (months === 0) s -= 10;

    switch (a.emergencyAccess) {
      case 'all':
        s += 10;
        break;
      case 'most':
        s += 6;
        break;
      case 'some':
        s += 1;
        break;
      case 'very_little':
        s -= 8;
        break;
    }

    switch (a.savingConsistency) {
      case 'yes_consistently':
        s += 20;
        break;
      case 'yes_irregularly':
        s += 8;
        break;
      case 'not_currently':
        s -= 15;
        break;
    }

    if (derivedSignals.noEmergencyFund) s -= 6;
    else if (derivedSignals.lowEmergencyFund) s -= 3;

    return clamp(Math.round(s));
  }

  let s = 0;

  const months = getEmergencyFundMonthsEstimate(a);
  if (months >= 6) s += 35;
  else if (months >= 3) s += 25;
  else if (months >= 1) s += 15;
  else if (months > 0) s += 8;

  if (a.emergencyAccess === 'all') s += 12;
  else if (a.emergencyAccess === 'most') s += 8;
  else if (a.emergencyAccess === 'some') s += 4;

  if (a.savingConsistency === 'yes_consistently') s += 18;
  else if (a.savingConsistency === 'yes_irregularly') s += 10;

  if (a.savingsAutomation === 'fully_automated') s += 12;
  else if (a.savingsAutomation === 'partially_automated') s += 8;
  else if (a.savingsAutomation === 'manual') s += 3;

  if (a.savingsConfidence === 'very_confident') s += 8;
  else if (a.savingsConfidence === 'somewhat_confident') s += 4;

  if (derivedSignals.noEmergencyFund) s -= 15;
  else if (derivedSignals.lowEmergencyFund) s -= 8;

  if (derivedSignals.inconsistentSaving) s -= 10;
  if (derivedSignals.variableIncomeWithLowBuffer) s -= 8;

  return clamp(Math.round(s));
}

function scoreDebt(a: Record<string, any>, signals?: UserSignals) {
  const derivedSignals = signals ?? deriveSignals(a);
  let s = 100;

  const manageabilityPenaltyMap: Record<string, number> = {
    very_manageable: 0,
    comfortable: 2,
    manageable: 6,
    tight: 14,
    struggling: 22,
    overwhelming: 30,
  };

  const mortgageImpactPenaltyMap: Record<string, number> = {
    very_manageable: 0,
    manageable_but_tight: 2,
    limits_a_little: 5,
    holds_me_back: 10,
    major_pressure: 16,
  };

  if (derivedSignals.obligationPressure >= 0.85) s -= 28;
  else if (derivedSignals.obligationPressure >= 0.7) s -= 20;
  else if (derivedSignals.obligationPressure >= 0.55) s -= 12;
  else if (derivedSignals.obligationPressure >= 0.4) s -= 6;

  if (derivedSignals.housingRatio >= 0.5) s -= 12;
  else if (derivedSignals.housingRatio >= 0.4) s -= 8;
  else if (derivedSignals.housingRatio >= 0.3) s -= 4;

  if (derivedSignals.hasCreditCardDebt) s -= 12;
  if (derivedSignals.hasBnplDebt) s -= 8;
  if (derivedSignals.hasPaydayDebt) s -= 20;
  if (derivedSignals.hasPersonalLoanDebt) s -= 8;
  if (derivedSignals.hasVehicleDebt) s -= 4;
  if (derivedSignals.hasStudentLoanDebt) s -= 3;
  if (derivedSignals.hasMortgage) s -= 1;

  if (derivedSignals.hasCreditCardDebt && derivedSignals.hasBnplDebt) s -= 8;
  if (derivedSignals.carriesCreditCardBalance) s -= 10;

  if (derivedSignals.debtPaymentRatio >= 0.25) s -= 16;
  else if (derivedSignals.debtPaymentRatio >= 0.15) s -= 10;
  else if (derivedSignals.debtPaymentRatio >= 0.08) s -= 5;

  s -= manageabilityPenaltyMap[a.debtManageability] ?? 0;
  s -= mortgageImpactPenaltyMap[a.mortgageImpact] ?? 0;

  if (a.debtPaydownStrategy === 'minimums_only') s -= 12;
  else if (a.debtPaydownStrategy === 'no_strategy') s -= 16;
  else if (a.debtPaydownStrategy === 'general_extra') s -= 4;

  if ((derivedSignals.hasCreditCardDebt || derivedSignals.hasBnplDebt || derivedSignals.hasPaydayDebt) && derivedSignals.noEmergencyFund) {
    s -= 10;
  } else if ((derivedSignals.hasCreditCardDebt || derivedSignals.hasBnplDebt || derivedSignals.hasPaydayDebt) && derivedSignals.lowEmergencyFund) {
    s -= 6;
  }

  if (
    !derivedSignals.hasCreditCardDebt &&
    !derivedSignals.hasBnplDebt &&
    !derivedSignals.hasPaydayDebt &&
    derivedSignals.debtPaymentRatio < 0.1 &&
    derivedSignals.obligationPressure < 0.45
  ) {
    s += 4;
  }

  return clamp(Math.round(s));
}

function calculateObligationPressure(a: Record<string, any>) {
  const income = toNumber(a.monthlyTakeHomeIncome);
  const housing = toNumber(a.monthlyHousingCost);
  const utilities = toNumber(a.monthlyUtilities);
  const childcare = toNumber(a.monthlyChildcareCost);
  const debt = debtPaymentEstimate(a);

  const totalObligations = housing + utilities + childcare + debt;
  const ratio = income > 0 ? totalObligations / income : 0;

  return {
    income,
    housing,
    utilities,
    childcare,
    debt,
    totalObligations,
    ratio,
  };
}


function scoreProtection(a: Record<string, any>, mode: ScoringMode = 'detailed') {
  if (mode === 'snapshot') {
    let s = 50;

    switch (a.healthInsurance) {
      case 'good_coverage':
      case 'excellent':
      case 'employer':
      case 'private':
      case 'government':
      case 'through_spouse':
        s += 20;
        break;
      case 'basic_coverage':
        s += 10;
        break;
      case 'limited_coverage':
        s -= 8;
        break;
      case 'none':
      case 'no_coverage':
        s -= 22;
        break;
    }

    switch (a.emergencyAccess) {
      case 'all':
        s += 15;
        break;
      case 'most':
        s += 10;
        break;
      case 'some':
        s += 4;
        break;
      case 'very_little':
        s -= 8;
        break;
    }

    if (hasAnswer(a, 'totalLiquidSavings')) {
      const months = getEmergencyFundMonthsEstimate(a);
      if (months >= 6) s += 12;
      else if (months >= 3) s += 8;
      else if (months >= 1) s += 2;
      else s -= 10;
    }

    return clamp(Math.round(s));
  }

  let s = 0;

  switch (a.incomeInterruptionCoverage) {
    case '6_plus_months':
      s += 25;
      break;
    case '3_6_months':
      s += 18;
      break;
    case '1_3_months':
      s += 10;
      break;
    case 'under_1_month':
      s += 4;
      break;
  }

  if (['employer', 'private', 'government', 'through_spouse', 'excellent', 'good_coverage', 'basic_coverage'].includes(a.healthInsurance)) {
    s += a.healthInsurance === 'basic_coverage' ? 10 : 15;
  }

  if (['6_plus_months', '3_6_months'].includes(a.incomeInterruptionCoverage)) {
    s += 10;
  } else if (a.incomeInterruptionCoverage === '1_3_months') {
    s += 5;
  }

  switch (a.propertyCoverage) {
    case 'well_protected':
      s += 15;
      break;
    case 'appropriate_coverage':
      s += 12;
      break;
    case 'some_coverage':
      s += 7;
      break;
    case 'underinsured':
      s += 2;
      break;
    case 'not_applicable':
      s += 10;
      break;
  }

  switch (a.autoCoverage) {
    case 'full':
      s += 15;
      break;
    case 'basic':
      s += 10;
      break;
    case 'minimal':
      s += 4;
      break;
    case 'minimum':
      s += 2;
      break;
    case 'do_not_drive':
      s += 10;
      break;
  }

  if (hasDependents(a)) {
    if (['adequate', 'fully_covered'].includes(a.lifeInsurance)) s += 10;
    else if (a.lifeInsurance === 'some') s += 5;
  } else {
    s += 10;
  }

  return clamp(Math.round(s));
}

function scoreInvesting(
  a: Record<string, any>,
  signals?: UserSignals,
  mode: ScoringMode = 'detailed'
) {
  const derivedSignals = signals ?? deriveSignals(a);

  if (mode === 'snapshot') {
    let s = 45;

    switch (a.investingStatus) {
      case 'yes_consistently':
        s += 25;
        break;
      case 'yes_irregularly':
        s += 12;
        break;
      case 'not_yet':
        s -= 8;
        break;
    }

    switch (a.employerMatch) {
      case 'maximizing_match':
        s += 12;
        break;
      case 'have_match_not_maxing':
        s += 7;
        break;
      case 'no_match':
      case 'not_sure':
      case 'not_applicable':
        break;
    }

    if (derivedSignals.incomeConstraintTriggered && a.investingStatus === 'not_yet') {
      s -= 4;
    }

    return clamp(Math.round(s));
  }

  let s = 0;

  if (a.investingStatus === 'yes_consistently') s += 30;
  else if (a.investingStatus === 'yes_irregularly') s += 18;

  if (a.employerMatch === 'maximizing_match') s += 20;
  else if (a.employerMatch === 'have_match_not_maxing') s += 10;

  const acc = a.investmentAccounts || [];
  if (Array.isArray(acc)) {
    if (acc.includes('401k')) s += 10;
    if (acc.includes('roth_ira')) s += 10;
    if (acc.includes('traditional_ira')) s += 5;
    if (acc.includes('brokerage')) s += 5;
    if (acc.includes('hsa')) s += 5;
  }

  const investmentMap: Record<string, number> = {
    '500000_plus': 20,
    '250000_500000': 16,
    '100000_250000': 12,
    '50000_100000': 8,
    '10000_50000': 5,
    '1000_10000': 2,
    'under_1000': 1,
  };

  s += investmentMap[a.totalInvestments] || 0;

  if (a.investmentConfidence === 'very_confident') s += 5;
  else if (a.investmentConfidence === 'somewhat_confident') s += 3;

  if (derivedSignals.lowRetirementContribution) s -= 8;
  if (derivedSignals.incomeConstraintTriggered && a.investingStatus === 'not_yet') s -= 4;

  return clamp(Math.round(s));
}

function scoreVision(a: Record<string, any>, mode: ScoringMode = 'detailed') {
  if (mode === 'snapshot') {
    let s = 50;

    switch (a.financialDirection) {
      case 'very_clear':
      case 'clear_plan':
        s += 20;
        break;
      case 'fairly_clear':
      case 'goals_no_plan':
      case 'somewhat_clear':
        s += 10;
        break;
      case 'unclear':
      case 'figuring_it_out':
        s -= 8;
        break;
      case 'very_unclear':
        s -= 15;
        break;
    }

    switch (a.financialConfidence) {
      case 'very_confident':
        s += 12;
        break;
      case 'somewhat_confident':
        s += 6;
        break;
      case 'not_confident':
        s -= 6;
        break;
      case 'overwhelmed':
        s -= 12;
        break;
      case 'uncertain':
        s -= 4;
        break;
    }

    if (hasAnswer(a, 'primaryFinancialPriority')) {
      s += 5;
    }

    return clamp(Math.round(s));
  }

  let s = 0;

  if (a.financialDirection === 'clear_plan') s += 30;
  else if (a.financialDirection === 'goals_no_plan') s += 18;
  else if (a.financialDirection === 'somewhat_clear') s += 15;
  else if (a.financialDirection === 'figuring_it_out') s += 10;

  if (['5_10_years', '10_20_years', '20_plus_years'].includes(a.financialTimeHorizon)) s += 20;
  else if (a.financialTimeHorizon === 'short_term') s += 6;

  if (a.financialConfidence === 'very_confident') s += 20;
  else if (a.financialConfidence === 'somewhat_confident') s += 12;
  else if (a.financialConfidence === 'uncertain') s += 5;

  if (['wealth_building', 'maintain_optimize', 'grow_investing', 'build_savings'].includes(a.primaryFinancialPriority)) {
    s += 10;
  } else if (['survival', 'get_out_of_debt', 'reduce_debt'].includes(a.primaryFinancialPriority)) {
    s += 4;
  }

  return clamp(Math.round(s));
}

export function calculateBuildingBlockScores(
  a: Record<string, any>,
  signals?: UserSignals,
  mode: ScoringMode = 'detailed'
) {
  const derivedSignals = signals ?? deriveSignals(a);

  return {
    income: scoreIncome(a, derivedSignals),
    spending: scoreSpending(a, derivedSignals, mode),
    saving: scoreSaving(a, derivedSignals, mode),
    debt: scoreDebt(a, derivedSignals),
    protection: scoreProtection(a, mode),
    investing: scoreInvesting(a, derivedSignals, mode),
    vision: scoreVision(a, mode),
  };
}
export function calculateEnhancedBuildingBlockScores(
  answers: Record<string, any>,
  signals?: UserSignals,
  mode: ScoringMode = 'detailed'
): Record<BuildingBlockKey, number> {
  return calculateBuildingBlockScores(answers, signals, mode);
}

export function calculatePillarScores(
  buildingBlockScores: Record<BuildingBlockKey, number>
): Record<PillarKey, number> {
  return {
    income: clamp(Math.round(buildingBlockScores.income)),
    spending: clamp(Math.round(buildingBlockScores.spending)),
    saving: clamp(Math.round(buildingBlockScores.saving)),
    investing: clamp(Math.round(buildingBlockScores.investing)),
    debt: clamp(Math.round(buildingBlockScores.debt)),
    protection: clamp(Math.round(buildingBlockScores.protection)),
    vision: clamp(Math.round(buildingBlockScores.vision)),
  };
}

export function calculateFoundationScore(pillars: Record<string, number>) {
  return Math.round(
    pillars.income * 0.15 +
      pillars.spending * 0.15 +
      pillars.saving * 0.2 +
      pillars.investing * 0.15 +
      pillars.debt * 0.15 +
      pillars.protection * 0.1 +
      pillars.vision * 0.1
  );
}

// =====================================================
// LIFE STAGE / LABELS
// =====================================================

export function determineLifeStage(input: {
  investingActivity?: boolean;
  pillars?: Record<PillarKey, number>;
  answers?: Record<string, any>;
}): LifeStage {
  const pillars = input.pillars;
  const answers = input.answers;
  const investingActivity = input.investingActivity ?? false;

  if (!pillars || !answers) {
    return investingActivity ? 'growth' : 'starting_out';
  }

  const hasStarterSavings = [
    '5000_15000',
    '15000_30000',
    '30000_50000',
    '50000_100000',
    '100000_plus',
  ].includes(answers.totalLiquidSavings);

  const debtHeavy =
    pillars.debt < 50 ||
    answers.debtManageability === 'struggling' ||
    answers.debtManageability === 'overwhelming';

  if (!hasStarterSavings || debtHeavy) return 'starting_out';
  if (hasStarterSavings && !investingActivity) return 'stability';
  if (investingActivity && pillars.vision >= 60 && pillars.saving >= 60) return 'growth';
  return 'catch_up';
}

export function getScoreBand(score: number): {
  label: string;
  color: string;
  bg: string;
  description: string;
} {
  if (score >= 80) {
    return {
      label: 'Strong Foundation',
      color: 'text-emerald-700',
      bg: 'bg-emerald-100',
      description: 'Your financial foundation is strong. You are now in refinement and optimization territory.',
    };
  }

  if (score >= 60) {
    return {
      label: 'Building Momentum',
      color: 'text-amber-700',
      bg: 'bg-amber-100',
      description: 'You have several good pieces in place, but a few weaker areas are still limiting full progress.',
    };
  }

  if (score >= 40) {
    return {
      label: 'Needs Attention',
      color: 'text-orange-700',
      bg: 'bg-orange-100',
      description: 'There are meaningful gaps in your foundation, but focused improvements can create visible momentum.',
    };
  }

  return {
    label: 'At Risk',
    color: 'text-red-700',
    bg: 'bg-red-100',
    description: 'Stability needs attention now. Strengthen the foundation before worrying about optimization.',
  };
}

export function getScoreLabel(score: number): {
  label: string;
  color: string;
  description: string;
} {
  const band = getScoreBand(score);
  return {
    label: band.label,
    color: band.color,
    description: band.description,
  };
}

export function getPillarScoreLabel(score: number): {
  label: string;
  color: string;
  bg: string;
} {
  if (score >= 80) return { label: 'Strong', color: 'text-emerald-600', bg: 'bg-emerald-50' };
  if (score >= 60) return { label: 'Building', color: 'text-amber-600', bg: 'bg-amber-50' };
  if (score >= 40) return { label: 'Needs Attention', color: 'text-orange-600', bg: 'bg-orange-50' };
  return { label: 'Weak', color: 'text-red-600', bg: 'bg-red-50' };
}

// =====================================================
// REPORT BUILDERS
// =====================================================

function getTopFocusAreas(
  pillars: Record<PillarKey, number>,
  answers: Record<string, any>
) {
  const priorities: string[] = [];

  if (answers.primaryFinancialPriority === 'build_savings') {
    priorities.push('Build a stronger emergency buffer so unexpected expenses stop disrupting progress.');
  }

  if (answers.primaryFinancialPriority === 'grow_investing') {
    priorities.push('Increase investing consistency so more of your income turns into long-term growth.');
  }

  if (answers.primaryFinancialPriority === 'get_out_of_debt') {
    priorities.push('Reduce debt pressure to create more breathing room and flexibility.');
  }

  if (answers.overspendingFrequency === 'often' || answers.overspendingFrequency === 'almost_always') {
    priorities.push('Reduce overspending so more cash can flow toward the goals that matter most.');
  }

  if (answers.moneyLeaks === 'several' || answers.moneyLeaks === 'a_lot') {
    priorities.push('Tighten up money leaks like impulse spending, subscriptions, and convenience purchases.');
  }

  if (answers.savingConsistency === 'not_currently') {
    priorities.push('Start a consistent saving habit, even if the amount is small at first.');
  }

  if (answers.investingStatus === 'not_yet') {
    priorities.push('Begin investing at a manageable level so your money starts working for you over time.');
  }

  if (priorities.length < 3) {
    const weakest = Object.entries(pillars)
      .sort((a, b) => a[1] - b[1])[0]?.[0] as PillarKey | undefined;

    if (weakest === 'spending') {
      priorities.push('Improve spending clarity so your money aligns more closely with your priorities.');
    } else if (weakest === 'saving') {
      priorities.push('Strengthen your savings foundation to create more stability and flexibility.');
    } else if (weakest === 'investing') {
      priorities.push('Build investing consistency to support long-term growth.');
    } else if (weakest === 'income') {
      priorities.push('Increase income stability and future earning capacity where possible.');
    } else if (weakest === 'protection') {
      priorities.push('Close key protection gaps so one setback does not undo your progress.');
    } else if (weakest === 'vision') {
      priorities.push('Clarify your financial direction so your decisions support a real destination.');
    } else if (weakest === 'debt') {
      priorities.push('Reduce debt pressure to free up more monthly cash flow and flexibility.');
    }
  }

  return [...new Set(priorities)].slice(0, 3);
}

function getInsights(
  pillars: Record<PillarKey, number>,
  answers: Record<string, any>,
  metrics: FinancialMetrics,
  signals: UserSignals,
  mode: ScoringMode = 'detailed'
) {
  const insights: string[] = [];
  const equity = metrics.homeEquity ?? 0;
  const fixedCostRatio = metrics.fixedCostPressureRatio ?? 0;

  const incomeConstraint = determineIncomeConstraint(answers, signals);

  if (signals.highObligationPressure) {
    insights.push(
      'A large share of your take-home income is already committed to fixed costs. That pressure is likely reducing your flexibility before the month really begins.'
    );
  }

  if (incomeConstraint.triggered) {
    insights.push(
      'Your current pressure appears to be driven more by limited monthly margin than by small day-to-day mistakes. That usually points to an income, housing, or debt-load issue more than a simple budgeting issue.'
    );
  }

  if (signals.hasCreditCardDebt || signals.hasBnplDebt || signals.hasPaydayDebt) {
    insights.push(
      'High-interest or short-term debt is creating friction in the background. Reducing that pressure should improve flexibility faster than trying to optimize everything at once.'
    );
  }

  if (signals.hasNoDebtPlan) {
    insights.push(
      'You appear to have debt pressure without a clearly defined payoff strategy. Adding structure here would likely improve both momentum and confidence.'
    );
  }

  if (signals.lowEmergencyFund) {
    insights.push(
      'Your cash buffer looks thinner than ideal right now. Even a modest emergency fund would make the rest of your foundation more resilient.'
    );
  }

  if (signals.noClearGoals && hasAnswer(answers, 'financialDirection')) {
    insights.push(
      'Your financial direction appears less defined than it could be. Greater clarity would likely improve the quality of your next few money decisions.'
    );
  }

  if (pillars.income >= 60 && pillars.investing < 60) {
    insights.push(
      'You have a workable income base, but it is not being converted into long-term wealth as effectively as it could be.'
    );
  }

  if (mode !== 'snapshot' && pillars.spending < 60 && answers.threeMonthReview === 'no') {
    insights.push(
      'Your biggest near-term opportunity may be clarity. A 3-month spending review could quickly uncover hidden leaks and create margin without requiring a dramatic lifestyle change.'
    );
  }

  if (fixedCostRatio >= 70) {
    insights.push(
      'Your biggest drag may be fixed-cost pressure rather than simple day-to-day overspending. Housing, utilities, childcare, and debt appear to be taking a heavy share of monthly income.'
    );
  }

  if (answers.housingStatus === 'rent' && answers.housingPressure === 'stressful') {
    insights.push(
      'Your rent and housing costs appear to be putting meaningful pressure on the rest of your financial life. That kind of fixed monthly burden can make it much harder to save, invest, or get ahead.'
    );
  }

  if (mode !== 'snapshot' && hasDependents(answers) && ['heavy', 'very_heavy'].includes(answers.childcarePressure)) {
    insights.push(
      'Childcare appears to be one of the real pressure points in your monthly budget. That does not mean you are doing something wrong — it means your plan needs to account for a heavy fixed expense load.'
    );
  }

  if (pillars.debt < 60 && pillars.saving < 60) {
    insights.push(
      'Debt pressure and weak savings are feeding each other. Building even a modest cash buffer while reducing the highest-pressure debt would likely make the whole system feel more stable.'
    );
  }

  if (mode !== 'snapshot' && hasMortgage(answers) && equity > 0) {
    if (['holds_me_back', 'major_pressure'].includes(answers.mortgageImpact)) {
      insights.push(
        `You appear to have roughly $${Math.round(equity).toLocaleString()} in home equity, but the monthly mortgage still feels like a drag on progress. That suggests your issue is less about the house being a bad asset and more about cash-flow pressure in the current season.`
      );
    } else {
      insights.push(
        `Your estimated home equity is around $${Math.round(equity).toLocaleString()}, which means your mortgage may be acting more like a structured wealth-building tool than a financial setback.`
      );
    }
  }

  if (mode !== 'snapshot' && signals.carriesCreditCardBalance) {
    insights.push(
      'Carrying credit card balances is likely increasing friction in the background. Improving that one habit could create a surprisingly fast lift to your overall foundation.'
    );
  }

  if (pillars.protection < 60 && pillars.saving >= 60 && (mode !== 'snapshot' || hasAnswer(answers, 'healthInsurance'))) {
    insights.push(
      'You have done meaningful work building reserves, but protection gaps could still expose that progress. Strong savings and weak protection often create a false sense of security.'
    );
  }

  if (pillars.vision >= 70 && pillars.spending < 60) {
    insights.push(
      'Your direction seems clearer than your day-to-day money execution. The next breakthrough is probably not motivation. It is alignment.'
    );
  }

  if (pillars.saving >= 70 && pillars.investing >= 70) {
    insights.push(
      'Your cash habits and investing habits are reinforcing each other well. That is one of the strongest signs of a durable financial foundation.'
    );
  }

  if (!insights.length) {
    insights.push(
      'Your results suggest a mixed but workable foundation. The biggest gains will likely come from improving the weakest area first rather than trying to optimize everything at once.'
    );
  }

  return [...new Set(insights)].slice(0, 5);
}

function buildSummary(
  score: number,
  scoreBand: string,
  pillars: Record<PillarKey, number>,
  answers: Record<string, any>,
  signals: UserSignals,
  mode: ScoringMode = 'detailed'
) {
  const sorted = Object.entries(pillars).sort((a, b) => a[1] - b[1]);
  const weakest = getBiggestOpportunity(pillars, answers, mode === 'snapshot' ? undefined : signals);
  const strongest = sorted[sorted.length - 1][0] as PillarKey;

  if (score >= 80) {
    return `Your Foundation Score is ${score}, placing you in the "${scoreBand}" range. You already have a strong financial base. Your strongest area is ${PILLAR_LABELS[strongest]}, and your biggest opportunity now is refining ${PILLAR_LABELS[weakest]} so the entire foundation is working at the same level.`;
  }

  if (score >= 60) {
    return `Your Foundation Score is ${score}, which puts you in the "${scoreBand}" range. You are moving in the right direction and have several solid habits in place. Right now, ${PILLAR_LABELS[weakest]} is creating the most drag, while ${PILLAR_LABELS[strongest]} is giving you something real to build from.`;
  }

  if (score >= 40) {
    if (signals.incomeConstraintTriggered) {
      return `Your Foundation Score is ${score}, which puts you in the "${scoreBand}" range. Your foundation has some meaningful strengths, but real pressure appears to be coming from limited monthly margin, not just execution. Improving ${PILLAR_LABELS[weakest]} first should make the whole system feel more stable.`;
    }

    return `Your Foundation Score is ${score}, which puts you in the "${scoreBand}" range. Your foundation has some meaningful strengths, but a few gaps are creating unnecessary pressure. Improving ${PILLAR_LABELS[weakest]} first should make the whole system feel more stable.`;
  }

  if (signals.incomeConstraintTriggered) {
    return `Your Foundation Score is ${score}, placing you in the "${scoreBand}" range. Right now, your finances may feel heavier than they need to, and much of that pressure appears to be structural rather than just behavioral. The good news is that you do not need to fix everything at once. Starting with ${PILLAR_LABELS[weakest]} should create the clearest path toward stability and momentum.`;
  }

  return `Your Foundation Score is ${score}, placing you in the "${scoreBand}" range. Right now, your finances may feel heavier than they need to. The good news is that you do not need to fix everything at once. Starting with ${PILLAR_LABELS[weakest]} should create the clearest path toward stability and momentum.`;
}

function buildNextStep(
  pillars: Record<PillarKey, number>,
  answers: Record<string, any>,
  metrics: FinancialMetrics,
  signals: UserSignals,
  mode: ScoringMode = 'detailed'
) {
  const weakest = getBiggestOpportunity(pillars, answers, mode === 'snapshot' ? undefined : signals);

  if (signals.incomeConstraintTriggered) {
    return 'Your best next move is to create breathing room before chasing optimization. Focus first on the biggest lever available to you: increasing income, reducing a major fixed cost, or restructuring the debt load that is crowding out progress.';
  }

  if ((metrics.fixedCostPressureRatio ?? 0) >= 50 && hasMortgage(answers) && !hasVehicleDebt(answers) && !hasOtherDebt(answers)) {
    return 'Your best next move is to review your housing picture in one place: monthly housing cost, utilities, remaining mortgage balance, home value, and what that payment may be crowding out elsewhere. This looks more like a fixed-cost pressure issue than a debt payoff issue.';
  }

  if (mode !== 'snapshot' && weakest === 'spending' && answers.threeMonthReview === 'no') {
    return 'Your best next move is a 3-Month Clarity Review. Once you can clearly see where your money is going, better decisions become much easier.';
  }

  if (weakest === 'spending' && (metrics.fixedCostPressureRatio ?? 0) >= 70) {
    return 'Your best next move is to review your fixed monthly obligations in one place, especially housing, utilities, childcare, and debt. Your biggest issue may be fixed-cost pressure more than day-to-day spending.';
  }

  if (weakest === 'debt' && hasMortgage(answers) && ['holds_me_back', 'major_pressure'].includes(answers.mortgageImpact)) {
    return 'Your best next move is to review your full housing picture in one place: mortgage payment, home value, remaining balance, and what the payment is crowding out elsewhere. Clarity comes first, then better options.';
  }

  if (weakest === 'debt') {
    return 'Your next step is to map every debt in one place, including balance, payment, and interest rate. Clarity comes first, then momentum.';
  }

  if (weakest === 'saving') {
    return 'Your next step is to automate one savings transfer, even if it starts small. Consistency matters more than the starting amount.';
  }

  if (weakest === 'investing') {
    return 'Your next step is to make sure you are not missing easy long-term progress, especially any employer match available to you.';
  }

  if (weakest === 'protection') {
    return 'Your next step is to review the protections around your income, health, home, and family so one setback does not undo your progress.';
  }

  if (weakest === 'income') {
    return 'Your next step is to identify the highest-leverage way to improve income or income stability. This is the area most likely to create a ripple effect across the rest of your foundation.';
  }

  if (weakest === 'vision') {
    return 'Your next step is to define what financial freedom would actually look like in your life. Clear direction makes every other money decision easier.';
  }

  return 'Your next step is not a dramatic overhaul. Keep strengthening your weakest area first, because that is where the biggest overall lift usually comes from.';
}

function getDynamicPlanStep(
  pillar: PillarKey,
  answers: Record<string, any>,
  metrics: FinancialMetrics,
  rank: number
): ActionPlanStep {
  const title =
    rank === 0
      ? `Next: Strengthen ${PILLAR_LABELS[pillar]}`
      : `Then focus on ${PILLAR_LABELS[pillar]}`;

  switch (pillar) {
    case 'income':
      if (answers.incomeConsistency === 'highly_unpredictable') {
        return {
          title,
          body: 'Focus on stabilizing your income first. Reducing volatility will make every other financial goal easier to manage.',
          checklist: [
            'Identify the biggest source of income volatility.',
            'Create a backup plan for low-income months.',
            'Look for one way to make income more predictable.',
          ],
        };
      }

      if (answers.incomeGrowthPotential === 'high') {
        return {
          title,
          body: 'Focus on increasing your earning power. You appear to have real upside here, and even a modest increase could create a meaningful ripple effect.',
          checklist: [
            'Choose the best opportunity to increase income.',
            'Take one concrete step this week: ask, apply, offer, or start.',
            'Set a 90-day income improvement target.',
          ],
        };
      }

      return {
        title,
        body: 'Focus on increasing your earning power or stability. Even a small improvement here can relieve pressure across your entire system.',
        checklist: [
          'Identify one practical way to increase income or stability.',
          'Take one action this week.',
          'Set a realistic 90-day target.',
        ],
      };

    case 'spending':
      if ((metrics.fixedCostPressureRatio ?? 0) >= 70) {
        return {
          title,
          body: 'A large share of your income appears to be tied up in fixed monthly obligations. The goal here is not guilt. It is getting clear on where your required money is going first.',
          checklist: [
            'Write down monthly housing, utilities, childcare, and debt costs in one place.',
            'Identify which fixed cost is creating the most pressure.',
            'Decide whether the next move is margin, negotiation, reduction, or a longer-term plan.',
          ],
        };
      }

      if (answers.threeMonthReview === 'no') {
        return {
          title,
          body: 'Start with a 3-month spending review. Clarity is likely the fastest way to uncover leaks and free up cash flow.',
          checklist: [
            'Review the last 90 days of transactions.',
            'Highlight the biggest recurring money leaks.',
            'Choose one category to improve this month.',
          ],
        };
      }

      if (answers.moneyLeaks === 'several' || answers.moneyLeaks === 'a_lot') {
        return {
          title,
          body: 'Tighten the spending leaks that are creating the most drag. You do not need to cut everything — just the habits costing you the most.',
          checklist: [
            'Pick the top two recurring leaks.',
            'Reduce or remove one this week.',
            'Redirect the savings toward a real priority.',
          ],
        };
      }

      return {
        title,
        body: 'Make spending more intentional. Better control here will create margin you can use everywhere else.',
        checklist: [
          'Review your top 3 spending categories.',
          'Choose one category to tighten.',
          'Track improvement over the next 30 days.',
        ],
      };

    case 'saving':
      if (answers.savingConsistency === 'not_currently') {
        return {
          title,
          body: 'Start rebuilding savings with one automatic transfer, even if it begins small. Consistency matters more than the starting amount.',
          checklist: [
            'Choose a weekly or monthly savings amount.',
            'Automate the transfer.',
            'Protect that transfer for the next 90 days.',
          ],
        };
      }

      if (answers.savingsAutomation === 'manual' || answers.savingsAutomation === 'not_saving') {
        return {
          title,
          body: 'Automate savings so progress happens without relying on memory or motivation.',
          checklist: [
            'Pick a recurring savings amount.',
            'Turn it into an automatic transfer.',
            'Check progress once a month.',
          ],
        };
      }

      return {
        title,
        body: 'Build more breathing room by strengthening your cash buffer and protecting the habit that funds it.',
        checklist: [
          'Increase savings slightly if possible.',
          'Keep emergency savings separate from spending money.',
          'Stay consistent for the next 90 days.',
        ],
      };

    case 'investing':
      if (answers.employerMatch === 'have_match_not_contributing' || answers.employerMatch === 'have_match_not_maxing') {
        return {
          title,
          body: 'Start with the easiest long-term win available: make sure you are capturing as much employer match as you reasonably can.',
          checklist: [
            'Confirm your employer match details.',
            'Increase contributions toward the full match.',
            'Review progress again in 90 days.',
          ],
        };
      }

      if (answers.investingStatus === 'not_yet') {
        return {
          title,
          body: 'Begin building a consistent investing habit. You do not need complexity yet — you need a repeatable starting point.',
          checklist: [
            'Choose the easiest place to begin investing.',
            'Set a starting contribution amount.',
            'Keep the plan simple and consistent for 90 days.',
          ],
        };
      }

      return {
        title,
        body: 'Make investing more consistent. The priority here is regular contributions, not complexity.',
        checklist: [
          'Choose a sustainable contribution amount.',
          'Automate it if possible.',
          'Review your consistency after 90 days.',
        ],
      };

    case 'debt':
      if (hasMortgage(answers) && ['holds_me_back', 'major_pressure'].includes(answers.mortgageImpact)) {
        return {
          title,
          body: 'Review your full housing picture in one place: payment, home value, remaining balance, and what the mortgage is crowding out elsewhere.',
          checklist: [
            'Write down mortgage payment, balance, and home value.',
            'Identify what the housing payment may be crowding out.',
            'Decide whether the goal is margin, payoff, or stability.',
          ],
        };
      }

      if (answers.creditCardBehavior === 'always_carry_balance' || answers.creditCardBehavior === 'usually') {
        return {
          title,
          body: 'Start by reducing the debt with the highest pressure, especially any revolving credit card balance.',
          checklist: [
            'List every debt with balance and payment.',
            'Identify the highest-pressure debt first.',
            'Set one extra payment target for the next 30 days.',
          ],
        };
      }

      if (answers.debtPaydownStrategy === 'no_strategy') {
        return {
          title,
          body: 'Put every debt in one place and choose a real payoff strategy. Clarity plus direction will reduce pressure fast.',
          checklist: [
            'List every debt in one place.',
            'Choose avalanche or snowball.',
            'Put one extra payment toward the priority debt.',
          ],
        };
      }

      return {
        title,
        body: 'Reduce debt pressure by focusing on the balance creating the most friction first.',
        checklist: [
          'Choose the debt that deserves extra attention first.',
          'Make one extra payment this month.',
          'Track the balance going down.',
        ],
      };

    case 'protection':
      if (false) {
        return {
          title,
          body: 'Strengthen the protection around your income first. A setback here could undo progress elsewhere very quickly.',
          checklist: [
            'Review how protected your income is if you could not work.',
            'Identify the biggest protection gap.',
            'Take one step to improve it this quarter.',
          ],
        };
      }

      if (answers.healthInsurance === 'no_coverage' || answers.healthInsurance === 'none') {
        return {
          title,
          body: 'Close the biggest protection gap first, especially health coverage. This area can create outsized damage if ignored.',
          checklist: [
            'Review current coverage options.',
            'Choose the most urgent gap to address.',
            'Take one action this month.',
          ],
        };
      }

      return {
        title,
        body: 'Review the areas that could create the biggest setback if something went wrong, especially income, health, home, and family protection.',
        checklist: [
          'Identify the biggest protection gap.',
          'Choose one update to make this quarter.',
          'Recheck your coverage after 90 days.',
        ],
      };

    case 'vision':
      if (answers.financialDirection === 'stuck' || answers.financialDirection === 'no_goals') {
        return {
          title,
          body: 'Define what you are actually working toward. A clearer destination will make your next financial decisions much easier.',
          checklist: [
            'Write down your top financial goal.',
            'Choose a 12-month target.',
            'Make sure your next money move supports that target.',
          ],
        };
      }

      if (answers.financialTimeHorizon === 'short_term' || answers.financialTimeHorizon === 'not_sure') {
        return {
          title,
          body: 'Push your thinking beyond the immediate month or year. A longer time horizon will improve the quality of your decisions.',
          checklist: [
            'Write down what progress would look like in 3 years.',
            'Choose one 90-day priority that supports that bigger picture.',
            'Review future decisions through that lens.',
          ],
        };
      }

      return {
        title,
        body: 'Clarify what you are actually working toward. When your direction is clear, your day-to-day financial decisions become much easier to align.',
        checklist: [
          'Write down your top financial goal.',
          'Choose one 90-day priority.',
          'Make sure your next major money move supports it.',
        ],
      };
  }
}

function buildActionPlan(
  pillars: Record<PillarKey, number>,
  answers: Record<string, any>,
  metrics: FinancialMetrics,
  nextStep: string,
  signals: UserSignals,
  mode: ScoringMode = 'detailed'
): ActionPlan {
  const ordered = Object.entries(pillars)
    .sort((a, b) => a[1] - b[1])
    .map(([pillar]) => pillar as PillarKey);

  const weakest = getBiggestOpportunity(pillars, answers, signals);
  const remaining = ordered.filter((pillar) => pillar !== weakest);
  const second = remaining[0];
  const third = remaining[1];

  const immediate: ActionPlanStep[] = [];
  const shortTerm: ActionPlanStep[] = [];
  const longTerm: ActionPlanStep[] = [
    {
      title: 'After 90 Days',
      body: 'Review your progress, keep what is working, and then move to the next weakest area.',
      checklist: [
        'Review what improved over the last 90 days.',
        'Keep the habits that are working.',
        'Choose the next area to strengthen.',
      ],
    },
  ];

  immediate.push({
    title: 'Start Here',
    body: weakest
      ? `Start with ${PILLAR_LABELS[weakest]}. Improving this one area will have the biggest ripple effect across your entire financial foundation.`
      : nextStep,
    checklist: weakest
      ? [
          `Identify one concrete way to improve ${PILLAR_LABELS[weakest]}.`,
          'Take one action this week.',
          'Set a simple 90-day target you can actually follow.',
        ]
      : [
          'Choose one concrete next step.',
          'Take action this week.',
          'Review progress after 30 days.',
        ],
  });

  if (signals.highObligationPressure) {
    immediate.push({
      title: 'Create breathing room in your monthly cash flow',
      body:
        'A large share of your income is already committed before the month really begins. Reducing that pressure should improve almost every other area.',
      checklist: [
        'Review the last 3 months of transactions.',
        'Identify 1–2 categories or bills to reduce immediately.',
        'Free up at least one amount you can redirect toward a real priority.',
      ],
    });
  }

  if (signals.hasCreditCardDebt || signals.hasBnplDebt || signals.hasPaydayDebt) {
    immediate.push({
      title: 'Target high-pressure debt first',
      body:
        'Revolving or short-term debt creates ongoing friction. Paying down the highest-pressure balance first is one of the fastest ways to improve your foundation.',
      checklist: [
        'List all balances, minimum payments, and interest rates.',
        'Choose one balance to attack first.',
        'Make one extra payment this month.',
      ],
    });
  }

  if (signals.hasNoDebtPlan) {
    shortTerm.push({
      title: 'Choose a real debt payoff strategy',
      body:
        'A clear payoff method creates structure and momentum. Without one, progress is usually slower and less consistent.',
      checklist: [
        'Choose avalanche or snowball.',
        'Write your debt list in payoff order.',
        'Commit every extra dollar to one priority balance.',
      ],
    });
  }

  if (signals.lowEmergencyFund) {
    shortTerm.push({
      title: 'Build a starter emergency buffer',
      body:
        'Even a modest cash cushion makes it less likely that the next surprise turns into new debt.',
      checklist: [
        'Set a first target such as $500 or $1,000.',
        'Automate a weekly or payday transfer.',
        'Keep this money separate from daily spending.',
      ],
    });
  }

  if (signals.noClearGoals) {
    shortTerm.push({
      title: 'Define the next 12 months clearly',
      body:
        'Clear goals make everyday financial decisions easier to align. Direction is often the missing piece behind consistency.',
      checklist: [
        'Write down your top 3 money goals.',
        'Choose one 90-day priority.',
        'Make sure your next big money move supports it.',
      ],
    });
  }

  if (!shortTerm.length) {
    [second, third]
      .filter(Boolean)
      .forEach((pillar, index) => {
        shortTerm.push(getDynamicPlanStep(pillar, answers, metrics, index));
      });
  } else if (second && shortTerm.length < 2) {
    shortTerm.push(getDynamicPlanStep(second, answers, metrics, 0));
  }

  return {
    immediate: immediate.slice(0, 3),
    shortTerm: shortTerm.slice(0, 3),
    longTerm,
  };
}

export const CATEGORY_TIPS = {
  income: 'Focus on stability first, then growth potential.',
  spending: 'Clarity and consistency matter more than perfection.',
  saving: 'A stronger cash buffer creates resilience and breathing room.',
  investing: 'Consistency matters more than complexity.',
  debt: 'Lower pressure creates flexibility and momentum.',
  protection: 'Protection keeps setbacks from becoming disasters.',
  vision: 'A clear destination helps every other decision make more sense.',
};

export const PILLAR_TIPS = CATEGORY_TIPS;

function getStructuralWarnings(data: {
  income: number;
  housing: number;
  totalExpenses: number;
  debtPayments: number;
}) {
  const warnings = [];

  const housingRatio = data.housing / data.income;
  const obligationRatio = data.totalExpenses / data.income;

  if (housingRatio > 0.35) {
    warnings.push({
      type: 'housing_pressure',
      severity: 'high',
    });
  }

  if (data.income < 3000 && obligationRatio > 0.8) {
    warnings.push({
      type: 'income_constraint',
      severity: 'high',
    });
  }

  if (housingRatio > 0.35 && data.debtPayments > 0) {
    warnings.push({
      type: 'structural_pressure',
      severity: 'critical',
    });
  }

  return warnings;
}

// =====================================================
// REPORT GENERATION
// =====================================================

export function generateReport(
  answers: Record<string, any>,
  _type: AssessmentType = 'detailed'
): DetailedReport {
  const mode: ScoringMode = _type === 'free' ? 'snapshot' : 'detailed';

  const sanitizedAnswers = sanitizeResponses(
    DETAILED_ASSESSMENT_QUESTIONS,
    answers
  );

  const workingAnswers =
    mode === 'snapshot'
      ? filterSnapshotAnswers(sanitizedAnswers)
      : sanitizedAnswers;

  const signals = deriveSignals(workingAnswers, mode);
  const buildingBlockScores = calculateEnhancedBuildingBlockScores(
    workingAnswers,
    signals,
    mode
  );
  const pillarScores = calculatePillarScores(buildingBlockScores);
  const foundationScore = calculateFoundationScore(pillarScores);
  const scoreBand = getScoreBand(foundationScore).label;
  const metrics = calculateAllFinancialMetrics(workingAnswers);

  console.log('METRICS:', metrics);

  const structuralWarnings = getStructuralWarnings({
    income: metrics.monthlyIncome ?? 0,
    housing: metrics.monthlyHousingCost ?? 0,
    totalExpenses: metrics.monthlyFixedCosts ?? 0,
    debtPayments: metrics.monthlyDebtPayments ?? 0,
  });

  const pillarReasons = getPillarReasons(workingAnswers, signals, mode);

  const biggestOpportunity = getBiggestOpportunity(
    pillarScores,
    workingAnswers,
    mode === 'snapshot' ? undefined : signals
  );

  const lifeStage = determineLifeStage({
    investingActivity:
      workingAnswers.investingStatus === 'yes_consistently' ||
      workingAnswers.investingStatus === 'yes_irregularly',
    pillars: pillarScores,
    answers: workingAnswers,
  });

  const priorities = getTopFocusAreas(pillarScores, workingAnswers);
  const insights = getInsights(pillarScores, workingAnswers, metrics, signals, mode);
  const summary = buildSummary(
    foundationScore,
    scoreBand,
    pillarScores,
    workingAnswers,
    signals,
    mode
  );
  const nextStep = buildNextStep(
    pillarScores,
    workingAnswers,
    metrics,
    signals,
    mode
  );
  const actionPlan = buildActionPlan(
    pillarScores,
    workingAnswers,
    metrics,
    nextStep,
    signals,
    mode
  );

  return {
    foundationScore,
    scoreBand,
    buildingBlockScores,
    pillarScores,
    pillarReasons,
    biggestOpportunity,
    lifeStage,
    insights,
    priorities,
    actionPlan,
    summary,
    nextStep,
    signals,
    metrics,
    structuralWarnings,
  };
}

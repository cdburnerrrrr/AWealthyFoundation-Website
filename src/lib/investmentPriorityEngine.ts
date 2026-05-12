export type TaxSituation = 'low' | 'middle' | 'high' | 'not_sure';
export type InvestingExperience = 'not_started' | 'some' | 'consistent';
export type TimeHorizon = 'short' | 'medium' | 'long';
export type PrimaryGoal = 'retirement' | 'house' | 'education' | 'financial_freedom' | 'general';

export type InvestmentPriorityInputs = {
  monthlyTakeHomeIncome: number;
  monthlyEssentialExpenses: number;
  emergencyFundMonths: number;
  highInterestDebtBalance: number;
  highestDebtApr: number;
  employerMatchAvailable: boolean;
  currentWorkplaceContributionPercent: number;
  fullMatchContributionPercent: number;
  hsaEligible: boolean;
  taxSituation: TaxSituation;
  investingExperience: InvestingExperience;
  timeHorizon: TimeHorizon;
  primaryGoal: PrimaryGoal;
};

export type PriorityKey =
  | 'stabilize_cash_flow'
  | 'starter_emergency_fund'
  | 'high_interest_debt'
  | 'employer_match'
  | 'hsa'
  | 'roth_ira'
  | 'traditional_ira'
  | 'increase_workplace_plan'
  | 'taxable_brokerage'
  | 'goal_cash_bucket';

export type PriorityMove = {
  key: PriorityKey;
  title: string;
  badge: string;
  score: number;
  body: string;
  why: string;
  action: string;
  tone: 'stabilize' | 'protect' | 'capture' | 'grow';
};

export type InvestmentPriorityResult = {
  monthlyMargin: number;
  fixedCostLoad: number;
  matchGapPercent: number;
  statusLabel: string;
  statusBody: string;
  topMove: PriorityMove;
  rankedMoves: PriorityMove[];
  flags: string[];
};

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function round(value: number) {
  return Math.round(Number.isFinite(value) ? value : 0);
}

function safeNumber(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function getGoalLabel(goal: PrimaryGoal) {
  switch (goal) {
    case 'retirement':
      return 'retirement';
    case 'house':
      return 'a house or major purchase';
    case 'education':
      return 'education funding';
    case 'financial_freedom':
      return 'financial freedom';
    default:
      return 'long-term progress';
  }
}

function sortMoves(moves: PriorityMove[]) {
  return [...moves]
    .filter((move) => move.score > 0)
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      return a.title.localeCompare(b.title);
    });
}

export function calculateInvestmentPriority(input: InvestmentPriorityInputs): InvestmentPriorityResult {
  const monthlyTakeHomeIncome = Math.max(0, safeNumber(input.monthlyTakeHomeIncome));
  const monthlyEssentialExpenses = Math.max(0, safeNumber(input.monthlyEssentialExpenses));
  const monthlyMargin = monthlyTakeHomeIncome - monthlyEssentialExpenses;
  const fixedCostLoad = monthlyTakeHomeIncome > 0 ? (monthlyEssentialExpenses / monthlyTakeHomeIncome) * 100 : 0;
  const emergencyFundMonths = clamp(input.emergencyFundMonths, 0, 60);
  const highestDebtApr = clamp(input.highestDebtApr, 0, 80);
  const highInterestDebtBalance = Math.max(0, safeNumber(input.highInterestDebtBalance));
  const currentWorkplaceContributionPercent = clamp(input.currentWorkplaceContributionPercent, 0, 100);
  const fullMatchContributionPercent = clamp(input.fullMatchContributionPercent, 0, 25);
  const matchGapPercent = input.employerMatchAvailable
    ? Math.max(0, fullMatchContributionPercent - currentWorkplaceContributionPercent)
    : 0;

  const cashFlowPressure = monthlyTakeHomeIncome > 0 && (monthlyMargin < 0 || fixedCostLoad >= 85);
  const tightCashFlow = monthlyTakeHomeIncome > 0 && fixedCostLoad >= 70 && !cashFlowPressure;
  const hasStarterEmergencyGap = emergencyFundMonths < 1;
  const hasEmergencyGap = emergencyFundMonths < 3;
  const hasHighInterestDebt = highInterestDebtBalance > 0 && highestDebtApr >= 10;
  const hasVeryHighInterestDebt = highInterestDebtBalance > 0 && highestDebtApr >= 18;
  const hasMatchGap = input.employerMatchAvailable && matchGapPercent > 0;
  const goalLabel = getGoalLabel(input.primaryGoal);

  const moves: PriorityMove[] = [
    {
      key: 'stabilize_cash_flow',
      title: 'Stabilize monthly cash flow first',
      badge: 'Stabilize',
      score: cashFlowPressure ? 100 : tightCashFlow ? 74 : 0,
      tone: 'stabilize',
      body:
        'Before adding more investing, make sure the monthly plan has enough breathing room to avoid relying on debt or draining savings.',
      why:
        'Investing works best when the dollars can stay invested. If monthly essentials are too high, new contributions may get pulled back out later.',
      action:
        'Look for one fixed cost or required payment to reduce before increasing investment contributions.',
    },
    {
      key: 'starter_emergency_fund',
      title: hasStarterEmergencyGap ? 'Build a starter emergency cushion' : 'Strengthen the emergency fund',
      badge: 'Protect',
      score: hasStarterEmergencyGap ? 96 : hasEmergencyGap ? 82 : 0,
      tone: 'protect',
      body:
        hasStarterEmergencyGap
          ? 'Get at least one month of essential expenses protected before getting more aggressive with investing.'
          : 'Move toward three months of essential expenses so investing does not have to pause every time life gets expensive.',
      why:
        'A cash cushion protects the rest of the foundation. Without it, surprise expenses can force debt or investment withdrawals.',
      action:
        hasStarterEmergencyGap
          ? 'Aim for one month of essentials first, then revisit investing increases.'
          : 'Keep investing simple while building the cushion toward three months.',
    },
    {
      key: 'high_interest_debt',
      title: 'Attack high-interest debt',
      badge: 'Pressure',
      score: hasVeryHighInterestDebt ? 94 : hasHighInterestDebt ? 86 : 0,
      tone: 'stabilize',
      body:
        'High-interest debt can quietly compete with investment growth. Paying it down may be the cleaner next dollar before expanding investing.',
      why:
        `A debt rate near ${round(highestDebtApr)}% is a heavy drag on the foundation and can erase progress from normal investment returns.`,
      action:
        'Direct extra dollars toward the highest-rate balance while keeping minimum contributions and essential protection in place.',
    },
    {
      key: 'employer_match',
      title: 'Capture the full employer match',
      badge: 'Free money',
      score: hasMatchGap && !cashFlowPressure ? (emergencyFundMonths >= 1 ? 91 : 78) : 0,
      tone: 'capture',
      body:
        'If the monthly plan can handle it, contributing enough to capture the full workplace match is usually one of the cleanest investing wins.',
      why:
        'The match rewards dollars you were already planning to invest. Missing it can be a simple foundation leak.',
      action:
        `Consider increasing workplace contributions by about ${Number(matchGapPercent.toFixed(1))}% of pay if cash flow allows.`,
    },
    {
      key: 'hsa',
      title: 'Consider HSA investing',
      badge: 'Tax edge',
      score: input.hsaEligible && emergencyFundMonths >= 3 && !hasVeryHighInterestDebt ? 76 : 0,
      tone: 'grow',
      body:
        'If you are eligible and your short-term cushion is in place, an HSA can be a powerful long-term investing bucket.',
      why:
        'An HSA can pair health-cost protection with long-term tax advantages when used carefully.',
      action:
        'Review your plan rules, expected medical expenses, and whether investing inside the HSA makes sense for your situation.',
    },
    {
      key: 'roth_ira',
      title: 'Fund a Roth IRA next',
      badge: 'Flexible growth',
      score:
        emergencyFundMonths >= 3 && !hasHighInterestDebt && !hasMatchGap && ['low', 'middle', 'not_sure'].includes(input.taxSituation)
          ? 74
          : 0,
      tone: 'grow',
      body:
        `A Roth IRA may be a strong next bucket for ${goalLabel}, especially if you value future tax flexibility.`,
      why:
        'For many households, Roth contributions can be a simple way to build long-term tax-free growth potential.',
      action:
        'Choose a monthly amount you can sustain, then automate it so consistency does the heavy lifting.',
    },
    {
      key: 'traditional_ira',
      title: 'Review Traditional IRA or pre-tax contributions',
      badge: 'Tax planning',
      score: emergencyFundMonths >= 3 && !hasHighInterestDebt && !hasMatchGap && input.taxSituation === 'high' ? 73 : 0,
      tone: 'grow',
      body:
        'If your current tax bracket is high, pre-tax investing may deserve a closer look before adding taxable investing.',
      why:
        'The right account order can matter when taxes are a meaningful part of the picture.',
      action:
        'Compare workplace pre-tax contributions, Traditional IRA eligibility, and Roth options before choosing the next bucket.',
    },
    {
      key: 'increase_workplace_plan',
      title: 'Increase current retirement investing',
      badge: 'Consistency',
      score:
        emergencyFundMonths >= 3 && !hasHighInterestDebt && !hasMatchGap && input.investingExperience !== 'not_started'
          ? 68
          : 0,
      tone: 'grow',
      body:
        'Once the foundation is protected, increasing an existing retirement contribution can be the simplest next move.',
      why:
        'You already have the system in place. A small step-up can create progress without adding another account to manage.',
      action:
        'Try a 1% contribution increase or a fixed monthly step-up, then review cash flow after one or two pay cycles.',
    },
    {
      key: 'taxable_brokerage',
      title: 'Use a taxable brokerage for extra flexibility',
      badge: 'After core buckets',
      score:
        emergencyFundMonths >= 6 && !hasHighInterestDebt && !hasMatchGap && input.timeHorizon !== 'short'
          ? 62
          : 0,
      tone: 'grow',
      body:
        'A taxable brokerage can make sense after the core protection, debt, and tax-advantaged buckets are already in good shape.',
      why:
        'It gives flexibility for goals that do not fit cleanly inside retirement accounts.',
      action:
        'Use this after confirming your emergency fund, match, and high-interest debt are handled.',
    },
    {
      key: 'goal_cash_bucket',
      title: 'Keep short-term goals in cash',
      badge: 'Short horizon',
      score: input.timeHorizon === 'short' ? 88 : 0,
      tone: 'protect',
      body:
        'If the goal is within a few years, the next dollar may belong in cash instead of the market.',
      why:
        'Short timelines do not leave much room for market swings to recover.',
      action:
        'Use a high-yield savings account or other stable cash bucket for near-term goals before investing extra dollars.',
    },
  ];

  const rankedMoves = sortMoves(moves);
  const fallbackMove: PriorityMove = {
    key: 'increase_workplace_plan',
    title: 'Choose one simple investing step-up',
    badge: 'Next step',
    score: 50,
    tone: 'grow',
    body:
      'Your major pressure points look manageable in this model. A small automated investing increase may be the next practical move.',
    why:
      'When the foundation is stable, consistency matters more than complexity.',
    action:
      'Pick one account, automate a manageable monthly amount, and review it in 90 days.',
  };

  const finalRankedMoves = rankedMoves.length > 0 ? rankedMoves : [fallbackMove];
  const topMove = finalRankedMoves[0];

  const flags: string[] = [];
  if (cashFlowPressure) flags.push('Monthly cash flow is tight enough that new investing may not stick yet.');
  if (hasStarterEmergencyGap) flags.push('Emergency savings are below one month of essentials.');
  if (hasVeryHighInterestDebt) flags.push('Very high-interest debt is competing with investment progress.');
  if (hasMatchGap && !cashFlowPressure) flags.push('There appears to be uncaptured employer match available.');
  if (input.timeHorizon === 'short') flags.push('Short-term goals may need cash stability more than market exposure.');

  let statusLabel = 'Ready for a next-dollar decision';
  let statusBody = 'Your answers point to a practical next move instead of adding investing complexity.';

  if (cashFlowPressure) {
    statusLabel = 'Stabilize before scaling';
    statusBody = 'Your monthly structure may need more breathing room before additional investing becomes sustainable.';
  } else if (hasMatchGap) {
    statusLabel = 'Match opportunity found';
    statusBody = 'The workplace match may be the cleanest investing win if your cash flow can support the increase.';
  } else if (hasEmergencyGap) {
    statusLabel = 'Protection still matters';
    statusBody = 'Your investing path gets stronger when the cash cushion can absorb normal surprises.';
  } else if (!hasHighInterestDebt && emergencyFundMonths >= 3) {
    statusLabel = 'Foundation looks investable';
    statusBody = 'The basics look stable enough to focus on the best account order for the next dollar.';
  }

  return {
    monthlyMargin: round(monthlyMargin),
    fixedCostLoad: Math.round(fixedCostLoad),
    matchGapPercent: Number(matchGapPercent.toFixed(1)),
    statusLabel,
    statusBody,
    topMove,
    rankedMoves: finalRankedMoves.slice(0, 5),
    flags,
  };
}

export function formatPriorityCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Math.round(Number.isFinite(value) ? value : 0));
}

import { useMemo, useRef, useState } from 'react';
import { exportReportPdf } from '../utils/pdfExport';
import ReportNewsletterCard from '../components/ReportNewsletterCard';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Shield,
  Target,
  Clock3,
  TrendingUp,
  PiggyBank,
  CreditCard,
  DollarSign,
  Eye,
  Sparkles,
  RefreshCcw,
} from 'lucide-react';
import PremiumGuidanceSection from '../components/results/PremiumGuidanceSection';
import {
  getReportFeatures,
  getReportTier,
  isDevReportOverrideEnabled,
  type ReportTier,
} from '../lib/reportFeatures';
import { useAppStore } from '../store/appStore';
import { useUserPlan } from '../hooks/useUserPlan';
import {
  PILLAR_LABELS,
  getScoreBand,
  getBiggestOpportunity,
  type PillarKey,
} from '../types/assessment';

type ActionPlanStep = {
  title: string;
  body: string;
  checklist: string[];
};

type StructuralWarning = {
  type:
    | 'housing_pressure'
    | 'income_constraint'
    | 'structural_pressure'
    | 'excess_cash'
    | 'protection_gap'
    | 'net_worth_data_gap';
  severity: 'medium' | 'high' | 'critical';
};

type ResultShape = {
  foundationScore: number;
  scoreBand: string;
  pillars?: Record<string, number>;
  pillarScores?: Record<string, number>;
  strengths?: { pillar: string; label: string; score: number }[];
  topFocusAreas?: string[];
  priorities?: string[];
  insights?: string[];
  summary?: string;
  nextStep?: string;
  structuralWarnings?: StructuralWarning[];
  metrics?: {
    fixedCostPressureRatio?: number;
    debtToIncomeRatio?: number;
    savingsRate?: number;
    totalSavings?: number;
    totalInvestments?: number;
    totalDebtBalance?: number;
    netWorth?: number;
    homeEquity?: number;
    monthlyIncome?: number;
    monthlyHousingCost?: number;
    monthlyUtilities?: number;
    monthlyChildcareCost?: number;
    monthlyDebtPayments?: number;
    monthlyFixedCosts?: number;
    emergencyFundMonths?: number;
    excessCashEstimate?: number;
    cashExcessMonths?: number;
    monthlyInvestmentContribution?: number;
    investmentContributionRate?: number;
    liquidAssets?: number;
    illiquidAssets?: number;
    liquidAssetRatio?: number;
    illiquidAssetRatio?: number;
  };
  actionPlan?: {
    immediate?: ActionPlanStep[];
    shortTerm?: ActionPlanStep[];
    longTerm?: ActionPlanStep[];
  };
};

type PlanTier = 'free' | 'standard' | 'premium';

type BestNextMoveCard = {
  title: string;
  intro: string;
  rightNow: string[];
  whyThisMatters: string;
  nextStep: string;
  thisWeek: string[];
};

function getPlanBadgeMeta(plan: PlanTier) {
  if (plan === 'premium') {
    return {
      label: 'Foundation Roadmap Plan',
      className:
        'bg-copper-500/10 text-copper-200 border border-copper-400/20',
    };
  }

  if (plan === 'standard') {
    return {
      label: 'Foundation Assessment Plan',
      className:
        'bg-blue-500/10 text-blue-100 border border-blue-300/20',
    };
  }

  return null;
}


function getHeroReportLabel(plan: PlanTier, reportTier: ReportTier) {
  if (plan === 'premium' || reportTier === 'premium') return 'Foundation Roadmap ($79 Plan)';
  if (plan === 'standard' || reportTier === 'standard') return 'Foundation Assessment ($29 Plan)';
  return 'Snapshot (Free Plan)';
}

const PILLAR_ICONS: Record<string, React.ElementType> = {
  income: DollarSign,
  spending: CreditCard,
  saving: PiggyBank,
  investing: TrendingUp,
  debt: CreditCard,
  protection: Shield,
  vision: Eye,
};
const strengthDescriptions: Record<string, string> = {
  income:
    'You have a workable income base in place. That gives the rest of your financial plan something solid to build on.',
  spending:
    'Your spending appears more intentional than average. That means more of your money can go toward goals instead of drifting away.',
  saving:
    'Your savings habits are creating resilience. That buffer matters because it gives you room to handle surprises without losing momentum.',
  investing:
    'You are doing more than covering today. You are turning present income into future freedom, which is a major sign of a strong foundation.',
  debt:
    'Your debt pressure looks relatively low. That gives you more flexibility to save, invest, and make decisions from a position of strength.',
  protection:
    'Your protection layer looks stronger than most. That helps keep setbacks from turning into major financial damage.',
  vision:
    'You seem to have a clearer direction than most people. That matters because clarity usually improves every other money decision.',
};

function safeArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

function formatPillarName(pillar: string) {
  if (pillar === 'debt') return 'Debt Pressure';
  return PILLAR_LABELS[pillar as PillarKey] || pillar;
}

function getPillarTone(score: number) {
  if (score >= 80) {
    return {
      text: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-200',
      bar: 'bg-emerald-500',
      badge: 'bg-emerald-100 text-emerald-700',
      label: 'Strong',
    };
  }

  if (score >= 60) {
    return {
      text: 'text-amber-700',
      bg: 'bg-amber-50 border-amber-200',
      bar: 'bg-amber-500',
      badge: 'bg-amber-100 text-amber-700',
      label: 'Building',
    };
  }

  if (score >= 40) {
    return {
      text: 'text-orange-700',
      bg: 'bg-orange-50 border-orange-200',
      bar: 'bg-orange-500',
      badge: 'bg-orange-100 text-orange-700',
      label: 'Needs Attention',
    };
  }

  return {
    text: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    bar: 'bg-red-500',
    badge: 'bg-red-100 text-red-700',
    label: 'Weak',
  };
}

function getBandNarrative(score: number) {
  if (score >= 80) {
    return 'You have a strong base in place. The opportunity now is less about dramatic change and more about refining the weaker edges of your foundation.';
  }
  if (score >= 60) {
    return 'You are moving in the right direction. Several parts of your foundation are working, but a few weaker areas are still limiting your overall momentum.';
  }
  if (score >= 40) {
    return 'You have some meaningful pieces in place, but there are still gaps creating drag. Strengthening the right areas now could noticeably change the next 12 months.';
  }
  return 'Right now, your financial foundation needs reinforcement before growth becomes the priority. The good news is that the biggest progress usually starts with a few focused moves, not a total overhaul.';
}

function formatDebtPressure(score: number) {
  if (score >= 85) return 'Low';
  if (score >= 60) return 'Moderate';
  if (score >= 40) return 'Elevated';
  return 'High';
}

function buildExecutiveHeadline(score: number) {
  if (score >= 80) return 'You’re ahead of most. Now let’s make your money work harder.';
  if (score >= 60) return 'Good momentum, but a few gaps are holding back full progress.';
  if (score >= 40) return 'A workable base is forming, but reinforcement is needed.';
  return 'Stability comes first. The foundation needs attention now.';
}

function getConstraintLine(pillar: string) {
  switch (pillar) {
    case 'income':
      return 'Right now, income is limiting how quickly the rest of your foundation can grow.';
    case 'spending':
      return 'Right now, spending control is limiting how much cash can flow toward stronger goals.';
    case 'saving':
      return 'Right now, savings is the weakest buffer in the system, which leaves the whole foundation more exposed.';
    case 'investing':
      return 'Right now, investing consistency is limiting how much today’s income turns into future wealth.';
    case 'debt':
      return 'Right now, debt pressure is creating friction that slows progress across the rest of your foundation.';
    case 'protection':
      return 'Right now, protection gaps could leave too much of your progress vulnerable to setbacks.';
    case 'vision':
      return 'Right now, a less-defined direction is making the rest of your financial decisions harder to align.';
    default:
      return 'Right now, this is the area most likely to create the biggest overall lift if improved.';
  }
}

function getBestNextMoveCard(
  warnings: StructuralWarning[],
  metrics: ResultShape['metrics'] | undefined,
  weakestPillar: string,
  nextStep?: string
): BestNextMoveCard {
  const fixedCost = formatPercent(metrics?.fixedCostPressureRatio);
  const debtToIncome = formatPercent(metrics?.debtToIncomeRatio);

  const cashMonths = Number(metrics?.emergencyFundMonths ?? 0);
  const excessCash = Number(metrics?.excessCashEstimate ?? 0);
  const netWorth = Number(metrics?.netWorth ?? 0);
  const investments = Number(metrics?.totalInvestments ?? 0);
  const investingRate = Number(metrics?.investmentContributionRate ?? metrics?.savingsRate ?? 0);

  if ((cashMonths >= 24 || excessCash > 0) && (netWorth >= 250000 || investments >= 100000)) {
    return {
      title: 'Optimize your excess cash',
      intro:
        'Your foundation is strong. The next opportunity is less about survival and more about making sure the money you already have is working efficiently.',
      rightNow: [
        cashMonths > 0
          ? `Your cash cushion covers about ${cashMonths.toFixed(1)} months of core expenses.`
          : 'Your cash reserve appears stronger than a typical emergency fund target.',
        excessCash > 0
          ? `Roughly ${formatCurrency(excessCash)} may be above a 12-month cash reserve target.`
          : 'Some cash may be better positioned in higher-yield savings, investments, or another priority.',
      ],
      whyThisMatters:
        'Cash creates safety, but excess idle cash can quietly slow long-term growth. The goal is not to drain your cushion — it is to define enough and put the rest to work intentionally.',
      nextStep:
        'Choose the cash reserve target that still feels safe, then redirect excess cash in stages toward higher-yield savings, investments, or another high-priority goal.',
      thisWeek: [
        'Decide how many months of expenses you want to keep in cash.',
        'Identify how much is above that target.',
        'Choose one staged move for the excess: HYSA, brokerage, Roth, debt, or another priority.',
      ],
    };
  }

  if (netWorth >= 250000 && investingRate >= 10) {
    return {
      title: 'Move from building to optimizing',
      intro:
        'You already have a strong foundation. The next move is making sure your cash, tax buckets, investments, and real estate are working together efficiently.',
      rightNow: [
        investments > 0 ? `Investments are about ${formatCurrency(investments)}.` : 'Your investing habit appears strong.',
        investingRate > 0 ? `You are investing roughly ${Math.round(investingRate)}% of take-home income.` : 'Your next opportunity is allocation and efficiency.',
      ],
      whyThisMatters:
        'At this stage, small allocation and tax-location improvements can matter more than another generic budgeting tip.',
      nextStep:
        'Review your cash target, Roth/pre-tax/taxable mix, and asset allocation before adding more complexity.',
      thisWeek: [
        'Review how much sits in cash versus investments and home equity.',
        'Check whether your Roth, pre-tax, and taxable balances are aligned with your goals.',
        'Choose one optimization move for the next 90 days.',
      ],
    };
  }

  if (warnings.some((warning) => warning.type === 'income_constraint')) {
    return {
      title: 'Use income as the next lever',
      intro:
        'Your assessment suggests this is more of a math problem than a discipline problem. Faster progress will likely come from more income, a lower major fixed cost, or both.',
      rightNow: [
        fixedCost
          ? `Must-pay monthly bills are taking about ${fixedCost} of take-home pay.`
          : 'Mortgage, rent, utilities, and required bills are taking too much of monthly cash flow.',
        'That means too much of your income is already spoken for before you make any new decisions.',
      ],
      whyThisMatters:
        'Without more margin, progress in the rest of the foundation is likely to stall even if your habits improve.',
      nextStep:
        'Choose the single highest-leverage move that either increases take-home income or reduces a major fixed cost.',
      thisWeek: [
        'List the 1–2 most realistic ways to increase income or reduce a major fixed cost.',
        'Take one real action this week: ask, apply, renegotiate, or cut.',
      ],
    };
  }

  if (warnings.some((warning) => warning.type === 'housing_pressure')) {
    return {
      title: 'Reduce the biggest fixed-cost drag',
      intro:
        'Your mortgage/rent, utilities, and other must-pay bills are creating more pressure than small day-to-day spending leaks right now.',
      rightNow: [
        fixedCost
          ? `Mortgage/rent, utilities, and fixed bills are about ${fixedCost} of take-home pay.`
          : 'Housing and required monthly bills are consuming too much of monthly cash flow.',
        'That makes the rest of the plan feel tighter than it should because too much income is already committed.',
      ],
      whyThisMatters:
        'When the biggest pressure point is structural, solving that first creates more lift than trying to optimize around it.',
      nextStep:
        'Review housing, utilities, and any other major fixed obligations together before making smaller cuts elsewhere.',
      thisWeek: [
        'List housing, utilities, and fixed obligations in one place.',
        'Identify the one cost change that would create the biggest monthly relief.',
      ],
    };
  }

  if (warnings.some((warning) => warning.type === 'structural_pressure')) {
    return {
      title: 'Create breathing room first',
      intro:
        'Multiple required payments are stacking pressure onto the same monthly cash flow.',
      rightNow: [
        debtToIncome
          ? `Debt payments alone are about ${debtToIncome} of take-home pay.`
          : 'Debt payments and must-pay bills are combining to reduce flexibility.',
        'That pressure makes saving, investing, and long-term progress much harder.',
      ],
      whyThisMatters:
        'Until the pressure eases, other improvements will feel slower and harder to sustain.',
      nextStep:
        'Start with the required payment or debt bill creating the most friction, then work outward from there.',
      thisWeek: [
        'List every major fixed obligation and debt payment.',
        'Choose the one pressure point that deserves attention first.',
      ],
    };
  }

  switch (weakestPillar) {
    case 'income':
      return {
        title: 'Strengthen income first',
        intro:
          'Income is the area most likely to create a ripple effect across the rest of your foundation.',
        rightNow: [
          'More income would improve saving, debt flexibility, and long-term progress at the same time.',
          'This is usually a higher-leverage move than trying to optimize everything else first.',
        ],
        whyThisMatters:
          'A stronger income base gives the rest of the system more room to work.',
        nextStep:
          nextStep || 'Identify one practical way to improve income stability or earning power over the next 30 days.',
        thisWeek: [
          'Choose one realistic income move to focus on.',
          'Take the first visible action this week.',
        ],
      };
    case 'saving':
      return {
        title: 'Build a stronger buffer',
        intro:
          'Savings is the weakest support layer in your foundation right now.',
        rightNow: [
          'A thin buffer leaves the rest of the plan more exposed to setbacks.',
          'Even a modest reserve improves flexibility and confidence.',
        ],
        whyThisMatters:
          'A stronger cash cushion protects progress everywhere else.',
        nextStep:
          nextStep || 'Build your next savings milestone with a simple, repeatable contribution habit.',
        thisWeek: [
          'Choose a weekly or monthly savings amount.',
          'Move the first contribution this week.',
        ],
      };
    case 'protection':
      return {
        title: 'Close your biggest protection gap',
        intro:
          'Protection is the area most likely to preserve the progress you have already built.',
        rightNow: [
          'One uncovered risk can undo progress faster than most people expect.',
          'This is less about growth and more about making the foundation sturdier.',
        ],
        whyThisMatters:
          'A stronger protection layer helps keep one setback from turning into a major financial interruption.',
        nextStep:
          nextStep || 'Review the single protection gap that would hurt most if it failed.',
        thisWeek: [
          'Identify the biggest protection gap in your current setup.',
          'Choose one update to make this quarter.',
        ],
      };
    case 'vision':
      return {
        title: 'Clarify the target first',
        intro:
          'When direction is fuzzy, it becomes harder to align saving, spending, and investing decisions.',
        rightNow: [
          'You may have workable habits in place, but the target still needs sharper edges.',
          'That can make good decisions feel less connected than they should.',
        ],
        whyThisMatters:
          'Clearer direction usually improves every other money decision.',
        nextStep:
          nextStep || 'Write down the top financial goal you want the next 12 months to support.',
        thisWeek: [
          'Choose one 12-month priority.',
          'Make sure your next major money move supports it.',
        ],
      };
    default:
      return {
        title: `Start with ${formatPillarName(weakestPillar || 'your weakest area')}`,
        intro:
          'This is the area most likely to create the biggest overall lift if improved first.',
        rightNow: [
          getConstraintLine(weakestPillar),
          'This is where extra attention should produce the clearest payoff.',
        ],
        whyThisMatters:
          'Focusing on the weakest part of the system first usually creates faster overall progress.',
        nextStep:
          nextStep || `Take one focused step to strengthen ${formatPillarName(weakestPillar || 'this area')}.`,
        thisWeek: [
          'Choose one realistic action.',
          'Take it this week while the priority is clear.',
        ],
      };
  }
}

function getFallbackStabilizeItems(
  warnings: StructuralWarning[],
  weakestPillar: string
) {
  if (warnings.length) {
    return [
      'Reduce the biggest fixed-cost pressure first.',
      'Build a small cash buffer before trying to optimize everything else.',
      weakestPillar
        ? `Then strengthen ${formatPillarName(weakestPillar)} once the pressure eases.`
        : 'Then strengthen the weakest area once the pressure eases.',
    ];
  }

  return [
    weakestPillar
      ? `Start by improving ${formatPillarName(weakestPillar)}.`
      : 'Start with the weakest part of your foundation first.',
    'Focus on one move that improves consistency, not complexity.',
    'Build momentum before adding more goals.',
  ];
}

function getPillarBreakdownMicrocopy(pillar: string, score: number) {
  if (score >= 75) {
    return 'This area is giving your foundation real support.';
  }

  switch (pillar) {
    case 'income':
      return 'More stability or earning power here would lift the rest of the system.';
    case 'spending':
      return 'Better control here creates room for stronger choices elsewhere.';
    case 'saving':
      return 'A stronger buffer would make the whole system more resilient.';
    case 'investing':
      return 'More consistency here turns today’s progress into long-term growth.';
    case 'debt':
      return 'Less pressure here would improve flexibility quickly.';
    case 'protection':
      return 'Closing the right gap here would make your progress safer.';
    case 'vision':
      return 'Clearer direction here would help align the rest of your choices.';
    default:
      return 'This area still needs more support to strengthen the full foundation.';
  }
}

function getPriorityHeadline(

  pillar: string,
  isBiggest: boolean,
  overallScore: number
) {
  const label = formatPillarName(pillar);

  if (overallScore >= 80 && isBiggest) return `${label} is your next optimization lever.`;
  return isBiggest
    ? `${label} is currently your biggest opportunity.`
    : `${label} is an area to strengthen.`;
}

function getPriorityBody(pillar: string, isBiggest: boolean) {
  switch (pillar) {
    case 'income':
      return isBiggest
        ? 'Your Income building block is currently the weakest part of your foundation. Increasing earning power or stability will unlock faster progress across saving, investing, and long-term growth.'
        : 'Strengthening your Income building block will support continued growth and open up more financial flexibility.';
    case 'spending':
      return isBiggest
        ? 'Your Spending building block is currently the weakest part of your foundation. Better control here can free up margin that improves nearly every other area.'
        : 'Refining your Spending habits will help you keep more of what you earn and direct it toward your goals.';
    case 'saving':
      return isBiggest
        ? 'Your Saving building block is currently the weakest part of your foundation. A stronger buffer would make the whole system more stable and resilient.'
        : 'Strengthening your Saving habits will improve stability and give you more breathing room.';
    case 'investing':
      return isBiggest
        ? 'Your Investing building block is currently the weakest part of your foundation. More consistent investing is how today’s stability becomes long-term wealth.'
        : 'Improving your Investing consistency will strengthen your long-term financial growth.';
    case 'debt':
      return isBiggest
        ? 'Your Debt building block is currently the weakest part of your foundation. Lowering pressure here can quickly improve flexibility, confidence, and momentum.'
        : 'Reducing debt further will continue improving your flexibility and financial confidence.';
    case 'protection':
      return isBiggest
        ? 'Your Protection building block is currently the weakest part of your foundation. Closing the right gaps now helps preserve the progress you have already made.'
        : 'Strengthening your Protection will help safeguard the progress you are making.';
    case 'vision':
      return isBiggest
        ? 'Your Vision building block is currently the weakest part of your foundation. Clearer direction will make your next financial decisions easier to align and follow through on.'
        : 'Refining your Vision will help align your decisions with your long-term goals.';
    default:
      return isBiggest
        ? 'This is currently the weakest part of your foundation and the best place to focus first.'
        : 'This is an area that could still be strengthened to support your overall progress.';
  }
}

function getFallbackPlanStep(pillar: string, rank: number): ActionPlanStep {
  const title =
    rank === 0
      ? `Next: Strengthen ${formatPillarName(pillar)}`
      : `Then focus on ${formatPillarName(pillar)}`;

  switch (pillar) {
    case 'income':
      return {
        title,
        body: 'Focus on increasing income or strengthening income stability. Even a modest improvement here can create a ripple effect across the rest of your foundation.',
        checklist: [
          'Identify one practical way to increase income or stability.',
          'Take one action this week: ask, apply, offer, or start.',
          'Set a target for the next 90 days, even if it starts small.',
        ],
      };
    case 'spending':
      return {
        title,
        body: 'Tighten the categories that are quietly draining progress. Better spending control creates room for every other priority.',
        checklist: [
          'Review the last 90 days of transactions.',
          'Identify the top one or two money leaks.',
          'Redirect the savings toward a real priority.',
        ],
      };
    case 'saving':
      return {
        title,
        body: 'Build more breathing room by making saving more consistent and protecting the habit that funds it.',
        checklist: [
          'Choose a weekly or monthly savings amount.',
          'Automate the transfer if possible.',
          'Track progress once a month for the next 90 days.',
        ],
      };
    case 'investing':
      return {
        title,
        body: 'Make investing more consistent. The goal right now is regular contributions, not complexity.',
        checklist: [
          'Choose a contribution amount you can sustain.',
          'Automate it if possible.',
          'Review progress again in 90 days.',
        ],
      };
    case 'debt':
      return {
        title,
        body: 'Reduce debt pressure by focusing on the balance creating the most friction first.',
        checklist: [
          'List every debt in one place.',
          'Choose the debt that deserves extra attention first.',
          'Make one extra payment this month.',
        ],
      };
    case 'protection':
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
      return {
        title,
        body: 'Clarify what you are actually working toward. When your direction is clear, your next money decisions become easier to align.',
        checklist: [
          'Write down your top financial goal.',
          'Choose one 90-day priority.',
          'Make sure your next major money move supports it.',
        ],
      };
    default:
      return {
        title,
        body: 'Take one concrete step that improves consistency in this area over the next 90 days.',
        checklist: [
          'Choose one next step.',
          'Take action this week.',
          'Review progress after 30 days.',
        ],
      };
  }
}

function getWarningTone(severity: StructuralWarning['severity']) {
  if (severity === 'critical') {
    return {
      card: 'bg-red-50 border-red-200',
      badge: 'bg-red-100 text-red-700',
    };
  }

  return {
    card: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
  };
}

function getWarningTitle(type: StructuralWarning['type']) {
  switch (type) {
    case 'housing_pressure':
      return 'Housing costs are crowding out progress';
    case 'income_constraint':
      return 'Income is the bottleneck right now';
    case 'structural_pressure':
      return 'Your financial structure is under pressure';
    default:
      return 'Foundation stress detected';
  }
}

function getWarningBody(type: StructuralWarning['type']) {
  switch (type) {
    case 'housing_pressure':
      return 'A large share of your income is going toward housing and other must-pay bills. At this level, even good day-to-day budgeting may still feel tight.';
    case 'income_constraint':
      return 'This looks more like a math problem than a discipline problem. Increasing income or lowering a major must-pay bill may create the biggest overall lift.';
    case 'structural_pressure':
      return 'Multiple required payments are competing for limited income. That kind of pressure can make saving, investing, and progress much harder.';
    default:
      return 'One or more fixed-cost pressures are limiting your flexibility right now.';
  }
}

function getWarningAction(type: StructuralWarning['type']) {
  switch (type) {
    case 'housing_pressure':
      return 'Review your housing picture first: rent or mortgage, utilities, and any other fixed obligations tied to your home.';
    case 'income_constraint':
      return 'Look at the two highest-leverage paths: make more money, or reduce the biggest fixed cost in the system.';
    case 'structural_pressure':
      return 'List your major fixed obligations in one place so you can see which pressure point needs to change first.';
    default:
      return 'Start with the fixed cost putting the most pressure on your monthly cash flow.';
  }
}

function formatPercent(value?: number) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return null;
  return `${Math.round(Number(value))}%`;
}

function formatCurrency(value?: number) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return null;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function getFinancialPositionLabel(netWorth?: number | null) {
  if (netWorth === undefined || netWorth === null || Number.isNaN(Number(netWorth))) return 'In progress';
  if (Number(netWorth) < 0) return 'Shaky Foundation';
  if (Number(netWorth) < 25000) return 'Framing Stage';
  return 'Solid Foundation';
}

function getDebtSnapshotLine(metrics?: ResultShape['metrics']) {
  if (!metrics) return null;

  const debtBalance = formatCurrency(metrics.totalDebtBalance);
  const debtPayment = formatCurrency(metrics.monthlyDebtPayments);
  const debtToIncome = formatPercent(metrics.debtToIncomeRatio);

  if (debtBalance && debtPayment && debtToIncome) {
    return `Non-mortgage debt is about ${debtBalance}, with roughly ${debtPayment}/month in payments (${debtToIncome} of take-home pay).`;
  }

  if (debtBalance && debtPayment) {
    return `Non-mortgage debt is about ${debtBalance}, with roughly ${debtPayment}/month in payments.`;
  }

  if (debtBalance) {
    return `Non-mortgage debt is about ${debtBalance}.`;
  }

  return null;
}

function getNetWorthNarrative(metrics?: ResultShape['metrics']) {
  if (
    !metrics ||
    metrics.netWorth === undefined ||
    metrics.netWorth === null ||
    Number.isNaN(Number(metrics.netWorth))
  ) {
    return null;
  }

  const netWorth = Number(metrics.netWorth);
  const debtBalance = formatCurrency(metrics.totalDebtBalance);
  const totalSavings = formatCurrency(metrics.totalSavings);
  const totalInvestments = formatCurrency(metrics.totalInvestments);

  if (netWorth < 0) {
    return `Estimated net worth is ${formatCurrency(netWorth)}. Right now, liabilities still outweigh assets${debtBalance ? `, with about ${debtBalance} of non-mortgage debt still in the picture` : ''}. That makes stabilizing debt and building reserves more important than optimizing elsewhere.`;
  }

  if (netWorth < 25000) {
    return `Estimated net worth is ${formatCurrency(netWorth)}. You are in the framing stage, where${totalSavings ? ` savings of ${totalSavings}` : ' savings'}${totalInvestments ? ` and investments of ${totalInvestments}` : ' and investing progress'} are starting to offset what you owe.`;
  }

  return `Estimated net worth is ${formatCurrency(netWorth)}. You have a real base in place now, which means the opportunity is shifting from pure stability toward strengthening and growing what you already own.`;
}

function getPriorityMetricLine(
  pillar: string,
  metrics?: ResultShape['metrics']
) {
  if (!metrics) return null;

  switch (pillar) {
    case 'debt': {
      const balance = formatCurrency(metrics.totalDebtBalance);
      const payment = formatCurrency(metrics.monthlyDebtPayments);
      if (balance && payment) {
        return `About ${balance} of non-mortgage debt and roughly ${payment}/month in payments are still creating pressure here.`;
      }
      if (balance) {
        return `About ${balance} of non-mortgage debt is still sitting in this part of the house.`;
      }
      return null;
    }
    case 'saving': {
      const savings = formatCurrency(metrics.totalSavings);
      if (savings) {
        return `Liquid savings are currently about ${savings}.`;
      }
      return null;
    }
    case 'investing': {
      const investments = formatCurrency(metrics.totalInvestments);
      if (investments) {
        return `Investments are currently about ${investments}.`;
      }
      return null;
    }
    case 'income': {
      const income = formatCurrency(metrics.monthlyIncome);
      if (income) {
        return `Monthly take-home income is currently about ${income}.`;
      }
      return null;
    }
    default:
      return null;
  }
}

function getMetricsCallout(metrics?: ResultShape['metrics']) {
  if (!metrics) return null;

  const lines = [
    metrics.monthlyFixedCosts
      ? `About ${formatCurrency(metrics.monthlyFixedCosts)} of your money is already committed each month.`
      : null,
    getDebtSnapshotLine(metrics),
    metrics.totalSavings
      ? `Liquid savings are about ${formatCurrency(metrics.totalSavings)}.`
      : null,
    metrics.netWorth || metrics.netWorth === 0
      ? `Estimated net worth is ${formatCurrency(metrics.netWorth)}.`
      : null,
  ].filter(Boolean);

  return lines.length ? lines.slice(0, 2).join(' ') : null;
}

function getStructuralBestNextMove(
  warnings: StructuralWarning[],
  metrics?: ResultShape['metrics'],
  fallbackPillar?: string
) {
  const fixedCost = formatPercent(metrics?.fixedCostPressureRatio);
  const debtToIncome = formatPercent(metrics?.debtToIncomeRatio);

  const cashMonths = Number(metrics?.emergencyFundMonths ?? 0);
  const excessCash = Number(metrics?.excessCashEstimate ?? 0);
  const netWorth = Number(metrics?.netWorth ?? 0);
  const investments = Number(metrics?.totalInvestments ?? 0);
  const investingRate = Number(metrics?.investmentContributionRate ?? metrics?.savingsRate ?? 0);

  if ((cashMonths >= 24 || excessCash > 0) && (netWorth >= 250000 || investments >= 100000)) {
    return {
      title: 'Optimize your excess cash',
      intro:
        'Your foundation is strong. The next opportunity is less about survival and more about making sure the money you already have is working efficiently.',
      rightNow: [
        cashMonths > 0
          ? `Your cash cushion covers about ${cashMonths.toFixed(1)} months of core expenses.`
          : 'Your cash reserve appears stronger than a typical emergency fund target.',
        excessCash > 0
          ? `Roughly ${formatCurrency(excessCash)} may be above a 12-month cash reserve target.`
          : 'Some cash may be better positioned in higher-yield savings, investments, or another priority.',
      ],
      whyThisMatters:
        'Cash creates safety, but excess idle cash can quietly slow long-term growth. The goal is not to drain your cushion — it is to define enough and put the rest to work intentionally.',
      nextStep:
        'Choose the cash reserve target that still feels safe, then redirect excess cash in stages toward higher-yield savings, investments, or another high-priority goal.',
      thisWeek: [
        'Decide how many months of expenses you want to keep in cash.',
        'Identify how much is above that target.',
        'Choose one staged move for the excess: HYSA, brokerage, Roth, debt, or another priority.',
      ],
    };
  }

  if (netWorth >= 250000 && investingRate >= 10) {
    return {
      title: 'Move from building to optimizing',
      intro:
        'You already have a strong foundation. The next move is making sure your cash, tax buckets, investments, and real estate are working together efficiently.',
      rightNow: [
        investments > 0 ? `Investments are about ${formatCurrency(investments)}.` : 'Your investing habit appears strong.',
        investingRate > 0 ? `You are investing roughly ${Math.round(investingRate)}% of take-home income.` : 'Your next opportunity is allocation and efficiency.',
      ],
      whyThisMatters:
        'At this stage, small allocation and tax-location improvements can matter more than another generic budgeting tip.',
      nextStep:
        'Review your cash target, Roth/pre-tax/taxable mix, and asset allocation before adding more complexity.',
      thisWeek: [
        'Review how much sits in cash versus investments and home equity.',
        'Check whether your Roth, pre-tax, and taxable balances are aligned with your goals.',
        'Choose one optimization move for the next 90 days.',
      ],
    };
  }

  if (warnings.some((warning) => warning.type === 'income_constraint')) {
    return fixedCost
      ? `Your mortgage/rent, utilities, and other must-pay bills are about ${fixedCost} of take-home pay. That is high enough that budgeting alone may not solve the problem. Your highest-leverage move is to raise income, lower a major bill, or do both.`
      : 'This looks more like a math problem than a discipline problem. Your highest-leverage move is to raise income, lower a major must-pay bill, or do both.';
  }

  if (warnings.some((warning) => warning.type === 'housing_pressure')) {
    return fixedCost
      ? `Your mortgage/rent, utilities, and other must-pay bills are about ${fixedCost} of take-home pay. Start with the bill taking the biggest bite before expecting small spending cuts to carry the load.`
      : 'Start with the must-pay bill taking the biggest bite, especially housing or utilities, before expecting small spending cuts to carry the load.';
  }

  if (warnings.some((warning) => warning.type === 'structural_pressure')) {
    return debtToIncome
      ? `Your debt payments are about ${debtToIncome} of take-home pay on top of your other must-pay bills. Reduce the stacked payments first so cash flow can breathe again.`
      : 'Multiple required payments are competing for limited income. Reduce the stacked pressure points first so cash flow can breathe again.';
  }

  return fallbackPillar
    ? getBestNextMoveText(fallbackPillar)
    : 'Start with the weakest part of your foundation first and make one move that increases consistency.';
}

function getStructuralContextNote(
  warnings: StructuralWarning[],
  metrics?: ResultShape['metrics']
) {
  if (!warnings.length) return null;

  const fixedCost = formatPercent(metrics?.fixedCostPressureRatio);
  const housing = formatCurrency(metrics?.monthlyHousingCost);
  const utilities = formatCurrency(metrics?.monthlyUtilities);
  const debt = formatCurrency(metrics?.monthlyDebtPayments);

  const pieces = [
    fixedCost ? `must-pay monthly bills are about ${fixedCost} of take-home pay` : null,
    housing ? `housing is about ${housing}/month` : null,
    utilities ? `utilities are about ${utilities}/month` : null,
    debt ? `non-housing debt payments are about ${debt}/month` : null,
  ].filter(Boolean);

  if (!pieces.length) {
    return 'Your Stress Test suggests the biggest issue is structural. Solve the math problem first, then keep strengthening the weaker pillars underneath it.';
  }

  return `Your Stress Test suggests the biggest issue is structural: ${pieces.join(', ')}. Solve the math problem first, then keep strengthening the weaker pillars underneath it.`;
}

function getWarningBodyWithMetrics(
  warning: StructuralWarning,
  metrics?: ResultShape['metrics']
) {
  const fixedCost = formatPercent(metrics?.fixedCostPressureRatio);
  const housing = formatCurrency(metrics?.monthlyHousingCost);
  const utilities = formatCurrency(metrics?.monthlyUtilities);
  const debtToIncome = formatPercent(metrics?.debtToIncomeRatio);
  const debtPayment = formatCurrency(metrics?.monthlyDebtPayments);

  switch (warning.type) {
    case 'housing_pressure':
      if (fixedCost || housing || utilities) {
        return `Your must-pay monthly bills are running at about ${fixedCost ?? 'a high share'} of take-home pay${housing ? `, with housing around ${housing}/month` : ''}${utilities ? ` and utilities around ${utilities}/month` : ''}. At this level, even good day-to-day budgeting may still feel tight because too much income is already committed.`;
      }
      return getWarningBody(warning.type);
    case 'income_constraint':
      if (fixedCost) {
        return `Your mortgage/rent, utilities, and other must-pay bills are taking about ${fixedCost} of take-home pay. This looks more like a math problem than a discipline problem. Increasing income or lowering a major bill may create the biggest overall lift.`;
      }
      return getWarningBody(warning.type);
    case 'structural_pressure':
      if (debtToIncome || debtPayment) {
        return `Debt payments and must-pay bills are stacking up. Non-housing debt payments are about ${debtPayment ?? 'a meaningful amount each month'}${debtToIncome ? `, or roughly ${debtToIncome} of take-home pay` : ''}. That kind of pressure can make saving, investing, and progress much harder.`;
      }
      return getWarningBody(warning.type);
    default:
      return getWarningBody(warning.type);
  }
}

function SectionShell({
  icon: Icon,
  title,
  children,
  className = '',
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      data-pdf-card="true"
      className={`bg-white/95 backdrop-blur rounded-3xl border border-white/10 shadow-sm p-5 md:p-7 ${className}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-copper-600" />
        <h2 className="text-xl md:text-2xl font-bold text-navy-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}



function ReportMiniBarChart({ entries }: { entries: [string, number][] }) {
  const chartEntries = entries.slice(0, 7);

  if (!chartEntries.length) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-copper-200">
            Building Block Balance
          </div>
          <div className="mt-1 text-sm text-white/60">
            Where the foundation is strongest and where the next lift comes from.
          </div>
        </div>
        <TrendingUp className="h-5 w-5 text-copper-200" />
      </div>

      <div className="space-y-3">
        {chartEntries.map(([pillar, value]) => {
          const score = Math.max(0, Math.min(100, Number(value) || 0));
          const tone = getPillarTone(score);

          return (
            <div key={`summary-chart-${pillar}`}>
              <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-white/85">{formatPillarName(pillar)}</span>
                <span className="font-bold text-copper-100">{score}/100</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className={`h-full ${tone.bar}`} style={{ width: `${Math.max(5, score)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getReportSummaryCards({
  summary,
  metrics,
  bestNextMoveCard,
  score,
}: {
  summary: string;
  metrics?: ResultShape['metrics'];
  bestNextMoveCard: BestNextMoveCard;
  score: number;
}) {
  const cashMonths = Number(metrics?.emergencyFundMonths ?? 0);
  const netWorth = metrics?.netWorth || metrics?.netWorth === 0 ? formatCurrency(metrics.netWorth) : null;
  const fixedCost = formatPercent(metrics?.fixedCostPressureRatio);
  const savings = metrics?.totalSavings ? formatCurrency(metrics.totalSavings) : null;
  const debtPayments = metrics?.monthlyDebtPayments ? formatCurrency(metrics.monthlyDebtPayments) : null;
  const investments = metrics?.totalInvestments ? formatCurrency(metrics.totalInvestments) : null;

  const positionTitle =
    score >= 80
      ? 'Your foundation is strong — now the work is optimization.'
      : score >= 60
        ? 'You have momentum, but one or two gaps are still creating drag.'
        : score >= 40
          ? 'The foundation is forming, but it still needs reinforcement.'
          : 'Stability comes first before growth becomes the focus.';

  const positionBody =
    summary ||
    (score >= 80
      ? 'You are past the basics. The next level is making sure your cash, debt, investing, protection, and vision are working together efficiently instead of simply looking good in isolation.'
      : score >= 60
        ? 'The report suggests you are not starting from zero. Your best progress will come from focusing on the constraint that is limiting the rest of the system, rather than spreading effort across every category at once.'
        : score >= 40
          ? 'There are real pieces to build on, but the weak spots are still strong enough to affect day-to-day confidence. The priority now is creating breathing room and consistency before adding complexity.'
          : 'The most important goal is to reduce pressure and create a small amount of control. The right first move can make the rest of the plan feel much more manageable.');

  const numbersTitle =
    netWorth
      ? `${netWorth} estimated net worth`
      : savings
        ? `${savings} liquid savings`
        : debtPayments
          ? `${debtPayments}/month debt payments`
          : 'Your money picture';

  const numbersBody =
    cashMonths > 0
      ? `Your cash cushion covers about ${cashMonths.toFixed(1)} months of core expenses${fixedCost ? `, while mortgage/rent, utilities, and must-pay bills are taking about ${fixedCost} of take-home pay` : ''}. That combination tells us whether the next move should focus on safety, margin, or optimization.`
      : fixedCost
        ? `Mortgage/rent, utilities, and other must-pay bills are running around ${fixedCost} of take-home pay${debtPayments ? `, with debt payments near ${debtPayments}/month` : ''}. That shows how much room is left to save, invest, and absorb surprises.`
        : investments
          ? `Investments are about ${investments}. The question now is whether your current contribution habit and cash reserve are aligned with the future you want.`
          : 'The numbers below provide context for the recommendation. The goal is not more information — it is choosing the next move with confidence.';

  return [
    {
      label: 'Executive Read',
      title: positionTitle,
      body: positionBody,
    },
    {
      label: 'What The Numbers Are Saying',
      title: numbersTitle,
      body: numbersBody,
    },
    {
      label: 'Decision Point',
      title: bestNextMoveCard.title,
      body: bestNextMoveCard.nextStep,
    },
  ];
}

type ComparisonMetric = {
  label: string;
  status: 'ahead' | 'strong' | 'average' | 'watch';
  headline: string;
  detail: string;
  myValue: number;
  benchmarkValue: number;
  myLabel: string;
  benchmarkLabel: string;
  unit: 'currency' | 'percent' | 'score';
};

function normalizePercentMetric(value?: number) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return 0;
  const numeric = Number(value);
  return numeric > 1 ? numeric : numeric * 100;
}

function getBenchmarkProfileLabel(answers?: Record<string, any>) {
  const ageRange = answers?.ageRange || answers?.age || answers?.householdAgeRange || answers?.lifeStage;
  const marital = answers?.maritalStatus || answers?.relationshipStatus;
  const dependents = answers?.dependents || answers?.numberOfDependents || answers?.hasDependents;

  const pieces = [];
  if (ageRange && typeof ageRange === 'string') pieces.push(String(ageRange).replaceAll('_', ' '));
  if (marital && typeof marital === 'string') pieces.push(String(marital).replaceAll('_', ' '));
  if (dependents === 0 || dependents === '0' || dependents === false || dependents === 'no') pieces.push('no dependents');

  return pieces.length ? pieces.join(' / ') : 'similar U.S. households';
}

function getAgeBasedNetWorthBenchmark(answers?: Record<string, any>) {
  const raw = String(answers?.ageRange || answers?.age || answers?.householdAgeRange || '').toLowerCase();
  if (raw.includes('65') || raw.includes('retired')) return 410000;
  if (raw.includes('55') || raw.includes('55-64') || raw.includes('55_64')) return 364000;
  if (raw.includes('45') || raw.includes('45-54') || raw.includes('45_54')) return 250000;
  if (raw.includes('35') || raw.includes('35-44') || raw.includes('35_44')) return 135000;
  if (raw.includes('25') || raw.includes('25-34') || raw.includes('25_34')) return 40000;
  return 192000;
}

function formatComparisonValue(value: number, unit: ComparisonMetric['unit']) {
  if (unit === 'currency') return formatCurrency(value) || '$0';
  if (unit === 'percent') return `${Math.round(value)}%`;
  return `${Math.round(value)}/100`;
}

function getHouseholdComparisonMetrics(
  metrics: ResultShape['metrics'] | undefined,
  score: number,
  answers?: Record<string, any>
): ComparisonMetric[] {
  const netWorth = Number(metrics?.netWorth ?? 0);
  const nonMortgageDebt = Number(metrics?.totalDebtBalance ?? 0);
  const fixedCostRatio = normalizePercentMetric(metrics?.fixedCostPressureRatio);
  const savingsRate = normalizePercentMetric(metrics?.savingsRate);
  const investingRate = normalizePercentMetric(metrics?.investmentContributionRate);
  const netWorthBenchmark = getAgeBasedNetWorthBenchmark(answers);

  const debtBenchmark = 6500;
  const savingsBenchmark = 5;
  const investingBenchmark = 10;
  const fixedCostBenchmark = 50;

  return [
    {
      label: 'Net Worth',
      status: netWorth >= netWorthBenchmark * 1.5 ? 'ahead' : netWorth >= netWorthBenchmark ? 'strong' : netWorth >= netWorthBenchmark * 0.65 ? 'average' : 'watch',
      headline:
        netWorth >= netWorthBenchmark
          ? 'Ahead of the typical household benchmark'
          : 'Below the typical household benchmark',
      detail: `Your estimated net worth is compared against a broad age-based U.S. household benchmark. This is directional, not a precise percentile.`,
      myValue: netWorth,
      benchmarkValue: netWorthBenchmark,
      myLabel: 'You',
      benchmarkLabel: 'Typical benchmark',
      unit: 'currency',
    },
    {
      label: 'Consumer Debt',
      status: nonMortgageDebt <= 0 ? 'ahead' : nonMortgageDebt <= debtBenchmark ? 'strong' : nonMortgageDebt <= debtBenchmark * 2 ? 'average' : 'watch',
      headline:
        nonMortgageDebt <= 0
          ? 'Better than most: no consumer debt showing'
          : nonMortgageDebt <= debtBenchmark
            ? 'Debt payments look manageable'
            : 'Debt payments may be stealing room from your goals',
      detail: 'This compares non-mortgage debt only — credit cards, car loans, personal loans, and similar balances. Lower debt usually means fewer monthly payments competing with saving, investing, and breathing room.',
      myValue: nonMortgageDebt,
      benchmarkValue: debtBenchmark,
      myLabel: 'You',
      benchmarkLabel: 'Common benchmark',
      unit: 'currency',
    },
    {
      label: 'Savings Rate',
      status: savingsRate >= 15 ? 'ahead' : savingsRate >= 10 ? 'strong' : savingsRate >= savingsBenchmark ? 'average' : 'watch',
      headline:
        savingsRate >= 10
          ? 'You are keeping more of your income than many households'
          : 'More of your income needs to stay with you',
      detail: 'Savings rate means how much of your income you are actually keeping. A stronger savings rate creates more safety, more options, and more progress toward future goals.',
      myValue: savingsRate,
      benchmarkValue: savingsBenchmark,
      myLabel: 'You',
      benchmarkLabel: 'Typical range',
      unit: 'percent',
    },
    {
      label: 'Investing Rate',
      status: investingRate >= 15 ? 'ahead' : investingRate >= investingBenchmark ? 'strong' : investingRate >= 5 ? 'average' : 'watch',
      headline:
        investingRate >= investingBenchmark
          ? 'Your investing habit looks stronger than average'
          : 'Investing more consistently would help future growth',
      detail: 'Investing rate means how much of today’s income is being sent toward future freedom. This uses your reported monthly investing contribution when available.',
      myValue: investingRate,
      benchmarkValue: investingBenchmark,
      myLabel: 'You',
      benchmarkLabel: 'Strong target',
      unit: 'percent',
    },
    {
      label: 'Fixed Cost Load',
      status: fixedCostRatio <= 45 ? 'ahead' : fixedCostRatio <= fixedCostBenchmark ? 'strong' : fixedCostRatio <= 70 ? 'watch' : 'watch',
      headline:
        fixedCostRatio <= fixedCostBenchmark
          ? 'Your must-pay monthly bills are in a workable range'
          : 'Your mortgage, rent, or fixed bills are taking too much room',
      detail: 'Fixed Cost Load means the bills that are mostly spoken for before the month starts — housing, utilities, required payments, and other fixed obligations. When this is high, even good spending habits can still feel tight.',
      myValue: fixedCostRatio,
      benchmarkValue: fixedCostBenchmark,
      myLabel: 'You',
      benchmarkLabel: 'Healthy target',
      unit: 'percent',
    },
  ];
}

function getComparisonTone(status: ComparisonMetric['status']) {
  if (status === 'ahead') return { badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', label: 'Ahead' };
  if (status === 'strong') return { badge: 'bg-teal-100 text-teal-700', dot: 'bg-teal-500', label: 'Strong' };
  if (status === 'average') return { badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', label: 'Typical' };
  return { badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500', label: 'Watch' };
}

function getComparisonNarrative(metrics: ComparisonMetric[]) {
  const strongCount = metrics.filter((metric) => metric.status === 'ahead' || metric.status === 'strong').length;
  const watchCount = metrics.filter((metric) => metric.status === 'watch').length;

  if (strongCount >= 4) {
    return 'You are ahead of similar households in several key areas. The opportunity now is optimization: making sure the foundation you have built is working as efficiently as possible.';
  }

  if (strongCount >= 2) {
    return 'You are in a solid position compared to similar households, but one or two pressure points are still limiting the full strength of your foundation.';
  }

  if (watchCount >= 3) {
    return 'You are still building the foundation. The advantage is clarity: the gaps are visible now, which makes the next move easier to prioritize.';
  }

  return 'Your comparison profile is mixed, which is normal. Use the stronger areas as support while you focus on the one metric most likely to create breathing room.';
}

function getComparisonPlainLabel(label: string) {
  switch (label) {
    case 'Net Worth':
      return 'net worth';
    case 'Consumer Debt':
      return 'consumer debt';
    case 'Savings Rate':
      return 'how much income you are keeping';
    case 'Investing Rate':
      return 'how much you are putting toward future growth';
    case 'Fixed Cost Load':
      return 'mortgage/rent, utilities, and other must-pay bills';
    default:
      return label.toLowerCase();
  }
}

function getComparisonHelperLine(label: string) {
  switch (label) {
    case 'Net Worth':
      return 'Assets minus what you owe';
    case 'Consumer Debt':
      return 'Credit cards, car loans, and other non-mortgage debt';
    case 'Savings Rate':
      return 'How much income stays with you';
    case 'Investing Rate':
      return 'How much goes toward future growth';
    case 'Fixed Cost Load':
      return 'Mortgage/rent, utilities, and must-pay bills';
    default:
      return 'Part of your overall financial picture';
  }
}

function getComparisonWhyItMatters(metric?: ComparisonMetric) {
  if (!metric) return 'Use the comparison as a guide for where to focus next, not as a grade.';

  switch (metric.label) {
    case 'Net Worth':
      return 'This shows whether your assets are pulling ahead of what you owe. It is one of the clearest signs that your foundation is gaining strength.';
    case 'Consumer Debt':
      return 'Debt pressure is really about monthly payments. The lower those payments are, the more room you have for saving, investing, and choices.';
    case 'Savings Rate':
      return 'This shows how much of your income stays with you instead of leaving every month. Higher usually means faster progress and more safety.';
    case 'Investing Rate':
      return 'This shows how much of today’s income is being pointed toward future growth, especially important for households approaching retirement.';
    case 'Fixed Cost Load':
      return 'This is your mortgage or rent, utilities, and other bills that are hard to change quickly. When they take too much income, everything else feels tight.';
    default:
      return 'This area helps explain where your money has the most room to improve.';
  }
}

function getComparisonTakeaway(metrics: ComparisonMetric[]) {
  const strongMetrics = metrics.filter((metric) => metric.status === 'ahead' || metric.status === 'strong');
  const watchMetrics = metrics.filter((metric) => metric.status === 'watch');
  const typicalMetrics = metrics.filter((metric) => metric.status === 'average');
  const strongest = strongMetrics[0] ?? metrics[0];
  const needsAttention = watchMetrics[0] ?? typicalMetrics[0] ?? null;

  if (strongMetrics.length >= 4) {
    return {
      headline: 'You have more working than most people in your situation.',
      body: needsAttention
        ? `Your strongest signal is ${getComparisonPlainLabel(strongest.label)}. The area to keep an eye on is ${getComparisonPlainLabel(needsAttention.label)}.`
        : `Your strongest signal is ${getComparisonPlainLabel(strongest.label)}. The next step is making the strong parts work together more efficiently.`,
      nextMove: 'Do not chase every improvement at once. Pick the one area that creates the most room or growth over the next 90 days.',
      strongest,
      needsAttention,
    };
  }

  if (strongMetrics.length >= 2) {
    return {
      headline: 'You are in a solid spot, but there is still one place holding things back.',
      body: needsAttention
        ? `You are doing well with ${getComparisonPlainLabel(strongest.label)}, but ${getComparisonPlainLabel(needsAttention.label)} deserves attention next.`
        : `You are doing well with ${getComparisonPlainLabel(strongest.label)}. The next step is turning that strength into more consistency across the full foundation.`,
      nextMove: 'Use your stronger areas as the base, then focus on the one pressure point that would make day-to-day money feel easier.',
      strongest,
      needsAttention,
    };
  }

  return {
    headline: 'The comparison shows where to start, not that you are behind forever.',
    body: needsAttention
      ? `The first area to improve is ${getComparisonPlainLabel(needsAttention.label)}. That is likely where progress will feel most noticeable.`
      : 'Your numbers are mixed, which is normal. The goal now is to choose one place to build momentum.',
    nextMove: 'Start with the area that creates the most breathing room, then build from there.',
    strongest,
    needsAttention,
  };
}

function getSnapshotPrimaryConstraint(
  warnings: StructuralWarning[],
  weakestPillar: string,
  bestNextMoveCard: BestNextMoveCard
) {
  if (warnings.some((warning) => warning.type === 'income_constraint')) return 'Income or must-pay bills are limiting progress';
  if (warnings.some((warning) => warning.type === 'housing_pressure')) return 'Mortgage/rent and fixed bills are taking too much room';
  if (warnings.some((warning) => warning.type === 'structural_pressure')) return 'Too many required payments are stacking up';
  if (bestNextMoveCard.title.toLowerCase().includes('excess cash')) return 'Idle cash may be slowing long-term growth';
  if (weakestPillar) return `${formatPillarName(weakestPillar)} needs the most attention`;
  return 'One focused move will create the clearest progress';
}

function getSnapshotFocus(bestNextMoveCard: BestNextMoveCard) {
  if (bestNextMoveCard.title.toLowerCase().includes('excess cash')) return 'Define enough cash, then put excess money to work in stages';
  if (bestNextMoveCard.title.toLowerCase().includes('breathing') || bestNextMoveCard.title.toLowerCase().includes('fixed')) return 'Create more monthly breathing room before adding complexity';
  return bestNextMoveCard.nextStep;
}


function FoundationScoreBubble({
  score,
  scoreBand,
}: {
  score: number;
  scoreBand: ReturnType<typeof getScoreBand>;
}) {
  return (
    <div className="flex flex-col items-center lg:items-start lg:pt-1">
      <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-[#ffe7c7] via-[#d79553] to-[#8f5427] p-1 shadow-[inset_0_3px_16px_rgba(255,255,255,0.62),inset_0_-20px_30px_rgba(85,38,12,0.4),0_24px_70px_rgba(194,120,58,0.46)] ring-1 ring-white/40 md:h-44 md:w-44">
        <div className="absolute left-8 top-7 h-12 w-20 rounded-full bg-white/35 blur-xl" />
        <div className="absolute inset-3 rounded-full border border-white/30 bg-gradient-to-br from-white/22 via-transparent to-black/12" />
        <div className="relative text-center">
          <div className="text-[3.4rem] font-black leading-none tracking-tight text-white drop-shadow-[0_5px_12px_rgba(65,31,10,0.42)] md:text-[4.35rem]">
            {score}
          </div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/80">
            Score
          </div>
        </div>
      </div>

      <div className="mt-4 text-center lg:text-left">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-copper-200">
          Foundation Score
        </div>
        <div className="mt-2 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-bold text-white/90 shadow-sm">
          {scoreBand.label}
        </div>
        <p className="mt-3 max-w-[15rem] text-sm leading-6 text-white/78">
          This is the main number for the report — a quick read on the strength of your overall financial foundation.
        </p>
      </div>
    </div>
  );
}

function ReportSnapshotRow({
  score,
  metrics,
  weakestPillar,
  warnings,
  bestNextMoveCard,
}: {
  score: number;
  metrics?: ResultShape['metrics'];
  weakestPillar: string;
  warnings: StructuralWarning[];
  bestNextMoveCard: BestNextMoveCard;
}) {
  const cashMonths = Number(metrics?.emergencyFundMonths ?? 0);
  const fixedCost = formatPercent(metrics?.fixedCostPressureRatio);
  const position = score >= 80 ? 'Strong base' : score >= 60 ? 'Building momentum' : score >= 40 ? 'Needs reinforcement' : 'Stabilize first';
  const primaryConstraint = getSnapshotPrimaryConstraint(warnings, weakestPillar, bestNextMoveCard);
  const ninetyDayFocus = getSnapshotFocus(bestNextMoveCard);

  const snapshotItems = [
    {
      label: 'Your Position',
      value: position,
      helper: cashMonths > 0 ? `${cashMonths.toFixed(1)} months of cash cushion` : 'Based on your Foundation Score',
    },
    {
      label: 'Main Pressure Point',
      value: primaryConstraint,
      helper: fixedCost ? `Must-pay monthly bills: ${fixedCost} of take-home pay` : 'This is where progress may feel stuck',
    },
    {
      label: '90-Day Focus',
      value: ninetyDayFocus,
      helper: 'Keep the next step simple and visible',
    },
  ];

  return (
    <div
      data-pdf-dark-card="true"
      data-pdf-page-break-avoid="true"
      className="rounded-3xl border border-white/10 bg-white/[0.055] p-4 md:p-5 shadow-[0_16px_46px_rgba(0,0,0,0.18)]"
    >
      <div className="mb-3 flex items-center gap-2">
        <Clock3 className="h-4 w-4 text-copper-200" />
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-copper-200">
          Report Snapshot
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {snapshotItems.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">{item.label}</div>
            <div className="mt-2 text-sm font-bold leading-6 text-white md:text-base">{item.value}</div>
            <div className="mt-2 text-xs leading-5 text-white/60">{item.helper}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparisonBar({ metric }: { metric: ComparisonMetric }) {
  const maxValue = Math.max(metric.myValue, metric.benchmarkValue, 1);
  const myWidth = Math.max(4, Math.min(100, (metric.myValue / maxValue) * 100));
  const benchmarkWidth = Math.max(4, Math.min(100, (metric.benchmarkValue / maxValue) * 100));
  const lowerIsBetter = metric.label === 'Consumer Debt' || metric.label === 'Fixed Cost Load';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <div className="font-bold text-navy-900">{metric.label}</div>
          <div className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{getComparisonHelperLine(metric.label)}</div>
          <div className="mt-1 text-sm text-slate-600">{metric.headline}</div>
        </div>
        <span className="rounded-full bg-copper-50 px-3 py-1 text-xs font-semibold text-copper-700">
          {lowerIsBetter ? 'Lower is better' : 'Higher is better'}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <div className="mb-1 flex justify-between text-xs font-semibold text-copper-700">
            <span>{metric.myLabel}</span>
            <span>{formatComparisonValue(metric.myValue, metric.unit)}</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full bg-copper-600" style={{ width: `${myWidth}%` }} />
          </div>
        </div>

        <div>
          <div className="mb-1 flex justify-between text-xs font-semibold text-navy-800">
            <span>{metric.benchmarkLabel}</span>
            <span>{formatComparisonValue(metric.benchmarkValue, metric.unit)}</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full bg-navy-800" style={{ width: `${benchmarkWidth}%` }} />
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">{metric.detail}</p>
    </div>
  );
}

function HouseholdComparisonSection({
  profileLabel,
  comparisonMetrics,
  onMoreInfo,
}: {
  profileLabel: string;
  comparisonMetrics: ComparisonMetric[];
  onMoreInfo: () => void;
}) {
  const aheadCount = comparisonMetrics.filter((item) => item.status === 'ahead' || item.status === 'strong').length;
  const watchCount = comparisonMetrics.filter((item) => item.status === 'watch').length;
  const comparisonTakeaway = getComparisonTakeaway(comparisonMetrics);
  const strongestTone = comparisonTakeaway.strongest ? getComparisonTone(comparisonTakeaway.strongest.status) : null;
  const watchTone = comparisonTakeaway.needsAttention ? getComparisonTone(comparisonTakeaway.needsAttention.status) : null;

  return (
    <section
      data-pdf-card="true"
      className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/95 via-copper-50/95 to-white/95 p-5 shadow-[0_20px_60px_rgba(15,42,68,0.18)] md:p-7"
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
        <div className="flex flex-col">
          <div className="inline-flex w-fit items-center rounded-full bg-copper-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-copper-800">
            How You Compare
          </div>
          <h2 className="mt-4 text-2xl font-bold text-navy-900 md:text-3xl">
            Compared to households like yours, here’s where you stand.
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            This section gives your numbers some real-world context. It is not a grade, and it is not meant to make you chase averages. It helps answer a simple question: where are you already doing well, and where would one improvement make life feel easier?
          </p>

          <div className="mt-4 rounded-2xl border border-copper-200 bg-white/80 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-copper-700">Comparison group</div>
            <div className="mt-1 text-lg font-bold capitalize text-navy-900">{profileLabel}</div>
            <div className="mt-2 text-sm leading-6 text-slate-600">
              {aheadCount} of {comparisonMetrics.length} areas look strong or ahead. {watchCount ? `${watchCount} area${watchCount > 1 ? 's' : ''} could use attention.` : 'No major comparison warnings triggered.'}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-copper-200 bg-white/75 p-4 text-sm font-semibold leading-7 text-navy-900">
            {getComparisonNarrative(comparisonMetrics)}
          </div>
        </div>

        <div className="rounded-3xl border border-copper-200 bg-white/85 p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-copper-700">
                Your Comparison Takeaway
              </div>
              <h3 className="mt-2 text-xl font-bold leading-tight text-navy-900">
                {comparisonTakeaway.headline}
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {comparisonTakeaway.body}
              </p>
            </div>

            <button
              onClick={onMoreInfo}
              className="inline-flex shrink-0 items-center justify-center rounded-full border border-copper-200 bg-copper-50 px-4 py-2 text-sm font-bold text-copper-800 shadow-sm transition-colors hover:bg-copper-100"
            >
              More Info →
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {comparisonTakeaway.strongest && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Working Well</div>
                  {strongestTone && (
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${strongestTone.badge}`}>
                      {strongestTone.label}
                    </span>
                  )}
                </div>
                <div className="mt-2 text-lg font-black text-navy-900">
                  {formatComparisonValue(comparisonTakeaway.strongest.myValue, comparisonTakeaway.strongest.unit)}
                </div>
                <div className="mt-1 text-sm font-semibold text-navy-900">{comparisonTakeaway.strongest.label}</div>
                <p className="mt-2 text-xs leading-5 text-slate-600">
                  {getComparisonWhyItMatters(comparisonTakeaway.strongest)}
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">
                  {comparisonTakeaway.needsAttention ? 'Keep An Eye On' : 'Next Layer'}
                </div>
                {watchTone && (
                  <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${watchTone.badge}`}>
                    {watchTone.label}
                  </span>
                )}
              </div>
              <div className="mt-2 text-lg font-black text-navy-900">
                {comparisonTakeaway.needsAttention
                  ? formatComparisonValue(comparisonTakeaway.needsAttention.myValue, comparisonTakeaway.needsAttention.unit)
                  : 'Stay consistent'}
              </div>
              <div className="mt-1 text-sm font-semibold text-navy-900">
                {comparisonTakeaway.needsAttention?.label ?? 'Keep building the strong parts'}
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                {getComparisonWhyItMatters(comparisonTakeaway.needsAttention ?? comparisonTakeaway.strongest)}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-copper-200 bg-copper-50/70 p-4">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-copper-700">What to do with this</div>
            <p className="mt-2 text-sm font-semibold leading-7 text-navy-900">
              {comparisonTakeaway.nextMove}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {comparisonMetrics.map((metric) => {
          const tone = getComparisonTone(metric.status);
          return (
            <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} />
                <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${tone.badge}`}>
                  {tone.label}
                </span>
              </div>
              <div className="mt-3 text-sm font-bold text-navy-900">{metric.label}</div>
              <div className="mt-1 text-[11px] leading-4 text-slate-500">{getComparisonHelperLine(metric.label)}</div>
              <div className="mt-2 text-xl font-black text-copper-700">
                {formatComparisonValue(metric.myValue, metric.unit)}
              </div>
              <div className="mt-1 text-xs leading-5 text-slate-500">
                vs {formatComparisonValue(metric.benchmarkValue, metric.unit)} benchmark
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 border-t border-copper-200 pt-4">
        <p className="text-sm leading-6 text-slate-600">
          Benchmarks are a context layer. The goal is not to be average — it is to know which move gives you the most confidence and breathing room from here.
        </p>
      </div>
    </section>
  );
}

function HouseholdComparisonModal({
  comparisonMetrics,
  profileLabel,
  onClose,
}: {
  comparisonMetrics: ComparisonMetric[];
  profileLabel: string;
  onClose: () => void;
}) {
  return (
    <div data-pdf-ignore="true" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="max-h-[88vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-slate-50 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/95 p-5 backdrop-blur">
          <div>
            <div className="inline-flex rounded-full bg-copper-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-copper-700">
              Comparison Details
            </div>
            <h3 className="mt-3 text-2xl font-bold text-navy-900">How the benchmarks are read</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Compared against {profileLabel}. These are broad, directional benchmarks for decision support — not exact percentile rankings.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2">
          {comparisonMetrics.map((metric) => (
            <ComparisonBar key={`modal-${metric.label}`} metric={metric} />
          ))}
        </div>

        <div className="border-t border-slate-200 bg-white p-5">
          <div className="rounded-2xl border border-copper-200 bg-copper-50 p-4">
            <div className="font-bold text-navy-900">How to use this</div>
            <p className="mt-2 text-sm leading-7 text-slate-700">
              This comparison helps you identify leverage. If you are ahead, focus on optimization and efficiency. If you are typical, focus on consistency. If you are behind, focus on the structural issue first. The goal is not to match averages — it is to know where your next move creates the most impact.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getNinetyDayPlanPhases(
  bestNextMoveCard: BestNextMoveCard,
  weakestPillar: string,
  metrics?: ResultShape['metrics']
): ActionPlanStep[] {
  const cashMonths = Number(metrics?.emergencyFundMonths ?? 0);
  const excessCash = Number(metrics?.excessCashEstimate ?? 0);
  const fixedCost = formatPercent(metrics?.fixedCostPressureRatio);
  const pillarLabel = formatPillarName(weakestPillar || 'your next priority');

  if (bestNextMoveCard.title.toLowerCase().includes('excess cash')) {
    return [
      {
        title: 'Phase 1: Define “enough” cash',
        body: `Start by deciding how much cash reserve still feels safe. Your current cushion is about ${cashMonths.toFixed(1)} months, so the goal is not to drain safety — it is to separate safety money from idle money.`,
        checklist: [
          'Pick a cash reserve target in months of expenses.',
          excessCash > 0 ? `Mark the estimated excess cash amount: ${formatCurrency(excessCash)}.` : 'Estimate how much cash sits above that target.',
        ],
      },
      {
        title: 'Phase 2: Move in stages',
        body: 'Choose one staged move for excess cash instead of making one large emotional decision. The goal is controlled optimization, not unnecessary risk.',
        checklist: [
          'Move a first portion to HYSA, brokerage, Roth, debt, or another priority.',
          'Set a simple date to review the result before moving more.',
        ],
      },
      {
        title: 'Phase 3: Rebalance the system',
        body: 'After the first move, review how your cash, investments, and home equity fit together. Then rerun the score and choose the next optimization lever.',
        checklist: [
          'Compare cash vs. investments vs. real estate equity.',
          'Rerun the assessment after meaningful changes.',
        ],
      },
    ];
  }

  if (bestNextMoveCard.title.toLowerCase().includes('fixed') || bestNextMoveCard.title.toLowerCase().includes('breathing')) {
    return [
      {
        title: 'Phase 1: Find the pressure point',
        body: `Start with the must-pay bill putting the most pressure on cash flow${fixedCost ? ` — mortgage/rent, utilities, and fixed bills are around ${fixedCost} of take-home pay` : ''}. This is a structure problem before it is a budgeting problem.`,
        checklist: ['List the top must-pay monthly bills in one place.', 'Circle the one bill with the biggest possible monthly impact.'],
      },
      {
        title: 'Phase 2: Test one change',
        body: 'Do not try to overhaul everything. Pick one cost, one negotiation, one income move, or one structural change and test it for 30 days.',
        checklist: ['Choose one change to test this month.', 'Redirect any freed-up margin toward the next priority.'],
      },
      {
        title: 'Phase 3: Protect the margin',
        body: 'Once margin improves, keep it from disappearing into daily spending. Give the freed-up money a job before it gets absorbed.',
        checklist: ['Assign new margin to savings, investing, or debt reduction.', 'Rerun the score after the change becomes normal.'],
      },
    ];
  }

  return [
    {
      title: `Phase 1: Start with ${pillarLabel}`,
      body: bestNextMoveCard.nextStep || `Start with ${pillarLabel}. One focused improvement here should create the biggest ripple effect across your foundation.`,
      checklist: bestNextMoveCard.thisWeek.slice(0, 2),
    },
    {
      title: 'Phase 2: Turn it into a system',
      body: 'The next step is making the first action repeatable. One good move helps, but one repeatable habit changes the foundation.',
      checklist: ['Pick one number or behavior to track weekly.', 'Schedule a 15-minute check-in before the month ends.'],
    },
    {
      title: 'Phase 3: Reassess and advance',
      body: 'After the first 90 days, compare your score and building blocks. Keep what improved and move to the next highest-leverage area.',
      checklist: ['Rerun the assessment after meaningful progress.', 'Choose the next building block to strengthen.'],
    },
  ];
}


function LockedResultsPreview({
  onUpgrade,
  onDashboard,
}: {
  onUpgrade: () => void;
  onDashboard: () => void;
}) {
  return (
    <div className="space-y-6">
      <section className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6">
        <div className="bg-gradient-to-br from-[#17385a] to-[#21456d] rounded-3xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-6 md:p-8 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-copper-50 text-copper-700 text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            Your Full Foundation Report
          </div>

          <h1 className="mt-5 text-3xl md:text-5xl font-bold leading-tight">
            Your report is ready.
          </h1>

          <p className="mt-4 text-base md:text-lg text-white/85 leading-8 max-w-2xl">
            You finished the deeper assessment. Unlock your complete report to view your full Foundation Score, pillar breakdown, 90-day plan, and PDF.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onUpgrade}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-copper-600 text-white font-semibold shadow-sm hover:bg-copper-700 transition-colors"
            >
              Unlock Full Report
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onDashboard}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white font-semibold border border-white/10 hover:bg-white/15 transition-colors"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm text-white/70 mb-2">Included</div>
              <div className="text-lg font-semibold text-white">Full Foundation Score</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm text-white/70 mb-2">Included</div>
              <div className="text-lg font-semibold text-white">7-block breakdown</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm text-white/70 mb-2">Included</div>
              <div className="text-lg font-semibold text-white">90-day plan + PDF</div>
            </div>
          </div>
        </div>

        <SectionShell icon={LockIcon} title="Why upgrade now">
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <div className="text-sm uppercase tracking-[0.18em] text-copper-600 mb-2">What unlocks</div>
              <ul className="space-y-3 text-gray-700 leading-7">
                <li>• Your complete Foundation Score and executive summary</li>
                <li>• Priority opportunities tied to your real numbers</li>
                <li>• Full 90-day action plan and downloadable PDF</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-copper-200 bg-copper-50 p-5">
              <div className="font-semibold text-navy-900 mb-2">Foundation Assessment — $29</div>
              <p className="text-sm text-gray-700 leading-7">
                Run and update your Foundation Score anytime over the next year. Most users check in every 90 days to track progress.
              </p>
            </div>
          </div>
        </SectionShell>
      </section>
    </div>
  );
}

function LockIcon(props: React.ComponentProps<typeof Shield>) {
  return <Shield {...props} />;
}

export default function ResultsPage() {
  const navigate = useNavigate();
  const { user, currentAssessment, assessmentHistory } = useAppStore() as any;
  const userPlan = useUserPlan();
  const actualPlan: PlanTier = userPlan.plan;

  const latestHistoryRecord = useMemo(() => {
    return safeArray(assessmentHistory as any[])
      .slice()
      .sort((a: any, b: any) => (b?.createdAt ?? 0) - (a?.createdAt ?? 0))[0] ?? null;
  }, [assessmentHistory]);

  const rawCurrentResult = (((currentAssessment as any)?.report ?? currentAssessment) as ResultShape | null) ?? null;
  const historyResult = ((((latestHistoryRecord as any)?.report ?? latestHistoryRecord) as ResultShape | null) ?? null);
  const result = (rawCurrentResult ?? historyResult) as ResultShape | null;

  const reportRef = useRef<HTMLDivElement>(null);

  const warnings = result?.structuralWarnings || [];
  const metrics = result?.metrics;
  const scoreBand = useMemo(() => getScoreBand(result?.foundationScore ?? 0), [result]);
  const pillarScores = result?.pillarScores ?? result?.pillars ?? {};

  const currentAssessmentType =
    (currentAssessment as any)?.assessmentType ??
    (rawCurrentResult as any)?.assessmentType ??
    (latestHistoryRecord as any)?.assessmentType ??
    (historyResult as any)?.assessmentType ??
    'free';

  const derivedTier =
    (currentAssessment as any)?.reportTier ||
    (latestHistoryRecord as any)?.reportTier ||
    (currentAssessmentType === 'premium'
      ? 'premium'
      : currentAssessmentType === 'detailed'
      ? 'standard'
      : 'free');

  const shouldGateFullReport =
    !isDevReportOverrideEnabled() &&
    actualPlan === 'free' &&
    (derivedTier === 'standard' || derivedTier === 'premium');

  const effectiveTier = shouldGateFullReport ? 'free' : derivedTier;
  const reportTier: ReportTier = getReportTier(effectiveTier);
  const features = getReportFeatures(reportTier);
  const planBadge = getPlanBadgeMeta(shouldGateFullReport ? 'free' : actualPlan);
  const [showPdfUpgradeModal, setShowPdfUpgradeModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  const handlePdfClick = async () => {
  if (!features.allowFullPdfExport) {
    setShowPdfUpgradeModal(true);
    return;
  }

  if (!reportRef.current) {
    console.error('PDF export failed: report container not found.');
    return;
  }

  try {
    await exportReportPdf({
      element: reportRef.current,
      tier: reportTier,
      foundationScore: score,
    });
  } catch (error) {
    console.error('PDF export failed:', error);
  }
};

  const pillarEntries = useMemo(() => {
    if (!Object.keys(pillarScores).length) return [];
    return Object.entries(pillarScores)
      .map(([key, value]) => [key, Number(value)] as [string, number])
      .filter(([, value]) => !Number.isNaN(value))
      .sort((a, b) => b[1] - a[1]);
  }, [pillarScores]);

  const strongest = useMemo(() => {
    const prioritized = pillarEntries.filter(([pillar, score]) => {
      if (pillar === 'debt') return score >= 85;
      return score >= 75;
    });
    return prioritized.length > 0 ? prioritized.slice(0, 2) : pillarEntries.slice(0, 1);
  }, [pillarEntries]);

  const meaningfulStrengths = useMemo(() => {
    return strongest.filter(([pillar, score]) => {
      if (pillar === 'debt') return score >= 85;
      return score >= 75;
    });
  }, [strongest]);

  const weakest = useMemo(() => {
    const filtered = [...pillarEntries]
      .sort((a, b) => a[1] - b[1])
      .filter(([pillar, score]) => {
        if (pillar === 'debt') return score < 85;
        return score < 75;
      });

    return filtered.length > 0
      ? filtered.slice(0, 2)
      : [...pillarEntries].sort((a, b) => a[1] - b[1]).slice(0, 2);
  }, [pillarEntries]);

  if (!result) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-lg">
          <h1 className="text-3xl font-bold text-navy-900 mb-3">No Results Yet</h1>
          <p className="text-gray-600 mb-6">
            Complete an assessment first so we can build your Foundation Report.
          </p>
          <button
            onClick={() => navigate('/assessment/comprehensive')}
            className="px-6 py-3 bg-copper-600 text-white rounded-xl font-bold hover:bg-copper-700"
          >
            Take Assessment
          </button>
        </div>
      </div>
    );
  }

  const score = result?.foundationScore ?? 0;

  if (shouldGateFullReport) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f2a44] via-[#132f4c] to-[#1e3a5f]">
        <header data-pdf-ignore="true" className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-navy-900 font-semibold hover:text-copper-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back Home
            </button>

            <button
              onClick={() => navigate('/my-foundation')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-copper-600 text-white font-semibold shadow-sm hover:bg-copper-700 transition-colors"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8 md:py-10">
          <LockedResultsPreview
            onUpgrade={() => navigate('/pricing')}
            onDashboard={() => navigate('/my-foundation')}
          />
        </main>
      </div>
    );
  }
  const summary = result?.summary || '';
  const insights = safeArray(result?.insights).slice(0, 2);
  const priorities = safeArray(result?.priorities ?? result?.topFocusAreas);

  const biggest = Object.keys(pillarScores).length
    ? getBiggestOpportunity(pillarScores as Record<PillarKey, number>)
    : 'spending';

  const weakestPillar = weakest[0]?.[0] || '';
  const debtPressure = formatDebtPressure(Number((pillarScores as Record<string, number>)?.debt || 0));
  const bestNextMoveCard = getBestNextMoveCard(warnings, metrics, weakestPillar, result?.nextStep);
  const stabilizeItems = getFallbackStabilizeItems(warnings, weakestPillar);
  const financialPositionLabel = getFinancialPositionLabel(metrics?.netWorth);
  const reportSummaryCards = getReportSummaryCards({
    summary,
    metrics,
    bestNextMoveCard,
    score,
  });
  const ninetyDayPlanPhases = getNinetyDayPlanPhases(bestNextMoveCard, weakestPillar, metrics);
  const assessmentAnswers = (((currentAssessment as any)?.answers ?? (latestHistoryRecord as any)?.answers ?? {}) as Record<string, any>);
  const comparisonProfileLabel = getBenchmarkProfileLabel(assessmentAnswers);
  const comparisonMetrics = getHouseholdComparisonMetrics(metrics, score, assessmentAnswers);
  const heroReportLabel = getHeroReportLabel(actualPlan, reportTier);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f2a44] via-[#132f4c] to-[#1e3a5f]">
      <header data-pdf-ignore="true" className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-navy-900 font-semibold hover:text-copper-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back Home
          </button>

          <div className="flex flex-col items-end gap-1">
            <div className="flex flex-wrap items-center justify-end gap-2">
              {features.showPdfButton && (
                <button
                  onClick={handlePdfClick}
                  className="inline-flex items-center gap-2 rounded-xl border border-copper-200 bg-white px-4 py-2 text-sm font-semibold text-copper-700 shadow-sm transition-colors hover:bg-copper-50"
                >
                  Save as PDF
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => navigate('/my-foundation')}
                className="inline-flex items-center gap-2 rounded-xl bg-copper-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-copper-700"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-500 text-right">
              Track progress and view your full dashboard
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-10">
  <div id="report-pdf-root" ref={reportRef}>
  <div
    data-pdf-only="true"
    style={{ display: 'none' }}
    className="mb-8 rounded-3xl border border-slate-200 bg-white p-8"
  >
    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-copper-700 mb-3">
      A Wealthy Foundation
    </div>

    <h1 className="text-4xl font-bold text-navy-900 mb-3">
      Your Foundation Report
    </h1>

    {planBadge && (
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-navy-900">
        <CheckCircle2 className="w-4 h-4 text-copper-600" />
        {planBadge.label}
      </div>
    )}

    <p className="text-slate-600 leading-7 mb-6 max-w-3xl">
      A personalized financial review built around your Foundation Score,
      weakest constraints, and next steps.
    </p>

    <div className="grid grid-cols-3 gap-4">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-sm text-slate-500 mb-2">Foundation Score</div>
        <div className="text-3xl font-bold text-navy-900">{score}</div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-sm text-slate-500 mb-2">Report Tier</div>
        <div className="text-3xl font-bold text-navy-900">
          {actualPlan === 'premium'
            ? 'Foundation Roadmap Plan'
            : actualPlan === 'standard'
            ? 'Foundation Assessment Plan'
            : reportTier === 'premium'
            ? 'Premium'
            : reportTier === 'standard'
            ? 'Full Report'
            : 'Preview'}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-sm text-slate-500 mb-2">Top Strength</div>
        <div className="text-3xl font-bold text-navy-900">
          {strongest[0] ? formatPillarName(strongest[0][0]) : '—'}
        </div>
      </div>
    </div>
  </div>

        <section className="grid items-start lg:grid-cols-[1.2fr_0.8fr] gap-6 mb-8">
          <div className="space-y-4">
            <div
              data-pdf-dark-card="true"
              data-pdf-page-break-avoid="true"
              className="bg-gradient-to-br from-[#17385a] to-[#21456d] rounded-3xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-6 md:p-8"
            >
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-copper-300/25 bg-white/10 px-3 py-1 text-sm font-semibold text-copper-100 shadow-sm">
                  <Sparkles className="h-4 w-4 text-copper-200" />
                  {heroReportLabel}
                </div>
              </div>

              <div className="grid gap-7 lg:grid-cols-[auto_1fr] lg:items-start">
                <FoundationScoreBubble
                  score={score}
                  scoreBand={scoreBand}
                />

                <div>
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-copper-200">
                    Your Foundation Score
                  </div>

                  <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
                    {buildExecutiveHeadline(score)}
                  </h1>

                  <p className="text-base md:text-lg text-white/80 max-w-3xl leading-8">
                    {getBandNarrative(score)}
                  </p>

                  <p className="mt-4 text-sm md:text-base text-copper-100/90 max-w-3xl leading-7">
                    Your score of {score} reflects{' '}
                    {score >= 80
                      ? 'a strong financial foundation that is ready for refinement'
                      : score >= 60
                        ? 'good momentum with a few areas still holding back progress'
                        : score >= 40
                          ? 'a workable base that still needs reinforcement'
                          : 'a foundation that needs attention before growth becomes the priority'}
                    .
                  </p>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold leading-6 text-white/80">
                    Most users revisit this every 90 days to see whether the score is improving and what should move next.
                  </div>

                  <div data-pdf-ignore="true" className="flex flex-wrap items-center gap-3 mt-6">
                    {actualPlan === 'free' && reportTier !== 'premium' && (
                      <button
                        onClick={() => navigate('/pricing')}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2 font-semibold text-white transition-colors hover:bg-white/15"
                      >
                        Turn this into a step-by-step plan
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    {isDevReportOverrideEnabled() && (
                      <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 border border-white/10">
                        Dev mode: all features visible
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <ReportSnapshotRow
              score={score}
              metrics={metrics}
              weakestPillar={weakestPillar}
              warnings={warnings}
              bestNextMoveCard={bestNextMoveCard}
            />

            <div
              data-pdf-dark-card="true"
              data-pdf-page-break-avoid="true"
              className="rounded-3xl border border-white/10 bg-white/[0.055] p-4 md:p-5 shadow-[0_16px_46px_rgba(0,0,0,0.18)]"
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
                  <div className="text-sm text-white/70 mb-2">Top Strength</div>
                  <div className="text-2xl font-bold text-white">
                    {strongest[0] ? formatPillarName(strongest[0][0]) : '—'}
                  </div>
                  <div className="mt-2 text-sm text-white/70">
                    {strongest[0] ? String(strongest[0][1]) + '/100' : 'No data'}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
                  <div className="text-sm text-white/70 mb-2">Debt Pressure</div>
                  <div className="text-2xl font-bold text-white">{debtPressure}</div>
                  <div className="mt-2 text-sm text-white/70">
                    {getDebtSnapshotLine(metrics) || 'Lower monthly debt payments generally mean more flexibility.'}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
                  <div className="text-sm text-white/70 mb-2">Net Worth</div>
                  <div className="text-2xl font-bold text-white">
                    {metrics?.netWorth || metrics?.netWorth === 0 ? formatCurrency(metrics.netWorth) : '—'}
                  </div>
                  <div className="mt-2 text-sm text-white/70">
                    {financialPositionLabel}
                  </div>
                </div>
              </div>
            </div>



          </div>

          <div
            data-pdf-dark-card="true"
            data-pdf-page-break-avoid="true"
            className="bg-gradient-to-br from-[#071f36] via-[#09233c] to-[#123456] text-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.26)] p-5 md:p-7 border border-white/10"
          >
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <div className="text-sm uppercase tracking-[0.18em] text-copper-300">
                  Executive Summary
                </div>
                <h2 className="mt-2 text-2xl font-bold text-white">What this means</h2>
              </div>
              <div className="hidden h-12 w-12 items-center justify-center rounded-2xl border border-copper-300/20 bg-copper-300/10 md:flex">
                <Sparkles className="h-5 w-5 text-copper-200" />
              </div>
            </div>

            <div className="space-y-4">
              {reportSummaryCards.slice(0, 2).map((card) => (
                <div key={card.label} className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-copper-200 mb-2">
                    {card.label}
                  </div>
                  <div className="text-lg font-bold text-white mb-2">{card.title}</div>
                  <p className="text-sm leading-7 text-white/82">{card.body}</p>
                </div>
              ))}
            </div>

            <div className="my-5 h-px bg-white/10" />

            <ReportMiniBarChart entries={pillarEntries} />
          </div>
        </section>

        <section
          data-pdf-dark-card="true"
          data-pdf-page-break-avoid="true"
          className="mb-8 rounded-3xl border border-white/10 bg-gradient-to-br from-[#17385a] to-[#21456d] p-6 md:p-8 text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
        >
          <div className="mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-copper-300" />
            <h2 className="text-xl font-bold text-white md:text-2xl">Your Best Next Move</h2>
          </div>

          <h3 className="mb-3 text-2xl font-bold text-white md:text-3xl">
            {bestNextMoveCard.title}
          </h3>

          <p className="max-w-3xl text-sm leading-7 text-white/85 md:text-base">
            {bestNextMoveCard.intro}
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-copper-200">
                Right Now
              </div>
              <ul className="space-y-3">
                {bestNextMoveCard.rightNow.slice(0, 2).map((item, index) => (
                  <li key={`bnm-right-now-${index}`} className="flex items-start gap-2 text-sm leading-6 text-white/90">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-copper-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-copper-200">
                Why This Matters
              </div>
              <p className="text-sm leading-7 text-white/85">
                {bestNextMoveCard.whyThisMatters}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-copper-300/20 bg-copper-300/10 p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-copper-200">
              Next Step
            </div>
            <p className="text-sm font-semibold leading-7 text-white/95 md:text-base">
              {bestNextMoveCard.nextStep}
            </p>
          </div>
        </section>
        <HouseholdComparisonSection
          profileLabel={comparisonProfileLabel}
          comparisonMetrics={comparisonMetrics}
          onMoreInfo={() => setShowComparisonModal(true)}
        />

        <section className="grid lg:grid-cols-[0.95fr_1.05fr] gap-6 mb-6">
          <SectionShell icon={Target} title="Priority Opportunities">
            {getStructuralContextNote(warnings, metrics) && (
              <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
                {getStructuralContextNote(warnings, metrics)}
              </div>
            )}

            <div className="space-y-4">
              {weakest.map(([pillar, pillarScore], index) => {
                const isBiggest = pillar === biggest;

                return (
                  <div key={pillar} className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="text-lg font-bold text-navy-900">
                          {formatPillarName(pillar)}
                        </div>
                        <div className="text-sm text-copper-500">Score: {pillarScore}/100</div>
                      </div>

                      <div className="flex items-center gap-2">
                        {index === 0 && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-copper-100 text-copper-700">
                            {warnings.length > 0 ? 'Top Pillar Priority' : '#1 Priority'}
                          </span>
                        )}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getPillarTone(pillarScore).badge}`}
                        >
                          {getPillarTone(pillarScore).label}
                        </span>
                      </div>
                    </div>

                    <p className="text-navy-900 font-semibold leading-7 mb-2">
                      {getPriorityHeadline(pillar, isBiggest, score)}
                    </p>

                    <p className="text-gray-700 leading-7 mb-3">
                      {getPriorityBody(pillar, isBiggest)}
                    </p>

                    <div className="h-2 rounded-full bg-gray-200 overflow-hidden mb-3">
                      <div
                        className={`h-full ${getPillarTone(pillarScore).bar}`}
                        style={{ width: `${Math.max(4, pillarScore)}%` }}
                      />
                    </div>

                    <div className="text-sm font-medium text-copper-700">
                      {priorities.find((item) =>
                        item.toLowerCase().includes(pillar.toLowerCase())
                      ) || getConstraintLine(pillar)}
                    </div>

                    {getPriorityMetricLine(pillar, metrics) ? (
                      <div className="mt-2 text-sm text-gray-600 leading-6">
                        {getPriorityMetricLine(pillar, metrics)}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </SectionShell>

          <SectionShell
            icon={meaningfulStrengths.length >= 2 ? CheckCircle2 : Target}
            title={meaningfulStrengths.length >= 2 ? 'What Is Already Working' : 'Where to Stabilize First'}
          >
            {meaningfulStrengths.length >= 2 ? (
              <div className="space-y-4">
                {meaningfulStrengths.map(([pillar, pillarScore]) => (
                  <div key={pillar} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const Icon = PILLAR_ICONS[pillar] || CheckCircle2;
                          return (
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-emerald-200">
                              <Icon className="w-5 h-5 text-emerald-700" />
                            </div>
                          );
                        })()}
                        <div>
                          <div className="text-lg font-bold text-navy-900">
                            {formatPillarName(pillar)}
                          </div>
                          <div className="text-sm text-gray-600">{pillarScore}/100</div>
                        </div>
                      </div>

                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white text-emerald-700 border border-emerald-200">
                        Strong
                      </span>
                    </div>

                    <p className="text-gray-700 leading-7">
                      {strengthDescriptions[pillar] ||
                        'This part of your foundation is giving you something meaningful to build on.'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <p className="text-gray-700 leading-7 mb-4">
                  Right now, most areas of your foundation still need reinforcement. That is not unusual — it just means your focus should be on stabilizing before optimizing.
                </p>
                <ul className="space-y-3">
                  {stabilizeItems.map((item, index) => (
                    <li key={`stabilize-item-${index}`} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-copper-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </SectionShell>
        </section>

        <section className="grid lg:grid-cols-2 gap-6 mb-6">
          <SectionShell icon={Sparkles} title="Foundation Stress Test">
            {warnings.length > 0 ? (
              <div className="space-y-4">
                {warnings.map((warning, index) => {
                  const tone = getWarningTone(warning.severity);

                  return (
                    <div
                      key={`${warning.type}-${index}`}
                      className={`rounded-2xl border p-5 ${tone.card}`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="text-lg font-bold text-amber-950">
                          {getWarningTitle(warning.type)}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${tone.badge}`}
                        >
                          {warning.severity === 'critical' ? 'Critical' : 'Warning'}
                        </span>
                      </div>

                      <p className="text-gray-700 leading-7 mb-3">
                        {getWarningBodyWithMetrics(warning, metrics)}
                      </p>

                      <div className="text-sm font-medium text-copper-700 leading-6">
                        {getWarningAction(warning.type)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="text-lg font-bold text-emerald-800 mb-2">
                  No major structural warning signs were triggered
                </div>
                <p className="text-gray-700 leading-7">
                  Your current structure did not trip a major fixed-cost or debt-pressure alert under the current thresholds. That does not mean the rest of the house is strong yet — it means the biggest issues may be showing up in your weaker pillars rather than in one obvious structural break.
                </p>
              </div>
            )}
          </SectionShell>

          <SectionShell icon={Sparkles} title="Key Insights">
            {insights.length ? (
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                    <div className="text-sm uppercase tracking-[0.18em] text-copper-600 mb-3">
                      Insight {index + 1}
                    </div>
                    <p className="text-gray-700 leading-8">{insight}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <div className="text-sm uppercase tracking-[0.18em] text-copper-600 mb-3">
                  Insight 1
                </div>
                <p className="text-gray-700 leading-8">
                  Your strongest habits are reinforcing each other. The next level of progress comes from tightening the few areas that still create drag.
                </p>
              </div>
            )}
          </SectionShell>
        </section>

        {actualPlan === 'free' && !features.showPremiumGuidance && (
          <section
            data-pdf-ignore="true"
            className="relative overflow-hidden rounded-3xl border border-copper-300/25 bg-gradient-to-r from-[#7c461c] via-[#b87333] to-[#d28b3c] p-5 md:p-7 mb-8 text-white shadow-[0_24px_70px_rgba(15,42,68,0.28)]"
          >
            <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-navy-900/20 blur-2xl" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div className="max-w-3xl">
                <div className="inline-flex items-center rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white/85 mb-3">
                  Premium Roadmap
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  Turn this into a step-by-step plan you can actually follow.
                </h2>
                <p className="text-white/88 leading-7">
                  Premium adds the missing layer: what to do first, what to ignore for now,
                  and how to move through the next 12 months without trying to fix everything at once.
                </p>
                <div className="mt-4 grid gap-2 text-sm text-white/90 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-3">Priority ladder</div>
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-3">Quarterly action plan</div>
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-3">Guided prompts</div>
                </div>
              </div>

              <div className="shrink-0">
                <button
                  onClick={() => navigate('/pricing')}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-navy-900 shadow-sm hover:bg-copper-50 transition-colors"
                >
                  Unlock the roadmap
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        {features.showPremiumGuidance && Object.keys(pillarScores).length > 0 && (
          <div data-pdf-page-break-before="true">
            <PremiumGuidanceSection
            pillarScores={pillarScores as Record<string, number>}
            reportTier={reportTier}
            onUnlockPremium={() => navigate('/pricing')}
          />
          </div>
        )}

<div data-pdf-ignore="true" className="my-10">
  <ReportNewsletterCard userEmail={user?.email} />
</div>

        <SectionShell icon={Clock3} title="Your 90-Day Plan" className="mb-6 pdf-avoid-break">
          <div className="mb-5 rounded-2xl border border-copper-200 bg-gradient-to-r from-copper-50 to-white p-4">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-copper-700">
              Your next 90 days should follow a sequence — not a scattershot of goals
            </div>
            <p className="mt-2 text-sm leading-7 text-gray-700">
              The goal is not to attack every building block at once. Start with the highest-leverage move, turn it into a repeatable system, then reassess before choosing the next priority.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            {ninetyDayPlanPhases.map((phase, index) => {
              const phaseStyles = [
                'border-copper-200 bg-copper-50/70',
                'border-blue-200 bg-blue-50/70',
                'border-emerald-200 bg-emerald-50/70',
              ];
              const dotStyles = ['bg-copper-600', 'bg-blue-600', 'bg-emerald-600'];

              return (
                <div key={phase.title} className={`rounded-2xl border p-5 ${phaseStyles[index] ?? 'border-gray-200 bg-gray-50'}`}>
                  <div className="mb-4 flex items-start gap-3">
                    <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${dotStyles[index] ?? 'bg-copper-600'}`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-navy-900">{phase.title}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.16em] text-gray-500">
                        {index === 0 ? 'Start here' : index === 1 ? 'Build momentum' : 'Strengthen the system'}
                      </div>
                    </div>
                  </div>

                  <p className="text-navy-900 leading-7 mb-4">{phase.body}</p>
                  <ul className="space-y-2">
                    {phase.checklist.slice(0, 3).map((item, itemIndex) => (
                      <li key={`${phase.title}-${itemIndex}`} className="flex items-start gap-2 text-sm text-navy-900">
                        <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${dotStyles[index] ?? 'bg-copper-600'}`} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </SectionShell>

        <div data-pdf-ignore="true" className="flex justify-center pb-8">
          <button
            onClick={() => navigate('/assessment/comprehensive')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-white text-navy-900 border border-navy-200 shadow-sm hover:bg-copper-50 hover:border-copper-300 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Retake Assessment
          </button>
        </div>

        <div
          data-pdf-ignore="true"
          className="mt-12 pt-8 border-t border-slate-200 flex flex-col items-center text-center"
        >
          <button
            onClick={() => navigate('/my-foundation')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-copper-600 text-white font-semibold text-lg shadow-sm hover:bg-copper-700 transition-colors"
          >
            Go to Your Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-sm text-slate-500 mt-2">
            Track progress, revisit your plan, and keep building momentum
          </p>
        </div>

        {showComparisonModal && (
          <HouseholdComparisonModal
            comparisonMetrics={comparisonMetrics}
            profileLabel={comparisonProfileLabel}
            onClose={() => setShowComparisonModal(false)}
          />
        )}

        {showPdfUpgradeModal && (
          <div
            data-pdf-ignore="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          >
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
              <div className="inline-flex rounded-full bg-copper-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-copper-700">
                Unlock Full Report
              </div>

              <h3 className="mt-4 text-2xl font-bold text-navy-900">
                Your full report is ready to download
              </h3>

              <p className="mt-3 text-sm leading-7 text-gray-600">
                Unlock the full PDF export for $29, or upgrade to Premium for guided
                implementation, a 12-month roadmap, and workbook-style prompts.
              </p>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 p-4">
                  <div className="text-sm font-bold text-navy-900">$29 Full Report</div>
                  <p className="mt-2 text-sm text-gray-600">
                    Full report + full PDF export
                  </p>
                </div>

                <div className="rounded-2xl border border-copper-200 bg-copper-50 p-4">
                  <div className="text-sm font-bold text-navy-900">$79 Premium</div>
                  <p className="mt-2 text-sm text-gray-600">
                    Full report + PDF + 12-month roadmap + guided prompts
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => {
                    setShowPdfUpgradeModal(false);
                    navigate('/pricing');
                  }}
                  className="rounded-2xl bg-navy-900 px-4 py-3 text-sm font-semibold text-white"
                >
                  Unlock for $29
                </button>

                <button
                  onClick={() => {
                    setShowPdfUpgradeModal(false);
                    navigate('/pricing');
                  }}
                  className="rounded-2xl bg-copper-600 px-4 py-3 text-sm font-semibold text-white"
                >
                  Upgrade to Premium
                </button>

                <button
                  onClick={() => setShowPdfUpgradeModal(false)}
                  className="rounded-2xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}

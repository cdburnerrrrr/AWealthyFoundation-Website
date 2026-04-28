import { useMemo, useRef, useState } from 'react';
import { exportReportPdf } from '../utils/pdfExport';
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
  if (score >= 80) return 'Strong foundation. Now it’s time to optimize.';
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
          ? `Fixed costs are taking about ${fixedCost} of take-home pay.`
          : 'Fixed costs are taking too much of monthly cash flow.',
        'That leaves less room to save, invest, or absorb surprises.',
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
        'Your housing and core fixed costs are doing more damage than small day-to-day spending leaks right now.',
      rightNow: [
        fixedCost
          ? `Fixed costs are about ${fixedCost} of take-home pay.`
          : 'Housing and fixed costs are consuming too much of monthly cash flow.',
        'That makes the rest of the plan feel tighter than it should.',
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
        'Multiple fixed obligations are stacking pressure onto the same monthly cash flow.',
      rightNow: [
        debtToIncome
          ? `Debt payments alone are about ${debtToIncome} of take-home pay.`
          : 'Debt and fixed costs are combining to reduce flexibility.',
        'That pressure makes saving, investing, and long-term progress much harder.',
      ],
      whyThisMatters:
        'Until the pressure eases, other improvements will feel slower and harder to sustain.',
      nextStep:
        'Start with the fixed obligation or debt payment creating the most friction, then work outward from there.',
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
      return 'A large share of your income is going toward housing and other fixed costs. At this level, even good day-to-day budgeting may still feel tight.';
    case 'income_constraint':
      return 'This looks more like a math problem than a discipline problem. Increasing income or lowering a major fixed cost may create the biggest overall lift.';
    case 'structural_pressure':
      return 'Multiple fixed obligations are competing for limited income. That kind of pressure can make saving, investing, and debt progress much harder.';
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
      ? `Your fixed costs are about ${fixedCost} of take-home pay. That is high enough that budgeting alone may not solve the problem. Your highest-leverage move is to raise income, lower a major fixed cost, or do both.`
      : 'This looks more like a math problem than a discipline problem. Your highest-leverage move is to raise income, lower a major fixed cost, or do both.';
  }

  if (warnings.some((warning) => warning.type === 'housing_pressure')) {
    return fixedCost
      ? `Your fixed costs are about ${fixedCost} of take-home pay. Start by reducing the biggest fixed cost in the system, especially housing and utilities, before expecting small spending cuts to carry the load.`
      : 'Start by reducing the biggest fixed cost in the system, especially housing and utilities, before expecting small spending cuts to carry the load.';
  }

  if (warnings.some((warning) => warning.type === 'structural_pressure')) {
    return debtToIncome
      ? `Your debt payments are about ${debtToIncome} of take-home pay on top of other fixed costs. Consolidate the pressure points first so cash flow can breathe again.`
      : 'Multiple fixed obligations are competing for limited income. Consolidate the pressure points first so cash flow can breathe again.';
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
    fixedCost ? `fixed costs are about ${fixedCost} of take-home pay` : null,
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
        return `Your fixed costs are running at about ${fixedCost ?? 'a high share'} of take-home pay${housing ? `, with housing around ${housing}/month` : ''}${utilities ? ` and utilities around ${utilities}/month` : ''}. At this level, even good day-to-day budgeting may still feel tight.`;
      }
      return getWarningBody(warning.type);
    case 'income_constraint':
      if (fixedCost) {
        return `Your fixed costs are taking about ${fixedCost} of take-home pay. This looks more like a math problem than a discipline problem. Increasing income or lowering a major fixed cost may create the biggest overall lift.`;
      }
      return getWarningBody(warning.type);
    case 'structural_pressure':
      if (debtToIncome || debtPayment) {
        return `Debt and fixed obligations are stacking up. Non-housing debt payments are about ${debtPayment ?? 'a meaningful amount each month'}${debtToIncome ? `, or roughly ${debtToIncome} of take-home pay` : ''}. That kind of pressure can make saving, investing, and debt progress much harder.`;
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
  const { currentAssessment, assessmentHistory } = useAppStore() as any;
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
  const adjustedScoreColor =
    scoreBand.label === 'Needs Attention' ? 'text-copper-300' : scoreBand.color;
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
  const secondWeakest = weakest[1]?.[0] || '';
    const planStart = result?.actionPlan?.immediate?.[0];
  const planAfter = result?.actionPlan?.longTerm?.[0];
  const nextFocusStep =
    result?.actionPlan?.shortTerm?.[0] ||
    (secondWeakest ? getFallbackPlanStep(secondWeakest, 0) : null);

  const debtPressure = formatDebtPressure(Number((pillarScores as Record<string, number>)?.debt || 0));
  const bestNextMoveCard = getBestNextMoveCard(warnings, metrics, weakestPillar, result?.nextStep);
  const stabilizeItems = getFallbackStabilizeItems(warnings, weakestPillar);
  const financialPositionLabel = getFinancialPositionLabel(metrics?.netWorth);
  const metricsCallout = getMetricsCallout(metrics);

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

          <div className="flex flex-col items-end">
            <button
              onClick={() => navigate('/my-foundation')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-copper-600 text-white font-semibold shadow-sm hover:bg-copper-700 transition-colors"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-xs text-slate-500 mt-1 text-right">
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

        <section className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 mb-6">
          <div
            data-pdf-dark-card="true"
            data-pdf-page-break-avoid="true"
            className="bg-gradient-to-br from-[#17385a] to-[#21456d] rounded-3xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-6 md:p-8"
          >
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-copper-50 text-copper-700 text-sm font-semibold">
                <Sparkles className="w-4 h-4" />
                Your Foundation Report
              </div>

              {planBadge && (
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${planBadge.className}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  {planBadge.label}
                </div>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-3">
              {buildExecutiveHeadline(score)}
            </h1>

            <div className="mb-6">
              <p className="text-base md:text-lg text-white/80 max-w-3xl">
                {getBandNarrative(score)}
              </p>

              <p className="mt-3 text-sm md:text-base text-copper-200 max-w-3xl leading-7">
                Your score of {score} reflects{' '}
                {score >= 80
                  ? 'a strong foundation'
                  : score >= 60
                    ? 'good momentum with some remaining gaps'
                    : score >= 40
                      ? 'a workable base that still needs reinforcement'
                      : 'a foundation that needs attention before growth becomes the priority'}
                .
              </p>
            </div>

            <div data-pdf-ignore="true" className="flex flex-wrap items-center gap-3 mb-6">
              {features.showPdfButton && (
                <button
                  onClick={handlePdfClick}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-copper-600 text-white font-semibold shadow-sm hover:bg-copper-700 transition-colors"
                >
                  Save as PDF
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

{reportTier !== 'premium' && (
  <button
    onClick={() => navigate('/pricing')}
    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white font-semibold border border-white/10 hover:bg-white/15 transition-colors"
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

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm text-white/70 mb-2">Foundation Score</div>
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#ffcf9e] to-[#b87333] shadow-[0_20px_60px_rgba(194,120,58,0.45)] border border-white/30 text-4xl font-bold text-white">
                  {score}
                </div>
                <div
                  className={`mt-3 inline-flex px-3 py-1 rounded-full text-sm font-semibold ${scoreBand.bg} ${adjustedScoreColor}`}
                >
                  {scoreBand.label}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm text-white/70 mb-2">Top Strength</div>
                <div className="text-2xl font-bold text-white">
                  {strongest[0] ? formatPillarName(strongest[0][0]) : '—'}
                </div>
                <div className="mt-2 text-sm text-white/70">
                  {strongest[0] ? `${strongest[0][1]}/100` : 'No data'}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm text-white/70 mb-2">Debt Pressure</div>
                <div className="text-2xl font-bold text-white">{debtPressure}</div>
                <div className="mt-2 text-sm text-white/70">
                  {getDebtSnapshotLine(metrics) || 'Lower debt pressure generally means more flexibility.'}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm text-white/70 mb-2">Net Worth</div>
                <div className="text-2xl font-bold text-white">
                  {metrics?.netWorth || metrics?.netWorth === 0 ? formatCurrency(metrics.netWorth) : '—'}
                </div>
                <div className="mt-2 text-sm text-white/70">
                  {financialPositionLabel}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-copper-200">Building Blocks</div>
                  <div className="mt-1 text-sm text-white/65">A compact view of the seven blocks supporting your foundation.</div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {pillarEntries.map(([pillar, pillarScore]) => {
                  const tone = getPillarTone(pillarScore);
                  const Icon = PILLAR_ICONS[pillar] || CheckCircle2;

                  return (
                    <div key={`hero-block-${pillar}`} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                            <Icon className={`h-4 w-4 ${tone.text}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-white truncate">{formatPillarName(pillar)}</div>
                            <div className="text-xs text-white/55">{pillarScore}/100</div>
                          </div>
                        </div>
                        <span className={`shrink-0 px-2 py-1 rounded-full text-[10px] font-semibold ${tone.badge}`}>{tone.label}</span>
                      </div>
                      <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full ${tone.bar}`} style={{ width: `${Math.max(4, pillarScore)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div
            data-pdf-dark-card="true"
            data-pdf-page-break-avoid="true"
            className="bg-navy-900 text-white rounded-3xl shadow-sm p-5 md:p-7"
          >
            <div className="text-sm uppercase tracking-[0.18em] text-copper-300 mb-3">
              Executive Summary
            </div>
            <p className="text-lg leading-8 text-white/95 mb-6">
              {summary ||
                'Your report is ready. The next level of progress will come from strengthening the weakest part of your foundation first.'}
            </p>

            {metricsCallout ? (
              <div className="mb-4 rounded-2xl bg-white/10 border border-white/10 p-4 text-sm leading-7 text-white/90">
                {metricsCallout}
              </div>
            ) : null}

            {getNetWorthNarrative(metrics) ? (
              <div className="mb-6 rounded-2xl bg-white/5 border border-white/10 p-4 text-sm leading-7 text-white/85">
                {getNetWorthNarrative(metrics)}
              </div>
            ) : null}

            <div className="rounded-2xl bg-white/10 border border-white/10 p-5">
              <div className="text-copper-300 text-sm font-semibold mb-2">Best Next Move</div>
              <div className="space-y-4">
                <div>
                  <div className="font-semibold text-white mb-2">{bestNextMoveCard.title}</div>
                  <p className="text-white/90 leading-7">{bestNextMoveCard.intro}</p>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-copper-200 mb-2">Right now</div>
                  <ul className="space-y-2">
                    {bestNextMoveCard.rightNow.map((item, index) => (
                      <li key={`bnm-right-now-${index}`} className="flex items-start gap-2 text-white/90 leading-7">
                        <span className="mt-3 h-1.5 w-1.5 rounded-full bg-copper-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-copper-200 mb-2">Why this matters</div>
                  <p className="text-white/90 leading-7">{bestNextMoveCard.whyThisMatters}</p>
                </div>

                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-copper-200 mb-2">Next step</div>
                  <p className="text-white leading-7">{bestNextMoveCard.nextStep}</p>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-copper-200 mb-2">This week</div>
                  <ul className="space-y-2">
                    {bestNextMoveCard.thisWeek.map((item, index) => (
                      <li key={`bnm-this-week-${index}`} className="flex items-start gap-2 text-white/90 leading-7">
                        <span className="mt-3 h-1.5 w-1.5 rounded-full bg-copper-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

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

        {!features.showPremiumGuidance && (
          <section
            data-pdf-ignore="true"
            className="bg-white/95 backdrop-blur rounded-3xl border border-copper-200 shadow-sm p-5 md:p-7 mb-6"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="inline-flex items-center rounded-full bg-copper-50 px-3 py-1 text-sm font-semibold text-copper-700 mb-3">
                  Premium Upgrade
                </div>
                <h2 className="text-2xl font-bold text-navy-900 mb-2">
                  {reportTier === 'standard'
                    ? 'Want guided implementation, not just the report?'
                    : 'Want a step-by-step plan for the next 12 months?'}
                </h2>
                <p className="text-gray-700 leading-7 max-w-3xl">
                  Upgrade to Premium to unlock your personalized roadmap, quarterly action
                  plan, priority ladder, and guided prompts built around your weakest
                  constraint.
                </p>
              </div>

              <div className="shrink-0">
                <button
                  onClick={() => navigate('/pricing')}
                  className="inline-flex items-center gap-2 rounded-xl bg-copper-600 text-white px-5 py-3 font-semibold shadow-sm hover:bg-copper-700 transition-colors"
                >
                  Turn this into a step-by-step plan
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

        <SectionShell icon={Clock3} title="Your 90-Day Plan" className="mb-6 pdf-avoid-break">
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-copper-200 bg-copper-50/50 p-5">
              <div className="text-sm font-semibold text-copper-700 mb-3">
                {planStart?.title || 'Start Here'}
              </div>
              <p className="text-navy-900 leading-7 mb-4">
                {planStart?.body ||
                  (weakestPillar
                    ? `Start with ${formatPillarName(weakestPillar)}. Improving this one area should create the biggest ripple effect across your foundation.`
                    : result.nextStep ||
                      'Start with the weakest part of your foundation and make one focused improvement this quarter.')}
              </p>
              <ul className="space-y-2">
                {(planStart?.checklist?.length
                  ? planStart.checklist.slice(0, 2)
                  : [
                      `Identify one concrete way to improve ${formatPillarName(
                        weakestPillar || 'your next priority'
                      )}.`,
                      'Take one action this week.',
                    ]).map((item, index) => (
                  <li
                    key={`immediate-check-${index}`}
                    className="flex items-start gap-2 text-sm text-navy-900"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-copper-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {nextFocusStep && (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <div className="text-sm font-semibold text-gray-500 mb-3">
                  {nextFocusStep.title}
                </div>
                <p className="text-gray-700 leading-7 mb-4">{nextFocusStep.body}</p>
                <ul className="space-y-2">
                  {nextFocusStep.checklist.slice(0, 2).map((item, itemIndex) => (
                    <li
                      key={`${nextFocusStep.title}-${itemIndex}`}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-copper-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <div className="text-sm font-semibold text-gray-500 mb-3">
                {planAfter?.title || 'After 90 Days'}
              </div>
              <p className="text-gray-700 leading-7 mb-4">
                {planAfter?.body ||
                  'Review your progress, keep what is working, and then move to the next weakest area.'}
              </p>
              <ul className="space-y-2">
                {(planAfter?.checklist?.length
                  ? planAfter.checklist.slice(0, 2)
                  : [
                      'Review what improved over the last 90 days.',
                      'Choose the next area to strengthen.',
                    ]).map((item, index) => (
                  <li
                    key={`after-check-${index}`}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-copper-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
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

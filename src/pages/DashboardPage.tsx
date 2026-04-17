import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store/appStore';

import { exportReportPdf } from '../utils/pdfExport';

import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock3,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  FileText,
  Home,
  LineChart,
  LogOut,
  PiggyBank,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

import logoImage from '../assets/house-icon.png';
import { useUserPlan } from '../hooks/useUserPlan';
import { getEntitlements } from '../lib/entitlements';
import { useTrackEvent } from '../hooks/useTrackEvent';
import { getScoreBand } from '../types/assessment';

interface DashboardPageProps {
  onLogout: () => void;
}

type PlanTier = 'free' | 'standard' | 'premium';
type GuidanceTab = 'roadmap' | 'workbook' | 'checkins';

type MetricsShape = {
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
};

type ActionPlanStep = {
  title: string;
  body: string;
  checklist?: string[];
};

type StructuralWarning = {
  type: 'housing_pressure' | 'income_constraint' | 'structural_pressure' | string;
  severity: 'high' | 'critical' | string;
};

type CurrentAssessmentShape = {
  id?: string | number;
  createdAt?: number;
  assessmentType?: string;
  report?: CurrentAssessmentShape;
  wealthScore?: number;
  foundationScore?: number;
  scoreBand?: string;
  pillarScores?: Record<string, number>;
  pillars?: Record<string, number>;
  insights?: string[];
  priorities?: string[];
  topFocusAreas?: string[];
  summary?: string;
  nextStep?: string;
  lifeStage?: 'starting_out' | 'stability' | 'growth' | 'catch_up' | string;
  answers?: Record<string, any>;
  signals?: Record<string, any>;
  metrics?: MetricsShape;
  structuralWarnings?: StructuralWarning[];
  actionPlan?: {
    immediate?: ActionPlanStep[];
    shortTerm?: ActionPlanStep[];
    longTerm?: ActionPlanStep[];
  };
};

type ExpertCard = {
  key: string;
  title: string;
  reason: string;
  cta: string;
  icon: React.ElementType;
  tone: string;
};

const PLAN_FEATURES: Record<
  PlanTier,
  { name: string; badgeLabel: string | null; price: number; accent: string }
> = {
  free: {
    name: 'Free',
    badgeLabel: null,
    price: 0,
    accent: 'bg-navy-900 text-white border-navy-900',
  },
  standard: {
    name: 'Foundation Assessment',
    badgeLabel: 'Foundation Assessment Plan',
    price: 29,
    accent: 'bg-blue-600 text-white border-blue-600',
  },
  premium: {
    name: 'Foundation Roadmap',
    badgeLabel: 'Foundation Roadmap Plan',
    price: 79,
    accent: 'bg-copper-600 text-white border-copper-600',
  },
};

function getPlanBadgeClass(plan: PlanTier) {
  if (plan === 'premium') {
    return 'border-copper-300/35 bg-copper-500/10 text-copper-100';
  }

  if (plan === 'standard') {
    return 'border-blue-200/30 bg-blue-500/10 text-blue-50';
  }

  return '';
}

function getDashboardNextMoveCard(
  assessment: CurrentAssessmentShape | null,
  snapshot: ReturnType<typeof getStructuralSnapshot>,
  weakestPillar?: string
): { title: string; body: string; checklist: string[] } {
  const answers = assessment?.answers ?? {};
  const lifeStage = assessment?.lifeStage ?? 'stability';
  const confidence = answers.financialConfidence;
  const incomeGrowth = answers.incomeGrowth;
  const incomeGrowthPotential = answers.incomeGrowthPotential;
  const financialDirection = answers.financialDirection;
  const employerMatch = answers.employerMatch;
  const investingStatus = answers.investingStatus;
  const investmentConfidence = answers.investmentConfidence;
  const immediateStep = assessment?.actionPlan?.immediate?.[0];

  const strongInvestingHabit =
    investingStatus === 'yes_consistently' &&
    (employerMatch === 'maximizing_match' || employerMatch === 'have_match_not_maxing');

  const highSavingsBase =
    (snapshot?.totalSavings ?? 0) >= 10000 || (snapshot?.monthlyMargin ?? 0) >= 500;

  if (snapshot && snapshot.fixedCostLoad >= 65) {
    return {
      title: 'Create breathing room first',
      body: 'Your next move should focus on structure, not optimization. A large share of take-home income is already committed, so the fastest lift will come from changing one major fixed-cost pressure point.',
      checklist: [
        'List housing, utilities, childcare, and debt payments in one place.',
        'Identify the single fixed cost creating the most pressure.',
        'Decide whether the clearest win is lower costs, more income, or both.',
      ],
    };
  }

  if (snapshot && snapshot.fixedCostLoad >= 50) {
    return {
      title: 'Protect your monthly margin',
      body: 'Your structure is workable, but fixed costs are still tight enough to slow progress. Relief here should make the rest of the plan easier to execute.',
      checklist: [
        'Review the top one or two fixed costs in your budget.',
        'Choose one realistic change to test over the next 30 days.',
        'Redirect any freed-up cash toward your highest-priority goal.',
      ],
    };
  }

  if (weakestPillar === 'protection') {
    if (['growth', 'catch_up'].includes(lifeStage)) {
      return {
        title: 'Protect the progress you have already built',
        body: 'You already have momentum in other areas. At this stage, the bigger risk is leaving one protection gap exposed that could undo progress if life gets expensive or income is interrupted.',
        checklist: [
          'Review the one protection area that would hurt most if it failed.',
          'Check whether current coverage still matches your household reality.',
          'Make one update this quarter to close the biggest gap.',
        ],
      };
    }

    return {
      title: 'Close your biggest protection gap',
      body: 'Your next lift is less about chasing growth and more about making the foundation sturdier. Tightening protection now helps keep one setback from disrupting the rest of the plan.',
      checklist: [
        'Review income, health, and property protection coverage.',
        'Identify the weakest protection area in your current setup.',
        'Make one update this quarter to improve resilience.',
      ],
    };
  }

  if (weakestPillar === 'vision') {
    if (['low', 'not_confident'].includes(confidence)) {
      return {
        title: 'Create a clearer target before adding complexity',
        body: 'Your habits will feel more sustainable once they are tied to a clearer destination. Right now, the opportunity is not another tactic — it is making the goal specific enough to guide your next few decisions.',
        checklist: [
          'Write down your top financial goal for the next 3–5 years.',
          'Choose one 12-month milestone that would prove progress.',
          'Make sure your next major money move supports that target.',
        ],
      };
    }

    if (['figuring_it_out', 'no_goals', 'stuck'].includes(financialDirection)) {
      return {
        title: 'Turn decent habits into a clearer plan',
        body: 'You may already be doing some things well, but the direction is still too loose. Clarifying what matters most will make tradeoffs and next steps feel much more intentional.',
        checklist: [
          'Choose the one outcome that matters most over the next 12 months.',
          'Define what success would look like in concrete terms.',
          'Use that target to filter your next money decisions.',
        ],
      };
    }

    return {
      title: 'Clarify what you are building toward',
      body: 'Your direction is improving, but it still needs sharper edges. Clearer priorities will make the rest of your system easier to align and follow through on.',
      checklist: [
        'Name your highest-priority financial goal.',
        'Choose one milestone to track over the next year.',
        'Align your next major money move with that goal.',
      ],
    };
  }

  if (weakestPillar === 'investing') {
    if (strongInvestingHabit && ['very_confident', 'somewhat_confident'].includes(investmentConfidence)) {
      return {
        title: 'Upgrade how your investing is working',
        body: 'You do not need a reminder to start investing — you are already doing that. The better next move is reviewing whether your current setup is aligned, efficient, and doing enough heavy lifting for your stage.',
        checklist: [
          'Review whether your current contribution rate still fits your goals.',
          'Check that account mix and allocation still make sense.',
          'Choose one improvement to make over the next 90 days.',
        ],
      };
    }

    return {
      title: 'Turn consistency into long-term growth',
      body: 'You may already be building margin. The next step is making sure more of that progress is moving into long-term growth instead of staying parked.',
      checklist: [
        'Review current investment contributions.',
        'Increase consistency before adding complexity.',
        'Set a realistic 90-day contribution target.',
      ],
    };
  }

  if (weakestPillar === 'saving') {
    if (highSavingsBase && ['growth', 'catch_up'].includes(lifeStage)) {
      return {
        title: 'Strengthen your buffer, not just your balance sheet',
        body: 'You may already be building for the future, but the next improvement is making sure your cash reserve is strong enough to protect that long-term progress when life gets expensive.',
        checklist: [
          'Decide what “enough” cash reserves means for your household.',
          'Choose a monthly amount to direct toward that buffer.',
          'Recheck after 90 days and adjust if needed.',
        ],
      };
    }

    return {
      title: 'Convert surplus into structure',
      body: 'You have some breathing room. The opportunity now is turning that into a more reliable saving system that strengthens the rest of the foundation.',
      checklist: [
        'Choose a fixed monthly savings amount.',
        'Automate the transfer if possible.',
        'Track progress once a month for the next 90 days.',
      ],
    };
  }

  if (weakestPillar === 'income') {
    if (incomeGrowth === 'decreased') {
      return {
        title: 'Rebuild income momentum first',
        body: 'Because income has moved backward, the next move should focus on restoring stability before pushing harder on optimization elsewhere.',
        checklist: [
          'Identify the main reason income slipped.',
          'Choose one realistic way to stabilize or increase it.',
          'Set a 90-day target tied to take-home pay.',
        ],
      };
    }

    if (['high', 'moderate'].includes(incomeGrowthPotential)) {
      return {
        title: 'Use income as your next growth lever',
        body: 'You appear to have room to increase earning power from here. At this stage, one income move could lift saving, investing, and flexibility all at once.',
        checklist: [
          'Choose the most realistic path to higher income.',
          'Take one action this week: ask, apply, pitch, or start.',
          'Measure whether that move improves monthly margin.',
        ],
      };
    }

    return {
      title: 'Strengthen income stability',
      body: 'The next lift is not just earning more — it is making income feel more dependable so the rest of your plan can rest on a steadier base.',
      checklist: [
        'Identify the main source of income uncertainty.',
        'Choose one move that improves predictability.',
        'Review progress over the next 90 days.',
      ],
    };
  }

  if (immediateStep) {
    return {
      title: immediateStep.title || 'Best Next Move',
      body: immediateStep.body || (assessment?.nextStep ?? 'Choose one focused next step and keep it consistent.'),
      checklist:
        Array.isArray(immediateStep.checklist) && immediateStep.checklist.length
          ? immediateStep.checklist.slice(0, 3)
          : [assessment?.nextStep || 'Choose one focused next step and keep it consistent.'],
    };
  }

  if (assessment?.nextStep) {
    return {
      title: weakestPillar ? `Start with ${formatPillarName(weakestPillar)}` : 'Best Next Move',
      body: assessment.nextStep,
      checklist: [
        'Choose one concrete step to take this week.',
        'Keep the move small enough to repeat.',
        'Review progress before changing direction.',
      ],
    };
  }

  return {
    title: weakestPillar ? `Start with ${formatPillarName(weakestPillar)}` : 'Best Next Move',
    body: getDashboardNextMove(assessment, snapshot, weakestPillar),
    checklist: [
      'Choose one next step.',
      'Take action this week.',
      'Review what changed before adding more complexity.',
    ],
  };
}

function getDashboardWhyThisMatters(
  assessment: CurrentAssessmentShape | null,
  snapshot: ReturnType<typeof getStructuralSnapshot>,
  weakestPillar?: string
): string {
  const lifeStage = assessment?.lifeStage ?? 'stability';
  const answers = assessment?.answers ?? {};
  const confidence = answers.financialConfidence;
  const incomeGrowthPotential = answers.incomeGrowthPotential;

  if (snapshot && snapshot.fixedCostLoad >= 60) {
    return 'When too much take-home income is already committed, even strong habits can feel tight. Creating more breathing room gives the rest of your plan room to work.';
  }

  if (weakestPillar === 'protection') {
    return ['growth', 'catch_up'].includes(lifeStage)
      ? 'At this stage, the next risk is not simply growth — it is leaving what you have already built exposed to an avoidable setback.'
      : 'Protection matters now because one uncovered risk can interrupt progress before the rest of the foundation has a chance to compound.';
  }

  if (weakestPillar === 'vision') {
    return ['low', 'not_confident'].includes(confidence)
      ? 'Clearer direction reduces decision fatigue. Once the target is sharper, saving, investing, and tradeoffs usually get easier to sustain.'
      : 'This matters now because stronger direction helps the rest of your good habits work together instead of drifting in separate directions.';
  }

  if (weakestPillar === 'income') {
    return ['high', 'moderate'].includes(incomeGrowthPotential)
      ? 'Income is not just another category — it is the lever that can lift saving, investing, and flexibility all at once.'
      : 'A steadier income base gives the rest of the foundation something more dependable to build on.';
  }

  if (weakestPillar === 'investing') {
    return 'This matters now because the gap is no longer just about behavior — it is about making sure your long-term system is doing enough work for the future you want.';
  }

  if (weakestPillar === 'saving') {
    return 'A stronger buffer gives you more control over setbacks, better flexibility, and more confidence in the rest of the plan.';
  }

  if (assessment?.nextStep) {
    return 'This next move matters because it addresses the area most likely to improve the rest of your financial foundation, not just this one category.';
  }

  return 'The right next move should strengthen the weakest part of the system first so the rest of your progress becomes easier to sustain.';
}

const PILLAR_LABELS: Record<string, string> = {
  income: 'Income',
  spending: 'Spending',
  saving: 'Saving',
  investing: 'Investing',
  debt: 'Debt Pressure',
  protection: 'Protection',
  vision: 'Vision',
};

const PILLAR_ICONS: Record<string, React.ElementType> = {
  income: DollarSign,
  spending: CreditCard,
  saving: PiggyBank,
  investing: TrendingUp,
  debt: CreditCard,
  protection: Shield,
  vision: Eye,
};

function safeArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

function normalizeCurrentScore(
  assessment: CurrentAssessmentShape | null
): number {
  if (!assessment) return 0;

  if (typeof assessment.foundationScore === 'number') {
    return Math.max(0, Math.min(100, assessment.foundationScore));
  }

  if (typeof assessment.wealthScore === 'number') {
    return Math.max(
      0,
      Math.min(100, Math.round(((assessment.wealthScore - 300) / 550) * 100))
    );
  }

  return 0;
}

function normalizeHistoryScore(item: any): number | null {
  if (typeof item?.foundationScore === 'number') {
    return Math.max(0, Math.min(100, item.foundationScore));
  }

  if (typeof item?.overallScore === 'number') {
    return Math.max(0, Math.min(100, item.overallScore));
  }

  if (typeof item?.wealthScore === 'number') {
    return Math.max(
      0,
      Math.min(100, Math.round(((item.wealthScore - 300) / 550) * 100))
    );
  }

  return null;
}

function formatHistoryDate(createdAt?: number): string {
  if (!createdAt) return '';
  const millis = createdAt > 10_000_000_000 ? createdAt : createdAt * 1000;
  const date = new Date(millis);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function formatCurrency(value?: number | null): string {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return '—';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatPercent(value?: number | null): string {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return '—';
  }

  return `${Math.round(Number(value))}%`;
}

function scoreNarrative(score: number): string {
  if (score >= 80) {
    return 'Your foundation looks strong. The opportunity now is less about fixing problems and more about strengthening the weaker edges.';
  }
  if (score >= 60) {
    return 'You have momentum, but a few weaker areas are still holding back the rest of the house.';
  }
  if (score >= 40) {
    return 'Some pieces are in place, but your foundation still has meaningful gaps creating drag.';
  }
  return 'Your foundation needs reinforcement before long-term growth becomes the priority.';
}

function formatPillarName(pillar: string): string {
  return PILLAR_LABELS[pillar] || pillar;
}

function getStructuralSnapshot(metrics?: MetricsShape | null) {
  if (!metrics) return null;

  const income = Number(metrics.monthlyIncome ?? 0);
  const housing = Number(metrics.monthlyHousingCost ?? 0);
  const utilities = Number(metrics.monthlyUtilities ?? 0);
  const childcare = Number(metrics.monthlyChildcareCost ?? 0);
  const debt = Number(metrics.monthlyDebtPayments ?? 0);
  const fixedCosts = Number(
    metrics.monthlyFixedCosts ?? housing + utilities + childcare + debt
  );
  const fixedCostLoad = income > 0 ? (fixedCosts / income) * 100 : 0;
  const monthlyMargin = income - fixedCosts;

  return {
    income,
    housing,
    utilities,
    childcare,
    debt,
    fixedCosts,
    fixedCostLoad,
    monthlyMargin,
    debtToIncomeRatio: Number(metrics.debtToIncomeRatio ?? 0),
    savingsRate: Number(metrics.savingsRate ?? 0),
    totalSavings: Number(metrics.totalSavings ?? 0),
    totalInvestments: Number(metrics.totalInvestments ?? 0),
    netWorth: Number(metrics.netWorth ?? 0),
    homeEquity: Number(metrics.homeEquity ?? 0),
  };
}

function getLoadTone(load: number) {
  if (load >= 65) {
    return {
      badge: 'High Pressure',
      text: 'text-red-700',
      bg: 'bg-red-50',
      border: 'border-red-200',
      bar: 'bg-red-500',
    };
  }

  if (load >= 50) {
    return {
      badge: 'Tight',
      text: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      bar: 'bg-amber-500',
    };
  }

  return {
    badge: 'Healthy',
    text: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    bar: 'bg-emerald-500',
  };
}

function getMarginTone(margin: number): string {
  if (margin < 0) return 'text-red-600';
  if (margin < 500) return 'text-amber-600';
  return 'text-emerald-600';
}

function getDashboardNextMove(
  assessment: CurrentAssessmentShape | null,
  snapshot: ReturnType<typeof getStructuralSnapshot>,
  weakestPillar?: string
): string {
  if (snapshot && snapshot.fixedCostLoad >= 65) {
    return 'Create breathing room first. Review housing, utilities, and other fixed bills together, then decide whether the fastest win is a cost cut, an income increase, or both.';
  }

  if (snapshot && snapshot.fixedCostLoad >= 50) {
    return 'Start by tightening fixed costs and protecting your monthly margin. Small relief here can unlock better progress everywhere else.';
  }

  if (assessment?.nextStep) return assessment.nextStep;

  if (weakestPillar) {
    return `Start with ${formatPillarName(
      weakestPillar
    )}. One focused improvement here should have the biggest ripple effect.`;
  }

  return 'Choose one next step and make progress this week.';
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

function getWarningCard(
  warning: StructuralWarning,
  snapshot: ReturnType<typeof getStructuralSnapshot>
) {
  if (warning.type === 'housing_pressure' && snapshot) {
    return {
      title: 'Housing costs are crowding out progress',
      body: `Your fixed costs are about ${snapshot.fixedCostLoad.toFixed(
        0
      )}% of take-home pay, with housing around ${formatCurrency(
        snapshot.housing
      )} and utilities around ${formatCurrency(snapshot.utilities)}.`,
    };
  }

  if (warning.type === 'income_constraint') {
    return {
      title: 'Income is the bottleneck right now',
      body: 'This looks more like a math problem than a discipline problem. Increasing income or lowering a major fixed cost may create the biggest overall lift.',
    };
  }

  return {
    title: 'Structural pressure detected',
    body: 'Multiple fixed obligations may be limiting your breathing room and slowing progress elsewhere.',
  };
}

function CalculatorIcon(props: React.ComponentProps<typeof DollarSign>) {
  return <DollarSign {...props} />;
}

function getTrustedExperts(
  pillars: Record<string, number>,
  snapshot: ReturnType<typeof getStructuralSnapshot>,
  warnings: StructuralWarning[]
): ExpertCard[] {
  const cards: ExpertCard[] = [];

  const hasProtectionGap = Number(pillars.protection ?? 0) < 75;
  const hasInvestingGap = Number(pillars.investing ?? 0) < 75;
  const hasVisionGap = Number(pillars.vision ?? 0) < 70;
  const hasHousingPressure = !!snapshot && snapshot.fixedCostLoad >= 50;
  const hasTaxComplexity =
    !!snapshot &&
    ((snapshot.totalInvestments ?? 0) > 100000 ||
      (snapshot.homeEquity ?? 0) > 0);
  const hasDebtPressure = warnings.some(
    (warning) => warning.type === 'structural_pressure'
  );

  if (hasInvestingGap) {
    cards.push({
      key: 'planner',
      title: 'Take your investing to the next level',
      reason:
        'A fiduciary advisor can help optimize allocation, reduce tax drag, and align a stronger long-term investment strategy with your goals.',
      cta: 'Unlock advisor matching',
      icon: TrendingUp,
      tone: 'bg-blue-50 border-blue-200',
    });
  }

  if (hasProtectionGap) {
    cards.push({
      key: 'insurance',
      title: 'Protect what you are building',
      reason:
        'Insurance and protection reviews can help keep one setback from undoing years of progress.',
      cta: 'Unlock protection guidance',
      icon: Shield,
      tone: 'bg-emerald-50 border-emerald-200',
    });
  }

  if (hasVisionGap || hasTaxComplexity) {
    cards.push({
      key: 'estate',
      title: 'Build a clearer long-term plan',
      reason:
        'Planning support can help turn strong habits into a more intentional strategy for family, tax efficiency, and legacy.',
      cta: 'Unlock planning guidance',
      icon: FileText,
      tone: 'bg-purple-50 border-purple-200',
    });
  }

  if (hasTaxComplexity) {
    cards.push({
      key: 'cpa',
      title: 'Reduce tax drag and surprises',
      reason:
        'Tax guidance can help your saving and investing decisions work harder while reducing avoidable friction.',
      cta: 'Unlock tax guidance',
      icon: CalculatorIcon,
      tone: 'bg-amber-50 border-amber-200',
    });
  }

  if (hasHousingPressure || hasDebtPressure) {
    cards.push({
      key: 'housing',
      title: 'Improve your monthly structure',
      reason:
        'Housing and cash-flow strategy can help free up margin when fixed costs are shaping the rest of your financial picture.',
      cta: 'Unlock structural help',
      icon: Home,
      tone: 'bg-copper-50 border-[#eac89a]',
    });
  }

  return cards
    .filter((card, index, all) => all.findIndex((x) => x.key === card.key) === index)
    .slice(0, 3);
}

function ProfessionalHouse({
  pillarScores,
}: {
  pillarScores: Record<string, number>;
}) {
  const blocks = [
    { key: 'investing', label: 'INVEST', x: 56, y: 88, w: 56, h: 56 },
    { key: 'saving', label: 'SAVING', x: 120, y: 88, w: 68, h: 56 },
    { key: 'vision', label: 'VISION', x: 196, y: 88, w: 52, h: 56 },
    { key: 'spending', label: 'SPEND', x: 40, y: 158, w: 50, h: 60 },
    { key: 'income', label: 'INCOME', x: 98, y: 158, w: 58, h: 60 },
    { key: 'debt', label: 'DEBT', x: 164, y: 158, w: 50, h: 60 },
    { key: 'protection', label: 'PROTECT', x: 222, y: 158, w: 58, h: 60 },
  ];

  const tone = (score: number) => {
    if (score >= 80) return '#22b57a';
    if (score >= 60) return '#d58a21';
    return '#ef4444';
  };

  return (
    <div className="rounded-3xl border border-[#d7e3f0] bg-white p-4 shadow-sm">
      <div className="mb-3">
        <div className="text-sm font-semibold text-navy-900">House View</div>
        <p className="text-xs text-gray-500 mt-1">
          A visual summary of how your building blocks are supporting the foundation.
        </p>
      </div>

      <svg
        viewBox="0 0 320 272"
        className="w-full h-auto"
        style={{ maxHeight: '248px' }}
      >
        <defs>
          <linearGradient id="roofGradDash" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#17365d" />
            <stop offset="100%" stopColor="#284d7d" />
          </linearGradient>
          <filter
            id="houseShadow"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feDropShadow
              dx="0"
              dy="5"
              stdDeviation="5"
              floodColor="#0f172a"
              floodOpacity="0.12"
            />
          </filter>
        </defs>

        <path
          d="M160 20 L294 76 H26 Z"
          fill="url(#roofGradDash)"
          filter="url(#houseShadow)"
        />
        <rect x="28" y="226" width="264" height="28" rx="4" fill="#344154" />
        <text
          x="160"
          y="244"
          textAnchor="middle"
          fill="white"
          fontSize="12"
          fontWeight="700"
        >
          FOUNDATION
        </text>

        {blocks.map((block) => {
          const score = Number(pillarScores[block.key] ?? 0);
          return (
            <g key={block.key} filter="url(#houseShadow)">
              <rect
                x={block.x}
                y={block.y}
                width={block.w}
                height={block.h}
                rx="7"
                fill={tone(score)}
                stroke="white"
                strokeWidth="3"
              />
              <text
                x={block.x + block.w / 2}
                y={block.y + block.h / 2 + 3}
                textAnchor="middle"
                fill="white"
                fontSize="9"
                fontWeight="700"
              >
                {block.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-3 flex justify-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-emerald-500" />
          Strong
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-amber-500" />
          Building
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-red-500" />
          Needs work
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  label,
  title,
  description,
  theme,
}: {
  icon: React.ElementType;
  label: string;
  title: string;
  description: string;
  theme: 'foundation' | 'picture' | 'action';
}) {
  const themeMap = {
    foundation: 'bg-copper-50 text-copper-700 border-copper-100',
    picture: 'bg-blue-50 text-blue-700 border-blue-100',
    action: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  } as const;

  return (
    <div className="mb-5">
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-[0.18em] ${themeMap[theme]}`}
      >
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <h2 className="mt-3 text-2xl md:text-[1.75rem] font-bold text-navy-900">
        {title}
      </h2>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
    </div>
  );
}

function LockedPreview({
  title,
  description,
  upgradeLabel,
  onUpgrade,
  children,
}: {
  title: string;
  description: string;
  upgradeLabel: string;
  onUpgrade: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-[#d7e3f0] bg-white shadow-sm overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-5 h-5 text-copper-600" />
          <h3 className="text-xl font-bold text-navy-900">{title}</h3>
        </div>

        <p className="text-gray-600 leading-7 mb-5">{description}</p>

        <div className="relative">
          <div className="pointer-events-none select-none opacity-80">{children}</div>
          <div className="absolute inset-0 bg-white/45 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
            <div className="text-center px-6">
              <div className="text-navy-900 font-semibold mb-2">
                Visible preview. Full interaction is locked.
              </div>
              <button
                onClick={onUpgrade}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-copper-600 text-white font-semibold hover:bg-copper-700"
              >
                {upgradeLabel}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButtonCard({
  icon: Icon,
  title,
  body,
  onClick,
  accent = 'bg-white',
}: {
  icon: React.ElementType;
  title: string;
  body: string;
  onClick: () => void;
  accent?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border border-[#d7e3f0] p-5 text-left shadow-sm hover:bg-white transition-colors ${accent}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-white border border-white/80 flex items-center justify-center">
          <Icon className="w-5 h-5 text-copper-600" />
        </div>
        <div className="font-semibold text-navy-900">{title}</div>
      </div>
      <p className="text-sm text-gray-600 leading-6">{body}</p>
    </button>
  );
}


export default function DashboardPage({ onLogout }: DashboardPageProps) {
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();

  const { user, currentAssessment, assessmentHistory, refreshProfile } =
    useAppStore() as any;

  const { track, trackLockedFeature, trackUpgradeClick, trackTabViewed } =
    useTrackEvent();
  const actualPlan = useUserPlan();
  const currentPlan: PlanTier =
    actualPlan === 'standard' || actualPlan === 'premium' ? actualPlan : 'free';
  const entitlements = getEntitlements(currentPlan);
  const [showSuccess, setShowSuccess] = useState(false);

  const rawAssessment = (currentAssessment as (CurrentAssessmentShape & { report?: CurrentAssessmentShape }) | null) ?? null;

  useEffect(() => {
    async function handleCheckoutSuccess() {
      if (searchParams.get('checkout') !== 'success') return;

      try {
        await refreshProfile?.();
        setShowSuccess(true);
      } finally {
        const url = new URL(window.location.href);
        url.searchParams.delete('checkout');
        window.history.replaceState({}, '', `${url.pathname}${url.search}`);
      }
    }

    void handleCheckoutSuccess();
  }, [searchParams, refreshProfile]);

  const historyRecords = useMemo(() => {
    return safeArray(assessmentHistory as any[]).sort((a: any, b: any) => {
      const aTime = a?.createdAt ?? 0;
      const bTime = b?.createdAt ?? 0;
      return bTime - aTime;
    });
  }, [assessmentHistory]);

  const latestHistoryRecord = historyRecords[0] ?? null;
  const latestHistoryReport = ((latestHistoryRecord?.report ?? null) as CurrentAssessmentShape | null) ?? null;
  const currentReport = ((rawAssessment?.report ?? rawAssessment) as CurrentAssessmentShape | null) ?? null;
  const assessment = (currentReport ?? latestHistoryReport ?? latestHistoryRecord ?? null) as CurrentAssessmentShape | null;
  const foundationScore = normalizeCurrentScore(assessment);
  const showAssessment = foundationScore > 0;
  const scoreBand = foundationScore > 0 ? getScoreBand(foundationScore) : null;

  const [whatIf, setWhatIf] = useState({ income: 500, housing: 300, debt: 0 });
  const [guidanceTab, setGuidanceTab] = useState<GuidanceTab>('roadmap');

  const latestAssessmentType = latestHistoryRecord?.assessmentType ?? rawAssessment?.assessmentType ?? assessment?.assessmentType ?? null;
  const latestPaidType = latestAssessmentType === 'detailed' || latestAssessmentType === 'premium';
  const currentAssessmentType = rawAssessment?.assessmentType ?? assessment?.assessmentType;
  const canViewPremium = currentPlan === 'premium' || latestAssessmentType === 'premium' || currentAssessmentType === 'premium';
  const canViewFullReport =
    currentPlan === 'standard' ||
    currentPlan === 'premium' ||
    latestPaidType ||
    currentAssessmentType === 'detailed' ||
    currentAssessmentType === 'premium';
  const canExportPdf = entitlements.canDownloadPdf || latestPaidType;

  const pillarScores = (assessment?.pillarScores ?? assessment?.pillars ?? latestHistoryReport?.pillarScores ?? latestHistoryReport?.pillars ?? {}) as Record<
    string,
    number
  >;
  const priorities = safeArray(assessment?.priorities ?? assessment?.topFocusAreas);
  const insights = safeArray(assessment?.insights);
  const warnings = safeArray(assessment?.structuralWarnings);
  const snapshot = useMemo(
    () => getStructuralSnapshot(assessment?.metrics ?? latestHistoryReport?.metrics),
    [assessment?.metrics, latestHistoryReport?.metrics]
  );

  const weakestPillar = useMemo(() => {
    const entries = Object.entries(pillarScores)
      .map(([key, value]) => [key, Number(value)] as [string, number])
      .filter(([, value]) => !Number.isNaN(value))
      .sort((a, b) => a[1] - b[1]);

    return entries[0]?.[0] ?? null;
  }, [pillarScores]);

  const strongestPillar = useMemo(() => {
    const entries = Object.entries(pillarScores)
      .map(([key, value]) => [key, Number(value)] as [string, number])
      .filter(([, value]) => !Number.isNaN(value))
      .sort((a, b) => b[1] - a[1]);

    return entries[0]?.[0] ?? null;
  }, [pillarScores]);

  useEffect(() => {
    void track(
      'dashboard_viewed',
      {
        hasAssessment: showAssessment,
        foundationScore,
        weakestPillar,
        currentPlan,
      },
      'dashboard'
    );
  }, [track, showAssessment, foundationScore, weakestPillar, currentPlan]);

  useEffect(() => {
    void trackTabViewed(guidanceTab, 'premium_guidance');
  }, [guidanceTab, trackTabViewed]);

  const pillarEntries = useMemo(() => {
    return Object.entries(pillarScores)
      .map(([key, value]) => [key, Number(value)] as [string, number])
      .filter(([, value]) => !Number.isNaN(value))
      .sort((a, b) => b[1] - a[1]);
  }, [pillarScores]);

  const scoreHistory = useMemo(() => {
    return (assessmentHistory || [])
      .map((item: any) => {
        const score = normalizeHistoryScore(item);
        if (score === null || Number.isNaN(score)) return null;

        return {
          id: item.id,
          score,
          createdAt: item.createdAt,
          assessmentType: item.assessmentType,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => {
        const aTime = a.createdAt ?? 0;
        const bTime = b.createdAt ?? 0;
        return aTime - bTime;
      }) as {
      id: string | number;
      score: number;
      createdAt?: number;
      assessmentType?: string;
    }[];
  }, [assessmentHistory]);

  const latestHistoryItem = scoreHistory.length
    ? scoreHistory[scoreHistory.length - 1]
    : null;
  const previousScore =
    scoreHistory.length > 1 ? scoreHistory[scoreHistory.length - 2]?.score ?? null : null;

  const handleViewLatestReport = () => {
    void track(
      'view_latest_report_clicked',
      { source: 'hero', latestAssessmentType },
      'navigation'
    );

    if (latestAssessmentType === 'free') {
      navigate('/results/snapshot');
      return;
    }

    if (latestAssessmentType === 'detailed' || latestAssessmentType === 'premium') {
      navigate('/results');
      return;
    }

    if (showAssessment) {
      navigate('/results');
      return;
    }

    navigate('/assessment/snapshot');
  };

  const handleRetakeAssessment = () => {
    void track('retake_assessment_clicked', { source: 'hero' }, 'assessment');
    navigate('/assessment/comprehensive?mode=retake');
  };

  const chart = useMemo(() => {
    const width = 720;
    const height = 200;
    const padding = 18;

    const points = scoreHistory.map((point, index) => {
      const x =
        scoreHistory.length <= 1
          ? width / 2
          : padding +
            (index / (scoreHistory.length - 1)) * (width - padding * 2);
      const y = height - padding - (point.score / 100) * (height - padding * 2);

      return { ...point, x, y };
    });

    return {
      width,
      height,
      points,
      polyline: points.map((p) => `${p.x},${p.y}`).join(' '),
    };
  }, [scoreHistory]);

  const trustedExperts = useMemo(
    () => getTrustedExperts(pillarScores, snapshot, warnings),
    [pillarScores, snapshot, warnings]
  );

  const scenarioResult = useMemo(() => {
    if (!snapshot) return null;

    const adjustedIncome = snapshot.income + Number(whatIf.income || 0);
    const adjustedFixedCosts =
      Math.max(0, snapshot.housing - Number(whatIf.housing || 0)) +
      snapshot.utilities +
      snapshot.childcare +
      Math.max(0, snapshot.debt - Number(whatIf.debt || 0));

    const adjustedLoad =
      adjustedIncome > 0 ? (adjustedFixedCosts / adjustedIncome) * 100 : 0;
    const adjustedMargin = adjustedIncome - adjustedFixedCosts;

    return {
      adjustedLoad,
      adjustedMargin,
      adjustedIncome,
      adjustedFixedCosts,
    };
  }, [snapshot, whatIf]);

  async function handlePrintPDF() {
    if (!canExportPdf) {
      void trackLockedFeature('pdf_export', 'dashboard_header');
      void trackUpgradeClick('standard', 'pdf_export', 'dashboard_header');
      navigate('/pricing');
      return;
    }

    void track('pdf_export_clicked', { currentPlan }, 'conversion');

    if (!printRef.current) return;

    try {
      await exportReportPdf({
        element: printRef.current,
        tier: canViewPremium ? 'premium' : canViewFullReport ? 'standard' : 'free',
        foundationScore,
      });
    } catch (error) {
      console.error('PDF export failed:', error);
    }
  }

  const welcomeName = user?.name || user?.email?.split('@')?.[0] || 'there';
  const fixedCostTone = getLoadTone(snapshot?.fixedCostLoad || 0);
  const dashboardNextMoveCard = useMemo(
    () => getDashboardNextMoveCard(assessment, snapshot, weakestPillar ?? undefined),
    [assessment, snapshot, weakestPillar]
  );
  const dashboardWhyThisMatters = useMemo(
    () => getDashboardWhyThisMatters(assessment, snapshot, weakestPillar ?? undefined),
    [assessment, snapshot, weakestPillar]
  );

  return (
    <div className="min-h-screen bg-[#f6f9fc] flex flex-col">
      

      <main ref={printRef} className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        {showSuccess && currentPlan !== 'free' && (
          <div
            data-pdf-ignore="true"
            className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-emerald-900">
                  You’ve unlocked {PLAN_FEATURES[currentPlan].name}
                </p>
                <p className="mt-1 text-sm text-emerald-800">
                  Your dashboard and report now reflect your upgraded access.
                </p>
              </div>
            </div>
          </div>
        )}

        <section className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6 mb-6">
          <div className="bg-gradient-to-br from-[#17385a] to-[#21456d] rounded-3xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-6 md:p-8 text-white">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-copper-50 text-copper-700 text-sm font-semibold">
                <Sparkles className="w-4 h-4" />
                Welcome back, {welcomeName}
              </div>

              {PLAN_FEATURES[currentPlan].badgeLabel ? (
                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${getPlanBadgeClass(currentPlan)}`}>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {PLAN_FEATURES[currentPlan].badgeLabel}
                </span>
              ) : null}
            </div>

            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
              {showAssessment ? 'Your dashboard is ready.' : 'Start building your dashboard.'}
            </h2>

            <p className="text-white/85 leading-7 max-w-3xl">
              {showAssessment
                ? assessment?.summary || scoreNarrative(foundationScore)
                : 'Complete your first assessment to unlock your Foundation Score, dashboard insights, and action plan.'}
            </p>

            <div data-pdf-ignore="true" className="mt-6 flex flex-wrap gap-3">
  <button
    onClick={handleViewLatestReport}
    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-navy-900 font-medium hover:bg-[#f8fbff]"
  >
    <Eye className="w-4 h-4" />
    {latestAssessmentType === 'free' ? 'View Snapshot Report' : 'View Latest Report'}
  </button>

  <button
    onClick={handleRetakeAssessment}
    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 bg-transparent text-white font-medium hover:bg-white/10"
  >
    <ArrowRight className="w-4 h-4" />
    Retake Assessment
  </button>

  <button
    onClick={handlePrintPDF}
    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 bg-white/10 text-white font-medium hover:bg-white/15"
  >
    <Download className="w-4 h-4" />
    {canExportPdf ? 'Save as PDF' : 'Unlock PDF'}
  </button>

  <button
    onClick={onLogout}
    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 bg-transparent text-white font-medium hover:bg-white/10"
  >
    <LogOut className="w-4 h-4" />
    Logout
  </button>
</div>

<div className="mt-4 flex flex-wrap gap-3">
              {showAssessment && scoreBand ? (
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${scoreBand.bg} ${scoreBand.color}`}
                >
                  {scoreBand.label}
                </span>
              ) : null}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#d7e3f0] shadow-sm p-6 md:p-8">
            {showAssessment ? (
              <>
                <div className="text-sm uppercase tracking-[0.18em] text-copper-600 mb-3">
                  Foundation Score
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="inline-flex items-center justify-center w-36 h-36 rounded-full bg-gradient-to-br from-[#ffcf9e] to-[#b87333] text-white text-5xl font-bold shadow-[0_20px_60px_rgba(194,120,58,0.25)] shrink-0">
                    {foundationScore}
                  </div>

                  <div className="flex-1">
                    {scoreBand ? (
                      <div
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${scoreBand.bg} ${scoreBand.color}`}
                      >
                        {scoreBand.label}
                      </div>
                    ) : null}

                    <p className="mt-3 text-gray-600 leading-7">
                      {scoreNarrative(foundationScore)}
                    </p>

                    {previousScore !== null ? (
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-copper-50 border border-copper-100 px-3 py-1 text-sm font-medium text-copper-700">
                        <Clock3 className="w-4 h-4" />
                        Last score: {previousScore} → Now: {foundationScore}
                      </div>
                    ) : null}

                    {latestHistoryItem?.createdAt ? (
                      <div className="mt-2 text-sm text-gray-500">
                        Latest report saved {formatHistoryDate(latestHistoryItem.createdAt)}
                      </div>
                    ) : null}

                    <div className="mt-4 rounded-2xl bg-[#f8fbff] border border-[#d7e3f0] p-4">
                      <div className="text-sm font-semibold text-navy-900 mb-2">
                        Best Next Move
                      </div>
                      <p className="text-gray-700 leading-7">
                        {getDashboardNextMove(
                          assessment,
                          snapshot,
                          weakestPillar ?? undefined
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-[#f8fbff] border border-[#d7e3f0] flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-copper-600" />
                </div>

                <h3 className="text-2xl font-bold text-navy-900 mb-2">
                  No Assessment Yet
                </h3>

                <p className="text-gray-600 leading-7 mb-6">
                  Complete your first assessment to start building your dashboard.
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      void track(
                        'quick_assessment_clicked',
                        { source: 'empty_state' },
                        'assessment'
                      );
                      navigate('/assessment/snapshot');
                    }}
                    className="px-5 py-3 rounded-xl bg-copper-600 text-white font-semibold hover:bg-copper-700"
                  >
                    Start Snapshot
                  </button>

                  <button
                    onClick={() => {
                      void track(
                        'pricing_viewed_clicked',
                        { source: 'empty_state' },
                        'conversion'
                      );
                      navigate('/pricing');
                    }}
                    className="px-5 py-3 rounded-xl border border-[#d7e3f0] text-navy-900 font-semibold hover:bg-[#f8fbff]"
                  >
                    View Plans
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        {showAssessment ? (
          <>
            <section className="rounded-3xl border border-copper-100 bg-copper-50/35 p-4 md:p-5 mb-6">
              <SectionHeader
                icon={Sparkles}
                label="Section 1"
                title="Your Foundation"
                description="Where you stand right now, what is strongest, and what needs attention next."
                theme="foundation"
              />

              <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 items-start">
                <div className="bg-white rounded-3xl border border-[#d7e3f0] shadow-sm p-6 md:p-8 self-start">
                  <div className="flex items-center gap-2 mb-5">
                    <Target className="w-5 h-5 text-copper-600" />
                    <h3 className="text-2xl font-bold text-navy-900">
                      Current Priorities
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {safeArray(priorities)
                      .slice(0, 3)
                      .map((priority, index) => (
                        <div
                          key={index}
                          className="rounded-2xl bg-[#f8fbff] border border-[#d7e3f0] p-4"
                        >
                          <div className="text-sm font-semibold text-copper-600 mb-1">
                            Priority {index + 1}
                          </div>
                          <p className="text-gray-700 leading-7">{priority}</p>
                        </div>
                      ))}

                    {!priorities.length && (
                      <div className="rounded-2xl bg-[#f8fbff] border border-[#d7e3f0] p-4">
                        <p className="text-gray-700 leading-7">
                          {assessment?.nextStep || 'Your next priorities will appear here after your report is generated.'}
                        </p>
                      </div>
                    )}

                    <div className="rounded-2xl border border-copper-200 bg-copper-50/45 p-5">
                      <div className="text-sm font-semibold text-copper-700 mb-2">
                        Best Next Move
                      </div>
                      <div className="font-semibold text-navy-900 mb-2">
                        {dashboardNextMoveCard.title}
                      </div>
                      <p className="text-gray-700 leading-7 mb-4">
                        {dashboardNextMoveCard.body}
                      </p>
                      <ul className="space-y-2">
                        {dashboardNextMoveCard.checklist.map((item, index) => (
                          <li
                            key={`dashboard-next-move-${index}`}
                            className="flex items-start gap-2 text-sm text-gray-700"
                          >
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-copper-600" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-[#d7e3f0] bg-[#f8fbff] p-5">
                      <div className="text-sm font-semibold text-navy-900 mb-2">
                        Why this matters now
                      </div>
                      <p className="text-gray-700 leading-7">
                        {dashboardWhyThisMatters}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white border border-[#d7e3f0] rounded-2xl p-4 shadow-sm">
                      <div className="text-sm text-gray-500 mb-1">Top strength</div>
                      <div className="font-semibold text-navy-900">
                        {strongestPillar ? formatPillarName(strongestPillar) : '—'}
                      </div>
                    </div>

                    <div className="bg-white border border-[#d7e3f0] rounded-2xl p-4 shadow-sm">
                      <div className="text-sm text-gray-500 mb-1">
                        Biggest opportunity
                      </div>
                      <div className="font-semibold text-navy-900">
                        {weakestPillar ? formatPillarName(weakestPillar) : '—'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-[#d7e3f0] shadow-sm p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-5">
                      <TrendingUp className="w-5 h-5 text-copper-600" />
                      <h3 className="text-2xl font-bold text-navy-900">
                        Pillar Breakdown
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {pillarEntries.map(([pillar, score]) => {
                        const tone = getPillarTone(score);
                        const Icon = PILLAR_ICONS[pillar] || CheckCircle2;

                        return (
                          <div
                            key={pillar}
                            className={`rounded-2xl border p-5 ${tone.bg}`}
                          >
                            <div className="flex items-center justify-between gap-4 mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/80 border border-white flex items-center justify-center">
                                  <Icon className={`w-5 h-5 ${tone.text}`} />
                                </div>
                                <div>
                                  <div className="font-bold text-navy-900">
                                    {formatPillarName(pillar)}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {score}/100
                                  </div>
                                </div>
                              </div>

                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${tone.badge}`}
                              >
                                {tone.label}
                              </span>
                            </div>

                            <div className="h-2 bg-white rounded-full overflow-hidden">
                              <div
                                className={`h-full ${tone.bar}`}
                                style={{ width: `${Math.max(4, score)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-blue-100 bg-blue-50/35 p-4 md:p-5 mb-6">
              <SectionHeader
                icon={BarChart3}
                label="Section 2"
                title="Your Financial Picture"
                description="A closer look at the structural numbers shaping your progress."
                theme="picture"
              />

              <div className="grid xl:grid-cols-[1fr_1fr] gap-6 mb-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {snapshot ? (
                    <>
                      <div
                        className={`rounded-3xl border p-5 ${fixedCostTone.bg} ${fixedCostTone.border}`}
                      >
                        <div className="text-sm text-gray-500 mb-2">
                          Fixed Cost Load
                        </div>
                        <div className={`text-3xl font-bold ${fixedCostTone.text}`}>
                          {formatPercent(snapshot.fixedCostLoad)}
                        </div>
                        <div
                          className={`mt-2 inline-flex px-3 py-1 rounded-full text-xs font-semibold ${fixedCostTone.bg} ${fixedCostTone.text}`}
                        >
                          {fixedCostTone.badge}
                        </div>
                        <div className="mt-4 h-3 bg-white rounded-full overflow-hidden">
                          <div
                            className={`h-full ${fixedCostTone.bar}`}
                            style={{
                              width: `${Math.max(
                                6,
                                Math.min(100, snapshot.fixedCostLoad)
                              )}%`,
                            }}
                          />
                        </div>
                        <p className="mt-3 text-sm text-gray-600">
                          {formatCurrency(snapshot.fixedCosts)} of{' '}
                          {formatCurrency(snapshot.income)} is already committed.
                        </p>
                      </div>

                      <div className="rounded-3xl border border-[#d7e3f0] bg-white p-5">
                        <div className="text-sm text-gray-500 mb-2">
                          Monthly Breathing Room
                        </div>
                        <div
                          className={`text-3xl font-bold ${getMarginTone(
                            snapshot.monthlyMargin
                          )}`}
                        >
                          {formatCurrency(snapshot.monthlyMargin)}
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          Income minus housing, utilities, childcare, and debt.
                        </p>
                      </div>

                      <div className="rounded-3xl border border-[#d7e3f0] bg-white p-5">
                        <div className="text-sm text-gray-500 mb-2">
                          Savings / Investing Base
                        </div>
                        <div className="text-3xl font-bold text-navy-900">
                          {formatCurrency(
                            (snapshot.totalSavings ?? 0) +
                              (snapshot.totalInvestments ?? 0)
                          )}
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          Cash reserves plus long-term investment assets.
                        </p>
                      </div>

                      <div className="rounded-3xl border border-[#d7e3f0] bg-white p-5 ring-1 ring-copper-100">
                        <div className="text-sm text-gray-500 mb-2">
                          Net Worth
                        </div>
                        <div className="text-3xl font-bold text-navy-900">
                          Coming Soon
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          We will unlock a more accurate net worth view once more
                          asset and liability data is included.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-full rounded-3xl border border-[#d7e3f0] bg-white p-6">
                      <p className="text-gray-600">
                        Your structural metrics will appear here after your full
                        report is generated.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {canViewFullReport ? (
                    <div className="bg-white rounded-3xl border border-[#d7e3f0] shadow-sm p-6 md:p-8">
                      <div className="flex items-center gap-2 mb-5">
                        <Zap className="w-5 h-5 text-copper-600" />
                        <h3 className="text-2xl font-bold text-navy-900">
                          What-If Calculator
                        </h3>
                      </div>

                      {snapshot && scenarioResult ? (
                        <>
                          <div className="grid sm:grid-cols-3 gap-3 mb-5">
                            <label className="block">
                              <div className="text-sm text-gray-500 mb-2">
                                Extra income / mo
                              </div>
                              <input
                                type="number"
                                value={whatIf.income}
                                onChange={(e) =>
                                  setWhatIf((prev) => ({
                                    ...prev,
                                    income: Number(e.target.value || 0),
                                  }))
                                }
                                className="w-full rounded-xl border border-[#d7e3f0] px-4 py-2.5"
                              />
                            </label>

                            <label className="block">
                              <div className="text-sm text-gray-500 mb-2">
                                Lower housing / mo
                              </div>
                              <input
                                type="number"
                                value={whatIf.housing}
                                onChange={(e) =>
                                  setWhatIf((prev) => ({
                                    ...prev,
                                    housing: Number(e.target.value || 0),
                                  }))
                                }
                                className="w-full rounded-xl border border-[#d7e3f0] px-4 py-2.5"
                              />
                            </label>

                            <label className="block">
                              <div className="text-sm text-gray-500 mb-2">
                                Lower debt / mo
                              </div>
                              <input
                                type="number"
                                value={whatIf.debt}
                                onChange={(e) =>
                                  setWhatIf((prev) => ({
                                    ...prev,
                                    debt: Number(e.target.value || 0),
                                  }))
                                }
                                className="w-full rounded-xl border border-[#d7e3f0] px-4 py-2.5"
                              />
                            </label>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="rounded-2xl border border-[#d7e3f0] bg-[#f8fbff] p-4">
                              <div className="text-sm text-gray-500 mb-1">
                                Adjusted fixed cost load
                              </div>
                              <div className="text-2xl font-bold text-navy-900">
                                {formatPercent(scenarioResult.adjustedLoad)}
                              </div>
                            </div>

                            <div className="rounded-2xl border border-[#d7e3f0] bg-[#f8fbff] p-4">
                              <div className="text-sm text-gray-500 mb-1">
                                Adjusted monthly breathing room
                              </div>
                              <div
                                className={`text-2xl font-bold ${getMarginTone(
                                  scenarioResult.adjustedMargin
                                )}`}
                              >
                                {formatCurrency(scenarioResult.adjustedMargin)}
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-gray-600">
                          Scenario modeling will appear here as soon as your structural metrics finish loading.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-[#d7e3f0] bg-white shadow-sm overflow-hidden">
                      <div className="p-6 md:p-8">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertCircle className="w-5 h-5 text-copper-600" />
                          <h3 className="text-2xl font-bold text-navy-900">
                            What-If Calculator
                          </h3>
                        </div>

                        <p className="text-gray-600 leading-7 mb-5">
                          See how more income, lower housing, or less debt could change your monthly structure before you make the move.
                        </p>

                        {snapshot && scenarioResult ? (
                          <>
                            <div className="grid sm:grid-cols-3 gap-3 mb-5">
                              <label className="block">
                                <div className="text-sm text-gray-500 mb-2">
                                  Extra income / mo
                                </div>
                                <input
                                  type="number"
                                  value={whatIf.income}
                                  disabled
                                  className="w-full rounded-xl border border-[#d7e3f0] bg-[#f8fbff] px-4 py-2.5 text-gray-500"
                                />
                              </label>

                              <label className="block">
                                <div className="text-sm text-gray-500 mb-2">
                                  Lower housing / mo
                                </div>
                                <input
                                  type="number"
                                  value={whatIf.housing}
                                  disabled
                                  className="w-full rounded-xl border border-[#d7e3f0] bg-[#f8fbff] px-4 py-2.5 text-gray-500"
                                />
                              </label>

                              <label className="block">
                                <div className="text-sm text-gray-500 mb-2">
                                  Lower debt / mo
                                </div>
                                <input
                                  type="number"
                                  value={whatIf.debt}
                                  disabled
                                  className="w-full rounded-xl border border-[#d7e3f0] bg-[#f8fbff] px-4 py-2.5 text-gray-500"
                                />
                              </label>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4 mb-5">
                              <div className="rounded-2xl border border-[#d7e3f0] bg-[#f8fbff] p-4">
                                <div className="text-sm text-gray-500 mb-1">
                                  Adjusted fixed cost load
                                </div>
                                <div className="text-2xl font-bold text-navy-900">
                                  {formatPercent(scenarioResult.adjustedLoad)}
                                </div>
                              </div>

                              <div className="rounded-2xl border border-[#d7e3f0] bg-[#f8fbff] p-4">
                                <div className="text-sm text-gray-500 mb-1">
                                  Adjusted monthly breathing room
                                </div>
                                <div
                                  className={`text-2xl font-bold ${getMarginTone(
                                    scenarioResult.adjustedMargin
                                  )}`}
                                >
                                  {formatCurrency(scenarioResult.adjustedMargin)}
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="grid sm:grid-cols-2 gap-4 mb-5">
                            <div className="rounded-2xl border border-[#d7e3f0] bg-[#f8fbff] p-4">
                              <div className="text-sm text-gray-500 mb-1">
                                Adjusted fixed cost load
                              </div>
                              <div className="text-2xl font-bold text-navy-900">—</div>
                            </div>

                            <div className="rounded-2xl border border-[#d7e3f0] bg-[#f8fbff] p-4">
                              <div className="text-sm text-gray-500 mb-1">
                                Adjusted monthly breathing room
                              </div>
                              <div className="text-2xl font-bold text-navy-900">—</div>
                            </div>
                          </div>
                        )}

                        <div className="rounded-2xl border border-copper-200 bg-copper-50/40 p-5">
                          <div className="font-semibold text-navy-900 mb-2">
                            Try your own numbers with {currentPlan === 'free' ? 'Foundation Assessment' : 'Foundation Roadmap'}.
                          </div>
                          <p className="text-sm text-gray-700 leading-6 mb-4">
                            This preview shows what the calculator does. Unlock it to test your own numbers and see how structural changes could affect your monthly breathing room.
                          </p>
                          <button
                            onClick={() => {
                              void trackLockedFeature('what_if_calculator', 'dashboard');
                              void trackUpgradeClick(
                                currentPlan === 'free' ? 'standard' : 'premium',
                                'what_if_calculator',
                                'dashboard'
                              );
                              navigate('/pricing');
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-copper-600 text-white font-semibold hover:bg-copper-700"
                          >
                            {currentPlan === 'free' ? 'Unlock with Standard' : 'Unlock with Premium'}
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded-3xl border border-[#d7e3f0] shadow-sm p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-5">
                      <Shield className="w-5 h-5 text-copper-600" />
                      <h3 className="text-2xl font-bold text-navy-900">
                        Stress Signals
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {warnings.length ? (
                        warnings.slice(0, 2).map((warning, index) => {
                          const card = getWarningCard(warning, snapshot);
                          return (
                            <div
                              key={index}
                              className="rounded-2xl border border-amber-200 bg-amber-50 p-5"
                            >
                              <div className="text-sm font-semibold text-amber-800 mb-2">
                                {card.title}
                              </div>
                              <p className="text-gray-700 leading-7">
                                {card.body}
                              </p>
                            </div>
                          );
                        })
                      ) : (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                          <div className="text-sm font-semibold text-emerald-800 mb-2">
                            No major structural warning signs
                          </div>
                          <p className="text-gray-700 leading-7">
                            Your current financial structure does not show a major
                            fixed-cost or debt pressure alert. That gives you more
                            room to focus on refinement and steady progress.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-emerald-100 bg-emerald-50/35 p-4 md:p-5 mb-6">
              <SectionHeader
                icon={Calendar}
                label="Section 3"
                title="Your Action Plan"
                description="What to do next, what to unlock, and how to keep moving forward."
                theme="action"
              />

              <div className="grid lg:grid-cols-[1fr_1fr] gap-6 mb-6">
                <div className="space-y-6">
                  {canViewFullReport ? (
                    <div className="bg-white rounded-3xl border border-[#d7e3f0] shadow-sm p-6 md:p-8">
                      <div className="flex items-center gap-2 mb-5">
                        <Calendar className="w-5 h-5 text-copper-600" />
                        <h3 className="text-2xl font-bold text-navy-900">
                          90-Day Action Plan
                        </h3>
                      </div>

                      <div className="grid gap-4">
                        <div className="rounded-2xl border border-copper-200 bg-copper-50/50 p-5">
                          <div className="text-sm font-semibold text-copper-700 mb-2">
                            Start Here
                          </div>

                          {(assessment?.actionPlan?.immediate || [])
                            .slice(0, 1)
                            .map((step, index) => (
                              <div key={`immediate-${index}`}>
                                <div className="font-semibold text-navy-900 mb-2">
                                  {step.title}
                                </div>
                                <p className="text-navy-900 leading-7 mb-3">
                                  {step.body}
                                </p>
                                <ul className="space-y-2">
                                  {safeArray(step.checklist).map((item, itemIndex) => (
                                    <li
                                      key={itemIndex}
                                      className="flex items-start gap-2 text-sm text-navy-900"
                                    >
                                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-copper-600" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}

                          {!assessment?.actionPlan?.immediate?.length && (
                            <p className="text-gray-700 leading-7">
                              Your first action step will appear here after your full report is generated.
                            </p>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="rounded-2xl border border-[#d7e3f0] bg-[#f8fbff] p-5">
                            <div className="text-sm font-semibold text-gray-500 mb-2">
                              Then Focus Here
                            </div>

                            {(assessment?.actionPlan?.shortTerm || [])
                              .slice(0, 1)
                              .map((step, index) => (
                                <div key={`short-${index}`}>
                                  <div className="font-semibold text-navy-900 mb-2">
                                    {step.title}
                                  </div>
                                  <p className="text-gray-700 leading-7">
                                    {step.body}
                                  </p>
                                </div>
                              ))}

                            {!assessment?.actionPlan?.shortTerm?.length && (
                              <p className="text-gray-700 leading-7">
                                Your second phase will appear here after your full report is generated.
                              </p>
                            )}
                          </div>

                          <div className="rounded-2xl border border-[#d7e3f0] bg-[#f8fbff] p-5">
                            <div className="text-sm font-semibold text-gray-500 mb-2">
                              After That
                            </div>

                            {(assessment?.actionPlan?.longTerm || [])
                              .slice(0, 1)
                              .map((step, index) => (
                                <div key={`long-${index}`}>
                                  <div className="font-semibold text-navy-900 mb-2">
                                    {step.title}
                                  </div>
                                  <p className="text-gray-700 leading-7">
                                    {step.body}
                                  </p>
                                </div>
                              ))}

                            {!assessment?.actionPlan?.longTerm?.length && (
                              <p className="text-gray-700 leading-7">
                                Longer-term milestones will appear here as your plan grows.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <LockedPreview
                      title="90-Day Action Plan"
                      description="See your next moves laid out as a guided sequence of milestones and checkpoints."
                      upgradeLabel={
                        currentPlan === 'free'
                          ? 'Unlock with Standard'
                          : 'Unlock with Premium'
                      }
                      onUpgrade={() => {
                        void trackLockedFeature('action_plan_90_day', 'dashboard');
                        void trackUpgradeClick(
                          currentPlan === 'free' ? 'standard' : 'premium',
                          'action_plan_90_day',
                          'dashboard'
                        );
                        navigate('/pricing');
                      }}
                    >
                      <div className="grid gap-4">
                        <div className="rounded-2xl border border-copper-200 bg-copper-50/50 p-5">
                          <div className="text-sm font-semibold text-copper-700 mb-2">
                            Start Here
                          </div>
                          <div className="font-semibold text-navy-900 mb-2">
                            Tighten one weak area first
                          </div>
                          <p className="text-navy-900 leading-7">
                            Review your biggest constraint, create breathing room,
                            and build momentum with one specific next move.
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="rounded-2xl border border-[#d7e3f0] bg-[#f8fbff] p-5">
                            <div className="text-sm font-semibold text-gray-500 mb-2">
                              Then Focus Here
                            </div>
                            <p className="text-gray-700 leading-7">
                              Turn that early win into a repeatable system.
                            </p>
                          </div>

                          <div className="rounded-2xl border border-[#d7e3f0] bg-[#f8fbff] p-5">
                            <div className="text-sm font-semibold text-gray-500 mb-2">
                              After That
                            </div>
                            <p className="text-gray-700 leading-7">
                              Shift from cleanup into long-term wealth-building.
                            </p>
                          </div>
                        </div>
                      </div>
                    </LockedPreview>
                  )}

                  <div className="bg-white rounded-3xl border border-[#d7e3f0] shadow-sm p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-5">
                      <Sparkles className="w-5 h-5 text-copper-600" />
                      <h3 className="text-2xl font-bold text-navy-900">
                        Key Insights
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {insights.length ? (
                        insights.slice(0, 3).map((insight, index) => (
                          <div
                            key={index}
                            className="rounded-2xl border border-[#d7e3f0] bg-[#f8fbff] p-5"
                          >
                            <div className="text-sm uppercase tracking-[0.18em] text-copper-600 mb-3">
                              Insight {index + 1}
                            </div>
                            <p className="text-gray-700 leading-8">{insight}</p>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-[#d7e3f0] bg-[#f8fbff] p-5">
                          <p className="text-gray-700 leading-8">
                            Your strongest habits are reinforcing each other. The
                            next level of progress comes from tightening the few
                            areas that still create drag.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-3xl border border-[#d7e3f0] shadow-sm p-6 md:p-8">
                    <div className="flex items-center justify-between gap-4 mb-5">
                      <div>
                        <div className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-copper-600" />
                          <h3 className="text-2xl font-bold text-navy-900">
                            Premium Guidance
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          A guided execution layer designed to help you follow
                          through over 12 months.
                        </p>
                      </div>

                      {!canViewPremium && (
                        <button
                          onClick={() => {
                            void trackLockedFeature(
                              'premium_guidance_workspace',
                              'dashboard'
                            );
                            void trackUpgradeClick(
                              'premium',
                              'premium_guidance_workspace',
                              'dashboard'
                            );
                            navigate('/pricing');
                          }}
                          className="px-4 py-2 rounded-xl bg-copper-600 text-white font-semibold hover:bg-copper-700"
                        >
                          Unlock Premium
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-5">
                      {(
                        [
                          ['roadmap', '12-Month Roadmap'],
                          ['workbook', 'Workbook'],
                          ['checkins', 'Monthly Check-Ins'],
                        ] as Array<[GuidanceTab, string]>
                      ).map(([tab, label]) => (
                        <button
                          key={tab}
                          onClick={() => setGuidanceTab(tab)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                            guidanceTab === tab
                              ? 'bg-navy-900 text-white border-navy-900'
                              : 'bg-white border-[#d7e3f0] text-gray-700 hover:bg-[#f8fbff]'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {canViewPremium ? (
                      <div className="space-y-4">
                        {guidanceTab === 'roadmap' && (
                          <>
                            <div className="rounded-2xl border border-copper-200 bg-copper-50/50 p-5">
                              <div className="text-sm font-semibold text-copper-700 mb-2">
                                Months 1–3
                              </div>
                              <p className="text-gray-700 leading-7">
                                Stabilize margin, strengthen weak pillars, and remove
                                the biggest bottlenecks.
                              </p>
                            </div>

                            <div className="rounded-2xl border border-[#d7e3f0] bg-[#f8fbff] p-5">
                              <div className="text-sm font-semibold text-gray-500 mb-2">
                                Months 4–6
                              </div>
                              <p className="text-gray-700 leading-7">
                                Turn your strongest habits into systems and close the
                                next most important gap.
                              </p>
                            </div>

                            <div className="rounded-2xl border border-[#d7e3f0] bg-[#f8fbff] p-5">
                              <div className="text-sm font-semibold text-gray-500 mb-2">
                                Months 7–12
                              </div>
                              <p className="text-gray-700 leading-7">
                                Shift toward growth, longer-term goals, and stronger
                                consistency.
                              </p>
                            </div>
                          </>
                        )}

                        {guidanceTab === 'workbook' && (
                          <>
                            <div className="rounded-2xl border border-[#d7e3f0] bg-[#f8fbff] p-5">
                              <div className="text-sm font-semibold text-copper-700 mb-2">
                                Your top 2 goals
                              </div>
                              <div className="space-y-2">
                                <div className="rounded-xl bg-white border border-[#d7e3f0] px-4 py-3">
                                  Goal 1
                                </div>
                                <div className="rounded-xl bg-white border border-[#d7e3f0] px-4 py-3">
                                  Goal 2
                                </div>
                              </div>
                            </div>

                            <div className="rounded-2xl border border-[#d7e3f0] bg-[#f8fbff] p-5">
                              <div className="text-sm font-semibold text-copper-700 mb-2">
                                30 / 60 / 90 day checklist
                              </div>
                              <div className="space-y-2">
                                {[
                                  'Define your next move',
                                  'Set one measurable target',
                                  'Review progress and adjust',
                                ].map((item) => (
                                  <div
                                    key={item}
                                    className="flex items-center gap-3 rounded-xl bg-white border border-[#d7e3f0] px-4 py-3"
                                  >
                                    <span className="inline-block h-4 w-4 rounded border border-[#d7e3f0]" />
                                    <span className="text-gray-700">{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                        {guidanceTab === 'checkins' && (
                          <>
                            <div className="rounded-2xl border border-[#d7e3f0] bg-[#f8fbff] p-5">
                              <div className="text-sm font-semibold text-copper-700 mb-2">
                                Next monthly check-in
                              </div>
                              <p className="text-gray-700 leading-7">
                                Review what improved, what slipped, and what deserves
                                your next 30-day focus.
                              </p>
                            </div>

                            <div className="rounded-2xl border border-[#d7e3f0] bg-[#f8fbff] p-5">
                              <div className="text-sm font-semibold text-copper-700 mb-2">
                                Progress prompts
                              </div>
                              <p className="text-gray-700 leading-7">
                                What changed this month? What moved the score? What
                                should happen next?
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {guidanceTab === 'roadmap' && (
                          <>
                            <div className="rounded-2xl border border-copper-200 bg-copper-50/50 p-5">
                              <div className="text-sm font-semibold text-copper-700 mb-2">
                                Months 1–3
                              </div>
                              <p className="text-gray-700 leading-7">
                                Stabilize margin and create a stronger base.
                              </p>
                            </div>

                            <div className="rounded-2xl border border-[#d7e3f0] bg-[#f8fbff] p-5">
                              <div className="text-sm font-semibold text-gray-500 mb-2">
                                Months 4–6
                              </div>
                              <p className="text-gray-700 leading-7">
                                Turn momentum into repeatable systems.
                              </p>
                            </div>
                          </>
                        )}

                        {guidanceTab === 'workbook' && (
                          <div className="rounded-2xl border border-[#d7e3f0] bg-[#f8fbff] p-5">
                            <div className="text-sm font-semibold text-copper-700 mb-2">
                              Workbook Preview
                            </div>
                            <p className="text-gray-700 leading-7">
                              Set your top goals, work through checklists, and keep
                              visible progress in one place.
                            </p>
                          </div>
                        )}

                        {guidanceTab === 'checkins' && (
                          <div className="rounded-2xl border border-[#d7e3f0] bg-[#f8fbff] p-5">
                            <div className="text-sm font-semibold text-copper-700 mb-2">
                              Monthly Check-In Preview
                            </div>
                            <p className="text-gray-700 leading-7">
                              Use recurring reviews to stay accountable and keep your
                              roadmap moving forward.
                            </p>
                          </div>
                        )}

                        <div className="rounded-2xl border border-[#d7e3f0] bg-white p-5 text-center">
                          <div className="font-semibold text-navy-900 mb-2">
                            Visible preview. Full interaction is locked.
                          </div>
                          <button
                            onClick={() => {
                              void trackLockedFeature(
                                'premium_guidance_workspace',
                                'dashboard'
                              );
                              void trackUpgradeClick(
                                'premium',
                                'premium_guidance_workspace',
                                'dashboard'
                              );
                              navigate('/pricing');
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-copper-600 text-white font-semibold hover:bg-copper-700"
                          >
                            Unlock with Premium
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {canViewPremium ? (
                    trustedExperts.length > 0 && (
                      <section className="bg-white border border-[#d7e3f0] rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-5 h-5 text-copper-600" />
                          <h2 className="text-lg font-bold text-navy-900">
                            Optional Expert Help
                          </h2>
                        </div>
                        <p className="text-sm text-gray-600 mb-5">
                          Preview the kind of support that may help you move faster
                          without revealing actual providers yet.
                        </p>

                        <div className="grid md:grid-cols-3 gap-4">
                          {trustedExperts.map((expert) => {
                            const Icon = expert.icon;

                            return (
                              <button
                                key={expert.key}
                                onClick={() => {
                                  void track(
                                    'trusted_experts_clicked',
                                    {
                                      source: 'expert_help_section',
                                      expertKey: expert.key,
                                    },
                                    'navigation'
                                  );
                                  navigate('/trusted-experts');
                                }}
                                className={`rounded-2xl border p-5 text-left hover:bg-white transition-colors ${expert.tone}`}
                              >
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-11 h-11 rounded-xl bg-white border border-white/70 flex items-center justify-center">
                                    <Icon className="w-5 h-5 text-copper-700" />
                                  </div>
                                  <div className="font-semibold text-navy-900">
                                    {expert.title}
                                  </div>
                                </div>

                                <p className="text-sm text-gray-700 leading-6 mb-4">
                                  {expert.reason}
                                </p>

                                <div className="inline-flex items-center gap-2 text-sm font-semibold text-copper-700">
                                  {expert.cta} <ArrowRight className="w-4 h-4" />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </section>
                    )
                  ) : (
                    <LockedPreview
                      title="Optional Expert Help"
                      description="See what kind of support could help you move faster without revealing actual service providers yet."
                      upgradeLabel="Unlock with Premium"
                      onUpgrade={() => {
                        void trackLockedFeature('expert_help', 'dashboard');
                        void trackUpgradeClick('premium', 'expert_help', 'dashboard');
                        navigate('/pricing');
                      }}
                    >
                      <div className="grid md:grid-cols-3 gap-4">
                        {[
                          'Take your investing to the next level',
                          'Reduce your biggest expense',
                          'Build a clearer long-term plan',
                        ].map((title) => (
                          <div
                            key={title}
                            className="rounded-2xl border border-[#d7e3f0] bg-[#f8fbff] p-5"
                          >
                            <div className="font-semibold text-navy-900 mb-2">
                              {title}
                            </div>
                            <p className="text-sm text-gray-700 leading-6">
                              See what kind of expert guidance could help in this
                              area before deciding whether to move forward.
                            </p>
                          </div>
                        ))}
                      </div>
                    </LockedPreview>
                  )}
                </div>
              </div>

              <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-6 mt-6">
                <div className="bg-white rounded-3xl border border-[#d7e3f0] shadow-sm p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-5">
                    <LineChart className="w-5 h-5 text-copper-600" />
                    <h3 className="text-2xl font-bold text-navy-900">
                      Score History
                    </h3>
                  </div>

                  {chart.points.length > 0 ? (
                    <>
                      <div className="overflow-x-auto">
                        <svg
                          viewBox={`0 0 ${chart.width} ${chart.height}`}
                          className="w-full min-w-[680px] h-[220px]"
                        >
                          <line
                            x1="18"
                            y1={chart.height - 18}
                            x2={chart.width - 18}
                            y2={chart.height - 18}
                            stroke="#d7e3f0"
                            strokeWidth="2"
                          />
                          <polyline
                            fill="none"
                            stroke="#b87333"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={chart.polyline}
                          />
                          {chart.points.map((point) => (
                            <g key={String(point.id)}>
                              <circle
                                cx={point.x}
                                cy={point.y}
                                r="5"
                                fill="#17385a"
                              />
                              <text
                                x={point.x}
                                y={point.y - 12}
                                textAnchor="middle"
                                fontSize="12"
                                fill="#183a63"
                                fontWeight="bold"
                              >
                                {point.score}
                              </text>
                              <text
                                x={point.x}
                                y={chart.height - 2}
                                textAnchor="middle"
                                fontSize="11"
                                fill="#64748b"
                              >
                                {formatHistoryDate(point.createdAt)}
                              </text>
                            </g>
                          ))}
                        </svg>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-3">
                        <div className="rounded-2xl border border-[#d7e3f0] bg-[#f8fbff] p-4">
                          <div className="text-sm text-gray-500 mb-1">Latest</div>
                          <div className="text-2xl font-bold text-navy-900">
                            {chart.points[chart.points.length - 1]?.score ?? '—'}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#d7e3f0] bg-[#f8fbff] p-4">
                          <div className="text-sm text-gray-500 mb-1">
                            Starting
                          </div>
                          <div className="text-2xl font-bold text-navy-900">
                            {chart.points[0]?.score ?? '—'}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#d7e3f0] bg-[#f8fbff] p-4">
                          <div className="text-sm text-gray-500 mb-1">Change</div>
                          <div
                            className={`text-2xl font-bold ${
                              (chart.points[chart.points.length - 1]?.score ?? 0) -
                                (chart.points[0]?.score ?? 0) >=
                              0
                                ? 'text-emerald-600'
                                : 'text-red-600'
                            }`}
                          >
                            {((chart.points[chart.points.length - 1]?.score ?? 0) -
                              (chart.points[0]?.score ?? 0)) >= 0
                              ? '+'
                              : ''}
                            {(chart.points[chart.points.length - 1]?.score ?? 0) -
                              (chart.points[0]?.score ?? 0)}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-600">No assessment history yet.</p>
                  )}
                </div>

                <ProfessionalHouse pillarScores={pillarScores} />
              </div>
            </section>

            <section className="bg-white border border-[#d7e3f0] rounded-3xl p-6 shadow-sm mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <Clock3 className="w-5 h-5 text-copper-600" />
                    <h2 className="text-lg font-bold text-navy-900">Action Bar</h2>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Core actions should feel like actions, not floating feature tiles.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    void track('view_full_report_clicked', { source: 'action_bar' }, 'navigation');
                    navigate('/results');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[#d7e3f0] text-navy-900 font-semibold hover:bg-[#f8fbff]"
                >
                  <Eye className="w-4 h-4" />
                  View Full Report
                </button>

                <button
                  onClick={() => {
                    void track('retake_assessment_clicked', { source: 'action_bar' }, 'assessment');
                    navigate('/assessment/comprehensive');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[#d7e3f0] text-navy-900 font-semibold hover:bg-[#f8fbff]"
                >
                  <ArrowRight className="w-4 h-4" />
                  Retake Assessment
                </button>

                <button
                  onClick={handlePrintPDF}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[#d7e3f0] text-navy-900 font-semibold hover:bg-[#f8fbff]"
                >
                  <Download className="w-4 h-4" />
                  {canExportPdf ? 'Download PDF' : 'Unlock PDF'}
                </button>
              </div>
            </section>

            {!canViewPremium && (
              <section className="bg-gradient-to-br from-[#17385a] to-[#21456d] rounded-3xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-6 md:p-8 text-white mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-copper-50 text-copper-700 text-sm font-semibold mb-4">
                      <Zap className="w-4 h-4" />
                      Unlock More
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">
                      Premium Guidance turns insight into execution.
                    </h2>
                    <p className="text-white/85 leading-7 max-w-3xl">
                      Unlock the interactive roadmap, workbook, monthly check-ins,
                      What-If modeling, and expert-help previews in one place.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      void trackUpgradeClick('premium', 'unlock_more_strip', 'dashboard');
                      navigate('/pricing');
                    }}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-copper-600 text-white font-semibold hover:bg-copper-700"
                  >
                    Unlock Premium
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </section>
            )}

            <section className="grid md:grid-cols-3 gap-4">
              <ActionButtonCard
                icon={Home}
                title="Quick Assessment"
                body="Get a fresh snapshot of where your foundation stands right now."
                onClick={() => {
                  void track('quick_assessment_clicked', { source: 'resources' }, 'assessment');
                  navigate('/assessment/snapshot');
                }}
              />

              <ActionButtonCard
                icon={Target}
                title="Detailed Assessment"
                body="Run the full assessment for deeper scoring, richer guidance, and stronger recommendations."
                onClick={() => {
                  void track('detailed_assessment_clicked', { source: 'resources' }, 'assessment');
                  navigate('/assessment/comprehensive');
                }}
              />

              <ActionButtonCard
                icon={FileText}
                title="Articles & Education"
                body="Explore more guidance, education, and next-step resources without cluttering the dashboard."
                onClick={() => {
                  void track('articles_clicked', { source: 'resources' }, 'navigation');
                  navigate('/articles');
                }}
              />
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
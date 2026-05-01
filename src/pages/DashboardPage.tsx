import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppStore } from "../store/appStore";
import { getEntitlements } from "../lib/entitlements";
import { exportReportPdf } from "../utils/pdfExport";
import { useUserPlan } from "../hooks/useUserPlan";
import { supabase } from "../lib/supabase";


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
  PieChart,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import logoImage from "../assets/house-icon.png";
import { useTrackEvent } from "../hooks/useTrackEvent";
import {
  loadFreedomDatePlan,
  type FreedomDateScenario,
} from "../lib/freedomDatePlanService";
import { getScoreBand } from "../types/assessment";

interface DashboardPageProps {
  onLogout: () => void;
}

type PlanTier = "free" | "standard" | "premium";
type GuidanceTab = "roadmap" | "workbook" | "checkins";

type MetricsShape = {
  debtToIncomeRatio?: number;
  fixedCostPressureRatio?: number;
  savingsRate?: number;
  netWorth?: number;
  homeEquity?: number;
  totalSavings?: number;
  totalInvestments?: number;
  totalDebtBalance?: number;
  emergencyFundMonths?: number;
  excessCashEstimate?: number;
  cashExcessMonths?: number;
  monthlyInvestmentContribution?: number;
  investmentContributionRate?: number;
  liquidAssets?: number;
  illiquidAssets?: number;
  liquidAssetRatio?: number;
  illiquidAssetRatio?: number;
  monthlyIncome?: number;
  monthlyDebtPayments?: number;
  monthlyHousingCost?: number;
  monthlyUtilities?: number;
  monthlyChildcareCost?: number;
  monthlyFixedCosts?: number;
  cashSavings?: number;
  retirement401kIraBalance?: number;
  rothBalance?: number;
  brokerageBalance?: number;
  pensionBalance?: number;
  otherInvestmentAssets?: number;
  otherAssets?: number;
  primaryHomeValue?: number;
  primaryMortgageBalance?: number;
  rentalPropertyValue?: number;
  rentalMortgageBalance?: number;
  otherPropertyValue?: number;
  otherPropertyMortgageBalance?: number;
  realEstateAssets?: number;
  mortgageDebt?: number;
  consumerDebt?: number;
  otherLiabilities?: number;
  totalAssets?: number;
  totalLiabilities?: number;
  cappedEmergencyFundMonths?: number;
  cushionScore?: number;
};

type ActionPlanStep = {
  title: string;
  body: string;
  checklist?: string[];
};

type StructuralWarning = {
  type:
    | "housing_pressure"
    | "income_constraint"
    | "structural_pressure"
    | string;
  severity: "high" | "critical" | string;
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
  lifeStage?: "starting_out" | "stability" | "growth" | "catch_up" | string;
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
    name: "Free",
    badgeLabel: null,
    price: 0,
    accent: "bg-navy-900 text-white border-navy-900",
  },
  standard: {
    name: "Foundation Assessment",
    badgeLabel: "Foundation Assessment Plan",
    price: 29,
    accent: "bg-blue-600 text-white border-blue-600",
  },
  premium: {
    name: "Foundation Roadmap",
    badgeLabel: "Foundation Roadmap Plan",
    price: 79,
    accent: "bg-copper-600 text-white border-copper-600",
  },
};

function getPlanBadgeClass(plan: PlanTier) {
  if (plan === "premium") {
    return "border-copper-300/35 bg-copper-500/10 text-copper-100";
  }

  if (plan === "standard") {
    return "border-blue-200/30 bg-blue-500/10 text-blue-50";
  }

  return "";
}

function getDashboardNextMoveCard(
  assessment: CurrentAssessmentShape | null,
  snapshot: ReturnType<typeof getStructuralSnapshot>,
  weakestPillar?: string,
): { title: string; body: string; checklist: string[] } {
  const answers = assessment?.answers ?? {};
  const lifeStage = assessment?.lifeStage ?? "stability";
  const confidence = answers.financialConfidence;
  const incomeGrowth = answers.incomeGrowth;
  const incomeGrowthPotential = answers.incomeGrowthPotential;
  const financialDirection = answers.financialDirection;
  const employerMatch = answers.employerMatch;
  const investingStatus = answers.investingStatus;
  const investmentConfidence = answers.investmentConfidence;
  const immediateStep = assessment?.actionPlan?.immediate?.[0];

  const strongInvestingHabit =
    investingStatus === "yes_consistently" &&
    (employerMatch === "maximizing_match" ||
      employerMatch === "have_match_not_maxing");

  const highSavingsBase =
    (snapshot?.totalSavings ?? 0) >= 10000 ||
    (snapshot?.monthlyMargin ?? 0) >= 500;

  const foundationScore = normalizeCurrentScore(assessment);
  const cashMonths =
    snapshot?.emergencyFundMonths ||
    ((snapshot?.fixedCosts ?? 0) > 0
      ? (snapshot?.totalSavings ?? 0) / (snapshot?.fixedCosts ?? 1)
      : 0);
  const excessCashEstimate = snapshot?.excessCashEstimate ?? 0;
  const investingRate = snapshot?.investmentContributionRate ?? 0;

  if (foundationScore >= 80 && (cashMonths >= 24 || excessCashEstimate > 0)) {
    return {
      title: "Optimize your excess cash",
      body: `Your foundation is strong. With roughly ${cashMonths.toFixed(1)} months of runway, the next move is less about survival and more about making sure extra cash is working efficiently without weakening your safety cushion.`,
      checklist: [
        "Choose the cash reserve target that still lets you sleep at night.",
        "Move excess cash into higher-yield savings, investments, or another priority in stages.",
        "Review your asset mix so cash, investments, and home equity are working together.",
      ],
    };
  }

  if (foundationScore >= 80 && investingRate >= 10) {
    return {
      title: "Move from building to optimizing",
      body: "You already have strong habits and a solid base. The next opportunity is reviewing tax buckets, account mix, cash targets, and allocation so the money you have works harder.",
      checklist: [
        "Review whether your cash reserve is larger than it needs to be.",
        "Check your mix of pre-tax, Roth, taxable, and real estate assets.",
        "Choose one optimization move for the next 90 days.",
      ],
    };
  }

  if (snapshot && snapshot.fixedCostLoad >= 65) {
    return {
      title: "Create breathing room first",
      body: `With about ${formatCurrency(snapshot.fixedCosts)} of ${formatCurrency(snapshot.income)} already committed each month, your next move should focus on structure, not optimization. The fastest lift will likely come from changing one major fixed-cost pressure point.`,
      checklist: [
        "List housing, utilities, childcare, and debt payments in one place.",
        "Identify the single fixed cost creating the most pressure.",
        "Decide whether the clearest win is lower costs, more income, or both.",
      ],
    };
  }

  if (snapshot && snapshot.fixedCostLoad >= 50) {
    return {
      title: "Protect your monthly margin",
      body: `With fixed costs around ${formatCurrency(snapshot.fixedCosts)} a month, your structure is workable, but still tight enough to slow progress. Creating even a little more monthly margin should make the rest of the plan easier to execute.`,
      checklist: [
        "Review the top one or two fixed costs in your budget.",
        "Choose one realistic change to test over the next 30 days.",
        "Redirect any freed-up cash toward your highest-priority goal.",
      ],
    };
  }

  if (weakestPillar === "protection") {
    if (["growth", "catch_up"].includes(lifeStage)) {
      return {
        title: "Protect the progress you have already built",
        body: "You already have momentum in other areas. At this stage, the bigger risk is leaving one protection gap exposed that could undo progress if life gets expensive or income is interrupted.",
        checklist: [
          "Review the one protection area that would hurt most if it failed.",
          "Check whether current coverage still matches your household reality.",
          "Make one update this quarter to close the biggest gap.",
        ],
      };
    }

    return {
      title: "Close your biggest protection gap",
      body: "Protection matters because people depend on this income. The immediate goal is practical: reliable health coverage, affordable life insurance if others depend on you, and a small emergency cushion that keeps one bill from becoming new debt.",
      checklist: [
        "Confirm health insurance status and your biggest out-of-pocket risk.",
        "Price basic term life insurance if anyone depends on your income.",
        "Choose a starter emergency fund target that fits current cash flow.",
      ],
    };
  }

  if (weakestPillar === "vision") {
    if (["low", "not_confident"].includes(confidence)) {
      return {
        title: "Create a clearer target before adding complexity",
        body: "Your habits will feel more sustainable once they are tied to a clearer destination. Right now, the opportunity is not another tactic — it is making the goal specific enough to guide your next few decisions.",
        checklist: [
          "Write down your top financial goal for the next 3–5 years.",
          "Choose one 12-month milestone that would prove progress.",
          "Make sure your next major money move supports that target.",
        ],
      };
    }

    if (["figuring_it_out", "no_goals", "stuck"].includes(financialDirection)) {
      return {
        title: "Turn decent habits into a clearer plan",
        body: "You may already be doing some things well, but the direction is still too loose. Clarifying what matters most will make tradeoffs and next steps feel much more intentional.",
        checklist: [
          "Choose the one outcome that matters most over the next 12 months.",
          "Define what success would look like in concrete terms.",
          "Use that target to filter your next money decisions.",
        ],
      };
    }

    return {
      title: "Clarify what you are building toward",
      body: "Your direction is improving, but it still needs sharper edges. Clearer priorities will make the rest of your system easier to align and follow through on.",
      checklist: [
        "Name your highest-priority financial goal.",
        "Choose one milestone to track over the next year.",
        "Align your next major money move with that goal.",
      ],
    };
  }

  if (weakestPillar === "investing") {
    if (
      strongInvestingHabit &&
      ["very_confident", "somewhat_confident"].includes(investmentConfidence)
    ) {
      return {
        title: "Upgrade how your investing is working",
        body: "You do not need a reminder to start investing — you are already doing that. The better next move is reviewing whether your current setup is aligned, efficient, and doing enough heavy lifting for your stage.",
        checklist: [
          "Review whether your current contribution rate still fits your goals.",
          "Check that account mix and allocation still make sense.",
          "Choose one improvement to make over the next 90 days.",
        ],
      };
    }

    return {
      title: "Turn consistency into long-term growth",
      body: "You may already be building margin. The next step is making sure more of that progress is moving into long-term growth instead of staying parked.",
      checklist: [
        "Review current investment contributions.",
        "Increase consistency before adding complexity.",
        "Set a realistic 90-day contribution target.",
      ],
    };
  }

  if (weakestPillar === "saving") {
    if (highSavingsBase && ["growth", "catch_up"].includes(lifeStage)) {
      return {
        title: "Strengthen your buffer, not just your balance sheet",
        body: "You may already be building for the future, but the next improvement is making sure your cash reserve is strong enough to protect that long-term progress when life gets expensive.",
        checklist: [
          "Decide what “enough” cash reserves means for your household.",
          "Choose a monthly amount to direct toward that buffer.",
          "Recheck after 90 days and adjust if needed.",
        ],
      };
    }

    return {
      title: "Convert surplus into structure",
      body: "You have some breathing room. The opportunity now is turning that into a more reliable saving system that strengthens the rest of the foundation.",
      checklist: [
        "Choose a fixed monthly savings amount.",
        "Automate the transfer if possible.",
        "Track progress once a month for the next 90 days.",
      ],
    };
  }

  if (weakestPillar === "income") {
    if (incomeGrowth === "decreased") {
      return {
        title: "Rebuild income momentum first",
        body: "Because income has moved backward, the next move should focus on restoring stability before pushing harder on optimization elsewhere.",
        checklist: [
          "Identify the main reason income slipped.",
          "Choose one realistic way to stabilize or increase it.",
          "Set a 90-day target tied to take-home pay.",
        ],
      };
    }

    if (["high", "moderate"].includes(incomeGrowthPotential)) {
      return {
        title: "Use income as your next growth lever",
        body: "You appear to have room to increase earning power from here. At this stage, one income move could lift saving, investing, and flexibility all at once.",
        checklist: [
          "Choose the most realistic path to higher income.",
          "Take one action this week: ask, apply, pitch, or start.",
          "Measure whether that move improves monthly margin.",
        ],
      };
    }

    return {
      title: "Strengthen income stability",
      body: "The next lift is not just earning more — it is making income feel more dependable so the rest of your plan can rest on a steadier base.",
      checklist: [
        "Identify the main source of income uncertainty.",
        "Choose one move that improves predictability.",
        "Review progress over the next 90 days.",
      ],
    };
  }

  if (immediateStep) {
    return {
      title: immediateStep.title || "Best Next Move",
      body:
        immediateStep.body ||
        (assessment?.nextStep ??
          "Choose one focused next step and keep it consistent."),
      checklist:
        Array.isArray(immediateStep.checklist) && immediateStep.checklist.length
          ? immediateStep.checklist.slice(0, 3)
          : [
              assessment?.nextStep ||
                "Choose one focused next step and keep it consistent.",
            ],
    };
  }

  if (assessment?.nextStep) {
    return {
      title: weakestPillar
        ? `Start with ${formatPillarName(weakestPillar)}`
        : "Best Next Move",
      body: assessment.nextStep,
      checklist: [
        "Choose one concrete step to take this week.",
        "Keep the move small enough to repeat.",
        "Review progress before changing direction.",
      ],
    };
  }

  return {
    title: weakestPillar
      ? `Start with ${formatPillarName(weakestPillar)}`
      : "Best Next Move",
    body: getDashboardNextMove(assessment, snapshot, weakestPillar),
    checklist: [
      "Choose one next step.",
      "Take action this week.",
      "Review what changed before adding more complexity.",
    ],
  };
}

function getDashboardWhyThisMatters(
  assessment: CurrentAssessmentShape | null,
  snapshot: ReturnType<typeof getStructuralSnapshot>,
  weakestPillar?: string,
): string {
  const lifeStage = assessment?.lifeStage ?? "stability";
  const answers = assessment?.answers ?? {};
  const confidence = answers.financialConfidence;
  const incomeGrowthPotential = answers.incomeGrowthPotential;

  if (snapshot && snapshot.fixedCostLoad >= 60) {
    return `With about ${formatCurrency(snapshot.fixedCosts)} of ${formatCurrency(snapshot.income)} already committed each month, even strong habits can feel tight. Creating more breathing room gives the rest of your plan room to work.`;
  }

  if (weakestPillar === "protection") {
    return ["growth", "catch_up"].includes(lifeStage)
      ? "At this stage, the next risk is not simply growth — it is leaving what you have already built exposed to an avoidable setback."
      : "Protection matters now because one uncovered risk can interrupt progress before the rest of the foundation has a chance to compound.";
  }

  if (weakestPillar === "vision") {
    return ["low", "not_confident"].includes(confidence)
      ? "Clearer direction reduces decision fatigue. Once the target is sharper, saving, investing, and tradeoffs usually get easier to sustain."
      : "This matters now because stronger direction helps the rest of your good habits work together instead of drifting in separate directions.";
  }

  if (weakestPillar === "income") {
    return ["high", "moderate"].includes(incomeGrowthPotential)
      ? "Income is not just another category — it is the lever that can lift saving, investing, and flexibility all at once."
      : "A steadier income base gives the rest of the foundation something more dependable to build on.";
  }

  if (weakestPillar === "investing") {
    return "This matters now because the gap is no longer just about behavior — it is about making sure your long-term system is doing enough work for the future you want.";
  }

  if (weakestPillar === "saving") {
    return "A stronger buffer gives you more control over setbacks, better flexibility, and more confidence in the rest of the plan.";
  }

  if (assessment?.nextStep) {
    return "This next move matters because it addresses the area most likely to improve the rest of your financial foundation, not just this one category.";
  }

  return "The right next move should strengthen the weakest part of the system first so the rest of your progress becomes easier to sustain.";
}

const PILLAR_LABELS: Record<string, string> = {
  income: "Income",
  spending: "Spending",
  saving: "Saving",
  investing: "Investing",
  debt: "Debt Pressure",
  protection: "Protection",
  vision: "Vision",
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
  assessment: CurrentAssessmentShape | null,
): number {
  if (!assessment) return 0;

  if (typeof assessment.foundationScore === "number") {
    return Math.max(0, Math.min(100, assessment.foundationScore));
  }

  if (typeof assessment.wealthScore === "number") {
    return Math.max(
      0,
      Math.min(100, Math.round(((assessment.wealthScore - 300) / 550) * 100)),
    );
  }

  return 0;
}

function normalizeHistoryScore(item: any): number | null {
  if (typeof item?.foundationScore === "number") {
    return Math.max(0, Math.min(100, item.foundationScore));
  }

  if (typeof item?.overallScore === "number") {
    return Math.max(0, Math.min(100, item.overallScore));
  }

  if (typeof item?.wealthScore === "number") {
    return Math.max(
      0,
      Math.min(100, Math.round(((item.wealthScore - 300) / 550) * 100)),
    );
  }

  return null;
}

function formatHistoryDate(createdAt?: number): string {
  if (!createdAt) return "";
  const millis = createdAt > 10_000_000_000 ? createdAt : createdAt * 1000;
  const date = new Date(millis);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(value?: number | null): string {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatPercent(value?: number | null): string {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return "—";
  }

  return `${Math.round(Number(value))}%`;
}

function scoreNarrative(score: number): string {
  if (score >= 80) {
    return "Your foundation looks strong. The opportunity now is less about fixing problems and more about strengthening the weaker edges.";
  }
  if (score >= 60) {
    return "You have momentum, but a few weaker areas are still holding back the rest of the house.";
  }
  if (score >= 40) {
    return "Some pieces are in place, but your foundation still has meaningful gaps creating drag.";
  }
  return "Your foundation needs reinforcement before long-term growth becomes the priority.";
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
    metrics.monthlyFixedCosts ?? housing + utilities + childcare + debt,
  );
  const fixedCostLoad = income > 0 ? (fixedCosts / income) * 100 : 0;
  const monthlyMargin = income - fixedCosts;

  const totalSavings = Number(metrics.totalSavings ?? metrics.cashSavings ?? 0);
  const totalInvestments = Number(metrics.totalInvestments ?? 0);
  const otherAssets = Number(metrics.otherAssets ?? 0);
  const primaryHomeValue = Number(metrics.primaryHomeValue ?? 0);
  const rentalPropertyValue = Number(metrics.rentalPropertyValue ?? 0);
  const otherPropertyValue = Number(metrics.otherPropertyValue ?? 0);
  const realEstateAssets = Number(
    metrics.realEstateAssets ??
      primaryHomeValue + rentalPropertyValue + otherPropertyValue,
  );
  const mortgageDebt = Number(metrics.mortgageDebt ?? 0);
  const consumerDebt = Number(
    metrics.consumerDebt ?? metrics.totalDebtBalance ?? 0,
  );
  const otherLiabilities = Number(metrics.otherLiabilities ?? 0);
  const totalAssets = Number(
    metrics.totalAssets ??
      totalSavings + totalInvestments + realEstateAssets + otherAssets,
  );
  const totalLiabilities = Number(
    metrics.totalLiabilities ?? mortgageDebt + consumerDebt + otherLiabilities,
  );
  const netWorth = Number(metrics.netWorth ?? totalAssets - totalLiabilities);

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
    totalSavings,
    totalInvestments,
    totalDebtBalance: consumerDebt,
    netWorth,
    homeEquity: Number(
      metrics.homeEquity ?? Math.max(0, realEstateAssets - mortgageDebt),
    ),
    cashSavings: Number(metrics.cashSavings ?? totalSavings),
    retirement401kIraBalance: Number(metrics.retirement401kIraBalance ?? 0),
    rothBalance: Number(metrics.rothBalance ?? 0),
    brokerageBalance: Number(metrics.brokerageBalance ?? 0),
    pensionBalance: Number(metrics.pensionBalance ?? 0),
    otherInvestmentAssets: Number(metrics.otherInvestmentAssets ?? 0),
    otherAssets,
    primaryHomeValue,
    primaryMortgageBalance: Number(metrics.primaryMortgageBalance ?? 0),
    rentalPropertyValue,
    rentalMortgageBalance: Number(metrics.rentalMortgageBalance ?? 0),
    otherPropertyValue,
    otherPropertyMortgageBalance: Number(
      metrics.otherPropertyMortgageBalance ?? 0,
    ),
    realEstateAssets,
    mortgageDebt,
    consumerDebt,
    otherLiabilities,
    totalAssets,
    totalLiabilities,
    emergencyFundMonths: Number(metrics.emergencyFundMonths ?? 0),
    cappedEmergencyFundMonths: Number(metrics.cappedEmergencyFundMonths ?? 0),
    cushionScore: Number(metrics.cushionScore ?? 0),
    excessCashEstimate: Number(metrics.excessCashEstimate ?? 0),
  };
}

function getLoadTone(load: number) {
  if (load >= 65) {
    return {
      badge: "High Pressure",
      text: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200",
      bar: "bg-red-500",
    };
  }

  if (load >= 50) {
    return {
      badge: "Tight",
      text: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
      bar: "bg-amber-500",
    };
  }

  return {
    badge: "Healthy",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    bar: "bg-emerald-500",
  };
}

function getMarginTone(margin: number): string {
  if (margin < 0) return "text-red-600";
  if (margin < 500) return "text-amber-600";
  return "text-emerald-600";
}

function getDashboardNextMove(
  assessment: CurrentAssessmentShape | null,
  snapshot: ReturnType<typeof getStructuralSnapshot>,
  weakestPillar?: string,
): string {
  if (snapshot && snapshot.fixedCostLoad >= 65) {
    return "Create breathing room first. Review housing, utilities, and other fixed bills together, then decide whether the fastest win is a cost cut, an income increase, or both.";
  }

  if (snapshot && snapshot.fixedCostLoad >= 50) {
    return "Start by tightening fixed costs and protecting your monthly margin. Small relief here can unlock better progress everywhere else.";
  }

  if (assessment?.nextStep) return assessment.nextStep;

  if (weakestPillar) {
    return `Start with ${formatPillarName(
      weakestPillar,
    )}. One focused improvement here should have the biggest ripple effect.`;
  }

  return "Choose one next step and make progress this week.";
}

function makePlanActionId(phaseIndex: number, itemIndex: number, item: string) {
  const slug = item
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 44);

  return `phase-${phaseIndex + 1}-${itemIndex + 1}-${slug || "step"}`;
}

async function loadSavedPlanProgress(
  userId: string | undefined,
  assessmentId: string,
): Promise<Record<string, boolean> | null> {
  if (!userId || !assessmentId) return null;

  const { data, error } = await supabase
    .from("user_plan_progress")
    .select("action_id, completed, completed_at, updated_at")
    .eq("user_id", userId)
    .eq("assessment_id", assessmentId);

  if (error) {
    console.error("Could not load 90-day plan progress:", error);
    return null;
  }

  return (data || []).reduce<Record<string, boolean>>((acc, row: any) => {
    if (row?.action_id) acc[row.action_id] = !!row.completed;
    return acc;
  }, {});
}

async function savePlanActionProgress(
  userId: string | undefined,
  assessmentId: string,
  actionId: string,
  completed: boolean,
) {
  if (!userId || !assessmentId || !actionId) return;

  const now = new Date().toISOString();

const { error } = await supabase.from("user_plan_progress").upsert(
  {
    user_id: userId,
    assessment_id: assessmentId,
    action_id: actionId,
    completed,
    updated_at: now,
    completed_at: completed ? now : null,
  },
  { onConflict: "user_id,assessment_id,action_id" },
);

  if (error) {
    console.error("Could not save 90-day plan progress:", error);
  }
}

function getStoredPlanProgress(storageKey: string): Record<string, boolean> {
  if (typeof window === "undefined") return {};

  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

type PlanProgressRow = {
  action_id: string;
  completed: boolean;
  completed_at?: string | null;
  updated_at?: string | null;
};

async function loadPlanProgressRows(
  userId: string | undefined,
  assessmentId: string,
): Promise<PlanProgressRow[]> {
  if (!userId || !assessmentId) return [];

  const { data, error } = await supabase
    .from("user_plan_progress")
    .select("action_id, completed, completed_at, updated_at")
    .eq("user_id", userId)
    .eq("assessment_id", assessmentId);

  if (error) {
    console.error("Could not load 90-day plan momentum:", error);
    return [];
  }

  return (data || []) as PlanProgressRow[];
}

function getWeeklyMomentum(progressRows: PlanProgressRow[]) {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);

  const completedThisWeek = progressRows.filter((row) => {
    if (!row.completed || !row.completed_at) return false;
    return new Date(row.completed_at) >= weekAgo;
  }).length;

  const totalCompleted = progressRows.filter((row) => row.completed).length;

  return {
    completedThisWeek,
    totalCompleted,
  };
}

async function loadLatestPlanActivity(
  userId: string | undefined,
  assessmentId: string,
): Promise<string | null> {
  if (!userId || !assessmentId) return null;

  const { data, error } = await supabase
    .from("user_plan_progress")
    .select("updated_at")
    .eq("user_id", userId)
    .eq("assessment_id", assessmentId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Could not load latest 90-day plan activity:", error);
    return null;
  }

  return data?.updated_at ?? null;
}

function formatLastPlanActivity(dateString: string | null) {
  if (!dateString) return null;

  const timestamp = new Date(dateString).getTime();
  if (Number.isNaN(timestamp)) return null;

  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 30) return `${diffDays} days ago`;

  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function getDashboardNinetyDayPlanPhases(
  nextMoveCard: { title: string; body: string; checklist: string[] },
  snapshot: ReturnType<typeof getStructuralSnapshot>,
  weakestPillar?: string | null,
): ActionPlanStep[] {
  const title = nextMoveCard.title.toLowerCase();
  const fixedCost = formatPercent(snapshot?.fixedCostLoad ?? 0);
  const excessCash = snapshot?.excessCashEstimate ?? 0;
  const cashMonths = snapshot?.fixedCosts
    ? (snapshot.totalSavings ?? 0) / snapshot.fixedCosts
    : 0;
  const pillarLabel = weakestPillar
    ? formatPillarName(weakestPillar)
    : "your next priority";

  if (title.includes("excess cash")) {
    return [
      {
        title: "Phase 1: Define “enough” cash",
        body: `Start by deciding how much cash reserve still feels safe. Your current cushion is about ${cashMonths.toFixed(1)} months, so the goal is to separate safety money from idle money.`,
        checklist: [
          "Pick a cash reserve target in months of expenses.",
          excessCash > 0
            ? `Mark the estimated excess cash amount: ${formatCurrency(excessCash)}.`
            : "Estimate how much cash sits above that target.",
        ],
      },
      {
        title: "Phase 2: Move in stages",
        body: "Choose one staged move for excess cash instead of making one large emotional decision.",
        checklist: [
          "Move a first portion to HYSA, brokerage, Roth, debt, or another priority.",
          "Set a simple date to review the result before moving more.",
        ],
      },
      {
        title: "Phase 3: Rebalance the system",
        body: "After the first move, review how cash, investments, debt, and home equity fit together.",
        checklist: [
          "Compare cash vs. investments vs. real estate equity.",
          "Rerun the assessment after meaningful changes.",
        ],
      },
    ];
  }

  if (
    title.includes("income") ||
    title.includes("fixed") ||
    title.includes("breathing")
  ) {
    return [
      {
        title: "Phase 1: Create breathing room",
        body: `Start with the move that creates the fastest improvement in monthly cash flow${fixedCost ? ` — your must-pay bills are around ${fixedCost} of take-home pay` : ""}.`,
        checklist: [
          "Write your income, fixed costs, and monthly margin in one place.",
          "Pick one income action to take this week: ask, apply, pitch, sell, or schedule extra work.",
          "Choose one fixed cost to challenge: housing, vehicle, utilities, insurance, or another required bill.",
        ],
      },
      {
        title: "Phase 2: Stabilize your cash flow",
        body: "Once you create some breathing room, protect it so new expenses do not absorb the progress.",
        checklist: [
          "Write the new monthly margin number after your income or cost change.",
          "Move the first freed-up dollars into a starter cash buffer or priority debt payment.",
          "Set a 15-minute calendar reminder to review the same number next week.",
        ],
      },
      {
        title: "Phase 3: Build momentum",
        body: "With more stability, start building forward into saving, protection, debt payoff, and long-term growth.",
        checklist: [
          "Send the first stable margin to your starter emergency fund or priority debt.",
          "Check one protection gap: health coverage, term life, disability, or emergency cash.",
          "Rerun the assessment after meaningful progress and choose the next highest-leverage area.",
        ],
      },
    ];
  }

  return [
    {
      title: "Phase 1: Focus the first move",
      body:
        nextMoveCard.body ||
        `Start with ${pillarLabel}. One focused improvement here should create the biggest ripple effect.`,
      checklist: nextMoveCard.checklist.slice(0, 3),
    },
    {
      title: "Phase 2: Make it repeatable",
      body: "The next step is making the first action reliable. One good move helps, but one repeatable system changes the foundation.",
      checklist: [
        "Choose one number to update every week.",
        "Schedule a 15-minute check-in before the month ends.",
      ],
    },
    {
      title: "Phase 3: Reassess and advance",
      body: "After the first 90 days, compare your score and building blocks. Keep what improved and move to the next highest-leverage area.",
      checklist: [
        "Rerun the assessment after meaningful progress.",
        "Choose the next building block to strengthen.",
      ],
    },
  ];
}

function getPillarTone(score: number) {
  if (score >= 80) {
    return {
      text: "text-emerald-700",
      bg: "bg-emerald-50 border-emerald-200",
      bar: "bg-emerald-500",
      badge: "bg-emerald-100 text-emerald-700",
      label: "Strong",
    };
  }

  if (score >= 60) {
    return {
      text: "text-amber-700",
      bg: "bg-amber-50 border-amber-200",
      bar: "bg-amber-500",
      badge: "bg-amber-100 text-amber-700",
      label: "Building",
    };
  }

  if (score >= 40) {
    return {
      text: "text-orange-700",
      bg: "bg-orange-50 border-orange-200",
      bar: "bg-orange-500",
      badge: "bg-orange-100 text-orange-700",
      label: "Needs Attention",
    };
  }

  return {
    text: "text-red-700",
    bg: "bg-red-50 border-red-200",
    bar: "bg-red-500",
    badge: "bg-red-100 text-red-700",
    label: "Weak",
  };
}

function getWarningCard(
  warning: StructuralWarning,
  snapshot: ReturnType<typeof getStructuralSnapshot>,
) {
  if (warning.type === "housing_pressure" && snapshot) {
    return {
      title: "Housing costs are crowding out progress",
      body: `Your fixed costs are about ${snapshot.fixedCostLoad.toFixed(
        0,
      )}% of take-home pay, with housing around ${formatCurrency(
        snapshot.housing,
      )} and utilities around ${formatCurrency(snapshot.utilities)}.`,
    };
  }

  if (warning.type === "income_constraint") {
    return {
      title: "Income is the bottleneck right now",
      body: "This looks more like a math problem than a discipline problem. Increasing income or lowering a major fixed cost may create the biggest overall lift.",
    };
  }

  return {
    title: "Structural pressure detected",
    body: "Multiple fixed obligations may be limiting your breathing room and slowing progress elsewhere.",
  };
}

function CalculatorIcon(props: React.ComponentProps<typeof DollarSign>) {
  return <DollarSign {...props} />;
}

function getTrustedExperts(
  pillars: Record<string, number>,
  snapshot: ReturnType<typeof getStructuralSnapshot>,
  warnings: StructuralWarning[],
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
    (warning) => warning.type === "structural_pressure",
  );

  if (hasInvestingGap) {
    cards.push({
      key: "planner",
      title: "Take your investing to the next level",
      reason:
        "A fiduciary advisor can help optimize allocation, reduce tax drag, and align a stronger long-term investment strategy with your goals.",
      cta: "Unlock advisor matching",
      icon: TrendingUp,
      tone: "bg-blue-50 border-blue-200",
    });
  }

  if (hasProtectionGap) {
    cards.push({
      key: "insurance",
      title: "Protect what you are building",
      reason:
        "Insurance and protection reviews can help keep one setback from undoing years of progress.",
      cta: "Unlock protection guidance",
      icon: Shield,
      tone: "bg-emerald-50 border-emerald-200",
    });
  }

  if (hasVisionGap || hasTaxComplexity) {
    cards.push({
      key: "estate",
      title: "Build a clearer long-term plan",
      reason:
        "Planning support can help turn strong habits into a more intentional strategy for family, tax efficiency, and legacy.",
      cta: "Unlock planning guidance",
      icon: FileText,
      tone: "bg-purple-50 border-purple-200",
    });
  }

  if (hasTaxComplexity) {
    cards.push({
      key: "cpa",
      title: "Reduce tax drag and surprises",
      reason:
        "Tax guidance can help your saving and investing decisions work harder while reducing avoidable friction.",
      cta: "Unlock tax guidance",
      icon: CalculatorIcon,
      tone: "bg-amber-50 border-amber-200",
    });
  }

  if (hasHousingPressure || hasDebtPressure) {
    cards.push({
      key: "housing",
      title: "Improve your monthly structure",
      reason:
        "Housing and cash-flow strategy can help free up margin when fixed costs are shaping the rest of your financial picture.",
      cta: "Unlock structural help",
      icon: Home,
      tone: "bg-copper-50 border-[#eac89a]",
    });
  }

  return cards
    .filter(
      (card, index, all) => all.findIndex((x) => x.key === card.key) === index,
    )
    .slice(0, 3);
}

function ProfessionalHouse({
  pillarScores,
}: {
  pillarScores: Record<string, number>;
}) {
  const blocks = [
    { key: "investing", label: "INVEST", x: 56, y: 88, w: 56, h: 56 },
    { key: "saving", label: "SAVING", x: 120, y: 88, w: 68, h: 56 },
    { key: "vision", label: "VISION", x: 196, y: 88, w: 52, h: 56 },
    { key: "spending", label: "SPEND", x: 40, y: 158, w: 50, h: 60 },
    { key: "income", label: "INCOME", x: 98, y: 158, w: 58, h: 60 },
    { key: "debt", label: "DEBT", x: 164, y: 158, w: 50, h: 60 },
    { key: "protection", label: "PROTECT", x: 222, y: 158, w: 58, h: 60 },
  ];

  const tone = (score: number) => {
    if (score >= 80) return "#22b57a";
    if (score >= 60) return "#d58a21";
    return "#ef4444";
  };

  return (
    <div className="rounded-3xl border border-[#d7e3f0] bg-white p-4 shadow-sm">
      <div className="mb-3">
        <div className="text-sm font-semibold text-navy-900">House View</div>
        <p className="text-xs text-gray-500 mt-1">
          A visual summary of how your building blocks are supporting the
          foundation.
        </p>
      </div>

      <svg
        viewBox="0 0 320 272"
        className="w-full h-auto"
        style={{ maxHeight: "248px" }}
      >
        <defs>
          <linearGradient id="roofGradDash" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#17365d" />
            <stop offset="100%" stopColor="#284d7d" />
          </linearGradient>
          <filter id="houseShadow" x="-20%" y="-20%" width="140%" height="140%">
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
  theme: "foundation" | "picture" | "action";
}) {
  const themeMap = {
    foundation: "bg-copper-50 text-copper-700 border-copper-100",
    picture: "bg-blue-50 text-blue-700 border-blue-100",
    action: "bg-emerald-50 text-emerald-700 border-emerald-100",
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
          <div className="pointer-events-none select-none opacity-80">
            {children}
          </div>
          <div className="absolute inset-0 bg-white/45 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
            <div className="text-center px-6">
              <div className="text-navy-900 font-semibold mb-2">
                Preview visible. Unlock the roadmap to use this fully.
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
  accent = "bg-white",
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

function DashboardPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[1.6rem] border border-cyan-200/10 bg-white/[0.045] shadow-[0_20px_70px_rgba(0,0,0,.24)] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

function ScoreRing({ value }: { value: number }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;

  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 88 88" className="h-24 w-24 -rotate-90">
        <defs>
          <linearGradient id="scoreGradientLive" x1="0" x2="1">
            <stop offset="0%" stopColor="#18d5ff" />
            <stop offset="100%" stopColor="#b87333" />
          </linearGradient>
        </defs>
        <circle
          cx="44"
          cy="44"
          r={radius}
          stroke="rgba(255,255,255,.10)"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="44"
          cy="44"
          r={radius}
          stroke="url(#scoreGradientLive)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">
        {value}
      </div>
    </div>
  );
}

function DashboardHouseVisual({
  pillarScores,
}: {
  pillarScores: Record<string, number>;
}) {
  const getScore = (key: string) =>
    Math.max(0, Math.min(100, Number(pillarScores[key] ?? 0)));
  const blocks = [
    {
      key: "vision",
      label: "VISION",
      color: "#a78bfa",
      x: 198,
      y: 66,
      w: 124,
      h: 22,
    },
    {
      key: "investing",
      label: "INVESTING",
      color: "#34d399",
      x: 122,
      y: 100,
      w: 130,
      h: 38,
    },
    {
      key: "protection",
      label: "PROTECTION",
      color: "#fbbf24",
      x: 258,
      y: 100,
      w: 130,
      h: 38,
    },
    {
      key: "spending",
      label: "SPENDING",
      color: "#f59e0b",
      x: 122,
      y: 144,
      w: 130,
      h: 38,
    },
    {
      key: "saving",
      label: "SAVING",
      color: "#22d3ee",
      x: 258,
      y: 144,
      w: 130,
      h: 38,
    },
    {
      key: "income",
      label: "INCOME",
      color: "#38bdf8",
      x: 122,
      y: 188,
      w: 130,
      h: 38,
    },
    {
      key: "debt",
      label: "DEBT",
      color: "#34d399",
      x: 258,
      y: 188,
      w: 130,
      h: 38,
    },
  ];

  return (
    <div className="relative h-[360px] overflow-hidden rounded-[2rem] border border-cyan-300/10 bg-[radial-gradient(circle_at_50%_42%,rgba(18,199,255,.18),transparent_46%),linear-gradient(180deg,rgba(8,26,47,.96),rgba(5,16,31,.96))] p-6">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,199,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(18,199,255,.08)_1px,transparent_1px)] bg-[size:42px_42px] opacity-30" />
      <svg
        viewBox="0 0 520 300"
        className="relative z-10 h-full w-full scale-[1.12]"
      >
        <defs>
          <filter
            id="blockGlowLive"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="4"
              floodColor="#18d5ff"
              floodOpacity="0.18"
            />
          </filter>
          <linearGradient id="roofLineLive" x1="0" x2="1">
            <stop offset="0%" stopColor="#18d5ff" />
            <stop offset="55%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>

        <path d="M92 236 H430" stroke="rgba(18,213,255,.22)" strokeWidth="2" />
        <path d="M128 252 H394" stroke="rgba(18,213,255,.13)" strokeWidth="2" />
        <path
          d="M84 110 L260 20 L436 110"
          fill="none"
          stroke="url(#roofLineLive)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M122 110 L260 52 L398 110"
          fill="rgba(18,213,255,.06)"
          stroke="rgba(77,220,255,.38)"
          strokeWidth="1.5"
        />
        <rect
          x="110"
          y="92"
          width="300"
          height="144"
          rx="14"
          fill="rgba(4,17,31,.42)"
          stroke="rgba(77,220,255,.25)"
        />

        {blocks.map((block) => {
          const score = getScore(block.key);
          return (
            <g key={block.key} filter="url(#blockGlowLive)">
              <rect
                x={block.x}
                y={block.y}
                width={block.w}
                height={block.h}
                rx="8"
                fill={`${block.color}22`}
                stroke={block.color}
                strokeWidth="2"
              />
              <rect
                x={block.x}
                y={block.y + block.h - 6}
                width={(block.w * score) / 100}
                height="6"
                rx="3"
                fill={block.color}
                opacity="0.95"
              />
              <text
                x={block.x + 12}
                y={block.y + (block.key === "vision" ? 15 : 24)}
                fill="rgba(226,232,240,.9)"
                fontSize={block.key === "vision" ? "11" : "12"}
                fontWeight="700"
              >
                {block.label}
              </text>
              <text
                x={block.x + block.w - 12}
                y={block.y + (block.key === "vision" ? 15 : 24)}
                fill={block.color}
                fontSize={block.key === "vision" ? "11" : "13"}
                fontWeight="800"
                textAnchor="end"
              >
                {score}
              </text>
            </g>
          );
        })}

        <path
          d="M108 236 H412"
          stroke="#4ddcff"
          strokeOpacity=".42"
          strokeWidth="2"
        />
        <text
          x="260"
          y="274"
          fill="rgba(226,232,240,.55)"
          fontSize="12"
          fontWeight="700"
          textAnchor="middle"
          letterSpacing="2"
        >
          FINANCIAL FOUNDATION
        </text>
      </svg>
    </div>
  );
}

function IncomeExpenseChart({
  income,
  fixedCosts,
  margin,
}: {
  income: number;
  fixedCosts: number;
  margin: number;
}) {
  const max = Math.max(income, fixedCosts, margin, 1);
  const incomeH = Math.max(8, (income / max) * 120);
  const fixedH = Math.max(8, (fixedCosts / max) * 120);
  const marginH = Math.max(8, (Math.max(0, margin) / max) * 120);

  return (
    <div className="h-44 w-full rounded-2xl border border-white/5 bg-white/[0.025] p-4">
      <div className="flex h-full items-end justify-around gap-5">
        {[
          {
            label: "Income",
            value: income,
            h: incomeH,
            color: "from-cyan-300 to-cyan-600",
          },
          {
            label: "Fixed",
            value: fixedCosts,
            h: fixedH,
            color: "from-amber-300 to-amber-600",
          },
          {
            label: "Margin",
            value: margin,
            h: marginH,
            color: "from-emerald-300 to-emerald-600",
          },
        ].map((bar) => (
          <div
            key={bar.label}
            className="flex flex-1 flex-col items-center justify-end gap-2"
          >
            <div className="text-xs font-semibold text-slate-400">
              {formatCurrency(bar.value)}
            </div>
            <div
              className={`w-full max-w-[54px] rounded-t-xl bg-gradient-to-t ${bar.color}`}
              style={{ height: `${bar.h}px` }}
            />
            <div className="text-xs text-slate-500">{bar.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NetWorthMiniChart({
  scoreHistory,
}: {
  scoreHistory: { score: number }[];
}) {
  const points = scoreHistory.length
    ? scoreHistory.map((item, index) => ({
        x: 14 + index * (280 / Math.max(1, scoreHistory.length - 1)),
        y: 140 - item.score * 1.1,
      }))
    : [
        { x: 14, y: 120 },
        { x: 85, y: 100 },
        { x: 150, y: 105 },
        { x: 220, y: 75 },
        { x: 294, y: 52 },
      ];

  const line = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox="0 0 320 170" className="h-44 w-full overflow-visible">
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1="0"
          x2="320"
          y1={36 + i * 34}
          y2={36 + i * 34}
          stroke="rgba(148,163,184,.13)"
        />
      ))}
      <polyline
        points={line}
        fill="none"
        stroke="#18d5ff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#18d5ff" />
      ))}
    </svg>
  );
}

type DashboardMomentumAction = {
  id: string;
  title: string;
  completed?: boolean;
  completedAt?: string | null;
  dueDate?: string | null;
  pillar?: string;
};

function isDashboardDateThisWeek(dateString?: string | null) {
  if (!dateString) return false;

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  return date >= start && date < end;
}

function getDashboardActionStreak(actions: DashboardMomentumAction[]) {
  const completedDays = Array.from(
    new Set(
      actions
        .filter((action) => action.completed && action.completedAt)
        .map((action) => new Date(action.completedAt as string))
        .filter((date) => !Number.isNaN(date.getTime()))
        .map((date) => date.toDateString()),
    ),
  );

  let streak = 0;
  const cursor = new Date();

  while (completedDays.includes(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function DashboardMomentumPanel({
  actions,
  nextActionOverride,
  lastActivityLabel,
  onNextMove,
}: {
  actions: DashboardMomentumAction[];
  nextActionOverride?: DashboardMomentumAction | null;
  lastActivityLabel?: string | null;
  onNextMove?: () => void;
}) {
  const weeklyActions = actions.filter(
    (action) =>
      isDashboardDateThisWeek(action.dueDate) ||
      isDashboardDateThisWeek(action.completedAt),
  );
  const weeklyCompleted = weeklyActions.filter((action) => action.completed).length;
  const weeklyTotal = Math.max(weeklyActions.length || actions.slice(0, 3).length, 1);
  const weeklyPercent = Math.round((weeklyCompleted / weeklyTotal) * 100);
  const streakDays = getDashboardActionStreak(actions);
  const nextAction =
    nextActionOverride ??
    actions.find((action) => !action.completed && isDashboardDateThisWeek(action.dueDate)) ??
    actions.find((action) => !action.completed) ??
    null;

  const headline =
    weeklyCompleted >= 3
      ? "Your momentum is strong"
      : weeklyCompleted > 0
        ? "You are building momentum"
        : "Your plan is ready for action";
  const message =
    weeklyCompleted >= 3
      ? "You are stacking small wins. Keep the rhythm going this week."
      : weeklyCompleted > 0
        ? "One more focused action can keep your plan moving."
        : "Start with one simple move. The goal is progress, not perfection.";
  const streakText =
    streakDays === 1
      ? "You’ve taken action 1 day in a row"
      : streakDays > 1
        ? `You’ve taken action ${streakDays} days in a row`
        : "Take one action today to start a streak";

  return (
    <DashboardPanel className="overflow-hidden p-5 md:p-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_270px]">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-300/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
              <TrendingUp className="h-3.5 w-3.5" />
              Momentum Engine
            </div>
            {lastActivityLabel && (
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-300">
                Last activity: {lastActivityLabel}
              </div>
            )}
          </div>

          <h2 className="text-2xl font-bold text-white">{headline}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            {message}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-2xl bg-white/[0.06] p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Target className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                This Week
              </span>
            </div>
            <div className="mt-3 text-2xl font-bold">
              {weeklyCompleted}/{weeklyTotal}
            </div>
            <div className="text-xs text-slate-400">actions completed</div>
          </div>

          <div className="rounded-2xl bg-white/[0.06] p-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Zap className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Streak
              </span>
            </div>
            <div className="mt-3 text-sm font-semibold leading-5 text-slate-200">
              {streakText}
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.06] p-4">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
              <span>Weekly progress</span>
              <span>{weeklyPercent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-copper-400 transition-all duration-500"
                style={{ width: `${weeklyPercent}%` }}
              />
            </div>
          </div>

          {nextAction && (
            <button
              type="button"
              onClick={onNextMove}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#d6a14f] px-4 py-3 text-sm font-bold text-[#06172b] hover:bg-[#e0b462] sm:col-span-3 lg:col-span-1"
            >
              Start Today’s Move <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </DashboardPanel>
  );
}

function AssetDonut({
  rows,
  total,
}: {
  rows: { label: string; value: number; color: string }[];
  total: number;
}) {
  const gradient =
    rows.length && total > 0
      ? rows.reduce((parts, row, index) => {
          const start =
            (rows.slice(0, index).reduce((sum, item) => sum + item.value, 0) /
              total) *
            100;
          const end =
            (rows
              .slice(0, index + 1)
              .reduce((sum, item) => sum + item.value, 0) /
              total) *
            100;
          return `${parts}${index ? "," : ""}${row.color} ${start.toFixed(1)}% ${end.toFixed(1)}%`;
        }, "")
      : "#334155 0% 100%";

  return (
    <div
      className="relative mx-auto h-44 w-44 rounded-full shadow-[0_0_36px_rgba(34,211,238,.20)]"
      style={{ background: `conic-gradient(${gradient})` }}
    >
      <div className="absolute inset-8 rounded-full bg-[#06172b] shadow-inner" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-xl font-bold text-white">
          {formatCurrency(total)}
        </div>
        <div className="text-xs text-slate-400">Total Assets</div>
      </div>
    </div>
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

  const userPlanState = useUserPlan();
  const currentPlan: PlanTier = userPlanState.plan;
  const planIsActive = Boolean(userPlanState.isActive);

  const entitlements = getEntitlements(currentPlan, planIsActive);
  const [showSuccess, setShowSuccess] = useState(false);
  const [whatIf, setWhatIf] = useState({ income: 500, housing: 300, debt: 0 });
  const [guidanceTab, setGuidanceTab] = useState<GuidanceTab>("roadmap");
  const [activeDetail, setActiveDetail] = useState<
    "financial" | "netWorth" | "assetAllocation" | null
  >(null);
  const [freedomDateScenario, setFreedomDateScenario] =
    useState<FreedomDateScenario | null>(null);
  const [freedomPlanUpdatedAt, setFreedomPlanUpdatedAt] = useState<
    string | null
  >(null);

  const rawAssessment =
    (currentAssessment as
      | (CurrentAssessmentShape & { report?: CurrentAssessmentShape })
      | null) ?? null;

  useEffect(() => {
    const userId = (user as any)?.id || (user as any)?.user_id;
    if (!userId) return;

    let isMounted = true;

    loadFreedomDatePlan(userId)
      .then((record) => {
        if (!isMounted) return;
        setFreedomDateScenario(record?.scenario_json ?? null);
        setFreedomPlanUpdatedAt(record?.updated_at ?? null);
      })
      .catch((error) => {
        console.error("Failed to load Freedom Date plan for dashboard", error);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    async function handleCheckoutSuccess() {
      if (searchParams.get("checkout") !== "success") return;

      try {
        await refreshProfile?.();
        setShowSuccess(true);
      } finally {
        const url = new URL(window.location.href);
        url.searchParams.delete("checkout");
        window.history.replaceState({}, "", `${url.pathname}${url.search}`);
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
  const latestHistoryReport =
    ((latestHistoryRecord?.report ?? null) as CurrentAssessmentShape | null) ??
    null;
  const currentReport =
    ((rawAssessment?.report ??
      rawAssessment) as CurrentAssessmentShape | null) ?? null;
  const assessment = (currentReport ??
    latestHistoryReport ??
    latestHistoryRecord ??
    null) as CurrentAssessmentShape | null;
  const foundationScore = normalizeCurrentScore(assessment);
  const showAssessment = foundationScore > 0;
  const scoreBand = foundationScore > 0 ? getScoreBand(foundationScore) : null;

  const latestAssessmentType =
    latestHistoryRecord?.assessmentType ??
    rawAssessment?.assessmentType ??
    assessment?.assessmentType ??
    null;
  const latestPaidType =
    latestAssessmentType === "detailed" || latestAssessmentType === "premium";
  const currentAssessmentType =
    rawAssessment?.assessmentType ?? assessment?.assessmentType;
  const canViewPremium =
    currentPlan === "premium" ||
    latestAssessmentType === "premium" ||
    currentAssessmentType === "premium";
  const canViewFullReport =
    currentPlan === "standard" ||
    currentPlan === "premium" ||
    latestPaidType ||
    currentAssessmentType === "detailed" ||
    currentAssessmentType === "premium";
  const canExportPdf = entitlements.canDownloadPdf || latestPaidType;

  const pillarScores = (assessment?.pillarScores ??
    assessment?.pillars ??
    latestHistoryReport?.pillarScores ??
    latestHistoryReport?.pillars ??
    {}) as Record<string, number>;
  const priorities = safeArray(
    assessment?.priorities ?? assessment?.topFocusAreas,
  );
  const warnings = safeArray(assessment?.structuralWarnings);
  const snapshot = useMemo(
    () =>
      getStructuralSnapshot(
        assessment?.metrics ?? latestHistoryReport?.metrics,
      ),
    [assessment?.metrics, latestHistoryReport?.metrics],
  );

  const runwayMonths =
    snapshot && snapshot.fixedCosts > 0
      ? snapshot.totalSavings / snapshot.fixedCosts
      : 0;
  const emergencyMinMonths = 3;
  const emergencyTarget = snapshot?.fixedCosts
    ? snapshot.fixedCosts * emergencyMinMonths
    : 0;
  const currentSavings = snapshot?.totalSavings ?? 0;
  const emergencyPercent =
    emergencyTarget > 0
      ? Math.min(100, (currentSavings / emergencyTarget) * 100)
      : 0;

  const cushionScore = snapshot
    ? Math.round(
        Math.max(
          0,
          Math.min(
            100,
            Math.min(runwayMonths, 6) * 7.5 +
              emergencyPercent * 0.35 +
              Math.max(0, 70 - snapshot.fixedCostLoad) * 0.3,
          ),
        ),
      )
    : 0;

  const cushionLevel: "weak" | "developing" | "strong" =
    cushionScore >= 70 ? "strong" : cushionScore >= 40 ? "developing" : "weak";

  const cushionTone = {
    weak: {
      label: "Weak Cushion",
      text: "text-red-300",
      bg: "bg-red-400/10",
      border: "border-red-300/20",
      bar: "bg-red-400",
      message: "A disruption could quickly force debt or major lifestyle cuts.",
    },
    developing: {
      label: "Developing",
      text: "text-amber-300",
      bg: "bg-amber-300/10",
      border: "border-amber-300/20",
      bar: "bg-gradient-to-r from-amber-400 to-cyan-300",
      message:
        "You have some protection, but a longer disruption would still be challenging.",
    },
    strong: {
      label: "Strong Cushion",
      text: "text-emerald-300",
      bg: "bg-emerald-300/10",
      border: "border-emerald-300/20",
      bar: "bg-emerald-400",
      message:
        "You have a solid buffer in place to handle most financial disruptions.",
    },
  }[cushionLevel];

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
      "dashboard_viewed",
      {
        hasAssessment: showAssessment,
        foundationScore,
        weakestPillar,
        currentPlan,
      },
      "dashboard",
    );
  }, [track, showAssessment, foundationScore, weakestPillar, currentPlan]);

  useEffect(() => {
    void trackTabViewed(guidanceTab, "premium_guidance");
  }, [guidanceTab, trackTabViewed]);

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
      })
      .slice(-6) as {
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
    scoreHistory.length > 1
      ? (scoreHistory[scoreHistory.length - 2]?.score ?? null)
      : null;

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

  const fixedCostTone = getLoadTone(snapshot?.fixedCostLoad || 0);
  const dashboardNextMoveCard = useMemo(
    () =>
      getDashboardNextMoveCard(
        assessment,
        snapshot,
        weakestPillar ?? undefined,
      ),
    [assessment, snapshot, weakestPillar],
  );
  const dashboardWhyThisMatters = useMemo(
    () =>
      getDashboardWhyThisMatters(
        assessment,
        snapshot,
        weakestPillar ?? undefined,
      ),
    [assessment, snapshot, weakestPillar],
  );

  const planProgressAssessmentId = String(
    (rawAssessment as any)?.id ??
      (assessment as any)?.id ??
      (latestHistoryRecord as any)?.id ??
      "latest",
  );
  const planProgressStorageKey = `awf-90-day-plan-progress-${(user as any)?.id ?? "guest"}-${planProgressAssessmentId}`;
  const [completedPlanActions, setCompletedPlanActions] = useState<
    Record<string, boolean>
  >(() => getStoredPlanProgress(planProgressStorageKey));
  const [planProgressRows, setPlanProgressRows] = useState<PlanProgressRow[]>([]);
  const [lastPlanActivity, setLastPlanActivity] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const localProgress = getStoredPlanProgress(planProgressStorageKey);
    setCompletedPlanActions(localProgress);

    const userId = (user as any)?.id;

    loadSavedPlanProgress(userId, planProgressAssessmentId).then(
      (savedProgress) => {
        if (!isMounted || !savedProgress) return;
        const mergedProgress = { ...localProgress, ...savedProgress };
        setCompletedPlanActions(mergedProgress);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            planProgressStorageKey,
            JSON.stringify(mergedProgress),
          );
        }
      },
    );

    loadPlanProgressRows(userId, planProgressAssessmentId).then((rows) => {
      if (!isMounted) return;
      setPlanProgressRows(rows);
    });

    loadLatestPlanActivity(userId, planProgressAssessmentId).then(
      (latestActivity) => {
        if (!isMounted) return;
        setLastPlanActivity(latestActivity);
      },
    );

    return () => {
      isMounted = false;
    };
  }, [planProgressStorageKey, (user as any)?.id, planProgressAssessmentId]);

  const dashboardPlanPhases = useMemo(
    () =>
      getDashboardNinetyDayPlanPhases(
        dashboardNextMoveCard,
        snapshot,
        weakestPillar,
      ),
    [dashboardNextMoveCard, snapshot, weakestPillar],
  );

  const dashboardPlanActions = useMemo(
    () =>
      dashboardPlanPhases.flatMap((phase, phaseIndex) =>
        safeArray(phase.checklist)
          .slice(0, 3)
          .map((item, itemIndex) => ({
            id: makePlanActionId(phaseIndex, itemIndex, item),
            label: item,
            phaseTitle: phase.title,
            phaseIndex,
          })),
      ),
    [dashboardPlanPhases],
  );

  const momentumActions = useMemo(
    () =>
      dashboardPlanActions.map((action, index) => {
        const progressRow = planProgressRows.find(
          (row) => row.action_id === action.id,
        );
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + Math.min(index, 4));

        return {
          id: action.id,
          title: action.label,
          completed: Boolean(completedPlanActions[action.id]),
          completedAt: progressRow?.completed_at ?? null,
          dueDate: dueDate.toISOString(),
          pillar: weakestPillar ?? undefined,
        };
      }),
    [dashboardPlanActions, completedPlanActions, planProgressRows, weakestPillar],
  );

  const completedDashboardPlanCount = dashboardPlanActions.filter(
    (action) => completedPlanActions[action.id],
  ).length;
  const dashboardPlanPercent = dashboardPlanActions.length
    ? Math.round(
        (completedDashboardPlanCount / dashboardPlanActions.length) * 100,
      )
    : 0;
  const currentDashboardStepNumber = dashboardPlanActions.length
    ? Math.min(completedDashboardPlanCount + 1, dashboardPlanActions.length)
    : 0;
  const currentDashboardWeekNumber = dashboardPlanActions.length
    ? Math.min(12, Math.max(1, Math.ceil(currentDashboardStepNumber / 1)))
    : 1;
  const momentum = useMemo(
    () => getWeeklyMomentum(planProgressRows),
    [planProgressRows],
  );
  const completedForScoreBoost = Math.max(
    momentum.totalCompleted,
    completedDashboardPlanCount,
  );
  const progressBoost = Math.min(completedForScoreBoost * 1.5, 10);
  const displayedFoundationScore = Math.min(100, foundationScore + progressBoost);
  const lastPlanActivityLabel = formatLastPlanActivity(lastPlanActivity);
  const dashboardDebtBalance = Number(
    snapshot?.consumerDebt ?? snapshot?.totalDebtBalance ?? 0,
  );
  const isDashboardDebtUnderPressure =
    (snapshot?.fixedCostLoad ?? 0) >= 70 ||
    (snapshot?.debtToIncomeRatio ?? 0) >= 60;
  const nextDashboardPlanAction =
    dashboardPlanActions.find((action) => !completedPlanActions[action.id]) ??
    dashboardPlanActions[0] ??
    null;
  const nextDashboardPlanActionLabel = nextDashboardPlanAction
    ? nextDashboardPlanAction.label
    : null;

  const nextDashboardMomentumAction = nextDashboardPlanAction
    ? momentumActions.find((action) => action.id === nextDashboardPlanAction.id) ?? {
        id: nextDashboardPlanAction.id,
        title: nextDashboardPlanAction.label,
        completed: Boolean(completedPlanActions[nextDashboardPlanAction.id]),
        completedAt:
          planProgressRows.find((row) => row.action_id === nextDashboardPlanAction.id)
            ?.completed_at ?? null,
        dueDate: new Date().toISOString(),
        pillar: weakestPillar ?? undefined,
      }
    : null;

  const toggleDashboardPlanAction = (actionId: string) => {
    const nextCompleted = !completedPlanActions[actionId];
    const next = {
      ...completedPlanActions,
      [actionId]: nextCompleted,
    };

    const now = new Date().toISOString();

    setCompletedPlanActions(next);
    setLastPlanActivity(now);
    setPlanProgressRows((rows) => {
      const existingIndex = rows.findIndex((row) => row.action_id === actionId);
      const updatedRow: PlanProgressRow = {
        action_id: actionId,
        completed: nextCompleted,
        completed_at: nextCompleted ? now : null,
        updated_at: now,
      };

      if (existingIndex === -1) return [...rows, updatedRow];

      return rows.map((row, index) =>
        index === existingIndex ? { ...row, ...updatedRow } : row,
      );
    });

    if (typeof window !== "undefined") {
      window.localStorage.setItem(planProgressStorageKey, JSON.stringify(next));
    }

    void savePlanActionProgress(
      (user as any)?.id,
      planProgressAssessmentId,
      actionId,
      nextCompleted,
    );
  };

  const assetRows = useMemo(() => {
    const detailedInvestmentTotal =
      (snapshot?.retirement401kIraBalance ?? 0) +
      (snapshot?.rothBalance ?? 0) +
      (snapshot?.brokerageBalance ?? 0) +
      (snapshot?.pensionBalance ?? 0) +
      (snapshot?.otherInvestmentAssets ?? 0);

    const investmentFallback = Math.max(
      0,
      (snapshot?.totalInvestments ?? 0) - detailedInvestmentTotal,
    );

    const rows = [
      {
        label: "Cash / Savings",
        value: snapshot?.cashSavings ?? snapshot?.totalSavings ?? 0,
        color: "#a78bfa",
        dot: "bg-violet-400",
      },
      {
        label: "401k / IRA",
        value: snapshot?.retirement401kIraBalance ?? 0,
        color: "#22d3ee",
        dot: "bg-cyan-400",
      },
      {
        label: "Roth",
        value: snapshot?.rothBalance ?? 0,
        color: "#818cf8",
        dot: "bg-indigo-400",
      },
      {
        label: "Brokerage",
        value: snapshot?.brokerageBalance ?? 0,
        color: "#f59e0b",
        dot: "bg-amber-400",
      },
      {
        label: "Pension",
        value: snapshot?.pensionBalance ?? 0,
        color: "#14b8a6",
        dot: "bg-teal-400",
      },
      {
        label: "Other Investments",
        value: (snapshot?.otherInvestmentAssets ?? 0) + investmentFallback,
        color: "#38bdf8",
        dot: "bg-sky-400",
      },
      {
        label: "Home Equity",
        value: snapshot?.homeEquity ?? 0,
        color: "#34d399",
        dot: "bg-emerald-400",
      },
      {
        label: "Other Assets",
        value: snapshot?.otherAssets ?? 0,
        color: "#f472b6",
        dot: "bg-pink-400",
      },
    ].filter((row) => row.value > 0);

    if (!rows.length) {
      return [
        {
          label: "No asset breakdown yet",
          value: 0,
          color: "#334155",
          dot: "bg-slate-500",
        },
      ];
    }

    return rows;
  }, [snapshot]);

  const totalAssets = assetRows.reduce((sum, row) => sum + row.value, 0);
  const welcomeName = user?.name || user?.email?.split("@")?.[0] || "there";

  const handleViewLatestReport = (targetHash = "") => {
    void track(
      targetHash === "#90-day-plan"
        ? "open_full_90_day_plan_clicked"
        : "view_latest_report_clicked",
      { source: "dashboard_command_center", latestAssessmentType, targetHash },
      "navigation",
    );

    const suffix = targetHash || "";

    if (latestAssessmentType === "free") {
      navigate(`/results/snapshot${suffix}`);
      return;
    }

    if (
      latestAssessmentType === "detailed" ||
      latestAssessmentType === "premium"
    ) {
      navigate(`/results${suffix}`);
      return;
    }

    if (showAssessment) {
      navigate(`/results${suffix}`);
      return;
    }

    navigate("/assessment/snapshot");
  };

  const handleOpenFullNinetyDayPlan = () => {
    handleViewLatestReport("#90-day-plan");
  };

  const handleRetakeAssessment = () => {
    void track(
      "retake_assessment_clicked",
      { source: "dashboard_command_center" },
      "assessment",
    );
    navigate("/assessment/comprehensive?mode=retake");
  };

  const handleUpgradeClick = (
    source: string,
    targetPlan: "standard" | "premium" = "premium",
  ) => {
    void trackUpgradeClick(targetPlan, "dashboard_upgrade", source);
    navigate("/pricing");
  };

  const handleRoadmapClick = () => {
    if (canViewPremium) {
      handleViewLatestReport();
      return;
    }

    handleUpgradeClick("best_next_move_roadmap", "premium");
  };

  async function handlePrintPDF() {
    if (!canExportPdf) {
      void trackLockedFeature("pdf_export", "dashboard_header");
      void trackUpgradeClick("standard", "pdf_export", "dashboard_header");
      navigate("/pricing");
      return;
    }

    void track("pdf_export_clicked", { currentPlan }, "conversion");

    if (!printRef.current) return;

    try {
      await exportReportPdf({
        element: printRef.current,
        tier: canViewPremium
          ? "premium"
          : canViewFullReport
            ? "standard"
            : "free",
        foundationScore,
      });
    } catch (error) {
      console.error("PDF export failed:", error);
    }
  }

  return (
    <div className="min-h-screen bg-[#04111f] text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#06172b]/90 p-4 xl:block">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#b87333] to-amber-300 text-[#06172b] shadow-lg">
              <img
                src={logoImage}
                alt="A Wealthy Foundation"
                className="h-7 w-7 object-contain"
              />
            </div>
            <div>
              <div className="text-lg font-bold leading-5">A Wealthy</div>
              <div className="text-lg font-bold leading-5 text-[#d18a3a]">
                Foundation
              </div>
            </div>
          </div>

          <nav className="space-y-1.5">
            {[
              {
                label: "Dashboard",
                icon: Home,
                onClick: () => navigate("/my-foundation"),
                active: true,
              },
              {
                label: "Foundation",
                icon: Shield,
                onClick: () => navigate("/foundation-score"),
              },
              {
                label: "Financial Picture",
                icon: BarChart3,
                onClick: () => navigate("/results"),
              },
              {
                label: "Action Plan",
                icon: Target,
                onClick: () => navigate("/results"),
              },
              {
                label: "Tools",
                icon: Zap,
                onClick: () => navigate("/foundation-tools"),
              },
              {
                label: "Reports",
                icon: FileText,
                onClick: () => handleViewLatestReport(),
              },
            ].map(({ label, icon: Icon, onClick, active }) => (
              <button
                key={label}
                onClick={onClick}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                  active
                    ? "bg-cyan-400/16 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,.12)]"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            ))}
          </nav>

          <div className="mt-6 space-y-3">
            <div className="rounded-2xl border border-cyan-300/12 bg-cyan-300/6 p-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200/70">
                Next Check-In
              </div>
              <div className="mt-2 text-sm font-semibold text-white">
                Review your cushion
              </div>
              <div className="mt-1 text-xs leading-5 text-slate-400">
                Most users update their Foundation Score every 90 days.
              </div>
              <button
                onClick={handleRetakeAssessment}
                className="mt-3 w-full rounded-xl border border-cyan-300/20 bg-cyan-300/8 px-3 py-2 text-xs font-bold text-cyan-200"
              >
                Retake Assessment
              </button>
            </div>

            <div className="rounded-2xl border border-amber-300/12 bg-amber-300/6 p-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200/70">
                Focus Area
              </div>
              <div className="mt-2 text-sm font-semibold text-white">
                {weakestPillar
                  ? formatPillarName(weakestPillar)
                  : "Create breathing room"}
              </div>
              <div className="mt-1 h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-amber-300"
                  style={{
                    width: `${Math.max(8, Math.min(100, weakestPillar ? Number(pillarScores[weakestPillar] ?? 0) : 48))}%`,
                  }}
                />
              </div>
              <div className="mt-2 text-xs text-slate-400">
                {weakestPillar
                  ? `${Math.round(Number(pillarScores[weakestPillar] ?? 0))}/100 current score`
                  : "Start with your highest-leverage next step"}
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="mt-5 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Log Out
          </button>
        </aside>

        <main
          ref={printRef}
          className="flex-1 overflow-hidden p-3 md:p-4 xl:p-6"
        >
          {showSuccess && currentPlan !== "free" && (
            <div
              data-pdf-ignore="true"
              className="mb-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-5 py-4 text-emerald-100 shadow-sm"
            >
              You’re all set — {PLAN_FEATURES[currentPlan].name} is now
              unlocked. Your dashboard and report now reflect your upgraded
              access.
            </div>
          )}

          <header className="mb-4 flex items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" />
                Dashboard
              </div>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                Good morning, {welcomeName}
              </h1>
              <p className="mt-0.5 text-sm text-slate-400">
                {showAssessment
                  ? "Your financial foundation at a glance."
                  : "Start your assessment to build your dashboard."}
              </p>
            </div>

            <div
              data-pdf-ignore="true"
              className="hidden items-center gap-3 md:flex"
            >
              <button
                onClick={() => handleViewLatestReport()}
                className="rounded-2xl border border-cyan-300/20 bg-cyan-300/8 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/12"
              >
                View Report
              </button>
              <button
                onClick={handlePrintPDF}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10"
              >
                {canExportPdf ? "Save PDF" : "Unlock PDF"}
              </button>
              <button
                onClick={handleRetakeAssessment}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10"
              >
                Retake
              </button>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-700/80 font-bold">
                {(welcomeName || "M").charAt(0).toUpperCase()}
              </div>
            </div>
          </header>

          {!showAssessment ? (
            <DashboardPanel className="p-8 text-center">
              <Shield className="mx-auto mb-4 h-12 w-12 text-cyan-300" />
              <h2 className="text-2xl font-bold">No assessment yet</h2>
              <p className="mx-auto mt-2 max-w-xl text-slate-400">
                Complete your first assessment to unlock your Foundation Score,
                financial picture, and action plan.
              </p>
              <button
                onClick={() => navigate("/assessment/snapshot")}
                className="mt-6 rounded-2xl bg-cyan-300 px-5 py-3 font-bold text-[#06172b]"
              >
                Start Snapshot
              </button>
            </DashboardPanel>
          ) : (
            <>
              <section className="mb-6">
                <DashboardPanel className="p-5">
                  <div className="grid gap-4 lg:grid-cols-4">
                    <div className="p-2">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Foundation Score
                          </div>
                          <div className="mt-4 flex items-end gap-2">
                            <span className="text-4xl font-bold text-cyan-300">
                              {Math.round(displayedFoundationScore)}
                            </span>
                            <span className="pb-1 text-slate-500">/100</span>
                          </div>
                          <div className="mt-2 text-sm font-semibold text-cyan-200">
                            {scoreBand?.label ?? "Foundation Score"}
                          </div>
                          {progressBoost > 0 && (
                            <div className="mt-1 text-xs font-semibold text-emerald-300">
                              +{Math.round(progressBoost)} from progress
                            </div>
                          )}
                        </div>
                        <ScoreRing value={Math.round(displayedFoundationScore)} />
                      </div>
                    </div>

                    <div className="p-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Financial Cushion
                          </div>
                          <div
                            className={`mt-4 text-xl font-bold ${cushionTone.text}`}
                          >
                            {cushionTone.label}
                          </div>
                          <div className="mt-1 text-sm text-slate-400">
                            {runwayMonths.toFixed(1)} months runway
                          </div>
                        </div>
                        <div
                          className={`rounded-full border ${cushionTone.border} ${cushionTone.bg} p-3 ${cushionTone.text}`}
                        >
                          <Shield className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="mt-4 h-2 rounded-full bg-white/10">
                        <div
                          className={`h-2 rounded-full ${cushionTone.bar}`}
                          style={{ width: `${Math.max(6, cushionScore)}%` }}
                        />
                      </div>
                      <div className="mt-2 text-xs text-slate-400">
                        <span className={cushionTone.text}>
                          {cushionScore}%
                        </span>{" "}
                        cushion score
                      </div>
                    </div>

                    <div className="p-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Monthly Margin
                          </div>
                          <div
                            className={`mt-4 text-3xl font-bold ${snapshot && snapshot.monthlyMargin >= 0 ? "text-emerald-300" : "text-red-300"}`}
                          >
                            {formatCurrency(snapshot?.monthlyMargin ?? 0)}
                          </div>
                          <div
                            className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${snapshot && snapshot.monthlyMargin >= 500 ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}
                          >
                            {snapshot && snapshot.monthlyMargin >= 500
                              ? "Healthy"
                              : "Tight"}
                          </div>
                        </div>
                        <LineChart className="h-10 w-10 text-emerald-300/80" />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/foundation-tools/my-freedom-date")
                      }
                      className="p-2 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Debt Status
                          </div>
                          <div
                            className={`mt-4 text-2xl font-bold ${
                              isDashboardDebtUnderPressure
                                ? "text-copper-300"
                                : "text-violet-300"
                            }`}
                          >
                            {isDashboardDebtUnderPressure
                              ? "Under Pressure"
                              : dashboardDebtBalance <= 0
                                ? "No Consumer Debt"
                                : freedomDateScenario?.results?.freedomDate
                                  ? new Date(
                                      freedomDateScenario.results.freedomDate,
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "Use Debt Tool"}
                          </div>
                          <div className="mt-1 text-sm text-slate-400">
                            {isDashboardDebtUnderPressure
                              ? "Create breathing room first"
                              : dashboardDebtBalance <= 0
                                ? (snapshot?.mortgageDebt ?? 0) > 0
                                  ? "Mortgage only"
                                  : "Debt-free"
                                : freedomDateScenario?.results?.monthsSaved
                                  ? `${freedomDateScenario.results.monthsSaved} months saved`
                                  : "Open payoff planner"}
                          </div>
                          {isDashboardDebtUnderPressure && (
                            <div className="mt-3 rounded-xl border border-copper-300/25 bg-copper-300/10 p-3 text-xs leading-5 text-copper-100/90">
                              Focus on creating breathing room before relying on
                              payoff-date projections.
                            </div>
                          )}
                        </div>
                        <Calendar className="h-10 w-10 text-violet-300/80" />
                      </div>
                    </button>
                  </div>

                  {nextDashboardPlanAction && (
                    <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-copper-300/25 bg-gradient-to-r from-copper-400/14 via-cyan-300/8 to-transparent p-5 shadow-[0_0_32px_rgba(214,161,79,.08)] md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-copper-200">
                          Today’s action
                        </div>
                        <div className="mt-2 text-base font-bold leading-6 text-white">
                          {nextDashboardPlanAction.label}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          This should take less than 10 minutes.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          document
                            .getElementById("today-plan-action")
                            ?.scrollIntoView({ behavior: "smooth", block: "center" })
                        }
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#d6a14f] px-5 py-3 text-sm font-bold text-[#06172b] hover:bg-[#e0b462]"
                      >
                        Start Today’s Move <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </DashboardPanel>
              </section>

              <section className="mb-6 grid gap-4 xl:grid-cols-[1.1fr_.8fr_.9fr]">
                <DashboardPanel className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Financial Snapshot
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        Income vs. fixed costs
                      </div>
                    </div>
                    <LineChart className="h-5 w-5 text-cyan-300" />
                  </div>
                  <IncomeExpenseChart
                    income={snapshot?.income ?? 0}
                    fixedCosts={snapshot?.fixedCosts ?? 0}
                    margin={snapshot?.monthlyMargin ?? 0}
                  />
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-white/[0.04] p-3">
                      <div className="text-xs text-slate-500">Fixed Load</div>
                      <div className="mt-1 text-xl font-bold text-amber-300">
                        {formatPercent(snapshot?.fixedCostLoad ?? 0)}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white/[0.04] p-3">
                      <div className="text-xs text-slate-500">Savings Rate</div>
                      <div className="mt-1 text-xl font-bold text-emerald-300">
                        {formatPercent(snapshot?.savingsRate ?? 0)}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white/[0.04] p-3">
                      <div className="text-xs text-slate-500">Debt Ratio</div>
                      <div className="mt-1 text-xl font-bold text-cyan-300">
                        {formatPercent(snapshot?.debtToIncomeRatio ?? 0)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveDetail("financial")}
                    className="mt-4 flex items-center gap-2 text-sm font-semibold text-cyan-300"
                  >
                    View Details <ArrowRight className="h-4 w-4" />
                  </button>
                </DashboardPanel>

                <DashboardPanel className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Net Worth
                      </div>
                      <div className="mt-3 text-4xl font-bold">
                        {snapshot?.netWorth
                          ? formatCurrency(snapshot.netWorth)
                          : "—"}
                      </div>
                    </div>
                    <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                      {previousScore !== null
                        ? `${previousScore} → ${foundationScore}`
                        : "Latest"}
                    </div>
                  </div>
                  <NetWorthMiniChart scoreHistory={scoreHistory} />
                  <button
                    onClick={() => setActiveDetail("netWorth")}
                    className="mt-4 flex items-center gap-2 text-sm font-semibold text-cyan-300"
                  >
                    View Details <ArrowRight className="h-4 w-4" />
                  </button>
                </DashboardPanel>

                <DashboardPanel className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Asset Allocation
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        Current available categories
                      </div>
                    </div>
                    <PieChart className="h-5 w-5 text-cyan-300" />
                  </div>
                  <AssetDonut rows={assetRows} total={totalAssets} />
                  <div className="mt-5 space-y-2">
                    {assetRows.map((row) => {
                      const percent =
                        totalAssets > 0 ? (row.value / totalAssets) * 100 : 0;
                      return (
                        <div
                          key={row.label}
                          className="grid grid-cols-[1fr_auto_auto] items-center gap-3 text-sm"
                        >
                          <div className="flex items-center gap-2 text-slate-300">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${row.dot}`}
                            />
                            {row.label}
                          </div>
                          <div className="text-slate-400">
                            {percent.toFixed(0)}%
                          </div>
                          <div className="font-semibold text-slate-200">
                            {formatCurrency(row.value)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setActiveDetail("assetAllocation")}
                    className="mt-4 flex items-center gap-2 text-sm font-semibold text-cyan-300"
                  >
                    View Details <ArrowRight className="h-4 w-4" />
                  </button>
                </DashboardPanel>
              </section>

              <section className="mb-6">
                <DashboardPanel className="p-5 md:p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Your Financial Foundation
                      </div>
                      <h2 className="mt-2 text-2xl font-bold">House View</h2>
                    </div>
                    <button
                      onClick={() => navigate("/results")}
                      className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/20 px-3 py-2 text-sm font-semibold text-cyan-200"
                    >
                      View Details <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid gap-5 lg:grid-cols-[1.15fr_.75fr]">
                    <DashboardHouseVisual pillarScores={pillarScores} />

                    <div className="rounded-[1.6rem] border border-cyan-200/10 bg-white/[0.045] p-5 backdrop-blur-xl">
                      <div className="mb-3 flex items-center gap-2 text-cyan-300">
                        <Zap className="h-4 w-4" />
                        <div className="text-xs font-semibold uppercase tracking-[0.16em]">
                          What-If Calculator
                        </div>
                      </div>

                      <p className="mb-4 text-sm text-slate-400">
                        See how small changes impact your financial foundation.
                      </p>

                      {snapshot && scenarioResult ? (
                        <>
                          <div className="grid grid-cols-2 gap-3">
                            <label className="rounded-xl bg-white/[0.04] p-3">
                              <div className="text-xs text-slate-500">
                                Extra Income
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
                                className="mt-1 w-full bg-transparent text-lg font-bold text-emerald-300 outline-none"
                              />
                            </label>
                            <label className="rounded-xl bg-white/[0.04] p-3">
                              <div className="text-xs text-slate-500">
                                Lower Costs
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
                                className="mt-1 w-full bg-transparent text-lg font-bold text-emerald-300 outline-none"
                              />
                            </label>
                            <div className="col-span-2 rounded-xl bg-white/[0.04] p-3">
                              <div className="text-xs text-slate-500">
                                New Monthly Margin
                              </div>
                              <div className="text-xl font-bold text-cyan-300">
                                {formatCurrency(scenarioResult.adjustedMargin)}
                              </div>
                              <div className="mt-1 text-xs text-slate-500">
                                Fixed load would become{" "}
                                {formatPercent(scenarioResult.adjustedLoad)}
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="rounded-xl bg-white/[0.04] p-3 text-sm text-slate-400">
                          Metrics will appear after your full report is
                          generated.
                        </div>
                      )}
                    </div>
                  </div>
                </DashboardPanel>

              </section>

              <section id="ninety-day-plan" className="mb-6 space-y-4">
                <DashboardMomentumPanel
                  actions={momentumActions}
                  nextActionOverride={nextDashboardMomentumAction}
                  lastActivityLabel={lastPlanActivityLabel}
                  onNextMove={() => {
                    document
                      .getElementById("today-plan-action")
                      ?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                />

                <DashboardPanel className="p-5 md:p-6">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-cyan-300">
                      <Sparkles className="h-5 w-5" />
                      <div className="text-xs font-semibold uppercase tracking-[0.16em]">
                        Your 90-Day Focus
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="rounded-full border border-cyan-300/20 bg-cyan-300/8 px-3 py-1 text-xs font-bold text-cyan-200">
                        {dashboardPlanPercent}% complete
                      </div>
                      {momentum.completedThisWeek > 0 && (
                        <div className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-200">
                          +{momentum.completedThisWeek} this week
                        </div>
                      )}
                    </div>
                  </div>

                  {lastPlanActivityLabel && (
                    <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-300">
                      Last activity: {lastPlanActivityLabel}
                    </div>
                  )}

                  <div className="mb-3 rounded-2xl border border-copper-300/20 bg-copper-400/10 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-copper-200">
                      Week {currentDashboardWeekNumber} of 12
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      You’re building your foundation step by step. One completed move this week is real progress.
                    </p>
                  </div>

                  <h2 id="today-plan-action" className="scroll-mt-28 text-2xl font-bold">
                    {nextDashboardPlanAction ? "Do this next" : "Plan complete"}
                  </h2>
                  {nextDashboardPlanAction && (
                    <div className="mt-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/8 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/80">
                        {nextDashboardPlanAction.phaseTitle}
                      </div>
                      <p className="mt-2 text-lg font-bold leading-7 text-white">
                        {nextDashboardPlanActionLabel}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        This should take less than 10 minutes and gives your plan a clear next win.
                      </p>
                    </div>
                  )}
                  {!nextDashboardPlanAction && (
                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      You have completed the current 90-day plan. Review your report or retake the assessment to choose the next priority.
                    </p>
                  )}

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      <span>
                        {dashboardPlanActions.length ? `Step ${currentDashboardStepNumber} of ${dashboardPlanActions.length}` : "Plan complete"}
                      </span>
                      <span>{dashboardPlanPercent}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-copper-400 transition-all duration-300"
                        style={{ width: `${dashboardPlanPercent}%` }}
                      />
                    </div>
                    <p className="mt-3 text-xs leading-5 text-slate-400">
                      1–2 actions per week is enough to build real progress.
                    </p>
                    {momentum.completedThisWeek > 1 ? (
                      <p className="mt-1 text-sm font-semibold leading-5 text-emerald-300">
                        You completed {momentum.completedThisWeek} steps this week — momentum is building.
                      </p>
                    ) : momentum.completedThisWeek === 1 ? (
                      <p className="mt-1 text-sm font-semibold leading-5 text-emerald-300">
                        You’ve started — that’s the hardest part.
                      </p>
                    ) : (
                      <p className="mt-1 text-sm font-semibold leading-5 text-slate-300">
                        Most people never start. Starting today puts you ahead.
                      </p>
                    )}
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      A strong 90-day target is 6–9 meaningful steps — not a
                      perfect checklist.
                    </p>
                  </div>

                  {nextDashboardPlanAction && (
                    <button
                      type="button"
                      onClick={() =>
                        toggleDashboardPlanAction(nextDashboardPlanAction.id)
                      }
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-3 text-sm font-bold text-emerald-200 hover:bg-emerald-300/15"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      Mark as Complete
                    </button>
                  )}

                  <button
                    onClick={handleOpenFullNinetyDayPlan}
                    className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-cyan-300/35 bg-cyan-300/8 px-4 py-3 text-sm font-bold text-cyan-200 shadow-[0_0_28px_rgba(34,211,238,.12)]"
                  >
                    View your full plan <ArrowRight className="h-4 w-4" />
                  </button>
                </DashboardPanel>
              </section>

              {activeDetail && snapshot ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm">
                  <div className="w-full max-w-2xl rounded-[1.6rem] border border-cyan-200/15 bg-[#081a2f] p-6 text-slate-100 shadow-[0_30px_90px_rgba(0,0,0,.45)]">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                          {activeDetail === "financial"
                            ? "Financial Snapshot"
                            : activeDetail === "netWorth"
                              ? "Net Worth Breakdown"
                              : "Asset Allocation"}
                        </div>
                        <h3 className="mt-2 text-2xl font-bold">
                          {activeDetail === "financial"
                            ? "How your monthly structure is calculated"
                            : activeDetail === "netWorth"
                              ? "How we calculated your net worth"
                              : "Where your assets are currently allocated"}
                        </h3>
                      </div>
                      <button
                        onClick={() => setActiveDetail(null)}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xl leading-none text-slate-300 hover:bg-white/10"
                      >
                        ×
                      </button>
                    </div>

                    {activeDetail === "financial" ? (
                      <div className="space-y-3 text-sm">
                        {[
                          ["Monthly income", snapshot.income],
                          [
                            "Housing / rent / mortgage payment",
                            snapshot.housing,
                          ],
                          ["Utilities", snapshot.utilities],
                          ["Childcare", snapshot.childcare],
                          ["Consumer debt payments", snapshot.debt],
                          ["Total fixed costs", snapshot.fixedCosts],
                          ["Monthly breathing room", snapshot.monthlyMargin],
                        ].map(([label, value]) => (
                          <div
                            key={label as string}
                            className="flex justify-between rounded-xl bg-white/[0.04] px-4 py-3"
                          >
                            <span className="text-slate-400">{label}</span>
                            <span className="font-semibold">
                              {formatCurrency(value as number)}
                            </span>
                          </div>
                        ))}
                        <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/8 px-4 py-3 text-cyan-100">
                          Fixed cost load:{" "}
                          {formatPercent(snapshot.fixedCostLoad)} of take-home
                          pay.
                        </div>
                      </div>
                    ) : null}

                    {activeDetail === "netWorth" ? (
                      <div className="space-y-3 text-sm">
                        {[
                          ["Cash / savings", snapshot.cashSavings],
                          ["Investments", snapshot.totalInvestments],
                          ["Real estate value", snapshot.realEstateAssets],
                          ["Other assets", snapshot.otherAssets],
                          ["Mortgage debt", -snapshot.mortgageDebt],
                          ["Consumer debt", -snapshot.consumerDebt],
                          ["Other liabilities", -snapshot.otherLiabilities],
                        ].map(([label, value]) => (
                          <div
                            key={label as string}
                            className="flex justify-between rounded-xl bg-white/[0.04] px-4 py-3"
                          >
                            <span className="text-slate-400">{label}</span>
                            <span
                              className={`font-semibold ${(value as number) < 0 ? "text-red-300" : ""}`}
                            >
                              {formatCurrency(value as number)}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-lg">
                          <span className="font-bold text-emerald-200">
                            Estimated net worth
                          </span>
                          <span className="font-bold text-emerald-200">
                            {formatCurrency(snapshot.netWorth)}
                          </span>
                        </div>
                      </div>
                    ) : null}

                    {activeDetail === "assetAllocation" ? (
                      <div className="space-y-3 text-sm">
                        {assetRows.map((row) => {
                          const percent =
                            totalAssets > 0
                              ? (row.value / totalAssets) * 100
                              : 0;
                          return (
                            <div
                              key={row.label}
                              className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl bg-white/[0.04] px-4 py-3"
                            >
                              <div className="flex items-center gap-2 text-slate-300">
                                <span
                                  className={`h-2.5 w-2.5 rounded-full ${row.dot}`}
                                />
                                {row.label}
                              </div>
                              <div className="text-slate-400">
                                {percent.toFixed(0)}%
                              </div>
                              <div className="font-semibold">
                                {formatCurrency(row.value)}
                              </div>
                            </div>
                          );
                        })}
                        <div className="flex justify-between rounded-xl border border-cyan-300/15 bg-cyan-300/8 px-4 py-3">
                          <span className="font-semibold text-cyan-100">
                            Total shown assets
                          </span>
                          <span className="font-bold text-cyan-100">
                            {formatCurrency(totalAssets)}
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="hidden">
                <span>{dashboardWhyThisMatters}</span>
                <span>{priorities.join(",")}</span>
                <span>{warnings.length}</span>
                <span>{strongestPillar}</span>
                <span>{latestHistoryItem?.id}</span>
                <span>{fixedCostTone.badge}</span>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

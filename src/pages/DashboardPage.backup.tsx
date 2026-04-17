
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock3,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  FileText,
  Home,
  LineChart,
  LogOut,
  Mail,
  Menu,
  PiggyBank,
  Shield,
  Target,
  TrendingUp,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import logoImage from '../assets/house-icon.png';
import { getScoreBand } from '../types/assessment';

interface DashboardPageProps {
  onLogout: () => void;
}

type PlanTier = 'free' | 'foundation' | 'roadmap';

type StructuralWarning = {
  type: 'housing_pressure' | 'income_constraint' | 'structural_pressure' | string;
  severity: 'high' | 'critical' | string;
};

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

type CurrentAssessmentShape = {
  id?: string;
  createdAt?: number;
  wealthScore?: number;
  foundationScore?: number;
  scoreBand?: string;
  pillarScores?: Record<string, number>;
  pillars?: Record<string, number>;
  recommendations?: string[];
  insights?: string[];
  priorities?: string[];
  topFocusAreas?: string[];
  summary?: string;
  nextStep?: string;
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

const PLAN_FEATURES = {
  free: { name: 'Free', price: 0 },
  foundation: { name: 'Foundation Assessment', price: 29 },
  roadmap: { name: 'Foundation Roadmap', price: 79 },
};

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

function normalizeCurrentScore(assessment: CurrentAssessmentShape | null): number {
  if (!assessment) return 0;
  if (typeof assessment.foundationScore === 'number') {
    return Math.max(0, Math.min(100, assessment.foundationScore));
  }
  if (typeof assessment.wealthScore === 'number') {
    return Math.max(0, Math.min(100, Math.round(((assessment.wealthScore - 300) / 550) * 100)));
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
    return Math.max(0, Math.min(100, Math.round(((item.wealthScore - 300) / 550) * 100)));
  }
  return null;
}

function formatHistoryDate(createdAt?: number): string {
  if (!createdAt) return '';
  const date = new Date(createdAt * 1000);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatCurrency(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

function getStructuralSnapshot(metrics?: MetricsShape | null) {
  if (!metrics) return null;

  const income = Number(metrics.monthlyIncome ?? 0);
  const housing = Number(metrics.monthlyHousingCost ?? 0);
  const utilities = Number(metrics.monthlyUtilities ?? 0);
  const childcare = Number(metrics.monthlyChildcareCost ?? 0);
  const debt = Number(metrics.monthlyDebtPayments ?? 0);
  const fixedCosts = Number(metrics.monthlyFixedCosts ?? (housing + utilities + childcare + debt));
  const fixedCostLoad = income > 0 ? (fixedCosts / income) * 100 : 0;
  const monthlyMargin = income - fixedCosts;
  const debtToIncomeRatio = Number(metrics.debtToIncomeRatio ?? 0);
  const savingsRate = Number(metrics.savingsRate ?? 0);
  const totalInvestments = Number(metrics.totalInvestments ?? 0);
  const homeEquity = Number(metrics.homeEquity ?? 0);

  return {
    income,
    housing,
    utilities,
    childcare,
    debt,
    fixedCosts,
    fixedCostLoad,
    monthlyMargin,
    debtToIncomeRatio,
    savingsRate,
    totalInvestments,
    homeEquity,
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

function getMarginTone(margin: number) {
  if (margin < 0) return 'text-red-600';
  if (margin < 500) return 'text-amber-600';
  return 'text-emerald-600';
}

function scoreNarrative(score: number) {
  if (score >= 80) return 'Your foundation looks strong. The focus now is optimization and consistency.';
  if (score >= 60) return 'You have momentum, but a few weaker areas are still holding you back.';
  if (score >= 40) return 'You have some good pieces in place, but several gaps are still creating drag.';
  return 'Your foundation needs reinforcement before growth becomes the priority.';
}

function getDashboardNextMove(
  assessment: CurrentAssessmentShape | null,
  snapshot: ReturnType<typeof getStructuralSnapshot>,
  weakestPillar?: string,
) {
  if (snapshot && snapshot.fixedCostLoad >= 65) {
    return 'Create breathing room first. Review housing, utilities, and any other fixed bills together, then decide whether the fastest win is a cost cut, an income increase, or both.';
  }
  if (snapshot && snapshot.fixedCostLoad >= 50) {
    return 'Start by protecting your monthly margin. Tightening fixed costs now can make saving and investing feel much easier.';
  }
  if (assessment?.nextStep) return assessment.nextStep;
  if (weakestPillar) {
    return `Start with ${PILLAR_LABELS[weakestPillar] || weakestPillar}. One focused improvement here should have the biggest ripple effect.`;
  }
  return 'Choose one next step and make progress this week.';
}

function getWarningCard(warning: StructuralWarning, snapshot: ReturnType<typeof getStructuralSnapshot>) {
  if (warning.type === 'housing_pressure' && snapshot) {
    return {
      title: 'Housing costs are crowding out progress',
      body: `Your fixed costs are about ${snapshot.fixedCostLoad.toFixed(0)}% of take-home pay, with housing around ${formatCurrency(snapshot.housing)} and utilities around ${formatCurrency(snapshot.utilities)}.`,
    };
  }
  if (warning.type === 'income_constraint') {
    return {
      title: 'Income is the bottleneck right now',
      body: 'This looks more like a math problem than a discipline problem. Increasing income or lowering a major fixed cost may create the biggest overall lift.',
    };
  }
  return {
    title: 'Debt and fixed costs are competing for breathing room',
    body: 'Until that pressure is reduced, saving and investing progress may feel limited even if you are making good day-to-day decisions.',
  };
}

function getTrustedExperts(
  pillars: Record<string, number>,
  snapshot: ReturnType<typeof getStructuralSnapshot>,
  warnings: StructuralWarning[],
): ExpertCard[] {
  const cards: ExpertCard[] = [];
  const hasDependableProtectionGap = Number(pillars.protection ?? 0) < 75;
  const hasInvestingGap = Number(pillars.investing ?? 0) < 75;
  const hasVisionGap = Number(pillars.vision ?? 0) < 70;
  const hasHousingPressure = !!snapshot && snapshot.fixedCostLoad >= 50;
  const hasTaxComplexity = !!snapshot && (snapshot.totalInvestments > 100000 || snapshot.homeEquity > 0);
  const hasDebtPressure = warnings.some((warning) => warning.type === 'structural_pressure');

  if (hasInvestingGap) {
    cards.push({
      key: 'planner',
      title: 'Fiduciary Financial Planner',
      reason: 'A fiduciary planner can help you build a long-term investment strategy that fits your goals, risk tolerance, and timeline.',
      cta: 'Find a trusted planner',
      icon: TrendingUp,
      tone: 'bg-blue-50 border-blue-200',
    });
    cards.push({
      key: 'retirement',
      title: 'Retirement Advisor',
      reason: 'If you are building serious retirement assets, expert guidance can help you choose the right accounts, contribution levels, and asset mix.',
      cta: 'Review retirement options',
      icon: LineChart,
      tone: 'bg-indigo-50 border-indigo-200',
    });
  }

  if (hasDependableProtectionGap) {
    cards.push({
      key: 'insurance',
      title: 'Insurance Review',
      reason: 'If one setback could undo years of progress, it may be worth reviewing life, disability, home, or umbrella coverage with a trusted professional.',
      cta: 'Review coverage',
      icon: Shield,
      tone: 'bg-emerald-50 border-emerald-200',
    });
  }

  if (hasVisionGap || hasTaxComplexity) {
    cards.push({
      key: 'estate',
      title: 'Will & Trust Attorney',
      reason: 'If your family, home, or long-term plan is getting more complex, an estate plan can help protect what you are building.',
      cta: 'Explore estate planning',
      icon: FileText,
      tone: 'bg-purple-50 border-purple-200',
    });
  }

  if (hasTaxComplexity) {
    cards.push({
      key: 'cpa',
      title: 'CPA / Tax Strategist',
      reason: 'A proactive tax professional can help reduce surprises and make your saving and investing decisions work harder.',
      cta: 'Find a trusted CPA',
      icon: CalculatorIcon,
      tone: 'bg-amber-50 border-amber-200',
    });
  }

  if (hasHousingPressure || hasDebtPressure) {
    cards.push({
      key: 'realtor',
      title: 'Trusted Realtor',
      reason: 'If housing costs are shaping your entire financial picture, it may help to talk through buy, sell, refinance, or relocation options.',
      cta: 'Talk to a housing expert',
      icon: Home,
      tone: 'bg-copper-50 border-[#eac89a]',
    });
  }

  const unique = cards.filter((card, index, all) => all.findIndex((x) => x.key === card.key) === index);
  return unique.slice(0, 4);
}

function CalculatorIcon(props: React.ComponentProps<typeof DollarSign>) {
  return <DollarSign {...props} />;
}

function ProfessionalHouse({ pillarScores }: { pillarScores: Record<string, number> }) {
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
      <svg viewBox="0 0 320 272" className="w-full h-auto" style={{ maxHeight: '248px' }}>
        <defs>
          <linearGradient id="roofGradDash" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#17365d" />
            <stop offset="100%" stopColor="#284d7d" />
          </linearGradient>
          <filter id="houseShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#0f172a" floodOpacity="0.12" />
          </filter>
        </defs>
        <path d="M160 20 L294 76 H26 Z" fill="url(#roofGradDash)" filter="url(#houseShadow)" />
        <rect x="28" y="226" width="264" height="28" rx="4" fill="#344154" />
        <text x="160" y="244" textAnchor="middle" fill="white" fontSize="12" fontWeight="700">
          FOUNDATION
        </text>
        {blocks.map((block) => {
          const score = Number(pillarScores[block.key] ?? 0);
          return (
            <g key={block.key} filter="url(#houseShadow)">
              <rect x={block.x} y={block.y} width={block.w} height={block.h} rx="7" fill={tone(score)} stroke="white" strokeWidth="3" />
              <text x={block.x + block.w / 2} y={block.y + block.h / 2 + 3} textAnchor="middle" fill="white" fontSize="9" fontWeight="700">
                {block.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-3 flex justify-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded bg-emerald-500" />Strong</div>
        <div className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded bg-amber-500" />Building</div>
        <div className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded bg-red-500" />Needs work</div>
      </div>
    </div>
  );
}

export default function DashboardPage({ onLogout }: DashboardPageProps) {
  const navigate = useNavigate();
  const { user, currentAssessment, assessmentHistory, userPlan } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanTier>(userPlan || 'free');
  const [whatIf, setWhatIf] = useState({ income: 500, housing: 300, debt: 0 });
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const assessment = (currentAssessment as CurrentAssessmentShape | null) ?? null;
  const foundationScore = normalizeCurrentScore(assessment);
  const pillars = (assessment?.pillarScores || assessment?.pillars || {}) as Record<string, number>;
  const insights = assessment?.insights || assessment?.recommendations || [];
  const structuralWarnings = assessment?.structuralWarnings || [];
  const snapshot = useMemo(() => getStructuralSnapshot(assessment?.metrics), [assessment?.metrics]);

  const strongestPillar = useMemo(() => {
    const entries = Object.entries(pillars);
    if (!entries.length) return null;
    return entries.sort((a, b) => b[1] - a[1])[0];
  }, [pillars]);

  const weakestPillar = useMemo(() => {
    const entries = Object.entries(pillars);
    if (!entries.length) return null;
    return entries.sort((a, b) => a[1] - b[1])[0];
  }, [pillars]);

  const scoreBand = foundationScore > 0 ? getScoreBand(foundationScore) : null;
  const scoreLabelClass =
    foundationScore >= 80 ? 'text-emerald-600' :
    foundationScore >= 60 ? 'text-amber-600' :
    foundationScore >= 40 ? 'text-orange-600' :
    'text-red-600';

  const scoreHistory = useMemo(() => {
    return (assessmentHistory || [])
      .map((item: any) => {
        const score = normalizeHistoryScore(item);
        if (score === null) return null;
        return {
          id: String(item.id ?? `${item.createdAt ?? 0}-${score}`),
          score,
          createdAt: item.createdAt,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => (a.createdAt ?? 0) - (b.createdAt ?? 0)) as {
        id: string;
        score: number;
        createdAt?: number;
      }[];
  }, [assessmentHistory]);

  const trustedExperts = useMemo(
    () => getTrustedExperts(pillars, snapshot, structuralWarnings),
    [pillars, snapshot, structuralWarnings],
  );

  const scenarioResult = useMemo(() => {
    if (!snapshot) return null;
    const adjustedIncome = snapshot.income + Number(whatIf.income || 0);
    const adjustedFixedCosts =
      Math.max(0, snapshot.housing - Number(whatIf.housing || 0)) +
      snapshot.utilities +
      snapshot.childcare +
      Math.max(0, snapshot.debt - Number(whatIf.debt || 0));
    const adjustedLoad = adjustedIncome > 0 ? (adjustedFixedCosts / adjustedIncome) * 100 : 0;
    const adjustedMargin = adjustedIncome - adjustedFixedCosts;
    return { adjustedLoad, adjustedMargin };
  }, [snapshot, whatIf]);

  const showAssessment = !!assessment && foundationScore > 0;
  const fixedCostTone = getLoadTone(snapshot?.fixedCostLoad || 0);

  const handlePrintPDF = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Foundation Dashboard</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#1f2937}.card{border:1px solid #d7e3f0;border-radius:18px;padding:16px;margin:16px 0}h1,h2,h3{color:#183a63}</style></head><body>${printContent.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="min-h-screen bg-[#f6f9fc] flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-[#d7e3f0]">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <img src={logoImage} alt="A Wealthy Foundation" className="h-10 w-auto" />
              <div>
                <h1 className="text-lg font-serif font-bold text-navy-900">A Wealthy Foundation</h1>
                <p className="text-xs text-copper-600 tracking-wider uppercase hidden sm:block">
                  Design the life you want. Build the financial house to support it.
                </p>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-4">
              <button onClick={() => navigate('/results')} className="text-sm font-medium text-navy-700 hover:text-copper-600">View Report</button>
              <button onClick={() => navigate('/trusted-experts')} className="text-sm font-medium text-navy-700 hover:text-copper-600">Trusted Experts</button>
              <button onClick={() => navigate('/articles')} className="text-sm font-medium text-navy-700 hover:text-copper-600">Articles</button>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                currentPlan === 'roadmap' ? 'bg-copper-100 text-copper-700' :
                currentPlan === 'foundation' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {PLAN_FEATURES[currentPlan].name}
              </span>
              <span className="text-sm text-gray-400 hidden sm:block">{user?.name || user?.email}</span>
              <button onClick={onLogout} className="flex items-center gap-1.5 px-4 py-2 bg-[#17365d] text-white text-sm font-semibold rounded-lg hover:bg-[#122b4e] transition-colors">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </nav>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-1 text-navy-700">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden py-2 border-t border-[#d7e3f0]">
              <nav className="flex flex-wrap gap-x-4 gap-y-2 items-center">
                <button onClick={() => navigate('/results')} className="text-sm font-medium text-navy-700 hover:text-copper-600">View Report</button>
                <button onClick={() => navigate('/trusted-experts')} className="text-sm font-medium text-navy-700 hover:text-copper-600">Trusted Experts</button>
                <button onClick={() => navigate('/articles')} className="text-sm font-medium text-navy-700 hover:text-copper-600">Articles</button>
                <span className="text-sm text-gray-400">{user?.name || user?.email}</span>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main ref={printRef} className="max-w-7xl mx-auto px-4 py-8 flex-1">

      <div className="mb-4 rounded-xl bg-red-100 border border-red-300 px-4 py-2 text-red-800 font-bold">
    NEW DASHBOARD TEST
  </div>
  
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-navy-900 mb-2">Welcome back, {user?.name?.split(' ')[0] || 'there'}!</h1>
            <p className="text-gray-600">
              {showAssessment
                ? `Last assessment: ${assessment?.createdAt ? new Date(assessment.createdAt * 1000).toLocaleDateString() : 'Recently'}`
                : 'Complete your first assessment to start building your dashboard.'}
            </p>
          </div>
          <button onClick={handlePrintPDF} className="flex items-center gap-2 px-5 py-3 bg-copper-600 text-white font-medium rounded-xl hover:bg-copper-700 transition-colors">
            <Download className="w-4 h-4" />
            Print to PDF
          </button>
        </div>

        <div className="mb-8 p-5 bg-white border border-[#d7e3f0] rounded-2xl shadow-sm">
          <p className="text-sm text-gray-600 mb-3">View dashboard as:</p>
          <div className="flex flex-wrap gap-2">
            {(['free', 'foundation', 'roadmap'] as PlanTier[]).map((plan) => (
              <button
                key={plan}
                onClick={() => setCurrentPlan(plan)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPlan === plan
                    ? plan === 'roadmap' ? 'bg-copper-600 text-white' :
                      plan === 'foundation' ? 'bg-blue-600 text-white' :
                      'bg-navy-900 text-white'
                    : 'bg-[#f8fbff] border border-[#d7e3f0] text-gray-700 hover:bg-white'
                }`}
              >
                {PLAN_FEATURES[plan].name} {plan !== 'free' && `($${PLAN_FEATURES[plan].price})`}
              </button>
            ))}
          </div>
        </div>

        {!showAssessment ? (
          <div className="bg-white border border-[#d7e3f0] rounded-3xl p-12 text-center shadow-sm">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-navy-900 mb-2">No Assessment Yet</h2>
            <p className="text-gray-600 mb-6">Complete your first assessment to see your Foundation Score.</p>
            <button onClick={() => navigate('/assessment/snapshot')} className="px-8 py-4 bg-copper-600 text-white font-semibold rounded-xl hover:bg-copper-700 transition-colors">
              Start Free Assessment
            </button>
          </div>
        ) : (
          <>
            <div className="grid lg:grid-cols-12 gap-6 mb-8">
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white border border-[#d7e3f0] rounded-3xl p-6 shadow-sm">
                  <h3 className="text-gray-600 text-sm font-medium mb-4">Your Foundation Score</h3>
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div className="w-40 h-40 rounded-full border-8 border-[#e6edf5] flex items-center justify-center relative mx-auto">
                        <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(#c47a2c 0deg ${(foundationScore / 100) * 360}deg, transparent 0deg)`, opacity: 0.28 }} />
                        <div className="relative z-10 text-center">
                          <div className={`text-5xl font-bold ${scoreLabelClass}`}>{foundationScore}</div>
                          <div className="text-gray-500 text-xs">out of 100</div>
                        </div>
                      </div>
                    </div>
                    <div className={`mt-4 text-lg font-semibold ${scoreLabelClass}`}>{scoreBand?.label}</div>
                    <p className="text-gray-500 text-sm mt-2">{scoreNarrative(foundationScore)}</p>
                  </div>
                </div>

                <ProfessionalHouse pillarScores={pillars} />

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border border-[#d7e3f0] rounded-2xl p-4 shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">Top strength</div>
                    <div className="font-semibold text-navy-900">{strongestPillar ? PILLAR_LABELS[strongestPillar[0]] || strongestPillar[0] : '—'}</div>
                  </div>
                  <div className="bg-white border border-[#d7e3f0] rounded-2xl p-4 shadow-sm">
                    <div className="text-sm text-gray-500 mb-1">Main constraint</div>
                    <div className="font-semibold text-navy-900">
                      {snapshot && snapshot.fixedCostLoad >= 65 ? 'Fixed Cost Pressure' : weakestPillar ? PILLAR_LABELS[weakestPillar[0]] || weakestPillar[0] : '—'}
                    </div>
                  </div>
                </div>

                <button onClick={() => navigate('/assessment/detailed')} className="w-full py-3 bg-copper-600 text-white font-semibold rounded-xl hover:bg-copper-700 transition-colors">
                  Retake Assessment
                </button>
              </div>

              <div className="lg:col-span-8 space-y-6">
                <div className="bg-[#17365d] text-white rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Executive Summary</h3>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white">{scoreBand?.label}</span>
                  </div>
                  <p className="leading-8 text-white/95">
                    {assessment?.summary || 'Your dashboard is ready. Start with the biggest constraint holding back the rest of your foundation.'}
                  </p>
                  <div className="mt-5 grid md:grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-white/8 border border-white/10 p-4">
                      <div className="text-sm text-copper-200 mb-1">Best Next Move</div>
                      <div className="font-semibold">{getDashboardNextMove(assessment, snapshot, weakestPillar?.[0])}</div>
                      <button onClick={() => navigate('/results')} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-copper-200 hover:text-white">
                        View full report <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                    {snapshot && (
                      <div className="rounded-2xl bg-white/8 border border-white/10 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm text-copper-200">Monthly Margin</div>
                          <div className={`font-semibold ${snapshot.monthlyMargin < 0 ? 'text-red-300' : snapshot.monthlyMargin < 500 ? 'text-amber-200' : 'text-emerald-300'}`}>
                            {formatCurrency(snapshot.monthlyMargin)}
                          </div>
                        </div>
                        <div className="h-3 bg-white/15 rounded-full overflow-hidden mb-2">
                          <div
                            className={`${snapshot.monthlyMargin < 0 ? 'bg-red-400' : snapshot.monthlyMargin < 500 ? 'bg-amber-300' : 'bg-emerald-400'} h-full`}
                            style={{ width: `${Math.max(8, Math.min(100, snapshot.income > 0 ? (Math.max(snapshot.monthlyMargin, 0) / snapshot.income) * 100 : 0))}%` }}
                          />
                        </div>
                        <p className="text-xs text-white/75">What is left after housing, utilities, childcare, and non-mortgage debt payments.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {snapshot && (
                    <>
                      <div className={`rounded-3xl border p-5 shadow-sm bg-white ${fixedCostTone.border}`}>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-navy-900">Fixed Cost Load</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${fixedCostTone.bg} ${fixedCostTone.text}`}>
                            {fixedCostTone.badge}
                          </span>
                        </div>
                        <div className={`text-4xl font-bold ${fixedCostTone.text}`}>{snapshot.fixedCostLoad.toFixed(0)}%</div>
                        <p className="mt-2 text-sm text-gray-600">{formatCurrency(snapshot.fixedCosts)} of {formatCurrency(snapshot.income)} take-home pay is already committed.</p>
                        <div className="mt-4 h-4 bg-[#edf2f7] rounded-full overflow-hidden flex">
                          <div className="bg-[#d7881e]" style={{ width: `${snapshot.income > 0 ? (snapshot.housing / snapshot.income) * 100 : 0}%` }} />
                          <div className="bg-[#4f7fe6]" style={{ width: `${snapshot.income > 0 ? (snapshot.utilities / snapshot.income) * 100 : 0}%` }} />
                          <div className="bg-[#8b5cf6]" style={{ width: `${snapshot.income > 0 ? (snapshot.childcare / snapshot.income) * 100 : 0}%` }} />
                          <div className="bg-[#ef4444]" style={{ width: `${snapshot.income > 0 ? (snapshot.debt / snapshot.income) * 100 : 0}%` }} />
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>Housing: {formatCurrency(snapshot.housing)}</div>
                          <div>Utilities: {formatCurrency(snapshot.utilities)}</div>
                          <div>Childcare: {formatCurrency(snapshot.childcare)}</div>
                          <div>Debt: {formatCurrency(snapshot.debt)}</div>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-[#d7e3f0] bg-gradient-to-br from-white to-[#f8fbff] p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <Clock3 className="w-5 h-5 text-copper-600" />
                          <h3 className="font-semibold text-navy-900">Monthly Breathing Room</h3>
                        </div>
                        <div className={`text-4xl font-bold ${getMarginTone(snapshot.monthlyMargin)}`}>{formatCurrency(snapshot.monthlyMargin)}</div>
                        <p className="mt-2 text-sm text-gray-600">
                          {snapshot.monthlyMargin < 0
                            ? 'You are currently overextended each month.'
                            : snapshot.monthlyMargin < 500
                            ? 'There is not much room left for saving, investing, or surprises.'
                            : 'You have some room left each month to build momentum.'}
                        </p>
                        <div className="mt-5 space-y-3 text-sm text-gray-600">
                          <div className="flex items-center justify-between"><span>Debt-to-income</span><span className="font-medium text-navy-900">{snapshot.debtToIncomeRatio.toFixed(1)}%</span></div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-red-500" style={{ width: `${Math.min(snapshot.debtToIncomeRatio, 100)}%` }} /></div>
                          <div className="flex items-center justify-between"><span>Savings rate</span><span className="font-medium text-navy-900">{snapshot.savingsRate.toFixed(1)}%</span></div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${Math.min(snapshot.savingsRate, 100)}%` }} /></div>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-[#d7e3f0] bg-gradient-to-br from-white to-[#eef8ff] p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="w-5 h-5 text-copper-600" />
                          <h3 className="font-semibold text-navy-900">Investing</h3>
                        </div>
                        <div className="text-4xl font-bold text-navy-900">{Math.round(pillars.investing ?? 0)}/100</div>
                        <p className="mt-2 text-sm text-gray-600">
                          {snapshot.fixedCostLoad >= 65
                            ? 'Investing matters, but it will feel hard to build consistency until fixed-cost pressure comes down.'
                            : 'This is one of the strongest ways to turn today’s stability into future freedom.'}
                        </p>
                        <div className="mt-5 flex items-center justify-between text-sm text-gray-600">
                          <span>Total investments</span>
                          <span className="font-medium text-navy-900">{formatCurrency(snapshot.totalInvestments)}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {structuralWarnings.length > 0 && (
                  <div className="bg-white border border-[#d7e3f0] rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="w-5 h-5 text-copper-600" />
                      <h3 className="font-semibold text-navy-900">Foundation Stress Test</h3>
                    </div>
                    <div className="space-y-3">
                      {structuralWarnings.map((warning, index) => {
                        const card = getWarningCard(warning, snapshot);
                        return (
                          <div key={`${warning.type}-${index}`} className={`rounded-2xl border p-4 ${warning.severity === 'critical' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                            <div className="font-semibold text-navy-900 mb-1">{card.title}</div>
                            <p className="text-gray-700 leading-7">{card.body}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {snapshot && scenarioResult && (
              <div className="bg-white border border-[#d7e3f0] rounded-3xl p-6 shadow-sm mb-8">
                <div className="flex items-center gap-2 mb-5">
                  <Zap className="w-5 h-5 text-copper-600" />
                  <h2 className="text-lg font-bold text-navy-900">What If Calculator</h2>
                </div>
                <div className="grid xl:grid-cols-[1.2fr_1fr] gap-6">
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2 text-sm text-gray-700"><span>Increase take-home pay</span><span className="font-medium text-navy-900">{formatCurrency(whatIf.income)}</span></div>
                      <input type="range" min={0} max={1500} step={50} value={whatIf.income} onChange={(e) => setWhatIf((prev) => ({ ...prev, income: Number(e.target.value) }))} className="w-full" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2 text-sm text-gray-700"><span>Lower housing</span><span className="font-medium text-navy-900">{formatCurrency(whatIf.housing)}</span></div>
                      <input type="range" min={0} max={Math.max(1000, snapshot.housing)} step={50} value={whatIf.housing} onChange={(e) => setWhatIf((prev) => ({ ...prev, housing: Number(e.target.value) }))} className="w-full" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2 text-sm text-gray-700"><span>Lower non-mortgage debt</span><span className="font-medium text-navy-900">{formatCurrency(whatIf.debt)}</span></div>
                      <input type="range" min={0} max={Math.max(500, snapshot.debt)} step={25} value={whatIf.debt} onChange={(e) => setWhatIf((prev) => ({ ...prev, debt: Number(e.target.value) }))} className="w-full" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#d7e3f0] bg-[#f8fbff] p-5">
                    <div className="text-sm text-gray-500 mb-1">New Fixed Cost Load</div>
                    <div className={`text-4xl font-bold ${getLoadTone(scenarioResult.adjustedLoad).text}`}>{scenarioResult.adjustedLoad.toFixed(0)}%</div>
                    <div className="mt-3 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full ${getLoadTone(scenarioResult.adjustedLoad).bar}`} style={{ width: `${Math.min(100, scenarioResult.adjustedLoad)}%` }} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-5">
                      <div className="rounded-xl bg-white border border-[#d7e3f0] p-4">
                        <div className="text-sm text-gray-500 mb-1">New monthly margin</div>
                        <div className={`font-semibold ${getMarginTone(scenarioResult.adjustedMargin)}`}>{formatCurrency(scenarioResult.adjustedMargin)}</div>
                      </div>
                      <div className="rounded-xl bg-white border border-[#d7e3f0] p-4">
                        <div className="text-sm text-gray-500 mb-1">Improvement</div>
                        <div className="font-semibold text-emerald-600">{formatCurrency(scenarioResult.adjustedMargin - snapshot.monthlyMargin)}</div>
                      </div>
                    </div>
                    <p className="mt-5 text-sm text-gray-700">
                      A change like this would move your fixed cost load from {snapshot.fixedCostLoad.toFixed(0)}% to {scenarioResult.adjustedLoad.toFixed(0)}% and improve your monthly margin by {formatCurrency(scenarioResult.adjustedMargin - snapshot.monthlyMargin)}.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white border border-[#d7e3f0] rounded-3xl p-6 shadow-sm mb-8">
              <div className="flex items-center gap-2 mb-4">
                <LineChart className="w-5 h-5 text-copper-600" />
                <h2 className="text-lg font-bold text-navy-900">Continue Your Plan</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <button onClick={() => navigate('/results')} className="rounded-2xl border border-[#d7e3f0] bg-[#f8fbff] p-5 text-left hover:bg-white transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-5 h-5 text-copper-600" />
                    <div className="font-semibold text-navy-900">View Full Report</div>
                  </div>
                  <p className="text-sm text-gray-600">Revisit your detailed report, full breakdown, and tailored recommendations.</p>
                </button>
                <button onClick={() => navigate('/assessment/detailed')} className="rounded-2xl border border-[#d7e3f0] bg-[#fff8ef] p-5 text-left hover:bg-white transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <ArrowRight className="w-5 h-5 text-copper-600" />
                    <div className="font-semibold text-navy-900">Retake Assessment</div>
                  </div>
                  <p className="text-sm text-gray-600">Run the assessment again after progress or when your situation changes.</p>
                </button>
                <button onClick={() => navigate('/trusted-experts')} className="rounded-2xl border border-[#d7e3f0] bg-[#eef8ff] p-5 text-left hover:bg-white transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="w-5 h-5 text-copper-600" />
                    <div className="font-semibold text-navy-900">Optional Expert Help</div>
                  </div>
                  <p className="text-sm text-gray-600">See the categories of trusted professionals that may help you move faster.</p>
                </button>
              </div>
            </div>

            {trustedExperts.length > 0 && (
              <div className="bg-white border border-[#d7e3f0] rounded-3xl p-6 shadow-sm mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-copper-600" />
                  <h2 className="text-lg font-bold text-navy-900">Optional Expert Help</h2>
                </div>
                <p className="text-sm text-gray-600 mb-5">
                  If you want help moving faster or making higher-stakes decisions, these are the expert categories most relevant to your current foundation.
                </p>
                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {trustedExperts.map((expert) => {
                    const Icon = expert.icon;
                    return (
                      <button
                        key={expert.key}
                        onClick={() => navigate('/trusted-experts')}
                        className={`rounded-2xl border p-5 text-left hover:bg-white transition-colors ${expert.tone}`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-11 h-11 rounded-xl bg-white border border-white/70 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-copper-700" />
                          </div>
                          <div className="font-semibold text-navy-900">{expert.title}</div>
                        </div>
                        <p className="text-sm text-gray-700 leading-6 mb-4">{expert.reason}</p>
                        <div className="inline-flex items-center gap-2 text-sm font-semibold text-copper-700">
                          {expert.cta} <ArrowRight className="w-4 h-4" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-white border border-[#d7e3f0] rounded-3xl p-6 shadow-sm mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-copper-600" />
                <h2 className="text-lg font-bold text-navy-900">7 Building Blocks Breakdown</h2>
              </div>
              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {Object.entries(pillars).map(([key, score]) => {
                  const label = PILLAR_LABELS[key] || key;
                  const Icon = PILLAR_ICONS[key] || Target;
                  const tone =
                    score >= 80 ? 'text-emerald-600' :
                    score >= 60 ? 'text-amber-600' :
                    'text-orange-600';
                  const bar =
                    score >= 80 ? 'bg-emerald-500' :
                    score >= 60 ? 'bg-copper-500' :
                    'bg-orange-500';
                  const labelText =
                    score >= 80 ? 'Strong' :
                    score >= 60 ? 'Building' :
                    'Needs attention';

                  return (
                    <div key={key} className="rounded-2xl border border-[#d7e3f0] bg-white p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-11 h-11 rounded-xl bg-[#f8fbff] border border-[#d7e3f0] flex items-center justify-center">
                          <Icon className="w-5 h-5 text-copper-600" />
                        </div>
                        <span className={`text-2xl font-bold ${tone}`}>{Math.round(score)}</span>
                      </div>
                      <div className="text-lg font-medium text-navy-900 mb-3">{label}</div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                        <div className={`h-full rounded-full ${bar}`} style={{ width: `${score}%` }} />
                      </div>
                      <div className={`text-sm ${tone}`}>{labelText}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {assessment.actionPlan && (
              <div className="bg-white border border-[#d7e3f0] rounded-3xl p-6 shadow-sm mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-copper-600" />
                  <h2 className="text-lg font-bold text-navy-900">90-Day Action Plan</h2>
                </div>
                <div className="grid lg:grid-cols-3 gap-4">
                  {[
                    { title: 'Start Here', steps: assessment.actionPlan.immediate || [] },
                    { title: 'Then Focus Here', steps: assessment.actionPlan.shortTerm || [] },
                    { title: 'After That', steps: assessment.actionPlan.longTerm || [] },
                  ].map((group) => (
                    <div key={group.title} className="rounded-2xl border border-[#d7e3f0] bg-[#f8fbff] p-5">
                      <div className="font-semibold text-navy-900 mb-4">{group.title}</div>
                      <div className="space-y-4">
                        {group.steps.length ? group.steps.map((step, index) => (
                          <div key={`${group.title}-${index}`}>
                            <div className="font-medium text-gray-900 mb-1">{step.title}</div>
                            <p className="text-sm text-gray-700 mb-2">{step.body}</p>
                            {step.checklist?.length ? (
                              <ul className="space-y-1 text-sm text-gray-600">
                                {step.checklist.map((item, itemIndex) => (
                                  <li key={`${index}-${itemIndex}`} className="flex items-start gap-2">
                                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-copper-600" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </div>
                        )) : <p className="text-sm text-gray-500">No steps available yet.</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {scoreHistory.length > 0 && (() => {
              const chartData = scoreHistory;
              const width = Math.max(640, chartData.length * 62);
              const height = 180;
              const padX = 36;
              const padTop = 12;
              const padBottom = 28;
              const usableW = width - padX * 2;
              const usableH = height - padTop - padBottom;
              const points = chartData
                .map((item, index) => {
                  const x = chartData.length === 1 ? width / 2 : padX + (usableW * index) / (chartData.length - 1);
                  const y = padTop + (usableH * (100 - item.score)) / 100;
                  return { ...item, x, y };
                });

              return (
                <div className="bg-white border border-[#d7e3f0] rounded-3xl p-6 shadow-sm mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-copper-600" />
                      Score Progress
                    </h2>
                    <span className="text-sm text-gray-500">{chartData.length} assessments</span>
                  </div>

                  <div className="bg-[#f8fbff] rounded-2xl border border-[#d7e3f0] p-4 overflow-x-auto">
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 min-w-[640px]">
                      {[0, 25, 50, 75, 100].map((tick) => {
                        const y = padTop + (usableH * (100 - tick)) / 100;
                        return (
                          <g key={tick}>
                            <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="#d7e3f0" strokeWidth="1" />
                            <text x={8} y={y + 4} fontSize="10" fill="#6b7280">{tick}</text>
                          </g>
                        );
                      })}
                      <polyline
                        fill="none"
                        stroke="#c47a2c"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        points={points.map((p) => `${p.x},${p.y}`).join(' ')}
                      />
                      {points.map((point) => (
                        <g key={point.id}>
                          <circle cx={point.x} cy={point.y} r="5" fill="#c47a2c" />
                          <text x={point.x} y={point.y - 12} textAnchor="middle" fontSize="10" fill="#17365d" fontWeight="700">
                            {point.score}
                          </text>
                          <text x={point.x} y={height - 4} textAnchor="middle" fontSize="10" fill="#6b7280">
                            {formatHistoryDate(point.createdAt)}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>

                  <div className="mt-4 grid md:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-[#d7e3f0] bg-[#f8fbff] p-4">
                      <div className="text-sm text-gray-500 mb-1">Latest score</div>
                      <div className="text-2xl font-bold text-navy-900">{chartData[chartData.length - 1]?.score ?? '—'}</div>
                    </div>
                    <div className="rounded-2xl border border-[#d7e3f0] bg-[#f8fbff] p-4">
                      <div className="text-sm text-gray-500 mb-1">Starting score</div>
                      <div className="text-2xl font-bold text-navy-900">{chartData[0]?.score ?? '—'}</div>
                    </div>
                    <div className="rounded-2xl border border-[#d7e3f0] bg-[#f8fbff] p-4">
                      <div className="text-sm text-gray-500 mb-1">Change</div>
                      <div className={`text-2xl font-bold ${(chartData[chartData.length - 1]?.score ?? 0) - (chartData[0]?.score ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {(chartData[chartData.length - 1]?.score ?? 0) - (chartData[0]?.score ?? 0) >= 0 ? '+' : ''}
                        {(chartData[chartData.length - 1]?.score ?? 0) - (chartData[0]?.score ?? 0)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="grid md:grid-cols-3 gap-4">
              <button onClick={() => navigate('/trusted-experts')} className="rounded-2xl border border-[#d7e3f0] bg-[#eef8ff] p-5 text-left hover:bg-white transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 text-copper-600" />
                  <div className="font-semibold text-navy-900">Trusted Experts Directory</div>
                </div>
                <p className="text-sm text-gray-600">Browse vetted categories of financial planners, CPAs, insurance advisors, realtors, and estate professionals.</p>
              </button>
              <button onClick={() => navigate('/results')} className="rounded-2xl border border-[#d7e3f0] bg-[#fff8ef] p-5 text-left hover:bg-white transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-5 h-5 text-copper-600" />
                  <div className="font-semibold text-navy-900">Return to Your Report</div>
                </div>
                <p className="text-sm text-gray-600">Go back to your full report, narrative summary, and action steps at any time.</p>
              </button>
              <button onClick={() => navigate('/articles')} className="rounded-2xl border border-[#d7e3f0] bg-white p-5 text-left hover:bg-[#f8fbff] transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <Mail className="w-5 h-5 text-copper-600" />
                  <div className="font-semibold text-navy-900">Need More Help?</div>
                </div>
                <p className="text-sm text-gray-600">Keep learning with articles now, and reserve this area later for live support, office hours, or premium planning tools.</p>
              </button>
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-[#d7e3f0] bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600">
          <div>© {new Date().getFullYear()} A Wealthy Foundation</div>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => navigate('/results')} className="hover:text-copper-600">View Report</button>
            <button onClick={() => navigate('/trusted-experts')} className="hover:text-copper-600">Trusted Experts</button>
            <button onClick={() => navigate('/articles')} className="hover:text-copper-600">Articles</button>
          </div>
        </div>
      </footer>
    </div>
  );
}          
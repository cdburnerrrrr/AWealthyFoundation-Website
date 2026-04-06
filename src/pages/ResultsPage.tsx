import { useMemo } from 'react';
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
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { PILLAR_LABELS, getScoreBand, getBiggestOpportunity, type PillarKey } from '../types/assessment';

type ActionPlanStep = {
  title: string;
  body: string;
  checklist: string[];
};

function PillarReasonList({ reasons }: { reasons?: string[] }) {
  if (!reasons?.length) return null;

  return (
    <div className="mt-3">
      <p className="text-sm font-semibold text-slate-800">Why this score</p>
      <ul className="mt-1 space-y-1 text-sm text-slate-600">
        {reasons.slice(0, 3).map((reason) => (
          <li key={reason}>• {reason}</li>
        ))}
      </ul>
    </div>
  );
}

type StructuralWarning = {
  type: 'housing_pressure' | 'income_constraint' | 'structural_pressure';
  severity: 'high' | 'critical';
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
    monthlyIncome?: number;
    monthlyHousingCost?: number;
    monthlyUtilities?: number;
    monthlyChildcareCost?: number;
    monthlyDebtPayments?: number;
    monthlyFixedCosts?: number;
  };
  actionPlan?: {
    immediate?: ActionPlanStep[];
    shortTerm?: ActionPlanStep[];
    longTerm?: ActionPlanStep[];
  };
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

function getBestNextMoveText(pillar: string) {
  return `Focus on improving ${formatPillarName(pillar)} first. This is the constraint holding back faster progress across your entire foundation.`;
}

function getPriorityHeadline(pillar: string, isBiggest: boolean) {
  const label = formatPillarName(pillar);

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
  const title = rank === 0 ? `Next: Strengthen ${formatPillarName(pillar)}` : `Then focus on ${formatPillarName(pillar)}`;

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

function getStructuralBestNextMove(
  warnings: StructuralWarning[],
  metrics?: ResultShape['metrics'],
  fallbackPillar?: string
) {
  const fixedCost = formatPercent(metrics?.fixedCostPressureRatio);
  const debtToIncome = formatPercent(metrics?.debtToIncomeRatio);

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

function getStructuralContextNote(warnings: StructuralWarning[], metrics?: ResultShape['metrics']) {
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

export default function ResultsPage() {
  const navigate = useNavigate();
  const { currentAssessment } = useAppStore();
  const result = (currentAssessment as ResultShape | null) ?? null;
  const warnings = result?.structuralWarnings || [];
  const metrics = result?.metrics;
  const scoreBand = useMemo(() => getScoreBand(result?.foundationScore ?? 0), [result]);
  const pillarScores = result?.pillarScores ?? result?.pillars ?? {};

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
    return prioritized.length > 0 ? prioritized.slice(0, 3) : pillarEntries.slice(0, 2);
  }, [pillarEntries]);

  const weakest = useMemo(() => {
    const filtered = [...pillarEntries]
      .sort((a, b) => a[1] - b[1])
      .filter(([pillar, score]) => {
        if (pillar === 'debt') return score < 85;
        return score < 75;
      });

    return filtered.length > 0
      ? filtered.slice(0, 3)
      : [...pillarEntries].sort((a, b) => a[1] - b[1]).slice(0, 2);
  }, [pillarEntries]);

  const score = result?.foundationScore ?? 0;
  const summary = result?.summary || '';
  const insights = safeArray(result?.insights);
  const priorities = safeArray(result?.priorities ?? result?.topFocusAreas);

  const biggest = Object.keys(pillarScores).length
    ? getBiggestOpportunity(pillarScores as Record<PillarKey, number>)
    : 'spending';

  const weakestPillar = weakest[0]?.[0] || '';
  const secondWeakest = weakest[1]?.[0] || '';
  const thirdWeakest = weakest[2]?.[0] || '';
  const planStart = result?.actionPlan?.immediate?.[0];
  const planAfter = result?.actionPlan?.longTerm?.[0];
  const planSteps =
    result?.actionPlan?.shortTerm?.length
      ? result.actionPlan.shortTerm
      : [secondWeakest, thirdWeakest]
          .filter(Boolean)
          .map((pillar, index) => getFallbackPlanStep(pillar, index));

  if (!result) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-lg">
          <h1 className="text-3xl font-bold text-navy-900 mb-3">No Results Yet</h1>
          <p className="text-gray-600 mb-6">
            Complete an assessment first so we can build your Foundation Report.
          </p>
          <button
            onClick={() => navigate('/assessment/detailed')}
            className="px-6 py-3 bg-copper-600 text-white rounded-xl font-bold hover:bg-copper-700"
          >
            Take Assessment
          </button>
        </div>
      </div>
    );
  }

  const debtPressure = formatDebtPressure(Number(pillarScores?.debt || 0));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf7f2] via-white to-gray-50">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-100">
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
            className="inline-flex items-center gap-2 text-sm font-semibold text-copper-700 hover:text-copper-800"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-10">
        <section className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 mb-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-copper-50 text-copper-700 text-sm font-semibold mb-5">
              <Sparkles className="w-4 h-4" />
              Your Foundation Report
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-navy-900 leading-tight mb-3">
              {buildExecutiveHeadline(score)}
            </h1>

            <p className="text-base md:text-lg text-gray-600 max-w-3xl mb-6">
              {getBandNarrative(score)}
            </p>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <div className="text-sm text-gray-500 mb-2">Foundation Score</div>
                <div className="text-5xl font-bold text-navy-900">{score}</div>
                <div className={`mt-3 inline-flex px-3 py-1 rounded-full text-sm font-semibold ${scoreBand.bg} ${scoreBand.color}`}>
                  {scoreBand.label}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <div className="text-sm text-gray-500 mb-2">Top Strength</div>
                <div className="text-2xl font-bold text-navy-900">
                  {strongest[0] ? formatPillarName(strongest[0][0]) : '—'}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {strongest[0] ? `${strongest[0][1]}/100` : 'No data'}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <div className="text-sm text-gray-500 mb-2">Debt Pressure</div>
                <div className="text-2xl font-bold text-navy-900">{debtPressure}</div>
                <div className="mt-2 text-sm text-gray-600">
                  Lower debt pressure generally means more flexibility.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-navy-900 text-white rounded-3xl shadow-sm p-6 md:p-8">
            <div className="text-sm uppercase tracking-[0.18em] text-copper-300 mb-3">
              Executive Summary
            </div>
            <p className="text-lg leading-8 text-white/95 mb-6">
              {summary || 'Your report is ready. The next level of progress will come from strengthening the weakest part of your foundation first.'}
            </p>

            <div className="rounded-2xl bg-white/10 border border-white/10 p-5">
              <div className="text-copper-300 text-sm font-semibold mb-2">Best Next Move</div>
              <p className="text-white leading-7">
                {getStructuralBestNextMove(warnings, metrics, weakestPillar)}
              </p>
            </div>
          </div>
        </section>

        {warnings.length > 0 && (
          <section className="mb-6">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8">
              <div className="flex items-center gap-2 mb-5">
                <Sparkles className="w-5 h-5 text-copper-600" />
                <h2 className="text-2xl font-bold text-navy-900">Foundation Stress Test</h2>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {warnings.map((warning, index) => {
                  const tone = getWarningTone(warning.severity);

                  return (
                    <div
                      key={`${warning.type}-${index}`}
                      className={`rounded-2xl border p-5 ${tone.card}`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="text-lg font-bold text-navy-900">
                          {getWarningTitle(warning.type)}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tone.badge}`}>
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
            </div>
          </section>
        )}

        <section className="grid lg:grid-cols-[0.95fr_1.05fr] gap-6 mb-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-2 mb-5">
              <Target className="w-5 h-5 text-copper-600" />
              <h2 className="text-2xl font-bold text-navy-900">Priority Opportunities</h2>
            </div>

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
                      <div className="text-sm text-gray-500">Score: {pillarScore}/100</div>
                    </div>

                    <div className="flex items-center gap-2">
                      {index === 0 && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-copper-100 text-copper-700">
                          {warnings.length > 0 ? 'Top Pillar Priority' : '#1 Priority'}
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPillarTone(pillarScore).badge}`}>
                        {getPillarTone(pillarScore).label}
                      </span>
                    </div>
                  </div>

                  <p className="text-navy-900 font-semibold leading-7 mb-2">
                    {getPriorityHeadline(pillar, isBiggest)}
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
                    {priorities.find((item) => item.toLowerCase().includes(pillar.toLowerCase())) ||
                      getConstraintLine(pillar)}
                  </div>
                </div>
               );
              })}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-2 mb-5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h2 className="text-2xl font-bold text-navy-900">What Is Already Working</h2>
            </div>

            <div className="space-y-4">
              {strongest.map(([pillar, pillarScore]) => (
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
          </div>
        </section>

        <section className="grid lg:grid-cols-[1fr_1fr] gap-6 mb-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-5 h-5 text-copper-600" />
              <h2 className="text-2xl font-bold text-navy-900">Key Insights</h2>
            </div>

            <div className="space-y-4">
              {insights.length > 0 ? (
                insights.map((insight, index) => (
                  <div
                    key={`${index}-${insight.slice(0, 24)}`}
                    className="rounded-2xl bg-gray-50 border border-gray-200 p-5"
                  >
                    <div className="text-xs uppercase tracking-[0.16em] text-copper-600 font-semibold mb-2">
                      Insight {index + 1}
                    </div>
                    <p className="text-gray-700 leading-7">{insight}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-gray-50 border border-gray-200 p-5 text-gray-700">
                  You have some solid pieces in place. The next level of progress will come from improving your weakest pillar first.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-2 mb-5">
              <Clock3 className="w-5 h-5 text-copper-600" />
              <h2 className="text-2xl font-bold text-navy-900">Your 90-Day Plan</h2>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-copper-200 bg-copper-50 p-5">
                <div className="text-sm font-semibold text-copper-700 mb-2">
                  {planStart?.title || 'Start Here'}
                </div>
                <p className="text-navy-900 leading-7 mb-3">
                  {weakestPillar
                    ? `Start with ${formatPillarName(weakestPillar)}. Improving this one area will have the biggest ripple effect across your entire financial foundation.`
                    : planStart?.body ||
                      'Start with your weakest area first. Improving that one area will create the biggest ripple effect.'}
                </p>

                {weakestPillar && (
                  <p className="text-sm text-gray-700 leading-6 mb-3">
                    {getConstraintLine(weakestPillar)}
                  </p>
                )}

                <ul className="space-y-2">
                  {(planStart?.checklist?.length
                    ? planStart.checklist
                    : [
                        `Identify one concrete way to improve ${formatPillarName(weakestPillar || 'your weakest area')}.`,
                        'Take one action this week.',
                        'Set a simple 90-day target you can actually follow.',
                      ]).map((item, index) => (
                    <li
                      key={`start-check-${index}`}
                      className="flex items-start gap-2 text-sm text-navy-900"
                    >
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-copper-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {planSteps.map((step, index) => (
                <div
                  key={`plan-step-${index}`}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
                >
                  <div className="text-sm font-semibold text-gray-500 mb-2">
                    {step.title}
                  </div>
                  <p className="text-gray-700 leading-7 mb-3">{step.body}</p>
                  {step.checklist?.length ? (
                    <ul className="space-y-2">
                      {step.checklist.map((item, itemIndex) => (
                        <li
                          key={`step-${index}-item-${itemIndex}`}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-copper-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <div className="text-sm font-semibold text-gray-500 mb-2">
                  {planAfter?.title || 'After 90 Days'}
                </div>
                <p className="text-gray-700 leading-7 mb-3">
                  {planAfter?.body ||
                    'Review your progress, keep what is working, and then move to the next weakest area.'}
                </p>
                <ul className="space-y-2">
                  {(planAfter?.checklist?.length
                    ? planAfter.checklist
                    : [
                        'Review what improved over the last 90 days.',
                        'Keep the habits that are working.',
                        'Choose the next area to strengthen.',
                      ]).map((item, index) => (
                    <li
                      key={`after-check-${index}`}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-copper-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-copper-600" />
            <h2 className="text-2xl font-bold text-navy-900">Pillar Breakdown</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {pillarEntries.map(([pillar, pillarScore]) => {
              const tone = getPillarTone(pillarScore);
              const Icon = PILLAR_ICONS[pillar] || CheckCircle2;

              return (
                <div key={pillar} className={`rounded-2xl border p-5 ${tone.bg}`}>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/80 border border-white flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${tone.text}`} />
                      </div>
                      <div>
                        <div className="font-bold text-navy-900">
                          {formatPillarName(pillar)}
                        </div>
                        <div className="text-sm text-gray-600">{pillarScore}/100</div>
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tone.badge}`}>
                      {tone.label}
                    </span>
                  </div>

                  <div className="h-2 bg-white rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full ${tone.bar}`}
                      style={{ width: `${Math.max(4, pillarScore)}%` }}
                    />
                  </div>

                  <p className="text-sm text-gray-700 leading-6">
                    {pillarScore >= 75
                      ? strengthDescriptions[pillar] ||
                        'This area is giving your foundation real support.'
                      : getPriorityBody(pillar, false)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
          <button
            onClick={() => navigate('/assessment/detailed')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-300 text-navy-900 font-semibold hover:bg-gray-50"
          >
            Retake Assessment
          </button>

          <button
            onClick={() => navigate('/my-foundation')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-copper-600 text-white font-semibold hover:bg-copper-700 inline-flex items-center justify-center gap-2"
          >
            View Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
}

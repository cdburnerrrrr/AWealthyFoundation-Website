import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Lock,
  Sparkles,
  Target,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useUserPlan } from '../hooks/useUserPlan';

type ScoreBand = {
  label: string;
  description: string;
};

type PlanTier = 'free' | 'standard' | 'premium';

function getPlanBadgeMeta(plan: PlanTier) {
  if (plan === 'premium') {
    return {
      label: 'Foundation Roadmap Plan',
      className: 'bg-copper-50 text-copper-700 border border-copper-200',
    };
  }

  if (plan === 'standard') {
    return {
      label: 'Foundation Assessment Plan',
      className: 'bg-blue-50 text-blue-700 border border-blue-200',
    };
  }

  return null;
}

type SnapshotResult = {
  score?: number;
  foundationScore?: number;
  pillars?: Record<string, number>;
  answers?: Record<string, any>;
};

function getScoreBand(score: number): ScoreBand {
  if (score >= 80) {
    return {
      label: 'Strong Foundation',
      description:
        'You have many of the right pieces in place. Your financial house looks stable, and the next gains are likely to come from refinement and long-term alignment.',
    };
  }

  if (score >= 60) {
    return {
      label: 'Building Momentum',
      description:
        'You have some solid pieces in place, but a few weak spots may be holding back the strength and stability of your foundation.',
    };
  }

  if (score >= 40) {
    return {
      label: 'Needs Attention',
      description:
        'Some important parts of your financial foundation may be underdeveloped or under pressure. A focused plan could make a meaningful difference.',
    };
  }

  return {
    label: 'At Risk',
    description:
      'Your results suggest that a few core parts of your financial foundation may need immediate attention before long-term progress becomes easier.',
  };
}

function getSnapshotInsights(result: SnapshotResult | null): string[] {
  const insights: string[] = [];
  const pillars = result?.pillars || {};
  const answers = result?.answers || {};

  const spending = Number(pillars.spending || 0);
  const debt = Number(pillars.debt || 0);
  const saving = Number(pillars.saving || 0);
  const protection = Number(pillars.protection || 0);
  const vision = Number(pillars.vision || 0);
  const income = Number(pillars.income || 0);

  if (debt > 0 && debt < 55) {
    insights.push(
      'Your monthly obligations may be creating more pressure than you realize, which can make the rest of your foundation harder to strengthen.'
    );
  }

  if (saving > 0 && saving < 55) {
    insights.push(
      'Your current savings position may not yet provide enough margin or breathing room for unexpected costs and longer-term progress.'
    );
  }

  if (spending > 0 && spending < 60) {
    insights.push(
      'Your answers suggest that spending pressure or unclear cash flow patterns may be making it harder to build consistency.'
    );
  }

  if (protection > 0 && protection < 55) {
    insights.push(
      'A setback could have a bigger impact than it should if protection and backup systems are not fully in place yet.'
    );
  }

  if (vision > 0 && vision < 60) {
    insights.push(
      'Your financial direction may still be forming, which can make it harder for day-to-day money decisions to feel connected to the life you want.'
    );
  }

  if (income >= 70) {
    insights.push(
      'Your income appears to be one of the stronger parts of your foundation, which gives you a good base to build from.'
    );
  }

  if (answers.monthlyTakeHomeIncome && !insights.length) {
    insights.push(
      'You already have some useful signals in place, but your snapshot only shows part of the picture. A deeper assessment can refine what is strong and what needs attention.'
    );
  }

  return insights.slice(0, 3);
}

function getBiggestOpportunity(result: SnapshotResult | null): { title: string; body: string } {
  const pillars = result?.pillars || {};
  const ordered = Object.entries(pillars)
    .filter(([, value]) => typeof value === 'number')
    .sort((a, b) => Number(a[1]) - Number(b[1]));

  const weakest = ordered[0]?.[0] || 'spending';

  const map: Record<string, { title: string; body: string }> = {
    income: {
      title: 'Income Strength',
      body: 'Growing or stabilizing income can create room for almost every other part of your financial house to improve more easily.',
    },
    spending: {
      title: 'Spending Control',
      body: 'Creating more control over monthly cash flow may be one of the fastest ways to build margin and strengthen the rest of your foundation.',
    },
    saving: {
      title: 'Saving Consistency',
      body: 'Building reserves and consistency can reduce stress, improve resilience, and make long-term progress feel more stable.',
    },
    investing: {
      title: 'Investing Growth',
      body: 'Once your core foundation is steadier, investing can help turn today’s margin into future freedom and long-term growth.',
    },
    debt: {
      title: 'Debt Efficiency',
      body: 'Reducing financial drag could improve flexibility, free up cash flow, and make it easier to strengthen the rest of your financial house.',
    },
    protection: {
      title: 'Protection Security',
      body: 'Shoring up protection can keep one setback from undoing progress you have already made in the rest of your foundation.',
    },
    vision: {
      title: 'Purpose & Direction',
      body: 'Clarifying what you are building toward can help make your day-to-day financial decisions more consistent and meaningful.',
    },
  };

  return map[weakest] || map.spending;
}

function getNextMove(result: SnapshotResult | null): string {
  const pillars = result?.pillars || {};
  const debt = Number(pillars.debt || 0);
  const spending = Number(pillars.spending || 0);
  const saving = Number(pillars.saving || 0);

  if (debt < 55) {
    return 'Start by reducing financial pressure. Lowering debt drag or monthly obligations can improve flexibility across the rest of your foundation.';
  }

  if (spending < 60) {
    return 'Start by creating more breathing room in your monthly finances. Even small improvements in cash flow can strengthen stability and consistency.';
  }

  if (saving < 60) {
    return 'Start by building more margin. A stronger savings buffer can make your financial life feel steadier and easier to improve.';
  }

  return 'Start with the weakest part of your foundation and strengthen it first. The biggest gains usually come from improving the area creating the most friction.';
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-copper-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-red-600';
}

export default function SnapshotResultsPage() {
  const navigate = useNavigate();
  const { currentAssessment, isAuthenticated } = useAppStore();
  const actualPlan = useUserPlan();

  const result = currentAssessment as SnapshotResult | null;
  const score = Math.round(Number(result?.score || result?.foundationScore || 0));
  const band = getScoreBand(score);
  const insights = useMemo(() => getSnapshotInsights(result), [result]);
  const biggestOpportunity = useMemo(() => getBiggestOpportunity(result), [result]);
  const nextMove = useMemo(() => getNextMove(result), [result]);
  const planBadge = getPlanBadgeMeta(actualPlan);

  const handleContinueToFull = () => {
    navigate(
      isAuthenticated
        ? '/assessment/comprehensive?mode=continue'
        : '/login?redirect=/assessment/comprehensive?mode=continue'
    );
  };

  const handleMaybeLater = () => {
    navigate(isAuthenticated ? '/my-foundation' : '/');
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-white">
        <main className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-serif font-bold text-navy-900 mb-4">
            No Snapshot Result Found
          </h1>
          <p className="text-navy-600 mb-6">
            It looks like there is no snapshot result loaded yet.
          </p>
          <button
            onClick={() => navigate('/assessment/snapshot')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-copper-600 text-white rounded-xl font-semibold hover:bg-copper-700 transition-colors"
          >
            Start Free Assessment <ArrowRight className="w-4 h-4" />
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] via-white to-[#f7f4ee]">
      <main className="max-w-7xl mx-auto px-4 py-8 lg:py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-sm font-medium text-navy-600 hover:text-navy-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>

        <section className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 items-stretch">
          <div className="rounded-[28px] border border-navy-100 bg-white shadow-[0_20px_60px_rgba(15,42,68,0.08)] overflow-hidden">
            <div className="px-6 py-6 md:px-8 md:py-8">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <p className="text-sm font-semibold text-copper-600 tracking-widest uppercase">
                  Your Snapshot Result
                </p>
                {planBadge && (
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${planBadge.className}`}>
                    <CheckCircle className="w-4 h-4" />
                    {planBadge.label}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-serif font-bold text-navy-900 leading-tight mb-3">
                Your Snapshot Foundation Score
              </h1>

              <p className="text-navy-600 text-base md:text-lg leading-8 max-w-3xl">
                This is your first look at how strong your financial foundation appears right now,
                based on your core answers.
              </p>

              <div className="mt-6 grid md:grid-cols-[220px_1fr] gap-6 items-center">
                <div className="rounded-[24px] border border-copper-200 bg-gradient-to-b from-white to-[#fbf6ef] p-6 text-center shadow-sm">
                  <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
                    {score}
                  </div>
                  <div className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-navy-500">
                    {band.label}
                  </div>
                </div>

                <div>
                  <p className="text-lg font-semibold text-navy-900 mb-3">
                    {band.description}
                  </p>

                  <p className="text-navy-600 leading-7">
                    Your full report may refine this score as we factor in more of your financial
                    picture. That means a fuller assessment can uncover strengths, context, and
                    opportunities that a quick snapshot cannot fully capture.
                  </p>

                  {isAuthenticated && (
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        onClick={() => navigate('/my-foundation')}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-navy-700 hover:bg-gray-50 transition-colors"
                      >
                        Go to Dashboard
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] bg-navy-900 text-white p-6 md:p-8 shadow-[0_20px_60px_rgba(15,42,68,0.14)]">
            <div className="flex items-center gap-2 text-copper-400 mb-3">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-[0.14em]">
                Continue Your Assessment
              </span>
            </div>

            <h2 className="text-2xl font-bold mb-3">
              Complete Your Full Report — $29
            </h2>

            <p className="text-navy-200 leading-7 mb-5">
              You’ve finished the Snapshot. Continue with a deeper set of questions to refine your
              score and unlock your complete financial breakdown.
            </p>

            <div className="rounded-2xl bg-white/8 border border-white/10 px-4 py-3 mb-5">
              <p className="text-sm font-semibold text-white">
                You won’t repeat the questions you already answered.
              </p>
            </div>

            <div className="space-y-2 text-sm text-navy-100 mb-6">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-copper-400 mt-0.5 shrink-0" />
                <span>Full 7-building-block breakdown</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-copper-400 mt-0.5 shrink-0" />
                <span>Refined Foundation Score</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-copper-400 mt-0.5 shrink-0" />
                <span>Personalized insights and recommendations</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-copper-400 mt-0.5 shrink-0" />
                <span>90-Day Plan and downloadable PDF</span>
              </div>
            </div>

            <button
              onClick={handleContinueToFull}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-copper-500 hover:bg-copper-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-copper-900/10"
            >
              Continue Your Full Assessment
              <ChevronRight className="w-4 h-4" />
            </button>

            <p className="mt-2 text-center text-xs text-navy-300">
              About 2–3 minutes to finish
            </p>

            <button
              onClick={handleMaybeLater}
              className="w-full mt-3 text-sm text-navy-300 hover:text-white transition-colors"
            >
              Maybe later
            </button>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-2xl font-serif font-bold text-navy-900">
              What We See So Far
            </h2>
            <p className="text-navy-600 mt-2">
              Your snapshot already reveals a few important signals about the strength of your
              financial house.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <div
                key={`${insight}-${index}`}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="text-copper-600 mb-3">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-navy-700 leading-7 text-sm">{insight}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid lg:grid-cols-2 gap-6">
          <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-copper-600 mb-3">
              <Target className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-[0.14em]">
                Biggest Opportunity
              </span>
            </div>

            <h3 className="text-2xl font-bold text-navy-900 mb-3">
              {biggestOpportunity.title}
            </h3>

            <p className="text-navy-600 leading-7">
              {biggestOpportunity.body}
            </p>
          </div>

          <div className="rounded-[24px] border border-copper-200 bg-[#fbf7f0] p-6 shadow-sm">
            <div className="flex items-center gap-2 text-copper-600 mb-3">
              <ArrowRight className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-[0.14em]">
                Your Next Best Move
              </span>
            </div>

            <p className="text-lg font-semibold text-navy-900 mb-3">
              Start by strengthening the part of your foundation creating the most friction.
            </p>

            <p className="text-navy-700 leading-7">
              {nextMove}
            </p>

            <div className="mt-5 rounded-2xl border border-copper-100 bg-white px-4 py-3">
              <p className="text-sm text-navy-600">
                Your full report unlocks a deeper breakdown, a refined score, and a practical
                90-Day Plan tailored to your complete financial picture.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 md:p-8 shadow-sm overflow-hidden">

            <div className="flex items-center gap-2 text-copper-600 mb-3">
              <Lock className="w-5 h-5" />
              <span className="text-sm font-semibold uppercase tracking-[0.14em]">
                Included In Your Full Report
              </span>
            </div>

            <h2 className="text-2xl font-serif font-bold text-navy-900 mb-3">
              Your Full Breakdown Goes Further
            </h2>

            <p className="text-navy-600 leading-7 max-w-3xl mb-6">
              The full report gives you a more complete view of your financial foundation, including
              deeper breakdowns, more accurate scoring, and a clearer action plan.
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-gray-50 p-5 border border-gray-100">
                <h3 className="font-semibold text-navy-900 mb-2">Detailed 7-Block Analysis</h3>
                <p className="text-sm text-navy-600">
                  See how each building block contributes to the strength of your overall
                  foundation.
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-5 border border-gray-100">
                <h3 className="font-semibold text-navy-900 mb-2">Refined Score & Context</h3>
                <p className="text-sm text-navy-600">
                  A deeper question set gives you a more complete and more precise picture.
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-5 border border-gray-100">
                <h3 className="font-semibold text-navy-900 mb-2">Personalized 90-Day Plan</h3>
                <p className="text-sm text-navy-600">
                  Know what to work on first and how to make meaningful progress from here.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-copper-200 bg-copper-50/40 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-navy-900">Ready to go deeper?</h3>
                  <p className="mt-1 text-sm text-navy-600">
                    Continue your full assessment to unlock the complete report, refined score, and personalized 90-Day Plan.
                  </p>
                </div>
                <div className="sm:text-right">
                  <button
                    onClick={handleContinueToFull}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-copper-600 hover:bg-copper-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
                  >
                    Continue Your Full Assessment
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <p className="mt-2 text-xs text-navy-500">
                    You won’t repeat the questions you already answered. About 2–3 minutes to finish.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
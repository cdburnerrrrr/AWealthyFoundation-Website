import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Crown,
  Download,
  Eye,
  FileText,
  Gauge,
  PiggyBank,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { startCheckout } from '../lib/stripe';

type TierId = 'free-snapshot' | 'foundation-assessment' | 'foundation-roadmap';

type PlanCard = {
  id: TierId;
  name: string;
  price: string;
  eyebrow: string;
  description: string;
  features: string[];
  buttonLabel: string;
  highlight?: boolean;
  dark?: boolean;
  badge?: string;
};

const PLANS: PlanCard[] = [
  {
    id: 'free-snapshot',
    name: 'Free Snapshot',
    price: '$0',
    eyebrow: 'Quick preview',
    description:
      'A short starting point that shows your overall direction and where your foundation may need attention first.',
    features: [
      'Free Snapshot assessment',
      'Foundation Score preview on a 0 to 100 scale',
      'High-level Building Block snapshot',
      'Basic next-step direction',
    ],
    buttonLabel: 'Start Free',
  },
  {
    id: 'foundation-assessment',
    name: 'Foundation Assessment Plan',
    price: '$29',
    eyebrow: 'Full report',
    description:
      'Unlock the full Foundation Report, dashboard access, PDF export, and a clear 90-day action plan.',
    features: [
      'Comprehensive assessment with grouped follow-up questions',
      'Full Foundation Score on a 0 to 100 scale',
      '7 Building Block and Pillar score breakdown',
      'Executive summary, strengths, gaps, and priority opportunities',
      'Personalized 90-day action plan',
      'Dashboard access with progress tracking and key metrics',
      'Downloadable PDF report',
    ],
    buttonLabel: 'Unlock Full Report',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    id: 'foundation-roadmap',
    name: 'Foundation Roadmap Plan',
    price: '$79',
    eyebrow: 'Guided implementation',
    description:
      'Everything in the Foundation Assessment Plan, plus a stronger implementation layer for the next 12 months.',
    features: [
      'Everything in Foundation Assessment',
      '12-month guided roadmap',
      'Workbook-style planning prompts',
      'Monthly check-in structure',
      'Priority ladder based on your weakest constraint',
      'Provider recommendations tailored to your gaps',
      'Premium guidance workspace',
    ],
    buttonLabel: 'Unlock Roadmap',
    dark: true,
    badge: 'Best Value',
  },
];

const REPORT_FEATURES = [
  {
    icon: Gauge,
    title: 'Foundation Score, 0 to 100',
    body:
      'See where your full financial foundation stands without borrowing language from credit scores.',
  },
  {
    icon: FileText,
    title: 'Full Foundation Report',
    body:
      'Get the executive summary, score breakdown, strengths, gaps, and recommended next move in one place.',
  },
  {
    icon: Target,
    title: '90-day action plan',
    body:
      'Turn the report into a short, practical next-step plan instead of a long list of vague suggestions.',
  },
  {
    icon: Download,
    title: 'PDF export',
    body:
      'Save or print the full report so you can revisit it when you review progress.',
  },
];

const DASHBOARD_FEATURES = [
  {
    icon: BarChart3,
    title: 'Control panel numbers',
    body:
      'Track score, net worth, fixed cost load, debt pressure, savings, and investing metrics after the report is generated.',
  },
  {
    icon: Sparkles,
    title: 'Best Next Move',
    body:
      'Keep the dashboard focused on the action most likely to improve the rest of your foundation.',
  },
  {
    icon: TrendingUp,
    title: 'What-if simulator',
    body:
      'See how more income, lower fixed costs, or faster debt payoff could change your monthly breathing room.',
  },
];

function PlanCard({ plan, onSelect, loading }: { plan: PlanCard; onSelect: (id: TierId) => void; loading: TierId | null }) {
  const isLoading = loading === plan.id;

  if (plan.dark) {
    return (
      <div className="relative rounded-3xl border border-navy-700 bg-navy-900 p-6 text-white shadow-xl shadow-navy-900/20">
        {plan.badge && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-copper-500 px-4 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-lg">
            {plan.badge}
          </div>
        )}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper-300">{plan.eyebrow}</p>
          <h3 className="mt-3 text-2xl font-bold tracking-tight">{plan.name}</h3>
          <p className="mt-3 text-sm leading-6 text-navy-200">{plan.description}</p>
          <div className="mt-5 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-copper-300">{plan.price}</span>
            <span className="text-sm text-navy-300">one-time</span>
          </div>
        </div>

        <ul className="mb-6 space-y-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-navy-100">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-copper-300" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => onSelect(plan.id)}
          disabled={loading !== null}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-copper-500 px-4 py-3 font-semibold text-white transition hover:bg-copper-600 disabled:opacity-70"
        >
          {isLoading ? 'Processing...' : plan.buttonLabel}
          {!isLoading && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-3xl border bg-white p-6 shadow-sm transition ${
        plan.highlight
          ? 'border-copper-400 shadow-xl shadow-copper-500/10 ring-2 ring-copper-200/60'
          : 'border-slate-200'
      }`}
    >
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-copper-500 px-4 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-lg">
          {plan.badge}
        </div>
      )}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper-700">{plan.eyebrow}</p>
        <h3 className="mt-3 text-2xl font-bold tracking-tight text-navy-900">{plan.name}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">{plan.description}</p>
        <div className="mt-5 flex items-baseline gap-2">
          <span className={`text-4xl font-bold ${plan.highlight ? 'text-copper-600' : 'text-navy-900'}`}>{plan.price}</span>
          <span className="text-sm text-slate-500">{plan.id === 'free-snapshot' ? 'free' : 'one-time'}</span>
        </div>
      </div>

      <ul className="mb-6 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-copper-500" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onSelect(plan.id)}
        disabled={loading !== null}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition disabled:opacity-70 ${
          plan.highlight
            ? 'bg-copper-600 text-white hover:bg-copper-700'
            : 'border-2 border-copper-600 text-copper-700 hover:bg-copper-50'
        }`}
      >
        {isLoading ? 'Processing...' : plan.buttonLabel}
        {!isLoading && <ArrowRight className="h-4 w-4" />}
      </button>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, body }: { icon: React.ElementType; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-copper-50 text-copper-700">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-base font-bold text-navy-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}

export default function PremiumPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppStore();
  const [loading, setLoading] = useState<TierId | null>(null);

  const handleSelectPlan = async (tierId: TierId) => {
    if (tierId === 'free-snapshot') {
      navigate(isAuthenticated ? '/assessment/snapshot' : '/login?redirect=/assessment/snapshot');
      return;
    }

    if (!user) {
      navigate('/login?redirect=/pricing');
      return;
    }

    try {
      setLoading(tierId);
      await startCheckout(tierId === 'foundation-roadmap' ? 'premium' : 'standard');
    } catch (error) {
      console.error('Checkout failed:', error);
      alert(error instanceof Error ? error.message : 'Unable to start checkout.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-navy-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-[#183b5e] to-navy-800 px-4 py-10 text-white sm:px-6 lg:px-8 lg:py-12">
        <div className="pointer-events-none absolute inset-0 opacity-[0.10]">
          <div className="h-full w-full bg-[linear-gradient(to_right,#ffffff30_1px,transparent_1px),linear-gradient(to_bottom,#ffffff22_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-copper-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-0 h-80 w-80 rounded-full bg-sky-300/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-copper-300/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-copper-100">
              <Crown className="h-4 w-4" />
              Premium Plans
            </div>
            <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Turn your Foundation Score into a clear plan for what to do next.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-navy-100 sm:text-lg">
              Start with a free Snapshot, unlock the full Foundation Report for deeper analysis, or choose the Roadmap Plan for guided implementation over the next 12 months.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/premium/report-preview')}
                className="inline-flex items-center gap-2 rounded-xl bg-copper-600 px-5 py-3 font-semibold text-white shadow-lg shadow-copper-600/20 transition hover:bg-copper-700"
              >
                Preview report + dashboard
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/pricing')}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/15"
              >
                Unlock the $29 report
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-5 shadow-2xl shadow-navy-950/30 backdrop-blur-sm">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4">
                <div className="text-sm text-white/70">Score System</div>
                <div className="mt-2 text-3xl font-bold text-copper-200">0 to 100</div>
                <p className="mt-2 text-xs leading-5 text-white/60">Built for your financial foundation, not a credit score range.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4">
                <div className="text-sm text-white/70">Included</div>
                <div className="mt-2 text-xl font-bold text-white">7 areas</div>
                <p className="mt-2 text-xs leading-5 text-white/60">Income, Spending, Saving, Investing, Debt, Protection, and Vision.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4">
                <div className="text-sm text-white/70">Action Layer</div>
                <div className="mt-2 text-xl font-bold text-white">90 days</div>
                <p className="mt-2 text-xs leading-5 text-white/60">A practical starting plan before the Roadmap adds the 12-month layer.</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-copper-300/20 bg-copper-300/10 p-4 text-sm leading-6 text-copper-50">
              The goal is not another generic score. The goal is knowing which part of your financial house deserves attention first.
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-6 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onSelect={handleSelectPlan} loading={loading} />
          ))}
        </div>

        <div className="mx-auto mt-5 flex max-w-4xl flex-col items-center justify-center gap-2 rounded-2xl border border-copper-200 bg-white px-5 py-4 text-center text-sm leading-6 text-slate-600 shadow-sm sm:flex-row sm:text-left">
          <Shield className="h-5 w-5 shrink-0 text-copper-600" />
          <span>30-day money-back guarantee. If the paid report or roadmap is not helpful, ask for a full refund.</span>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-copper-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-copper-700">
              <FileText className="h-4 w-4" />
              What the paid report unlocks
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-navy-900">
              The $29 plan is no longer just more questions. It is the full review.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              The full report is designed to connect your score, your weakest constraint, your numbers, and your next move so the result feels useful after the assessment is done.
            </p>
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('/premium/report-preview')}
              className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy-800"
            >
              Preview the sample report
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/pricing')}
              className="inline-flex items-center gap-2 rounded-xl border border-copper-300 bg-white px-5 py-3 text-sm font-semibold text-copper-700 transition hover:bg-copper-50"
            >
              Go to checkout
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {REPORT_FEATURES.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              <Eye className="h-4 w-4" />
              Dashboard value
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-navy-900">
              After the report, the dashboard keeps the work visible.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              The dashboard is the control panel: current numbers, one current move, momentum, and scenario modeling that shows how small changes affect the outcome.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {DASHBOARD_FEATURES.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-copper-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-copper-700">
              <Shield className="h-4 w-4" />
              Which plan fits?
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-navy-900">Choose based on how much guidance you want.</h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <PiggyBank className="mb-4 h-8 w-8 text-copper-600" />
              <h3 className="text-xl font-bold text-navy-900">Free Snapshot</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Best if you are curious and want a fast signal before deciding whether to go deeper.
              </p>
            </div>

            <div className="rounded-3xl border-2 border-copper-300 bg-white p-6 shadow-lg shadow-copper-500/10">
              <FileText className="mb-4 h-8 w-8 text-copper-600" />
              <h3 className="text-xl font-bold text-navy-900">Foundation Assessment Plan</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Best if you want the full financial review, score breakdown, dashboard, PDF, and 90-day plan.
              </p>
            </div>

            <div className="rounded-3xl border border-navy-700 bg-navy-900 p-6 text-white shadow-xl shadow-navy-900/20">
              <Calendar className="mb-4 h-8 w-8 text-copper-300" />
              <h3 className="text-xl font-bold">Foundation Roadmap Plan</h3>
              <p className="mt-2 text-sm leading-6 text-navy-200">
                Best if you want the report plus a structured 12-month implementation path and premium guidance workspace.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-navy-900 px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-copper-300/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-copper-100">
            <Zap className="h-4 w-4" />
            Ready when you are
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Start with the Snapshot, then unlock the level of guidance you need.</h2>
          <p className="mt-4 text-sm leading-7 text-navy-200 sm:text-base">
            You do not need to fix everything at once. The right first step is identifying the part of the foundation that creates the biggest lift.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => handleSelectPlan('free-snapshot')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-copper-600 px-6 py-3 font-semibold text-white transition hover:bg-copper-700"
            >
              Start Free Snapshot
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/premium/report-preview')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/15"
            >
              Preview report + dashboard
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

import { Link, useNavigate } from 'react-router-dom';
import type { ElementType } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Gauge,
  Home,
  Lock,
  PiggyBank,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';

type PillarSample = {
  key: string;
  label: string;
  score: number;
  note: string;
  icon: ElementType;
};

type MetricCard = {
  label: string;
  value: string;
  helper: string;
  icon: ElementType;
};

const SAMPLE_PILLARS: PillarSample[] = [
  {
    key: 'income',
    label: 'Income',
    score: 72,
    note: 'Stable base, but growth could lift the whole system.',
    icon: Wallet,
  },
  {
    key: 'spending',
    label: 'Spending',
    score: 61,
    note: 'Fixed costs are workable, but not loose.',
    icon: Home,
  },
  {
    key: 'saving',
    label: 'Saving',
    score: 54,
    note: 'The cushion needs more consistent support.',
    icon: PiggyBank,
  },
  {
    key: 'investing',
    label: 'Investing',
    score: 78,
    note: 'Good momentum, especially if the match is captured.',
    icon: TrendingUp,
  },
  {
    key: 'debt',
    label: 'Debt Pressure',
    score: 58,
    note: 'Debt is not a crisis, but it is creating drag.',
    icon: BarChart3,
  },
  {
    key: 'protection',
    label: 'Protection',
    score: 63,
    note: 'Core coverage exists, but details need review.',
    icon: Shield,
  },
  {
    key: 'vision',
    label: 'Vision',
    score: 74,
    note: 'The direction is becoming clearer.',
    icon: Eye,
  },
];

const DASHBOARD_METRICS: MetricCard[] = [
  {
    label: 'Foundation Score',
    value: '68 / 100',
    helper: 'Building Momentum',
    icon: Gauge,
  },
  {
    label: 'Monthly Margin',
    value: '$740',
    helper: 'After fixed costs',
    icon: Wallet,
  },
  {
    label: 'Net Worth',
    value: '$142k',
    helper: 'Assets minus liabilities',
    icon: BarChart3,
  },
  {
    label: 'Cash Runway',
    value: '2.4 mo',
    helper: 'Starter cushion, not yet strong',
    icon: PiggyBank,
  },
];

function ScoreDial({ score }: { score: number }) {
  return (
    <div className="relative mx-auto flex h-44 w-44 items-center justify-center rounded-full bg-gradient-to-br from-copper-200 via-copper-100 to-white p-3 shadow-2xl shadow-copper-500/20 ring-1 ring-copper-300/40">
      <div className="absolute inset-3 rounded-full border-[14px] border-slate-200" />
      <div
        className="absolute inset-3 rounded-full border-[14px] border-copper-500"
        style={{ clipPath: `polygon(50% 50%, 50% 0, ${50 + score / 2}% 0, 100% 50%, 100% 100%, 0 100%, 0 0, 50% 0)` }}
      />
      <div className="relative flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white shadow-inner ring-1 ring-copper-200/70">
        <span className="text-5xl font-bold tracking-tight text-navy-900">{score}</span>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-copper-700">out of 100</span>
      </div>
    </div>
  );
}

function PillarCard({ item }: { item: PillarSample }) {
  const Icon = item.icon;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-copper-50 text-copper-700">
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="font-semibold text-navy-900">{item.label}</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-navy-700">
          {item.score}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-copper-500" style={{ width: `${item.score}%` }} />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{item.note}</p>
    </div>
  );
}

function MetricCard({ item }: { item: MetricCard }) {
  const Icon = item.icon;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4 text-white shadow-lg shadow-navy-950/10">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">{item.label}</span>
        <Icon className="h-4 w-4 text-copper-200" />
      </div>
      <p className="text-3xl font-bold tracking-tight text-white">{item.value}</p>
      <p className="mt-2 text-sm text-navy-100/75">{item.helper}</p>
    </div>
  );
}

function SectionLabel({ icon: Icon, children }: { icon: ElementType; children: string }) {
  return (
    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-copper-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-copper-700">
      <Icon className="h-4 w-4" />
      {children}
    </div>
  );
}

export default function ReportDashboardPreviewPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-slate-50 text-navy-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-[#173a5d] to-navy-800 px-4 py-10 text-white sm:px-6 lg:px-8 lg:py-12">
        <div className="pointer-events-none absolute inset-0 opacity-[0.10]">
          <div className="h-full w-full bg-[linear-gradient(to_right,#ffffff30_1px,transparent_1px),linear-gradient(to_bottom,#ffffff22_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-copper-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-0 h-80 w-80 rounded-full bg-sky-300/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <Link
            to="/premium"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-copper-100 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Premium
          </Link>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-copper-300/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-copper-100">
                <FileText className="h-4 w-4" />
                Sample Preview
              </div>
              <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                See what the $29 Foundation Report and Dashboard unlock.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-navy-100 sm:text-lg">
                This sample uses generic data so you can see the structure, depth, and practical guidance before you decide to unlock your own personalized version.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/pricing')}
                  className="inline-flex items-center gap-2 rounded-xl bg-copper-600 px-5 py-3 font-semibold text-white shadow-lg shadow-copper-600/20 transition hover:bg-copper-700"
                >
                  Unlock my full report
                  <ArrowRight className="h-4 w-4" />
                </button>
                <a
                  href="#sample-report"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/15"
                >
                  View the sample
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-5 shadow-2xl shadow-navy-950/30 backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper-200">Sample Profile</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">Building Momentum</h2>
                </div>
                <span className="rounded-full border border-copper-300/25 bg-copper-300/10 px-3 py-1 text-xs font-semibold text-copper-100">
                  Sample only
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-[0.85fr_1.15fr] sm:items-center">
                <ScoreDial score={68} />
                <div className="space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4">
                    <div className="text-sm text-white/70">Biggest opportunity</div>
                    <div className="mt-1 text-xl font-bold text-copper-100">Savings buffer</div>
                    <p className="mt-2 text-xs leading-5 text-white/60">This sample household has income and investing momentum, but the cushion is still thinner than the rest of the plan.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4">
                    <div className="text-sm text-white/70">Best next move</div>
                    <div className="mt-1 text-xl font-bold text-white">Protect monthly margin</div>
                    <p className="mt-2 text-xs leading-5 text-white/60">Turn $250/month of margin into a repeatable savings transfer before adding more complexity.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="sample-report" className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 max-w-3xl">
            <SectionLabel icon={FileText}>Sample Foundation Report</SectionLabel>
            <h2 className="text-3xl font-bold tracking-tight text-navy-900">
              The paid report connects the score to the reason behind it.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Your version would use your actual assessment answers, financial metrics, and priority areas. This preview shows the kind of output the $29 plan is designed to unlock.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper-700">Executive Summary</p>
                  <h3 className="mt-2 text-2xl font-bold text-navy-900">A solid base with one weak support layer.</h3>
                </div>
                <Sparkles className="h-8 w-8 text-copper-500" />
              </div>
              <p className="text-sm leading-7 text-slate-600">
                This sample household is not starting from zero. Income is steady, investing has started, and debt is manageable. The main issue is that the savings layer is not yet strong enough to protect the rest of the foundation when life gets expensive.
              </p>
              <div className="mt-5 rounded-2xl bg-copper-50 p-4 text-sm leading-6 text-copper-900 ring-1 ring-copper-200">
                <strong>Best Next Move:</strong> Build a stronger cash buffer before increasing lifestyle spending or adding more investing complexity.
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Fixed Cost Load</p>
                <p className="mt-2 text-3xl font-bold text-navy-900">57%</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Manageable, but tight enough that the margin needs to be protected.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Debt Pressure</p>
                <p className="mt-2 text-3xl font-bold text-navy-900">Moderate</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Payments are not overwhelming, but they still compete with savings.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Emergency Runway</p>
                <p className="mt-2 text-3xl font-bold text-navy-900">2.4 months</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">A decent start, but not enough to protect the whole plan.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">90-Day Target</p>
                <p className="mt-2 text-3xl font-bold text-navy-900">$1,500</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">A realistic first savings milestone based on the sample margin.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {SAMPLE_PILLARS.map((item) => (
              <PillarCard key={item.key} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 max-w-3xl">
            <SectionLabel icon={Target}>Sample 90-Day Plan</SectionLabel>
            <h2 className="text-3xl font-bold tracking-tight text-navy-900">
              The report turns the diagnosis into a short action path.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Instead of giving you every possible thing to improve, the full report focuses on the steps most likely to strengthen the next weak layer.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Protect the monthly margin',
                body: 'Keep the sample household\'s $740 monthly margin from disappearing into lifestyle drift.',
                items: ['Cap flexible spending for 30 days', 'Move savings first after payday', 'Review the two largest fixed costs'],
              },
              {
                step: '2',
                title: 'Build the next cash milestone',
                body: 'Aim for a starter savings milestone before increasing optional spending.',
                items: ['Set a $1,500 short-term target', 'Automate $250/month', 'Keep the money separate from checking'],
              },
              {
                step: '3',
                title: 'Then optimize investing',
                body: 'Once the buffer is stronger, decide whether to increase workplace contributions or Roth IRA funding.',
                items: ['Confirm employer match status', 'Review current contribution rate', 'Choose one 90-day increase'],
              },
            ].map((card) => (
              <div key={card.step} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-copper-600 text-lg font-bold text-white">
                  {card.step}
                </div>
                <h3 className="text-xl font-bold text-navy-900">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{card.body}</p>
                <ul className="mt-4 space-y-2">
                  {card.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm leading-6 text-slate-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-copper-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-navy-900 via-[#173a5d] to-navy-800 px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-copper-300/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-copper-100">
              <BarChart3 className="h-4 w-4" />
              Sample Foundation Dashboard
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              The dashboard keeps the report visible after the assessment.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-navy-100 sm:text-base">
              The full dashboard is where the score, structural metrics, best next move, and progress tracking live after the report is generated.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {DASHBOARD_METRICS.map((item) => (
              <MetricCard key={item.label} item={item} />
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-6 shadow-xl shadow-navy-950/20">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper-200">Today\'s Best Move</p>
                  <h3 className="mt-2 text-2xl font-bold text-white">Build the buffer before adding complexity.</h3>
                </div>
                <Zap className="h-8 w-8 text-copper-200" />
              </div>
              <p className="text-sm leading-7 text-navy-100">
                With fixed costs taking more than half of take-home pay and only 2.4 months of runway, the sample household gets more value from strengthening savings first than from chasing another optimization tactic.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {['Automate $250/mo', 'Review fixed costs', 'Recheck in 90 days'].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.08] p-3 text-sm font-semibold text-white">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-6 shadow-xl shadow-navy-950/20">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper-200">Progress Tracker</p>
              <h3 className="mt-2 text-2xl font-bold text-white">90-day action progress</h3>
              <div className="mt-5 space-y-4">
                {[
                  { label: 'Set savings target', value: 100 },
                  { label: 'Automate transfer', value: 65 },
                  { label: 'Review fixed costs', value: 35 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex justify-between text-sm text-navy-100">
                      <span>{item.label}</span>
                      <span>{item.value}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/12">
                      <div className="h-full rounded-full bg-copper-400" style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-6">
              <TrendingUp className="mb-4 h-8 w-8 text-copper-200" />
              <h3 className="text-xl font-bold text-white">Scenario modeling</h3>
              <p className="mt-2 text-sm leading-6 text-navy-100">See how more income, lower fixed costs, or faster debt payoff could change the path.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-6">
              <Download className="mb-4 h-8 w-8 text-copper-200" />
              <h3 className="text-xl font-bold text-white">PDF export</h3>
              <p className="mt-2 text-sm leading-6 text-navy-100">Save or print your personalized report after the full assessment is complete.</p>
            </div>
            <div className="rounded-3xl border border-copper-300/20 bg-copper-300/10 p-6">
              <Lock className="mb-4 h-8 w-8 text-copper-200" />
              <h3 className="text-xl font-bold text-white">Roadmap upgrade layer</h3>
              <p className="mt-2 text-sm leading-6 text-copper-50">The $79 plan adds the guided 12-month roadmap, workbook prompts, and premium guidance workspace.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-copper-100 text-copper-700">
            <FileText className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-navy-900">
            Your version would be built from your answers.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            The sample above is generic. The paid report uses your household situation, scores, financial metrics, weak points, and next-step priorities.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate('/pricing')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-copper-600 px-6 py-3 font-semibold text-white transition hover:bg-copper-700"
            >
              Unlock my full report
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/assessment/snapshot')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-copper-600 px-6 py-3 font-semibold text-copper-700 transition hover:bg-copper-50"
            >
              Start with the free Snapshot
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

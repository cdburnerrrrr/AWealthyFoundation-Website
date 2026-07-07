import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Eye,
  Lock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import FoundationPuzzle from '../components/FoundationPuzzle';

function trackAwfEvent(eventName: string, parameters: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;

  (window as any).gtag?.('event', eventName, {
    event_category: 'A Wealthy Foundation',
    ...parameters,
  });
}

const sevenAreas = [
  'Income',
  'Spending',
  'Saving',
  'Investing',
  'Debt',
  'Protection',
  'Vision',
];

export default function StartPage() {
  const navigate = useNavigate();

  const startSnapshot = (source: string) => {
    trackAwfEvent('snapshot_start_clicked', { source });
    navigate('/assessment/snapshot');
  };

  return (
    <div className="min-h-screen bg-white text-navy-900">
      <section className="overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(184,115,51,0.10),transparent_34%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:grid-cols-[0.92fr,1.08fr] lg:items-center lg:px-8 lg:pb-20 lg:pt-16">
          <div className="text-center lg:text-left">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-copper-600 sm:text-sm">
              You already know one score
            </p>

            <h1 className="font-serif text-4xl font-bold leading-[1.08] text-navy-900 sm:text-5xl lg:text-[3.55rem]">
              Your Credit Score Is Only One Piece of the Story.
              <span className="mt-3 block text-copper-600">
                Discover Your Foundation Score.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-navy-600 sm:text-lg lg:mx-0">
              Your credit score tells lenders how you manage debt. The free Foundation
              Snapshot looks at the seven connected areas of your financial life to show
              where you stand, what may be holding you back, and what to work on next.
            </p>

            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <button
                type="button"
                onClick={() => startSnapshot('start_hero')}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-copper-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-copper-600/20 transition hover:-translate-y-0.5 hover:bg-copper-700 sm:w-auto"
              >
                Discover My Foundation Score
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-navy-500 lg:justify-start">
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4" /> About 5 minutes
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Free
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-4 w-4" /> No credit card
              </span>
            </div>

            <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-left shadow-sm lg:mx-0">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 rounded-full bg-white p-2 text-emerald-700 shadow-sm">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-emerald-950">Private by design</p>
                  <p className="mt-1 text-sm leading-6 text-emerald-900">
                    No bank connection. No sales call. No investment pitch. Your answers
                    are used only to calculate your results.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <FoundationPuzzle />
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper-600">
              What your credit score leaves out
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-navy-900 sm:text-4xl">
              A strong credit score does not always mean a strong financial foundation.
            </h2>
            <p className="mt-5 text-base leading-8 text-navy-600 sm:text-lg">
              You can have a strong credit score and still feel squeezed every month.
              You can have retirement savings and no emergency cushion. You can earn a
              good income and still have too much of it committed before the month begins.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <Eye className="h-6 w-6 text-copper-600" />
              <h3 className="mt-4 text-lg font-semibold text-navy-900">See the complete picture</h3>
              <p className="mt-2 text-sm leading-7 text-navy-600">
                Look across all seven areas instead of trying to judge your finances by one isolated number.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <BarChart3 className="h-6 w-6 text-copper-600" />
              <h3 className="mt-4 text-lg font-semibold text-navy-900">Find the pressure points</h3>
              <p className="mt-2 text-sm leading-7 text-navy-600">
                Identify where your foundation is strong and which areas may be making everything else harder.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <Sparkles className="h-6 w-6 text-copper-600" />
              <h3 className="mt-4 text-lg font-semibold text-navy-900">Choose the next right move</h3>
              <p className="mt-2 text-sm leading-7 text-navy-600">
                Leave with a clearer sense of what deserves your attention first instead of trying to fix everything at once.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr,1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper-600">
                The seven building blocks
              </p>
              <h2 className="mt-3 font-serif text-3xl font-bold text-navy-900 sm:text-4xl">
                Strong finances are built from connected parts.
              </h2>
              <p className="mt-5 text-base leading-8 text-navy-600">
                A weakness in one area can create pressure in several others. The
                Foundation Snapshot helps you see how the pieces fit together before
                you decide what to change.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {sevenAreas.map((area) => (
                <div
                  key={area}
                  className="flex min-h-20 items-center justify-center rounded-2xl border border-copper-200 bg-white px-3 text-center text-sm font-semibold text-navy-800 shadow-sm"
                >
                  {area}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper-600">
              What you receive
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-navy-900 sm:text-4xl">
              A useful result—not another pile of financial information.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ['Your Foundation Score', 'A simple 0–100 view of your current financial foundation.'],
              ['Your strongest and weakest areas', 'A clearer look at what is helping you and where pressure may be coming from.'],
              ['Your next focus', 'A practical starting point so you know what deserves attention first.'],
            ].map(([title, description]) => (
              <div key={title} className="rounded-2xl border border-slate-200 p-6 shadow-sm">
                <CheckCircle2 className="h-6 w-6 text-copper-600" />
                <h3 className="mt-4 text-lg font-semibold text-navy-900">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-navy-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-navy-950 via-navy-900 to-slate-900 py-14 text-white sm:py-16">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper-300">
            Why I built A Wealthy Foundation
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">
            Most people do not need more disconnected money advice.
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-navy-200 sm:text-lg">
            I created A Wealthy Foundation because hardworking people are often told
            to budget better, invest more, eliminate debt, and plan for the future—all
            at the same time. The goal is to help you step back, see the whole picture,
            and make the next decision with more clarity.
          </p>
          <p className="mt-5 font-serif text-lg font-semibold text-copper-300">
            — Mark A. Williams
          </p>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-navy-900 sm:text-4xl">
            See where your financial foundation stands today.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-navy-600 sm:text-lg">
            Start with the free Snapshot. You do not need perfect numbers, a bank
            connection, or a complete financial plan to begin.
          </p>
          <button
            type="button"
            onClick={() => startSnapshot('start_final_cta')}
            className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-copper-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-copper-600/20 transition hover:-translate-y-0.5 hover:bg-copper-700"
          >
            Discover My Foundation Score
            <ArrowRight className="h-5 w-5" />
          </button>
          <p className="mt-4 text-sm text-navy-500">
            About 5 minutes • Free • No credit card required
          </p>
        </div>
      </section>
    </div>
  );
}

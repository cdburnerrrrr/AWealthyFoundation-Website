import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Mail, ShieldCheck } from 'lucide-react';

type ReportNewsletterCardProps = {
  userEmail?: string | null;
  source?: string;
};

export default function ReportNewsletterCard({
  userEmail,
  source = 'foundation_report',
}: ReportNewsletterCardProps) {
  const [email, setEmail] = useState(userEmail ?? '');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const subscribeUrl = useMemo(
    () => import.meta.env.VITE_BEEHIIV_SUBSCRIBE_URL || '',
    []
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      setStatus('error');
      return;
    }

    // If you add your Beehiiv embed/API URL to VITE_BEEHIIV_SUBSCRIBE_URL,
    // this will post directly. Otherwise, it gracefully saves the opt-in locally
    // so the UI still works while you finish the integration.
    if (!subscribeUrl) {
      localStorage.setItem(
        'foundationReportOptIn',
        JSON.stringify({ email, source, optedInAt: new Date().toISOString() })
      );
      setStatus('success');
      return;
    }

    try {
      setStatus('loading');
      await fetch(subscribeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });
      setStatus('success');
    } catch (error) {
      console.error('Newsletter signup failed:', error);
      setStatus('error');
    }
  }

  return (
    <section className="rounded-3xl border border-copper-300/25 bg-gradient-to-br from-[#fff8ed] to-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-copper-200 bg-copper-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-copper-700">
            <Mail className="h-3.5 w-3.5" />
            The Foundation Report
          </div>

          <h3 className="mt-4 text-2xl font-bold tracking-tight text-navy-900">
            Stay on track with your plan.
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Most people lose momentum after the first few weeks. Get simple,
            practical reminders to help you stay consistent, revisit your next
            move, and keep building your foundation.
          </p>

          <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Weekly practical ideas
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              No credit-card pitches
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Unsubscribe anytime
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Send updates to
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-copper-500/20 focus:ring-4"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-copper-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-copper-700 disabled:opacity-60"
            >
              {status === 'loading' ? 'Saving...' : 'Keep me on track'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {status === 'success' ? (
            <p className="mt-3 text-sm font-semibold text-emerald-700">
              You’re on the list. We’ll help you keep the momentum going.
            </p>
          ) : null}

          {status === 'error' ? (
            <p className="mt-3 text-sm font-semibold text-red-600">
              Add a valid email address and try again.
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  FileText,
  Lock,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { startCheckout } from '../lib/stripe';

type TierId = 'foundation-assessment' | 'foundation-roadmap';

type CheckoutTier = {
  id: TierId;
  plan: 'standard' | 'premium';
  name: string;
  shortName: string;
  price: number;
  eyebrow: string;
  description: string;
  features: string[];
  buttonLabel: string;
  highlight?: boolean;
  badge?: string;
};

const CHECKOUT_TIERS: CheckoutTier[] = [
  {
    id: 'foundation-assessment',
    plan: 'standard',
    name: 'Foundation Assessment Plan',
    shortName: 'Full Report',
    price: 29,
    eyebrow: 'Best for clarity',
    description:
      'Unlock your full Foundation Report, dashboard access, PDF export, and personalized 90-day action plan.',
    features: [
      'Full Foundation Report',
      '0 to 100 Foundation Score',
      '7-area score breakdown',
      'Dashboard access and progress tracking',
      'Personalized 90-day action plan',
      'Downloadable PDF report',
    ],
    buttonLabel: 'Continue with $29 plan',
  },
  {
    id: 'foundation-roadmap',
    plan: 'premium',
    name: 'Foundation Roadmap Plan',
    shortName: 'Report + Roadmap',
    price: 79,
    eyebrow: 'Best for follow-through',
    description:
      'Everything in the Foundation Assessment Plan, plus a 12-month implementation layer and premium guidance workspace.',
    features: [
      'Everything in Foundation Assessment',
      '12-month guided roadmap',
      'Workbook-style planning prompts',
      'Monthly check-in structure',
      'Priority ladder based on your weakest constraint',
      'Premium guidance workspace',
    ],
    buttonLabel: 'Continue with $79 plan',
    highlight: true,
    badge: 'Best Value',
  },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

function CheckoutCard({
  tier,
  selected,
  loading,
  onSelect,
  onCheckout,
}: {
  tier: CheckoutTier;
  selected: boolean;
  loading: TierId | null;
  onSelect: (id: TierId) => void;
  onCheckout: (id: TierId) => void;
}) {
  const isLoading = loading === tier.id;

  return (
    <div
      className={`relative rounded-3xl border bg-white p-6 shadow-sm transition ${
        selected
          ? tier.highlight
            ? 'border-copper-400 shadow-xl shadow-copper-500/10 ring-2 ring-copper-200/70'
            : 'border-navy-300 shadow-lg shadow-navy-900/5 ring-2 ring-navy-100'
          : 'border-slate-200 hover:border-copper-200 hover:shadow-md'
      }`}
    >
      {tier.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-copper-500 px-4 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-lg">
          {tier.badge}
        </div>
      )}

      <button
        type="button"
        onClick={() => onSelect(tier.id)}
        className="absolute right-5 top-5 flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 bg-white"
        aria-label={`Select ${tier.name}`}
      >
        <span
          className={`h-3 w-3 rounded-full transition ${selected ? 'bg-copper-500' : 'bg-transparent'}`}
        />
      </button>

      <div className="pr-9">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper-700">
          {tier.eyebrow}
        </p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-navy-900">
          {tier.name}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{tier.description}</p>
      </div>

      <div className="mt-6 flex items-end justify-between gap-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            One-time payment
          </p>
          <p className="mt-1 text-4xl font-bold text-navy-900">{formatPrice(tier.price)}</p>
        </div>
        <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
          {tier.shortName}
        </div>
      </div>

      <ul className="mt-6 space-y-3">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-copper-500" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onCheckout(tier.id)}
        disabled={loading !== null}
        className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white transition disabled:opacity-70 ${
          tier.highlight ? 'bg-copper-600 hover:bg-copper-700' : 'bg-navy-900 hover:bg-navy-800'
        }`}
      >
        {isLoading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Opening checkout...
          </>
        ) : (
          <>
            {tier.highlight ? <Zap className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
            {tier.buttonLabel}
          </>
        )}
      </button>
    </div>
  );
}

export default function PricingPage() {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [selectedTierId, setSelectedTierId] = useState<TierId>('foundation-assessment');
  const [loading, setLoading] = useState<TierId | null>(null);

  const selectedTier = useMemo(
    () => CHECKOUT_TIERS.find((tier) => tier.id === selectedTierId) ?? CHECKOUT_TIERS[0],
    [selectedTierId]
  );

  const handleCheckout = async (tierId: TierId) => {
    const tier = CHECKOUT_TIERS.find((item) => item.id === tierId) ?? CHECKOUT_TIERS[0];

    if (!user) {
      navigate('/login?redirect=/pricing');
      return;
    }

    try {
      setLoading(tierId);
      await startCheckout(tier.plan);
    } catch (error) {
      console.error('Checkout failed:', error);
      alert(error instanceof Error ? error.message : 'Unable to start checkout.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-navy-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate('/premium')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-navy-600 transition hover:text-navy-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Premium
          </button>

          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 sm:inline-flex">
            <Lock className="h-3.5 w-3.5" />
            Secure checkout opens next
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:px-8 lg:py-12">
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-3xl border border-navy-800 bg-navy-900 p-6 text-white shadow-xl shadow-navy-900/20">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-copper-300/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-copper-100">
              <CreditCard className="h-4 w-4" />
              Checkout
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Choose the paid plan you want to unlock.
            </h1>
            <p className="mt-4 text-sm leading-7 text-navy-200 sm:text-base">
              This page is intentionally simple. Pick the report level, then continue to secure Stripe checkout.
            </p>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.08] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                Selected plan
              </p>
              <p className="mt-2 text-xl font-bold text-white">{selectedTier.name}</p>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-4xl font-bold text-copper-200">
                  {formatPrice(selectedTier.price)}
                </span>
                <span className="pb-1 text-sm text-white/55">one-time</span>
              </div>
            </div>

            <div className="mt-5 grid gap-3 text-sm leading-6 text-navy-100">
              <div className="flex gap-3">
                <Shield className="mt-0.5 h-5 w-5 shrink-0 text-copper-300" />
                <span>30-day money-back guarantee if the paid product is not helpful.</span>
              </div>
              <div className="flex gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-copper-300" />
                <span>Your plan level appears in the report and dashboard after checkout updates your account.</span>
              </div>
              <div className="flex gap-3">
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-copper-300" />
                <span>The Foundation Assessment unlocks the full report and dashboard. Roadmap adds the implementation layer.</span>
              </div>
            </div>
          </div>
        </aside>

        <div>
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-copper-700">
              Plan selection
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
              Select a checkout option.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Not ready to buy yet? Go back to the Premium page for the full sales overview.
            </p>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {CHECKOUT_TIERS.map((tier) => (
              <CheckoutCard
                key={tier.id}
                tier={tier}
                selected={selectedTierId === tier.id}
                loading={loading}
                onSelect={setSelectedTierId}
                onCheckout={handleCheckout}
              />
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm">
            <div className="mb-2 flex items-center gap-2 font-semibold text-navy-900">
              <Lock className="h-4 w-4 text-copper-600" />
              What happens next?
            </div>
            <p>
              After payment, your account plan updates and you can return to A Wealthy Foundation to continue the assessment, open your report, or use the dashboard based on the plan you selected.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

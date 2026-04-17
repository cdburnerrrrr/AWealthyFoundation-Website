import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  Crown,
  ArrowLeft,
  Zap,
  Target,
  Calendar,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { startCheckout } from '../lib/stripe';

type TierId = 'foundation-assessment' | 'foundation-roadmap';

const TIERS: Array<{
  id: TierId;
  name: string;
  price: number;
  description: string;
  features: string[];
  highlight: boolean;
  badge?: string;
  buttonLabel: string;
}> = [
  {
    id: 'foundation-assessment',
    name: 'Foundation Assessment Plan',
    price: 29,
    description:
      'Unlock your full report, personalized analysis, and downloadable PDF.',
    features: [
      'Full Foundation Report',
      'Full 7-pillar score breakdown',
      'Priority opportunities and key insights',
      'Personalized 90-day action plan',
      'Dashboard access and progress tracking',
      'Downloadable PDF report',
    ],
    highlight: false,
    buttonLabel: 'Unlock Foundation Assessment',
  },
  {
    id: 'foundation-roadmap',
    name: 'Foundation Roadmap Plan',
    price: 79,
    description:
      'Everything in Foundation Assessment, plus guided implementation for the next 12 months.',
    features: [
      'Everything in Foundation Assessment',
      '12-month guided roadmap',
      'Workbook-style planning prompts',
      'Monthly check-in structure',
      'Priority ladder based on your weakest constraint',
      'Provider recommendations tailored to your gaps',
      'Premium guidance workspace',
    ],
    highlight: true,
    badge: 'Best Value',
    buttonLabel: 'Unlock Foundation Roadmap',
  },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [loading, setLoading] = useState<TierId | null>(null);

  const handleSelectPlan = async (tierId: TierId) => {
    if (!user) {
      navigate('/login?redirect=/pricing');
      return;
    }

    try {
      setLoading(tierId);

      const plan = tierId === 'foundation-roadmap' ? 'premium' : 'standard';
      await startCheckout(plan);
    } catch (error) {
      console.error('Checkout failed:', error);
      alert(
        error instanceof Error ? error.message : 'Unable to start checkout.'
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <button
            onClick={() => navigate('/my-foundation')}
            className="flex items-center gap-1 text-sm text-navy-600 transition-colors hover:text-navy-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-12 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-copper-200 bg-copper-100 px-4 py-2 text-sm text-copper-700">
            <Crown className="h-4 w-4" />
            <span>Choose the level of guidance you want</span>
          </div>

          <h1 className="mb-4 text-3xl font-serif font-bold text-navy-900 sm:text-4xl">
            Clear next steps, built around your Foundation Score
          </h1>

          <p className="mx-auto max-w-2xl text-navy-500">
            Start with the full report, or unlock the guided roadmap if you want
            more structure, follow-through, and long-term momentum.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`relative rounded-2xl p-6 ${
                tier.highlight
                  ? 'border-2 border-copper-500 bg-white shadow-lg shadow-copper-500/10'
                  : 'border border-gray-200 bg-white'
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-copper-500 to-copper-600 px-4 py-1 text-sm font-medium text-white">
                    {tier.badge}
                  </span>
                </div>
              )}

              <div className="mb-6 text-center">
                <h3 className="mb-2 text-xl font-semibold text-navy-900">
                  {tier.name}
                </h3>
                <p className="mb-4 text-sm text-navy-500">{tier.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-navy-900">
                    ${tier.price}
                  </span>
                  <span className="text-navy-400">one-time</span>
                </div>
              </div>

              <ul className="mb-6 space-y-3">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-copper-500" />
                    <span className="text-sm text-navy-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(tier.id)}
                disabled={loading !== null}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 font-medium transition-all ${
                  tier.highlight
                    ? 'bg-copper-600 text-white hover:bg-copper-700'
                    : 'bg-navy-900 text-white hover:bg-navy-800'
                } ${loading === tier.id ? 'opacity-75' : ''}`}
              >
                {loading === tier.id ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Processing...
                  </>
                ) : (
                  <>
                    {tier.highlight ? <Zap className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    {tier.buttonLabel}
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-copper-100">
              <Target className="h-6 w-6 text-copper-600" />
            </div>
            <h3 className="mb-2 font-medium text-navy-900">Focused priorities</h3>
            <p className="text-sm text-navy-500">
              See the biggest opportunities in your financial foundation instead
              of guessing what matters most.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-copper-100">
              <Shield className="h-6 w-6 text-copper-600" />
            </div>
            <h3 className="mb-2 font-medium text-navy-900">Practical guidance</h3>
            <p className="text-sm text-navy-500">
              Get recommendations and next steps designed to feel useful,
              realistic, and easy to act on.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-copper-100">
              <Calendar className="h-6 w-6 text-copper-600" />
            </div>
            <h3 className="mb-2 font-medium text-navy-900">Longer-term follow-through</h3>
            <p className="text-sm text-navy-500">
              The Roadmap plan adds a stronger execution layer so progress keeps
              going after the report.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-navy-500">
            ✨ 30-day money-back guarantee. If it is not helpful, get a full
            refund.
          </p>
        </div>
      </main>
    </div>
  );
}

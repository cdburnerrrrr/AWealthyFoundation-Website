import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Crown, ArrowLeft, Zap, Target, Calendar, Shield } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { client } from '../api/client';

const TIERS = [
  {
    id: 'foundation-assessment',
    name: 'Foundation Assessment',
    price: 29,
    description: 'Comprehensive analysis to understand where you stand',
    features: [
      'Full 7-Pillar Wealth Assessment',
      'Detailed Wealth Score breakdown',
      'Personalized recommendations',
      'Foundation category insights',
      'Progress tracking dashboard',
      'Email support',
    ],
    highlight: false,
  },
  {
    id: 'foundation-roadmap',
    name: 'Foundation Roadmap + Priority Plan',
    price: 79,
    description: 'Your custom 12-month action blueprint',
    features: [
      'Everything in Foundation Assessment',
      'Custom 12-month action blueprint',
      'Pillar-by-pillar checklist',
      'Provider recommendations tailored to your gaps',
      'Priority email support',
      'Monthly check-in reminders',
      'Downloadable PDF report',
    ],
    highlight: true,
    badge: 'Most Popular',
  },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectPlan = async (tierId: string) => {
    if (!user) {
      navigate(`/login?redirect=/assessment/comprehensive?tier=${tierId}`);
      return;
    }

    // Navigate to the comprehensive questionnaire with the selected tier
    // Payment will be collected later - for now, assessments are free
    navigate(`/assessment/comprehensive?tier=${tierId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/my-foundation')}
            className="text-navy-600 hover:text-navy-900 transition-colors flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-copper-100 border border-copper-200 rounded-full text-copper-700 text-sm mb-6">
            <Crown className="w-4 h-4" />
            <span>Upgrade Your Financial Journey</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy-900 mb-4">
            Choose Your Path to Financial Freedom
          </h1>
          <p className="text-navy-500 max-w-2xl mx-auto">
            Get personalized insights and a clear roadmap to build your wealthy foundation.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`relative rounded-2xl p-6 ${
                tier.highlight
                  ? 'bg-white border-2 border-copper-500 shadow-lg shadow-copper-500/10'
                  : 'bg-white border border-gray-200'
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-to-r from-copper-500 to-copper-600 text-white text-sm font-medium rounded-full">
                    {tier.badge}
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-navy-900 mb-2">{tier.name}</h3>
                <p className="text-navy-500 text-sm mb-4">{tier.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-navy-900">${tier.price}</span>
                  <span className="text-navy-400">one-time</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-copper-500 mt-0.5 flex-shrink-0" />
                    <span className="text-navy-600 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(tier.id)}
                disabled={loading !== null}
                className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  tier.highlight
                    ? 'bg-copper-600 text-white hover:bg-copper-700'
                    : 'bg-navy-900 text-white hover:bg-navy-800'
                } ${loading === tier.id ? 'opacity-75' : ''}`}
              >
                {loading === tier.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {tier.highlight && <Zap className="w-4 h-4" />}
                    Get Started
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 grid sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-copper-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-copper-600" />
            </div>
            <h3 className="text-navy-900 font-medium mb-2">12-Month Blueprint</h3>
            <p className="text-navy-500 text-sm">Personalized action plan tailored to your specific gaps and goals</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-copper-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-copper-600" />
            </div>
            <h3 className="text-navy-900 font-medium mb-2">Pillar-by-Pillar Checklist</h3>
            <p className="text-navy-500 text-sm">Step-by-step tasks to improve each of the 7 financial pillars</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-copper-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-copper-600" />
            </div>
            <h3 className="text-navy-900 font-medium mb-2">Provider Recommendations</h3>
            <p className="text-navy-500 text-sm">Curated suggestions for tools and services based on your needs</p>
          </div>
        </div>

        {/* Money-back guarantee */}
        <div className="mt-12 text-center">
          <p className="text-navy-500 text-sm">
            ✨ 30-day money-back guarantee. Not satisfied? Get a full refund, no questions asked.
          </p>
        </div>
      </main>
    </div>
  );
}

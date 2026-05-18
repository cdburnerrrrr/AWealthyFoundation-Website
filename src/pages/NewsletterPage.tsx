import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mail,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Shield,
  PiggyBank,
  TreeDeciduous,
  Inbox,
  Home,
  Wrench,
} from 'lucide-react';
import { subscribeToNewsletter } from '../lib/newsletter';

const BENEFITS = [
  {
    icon: TrendingUp,
    title: 'Actionable Strategies',
    description: 'Practical tips you can implement immediately to strengthen your financial foundation.',
  },
  {
    icon: Shield,
    title: 'Expert Insights',
    description: 'Plain-language money guidance without hype, jargon, or pressure.',
  },
  {
    icon: PiggyBank,
    title: 'Step-by-Step Guides',
    description: 'Clear, simple instructions to tackle each building block of your finances.',
  },
  {
    icon: TreeDeciduous,
    title: 'Building Block Focus',
    description: 'Each issue helps you strengthen one part of your financial house.',
  },
];

const SAMPLE_TOPICS = [
  { category: 'Protection', topic: 'Building Your Emergency Fund' },
  { category: 'Debt', topic: 'The Snowball vs Avalanche Method' },
  { category: 'Investing', topic: 'Getting Started with Index Funds' },
  { category: 'Spending', topic: 'The 50/30/20 Rule Explained' },
  { category: 'Saving', topic: 'Automating Your Savings' },
  { category: 'Income', topic: 'Side Hustle Ideas That Work' },
];

export default function NewsletterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isConfirmed = searchParams.get('confirmed') === 'true';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleanEmail = email.trim();
    const cleanName = name.trim();

    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      await subscribeToNewsletter({
        email: cleanEmail,
        name: cleanName,
        source: 'newsletter_page',
      });

      setSubscribed(true);
      setEmail('');
      setName('');
    } catch (error) {
      console.error('Newsletter signup failed:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isConfirmed) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <main className="flex-1">
          <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-white py-16 lg:py-20">
            <div className="max-w-4xl mx-auto px-4 lg:px-6 text-center">
              <div className="inline-flex p-3 bg-copper-600/20 rounded-full mb-6">
                <CheckCircle className="w-9 h-9 text-copper-300" />
              </div>

              <p className="text-sm font-semibold text-copper-200 tracking-widest uppercase mb-3">
                Subscription Confirmed
              </p>
              <h1 className="text-3xl lg:text-5xl font-serif font-bold mb-4">
                You’re confirmed. Welcome to The Foundation Report.
              </h1>
              <p className="text-lg text-navy-100 max-w-2xl mx-auto leading-8">
                Your welcome email is on the way. Each issue is designed to give you one clear money idea you can use to build a stronger financial foundation.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-2 text-left">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-copper-500/20">
                    <Inbox className="h-5 w-5 text-copper-200" />
                  </div>
                  <h2 className="font-bold text-white mb-2">Check your inbox</h2>
                  <p className="text-sm leading-6 text-navy-200">
                    Your first email should arrive shortly. If you do not see it, check Gmail’s Promotions tab or your spam folder.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-copper-500/20">
                    <Mail className="h-5 w-5 text-copper-200" />
                  </div>
                  <h2 className="font-bold text-white mb-2">Gmail tip</h2>
                  <p className="text-sm leading-6 text-navy-200">
                    If this lands in Promotions, drag it to Primary and choose “Yes” when Gmail asks if future emails should go there.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/foundation-tools')}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-copper-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-copper-900/20 transition hover:bg-copper-700"
                >
                  Explore Free Tools <Wrench className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/15"
                >
                  Back to Home <Home className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>

          <section className="py-12 lg:py-16 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 lg:px-6">
              <div className="text-center mb-10">
                <h2 className="text-2xl lg:text-3xl font-serif font-bold text-navy-900 mb-3">
                  What to expect next
                </h2>
                <p className="text-navy-600 max-w-2xl mx-auto leading-7">
                  The Foundation Report is built to be simple, useful, and practical — one clear financial lesson at a time.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {BENEFITS.map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={benefit.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-copper-100 rounded-lg">
                          <Icon className="w-6 h-6 text-copper-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-navy-900 mb-1">{benefit.title}</h3>
                          <p className="text-sm text-gray-600 leading-6">{benefit.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-white py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-4 lg:px-6 text-center">
            <div className="inline-flex p-3 bg-copper-600/20 rounded-full mb-6">
              <Mail className="w-8 h-8 text-copper-400" />
            </div>
            <h1 className="text-3xl lg:text-5xl font-serif font-bold mb-4">The Foundation Report</h1>
            <p className="text-xl text-navy-200 mb-6 leading-8">
              Simple money moves for building a stronger financial foundation.
            </p>
            <p className="text-navy-300 mb-8 max-w-2xl mx-auto leading-7">
              Get practical insights on saving, debt, investing, protection, and building wealth — one clear email at a time.
            </p>

            {!subscribed ? (
              <form id="subscribe" onSubmit={handleSubscribe} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Your first name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="given-name"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 rounded-lg text-navy-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-copper-500 disabled:bg-gray-100 disabled:text-gray-400"
                  />
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 rounded-lg text-navy-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-copper-500 disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-4 w-full sm:w-auto px-8 py-3 bg-copper-600 text-white text-lg font-bold rounded-lg hover:bg-copper-700 transition-colors inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Subscribing...' : 'Subscribe Free'}
                  {!isSubmitting && <ArrowRight className="w-5 h-5" />}
                </button>
                {errorMessage && (
                  <p className="text-red-200 text-sm mt-3">{errorMessage}</p>
                )}
                <p className="text-navy-400 text-sm mt-3">No spam. Unsubscribe anytime.</p>
              </form>
            ) : (
              <div className="max-w-md mx-auto bg-copper-600/20 rounded-xl p-6">
                <CheckCircle className="w-12 h-12 text-copper-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold mb-2">Almost there!</h3>
                <p className="text-navy-200 leading-6">
                  Check your inbox and click the confirmation link. After you confirm, your welcome email will be sent.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* What to Expect */}
        <section className="py-12 lg:py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 lg:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl lg:text-3xl font-serif font-bold text-navy-900 mb-3">What You’ll Get</h2>
              <p className="text-navy-600 max-w-2xl mx-auto leading-7">
                Every issue breaks one financial building block into a simple idea you can understand and act on.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {BENEFITS.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <div key={benefit.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-copper-100 rounded-lg">
                        <Icon className="w-6 h-6 text-copper-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-navy-900 mb-1">{benefit.title}</h3>
                        <p className="text-sm text-gray-600 leading-6">{benefit.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Sample Topics */}
        <section className="py-12 lg:py-16">
          <div className="max-w-4xl mx-auto px-4 lg:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl lg:text-3xl font-serif font-bold text-navy-900 mb-3">Recent Topics</h2>
              <p className="text-navy-600">Explore the types of money lessons The Foundation Report will cover.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {SAMPLE_TOPICS.map((item) => (
                <div key={`${item.category}-${item.topic}`} className="bg-gray-50 rounded-lg p-4">
                  <span className="text-xs font-medium text-copper-600 bg-copper-100 px-2 py-1 rounded">
                    {item.category}
                  </span>
                  <p className="text-sm font-semibold text-navy-900 mt-2">{item.topic}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 lg:py-16 bg-navy-900 text-white">
          <div className="max-w-2xl mx-auto px-4 lg:px-6 text-center">
            <h2 className="text-2xl lg:text-3xl font-serif font-bold mb-4">Ready to Strengthen Your Foundation?</h2>
            <p className="text-navy-300 mb-8 leading-7">
              Start with one useful money lesson each week.
            </p>
            <button
              type="button"
              onClick={() => document.getElementById('subscribe')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-3 px-8 py-4 bg-copper-600 text-white text-lg font-bold rounded-xl hover:bg-copper-700 transition-all shadow-lg shadow-copper-600/30"
            >
              Subscribe Now <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

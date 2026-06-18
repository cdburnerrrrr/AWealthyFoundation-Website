import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HouseLayout from '../components/HouseLayout';
import { ArrowRight, CheckCircle, Clock, Download, Lock } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { startCheckout } from '../lib/stripe';
import { subscribeToNewsletter } from '../lib/newsletter';

function trackAwfEvent(eventName: string, parameters: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;

  (window as any).gtag?.('event', eventName, {
    event_category: 'A Wealthy Foundation',
    ...parameters,
  });
}


export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppStore();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  const handleGetStarted = () => {
    trackAwfEvent('snapshot_start_clicked', { source: 'landing_hero' });
    navigate('/assessment/snapshot');
  };

  const handleNewsletterSubscribe = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanEmail = email.trim();
    const cleanName = name.trim();

    if (!cleanEmail) {
      setNewsletterStatus('error');
      setNewsletterMessage('Please enter your email address.');
      return;
    }

    try {
      setNewsletterStatus('loading');
      setNewsletterMessage('');

      await subscribeToNewsletter({
        email: cleanEmail,
        name: cleanName,
        source: 'landing_page_home',
      });

      setNewsletterStatus('success');
      setNewsletterMessage('Almost there! Check your inbox and click the confirmation link to finish subscribing.');
      setEmail('');
      setName('');
    } catch (error) {
      console.error('Newsletter signup failed:', error);
      setNewsletterStatus('error');
      setNewsletterMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 pt-6 pb-10 sm:pt-8 sm:pb-12 lg:px-6 lg:py-12">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
              <div className="text-center lg:text-left order-1 lg:order-1">
                <p className="text-sm font-semibold text-copper-600 tracking-widest uppercase mb-2">
                  A Simple Framework for Building Wealth
                </p>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-navy-900 leading-tight">
                  Design the Life You Want.
                </h1>

                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-copper-600 leading-tight mt-1 mb-4">
                  Build the Financial House to Support It.
                </h2>

                <p className="text-sm sm:text-lg text-navy-600 mb-4 max-w-xl mx-auto lg:mx-0 leading-7">
                  A Wealthy Foundation helps you understand how your financial life is really
                  working — from income and debt to saving, protection, investing, and long-term
                  direction. Build your house one block at a time, discover your Foundation Score,
                  and see exactly what to strengthen next.
                </p>

                <p className="text-sm text-navy-500 mb-4 max-w-lg mx-auto lg:mx-0 leading-6">
                  Start with the free Foundation Snapshot and get a clearer picture of what
                  is strong, what needs attention, and where to focus first.
                </p>

                <div className="mb-5 max-w-xl rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left shadow-sm mx-auto lg:mx-0">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-white p-2 text-emerald-700">
                      <Lock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-950">
                        Private by design
                      </p>
                      <p className="mt-1 text-sm leading-6 text-emerald-900">
                        Your answers are used only to calculate your Foundation Snapshot.
                        They are not posted publicly, sold to third parties, or used for
                        sales calls or advisor outreach.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-4">
                  <button
                    onClick={handleGetStarted}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-copper-600 px-5 text-sm font-semibold text-white transition hover:bg-copper-700 shadow-md"
                  >
                    Take the Free Foundation Snapshot <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm text-navy-500 flex flex-wrap items-center justify-center lg:justify-start gap-5 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> About 5 minutes
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Free
                  </span>
                  <span className="flex items-center gap-1">
                    <Lock className="w-4 h-4" /> No credit card
                  </span>
                </p>
              </div>

              <div className="order-2 lg:order-2 flex justify-center lg:justify-end mt-2 lg:mt-0">
                <HouseLayout className="lg:mr-2" />
              </div>
            </div>
          </div>
        </section>

        {/* Copper Divider */}
        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-copper-500/30 to-copper-500/30 via-[60%] to-transparent"></div>



        {/* Workbook Download Section */}
        <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-slate-900 py-8 text-white lg:py-10">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 lg:grid-cols-[1.2fr,0.8fr] lg:items-center lg:px-6">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-copper-300">
                Read the book?
              </p>
              <h3 className="font-serif text-2xl font-bold sm:text-3xl">
                Download the free companion workbook.
              </h3>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-navy-200 sm:text-base">
                The Wealthy Foundation Workbook gives readers a practical place to reflect, write down real numbers,
                review the seven building blocks, and choose the next right move.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <button
                onClick={() => {
                  trackAwfEvent('workbook_page_clicked', { source: 'landing_workbook_section' });
                  navigate('/workbook');
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-copper-500 px-5 text-sm font-semibold text-white transition hover:bg-copper-600"
              >
                Get the Workbook
                <Download className="h-4 w-4" />
              </button>
              <a
                href="/downloads/The-Wealthy-Foundation-Workbook.pdf"
                download
                onClick={() => trackAwfEvent('workbook_pdf_download_clicked', { source: 'landing_workbook_section' })}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/25 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Download PDF
              </a>
              <button
                onClick={() => {
                  trackAwfEvent('snapshot_start_clicked', { source: 'landing_workbook_section' });
                  navigate('/assessment/snapshot');
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-navy-900 transition hover:bg-navy-50"
              >
                Take Snapshot First
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Offer Cards */}
        <section id="offers" className="py-5 lg:py-6 bg-white">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-serif font-bold text-navy-900">
                Start Free. Go Deeper When You’re Ready.
              </h3>
              <p className="text-navy-600 mt-2 max-w-3xl mx-auto leading-7">
                Begin with a quick, private snapshot. Your answers are used to calculate your score and show your results — not for sales calls, advisor outreach, or public sharing.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Snapshot */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 hover:border-copper-300 hover:shadow-md transition-all h-full flex flex-col">
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-navy-900">Start With the Snapshot</h3>
                  <span className="text-2xl font-bold text-copper-600">Free</span>
                </div>

                <p className="text-sm text-navy-600 mb-3 flex-grow">
                  Take the free Foundation Snapshot to get your score, identify your biggest
                  opportunities, and see where to focus first. Your answers stay private.
                </p>

                <ul className="space-y-1 mb-4 text-sm text-navy-700">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-copper-500" />
                    Foundation Score (0–100)
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-copper-500" />
                    Biggest opportunities
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-copper-500" />
                    Private results
                  </li>
                </ul>

                <button
                  onClick={() => {
                    trackAwfEvent('snapshot_start_clicked', { source: 'landing_offer_card' });
                    navigate('/assessment/snapshot');
                  }}
                  className="w-full h-10 bg-copper-600 text-white text-sm font-semibold rounded hover:bg-copper-700 transition-colors"
                >
                  Take the Free Snapshot
                </button>
              </div>

              {/* Full Report */}
              <div className="bg-white rounded-lg border-2 border-copper-300 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all h-full flex flex-col">
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-navy-900">Full Report</h3>
                  <span className="text-2xl font-bold text-copper-600">$29</span>
                </div>

                <p className="text-sm text-navy-600 mb-3 flex-grow">
                  Continue with the deeper assessment to unlock your full breakdown, refined score,
                  and a practical 90-Day Plan.
                </p>

                <ul className="space-y-1 mb-4 text-sm text-navy-700">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-copper-500" />
                    Full 7-block breakdown
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-copper-500" />
                    Refined Foundation Score
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-copper-500" />
                    90-Day Plan
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-copper-500" />
                    PDF report
                  </li>
                </ul>

                <button
                  onClick={() => {
                    trackAwfEvent('upgrade_clicked', { plan: 'standard', source: 'landing_offer_card' });
                    isAuthenticated
                      ? startCheckout('standard')
                      : navigate('/login?redirect=/pricing');
                  }}
                  className="w-full h-10 border border-copper-500 text-copper-600 text-sm font-semibold rounded hover:bg-copper-50 transition-colors"
                >
                  Unlock Full Report
                </button>
              </div>

              {/* Premium Guidance */}
              <div className="bg-navy-900 rounded-lg p-4 sm:p-5 text-white relative overflow-hidden h-full flex flex-col">
                <div className="absolute top-3 right-3 px-2 py-1 bg-copper-500 text-white text-xs font-bold rounded">
                  Best Value
                </div>

                <div className="mb-3">
                  <h3 className="text-lg font-bold">Premium Guidance</h3>
                  <span className="text-2xl font-bold text-copper-400">$79</span>
                </div>

                <p className="text-sm text-navy-300 mb-3 flex-grow">
                  Turn your full report into a structured 12-month roadmap with clearer priorities
                  and deeper guidance.
                </p>

                <ul className="space-y-1 mb-4 text-sm text-navy-200">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-copper-400" />
                    Everything in Full Report
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-copper-400" />
                    12-Month Roadmap
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-copper-400" />
                    Priority action sequence
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-copper-400" />
                    Guided implementation
                  </li>
                </ul>

                <button
                  onClick={() => {
                    trackAwfEvent('upgrade_clicked', { plan: 'premium', source: 'landing_offer_card' });
                    isAuthenticated
                      ? startCheckout('premium')
                      : navigate('/login?redirect=/pricing');
                  }}
                  className="w-full h-10 bg-copper-500 text-white text-sm font-semibold rounded hover:bg-copper-600 transition-colors"
                >
                  Get Premium Guidance
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Lower Support Section */}
        <section id="support" className="py-4 lg:py-5 bg-gray-50/40 flex-1">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <div className="grid lg:grid-cols-3 gap-4 items-stretch">
              {/* Latest Article */}
{/* Latest Article */}
<div
  id="articles"
  className="bg-white rounded-lg border border-gray-200 p-0 overflow-hidden h-full flex flex-col"
>
  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
    <h4 className="text-base font-bold text-navy-900">Latest Article</h4>
    <button
      onClick={() => navigate('/articles')}
      className="text-copper-600 font-medium text-sm hover:text-copper-700"
    >
      View All →
    </button>
  </div>

  <button
    onClick={() => navigate('/articles/emergency-fund-guide')}
    className="flex-1 text-left p-4 bg-gray-50 hover:bg-gray-100 transition-all hover:shadow-sm flex flex-col"
  >
    <div>
      <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
        Protection
      </span>

      <h5 className="text-sm font-semibold text-navy-900 mt-2 hover:text-copper-600 transition-colors">
        The Complete Guide to Building Your Emergency Fund
      </h5>

      <p className="text-xs text-gray-500 mt-2 leading-5">
        Learn why an emergency fund is one of the most important parts of a strong
        financial foundation — and how to build one step by step.
      </p>

      <div className="mt-2 space-y-1.5 text-xs text-navy-700">
        <div className="flex items-start gap-2">
          <CheckCircle className="w-3.5 h-3.5 text-copper-500 mt-0.5 shrink-0" />
          <span>How much should you have?</span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle className="w-3.5 h-3.5 text-copper-500 mt-0.5 shrink-0" />
          <span>Where should you keep it?</span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle className="w-3.5 h-3.5 text-copper-500 mt-0.5 shrink-0" />
          <span>What qualifies as an emergency?</span>
        </div>
      </div>
    </div>

    <div className="mt-auto pt-4 text-sm font-medium text-copper-600">
      Read Article →
    </div>
  </button>
</div>
    
              {/* Newsletter - 2 wide */}
              <div
  id="newsletter"
  className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-4 pt-14 sm:p-5 sm:pt-5 relative overflow-hidden"
><div className="absolute top-4 right-4 px-2.5 py-1 bg-copper-50 text-copper-700 text-xs font-semibold rounded-full border border-copper-200 sm:top-4 sm:right-4">
  Newsletter
</div>
                <div className="max-w-2xl">
                <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h4 className="text-xl font-bold text-copper-600">
                    Join The Foundation Report
                  </h4>
                  <button
                    type="button"
                    onClick={() => navigate('/newsletter')}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-navy-600 hover:text-copper-700"
                  >
                    Learn more <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                  <p className="text-navy-600 mb-4 leading-7">
                    Get practical insights on saving, debt, investing, and building a stronger
                    financial foundation — one clear email at a time.
                  </p>

                  <div className="mb-4">
  <p className="text-sm font-semibold text-navy-900 mb-2">What you’ll get:</p>
  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-navy-700">
    <div className="flex items-start gap-2">
      <CheckCircle className="w-4 h-4 text-copper-500 mt-0.5 shrink-0" />
      <span>Simple systems to build lasting wealth</span>
    </div>
    <div className="flex items-start gap-2">
      <CheckCircle className="w-4 h-4 text-copper-500 mt-0.5 shrink-0" />
      <span>Real-world money insights, not hype</span>
    </div>
    <div className="flex items-start gap-2">
      <CheckCircle className="w-4 h-4 text-copper-500 mt-0.5 shrink-0" />
      <span>Practical ideas you can actually use</span>
    </div>
    <div className="flex items-start gap-2">
      <CheckCircle className="w-4 h-4 text-copper-500 mt-0.5 shrink-0" />
      <span>Free weekly insights. No spam.</span>
    </div>
  </div>
</div>

                  <form onSubmit={handleNewsletterSubscribe} className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr,1fr,auto]">
                      <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="given-name"
                        disabled={newsletterStatus === 'loading'}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-copper-500 disabled:bg-gray-50 disabled:text-gray-400"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                        disabled={newsletterStatus === 'loading'}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-copper-500 disabled:bg-gray-50 disabled:text-gray-400"
                      />
                      <button
                        type="submit"
                        disabled={newsletterStatus === 'loading'}
                        className="px-5 py-2.5 bg-navy-900 text-white text-sm font-medium rounded hover:bg-navy-800 transition-colors whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {newsletterStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
                      </button>
                    </div>

                    {newsletterMessage && (
                      <p
                        className={`text-sm ${
                          newsletterStatus === 'success' ? 'text-copper-700' : 'text-red-600'
                        }`}
                      >
                        {newsletterMessage}
                      </p>
                    )}
                  </form>

                  <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                    <p className="text-xs text-navy-400">
                      Free weekly insights. Unsubscribe anytime.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/newsletter')}
                      className="text-left text-xs font-semibold text-copper-600 hover:text-copper-700"
                    >
                      Preview the newsletter page →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
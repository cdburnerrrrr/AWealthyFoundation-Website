import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Menu, X, ArrowRight, CheckCircle, Shield, TrendingUp, FileText, Calendar, User
} from 'lucide-react';
import { useAppStore } from '../store/appStore';

const NAV_ITEMS = [
  { label: 'The Building Blocks', href: '/building-blocks', isRoute: true },
  { label: 'Financial Pillars', href: '/financial-pillars', isRoute: true },
  { label: 'Foundation Score', href: '/foundation-score', isRoute: true },
  { label: 'Premium', href: '/premium', isRoute: true },
  { label: 'Articles', href: '/articles', isRoute: true },
  { label: 'Newsletter', href: '/newsletter', isRoute: true },
];

export default function PremiumPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => navigate('/')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Home className="w-10 h-10 text-copper-600" />
              <div>
                <h1 className="text-xl font-serif font-bold text-navy-900">A Wealthy Foundation</h1>
                <p className="text-xs text-copper-600">Design the life you want. Build the financial foundation to support it.</p>
              </div>
            </button>
            <nav className="hidden lg:flex items-center space-x-4">
              {NAV_ITEMS.map((item) => (
                item.isRoute ? (
                  <button key={item.label} onClick={() => navigate(item.href)} className="text-sm font-medium text-navy-700 hover:text-copper-600">
                    {item.label}
                  </button>
                ) : (
                  <a key={item.label} href={item.href} className="text-sm font-medium text-navy-700 hover:text-copper-600">
                    {item.label}
                  </a>
                )
              ))}
            </nav>
            {isAuthenticated ? (
              <button 
                onClick={() => navigate('/my-foundation')}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-copper-600 text-white text-sm font-semibold rounded hover:bg-copper-700 transition-colors"
              >
                <User className="w-4 h-4" />
                Dashboard
              </button>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-navy-900 text-white text-sm font-semibold rounded hover:bg-navy-800 transition-colors"
              >
                <User className="w-4 h-4" />
                Login
              </button>
            )}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-1 text-navy-700">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="lg:hidden py-2 border-t border-gray-100">
              <nav className="flex flex-wrap gap-x-4 gap-y-1 items-center">
                {NAV_ITEMS.map((item) => (
                  item.isRoute ? (
                    <button key={item.label} onClick={() => { setMobileMenuOpen(false); navigate(item.href); }} className="text-sm font-medium text-navy-700 hover:text-copper-600">
                      {item.label}
                    </button>
                  ) : (
                    <a key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-navy-700 hover:text-copper-600">
                      {item.label}
                    </a>
                  )
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-navy-900 to-navy-800 text-white py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-4 lg:px-6 text-center">
            <h1 className="text-3xl lg:text-5xl font-serif font-bold mb-4">Choose Your Path to Financial Strength</h1>
            <p className="text-xl text-navy-200 mb-8">
              Three assessment levels designed to help you understand and improve your financial foundation.
            </p>
          </div>
        </section>

        {/* Plans */}
        <section className="py-12 lg:py-16 -mt-8">
          <div className="max-w-5xl mx-auto px-4 lg:px-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Free */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-navy-900 mb-2">Free Snapshot</h3>
                  <div className="text-3xl font-bold text-navy-900">$0</div>
                  <p className="text-sm text-gray-500 mt-1">5-minute quick check</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-5 h-5 text-copper-500 flex-shrink-0 mt-0.5" />
                    <span>Quick 10-question assessment</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-5 h-5 text-copper-500 flex-shrink-0 mt-0.5" />
                    <span>Your Foundation Score (300-850)</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-5 h-5 text-copper-500 flex-shrink-0 mt-0.5" />
                    <span>Basic category breakdown</span>
                  </li>
                </ul>
                <button onClick={() => navigate('/login')} className="w-full py-3 border-2 border-copper-600 text-copper-600 font-semibold rounded-lg hover:bg-copper-50 transition-colors">
                  Start Free
                </button>
              </div>

              {/* Foundation Assessment */}
              <div className="bg-white rounded-xl shadow-xl border-2 border-copper-500 p-6 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-copper-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </div>
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-navy-900 mb-2">Foundation Assessment</h3>
                  <div className="text-3xl font-bold text-copper-600">$29</div>
                  <p className="text-sm text-gray-500 mt-1">One-time payment</p>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-5 h-5 text-copper-500 flex-shrink-0 mt-0.5" />
                    <span>Comprehensive 50-question assessment</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-5 h-5 text-copper-500 flex-shrink-0 mt-0.5" />
                    <span>Detailed Foundation Score analysis</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-5 h-5 text-copper-500 flex-shrink-0 mt-0.5" />
                    <span>7 Pillar breakdown with scores</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-5 h-5 text-copper-500 flex-shrink-0 mt-0.5" />
                    <span>Key strengths identified</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-5 h-5 text-copper-500 flex-shrink-0 mt-0.5" />
                    <span>Gaps & improvement areas</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-5 h-5 text-copper-500 flex-shrink-0 mt-0.5" />
                    <span>Personalized recommendations</span>
                  </li>
                </ul>
                <button onClick={() => navigate('/login')} className="w-full py-3 bg-copper-600 text-white font-semibold rounded-lg hover:bg-copper-700 transition-colors">
                  Get Started
                </button>
              </div>

              {/* Foundation Roadmap */}
              <div className="bg-navy-900 rounded-xl shadow-lg border border-navy-700 p-6 text-white">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold mb-2">Foundation Roadmap</h3>
                  <div className="text-3xl font-bold text-copper-400">$79</div>
                  <p className="text-sm text-navy-300 mt-1">One-time payment</p>
                </div>
                <ul className="space-y-3 mb-6 text-navy-200">
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-5 h-5 text-copper-400 flex-shrink-0 mt-0.5" />
                    <span>Everything in Foundation Assessment</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-5 h-5 text-copper-400 flex-shrink-0 mt-0.5" />
                    <span>Custom 12-month action blueprint</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-5 h-5 text-copper-400 flex-shrink-0 mt-0.5" />
                    <span>Provider recommendations</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-5 h-5 text-copper-400 flex-shrink-0 mt-0.5" />
                    <span>Downloadable PDF report</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-5 h-5 text-copper-400 flex-shrink-0 mt-0.5" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <button onClick={() => navigate('/login')} className="w-full py-3 bg-copper-500 text-white font-semibold rounded-lg hover:bg-copper-600 transition-colors">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Which One Is Right For You */}
        <section className="py-12 lg:py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 lg:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl lg:text-3xl font-serif font-bold text-navy-900 mb-3">Which Assessment is Right for You?</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-copper-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-navy-900">Free Snapshot - If you're just curious</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Perfect if you want a quick check-in on your financial health. Get a high-level view of where you stand in about 5 minutes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border-2 border-copper-300">
                <div className="flex items-start gap-3">
                  <FileText className="w-6 h-6 text-copper-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-navy-900">Foundation Assessment ($29) - If you're serious about improving</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Ideal if you want a detailed understanding of all 7 pillars of your financial foundation. Get specific recommendations on where to focus your efforts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-start gap-3">
                  <Calendar className="w-6 h-6 text-copper-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-navy-900">Foundation Roadmap ($79) - If you want a clear path forward</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Best if you want a complete action plan with specific steps, timelines, and resources. Includes a printable PDF and ongoing guidance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 lg:py-16 bg-navy-900 text-white">
          <div className="max-w-2xl mx-auto px-4 lg:px-6 text-center">
            <h2 className="text-2xl lg:text-3xl font-serif font-bold mb-4">Ready to Strengthen Your Foundation?</h2>
            <p className="text-navy-300 mb-8">
              Start with the free assessment and upgrade when you're ready for more detailed insights.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => navigate('/login')} className="inline-flex items-center gap-3 px-8 py-4 bg-copper-600 text-white text-lg font-bold rounded-xl hover:bg-copper-700 transition-all shadow-lg shadow-copper-600/30">
                Start Free Assessment <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-navy-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-lg">A Wealthy Foundation</h3>
              <p className="text-navy-400 text-sm">Design the life you want. Build the financial foundation to support it.</p>
            </div>
            <div className="flex gap-6 text-sm text-navy-300">
              <button onClick={() => navigate('/articles')} className="hover:text-copper-400">Articles</button>
              <a href="#pillars" className="hover:text-copper-400">Building Blocks</a>
              <a href="#premium" className="hover:text-copper-400">Premium</a>
            </div>
          </div>
          <p className="text-navy-500 text-xs text-center mt-6">© {new Date().getFullYear()} A Wealthy Foundation</p>
        </div>
      </footer>
    </div>
  );
}

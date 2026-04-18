import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, TrendingUp, Wallet, PiggyBank, DollarSign, CreditCard, Lightbulb,
  Menu, X, ArrowRight, CheckCircle, Home, Target, BarChart3, User
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

const BUILDING_BLOCKS = [
  { id: 'Vision', name: 'Vision', icon: Lightbulb, color: 'text-teal-600', bg: 'bg-teal-100', pillar: 'Direction' },
  { id: 'protection', name: 'Protection', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-100', pillar: 'Security' },
  { id: 'investing', name: 'Investing', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100', pillar: 'Growth' },
  { id: 'spending', name: 'Spending', icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-100', pillar: 'Control' },
  { id: 'saving', name: 'Saving', icon: PiggyBank, color: 'text-pink-500', bg: 'bg-pink-100', pillar: 'Consistency' },
  { id: 'income', name: 'Income', icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-100', pillar: 'Clarity' },
  { id: 'debt', name: 'Debt', icon: CreditCard, color: 'text-red-500', bg: 'bg-red-100', pillar: 'Efficiency' },
];

const PILLARS = [
  { id: 'direction', name: 'Direction', description: 'Define your why and vision goals', color: 'text-teal-700', bg: 'bg-teal-50' },
  { id: 'security', name: 'Security', description: 'Protect what you\'ve built', color: 'text-blue-700', bg: 'bg-blue-50' },
  { id: 'growth', name: 'Growth', description: 'Build wealth over time', color: 'text-green-700', bg: 'bg-green-50' },
  { id: 'control', name: 'Control', description: 'Master your financial decisions', color: 'text-amber-700', bg: 'bg-amber-50' },
  { id: 'consistency', name: 'Consistency', description: 'Build habits that last', color: 'text-pink-700', bg: 'bg-pink-50' },
  { id: 'clarity', name: 'Clarity', description: 'See your financial picture', color: 'text-purple-700', bg: 'bg-purple-50' },
  { id: 'efficiency', name: 'Efficiency', description: 'Maximize your resources', color: 'text-red-700', bg: 'bg-red-50' },
];

export default function FoundationScorePage() {
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
            <h1 className="text-3xl lg:text-5xl font-serif font-bold mb-4">What is a Foundation Score?</h1>
            <p className="text-xl text-navy-200 mb-8">
              Your Foundation Score is a comprehensive measure of your financial health, 
              calculated from 7 key areas that determine the strength of your financial house.
            </p>
            <button onClick={() => navigate('/login')} className="inline-flex items-center gap-3 px-8 py-4 bg-copper-600 text-white text-lg font-bold rounded-xl hover:bg-copper-700 transition-all shadow-lg shadow-copper-600/30">
              Calculate Your Score <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* How It's Calculated */}
        <section className="py-12 lg:py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 lg:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl lg:text-3xl font-serif font-bold text-navy-900 mb-3">How Your Score is Calculated</h2>
              <p className="text-navy-600 max-w-2xl mx-auto">
                Your Foundation Score ranges from 1 to 100.  
                We analyze 7 key areas of your financial life to give you a complete picture.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {BUILDING_BLOCKS.map((block) => {
                const Icon = block.icon;
                return (
                  <div key={block.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${block.bg}`}>
                        <Icon className={`w-6 h-6 ${block.color}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-navy-900">{block.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Strengthens your <span className="font-semibold text-copper-600">{block.pillar}</span> Pillar
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Building Blocks to Pillars */}
        <section className="py-12 lg:py-16">
          <div className="max-w-4xl mx-auto px-4 lg:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl lg:text-3xl font-serif font-bold text-navy-900 mb-3">From Building Blocks to Financial Pillars</h2>
              <p className="text-navy-600 max-w-2xl mx-auto">
                The 7 Building Blocks support 7 Financial Pillars. When all your blocks are strong, 
                your entire financial foundation is solid.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="grid md:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                {BUILDING_BLOCKS.map((block, i) => {
                  const Icon = block.icon;
                  return (
                    <div key={block.id} className="p-4 text-center bg-gray-50">
                      <div className={`inline-flex p-2 rounded-lg ${block.bg} mb-2`}>
                        <Icon className={`w-5 h-5 ${block.color}`} />
                      </div>
                      <p className="text-xs font-bold text-navy-900">{block.name}</p>
                      <p className="text-xs text-gray-500 mt-1">↓</p>
                      <p className="text-xs font-semibold text-copper-600">{block.pillar}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {PILLARS.map((pillar) => (
                <div key={pillar.id} className={`p-4 rounded-xl ${pillar.bg} border border-gray-200`}>
                  <h3 className={`font-bold ${pillar.color} mb-1`}>{pillar.name}</h3>
                  <p className="text-xs text-gray-600">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Score Ranges */}
        <section className="py-12 lg:py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 lg:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl lg:text-3xl font-serif font-bold text-navy-900 mb-3">Understanding Your Score</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                <BarChart3 className="w-10 h-10 text-red-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-red-700 mb-2">1-59</h3>
                <p className="text-sm text-red-600">Foundation Under Construction</p>
                <p className="text-xs text-gray-600 mt-2">Your financial house needs significant attention. Focus on the basics: emergency fund, debt management, and basic coverage.</p>
              </div>
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 text-center">
                <Target className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-amber-700 mb-2">60-79</h3>
                <p className="text-sm text-amber-600">Foundation Being Built</p>
                <p className="text-xs text-gray-600 mt-2">You have the basics in place. Time to strengthen each block and optimize your financial strategy.</p>
              </div>
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 text-center">
                <Lightbulb className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-emerald-700 mb-2">80-100</h3>
                <p className="text-sm text-emerald-600">Strong Foundation</p>
                <p className="text-xs text-gray-600 mt-2">Excellent work! Your financial house is solid. Focus on optimization and building vision.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 lg:py-16 bg-navy-900 text-white">
          <div className="max-w-2xl mx-auto px-4 lg:px-6 text-center">
            <h2 className="text-2xl lg:text-3xl font-serif font-bold mb-4">Ready to Discover Your Foundation Score?</h2>
            <p className="text-navy-300 mb-8">
              Take our free assessment and get a personalized breakdown of all 7 building blocks.
            </p>
            <button onClick={() => navigate('/login')} className="inline-flex items-center gap-3 px-8 py-4 bg-copper-600 text-white text-lg font-bold rounded-xl hover:bg-copper-700 transition-all shadow-lg shadow-copper-600/30">
              Start Free Assessment <ArrowRight className="w-5 h-5" />
            </button>
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
